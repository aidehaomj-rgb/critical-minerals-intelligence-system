import json,re
from pathlib import Path
import pandas as pd

ROOT=Path(r'D:\易迅数据')
OUT=Path(r'D:\易迅数据\反倾销税深度分析报告\_分析中间数据'); OUT.mkdir(parents=True,exist_ok=True)

CONFIG={
 'EPDM': {'files':['EPDM_400270.xlsx'], 'pattern':r'\bEPDM\b|ETHYLENE.?PROPYLENE.?DIENE|NORDEL|KELTAN|VISTALON|ROYALENE|DUTRAL|KEP[ -]?\d', 'taxed':['United States','South Korea','Korea','Germany','Belgium','Netherlands','France','Italy','Spain','Poland','European Union']},
 'PPS': {'files':['PPS_391190_1.xlsx','PPS_391190_2.xlsx'], 'pattern':r'POLYPHENYLENE\s*SULFIDE|POLYPHENYLENE\s*SULPHIDE|\bPPS\s*(?:RESIN|COMPOUND|NEAT|GF|[A-Z0-9-])|RYTON|DURAFIDE|FORTRON|TORELINA', 'taxed':['Japan','United States','South Korea','Korea','Malaysia']},
 '间甲酚': {'files':['间甲酚2023年至2026年1月15.xlsx'], 'pattern':r'\bM[ -]?CRESOL\b|META[ -]?CRESOL|108[ -]?39[ -]?4', 'taxed':['United States','United Kingdom','Japan','Germany','Belgium','Netherlands','France','Italy','Spain','Poland','European Union']},
 '聚苯醚': {'files':['聚苯醚美国出口.xlsx','聚苯醚中国进口.xlsx'], 'pattern':r'POLYPHENYLENE\s*(?:ETHER|OXIDE)|\bPPE\s*(?:RESIN|POWDER|POLYMER)|\bPPO\s*(?:RESIN|POWDER|POLYMER)|\bNORYL\b', 'taxed':['United States']},
}

def n(s): return re.sub(r'[^A-Z0-9]+','',str(s).upper())
def read_files(names):
    fs=[]
    for name in names:
        d=pd.read_excel(ROOT/name,sheet_name='数据列表')
        d['源文件']=name; fs.append(d)
    d=pd.concat(fs,ignore_index=True)
    for c in ['商品描述','采购商','供应商','目的国/地区','原产国/地区','HS编码','数据源','进出口']:
        d[c]=d[c].fillna('').astype(str).str.strip()
    for c in ['重量','数量','金额']:
        d[c]=pd.to_numeric(d[c].astype(str).str.replace(',','',regex=False),errors='coerce')
    d['日期']=pd.to_datetime(d['日期'],errors='coerce')
    return d
def groups(d,col):
    if d.empty:return []
    z=d.groupby(col,dropna=False).agg(记录=(col,'size'),重量kg=('重量','sum'),数量原值=('数量','sum'),金额原值=('金额','sum')).reset_index()
    return z.sort_values(['重量kg','记录'],ascending=False).head(30).fillna('').to_dict('records')
def records(d,nrows=100):
    cols=['日期','HS编码','商品描述','采购商','供应商','重量','数量','金额','目的国/地区','原产国/地区','源文件']
    z=d.sort_values('日期',ascending=False).head(nrows).copy(); z['日期']=z['日期'].dt.strftime('%Y-%m-%d')
    return z[cols].fillna('').to_dict('records')

result={}
for product,cfg in CONFIG.items():
    raw=read_files(cfg['files'])
    hit=raw[raw['商品描述'].str.contains(cfg['pattern'],case=False,regex=True,na=False)].copy()
    key=hit.apply(lambda r:'|'.join([str(r['日期'].date()) if pd.notna(r['日期']) else '',n(r['商品描述'])[:250],n(r['采购商']),n(r['供应商']),str(r['重量']),str(r['数量']),str(r['金额']),n(r['目的国/地区']),n(r['原产国/地区'])]),axis=1)
    hit=hit.loc[~key.duplicated()].copy()
    dest=hit['目的国/地区'].str.casefold(); ori=hit['原产国/地区'].str.casefold(); taxed={x.casefold() for x in cfg['taxed']}
    is_tax=ori.isin(taxed)
    china=dest.eq('china')
    direct=hit[china&is_tax]
    third_china=hit[china&~is_tax&~ori.isin(['china',''])]
    taxed_third=hit[is_tax&~dest.isin(['china',''])]
    result[product]={
      'files':cfg['files'],'raw_rows':len(raw),'matched_rows':len(hit),'excluded_same_hs_rows':len(raw)-len(hit),
      'date_min':str(hit['日期'].min().date()) if len(hit) else '', 'date_max':str(hit['日期'].max().date()) if len(hit) else '',
      'direct_taxed_to_china':{'rows':len(direct),'weight_kg':float(direct['重量'].sum(skipna=True)),'quantity_raw':float(direct['数量'].sum(skipna=True)),'value_raw':float(direct['金额'].sum(skipna=True)),'suppliers':groups(direct,'供应商'),'buyers':groups(direct,'采购商'),'records':records(direct)},
      'third_origin_to_china':{'rows':len(third_china),'weight_kg':float(third_china['重量'].sum(skipna=True)),'quantity_raw':float(third_china['数量'].sum(skipna=True)),'origins':groups(third_china,'原产国/地区'),'suppliers':groups(third_china,'供应商'),'buyers':groups(third_china,'采购商'),'records':records(third_china)},
      'taxed_origin_to_third':{'rows':len(taxed_third),'weight_kg':float(taxed_third['重量'].sum(skipna=True)),'quantity_raw':float(taxed_third['数量'].sum(skipna=True)),'destinations':groups(taxed_third,'目的国/地区'),'suppliers':groups(taxed_third,'供应商')},
      'all_origins':groups(hit,'原产国/地区'),'all_destinations':groups(hit,'目的国/地区'),'hs':groups(hit,'HS编码')}
    (OUT/f'{product}_全行分析.json').write_text(json.dumps(result[product],ensure_ascii=False,indent=2,default=str),encoding='utf-8')
print(json.dumps({k:{x:v[x] for x in ['raw_rows','matched_rows','excluded_same_hs_rows','date_min','date_max']}|{'direct':v['direct_taxed_to_china']['rows'],'third_to_china':v['third_origin_to_china']['rows'],'taxed_to_third':v['taxed_origin_to_third']['rows']} for k,v in result.items()},ensure_ascii=False,indent=2))
