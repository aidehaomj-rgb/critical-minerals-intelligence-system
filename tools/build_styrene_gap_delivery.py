from __future__ import annotations

import csv
import json
from pathlib import Path


OUT = Path(r"D:\易迅数据\反倾销税深度分析报告\23_苯乙烯")


def write_csv(name: str, rows: list[dict]) -> None:
    path = OUT / name
    fields = list(rows[0].keys()) if rows else ["说明"]
    with path.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)

    queries = [
        {
            "查询ID": "STY-Q1",
            "目的": "中国进口主查询",
            "方向": "目的国China；进出口不限后逐票识别",
            "日期": "2024-06-23至最新（优先近2年）",
            "HS编码": "290250；中国精确归类29025000",
            "关键词": "STYRENE MONOMER|STYRENE|SM|PHENYLETHYLENE|VINYLBENZENE|ETHENYLBENZENE|100-42-5|苯乙烯|乙烯基苯|苏合香烯|乙烯苯",
            "国家": "全部来源",
            "页设置": "200条/页，读完全部页",
            "逐票要求": "排除聚苯乙烯、SBS/SBR/ABS/EPS等下游制品；核UN2055、纯度、抑制剂、生产商、船名航次、数量、金额、原产字段、中国进口人/口岸",
        },
        {
            "查询ID": "STY-Q2",
            "目的": "受税来源至第三国A腿",
            "方向": "韩国/台湾地区/美国出口至第三国",
            "日期": "2024-06-23至最新（优先近2年）",
            "HS编码": "各国290250及对应子目",
            "关键词": "同STY-Q1；叠加HANWHA TOTAL|YECHUN NCC|LOTTE CHEMICAL|LG CHEM|SK GEO CENTRIC|FORMOSA CHEMICALS|LYONDELL|WESTLAKE|INEOS STYROLUTION|AMSTY",
            "国家": "重点新加坡、印尼、马来西亚、越南、印度、泰国、阿联酋、荷兰",
            "页设置": "200条/页，读完全部页",
            "逐票要求": "记录生产厂/销售公司、COA批次、纯度/抑制剂、UN2055、船名航次、分提单、储罐/码头和第三国收货人",
        },
        {
            "查询ID": "STY-Q3",
            "目的": "候选第三国至中国B腿及闭环",
            "方向": "上述第三国出口至China",
            "日期": "2024-06-23至最新（优先近2年）",
            "HS编码": "290250及第三国对应子目",
            "关键词": "同STY-Q1及A腿已见实体/生产厂/船舶",
            "国家": "新加坡、印尼、马来西亚、越南、印度、泰国、阿联酋、荷兰至中国",
            "页设置": "200条/页，读完全部页",
            "逐票要求": "按7/15/30/60日、船名航次、装卸港、数量、COA批次、抑制剂/纯度和共同贸易主体匹配；回中国报关原产国、生产商、AD/VAT税单",
        },
    ]
    write_csv("苯乙烯_易迅最简查询组合.csv", queries)

    gaps = [
        {"缺口ID": "G1", "缺口": "中国进口逐票数据", "现状": "D盘未发现苯乙烯专项原始票据；2026-08-13网页搜索提交后持续超时，未取得可靠总数、分页或任何逐票记录", "影响": "不能对中国进口人、口岸、数量及税款作事实结论", "补证": "执行STY-Q1并保存每页200条原始JSON/CSV"},
        {"缺口ID": "G2", "缺口": "受税来源至第三国A腿", "现状": "未完成易迅全页采集", "影响": "不能构造生产商—第三国收货人—船舶链", "补证": "执行STY-Q2，保留船名航次、COA、罐区和分提单"},
        {"缺口ID": "G3", "缺口": "第三国至中国B腿", "现状": "未完成易迅全页采集", "影响": "公开产能与贸易网络只能说明结构风险或合法替代，不能证明绕道", "补证": "执行STY-Q3并与A腿按7/15/30/60日匹配"},
        {"缺口ID": "G4", "缺口": "中国海关闭环单证", "现状": "无进口报关单、原产地证、生产商声明、完税价格和税款缴款书", "影响": "任何税差只能按完税价格V作情景系数", "补证": "调取中国报关、COA/原产证、合同发票、付款、提单、反倾销税及进口VAT缴款书"},
    ]
    write_csv("苯乙烯_数据缺口台账.csv", gaps)

    sources = [
        {"类型": "政策", "来源": "商务部公告2024年第24号", "链接": "https://www.mofcom.gov.cn/zcfb/blgg/gg/2024/art/2024/art_37cbd5e452754ce9876065eaa25f9468.html", "支持事实": "2024-06-23起续征5年；HS29025000；完整企业税率和计税公式"},
        {"类型": "产品/产能", "来源": "台湾化学纤维苯乙烯产品页", "链接": "https://en.fcfc.com.tw/styrene-monomer", "支持事实": "苯乙烯产品规格，受税生产商真实生产"},
        {"类型": "第三国真实产能", "来源": "Shell Jurong Island", "链接": "https://www.shell.com.sg/about-us/what-we-do/projects-and-sites/shell-jurong-island.html", "支持事实": "新加坡Jurong Island生产苯乙烯单体"},
        {"类型": "第三国真实产能", "来源": "BASF关于ELLBA Eastern公告", "链接": "https://www.basf.com/dam/jcr%3A74fc24af-55c7-3221-a40b-82025714dfaa/basf/www/global/documents/en/investor-relations/basf-at-a-glance/strategy/portfolio-optimization/press-releases/P437e_BASF-to-sell-shares-in-ELLBA-Eastern.pdf", "支持事实": "新加坡ELLBA Eastern年产55万吨苯乙烯单体"},
        {"类型": "第三国真实产能", "来源": "Chandra Asri苯乙烯产品页", "链接": "https://chandra-asri.com/en/our-business/chemical-solutions/styrene-monomer", "支持事实": "印尼存在苯乙烯单体生产"},
    ]
    write_csv("苯乙烯_公开来源台账.csv", sources)

    summary = {
        "item": 23,
        "product": "苯乙烯",
        "hs_cn": "29025000",
        "cas": "100-42-5",
        "taxed_origins": ["韩国", "台湾地区", "美国"],
        "measure": {"effective_current": "2024-06-23", "expected_end": "2029-06-22", "status": "实施中"},
        "local_data": {"dedicated_raw_files": 0, "confirmed_trade_rows": 0},
        "yixun_status": "网页已登录且打开；查询提交/结果读取持续超时，未取得可验证的总数、页数、记录或覆盖日期；不得称全量已查",
        "public_conclusion": "未检出中国官方已定性的苯乙烯第三国绕道反倾销案件或可闭合双段提单；新加坡和印尼具有真实苯乙烯产能，第三国发货本身不能证明规避",
        "evidence_grade": "数据缺口阶段；当前无A/B腿闭环",
        "tax_sensitivity": {
            "formula": "综合潜在少缴=中国海关完税价格V×反倾销税率×(1+13%)",
            "korea": "7.006%V—8.475%V",
            "taiwan": "4.294%V—4.746%V",
            "usa_listed": "15.481%V—15.707%V",
            "usa_other": "62.941%V",
        },
        "files": ["苯乙烯_易迅最简查询组合.csv", "苯乙烯_数据缺口台账.csv", "苯乙烯_公开来源台账.csv"],
    }
    (OUT / "苯乙烯_数据缺口阶段摘要.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    write_csv("苯乙烯_易迅逐票标准化_当前0条.csv", [])
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
