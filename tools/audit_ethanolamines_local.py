from __future__ import annotations

import csv
import json
import re
import sys
import zipfile
from collections import Counter
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Iterable

from openpyxl import load_workbook


ROOT = Path(r"D:\易迅数据")
OUT = ROOT / "反倾销税深度分析报告" / "20_乙醇胺"
OUT.mkdir(parents=True, exist_ok=True)
EXTS = {".xlsx", ".xls", ".csv", ".json"}

HS_RE = re.compile(r"(?<!\d)29221(?:100|200|500)(?!\d)", re.I)
NAME_RE = re.compile(
    r"ETHANOLAMINES?|MONO\s*ETHANOL\s*AMINE|MONOETHANOLAMINE|"
    r"DI\s*ETHANOL\s*AMINE|DIETHANOLAMINE|TRI\s*ETHANOL\s*AMINE|TRIETHANOLAMINE|"
    r"2\s*[- ]?AMINO\s*ETHANOL|2\s*[- ]?AMINOETHYL\s*ALCOHOL|"
    r"2\s*,?2['’\- ]*IMINO\s*DIETHANOL|TRIS\s*\(?2\s*[- ]?HYDROXYETHYL\)?\s*AMINE|"
    r"乙醇胺|一乙醇胺|单乙醇胺|二乙醇胺|三乙醇胺|2[-－ ]?氨基乙醇|2[-－ ]?羟基乙胺",
    re.I,
)
CAS_RE = re.compile(r"(?<!\d)(?:141[- ]?43[- ]?5|111[- ]?42[- ]?2|102[- ]?71[- ]?6)(?!\d)", re.I)
ACRONYM_RE = re.compile(r"(?<![A-Z0-9])(?:MEA|DEA|TEA)(?![A-Z0-9])", re.I)
ACRONYM_CONTEXT_RE = re.compile(
    r"(?:(?<![A-Z0-9])(?:MEA|DEA|TEA)(?![A-Z0-9])).{0,60}"
    r"(?:AMINE|ETHANOL|CHEMICAL|CAS|29221|PURITY|DRUM|TANK|99\s*%)|"
    r"(?:AMINE|ETHANOL|CHEMICAL|CAS|29221|PURITY|DRUM|TANK|99\s*%).{0,60}"
    r"(?:(?<![A-Z0-9])(?:MEA|DEA|TEA)(?![A-Z0-9]))",
    re.I,
)
SALT_RE = re.compile(r"(?:MONO|DI)?ETHANOLAMINE\s+(?:SALT|HYDROCHLORIDE|PHOSPHATE|SULFATE)|乙醇胺盐|单乙醇胺盐|二乙醇胺盐", re.I)
DERIV_RE = re.compile(
    r"COCAMIDE\s*(?:MEA|DEA)|LAURAMIDE\s*(?:MEA|DEA)|OLEAMIDE\s*(?:MEA|DEA)|"
    r"COCOYl\s*(?:MEA|DEA)|FATTY\s*ACID.*(?:MEA|DEA)|TRIETHANOLAMINE\s*(?:STEARATE|OLEATE)|"
    r"TEA[- ]?(?:LAURYL|COCOYL|DODECYL)|NITRILOTRIETHANOL|TRIS\s*BUFFER|"
    r"乙醇胺衍生物|椰油酰胺|月桂酰胺|脂肪酸.*乙醇胺",
    re.I,
)
PRODUCT_RE = re.compile(r"SHAMPOO|COSMETIC|CREAM|DETERGENT|SURFACTANT\s+BLEND|CEMENT\s+ADDITIVE|制剂|洗发|化妆|乳霜|清洗剂|水泥助磨剂", re.I)
META_RE = re.compile(r"反倾销|税率|报告状态|任务ID|受税来源|商务部公告|查询组合|调查产品", re.I)


def clean(value: Any) -> str:
    if value is None:
        return ""
    return re.sub(r"\s+", " ", str(value)).strip()


def classify(text: str) -> tuple[str, str, list[str]]:
    hits: list[str] = []
    hs = bool(HS_RE.search(text))
    name = bool(NAME_RE.search(text))
    cas = bool(CAS_RE.search(text))
    acronym = bool(ACRONYM_CONTEXT_RE.search(text))
    if hs: hits.append("措施HS")
    if name: hits.append("化学名称")
    if cas: hits.append("CAS")
    if acronym: hits.append("MEA/DEA/TEA缩写")
    if not (hs or name or cas or acronym):
        return "不命中", "", hits
    if META_RE.search(text) and not re.search(r"20\d{2}[-/]\d{1,2}[-/]\d{1,2}", text):
        return "项目元数据/政策引用", "非贸易记录", hits
    if SALT_RE.search(text):
        return "乙醇胺盐_明确排除", "公告明确排除29221100项下一乙醇胺盐和29221200项下二乙醇胺盐", hits
    if DERIV_RE.search(text):
        return "衍生物_倾向排除", "货描指向酰胺、表活盐或缓冲剂等衍生物，需CAS/纯度复核", hits
    if PRODUCT_RE.search(text) and not (name or cas):
        return "下游混合物/制品", "仅缩写或宽HS不足以确认纯乙醇胺", hits
    if name or cas:
        return "乙醇胺候选", "需逐票确定MEA/DEA/TEA、纯度、盐/混合物形态、生产商与中国进口HS", hits
    if hs:
        return "仅措施HS待货描", "税号命中但可见货描不足", hits
    return "仅缩写待核", "MEA/DEA/TEA缩写存在高噪声，必须结合化学品货描或CAS", hits


def source_class(path: Path) -> str:
    s = str(path)
    if "_易迅页面采集" in s:
        return "易迅原始页面采集"
    if "反倾销税深度分析报告" in s:
        return "项目派生输出/QA"
    if path.parent == ROOT:
        return "用户下载原始文件"
    return "其他本地文件"


def iter_rows(path: Path) -> Iterable[dict]:
    suffix = path.suffix.lower()
    if suffix == ".xlsx":
        wb = load_workbook(path, read_only=True, data_only=True)
        try:
            for ws in wb.worksheets:
                iterator = ws.iter_rows(values_only=True)
                try:
                    first = list(next(iterator))
                except StopIteration:
                    continue
                headers = [clean(x) for x in first]
                header_like = any(re.search(r"日期|HS|描述|商品|采购|供应|买方|卖方|date|description", h, re.I) for h in headers)
                if not header_like:
                    yield make_record(path, ws.title, 1, first, None)
                    headers = None
                for idx, row in enumerate(iterator, 2):
                    yield make_record(path, ws.title, idx, list(row), headers)
        finally:
            wb.close()
    elif suffix == ".csv":
        csv.field_size_limit(min(sys.maxsize, 2_000_000_000))
        for enc in ("utf-8-sig", "utf-8", "gb18030"):
            try:
                with path.open(encoding=enc, newline="") as handle:
                    reader = csv.reader(handle)
                    try:
                        headers = next(reader)
                    except StopIteration:
                        return
                    for idx, row in enumerate(reader, 2):
                        yield make_record(path, "CSV", idx, row, headers if len(headers) == len(row) else None)
                return
            except UnicodeDecodeError:
                continue
    elif suffix == ".json":
        data = json.loads(path.read_text(encoding="utf-8-sig"))
        for loc, obj in walk_json(data):
            if isinstance(obj, dict):
                yield make_record(path, loc, 1, list(obj.values()), list(obj.keys()))
            elif isinstance(obj, list):
                yield make_record(path, loc, 1, obj, None)


def walk_json(obj: Any, loc: str = "$"):
    if isinstance(obj, dict):
        keys = " ".join(map(str, obj.keys()))
        if re.search(r"日期|HS|描述|商品|采购|供应|买方|卖方|date|description|buyer|seller", keys, re.I):
            yield loc, obj
        for k, v in obj.items():
            if isinstance(v, (dict, list)):
                yield from walk_json(v, f"{loc}.{k}")
    elif isinstance(obj, list):
        if obj and all(not isinstance(x, (dict, list)) for x in obj):
            yield loc, obj
        else:
            for i, v in enumerate(obj):
                yield from walk_json(v, f"{loc}[{i}]")


def make_record(path: Path, location: str, row_no: int, values: list[Any], headers: list[str] | None):
    vals = [clean(x) for x in values]
    text = " | ".join(v for v in vals if v)
    cls, reason, hits = classify(text)
    mapped = {clean(k): v for k, v in zip(headers or [], vals)} if headers and len(headers) == len(vals) else {}
    return {
        "source_file": str(path),
        "source_class": source_class(path),
        "location": str(location),
        "row_no": str(row_no),
        "classification": cls,
        "classification_reason": reason,
        "match_basis": ";".join(hits),
        "record_text": text[:20000],
        "record_json": json.dumps(mapped, ensure_ascii=False) if mapped else "",
    }


def prefilter(path: Path) -> tuple[bool, str, str]:
    try:
        if path.suffix.lower() == ".xlsx":
            with zipfile.ZipFile(path) as zf:
                parts = [n for n in zf.namelist() if n == "xl/sharedStrings.xml" or (n.startswith("xl/worksheets/") and n.endswith(".xml"))]
                text = " ".join(zf.read(n).decode("utf-8", errors="ignore") for n in parts)
        else:
            raw = path.read_bytes()
            text = ""
            for enc in ("utf-8", "utf-8-sig", "gb18030", "latin-1"):
                try:
                    text = raw.decode(enc)
                    break
                except UnicodeDecodeError:
                    continue
        hit = bool(HS_RE.search(text) or NAME_RE.search(text) or CAS_RE.search(text) or ACRONYM_CONTEXT_RE.search(text))
        return hit, "", ";".join(x for x, ok in [("HS", bool(HS_RE.search(text))), ("NAME", bool(NAME_RE.search(text))), ("CAS", bool(CAS_RE.search(text))), ("ACRONYM_CONTEXT", bool(ACRONYM_CONTEXT_RE.search(text)))] if ok)
    except Exception as exc:
        return False, f"{type(exc).__name__}: {exc}", ""


def main() -> None:
    files = sorted(p for p in ROOT.rglob("*") if p.is_file() and p.suffix.lower() in EXTS and OUT not in p.parents and not p.name.startswith("~$"))
    inventory = []
    candidates = []
    for path in files:
        is_derived = "反倾销税深度分析报告" in str(path) and "_易迅页面采集" not in str(path)
        if is_derived:
            hit, error, basis = False, "", "派生输出仅盘点不重复读取"
        else:
            hit, error, basis = prefilter(path)
        row = {"file": str(path), "extension": path.suffix.lower(), "size_bytes": path.stat().st_size, "source_class": source_class(path), "prefilter_hit": hit, "match_basis": basis, "error": error}
        inventory.append(row)
        # 前序商品已经生成大量派生CSV/JSON；这些文件纳入盘点，但不再次逐行
        # 展开，以免把同一底层易迅记录重复计算。仅保留原始页面采集文件例外。
        if hit and not error and not is_derived:
            candidates.append(path)

    fields = list(inventory[0])
    with (OUT / "乙醇胺_本地预筛文件台账.csv").open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields); writer.writeheader(); writer.writerows(inventory)
    hits = []
    audit = []
    for path in candidates:
        before = len(hits)
        error = ""
        try:
            for row in iter_rows(path):
                if row["classification"] != "不命中":
                    hits.append(row)
        except Exception as exc:
            error = f"{type(exc).__name__}: {exc}"
        audit.append({"file": str(path), "hit_rows": len(hits) - before, "error": error})

    hit_fields = list(hits[0]) if hits else ["source_file","source_class","location","row_no","classification","classification_reason","match_basis","record_text","record_json"]
    with (OUT / "乙醇胺_本地深扫全部命中.csv").open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=hit_fields); writer.writeheader(); writer.writerows(hits)
    (OUT / "乙醇胺_本地深扫全部命中.json").write_text(json.dumps(hits, ensure_ascii=False, indent=2), encoding="utf-8")
    with (OUT / "乙醇胺_本地深扫文件审计.csv").open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=["file","hit_rows","error"]); writer.writeheader(); writer.writerows(audit)

    # Visible-field dedup; retains provenance count.
    dedup = {}
    for row in hits:
        key = row["record_text"].strip()
        if key not in dedup:
            dedup[key] = dict(row, occurrence_count=1, provenance=[{"file": row["source_file"], "location": row["location"], "row_no": row["row_no"]}])
        else:
            dedup[key]["occurrence_count"] += 1
            dedup[key]["provenance"].append({"file": row["source_file"], "location": row["location"], "row_no": row["row_no"]})
    dedup_rows = []
    for i, row in enumerate(dedup.values(), 1):
        row = dict(row)
        row["dedup_id"] = f"EA-{i:05d}"
        row["provenance"] = json.dumps(row["provenance"], ensure_ascii=False)
        dedup_rows.append(row)
    dedup_fields = ["dedup_id","occurrence_count"] + [f for f in hit_fields if f not in {"dedup_id","occurrence_count"}] + ["provenance"]
    with (OUT / "乙醇胺_本地深扫去重记录.csv").open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=dedup_fields); writer.writeheader(); writer.writerows(dedup_rows)
    (OUT / "乙醇胺_本地深扫去重记录.json").write_text(json.dumps(dedup_rows, ensure_ascii=False, indent=2), encoding="utf-8")

    summary = {
        "updated_at": datetime.now(timezone(timedelta(hours=8))).isoformat(timespec="seconds"),
        "files_total": len(files),
        "candidate_files": len(candidates),
        "prefilter_errors": sum(bool(r["error"]) for r in inventory),
        "deep_scan_errors": sum(bool(r["error"]) for r in audit),
        "hit_occurrences": len(hits),
        "visible_unique": len(dedup_rows),
        "class_counts_raw": dict(Counter(r["classification"] for r in hits)),
        "class_counts_unique": dict(Counter(r["classification"] for r in dedup_rows)),
        "source_counts_unique": dict(Counter(r["source_class"] for r in dedup_rows)),
        "qa": {"all_files_accounted": len(files) == len(inventory), "unique_not_gt_raw": len(dedup_rows) <= len(hits), "no_prefilter_errors": not any(r["error"] for r in inventory)},
    }
    (OUT / "乙醇胺_本地盘点摘要.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
