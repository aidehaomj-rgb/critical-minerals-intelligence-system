import pandas as pd, json, re
from pathlib import Path

src=Path(r'D:\易迅数据\中国反倾销税商品清单_2026-08-11.xlsx')
df=pd.read_excel(src)
df.columns=['序号','商品','类别','受税来源','执行日','到期状态','措施状态']
df['序号']=pd.to_numeric(df['序号'],errors='coerce').astype('Int64')
df=df.sort_values('序号')
df['任务ID']=df['序号'].apply(lambda x:f'AD-{int(x):02d}')
df['易迅税号查询']='待补'
df['易迅关键词查询']='待补'
df['易迅页数']='待查'
df['易迅记录数']='待查'
df['互联网实体检索']='待查'
df['报告状态']='待开展'
outdir=Path(r'D:\易迅数据\反倾销税深度分析报告')
outdir.mkdir(parents=True,exist_ok=True)
df.to_csv(outdir/'00_全商品查询与报告进度台账.csv',index=False,encoding='utf-8-sig')
print(df[['任务ID','商品','受税来源','执行日','措施状态']].to_string(index=False))
print(f'rows={len(df)}, unique_products={df.商品.nunique()}, out={outdir}')
