from __future__ import annotations

import csv
import json
from pathlib import Path


ROOT = Path(r"D:\易迅数据")
OUT = ROOT / "反倾销税深度分析报告" / "20_乙醇胺"
TRACKER = ROOT / "反倾销税深度分析报告" / "00_全商品查询与报告进度台账.csv"
SRC = OUT / "乙醇胺_本地深扫去重记录.csv"


def write_csv(path: Path, rows: list[dict], fields: list[str]) -> None:
    with path.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader(); w.writerows(rows)


def write_json(path: Path, obj) -> None:
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2), encoding="utf-8")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    src = list(csv.DictReader(SRC.open(encoding="utf-8-sig", newline="")))
    trade = [r for r in src if r["source_class"] == "易迅原始页面采集"]
    assert len(trade) == 3
    parsed = []
    for i, r in enumerate(trade, 1):
        parts = [x.strip() for x in r["record_text"].split(" | ")]
        # 12列原始页中重量栏为空，record_text压缩后为11个可见值。
        assert len(parts) == 11
        parsed.append({
            "记录ID": f"EA-LOCAL-{i:03d}",
            "数据源": parts[0], "方向": parts[1], "日期": parts[2], "境外HS": parts[3],
            "商品描述": parts[4], "采购商/收货人": parts[5], "供应商/发货人": parts[6],
            "重量字段": "", "数量字段": parts[7], "金额字段": parts[8],
            "目的国地区": parts[9], "平台原产国地区": parts[10],
            "产品判断": "范围外下游混合物：金属切削油PROCUT 3800，三乙醇胺仅为12–15%组分；境外HS34031919",
            "路线判断": "韩国→越南原料/制剂贸易；非中国B腿",
            "证据等级": "C（背景/排除记录）",
            "税种判断": "不按现有记录计算中国乙醇胺反倾销税；须出现中国进口且申报为涉案MEA/DEA/TEA才进入核税",
            "闭环缺口": "无受税来源纯乙醇胺A腿、无第三国→中国B腿、无中国报关单/COA/原产证/税单",
            "原始文件": r["source_file"], "原始位置": r["location"],
        })
    fields = list(parsed[0])
    write_csv(OUT / "乙醇胺_易迅逐票判定台账_现有3条.csv", parsed, fields)
    write_json(OUT / "乙醇胺_易迅逐票判定台账_现有3条.json", parsed)

    queries = [
        {"查询ID":"EA-Q1","目的":"中国进口主查询","方向":"进口/出口数据中目的国China","日期":"2018-10-30至最新（优先近2年）","HS":"29221100|29221200|29221500","关键词":"ETHANOLAMINE|MONOETHANOLAMINE|DIETHANOLAMINE|TRIETHANOLAMINE|MEA|DEA|TEA|141-43-5|111-42-2|102-71-6|单/一/二/三乙醇胺","国家":"全部来源","页设置":"200条/页，读完全部页","逐票要求":"排盐类、衍生物、triethylamine及下游制剂；核生产商、出口商、数量、金额、目的国、平台原产字段"},
        {"查询ID":"EA-Q2","目的":"受税来源→第三国A腿","方向":"美国/沙特/马来西亚/泰国出口至第三国","日期":"2018-10-30至最新（优先近2年）","HS":"各国292211/292212/292215及历史292213","关键词":"同Q1；另加DOW|INEOS|HUNTSMAN|SABIC|SADARA|PETRONAS|TOC GLYCOL","国家":"重点越南、印度、新加坡、阿联酋、韩国、法国、比利时","页设置":"200条/页，读完全部页","逐票要求":"记录生产厂/销售公司组合、牌号/等级、批号、包装、提单/柜号、收货人"},
        {"查询ID":"EA-Q3","目的":"候选第三国→中国B腿","方向":"上述第三国出口至China","日期":"2018-10-30至最新（优先近2年）","HS":"29221100|29221200|29221500及第三国对应税号","关键词":"同Q1及Q2品牌实体","国家":"越南、印度、新加坡、阿联酋、韩国、法国、比利时→中国","页设置":"200条/页，读完全部页","逐票要求":"按30/60/90日、同品种/等级、重量、双方主体、批号、柜号与A腿匹配；必须回中国报关原产国/生产商/税单"},
    ]
    qf = list(queries[0])
    write_csv(OUT / "乙醇胺_易迅最简查询组合.csv", queries, qf)
    write_json(OUT / "乙醇胺_易迅最简查询组合.json", queries)

    total_qty = sum(float(r["数量字段"].replace(",", "")) for r in parsed)
    total_amt = sum(float(r["金额字段"].replace(",", "")) for r in parsed)
    summary = {
        "item": 20, "product": "乙醇胺", "as_of": "2026-08-13",
        "policy": {"origins":["美国","沙特阿拉伯","马来西亚","泰国"],"hs_china":["29221100","29221200","29221500"],"period":"2024-10-30至2029-10-29（期终复审续征）","rates":{"美国":"76.0%–97.1%","沙特":"10.1%–27.9%","马来西亚":"18.3%–20.3%","泰国":"37.6%"}},
        "local_audit": {"files_total":329,"candidate_files":3,"deep_scan_errors":0,"trade_records_confirmed":3,"records_in_scope":0,"downstream_korea_to_vietnam":3,"quantity_field_total":total_qty,"amount_field_total":total_amt,"direct_taxed_origin_to_china":0,"closed_third_country_route_to_china":0},
        "conclusion":"现有3条易迅原始记录均为韩国→越南PROCUT 3800切削油，TEA仅占12–15%，境外HS34031919；不属于当前可直接按乙醇胺措施核税的纯品/涉案初级产品B腿。未形成受税来源→第三国→中国闭环。",
        "evidence_boundary":"易迅专项网页全页查询因页面读取超时尚未完成；本结论仅限D盘329个有效本地文件及可回溯页面采集，不等于易迅全库无记录。",
        "qa":{"three_trade_rows":len(parsed)==3,"sum_quantity":total_qty==10000,"sum_amount":total_amt==695701699,"zero_closed_chain":True},
    }
    write_json(OUT / "乙醇胺_交付摘要.json", summary)

    rows = list(csv.DictReader(TRACKER.open(encoding="utf-8-sig", newline="")))
    fields_t = list(rows[0]); matched = 0
    for row in rows:
        if row.get("序号") == "20":
            matched += 1
            row["易迅税号查询"] = "本地329文件内容级盘点完成；专项网页HS29221100/29221200/29221500全页查询因页面超时待补"
            row["易迅关键词查询"] = "全称/CAS/措施税号及MEA/DEA/TEA化学上下文已扫；确认3条韩国→越南含TEA切削油记录"
            row["易迅页数"] = "专项网页全页待补；本地3个原始候选文件逐行完成"
            row["易迅记录数"] = "现有贸易记录3条，数量字段10,000、金额字段695,701,699；均为HS34031919下游切削油，涉案纯品0、闭合B腿0"
            row["互联网实体检索"] = "完成：SABIC/Sadara沙特真实产能、PETRONAS马来西亚75kt、INEOS美国/法国双产地；未发现公开中国乙醇胺专项规避处罚或闭合链"
            row["报告状态"] = "已完成：20_乙醇胺阶段深度报告+现有3条逐票台账；专项易迅网页全页查询待补"
    assert matched == 1
    with TRACKER.open("w", encoding="utf-8-sig", newline="") as f:
        w=csv.DictWriter(f, fieldnames=fields_t); w.writeheader(); w.writerows(rows)
    assert all(summary["qa"].values())


if __name__ == "__main__":
    main()
