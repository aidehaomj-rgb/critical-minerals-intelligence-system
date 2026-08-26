"""Analyze intelligence-only case packs and produce auditable risk leads."""
from __future__ import annotations

import csv
import json
import re
import sqlite3
from collections import Counter, defaultdict
from pathlib import Path

from openpyxl import load_workbook


ROOT = Path(r"D:\codex\XG执法\2026_案例库")
CATALOG = ROOT / "case_catalog.csv"
DB = ROOT / "enforcement_cases_2026.sqlite"
REPEAT_SUBJECTS = ROOT / "重复主体候选.json"

EXCLUDE = re.compile(r"查詢|查询|回覆|回复|協查|协查")
INTEL = re.compile(r"情報|情报")

COMMODITIES = {
    "烟草制品": r"香煙|香烟|加熱煙|加热烟|電子煙|电子烟|雪茄|煙草|烟草",
    "毒品及受管制药物": r"毒品|藥物|药物|毒藥|毒药",
    "未列舱单货物": r"未列艙單|未列舱单",
    "濒危物种及动植物": r"瀕危物種|濒危物种|活貓|活猫|動物|动物|蜥蝪|蜥蜴|植物種子|植物种子",
    "冒牌物品": r"冒牌",
    "燃油": r"汽油|柴油|燃油|加油站",
    "金属及贵金属": r"金屬|金属|貴金屬|贵金属|銀錠|银锭|進出口銀|进出口银",
    "电子废料": r"電子廢料|电子废料",
    "武器": r"武器",
    "酒类": r"烈酒|酒類|酒类",
}

CHANNELS = {
    "空路客运": r"空路客運|空路客运",
    "空运货物/邮包": r"空運貨物|空运货物|空運郵包|空运邮包|郵包|邮包",
    "陆路客运": r"陸路客運|陆路客运",
    "陆路货车/货运": r"陸路貨車|陆路货车|陸路貨運|陆路货运",
    "陆路小车": r"陸路小車|陆路小车",
    "海路/河路货运": r"海路貨運|海路货运|河路貨運|河路货运",
    "海路客运/渔船": r"海路客運|海路客运|漁船|渔船",
    "仓储/场所": r"儲存倉|储存仓|加油站",
}

METHODS = {
    "未列舱单": r"未列艙單|未列舱单",
    "旅客携带": r"客運|客运",
    "货运/邮包夹带": r"貨運|货运|郵包|邮包",
    "非法仓储": r"儲存倉|储存仓",
    "可疑集装箱": r"可疑集裝箱|可疑集装箱",
    "多类货物混合": r"及",
}

FIELD_GROUPS = {
    "车辆/车牌": ("車輛登記", "车辆登记", "車牌", "车牌", "拖架", "拖頭", "拖头"),
    "集装箱/货柜": ("集裝箱", "集装箱", "貨櫃", "货柜", "container"),
    "提运单/AWB": ("提單", "提单", "運單", "运单", "awb", "waybill"),
    "报关单号": ("報關單", "报关单", "報關編號", "报关编号"),
    "电话": ("電話", "电话", "tel"),
    "人员": ("司機", "司机", "聯絡人", "联系人", "負責人", "负责人", "姓名"),
}

CN_DIGITS = {"零": 0, "〇": 0, "一": 1, "二": 2, "兩": 2, "两": 2, "三": 3, "四": 4,
             "五": 5, "六": 6, "七": 7, "八": 8, "九": 9}


def chinese_number(text: str) -> int | None:
    if not text:
        return None
    if text.isdigit():
        return int(text)
    if "百" in text:
        left, right = text.split("百", 1)
        value = CN_DIGITS.get(left, 1) * 100
        return value + (chinese_number(right) or 0)
    if "十" in text:
        left, right = text.split("十", 1)
        value = CN_DIGITS.get(left, 1) * 10
        return value + (CN_DIGITS.get(right, 0) if right else 0)
    if len(text) == 1:
        return CN_DIGITS.get(text)
    value = 0
    for char in text:
        if char not in CN_DIGITS:
            return None
        value = value * 10 + CN_DIGITS[char]
    return value


def normalize_identifier(value: object, group: str) -> list[str]:
    raw = str(value or "").strip()
    if not raw or raw.upper() in {"N/A", "NA", "NONE", "-", "0", "NULL"}:
        return []
    if group == "集装箱/货柜":
        return sorted(set(re.findall(r"\b[A-Z]{4}\s?\d{7}\b", raw.upper())))
    if group == "电话":
        digits = re.sub(r"\D", "", raw)
        return [digits] if 7 <= len(digits) <= 18 else []
    if group == "提运单/AWB":
        tokens = re.findall(r"\b[A-Z0-9][A-Z0-9-]{7,24}\b", raw.upper())
        return [token for token in tokens if any(c.isdigit() for c in token)]
    if group == "报关单号":
        tokens = re.findall(r"\b[A-Z0-9][A-Z0-9-]{5,30}\b", raw.upper())
        return [token for token in tokens if any(c.isdigit() for c in token)]
    if group == "人员":
        compact = re.sub(r"\s+", " ", raw).strip()
        if len(compact) <= 80:
            return [compact.upper()]
        return []
    compact = re.sub(r"\s+", "", raw).upper()
    return [compact] if 3 <= len(compact) <= 40 else []


def group_for_header(header: str) -> str | None:
    folded = header.casefold()
    for group, tokens in FIELD_GROUPS.items():
        if any(token.casefold() in folded for token in tokens):
            return group
    return None


def workbook_identifier_rows(path: Path):
    try:
        book = load_workbook(path, read_only=True, data_only=True)
    except Exception:
        return
    for sheet in book.worksheets:
        header = None
        groups = {}
        for row_num, row in enumerate(sheet.iter_rows(values_only=True), 1):
            values = [str(value).strip() if value is not None else "" for value in row]
            if header is None and row_num <= 15:
                candidate_groups = {index: group_for_header(value) for index, value in enumerate(values)}
                candidate_groups = {index: group for index, group in candidate_groups.items() if group}
                if candidate_groups:
                    header = values
                    groups = candidate_groups
                continue
            if header is None:
                if row_num >= 15:
                    break
                continue
            if not any(values):
                continue
            for index, group in groups.items():
                if index >= len(values):
                    continue
                for identifier in normalize_identifier(values[index], group):
                    yield sheet.title, row_num, header[index], group, identifier


with CATALOG.open("r", encoding="utf-8-sig", newline="") as stream:
    catalog_rows = list(csv.DictReader(stream))

intel_rows = [
    row for row in catalog_rows
    if INTEL.search(row["package_name"]) and not EXCLUDE.search(row["package_name"])
]
intel_ids = {row["case_id"] for row in intel_rows}

commodity_packages = Counter()
commodity_incidents = Counter()
channel_packages = Counter()
channel_incidents = Counter()
method_packages = Counter()
case_details = []
disclosed_incident_total = 0

for row in intel_rows:
    title = row["package_name"]
    match = re.search(r"([一二三四五六七八九十百兩两〇零\d]{1,5})宗", title)
    incidents = chinese_number(match.group(1)) if match else None
    if incidents:
        disclosed_incident_total += incidents
    commodity_tags = [name for name, pattern in COMMODITIES.items() if re.search(pattern, title)]
    channel_tags = [name for name, pattern in CHANNELS.items() if re.search(pattern, title)]
    method_tags = [name for name, pattern in METHODS.items() if re.search(pattern, title)]
    if not commodity_tags:
        commodity_tags = ["其他/综合情报"]
    if not channel_tags:
        channel_tags = ["未明确/综合情报"]
    for tag in commodity_tags:
        commodity_packages[tag] += 1
        if incidents:
            commodity_incidents[tag] += incidents
    for tag in channel_tags:
        channel_packages[tag] += 1
        if incidents:
            channel_incidents[tag] += incidents
    for tag in method_tags:
        method_packages[tag] += 1
    case_details.append({
        "case_id": row["case_id"],
        "title": title,
        "disclosed_incidents": incidents,
        "commodities": commodity_tags,
        "channels": channel_tags,
        "methods": method_tags,
    })

conn = sqlite3.connect(DB)
placeholders = ",".join("?" for _ in intel_ids)
document_stats = conn.execute(
    f"""SELECT extension, count(DISTINCT relative_path), count(*),
               sum(CASE WHEN text_chars > 0 THEN 1 ELSE 0 END), sum(text_chars)
        FROM documents WHERE case_id IN ({placeholders})
        GROUP BY extension ORDER BY count(*) DESC""",
    tuple(sorted(intel_ids)),
).fetchall()
xlsx_paths = conn.execute(
    f"SELECT DISTINCT case_id, relative_path FROM documents WHERE extension='.xlsx' AND case_id IN ({placeholders})",
    tuple(sorted(intel_ids)),
).fetchall()
conn.close()

identifiers = defaultdict(lambda: {"case_ids": set(), "occurrences": 0, "evidence": []})
for case_id, relative_path in xlsx_paths:
    path = ROOT / relative_path
    for sheet, row_num, header, group, identifier in workbook_identifier_rows(path) or []:
        key = (group, identifier)
        record = identifiers[key]
        record["case_ids"].add(case_id)
        record["occurrences"] += 1
        if len(record["evidence"]) < 6:
            record["evidence"].append({
                "case_id": case_id,
                "file": relative_path,
                "sheet": sheet,
                "row": row_num,
                "field": header,
            })

repeated_identifiers = []
for (group, identifier), record in identifiers.items():
    if len(record["case_ids"]) >= 2:
        repeated_identifiers.append({
            "group": group,
            "identifier": identifier,
            "case_count": len(record["case_ids"]),
            "case_ids": sorted(record["case_ids"]),
            "occurrences": record["occurrences"],
            "evidence": record["evidence"],
        })
repeated_identifiers.sort(key=lambda item: (-item["case_count"], item["group"], item["identifier"]))

subject_data = json.loads(REPEAT_SUBJECTS.read_text(encoding="utf-8"))
repeated_subjects = []
for item in subject_data.get("operational_subjects", []):
    ids = sorted(set(item["case_ids"]) & intel_ids)
    if len(ids) >= 2:
        repeated_subjects.append({
            "entity": item["entity"],
            "intelligence_case_count": len(ids),
            "case_ids": ids,
            "roles": item["roles"],
            "evidence": [ev for ev in item.get("evidence", []) if ev["case_id"] in ids],
        })
repeated_subjects.sort(key=lambda item: (-item["intelligence_case_count"], item["entity"]))

result = {
    "scope": {
        "intelligence_case_packages": len(intel_rows),
        "excluded_query_reply_packages": len(catalog_rows) - len(intel_rows),
        "disclosed_incidents_in_titles": disclosed_incident_total,
        "note": "Incident total sums titles that explicitly state N cases; summary/communications without a stated count are excluded.",
    },
    "commodity_packages": commodity_packages.most_common(),
    "commodity_disclosed_incidents": commodity_incidents.most_common(),
    "channel_packages": channel_packages.most_common(),
    "channel_disclosed_incidents": channel_incidents.most_common(),
    "method_packages": method_packages.most_common(),
    "document_stats": document_stats,
    "repeated_operational_subjects": repeated_subjects,
    "repeated_identifiers": repeated_identifiers,
    "case_details": case_details,
}
(ROOT / "情报案件风险分析.json").write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps({
    "scope": result["scope"],
    "commodity_packages": result["commodity_packages"],
    "commodity_disclosed_incidents": result["commodity_disclosed_incidents"],
    "channel_packages": result["channel_packages"],
    "channel_disclosed_incidents": result["channel_disclosed_incidents"],
    "method_packages": result["method_packages"],
    "repeated_operational_subjects": result["repeated_operational_subjects"][:20],
    "repeated_identifiers": result["repeated_identifiers"][:30],
}, ensure_ascii=True, indent=2))
