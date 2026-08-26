#!/usr/bin/env python3
"""Checkpointed row-level scan of files selected by phenol prefilter."""

from __future__ import annotations

import csv
import json
import sys
from collections import Counter
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Any

import audit_phenol_local_data as rules


OUT = rules.OUT
PREFILTER = OUT / "苯酚_本地预筛文件台账.json"
STATE = OUT / "苯酚_本地深扫状态.json"
FILE_CSV = OUT / "苯酚_本地深扫文件台账.csv"
HIT_CSV = OUT / "苯酚_本地深扫命中明细.csv"


def write_csv(path: Path, rows: list[dict[str, Any]], fields: list[str]) -> None:
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        for row in rows:
            clean = dict(row)
            for key, value in clean.items():
                if isinstance(value, (list, dict)):
                    clean[key] = json.dumps(value, ensure_ascii=False, separators=(",", ":"))
            writer.writerow(clean)


def checkpoint(files_total: int, inventory: list[dict[str, Any]], hits: list[dict[str, Any]]) -> None:
    summary = {
        "updated_at_asia_shanghai": datetime.now(
            timezone(timedelta(hours=8))).isoformat(timespec="seconds"),
        "candidate_files_total": files_total,
        "candidate_files_processed": len(inventory),
        "candidate_files_with_row_hits": sum(bool(row.get("hit_rows_or_records")) for row in inventory),
        "row_or_record_hits": len(hits),
        "hit_class_counts": dict(Counter(hit["match_class"] for hit in hits)),
        "hit_source_class_counts": dict(Counter(hit["source_class"] for hit in hits)),
        "error_files": sum(bool(row.get("errors")) for row in inventory),
        "checkpoint_complete": len(inventory) == files_total,
    }
    STATE.write_text(
        json.dumps({"summary": summary, "inventory": inventory, "hits": hits},
                   ensure_ascii=False, indent=2), encoding="utf-8")
    write_csv(
        FILE_CSV, inventory,
        ["file", "name", "extension", "size_bytes", "modified", "source_class",
         "sheets", "rows_scanned", "cells_scanned", "records_scanned", "encoding",
         "fast_scan_no_hit", "hit_rows_or_records", "hit_class_counts", "errors"],
    )
    write_csv(
        HIT_CSV, hits,
        ["file", "source_class", "format", "location", "match_class",
         "strong_terms", "name_terms", "exclusion_terms", "text_excerpt"],
    )
    print(json.dumps(summary, ensure_ascii=False), flush=True)


def main() -> int:
    prefilter = json.loads(PREFILTER.read_text(encoding="utf-8"))
    candidate_paths = [
        Path(row["file"]) for row in prefilter["files"]
        if row.get("prefilter_class") != "no_hit" or row.get("errors")
    ]
    inventory: list[dict[str, Any]] = []
    hits: list[dict[str, Any]] = []
    if STATE.exists():
        try:
            prior = json.loads(STATE.read_text(encoding="utf-8"))
            if not prior.get("summary", {}).get("checkpoint_complete"):
                inventory = list(prior.get("inventory", []))
                hits = list(prior.get("hits", []))
        except (OSError, json.JSONDecodeError, TypeError):
            inventory, hits = [], []
    processed = {row.get("file") for row in inventory}
    for path in candidate_paths:
        if str(path) in processed:
            continue
        info, file_hits = rules.scan_one(path)
        inventory.append(info)
        hits.extend(file_hits)
        # Every-file checkpoint: a corrupt or slow later workbook cannot erase
        # the already verified row locations.
        checkpoint(len(candidate_paths), inventory, hits)
    return 0


if __name__ == "__main__":
    sys.exit(main())
