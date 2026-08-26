#!/usr/bin/env python3
"""Read-only inventory and content audit for local n-propanol trade data.

The script scans every XLSX/XLS/CSV/JSON under D:\易迅数据, classifies
content hits, and writes only derived audit artifacts under product folder 14.
It never edits source files and does not treat project metadata as shipment data.
"""

from __future__ import annotations

import csv
import io
import json
import re
import sys
import zipfile
from collections import Counter
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Any, Iterable

import openpyxl


ROOT = Path(r"D:\易迅数据")
OUT = ROOT / "反倾销税深度分析报告" / "14_正丙醇"
EXTENSIONS = {".xlsx", ".xls", ".csv", ".json"}

TARGET_PATTERNS: list[tuple[str, re.Pattern[str]]] = [
    ("正丙醇", re.compile(r"正丙醇", re.I)),
    ("N-PROPANOL", re.compile(r"\bn[\s_-]*propanol\b", re.I)),
    ("1-PROPANOL", re.compile(r"\b1[\s_-]*propanol\b", re.I)),
    ("PROPAN-1-OL", re.compile(r"\bpropan[\s_-]*1[\s_-]*ol\b", re.I)),
    ("N-PROPYL ALCOHOL", re.compile(r"\bn[\s_-]*propyl[\s_-]*alcohol\b", re.I)),
    ("1-PROPYL ALCOHOL", re.compile(r"\b1[\s_-]*propyl[\s_-]*alcohol\b", re.I)),
    ("ETHYLCARBINOL", re.compile(r"\bethyl[\s_-]*carbinol\b", re.I)),
    ("1-HYDROXYPROPANE", re.compile(r"\b1[\s_-]*hydroxy[\s_-]*propane\b", re.I)),
    ("CAS 71-23-8", re.compile(r"(?<!\d)(?:71(?:\s*[-./_]\s*|\s+)23(?:\s*[-./_]\s*|\s+)8|71238)(?!\d)", re.I)),
    ("HS 29051210", re.compile(r"(?<!\d)29051210(?!\d)", re.I)),
    ("UN 1274", re.compile(r"\bUN[\s_-]*1274\b", re.I)),
]

BROAD_PATTERNS: list[tuple[str, re.Pattern[str]]] = [
    ("PROPANOL泛称", re.compile(r"\bpropanol\b", re.I)),
    ("NPA缩写", re.compile(r"\bNPA\b", re.I)),
]

EXCLUSION_PATTERNS: list[tuple[str, re.Pattern[str]]] = [
    ("ISOPROPANOL", re.compile(r"\biso[\s_-]*propanol\b|\bisopropyl[\s_-]*alcohol\b", re.I)),
    ("2-PROPANOL", re.compile(r"\b2[\s_-]*propanol\b|\bpropan[\s_-]*2[\s_-]*ol\b", re.I)),
    ("CAS 67-63-0", re.compile(r"(?<!\d)(?:67(?:\s*[-./_]\s*|\s+)63(?:\s*[-./_]\s*|\s+)0|67630)(?!\d)", re.I)),
    ("IPA缩写", re.compile(r"\bIPA\b", re.I)),
]

# A substring prefilter is substantially faster than applying all regular
# expressions to 100MB+ exports. Exclusion-only text is irrelevant unless the
# same record has a positive or broad propanol term.
PREFILTER_TOKENS = (
    "正丙醇", "propanol", "propan-1-ol", "propan 1 ol", "propyl alcohol",
    "propyl-alcohol", "ethylcarbinol", "ethyl carbinol", "hydroxypropane",
    "hydroxy propane", "71-23-8", "71 23 8", "71/23/8", "71.23.8",
    "71238", "29051210", "un1274", "un 1274",
)
PREFILTER_RX = re.compile(
    "|".join(re.escape(token) for token in PREFILTER_TOKENS) + r"|\bnpa\b",
    re.I,
)


def any_positive_hit(text: str) -> bool:
    return PREFILTER_RX.search(text) is not None

PROJECT_METADATA_NAMES = {
    "中国反倾销税商品清单_2026-08-11.xlsx",
    "00_全商品查询与报告进度台账.csv",
}


def norm_text(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, (datetime,)):
        return value.isoformat()
    return re.sub(r"\s+", " ", str(value)).strip()


def matches(text: str) -> tuple[list[str], list[str], list[str]]:
    targets = [name for name, rx in TARGET_PATTERNS if rx.search(text)]
    broad = [name for name, rx in BROAD_PATTERNS if rx.search(text)]
    exclusions = [name for name, rx in EXCLUSION_PATTERNS if rx.search(text)]
    return targets, broad, exclusions


def classify_hit(targets: list[str], broad: list[str], exclusions: list[str]) -> str:
    if targets and exclusions:
        return "mixed_target_and_exclusion_review"
    if targets:
        return "target_candidate"
    if broad and exclusions:
        return "excluded_non_target"
    if broad:
        return "ambiguous_broad_term"
    if exclusions:
        return "excluded_non_target"
    return "no_hit"


def source_class(path: Path) -> str:
    if path.name in PROJECT_METADATA_NAMES:
        return "project_metadata"
    if "反倾销税深度分析报告" in path.parts:
        if "_易迅页面采集" in path.parts:
            return "easyxun_page_capture_other_product"
        if "_分析中间数据" in path.parts:
            return "derived_analysis_other_product"
        return "project_output_or_qa"
    return "root_download_or_user_file"


def safe_decode(raw: bytes) -> tuple[str, str]:
    for enc in ("utf-8-sig", "utf-8", "gb18030", "utf-16", "cp1252"):
        try:
            return raw.decode(enc), enc
        except UnicodeDecodeError:
            continue
    return raw.decode("utf-8", errors="replace"), "utf-8-replace"


def xlsx_has_any_hit(path: Path) -> bool:
    try:
        with zipfile.ZipFile(path) as zf:
            for name in zf.namelist():
                if not (name.startswith("xl/") and name.endswith(".xml")):
                    continue
                text, _ = safe_decode(zf.read(name))
                if any_positive_hit(text):
                    return True
    except (zipfile.BadZipFile, OSError):
        return True
    return False


def row_excerpt(values: list[Any], max_chars: int = 4000) -> str:
    text = " | ".join(norm_text(v) for v in values if norm_text(v))
    return text[:max_chars]


def scan_xlsx(path: Path) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    info: dict[str, Any] = {"sheets": 0, "rows_scanned": 0, "cells_scanned": 0, "errors": []}
    hits: list[dict[str, Any]] = []
    if not xlsx_has_any_hit(path):
        info["fast_scan_no_hit"] = True
        return info, hits
    try:
        wb = openpyxl.load_workbook(path, read_only=True, data_only=False)
        info["sheets"] = len(wb.sheetnames)
        for ws in wb.worksheets:
            for row_no, row in enumerate(ws.iter_rows(values_only=True), start=1):
                info["rows_scanned"] += 1
                vals = list(row)
                info["cells_scanned"] += len(vals)
                text = row_excerpt(vals)
                targets, broad, exclusions = matches(text)
                category = classify_hit(targets, broad, exclusions)
                if category != "no_hit":
                    hits.append({
                        "file": str(path), "source_class": source_class(path),
                        "format": "xlsx", "location": f"{ws.title}!row{row_no}",
                        "match_class": category, "target_terms": targets,
                        "broad_terms": broad, "exclusion_terms": exclusions,
                        "text_excerpt": text,
                    })
        wb.close()
    except Exception as exc:  # retain auditability rather than silently skipping
        info["errors"].append(f"{type(exc).__name__}: {exc}")
    return info, hits


def scan_csv(path: Path) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    raw = path.read_bytes()
    text, enc = safe_decode(raw)
    info: dict[str, Any] = {"encoding": enc, "rows_scanned": 0, "errors": []}
    hits: list[dict[str, Any]] = []
    try:
        sample = text[:65536]
        try:
            dialect = csv.Sniffer().sniff(sample, delimiters=",\t;|")
        except csv.Error:
            dialect = csv.excel
        reader = csv.reader(io.StringIO(text), dialect)
        for row_no, row in enumerate(reader, start=1):
            info["rows_scanned"] += 1
            combined = row_excerpt(row)
            targets, broad, exclusions = matches(combined)
            category = classify_hit(targets, broad, exclusions)
            if category != "no_hit":
                hits.append({
                    "file": str(path), "source_class": source_class(path),
                    "format": "csv", "location": f"row{row_no}",
                    "match_class": category, "target_terms": targets,
                    "broad_terms": broad, "exclusion_terms": exclusions,
                    "text_excerpt": combined,
                })
    except Exception as exc:
        info["errors"].append(f"{type(exc).__name__}: {exc}")
    return info, hits


def scalar_items(obj: dict[str, Any]) -> dict[str, Any]:
    return {str(k): v for k, v in obj.items() if not isinstance(v, (dict, list))}


def json_records(obj: Any, loc: str = "$") -> Iterable[tuple[str, dict[str, Any]]]:
    if isinstance(obj, dict):
        scalars = scalar_items(obj)
        if scalars:
            yield loc, scalars
        for key, value in obj.items():
            if isinstance(value, (dict, list)):
                yield from json_records(value, f"{loc}.{key}")
    elif isinstance(obj, list):
        for idx, value in enumerate(obj):
            yield from json_records(value, f"{loc}[{idx}]")
    else:
        yield loc, {"value": obj}


def scan_json(path: Path) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    raw = path.read_bytes()
    text, enc = safe_decode(raw)
    info: dict[str, Any] = {"encoding": enc, "records_scanned": 0, "errors": []}
    hits: list[dict[str, Any]] = []
    if not any_positive_hit(text):
        info["fast_scan_no_hit"] = True
        return info, hits
    try:
        obj = json.loads(text)
        for loc, record in json_records(obj):
            info["records_scanned"] += 1
            combined = " | ".join(f"{k}={norm_text(v)}" for k, v in record.items())[:4000]
            targets, broad, exclusions = matches(combined)
            category = classify_hit(targets, broad, exclusions)
            if category != "no_hit":
                hits.append({
                    "file": str(path), "source_class": source_class(path),
                    "format": "json", "location": loc,
                    "match_class": category, "target_terms": targets,
                    "broad_terms": broad, "exclusion_terms": exclusions,
                    "text_excerpt": combined,
                })
    except Exception as exc:
        info["errors"].append(f"{type(exc).__name__}: {exc}")
    return info, hits


def scan_one(path: Path) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    base = {
        "file": str(path), "name": path.name, "extension": path.suffix.lower(),
        "size_bytes": path.stat().st_size, "modified": path.stat().st_mtime,
        "source_class": source_class(path),
    }
    if path.suffix.lower() == ".xlsx":
        detail, hits = scan_xlsx(path)
    elif path.suffix.lower() == ".csv":
        detail, hits = scan_csv(path)
    elif path.suffix.lower() == ".json":
        detail, hits = scan_json(path)
    else:
        detail, hits = {"errors": ["legacy .xls is not parsed by openpyxl"]}, []
    base.update(detail)
    base["hit_rows_or_records"] = len(hits)
    base["hit_class_counts"] = dict(Counter(hit["match_class"] for hit in hits))
    return base, hits


def write_csv(path: Path, rows: list[dict[str, Any]], fieldnames: list[str]) -> None:
    with path.open("w", encoding="utf-8-sig", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        for row in rows:
            clean = dict(row)
            for key, value in clean.items():
                if isinstance(value, (list, dict)):
                    clean[key] = json.dumps(value, ensure_ascii=False, separators=(",", ":"))
            writer.writerow(clean)


def main() -> int:
    files = sorted(
        p for p in ROOT.rglob("*")
        if p.is_file() and p.suffix.lower() in EXTENSIONS and OUT not in p.parents
        and not p.name.startswith("~$")
    )
    inventory: list[dict[str, Any]] = []
    hits: list[dict[str, Any]] = []
    for idx, path in enumerate(files, start=1):
        print(f"[{idx}/{len(files)}] {path}", flush=True)
        info, file_hits = scan_one(path)
        inventory.append(info)
        hits.extend(file_hits)

    OUT.mkdir(parents=True, exist_ok=True)
    now_cn = datetime.now(timezone(timedelta(hours=8))).isoformat(timespec="seconds")
    counts = {
        "scanned_at_asia_shanghai": now_cn,
        "root": str(ROOT),
        "files_scanned": len(files),
        "extension_counts": dict(Counter(p.suffix.lower() for p in files)),
        "source_class_counts": dict(Counter(item["source_class"] for item in inventory)),
        "files_with_content_hits": sum(1 for item in inventory if item["hit_rows_or_records"]),
        "hit_rows_or_records": len(hits),
        "hit_class_counts": dict(Counter(hit["match_class"] for hit in hits)),
        "hit_source_class_counts": dict(Counter(hit["source_class"] for hit in hits)),
        "root_download_hit_records": sum(1 for h in hits if h["source_class"] == "root_download_or_user_file"),
        "source_trade_data_found": any(
            h["source_class"] in {"root_download_or_user_file", "easyxun_page_capture_other_product"}
            and h["match_class"] in {"target_candidate", "mixed_target_and_exclusion_review"}
            and Path(h["file"]).name not in PROJECT_METADATA_NAMES
            for h in hits
        ),
        "limitations": [
            "本地文件内容盘点不等同于易迅网页全库查询。",
            "仅凭NPA或propanol泛称不能确认正丙醇，须结合CAS、HS及完整货描。",
            "项目清单、进度台账和既有报告中的政策文字不计为逐票贸易记录。",
        ],
    }

    (OUT / "正丙醇_本地全盘内容审计.json").write_text(
        json.dumps({"summary": counts, "inventory": inventory, "hits": hits}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    write_csv(
        OUT / "正丙醇_本地文件盘点台账.csv", inventory,
        ["file", "name", "extension", "size_bytes", "modified", "source_class",
         "sheets", "rows_scanned", "cells_scanned", "records_scanned", "encoding",
         "fast_scan_no_hit", "hit_rows_or_records", "hit_class_counts", "errors"],
    )
    write_csv(
        OUT / "正丙醇_本地内容命中明细.csv", hits,
        ["file", "source_class", "format", "location", "match_class",
         "target_terms", "broad_terms", "exclusion_terms", "text_excerpt"],
    )
    (OUT / "正丙醇_本地盘点摘要.json").write_text(
        json.dumps(counts, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(json.dumps(counts, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
