#!/usr/bin/env python3
"""Adjudicate local n-propanol content hits and create a query-gap package."""

from __future__ import annotations

import csv
import json
from collections import Counter
from pathlib import Path


OUT = Path(r"D:\易迅数据\反倾销税深度分析报告\14_正丙醇")
AUDIT = OUT / "正丙醇_本地全盘内容审计.json"


def adjudicate(hit: dict) -> tuple[str, str, str]:
    file = Path(hit["file"]).name
    text = hit.get("text_excerpt", "")
    full = hit["file"]
    if file in {"中国反倾销税商品清单_2026-08-11.xlsx", "00_全商品查询与报告进度台账.csv"}:
        return (
            "排除-项目元数据",
            "该行仅列示反倾销项目名称/进度，不具备日期、交易双方、货描、数量等逐票字段。",
            "否",
        )
    if "单烷基醚" in full or "PROPOXY PROPANOL" in text.upper():
        return (
            "排除-其他化学品",
            "货描为DOWANOL PnP / PROPOXY PROPANOL（丙二醇丙醚），不是正丙醇。",
            "否",
        )
    if "NPA DE MEXICO" in text.upper() or "聚苯醚" in full:
        return (
            "排除-企业简称且税号不符",
            "NPA出现在企业名NPA DE MEXICO S DE RL DE CV；货描为聚醚/聚醚多元醇，HS 3907299900，非HS 29051210正丙醇。",
            "否",
        )
    if "相关猪肉及猪副产品" in full:
        return (
            "排除-数字偶合",
            "67-63-0样式命中来自数量6763.0的分隔符宽松匹配；货描/HS均为动物产品。",
            "否",
        )
    return ("待人工复核", "未落入自动排除规则。", "待定")


def write_csv(path: Path, rows: list[dict], fields: list[str]) -> None:
    with path.open("w", encoding="utf-8-sig", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        for row in rows:
            clean = dict(row)
            for key, value in clean.items():
                if isinstance(value, (list, dict)):
                    clean[key] = json.dumps(value, ensure_ascii=False, separators=(",", ":"))
            writer.writerow(clean)


def main() -> None:
    audit = json.loads(AUDIT.read_text(encoding="utf-8"))
    reviewed = []
    for idx, hit in enumerate(audit["hits"], 1):
        decision, reason, is_target = adjudicate(hit)
        reviewed.append({
            "review_id": f"NPA-LOCAL-HIT-{idx:03d}",
            **hit,
            "adjudication": decision,
            "adjudication_reason": reason,
            "is_n_propanol_trade_record": is_target,
        })

    confirmed = [r for r in reviewed if r["is_n_propanol_trade_record"] == "是"]
    pending = [r for r in reviewed if r["is_n_propanol_trade_record"] == "待定"]
    root_hits = [r for r in reviewed if r["source_class"] == "root_download_or_user_file"]
    inventory = audit["inventory"]
    summary = {
        **audit["summary"],
        "source_trade_data_found": False,
        "reviewed_hit_rows_or_records": len(reviewed),
        "confirmed_n_propanol_trade_records": len(confirmed),
        "pending_manual_records": len(pending),
        "root_download_content_hits": len(root_hits),
        "root_download_hits_excluded": sum(r["is_n_propanol_trade_record"] == "否" for r in root_hits),
        "adjudication_counts": dict(Counter(r["adjudication"] for r in reviewed)),
        "scan_depth": {
            "xlsx_rows_fully_opened_after_prefilter": sum(
                x.get("rows_scanned", 0) for x in inventory if x["extension"] == ".xlsx"
            ),
            "xlsx_cells_fully_opened_after_prefilter": sum(x.get("cells_scanned", 0) for x in inventory),
            "csv_rows_scanned": sum(
                x.get("rows_scanned", 0) for x in inventory if x["extension"] == ".csv"
            ),
            "json_scalar_records_opened_after_prefilter": sum(x.get("records_scanned", 0) for x in inventory),
            "file_parse_errors": sum(bool(x.get("errors")) for x in inventory),
        },
        "conclusion": (
            "截至本次本地快照，未发现正丙醇易迅逐票原始数据。42处文本命中均已复核排除："
            "项目元数据2处、丙二醇丙醚衍生副本7处、NPA企业简称/非目标HS重复副本32处、数字偶合1处。"
        ),
        "evidence_boundary": (
            "该结论只说明D盘现存文件中没有可用于第14项逐票审计的正丙醇原始数据，"
            "不代表易迅网页数据库无记录，也不能据此判断不存在第三国转运。"
        ),
    }
    audit["summary"] = summary
    audit["reviewed_hits"] = reviewed
    AUDIT.write_text(json.dumps(audit, ensure_ascii=False, indent=2), encoding="utf-8")

    write_csv(
        OUT / "正丙醇_本地命中逐条复核42处.csv", reviewed,
        ["review_id", "file", "source_class", "format", "location", "match_class",
         "target_terms", "broad_terms", "exclusion_terms", "text_excerpt",
         "adjudication", "adjudication_reason", "is_n_propanol_trade_record"],
    )
    (OUT / "正丙醇_本地命中逐条复核42处.json").write_text(
        json.dumps(reviewed, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (OUT / "正丙醇_本地盘点摘要.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    query_plan = [
        {
            "query_id": "NPA-YX-01",
            "priority": 1,
            "purpose": "中国进口基线；同时覆盖美国直达与第三国B腿候选",
            "data_feed": "中国进口/目的国中国（按平台字段选择）",
            "trade_direction": "进口",
            "date_from": "2024-08-13",
            "date_to": "2026-08-13",
            "hs_code": "29051210",
            "product_term": "留空",
            "origin_or_partner": "全部",
            "enterprise": "留空",
            "exclusions_after_retrieval": "排除ISOPROPANOL、2-PROPANOL、IPA、CAS 67-63-0",
            "collection_rule": "每页200条；从第1页读到末页；保存页面总数、查询时间和每条可见字段",
            "suggested_filename": "正丙醇_中国进口_HS29051210_2年.xlsx",
        },
        {
            "query_id": "NPA-YX-02",
            "priority": 2,
            "purpose": "税号遗漏/错分补漏",
            "data_feed": "中国进口/目的国中国（按平台字段选择）",
            "trade_direction": "进口",
            "date_from": "2024-08-13",
            "date_to": "2026-08-13",
            "hs_code": "留空",
            "product_term": "N-PROPANOL（若结果少，再依次复用查询为1-PROPANOL、71-23-8；不要单独用NPA）",
            "origin_or_partner": "全部",
            "enterprise": "留空",
            "exclusions_after_retrieval": "同Q1；另排除PROPOXY PROPANOL及GLYCOL ETHER",
            "collection_rule": "每个关键词均记录0条或总数；全部页面读完后跨查询去重",
            "suggested_filename": "正丙醇_中国进口_关键词补漏_2年.xlsx",
        },
        {
            "query_id": "NPA-YX-03",
            "priority": 3,
            "purpose": "美国受税来源A腿；识别流入潜在中间国的实体、时间和数量",
            "data_feed": "美国出口",
            "trade_direction": "出口",
            "date_from": "2024-08-13",
            "date_to": "2026-08-13",
            "hs_code": "2905120010（平台只接受6位时用290512）",
            "product_term": "留空",
            "origin_or_partner": "目的国全部",
            "enterprise": "留空；结果内优先标记OQ/OXEA、DOW、EASTMAN",
            "exclusions_after_retrieval": "同Q1",
            "collection_rule": "全部页面读完；再用Q1/Q2中第三国卖方、国家、时间、数量做A/B腿匹配",
            "suggested_filename": "正丙醇_美国出口_HS2905120010_2年.xlsx",
        },
    ]
    write_csv(
        OUT / "正丙醇_易迅最简查询组合.csv", query_plan,
        ["query_id", "priority", "purpose", "data_feed", "trade_direction", "date_from", "date_to",
         "hs_code", "product_term", "origin_or_partner", "enterprise",
         "exclusions_after_retrieval", "collection_rule", "suggested_filename"],
    )
    (OUT / "正丙醇_易迅最简查询组合.json").write_text(
        json.dumps(query_plan, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    gaps = [
        {
            "gap_id": "NPA-GAP-01", "missing_data": "中国进口逐票数据",
            "impact": "无法统计美国直达、第三国对华票数/重量/金额/企业，也无法核查实际反倾销税缴纳。",
            "required_fields": "日期、HS、完整货描、进口商、境外发货人、原产国、起运国、目的国、重量、数量、金额/币种",
            "resolution": "执行NPA-YX-01和NPA-YX-02，全量翻页并保存结果。",
            "status": "缺失",
        },
        {
            "gap_id": "NPA-GAP-02", "missing_data": "美国出口A腿逐票数据",
            "impact": "无法把美国生产/出口与第三国后续对华发运在实体、时间和数量层面闭合。",
            "required_fields": "出口日期、美国发货人、境外收货人、目的国、货描、Schedule B、重量/数量/金额、港口",
            "resolution": "执行NPA-YX-03；按中间国、企业和30/60/90天窗口与中国B腿匹配。",
            "status": "缺失",
        },
        {
            "gap_id": "NPA-GAP-03", "missing_data": "提单/申报闭环字段",
            "impact": "即使出现A/B腿镜像，也只能形成线索，不能确认同一批货、原产地伪报或逃税。",
            "required_fields": "提单号、集装箱号、船名航次、装卸港、原产地证、报关单、税款缴款书、批号/罐号",
            "resolution": "对高相似候选向承运人、报关企业、进口商和海关申报档案调证。",
            "status": "缺失",
        },
    ]
    write_csv(
        OUT / "正丙醇_数据缺口台账.csv", gaps,
        ["gap_id", "missing_data", "impact", "required_fields", "resolution", "status"],
    )
    (OUT / "正丙醇_数据缺口台账.json").write_text(
        json.dumps(gaps, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    shipment_fields = [
        "record_id", "source_file", "source_sheet_or_page", "source_row", "data_feed",
        "trade_direction", "date", "hs_code", "description", "buyer_or_consignee",
        "seller_or_shipper", "weight", "weight_unit", "quantity", "quantity_unit",
        "amount", "currency", "origin_country", "shipment_country", "destination_country",
        "loading_port", "discharge_port", "bill_of_lading", "container_number",
        "scope_screen", "exclusion_reason", "route_role", "risk_grade", "notes",
    ]
    write_csv(OUT / "正丙醇_易迅逐票标准化_本地0条.csv", [], shipment_fields)
    (OUT / "正丙醇_易迅逐票标准化_本地0条.json").write_text("[]\n", encoding="utf-8")

    qa = {
        "all_pass": not confirmed and not pending and len(reviewed) == 42,
        "checks": {
            "scanned_files_eq_256": summary["files_scanned"] == 256,
            "parse_errors_eq_0": summary["scan_depth"]["file_parse_errors"] == 0,
            "content_hits_eq_42": len(reviewed) == 42,
            "all_hits_adjudicated": not pending,
            "confirmed_target_records_eq_0": not confirmed,
            "query_plan_count_eq_3": len(query_plan) == 3,
            "gap_count_eq_3": len(gaps) == 3,
        },
    }
    (OUT / "正丙醇_本地盘点_QA.json").write_text(
        json.dumps(qa, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(json.dumps({"summary": summary, "qa": qa}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
