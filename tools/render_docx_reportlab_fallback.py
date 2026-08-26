from __future__ import annotations

import html
import sys
from pathlib import Path

from docx import Document
from docx.document import Document as _Document
from docx.table import Table, _Cell
from docx.text.paragraph import Paragraph
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import KeepTogether, LongTable, PageBreak, Paragraph as RP, SimpleDocTemplate, Spacer, TableStyle


W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
BLUE = colors.HexColor("#123B5D")
LIGHT = colors.HexColor("#D9EAF2")
TEXT = colors.HexColor("#1F2937")
GRID = colors.HexColor("#AAB7C4")
PAGE_W, _ = letter
CONTENT_W = PAGE_W - 2 * inch


def iter_blocks(parent):
    root = parent.element.body if isinstance(parent, _Document) else parent._tc
    for child in root.iterchildren():
        if child.tag == W + "p":
            yield Paragraph(child, parent)
        elif child.tag == W + "tbl":
            yield Table(child, parent)


def xml_text(element) -> str:
    return "".join((n.text or "") for n in element.iter(W + "t")).strip()


def setup_fonts():
    pdfmetrics.registerFont(TTFont("CN", r"C:\Windows\Fonts\simfang.ttf"))
    pdfmetrics.registerFont(TTFont("CN-Bold", r"C:\Windows\Fonts\simhei.ttf"))


def styles():
    base = getSampleStyleSheet()
    return {
        "body": ParagraphStyle("body", parent=base["BodyText"], fontName="CN", fontSize=9.2, leading=13.2, textColor=TEXT, alignment=TA_JUSTIFY, spaceAfter=5),
        "title": ParagraphStyle("title", parent=base["Title"], fontName="CN-Bold", fontSize=20, leading=23, textColor=BLUE, alignment=TA_LEFT, spaceAfter=12),
        "h1": ParagraphStyle("h1", parent=base["Heading1"], fontName="CN-Bold", fontSize=14, leading=17, textColor=BLUE, spaceBefore=11, spaceAfter=5, keepWithNext=True),
        "h2": ParagraphStyle("h2", parent=base["Heading2"], fontName="CN-Bold", fontSize=11.5, leading=14, textColor=colors.HexColor("#1B5A7A"), spaceBefore=7, spaceAfter=4, keepWithNext=True),
        "caption": ParagraphStyle("caption", parent=base["BodyText"], fontName="CN", fontSize=7.8, leading=10, textColor=colors.HexColor("#4B5563"), alignment=TA_CENTER, spaceAfter=3),
        "cell": ParagraphStyle("cell", parent=base["BodyText"], fontName="CN", fontSize=7.2, leading=9.4, textColor=TEXT, alignment=TA_LEFT),
        "head": ParagraphStyle("head", parent=base["BodyText"], fontName="CN-Bold", fontSize=7.3, leading=9.5, textColor=BLUE, alignment=TA_LEFT),
        "mast": ParagraphStyle("mast", parent=base["BodyText"], fontName="CN-Bold", fontSize=9.2, leading=12, textColor=colors.white, alignment=TA_LEFT),
    }


def paragraph_flow(p: Paragraph, st):
    text = html.escape(xml_text(p._p))
    if not text:
        return Spacer(1, 2)
    name = (p.style.name if p.style else "") or ""
    if name == "Title":
        return RP(text, st["title"])
    if name.startswith("Heading 1"):
        return RP(text, st["h1"])
    if name.startswith("Heading 2"):
        return RP(text, st["h2"])
    if "Caption" in name:
        return RP(text, st["caption"])
    return RP(text, st["body"])


def table_flow(t: Table, st):
    matrix = []
    for ri, row in enumerate(t.rows):
        style = st["head"] if ri == 0 else st["cell"]
        if len(t.rows) == 1 and len(row.cells) == 1:
            style = st["mast"]
        matrix.append([RP(html.escape(xml_text(c._tc)), style) for c in row.cells])
    widths = []
    for cell in t.rows[0].cells:
        widths.append(float(cell.width or 1))
    total = sum(widths) or len(widths)
    col_widths = [CONTENT_W * w / total for w in widths]
    tab = LongTable(matrix, colWidths=col_widths, repeatRows=1, hAlign="CENTER")
    commands = [
        ("GRID", (0, 0), (-1, -1), 0.55, GRID),
        ("BACKGROUND", (0, 0), (-1, 0), LIGHT),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]
    if len(t.rows) == 1 and len(t.rows[0].cells) == 1:
        commands += [("BACKGROUND", (0, 0), (-1, -1), BLUE), ("BOX", (0, 0), (-1, -1), 0, BLUE)]
    tab.setStyle(TableStyle(commands))
    return [tab, Spacer(1, 7)]


def convert(src: Path, dst: Path):
    setup_fonts()
    st = styles()
    docx = Document(src)
    story = []
    for block in iter_blocks(docx):
        if isinstance(block, Paragraph):
            story.append(paragraph_flow(block, st))
        else:
            story.extend(table_flow(block, st))
    pdf = SimpleDocTemplate(str(dst), pagesize=letter, leftMargin=inch, rightMargin=inch, topMargin=inch, bottomMargin=inch, title=src.stem)
    pdf.build(story)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("usage: render_docx_reportlab_fallback.py input.docx output.pdf")
    convert(Path(sys.argv[1]), Path(sys.argv[2]))
