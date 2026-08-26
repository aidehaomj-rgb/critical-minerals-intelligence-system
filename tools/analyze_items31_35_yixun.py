from __future__ import annotations

import base64
import csv
import gzip
import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "outputs" / "反倾销税深度分析报告"

HEADERS = [
    "数据源", "进出口", "日期", "HS编码", "商品描述", "采购商", "供应商",
    "重量", "数量", "金额", "目的国地区", "原产国地区", "操作",
]

FILES = {
    "31_keyword": OUT / "31_腈纶" / "腈纶_易迅_ACRYLIC_FIBER_China_两年.json.gz.b64",
    "32_keyword": OUT / "32_未漂白纸袋纸" / "未漂白纸袋纸_易迅关键词_China_两年.json.gz.b64",
    "33_hs": OUT / "33_光纤预制棒" / "光纤预制棒_易迅_HS700220_China_两年.json.gz.b64",
    "34_keyword": OUT / "34_太阳能级多晶硅" / "太阳能级多晶硅_易迅_POLYSILICON_China_两年.json.gz.b64",
    "34_hs": OUT / "34_太阳能级多晶硅" / "太阳能级多晶硅_易迅_HS280461_China_两年.json.gz.b64",
}

ITEM35_PATH = OUT / "35_碳钢紧固件" / "碳钢紧固件_易迅精准查询_China_两年.json"


def read_b64(path: Path) -> dict:
    raw = base64.b64decode(path.read_text(encoding="utf-8").strip())
    return json.loads(gzip.decompress(raw).decode("utf-8"))


def flatten(obj: dict | list) -> list[list[str]]:
    pages = obj if isinstance(obj, list) else obj.get("pages", [])
    return [row for page in pages for row in page]


def norm_row(row: list[str]) -> tuple[str, ...]:
    vals = [str(x).strip() for x in row[:13]]
    vals += [""] * (13 - len(vals))
    return tuple(vals)


def rows_to_dicts(rows: list[list[str]]) -> list[dict[str, str]]:
    out = []
    for row in rows:
        vals = list(norm_row(row))
        out.append(dict(zip(HEADERS, vals)))
    return out


def top(records: list[dict[str, str]], field: str, n: int = 12) -> list[dict[str, object]]:
    c = Counter(r.get(field, "") or "(空)" for r in records)
    return [{"value": k, "count": v} for k, v in c.most_common(n)]


def scope_class(tag: str, d: dict[str, str]) -> str:
    desc = d["商品描述"].upper()
    hs = d["HS编码"].replace(".", "")
    if tag.startswith("31"):
        if "MODACRYLIC" in desc or "CARBON FIBER" in desc or "PRECURSOR" in desc:
            return "明确或高度疑似范围外"
        if "ACRYLIC" in desc and (hs.startswith("550130") or hs.startswith("550330") or hs.startswith("550630")):
            return "措施范围候选"
        return "待规格/税号复核"
    if tag.startswith("32"):
        if "BLEACHED" in desc and "UNBLEACHED" not in desc:
            return "范围外（漂白）"
        if "SACK" in desc and "KRAFT" in desc and "UNBLEACH" in desc:
            return "措施范围候选—七项物性待核"
        return "待品名/物性复核"
    if tag.startswith("33"):
        if "PREFORM" in desc or "PREFORMA" in desc:
            return "光纤预制棒候选—直径待核"
        if "GLASS ROD" in desc or "QUARTZ ROD" in desc:
            return "石英/玻璃棒待用途与直径复核"
        return "同HS其他/待核"
    if tag.startswith("34"):
        if any(x in desc for x in ["WAFER", "INGOT", "CELL", "MODULE"]):
            return "下游制品/范围外候选"
        if "ELECTRONIC" in desc or "SEMICONDUCTOR" in desc:
            return "电子级排除候选"
        if "POLYSILICON" in desc or "POLYCRYSTALLINE SILICON" in desc:
            return "多晶硅候选—太阳能级待核"
        if hs.startswith("280461"):
            return "高纯硅同税号—用途待核"
        return "待核"
    return "待核"


def scope_class_35(d: dict[str, str]) -> str:
    desc = d["商品描述"].upper()
    hs = d["HS编码"].replace(".", "")
    if any(x in desc for x in ["VALVE", "BALL SCREW", "LOUDSPEAKER", "CARBON FIBER"]):
        return "范围外（其他货物或总成）"
    if hs.startswith("731816") or " NUT" in f" {desc}":
        return "范围外（螺母）"
    if any(x in desc for x in ["M1.", "M2", "M3", "M4", "M5", "M6", "TF3.5", "PA2.6", "PA1.7"]):
        return "范围外候选（杆径不超过6毫米）"
    if any(x in desc for x in ["CARBON STEEL BOLT", "MADE OF CARBON STEEL", "CARBON STEEL WASHER", "CARBON SPRING STEEL"]):
        return "措施范围候选—原产地/尺寸待核"
    return "范围待核"


def write_csv(path: Path, records: list[dict[str, str]], extra: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fields = HEADERS + extra
    with path.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(records)


def main() -> None:
    summaries = {}
    loaded = {}
    for tag, path in FILES.items():
        obj = read_b64(path)
        rows = flatten(obj)
        recs = rows_to_dicts(rows)
        for i, r in enumerate(recs, 1):
            r["查询标签"] = tag
            r["查询内序号"] = str(i)
            r["范围初筛"] = scope_class(tag, r)
        unique_map = {}
        for r in recs:
            key = tuple(r[h] for h in HEADERS)
            unique_map.setdefault(key, r)
        unique = list(unique_map.values())
        loaded[tag] = unique
        target_dir = path.parent
        write_csv(target_dir / f"{tag}_易迅逐票标准化.csv", recs, ["查询标签", "查询内序号", "范围初筛"])
        summaries[tag] = {
            "query_meta": ({k: v for k, v in obj.items() if k != "pages"}
                           if isinstance(obj, dict) else {"pages": len(obj)}),
            "raw_rows": len(recs),
            "visible_exact_unique": len(unique),
            "visible_exact_duplicates": len(recs) - len(unique),
            "date_min": min((r["日期"] for r in unique if r["日期"]), default=""),
            "date_max": max((r["日期"] for r in unique if r["日期"]), default=""),
            "top_data_source": top(unique, "数据源"),
            "top_origin": top(unique, "原产国地区"),
            "top_supplier": top(unique, "供应商"),
            "top_buyer": top(unique, "采购商"),
            "top_hs": top(unique, "HS编码"),
            "scope": top(unique, "范围初筛"),
        }

    if "34_keyword" in loaded and "34_hs" in loaded:
        a = {tuple(r[h] for h in HEADERS) for r in loaded["34_keyword"]}
        b = {tuple(r[h] for h in HEADERS) for r in loaded["34_hs"]}
        summaries["34_cross_query"] = {
            "keyword_unique": len(a), "hs_unique": len(b), "intersection": len(a & b),
            "union": len(a | b), "keyword_only": len(a - b), "hs_only": len(b - a),
        }
        union_records = []
        seen = set()
        for r in loaded["34_keyword"] + loaded["34_hs"]:
            key = tuple(r[h] for h in HEADERS)
            if key not in seen:
                seen.add(key)
                union_records.append(r)
        write_csv(OUT / "34_太阳能级多晶硅" / "太阳能级多晶硅_跨查询合并去重.csv", union_records, ["查询标签", "查询内序号", "范围初筛"])

    if ITEM35_PATH.exists():
        obj35 = json.loads(ITEM35_PATH.read_text(encoding="utf-8"))
        all35 = []
        for label in ("bolt", "screw", "washer"):
            for idx, row in enumerate(obj35.get(label, []), 1):
                rec = rows_to_dicts([row])[0]
                rec["查询标签"] = f"35_{label}"
                rec["查询内序号"] = str(idx)
                rec["范围初筛"] = scope_class_35(rec)
                all35.append(rec)
        unique35 = {}
        for r in all35:
            unique35.setdefault(tuple(r[h] for h in HEADERS), r)
        unique35_records = list(unique35.values())
        write_csv(
            OUT / "35_碳钢紧固件" / "碳钢紧固件_易迅精准查询逐票标准化.csv",
            all35,
            ["查询标签", "查询内序号", "范围初筛"],
        )
        write_csv(
            OUT / "35_碳钢紧固件" / "碳钢紧固件_易迅精准查询可见字段去重.csv",
            unique35_records,
            ["查询标签", "查询内序号", "范围初筛"],
        )
        summaries["35_targeted"] = {
            "query_scope": obj35.get("query_scope", {}),
            "raw_rows": len(all35),
            "visible_exact_unique": len(unique35_records),
            "visible_exact_duplicates": len(all35) - len(unique35_records),
            "top_origin": top(unique35_records, "原产国地区"),
            "top_supplier": top(unique35_records, "供应商"),
            "top_buyer": top(unique35_records, "采购商"),
            "top_hs": top(unique35_records, "HS编码"),
            "scope": top(unique35_records, "范围初筛"),
        }

    out_path = OUT / "31_35_易迅阶段汇总.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(summaries, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(summaries, ensure_ascii=True, indent=2))


if __name__ == "__main__":
    main()
