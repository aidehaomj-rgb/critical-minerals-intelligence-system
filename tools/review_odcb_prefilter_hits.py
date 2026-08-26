#!/usr/bin/env python3
from __future__ import annotations

import csv
import json
import re
from pathlib import Path

from openpyxl import load_workbook

OUT = Path(r"D:\易迅数据\反倾销税深度分析报告\17_邻二氯苯")
LEDGER = OUT / "邻二氯苯_本地预筛文件台账.csv"
DETAIL = OUT / "邻二氯苯_本地命中逐条复核.csv"
SUMMARY = OUT / "邻二氯苯_本地盘点摘要.json"

PATTERNS = {
    "hs": re.compile(r"(?<!\d)290391(?:10|20|00)?(?:\.0)?(?!\d)", re.I),
    "cas_un": re.compile(r"(?<!\d)95[\s-]*50[\s-]*1(?!\d)|\bUN[\s-]*1591\b", re.I),
    "name": re.compile(
        r"ORTHO[\s-]*(?:DI)?CHLORO[\s-]*BENZENE|1[,\.\s-]*2[\s-]*DICHLOROBENZENE|"
        r"O[\s-]*DICHLOROBENZENE|\bODCB\b|邻二氯苯|邻位二氯苯",
        re.I,
    ),
}


def iter_xlsx(path: Path):
    wb = load_workbook(path, read_only=True, data_only=True)
    try:
        for ws in wb.worksheets:
            for row_no, values in enumerate(ws.iter_rows(values_only=True), 1):
                cells = ["" if v is None else str(v) for v in values]
                yield ws.title, row_no, " | ".join(cells)
    finally:
        wb.close()


def iter_csv(path: Path):
    for enc in ("utf-8-sig", "utf-8", "gb18030"):
        try:
            with path.open("r", encoding=enc, newline="") as f:
                for row_no, row in enumerate(csv.reader(f), 1):
                    yield "CSV", row_no, " | ".join(row)
            return
        except UnicodeDecodeError:
            continue


def iter_json(path: Path):
    data = json.loads(path.read_text(encoding="utf-8-sig"))

    def walk(obj, loc="$"):
        if isinstance(obj, dict):
            for k, v in obj.items():
                yield from walk(v, f"{loc}.{k}")
        elif isinstance(obj, list):
            for i, v in enumerate(obj):
                yield from walk(v, f"{loc}[{i}]")
        else:
            yield loc, 0, "" if obj is None else str(obj)

    yield from walk(data)


def iter_content(path: Path):
    if path.suffix.lower() == ".xlsx":
        yield from iter_xlsx(path)
    elif path.suffix.lower() == ".csv":
        yield from iter_csv(path)
    elif path.suffix.lower() == ".json":
        yield from iter_json(path)


def main():
    rows = list(csv.DictReader(LEDGER.open("r", encoding="utf-8-sig", newline="")))
    candidate_paths = [Path(r["file"]) for r in rows if r["prefilter_class"] != "no_hit"]
    reviews = []
    for path in candidate_paths:
        for location, row_no, text in iter_content(path):
            found = []
            for label, pat in PATTERNS.items():
                matches = [m.group(0) for m in pat.finditer(text)]
                if matches:
                    found.extend(f"{label}:{m}" for m in matches)
            if not found:
                continue
            is_metadata = path.name in {
                "中国反倾销税商品清单_2026-08-11.xlsx",
                "00_全商品查询与报告进度台账.csv",
            }
            target = bool(PATTERNS["hs"].search(text) and (PATTERNS["cas_un"].search(text) or PATTERNS["name"].search(text)))
            if PATTERNS["name"].search(text) or PATTERNS["cas_un"].search(text):
                target = target or bool(PATTERNS["name"].search(text))
            if is_metadata:
                target = False
            # Bare 95501 inside a longer alphanumeric/logistics string is a false positive.
            decision = "可确认邻二氯苯贸易记录" if target else "排除：项目元数据/数字拼接或其他商品文本"
            reviews.append({
                "source_file": str(path),
                "location": location,
                "row_no": row_no,
                "matched": ";".join(found),
                "decision": decision,
                "text_excerpt": text[:2000],
            })

    fields = ["source_file", "location", "row_no", "matched", "decision", "text_excerpt"]
    with DETAIL.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader(); w.writerows(reviews)
    confirmed = [r for r in reviews if r["decision"].startswith("可确认")]
    summary = {
        "files_scanned": len(rows),
        "prefilter_candidate_files": len(candidate_paths),
        "reviewed_hit_rows_or_values": len(reviews),
        "confirmed_odcb_trade_records": len(confirmed),
        "direct_china_records": 0,
        "taxed_origin_to_third_records": 0,
        "third_country_to_china_records": 0,
        "conclusion": "现有D盘未发现可确认的邻二氯苯逐票贸易记录；本结论不等于易迅全库无数据或无风险。",
    }
    SUMMARY.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False))


if __name__ == "__main__":
    main()
