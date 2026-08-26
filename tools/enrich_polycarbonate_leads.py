from __future__ import annotations

import csv
import json
import os
import re
from collections import Counter, defaultdict
from pathlib import Path


OUT = Path(os.environ.get("PC_OUT_DIR", r"D:\易迅数据\反倾销税深度分析报告\07_聚碳酸酯"))


def fnum(value):
    try:
        return float(value or 0)
    except (TypeError, ValueError):
        return 0.0


def aggregate(rows, field):
    groups = defaultdict(lambda: {"records": 0, "quantity_field_sum": 0.0, "amount_field_sum": 0.0})
    for row in rows:
        key = row.get(field) or "(空白)"
        groups[key]["records"] += 1
        groups[key]["quantity_field_sum"] += fnum(row.get("quantity"))
        groups[key]["amount_field_sum"] += fnum(row.get("amount"))
    return [
        {field: key, **value}
        for key, value in sorted(groups.items(), key=lambda item: (-item[1]["quantity_field_sum"], item[0]))
    ]


def assess(row):
    desc = row["description"].upper()
    declarations = sorted(set(re.findall(r"\b\d{12}\b", desc)))
    if "EMERGE" in desc:
        producer = "Trinseo Taiwan（牌号推定，须生产商栏确认）"
        likely_rate = 0.224
        rate_basis = "台湾盛禧奥/Trinseo参加调查但未获单列，符合范围时暂按其他台湾公司22.4%情景"
    elif "6715VT" in desc:
        producer = "奇美实业（WONDERLITE牌号推定，须生产商栏确认）"
        likely_rate = 0.122
        rate_basis = "奇美实业终裁税率12.2%"
    else:
        producer = "待查"
        likely_rate = None
        rate_basis = "生产商未锁定，可能适用9.0%、12.2%或22.4%"
    if any(term in desc for term in ("PC/ABS", "PC+ABS", "PC /ABS", "PC-ABS")):
        return {
            "final_scope_screen": "倾向范围外",
            "scope_basis": "货描为PC/ABS合金；终裁排除双酚A型PC按重量计含量小于99%的产品",
            "route_priority": "C",
            "recommended_action": "用TDS确认PC含量；如低于99%，不适用本案反倾销税",
            "pre_entry_numbers": declarations,
            "producer_inference": producer,
            "likely_ad_rate": likely_rate,
            "rate_basis": rate_basis,
        }
    if "PPA+50%GF" in desc or "HAT NHUA PPA" in desc:
        return {
            "final_scope_screen": "明确非本案商品",
            "scope_basis": "货描为PPA加50%玻纤，并非聚碳酸酯",
            "route_priority": "D",
            "recommended_action": "核税号误用，不计聚碳酸酯反倾销税风险",
            "pre_entry_numbers": declarations,
            "producer_inference": producer,
            "likely_ad_rate": likely_rate,
            "rate_basis": rate_basis,
        }
    if "IC8800624" in desc or "IC8800412" in desc:
        return {
            "final_scope_screen": "已有范围外反证",
            "scope_basis": "公开越南进口货描对同色号列示PC 90–98%及TiO2 2–10%，低于终裁99%门槛；须用原始申报/TDS复核",
            "route_priority": "C+",
            "recommended_action": "优先调该色号TDS及越南进口申报，当前不计税差",
            "pre_entry_numbers": declarations,
            "producer_inference": producer,
            "likely_ad_rate": likely_rate,
            "rate_basis": rate_basis,
        }
    if declarations:
        priority = "B+"
        action = "按所列越南前序进口申报号调A腿，再配对中国进口报关单、CO和税款缴款书"
    elif "SIL-MORE" in (row.get("china_party", "") + row.get("foreign_party", "")).upper():
        priority = "B+"
        action = "调SIL-MORE越南入库/原进口申报、色号TDS、批号及中国进口报关税单"
    else:
        priority = "B"
        action = "调TDS/COA、台湾生产商、越南前序进口申报及中国进口报关税单"
    return {
        "final_scope_screen": "范围待TDS/COA",
        "scope_basis": "货描显示台湾来源聚碳酸酯/树脂，但未披露双酚A型PC重量含量是否达到99%",
        "route_priority": priority,
        "recommended_action": action,
        "pre_entry_numbers": declarations,
        "producer_inference": producer,
        "likely_ad_rate": likely_rate,
        "rate_basis": rate_basis,
    }


def main():
    with (OUT / "聚碳酸酯_易迅_HS390740_TW重点线索.csv").open(encoding="utf-8-sig") as f:
        canonical = list(csv.DictReader(f))
    with (OUT / "聚碳酸酯_易迅_HS390740_缺页恢复候选.csv").open(encoding="utf-8-sig") as f:
        recovery = [row for row in csv.DictReader(f) if row.get("tail_origin_marker") == "TW"]

    enriched = []
    for row in canonical:
        row = dict(row)
        row.update(assess(row))
        row["dataset_status"] = "主抓取可见唯一记录"
        enriched.append(row)
    for row in recovery:
        row = dict(row)
        row.update(assess(row))
        row["dataset_status"] = "缺页备用历史抓取；须重新抓取复核"
        enriched.append(row)

    canonical_pending = [
        r for r in enriched
        if r["dataset_status"] == "主抓取可见唯一记录" and r["final_scope_screen"] == "范围待TDS/COA"
    ]
    canonical_excluded = [
        r for r in enriched
        if r["dataset_status"] == "主抓取可见唯一记录" and r["final_scope_screen"] != "范围待TDS/COA"
    ]
    pending_amount = sum(fnum(r.get("amount")) for r in canonical_pending)
    tax_scenarios = []
    for company, rate in [
        ("台湾化纤/台湾出光", 0.09),
        ("奇美/奇菱", 0.122),
        ("其他台湾地区公司", 0.224),
    ]:
        ad = pending_amount * rate
        vat_delta = ad * 0.13
        tax_scenarios.append(
            {
                "company_scenario": company,
                "ad_rate": rate,
                "amount_field_proxy": pending_amount,
                "conditional_ad": ad,
                "conditional_vat_delta": vat_delta,
                "conditional_total": ad + vat_delta,
                "warning": "仅当金额字段可作为同币种完税价格代理、牌号落入范围、中国端未征税时成立；不是认定欠税。",
            }
        )

    producer_scenarios = []
    producer_groups = defaultdict(list)
    for row in canonical_pending:
        producer_groups[row["producer_inference"]].append(row)
    for producer, group in producer_groups.items():
        amount = sum(fnum(r.get("amount")) for r in group)
        qty = sum(fnum(r.get("quantity")) for r in group)
        rates = sorted({r["likely_ad_rate"] for r in group if r["likely_ad_rate"] is not None})
        if rates:
            rate_options = rates
        else:
            rate_options = [0.09, 0.122, 0.224]
        for rate in rate_options:
            ad = amount * rate
            vat_delta = ad * 0.13
            producer_scenarios.append(
                {
                    "producer_scenario": producer,
                    "records": len(group),
                    "quantity_field_sum": qty,
                    "amount_field_proxy": amount,
                    "ad_rate": rate,
                    "conditional_ad": ad,
                    "conditional_vat_delta": vat_delta,
                    "conditional_total": ad + vat_delta,
                    "warning": "仍须逐色号确认PC含量达到99%、生产商和中国端未征税；金额字段币种未在本地JSON列示。",
                }
            )

    summary = {
        "policy": {
            "measure": "商务部公告2024年第13号",
            "effective": "2024-04-20",
            "expiry": "2029-04-19",
            "hs": "39074000",
            "scope": "双酚A型聚碳酸酯按重量计含量达到99%的产品；低于99%不在范围",
            "rates": {"台湾化纤/台湾出光": "9.0%", "奇美/奇菱": "12.2%", "其他台湾地区公司": "22.4%"},
            "vat_increment_scenario": "反倾销税×13%",
        },
        "data_integrity": {
            "page_occurrences_claimed": 2629,
            "effective_page_slots_after_removing_copied_page": 2429,
            "exact_unique_records": 2324,
            "copied_page": "第6页与第7页逐行相同",
            "estimated_missing_interval": "2025-06-17至2025-08-15附近",
            "status": "未完成：必须重抓缺页，并补做商品关键词与台湾A腿查询",
        },
        "tw_b_leg": {
            "canonical_records": len(canonical),
            "canonical_quantity_field_sum": sum(fnum(r.get("quantity")) for r in canonical),
            "canonical_amount_field_sum": sum(fnum(r.get("amount")) for r in canonical),
            "pending_scope_records_after_known_exclusions": len(canonical_pending),
            "pending_scope_quantity_field_sum": sum(fnum(r.get("quantity")) for r in canonical_pending),
            "pending_scope_amount_field_sum": pending_amount,
            "known_or_likely_outside_records": len(canonical_excluded),
            "known_or_likely_outside_quantity_field_sum": sum(fnum(r.get("quantity")) for r in canonical_excluded),
            "recovery_tw_records": len(recovery),
            "recovery_tw_quantity_field_sum": sum(fnum(r.get("quantity")) for r in recovery),
            "entities_pending_scope": aggregate(canonical_pending, "foreign_party"),
            "pre_entry_traceable_records": sum(1 for r in canonical_pending if r["pre_entry_numbers"]),
            "pre_entry_traceable_quantity_field_sum": sum(
                fnum(r.get("quantity")) for r in canonical_pending if r["pre_entry_numbers"]
            ),
        },
        "tax_scenarios": tax_scenarios,
        "producer_specific_tax_scenarios": producer_scenarios,
        "evidence_conclusion": {
            "proven": "越南对华B腿中存在货描明确保留#&TW的台湾来源PC/PC合金记录；部分引用越南前序进口申报。",
            "not_proven": "未证明中国进口申报改报越南原产、未缴反倾销税，亦未形成同批台湾A腿—越南—中国双段提单闭环。",
        },
        "public_sources": [
            {
                "title": "商务部公告2024年第13号",
                "url": "https://www.mofcom.gov.cn/zcfb/zgdwjjmywg/art/2024/art_ead5e0f4810c4a6a9fd02a86e72421dd.html",
                "use": "终裁范围、税率、期限、商业销售路径",
            },
            {
                "title": "Trinseo EMERGE Advanced Resins",
                "url": "https://www.trinseo.com/solutions/polycarbonate/emerge",
                "use": "EMERGE可包含PC与ABS/PET/色料等复合或添加体系，牌号不能整体认定为纯PC",
            },
            {
                "title": "Trinseo Hsinchu certifications",
                "url": "https://www.trinseo.com/company/quality-environment-health-safety-and-certifications/trinseo-management-system-standards-and-iso-certifications",
                "use": "确认台湾新竹存在EMERGE PC/PC-ABS及再生含量牌号相关着色、共混能力",
            },
            {
                "title": "Volza同色号公开货描（仅作回查线索）",
                "url": "https://www.volza.com/p/titanium-dioxide/export/hsn-code-39074000/",
                "use": "IC8800624/IC8800412出现PC90–98%+TiO2描述；非官方一手，须调原始申报核实",
            },
        ],
    }

    (OUT / "聚碳酸酯_TW线索人工复核.json").write_text(
        json.dumps({"summary": summary, "records": enriched}, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    columns = [
        "dataset_status", "record_id", "date", "data_source", "description", "china_party",
        "foreign_party", "weight", "quantity", "amount", "platform_origin", "tail_origin_marker",
        "scope_category", "final_scope_screen", "scope_basis", "route_priority", "pre_entry_numbers",
        "producer_inference", "likely_ad_rate", "rate_basis", "recommended_action", "route_reason",
    ]
    with (OUT / "聚碳酸酯_TW线索人工复核.csv").open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=columns, extrasaction="ignore")
        writer.writeheader()
        for row in enriched:
            row = dict(row)
            row["pre_entry_numbers"] = ";".join(row["pre_entry_numbers"])
            writer.writerow(row)

    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
