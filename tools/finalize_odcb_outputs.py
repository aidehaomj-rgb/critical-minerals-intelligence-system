#!/usr/bin/env python3
from __future__ import annotations

import csv
import json
from pathlib import Path

OUT = Path(r"D:\易迅数据\反倾销税深度分析报告\17_邻二氯苯")

queries = [
    {
        "query_id": "ODCB-Q1",
        "route": "全部来源国→中国",
        "date_range": "2024-01-23至最新（并补2019-01-23至2024-01-22历史基线）",
        "hs": "29039110；补查290391",
        "keywords": "ORTHO DICHLOROBENZENE | 1,2-DICHLOROBENZENE | O-DICHLOROBENZENE | ODCB | 95-50-1 | UN1591 | 邻二氯苯",
        "exclusions": "1,4-/PDCB/对二氯苯；1,3-/MDCB/间二氯苯；二氯硝基苯、二氯苯酚、二氯苯胺及其他衍生物",
        "purpose": "建立中国B腿全量底表；每页200条，读至末页并跨关键词去重",
    },
    {
        "query_id": "ODCB-Q2",
        "route": "日本、印度→全球（重点第三国）",
        "date_range": "2019-01-23至最新，重点2024-01-23以后",
        "hs": "29039110；各国六位/八位扩展码并行",
        "keywords": "同Q1，另加KUREHA、AARTI及Q1/Q2逐票出现的生产商和贸易商",
        "exclusions": "同Q1",
        "purpose": "获取受税来源A腿；按越南、新加坡、阿联酋、马来西亚、韩国、台湾、泰国、印尼分层",
    },
    {
        "query_id": "ODCB-Q3",
        "route": "候选第三国→中国",
        "date_range": "2019-01-23至最新",
        "hs": "29039110；补查290391",
        "keywords": "同Q1，并以Q2收货人/仓储商/贸易商名称逐个精确补查",
        "exclusions": "同Q1",
        "purpose": "按0—30/60/90/180日、净重±2%、批号、ISO罐号/柜号、船名航次和提单号闭合A/B腿",
    },
]

fields = ["query_id", "route", "date_range", "hs", "keywords", "exclusions", "purpose"]
with (OUT / "邻二氯苯_易迅最简查询组合.csv").open("w", encoding="utf-8-sig", newline="") as f:
    w = csv.DictWriter(f, fieldnames=fields); w.writeheader(); w.writerows(queries)
(OUT / "邻二氯苯_易迅最简查询组合.json").write_text(json.dumps(queries, ensure_ascii=False, indent=2), encoding="utf-8")

trade_fields = [
    "record_id", "query_id", "source_file", "sheet", "source_row", "data_source", "direction", "date", "hs",
    "description", "china_party", "overseas_party", "weight_field", "quantity_field", "amount_field", "destination",
    "platform_origin", "product_scope", "route_class", "evidence_grade", "finding", "required_evidence",
]
with (OUT / "邻二氯苯_易迅逐票标准化_本地0条.csv").open("w", encoding="utf-8-sig", newline="") as f:
    csv.writer(f).writerow(trade_fields)
(OUT / "邻二氯苯_易迅逐票标准化_本地0条.json").write_text("[]\n", encoding="utf-8")

summary = {
    "item_no": 17,
    "product": "邻二氯苯",
    "policy": {
        "taxed_origins": ["日本", "印度"],
        "hs": "29039110",
        "cas": "95-50-1",
        "effective_from": "2019-01-23",
        "review_continuation_from": "2025-01-23",
        "expected_end": "2030-01-22",
        "rates": {"日本全部公司": "70.4%", "印度全部公司": "31.9%"},
        "ad_plus_vat_increment_coefficients": {"日本": "79.552%×中国完税价格", "印度": "36.047%×中国完税价格"},
    },
    "local_audit": {
        "files_scanned": 294,
        "prefilter_candidate_files": 8,
        "reviewed_project_metadata_hits": 2,
        "confirmed_trade_records": 0,
        "direct_china_records": 0,
        "taxed_origin_to_third_records": 0,
        "third_country_to_china_records": 0,
    },
    "public_evidence": {
        "specific_china_circumvention_case_found": False,
        "closed_a_b_leg_found": False,
        "listed_japanese_producer": "KUREHA CORPORATION",
        "indian_capacity_from_review": "42,000吨/年（2019—2022口径）",
        "japanese_capacity_from_review": "13,000吨/年（2019—2022口径）",
    },
    "stage_conclusion": "现有D盘缺少邻二氯苯原始易迅逐票数据，公开源亦未形成日本/印度→第三国→中国同批闭环；当前只能列风险筛查路线，不能认定逃避反倾销税。",
}
(OUT / "邻二氯苯_阶段审计摘要.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps({"queries": len(queries), "trade_rows": 0, "summary": True}, ensure_ascii=False))
