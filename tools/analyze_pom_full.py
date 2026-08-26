from __future__ import annotations

import csv
import hashlib
import json
import re
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path
from typing import Any


OUT_DIR = Path(r"D:\易迅数据\反倾销税深度分析报告\06_共聚聚甲醛（POM）")

QUERY_FILES = {
    "HS390710": "POM_易迅_HS390710_中国_2年_全1398条.json",
    "POM": "POM_易迅_关键词POM_中国_2年_全2920条.json",
    "HOSTAFORM": "POM_易迅_HOSTAFORM_中国_2年_全443条.json",
    "DELRIN": "POM_易迅_DELRIN_中国_2年_全1028条.json",
    "DURACON": "POM_易迅_DURACON_中国_2年_全75条.json",
    "TENAC": "POM_易迅_TENAC_中国_2年_全3条.json",
    "CELCON": "POM_易迅_CELCON_中国_2年_全294条.json",
    "POLYACETAL COPOLYMER": "POM_易迅_POLYACETAL_COPOLYMER_中国_2年_全1条.json",
}

HEADERS = [
    "数据源", "进出口", "日期", "HS编码", "商品描述", "采购商", "供应商",
    "重量", "数量", "金额", "目的国/地区", "原产国/地区", "操作",
]

TAXED_ORIGINS = {
    "UNITED STATES", "USA", "U.S.A.", "GERMANY", "NETHERLANDS", "BELGIUM",
    "FRANCE", "ITALY", "SPAIN", "AUSTRIA", "EUROPEAN UNION", "JAPAN",
    "TAIWAN, PROVINCE OF CHINA", "TAIWAN", "TAIWAN, CHINA",
}
EU_ORIGINS = {
    "GERMANY", "NETHERLANDS", "BELGIUM", "FRANCE", "ITALY", "SPAIN",
    "AUSTRIA", "EUROPEAN UNION", "POLAND", "CZECH REPUBLIC", "HUNGARY",
}


def s(value: Any) -> str:
    return "" if value is None else str(value).strip()


def f(value: Any) -> float | None:
    text = s(value).replace(",", "")
    if not text:
        return None
    try:
        return float(text)
    except ValueError:
        return None


def normalized_text(value: Any) -> str:
    return re.sub(r"\s+", " ", s(value)).strip().upper()


def exact_key(row: list[Any]) -> str:
    return "\x1f".join(normalized_text(v) for v in row[:12])


def row_hash(key: str) -> str:
    return hashlib.sha1(key.encode("utf-8")).hexdigest()[:14]


def date_phase(date: str) -> str:
    if not date:
        return "日期缺失"
    if date < "2025-01-24":
        return "临时措施前"
    if date < "2025-05-19":
        return "保证金期"
    return "终裁实施后"


def is_mainland(destination: str) -> bool:
    return normalized_text(destination) == "CHINA"


def origin_code(description: str) -> str:
    hits = re.findall(r"#&\s*([A-Z]{2})\b", description.upper())
    return hits[-1] if hits else ""


def marker_country(code: str) -> str:
    return {
        "CN": "CHINA", "VN": "VIETNAM", "DE": "GERMANY", "US": "UNITED STATES",
        "JP": "JAPAN", "NL": "NETHERLANDS", "BE": "BELGIUM", "FR": "FRANCE",
        "IT": "ITALY", "AT": "AUSTRIA", "TW": "TAIWAN, PROVINCE OF CHINA",
        "DK": "DENMARK", "IN": "INDIA", "MX": "MEXICO", "PH": "PHILIPPINES",
    }.get(code, "")


def brand_grade(description: str) -> str:
    u = normalized_text(description)
    patterns = [
        r"HOSTAFORM\s+([A-Z0-9][A-Z0-9\-/ ]{1,20})",
        r"CELCON\s+([A-Z0-9][A-Z0-9\-/ ]{1,20})",
        r"DURACON\s+([A-Z0-9][A-Z0-9\-/ ]{1,20})",
        r"TENAC-C\s+([A-Z0-9][A-Z0-9\-/ ]{1,20})",
        r"TENAC\s+([A-Z0-9][A-Z0-9\-/ ]{1,20})",
        r"DELRIN(?:\(R\))?\s+([A-Z0-9][A-Z0-9\-/ ]{1,20})",
        r"IUPITAL\s+([A-Z0-9][A-Z0-9\-/ ]{1,20})",
        r"POM\s+([A-Z0-9][A-Z0-9\-/ ]{1,20})",
    ]
    for pat in patterns:
        m = re.search(pat, u)
        if m:
            return re.split(r"\b(?:NATURAL|BLACK|WHITE|RED|BLUE|GREEN|25KG|BAG|RESIN|HANG|NEW)\b", m.group(1))[0].strip()[:30]
    return ""


def classify_scope(description: str, hs: str) -> tuple[str, str, bool]:
    u = normalized_text(description)
    h = re.sub(r"\D", "", s(hs))

    if not u:
        return "信息不足", "商品描述为空，无法确认是否为初级共聚POM", False

    if re.search(r"\bPOM\s?POM\b|POMPOM|POM POM|FUR POM|POM BALL|POM-POM", u):
        return "误匹配", "POM/POMPOM为毛球或装饰语义，并非聚甲醛", False

    recycled = ["RECYCLED", "RECYCLE", "TÁI SINH", "TAI SINH", "REPROCESSED", "REGRIND", "SCRAP", "WASTE"]
    if any(x in u for x in recycled):
        return "再生POM", "货描明示再生/回收/废料，原则上不按本案初级共聚料计", False

    if "DELRIN" in u or (re.search(r"\bTENAC\b", u) and "TENAC-C" not in u):
        return "均聚POM", "Delrin或TENAC（非TENAC-C）通常为均聚POM，本案明确排除均聚POM", False

    raw_form_terms = [
        "RESIN", "PELLET", "GRANULE", "PRIMARY FORM", "RAW MATERIAL", "POWDER", "PULVER",
        "HẠT NHỰA", "HAT NHUA", "NGUYÊN SINH", "NGUYEN SINH", "POLYACETAL COPOLYMER",
    ]
    if h and h != "0" and not h.startswith("390710") and not any(x in u for x in raw_form_terms):
        return "POM制品/零件", "非390710税号且未见树脂/粒子/初级形状表述，按制品或误归类记录处理", False

    product_terms = [
        "GEAR", "ROLLER", "BUSH", "GUIDE", "CLIP", "HOUSING", "PLASTIC PART", "PLASTIC COMPONENT",
        "INJECTION MOULD", "INJECTION MOLD", "TUBE", "VALVE", "SEAL", "HANDLE", "ZIPPER",
        "RING", "WASHER", "BRACKET", "MACHINED", "SHEET", "ROD", "PLATE", "FILM", "PARTS",
        "ДЕТАЛ", "CHI TIẾT", "LINH KIỆN", "BÁNH RĂNG", "SAN PHAM", "SẢN PHẨM",
    ]
    if (h and not h.startswith("390710")) and any(x in u for x in product_terms):
        return "POM制品/零件", "非390710初级形状且货描为零件、板棒或制品", False

    if "LW15EWX" in u:
        return "改性/范围外", "Celanese手册称特殊蜡改性且熔点约173℃，不满足160≤T<170℃", False
    if "LW90-S2" in u or "CF2001" in u:
        return "改性/范围外", "Celcon LW90-S2/CF2001为硅油或滑动改性牌号，需TDS复核，暂排除", False
    if any(x in u for x in ["MT12R01", "MT24F01"]):
        return "改性/范围外", "医疗级滑动/PTFE改性Hostaform牌号，初步排除", False
    if "MT12U03" in u:
        return "性能边界外", "公开资料熔点约170℃，不满足公告T<170℃", False

    modified_terms = [
        "GLASS FIB", "%GF", " GF", "PTFE", "CARBON FIB", "CONDUCTIVE", "ESD", "ANTISTATIC",
        "MASTERBATCH", "MASTER BATCH", "COLORBATCH", "COLOURBATCH", "COLOR CONCENTRATE",
        "IMPACT MODIFIED", "ELASTOMER", "LOW FRICTION", "LUBRICATED", "SLIDING", "UV STABIL",
        "FLAME RETARD", "MINERAL FILLED", "TALC", "MOLYBDENUM", "MO2", "BLACK MB", "MB1000",
    ]
    if any(x in u for x in modified_terms):
        return "改性POM", "货描含增强、填充、润滑、导电、色母或其他改性特征，本案原则上排除改性POM", False

    colored = re.search(r"\b(BLACK|RED|BLUE|GREEN|YELLOW|ORANGE|GREY|GRAY|COLOR(?:ED)?|COLOURED)\b", u)
    if colored and not any(x in u for x in ["C52021 NATURAL", "C9021 NATURAL", "M90 NATURAL", "M25 NATURAL"]):
        return "着色/改性待核", "货描为着色牌号；需TDS确认是否属于公告所称改性POM", False

    if "C13031" in u:
        return "性能边界外", "Celanese手册列熔点约170℃，公告要求T<170℃", False
    if any(x in u for x in ["C9021 SW", "C9021 TF", "XGC25", "GV1/", "C9021 AW", "EC140XF", "ECXF"]):
        return "改性/范围外", "牌号具有特殊添加剂、玻纤、导电或耐磨改性特征", False

    strong_candidate = [
        "POLYACETAL COPOLYMER", "POLYOXYMETHYLENE COPOLYMER", "POM COPOLYMER",
        "C52021 NATURAL", "C 52021 NATURAL", "C9021 ECO-B NATURAL", "C 9021 ECO-B NATURAL",
        "CELCON M90 NATURAL", "CELCON M25 NATURAL", "TENAC-C EX352",
        "COPOLIMERO DE POLIACETAL", "COPOLYMER-TYPE ACETAL", "POM PELLET", "POM GRANULE",
        "POLYACETALS IN PRIMARY FORMS", "POLYACETAL RESIN", "RESIN, POLYACETAL",
    ]
    if any(x in u for x in strong_candidate):
        return "基础共聚POM候选", "货描显示基础共聚POM/天然标准料；仍须COA验证全部化学结构及性能指标", True

    if any(x in u for x in ["HOSTAFORM", "CELCON", "DURACON", "TENAC-C", "IUPITAL", "LUPITAL"]):
        return "牌号范围待核", "品牌/牌号属于POM体系，但是否共聚、未改性及性能达标需TDS/COA", True

    if h.startswith("390710") or re.search(r"\b(POM|POLYACETAL|POLYOXYMETHYLENE|POLYFORMALDEHYDE)\b", u):
        return "通用品名范围待核", "税号或通用品名覆盖均聚、共聚、改性等多种产品，不能仅凭HS/简称认定", True

    if any(x in u for x in product_terms):
        return "POM制品/零件", "货描为零件、板棒或其他制品，并非初级形状共聚POM", False

    return "非POM/信息不足", "未见足够POM产品特征或可能为税号误配", False


def rate_for(origin: str, description: str, supplier: str) -> tuple[float | None, str]:
    o = normalized_text(origin)
    u = normalized_text(description + " " + supplier)
    if o in {"UNITED STATES", "USA", "U.S.A."}:
        return 74.9, "美国公司终裁税率74.9%"
    if o in EU_ORIGINS:
        return 34.5, "欧盟公司终裁税率34.5%"
    if o == "JAPAN":
        if "ASAHI" in u or "TENAC" in u:
            return 24.5, "旭化成终裁税率24.5%（按牌号/实体推定，待生产商确认）"
        return 35.5, "日本宝理/其他日本公司终裁税率35.5%（待生产商确认）"
    if "TAIWAN" in o:
        if "POLYPLASTICS" in u or "DURACON" in u:
            return 3.8, "台湾宝理终裁税率3.8%（待生产商确认）"
        if "FORMOSA" in u or "FORMOCON" in u:
            return 4.0, "台湾塑胶终裁税率4.0%（待生产商确认）"
        return 32.6, "其他台湾地区公司终裁税率32.6%"
    return None, "非受税原产地字段或原产地待核"


def route_assessment(rec: dict[str, Any]) -> tuple[str, str, str, str]:
    d = rec["description_u"]
    origin = rec["origin_u"]
    phase = rec["phase"]
    destination = rec["destination_u"]
    marker = rec["origin_marker"]
    scope_candidate = rec["scope_candidate"]

    if destination != "CHINA":
        return "排除", "D", "筛选误纳非中国大陆目的地", "不纳入中国进口风险统计"
    if phase == "临时措施前":
        return "历史基线", "C", "临时措施前记录，仅用于供应链基线", "保留用于同主体/同牌号历史比对"

    acumen = "C52021" in d and "ACUMEN ENGINEERING" in rec["buyer_u"] + rec["supplier_u"]
    if acumen:
        return "高", "B+", "同品名、主体、重量、数量、金额出现德国/菲律宾原产字段切换；初步在措施范围", "调中国报关单、原产地证、批号、提单及税款缴款书"

    if "TENAC-C EX352" in d and marker == "JP" and origin == "VIETNAM":
        return "高", "B+", "越南出口货描明确#&JP而平台原产字段为Vietnam；共聚牌号范围待COA", "调越南出口单、中国进口申报、COA和日本生产批号"

    if origin == "SAUDI ARABIA" and any(x in d for x in ["POLYACETAL", "POM 90S", "POM 140S"]):
        return "中高", "B", "措施后沙特来源集中放量/新出现，需核实真实生产厂与实质加工", "调生产商证明、工厂产能、COA、House B/L和中国进口人"

    if phase != "临时措施前" and origin in TAXED_ORIGINS and scope_candidate:
        return "高", "A-/B+", "受税来源直接对华且为范围候选；核心是是否已按正确企业税率缴税", "核中国申报规格、生产商、反倾销税与进口增值税缴款书"

    taxed_marker = marker in {"DE", "US", "JP", "NL", "BE", "TW", "FR", "IT", "AT"}
    if phase != "临时措施前" and origin not in TAXED_ORIGINS and taxed_marker:
        if scope_candidate:
            return "高", "B+", f"第三国出口货描保留受税来源标记#&{marker}；为具体B腿线索，尚缺中国法定原产地申报", "核原产地证、生产批号、A腿提单及中国税单"
        return "中", "B", f"第三国出口货描保留#&{marker}，但牌号初步范围外/待核", "先用TDS/COA确认产品范围，再核单证"

    if phase != "临时措施前" and origin not in TAXED_ORIGINS and scope_candidate:
        return "中", "B-/C+", "非受税第三国来源且为范围候选，但未见受税来源批号/箱号闭环", "核生产商、工厂所在地、COA、原产地证及上游A腿"

    if phase != "临时措施前" and origin in TAXED_ORIGINS:
        return "中", "B", "受税来源记录但牌号可能均聚/改性/制品；需先核范围", "以TDS/COA确认范围，若范围内再核税款"

    return "低", "C", "当前未见受税来源联系或产品初步范围外", "留作趋势监测；出现批号/箱号匹配时升级"


def build_records() -> tuple[list[dict[str, Any]], dict[str, Any]]:
    pooled: dict[str, dict[str, Any]] = {}
    query_raw_counts: dict[str, int] = {}

    for query, filename in QUERY_FILES.items():
        obj = json.loads((OUT_DIR / filename).read_text("utf-8"))
        rows = obj.get("rows", [])
        query_raw_counts[query] = len(rows)
        for raw in rows:
            row = list(raw) + [""] * (13 - len(raw))
            row = row[:13]
            key = exact_key(row)
            if key not in pooled:
                pooled[key] = {
                    "row": row,
                    "query_hits": set(),
                    "query_occurrences": Counter(),
                }
            pooled[key]["query_hits"].add(query)
            pooled[key]["query_occurrences"][query] += 1

    records: list[dict[str, Any]] = []
    for key, item in pooled.items():
        row = item["row"]
        data_source, flow, date, hs, desc, buyer, supplier, weight, quantity, amount, destination, origin, _ = row
        scope_class, scope_reason, scope_candidate = classify_scope(s(desc), s(hs))
        rec = {
            "record_id": row_hash(key),
            "query_hits": "; ".join(sorted(item["query_hits"])),
            "query_occurrences": "; ".join(f"{k}:{v}" for k, v in sorted(item["query_occurrences"].items())),
            "data_source": s(data_source),
            "flow": s(flow),
            "date": s(date),
            "hs": s(hs),
            "description": s(desc),
            "buyer": s(buyer),
            "supplier": s(supplier),
            "weight": f(weight),
            "quantity": f(quantity),
            "amount": f(amount),
            "destination": s(destination),
            "origin": s(origin),
            "destination_u": normalized_text(destination),
            "origin_u": normalized_text(origin),
            "description_u": normalized_text(desc),
            "buyer_u": normalized_text(buyer),
            "supplier_u": normalized_text(supplier),
            "phase": date_phase(s(date)),
            "origin_marker": origin_code(s(desc)),
            "brand_grade": brand_grade(s(desc)),
            "scope_class": scope_class,
            "scope_reason": scope_reason,
            "scope_candidate": scope_candidate,
        }
        rec["marker_country"] = marker_country(rec["origin_marker"])
        rec["marker_conflict"] = bool(rec["marker_country"] and rec["marker_country"] != rec["origin_u"])
        rec["mass_proxy"] = rec["weight"] if rec["weight"] not in (None, 0) else (rec["quantity"] if scope_candidate else None)
        rec["mass_basis"] = "平台重量字段" if rec["weight"] not in (None, 0) else ("数量字段（单位待核）" if scope_candidate and rec["quantity"] not in (None, 0) else "无可用质量")
        rate, rate_note = rate_for(rec["origin"], rec["description"], rec["supplier"])
        rec["ad_rate_pct"] = rate
        rec["rate_note"] = rate_note
        rec["conditional_ad"] = round(rec["amount"] * rate / 100, 2) if rec["amount"] is not None and rate is not None and scope_candidate else None
        rec["conditional_vat_delta"] = round(rec["conditional_ad"] * 0.13, 2) if rec["conditional_ad"] is not None else None
        rec["conditional_total"] = round(rec["conditional_ad"] + rec["conditional_vat_delta"], 2) if rec["conditional_ad"] is not None else None
        risk, evidence, route, action = route_assessment(rec)
        rec["route_risk"] = risk
        rec["evidence_level"] = evidence
        rec["route_assessment"] = route
        rec["recommended_action"] = action
        records.append(rec)

    records.sort(key=lambda r: (r["date"], r["record_id"]), reverse=True)
    for idx, rec in enumerate(records, 1):
        rec["seq"] = idx

    summary: dict[str, Any] = {
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "query_raw_counts": query_raw_counts,
        "raw_rows_total_including_cross_query_overlap": sum(query_raw_counts.values()),
        "exact_unique_cross_query": len(records),
        "mainland_unique": sum(is_mainland(r["destination"]) for r in records),
        "taiwan_or_other_destination_unique": sum(not is_mainland(r["destination"]) for r in records),
        "phase_counts_mainland": Counter(r["phase"] for r in records if is_mainland(r["destination"])),
        "scope_counts_mainland": Counter(r["scope_class"] for r in records if is_mainland(r["destination"])),
        "risk_counts_mainland": Counter(r["route_risk"] for r in records if is_mainland(r["destination"])),
        "post_final_scope_candidates": sum(r["phase"] == "终裁实施后" and r["scope_candidate"] and is_mainland(r["destination"]) for r in records),
        "post_final_taxed_origin_scope_candidates": sum(r["phase"] == "终裁实施后" and r["scope_candidate"] and is_mainland(r["destination"]) and r["origin_u"] in TAXED_ORIGINS for r in records),
        "post_final_third_country_scope_candidates": sum(r["phase"] == "终裁实施后" and r["scope_candidate"] and is_mainland(r["destination"]) and r["origin_u"] not in TAXED_ORIGINS for r in records),
        "origin_marker_conflicts_mainland": sum(r["marker_conflict"] for r in records if is_mainland(r["destination"])),
    }
    summary["phase_counts_mainland"] = dict(summary["phase_counts_mainland"])
    summary["scope_counts_mainland"] = dict(summary["scope_counts_mainland"])
    summary["risk_counts_mainland"] = dict(summary["risk_counts_mainland"])

    def select(fn):
        return [r for r in records if fn(r)]

    summary["key_acumen_rows"] = select(lambda r: "C52021" in r["description_u"] and "ACUMEN ENGINEERING" in r["buyer_u"] + r["supplier_u"])
    summary["key_tenac_ex352_rows"] = select(lambda r: "TENAC-C EX352" in r["description_u"])
    summary["key_lw15ewx_rows"] = select(lambda r: "LW15EWX" in r["description_u"])
    summary["key_saudi_rows"] = select(lambda r: r["origin_u"] == "SAUDI ARABIA" and r["phase"] == "终裁实施后")
    summary["key_third_country_marker_rows"] = select(
        lambda r: r["phase"] == "终裁实施后" and r["destination_u"] == "CHINA" and r["origin_u"] not in TAXED_ORIGINS and r["origin_marker"] in {"DE", "US", "JP", "NL", "BE", "TW", "FR", "IT", "AT"}
    )
    return records, summary


def export(records: list[dict[str, Any]], summary: dict[str, Any]) -> None:
    json_path = OUT_DIR / "POM_易迅跨查询逐票标准化.json"
    json_path.write_text(json.dumps(records, ensure_ascii=False, indent=2), "utf-8")
    (OUT_DIR / "POM_全量分析结果.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2, default=str), "utf-8")

    fields = [
        "seq", "record_id", "query_hits", "query_occurrences", "data_source", "flow", "date", "phase",
        "hs", "description", "brand_grade", "buyer", "supplier", "weight", "quantity", "mass_proxy", "mass_basis",
        "amount", "destination", "origin", "origin_marker", "marker_country", "marker_conflict", "scope_class", "scope_reason", "scope_candidate",
        "route_risk", "evidence_level", "route_assessment", "ad_rate_pct", "rate_note", "conditional_ad",
        "conditional_vat_delta", "conditional_total", "recommended_action",
    ]
    with (OUT_DIR / "POM_易迅跨查询逐票标准化.csv").open("w", encoding="utf-8-sig", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(records)


if __name__ == "__main__":
    records_, summary_ = build_records()
    export(records_, summary_)
    print(json.dumps({
        "records": len(records_),
        "mainland": summary_["mainland_unique"],
        "phases": summary_["phase_counts_mainland"],
        "scopes": summary_["scope_counts_mainland"],
        "risks": summary_["risk_counts_mainland"],
        "acumen": len(summary_["key_acumen_rows"]),
        "tenac_ex352": len(summary_["key_tenac_ex352_rows"]),
        "saudi": len(summary_["key_saudi_rows"]),
        "marker_rows": len(summary_["key_third_country_marker_rows"]),
    }, ensure_ascii=False, indent=2))
