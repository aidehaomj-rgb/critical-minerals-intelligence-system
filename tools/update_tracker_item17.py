from __future__ import annotations

import csv
import os
from pathlib import Path

TRACKER = Path(r"D:\易迅数据\反倾销税深度分析报告\00_全商品查询与报告进度台账.csv")
UPDATE = {
    "易迅税号查询": "D盘294个文件内容级预筛完成；未发现HS29039110/290391邻二氯苯原始逐票底表，需补易迅网页Q1—Q3全页数据",
    "易迅关键词查询": "ODCB/ORTHO DICHLOROBENZENE/1,2-DICHLOROBENZENE/CAS95-50-1/UN1591；8个候选文件逐条复核后仅2处项目元数据",
    "易迅页数": "本地294个文件全盘扫描；网页全页待补，不将未验证页面状态记录为0页/0结果",
    "易迅记录数": "本地可确认逐票记录0；中国B腿0、日印A腿0、闭合链0；仅代表现有D盘数据缺口",
    "互联网实体检索": "完成：2025期终复审、KUREHA、印度Aarti及官方日印产能/进口来源结构、非优惠原产地规则；未发现中国处罚/反规避/双段提单闭环",
    "报告状态": "阶段完成：17_邻二氯苯（4页数据缺口报告+294文件盘点+逐条命中复核+3组易迅查询矩阵；待网页全页后定稿）",
}

with TRACKER.open("r", encoding="utf-8-sig", newline="") as f:
    reader = csv.DictReader(f); rows = list(reader); fields = reader.fieldnames
found = 0
for row in rows:
    if row.get("序号") == "17": row.update(UPDATE); found += 1
if found != 1: raise RuntimeError(f"row17 count={found}")
tmp = TRACKER.with_suffix(TRACKER.suffix + ".tmp")
with tmp.open("w", encoding="utf-8-sig", newline="") as f:
    w = csv.DictWriter(f, fieldnames=fields); w.writeheader(); w.writerows(rows)
os.replace(tmp, TRACKER)
print("updated row 17")
