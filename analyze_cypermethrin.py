import json
import os
import re

import pandas as pd

BASE = r"D:\易迅数据"
NAMES = [
    "氯氰菊酯_CAS1315501-18-8_2年.xlsx",
    "氯氰菊酯_CAS52315-07-8_2年.xlsx",
    "氯氰菊酯_CAS67375-30-8_2年.xlsx",
    "氯氰菊酯_CIPERMETHRIN_2年.xlsx",
    "氯氰菊酯_CYPERMETHRIN_TECHNICAL_2年.xlsx",
]
COLS = ["source", "flow", "date", "hs", "product", "buyer", "supplier", "weight", "quantity", "value", "destination", "origin"]


def norm(value):
    return re.sub(r"[^A-Z0-9]", "", str(value).upper())


def mass(row):
    return row["weight"] if row["weight"] > 0 else row["quantity"]


def agg(df, col):
    if df.empty:
        return []
    grouped = (
        df.groupby(col, dropna=False)
        .agg(records=(col, "size"), mass_kg=("mass_kg", "sum"), value=("value", "sum"))
        .reset_index()
        .sort_values(["mass_kg", "records"], ascending=False)
    )
    return grouped.head(30).to_dict("records")


def main():
    frames = []
    for name in NAMES:
        df = pd.read_excel(os.path.join(BASE, name), sheet_name="数据列表", engine="openpyxl")
        df = df.iloc[:, :12]
        df.columns = COLS
        df["source_file"] = name
        frames.append(df)
    raw = pd.concat(frames, ignore_index=True)
    for col in ["weight", "quantity", "value"]:
        raw[col] = pd.to_numeric(raw[col], errors="coerce").fillna(0)
    for col in ["product", "buyer", "supplier", "destination", "origin", "source", "flow", "hs"]:
        raw[col] = raw[col].fillna("").astype(str)
    raw["date"] = pd.to_datetime(raw["date"], errors="coerce")
    raw["key"] = raw.apply(
        lambda r: "|".join(
            [
                str(r["date"].date()) if pd.notna(r["date"]) else "",
                norm(r["product"])[:180],
                norm(r["buyer"]),
                norm(r["supplier"]),
                str(r["weight"]),
                str(r["quantity"]),
                norm(r["destination"]),
                norm(r["origin"]),
            ]
        ),
        axis=1,
    )
    dedup = raw.drop_duplicates("key").copy()
    dedup["mass_kg"] = dedup.apply(mass, axis=1)
    dest = dedup["destination"].str.upper()
    origin = dedup["origin"].str.upper()
    direct = dedup[dest.eq("CHINA") & origin.eq("INDIA")]
    third_to_china = dedup[dest.eq("CHINA") & ~origin.isin(["INDIA", "CHINA", ""])]
    india_to_third = dedup[origin.eq("INDIA") & ~dest.isin(["CHINA", "INDIA", ""])]
    technical = dedup[dedup["product"].str.contains("TECHNICAL", case=False, na=False)]
    lab = dedup[
        dedup["product"].str.contains(
            "STANDARD|LAB|PTN|CHẤT CHUẨN|REFERENCE|ANALYT", case=False, na=False, regex=True
        )
    ]
    record_cols = ["date", "hs", "product", "buyer", "supplier", "mass_kg", "value", "destination", "origin"]
    output = {
        "raw_rows": len(raw),
        "dedup_rows": len(dedup),
        "date_min": str(dedup["date"].min().date()),
        "date_max": str(dedup["date"].max().date()),
        "technical_rows": len(technical),
        "lab_rows": len(lab),
        "direct_india_china": {
            "rows": len(direct),
            "mass_kg": direct["mass_kg"].sum(),
            "value": direct["value"].sum(),
            "suppliers": agg(direct, "supplier"),
            "buyers": agg(direct, "buyer"),
            "records": direct[record_cols].sort_values("date", ascending=False).astype(str).to_dict("records"),
        },
        "third_to_china": {
            "rows": len(third_to_china),
            "mass_kg": third_to_china["mass_kg"].sum(),
            "origins": agg(third_to_china, "origin"),
            "records": third_to_china[record_cols].sort_values("date", ascending=False).astype(str).to_dict("records"),
        },
        "india_to_third": {
            "rows": len(india_to_third),
            "mass_kg": india_to_third["mass_kg"].sum(),
            "destinations": agg(india_to_third, "destination"),
            "suppliers": agg(india_to_third, "supplier"),
        },
        "overall_origins": agg(dedup, "origin"),
        "overall_destinations": agg(dedup, "destination"),
        "hs": agg(dedup, "hs"),
    }
    out_path = r"C:\Users\59809\Documents\关键矿产\temp\cypermethrin_analysis.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2, default=str)
    print(json.dumps({k: v for k, v in output.items() if k not in {"direct_india_china", "third_to_china", "india_to_third"}}, ensure_ascii=False, indent=2, default=str))
    print(json.dumps({
        "direct": {k: v for k, v in output["direct_india_china"].items() if k != "records"},
        "third_to_china": {k: v for k, v in output["third_to_china"].items() if k != "records"},
        "india_to_third": output["india_to_third"],
    }, ensure_ascii=False, indent=2, default=str))


if __name__ == "__main__":
    main()
