"""OCR and index all local 2026 suspected-dual-use query packages.

The source archive is read-only. Nested ZIP members are processed in a private
temporary directory and are not written back into the case library.
"""

from __future__ import annotations

import csv
import hashlib
import io
import json
import re
import subprocess
import sys
import tempfile
import threading
import zipfile
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

from PIL import Image
from pypdf import PdfReader


sys.stdout.reconfigure(encoding="utf-8", errors="replace")

CASE_ROOT = Path(r"D:\codex\XG执法\2026_案例库")
CATALOG = CASE_ROOT / "case_catalog.csv"
OUTPUT_DIR = Path(__file__).resolve().parents[1] / "outputs" / "dual_use_query_corpus_20260825"
PAGES_JSONL = OUTPUT_DIR / "双用途疑点案件_OCR页级索引.jsonl"
SUMMARY_JSON = OUTPUT_DIR / "双用途疑点案件_OCR摘要.json"
TESSERACT = Path(r"C:\Program Files\Tesseract-OCR\tesseract.exe")
PDFTOPPM = Path(
    r"C:\Users\59809\.cache\codex-runtimes\codex-primary-runtime\dependencies"
    r"\native\poppler\Library\bin\pdftoppm.exe"
)

EMAIL_RE = re.compile(
    r"(?<![A-Z0-9._%+\-])[A-Z0-9._%+\-]{1,64}@"
    r"(?:[A-Z0-9\-]{1,63}\.)+(?:COM|NET|ORG|EDU|GOV|CN|HK|UK|DE|FR|"
    r"GR|EU|VN|TH|JP|KR|AU|NZ|BR|CO|ID)(?![A-Z])",
    re.I,
)
PHONE_RE = re.compile(
    r"(?<!\d)(?:\+|00)?\d{1,3}[\s().-]*(?:\d[\s().-]*){6,14}(?!\d)"
)
QUERY_RE = re.compile(r"懷疑兩用物項|怀疑两用物项")


def clean(value: object) -> str:
    return re.sub(r"[ \t]+", " ", str(value or "")).strip()


def normalize_ocr(text: str) -> str:
    lines = []
    for line in (text or "").replace("\r\n", "\n").replace("\r", "\n").split("\n"):
        value = clean(line)
        if value:
            lines.append(value)
    return "\n".join(lines)


def role_from_name(name: str) -> str:
    folded = name.casefold()
    if "貨物圖片" in name or "货物图片" in name or "goods" in folded and "photo" in folded:
        return "实物图片"
    if "貨運文件" in name or "货运文件" in name or "艙單" in name or "舱单" in name:
        return "货运单证"
    if "查詢" in name or "查询" in name:
        return "查询函"
    return "其他附件"


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def load_cases() -> list[dict[str, str]]:
    with CATALOG.open("r", encoding="utf-8-sig", newline="") as stream:
        return [row for row in csv.DictReader(stream) if QUERY_RE.search(row["package_name"])]


def collect_documents(cases: list[dict[str, str]]) -> tuple[list[dict], list[dict]]:
    documents: list[dict] = []
    errors: list[dict] = []
    seen_hashes: set[str] = set()
    for case in cases:
        case_id = case["case_id"]
        case_dir = CASE_ROOT / case["raw_path"]
        for path in sorted(file for file in case_dir.rglob("*") if file.is_file()):
            suffix = path.suffix.lower()
            if suffix in {".pdf", ".jpg", ".jpeg", ".png"}:
                try:
                    data = path.read_bytes()
                except Exception as exc:
                    errors.append({"case_id": case_id, "source": str(path), "error": str(exc)})
                    continue
                digest = sha256_bytes(data)
                if digest in seen_hashes:
                    continue
                seen_hashes.add(digest)
                documents.append(
                    {
                        "case_id": case_id,
                        "package_name": case["package_name"],
                        "source": str(path),
                        "member": "",
                        "name": path.name,
                        "suffix": suffix,
                        "sha256": digest,
                        "data": data,
                    }
                )
            elif suffix == ".zip":
                try:
                    with zipfile.ZipFile(path) as archive:
                        for entry in archive.infolist():
                            if entry.is_dir():
                                continue
                            member_suffix = Path(entry.filename).suffix.lower()
                            if member_suffix not in {".pdf", ".jpg", ".jpeg", ".png"}:
                                continue
                            data = archive.read(entry)
                            digest = sha256_bytes(data)
                            if digest in seen_hashes:
                                continue
                            seen_hashes.add(digest)
                            documents.append(
                                {
                                    "case_id": case_id,
                                    "package_name": case["package_name"],
                                    "source": str(path),
                                    "member": entry.filename,
                                    "name": entry.filename,
                                    "suffix": member_suffix,
                                    "sha256": digest,
                                    "data": data,
                                }
                            )
                except Exception as exc:
                    errors.append({"case_id": case_id, "source": str(path), "error": str(exc)})
    return documents, errors


def tesseract_image(path: Path, role: str) -> str:
    psm = "11" if role == "实物图片" else "6"
    result = subprocess.run(
        [str(TESSERACT), str(path), "stdout", "-l", "chi_sim+eng", "--psm", psm],
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
        check=False,
    )
    if result.returncode:
        raise RuntimeError(f"tesseract exit {result.returncode}")
    return normalize_ocr(result.stdout.decode("utf-8", errors="replace"))


def extract_entities(text: str) -> tuple[list[str], list[str]]:
    emails = sorted({value.lower() for value in EMAIL_RE.findall(text)})
    phones = []
    for raw in PHONE_RE.findall(text):
        value = clean(raw)
        digits = re.sub(r"\D", "", value)
        if 7 <= len(digits) <= 16 and value not in phones:
            phones.append(value)
        if len(phones) >= 20:
            break
    return emails, phones


def process_document(document: dict) -> dict:
    role = role_from_name(document["name"])
    pages: list[dict] = []
    with tempfile.TemporaryDirectory(prefix="dual_use_ocr_") as temp_name:
        temp_dir = Path(temp_name)
        if document["suffix"] == ".pdf":
            source_pdf = temp_dir / "source.pdf"
            source_pdf.write_bytes(document["data"])
            try:
                page_count = len(PdfReader(io.BytesIO(document["data"])).pages)
            except Exception:
                page_count = 0
            prefix = temp_dir / "page"
            result = subprocess.run(
                [str(PDFTOPPM), "-png", "-r", "180", str(source_pdf), str(prefix)],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.PIPE,
                check=False,
            )
            if result.returncode:
                raise RuntimeError(
                    f"pdftoppm exit {result.returncode}: "
                    f"{result.stderr.decode('utf-8', errors='replace')[:300]}"
                )
            images = sorted(temp_dir.glob("page-*.png"))
            if page_count and len(images) != page_count:
                raise RuntimeError(f"rendered {len(images)} of {page_count} PDF pages")
        else:
            image_path = temp_dir / f"source{document['suffix']}"
            image_path.write_bytes(document["data"])
            # Verify that the file is a readable raster before OCR.
            with Image.open(image_path) as image:
                image.verify()
            images = [image_path]

        for page_number, image_path in enumerate(images, 1):
            text = tesseract_image(image_path, role)
            emails, phones = extract_entities(text)
            pages.append(
                {
                    "case_id": document["case_id"],
                    "package_name": document["package_name"],
                    "source": document["source"],
                    "member": document["member"],
                    "document_name": document["name"],
                    "document_sha256": document["sha256"],
                    "role": role,
                    "page": page_number,
                    "characters": len(text),
                    "emails": emails,
                    "phones": phones,
                    "text": text,
                }
            )
    return {"document": document, "pages": pages}


def main() -> None:
    if not TESSERACT.is_file():
        raise FileNotFoundError(TESSERACT)
    if not PDFTOPPM.is_file():
        raise FileNotFoundError(PDFTOPPM)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    cases = load_cases()
    documents, errors = collect_documents(cases)
    print(
        json.dumps(
            {"cases": len(cases), "unique_documents": len(documents), "collection_errors": len(errors)},
            ensure_ascii=False,
        ),
        flush=True,
    )

    processed = 0
    page_count = 0
    email_values: set[str] = set()
    phone_values: set[str] = set()
    case_page_counts: dict[str, int] = {}
    lock = threading.Lock()
    with PAGES_JSONL.open("w", encoding="utf-8") as output:
        with ThreadPoolExecutor(max_workers=4) as executor:
            future_map = {executor.submit(process_document, document): document for document in documents}
            for future in as_completed(future_map):
                document = future_map[future]
                try:
                    result = future.result()
                    pages = result["pages"]
                except Exception as exc:
                    errors.append(
                        {
                            "case_id": document["case_id"],
                            "source": document["source"],
                            "member": document["member"],
                            "error": str(exc),
                        }
                    )
                    pages = []
                with lock:
                    for page in pages:
                        output.write(json.dumps(page, ensure_ascii=False) + "\n")
                        page_count += 1
                        case_page_counts[page["case_id"]] = case_page_counts.get(page["case_id"], 0) + 1
                        email_values.update(page["emails"])
                        phone_values.update(page["phones"])
                    output.flush()
                    processed += 1
                    if processed % 10 == 0 or processed == len(documents):
                        print(
                            json.dumps(
                                {
                                    "processed_documents": processed,
                                    "total_documents": len(documents),
                                    "ocr_pages": page_count,
                                    "emails": len(email_values),
                                    "errors": len(errors),
                                },
                                ensure_ascii=False,
                            ),
                            flush=True,
                        )

    summary = {
        "source_catalog": str(CATALOG),
        "suspected_dual_use_cases": len(cases),
        "unique_source_documents": len(documents),
        "ocr_pages": page_count,
        "cases_with_ocr_pages": len(case_page_counts),
        "unique_email_tokens": len(email_values),
        "unique_phone_tokens": len(phone_values),
        "emails": sorted(email_values),
        "case_page_counts": dict(sorted(case_page_counts.items())),
        "errors": errors,
        "method": "PDF/JPG OCR with chi_sim+eng; nested ZIP members processed without altering source archives.",
    }
    SUMMARY_JSON.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False, indent=2), flush=True)


if __name__ == "__main__":
    main()
