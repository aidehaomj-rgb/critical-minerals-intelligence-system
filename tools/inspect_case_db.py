import sqlite3
import sys


db_path = sys.argv[1]
case_ids = set(sys.argv[2:])
connection = sqlite3.connect(db_path)
connection.row_factory = sqlite3.Row

if not case_ids:
    for row in connection.execute(
        "SELECT name, sql FROM sqlite_master WHERE type = 'table' ORDER BY name"
    ):
        print(f"\nTABLE {row['name']}\n{row['sql']}")
    raise SystemExit

for table in ("cases", "documents", "chunks"):
    columns = [
        row["name"]
        for row in connection.execute(f"PRAGMA table_info({table})")
    ]
    print(f"\nTABLE {table}: {columns}")
    if "case_id" in columns:
        placeholders = ",".join("?" for _ in case_ids)
        rows = connection.execute(
            f"SELECT * FROM {table} WHERE case_id IN ({placeholders})",
            sorted(case_ids),
        ).fetchall()
        for row in rows:
            print(dict(row))
