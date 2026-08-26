from pathlib import Path
from pypdf import PdfReader

root = Path(r"D:\codex\XG执法\2026_案例库\raw_cases")
for case_id in ("GDRM26-158", "GDRM26-182", "GDRM26-305"):
    print(f"\n--- {case_id} ---")
    for path in (root / case_id).rglob("*.pdf"):
        reader = PdfReader(path)
        text = "\n".join((page.extract_text() or "") for page in reader.pages)
        print(path.name, "pages=", len(reader.pages), "chars=", len(text))
        print(ascii(text[:3000]))
