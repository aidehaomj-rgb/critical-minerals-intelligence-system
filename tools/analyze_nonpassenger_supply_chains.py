"""Deep-mine non-passenger, non-postal/express supply-chain links.

The analysis separates direct incident evidence from declaration/history
attachments and from matches elsewhere in the library.  A mention is a lead,
not a finding of wrongdoing.
"""

from __future__ import annotations

import csv
import json
import re
import sqlite3
import sys
from collections import Counter, defaultdict
from datetime import datetime
from itertools import combinations
from pathlib import Path


sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(r"D:\codex\XG执法\2026_案例库")
DB = ROOT / "enforcement_cases_2026.sqlite"
OUTPUT_JSON = ROOT / "非旅客非邮快件供应链深度分析.json"
OUTPUT_CSV = ROOT / "非旅客非邮快件供应链实体核查清单.csv"
OUTPUT_MD = ROOT / "非旅客非邮快件供应链深度分析.md"

INTEL = re.compile(r"情報|情报")
PASSENGER = re.compile(r"客運|客运|旅客|旅運|旅运")
SMALL_CAR = re.compile(r"陸路小車|陆路小车|小車走私|小车走私")
FISHING = re.compile(r"漁船|渔船")
POSTAL = re.compile(r"郵包|邮包|郵件|邮件|郵政|邮政")
COURIER = re.compile(
    r"快遞|快递|速遞|速递|\bUPS\b|\bFEDEX\b|\bDHL\b|\bEMS\b|"
    r"\bSF\s*EXPRESS\b|\bARAMEX\b|\bCOURIER\b|順豐|顺丰",
    re.I,
)
PURE_POSTAL_TITLE = re.compile(r"空運郵包|空运邮包")
MIXED_POSTAL_TITLE = re.compile(r"貨物及郵包|货物及邮包")
CARGO = re.compile(
    r"海路貨運|海路货运|河路貨運|河路货运|"
    r"陸路貨車|陆路货车|陸路貨運|陆路货运|"
    r"空運貨物|空运货物|空路貨物|空路货物|"
    r"貨車|货车"
)
PLACE = re.compile(
    r"儲存倉|储存仓|儲存庫|储存库|加油站|"
    r"儲存場|储存场|倉庫案|仓库案|可疑集裝箱|可疑集装箱"
)
NON_CASE = re.compile(
    r"通訊|通讯|回覆|回复|成效|參會|参会|培訓|培训|"
    r"名單|名单|註冊信息|注册信息|進出口銀情況|进出口银情况|"
    r"高風險企業名單|高风险企业名单"
)

CONTAINER = re.compile(r"\b[A-Z]{4}\s?\d{7}\b")
FLIGHT = re.compile(r"\b[A-Z0-9]{2,3}\s?\d{2,5}\b")
SHIP = re.compile(
    r"(?:貨船名稱|货船名称|船舶名稱|船舶名称|船名)\s*[:：]?\s*"
    r"(.{2,80}?)(?=\s*(?:集裝箱|集装箱|提單|提单|發貨人|发货人|收貨人|收货人|申報|申报|被捕人|檢獲|检获|$))",
    re.I | re.S,
)
BILL_PATTERNS = [
    re.compile(
        r"(?:海運|海运|空運|空运)?(?:副)?(?:提單|提单)(?:編號|编号|號碼|号码|號|号)?\s*[:：]?\s*([A-Z0-9][A-Z0-9\- ]{6,35})",
        re.I,
    ),
    re.compile(r"(?:AWB|WAYBILL|B/L)\s*(?:NO\.?\s*)?[:：]?\s*([A-Z0-9][A-Z0-9\- ]{6,35})", re.I),
]

THEMES = {
    "香烟及烟草制品": r"香煙|香烟|加熱煙|加热烟|電子煙|电子烟|雪茄|煙草|烟草",
    "毒品及受管制药物": r"毒品|可卡因|海洛因|冰毒|大麻|氯胺酮|藥物|药物|毒藥|毒药",
    "未列舱单货物": r"未列艙單|未列舱单",
    "濒危物种及动植物": r"瀕危物種|濒危物种|活貓|活猫|動物|动物|龜|龟|蜊蜴|穿山甲|魚翅|鱼翅|象牙|種子|种子",
    "冒牌物品": r"冒牌|假冒",
    "燃油": r"汽油|柴油|燃油|加油站",
    "废物/电子废料": r"廢物|废物|廢金屬|废金属|電子廢料|电子废料|電路板|电路板",
    "金属及贵金属": r"金屬|金属|貴金屬|贵金属|銀錠|银锭|白銀|白银",
    "酒类": r"烈酒|酒類|酒类",
    "武器": r"武器|槍械|枪械|彈藥|弹药|魚叉槍|鱼叉枪",
}

SERVICE_PROVIDER = re.compile(
    r"LOGISTIC|SHIPPING|FREIGHT|FORWARD|CARGO|EXPRESS|COURIER|AIRLINE|"
    r"MAERSK|YANG\s*MING|COSCO|MSC|HAPAG|EVERGREEN|物流|貨運|货运|運輸|运输|船務|船务",
    re.I,
)

COMPANY_KEY_FIXES = {
    "LOGITSICS": "LOGISTICS",
    "TECHONOGY": "TECHNOLOGY",
    "TECHONOLOGY": "TECHNOLOGY",
    "SHENZEHN": "SHENZHEN",
    "SOLUCOES": "SOLUCOES",
}

GENERIC_ENTITY_KEYS = {
    "空运货物", "空運貨物", "运输公司", "運輸公司",
    "补充资料运输公司", "補充資料運輸公司", "发货人资料", "收货人资料",
}
CORPORATE_MARKER = re.compile(
    r"LTD|LIMITED|LLC|INC\.?|CORP|COMPANY|\bCO\.?\b|LOGISTIC|TRADING|ENTERPRISE|"
    r"SUPPLY\s*CHAIN|SOLUTION|INDUSTRIAL|TECHNOLOGY|FACTORY|GROUP|"
    r"公司|企業|企业|集團|集团|物流|貨運|货运|運輸|运输|"
    r"貿易|贸易|商貿|商贸|經貿|经贸|供應鏈|供应链|採購|采购|"
    r"工業|工业|科技|科技|電子|电子|工廠|工厂|發展|发展",
    re.I,
)


def clean(value: object) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def norm(value: str, entity_type: str = "") -> str:
    raw = clean(value)
    if entity_type == "船舶":
        raw = re.sub(r"[（(][^）)]*[）)]", "", raw)
    key = raw.upper()
    key = re.sub(r"[，,。.;；:：'\"()（）\[\]【】/\\]", "", key)
    key = re.sub(r"\s+", "", key)
    if entity_type == "企业":
        for old, new in COMPANY_KEY_FIXES.items():
            key = key.replace(old, new)
    return key


def safe_md(value: object) -> str:
    return clean(value).replace("|", "\\|")


def role_from_context(context: str, entity_type: str) -> str:
    text = clean(context).casefold()
    if any(token in text for token in ("發貨", "发货", "寄件", "shipper", "consignor", "出口商")):
        return "发货/出口方"
    if any(token in text for token in ("收貨", "收货", "收件", "consignee", "receiver", "進口商", "进口商")):
        return "收货/进口方"
    if any(token in text for token in ("申報", "申报", "報關", "报关", "declarant")):
        return "申报/报关方"
    if any(token in text for token in ("運輸企業", "运输企业", "承運", "承运", "carrier", "forwarder")):
        return "承运/货代"
    if any(token in text for token in ("司機", "司机", "driver")):
        return "司机/驾驶员"
    return {
        "车辆": "运输工具",
        "船舶": "运输工具",
        "集装箱": "载具标识",
        "提运单": "单证标识",
        "航班": "运输工具",
        "地址": "地址",
        "电话": "联络方式",
        "人员": "人员",
        "人员英文名": "人员",
    }.get(entity_type, "未识别")


def theme_tags(text: str) -> list[str]:
    return [name for name, pattern in THEMES.items() if re.search(pattern, text, re.I)] or ["其他/未明确"]


def channel_label(text: str) -> str:
    if re.search(r"海路貨運|海路货运", text):
        return "海路货运"
    if re.search(r"河路貨運|河路货运", text):
        return "河路货运"
    if re.search(r"空運貨物|空运货物|空路貨物|空路货物", text):
        return "普通空运货物"
    if re.search(r"陸路貨車|陆路货车|陸路貨運|陆路货运|貨車|货车", text):
        return "陆路货车/货运"
    if PLACE.search(text):
        return "仓储/场所"
    return "其他非客运"


def decision(title: str, transport_mode: str, page_text: str, fields: dict) -> tuple[bool, str, str]:
    transport = clean(fields.get("运输方式", ""))
    page_scope = f"{transport} {fields.get('路线', '')} {page_text}"
    title_scope = f"{title} {transport_mode}"
    combined = f"{title_scope} {page_scope}"
    if NON_CASE.search(title):
        return False, "非案件型通讯/回复/名单", ""
    if PASSENGER.search(combined):
        return False, "旅客/客运", ""
    if SMALL_CAR.search(combined):
        return False, "陆路小车", ""
    if FISHING.search(combined):
        return False, "渔船/非传统货运", ""
    if POSTAL.search(page_scope) or COURIER.search(page_scope):
        return False, "邮包/快递", ""
    if PURE_POSTAL_TITLE.search(title) and not CARGO.search(page_scope):
        return False, "邮包/快递", ""
    if CARGO.search(page_scope) or PLACE.search(page_scope):
        return True, "", channel_label(page_scope)
    if (CARGO.search(title_scope) or PLACE.search(title_scope)) and not MIXED_POSTAL_TITLE.search(title):
        return True, "", channel_label(combined)
    if transport_mode in {"海路", "河路"}:
        return True, "", transport_mode + "货运"
    if transport_mode == "陆路" and re.search(r"車牌|车牌|貨車|货车|倉|仓|汽油", page_scope):
        return True, "", channel_label(page_scope)
    return False, "不符合传统货运/场所口径", ""


def extract_identifiers(text: str) -> list[tuple[str, str, str]]:
    results: list[tuple[str, str, str]] = []
    for item in SHIP.findall(text):
        display = clean(item)
        if 2 <= len(display) <= 80:
            results.append(("船舶", display, f"文本内船舶名称: {display}"))
    for item in CONTAINER.findall(text.upper()):
        display = re.sub(r"\s+", "", item).upper()
        results.append(("集装箱", display, f"文本内集装箱号: {display}"))
    for pattern in BILL_PATTERNS:
        for item in pattern.findall(text.upper()):
            display = clean(item).strip("- ")
            display = re.split(r"\s+(?:寄件|收件|申報|检获|檢獲)", display, maxsplit=1)[0]
            if 7 <= len(re.sub(r"\W", "", display)) <= 35 and any(ch.isdigit() for ch in display):
                results.append(("提运单", display, f"文本内提运单: {display}"))
    return results


def add_record(records: list[dict], *, entity_type: str, display: str, case_id: str,
               evidence_level: str, role: str, file: str, page: str, context: str,
               incident_key: str = "") -> None:
    display = clean(display)
    if entity_type == "企业":
        for label in (
            "发货人资料", "發貨人資料", "收货人资料", "收貨人資料",
            "发货人名称", "發貨人名稱", "收货人名称", "收貨人名稱",
        ):
            if label in display:
                display = clean(display.rsplit(label, 1)[1].lstrip(" :："))
        if display in GENERIC_ENTITY_KEYS:
            return
        if not CORPORATE_MARKER.search(display):
            entity_type = "个人/非公司收发货主体"
    key = norm(display, entity_type)
    if not key or key in {"NA", "NONE", "UNKNOWN", "不詳", "不详", "/"}:
        return
    if entity_type == "企业" and (len(display) < 3 or len(display) > 160):
        return
    records.append(
        {
            "entity_type": entity_type,
            "key": key,
            "display": display,
            "case_id": case_id,
            "evidence_level": evidence_level,
            "role": role,
            "file": file,
            "page": page,
            "context": clean(context)[:500],
            "incident_key": incident_key,
        }
    )


def parse_pipe_workbook(text: str) -> tuple[list[str], list[list[str]]]:
    lines = [clean(line) for line in (text or "").splitlines() if clean(line)]
    header: list[str] = []
    rows: list[list[str]] = []
    for line in lines:
        cells = [clean(cell) for cell in line.split(" | ")]
        if not header and any("運輸途徑" in cell or "运输途径" in cell for cell in cells) and any(
            "發貨人" in cell or "发货人" in cell for cell in cells
        ):
            header = cells
            continue
        if header and len(cells) >= max(6, len(header) // 2):
            if (
                len(cells) == len(header) + 1
                and re.fullmatch(r"\d+", cells[0])
                and not re.search(r"編號|编号|貨物|货物", header[0])
            ):
                cells = cells[1:]
            rows.append(cells + [""] * max(0, len(header) - len(cells)))
    return header, rows


def cell(row: list[str], header: list[str], tokens: tuple[str, ...]) -> str:
    for index, name in enumerate(header):
        if any(token.casefold() in name.casefold() for token in tokens):
            return row[index] if index < len(row) else ""
    return ""


def main() -> None:
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    case_rows = conn.execute("SELECT * FROM cases ORDER BY case_id").fetchall()
    cases = {row["case_id"]: dict(row) for row in case_rows}
    intelligence_ids = {
        case_id for case_id, row in cases.items()
        if INTEL.search(row["case_type"] or "") or INTEL.search(row["package_name"] or "")
    }
    document_rows = conn.execute(
        "SELECT case_id,relative_path,extension,page_or_sheet,extracted_text FROM documents"
    ).fetchall()
    docs = {
        (row["case_id"], row["relative_path"], row["page_or_sheet"]): row["extracted_text"] or ""
        for row in document_rows
    }
    docs_by_case: dict[str, list[sqlite3.Row]] = defaultdict(list)
    for row in document_rows:
        docs_by_case[row["case_id"]].append(row)

    incident_rows = conn.execute("SELECT * FROM intel_incidents ORDER BY case_id,id").fetchall()
    mention_rows = conn.execute("SELECT * FROM intel_mentions ORDER BY case_id,id").fetchall()
    conn.close()

    selected_incidents: list[dict] = []
    excluded_counts = Counter()
    cases_with_parsed_incidents = Counter()
    courier_labels_by_case: dict[str, set[str]] = defaultdict(set)
    for mention in mention_rows:
        if not (COURIER.search(mention["display_value"] or "") or COURIER.search(mention["context"] or "")):
            continue
        sheet_match = re.match(r"^案件([一二三四五六七八九十\d]+)", mention["page_or_sheet"] or "")
        if sheet_match:
            courier_labels_by_case[mention["case_id"]].add(clean(sheet_match.group(1)))
    for row in incident_rows:
        case = cases[row["case_id"]]
        fields = json.loads(row["fields_json"] or "{}")
        text = docs.get((row["case_id"], row["relative_path"], row["page_or_sheet"]), "")
        include, reason, channel = decision(case["package_name"], case["transport_mode"], text, fields)
        if include and clean(row["incident_label"]) in courier_labels_by_case.get(row["case_id"], set()):
            include, reason, channel = False, "邮包/快递（报关附件印证）", ""
        cases_with_parsed_incidents[row["case_id"]] += 1
        if not include:
            excluded_counts[reason] += 1
            continue
        selected_incidents.append(
            {
                "incident_key": f"{row['case_id']}|{row['relative_path']}|{row['page_or_sheet']}",
                "case_id": row["case_id"],
                "incident_label": row["incident_label"],
                "file": row["relative_path"],
                "page": row["page_or_sheet"],
                "channel": channel,
                "themes": theme_tags(f"{case['package_name']} {fields.get('检获物品', '')}"),
                "fields": fields,
                "text": text,
                "synthetic": False,
            }
        )

    # Cargo intelligence such as suspicious-container notices may not contain a
    # conventional "seized goods" page, so add one case-level record when the
    # title is unequivocally in scope and no parsed incident was available.
    selected_case_ids = {item["case_id"] for item in selected_incidents}
    for case_id in sorted(intelligence_ids):
        if case_id in selected_case_ids or cases_with_parsed_incidents[case_id]:
            continue
        case = cases[case_id]
        title = case["package_name"]
        if NON_CASE.search(title) or PASSENGER.search(title) or SMALL_CAR.search(title) or FISHING.search(title):
            continue
        if PURE_POSTAL_TITLE.search(title) or (MIXED_POSTAL_TITLE.search(title) and not re.search(r"海|河|陸|陆", title)):
            continue
        if not (CARGO.search(title) or PLACE.search(title) or case["transport_mode"] in {"海路", "河路"}):
            continue
        pages = [
            row for row in docs_by_case[case_id]
            if row["extension"] == ".pdf" and clean(row["extracted_text"])
        ]
        if not pages:
            continue
        combined = "\n".join(row["extracted_text"] or "" for row in pages)
        if POSTAL.search(combined) or COURIER.search(combined):
            continue
        first = pages[0]
        selected_incidents.append(
            {
                "incident_key": f"{case_id}|case-level",
                "case_id": case_id,
                "incident_label": "case-level",
                "file": first["relative_path"],
                "page": "case-level",
                "channel": channel_label(f"{title} {combined}"),
                "themes": theme_tags(f"{title} {combined}"),
                "fields": {},
                "text": combined,
                "synthetic": True,
            }
        )

    selected_case_ids = {item["case_id"] for item in selected_incidents}
    all_labels_by_case: dict[str, set[str]] = defaultdict(set)
    selected_labels_by_case: dict[str, set[str]] = defaultdict(set)
    for row in incident_rows:
        all_labels_by_case[row["case_id"]].add(clean(row["incident_label"]))
    for item in selected_incidents:
        if not item["synthetic"]:
            selected_labels_by_case[item["case_id"]].add(clean(item["incident_label"]))
    mixed_scope_cases = {
        case_id for case_id, labels in all_labels_by_case.items()
        if selected_labels_by_case.get(case_id) and selected_labels_by_case[case_id] != labels
    }
    incident_by_location = {
        (item["case_id"], item["file"], item["page"]): item for item in selected_incidents if not item["synthetic"]
    }
    synthetic_by_case = {item["case_id"]: item for item in selected_incidents if item["synthetic"]}

    entity_records: list[dict] = []
    for mention in mention_rows:
        case_id = mention["case_id"]
        if case_id not in selected_case_ids:
            continue
        location = (case_id, mention["relative_path"], mention["page_or_sheet"])
        incident = incident_by_location.get(location)
        if incident:
            level = "案件直接"
            incident_key = incident["incident_key"]
        elif case_id in synthetic_by_case and mention["relative_path"] == synthetic_by_case[case_id]["file"]:
            level = "案件直接"
            incident_key = synthetic_by_case[case_id]["incident_key"]
        else:
            page_or_sheet = mention["page_or_sheet"] or ""
            # Do not let an excluded courier/passenger incident re-enter via a
            # case-level workbook.  When a package mixes in-scope and excluded
            # incidents, retain only sheets whose incident label is selected.
            if case_id in mixed_scope_cases:
                sheet_match = re.match(r"^案件([一二三四五六七八九十\d]+)", page_or_sheet)
                if not sheet_match or clean(sheet_match.group(1)) not in selected_labels_by_case[case_id]:
                    continue
            # Flattened workbook text duplicates row-level evidence and cannot
            # reliably preserve which incident a row belongs to.
            if page_or_sheet == "workbook":
                continue
            level = "案件附件/报关记录"
            incident_key = (
                f"{case_id}|{mention['relative_path']}|{page_or_sheet}"
                if "!" in page_or_sheet else ""
            )
        add_record(
            entity_records,
            entity_type=mention["entity_type"],
            display=mention["display_value"],
            case_id=case_id,
            evidence_level=level,
            role=role_from_context(mention["context"] or "", mention["entity_type"]),
            file=mention["relative_path"],
            page=mention["page_or_sheet"],
            context=mention["context"] or "",
            incident_key=incident_key,
        )

    # Recover bill/container identifiers that were not part of the original
    # entity extractor.
    for incident in selected_incidents:
        for entity_type, display, context in extract_identifiers(incident["text"]):
            add_record(
                entity_records,
                entity_type=entity_type,
                display=display,
                case_id=incident["case_id"],
                evidence_level="案件直接",
                role=role_from_context(context, entity_type),
                file=incident["file"],
                page=incident["page"],
                context=context,
                incident_key=incident["incident_key"],
            )

    # Structured XLSX case tables (notably GDRM26-349) contain ordinary air
    # cargo rows.  Rows with a seizure are direct; adjacent rows are explicitly
    # labelled as related-shipment context rather than enforcement findings.
    structured_rows: list[dict] = []
    for case_id in sorted(intelligence_ids):
        case = cases[case_id]
        if NON_CASE.search(case["package_name"]) or PASSENGER.search(case["package_name"]) or PURE_POSTAL_TITLE.search(case["package_name"]):
            continue
        for doc in docs_by_case[case_id]:
            if doc["extension"] != ".xlsx":
                continue
            header, rows = parse_pipe_workbook(doc["extracted_text"] or "")
            if not header:
                continue
            for row_number, values in enumerate(rows, 2):
                transport = cell(values, header, ("運輸途徑", "运输途径"))
                row_text = " ".join(values)
                include, _, channel = decision(case["package_name"], case["transport_mode"], row_text, {"运输方式": transport})
                if not include:
                    continue
                seized = cell(values, header, ("緝獲物品", "缉获物品", "檢獲物品", "检获物品"))
                level = "案件直接" if seized else "同批/关联货运记录"
                incident_key = f"{case_id}|{doc['relative_path']}|row{row_number}"
                structured = {
                    "incident_key": incident_key,
                    "case_id": case_id,
                    "file": doc["relative_path"],
                    "page": f"workbook row {row_number}",
                    "channel": channel,
                    "themes": theme_tags(f"{case['package_name']} {seized}"),
                    "route": cell(values, header, ("來源地", "来源地", "路線", "路线")),
                    "seized": seized,
                    "level": level,
                }
                structured_rows.append(structured)
                fields = [
                    ("企业", cell(values, header, ("發貨人資料", "发货人资料", "發貨人名稱", "发货人名称")), "发货/出口方"),
                    ("企业", cell(values, header, ("收貨人資料", "收货人资料", "收貨人名稱", "收货人名称")), "收货/进口方"),
                    ("提运单", cell(values, header, ("空運提單", "空运提单", "海運提單", "海运提单")), "单证标识"),
                    ("航班", cell(values, header, ("航班編號", "航班编号")), "运输工具"),
                    ("集装箱", cell(values, header, ("集裝箱", "集装箱")), "载具标识"),
                ]
                for entity_type, display, role in fields:
                    if not display:
                        continue
                    add_record(
                        entity_records,
                        entity_type=entity_type,
                        display=display,
                        case_id=case_id,
                        evidence_level=level,
                        role=role,
                        file=doc["relative_path"],
                        page=f"workbook row {row_number}",
                        context=row_text,
                        incident_key=incident_key,
                    )

    # Structured case workbooks can add an otherwise unparsed in-scope case
    # (for example GDRM26-349), so include those case IDs in the final scope.
    selected_case_ids.update(item["case_id"] for item in structured_rows)

    # Deduplicate records created through overlapping extraction passes.
    unique_records: list[dict] = []
    seen = set()
    for record in entity_records:
        marker = (
            record["entity_type"], record["key"], record["case_id"], record["evidence_level"],
            record["file"], record["page"], record["role"], record["incident_key"],
        )
        if marker not in seen:
            seen.add(marker)
            unique_records.append(record)
    entity_records = unique_records

    all_global: dict[tuple[str, str], dict] = defaultdict(lambda: {"cases": set(), "aliases": Counter(), "contexts": []})
    for mention in mention_rows:
        key = norm(mention["display_value"], mention["entity_type"])
        group = all_global[(mention["entity_type"], key)]
        group["cases"].add(mention["case_id"])
        group["aliases"][clean(mention["display_value"])] += 1
        if len(group["contexts"]) < 5:
            group["contexts"].append(clean(mention["context"] or ""))

    incident_meta = {item["incident_key"]: item for item in selected_incidents}
    incident_meta.update({item["incident_key"]: item for item in structured_rows})
    aggregate: dict[tuple[str, str], dict] = defaultdict(
        lambda: {
            "aliases": Counter(), "cases": set(), "direct_cases": set(), "attachment_cases": set(),
            "incidents": set(), "roles": Counter(), "levels": Counter(), "evidence": [],
            "themes": set(), "channels": set(),
        }
    )
    for record in entity_records:
        group = aggregate[(record["entity_type"], record["key"])]
        group["aliases"][record["display"]] += 1
        group["cases"].add(record["case_id"])
        group["roles"][record["role"]] += 1
        group["levels"][record["evidence_level"]] += 1
        if record["evidence_level"] == "案件直接":
            group["direct_cases"].add(record["case_id"])
        else:
            group["attachment_cases"].add(record["case_id"])
        if record["incident_key"]:
            group["incidents"].add(record["incident_key"])
            meta = incident_meta.get(record["incident_key"], {})
            group["themes"].update(meta.get("themes", []))
            if meta.get("channel"):
                group["channels"].add(meta["channel"])
        evidence = {
            "case_id": record["case_id"], "level": record["evidence_level"], "role": record["role"],
            "file": record["file"], "page": record["page"], "context": record["context"],
        }
        if evidence not in group["evidence"] and len(group["evidence"]) < 12:
            group["evidence"].append(evidence)

    candidates: list[dict] = []
    high_risk_themes = {"毒品及受管制药物", "废物/电子废料", "濒危物种及动植物", "武器"}
    for (entity_type, key), group in aggregate.items():
        display = group["aliases"].most_common(1)[0][0]
        global_group = all_global.get((entity_type, key), {"cases": set(), "aliases": Counter()})
        global_cases = set(global_group["cases"])
        external_cases = global_cases - group["cases"]
        direct_count = len(group["direct_cases"])
        selected_count = len(group["cases"])
        global_count = len(global_cases | group["cases"])
        service = entity_type == "企业" and bool(SERVICE_PROVIDER.search(display))
        score = 0
        score += 4 if direct_count else 1
        score += 5 * max(0, selected_count - 1)
        score += min(6, 2 * len(external_cases))
        score += min(4, max(0, len(group["incidents"]) - 1))
        score += 2 if len(group["roles"]) >= 2 else 0
        score += 2 if entity_type in {"车辆", "船舶", "集装箱", "提运单", "电话"} and direct_count else 0
        score += 2 if group["themes"] & high_risk_themes and direct_count else 0
        score -= 2 if service else 0
        signals: list[str] = []
        if selected_count >= 2:
            signals.append(f"在{selected_count}个符合口径的案件中重复出现")
        if external_cases:
            signals.append(f"与库内其他{len(external_cases)}个案件/情报同名关联")
        if len(group["roles"]) >= 2:
            signals.append("跨多个供应链角色出现")
        if len(group["incidents"]) >= 2:
            signals.append(f"关联{len(group['incidents'])}个案件页/货运记录")
        if service:
            signals.append("物流/承运服务商，高频可能源于业务规模，必须与实际货主分层")
        if direct_count and not signals:
            signals.append("直接出现在符合口径的案件资料中")
        strong_identifier_cross = entity_type in {"车辆", "船舶", "集装箱", "提运单", "电话"} and bool(external_cases)
        priority = "A" if score >= 10 else "B" if score >= 6 or selected_count >= 2 or strong_identifier_cross else "C"
        candidates.append(
            {
                "priority": priority,
                "score": score,
                "entity_type": entity_type,
                "entity": display,
                "aliases": sorted(set(group["aliases"]) | set(global_group.get("aliases", {}))),
                "service_provider": service,
                "direct_case_count": direct_count,
                "selected_case_count": selected_count,
                "global_case_count": global_count,
                "selected_case_ids": sorted(group["cases"]),
                "external_case_ids": sorted(external_cases),
                "roles": [name for name, _ in group["roles"].most_common()],
                "channels": sorted(group["channels"]),
                "themes": sorted(group["themes"]),
                "signals": signals,
                "evidence": group["evidence"],
            }
        )
    candidates.sort(
        key=lambda item: (
            {"A": 0, "B": 1, "C": 2}[item["priority"]], -item["score"],
            -item["selected_case_count"], item["entity_type"], item["entity"],
        )
    )

    # Entity graph: direct incident/page and structured-row co-occurrence.
    records_by_incident: dict[str, list[dict]] = defaultdict(list)
    for record in entity_records:
        if record["incident_key"] and record["evidence_level"] in {
            "案件直接", "同批/关联货运记录", "案件附件/报关记录"
        }:
            records_by_incident[record["incident_key"]].append(record)
    edge_map: dict[tuple[tuple[str, str], tuple[str, str]], dict] = defaultdict(
        lambda: {"cases": set(), "incidents": set(), "levels": Counter()}
    )
    graph_nodes: set[tuple[str, str]] = set()
    for incident_key, rows in records_by_incident.items():
        nodes = sorted({(row["entity_type"], row["key"]) for row in rows})
        nodes = [node for node in nodes if node[0] in {"企业", "车辆", "船舶", "集装箱", "提运单", "航班", "电话", "地址", "人员"}]
        if len(nodes) > 30:
            nodes = [node for node in nodes if node[0] not in {"地址", "人员"}][:30]
        graph_nodes.update(nodes)
        meta = incident_meta.get(incident_key, {})
        case_id = meta.get("case_id", incident_key.split("|", 1)[0])
        levels = {row["evidence_level"] for row in rows}
        for left, right in combinations(nodes, 2):
            edge = edge_map[(left, right)]
            edge["cases"].add(case_id)
            edge["incidents"].add(incident_key)
            edge["levels"].update(levels)

    parent = {node: node for node in graph_nodes}

    def find(node):
        while parent[node] != node:
            parent[node] = parent[parent[node]]
            node = parent[node]
        return node

    def union(left, right):
        root_left, root_right = find(left), find(right)
        if root_left != root_right:
            parent[root_right] = root_left

    for left, right in edge_map:
        union(left, right)
    components: dict[tuple[str, str], set[tuple[str, str]]] = defaultdict(set)
    for node in graph_nodes:
        components[find(node)].add(node)
    candidate_lookup = {(item["entity_type"], norm(item["entity"], item["entity_type"])): item for item in candidates}
    chain_components: list[dict] = []
    for nodes in components.values():
        cases_in_component: set[str] = set()
        incidents_in_component: set[str] = set()
        edges = 0
        for (left, right), edge in edge_map.items():
            if left in nodes and right in nodes:
                edges += 1
                cases_in_component.update(edge["cases"])
                incidents_in_component.update(edge["incidents"])
        enterprises = sum(node[0] == "企业" for node in nodes)
        identifiers = sum(node[0] in {"车辆", "船舶", "集装箱", "提运单", "航班"} for node in nodes)
        if enterprises < 1 or (len(nodes) < 2 and identifiers == 0):
            continue
        node_rows = []
        for node in nodes:
            item = candidate_lookup.get(node)
            if item:
                node_rows.append(
                    {
                        "entity_type": item["entity_type"], "entity": item["entity"],
                        "priority": item["priority"], "roles": item["roles"],
                        "selected_case_ids": item["selected_case_ids"],
                    }
                )
        node_rows.sort(key=lambda item: ({"A": 0, "B": 1, "C": 2}[item["priority"]], item["entity_type"], item["entity"]))
        chain_components.append(
            {
                "case_ids": sorted(cases_in_component),
                "incident_or_row_count": len(incidents_in_component),
                "entity_count": len(nodes),
                "enterprise_count": enterprises,
                "identifier_count": identifiers,
                "edge_count": edges,
                "entities": node_rows[:40],
            }
        )
    chain_components.sort(
        key=lambda item: (-len(item["case_ids"]), -item["incident_or_row_count"], -item["entity_count"])
    )

    channels = Counter(item["channel"] for item in selected_incidents)
    themes = Counter(theme for item in selected_incidents for theme in item["themes"])
    case_titles = {case_id: cases[case_id]["package_name"] for case_id in sorted(selected_case_ids)}
    result = {
        "generated_at": datetime.now().astimezone().isoformat(),
        "methodology_note": (
            "实体出现和共现仅是待核查线索，不等于违法认定。案件直接资料、案件附件/报关记录和库内其他案件的同名关联已分层。"
        ),
        "scope": {
            "all_cases_scanned": len(cases),
            "intelligence_packages_scanned": len(intelligence_ids),
            "selected_case_packages": len(selected_case_ids),
            "selected_incident_or_case_pages": len(selected_incidents),
            "selected_structured_shipment_rows": len(structured_rows),
            "excluded_parsed_incident_counts": dict(excluded_counts),
            "channels": channels.most_common(),
            "themes": themes.most_common(),
        },
        "selected_cases": case_titles,
        "selected_incidents": [
            {key: value for key, value in item.items() if key != "text"}
            for item in selected_incidents
        ],
        "structured_shipment_rows": structured_rows,
        "priority_candidates": candidates,
        "chain_components": chain_components,
    }
    OUTPUT_JSON.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")

    csv_fields = [
        "优先级", "评分", "实体类型", "实体名称", "是否物流承运服务商", "直接案件数",
        "口径内案件数", "全库案件数", "涉及案号", "库内其他关联案号", "角色", "渠道", "主题",
        "风险/关联信号", "证据文件", "核查建议",
    ]
    with OUTPUT_CSV.open("w", newline="", encoding="utf-8-sig") as handle:
        writer = csv.DictWriter(handle, fieldnames=csv_fields)
        writer.writeheader()
        for item in candidates:
            if item["priority"] == "C" and not item["direct_case_count"]:
                continue
            evidence_files = sorted({f"{row['case_id']}:{row['file']}#{row['page']}" for row in item["evidence"]})
            checks = ["同名/别名清洗后核对企业注册号、地址、电话"]
            if item["entity_type"] == "企业":
                checks.append("按发货人、收货人、申报人、承运人分角色调取进出口记录")
            if item["entity_type"] in {"车辆", "船舶", "集装箱", "提运单", "航班"}:
                checks.append("核对时间、路线、承运企业、关联货主和申报品名")
            if item["service_provider"]:
                checks.append("先区分平台/承运服务商与实际货主，不以业务高频单独定性")
            writer.writerow(
                {
                    "优先级": item["priority"], "评分": item["score"], "实体类型": item["entity_type"],
                    "实体名称": item["entity"], "是否物流承运服务商": "是" if item["service_provider"] else "否",
                    "直接案件数": item["direct_case_count"], "口径内案件数": item["selected_case_count"],
                    "全库案件数": item["global_case_count"], "涉及案号": "、".join(item["selected_case_ids"]),
                    "库内其他关联案号": "、".join(item["external_case_ids"]), "角色": "、".join(item["roles"]),
                    "渠道": "、".join(item["channels"]), "主题": "、".join(item["themes"]),
                    "风险/关联信号": "；".join(item["signals"]), "证据文件": "；".join(evidence_files),
                    "核查建议": "；".join(checks),
                }
            )

    notable = [item for item in candidates if item["priority"] in {"A", "B"}]
    top_cross = [item for item in notable if item["selected_case_count"] >= 2 or item["external_case_ids"]][:30]
    direct_type_rank = {
        "企业": 0, "个人/非公司收发货主体": 0, "人员": 0, "人员英文名": 0,
        "车辆": 1, "船舶": 1, "集装箱": 1, "地址": 1, "电话": 1,
        "提运单": 2, "航班": 2,
    }
    top_direct = sorted(
        [item for item in notable if item["selected_case_count"] == 1 and item["direct_case_count"]],
        key=lambda item: (direct_type_rank.get(item["entity_type"], 3), -item["score"], item["entity"]),
    )[:40]
    md: list[str] = []
    md.append("# 非旅客、非邮快件案件供应链深度分析")
    md.append("")
    md.append(f">生成时间：{datetime.now().astimezone().strftime('%Y-%m-%d %H:%M:%S %z')}。")
    md.append(">口径：逐宗/逐页排除旅客、客运、陆路小车、邮包及UPS/FedEx/DHL/顺丰等快件；保留普通空运货物、海河运、陆路货车/货运、仓储场所和可疑集装箱情报。")
    md.append(">重要：实体出现、同名或共现只是风险线索，不等于该实体实施了违法行为。物流、船公司、货代及报关企业需与实际货主分层。")
    md.append("")
    md.append("## 一、分析范围")
    md.append("")
    md.append(f"- 扫描全库 **{len(cases)}** 个案件/资料包，其中情报类 **{len(intelligence_ids)}** 个。")
    md.append(f"- 纳入本口径的案件包 **{len(selected_case_ids)}** 个，直接案件页/案件级记录 **{len(selected_incidents)}** 条，结构化关联货运记录 **{len(structured_rows)}** 条。")
    md.append("- 渠道分布：" + "、".join(f"{name}{count}条" for name, count in channels.most_common()) + "。")
    md.append("- 主题分布：" + "、".join(f"{name}{count}条" for name, count in themes.most_common()) + "。")
    md.append("")
    md.append("## 二、跨案或跨资料包重点实体")
    md.append("")
    md.append("| 优先级 | 实体 | 类型/角色 | 口径内案号 | 直接/口径内案件数 | 库内其他关联 | 关联要点 |")
    md.append("|---|---|---|---|---|---|---|")
    for item in top_cross:
        md.append(
            f"| {item['priority']} | {safe_md(item['entity'])} | {safe_md(item['entity_type'] + '/' + '、'.join(item['roles']))} | "
            f"{safe_md('、'.join(item['selected_case_ids']))} | {item['direct_case_count']}/{item['selected_case_count']} | "
            f"{safe_md('、'.join(item['external_case_ids']) or '无')} | "
            f"{safe_md('；'.join(item['signals']))} |"
        )
    md.append("")
    md.append("## 三、单案直接链条的实体入口")
    md.append("")
    md.append("下列对象未必跨案重复，但直接占据发货、收货、运输工具或单证节点，可作为海关数据穿透入口。")
    md.append("")
    md.append("| 优先级 | 实体 | 类型/角色 | 案号 | 主题 |")
    md.append("|---|---|---|---|---|")
    for item in top_direct:
        md.append(
            f"| {item['priority']} | {safe_md(item['entity'])} | {safe_md(item['entity_type'] + '/' + '、'.join(item['roles']))} | "
            f"{safe_md('、'.join(item['selected_case_ids']))} | {safe_md('、'.join(item['themes']))} |"
        )
    md.append("")
    md.append("## 四、优先穿透的供应链组件")
    md.append("")
    for index, component in enumerate(chain_components[:20], 1):
        entities = "→".join(
            f"{item['entity']}[{item['entity_type']}]" for item in component["entities"][:12]
        )
        md.append(
            f"{index}. **{'、'.join(component['case_ids'])}**：{entities}。"
            f"共{component['incident_or_row_count']}个案件页/货运记录、{component['entity_count']}个实体。"
        )
    md.append("")
    md.append("## 五、可进一步验证的关联规律")
    md.append("")
    md.append("1. **同一海外物流/收货节点跨案重复。** 对同名实体按注册号、地址、电话去伪，再回溯所有发货人、航班/航次、提运单和申报品名。")
    md.append("2. **同批次多家货主共用一运输节点。** 如同日、同航班、相邻提单号出现多家发收货人，宜验证是拼货代理还是货主轮换。")
    md.append("3. **申报品名长期宽泛化。** 对衣物、家居用品、电子配件、回收铜原料等宽泛品名，结合重量、包装、价格、HS编码和历史查验结果建立基线。")
    md.append("4. **传统货运与邮快件可共用车辆、地址或物流服务商。** 本报告不把邮快件票计入主分析，但将其作为库内外部关联案号保留，便于识别渠道迁移。")
    md.append("5. **仓储场所是陆海空货运的后端交汇点。** 宜以地址标准化后关联企业注册地、实际收货地、车辆到访及报关流向。")
    md.append("")
    md.append("## 六、海关数据核查顺序")
    md.append("")
    md.append("1. 先查A级企业和强标识（车牌、集装箱、提运单、船舶），限定案发日前后30至90日。")
    md.append("2. 对企业同时调取发货、收货、申报、承运四种角色，并用注册号、地址和电话消除同名。")
    md.append("3. 对航空/海运批次核对相邻提单号、同航班/航次、同货代及同仓储地址，识别拆单、拼柜和轮换抬头。")
    md.append("4. 对报称货物做重量/价格/包装数量比值分析，再与同企业、同路线、同HS编码历史中位数比较。")
    md.append("5. 只有在实体同一性、贸易记录和案件时序三项相互印证后，再转化为验证性风险规则。")
    md.append("")
    md.append("## 七、证据分层与局限")
    md.append("")
    md.append("- **案件直接**：来自查获案件页或已标明缉获物品的结构化记录。")
    md.append("- **案件附件/报关记录**：与案件同包保存，但可能是历史或延伸记录，不当然等同于查获票。")
    md.append("- **库内其他关联**：仅表示同名/归一化后同值，仍需注册号、地址、电话或单证号确认是否同一实体。")
    md.append("- 企业、物流商、车辆或船舶合法承接多票业务非常常见，不能仅以跨案频次推定故意。")
    OUTPUT_MD.write_text("\n".join(md) + "\n", encoding="utf-8")

    summary = {
        "json": str(OUTPUT_JSON), "csv": str(OUTPUT_CSV), "report": str(OUTPUT_MD),
        "scope": result["scope"],
        "candidate_counts": dict(Counter(item["priority"] for item in candidates)),
        "top_candidates": [
            {key: item[key] for key in ("priority", "score", "entity_type", "entity", "selected_case_ids", "external_case_ids", "roles")}
            for item in candidates[:30]
        ],
    }
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
