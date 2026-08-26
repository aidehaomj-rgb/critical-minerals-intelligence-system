"""Render every page of the new 394/395 PDF attachments for visual QA."""

from pathlib import Path

import pypdfium2 as pdfium


OUT = Path(r"C:\Users\59809\Documents\关键矿产\tmp\pdfs\new_cases_394_395")
FILES = [
    Path(r"E:\ZMJ\GDRM26-395情報159號兩宗海路貨運走私廢金屬案件.pdf"),
    Path(r"E:\ZMJ\GDRM26-394附件一及二.pdf"),
    Path(r"E:\ZMJ\GDRM26-394情報158號一宗河路貨運走私未列艙單貨物案件.pdf"),
    Path(r"E:\ZMJ\GDRM26-395附件一及二.pdf"),
]

OUT.mkdir(parents=True, exist_ok=True)
for path in FILES:
    pdf = pdfium.PdfDocument(path)
    case_dir = OUT / path.stem
    case_dir.mkdir(parents=True, exist_ok=True)
    for index in range(len(pdf)):
        page = pdf[index]
        bitmap = page.render(scale=1.5)
        target = case_dir / f"page-{index + 1}.png"
        bitmap.to_pil().save(target)
        print(target)
