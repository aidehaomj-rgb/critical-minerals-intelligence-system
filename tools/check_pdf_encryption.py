from pathlib import Path
import sys

from pypdf import PdfReader


root = Path(sys.argv[1])
for path in sorted(root.rglob("*.pdf")):
    try:
        reader = PdfReader(str(path))
        if reader.is_encrypted:
            status = "encrypted=True"
        else:
            status = f"encrypted=False;pages={len(reader.pages)}"
    except Exception as exc:
        status = f"error={type(exc).__name__}:{exc}"
    print(f"{path.relative_to(root)}|{status}")
