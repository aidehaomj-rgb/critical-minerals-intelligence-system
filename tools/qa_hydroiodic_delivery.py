from __future__ import annotations

import csv
import json
from pathlib import Path
from pypdf import PdfReader

BASE = Path(r"D:\易迅数据\反倾销税深度分析报告\21_氢碘酸")
SUMMARY = json.loads((BASE / "氢碘酸_交付摘要.json").read_text(encoding="utf-8"))
A11Y = json.loads((BASE / "_qa_a11y.json").read_text(encoding="utf-8"))
TRACKER = list(csv.DictReader((BASE.parent / "00_全商品查询与报告进度台账.csv").open(encoding="utf-8-sig", newline="")))
ROW = next(r for r in TRACKER if r["序号"] == "21")
PDF = BASE / "氢碘酸_反倾销税与第三国转运风险阶段深度分析报告.pdf"
DOCX = BASE / "氢碘酸_反倾销税与第三国转运风险阶段深度分析报告.docx"
RESULT = {
    "product": SUMMARY["product"],
    "files": SUMMARY["local_audit"]["files_total"],
    "raw_hits": SUMMARY["local_audit"]["raw_string_hits"],
    "confirmed_trade": SUMMARY["local_audit"]["trade_records_confirmed"],
    "closed_route": SUMMARY["local_audit"]["closed_third_country_route_to_china"],
    "qa_all": all(SUMMARY["qa"].values()),
    "a11y": A11Y["counts"],
    "pdf_pages": len(PdfReader(str(PDF)).pages),
    "docx_bytes": DOCX.stat().st_size,
    "pdf_bytes": PDF.stat().st_size,
    "tracker": ROW["报告状态"],
}
assert RESULT["product"] == "氢碘酸"
assert RESULT["files"] == 343 and RESULT["raw_hits"] == 114
assert RESULT["confirmed_trade"] == 0 and RESULT["closed_route"] == 0
assert RESULT["qa_all"] and RESULT["a11y"] == {"high": 0, "medium": 0, "low": 0}
assert RESULT["pdf_pages"] == 6 and RESULT["docx_bytes"] > 30000 and RESULT["pdf_bytes"] > 100000
print(json.dumps(RESULT, ensure_ascii=False, indent=2))
