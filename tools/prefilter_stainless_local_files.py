#!/usr/bin/env python3
"""Checkpointed content prefilter for stainless billet / hot-rolled products."""

from __future__ import annotations

import csv
import json
import re
import sys
import zipfile
from collections import Counter
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(r"D:\易迅数据")
OUT = ROOT / "反倾销税深度分析报告" / "16_不锈钢钢坯和热轧板卷"
OUT.mkdir(parents=True, exist_ok=True)
CSV_OUT = OUT / "不锈钢钢坯热轧板卷_本地预筛文件台账.csv"
JSON_OUT = OUT / "不锈钢钢坯热轧板卷_本地预筛文件台账.json"
EXTENSIONS = {".xlsx", ".xls", ".csv", ".json"}

HS = [
    "72189100", "72189900", "72191100", "72191210", "72191290",
    "72191312", "72191319", "72191322", "72191329", "72191412",
    "72191419", "72191422", "72191429", "72192100", "72192200",
    "72192300", "72192410", "72192420", "72192430", "72201100",
    "72201200", "72223000",
]

HS_RX = re.compile(r"(?<!\d)(?:" + "|".join(HS) + r")(?:\.0)?(?!\d)", re.I)
PRODUCT_RX = re.compile(
    r"STAINLESS.{0,40}(?:BILLET|SLAB|BLOOM|SEMI[\s-]?FINISHED|HOT[\s-]?ROLL(?:ED)?|HR[\s-]?(?:COIL|PLATE)|HRC|SSHR|BLACK[\s-]?COIL|WHITE[\s-]?COIL|NO\.?\s*1|1D)"
    r"|(?:BILLET|SLAB|BLOOM|SEMI[\s-]?FINISHED|HOT[\s-]?ROLL(?:ED)?|HR[\s-]?(?:COIL|PLATE)|HRC|SSHR).{0,40}STAINLESS"
    r"|不锈钢.{0,20}(?:钢坯|板坯|热轧|黑皮卷|白皮卷|板卷|卷板|半成品)"
    r"|(?:钢坯|板坯|热轧|黑皮卷|白皮卷).{0,20}不锈钢",
    re.I | re.S,
)
WIDE_RX = re.compile(r"STAINLESS|不锈钢|HOT[\s-]?ROLL|热轧|钢坯|板坯|SSHR|HRC", re.I)
EXCL_RX = re.compile(
    r"COLD[\s-]?ROLL|冷轧|WELD(?:ED)?\s*(?:PIPE|TUBE)|焊管|SEAMLESS|无缝管|"
    r"WIRE|丝|线材|FASTENER|紧固件|SCREW|螺丝|BOLT|螺栓|SINK|水槽|CUTLERY|餐具|"
    r"KITCHEN|厨具|STRIP|窄带|FOIL|箔|SCRAP|废料",
    re.I,
)


def decode(raw: bytes) -> str:
    for enc in ("utf-8", "utf-8-sig", "utf-16", "gb18030", "latin-1"):
        try:
            return raw.decode(enc)
        except UnicodeDecodeError:
            pass
    return raw.decode("utf-8", errors="replace")


def scan_blob(text: str) -> dict:
    hs = sorted(set(m.group(0) for m in HS_RX.finditer(text)))
    product = []
    wide = []
    exclusions = []
    for rx, target, cap in ((PRODUCT_RX, product, 50), (WIDE_RX, wide, 100), (EXCL_RX, exclusions, 100)):
        for m in rx.finditer(text):
            target.append(re.sub(r"\s+", " ", m.group(0))[:160])
            if len(target) >= cap:
                break
    return {"hs_hits": hs, "product_hits": sorted(set(product)), "wide_hits": sorted(set(wide)), "exclusion_hits": sorted(set(exclusions))}


def merge(dst: dict, src: dict) -> None:
    for key in dst:
        dst[key].update(src[key])


def source_class(path: Path) -> str:
    s = str(path)
    if "反倾销税深度分析报告" in s:
        return "project_output_or_qa"
    if "_易迅页面采集" in s:
        return "easyxun_page_capture"
    return "root_download_or_user_file"


def inspect(path: Path) -> dict:
    merged = {"hs_hits": set(), "product_hits": set(), "wide_hits": set(), "exclusion_hits": set()}
    errors = []
    members = 0
    try:
        if path.suffix.lower() == ".xlsx":
            with zipfile.ZipFile(path) as zf:
                names = [n for n in zf.namelist() if n == "xl/sharedStrings.xml" or (n.startswith("xl/worksheets/") and n.endswith(".xml"))]
                for name in names:
                    members += 1
                    merge(merged, scan_blob(decode(zf.read(name))))
        elif path.suffix.lower() == ".xls":
            # Binary xls content is only a weak prefilter; deep scan handles candidates.
            members = 1
            merge(merged, scan_blob(decode(path.read_bytes())))
        else:
            members = 1
            merge(merged, scan_blob(decode(path.read_bytes())))
    except Exception as exc:
        errors.append(f"{type(exc).__name__}: {exc}")
    hs = sorted(merged["hs_hits"])
    prod = sorted(merged["product_hits"])
    wide = sorted(merged["wide_hits"])
    excl = sorted(merged["exclusion_hits"])
    if hs and prod:
        cls = "strong_hs_and_product"
    elif hs:
        cls = "hs_only"
    elif prod:
        cls = "product_only"
    elif wide:
        cls = "wide_term_only"
    else:
        cls = "no_hit"
    return {
        "file": str(path), "name": path.name, "extension": path.suffix.lower(),
        "size_bytes": path.stat().st_size, "source_class": source_class(path),
        "scanned_members": members, "prefilter_class": cls,
        "hs_hits": hs, "product_hits": prod, "wide_hits": wide,
        "exclusion_hits": excl, "errors": errors,
    }


def write(rows: list[dict], total: int) -> None:
    summary = {
        "updated_at_asia_shanghai": datetime.now(timezone(timedelta(hours=8))).isoformat(timespec="seconds"),
        "files_total": total, "files_processed": len(rows),
        "class_counts": dict(Counter(r["prefilter_class"] for r in rows)),
        "error_files": sum(bool(r["errors"]) for r in rows),
        "candidate_files": sum(r["prefilter_class"] != "no_hit" for r in rows),
        "checkpoint_complete": len(rows) == total,
    }
    fields = list(rows[0]) if rows else []
    with CSV_OUT.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fields); w.writeheader()
        for row in rows:
            x = dict(row)
            for k in ("hs_hits", "product_hits", "wide_hits", "exclusion_hits", "errors"):
                x[k] = json.dumps(x[k], ensure_ascii=False, separators=(",", ":"))
            w.writerow(x)
    JSON_OUT.write_text(json.dumps({"summary": summary, "files": rows}, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False), flush=True)


def main() -> int:
    files = sorted(p for p in ROOT.rglob("*") if p.is_file() and p.suffix.lower() in EXTENSIONS and OUT not in p.parents and not p.name.startswith("~$"))
    rows = []
    for path in files:
        rows.append(inspect(path))
        if len(rows) % 25 == 0 or len(rows) == len(files):
            write(rows, len(files))
    return 0


if __name__ == "__main__":
    sys.exit(main())
