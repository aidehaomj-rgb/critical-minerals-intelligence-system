"""Decrypt password-protected PDFs and replace placeholder rows in the case SQLite DB."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sqlite3
import sys
from collections import Counter
from datetime import datetime
from pathlib import Path

from pypdf import PdfReader


sys.stdout.reconfigure(encoding="utf-8", errors="replace")


def normalize_text(value: str) -> str:
    lines = []
    for line in (value or "").replace("\r\n", "\n").replace("\r", "\n").split("\n"):
        cleaned = re.sub(r"[ \t]+", " ", line).strip()
        if cleaned:
            lines.append(cleaned)
    return "\n".join(lines)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        while chunk := stream.read(1024 * 1024):
            digest.update(chunk)
    return digest.hexdigest()


def run(root: Path, password: str, dry_run: bool) -> dict:
    raw_root = root / "raw_cases"
    db_path = root / "enforcement_cases_2026.sqlite"
    encrypted: list[tuple[Path, PdfReader]] = []
    failures = []

    for path in sorted(raw_root.rglob("*.pdf")):
        try:
            reader = PdfReader(str(path))
            if not reader.is_encrypted:
                continue
            result = reader.decrypt(password)
            if not result:
                failures.append({
                    "file": path.relative_to(root).as_posix(),
                    "error": "Password rejected",
                })
                continue
            encrypted.append((path, reader))
        except Exception as exc:
            failures.append({
                "file": path.relative_to(root).as_posix(),
                "error": f"{type(exc).__name__}: {exc}",
            })

    stats = Counter()
    stats["encrypted_files_found"] = len(encrypted) + len(failures)
    stats["password_success"] = len(encrypted)
    stats["password_failures"] = len(failures)
    file_results = []

    if dry_run:
        return {
            "dry_run": True,
            "database": str(db_path),
            "stats": dict(stats),
            "failures": failures,
        }

    conn = sqlite3.connect(db_path)
    backup_path = root / (
        "enforcement_cases_2026.pre_encrypted_ingest_"
        + datetime.now().strftime("%Y%m%d_%H%M%S")
        + ".sqlite"
    )
    backup = sqlite3.connect(backup_path)
    conn.backup(backup)
    backup.close()

    try:
        for path, reader in encrypted:
            relative_path = path.relative_to(root).as_posix()
            case_id = path.relative_to(raw_root).parts[0]
            digest = sha256(path)
            old_paths = [
                row[0]
                for row in conn.execute(
                    "SELECT DISTINCT relative_path FROM documents WHERE sha256=?",
                    (digest,),
                )
            ]
            for old_path in old_paths:
                conn.execute(
                    "DELETE FROM document_fts WHERE case_id=? AND relative_path=?",
                    (case_id, old_path),
                )
            conn.execute("DELETE FROM documents WHERE sha256=?", (digest,))

            page_results = []
            for page_number, page in enumerate(reader.pages, 1):
                try:
                    text = normalize_text(page.extract_text() or "")
                    error = None
                except Exception as exc:
                    text = ""
                    error = f"{type(exc).__name__}: {exc}"
                    stats["page_extract_errors"] += 1
                conn.execute(
                    """INSERT INTO documents(
                           case_id, relative_path, extension, page_or_sheet,
                           extracted_text, text_chars, extraction_error, sha256
                       ) VALUES(?,?,?,?,?,?,?,?)""",
                    (
                        case_id,
                        relative_path,
                        ".pdf",
                        f"page {page_number}",
                        text,
                        len(text),
                        error,
                        digest,
                    ),
                )
                conn.execute(
                    "INSERT INTO document_fts(case_id,relative_path,extracted_text) VALUES(?,?,?)",
                    (case_id, relative_path, text),
                )
                stats["pages"] += 1
                stats["characters"] += len(text)
                if len(text) < 20:
                    stats["near_empty_pages"] += 1
                page_results.append({
                    "page": page_number,
                    "characters": len(text),
                    "error": error,
                })
            stats["files_ingested"] += 1
            file_results.append({
                "case_id": case_id,
                "file": relative_path,
                "pages": len(page_results),
                "characters": sum(item["characters"] for item in page_results),
                "near_empty_pages": sum(item["characters"] < 20 for item in page_results),
                "page_results": page_results,
            })
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

    result = {
        "dry_run": False,
        "password": "supplied by user; not stored",
        "database": str(db_path),
        "backup": str(backup_path),
        "stats": dict(stats),
        "failures": failures,
        "files": file_results,
    }
    (root / "加密PDF入库结果.json").write_text(
        json.dumps(result, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", required=True, type=Path)
    parser.add_argument("--password", required=True)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    print(json.dumps(
        run(args.root, args.password, args.dry_run),
        ensure_ascii=False,
        indent=2,
    ))
