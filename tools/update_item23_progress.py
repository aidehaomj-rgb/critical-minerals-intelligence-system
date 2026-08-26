import csv
from pathlib import Path

p = Path(r"D:\易迅数据\反倾销税深度分析报告\00_全商品查询与报告进度台账.csv")
with p.open("r", encoding="utf-8-sig", newline="") as f:
    rows = list(csv.DictReader(f))
fields = list(rows[0].keys())
for row in rows:
    if row["序号"] == "23":
        row["易迅税号查询"] = "HS290250+目的国China：网页已登录并尝试提交，结果持续超时；未取得可验证总数/页数/逐票记录"
        row["易迅关键词查询"] = "STYRENE MONOMER/STYRENE/CAS100-42-5：待按200条/页补全"
        row["易迅页数"] = "0页可验证；网页待补"
        row["易迅记录数"] = "本地专项原始票据0；不等于易迅网页0"
        row["互联网实体检索"] = "已完成政策、企业税率、Shell新加坡/ELLBA与印尼Styrindo真实产能反证；未见中国官方绕道闭环"
        row["报告状态"] = "数据缺口阶段报告已完成：23_苯乙烯；易迅全页完成后需升级正式深度报告"
with p.open("w", encoding="utf-8-sig", newline="") as f:
    w = csv.DictWriter(f, fieldnames=fields)
    w.writeheader(); w.writerows(rows)
