import hashlib
import json
import re
import shutil
import sys
from datetime import datetime
from pathlib import Path

from scan_gatherinfo import MINERALS, extract_text


DIRECT_PATTERN = re.compile(
    r"15种金属境内外价格|33号公告简报|5种金属管制|七种金属管制报告|"
    r"出口管制金属（稀土）|海关报告专项金属锑|韩国出口美国带稀土产品企业|"
    r"出口管制专项报告|出口管控专项报告11\.06|天然鳞片石墨专题报告|20种矿产资源"
)
GENERAL_REPORT_PATTERN = re.compile(r"\\日常报告\\|\\海关周报\\")
GENERIC_TERMS = {"关键矿产", "战略矿产", "稀土", "稀有金属", "稀散金属", "有色金属"}


def is_selected(row: dict) -> bool:
    path = row["path"]
    if DIRECT_PATTERN.search(path):
        return True
    if GENERAL_REPORT_PATTERN.search(path):
        return False
    hits = row.get("content_hits", {})
    return (
        hits.get("关键矿产", 0) >= 3
        or hits.get("战略矿产", 0) >= 3
        or hits.get("稀土", 0) >= 10
        or (hits.get("出口管制", 0) >= 3 and row.get("score", 0) >= 18)
    )


def human_size(size: int) -> str:
    if size >= 1024 * 1024:
        return f"{size / 1024 / 1024:.1f} MB"
    return f"{max(1, round(size / 1024))} KB"


def file_type(extension: str) -> tuple[str, str]:
    if extension in {".xls", ".xlsx", ".csv"}:
        return "spreadsheet", "表格"
    if extension == ".pdf":
        return "pdf", "PDF"
    if extension in {".ppt", ".pptx"}:
        return "presentation", "演示文稿"
    return "document", "文档"


def category_for(path: str) -> str:
    if "价格" in path:
        return "市场价格"
    if "企业" in path or "公司" in path:
        return "企业情报"
    if "稀土" in path:
        return "稀土专题"
    if "管制" in path or "公告" in path:
        return "出口管制"
    if "石墨" in path:
        return "矿产专题"
    return "研究报告"


def mineral_tags(row: dict) -> list[str]:
    combined = {}
    for source in (row.get("path_hits", {}), row.get("content_hits", {})):
        for term, count in source.items():
            if term in MINERALS and term not in GENERIC_TERMS:
                combined[term] = combined.get(term, 0) + count
    tags = [term for term, _ in sorted(combined.items(), key=lambda item: (-item[1], item[0]))[:3]]
    if row.get("content_hits", {}).get("稀土", 0) or "稀土" in row["path"]:
        tags.insert(0, "稀土")
    return list(dict.fromkeys(tags))[:3] or ["关键矿产"]


def preview_for(source: Path, row: dict, tags: list[str]) -> str:
    header = (
        f"本地资料导入\n\n"
        f"原始位置：{source}\n"
        f"归档年度：{row['year']}\n"
        f"关联矿产：{'、'.join(tags)}\n"
        f"资料分类：{category_for(str(source))}\n\n"
    )
    if source.suffix.lower() in {".doc", ".xls"}:
        return header + "该文件为旧版 Office 格式，文件库已保留原文件，可下载后查看完整内容。"
    text = extract_text(source)
    text = re.sub(r"\s+", " ", text).strip()
    if not text or text.startswith("__EXTRACT_ERROR__"):
        return header + "文件库已保留原文件；当前未能生成正文预览，可下载后查看完整内容。"
    return header + "内容预览：\n" + text[:2400] + ("…" if len(text) > 2400 else "")


def main(candidate_json: Path, project_dir: Path) -> None:
    rows = json.loads(candidate_json.read_text(encoding="utf-8"))
    selected = [row for row in rows if is_selected(row)]
    imported_root = project_dir / "library" / "imported"
    entries = []

    for row in selected:
        source = Path(row["path"])
        root = Path(rf"D:\codex\GatherInfo\{row['year']}")
        relative = source.relative_to(root)
        destination = imported_root / row["year"] / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, destination)

        extension = source.suffix.lower()
        kind, kind_name = file_type(extension)
        tags = mineral_tags(row)
        web_path = destination.relative_to(project_dir).as_posix()
        modified = datetime.fromtimestamp(source.stat().st_mtime).strftime("%Y-%m-%d")
        entries.append({
            "id": "gather-" + hashlib.sha1(str(source).encode("utf-8")).hexdigest()[:14],
            "name": source.name,
            "extension": extension.lstrip(".").upper(),
            "type": kind,
            "typeName": kind_name,
            "source": "uploaded",
            "sourceName": "本地导入",
            "date": modified,
            "size": human_size(source.stat().st_size),
            "mineral": "、".join(tags),
            "category": category_for(str(source)),
            "content": preview_for(source, row, tags),
            "downloadUrl": "./" + web_path,
            "year": row["year"],
            "originalPath": str(source),
            "sort": 200,
        })

    entries.sort(key=lambda item: (item["year"], item["category"], item["name"]), reverse=True)
    payload = json.dumps(entries, ensure_ascii=False, indent=2).replace("</", "<\\/")
    index_path = project_dir / "library-index.js"
    index_path.write_text("window.importedLibraryIndex = " + payload + ";\n", encoding="utf-8")
    print(json.dumps({
        "selected": len(entries),
        "by_year": {year: sum(item["year"] == year for item in entries) for year in ("2024", "2025")},
        "by_type": {name: sum(item["typeName"] == name for item in entries) for name in ("文档", "表格", "PDF")},
        "copied_bytes": sum(Path(row["path"]).stat().st_size for row in selected),
        "index": str(index_path),
    }, ensure_ascii=False))


if __name__ == "__main__":
    main(Path(sys.argv[1]), Path(sys.argv[2]))
