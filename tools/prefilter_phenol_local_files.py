#!/usr/bin/env python3
"""Fast, checkpointed file-level prefilter for local phenol evidence."""

from __future__ import annotations

import csv
import json
import sys
import zipfile
from collections import Counter
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Any

import audit_phenol_local_data as rules


ROOT = rules.ROOT
OUT = rules.OUT
CSV_OUT = OUT / "苯酚_本地预筛文件台账.csv"
JSON_OUT = OUT / "苯酚_本地预筛文件台账.json"


def inspect_text(text: str) -> dict[str, list[str]]:
    return {
        "strong_terms": rules.match_names(text, rules.STRONG_PATTERNS),
        "name_terms": rules.match_names(text, rules.NAME_PATTERNS),
        "exclusion_terms": rules.match_names(text, rules.EXCLUSION_PATTERNS),
    }


def inspect_blob(text: str) -> tuple[bool, dict[str, set[str]], int, bool]:
    """Inspect short contexts around raw hits instead of rescanning huge blobs.

    This keeps the file prefilter fast even for 20MB+ JSON exports.  Row-level
    classification is deliberately deferred to phase two.
    """
    merged: dict[str, set[str]] = {
        "strong_terms": set(), "name_terms": set(), "exclusion_terms": set()
    }
    count = 0
    capped = False
    for match in rules.PREFILTER_RX.finditer(text):
        count += 1
        if count > 5000:
            capped = True
            break
        start = max(0, match.start() - 300)
        end = min(len(text), match.end() + 300)
        merge_terms(merged, inspect_text(text[start:end]))
    return count > 0, merged, min(count, 5000), capped


def merge_terms(target: dict[str, set[str]], found: dict[str, list[str]]) -> None:
    for key, values in found.items():
        target[key].update(values)


def inspect_file(path: Path) -> dict[str, Any]:
    merged: dict[str, set[str]] = {
        "strong_terms": set(), "name_terms": set(), "exclusion_terms": set()
    }
    raw_prefilter_hit = False
    occurrence_count = 0
    occurrence_capped = False
    scanned_members = 0
    errors: list[str] = []
    ext = path.suffix.lower()
    try:
        if ext == ".xlsx":
            with zipfile.ZipFile(path) as zf:
                relevant = [
                    name for name in zf.namelist()
                    if name == "xl/sharedStrings.xml"
                    or name.startswith("xl/worksheets/") and name.endswith(".xml")
                ]
                for name in relevant:
                    scanned_members += 1
                    text, _ = rules.safe_decode(zf.read(name))
                    hit, found, count, capped = inspect_blob(text)
                    if hit:
                        raw_prefilter_hit = True
                        occurrence_count += count
                        occurrence_capped = occurrence_capped or capped
                        merge_terms(merged, {key: sorted(value) for key, value in found.items()})
        else:
            raw = path.read_bytes()
            text, _ = rules.safe_decode(raw)
            scanned_members = 1
            hit, found, count, capped = inspect_blob(text)
            if hit:
                raw_prefilter_hit = True
                occurrence_count += count
                occurrence_capped = occurrence_capped or capped
                merge_terms(merged, {key: sorted(value) for key, value in found.items()})
    except Exception as exc:
        errors.append(f"{type(exc).__name__}: {exc}")

    strong = sorted(merged["strong_terms"])
    names = sorted(merged["name_terms"])
    exclusions = sorted(merged["exclusion_terms"])
    if strong:
        file_class = "strong_identifier_file"
    elif names and exclusions:
        file_class = "name_and_derivative_file"
    elif names:
        file_class = "name_only_file"
    elif raw_prefilter_hit:
        file_class = "derivative_or_raw_substring_only"
    else:
        file_class = "no_hit"
    return {
        "file": str(path),
        "name": path.name,
        "extension": ext,
        "size_bytes": path.stat().st_size,
        "source_class": rules.source_class(path),
        "scanned_members": scanned_members,
        "raw_prefilter_hit": raw_prefilter_hit,
        "prefilter_occurrences_capped_count": occurrence_count,
        "prefilter_occurrence_cap_reached": occurrence_capped,
        "prefilter_class": file_class,
        "strong_terms": strong,
        "name_terms": names,
        "exclusion_terms": exclusions,
        "errors": errors,
    }


def write_checkpoint(rows: list[dict[str, Any]], total: int) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    summary = {
        "updated_at_asia_shanghai": datetime.now(
            timezone(timedelta(hours=8))).isoformat(timespec="seconds"),
        "files_total": total,
        "files_processed": len(rows),
        "files_raw_prefilter_hit": sum(bool(row["raw_prefilter_hit"]) for row in rows),
        "files_deep_scan_required": sum(
            row["prefilter_class"] != "no_hit" or bool(row["errors"]) for row in rows),
        "class_counts": dict(Counter(row["prefilter_class"] for row in rows)),
        "error_files": sum(bool(row["errors"]) for row in rows),
        "checkpoint_complete": len(rows) == total,
    }
    with CSV_OUT.open("w", encoding="utf-8-sig", newline="") as handle:
        fields = [
            "file", "name", "extension", "size_bytes", "source_class",
            "scanned_members", "raw_prefilter_hit", "prefilter_class",
            "prefilter_occurrences_capped_count", "prefilter_occurrence_cap_reached",
            "strong_terms", "name_terms", "exclusion_terms", "errors",
        ]
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        for row in rows:
            clean = dict(row)
            for key in ("strong_terms", "name_terms", "exclusion_terms", "errors"):
                clean[key] = json.dumps(clean[key], ensure_ascii=False, separators=(",", ":"))
            writer.writerow(clean)
    JSON_OUT.write_text(
        json.dumps({"summary": summary, "files": rows}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(json.dumps(summary, ensure_ascii=False), flush=True)


def main() -> int:
    files = sorted(
        path for path in ROOT.rglob("*")
        if path.is_file() and path.suffix.lower() in rules.EXTENSIONS
        and OUT not in path.parents and not path.name.startswith("~$")
    )
    rows: list[dict[str, Any]] = []
    if JSON_OUT.exists():
        try:
            prior = json.loads(JSON_OUT.read_text(encoding="utf-8"))
            if not prior.get("summary", {}).get("checkpoint_complete"):
                rows = list(prior.get("files", []))
        except (OSError, json.JSONDecodeError, TypeError):
            rows = []
    processed = {row.get("file") for row in rows}
    remaining = [path for path in files if str(path) not in processed]
    for path in remaining:
        rows.append(inspect_file(path))
        if len(rows) % 25 == 0 or len(rows) == len(files):
            write_checkpoint(rows, len(files))
    return 0


if __name__ == "__main__":
    sys.exit(main())
