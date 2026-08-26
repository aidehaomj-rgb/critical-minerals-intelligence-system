import sqlite3
from pathlib import Path

db = Path(r"D:\codex\XG执法\2026_案例库\enforcement_cases_2026.sqlite")
conn = sqlite3.connect(db)
for case_id, rel, text in conn.execute("SELECT case_id, relative_path, extracted_text FROM documents WHERE extension='.xlsx' AND text_chars > 0 ORDER BY case_id LIMIT 8"):
    print(f"\n--- {case_id} | {rel} ---")
    print(text[:2500])
