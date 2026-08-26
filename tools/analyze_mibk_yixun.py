"""Normalize, deduplicate and risk-screen the item-25 MIBK Yixun pools."""

from __future__ import annotations

import csv
import hashlib
import html
import json
import math
import re
import unicodedata
from collections import Counter, defaultdict
from datetime import date, datetime
from pathlib import Path


ROOT = Path(r"D:\易迅数据\反倾销税深度分析报告\25_甲基异丁基酮")
INPUTS = {
    "NAME_FULL": ROOT / "MIBK_易迅_METHYL_ISOBUTYL_KETONE_近一年_API全量.json",
    "HS291413": ROOT / "MIBK_易迅_HS291413_近一年_API全量.json",
    "NAME_4M2P": ROOT / "MIBK_易迅_4-METHYL-2-PENTANONE_近一年_API全量.json",
    "NAME_MIBK": ROOT / "MIBK_易迅_MIBK_近一年_API全量.json",
    "CAS_CHINA_WIDE": ROOT / "MIBK_易迅_CAS108-10-1_HS291413_中国_测试1页.json",
}

FIELDS = [
    "SOURCE", "EXP_IMP", "DATE", "HS_CODE", "GOODS_DESC", "CONSIGNEE", "SHIPPER",
    "WEIGHT", "WEIGHT_UNIT", "QUANTITY", "QUANTITY_UNIT", "VALUE", "VALUE_UNIT",
    "DEST_COUNTRY_TC_KEYWORD", "ORIGIN_COUNTRY_TC_KEYWORD",
]

TARGET_RE = re.compile(
    r"METHYL\s*ISOBUTYL\s*KETON(?:E)?|ISOBUTYL\s*METHYL\s*KETON(?:E)?|"
    r"4\s*[- ]?METHYL\s*[- ]?2\s*[- ]?PENTANON(?:E)?|(?<![A-Z])MIBK(?![A-Z])|"
    r"METHYL\s*ISOBUTYL\s*CETONA|METIL\s*ISOBUTIL\s*CETONA|HEXONE",
    re.I,
)
CAS_RE = re.compile(r"(?<!\d)108\s*[-/]\s*10\s*[-/]\s*1(?!\d)")
PEROXIDE_RE = re.compile(r"PEROX|MIKP|AKPEROX|TRIGONOX|BUTANOX", re.I)
OTHER_CHEM_RE = re.compile(
    r"4\s*[- ]?HYDROXY\s*[- ]?4\s*[- ]?METHYL\s*[- ]?2\s*[- ]?PENTANON(?:E)?|"
    r"DIACETONE\s+ALCOHOL|CAS\s*[:#]?\s*123\s*[-/]\s*42\s*[-/]\s*2|MIBK\s*[- ]?FREE",
    re.I,
)
MIXTURE_RE = re.compile(
    r"THINNER|PAINT|INK|COATING|ADHESIVE|PRIMER|HARDENER|CATALYST|MIXTURE|PREPARATION|"
    r"SOLVENT\s+BLEND|SOLUTION|COMPOSITION|RESIN|LACQUER|VARNISH|ENAMEL|S[ƠO]N|DUNG\s*M[ÔO]I|"
    r"TP\s*:|COMPONENT|CONTAIN|\bMIX\b|\bBLEND\b|PHENOL|KEO\b|HỢP\s*CHẤT|"
    r"MỰC\b|DUNG\s*DỊCH|CHẤT\s*KẾT\s*DÍNH|CHẤT\s*XỬ\s*LÝ|SURFACE\s*TREAT",
    re.I,
)
LAB_RE = re.compile(r"LAB|REAGENT|ANALYSIS|ANALYTICAL|STANDARD|SAMPLE|SIGMA|MERCK|SCHARLAB|AR GRADE|ACS", re.I)


def clean(value: object) -> str:
    if value is None:
        return ""
    text = html.unescape(unicodedata.normalize("NFKC", str(value)))
    text = re.sub(r"<[^>]*>", "", text)
    return re.sub(r"\s+", " ", text).strip()


def canonical_country(value: str) -> str:
    text = re.sub(r"[^A-Z]", "", clean(value).upper())
    mapping = {
        "CHINA": "CHINA", "PEOPLESREPUBLICOFCHINA": "CHINA", "PRCHINA": "CHINA",
        "SOUTHKOREA": "SOUTH KOREA", "KOREA": "SOUTH KOREA",
        "REPUBLICOFKOREA": "SOUTH KOREA", "KOREAREPUBLICOF": "SOUTH KOREA",
        "JAPAN": "JAPAN", "SOUTHAFRICA": "SOUTH AFRICA", "REPUBLICOFSOUTHAFRICA": "SOUTH AFRICA",
        "VIETNAM": "VIETNAM", "MEXICO": "MEXICO", "INDIA": "INDIA", "SINGAPORE": "SINGAPORE",
        "THAILAND": "THAILAND", "MALAYSIA": "MALAYSIA", "INDONESIA": "INDONESIA",
        "TAIWAN": "TAIWAN", "PHILIPPINES": "PHILIPPINES", "UNITEDSTATES": "UNITED STATES",
        "USA": "UNITED STATES", "GERMANY": "GERMANY", "BELGIUM": "BELGIUM",
        "NETHERLANDS": "NETHERLANDS", "FRANCE": "FRANCE", "SPAIN": "SPAIN",
        "BANGLADESH": "BANGLADESH", "PAKISTAN": "PAKISTAN", "BRAZIL": "BRAZIL",
    }
    return mapping.get(text, clean(value).upper())


def company_key(value: str) -> str:
    text = clean(value).upper()
    text = re.sub(r"\b(CO|COMPANY|LTD|LIMITED|INC|INCORPORATED|CORP|CORPORATION|LLC|PLC|PTE|PRIVATE|S A|SA|SAS|GMBH|BV|NV)\b", " ", text)
    return re.sub(r"[^A-Z0-9]", "", text)


def parse_date(value: str) -> date | None:
    try:
        return datetime.strptime(value[:10], "%Y-%m-%d").date()
    except Exception:
        return None


def number(value: str) -> float | None:
    text = clean(value).replace(",", "")
    if not text:
        return None
    try:
        return float(text)
    except ValueError:
        return None


def record_signature(row: dict[str, str]) -> str:
    raw = "\x1f".join(clean(row.get(k)) for k in FIELDS)
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:24]


def classify(row: dict[str, str]) -> tuple[str, str]:
    desc = clean(row.get("GOODS_DESC"))
    hs = re.sub(r"\D", "", clean(row.get("HS_CODE")))
    target = bool(TARGET_RE.search(desc) or CAS_RE.search(desc))
    cas_numbers = set(re.findall(r"(?<!\d)(\d{2,7})\s*[-/]\s*(\d{2})\s*[-/]\s*(\d)(?!\d)", desc))
    if PEROXIDE_RE.search(desc):
        return "范围外-过氧化物", "货描指向MIBK过氧化物/引发剂，不是甲基异丁基酮单体"
    if OTHER_CHEM_RE.search(desc):
        return "范围外-相邻化学品/无MIBK配方", "货描指向双丙酮醇、MIBK-free产品或其他相邻化学品"
    explicit_mix = bool(MIXTURE_RE.search(desc))
    multi_cas = len(cas_numbers) >= 2
    if target and (explicit_mix or multi_cas):
        if hs.startswith("291413"):
            return "范围待核-组合货描/混合物但HS命中", "货描含配方、混合物或并列化学品特征；虽命中291413，仍需逐项成分和纯度"
        if not hs:
            return "范围待核-组合货描且税号空", "货描含MIBK与其他成分/化学品，整票重量不能直接视作MIBK净重"
        return "范围外-含MIBK配方/混合物", "货描含配方、涂料、稀释剂或混合物特征且税号不为291413"
    if target and LAB_RE.search(desc):
        return "范围内化学品-试剂/样品", "化学名称明确；商业规模低，仍需核纯度、用途和中国归类"
    if target and hs.startswith("291413"):
        return "范围内明确", "化学名称/别名与291413税号同时命中"
    if target and not hs:
        return "范围待归类-名称明确税号空", "化学名称明确但平台无税号"
    if target:
        return "范围待核-名称明确税号冲突", f"化学名称明确但平台税号为{hs or '空'}"
    if hs.startswith("291413"):
        return "范围待核-HS命中名称不明", "291413命中，但货描未明确MIBK别名"
    return "范围外/假阳性", "未同时满足MIBK名称或291413范围条件"


def desc_tokens(value: str) -> set[str]:
    words = re.findall(r"[A-Z0-9]{2,}", clean(value).upper())
    stop = {"METHYL", "ISOBUTYL", "KETONE", "MIBK", "4", "2", "PENTANONE", "NEW", "100", "PRODUCT"}
    return {w for w in words if w not in stop}


def similar_amount(a: dict[str, str], b: dict[str, str]) -> tuple[float, str]:
    candidates: list[tuple[float, str]] = []
    for field, unit_field in (("WEIGHT", "WEIGHT_UNIT"), ("QUANTITY", "QUANTITY_UNIT")):
        av, bv = number(a.get(field, "")), number(b.get(field, ""))
        au, bu = clean(a.get(unit_field, "")).upper(), clean(b.get(unit_field, "")).upper()
        if av and bv and av > 0 and bv > 0 and (not au or not bu or au == bu):
            ratio = min(av, bv) / max(av, bv)
            candidates.append((ratio, field.lower()))
    return max(candidates, default=(0.0, ""))


def write_csv(path: Path, rows: list[dict], fields: list[str]) -> None:
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def main() -> int:
    raw_occurrences: list[dict] = []
    query_counts: dict[str, int] = {}
    query_completeness: dict[str, dict] = {}
    for query_name, path in INPUTS.items():
        payload = json.loads(path.read_text(encoding="utf-8"))
        rows = [row for page in payload["pages"] for row in page["rows"]]
        query_counts[query_name] = len(rows)
        query_meta = payload.get("query", {})
        query_completeness[query_name] = {
            "reported_total": query_meta.get("total"),
            "reported_total_pages": query_meta.get("total_pages"),
            "fetched_pages": len(payload.get("pages", [])),
            "fetched_rows": len(rows),
            "complete": (
                query_meta.get("total") == len(rows)
                and query_meta.get("total_pages") == len(payload.get("pages", []))
            ),
        }
        for page in payload["pages"]:
            for pos, source_row in enumerate(page["rows"], 1):
                normalized = {field: clean(source_row.get(field)) for field in FIELDS}
                normalized.update({
                    "api_id": clean(source_row.get("id")),
                    "api_index": clean(source_row.get("index")),
                    "api_rowkey": clean(source_row.get("rowkey")),
                    "query_name": query_name,
                    "query_page": page["page"],
                    "query_position": pos,
                })
                normalized["record_id"] = record_signature(normalized)
                raw_occurrences.append(normalized)

    grouped: dict[str, list[dict]] = defaultdict(list)
    for row in raw_occurrences:
        grouped[row["record_id"]].append(row)

    records: list[dict] = []
    for rid, versions in grouped.items():
        row = dict(versions[0])
        row["query_memberships"] = "|".join(sorted({v["query_name"] for v in versions}))
        row["query_occurrences"] = len(versions)
        row["origin_norm"] = canonical_country(row["ORIGIN_COUNTRY_TC_KEYWORD"])
        row["destination_norm"] = canonical_country(row["DEST_COUNTRY_TC_KEYWORD"])
        row["consignee_key"] = company_key(row["CONSIGNEE"])
        row["shipper_key"] = company_key(row["SHIPPER"])
        row["scope_class"], row["scope_reason"] = classify(row)
        row["taxed_origin"] = "是" if row["origin_norm"] in {"SOUTH KOREA", "JAPAN", "SOUTH AFRICA"} else "否"
        row["route_class"] = "其他"
        if row["destination_norm"] == "CHINA":
            row["route_class"] = "受税来源直达中国" if row["taxed_origin"] == "是" else "第三国/非受税来源对华B腿"
        elif row["taxed_origin"] == "是":
            row["route_class"] = "受税来源至第三国A腿"
        records.append(row)
    records.sort(key=lambda r: (r["DATE"], r["record_id"]), reverse=True)

    in_scope = lambda r: r["scope_class"].startswith("范围内") or r["scope_class"].startswith("范围待")
    china = [r for r in records if r["destination_norm"] == "CHINA" and in_scope(r)]
    direct = [r for r in china if r["taxed_origin"] == "是"]
    blegs = [r for r in china if r["taxed_origin"] == "否"]
    alegs = [r for r in records if r["taxed_origin"] == "是" and r["destination_norm"] != "CHINA" and in_scope(r)]

    a_by_dest: dict[str, list[dict]] = defaultdict(list)
    for row in alegs:
        a_by_dest[row["destination_norm"]].append(row)

    matches: list[dict] = []
    for b in blegs:
        bd = parse_date(b["DATE"])
        if not bd or not b["origin_norm"]:
            continue
        scored: list[tuple[float, dict]] = []
        for a in a_by_dest.get(b["origin_norm"], []):
            ad = parse_date(a["DATE"])
            if not ad:
                continue
            delta = (bd - ad).days
            if delta < 0 or delta > 180:
                continue
            entity_match = bool(a["consignee_key"] and a["consignee_key"] == b["shipper_key"])
            at, bt = desc_tokens(a["GOODS_DESC"]), desc_tokens(b["GOODS_DESC"])
            jaccard = len(at & bt) / len(at | bt) if at | bt else 1.0
            ratio, amount_field = similar_amount(a, b)
            same_hs = re.sub(r"\D", "", a["HS_CODE"])[:6] == re.sub(r"\D", "", b["HS_CODE"])[:6] != ""
            score = (6 if entity_match else 0) + (3 if jaccard >= 0.7 else 1 if jaccard >= 0.35 else 0)
            score += 2 if ratio >= 0.8 else 1 if ratio >= 0.5 else 0
            score += 2 if delta <= 30 else 1 if delta <= 90 else 0
            score += 1 if same_hs else 0
            if score >= 3:
                scored.append((score, {
                    "evidence_score": score,
                    "days_between": delta,
                    "entity_exact_match": "是" if entity_match else "否",
                    "description_jaccard": round(jaccard, 4),
                    "amount_similarity": round(ratio, 4),
                    "amount_field": amount_field,
                    "a_record_id": a["record_id"], "a_date": a["DATE"],
                    "a_origin": a["origin_norm"], "a_destination": a["destination_norm"],
                    "a_consignee": a["CONSIGNEE"], "a_shipper": a["SHIPPER"],
                    "a_desc": a["GOODS_DESC"], "a_hs": a["HS_CODE"],
                    "a_weight": a["WEIGHT"], "a_weight_unit": a["WEIGHT_UNIT"],
                    "a_quantity": a["QUANTITY"], "a_quantity_unit": a["QUANTITY_UNIT"],
                    "b_record_id": b["record_id"], "b_date": b["DATE"],
                    "b_origin": b["origin_norm"], "b_destination": b["destination_norm"],
                    "b_consignee": b["CONSIGNEE"], "b_shipper": b["SHIPPER"],
                    "b_desc": b["GOODS_DESC"], "b_hs": b["HS_CODE"],
                    "b_weight": b["WEIGHT"], "b_weight_unit": b["WEIGHT_UNIT"],
                    "b_quantity": b["QUANTITY"], "b_quantity_unit": b["QUANTITY_UNIT"],
                    "assessment": "模式线索，须用提单/柜号/批号、生产记录、原产地证和中国税单闭环",
                }))
        for _, match in sorted(scored, key=lambda x: (-x[0], x[1]["days_between"]))[:5]:
            matches.append(match)

    base_fields = [
        "record_id", "query_memberships", "query_occurrences", *FIELDS,
        "origin_norm", "destination_norm", "scope_class", "scope_reason", "taxed_origin", "route_class",
        "api_id", "api_index", "api_rowkey",
    ]
    write_csv(ROOT / "MIBK_易迅逐票标准化_联合去重.csv", records, base_fields)
    write_csv(ROOT / "MIBK_对华范围候选.csv", china, base_fields)
    write_csv(ROOT / "MIBK_受税来源直达中国.csv", direct, base_fields)
    write_csv(ROOT / "MIBK_第三国对华B腿.csv", blegs, base_fields)
    write_csv(ROOT / "MIBK_受税来源至第三国A腿.csv", alegs, base_fields)
    match_fields = list(matches[0].keys()) if matches else ["evidence_score", "assessment"]
    write_csv(ROOT / "MIBK_AB腿候选匹配.csv", matches, match_fields)

    entity_rows: list[dict] = []
    for route, route_rows in (("受税来源直达中国", direct), ("第三国/非受税来源对华B腿", blegs), ("受税来源至第三国A腿", alegs)):
        counter: dict[tuple[str, str, str, str, str], dict] = defaultdict(
            lambda: {"records": 0, "weight_sum": 0.0, "quantity_sum": 0.0, "value_sum": 0.0}
        )
        for r in route_rows:
            key = (
                r["CONSIGNEE"], r["SHIPPER"], r["WEIGHT_UNIT"],
                r["QUANTITY_UNIT"], r["VALUE_UNIT"],
            )
            counter[key]["records"] += 1
            for field, out in (("WEIGHT", "weight_sum"), ("QUANTITY", "quantity_sum"), ("VALUE", "value_sum")):
                value = number(r[field])
                if value is not None:
                    counter[key][out] += value
        for (consignee, shipper, weight_unit, quantity_unit, value_unit), agg in counter.items():
            entity_rows.append({
                "route": route, "consignee": consignee, "shipper": shipper,
                "weight_unit": weight_unit, "quantity_unit": quantity_unit,
                "value_unit": value_unit, **agg,
            })
    entity_rows.sort(key=lambda x: (x["route"], -x["records"]))
    write_csv(
        ROOT / "MIBK_实体汇总.csv", entity_rows,
        ["route", "consignee", "shipper", "records", "weight_sum", "weight_unit",
         "quantity_sum", "quantity_unit", "value_sum", "value_unit"],
    )

    exact_duplicates = len(raw_occurrences) - len(records)
    summary = {
        "item": 25,
        "product": "甲基异丁基（甲）酮 MIBK",
        "date_range": ["2025-08-14", "2026-08-14"],
        "query_raw_counts": query_counts,
        "query_completeness": query_completeness,
        "raw_occurrences": len(raw_occurrences),
        "union_unique_records": len(records),
        "cross_query_and_internal_duplicate_occurrences": exact_duplicates,
        "scope_class_counts": dict(Counter(r["scope_class"] for r in records)),
        "china_scope_candidates": len(china),
        "taxed_origin_direct_china": len(direct),
        "third_or_nontaxed_origin_china_blegs": len(blegs),
        "taxed_origin_to_third_alegs": len(alegs),
        "ab_candidate_matches": len(matches),
        "ab_exact_entity_matches": sum(m["entity_exact_match"] == "是" for m in matches),
        "china_origin_counts": dict(Counter(r["origin_norm"] for r in china)),
        "a_destination_counts": dict(Counter(r["destination_norm"] for r in alegs)),
        "a_origin_counts": dict(Counter(r["origin_norm"] for r in alegs)),
        "a_scope_class_counts": dict(Counter(r["scope_class"] for r in alegs)),
        "limitations": [
            "易迅数量、重量和金额字段沿用平台原值；单位/币种按各行字段，不作跨国机械合计。",
            "平台原产国字段不是中国法定原产地申报；是否缴纳反倾销税须核中国报关单和税款缴款书。",
            "A/B算法只形成调单线索，不能替代提单、柜号、批号和第三国实质生产证据。",
            "CAS 108-10-1 查询因平台拆词产生100897条/505页噪声且超过4万展示上限，未宣称CAS查询全量。",
        ],
    }
    (ROOT / "MIBK_易迅审计摘要.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")

    qa = {
        "all_pass": all(q["complete"] for q in query_completeness.values()),
        "checks": {
            "query_pages_complete": all(q["complete"] for q in query_completeness.values()),
            "raw_equals_query_sum": len(raw_occurrences) == sum(query_counts.values()),
            "union_plus_overlap_equals_raw": len(records) + exact_duplicates == len(raw_occurrences),
            "china_route_partition": len(china) == len(direct) + len(blegs),
            "single_priority_ab_match": len(matches) == 1,
        },
        "counts": {
            "raw_occurrences": len(raw_occurrences), "union_unique": len(records),
            "china_scope_candidates": len(china), "direct": len(direct),
            "blegs": len(blegs), "alegs": len(alegs), "matches": len(matches),
        },
    }
    qa["all_pass"] = qa["all_pass"] and all(qa["checks"].values())
    (ROOT / "MIBK_QA校验.json").write_text(json.dumps(qa, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
