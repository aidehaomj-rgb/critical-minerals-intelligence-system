import json
import sqlite3
from pathlib import Path


db = Path(r"D:\codex\XG执法\2026_案例库\enforcement_cases_2026.sqlite")
conn = sqlite3.connect(db)

def rows(sql, params=()):
    return conn.execute(sql, params).fetchall()

terms = ["走私", "两用", "兩用", "空运", "空運", "陆路", "陸路", "报关", "報關", "舱单", "艙單", "出口", "進口"]
report = {
    "case_types": rows("SELECT case_type, count(*) FROM cases GROUP BY case_type ORDER BY count(*) DESC"),
    "transport": rows("SELECT transport_mode, count(*) FROM cases GROUP BY transport_mode ORDER BY count(*) DESC"),
    "extensions": rows("SELECT extension, count(DISTINCT relative_path), count(*), sum(text_chars) FROM documents GROUP BY extension ORDER BY count(*) DESC"),
    "text_coverage": rows("SELECT count(DISTINCT case_id), sum(CASE WHEN text_chars > 0 THEN 1 ELSE 0 END), sum(CASE WHEN text_chars = 0 THEN 1 ELSE 0 END), sum(text_chars) FROM documents"),
    "terms": [(term, rows("SELECT count(DISTINCT case_id) FROM document_fts WHERE document_fts MATCH ?", (term,))[0][0]) for term in terms],
    "examples": rows("SELECT case_id, package_name, case_type, transport_mode, document_count FROM cases ORDER BY case_id LIMIT 10"),
}
print(json.dumps(report, ensure_ascii=True, indent=2))
