from __future__ import annotations

import csv
import hashlib
import json
import os
import re
import shutil
from collections import Counter, defaultdict
from pathlib import Path


SRC_DIR = Path(os.environ.get("GLYCOL_SRC_DIR", r"C:\Users\59809\Documents\关键矿产\temp"))
OUT_DIR = Path(os.environ.get(
    "GLYCOL_OUT_DIR",
    r"D:\易迅数据\反倾销税深度分析报告\09_乙二醇和丙二醇的单烷基醚",
))
OUT_DIR.mkdir(parents=True, exist_ok=True)

ALL_PATH = SRC_DIR / "yixun_glycol_ether_all84.json"
PAGE_PATHS = [SRC_DIR / f"yixun_glycol_ether_p{i}.json" for i in range(1, 6)]
RAW = json.loads(ALL_PATH.read_text(encoding="utf-8"))

FIELDS = [
    "data_feed", "trade_direction", "date", "hs_code", "description",
    "buyer_or_consignee", "seller_or_shipper", "weight_field", "quantity_field",
    "amount_field", "destination", "platform_origin", "favorite",
]


def number(value):
    text = str(value or "").replace(",", "").strip()
    try:
        return float(text) if text else None
    except ValueError:
        return None


def signature(row):
    return hashlib.sha256(json.dumps(row, ensure_ascii=False, separators=(",", ":")).encode()).hexdigest()[:16]


def classify(description):
    d = description.upper().replace("™", "(TM)")
    if "POLYTETRAMETHYLENE" in d or "PTMEG" in d:
        return "明确范围外", "PTMEG聚醚", "聚四氢呋喃醚二醇属于聚醚聚合物，不是公告列明的单烷基醚"
    if "ACETATE" in d:
        return "明确范围外", "醋酸酯", "单烷基醚已酯化；公告具体产品清单不含醋酸酯"
    if "AMINOETHYL ETHER" in d or "B-AMINOETHYL" in d:
        return "明确范围外", "氨基醚", "氨基取代醚不属于公告列明产品"
    if "DOWANOL(TM) PPH" in d or "DOWANOL(TM) EP H" in d or "DOWANOL(TM) EPH" in d or "PHENYL" in d:
        return "明确范围外", "苯基醚", "苯基为芳基而非公告列明的单烷基醚"
    if "MONOBUTYL ETHERS OF ETHYLENE GLYCOL OR OF DIETHYLENE GLYCOL" in d:
        return "明确范围外", "乙二醇/二乙二醇单丁醚", "该两种单丁醚未列入2022年第3号公告具体产品清单，另有历史措施"
    if "DOW ANOL DPM" in d or "DOWANOL DPM" in d:
        return "明确范围外", "二丙二醇甲醚DPM", "公告P系列清单不含DPM，且仅列乙/丙/丁基醚"
    if "DPNB GLYCOL ETHER" in d:
        return "明确范围内", "二丙二醇丁醚DPnB", "公告具体产品清单明确列入二丙二醇丁醚"
    if "DPNP GLYCOL ETHER" in d:
        return "明确范围内", "二丙二醇丙醚DPnP", "公告具体产品清单明确列入二丙二醇丙醚"
    if re.search(r"\bPNB GLYCOL ETHER\b", d):
        return "明确范围内", "丙二醇丁醚PnB", "公告具体产品清单明确列入丙二醇丁醚"
    if re.search(r"\bPN\s*P GLYCOL ETHER\b", d) or re.search(r"\bPNP GLYCOL ETHER\b", d):
        return "明确范围内", "丙二醇丙醚PnP", "公告具体产品清单明确列入丙二醇丙醚"
    if "N-HEXYL GLYCOL" in d or "HEXYL CELLOSOL" in d or "ETHYLENE GLYCOL MONOHEXYL ETHER" in d:
        return "明确范围内", "乙二醇己醚EGHE", "公告具体产品清单明确列入乙二醇己醚"
    if "ISOPROPYL GLYCOL ETHER" in d or "ISO PROPYL GLYCOL ETHER" in d:
        return "范围待CAS", "异丙基乙二醇醚/异丙氧基醇", "中文/英文简称不能确认是否等同公告列明的丙醚；须CAS和结构式"
    if "MONOALKYLETHERS OF ETHYLENE GLYCOL OR OF DIETHYLENE GLYCOL" in d:
        return "范围待CAS", "通用单烷基醚", "通用品名可能包含公告列明产品，也可能是被排除的单丁醚；须CAS和完整品名"
    return "明确范围外", "其他", "货描未匹配公告具体产品清单"


COMMERCIAL_GROUPS = {
    8: "GE-PNB-20260419-23870", 10: "GE-PNB-20260419-23870",
    9: "GE-PNB-20260419-23720", 11: "GE-PNB-20260419-23720",
    24: "BE-IPGE-20260221-25555", 25: "BE-IPGE-20260221-25555",
    42: "US-EGHE-20251111-32216", 43: "US-EGHE-20251111-32216",
    63: "GE-PNB-20250920-23820", 64: "GE-PNB-20250920-23820",
    65: "GE-DPNB-20250919-16674", 66: "GE-DPNB-20250919-16674",
}


def extract_keys(description):
    compact = description.upper().replace(" ", "")
    containers = sorted(set(re.findall(r"\b[A-Z]{4}[ -]?\d{6,7}\b", description.upper())))
    seals = sorted(set(re.findall(r"(?:SEAL:?\s*|SEAL:\s*)([A-Z0-9-]{7,16})", description.upper())))
    lcs = sorted(set(re.findall(r"(?:L/C\s*(?:#|NO\.)?\s*:?)\s*([A-Z0-9-]{8,24})", description.upper())))
    pos = sorted(set(re.findall(r"\bPO\s*(?:#|NO\.)?\s*:?[ ]*([A-Z0-9-]{8,24})", description.upper())))
    sos = sorted(set(re.findall(r"\bSO\s*#?\s*([0-9]{7,16})", description.upper())))
    contracts = sorted(set(re.findall(r"SERVICE CONTRACT NO\.\s*([A-Z0-9-]{6,20})", description.upper())))
    refs = sorted(set(re.findall(r"SHIPPER'?S REFERENCE:\s*([A-Z0-9-]{8,20})", description.upper())))
    net_weights = sorted(set(re.findall(r"NET WEIGHT\s*:?\s*([0-9,.]+)\s*KG", description.upper())))
    ports = []
    for name in ("HUANGPU NEW PORT", "NANSHA NEW PORT"):
        if name in description.upper():
            ports.append(name)
    return {
        "container_numbers": ";".join(containers),
        "seal_numbers": ";".join(seals),
        "lc_numbers": ";".join(lcs),
        "po_numbers": ";".join(pos),
        "so_numbers": ";".join(sos),
        "service_contracts": ";".join(contracts),
        "shipper_references": ";".join(refs),
        "description_net_weight_kg": ";".join(net_weights),
        "ports_in_description": ";".join(ports),
    }


sig_counts = Counter(signature(row) for row in RAW)
first_group_row = {}
records = []
for idx, raw in enumerate(RAW, 1):
    item = dict(zip(FIELDS, raw))
    sig = signature(raw)
    scope, product, reason = classify(item["description"])
    group = COMMERCIAL_GROUPS.get(idx, f"ROW-{idx:03d}")
    if group not in first_group_row:
        first_group_row[group] = idx
    origin = item["platform_origin"]
    if scope == "明确范围内" and origin == "United States":
        route = "美国直接→中国"
        grade = "A-核税"
        route_reason = "受税来源、具体列明产品和美国生产商货描均可见；须查中国税款缴款书"
    elif scope == "明确范围内":
        route = f"{origin}→中国B腿"
        grade = "B+"
        route_reason = "非美国来源的具体列明产品B腿成立；美国A腿和中国原产申报未闭合"
    elif scope == "范围待CAS":
        route = f"{origin}→中国B腿（产品待核）"
        grade = "B/C"
        route_reason = "路线成立但产品是否落入公告范围尚须CAS/结构式"
    else:
        route = "范围外/不纳入本案路线"
        grade = "排除"
        route_reason = reason
    keys = extract_keys(item["description"])
    amount = number(item["amount_field"])
    rate = None
    if scope == "明确范围内":
        d = item["description"].upper()
        rate = 0.574 if "DOWANOL" in d or "CELLOSOLVE" in d else 0.653
    conditional_ad = amount * rate if amount is not None and rate is not None else None
    conditional_vat = conditional_ad * 0.13 if conditional_ad is not None else None
    record = {
        "record_id": f"GLY-{sig}-{idx:02d}",
        "query_row": idx,
        "visible_signature": sig,
        "visible_signature_count": sig_counts[sig],
        "possible_exact_visible_duplicate": sig_counts[sig] > 1,
        "commercial_group_id": group,
        "conservative_group_keep": idx == first_group_row[group],
        **item,
        "weight_num": number(item["weight_field"]),
        "quantity_num": number(item["quantity_field"]),
        "amount_num": amount,
        "scope_screen": scope,
        "product_class": product,
        "scope_reason": reason,
        "route": route,
        "evidence_grade": grade,
        "route_reason": route_reason,
        "conditional_ad_rate": rate,
        "conditional_ad_same_currency": conditional_ad,
        "conditional_vat_delta_same_currency": conditional_vat,
        "conditional_total_same_currency": (conditional_ad + conditional_vat) if conditional_ad is not None else None,
        **keys,
    }
    records.append(record)


def sum_field(rows, field):
    return sum((r[field] or 0) for r in rows)


unique_records = []
seen_sigs = set()
for r in records:
    if r["visible_signature"] not in seen_sigs:
        unique_records.append(r)
        seen_sigs.add(r["visible_signature"])

conservative_records = [r for r in unique_records if r["conservative_group_keep"]]
in_scope_unique = [r for r in unique_records if r["scope_screen"] == "明确范围内"]
pending_unique = [r for r in unique_records if r["scope_screen"] == "范围待CAS"]
excluded_unique = [r for r in unique_records if r["scope_screen"] == "明确范围外"]
in_scope_conservative = [r for r in conservative_records if r["scope_screen"] == "明确范围内"]
pending_conservative = [r for r in conservative_records if r["scope_screen"] == "范围待CAS"]
us_unique = [r for r in in_scope_unique if r["platform_origin"] == "United States"]
us_conservative = [r for r in in_scope_conservative if r["platform_origin"] == "United States"]
third_unique = [r for r in in_scope_unique if r["platform_origin"] != "United States"]
third_conservative = [r for r in in_scope_conservative if r["platform_origin"] != "United States"]

duplicate_groups = []
by_sig = defaultdict(list)
for r in records:
    by_sig[r["visible_signature"]].append(r)
for sig, rows in by_sig.items():
    if len(rows) > 1:
        duplicate_groups.append({
            "type": "可见字段完全重复",
            "group_id": sig,
            "occurrences": len(rows),
            "query_rows": [r["query_row"] for r in rows],
            "date": rows[0]["date"],
            "product": rows[0]["product_class"],
            "weight_field": rows[0]["weight_num"],
        })
by_group = defaultdict(list)
for r in unique_records:
    by_group[r["commercial_group_id"]].append(r)
for group, rows in by_group.items():
    if len(rows) > 1:
        duplicate_groups.append({
            "type": "疑似同一商业票/格式变体",
            "group_id": group,
            "occurrences": len(rows),
            "query_rows": [r["query_row"] for r in rows],
            "date": rows[0]["date"],
            "product": rows[0]["product_class"],
            "weight_field": rows[0]["weight_num"],
        })

    summary = {
    "as_of": "2026-08-13",
    "stage_status": "阶段审计；现有关键词GLYCOL ETHER五页全读，尚缺税号、20项具体品名/CAS/品牌全页查询及美国A腿",
    "query": {
        "inferred_condition": "GLYCOL ETHER，目的国中国，近一年（本地缺查询条件截图，按文件名与内容推断）",
        "page_counts": [len(json.loads(p.read_text(encoding="utf-8"))) for p in PAGE_PATHS],
        "raw_occurrences": len(records),
        "exact_visible_unique": len(unique_records),
        "conservative_commercial_groups": len(conservative_records),
        "date_min": min(r["date"] for r in records),
        "date_max": max(r["date"] for r in records),
        "page_integrity": "20+20+20+20+4；五页与all84逐行一致；无跨页漏接或错序",
    },
    "scope_screen_exact_unique": {
        "definite_in_scope": {
            "records": len(in_scope_unique),
            "weight_field_sum": sum_field(in_scope_unique, "weight_num"),
            "product_split": Counter(r["product_class"] for r in in_scope_unique),
        },
        "pending_cas": {
            "records": len(pending_unique),
            "weight_field_sum": sum_field(pending_unique, "weight_num"),
            "product_split": Counter(r["product_class"] for r in pending_unique),
        },
        "excluded": {
            "records": len(excluded_unique),
            "weight_field_sum": sum_field(excluded_unique, "weight_num"),
            "product_split": Counter(r["product_class"] for r in excluded_unique),
        },
    },
    "definite_in_scope_range": {
        "exact_unique": {"records": len(in_scope_unique), "weight_field_sum": sum_field(in_scope_unique, "weight_num")},
        "conservative_groups": {"records": len(in_scope_conservative), "weight_field_sum": sum_field(in_scope_conservative, "weight_num")},
        "us_direct": {
            "exact_unique_records": len(us_unique),
            "exact_unique_weight_field_sum": sum_field(us_unique, "weight_num"),
            "conservative_records": len(us_conservative),
            "conservative_weight_field_sum": sum_field(us_conservative, "weight_num"),
        },
        "third_country_b_leg": {
            "exact_unique_records": len(third_unique),
            "exact_unique_weight_field_sum": sum_field(third_unique, "weight_num"),
            "conservative_records": len(third_conservative),
            "conservative_weight_field_sum": sum_field(third_conservative, "weight_num"),
            "origin_split_exact": {
                k: {"records": len(v), "weight_field_sum": sum_field(v, "weight_num")}
                for k, v in ((origin, [r for r in third_unique if r["platform_origin"] == origin]) for origin in sorted(set(r["platform_origin"] for r in third_unique)))
            },
        },
    },
    "important_scope_correction": {
        "excluded_saudi_records": len([r for r in unique_records if r["product_class"] == "乙二醇/二乙二醇单丁醚"]),
        "excluded_saudi_weight_field_sum": sum_field([r for r in unique_records if r["product_class"] == "乙二醇/二乙二醇单丁醚"], "weight_num"),
        "reason": "沙特15条均为乙二醇/二乙二醇单丁醚，未列入2022年第3号公告20项清单；不得再列为本案第三国绕道候选",
    },
    "tax_rules": {
        "dow_ad_rate": 0.574,
        "all_other_us_ad_rate": 0.653,
        "import_vat_rate": 0.13,
        "dow_total_increment_coefficient": 0.574 * 1.13,
        "all_other_total_increment_coefficient": 0.653 * 1.13,
        "countervailing_measure": "2022年第4号终裁认定16.8%补贴率但决定暂不实施反补贴措施；本项目不得计算反补贴税",
    },
    "evidence_conclusion": {
        "proved": "美国直达中国的5条明确范围内记录、德国直达中国的13条明确范围内记录（均按可见字段精确去重）可逐票核查",
        "not_proved": "没有美国→德国A腿与德国→中国B腿的同批匹配，也没有中国端原产国、完税价格和税款缴款书；第三国绕道与少缴税均未证实",
    },
    "query_gaps": [
        "HS29094400、29094990→中国全页",
        "20项列明中文/英文品名及CAS全页",
        "DOWANOL PnB/DPnB/PnP/DPnP/TPnB、HEXYL CELLOSOLVE/CARBITOL等品牌牌号全页",
        "美国→德国及其他第三国A腿；中国进口报关单、原产地证和税款缴款书",
    ],
    "priority_shipment_keys": [
        {
            "date": "2026-02-06",
            "route": "Germany→China",
            "product": "BASF N-HEXYL GLYCOL / EGHE",
            "parties": "BASF SE→POLYSTAR (Shanghai) Trading",
            "platform_weight_field": 16770.0,
            "description_net_weight_kg": 14800.0,
            "container": "MSKU510989-6",
            "seal": "005610820",
            "port": "HUANGPU NEW PORT",
            "references": "BILL2512040; 6013458836/000010; 6013458613/10; 3020907988/000010; 260108270943; 2800193741",
            "reason": "字段最完整的德国B腿；BASF官方SDS显示德国供应主体和明确CAS112-25-4，但仍须生产批次/CO确认实际原产",
        },
        {
            "date": "2026-04-14",
            "route": "Germany→China",
            "product": "DOWANOL DPnB",
            "parties": "BDP International→Nanjing Golden Chemical",
            "platform_weight_field": 16674.0,
            "description_net_weight_kg": 15200.0,
            "lc": "NB023IL001813300",
            "so": "117659063",
            "po": "250703G-0544-SH1; HKES2026NZ003-2",
            "references": "0118631017; service contract 299593739; USCI913201057482034573",
            "reason": "可据LC/PO/SO反查合同、CO、生产商和中国税单",
        },
        {
            "date": "2026-04-14",
            "route": "Germany→China",
            "product": "DOWANOL DPnB",
            "parties": "BDP International→Dow Chemical (Shanghai)",
            "platform_weight_field": 16674.0,
            "description_net_weight_kg": 15200.0,
            "po": "4010344886",
            "references": "service contract 299593739; USCI91310000760867002K",
            "reason": "集团关联商业链成立；品牌/集团关系不能替代原产证明",
        },
        {
            "date": "2025-11-12",
            "route": "Germany→China",
            "product": "DOWANOL DPnB（两条）",
            "parties": "BDP International→Nanjing Golden Chemical",
            "platform_weight_field": 33356.0,
            "description_net_weight_kg": 30400.0,
            "lc": "NB023IL001494800; NB023IL001440900",
            "po": "HKES2025JH007; HKES2025JH004-2",
            "references": "0117981895; 0117901237; service contract 299593739",
            "reason": "两票有不同LC/PO/参考号，应分别调单，不得按相同产品合并",
        },
    ],
}


def write_csv(path, rows):
    if not rows:
        return
    with path.open("w", encoding="utf-8-sig", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=list(rows[0].keys()), extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


for src in [ALL_PATH, *PAGE_PATHS]:
    shutil.copy2(src, OUT_DIR / ("单烷基醚_易迅_" + src.name.replace("yixun_glycol_ether_", "")))

(OUT_DIR / "单烷基醚_易迅逐票标准化.json").write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8")
write_csv(OUT_DIR / "单烷基醚_易迅逐票标准化.csv", records)
write_csv(OUT_DIR / "单烷基醚_明确范围内重点记录.csv", in_scope_unique)
write_csv(OUT_DIR / "单烷基醚_第三国B腿重点记录.csv", third_unique + pending_unique)
write_csv(OUT_DIR / "单烷基醚_重复与疑似同票审计.csv", duplicate_groups)
(OUT_DIR / "单烷基醚_全量阶段审计.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2, default=dict), encoding="utf-8")

print(json.dumps(summary, ensure_ascii=False, indent=2, default=dict))
