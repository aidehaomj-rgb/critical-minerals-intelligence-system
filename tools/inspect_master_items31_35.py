from pathlib import Path
import pandas as pd
import json

path = Path(r"D:\易迅数据\反倾销专题\中国反倾销税商品清单_2026-08-11.xlsx")
book = pd.ExcelFile(path)
print(book.sheet_names)
df = pd.read_excel(path, sheet_name=0, dtype=str)
print(df.columns.tolist())
print(df.iloc[28:36].to_string(index=False))
for row in df.iloc[30:35].to_dict(orient="records"):
    print(json.dumps(row, ensure_ascii=True))
