from __future__ import annotations
import csv, json
from pathlib import Path

OUT = Path(r"D:\易迅数据\反倾销税深度分析报告\18_正丁醇")
queries = [
 {"query_id":"NBA-Q1","route":"全部来源→中国","date_range":"2023-12-29至最新，并补2018-12-29起历史基线","hs":"29051300；补查290513","keywords":"N-BUTANOL | 1-BUTANOL | BUTAN-1-OL | N-BUTYL ALCOHOL | 71-36-3 | UN1120 | 正丁醇","exclusions":"ISOBUTANOL/异丁醇；TERT-BUTANOL/叔丁醇；SEC-BUTANOL/仲丁醇；丁酯、丁醚、丁二醇、丁酮及其他衍生物","purpose":"中国B腿全量；每页200条读至末页，跨关键词去重"},
 {"query_id":"NBA-Q2","route":"台湾地区、马来西亚、美国→全球","date_range":"2018-12-29至最新，重点2023-12-29后","hs":"29051300及各报告国扩展码","keywords":"同Q1；企业补查FORMOSA PLASTICS、PETRONAS CHEMICALS DERIVATIVES/MARKETING LABUAN、BASF PETRONAS、OPTIMAL、OQ/OXEA、EASTMAN、DOW、BASF","exclusions":"同Q1","purpose":"取得受税来源A腿，识别第三国收货人、储罐商和贸易商"},
 {"query_id":"NBA-Q3","route":"候选第三国→中国","date_range":"2018-12-29至最新","hs":"29051300；补查290513","keywords":"同Q1，并按Q2主体精确补查","exclusions":"同Q1","purpose":"按0—30/60/90/180日、净重±2%、船名/航次/罐号/提单闭合A/B腿"},
]
fields=list(queries[0])
with (OUT/'正丁醇_易迅最简查询组合.csv').open('w',encoding='utf-8-sig',newline='') as f:
 w=csv.DictWriter(f,fieldnames=fields); w.writeheader(); w.writerows(queries)
(OUT/'正丁醇_易迅最简查询组合.json').write_text(json.dumps(queries,ensure_ascii=False,indent=2),encoding='utf-8')
trade_fields=['record_id','query_id','source_file','sheet','source_row','data_source','direction','date','hs','description','china_party','overseas_party','weight_field','quantity_field','amount_field','destination','platform_origin','product_scope','producer_rate','route_class','evidence_grade','finding','required_evidence']
with (OUT/'正丁醇_易迅逐票标准化_本地0条.csv').open('w',encoding='utf-8-sig',newline='') as f: csv.writer(f).writerow(trade_fields)
(OUT/'正丁醇_易迅逐票标准化_本地0条.json').write_text('[]\n',encoding='utf-8')
summary={
 'item_no':18,'product':'正丁醇','hs':'29051300','cas':'71-36-3','un':'1120','taxed_origins':['台湾地区','马来西亚','美国'],
 'effective_from':'2018-12-29','review_continuation_from':'2024-12-29','expected_end':'2029-12-28',
 'rates':{'台湾塑胶':'6.0%','台湾其他':'56.1%','PETRONAS特定生产销售链':'12.7%','马来西亚其他/列名BASF PETRONAS/Optimal':'26.7%','OQ/OXEA美国':'52.2%','美国其他/列名Eastman/Dow/BASF':'139.3%'},
 'ad_plus_vat_coefficients':{'6.0%':'6.780%','12.7%':'14.351%','26.7%':'30.171%','52.2%':'58.986%','56.1%':'63.393%','139.3%':'157.409%'},
 'local_audit':{'files_scanned':304,'candidate_files':2,'confirmed_trade_records':0,'direct_china':0,'taxed_origin_to_third':0,'closed_chains':0},
 'stage_conclusion':'现有D盘未发现正丁醇逐票原始数据，公开源未形成受税来源→第三国→中国闭合链；须补易迅全页后判断。'
}
(OUT/'正丁醇_阶段审计摘要.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf-8')
with (OUT/'正丁醇_本地命中逐条复核.csv').open('w',encoding='utf-8-sig',newline='') as f:
 w=csv.DictWriter(f,fieldnames=['source_file','location','finding','decision']); w.writeheader(); w.writerows([
  {'source_file':r'D:\易迅数据\中国反倾销税商品清单_2026-08-11.xlsx','location':'第18项商品元数据','finding':'正丁醇','decision':'排除：非贸易票据'},
  {'source_file':r'D:\易迅数据\反倾销税深度分析报告\00_全商品查询与报告进度台账.csv','location':'序号18','finding':'正丁醇','decision':'排除：项目进度元数据'},
 ])
print(json.dumps({'queries':3,'trade_rows':0,'files_scanned':304},ensure_ascii=False))
