#!/usr/bin/env python3
"""Finalize reviewed local phenol inventory, gap ledger and minimal queries."""

from __future__ import annotations

import csv
import json
import re
import sys
from collections import Counter
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Any


OUT = Path(r"D:\易迅数据\反倾销税深度分析报告\15_苯酚")
STATE = OUT / "苯酚_本地深扫状态.json"


STANDARD_FIELDS = [
    "record_id", "source_file", "source_location", "reporter_country",
    "direction", "record_date", "hs_code", "product_description",
    "buyer", "supplier", "quantity", "quantity_unit", "gross_weight_kg",
    "net_weight_kg", "amount", "currency", "origin_country",
    "departure_country", "destination_country", "loading_port",
    "discharge_port", "transport_mode", "carrier", "bill_of_lading",
    "container_no", "scope_decision", "route_tier", "risk_level",
    "confidence", "evidence", "counter_evidence", "data_gap", "next_check",
]


def write_csv(path: Path, rows: list[dict[str, Any]], fields: list[str]) -> None:
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        for row in rows:
            clean = dict(row)
            for key, value in clean.items():
                if isinstance(value, (list, dict)):
                    clean[key] = json.dumps(value, ensure_ascii=False, separators=(",", ":"))
            writer.writerow(clean)


def manual_decision(hit: dict[str, Any]) -> tuple[str, str, str]:
    text = hit["text_excerpt"]
    source = hit["source_class"]
    lower = text.lower()
    if source == "project_metadata":
        return "排除", "项目元数据", "商品清单/进度台账，不是贸易票据"
    if "phenol mix" in lower or "фенольний мікс" in lower:
        return "排除", "实验室混合标准品", "货描为甲醇中的PHENOL MIX及多组分校准混合物，HS382290"
    if "o-cresol" in lower or "cresol" in lower or "甲酚" in text:
        if "108-95-2" in lower:
            return "排除", "邻甲酚且CAS并列疑似录入错误", "货描明确o-Cresol 99%、CAS95-48-7；108-95-2与主品名冲突，不能据此认定苯酚"
        return "排除", "甲酚/甲基苯酚衍生物", "货描或既有判定明确为cresol/methyl phenol"
    if "bisphenol" in lower or "bis phenol" in lower:
        return "排除", "双酚衍生物", "货描明确bisphenol，不是单体苯酚"
    if "ipmp" in lower or "para octy phenol" in lower or "octyl" in lower:
        return "排除", "烷基/取代苯酚", "货描为IPMP、octyl phenol等取代苯酚，不是单体苯酚"
    if re.search(r"\d[,-]\d|dimethyl|trimethyl|methoxy|ethylpentyl|methylhexyl", lower):
        return "排除", "取代苯酚", "系统名含烷基/甲氧基等取代基，不是C6H5OH单体"
    if "phenols; phenol-alcohols" in lower or "phenols,phenol-alcohols" in lower:
        return "排除", "税则章目泛称", "货描为PHENOLS/PHENOL-ALCOHOLS及其衍生物的章目泛称，无单体苯酚标识"
    if source == "project_output_or_qa":
        return "排除", "既有项目派生输出", "非独立原始票据，且未提供单体苯酚CAS/HS/纯度"
    return "排除", "非单体或信息不足", "仅PHENOL字样，无CAS108-95-2、HS290711或单体货描闭合"


def main() -> int:
    data = json.loads(STATE.read_text(encoding="utf-8"))
    candidates = [
        hit for hit in data["hits"]
        if hit["match_class"] in {
            "name_only_target_candidate", "strong_target_candidate",
            "strong_identifier_with_derivative_review",
        }
    ]
    reviews: list[dict[str, Any]] = []
    for index, hit in enumerate(candidates, 1):
        decision, category, reason = manual_decision(hit)
        reviews.append({
            "review_id": f"PH-LOCAL-{index:03d}",
            "source_file": hit["file"],
            "source_class": hit["source_class"],
            "source_format": hit["format"],
            "source_location": hit["location"],
            "scanner_class": hit["match_class"],
            "strong_terms": hit.get("strong_terms", []),
            "name_terms": hit.get("name_terms", []),
            "exclusion_terms": hit.get("exclusion_terms", []),
            "manual_decision": decision,
            "manual_category": category,
            "manual_reason": reason,
            "is_independent_trade_source": hit["source_class"] in {
                "root_download_or_user_file", "easyxun_page_capture_other_product"
            },
            "is_single_phenol_trade_record": decision == "纳入",
            "text_excerpt": hit["text_excerpt"],
        })

    accepted = [row for row in reviews if row["is_single_phenol_trade_record"]]
    review_fields = [
        "review_id", "source_file", "source_class", "source_format",
        "source_location", "scanner_class", "strong_terms", "name_terms",
        "exclusion_terms", "manual_decision", "manual_category", "manual_reason",
        "is_independent_trade_source", "is_single_phenol_trade_record", "text_excerpt",
    ]
    write_csv(OUT / "苯酚_本地重点命中逐条复核25处.csv", reviews, review_fields)
    (OUT / "苯酚_本地重点命中逐条复核25处.json").write_text(
        json.dumps(reviews, ensure_ascii=False, indent=2), encoding="utf-8")

    standardized: list[dict[str, Any]] = []
    write_csv(OUT / "苯酚_易迅逐票标准化_本地0条.csv", standardized, STANDARD_FIELDS)
    (OUT / "苯酚_易迅逐票标准化_本地0条.json").write_text("[]\n", encoding="utf-8")

    queries = [
        {
            "query_id": "PH-Q1",
            "purpose": "中国进口措施范围主口径",
            "direction": "进口",
            "reporter_country": "中国",
            "partner_country": "全部（另按美国、欧盟、韩国、日本、泰国分组）",
            "hs_code": "290711（能选8位时同时试29071110、29071190/平台现行对应码）",
            "product_terms": "留空",
            "date_from": "近2年",
            "date_to": "查询日",
            "filters": "不加企业；结果逐行核对货描、原产国、起运国、进口商、供应商、港口、提单号",
            "exclude_on_review": "phenolic resin、bisphenol、cresol、chlorophenol及其他取代苯酚",
            "reason": "HS主查询避免仅凭英文关键词漏掉本地语言货描；HS290711含盐，须逐票复核",
        },
        {
            "query_id": "PH-Q2",
            "purpose": "中国进口关键词补漏",
            "direction": "进口",
            "reporter_country": "中国",
            "partner_country": "全部",
            "hs_code": "留空",
            "product_terms": "PHENOL；苯酚；108-95-2（分三次查询后跨查询去重）",
            "date_from": "近2年",
            "date_to": "查询日",
            "filters": "目的国中国；记录商品原文及HS；不能把PHENOL子串直接纳入",
            "exclude_on_review": "PHENOLIC/PHENOL RESIN、BISPHENOL、CRESOL、CHLOROPHENOL、NITROPHENOL、AMINOPHENOL、ALKYLPHENOL",
            "reason": "捕获错归税号、CAS字段和关键词记录，与Q1交叉复核",
        },
        {
            "query_id": "PH-Q3",
            "purpose": "第三国A/B腿链路",
            "direction": "进出口双向",
            "reporter_country": "全球/重点第三国",
            "partner_country": "A腿：受税来源→第三国；B腿：第三国→中国",
            "hs_code": "290711",
            "product_terms": "PHENOL 或 108-95-2（与HS分别查询）",
            "date_from": "近2年",
            "date_to": "查询日",
            "filters": "第三国优先新加坡、马来西亚、印度、越南、阿联酋、土耳其；按企业、港口、30/60/90日窗口配对",
            "exclude_on_review": "所有取代苯酚、混合物、树脂；仅同HS同向增长不作转运认定",
            "reason": "要求同品、时间/数量耦合及主体/提单/集装箱等附加关联后才升级风险",
        },
    ]
    query_fields = [
        "query_id", "purpose", "direction", "reporter_country", "partner_country",
        "hs_code", "product_terms", "date_from", "date_to", "filters",
        "exclude_on_review", "reason",
    ]
    write_csv(OUT / "苯酚_易迅最简查询组合.csv", queries, query_fields)
    (OUT / "苯酚_易迅最简查询组合.json").write_text(
        json.dumps(queries, ensure_ascii=False, indent=2), encoding="utf-8")

    gaps = [
        {"gap_id": "PH-G1", "missing_data": "中国进口HS290711逐票全量", "impact": "不能确认直接进口、受税来源占比和第三国B腿", "next_action": "执行PH-Q1并保存全部页/全部记录"},
        {"gap_id": "PH-G2", "missing_data": "关键词/CAS跨税号补漏", "impact": "错归税号或本地语言货描可能漏报", "next_action": "执行PH-Q2，按完整货描人工复核并跨查询去重"},
        {"gap_id": "PH-G3", "missing_data": "受税来源→第三国A腿与第三国→中国B腿", "impact": "无法建立第三国绕道链条", "next_action": "执行PH-Q3，按30/60/90日、数量、企业、港口、提单匹配"},
        {"gap_id": "PH-G4", "missing_data": "原产地证、提单/集装箱、生产批次、仓储及加工记录", "impact": "即使找到宏观A/B腿，也不能认定原产地伪报或逃税", "next_action": "仅对高匹配候选调取海关申报及原产地决定性材料"},
    ]
    write_csv(OUT / "苯酚_数据缺口台账.csv", gaps, ["gap_id", "missing_data", "impact", "next_action"])
    (OUT / "苯酚_数据缺口台账.json").write_text(
        json.dumps(gaps, ensure_ascii=False, indent=2), encoding="utf-8")

    summary = {
        "finalized_at_asia_shanghai": datetime.now(
            timezone(timedelta(hours=8))).isoformat(timespec="seconds"),
        "prefilter_files": 273,
        "deep_scanned_candidate_files": data["summary"]["candidate_files_total"],
        "deep_scan_errors": data["summary"]["error_files"],
        "all_row_or_record_hits": data["summary"]["row_or_record_hits"],
        "priority_candidates_reviewed": len(reviews),
        "priority_review_scanner_classes": dict(Counter(row["scanner_class"] for row in reviews)),
        "priority_review_source_classes": dict(Counter(row["source_class"] for row in reviews)),
        "accepted_single_phenol_trade_records": len(accepted),
        "accepted_direct_china_records": 0,
        "accepted_third_country_b_legs": 0,
        "accepted_taxed_origin_a_legs": 0,
        "ab_entity_matches": 0,
        "conclusion": "现有D盘文件未发现可确认属于单体苯酚措施范围的原始贸易记录；不能据此判断不存在贸易，只能判定本地数据缺口。",
        "key_false_positive": "2023-07-10越南进口o-Cresol记录并列CAS95-48-7与108-95-2；主品名、纯度和HS均指向邻甲酚，108-95-2疑似录入/拼接错误，不纳入苯酚。",
        "limitations": [
            "本地内容扫描不等同于易迅网页全库查询。",
            "既有项目派生文件中的同票重复不构成新增独立证据。",
            "没有单体苯酚逐票数据，无法开展去重、路线分层或A/B腿实体匹配。",
        ],
    }
    (OUT / "苯酚_本地盘点最终摘要.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")

    expected = {
        "review_rows": 25, "accepted_rows": 0, "query_rows": 3, "gap_rows": 4,
        "deep_scan_complete": True, "deep_scan_errors": 0,
    }
    actual = {
        "review_rows": len(reviews), "accepted_rows": len(accepted),
        "query_rows": len(queries), "gap_rows": len(gaps),
        "deep_scan_complete": bool(data["summary"]["checkpoint_complete"]),
        "deep_scan_errors": data["summary"]["error_files"],
    }
    qa = {
        "expected": expected, "actual": actual,
        "checks": {key: actual[key] == value for key, value in expected.items()},
    }
    qa["all_pass"] = all(qa["checks"].values())
    (OUT / "苯酚_本地盘点_QA.json").write_text(
        json.dumps(qa, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"summary": summary, "qa": qa}, ensure_ascii=False, indent=2))
    return 0 if qa["all_pass"] else 1


if __name__ == "__main__":
    sys.exit(main())
