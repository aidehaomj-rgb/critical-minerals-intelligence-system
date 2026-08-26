from __future__ import annotations

import csv
import json
import sys
from collections import Counter
from pathlib import Path


ROOT = Path(r"D:\易迅数据\反倾销税深度分析报告")
OUT = ROOT / "19_丁腈橡胶"
SOURCE = OUT / "丁腈橡胶_本地深扫去重记录.csv"
TRACKER = ROOT / "00_全商品查询与报告进度台账.csv"


def to_num(value: object):
    text = str(value or "").strip().replace(",", "")
    if not text:
        return None
    try:
        return float(text)
    except ValueError:
        return None


def write_csv(path: Path, rows: list[dict], fields: list[str]) -> None:
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def write_json(path: Path, data: object) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def main() -> None:
    csv.field_size_limit(min(sys.maxsize, 2_000_000_000))
    OUT.mkdir(parents=True, exist_ok=True)
    source_rows = list(csv.DictReader(SOURCE.open(encoding="utf-8-sig", newline="")))
    selected = [
        row for row in source_rows
        if row.get("source_kind") == "易迅原始页面采集"
        and row.get("classification") == "NBR原胶/牌号候选"
    ]
    assert len(selected) == 10, len(selected)

    records: list[dict] = []
    for seq, row in enumerate(sorted(selected, key=lambda x: json.loads(x["record_json"])["日期"]), 1):
        raw = json.loads(row["record_json"])
        desc = raw.get("商品描述", "")
        origin = raw.get("原产国/地区", "")
        dest = raw.get("目的国/地区", "")
        is_knb = "KNB" in desc.upper()
        if is_knb and origin == "South Korea":
            scope = "高度匹配涉案NBR原胶牌号"
            route = "韩国来源→第三国A腿"
            grade = "B（A腿已见，B腿未见）"
            finding = "牌号、原产字段和收货主体可核；未发现该第三国主体向中国发运同牌号。"
            tax_note = "仅在后续进入中国且法定原产仍为韩国、又未缴AD时形成税差。KNB-35L若确为锦湖，AD及其引致VAT增量系数为中国完税价×13.56%。"
        else:
            scope = "混合货描待拆分"
            route = "非受税来源→印度"
            grade = "C（范围与货物拆分待核）"
            finding = "货描同时出现BUTYL与NBR，需发票行项目、CAS、COA和包装明细拆分；比利时不是本措施受税来源。"
            tax_note = "当前不能套用韩国/日本NBR反倾销税率。"

        hs = raw.get("HS编码", "")
        hs_risk = "货描指向NBR但外国数据税号为400239，需核原始申报/平台映射；该错位不是中国逃税证据。" if is_knb else "外国税号400239与混合货描均需核实。"
        records.append({
            "序号": seq,
            "记录ID": row["dedup_id"],
            "数据源": raw.get("数据源", ""),
            "进出口": raw.get("进出口", ""),
            "日期": raw.get("日期", ""),
            "HS编码_外国数据": hs,
            "商品描述": desc,
            "采购商": raw.get("采购商", ""),
            "供应商": raw.get("供应商", ""),
            "重量字段": raw.get("重量", ""),
            "数量字段": raw.get("数量", ""),
            "金额字段": raw.get("金额", ""),
            "目的国地区": dest,
            "平台原产国地区": origin,
            "产品范围判定": scope,
            "链路判定": route,
            "证据等级": grade,
            "逐票结论": finding,
            "税号风险": hs_risk,
            "条件税差口径": tax_note,
            "原始来源文件": row["source_file"],
            "原始位置": row["location"],
            "数据限制": "易迅页面导出未显式给出字段单位/币种、提单号、柜号、中国进口申报或税款书；平台原产字段不是中国法定原产认定。",
        })

    fields = list(records[0].keys())
    write_csv(OUT / "丁腈橡胶_易迅逐票判定台账_现有10条.csv", records, fields)
    write_json(OUT / "丁腈橡胶_易迅逐票判定台账_现有10条.json", records)
    knb = [r for r in records if "KNB" in r["商品描述"].upper()]
    write_csv(OUT / "丁腈橡胶_KNB35L韩国至第三国9条.csv", knb, fields)

    queries = [
        {
            "查询ID": "NBR-Q1",
            "目的": "中国进口主查询",
            "条件": "HS 40025910、40025990；目的国China；时间2018-11-09至最新；起运/原产全部；200条/页逐页读取",
            "关键词": "NBR|NITRILE BUTADIENE RUBBER|ACRYLONITRILE BUTADIENE RUBBER|丁腈橡胶|CAS 9003-18-3",
            "排除/分层": "NBR LATEX、XNBR、HNBR、手套、密封件、胶管、泡棉等单独分层，不机械并入原胶",
        },
        {
            "查询ID": "NBR-Q2",
            "目的": "牌号与实体补漏",
            "条件": "目的国China；时间2018-11-09至最新；HS可留空；每个关键词独立查询并跨查询去重",
            "关键词": "KNB|KUMHO NBR|NIPOL|ZEON|JSR NBR|ENEOS NBR",
            "排除/分层": "逐票核CAS、丙烯腈/丁二烯共聚物、块状/粉状固体、生产商和牌号TDS",
        },
        {
            "查询ID": "NBR-Q3",
            "目的": "第三国A/B腿闭环",
            "条件": "韩国/日本→印度、印尼、越南、马来西亚、新加坡、阿联酋；再查上述第三国→China；30/60/90日窗口",
            "关键词": "同Q1+Q2；优先KNB-35L、S.M. ASSOCIATES、PARKLAND WORLD INDONESIA、PIONEER COMMODITY、SINHWA、QINGDAO ZHONGLIANRONGCHUANG",
            "排除/分层": "必须叠加同批号/柜号/提单、相近数量、相同生产商；真实第三国产能与加工记录作为反证",
        },
    ]
    write_csv(OUT / "丁腈橡胶_易迅最简查询组合.csv", queries, list(queries[0].keys()))
    write_json(OUT / "丁腈橡胶_易迅最简查询组合.json", queries)

    counts = Counter(r["目的国地区"] for r in records)
    summary = {
        "snapshot_date": "2026-08-13",
        "policy": {
            "origins": ["韩国", "日本"],
            "hs_china": ["40025910", "40025990"],
            "effective_period": "2024-11-09至2029-11-08（期终复审续征）",
            "rates": {"韩国锦湖": "12.0%", "韩国LG化学": "15.0%", "韩国其他": "37.3%", "日本瑞翁": "28.1%", "ENEOS Materials": "16.0%", "日本其他": "56.4%"},
        },
        "local_audit": {
            "files_prefiltered": 313,
            "candidate_files": 45,
            "trade_records_confirmed": 10,
            "knb35l_korea_to_third_country": 9,
            "mixed_belgium_to_india": 1,
            "destination_counts": dict(counts),
            "indonesia_weight_field_total": sum(to_num(r["重量字段"]) or 0 for r in knb if r["目的国地区"] == "Indonesia"),
            "india_quantity_field_total_knb": sum(to_num(r["数量字段"]) or 0 for r in knb if r["目的国地区"] == "India"),
            "direct_taxed_origin_to_china_in_current_local_subset": 0,
            "closed_third_country_route_to_china": 0,
        },
        "conclusion": "现有数据证明韩国KUMHO KNB-35L流向印度、印尼的A腿，以及中国保税区贸易主体参与其中1票；未发现同批次或同牌号由第三国再进入中国的B腿，不能认定绕道或逃税。",
        "evidence_boundary": "页面专项全量NBR查询因网页长查询响应超时尚未完成；现有10条来自D盘既有原始页面采集的交叉命中，不能冒充易迅全库NBR结果。",
        "qa": {"records_equal_10": len(records) == 10, "knb_equal_9": len(knb) == 9, "no_b_leg_claim": True},
    }
    write_json(OUT / "丁腈橡胶_交付摘要.json", summary)

    tracker_rows = list(csv.DictReader(TRACKER.open(encoding="utf-8-sig", newline="")))
    tracker_fields = list(tracker_rows[0])
    matched = 0
    for item in tracker_rows:
        if item.get("序号") == "19":
            matched += 1
            item["易迅税号查询"] = "D盘全盘内容预筛已完成；NBR专项网页HS40025910/40025990全页查询因页面超时待补"
            item["易迅关键词查询"] = "现有原始页面交叉命中：KNB-35L 9条；混合BUTYL/NBR 1条；NBR/NITRILE/NIPOL/ZEON/ENEOS专项矩阵已生成"
            item["易迅页数"] = "专项全页待补；现有命中来自既有22页HS400239宽池"
            item["易迅记录数"] = "现有可审计贸易记录10条；KNB-35L韩国→印尼6条/重量字段100,800，韩国→印度3条/数量字段126；闭合B腿0"
            item["互联网实体检索"] = "完成：锦湖/ENEOS主体税率；印度Apcotex、台湾南帝、俄罗斯SIBUR真实产能反证；青岛保税贸易实体为优先调证线索"
            item["报告状态"] = "已完成：19_丁腈橡胶阶段深度报告+逐票CSV；未发现第三国→中国闭环，网页专项全页查询待补"
    assert matched == 1
    with TRACKER.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=tracker_fields)
        writer.writeheader()
        writer.writerows(tracker_rows)

    # Reload all outputs as a deterministic QA gate.
    assert len(list(csv.DictReader((OUT / "丁腈橡胶_易迅逐票判定台账_现有10条.csv").open(encoding="utf-8-sig")))) == 10
    assert len(json.loads((OUT / "丁腈橡胶_易迅逐票判定台账_现有10条.json").read_text(encoding="utf-8"))) == 10
    assert all(summary["qa"].values())


if __name__ == "__main__":
    main()
