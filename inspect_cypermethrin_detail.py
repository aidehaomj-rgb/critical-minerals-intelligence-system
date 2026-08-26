import pandas as pd, json, re
from pathlib import Path

root=Path(r'D:\易迅数据')
files=list(root.glob('氯氰菊酯_*_2年.xlsx'))
frames=[]
for f in files:
    d=pd.read_excel(f, sheet_name='数据列表')
    d['source_file']=f.name
    frames.append(d)
df=pd.concat(frames, ignore_index=True)
cols=['日期','HS编码','商品描述','采购商','供应商','重量','数量','金额','目的国/地区','原产国/地区']
for c in cols:
    if c not in df: df[c]=''
for c in ['商品描述','采购商','供应商','目的国/地区','原产国/地区']:
    df[c]=df[c].fillna('').astype(str).str.strip()
df['日期']=pd.to_datetime(df['日期'],errors='coerce')
for c in ['重量','数量','金额']:
    df[c]=pd.to_numeric(df[c].astype(str).str.replace(',','',regex=False),errors='coerce').fillna(0)
key=['日期','HS编码','商品描述','采购商','供应商','重量','数量','金额','目的国/地区','原产国/地区']
df=df.drop_duplicates(key)
iv=df[(df['原产国/地区'].str.casefold()=='india')&(df['目的国/地区'].str.casefold()=='vietnam')].copy()
iv['质量口径']=iv['重量'].where(iv['重量']>0,iv['数量'])
iv['is_technical']=iv['商品描述'].str.contains(r'TECHNICAL|\bTC\b|CAS\s*(?:NO)?\.?\s*52315|CAS\s*(?:NO)?\.?\s*67375|CAS\s*(?:NO)?\.?\s*1315501',case=False,regex=True)
def group(c):
    return iv.groupby(c,dropna=False).agg(records=(c,'size'),mass_kg=('质量口径','sum'),value=('金额','sum')).reset_index().sort_values('mass_kg',ascending=False).head(30).to_dict('records')
out={'rows':len(iv),'technical_rows':int(iv.is_technical.sum()),'technical_mass':float(iv.loc[iv.is_technical,'质量口径'].sum()),'suppliers':group('供应商'),'buyers':group('采购商'),
     'records':iv.sort_values('日期').assign(日期=lambda x:x['日期'].dt.strftime('%Y-%m-%d'))[['日期','HS编码','商品描述','采购商','供应商','质量口径','金额']].to_dict('records')}
Path('temp/cypermethrin_vietnam.json').write_text(json.dumps(out,ensure_ascii=False,indent=2,default=str),encoding='utf-8')
print(json.dumps({k:v for k,v in out.items() if k!='records'},ensure_ascii=False,indent=2,default=str))
