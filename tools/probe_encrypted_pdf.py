from pathlib import Path
import sys

from pypdf import PdfReader


sys.stdout.reconfigure(encoding="utf-8", errors="replace")
path = Path(sys.argv[1])
password = sys.argv[2]
reader = PdfReader(str(path))
result = reader.decrypt(password) if reader.is_encrypted else "not-encrypted"
print(f"decrypt={result};pages={len(reader.pages)}")
for page_number, page in enumerate(reader.pages, 1):
    text = page.extract_text() or ""
    print(f"\n---PAGE {page_number} chars={len(text)}---\n{text[:5000]}")
