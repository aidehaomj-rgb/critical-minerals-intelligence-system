from __future__ import annotations

import html
import sys
from pathlib import Path

from docx import Document
from docx.document import Document as _Document
from docx.table import Table, _Cell
from docx.text.paragraph import Paragraph


W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"


def blocks(parent):
    if isinstance(parent, _Document):
        root = parent.element.body
    elif isinstance(parent, _Cell):
        root = parent._tc
    else:
        raise TypeError(type(parent))
    for child in root.iterchildren():
        if child.tag == W + "p":
            yield Paragraph(child, parent)
        elif child.tag == W + "tbl":
            yield Table(child, parent)


def xml_text(element) -> str:
    parts = [node.text or "" for node in element.iter(W + "t")]
    return "".join(parts).strip()


def para_html(p: Paragraph) -> str:
    text = html.escape(xml_text(p._p))
    if not text:
        return '<p class="blank">&nbsp;</p>'
    style = (p.style.name if p.style else "") or ""
    if style == "Title":
        return f"<h1 class=title>{text}</h1>"
    if style.startswith("Heading 1"):
        return f"<h2>{text}</h2>"
    if style.startswith("Heading 2"):
        return f"<h3>{text}</h3>"
    if "Caption" in style:
        return f"<p class=caption>{text}</p>"
    if "List" in style:
        return f"<p class=list>{text}</p>"
    return f"<p>{text}</p>"


def table_html(table: Table) -> str:
    rows = []
    for ri, row in enumerate(table.rows):
        cells = []
        for cell in row.cells:
            tag = "th" if ri == 0 else "td"
            cells.append(f"<{tag}>{html.escape(xml_text(cell._tc))}</{tag}>")
        rows.append("<tr>" + "".join(cells) + "</tr>")
    return '<table class="doc-table">' + "".join(rows) + "</table>"


def convert(src: Path, dst: Path):
    doc = Document(src)
    body = []
    for block in blocks(doc):
        body.append(para_html(block) if isinstance(block, Paragraph) else table_html(block))
    title = html.escape(src.stem)
    css = r"""
@page { size: Letter; margin: 1in; }
* { box-sizing: border-box; }
body { margin: 0; color: #1F2937; font-family: Calibri, "Microsoft YaHei", sans-serif; font-size: 11pt; line-height: 1.38; }
p { margin: 0 0 7pt 0; text-align: justify; }
.blank { margin: 0 0 3pt 0; font-size: 3pt; }
.title { color: #123B5D; font-size: 22pt; line-height: 1.12; margin: 10pt 0 12pt; text-align: left; }
h2 { color: #123B5D; font-size: 15pt; margin: 15pt 0 7pt; page-break-after: avoid; }
h3 { color: #1B5A7A; font-size: 12pt; margin: 10pt 0 5pt; page-break-after: avoid; }
.caption { color: #4B5563; font-size: 9pt; margin: 4pt 0 3pt; text-align: center; }
.list { margin-left: 15pt; text-indent: -10pt; }
.doc-table { border-collapse: collapse; width: 100%; table-layout: fixed; margin: 5pt 0 9pt; font-size: 8.8pt; page-break-inside: auto; }
.doc-table tr { page-break-inside: avoid; }
.doc-table th, .doc-table td { border: 0.75pt solid #AAB7C4; padding: 4pt 5pt; vertical-align: top; overflow-wrap: anywhere; }
.doc-table th { background: #D9EAF2; color: #123B5D; font-weight: 700; }
.doc-table:first-of-type th { background: #123B5D; color: white; font-size: 10pt; }
a { color: #0563C1; }
"""
    dst.write_text(f"<!doctype html><html><head><meta charset=utf-8><title>{title}</title><style>{css}</style></head><body>{''.join(body)}</body></html>", encoding="utf-8")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("usage: render_docx_html_fallback.py input.docx output.html")
    convert(Path(sys.argv[1]), Path(sys.argv[2]))
