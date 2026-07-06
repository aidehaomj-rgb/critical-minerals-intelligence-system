import json
import re
import sys
import zipfile
from pathlib import Path

from pypdf import PdfReader


ROOTS = [Path(r"D:\codex\GatherInfo\2024"), Path(r"D:\codex\GatherInfo\2025")]
MINERALS = [
    "关键矿产", "战略矿产", "稀土", "稀有金属", "稀散金属", "有色金属",
    "钨", "钼", "锑", "镓", "锗", "石墨", "锂", "钴", "镍", "锰",
    "钽", "铌", "铟", "铋", "碲", "钒", "钛", "锆", "铪", "铍", "铼",
    "铂", "钯", "铑", "铱", "钪", "钇", "钐", "钆", "铽", "镝", "镥",
    "钬", "铒", "铥", "铕", "镱", "金刚石", "萤石", "磷矿"
]
CONTEXT = ["出口管制", "矿产资源", "矿产供应链", "矿产品", "金属材料", "两用物项"]
SUPPORTED = {".doc", ".docx", ".xls", ".xlsx", ".pdf"}


def xml_text_from_zip(path: Path, prefixes: tuple[str, ...]) -> str:
    chunks = []
    with zipfile.ZipFile(path) as archive:
        for name in archive.namelist():
            if name.startswith(prefixes) and name.endswith(".xml"):
                raw = archive.read(name).decode("utf-8", errors="ignore")
                chunks.extend(re.findall(r"<(?:w:t|t)[^>]*>(.*?)</(?:w:t|t)>", raw))
                if len(chunks) > 20000:
                    break
    return " ".join(re.sub(r"<[^>]+>", "", chunk) for chunk in chunks)


def legacy_binary_text(path: Path) -> str:
    raw = path.read_bytes()
    ascii_runs = re.findall(rb"[\x20-\x7e]{4,}", raw)
    wide_runs = re.findall(rb"(?:[\x20-\x7e\x80-\xff]\x00){3,}", raw)
    parts = [value.decode("latin1", errors="ignore") for value in ascii_runs]
    parts += [value.decode("utf-16le", errors="ignore") for value in wide_runs]
    return " ".join(parts)


def extract_text(path: Path) -> str:
    suffix = path.suffix.lower()
    try:
        if suffix == ".docx":
            return xml_text_from_zip(path, ("word/",))
        if suffix == ".xlsx":
            return xml_text_from_zip(path, ("xl/sharedStrings", "xl/worksheets/"))
        if suffix == ".pdf":
            reader = PdfReader(str(path))
            return "\n".join((page.extract_text() or "") for page in reader.pages[:30])
        if suffix in {".doc", ".xls"}:
            return legacy_binary_text(path)
    except Exception as exc:
        return f"__EXTRACT_ERROR__ {exc}"
    return ""


def hits(text: str, terms: list[str]) -> dict[str, int]:
    return {term: text.count(term) for term in terms if term in text}


def main(output_path: Path) -> None:
    rows = []
    for root in ROOTS:
        for path in root.rglob("*"):
            if not path.is_file() or path.suffix.lower() not in SUPPORTED:
                continue
            path_text = str(path)
            path_hits = hits(path_text, MINERALS + CONTEXT)
            content = extract_text(path)
            content_hits = hits(content[:250000], MINERALS + CONTEXT)
            mineral_hits = {key: value for key, value in {**path_hits, **content_hits}.items() if key in MINERALS}
            context_hits = {key: value for key, value in {**path_hits, **content_hits}.items() if key in CONTEXT}
            score = sum(min(3, value) for value in mineral_hits.values()) + sum(min(2, value) for value in context_hits.values())
            relevant = bool(path_hits) or score >= 3
            if relevant:
                rows.append({
                    "path": str(path),
                    "year": root.name,
                    "extension": path.suffix.lower(),
                    "size": path.stat().st_size,
                    "score": score,
                    "path_hits": path_hits,
                    "content_hits": content_hits,
                    "extract_error": content.startswith("__EXTRACT_ERROR__"),
                })
    rows.sort(key=lambda row: (-row["score"], row["path"]))
    output_path.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({
        "scanned_roots": [str(root) for root in ROOTS],
        "candidates": len(rows),
        "by_year": {year: sum(row["year"] == year for row in rows) for year in ("2024", "2025")},
        "by_extension": {ext: sum(row["extension"] == ext for row in rows) for ext in sorted(SUPPORTED)},
        "output": str(output_path),
    }, ensure_ascii=False))


if __name__ == "__main__":
    main(Path(sys.argv[1]))
