"""Identify likely cargo principals in road, sea and river intelligence cases."""

from __future__ import annotations

import csv
import json
import re
import sqlite3
import sys
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path


sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(r"D:\codex\XG执法\2026_案例库")
DB = ROOT / "enforcement_cases_2026.sqlite"
SOURCE = ROOT / "非旅客非邮快件供应链深度分析.json"
OUT_JSON = ROOT / "公路海运河运货主候选穿透分析.json"
OUT_CSV = ROOT / "公路海运河运持续关注货主候选清单.csv"
OUT_MD = ROOT / "公路海运河运真实货主候选分析.md"

CHANNELS = {"陆路货车/货运", "海路货运", "河路货运"}
NEXT_LABELS = (
    "案件日期", "运输方式", "抵港日期", "预计离港日期", "路线", "车牌号码", "货船名称",
    "船舶名称", "提单编号", "集装箱编号", "发货人资料", "收货人资料", "申报货物",
    "申报物品", "物品申报", "被捕人资料", "检获物品", "总值", "价值", "应课税值", "收藏手法",
)
SERVICE = re.compile(
    r"LOGISTIC|FREIGHT|FORWARD|CARGO|SHIPPING|EXPRESS|COURIER|TRANSPORT|CARRIER|SUPPLY CHAIN|WAREHOUSE|"
    r"物流|貨運|货运|運輸|运输|貨代|货代|報關|报关|速遞|速递|供應鏈|供应链|倉庫|仓库|貨倉|货仓",
    re.I,
)
TRADER = re.compile(
    r"TRADING|TRADE|IMPORT|EXPORT|COMMERCE|PROCUREMENT|"
    r"貿易|贸易|商貿|商贸|經貿|经贸|進出口|进出口|採購|采购",
    re.I,
)
INDUSTRIAL = re.compile(
    r"FACTORY|INDUSTRIAL|TECHNOLOGY|ELECTRONIC|MATERIAL|RECYCL|ENVIRONMENT|SOLUCOES|"
    r"工廠|工厂|工業|工业|科技|電子|电子|材料|環保|环保|再造|回收|實業|实业",
    re.I,
)
LEGAL = re.compile(
    r"LTD|LIMITED|LLC|INC\.?|CORP|COMPANY|\bCO\.?\b|"
    r"有限公司|有限責任公司|有限责任公司|股份有限公司|公司|廠|厂|企業|企业|集團|集团",
    re.I,
)
GENERIC = re.compile(r"^(?:NA|N/A|/|义乌采购|義烏採購|全球經貿|全球经贸)$", re.I)
COMPANY_SUFFIX = re.compile(
    r"[\u3400-\u9fffA-Za-z0-9&'（）()\-., ]{2,140}"
    r"(?:有限責任公司|有限责任公司|股份有限公司|有限公司|集團|集团|公司|工廠|工厂|企業|企业)"
)
EN_COMPANY = re.compile(
    r"\b[A-Z][A-Z0-9&'.,()\- ]{2,140}(?:CO\.?\s*,?\s*LTD\.?|CO\.?\s*,?\s*LIMITED|LIMITED|LTDA|LTD\.?|LLC|INC\.?|CORP(?:ORATION)?|COMPANY|FACTORY)\b",
    re.I,
)


def clean(value: object) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def norm(value: str) -> str:
    value = clean(value).upper()
    value = re.sub(r"[，,。.;；:：'\"()（）\[\]【】/\\]", "", value)
    value = re.sub(r"\s+", "", value)
    return value.replace("LOGITSICS", "LOGISTICS").replace("TECHONOGY", "TECHNOLOGY")


def canonical_party(value: str) -> str:
    value = clean(value)
    fixes = {
        "SHENZHEN GUANJIAN DA INTERNATIONAL":
            "SHENZHEN GUANJIAN DA INTERNATIONAL FREIGHT FORWARDING CO., LTD.",
    }
    return fixes.get(value.upper(), value)


def field(text: str, labels: tuple[str, ...]) -> str:
    label_pattern = "|".join(map(re.escape, labels))
    next_pattern = "|".join(map(re.escape, NEXT_LABELS))
    match = re.search(
        rf"(?:{label_pattern})\s*[:：]?\s*(.*?)(?=\s*(?:{next_pattern})\s*[:：]?|$)",
        text,
        re.I | re.S,
    )
    return clean(match.group(1)) if match else ""


def split_parties(value: str) -> list[str]:
    if not value:
        return []
    value = re.sub(r"[（(](?:报关|報關|提单|提單)[）)]", " | ", value, flags=re.I)
    parts = re.split(r"\s*[|;；]\s*|\s*[①②③④⑤]\s*|\s*[（(][一二三四五六七八九十\d]+[）)]\s*", value)
    output: list[str] = []
    for part in parts:
        part = clean(part).strip("-:：")
        if not part:
            continue
        found = COMPANY_SUFFIX.findall(part) + EN_COMPANY.findall(part.upper())
        if found:
            output.extend(clean(item) for item in found)
        elif 2 <= len(part) <= 120:
            output.append(part)
    deduped = []
    seen = set()
    for item in output:
        key = norm(item)
        if key and key not in seen:
            seen.add(key)
            deduped.append(item)
    return deduped


def party_category(name: str) -> str:
    if GENERIC.search(clean(name)):
        return "泛称/无法定位"
    if SERVICE.search(name):
        return "物流/货代/报关服务商"
    if INDUSTRIAL.search(name):
        return "生产/工业/回收企业"
    if TRADER.search(name):
        return "贸易/进出口主体"
    if LEGAL.search(name):
        return "其他法人主体"
    return "个人或未标准化主体"


def confidence_score(channel: str, category: str, evidence_level: str, cross_case: bool, has_seizure: bool) -> int:
    score = 0
    if evidence_level in {"案件页具体提单/集装箱主体", "报关记录具体提单/集装箱主体"}:
        score += 5
    elif evidence_level == "案件页直接收发货人":
        score += 3
    else:
        score += 2
    score += 1 if category in {"生产/工业/回收企业", "贸易/进出口主体", "其他法人主体"} else 0
    score -= 2 if category == "物流/货代/报关服务商" else 0
    score -= 3 if category == "泛称/无法定位" else 0
    score += 2 if cross_case else 0
    score -= 2 if not has_seizure else 0
    return score


def confidence_label(score: int) -> str:
    if score >= 6:
        return "高"
    if score >= 4:
        return "中高"
    if score >= 2:
        return "中"
    return "低"


def main() -> None:
    source = json.loads(SOURCE.read_text(encoding="utf-8"))
    selected = [item for item in source["selected_incidents"] if item["channel"] in CHANNELS]
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    docs = {
        (row["case_id"], row["relative_path"], row["page_or_sheet"]): row["extracted_text"] or ""
        for row in conn.execute("SELECT case_id,relative_path,page_or_sheet,extracted_text FROM documents")
    }
    docs_by_file: dict[tuple[str, str], list[tuple[str, str]]] = defaultdict(list)
    for (case_id, relative_path, page_or_sheet), extracted_text in docs.items():
        docs_by_file[(case_id, relative_path)].append((page_or_sheet, extracted_text))
    mentions = conn.execute("SELECT * FROM intel_mentions ORDER BY case_id,id").fetchall()
    titles = {row[0]: row[1] for row in conn.execute("SELECT case_id,package_name FROM cases")}
    conn.close()

    selected_labels: dict[str, set[str]] = defaultdict(set)
    incidents_by_case: dict[str, list[dict]] = defaultdict(list)
    incident_rows: list[dict] = []
    for item in selected:
        selected_labels[item["case_id"]].add(clean(item["incident_label"]))
        incidents_by_case[item["case_id"]].append(item)
        text = docs.get((item["case_id"], item["file"], item["page"]), "")
        label = clean(item["incident_label"])
        supplements: list[str] = []
        for _, other_text in docs_by_file.get((item["case_id"], item["file"]), []):
            if label and re.search(rf"案件\s*{re.escape(label)}\s*资料", other_text):
                supplements.append(other_text)
            elif not label and re.search(r"案件\s*资料", other_text):
                supplements.append(other_text)
        combined_text = "\n".join(dict.fromkeys([*supplements, text]))
        row = {
            "case_id": item["case_id"],
            "incident_label": clean(item["incident_label"]),
            "channel": item["channel"],
            "file": item["file"],
            "page": item["page"],
            "date": field(combined_text, ("案件日期",)),
            "route": field(combined_text, ("路线",)),
            "vehicle_or_vessel": field(combined_text, ("车牌号码", "货船名称", "船舶名称")),
            "container": field(combined_text, ("集装箱编号",)),
            "bill": field(combined_text, ("提单编号",)),
            "declared_goods": field(combined_text, ("申报货物", "申报物品", "物品申报")),
            "seized_goods": field(combined_text, ("检获物品",)),
            "shipper_text": field(combined_text, ("发货人资料",)),
            "consignee_text": field(combined_text, ("收货人资料",)),
            "consignee_customs_text": field(combined_text, ("收货人资料(报关)", "收货人资料（报关）")),
            "consignee_bill_text": field(combined_text, ("收货人资料(提单)", "收货人资料（提单）")),
            "cross_border_ecommerce": bool(re.search(r"跨境电商|跨境電商|CROSS[- ]?BORDER\s+E[- ]?COMMERCE", combined_text, re.I)),
        }
        incident_rows.append(row)

    party_evidence: list[dict] = []
    for row in incident_rows:
        has_specific_consignment = row["channel"] in {"海路货运", "河路货运"} and bool(row["container"] or row["bill"])
        if has_specific_consignment:
            direct_level = "案件页具体提单/集装箱主体"
        elif row["channel"] == "河路货运":
            direct_level = "河运未列舱单案件的申报货物主体"
        else:
            direct_level = "案件页直接收发货人"
        consignee_values = []
        if row["consignee_customs_text"]:
            consignee_values.append(("收货/进口方（报关）", row["consignee_customs_text"]))
        if row["consignee_bill_text"]:
            consignee_values.append(("收货/进口方（提单）", row["consignee_bill_text"]))
        if not consignee_values:
            consignee_values.append(("收货/进口方", row["consignee_text"]))
        for role, value in [("发货/出口方", row["shipper_text"]), *consignee_values]:
            for party in split_parties(value):
                party = canonical_party(party)
                party_evidence.append(
                    {
                        "entity": party, "key": norm(party), "case_id": row["case_id"],
                        "incident_label": row["incident_label"], "channel": row["channel"], "role": role,
                        "evidence_level": direct_level, "file": row["file"], "page": row["page"],
                        "context": value, "route": row["route"], "declared_goods": row["declared_goods"],
                        "seized_goods": row["seized_goods"], "vehicle_or_vessel": row["vehicle_or_vessel"],
                        "container": row["container"], "bill": row["bill"],
                        "cross_border_ecommerce": row["cross_border_ecommerce"],
                    }
                )

    # Road cases often identify parties only in the incident declaration
    # attachment.  Keep them, but explicitly label them as declared-load
    # principals rather than owners of the concealed/seized goods.
    for mention in mentions:
        case_id = mention["case_id"]
        if case_id not in selected_labels or mention["entity_type"] != "企业":
            continue
        page_or_sheet = mention["page_or_sheet"] or ""
        if page_or_sheet == "workbook":
            continue
        role = ""
        context = mention["context"] or ""
        if re.search(r"發貨人|发货人", context):
            role = "发货/出口方"
        elif re.search(r"收貨人|收货人", context):
            role = "收货/进口方"
        if not role:
            continue
        sheet_match = re.match(r"^案件([一二三四五六七八九十\d]+)", page_or_sheet)
        if sheet_match:
            label = clean(sheet_match.group(1))
            if label not in selected_labels[case_id]:
                continue
            related = next((item for item in incident_rows if item["case_id"] == case_id and item["incident_label"] == label), None)
        elif len(selected_labels[case_id]) == 1:
            label = next(iter(selected_labels[case_id]))
            related = next((item for item in incident_rows if item["case_id"] == case_id), None)
        else:
            continue
        if not related:
            continue
        party = canonical_party(mention["display_value"])
        evidence_level = "案件报关附件的申报货物主体"
        if related["channel"] in {"海路货运", "河路货运"} and (related["container"] or related["bill"]):
            evidence_level = "报关记录具体提单/集装箱主体"
        party_evidence.append(
            {
                "entity": party, "key": norm(party), "case_id": case_id, "incident_label": label,
                "channel": related["channel"], "role": role,
                "evidence_level": evidence_level, "file": mention["relative_path"],
                "page": page_or_sheet, "context": context, "route": related["route"],
                "declared_goods": related["declared_goods"], "seized_goods": related["seized_goods"],
                "vehicle_or_vessel": related["vehicle_or_vessel"], "container": related["container"], "bill": related["bill"],
                "cross_border_ecommerce": related["cross_border_ecommerce"],
            }
        )

    # Deduplicate overlapping mention paths.
    unique = []
    seen = set()
    for item in party_evidence:
        marker = (item["key"], item["case_id"], item["incident_label"], item["role"], item["evidence_level"])
        if item["key"] and marker not in seen:
            seen.add(marker)
            unique.append(item)
    party_evidence = unique

    aggregates: dict[str, dict] = defaultdict(
        lambda: {"aliases": Counter(), "cases": set(), "channels": set(), "roles": set(), "levels": set(), "evidence": []}
    )
    for item in party_evidence:
        group = aggregates[item["key"]]
        group["aliases"][item["entity"]] += 1
        group["cases"].add(item["case_id"])
        group["channels"].add(item["channel"])
        group["roles"].add(item["role"])
        group["levels"].add(item["evidence_level"])
        if len(group["evidence"]) < 12:
            group["evidence"].append(item)

    candidates: list[dict] = []
    for key, group in aggregates.items():
        name = group["aliases"].most_common(1)[0][0]
        category = party_category(name)
        level_priority = {
            "案件页具体提单/集装箱主体": 0,
            "报关记录具体提单/集装箱主体": 1,
            "案件页直接收发货人": 2,
            "河运未列舱单案件的申报货物主体": 3,
            "案件报关附件的申报货物主体": 4,
        }
        best_level = sorted(group["levels"], key=lambda value: level_priority.get(value, 99))[0]
        best_channel = sorted(group["channels"], key=lambda value: {"海路货运": 0, "河路货运": 1, "陆路货车/货运": 2}.get(value, 9))[0]
        has_seizure = any(clean(row.get("seized_goods")) for row in group["evidence"])
        all_cross_border_ecommerce = bool(group["evidence"]) and all(
            bool(row.get("cross_border_ecommerce")) for row in group["evidence"]
        )
        score = confidence_score(best_channel, category, best_level, len(group["cases"]) >= 2, has_seizure)
        confidence = confidence_label(score)
        if category == "泛称/无法定位":
            suitability = "不建议单独持续关注"
        elif category == "物流/货代/报关服务商":
            suitability = "可作为运输控制节点，不宜直接定为真实货主"
        elif not has_seizure:
            suitability = "可作为情报预警对象，尚无本案查获结果"
        elif best_channel == "陆路货车/货运" and all_cross_border_ecommerce:
            suitability = "已识别为跨境电商公路链路，从非跨境电商重点名单剔除"
        elif best_channel == "陆路货车/货运" and best_level == "案件报关附件的申报货物主体":
            suitability = "持续关注申报货物流向，需另查隐藏货物实际货主"
        elif best_level == "河运未列舱单案件的申报货物主体":
            suitability = "可查申报货物链条，不能单独认定未列舱单货物的实际货主"
        else:
            suitability = "适合作为货权主体候选持续关注"
        candidates.append(
            {
                "confidence": confidence, "score": score, "entity": name, "aliases": list(group["aliases"]),
                "category": category, "roles": sorted(group["roles"]), "channels": sorted(group["channels"]),
                "case_ids": sorted(group["cases"]), "evidence_levels": sorted(group["levels"]),
                "has_seizure": has_seizure, "all_cross_border_ecommerce": all_cross_border_ecommerce,
                "monitoring_suitability": suitability, "evidence": group["evidence"],
            }
        )
    order = {"高": 0, "中高": 1, "中": 2, "低": 3}
    candidates.sort(key=lambda item: (order[item["confidence"]], -item["score"], item["category"], item["entity"]))

    owner_candidates = [
        item for item in candidates
        if item["category"] not in {"物流/货代/报关服务商", "泛称/无法定位"}
        and item["confidence"] in {"高", "中高", "中"}
    ]
    control_nodes = [
        item for item in candidates
        if item["category"] == "物流/货代/报关服务商"
        and (len(item["case_ids"]) >= 2 or item["confidence"] in {"高", "中高", "中"})
    ]
    result = {
        "generated_at": datetime.now().astimezone().isoformat(),
        "methodology": (
            "海运/河运案件中与具体集装箱或提单直接对应的收发货人视为较高置信的名义货权主体候选；"
            "河运多票拼载且未列舱单案件的申报主体、以及公路夹藏案的报关主体，仅证明申报货物链条，不当然是隐藏货物的实际货主。"
        ),
        "scope": {
            "road_sea_river_incident_records": len(incident_rows),
            "case_packages": len({item["case_id"] for item in incident_rows}),
            "channels": Counter(item["channel"] for item in incident_rows).most_common(),
            "party_evidence_records": len(party_evidence),
            "owner_candidate_count": len(owner_candidates),
            "transport_control_node_count": len(control_nodes),
        },
        "incidents": incident_rows,
        "owner_candidates": owner_candidates,
        "transport_control_nodes": control_nodes,
        "all_candidates": candidates,
    }
    OUT_JSON.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")

    fields = ["置信度", "对象名称", "对象性质", "角色", "运输方式", "案件编号", "是否跨境电商", "证据层级", "持续关注定位", "核查要点", "证据路径"]
    with OUT_CSV.open("w", newline="", encoding="utf-8-sig") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        for item in owner_candidates + control_nodes:
            if item["all_cross_border_ecommerce"]:
                continue
            evidence_paths = sorted({f"{row['case_id']}:{row['file']}#{row['page']}" for row in item["evidence"]})
            checks = ["企业注册号/税号、董事及股东、注册与营业地址"]
            checks.append("同期发货人、收货人、提单/车辆、报关品名及HS编码")
            if item["category"] == "物流/货代/报关服务商":
                checks.append("调取实际委托人、订舱/派车账号、结算人和仓库交接记录")
            writer.writerow(
                {
                    "置信度": item["confidence"], "对象名称": item["entity"], "对象性质": item["category"],
                    "角色": "、".join(item["roles"]), "运输方式": "、".join(item["channels"]),
                    "案件编号": "、".join(item["case_ids"]), "是否跨境电商": "是" if item["all_cross_border_ecommerce"] else "否",
                    "证据层级": "、".join(item["evidence_levels"]),
                    "持续关注定位": item["monitoring_suitability"], "核查要点": "；".join(checks),
                    "证据路径": "；".join(evidence_paths),
                }
            )

    def evidence_summary(item: dict) -> str:
        row = item["evidence"][0]
        linkage = "、".join(filter(None, [row.get("vehicle_or_vessel"), row.get("container"), row.get("bill")]))
        return f"{row['case_id']}；{row['role']}；{row['route'] or '路线待补'}" + (f"；{linkage}" if linkage else "")

    direct_maritime = [
        item for item in owner_candidates
        if any(channel in {"海路货运", "河路货运"} for channel in item["channels"])
        and any(level in {"案件页具体提单/集装箱主体", "报关记录具体提单/集装箱主体"} for level in item["evidence_levels"])
        and item["has_seizure"]
    ]
    pooled_maritime = [
        item for item in owner_candidates
        if "河路货运" in item["channels"]
        and "河运未列舱单案件的申报货物主体" in item["evidence_levels"]
    ]
    warning_candidates = [item for item in owner_candidates if not item["has_seizure"]]
    road_principals = [
        item for item in owner_candidates
        if "陆路货车/货运" in item["channels"] and not item["all_cross_border_ecommerce"]
    ]
    road_ecommerce = [
        item for item in owner_candidates
        if "陆路货车/货运" in item["channels"] and item["all_cross_border_ecommerce"]
    ]
    md: list[str] = []
    md.append("# 公路、海运、河运真实货主候选分析")
    md.append("")
    md.append("结论：**有可持续关注的货权主体候选，但主要集中在海运和河运案件。** 公路案件目前多数只能定位报关货物主体和物流控制节点，还不能单凭案例材料确定夹藏/未申报货物的真实货主。")
    md.append("")
    md.append(f"本次纳入{len(incident_rows)}条公路、海运、河运案件记录，涉及{len({item['case_id'] for item in incident_rows})}个案件包。")
    md.append("")
    md.append("## 一、第一批持续关注对象：海运/河运具体提单或集装箱主体")
    md.append("")
    md.append("| 置信度 | 主体 | 性质/角色 | 案件及直接链接 | 持续关注定位 |")
    md.append("|---|---|---|---|---|")
    for item in direct_maritime[:40]:
        md.append(
            f"| {item['confidence']} | {item['entity'].replace('|', '\\|')} | "
            f"{item['category']}/ {'、'.join(item['roles'])} | {evidence_summary(item).replace('|', '\\|')} | "
            f"{item['monitoring_suitability']} |"
        )
    md.append("")
    md.append("## 二、河运多票拼载/未列舱单案件的申报主体")
    md.append("")
    md.append("以下主体与查获船次同现，但现有材料没有把未列舱单货物逐票映射到具体货主，定性弱于第一部分。")
    md.append("")
    md.append("| 置信度 | 主体 | 性质/角色 | 案号 | 证据层级 |")
    md.append("|---|---|---|---|---|")
    for item in pooled_maritime[:35]:
        md.append(
            f"| {item['confidence']} | {item['entity'].replace('|', '\\|')} | {item['category']}/ {'、'.join(item['roles'])} | "
            f"{'、'.join(item['case_ids'])} | {'、'.join(item['evidence_levels'])} |"
        )
    md.append("")
    md.append("## 三、非跨境电商公路案件的申报货物主体候选")
    md.append("")
    md.append("以下主体可持续查其报关与车辆流向，但必须另找委托、仓储、结算或通讯证据，才能认定为隐藏货物真实货主。")
    md.append("")
    md.append("| 置信度 | 主体 | 性质/角 | 案号 | 证据层级 |")
    md.append("|---|---|---|---|---|")
    for item in road_principals[:35]:
        md.append(
            f"| {item['confidence']} | {item['entity'].replace('|', '\\|')} | {item['category']}/ {'、'.join(item['roles'])} | "
            f"{'、'.join(item['case_ids'])} | {'、'.join(item['evidence_levels'])} |"
        )
    md.append("")
    md.append("## 四、已识别为跨境电商的公路链路（从本轮非电商名单剔除）")
    md.append("")
    md.append("| 主体 | 角色 | 案号 | 处理 |")
    md.append("|---|---|---|---|")
    for item in road_ecommerce[:35]:
        md.append(
            f"| {item['entity'].replace('|', '\\|')} | {'、'.join(item['roles'])} | {'、'.join(item['case_ids'])} | "
            "舱单/提单明确为跨境电商货物，不纳入非跨境电商重点对象 |"
        )
    md.append("")
    md.append("## 五、宜持续关注但不宜定性为货主的运输控制节点")
    md.append("")
    md.append("| 主体 | 角色 | 案号 | 关注价值 |")
    md.append("|---|---|---|---|")
    for item in control_nodes[:30]:
        md.append(
            f"| {item['entity'].replace('|', '\\|')} | {'、'.join(item['roles'])} | {'、'.join(item['case_ids'])} | "
            "可反查实际委托人、订舱/派车账号、结算人及仓库交接 |"
        )
    md.append("")
    next_section = 6
    if warning_candidates:
        md.append("")
        md.append("## 六、尚无查获结果的情报预警对象")
        md.append("")
        md.append("| 主体 | 角色 | 案号 | 备注 |")
        md.append("|---|---|---|---|")
        for item in warning_candidates[:30]:
            md.append(f"| {item['entity'].replace('|', '\\|')} | {'、'.join(item['roles'])} | {'、'.join(item['case_ids'])} | 仅作风险预警，不作已查获定性 |")
        next_section = 7
    md.append("")
    section_names = {6: "六", 7: "七", 8: "八"}
    md.append(f"## {section_names[next_section]}、持续关注的数据条件")
    md.append("")
    md.append("1. 企业主键使用注册号/税号，公司名和英文拼写仅用于扩展搜索。")
    md.append("2. 海河运同时检索提单发货人、报关收货人、通知人、真实委托人和运费付款方。")
    md.append("3. 公路案以车牌+司机+物流公司+仓库进出记录回溯派车委托人，不以车辆报关抬头直接当作货主。")
    md.append("4. 筛查企业名下同路线、同承运人、相邻提单/同批派车的其他票，并比较品名、重量、包装和价格。")
    md.append("5. 持续关注应设定复合条件，至少包含两项独立信号，避免对大型货代/承运人因业务量大产生误伤。")
    md.append("")
    md.append(f"## {section_names[next_section + 1]}、证据边界")
    md.append("")
    md.append("- “货权主体候选”只表示其在提单/报关记录上承担收发货或贸易角色，不等于已证明其知悉或控制违禁品。")
    md.append("- 物流、货代、报关行、船公司和仓库优先作为反查真实委托人的运输控制节点，不单独作为货主。")
    OUT_MD.write_text("\n".join(md) + "\n", encoding="utf-8")

    print(
        json.dumps(
            {
                "report": str(OUT_MD), "csv": str(OUT_CSV), "json": str(OUT_JSON), "scope": result["scope"],
                "top_owner_candidates": [
                    {key: item[key] for key in ("confidence", "entity", "category", "roles", "channels", "case_ids", "monitoring_suitability")}
                    for item in owner_candidates[:30]
                ],
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
