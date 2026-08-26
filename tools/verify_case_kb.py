"""Read-only integrity and coverage checks for the enforcement case library."""

import sqlite3
import sys
from pathlib import Path


sys.stdout.reconfigure(encoding="utf-8", errors="replace")
db = Path(r"D:\codex\XG执法\2026_案例库\enforcement_cases_2026.sqlite")
conn = sqlite3.connect(db)

checks = {
    "integrity": conn.execute("PRAGMA integrity_check").fetchone()[0],
    "intel_incidents": conn.execute("SELECT count(*) FROM intel_incidents").fetchone()[0],
    "intel_mentions": conn.execute("SELECT count(*) FROM intel_mentions").fetchone()[0],
    "intel_entities": conn.execute("SELECT count(*) FROM intel_entities").fetchone()[0],
    "decrypt_errors": conn.execute(
        "SELECT count(*) FROM documents "
        "WHERE extraction_error LIKE '%FileNotDecryptedError%'"
    ).fetchone()[0],
    "fts_huang": conn.execute(
        "SELECT count(*) FROM document_fts WHERE document_fts MATCH ?",
        ("黄智健",),
    ).fetchone()[0],
}
for key, value in checks.items():
    print(f"{key}={value}")

for entity_type in ("人员", "车辆"):
    rows = conn.execute(
        """SELECT display_value,case_count,occurrence_count,case_ids_json
           FROM intel_entities
           WHERE entity_type=? AND case_count>1
           ORDER BY case_count DESC,occurrence_count DESC""",
        (entity_type,),
    ).fetchall()
    print(f"{entity_type}_repeats={rows}")

conn.close()
