from __future__ import annotations

import csv
import hashlib
import json
import os
import re
from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, Iterable


BASE = Path(os.environ.get("PC_SOURCE_DIR", r"C:\Users\59809\Documents\关键矿产"))
OUT = Path(os.environ.get("PC_OUT_DIR", r"D:\易迅数据\反倾销税深度分析报告\07_聚碳酸酯"))
OUT.mkdir(parents=True, exist_ok=True)

FIELD_NAMES = [
    "data_source",
    "trade_direction",
    "date",
    "hs_code",
    "description",
    "china_party",
    "foreign_party",
    "weight",
    "quantity",
    "amount",
    "destination",
    "platform_origin",
    "favorite",
]


def num(value: Any) -> float | None:
    if value is None or value == "":
        return None
    try:
        return float(str(value).replace(",", "").strip())
    except ValueError:
        return None


def norm(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "").strip()).upper()


def exact_key(row: list[Any]) -> str:
    return json.dumps(row, ensure_ascii=False, separators=(",", ":"))


def tail_origin(description: str) -> str:
    matches = re.findall(r"#\s*&\s*([A-Z]{2})(?:\b|$)", description.upper())
    return matches[-1] if matches else ""


def category(description: str, hs_code: str) -> tuple[str, str]:
    d = norm(description)
    hs = re.sub(r"\D", "", str(hs_code or ""))
    recycle_terms = (
        "RECYCLE", "RECYCLED", "REGRIND", "REPROCESSED", "TAI SINH",
        "TÁI SINH", "PHE LIEU", "PHẾ LIỆU", "SCRAP", "WASTE",
    )
    alloy_terms = (
        "PC/ABS", "PC /ABS", "PC / ABS", "PC-ABS", "ABS/PC", "ABS-PC",
        "PC+ABS", "PC + ABS", "ABS+PC", "ABS + PC",
        "POLYCARBONAT-ACRYLONITRIL", "POLYCARBONATE/ABS", "BAYBLEND",
        "EMERGE PC/ABS", "PC/PBT", "PC / PBT", "PC-PBT", "XENOY",
    )
    modified_terms = (
        "COMPOUND", "COMPOSITE", "GLASS FIB", "GLASS-FIB", "GF10", "GF15",
        "GF20", "GF30", "GF40", "GF50", "FLAME RETARD", "CHONG CHAY",
        "CHỐNG CHÁY", "LNP THERMOCOMP", "LNP LUBRILOY", "LNP STAT-KON",
        "MASTERBATCH", "FILLER", "FILLED", "CARBON FIB", "MINERAL",
    )
    pc_terms = (
        "POLYCARBONATE", "POLYCARBONAT", "PC RESIN", "HAT NHUA PC",
        "HẠT NHỰA PC", "MAKROLON", "LEXAN", "PANLITE", "IUPILON",
        "CALIBRE", "TARFLON", "TRIREX", "PC PELLET", "PC GRANULE",
    )
    non_pc_terms = (
        "HAT NHUA PPA", "HẠT NHỰA PPA", "POLYPHTHALAMIDE", "POLYAMIDE PPA",
    )
    if any(t in d for t in alloy_terms):
        return "PC合金/共混料（倾向范围外）", "货描明示PC/ABS、PC/PBT或商品化合金；须核双酚A型PC重量含量是否低于99%"
    if any(t in d for t in recycle_terms):
        return "再生PC（含量与原产待核）", "货描明示再生、废料再造或recycle/regrind；终裁未按再生/原生排除，仍须核双酚A型PC含量是否达到99%及原产地"
    if any(t in d for t in modified_terms):
        return "改性/复合PC（含量待核）", "添加剂低于1%仍可能落入措施；须以TDS/COA核双酚A型PC重量含量是否达到99%"
    if any(t in d for t in non_pc_terms):
        return "疑似误匹配/其他", "货描为PPA等其他聚合物，与聚碳酸酯不符"
    if any(t in d for t in pc_terms):
        return "基础/原生PC待核", "货描表现为PC树脂或聚碳酸酯牌号；仍需TDS/COA核范围"
    if hs.startswith("390740"):
        return "税号命中但货描不足", "HS命中390740，货描不足以判断措施范围"
    return "疑似误匹配/其他", "税号和货描均不足以确认为聚碳酸酯"


def route_assessment(origin: str, marker: str, source: str, cat: str, desc: str) -> tuple[str, str, str]:
    origin_u, source_u, desc_u = norm(origin), norm(source), norm(desc)
    taiwan_platform = "TAIWAN" in origin_u or "台湾" in source_u or "TAIWAN" in source_u
    scope_candidate = cat in {
        "基础/原生PC待核", "税号命中但货描不足", "再生PC（含量与原产待核）",
        "改性/复合PC（含量待核）",
    }
    if taiwan_platform:
        return (
            "受税来源直接对华",
            "C+" if scope_candidate else "C",
            "平台来源或数据源指向台湾；核验中国报关原产地及反倾销税缴款",
        )
    if marker == "TW" or "MADE IN TAIWAN" in desc_u or "ORIGIN: TAIWAN" in desc_u:
        return (
            "第三国B腿：描述保留TW",
            "B+" if scope_candidate else "B",
            "第三国出口记录保留台湾产地标记；证明B腿/再出口线索，不证明中国端改报产地",
        )
    if scope_candidate and origin_u not in {"", "TAIWAN", "CHINA"}:
        return (
            "非受税第三国基础PC候选",
            "C",
            "需反查第三国生产能力、上游台湾A腿及中国进口原产地申报",
        )
    return "低关联或范围外候选", "D", "当前记录不足以指向台湾聚碳酸酯绕道"


def pick_proxy(weight: float | None, quantity: float | None) -> tuple[float | None, str]:
    if weight is not None and weight > 0:
        return weight, "平台重量字段"
    if quantity is not None and quantity > 0:
        return quantity, "平台数量字段（单位未必为kg）"
    return None, "无"


def load_pages() -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    occurrences: list[dict[str, Any]] = []
    audits: list[dict[str, Any]] = []
    for page in range(1, 15):
        path = BASE / f".pc_verified_page{page}.json"
        raw_bytes = path.read_bytes()
        obj = json.loads(raw_bytes.decode("utf-8"))
        rows = obj.get("rows", [])
        audits.append(
            {
                "requested_page": page,
                "stored_page": obj.get("page"),
                "row_count": len(rows),
                "first_date": rows[0][2] if rows else "",
                "last_date": rows[-1][2] if rows else "",
                "sha256": hashlib.sha256(raw_bytes).hexdigest(),
            }
        )
        for pos, row in enumerate(rows, 1):
            occurrences.append({"page": page, "position": pos, "row": row})
    return occurrences, audits


def main() -> None:
    occurrences, page_audit = load_pages()

    by_key: dict[str, dict[str, Any]] = {}
    for occ in occurrences:
        key = exact_key(occ["row"])
        if key not in by_key:
            by_key[key] = {"row": occ["row"], "occurrences": []}
        by_key[key]["occurrences"].append({"page": occ["page"], "position": occ["position"]})

    records: list[dict[str, Any]] = []
    for idx, item in enumerate(by_key.values(), 1):
        row = list(item["row"]) + [""] * max(0, len(FIELD_NAMES) - len(item["row"]))
        mapped = dict(zip(FIELD_NAMES, row[: len(FIELD_NAMES)]))
        w, q, a = num(mapped["weight"]), num(mapped["quantity"]), num(mapped["amount"])
        proxy, proxy_basis = pick_proxy(w, q)
        marker = tail_origin(str(mapped["description"] or ""))
        cat, cat_reason = category(str(mapped["description"] or ""), str(mapped["hs_code"] or ""))
        route, grade, route_reason = route_assessment(
            str(mapped["platform_origin"] or ""),
            marker,
            str(mapped["data_source"] or ""),
            cat,
            str(mapped["description"] or ""),
        )
        mapped.update(
            {
                "record_id": f"PC-HS-{idx:05d}",
                "input_pages": ",".join(str(x["page"]) for x in item["occurrences"]),
                "input_occurrence_count": len(item["occurrences"]),
                "tail_origin_marker": marker,
                "scope_category": cat,
                "scope_reason": cat_reason,
                "route_assessment": route,
                "evidence_grade": grade,
                "route_reason": route_reason,
                "weight_num": w,
                "quantity_num": q,
                "amount_num": a,
                "quantity_proxy": proxy,
                "quantity_proxy_basis": proxy_basis,
            }
        )
        records.append(mapped)

    page_duplicate_pairs = []
    for i in range(len(page_audit)):
        oi = json.loads((BASE / f".pc_verified_page{i+1}.json").read_text(encoding="utf-8"))["rows"]
        for j in range(i + 1, len(page_audit)):
            oj = json.loads((BASE / f".pc_verified_page{j+1}.json").read_text(encoding="utf-8"))["rows"]
            if oi == oj:
                page_duplicate_pairs.append([i + 1, j + 1])

    scope_counts = Counter(r["scope_category"] for r in records)
    route_counts = Counter(r["route_assessment"] for r in records)
    origin_counts = Counter(r["platform_origin"] or "(空白)" for r in records)
    source_counts = Counter(r["data_source"] or "(空白)" for r in records)
    marker_counts = Counter(r["tail_origin_marker"] or "(无)" for r in records)

    def aggregate(rows: Iterable[dict[str, Any]], field: str) -> list[dict[str, Any]]:
        out: dict[str, dict[str, Any]] = defaultdict(lambda: {"records": 0, "proxy_sum": 0.0, "amount_sum": 0.0})
        for r in rows:
            key = str(r.get(field) or "(空白)")
            out[key]["records"] += 1
            out[key]["proxy_sum"] += float(r.get("quantity_proxy") or 0)
            out[key]["amount_sum"] += float(r.get("amount_num") or 0)
        return [
            {field: k, **v}
            for k, v in sorted(out.items(), key=lambda kv: (-kv[1]["records"], kv[0]))
        ]

    tw_marker_records = [r for r in records if r["tail_origin_marker"] == "TW"]
    taiwan_direct = [r for r in records if r["route_assessment"] == "受税来源直接对华"]
    leads = [r for r in records if r["evidence_grade"] in {"B+", "B", "C+"}]
    base_third_country = [r for r in records if r["route_assessment"] == "非受税第三国基础PC候选"]

    summary = {
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "query_understood": {
            "hs": "39074000（各数据源扩展码亦命中）",
            "destination": "China",
            "date_start": min((r["date"] for r in records if r["date"]), default=""),
            "date_end": max((r["date"] for r in records if r["date"]), default=""),
            "page_size": 200,
        },
        "integrity": {
            "raw_page_occurrences": len(occurrences),
            "exact_unique_records": len(records),
            "exact_duplicate_occurrences": len(occurrences) - len(records),
            "page_duplicate_pairs": page_duplicate_pairs,
            "critical_gap_note": "第6页与第7页逐行完全相同；旧抓取缺失约1页，不能将2629条表述为2629条不同记录或完整全量。",
            "page_audit": page_audit,
        },
        "counts": {
            "scope_category": dict(scope_counts),
            "route_assessment": dict(route_counts),
            "platform_origin": dict(origin_counts),
            "data_source": dict(source_counts),
            "tail_origin_marker": dict(marker_counts),
            "tw_marker_records": len(tw_marker_records),
            "taiwan_direct_records": len(taiwan_direct),
            "lead_records": len(leads),
            "base_third_country_records": len(base_third_country),
        },
        "aggregates": {
            "by_scope_category": aggregate(records, "scope_category"),
            "by_route": aggregate(records, "route_assessment"),
            "by_origin": aggregate(records, "platform_origin"),
            "tw_marker_by_scope": aggregate(tw_marker_records, "scope_category"),
            "base_third_country_by_origin": aggregate(base_third_country, "platform_origin"),
        },
        "closed_loop_conclusion": "当前仅有中国方向B腿记录，且缺失约1页；不能据此闭合台湾A腿→第三国→中国B腿，也不能证明中国进口申报改报原产地或少缴反倾销税。",
    }

    (OUT / "聚碳酸酯_易迅_HS390740_全量分析结果.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (OUT / "聚碳酸酯_易迅_HS390740_逐票标准化.json").write_text(
        json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    columns = [
        "record_id", "input_pages", "input_occurrence_count", *FIELD_NAMES[:-1],
        "tail_origin_marker", "scope_category", "scope_reason", "route_assessment",
        "evidence_grade", "route_reason", "weight_num", "quantity_num", "amount_num",
        "quantity_proxy", "quantity_proxy_basis",
    ]
    with (OUT / "聚碳酸酯_易迅_HS390740_逐票标准化.csv").open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=columns, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(records)

    lead_columns = [
        "record_id", "date", "data_source", "description", "china_party", "foreign_party",
        "weight", "quantity", "amount", "platform_origin", "tail_origin_marker",
        "scope_category", "route_assessment", "evidence_grade", "route_reason",
    ]
    with (OUT / "聚碳酸酯_易迅_HS390740_TW重点线索.csv").open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=lead_columns, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(leads)

    # Earlier browser reads from the same query cover the date interval skipped by the
    # duplicated page 7. They are preserved only as recovery candidates because the
    # live result set may have shifted between reads; they are not silently merged into
    # the canonical count above.
    canonical_keys = {exact_key(item["row"]) for item in by_key.values()}
    gap_seen: set[str] = set()
    gap_candidates: list[dict[str, Any]] = []
    for alt_page in range(4, 11):
        alt_path = BASE / f".pc_page{alt_page}.json"
        if not alt_path.exists():
            continue
        alt_obj = json.loads(alt_path.read_text(encoding="utf-8"))
        for pos, raw_row in enumerate(alt_obj.get("rows", []), 1):
            key = exact_key(raw_row)
            row_date = str(raw_row[2] if len(raw_row) > 2 else "")
            if key in canonical_keys or key in gap_seen or not ("2025-06-16" <= row_date <= "2025-08-16"):
                continue
            gap_seen.add(key)
            padded = list(raw_row) + [""] * max(0, len(FIELD_NAMES) - len(raw_row))
            mapped = dict(zip(FIELD_NAMES, padded[: len(FIELD_NAMES)]))
            marker = tail_origin(str(mapped["description"] or ""))
            cat, cat_reason = category(str(mapped["description"] or ""), str(mapped["hs_code"] or ""))
            route, grade, route_reason = route_assessment(
                str(mapped["platform_origin"] or ""), marker, str(mapped["data_source"] or ""),
                cat, str(mapped["description"] or ""),
            )
            mapped.update(
                {
                    "alternate_page": alt_page,
                    "alternate_position": pos,
                    "tail_origin_marker": marker,
                    "scope_category": cat,
                    "scope_reason": cat_reason,
                    "route_assessment": route,
                    "evidence_grade": grade,
                    "route_reason": route_reason,
                    "recovery_status": "备用历史抓取；须以重新抓取缺页复核",
                }
            )
            gap_candidates.append(mapped)

    (OUT / "聚碳酸酯_易迅_HS390740_缺页恢复候选.json").write_text(
        json.dumps(gap_candidates, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    gap_columns = [
        "alternate_page", "alternate_position", *FIELD_NAMES[:-1], "tail_origin_marker",
        "scope_category", "scope_reason", "route_assessment", "evidence_grade",
        "route_reason", "recovery_status",
    ]
    with (OUT / "聚碳酸酯_易迅_HS390740_缺页恢复候选.csv").open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=gap_columns, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(gap_candidates)

    summary["integrity"]["alternate_gap_candidates"] = len(gap_candidates)
    summary["integrity"]["alternate_gap_tw_marker_records"] = sum(
        1 for r in gap_candidates if r["tail_origin_marker"] == "TW"
    )
    # Rewrite after adding the recovery-candidate audit fields.
    (OUT / "聚碳酸酯_易迅_HS390740_全量分析结果.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    print(json.dumps(summary["integrity"], ensure_ascii=False, indent=2))
    print(json.dumps(summary["counts"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
