from __future__ import annotations

import json
import math
import os
import re
from collections import defaultdict
from pathlib import Path

import pandas as pd


ROOT = Path(r"D:\易迅数据")
OUT_DIR = ROOT / "反倾销税深度分析报告" / "05_氯氰菊酯"
OUT_DIR.mkdir(parents=True, exist_ok=True)

XLSX_FILES = [
    ROOT / "氯氰菊酯_CAS1315501-18-8_2年.xlsx",
    ROOT / "氯氰菊酯_CAS52315-07-8_2年.xlsx",
    ROOT / "氯氰菊酯_CAS67375-30-8_2年.xlsx",
    ROOT / "氯氰菊酯_CIPERMETHRIN_2年.xlsx",
    ROOT / "氯氰菊酯_CYPERMETHRIN_TECHNICAL_2年.xlsx",
]
PAGE_CSV = OUT_DIR / "易迅_2026-08-08页面摘录_含氯氰菊酯19条.csv"

COLS = {
    "数据源": "data_source",
    "进出口": "flow",
    "日期": "date",
    "HS编码": "hs",
    "商品描述": "description",
    "采购商": "buyer",
    "供应商": "supplier",
    "重量": "weight",
    "数量": "quantity",
    "金额": "amount",
    "目的国/地区": "destination",
    "原产国/地区": "origin",
}

MEASURE_DATE = pd.Timestamp("2025-05-07")
SCOPE_CAS = ["52315-07-8", "67375-30-8", "1315501-18-8"]


def clean_text(value) -> str:
    if value is None or (isinstance(value, float) and math.isnan(value)):
        return ""
    text = str(value).strip()
    return "" if text.lower() == "nan" else text


def norm(value) -> str:
    return re.sub(r"[^A-Z0-9]", "", clean_text(value).upper())


def exact_text(value) -> str:
    """Whitespace-normalised text that deliberately preserves punctuation/accents."""
    return re.sub(r"\s+", " ", clean_text(value)).strip().upper()


def num(value) -> float:
    try:
        if value is None or (isinstance(value, float) and math.isnan(value)):
            return 0.0
        return float(str(value).replace(",", "").strip())
    except Exception:
        return 0.0


def norm_hs(value) -> str:
    text = clean_text(value)
    if text.endswith(".0"):
        text = text[:-2]
    return re.sub(r"\D", "", text)


def normalize_cas(text: str) -> list[str]:
    n = re.sub(r"[^0-9]", "", text)
    found = []
    if "52315078" in n:
        found.append("52315-07-8")
    if "67375308" in n:
        found.append("67375-30-8")
    if "1315501188" in n:
        found.append("1315501-18-8")
    if "65731842" in n:
        found.append("65731-84-2")
    return found


def classify(description: str, weight: float, quantity: float) -> tuple[str, str]:
    u = clean_text(description).upper()
    cas = normalize_cas(u)
    scope_cas = any(c in SCOPE_CAS for c in cas)
    beta = "BETA CYPERMETHRIN" in u or "65731-84-2" in cas
    # “STANDARD” alone is unsafe: commercial bills commonly contain phrases such as
    # “ISPM 15 STANDARD” or “TSCA STATEMENT”.  Require a laboratory-specific signal
    # and exclude industrial-weight consignments before classifying a record as a
    # reference standard/sample.
    lab_signal = bool(re.search(
        r"LABSTANDARD|REFERENCE\s+STANDARD|ANALYTIC(?:AL)?\s+STANDARD|"
        r"CH[ẤA]T CHU[ẨA]N|\bPTN\b|LABORATORY|TRC-|DRE-|HPC-|"
        r"\b(?:10|20|25|50|100|200|250|500|1000)\s*MG\b|\bMG/",
        u,
    ))
    lab = lab_signal and weight <= 50
    technical = bool(re.search(r"TECHNICAL|\bTECH\b|TECNIC[AO]|T[EÉ]CNIC[AO]|\bTC\b|MIN\s*(?:9[2-9])\s*%|ACTIVE INGREDIENT", u))
    industrial_signal = bool(re.search(
        r"\b(?:9[0-9](?:[.,][0-9]+)?)\s*%|PACKING\s*:\s*(?:25|50|200|225)\s*KGS?|"
        r"\b(?:25|50|200|225)\s*KGS?\b.*\bDRUMS?\b|SYNTHETIC\s+PYRETHROID\s+PESTICID",
        u,
    ))
    formulation = bool(re.search(r"\b(?:EC|SC|WP|WG|EW|ULV|CS)\b|FORMULATION|FORMULADO|INSECTICIDE FORMULATION|PESTICIDE FORMULATION", u))
    cypermethrin_name = bool(re.search(r"CYPERMETHRIN|CIPERMETHRIN|CIPERMETRIN|CYPERMETRINA", u))

    if beta:
        return "β-氯氰菊酯/非列明CAS待排除", "商品名或CAS指向β异构体65731-84-2，未在终裁列明3个CAS中"
    if lab:
        return "实验室标准品/小样", "描述含标准品、实验室或mg级包装信号"
    if cypermethrin_name and (technical or industrial_signal):
        return "技术级/原药（措施范围候选）", "名称和含量/technical信号支持被调查原药"
    if scope_cas and not formulation and max(weight, quantity) >= 100:
        return "CAS明确工业批次（措施范围候选）", "列明CAS且为工业批量，需核纯度和商品形态"
    if formulation and not technical:
        return "制剂/复配（原则上不按原药口径）", "描述更符合下游农药制剂，需核成分含量与中国申报商品编号"
    if cypermethrin_name or scope_cas:
        return "商品形态待核", "名称/CAS相关但缺少技术级、纯度或包装决定性字段"
    return "非措施商品/同词异物", "未形成氯氰菊酯名称或列明CAS支持"


def currency_note(data_source: str) -> str:
    u = clean_text(data_source).upper()
    if "越南" in data_source or "VIETNAM" in u:
        return "VND（按越南数据量级推定，须回核平台字段）"
    if "印度" in data_source or "INDIA" in u:
        return "USD（按印度出口侧量级推定，须回核原始申报）"
    return "平台原币/币种未标明，不跨国汇总"


def aggregate(rows: pd.DataFrame, field: str, limit=30) -> list[dict]:
    if rows.empty:
        return []
    out = (
        rows.groupby(field, dropna=False)
        .agg(records=(field, "size"), mass_kg=("mass_kg", "sum"))
        .reset_index()
        .sort_values(["mass_kg", "records"], ascending=False)
        .head(limit)
    )
    return out.to_dict("records")


def infer_mass(description: str, weight: float, quantity: float, scope_class: str) -> tuple[float, str]:
    """Return a conservative comparable mass and document its basis.

    Platform `quantity` is not always kilograms.  Prefer reported weight; suppress
    laboratory-vial counts; and honour an explicit total KGM declaration for small
    mixed-unit rows before falling back to quantity-as-kg.
    """
    if weight > 0:
        return weight, "weight"
    if scope_class == "实验室标准品/小样":
        return 0.0, "not aggregated"
    u = clean_text(description).upper().replace(",", "")
    explicit = re.findall(r"=\s*([0-9]+(?:\.[0-9]+)?)\s*KGM\b", u)
    if explicit and quantity <= 10:
        return float(explicit[-1]), "explicit KGM in description"
    return quantity, "quantity assumed kg"


def conservative_lots(rows: pd.DataFrame) -> pd.DataFrame:
    """Lower-bound lot view; keeps all rows elsewhere but collapses same-day mirrors."""
    if rows.empty:
        return rows.copy()
    work = rows.copy()
    work["commercial_lot_key"] = work.apply(
        lambda r: "|".join([
            str(r["date"].date()) if pd.notna(r["date"]) else "",
            norm(r["buyer"]), norm(r["supplier"]), f"{r['mass_kg']:.6f}",
            f"{r['amount']:.6f}", norm(r["destination"]), norm(r["origin"]),
            norm(r["cas"]),
        ]), axis=1
    )
    return work.sort_values("date", ascending=False).drop_duplicates("commercial_lot_key").copy()


frames = []
for path in XLSX_FILES:
    df = pd.read_excel(path, sheet_name="数据列表", engine="openpyxl")
    df = df.rename(columns=COLS)
    df = df[list(COLS.values())].copy()
    df["source_file"] = path.name
    frames.append(df)

raw = pd.concat(frames, ignore_index=True)
raw["date"] = pd.to_datetime(raw["date"], errors="coerce")
for col in ("weight", "quantity", "amount"):
    raw[col] = raw[col].apply(num)
for col in ("data_source", "flow", "description", "buyer", "supplier", "destination", "origin"):
    raw[col] = raw[col].apply(clean_text)
raw["hs"] = raw["hs"].apply(norm_hs)
raw["query_hit"] = raw["source_file"].str.replace("氯氰菊酯_", "", regex=False).str.replace("_2年.xlsx", "", regex=False)
raw["dedup_key"] = raw.apply(
    lambda r: "|".join([
        exact_text(r["data_source"]), exact_text(r["flow"]),
        str(r["date"].date()) if pd.notna(r["date"]) else "",
        exact_text(r["description"]), exact_text(r["buyer"]), exact_text(r["supplier"]),
        f"{r['weight']:.6f}", f"{r['quantity']:.6f}", f"{r['amount']:.6f}",
        exact_text(r["destination"]), exact_text(r["origin"]), r["hs"],
    ]), axis=1
)
raw["cross_source_key"] = raw.apply(
    lambda r: "|".join([
        str(r["date"].date()) if pd.notna(r["date"]) else "",
        exact_text(r["description"]), exact_text(r["buyer"]), exact_text(r["supplier"]),
        f"{r['weight']:.6f}", f"{r['quantity']:.6f}", f"{r['amount']:.6f}",
        exact_text(r["destination"]), exact_text(r["origin"]), r["hs"],
    ]), axis=1
)
raw["soft_record_key"] = raw.apply(
    lambda r: "|".join([
        norm(r["data_source"]), norm(r["flow"]),
        str(r["date"].date()) if pd.notna(r["date"]) else "",
        norm(r["description"]), norm(r["buyer"]), norm(r["supplier"]),
        f"{r['weight']:.6f}", f"{r['quantity']:.6f}", f"{r['amount']:.6f}",
        norm(r["destination"]), norm(r["origin"]), r["hs"],
    ]), axis=1
)
raw["commercial_lot_key"] = raw.apply(
    lambda r: "|".join([
        str(r["date"].date()) if pd.notna(r["date"]) else "",
        norm(r["buyer"]), norm(r["supplier"]),
        f"{r['weight']:.6f}", f"{r['quantity']:.6f}", f"{r['amount']:.6f}",
        norm(r["destination"]), norm(r["origin"]),
    ]), axis=1
)

query_hits = raw.groupby("dedup_key")["query_hit"].apply(lambda x: ";".join(sorted(set(x)))).to_dict()
dedup = raw.drop_duplicates("dedup_key").copy()
dedup["query_hits"] = dedup["dedup_key"].map(query_hits)
dedup[["scope_class", "scope_reason"]] = dedup.apply(
    lambda r: pd.Series(classify(r["description"], r["weight"], r["quantity"])), axis=1
)
dedup[["mass_kg", "mass_basis"]] = dedup.apply(
    lambda r: pd.Series(infer_mass(r["description"], r["weight"], r["quantity"], r["scope_class"])), axis=1
)
dedup["cas"] = dedup["description"].apply(lambda x: ";".join(normalize_cas(x)))
dedup["amount_currency_note"] = dedup["data_source"].apply(currency_note)
dedup["post_measure"] = dedup["date"] >= MEASURE_DATE
dedup["is_scope_candidate"] = dedup["scope_class"].isin(["技术级/原药（措施范围候选）", "CAS明确工业批次（措施范围候选）"])
dedup["lot_key"] = dedup.apply(
    lambda r: "|".join([
        str(r["date"].date()) if pd.notna(r["date"]) else "",
        norm(r["buyer"]), norm(r["supplier"]), f"{r['mass_kg']:.6f}",
        f"{r['amount']:.6f}", norm(r["destination"]), norm(r["origin"]),
        norm(r["cas"]), norm(r["scope_class"]),
    ]), axis=1
)


def route_assessment(row) -> tuple[str, str, str, str]:
    dest = clean_text(row["destination"]).upper()
    origin = clean_text(row["origin"]).upper()
    post = bool(row["post_measure"])
    in_scope = bool(row["is_scope_candidate"])
    if in_scope and post and dest == "CHINA" and origin == "INDIA":
        return (
            "高", "A", "措施后印度原产技术级产品直接对华，需核2926909013申报及反倾销税缴纳",
            "调中国进口报关单、原产地证、税款缴款书及实际进口人",
        )
    if in_scope and post and dest == "CHINA" and origin not in ("", "INDIA", "CHINA"):
        return (
            "高", "B+", "措施后第三国原产/发运进入中国，属于潜在B腿；需追溯印度原料和实质加工",
            "核生产商、COA/批号、加工记录、原产地证和前段提单",
        )
    if in_scope and post and origin == "INDIA" and dest not in ("", "INDIA", "CHINA"):
        intermediary = any(x in clean_text(row["supplier"]).upper() for x in ("MAURITIUS", "PTE LTD"))
        return (
            "中高" if intermediary else "中",
            "B+" if intermediary else "B",
            "印度原产流向第三国，仅形成A腿/供应链可达性" + ("；供应商为第三国商业主体" if intermediary else ""),
            "检索同批号/同主体/相近数量的第三国→中国B腿；现状不得认定绕道",
        )
    if not in_scope:
        return (
            "低/待排", "C", "商品形态、制剂/标准品或措施范围尚不匹配",
            "先核纯度、CAS、用途和中国10位商品编号，再决定是否开展路线核查",
        )
    return (
        "低至中", "C", "措施前或非对华/非高风险路线的技术级记录，仅作基线",
        "保留主体、批号和包装指纹，出现措施后中国B腿时再匹配",
    )


dedup[["route_risk", "evidence_level", "route_assessment", "recommended_action"]] = dedup.apply(
    lambda r: pd.Series(route_assessment(r)), axis=1
)

# Two transparent de-duplication layers:
# 1) `dedup` preserves 1,029 distinct visible records after exact cross-query
#    de-duplication so every row remains auditable; 2) `consolidated` normalises
#    punctuation/spacing variants and removes five likely display mirrors for
#    conservative trade-flow totals (1,024 expected).
consolidated = dedup.drop_duplicates("soft_record_key").copy()
commercial = consolidated.drop_duplicates("commercial_lot_key").copy()

dest_u = commercial["destination"].str.upper()
origin_u = commercial["origin"].str.upper()
direct_india_china = commercial[(dest_u == "CHINA") & (origin_u == "INDIA")]
post_direct = direct_india_china[direct_india_china["post_measure"] & direct_india_china["is_scope_candidate"]]
third_to_china = commercial[(dest_u == "CHINA") & (~origin_u.isin(["INDIA", "CHINA", ""])) & commercial["is_scope_candidate"]]
india_to_third = commercial[(origin_u == "INDIA") & (~dest_u.isin(["INDIA", "CHINA", ""])) & commercial["is_scope_candidate"]]
india_to_vietnam = india_to_third[dest_u.loc[india_to_third.index] == "VIETNAM"]
india_to_vietnam_post = india_to_vietnam[india_to_vietnam["post_measure"]]
india_to_vietnam_post_lots = conservative_lots(india_to_vietnam_post)
india_to_vietnam_post_scope_lots = india_to_vietnam_post_lots[
    india_to_vietnam_post_lots["scope_class"] == "技术级/原药（措施范围候选）"
].copy()
india_to_vietnam_post_vn_import_lots = india_to_vietnam_post_scope_lots[
    india_to_vietnam_post_scope_lots["data_source"].str.contains("越南|VIETNAM", case=False, regex=True, na=False)
].copy()

# Previously preserved one-year/three-year page excerpt (19 cypermethrin rows within a mixed CSV).
page_all = pd.read_csv(PAGE_CSV, dtype=str, keep_default_na=False)
page = page_all[page_all["query_theme"].str.contains("CYPERMETHRIN", case=False, na=False)].copy()
for col in ("weight_reported", "quantity_reported", "amount_reported"):
    page[col] = page[col].apply(num)
page["mass_kg"] = page.apply(lambda r: r["weight_reported"] if r["weight_reported"] > 0 else r["quantity_reported"], axis=1)
page["date"] = pd.to_datetime(page["date"], errors="coerce")
page["cas"] = page["goods_description"].apply(lambda x: ";".join(normalize_cas(x)))
page[["scope_class", "scope_reason"]] = page.apply(
    lambda r: pd.Series(classify(r["goods_description"], r["weight_reported"], r["quantity_reported"])), axis=1
)
page["conservative_group"] = page["duplicate_group"].where(page["duplicate_group"].ne(""), page.apply(
    lambda r: "|".join([norm(r["goods_description"]), norm(r["buyer"]), norm(r["supplier"]), f"{r['mass_kg']:.2f}", f"{r['amount_reported']:.2f}"]), axis=1
))
page_groups = page.sort_values("date", ascending=False).drop_duplicates("conservative_group").copy()
page_definite = page_groups[page_groups["scope_class"] == "技术级/原药（措施范围候选）"].copy()
page_probable_alpha = page_definite[page_definite["goods_description"].str.contains("ALPHA", case=False, na=False)]
page_definite_ordinary = page_definite[~page_definite["goods_description"].str.contains("ALPHA", case=False, na=False)]

RATE_MAP = {
    "TAGROS CHEMICALS INDIA PRIVATE LIMITED": 0.484,
    "MEGHMANI ORGANICS LIMITED": 0.62,
    "GHARDA CHEMICALS LIMITED": 0.757,
    "UPL LIMITED": 1.662,
    "BHARAT RASAYAN LIMITED": 0.62,
    "HERANBA INDUSTRIES LIMITED": 0.62,
}


def rate_for(supplier: str):
    u = clean_text(supplier).upper()
    for name, rate in RATE_MAP.items():
        if name in u:
            return rate
    return 1.662 if u else None


def scenario(records: pd.DataFrame) -> dict:
    rows = []
    for _, r in records.iterrows():
        rate = rate_for(r["supplier"])
        amount = r["amount_reported"]
        ad = amount * rate if rate is not None else None
        vat9 = ad * 0.09 if ad is not None else None
        rows.append({
            "date": str(r["date"].date()),
            "supplier": r["supplier"],
            "buyer": r["buyer"],
            "description": r["goods_description"],
            "mass_kg": r["mass_kg"],
            "amount_usd_assumed": amount,
            "rate": rate,
            "anti_dumping_tax_usd": ad,
            "incremental_vat_9pct_usd": vat9,
            "combined_incremental_usd": (ad + vat9) if ad is not None else None,
            "group": r["conservative_group"],
        })
    return {
        "groups": len(rows),
        "mass_kg": sum(x["mass_kg"] for x in rows),
        "amount_usd_assumed": sum(x["amount_usd_assumed"] for x in rows),
        "anti_dumping_tax_usd": sum(x["anti_dumping_tax_usd"] or 0 for x in rows),
        "incremental_vat_9pct_usd": sum(x["incremental_vat_9pct_usd"] or 0 for x in rows),
        "combined_incremental_usd": sum(x["combined_incremental_usd"] or 0 for x in rows),
        "rows": rows,
    }


def records_json(df: pd.DataFrame, limit=None) -> list[dict]:
    work = df.sort_values("date", ascending=False)
    if limit:
        work = work.head(limit)
    cols = [
        "date", "data_source", "flow", "hs", "description", "buyer", "supplier",
        "weight", "quantity", "mass_kg", "mass_basis", "amount", "amount_currency_note",
        "destination", "origin", "cas", "scope_class", "scope_reason", "query_hits", "source_file",
    ]
    out = []
    for row in work[cols].to_dict("records"):
        row["date"] = str(row["date"].date()) if pd.notna(row["date"]) else ""
        out.append(row)
    return out


download_ledger = dedup.copy()
download_ledger.insert(0, "record_id", range(1, len(download_ledger) + 1))
ledger_cols = [
    "record_id", "query_hits", "source_file", "data_source", "flow", "date", "hs", "description",
    "buyer", "supplier", "weight", "quantity", "mass_kg", "mass_basis", "amount", "amount_currency_note",
    "destination", "origin", "cas", "scope_class", "scope_reason", "post_measure", "is_scope_candidate",
    "route_risk", "evidence_level", "route_assessment", "recommended_action",
    "cross_source_key", "soft_record_key", "commercial_lot_key", "lot_key",
]
ledger_out = download_ledger[ledger_cols].copy()
ledger_out["date"] = ledger_out["date"].dt.strftime("%Y-%m-%d").fillna("")
ledger_out.to_csv(OUT_DIR / "氯氰菊酯_下载数据逐票标准化.csv", index=False, encoding="utf-8-sig")
(OUT_DIR / "氯氰菊酯_下载数据逐票标准化.json").write_text(
    json.dumps(ledger_out.to_dict("records"), ensure_ascii=False, indent=2, default=str), encoding="utf-8"
)

page_out = page.copy()
page_out["date"] = page_out["date"].dt.strftime("%Y-%m-%d").fillna("")
page_out.to_csv(OUT_DIR / "氯氰菊酯_页面摘录19条逐票判定.csv", index=False, encoding="utf-8-sig")
(OUT_DIR / "氯氰菊酯_页面摘录19条逐票判定.json").write_text(
    json.dumps(page_out.to_dict("records"), ensure_ascii=False, indent=2, default=str), encoding="utf-8"
)

summary = {
    "download_files": [{"name": p.name, "rows": int(len(pd.read_excel(p, sheet_name="数据列表", engine="openpyxl")))} for p in XLSX_FILES],
    "download_raw_rows": int(len(raw)),
    "download_query_unique_rows": int(len(dedup)),
    "download_normalized_consolidated_rows": int(len(consolidated)),
    "download_formatting_mirrors_removed": int(len(dedup) - len(consolidated)),
    "download_commercial_lot_rows": int(len(commercial)),
    "download_same_lot_duplicates_removed": int(len(consolidated) - len(commercial)),
    "date_min": str(consolidated["date"].min().date()),
    "date_max": str(consolidated["date"].max().date()),
    "scope_classes_query_unique": dedup.groupby("scope_class").agg(records=("scope_class", "size"), mass_kg=("mass_kg", "sum")).reset_index().to_dict("records"),
    "scope_classes": consolidated.groupby("scope_class").agg(records=("scope_class", "size"), mass_kg=("mass_kg", "sum")).reset_index().to_dict("records"),
    "direct_india_china_download": {
        "records": int(len(direct_india_china)), "mass_kg": float(direct_india_china["mass_kg"].sum()),
        "post_measure_scope_records": int(len(post_direct)), "post_measure_scope_mass_kg": float(post_direct["mass_kg"].sum()),
        "rows": records_json(direct_india_china),
    },
    "third_country_to_china_download": {
        "records": int(len(third_to_china)), "mass_kg": float(third_to_china["mass_kg"].sum()), "rows": records_json(third_to_china),
    },
    "india_to_third_scope": {
        "records": int(len(india_to_third)), "mass_kg": float(india_to_third["mass_kg"].sum()),
        "destinations": aggregate(india_to_third, "destination", 50),
    },
    "india_to_vietnam_scope": {
        "records": int(len(india_to_vietnam)), "mass_kg": float(india_to_vietnam["mass_kg"].sum()),
        "post_measure_records": int(len(india_to_vietnam_post)), "post_measure_mass_kg": float(india_to_vietnam_post["mass_kg"].sum()),
        "post_measure_conservative_lots": int(len(india_to_vietnam_post_lots)),
        "post_measure_conservative_lot_mass_kg": float(india_to_vietnam_post_lots["mass_kg"].sum()),
        "post_measure_confirmed_technical_lots": int(len(india_to_vietnam_post_scope_lots)),
        "post_measure_confirmed_technical_mass_kg": float(india_to_vietnam_post_scope_lots["mass_kg"].sum()),
        "post_measure_confirmed_technical_amount_vnd": float(india_to_vietnam_post_scope_lots["amount"].sum()),
        "post_measure_vietnam_import_side_lots": int(len(india_to_vietnam_post_vn_import_lots)),
        "post_measure_vietnam_import_side_mass_kg": float(india_to_vietnam_post_vn_import_lots["mass_kg"].sum()),
        "post_measure_vietnam_import_side_amount_vnd": float(india_to_vietnam_post_vn_import_lots["amount"].sum()),
        "buyers": aggregate(india_to_vietnam_post, "buyer", 30),
        "suppliers": aggregate(india_to_vietnam_post, "supplier", 30),
        "rows": records_json(india_to_vietnam_post),
    },
    "upl_mauritius": records_json(commercial[commercial["supplier"].str.contains("UPL MAURITIUS", case=False, na=False)]),
    "page_excerpt": {
        "raw_records": int(len(page)),
        "conservative_groups": int(len(page_groups)),
        "scope_groups_including_alpha": int(len(page_definite)),
        "outside_or_ambiguous_beta_groups": int(len(page_groups[page_groups["scope_class"].str.contains("β-")])),
        "definite_ordinary_scenario": scenario(page_definite_ordinary),
        "alpha_probable_scenario": scenario(page_probable_alpha),
        "all_group_rows": page_groups.assign(date=page_groups["date"].dt.strftime("%Y-%m-%d")).to_dict("records"),
    },
}

(OUT_DIR / "氯氰菊酯_全量分析结果.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2, default=str), encoding="utf-8")
print(json.dumps(summary, ensure_ascii=False, indent=2, default=str))
