import json
from pathlib import Path
import pandas as pd

files=[
 Path(r'D:\易迅数据\EPDM_400270.xlsx'),
 Path(r'D:\易迅数据\PPS_391190_1.xlsx'),Path(r'D:\易迅数据\PPS_391190_2.xlsx'),
 Path(r'D:\易迅数据\间甲酚2023年至2026年1月15.xlsx'),
 Path(r'D:\易迅数据\聚苯醚美国出口.xlsx'),Path(r'D:\易迅数据\聚苯醚中国进口.xlsx'),
 Path(r'D:\易迅数据\HWASEUNG CHEMICAL_VN_TO_CN.xlsx'),Path(r'D:\易迅数据\Hwaseung_KR_TO_VN.xlsx'),
]
out={}
for f in files:
    x=pd.ExcelFile(f)
    ss=[]
    for s in x.sheet_names:
        d=pd.read_excel(f,sheet_name=s)
        ss.append({'sheet':s,'shape':list(d.shape),'columns':[str(c) for c in d.columns],
                   'preview':d.head(3).fillna('').astype(str).to_dict('records')})
    out[f.name]=ss
Path('temp/local_trade_schema.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(out,ensure_ascii=False,indent=2))
