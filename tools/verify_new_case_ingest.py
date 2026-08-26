"""Verify the incremental ingestion of GDRM26-394 and GDRM26-395."""

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
AUDIT = ROOT / "新增案件394_395入库结果.json"
ANALYSIS = ROOT / "情报案件解密后全量分析.json"
CASE_IDS = ("GDRM26-394", "GDRM26-395")


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        while chunk := stream.read(1024 * 1024):
            digest.update(chunk)
    return digest.hexdigest()


audit = json.loads(AUDIT.read_text(encoding="utf-8"))
analysis = json.loads(ANALYSIS.read_text(encoding="utf-8"))
with CATALOG.open("r", newline="", encoding="utf-8-sig") as handle:
    catalog = list(csv.DictReader(handle))

conn = sqlite3.connect(DB)
integrity = conn.execute("PRAGMA integrity_check").fetchone()[0]
cases = conn.execute(
    "SELECT case_id,package_name,case_type,transport_mode,date_hint,raw_path,document_count "
    "FROM cases WHERE case_id IN (?,?) ORDER BY case_id",
    CASE_IDS,
).fetchall()
documents = conn.execute(
    """SELECT case_id,count(DISTINCT relative_path),count(*),sum(text_chars),
              sum(CASE WHEN extraction_error IS NOT NULL THEN 1 ELSE 0 END)
       FROM documents WHERE case_id IN (?,?) GROUP BY case_id ORDER BY case_id""",
    CASE_IDS,
).fetchall()
incidents = conn.execute(
    "SELECT case_id,count(*) FROM intel_incidents WHERE case_id IN (?,?) GROUP BY case_id ORDER BY case_id",
    CASE_IDS,
).fetchall()
mentions = conn.execute(
    """SELECT case_id,entity_type,display_value,page_or_sheet
       FROM intel_mentions WHERE case_id IN (?,?)
       AND entity_type IN ('企业','集装箱','船舶')
       ORDER BY case_id,entity_type,display_value""",
    CASE_IDS,
).fetchall()
fts = {}
for token in ("Zhu", "TCNU7293159", "BEAU4890907", "盈翰物流"):
    fts[token] = conn.execute(
        "SELECT count(*) FROM document_fts WHERE document_fts MATCH ?", (token,)
    ).fetchone()[0]
db_totals = {
    "cases": conn.execute("SELECT count(*) FROM cases").fetchone()[0],
    "documents": conn.execute("SELECT count(*) FROM documents").fetchone()[0],
    "intel_incidents": conn.execute("SELECT count(*) FROM intel_incidents").fetchone()[0],
    "intel_mentions": conn.execute("SELECT count(*) FROM intel_mentions").fetchone()[0],
}
conn.close()

hash_checks = []
for item in audit["files_added"]:
    target = ROOT / item["file"]
    actual = sha256(target)
    hash_checks.append({
        "file": item["file"],
        "expected": item["sha256"],
        "actual": actual,
        "match": actual == item["sha256"],
    })

result = {
    "integrity": integrity,
    "catalog_total": len(catalog),
    "catalog_new_rows": [row for row in catalog if row["case_id"] in CASE_IDS],
    "database_totals": db_totals,
    "new_cases": cases,
    "new_document_stats": documents,
    "new_incident_stats": incidents,
    "new_entity_mentions": mentions,
    "fts_hits": fts,
    "analysis_scope": analysis["scope"],
    "hash_checks": hash_checks,
    "backups_exist": {
        "database": Path(audit["database_backup"]).is_file(),
        "catalog": Path(audit["catalog_backup"]).is_file(),
    },
}

expected_docs = [("GDRM26-394", 2, 4, 1086, 0), ("GDRM26-395", 3, 6, 3027, 0)]
errors = []
if integrity != "ok":
    errors.append(f"integrity={integrity}")
if len(cases) != 2 or len(result["catalog_new_rows"]) != 2:
    errors.append("case/catalog rows missing")
if documents != expected_docs:
    errors.append(f"unexpected document stats: {documents}")
if incidents != [("GDRM26-394", 1), ("GDRM26-395", 2)]:
    errors.append(f"unexpected incident stats: {incidents}")
if analysis["scope"]["intelligence_case_packages"] != 146:
    errors.append("analysis scope not refreshed")
if any(count < 1 for count in fts.values()):
    errors.append(f"missing FTS token: {fts}")
if not all(item["match"] for item in hash_checks):
    errors.append("copied file hash mismatch")
if not all(result["backups_exist"].values()):
    errors.append("backup missing")
result["errors"] = errors

print(json.dumps(result, ensure_ascii=False, indent=2))
if errors:
    raise SystemExit(1)
