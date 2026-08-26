"""Add case-name search records and a concise handover note to the local case library."""

import sqlite3
from pathlib import Path
import re


ROOT = Path(r"D:\codex\XG执法\2026_案例库")
db = ROOT / "enforcement_cases_2026.sqlite"
conn = sqlite3.connect(db)

# Case names contain the most reliable, human-authored type and transport labels.
# SQLite's default tokenizer does not segment CJK text, so index a spaced character form too.
def cjk_searchable(text: str) -> str:
    return re.sub(r"([\u3400-\u9fff])", r"\1 ", text)

conn.execute("DELETE FROM document_fts WHERE relative_path='__case_metadata__'")
for case_id, package_name in conn.execute("SELECT case_id, package_name FROM cases"):
    conn.execute(
        "INSERT INTO document_fts(case_id, relative_path, extracted_text) VALUES(?,?,?)",
        (case_id, "__case_metadata__", cjk_searchable(package_name)),
    )
conn.commit()

case_count = conn.execute("SELECT count(*) FROM cases").fetchone()[0]
doc_count = conn.execute("SELECT count(DISTINCT relative_path) FROM documents").fetchone()[0]
pdf_files = conn.execute("SELECT count(DISTINCT relative_path) FROM documents WHERE extension='.pdf'").fetchone()[0]
xlsx_files = conn.execute("SELECT count(DISTINCT relative_path) FROM documents WHERE extension='.xlsx'").fetchone()[0]
text_rows, total_chars = conn.execute("SELECT sum(text_chars > 0), sum(text_chars) FROM documents").fetchone()
type_rows = conn.execute("SELECT case_type, count(*) FROM cases GROUP BY case_type ORDER BY count(*) DESC").fetchall()
mode_rows = conn.execute("SELECT transport_mode, count(*) FROM cases GROUP BY transport_mode ORDER BY count(*) DESC").fetchall()

def hit(term: str) -> int:
    return conn.execute("SELECT count(DISTINCT case_id) FROM document_fts WHERE document_fts MATCH ?", (term,)).fetchone()[0]

signals = [("疑似两用物项", hit('"兩 用" OR "两 用"')), ("走私", hit('"走 私"')), ("空运", hit('"空 運" OR "空 运" OR "空 路"')), ("陆路", hit('"陸 路" OR "陆 路"')), ("邮包", hit('"郵 包" OR "邮 包"')), ("报关", hit('"報 關" OR "报 关"'))]
conn.close()

report = f"""# 2026 执法案例本地库：建库说明与初步分析

## 建库结果

- 案件包：{case_count} 个（编号 GDRM26-001 至 GDRM26-343；原压缩包中实际为 {case_count} 个有效案件包）。
- 原始材料：{doc_count} 个文件，其中 PDF {pdf_files} 个、XLSX {xlsx_files} 个。
- 可检索文本：{text_rows} 条页面/工作簿记录，共 {total_chars:,} 个字符。
- 证据回溯：每条文本记录均保留案件编号、原始相对路径及 PDF 页码/工作簿标识；原件位于 `raw_cases/`。

## 案件目录的初步画像

### 文书类别（按案件包标题自动归类）

| 类别 | 数量 |
| --- | ---: |
""" + "\n".join(f"| {name} | {count} |" for name, count in type_rows) + f"""

### 运输方式（按案件包标题自动识别）

| 方式 | 数量 |
| --- | ---: |
""" + "\n".join(f"| {name} | {count} |" for name, count in mode_rows) + f"""

### 可直接检索的高频主题

| 主题 | 命中案件数 |
| --- | ---: |
""" + "\n".join(f"| {name} | {count} |" for name, count in signals) + """

## 初步研判边界

1. “查询”类材料反映需核查线索，不等同于违法事实或最终处理结果；“情报”类材料亦应与后续办案、处罚或司法文书核对。
2. PDF 货物图片、扫描件和部分附件没有机器可读正文，已保留原件但未完成 OCR；涉及物项参数、品牌标签、申报单图片时，应以原图人工核验或后续 OCR 为准。
3. 当前“案件类型”和“运输方式”来自文件名/首段文本的自动归类，适合筛选和统计，不取代人工定性。

## 使用方式

- 目录浏览：打开 `case_catalog.csv`，按案号、类型、运输方式、文件数筛选。
- 全文检索：使用 SQLite 工具查询 `document_fts`；先以 `case_id` 回到 `documents` 表获取原始文件和页码。
- 原件复核：在 `raw_cases/<案号>/` 查阅 PDF、图片、报关记录等原始附件。

示例 SQL：

```sql
SELECT case_id, relative_path, substr(extracted_text, 1, 300)
FROM document_fts
WHERE document_fts MATCH '"兩 用" OR "两 用"';
```
"""
(ROOT / "案例库说明与初步分析.md").write_text(report, encoding="utf-8")
print(f"Wrote {ROOT / '案例库说明与初步分析.md'}")
