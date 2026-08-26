from __future__ import annotations

import sys
from pathlib import Path

import pypdfium2 as pdfium


def main(src: Path, out_dir: Path):
    out_dir.mkdir(parents=True, exist_ok=True)
    pdf = pdfium.PdfDocument(str(src))
    for index in range(len(pdf)):
        page = pdf[index]
        image = page.render(scale=2.0).to_pil()
        image.save(out_dir / f"page-{index + 1:02d}.png")
    print(f"{src.name}: {len(pdf)} pages")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("usage: rasterize_pdf_pages.py input.pdf output_dir")
    main(Path(sys.argv[1]), Path(sys.argv[2]))
