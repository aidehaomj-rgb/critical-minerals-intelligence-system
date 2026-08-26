#!/usr/bin/env python3
import csv, json
from pathlib import Path

OUT=Path(r"D:\易迅数据\反倾销税深度分析报告\16_不锈钢钢坯和热轧板卷")
queries=[
 {"查询编号":"SS-Q1","贸易段":"中国进口B腿","时间":"2024-07-23至最新","税号":"22个税号，按7218/7219/7220分3次","商品关键词":"STAINLESS STEEL BILLET|SLAB|BLOOM|SEMI-FINISHED|HOT ROLLED|SSHR|HRC|HR COIL|HOT ROLLED PLATE|NO.1|1D|不锈钢钢坯|板坯|热轧板卷|黑皮卷|白皮卷","国家":"目的国China，来源全部","逐票要求":"冷热轧/宽窄/制品分层；钢种、炉号、卷号、规格、净重、MTC、生产商、报关口岸/企业"},
 {"查询编号":"SS-Q2","贸易段":"受税来源→第三国A腿","时间":"2024-07-23至最新","税号":"同SS-Q1","商品关键词":"同SS-Q1","国家":"Indonesia→Turkey/Vietnam/Taiwan/Malaysia；Korea→Vietnam/Thailand/Malaysia；EU/UK→Turkey/Malaysia","逐票要求":"输入形态、炉号/板坯号、规格、重量、提单、船名IMO、第三国收货人"},
 {"查询编号":"SS-Q3","贸易段":"第三国→中国B腿","时间":"2024-07-23至最新","税号":"同SS-Q1","商品关键词":"同SS-Q1+实体精确名称","国家":"Q2第三国→China","逐票要求":"15-180日匹配；炉号/卷号、数量拆并、提单/船舶、加工工单、原产地证、中国税单"},
]
fields=list(queries[0])
with (OUT/"不锈钢钢坯热轧板卷_易迅最简查询矩阵.csv").open("w",encoding="utf-8-sig",newline="") as f:
 w=csv.DictWriter(f,fieldnames=fields); w.writeheader(); w.writerows(queries)
(OUT/"不锈钢钢坯热轧板卷_易迅最简查询矩阵.json").write_text(json.dumps(queries,ensure_ascii=False,indent=2),encoding="utf-8")
summary={
 "审计日期":"2026-08-13","本地文件数":288,"解析错误文件":0,"涉案22税号命中文件":0,"宽词候选文件":27,
 "本地确认逐票记录":0,"易迅网页状态":"已登录；查询页持续正在搜索中，未形成可验证结果总数或有效零结果",
 "公开最具体链":"印度尼西亚板坯→土耳其Çolakoğlu代工热轧→欧盟",
 "公开链证据等级":"A（境外链路事实）","对华绕道证据等级":"无法判断/无A-B闭环",
 "关键结论":"本地数据缺口；公开具体链不能替代中国进口、原产地及税款证据",
 "QA":{"预筛完成":True,"报告PDF页数":4,"逐页视觉检查":True,"a11y_high":0,"a11y_medium":0,"a11y_low":0}
}
(OUT/"不锈钢钢坯热轧板卷_阶段审计摘要.json").write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding="utf-8")
print(json.dumps(summary,ensure_ascii=True))
