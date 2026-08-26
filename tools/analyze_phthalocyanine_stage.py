from __future__ import annotations

import csv
import hashlib
import json
import re
import shutil
from collections import Counter, defaultdict
from pathlib import Path


WORKSPACE = Path(__file__).resolve().parents[1]
SOURCE_DIR = WORKSPACE / "temp"
OUT_DIR = Path(r"D:\易迅数据\反倾销税深度分析报告\08_酞菁类颜料")

DOWNSTREAM_FILE = SOURCE_DIR / "yixun_phthalocyanine_all129.json"
UPSTREAM_FILE = SOURCE_DIR / "yixun_phthalocyanine_india_vietnam_all215.json"

FIELDS = [
    "data_feed",
    "trade_direction",
    "date",
    "hs_code",
    "description",
    "buyer_or_consignee",
    "seller_or_shipper",
    "weight_field",
    "quantity_field",
    "amount_field",
    "destination",
    "platform_origin",
    "favorite",
]


def number(value):
    try:
        text = str(value).replace(",", "").strip()
        return float(text) if text else None
    except (TypeError, ValueError):
        return None


def sig(row):
    payload = json.dumps(row, ensure_ascii=False, separators=(",", ":"))
    return hashlib.sha1(payload.encode("utf-8")).hexdigest()[:16]


def tail_marker(description: str) -> str:
    found = re.findall(r"#&([A-Z]{2})", description.upper())
    return found[-1] if found else ""


def classify_product(description: str):
    text = description.upper()
    if "SOLSPERSE 5000" in text or "70750-63-9" in text:
        return "酞菁衍生物分散助剂", "倾向范围外", "HS382499且为含酞菁衍生物的分散稳定助剂，不是酞菁类颜料本体"
    if "COBALT(II) PHTHALOCYANINE" in text or "3317-67-7" in text:
        return "实验室钴酞菁", "倾向范围外", "1克/瓶实验室化学品，非通常工业酞菁类颜料贸易"
    if any(x in text for x in ("GREEN", "1328-53-6", "74260")) or re.search(r"PIGMENT\s*7\b", text):
        return "酞菁绿", "范围候选", "货描含Pigment Green/PG7、CAS1328-53-6或CI74260等酞菁绿指纹"
    if any(x in text for x in ("BLUE", "147-14-8", "74160")):
        return "酞菁蓝", "范围候选", "货描含Pigment Blue/PB15、CAS147-14-8或CI74160等酞菁蓝指纹"
    return "其他酞菁", "范围待核", "关键词命中，但需以成分、用途及终裁产品描述复核"


def route_for(query_name: str, rec: dict):
    origin = rec["platform_origin"]
    marker = rec["tail_origin_marker"]
    feed = rec["data_feed"]
    if query_name == "PHTHALOCYANINE→中国（近一年）":
        if origin == "India":
            return "印度→中国直接贸易", "直接核税", "受税来源直接对华，不属于第三国绕道；核查生产商税率及缴款书"
        if origin == "Vietnam" and marker == "VN":
            return "越南→中国B腿（#&VN）", "B+", "具体第三国对华发运成立，但印度上游、实质加工及中国端原产申报尚未闭合"
        if origin == "Vietnam" and marker:
            return f"越南→中国B腿（#&{marker}）", "B", "经越南对华发运成立；货描保留第三方原产标记，需核中国进口原产申报"
        return "其他来源→中国", "C", "仅形成对华记录，未形成印度绕道链"
    if feed == "印度全港":
        return "印度→越南A腿（印度出口侧）", "B", "受税来源向第三国供应同类商品；与越南进口镜像不得简单相加"
    if feed == "越南全港":
        return "印度→越南A腿（越南进口侧）", "B", "越南进口申报显示印度来源同类商品；尚未与具体对华B腿闭合"
    return "印度→越南A腿", "B", "同类商品进入越南的上游线索"


def quantity_note(rec: dict):
    if rec["data_feed"] == "越南全港":
        return "越南海关数据数量字段，货描包装通常支持公斤口径，但正式单位须回查原始申报"
    if rec["data_feed"] == "印度全港":
        return "印度出口数据数量字段通常为公斤，须以原始出口申报计量单位确认"
    return "平台数量字段，单位待原始申报确认"


def amount_note(rec: dict):
    if rec["data_feed"] == "越南全港":
        return "越南海关金额字段通常为越南盾；本地JSON未单列币种，只可作同币种风险代理"
    if rec["data_feed"] == "印度全港":
        return "印度出口金额字段通常为美元；本地JSON未单列币种，只可作来源侧代理"
    return "平台金额字段，币种待核"


def prepare(query_name: str, rows: list[list[str]]):
    signatures = Counter(sig(row) for row in rows)
    occurrences = defaultdict(int)
    prepared = []
    for position, row in enumerate(rows, start=1):
        rec = dict(zip(FIELDS, row))
        signature = sig(row)
        occurrences[signature] += 1
        rec["query_name"] = query_name
        rec["query_row"] = position
        rec["record_id"] = f"PHT-{signature}-{occurrences[signature]:02d}"
        rec["visible_signature"] = signature
        rec["visible_signature_count"] = signatures[signature]
        rec["possible_visible_duplicate"] = signatures[signature] > 1
        rec["weight_num"] = number(rec["weight_field"])
        rec["quantity_num"] = number(rec["quantity_field"])
        rec["amount_num"] = number(rec["amount_field"])
        rec["tail_origin_marker"] = tail_marker(rec["description"])
        product_class, scope_screen, scope_reason = classify_product(rec["description"])
        rec["product_class"] = product_class
        rec["scope_screen"] = scope_screen
        rec["scope_reason"] = scope_reason
        route, grade, route_reason = route_for(query_name, rec)
        rec["route"] = route
        rec["evidence_grade"] = grade
        rec["route_reason"] = route_reason
        rec["quantity_basis"] = quantity_note(rec)
        rec["amount_basis"] = amount_note(rec)
        prepared.append(rec)
    return prepared


def sum_field(records, field):
    return sum((r[field] or 0) for r in records)


def group_stats(records, field):
    grouped = defaultdict(list)
    for rec in records:
        grouped[str(rec[field])].append(rec)
    out = []
    for key, rows in grouped.items():
        out.append(
            {
                "name": key,
                "records": len(rows),
                "exact_visible_signatures": len({r["visible_signature"] for r in rows}),
                "quantity_field_sum": sum_field(rows, "quantity_num"),
                "amount_field_sum": sum_field(rows, "amount_num"),
            }
        )
    return sorted(out, key=lambda x: (-x["quantity_field_sum"], -x["records"], x["name"]))


def tax_scenario(amount, rate):
    ad = amount * rate
    vat_delta = ad * 0.13
    return {
        "ad_rate": rate,
        "amount_field_proxy": amount,
        "conditional_antidumping_duty": ad,
        "conditional_import_vat_delta": vat_delta,
        "conditional_total_increment": ad + vat_delta,
        "strict_conditions": "仅在货物实际为印度原产、生产商税档相符、金额字段可作完税价格代理且中国端未征反倾销税时成立",
    }


def write_csv(path: Path, rows: list[dict], fields: list[str]):
    with path.open("w", newline="", encoding="utf-8-sig") as fh:
        writer = csv.DictWriter(fh, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    shutil.copy2(DOWNSTREAM_FILE, OUT_DIR / "酞菁类颜料_易迅_PHTHALOCYANINE_目的国中国_近一年_原始读取129条.json")
    shutil.copy2(UPSTREAM_FILE, OUT_DIR / "酞菁类颜料_易迅_PHTHALOCYANINE_印度至越南_近一年_原始读取215条.json")
    downstream_raw = json.loads(DOWNSTREAM_FILE.read_text(encoding="utf-8"))
    upstream_raw = json.loads(UPSTREAM_FILE.read_text(encoding="utf-8"))
    downstream = prepare("PHTHALOCYANINE→中国（近一年）", downstream_raw)
    upstream = prepare("PHTHALOCYANINE×印度→越南（近一年）", upstream_raw)
    all_records = downstream + upstream

    b_vn = [r for r in downstream if r["route"] == "越南→中国B腿（#&VN）"]
    b_de = [r for r in downstream if r["route"] == "越南→中国B腿（#&DE）"]
    direct_india = [r for r in downstream if r["route"] == "印度→中国直接贸易"]
    upstream_candidates = [r for r in upstream if r["scope_screen"] != "倾向范围外"]
    india_export = [r for r in upstream_candidates if r["data_feed"] == "印度全港"]
    vietnam_import = [r for r in upstream_candidates if r["data_feed"] == "越南全港"]
    vg_abbrev = [r for r in upstream if str(r["buyer_or_consignee"]).upper() == "V. G. CO. LTD."]
    vinh_gia = [r for r in b_vn if "XUấT NHậP KHẩU VĩNH GIA" in str(r["seller_or_shipper"])]
    yicai = [r for r in b_vn if "YICAI" in str(r["seller_or_shipper"]).upper() or "NHựA MàU YICAI" in str(r["seller_or_shipper"])]

    amount_proxy = sum_field(b_vn, "amount_num")
    summary = {
        "as_of": "2026-08-13",
        "stage_status": "阶段审计；尚缺HS32041700/32129000及扩展关键词全页查询",
        "queries": {
            "downstream": {
                "condition": "PHTHALOCYANINE，目的国中国，近一年",
                "raw_occurrences": len(downstream),
                "exact_visible_signatures": len({r["visible_signature"] for r in downstream}),
                "extra_identical_visible_occurrences": len(downstream) - len({r["visible_signature"] for r in downstream}),
                "date_min": min(r["date"] for r in downstream),
                "date_max": max(r["date"] for r in downstream),
            },
            "upstream": {
                "condition": "PHTHALOCYANINE，目的国越南，原产国印度，近一年",
                "raw_occurrences": len(upstream),
                "exact_visible_signatures": len({r["visible_signature"] for r in upstream}),
                "extra_identical_visible_occurrences": len(upstream) - len({r["visible_signature"] for r in upstream}),
                "page_integrity": "第1页200条+第2页15条；两页无交叠并完整拼接为215条",
                "date_min": min(r["date"] for r in upstream),
                "date_max": max(r["date"] for r in upstream),
            },
        },
        "downstream_findings": {
            "india_direct": {
                "records": len(direct_india),
                "exact_visible_signatures": len({r["visible_signature"] for r in direct_india}),
                "quantity_field_sum": sum_field(direct_india, "quantity_num"),
                "amount_field_sum": sum_field(direct_india, "amount_num"),
            },
            "vietnam_to_china_all": {
                "records": len([r for r in downstream if r["platform_origin"] == "Vietnam"]),
                "quantity_field_sum": sum_field([r for r in downstream if r["platform_origin"] == "Vietnam"], "quantity_num"),
                "amount_field_sum": sum_field([r for r in downstream if r["platform_origin"] == "Vietnam"], "amount_num"),
            },
            "vietnam_to_china_hash_vn": {
                "records": len(b_vn),
                "quantity_field_sum": sum_field(b_vn, "quantity_num"),
                "amount_field_sum": amount_proxy,
                "product_split": group_stats(b_vn, "product_class"),
                "exporter_split": group_stats(b_vn, "seller_or_shipper"),
                "china_party_split": group_stats(b_vn, "buyer_or_consignee"),
            },
            "vietnam_to_china_hash_de": {
                "records": len(b_de),
                "quantity_field_sum": sum_field(b_de, "quantity_num"),
                "amount_field_sum": sum_field(b_de, "amount_num"),
                "conclusion": "德国标记，不属于印度绕道数量；仅作为经越南发货的原产字段核对线索",
            },
        },
        "upstream_findings": {
            "scope_candidate_occurrences": len(upstream_candidates),
            "scope_candidate_exact_visible_signatures": len({r["visible_signature"] for r in upstream_candidates}),
            "india_export_perspective": {
                "records": len(india_export),
                "quantity_field_sum": sum_field(india_export, "quantity_num"),
                "amount_field_sum": sum_field(india_export, "amount_num"),
            },
            "vietnam_import_perspective": {
                "records": len(vietnam_import),
                "quantity_field_sum": sum_field(vietnam_import, "quantity_num"),
                "amount_field_sum": sum_field(vietnam_import, "amount_num"),
            },
            "warning": "印度出口侧与越南进口侧可能含同一货运的镜像，数量和金额不得相加称为独立贸易量",
        },
        "specific_entity_leads": {
            "vinh_gia_b_leg": {
                "records": len(vinh_gia),
                "quantity_field_sum": sum_field(vinh_gia, "quantity_num"),
                "amount_field_sum": sum_field(vinh_gia, "amount_num"),
            },
            "yicai_b_leg": {
                "records": len(yicai),
                "quantity_field_sum": sum_field(yicai, "quantity_num"),
                "amount_field_sum": sum_field(yicai, "amount_num"),
            },
            "vg_co_ltd_a_leg_abbreviation_candidate": {
                "records": len(vg_abbrev),
                "quantity_field_sum": sum_field(vg_abbrev, "quantity_num"),
                "amount_field_sum": sum_field(vg_abbrev, "amount_num"),
                "conclusion": "仅名称简称候选；公开聚合页存在同名合并污染，未取得越南税号，不得等同Vinh Gia",
            },
        },
        "conditional_tax_scenarios_for_31_hash_vn_records": [
            tax_scenario(amount_proxy, rate) for rate in (0.119, 0.141, 0.16, 0.187, 0.307)
        ],
        "evidence_conclusion": {
            "proved": "印度同期向越南供应同类酞菁，且越南对华存在31条#&VN的具体B腿；主体、规格、数量和中国接收方可逐票核查",
            "not_proved": "尚无同一批货的印度A腿—越南加工/库存—中国B腿箱号或申报单闭环，也无中国端改报越南原产和漏缴税款证明",
        },
        "query_gaps": [
            "HS32041700→中国、印度→越南及越南→中国全页查询",
            "HS32129000→中国、印度→越南及越南→中国全页查询",
            "PIGMENT BLUE 15、PIGMENT GREEN 7、CAS147-14-8、CAS1328-53-6、COPPER PHTHALOCYANINE CRUDE扩展关键词",
            "Vinh Gia/Yicai/V. G. CO. LTD.企业反查及越南进口申报税号",
        ],
    }

    key_fields = [
        "record_id", "query_name", "query_row", "visible_signature", "visible_signature_count",
        "possible_visible_duplicate", "data_feed", "trade_direction", "date", "hs_code", "description",
        "buyer_or_consignee", "seller_or_shipper", "weight_num", "quantity_num", "amount_num",
        "destination", "platform_origin", "tail_origin_marker", "product_class", "scope_screen",
        "scope_reason", "route", "evidence_grade", "route_reason", "quantity_basis", "amount_basis",
    ]
    (OUT_DIR / "酞菁类颜料_易迅逐票标准化.json").write_text(
        json.dumps(all_records, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    write_csv(OUT_DIR / "酞菁类颜料_易迅逐票标准化.csv", all_records, key_fields)
    (OUT_DIR / "酞菁类颜料_全量阶段审计.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    write_csv(OUT_DIR / "酞菁类颜料_越南对华31票重点线索.csv", b_vn, key_fields)
    write_csv(OUT_DIR / "酞菁类颜料_印度至越南A腿范围候选.csv", upstream_candidates, key_fields)
    print(json.dumps({"out_dir": str(OUT_DIR), "records": len(all_records), "summary": summary}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
