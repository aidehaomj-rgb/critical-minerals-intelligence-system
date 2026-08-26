import json
from pathlib import Path
import pandas as pd

src = Path(r"D:\易迅数据\中国反倾销税商品清单_2026-08-11.xlsx")
book = pd.ExcelFile(src)
out = {"sheets": book.sheet_names, "data": {}}
for s in book.sheet_names:
    df = pd.read_excel(src, sheet_name=s, header=None)
    out["data"][s] = {
        "shape": list(df.shape),
        "preview": df.head(15).fillna("").astype(str).values.tolist(),
        "rows": df.fillna("").astype(str).values.tolist(),
    }
Path("temp").mkdir(exist_ok=True)
Path("temp/antidumping_list_dump.json").write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps({s:{"shape":v["shape"],"preview":v["preview"]} for s,v in out["data"].items()},ensure_ascii=False,indent=2))
