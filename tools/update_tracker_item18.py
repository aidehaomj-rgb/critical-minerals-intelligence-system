import csv, os
from pathlib import Path
P=Path(r'D:\易迅数据\反倾销税深度分析报告\00_全商品查询与报告进度台账.csv')
U={
'易迅税号查询':'D盘304个文件内容级预筛完成；未发现HS29051300/290513正丁醇原始逐票底表，需补易迅网页Q1—Q3全页数据',
'易迅关键词查询':'N-BUTANOL/1-BUTANOL/BUTAN-1-OL/N-BUTYL ALCOHOL/CAS71-36-3/UN1120；2个候选均为项目元数据',
'易迅页数':'本地304个文件全盘扫描；网页全页待补，不将未验证页面状态记录为0页/0结果',
'易迅记录数':'本地可确认逐票记录0；中国B腿0、受税A腿0、闭合链0；仅代表现有D盘数据缺口',
'互联网实体检索':'完成：2024期终复审完整企业税率；台塑、PETRONAS、OQ/OXEA真实产能；BASF德国合法原产反证；未发现中国专项处罚/反规避/双段提单闭环',
'报告状态':'阶段完成：18_正丁醇（4页数据缺口报告+304文件盘点+3组易迅查询矩阵；企业税率6.0%—139.3%，待网页全页后定稿）'}
with P.open('r',encoding='utf-8-sig',newline='') as f:r=csv.DictReader(f);rows=list(r);fields=r.fieldnames
n=0
for row in rows:
 if row.get('序号')=='18':row.update(U);n+=1
if n!=1:raise RuntimeError(n)
t=P.with_suffix(P.suffix+'.tmp')
with t.open('w',encoding='utf-8-sig',newline='') as f:w=csv.DictWriter(f,fieldnames=fields);w.writeheader();w.writerows(rows)
os.replace(t,P);print('updated row18')
