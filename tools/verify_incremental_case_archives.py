"""Verify the GDRM26-302/344-373 incremental archive ingestion."""

from __future__ import annotations

import csv
import hashlib
import json
import sqlite3
import sys
from pathlib import Path


sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(r"D:\codex\XG执法\2026_案例库")
DB = ROOT / "enforcement_cases_2026.sqlite"
CATALOG = ROOT / "case_catalog.csv"
AUDIT = ROOT / "新增案件302_373入库结果.json"
OUTPUT = ROOT / "新增案件302_373入库校验.json"


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        while chunk := stream.read(1024 * 1024):
            digest.update(chunk)
    return digest.hexdigest()


def main() -> None:
    ingest = json.loads(AUDIT.read_text(encoding="utf-8"))
    new_ids = ingest["cases_added"]
    placeholders = ",".join("?" for _ in new_ids)
    conn = sqlite3.connect(DB)

    integrity = conn.execute("PRAGMA integrity_check").fetchone()[0]
    case_rows = conn.execute(
        f"""SELECT case_id, package_name, transport_mode, document_count, raw_path
            FROM cases WHERE case_id IN ({placeholders}) ORDER BY case_id""",
        new_ids,
    ).fetchall()
    doc_rows = conn.execute(
        f"""SELECT case_id, relative_path, sha256, SUM(text_chars),
                   SUM(CASE WHEN extraction_error IS NOT NULL THEN 1 ELSE 0 END)
            FROM documents WHERE case_id IN ({placeholders})
            GROUP BY case_id, relative_path, sha256 ORDER BY case_id, relative_path""",
        new_ids,
    ).fetchall()
    document_db_rows = conn.execute(
        f"SELECT COUNT(*) FROM documents WHERE case_id IN ({placeholders})", new_ids
    ).fetchone()[0]
    fts_rows = conn.execute(
        f"SELECT COUNT(*) FROM document_fts WHERE case_id IN ({placeholders})", new_ids
    ).fetchone()[0]
    remaining_encrypted_errors = conn.execute(
        "SELECT COUNT(*) FROM documents WHERE extraction_error LIKE '%encrypted%'"
    ).fetchone()[0]
    intel_counts = {
        "intel_incidents": conn.execute("SELECT COUNT(*) FROM intel_incidents").fetchone()[0],
        "intel_mentions": conn.execute("SELECT COUNT(*) FROM intel_mentions").fetchone()[0],
        "intel_entities": conn.execute("SELECT COUNT(*) FROM intel_entities").fetchone()[0],
    }
    total_cases = conn.execute("SELECT COUNT(*) FROM cases").fetchone()[0]
    conn.close()

    with CATALOG.open("r", newline="", encoding="utf-8-sig") as handle:
        catalog_rows = list(csv.DictReader(handle))
    catalog_by_id = {row["case_id"]: row for row in catalog_rows}

    file_checks = []
    for case_id, relative_path, digest, text_chars, errors in doc_rows:
        physical = ROOT / Path(relative_path)
        actual_digest = sha256(physical) if physical.is_file() else None
        file_checks.append(
            {
                "case_id": case_id,
                "relative_path": relative_path,
                "exists": physical.is_file(),
                "sha256_matches": actual_digest == digest,
                "extracted_characters": text_chars,
                "extraction_error_rows": errors,
            }
        )

    result = {
        "ok": all(
            [
                integrity == "ok",
                len(case_rows) == len(new_ids),
                len(doc_rows) == ingest["stats"]["files_added"],
                document_db_rows == fts_rows,
                remaining_encrypted_errors == 0,
                all(row[0] in catalog_by_id for row in case_rows),
                all(
                    check["exists"]
                    and check["sha256_matches"]
                    and check["extracted_characters"] > 0
                    and check["extraction_error_rows"] == 0
                    for check in file_checks
                ),
            ]
        ),
        "database_integrity": integrity,
        "total_cases": total_cases,
        "catalog_rows": len(catalog_rows),
        "new_cases_expected": len(new_ids),
        "new_cases_found": len(case_rows),
        "new_physical_files_found": len(doc_rows),
        "new_document_rows": document_db_rows,
        "new_fts_rows": fts_rows,
        "remaining_encrypted_errors": remaining_encrypted_errors,
        "intelligence_index_counts": intel_counts,
        "cases": [
            {
                "case_id": row[0],
                "package_name": row[1],
                "transport_mode": row[2],
                "document_count": row[3],
                "raw_path": row[4],
            }
            for row in case_rows
        ],
        "file_checks": file_checks,
    }
    OUTPUT.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False, indent=2))
    if not result["ok"]:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
