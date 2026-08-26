from __future__ import annotations

import json
import os
import re
import unicodedata
from collections import Counter
from datetime import date, datetime
from pathlib import Path
from typing import Any

import openpyxl


FILES = [
    Path(r"D:\易迅数据\PPS_391190_1.xlsx"),
    Path(r"D:\易迅数据\PPS_391190_2.xlsx"),
]


def norm(v: Any) -> str:
    if v is None:
        return ""
    return " ".join(str(v).strip().split())


def fold(v: Any) -> str:
    s = unicodedata.normalize("NFKD", norm(v))
    s = "".join(ch for ch in s if not unicodedata.combining(ch))
    return re.sub(r"\s+", " ", s).strip().upper()


def ent(v: Any) -> str:
    return re.sub(r"[^A-Z0-9]", "", fold(v))


def dval(v: Any) -> str:
    if isinstance(v, (datetime, date)):
        return v.strftime("%Y-%m-%d")
    s = norm(v)
    return s[:10]


def num(v: Any) -> float | None:
    if v in (None, ""):
        return None
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def row_key(r: dict[str, Any]) -> tuple[str, ...]:
    return tuple(norm(r.get(h)) for h in r["_headers"])


def read_rows(path: Path) -> list[dict[str, Any]]:
    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    rows_out: list[dict[str, Any]] = []
    for ws in wb.worksheets:
        it = ws.iter_rows(values_only=True)
        headers = [norm(v) for v in next(it)]
        for excel_row, vals in enumerate(it, 2):
            if not any(v not in (None, "") for v in vals):
                continue
            r = {h: v for h, v in zip(headers, vals)}
            r.update(
                {
                    "_file": path.name,
                    "_sheet": ws.title,
                    "_excel_row": excel_row,
                    "_headers": headers,
                }
            )
            rows_out.append(r)
    wb.close()
    return rows_out


FINISHED_TERMS = [
    "FILTER BAG", "FILTER CLOTH", "FILTER FABRIC", "FILTER MEDIA", "FILTER FELT",
    "FILTER ELEMENT", "FILTER CARTRIDGE", "NEEDLE FELT", "FIBER CLOTH", "FIBRE CLOTH",
    "WOVEN FABRIC", "NONWOVEN", "NON-WOVEN", "FABRIC", "TEXTILE", "FIBER", "FIBRE",
    "MONOFILAMENT", "YARN", "THREAD", "TUBE", "PIPE", "ROD", "SHEET", "PLATE",
    "FILM", "MEMBRANE", "GASKET", "SEAL", "O-RING", "CONNECTOR", "HOUSING",
    "PART", "COMPONENT", "MOLDED", "MOULDED", "INJECTION MOLD", "BRACKET",
    "BRUSH", "FITTING", "VALVE", "CABLE", "BUSH", "WASHER", "SCREW",
]
RESIN_TERMS = [
    "RESIN", "GRANULE", "GRANULAR", "PELLET", "POWDER", "COMPOUND", "MASTERBATCH",
    "PLASTIC MATERIAL", "MOLDING MATERIAL", "MOLDING RESIN", "POLYMER", "RAW MATERIAL",
    "HAT NHUA", "NGUYEN SINH", "PRIMARY FORM", "NEAT", "UNFILLED", "GF", "GLASS FIBER",
    "GLASS FIBRE", "MINERAL", "GRADE",
]


def classify(desc: Any) -> tuple[str, str]:
    s = fold(desc)
    has_pps = bool(
        "POLYPHENYLENE SULFIDE" in s
        or "POLYPHENYLENE SULPHIDE" in s
        or "POLYPHENYLENE SULFID" in s
        or "POLYPHENYLENESULFIDE" in s
        or "25212-74-2" in s
        or re.search(r"(?:^|[^A-Z0-9])PPS(?:[^A-Z0-9]|$)", s)
    )
    if not has_pps:
        return "噪声/非PPS", "未出现PPS全称、CAS或独立PPS缩写"
    finished = [t for t in FINISHED_TERMS if re.search(r"\b" + re.escape(t) + r"\b", s)]
    resin = [t for t in RESIN_TERMS if re.search(r"\b" + re.escape(t) + r"\b", s)]
    # Explicit resin/composition terms take precedence over incidental words such as film grade.
    if resin:
        return "PPS树脂/组合物（措施范围候选）", "树脂/粒料/粉料/复合材料语义"
    if finished:
        return "PPS制品（范围外候选）", "成品/纤维/薄膜/零件语义"
    return "PPS但形态待核", "明确PPS但缺少树脂或成品形态词"


def grade_tokens(desc: Any) -> list[str]:
    s = fold(desc)
    # Capture alphanumeric grade-like tokens while excluding common words and CAS fragments.
    stops = {
        "PPS", "RESIN", "POLYPHENYLENE", "SULFIDE", "SULPHIDE", "BLACK", "NATURAL",
        "WHITE", "BLUE", "GREEN", "RED", "COLOR", "GRADE", "CAS", "NEW", "PURE",
        "FORM", "PRIMARY", "PLASTIC", "MATERIAL", "POLYMER", "COMPOUND", "TECHNICAL",
        "HAT", "NHUA", "NGUYEN", "SINH", "DANG", "MOI", "100", "100%", "BK", "NC",
    }
    toks = []
    for tok in re.findall(r"(?<![A-Z0-9])[A-Z]{0,5}\d[A-Z0-9-]{2,}(?![A-Z0-9])", s):
        if tok not in stops and not re.fullmatch(r"\d{3,}", tok) and not tok.startswith("25212"):
            toks.append(tok)
    # Named PPS brands sometimes contain no digits.
    for brand in ["RYTON", "TORELINA", "DURAFIDE", "FORTRON", "DIC.PPS", "ECOTRAN", "THERMA-TECH"]:
        if brand.replace(".", " ") in s or brand in s:
            toks.append(brand)
    return list(dict.fromkeys(toks))


def product_layer(desc: Any) -> str:
    s = fold(desc)
    finished = re.search(
        r"\b(FILTER BAG|FILTER CLOTH|FILTER FABRIC|FILTER ELEMENT|FILTER CARTRIDGE|"
        r"GASKET|O-RING|MOLDED PART|MOULDED PART|FINISHED PART|YARN|MONOFILAMENT)\b", s
    )
    resin_form = re.search(r"\b(RESIN|GRANULES?|PELLETS?|POWDER|COMPOUND|POLYMER RESIN|HAT NHUA)\b", s)
    if finished and not resin_form:
        return "PPS成品/制品候选"
    modified = (
        re.search(r"\b(COMPOUND|COMPOUNDED|GF\s*\d|GLASS FIB(?:ER|RE)|CALCIUM CARBONATE|"
                  r"MINERAL|ALUMINA|CARBON BLACK|COPPER|ZINC OXIDE|INORGANIC SALT)\b", s)
        or any(x in s for x in ["65997-17-3", "1317-65-3", "471-34-1", "1333-86-4", "7440-50-8"])
        or "THANH PHAN" in s or "TP:" in s
    )
    if modified:
        return "改性/复合PPS（措施范围）"
    if re.search(r"\b(NEAT|UNFILLED|PURE)\b", s) or "NGUYEN LIEU SAN XUAT SAN PHAM HAT NHUA" in s:
        return "纯/基础PPS树脂明确（措施范围）"
    if resin_form or "NGUYEN SINH" in s or "PRIMARY FORM" in s:
        return "PPS树脂/初级形态明确、填充状态不详（措施范围）"
    return "PPS明确但形态待核（范围候选）"


CHINA_CITY_TOKENS = [
    "SHANGHAI", "DONGGUAN", "DONGUAN", "FOSHAN", "YANCHENG", "CHENZHOU", "TIANJIN",
    "GUANGZHOU", "HANGZHOU", "DANDONG", "ZHONGSHAN", "ZHONG SHAN", "NINGBO", "SUZHOU",
]


def buyer_geo(buyer: Any) -> str:
    s = fold(buyer)
    e = ent(buyer)
    if e == "HDCPOLYALLCOLTD":
        return "HDC韩国实体—平台目的国冲突/疑似返韩"
    if any(t in s for t in CHINA_CITY_TOKENS):
        return "中国内地实体名线索（仍需地址/提单终核）"
    if "HONG KONG" in s or "HONGKONG" in s or "(HK)" in s:
        return "香港实体名线索"
    return "买方国别待核"


def main() -> None:
    out: list[dict[str, Any]] = []
    all_rows: list[dict[str, Any]] = []
    for path in FILES:
        wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
        info: dict[str, Any] = {"file": str(path), "sheets": []}
        for ws in wb.worksheets:
            rows = ws.iter_rows(values_only=True)
            header = [norm(v) for v in next(rows)]
            data = [tuple(row) for row in rows if any(v not in (None, "") for v in row)]
            cols = list(zip(*data)) if data else []
            profiles = []
            for idx, (h, col) in enumerate(zip(header, cols), 1):
                vals = [norm(v) for v in col if norm(v)]
                profiles.append(
                    {
                        "idx": idx,
                        "header": h,
                        "nonempty": len(vals),
                        "unique": len(set(vals)),
                        "top": Counter(vals).most_common(8),
                        "examples": list(dict.fromkeys(vals))[:5],
                    }
                )
            info["sheets"].append(
                {
                    "sheet": ws.title,
                    "max_row": ws.max_row,
                    "max_col": ws.max_column,
                    "data_rows": len(data),
                    "headers": header,
                    "profiles": profiles,
                }
            )
        wb.close()
        out.append(info)
        all_rows.extend(read_rows(path))

    for r in all_rows:
        r["_date"] = dval(r.get("日期"))
        r["_class"], r["_class_reason"] = classify(r.get("商品描述"))
        r["_grades"] = grade_tokens(r.get("商品描述"))
        r["_layer"] = product_layer(r.get("商品描述"))
        r["_key"] = row_key(r)

    key_groups: dict[tuple[str, ...], list[dict[str, Any]]] = {}
    for r in all_rows:
        key_groups.setdefault(r["_key"], []).append(r)
    unique_rows = [g[0] for g in key_groups.values()]
    duplicate_groups = [g for g in key_groups.values() if len(g) > 1]
    cross_groups = [g for g in duplicate_groups if len({r["_file"] for r in g}) > 1]
    cross_keys = {g[0]["_key"] for g in cross_groups}

    taxed = {"JAPAN", "UNITED STATES", "SOUTH KOREA", "MALAYSIA"}
    china = "CHINA"
    in_scope = {"PPS树脂/组合物（措施范围候选）", "PPS但形态待核"}
    scope_u = [r for r in unique_rows if r["_class"] in in_scope]
    china_u = [r for r in scope_u if fold(r.get("目的国/地区")) == china]
    direct_u = [r for r in china_u if fold(r.get("原产国/地区")) in taxed]
    b_u = [r for r in china_u if fold(r.get("原产国/地区")) not in taxed | {china, ""}]
    a_u = [
        r for r in scope_u
        if fold(r.get("原产国/地区")) in taxed
        and fold(r.get("目的国/地区")) not in taxed | {china, ""}
    ]

    def agg(rows: list[dict[str, Any]], field: str) -> list[tuple[str, int]]:
        return Counter(norm(r.get(field)) or "(blank)" for r in rows).most_common()

    # Exact entity continuation from taxed-origin A leg importer to third-country B leg exporter.
    a_by_buyer: dict[str, list[dict[str, Any]]] = {}
    for r in a_u:
        if ent(r.get("采购商")):
            a_by_buyer.setdefault(ent(r.get("采购商")), []).append(r)
    entity_matches = []
    for br in b_u:
        er = ent(br.get("供应商"))
        for ar in a_by_buyer.get(er, []):
            if ar["_date"] <= br["_date"]:
                shared = sorted(set(ar["_grades"]) & set(br["_grades"]))
                entity_matches.append((ar, br, shared))

    def slim(r: dict[str, Any]) -> dict[str, Any]:
        return {
            "file": r["_file"], "row": r["_excel_row"], "date": r["_date"],
            "hs": norm(r.get("HS编码")), "desc": norm(r.get("商品描述")),
            "buyer": norm(r.get("采购商")), "supplier": norm(r.get("供应商")),
            "weight": num(r.get("重量")), "qty": num(r.get("数量")), "amount": num(r.get("金额")),
            "dest": norm(r.get("目的国/地区")), "origin": norm(r.get("原产国/地区")),
            "class": r["_class"], "grades": r["_grades"],
        }

    audit = {
        "file_profiles": out,
        "totals": {
            "raw": len(all_rows), "exact_unique": len(unique_rows),
            "duplicate_extra": len(all_rows) - len(unique_rows),
            "duplicate_groups": len(duplicate_groups),
            "cross_file_overlap_unique_keys": len(cross_groups),
            "cross_file_overlap_raw_rows": sum(len(g) for g in cross_groups),
            "date_min": min(r["_date"] for r in all_rows),
            "date_max": max(r["_date"] for r in all_rows),
        },
        "per_file": {
            p.name: {
                "rows": sum(r["_file"] == p.name for r in all_rows),
                "date_min": min(r["_date"] for r in all_rows if r["_file"] == p.name),
                "date_max": max(r["_date"] for r in all_rows if r["_file"] == p.name),
                "phrase_polyphenylene_sulfide": sum("POLYPHENYLENE SULFIDE" in fold(r.get("商品描述")) for r in all_rows if r["_file"] == p.name),
                "token_pps": sum(bool(re.search(r"(?:^|[^A-Z0-9])PPS(?:[^A-Z0-9]|$)", fold(r.get("商品描述")))) for r in all_rows if r["_file"] == p.name),
                "cas_25212": sum("25212-74-2" in fold(r.get("商品描述")) for r in all_rows if r["_file"] == p.name),
                "cross_overlap_unique_keys": sum(g[0]["_file"] == p.name or any(r["_file"] == p.name for r in g) for g in cross_groups),
            }
            for p in FILES
        },
        "class_raw": Counter(r["_class"] for r in all_rows),
        "class_unique": Counter(r["_class"] for r in unique_rows),
        "routes": {
            "scope_unique": len(scope_u),
            "china_unique": len(china_u),
            "china_origin": agg(china_u, "原产国/地区"),
            "direct_taxed_unique": len(direct_u),
            "third_to_china_unique": len(b_u),
            "third_to_china_origin": agg(b_u, "原产国/地区"),
            "taxed_to_third_unique": len(a_u),
            "taxed_to_third_origin": agg(a_u, "原产国/地区"),
            "taxed_to_third_destination": agg(a_u, "目的国/地区"),
        },
        "china_all_raw": sum(fold(r.get("目的国/地区")) == china for r in all_rows),
        "china_all_unique": sum(fold(r.get("目的国/地区")) == china for r in unique_rows),
        "china_non_scope_records": [slim(r) for r in unique_rows if fold(r.get("目的国/地区")) == china and r["_class"] not in in_scope],
        "direct_taxed_records": [slim(r) for r in direct_u],
        "b_entity_aggregate": {
            "suppliers": agg(b_u, "供应商")[:50], "buyers": agg(b_u, "采购商")[:50]
        },
        "entity_match_pairs": len(entity_matches),
        "entity_matches": [
            {"a": slim(a), "b": slim(b), "shared_grades": shared}
            for a, b, shared in entity_matches[:2000]
        ],
        "duplicate_group_examples": [
            [{"file": r["_file"], "row": r["_excel_row"]} for r in g]
            for g in duplicate_groups[:30]
        ],
        "cross_overlap_examples": [
            {"locations": [{"file": r["_file"], "row": r["_excel_row"]} for r in g], "record": slim(g[0])}
            for g in cross_groups[:30]
        ],
        "noise_top": Counter(norm(r.get("商品描述")) for r in unique_rows if r["_class"] == "噪声/非PPS").most_common(100),
        "finished_top": Counter(norm(r.get("商品描述")) for r in unique_rows if r["_class"] == "PPS制品（范围外候选）").most_common(100),
        "shape_pending_top": Counter(norm(r.get("商品描述")) for r in unique_rows if r["_class"] == "PPS但形态待核").most_common(200),
    }
    if os.environ.get("PPS_AUDIT_COMPACT") == "1":
        audit.pop("file_profiles", None)
        audit.pop("entity_matches", None)
        audit.pop("duplicate_group_examples", None)
        audit.pop("cross_overlap_examples", None)
        audit.pop("noise_top", None)
        audit.pop("finished_top", None)
        audit.pop("shape_pending_top", None)
    if os.environ.get("PPS_AUDIT_CHAIN") == "1":
        def top_grades(rows: list[dict[str, Any]], n: int = 80):
            c = Counter()
            for r in rows:
                for g in r["_grades"]:
                    if not re.fullmatch(r"\d{2,7}-\d{2}-\d", g):
                        c[g] += 1
            return c.most_common(n)

        hw = "CONGTYTNHHHWASEUNGCHEMICALVIETNAM"
        hdc = "HDCPOLYALLCOLTD"
        a_hw_all = [r for r in a_u if ent(r.get("采购商")) == hw]
        a_hdc_hw = [r for r in a_hw_all if ent(r.get("供应商")) == hdc]
        b_hw = [r for r in b_u if ent(r.get("供应商")) == hw]

        def desc_agg(rows: list[dict[str, Any]], n=100):
            c = Counter(norm(r.get("商品描述")) for r in rows)
            return [{"n": v, "desc": k} for k, v in c.most_common(n)]

        def quantity_sum(rows):
            vals = [num(r.get("数量")) for r in rows]
            return sum(v for v in vals if v is not None), sum(v is None for v in vals)

        def byfield(rows, field):
            o = []
            for k, n in agg(rows, field):
                subset = [r for r in rows if (norm(r.get(field)) or "(blank)") == k]
                q, missing = quantity_sum(subset)
                o.append({"key": k, "rows": n, "qty_field_sum": q, "qty_missing": missing,
                          "date_min": min(r["_date"] for r in subset), "date_max": max(r["_date"] for r in subset)})
            return o

        chain = {
            "a_to_hw_all": {"rows": len(a_hw_all), "origin": byfield(a_hw_all, "原产国/地区"),
                            "supplier": byfield(a_hw_all, "供应商")[:30], "grades": top_grades(a_hw_all)},
            "a_hdc_to_hw": {"rows": len(a_hdc_hw), "origin": byfield(a_hdc_hw, "原产国/地区"),
                            "date_min": min((r["_date"] for r in a_hdc_hw), default=""),
                            "date_max": max((r["_date"] for r in a_hdc_hw), default=""),
                            "qty": quantity_sum(a_hdc_hw), "grades": top_grades(a_hdc_hw),
                            "descs": desc_agg(a_hdc_hw, 100)},
            "b_hw_to_china": {"rows": len(b_hw), "buyers": byfield(b_hw, "采购商")[:40],
                              "date_min": min((r["_date"] for r in b_hw), default=""),
                              "date_max": max((r["_date"] for r in b_hw), default=""),
                              "qty": quantity_sum(b_hw), "grades": top_grades(b_hw),
                              "descs": desc_agg(b_hw, 100)},
        }
        print(json.dumps(chain, ensure_ascii=False, indent=2, default=str))
        return
    if os.environ.get("PPS_AUDIT_EDGE") == "1":
        hw = "CONGTYTNHHHWASEUNGCHEMICALVIETNAM"
        hdc = "HDCPOLYALLCOLTD"
        a_hdc_hw = [r for r in a_u if ent(r.get("采购商")) == hw and ent(r.get("供应商")) == hdc]
        b_hw = [r for r in b_u if ent(r.get("供应商")) == hw]
        u1 = {r["_key"] for r in unique_rows if r["_file"] == FILES[0].name}
        u2 = {r["_key"] for r in unique_rows if r["_file"] == FILES[1].name}
        edge = {
            "unique_per_file": {
                FILES[0].name: len(u1), FILES[1].name: len(u2), "intersection": len(u1 & u2),
                "only_file1": len(u1-u2), "only_file2": len(u2-u1),
            },
            "file1_without_phrase": [slim(r) for r in all_rows if r["_file"] == FILES[0].name and "POLYPHENYLENE SULFIDE" not in fold(r.get("商品描述"))],
            "file2_without_phrase_top": Counter(norm(r.get("商品描述")) for r in all_rows if r["_file"] == FILES[1].name and "POLYPHENYLENE SULFIDE" not in fold(r.get("商品描述"))).most_common(40),
            "finished_records": [slim(r) for r in unique_rows if r["_class"] == "PPS制品（范围外候选）"],
            "same_grade_a": [slim(r) for r in a_hdc_hw if set(r["_grades"]) & set(g for b in b_hw for g in b["_grades"])],
        }
        print(json.dumps(edge, ensure_ascii=False, indent=2, default=str))
        return
    if os.environ.get("PPS_AUDIT_ENTITY") == "1":
        def clean_grade_set(r):
            return {
                g for g in r["_grades"]
                if not re.fullmatch(r"\d{2,7}-\d{2}-\d", g)
                and not re.match(r"^(ET|BE|TK|FG)\d", g)
                and len(g) <= 16
            }
        summary = []
        for supp, bcount in agg(b_u, "供应商"):
            ek = ent(supp if supp != "(blank)" else "")
            bs = [r for r in b_u if ent(r.get("供应商")) == ek]
            aas = [r for r in a_u if ent(r.get("采购商")) == ek]
            matches = []
            for b in bs:
                candidates = []
                for a in aas:
                    if a["_date"] > b["_date"]:
                        continue
                    shared = sorted(clean_grade_set(a) & clean_grade_set(b))
                    if not shared:
                        continue
                    lag = (datetime.strptime(b["_date"], "%Y-%m-%d") - datetime.strptime(a["_date"], "%Y-%m-%d")).days
                    qa, qb = num(a.get("数量")), num(b.get("数量"))
                    candidates.append((lag, abs((qa or 0) - (qb or 0)), a, shared))
                if candidates:
                    lag, qdiff, a, shared = min(candidates, key=lambda x: (x[0], x[1]))
                    matches.append({"lag_days": lag, "qty_diff": qdiff, "shared": shared, "a": slim(a), "b": slim(b)})
            summary.append({
                "b_supplier": supp, "b_rows": len(bs),
                "b_qty_field_sum": sum(num(r.get("数量")) or 0 for r in bs),
                "b_date_min": min(r["_date"] for r in bs), "b_date_max": max(r["_date"] for r in bs),
                "a_rows": len(aas), "a_qty_field_sum": sum(num(r.get("数量")) or 0 for r in aas),
                "a_origins": agg(aas, "原产国/地区"),
                "a_date_min": min((r["_date"] for r in aas), default=""), "a_date_max": max((r["_date"] for r in aas), default=""),
                "same_grade_b_records": len(matches), "same_grade_match_examples": matches[:20],
            })
        print(json.dumps(summary, ensure_ascii=False, indent=2, default=str))
        return
    if os.environ.get("PPS_AUDIT_HPP") == "1":
        hpp = [r for r in unique_rows if "HIGH PERFORMANCE PLASTICS" in fold(r.get("采购商")) or "HIGH PERFORMANCE PLASTICS" in fold(r.get("供应商"))]
        print(json.dumps([slim(r) for r in hpp], ensure_ascii=False, indent=2, default=str))
        return
    if os.environ.get("PPS_AUDIT_PUBLIC_MATCH") == "1":
        hw = "CONGTYTNHHHWASEUNGCHEMICALVIETNAM"
        hdc = "HDCPOLYALLCOLTD"
        aa = [r for r in a_u if ent(r.get("采购商")) == hw and ent(r.get("供应商")) == hdc]
        bb = [r for r in b_u if ent(r.get("供应商")) == hw]
        target_q = {12600.0, 43998.0, 4000.0, 4500.0, 2000.0}
        selected_a = [r for r in aa if num(r.get("数量")) in target_q]
        selected_b = [r for r in bb if r["_date"] == "2025-12-31" or ("E5040GS" in set(r["_grades"]) and num(r.get("数量")) == 2000.0)]
        print(json.dumps({"a": [slim(r) for r in selected_a], "b": [slim(r) for r in selected_b]}, ensure_ascii=False, indent=2, default=str))
        return
    if os.environ.get("PPS_AUDIT_CORRECTED") == "1":
        keys1 = {r["_key"] for r in all_rows if r["_file"] == FILES[0].name}
        keys2 = {r["_key"] for r in all_rows if r["_file"] == FILES[1].name}
        def summarize_group(rows):
            return {
                "rows": len(rows),
                "qty_field_sum": sum(num(r.get("数量")) or 0 for r in rows),
                "amount_field_sum": sum(num(r.get("金额")) or 0 for r in rows),
                "origin": agg(rows, "原产国/地区"),
                "supplier": agg(rows, "供应商")[:30],
                "buyer": agg(rows, "采购商")[:60],
                "date_min": min((r["_date"] for r in rows), default=""),
                "date_max": max((r["_date"] for r in rows), default=""),
            }
        corrected_groups = {}
        for label in [
            "HDC韩国实体—平台目的国冲突/疑似返韩",
            "中国内地实体名线索（仍需地址/提单终核）",
            "香港实体名线索",
            "买方国别待核",
        ]:
            corrected_groups[label] = summarize_group([r for r in b_u if buyer_geo(r.get("采购商")) == label])
        x200 = [r for r in b_u if r["_date"] == "2024-08-29" and "X200P" in set(r["_grades"]) and num(r.get("数量")) == 48000.0]
        hw_non_hdc = [r for r in b_u if ent(r.get("供应商")) == "CONGTYTNHHHWASEUNGCHEMICALVIETNAM" and ent(r.get("采购商")) != "HDCPOLYALLCOLTD"]
        output = {
            "unique_sets": {
                "file1_unique": len(keys1), "file2_unique": len(keys2), "intersection": len(keys1 & keys2),
                "union": len(keys1 | keys2), "file2_incremental": len(keys2 - keys1),
            },
            "product_layer_raw": Counter(r["_layer"] for r in all_rows),
            "product_layer_unique": Counter(r["_layer"] for r in unique_rows),
            "corrected_destination_groups": corrected_groups,
            "hwaseung_non_hdc": summarize_group(hw_non_hdc),
            "x200p_conflict_local": [slim(r) for r in x200],
            "raw_route_counts": {
                "china_all_raw": sum(fold(r.get("目的国/地区")) == "CHINA" for r in all_rows),
                "china_hdc_raw": sum(fold(r.get("目的国/地区")) == "CHINA" and ent(r.get("采购商")) == "HDCPOLYALLCOLTD" for r in all_rows),
                "china_non_hdc_raw": sum(fold(r.get("目的国/地区")) == "CHINA" and ent(r.get("采购商")) != "HDCPOLYALLCOLTD" for r in all_rows),
                "taxed_to_third_raw": sum(fold(r.get("原产国/地区")) in taxed and fold(r.get("目的国/地区")) not in taxed | {"CHINA", ""} and r["_class"] in in_scope for r in all_rows),
                "taxed_to_vietnam_raw": sum(fold(r.get("原产国/地区")) in taxed and fold(r.get("目的国/地区")) == "VIETNAM" and r["_class"] in in_scope for r in all_rows),
                "taxed_to_india_raw": sum(fold(r.get("原产国/地区")) in taxed and fold(r.get("目的国/地区")) == "INDIA" and r["_class"] in in_scope for r in all_rows),
            },
        }
        print(json.dumps(output, ensure_ascii=False, indent=2, default=str))
        return
    if os.environ.get("PPS_AUDIT_CHINAB") == "1":
        high = [r for r in b_u if buyer_geo(r.get("采购商")) == "中国内地实体名线索（仍需地址/提单终核）"]
        hw_nonhdc = [r for r in b_u if ent(r.get("供应商")) == "CONGTYTNHHHWASEUNGCHEMICALVIETNAM" and ent(r.get("采购商")) != "HDCPOLYALLCOLTD"]
        hwa = [r for r in a_u if ent(r.get("采购商")) == "CONGTYTNHHHWASEUNGCHEMICALVIETNAM" and ent(r.get("供应商")) == "HDCPOLYALLCOLTD"]

        def clean_set(r):
            return {g for g in r["_grades"] if not re.fullmatch(r"\d{2,7}-\d{2}-\d", g) and not re.match(r"^(ET|BE|TK|FG)\d", g)}

        exact_grade = []
        for b in hw_nonhdc:
            cs = []
            for a in hwa:
                shared = sorted(clean_set(a) & clean_set(b))
                if not shared or a["_date"] > b["_date"]:
                    continue
                lag = (datetime.strptime(b["_date"], "%Y-%m-%d") - datetime.strptime(a["_date"], "%Y-%m-%d")).days
                cs.append((lag, abs((num(a.get("数量")) or 0) - (num(b.get("数量")) or 0)), a, shared))
            if cs:
                lag, diff, a, shared = min(cs, key=lambda x: (x[0], x[1]))
                exact_grade.append({"lag_days": lag, "qty_diff": diff, "shared": shared, "a": slim(a), "b": slim(b)})

        pair_counter = {}
        for r in high:
            key = (norm(r.get("供应商")), norm(r.get("采购商")))
            pair_counter.setdefault(key, []).append(r)
        pairs = []
        for (s, b), rows in pair_counter.items():
            pairs.append({
                "supplier": s, "buyer": b, "rows": len(rows),
                "qty_field_sum": sum(num(r.get("数量")) or 0 for r in rows),
                "date_min": min(r["_date"] for r in rows), "date_max": max(r["_date"] for r in rows),
                "grades": Counter(g for r in rows for g in clean_set(r)).most_common(30),
                "examples": [slim(r) for r in rows[:4]],
            })
        pairs.sort(key=lambda x: (-x["qty_field_sum"], -x["rows"]))
        output = {
            "high_confidence_china_pairs": pairs,
            "hwaseung_non_hdc_geo": Counter(buyer_geo(r.get("采购商")) for r in hw_nonhdc),
            "hwaseung_non_hdc_same_grade_prior_a_count": len(exact_grade),
            "hwaseung_non_hdc_same_grade_prior_a": exact_grade,
        }
        print(json.dumps(output, ensure_ascii=False, indent=2, default=str))
        return
    if os.environ.get("PPS_AUDIT_CHAOJU") == "1":
        hw = "CONGTYTNHHHWASEUNGCHEMICALVIETNAM"
        hdc = "HDCPOLYALLCOLTD"
        chao = "CHAOJUNEWMATERIALTECHNOLOGYCOLTD"
        aa = [r for r in a_u if ent(r.get("采购商")) == hw and ent(r.get("供应商")) == hdc]
        bb = [r for r in b_u if ent(r.get("供应商")) == hw and ent(r.get("采购商")) == chao]

        known = ["E5060G", "J200", "E1040ST", "E1040S", "N200", "N060", "N065", "MB3602", "MB4101", "B010", "B100", "F237N", "Q110", "R060CH"]
        def pgrade(r):
            gs = set(r["_grades"])
            for g in known:
                if g in gs:
                    return g
            for g in r["_grades"]:
                if not re.fullmatch(r"\d{2,7}-\d{2}-\d", g) and not re.match(r"^(ET|BE|TK|FG|R\d{5,})", g):
                    return g
            return "(grade blank)"

        def pool(rows):
            return {
                "rows": len(rows), "qty_field_sum": sum(num(r.get("数量")) or 0 for r in rows),
                "by_grade": [
                    {"grade": g, "rows": len(rs), "qty_field_sum": sum(num(r.get("数量")) or 0 for r in rs)}
                    for g, rs in sorted(((g, [r for r in rows if pgrade(r) == g]) for g in sorted({pgrade(r) for r in rows})), key=lambda x: -sum(num(r.get("数量")) or 0 for r in x[1]))
                ],
                "date_min": min((r["_date"] for r in rows), default=""), "date_max": max((r["_date"] for r in rows), default=""),
            }

        per_b = []
        for b in sorted(bb, key=lambda r: (r["_date"], r["_excel_row"])):
            bd = datetime.strptime(b["_date"], "%Y-%m-%d")
            item = {"b": slim(b), "grade": pgrade(b), "input_pools": {}}
            for days in (30, 60, 90):
                start = (bd - __import__('datetime').timedelta(days=days)).strftime("%Y-%m-%d")
                rows = [a for a in aa if start <= a["_date"] <= b["_date"]]
                same = [a for a in rows if pgrade(a) == pgrade(b)]
                item["input_pools"][str(days)] = {"all": pool(rows), "same_grade": pool(same)}
            per_b.append(item)

        dmin = min(datetime.strptime(b["_date"], "%Y-%m-%d") for b in bb)
        dmax = max(datetime.strptime(b["_date"], "%Y-%m-%d") for b in bb)
        aggregate_windows = {}
        for days in (30, 60, 90):
            start = (dmin - __import__('datetime').timedelta(days=days)).strftime("%Y-%m-%d")
            rows = [a for a in aa if start <= a["_date"] <= dmax.strftime("%Y-%m-%d")]
            aggregate_windows[str(days)] = pool(rows)
        raw_amount = sum(num(r.get("金额")) or 0 for r in bb)
        output = {
            "b_summary": pool(bb) | {"amount_field_sum": raw_amount, "conditional_36951pct": raw_amount * 0.36951},
            "aggregate_input_window_from_before_first_b_to_last_b": aggregate_windows,
            "per_b": per_b,
        }
        print(json.dumps(output, ensure_ascii=False, indent=2, default=str))
        return
    print(json.dumps(audit, ensure_ascii=False, indent=2, default=str))


if __name__ == "__main__":
    main()
