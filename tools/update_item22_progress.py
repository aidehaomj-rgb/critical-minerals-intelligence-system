from pathlib import Path
import csv

p = Path(r"D:\易迅数据\反倾销税深度分析报告\00_全商品查询与报告进度台账.csv")
with p.open("r", encoding="utf-8-sig", newline="") as f:
    rows = list(csv.DictReader(f))
fields = list(rows[0])
for row in rows:
    if row.get("序号") == "22":
        row["易迅税号查询"] = "HS400239：4,738条/24页，200条/页，全页读完（与第1项同品数据池共用）"
        row["易迅关键词查询"] = "BROMOBUTYL：2,762条/14页，200条/页，全页读完"
        row["易迅页数"] = "38页"
        row["易迅记录数"] = "原始7,500；去重5,582；受税直达中国9条/335,972.8kg；沙特对华31条/5,063,218.02kg；受税来源A腿2,662条；A/B闭环0"
        row["互联网实体检索"] = "完成：2024年第32号现行税率；KEMYA沙特真实BIIR产能；ARLANXEO新加坡/加拿大生产反证；未检出中国公开绕道处罚/判决"
        row["报告状态"] = "已完成：22_卤化丁基橡胶_美国欧盟英国新加坡（DOCX/PDF+全量5582条+4个路线子集+摘要/QA）"
        break
else:
    raise SystemExit("item 22 not found")
with p.open("w", encoding="utf-8-sig", newline="") as f:
    w = csv.DictWriter(f, fieldnames=fields)
    w.writeheader()
    w.writerows(rows)
print(next(r for r in rows if r.get("序号") == "22"))
