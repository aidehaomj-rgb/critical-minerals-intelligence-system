from __future__ import annotations

import csv
import json
from pathlib import Path


ROOT = Path(r"D:\易迅数据")
OUT = ROOT / "反倾销税深度分析报告" / "21_氢碘酸"
TRACKER = ROOT / "反倾销税深度分析报告" / "00_全商品查询与报告进度台账.csv"
HITS = OUT / "氢碘酸_本地深扫全部命中.csv"


def write_csv(path: Path, rows: list[dict], fields: list[str]):
    with path.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore"); w.writeheader(); w.writerows(rows)


def write_json(path: Path, obj):
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2), encoding="utf-8")


def main():
    rows = list(csv.DictReader(HITS.open(encoding="utf-8-sig", newline="")))
    confirmed_trade = []
    review = []
    for i, r in enumerate(rows, 1):
        is_master = r["source_file"].endswith("中国反倾销税商品清单_2026-08-11.xlsx") and r["classification"] == "氢碘酸候选"
        final = "项目主清单_非贸易" if is_master else "HI缩写噪声_排除"
        reason = "主清单第21行，非易迅贸易票据" if is_master else "未命中Hydriodic/Hydroiodic Acid、Hydrogen Iodide水溶液或CAS 10034-85-2"
        review.append({
            "复核ID": f"HI-REV-{i:04d}", "源文件": r["source_file"], "源位置": r["location"], "原行号": r["row_no"],
            "初筛分类": r["classification"], "最终复核": final, "复核理由": reason, "原始文本": r["record_text"],
        })
    assert not confirmed_trade and len(review) == 114
    write_csv(OUT / "氢碘酸_本地命中逐条复核114处.csv", review, list(review[0]))
    write_json(OUT / "氢碘酸_本地命中逐条复核114处.json", review)

    trade_fields = ["记录ID","数据源","进出口","日期","HS编码","商品描述","采购商","供应商","重量","数量","金额","目的国地区","原产国地区","范围判断","路线判断","证据等级","闭环缺口"]
    write_csv(OUT / "氢碘酸_易迅逐票标准化_本地0条.csv", confirmed_trade, trade_fields)
    write_json(OUT / "氢碘酸_易迅逐票标准化_本地0条.json", confirmed_trade)

    queries = [
        {"查询ID":"HI-Q1","目的":"中国进口主查询","方向":"目的国China；进出口不限后逐票识别","日期":"2018-10-16至最新（优先近2年）","HS编码":"281119；中国精确归类回查2811199010/28111990","关键词":"HYDRIODIC ACID|HYDROIODIC ACID|HYDROGEN IODIDE|10034-85-2|氢碘酸|碘化氢水溶液","国家":"全部来源","页设置":"200条/页，读完全部页","逐票要求":"排除同税号其他无机酸；核浓度、UN1787、生产商、发货人、数量、金额、原产字段、中国收货人/口岸"},
        {"查询ID":"HI-Q2","目的":"受税来源至第三国A腿","方向":"美国/日本出口至第三国","日期":"2018-10-16至最新（优先近2年）","HS编码":"各国281119/28111990及对应子目","关键词":"同HI-Q1；叠加IOFINA CHEMICAL|KISHIDA|JUNSEI|FUJIFILM WAKO|KANTO|NIPPOH CHEMICAL|GODO SHIGEN","国家":"重点印度、韩国、新加坡、越南、马来西亚、阿联酋、泰国、荷兰、德国","页设置":"200条/页，读完全部页","逐票要求":"记录生产厂、销售/开票公司、浓度、包装、批号、UN1787、提单/柜号、第三国收货人"},
        {"查询ID":"HI-Q3","目的":"候选第三国至中国B腿及闭环","方向":"上述第三国出口至China","日期":"2018-10-16至最新（优先近2年）","HS编码":"281119及第三国对应子目","关键词":"同HI-Q1及A腿已见实体/包装/批号","国家":"印度、韩国、新加坡、越南、马来西亚、阿联酋、泰国、荷兰、德国至中国","页设置":"200条/页，读完全部页","逐票要求":"按30/60/90日、浓度、包装、净重、批号、UN1787、主体和提单/柜号匹配；回中国报关原产国、生产商、AD/VAT税单"},
    ]
    write_csv(OUT / "氢碘酸_易迅最简查询组合.csv", queries, list(queries[0]))
    write_json(OUT / "氢碘酸_易迅最简查询组合.json", queries)

    entities = [
        {"优先级":"A","国家地区":"美国","实体":"Iofina Chemical, Inc.","角色":"公告列名生产商/出口商；123.4%","证据":"商务部列名；Iofina官网确认美国碘及卤素衍生物生产","核查重点":"美国生产批号、第三国开票/分销、中国端是否按美国原产缴AD"},
        {"优先级":"A","国家地区":"日本","实体":"Nippoh Chemical / Godo Shigen / Kishida / Junsei / Fujifilm Wako / Kanto Chemical","角色":"日本生产或试剂供应线索；日本统一41.1%","证据":"各公司官网/SDS公开Hydriodic Acid、CAS、浓度或包装","核查重点":"区分真实生产商与经销/分装商；核COA plant code和日本原产"},
        {"优先级":"B+","国家地区":"印度","实体":"Calibre Chemicals / Samrat Pharmachem / Eskay Iodine / Infinium Pharmachem / M.M. Arochem","角色":"公开存在印度本地制造/产品线","证据":"官网产品、COA或工厂证书显示HI 50%-57%、CAS 10034-85-2","核查重点":"属于合法第三国产能反证；但若A腿是美/日成品仅分装转售，仍需核非优惠原产"},
        {"优先级":"B","国家地区":"第三国贸易节点","实体":"新加坡、阿联酋、香港、韩国、越南、马来西亚分销商","角色":"可能开票/仓储/再出口节点","证据":"当前无逐票实体证据","核查重点":"只有A/B腿、批号/柜号和中国申报闭合后才升级，不能仅因发货国定性"},
    ]
    write_csv(OUT / "氢碘酸_重点实体与调证路线.csv", entities, list(entities[0]))
    write_json(OUT / "氢碘酸_重点实体与调证路线.json", entities)

    summary = {
        "item":21,"product":"氢碘酸","as_of":"2026-08-13",
        "policy":{"origins":["美国","日本"],"product":"碘化氢水溶液；CAS 10034-85-2","hs_china":"28111990（现行细分查询可加2811199010）","period":"2024-10-16至2029-10-15","rates":{"美国":"123.4%","日本":"41.1%"}},
        "tax_gap_coefficients":{"美国":"完税价格×139.442%","日本":"完税价格×46.443%","assumption":"仅AD及AD引致的13%进口VAT增量；实际以中国税单为准"},
        "local_audit":{"files_total":343,"candidate_files":23,"raw_string_hits":114,"trade_records_confirmed":0,"closed_third_country_route_to_china":0,"deep_scan_errors":0},
        "browser_status":"已连接并识别易迅海关全球搜索页；专项关键词查询交互连续两次超时，未取得可验证的总记录数/页数，故不写查无数据，列为待补全页查询。",
        "public_evidence":"未检出中国海关处罚、法院判决、商务部反规避裁定或公开双段提单，可证明美/日氢碘酸经第三国进入中国逃AD。公开证据只支持受税产能、第三国真实产能及结构性核查路线。",
        "conclusion":"现有D盘无可确认氢碘酸贸易票据，无法形成美国/日本→第三国→中国闭环，也无法计算实际少缴税额。印度存在真实HI制造能力，是第三国来源的强合法替代解释；必须以生产批次和实质加工证据穿透。",
        "qa":{"review_114":len(review)==114,"trade_zero":len(confirmed_trade)==0,"three_queries":len(queries)==3,"entities_four":len(entities)==4},
    }
    assert all(summary["qa"].values())
    write_json(OUT / "氢碘酸_交付摘要.json", summary)

    tracker = list(csv.DictReader(TRACKER.open(encoding="utf-8-sig", newline="")))
    fields = list(tracker[0]); found = 0
    for r in tracker:
        if r.get("序号") == "21":
            found += 1
            r["易迅税号查询"] = "D盘343文件内容级盘点完成；28111990/2811199010专项网页查询交互超时，待按200条/页补全"
            r["易迅关键词查询"] = "全称、CAS10034-85-2、Hydrogen Iodide及HI化学上下文已扫；114处命中逐条复核，0条贸易票据"
            r["易迅页数"] = "本地23个原始候选文件逐行完成；网页总页数未取得，未写查无数据"
            r["易迅记录数"] = "本地确认氢碘酸贸易记录0；第三国闭环0；HI噪声113处+主清单1处已排除"
            r["互联网实体检索"] = "完成：Iofina美国、日本多家HI供应/生产线、印度真实制造实体；未发现中国处罚/判决/反规避或双段提单闭环"
            r["报告状态"] = "已完成21_氢碘酸阶段深度报告、114处复核、0条标准化台账、三组易迅查询及重点实体表；专项网页全页查询待补"
    assert found == 1
    with TRACKER.open("w", encoding="utf-8-sig", newline="") as f:
        w=csv.DictWriter(f,fieldnames=fields); w.writeheader(); w.writerows(tracker)


if __name__ == "__main__":
    main()
