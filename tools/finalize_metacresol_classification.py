from __future__ import annotations

import csv
import json
import os
import re
import unicodedata
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path


OUT_DIR = Path(os.environ["MC_DIR"])
STANDARD_CSV = Path(os.environ["MC_STANDARD_CSV"])

# These rows contain platform-mojibaked Cyrillic/Russian descriptions. They were
# independently identified as m-cresol in the first pass, but cannot be matched
# safely by a Latin-script regular expression. Two apparent "S/M CRESOL ORTHO"
# rows are intentionally not in this list.
MOJIBAKE_META_CANONICAL_ROWS = {
    1740, 2907, 3587, 3916, 4346, 4729, 5055, 5269, 5349,
    5493, 5559, 5797, 5952, 6284, 6285, 6492, 6860,
}

TAXED_ORIGINS = {
    "UNITED STATES", "USA", "U.S.A.", "GERMANY", "JAPAN", "SPAIN",
    "FRANCE", "BELGIUM", "UNITED KINGDOM", "UK", "ITALY", "NETHERLANDS",
    "AUSTRIA", "IRELAND", "DENMARK", "SWEDEN", "FINLAND", "POLAND",
    "CZECH REPUBLIC", "PORTUGAL", "GREECE", "LUXEMBOURG", "HUNGARY",
    "ROMANIA", "BULGARIA", "SLOVAKIA", "SLOVENIA", "CROATIA", "ESTONIA",
    "LATVIA", "LITHUANIA", "CYPRUS", "MALTA",
}


def ascii_upper(value: str) -> str:
    text = unicodedata.normalize("NFKD", str(value or ""))
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = text.upper().replace("﹞", "-")
    return re.sub(r"\s+", " ", text).strip()


DERIVATIVE = re.compile(
    r"(?:CHLOR(?:O|IDE)?[^;]{0,35}(?:CRESOL|3\s*[- ]?\s*METHYL\s*PHENOL))|"
    r"(?:(?:CRESOL|METHYL\s*PHENOL)[^;]{0,35}CHLOR)|"
    r"(?:AMYL|AMY)[^;]{0,25}(?:META\s*[- ]?\s*CRESOL|METACRESOL)|"
    r"(?:AMINO|AMMONIUM)[^;]{0,35}(?:META\s*[- ]?\s*CRESOL|M\s*[- ]?\s*CRESOL)|"
    r"(?:META\s*[- ]?\s*CRESOL|M\s*[- ]?\s*CRESOL)[^;]{0,40}(?:AMINO|AMMONIUM|SULFON)|"
    r"(?:META\s*[- ]?\s*CRESOL|M\s*[- ]?\s*CRESOL)\s*PURPLE|"
    r"(?:TERT\s*[- ]?\s*BUTYL|BUTYL)[^;]{0,25}(?:META\s*[- ]?\s*CRESOL|M\s*[- ]?\s*CRESOL)|"
    r"(?:META\s*[- ]?\s*CRESOL|M\s*[- ]?\s*CRESOL)[^;]{0,20}"
    r"(?:DERIVATIVE|ESTER|ETHER|ACETATE|PHOSPHATE)|"
    r"АМИЛМЕТАКРЕЗОЛ|(?:МЕТА\s*[- ]?\s*КРЕЗОЛ|М\s*[- ]?\s*КРЕЗОЛ)"
    r"[^;]{0,30}(?:ФИОЛЕТОВ|ПРИМЕСЬ)",
    re.I,
)
MIXED = re.compile(
    r"(?<!\d)1319\D{0,5}77\D{0,5}3(?!\d)|"
    r"META\s*[-_/ ]\s*(?:PARA|P)\s*[- ]?\s*CRESOL|"
    r"(?<![A-Z0-9])M\s*[-_/ ]\s*P\s*[- ]?\s*CRESOL|"
    r"(?<![A-Z0-9])MP\s*[- ]?\s*CRESOL|META\s*/\s*PARA|META\s+PARA|"
    r"CRESOL\s+(?:MIXTURE|MIX)|MIXED\s+CRESOL|CRESYLIC\s+ACID|"
    r"ACIDO\s+CRESILICO|CRESOLES?\s+MP\s*\d|(?<![A-Z0-9])MP90(?![A-Z0-9])|"
    r"МЕТА[^;]{0,15}(?:ПАРА|PARA)|М\s*[-/ ]\s*П\s*[- ]?\s*КРЕЗОЛ",
    re.I,
)
PARA = re.compile(
    r"PARA\s*[- ]?\s*CRESOL|PARACRESOL|CRESOL\s+PARA|"
    r"(?<![A-Z0-9])P\s*[-._ ]+\s*CRESOL|4\s*[- ]?\s*METHYL\s*[- ]?\s*PHENOL|"
    r"(?<!\d)106\D{0,5}44\D{0,5}5(?!\d)|"
    r"(?:ПАРА|П)\s*[- ]?\s*КРЕЗОЛ|4\s*[- ]?\s*МЕТИЛФЕНОЛ",
    re.I,
)
ORTHO = re.compile(
    r"ORTHO\s*[- ]?\s*CRESOL|ORTO\s*[- ]?\s*CRESOL|CRESOL\s+ORTHO|"
    r"(?<![A-Z0-9])O\s*[-._ ]+\s*CRESOL|2\s*[- ]?\s*METHYL\s*[- ]?\s*PHENOL|"
    r"(?<!\d)95\D{0,5}48\D{0,5}7(?!\d)|"
    r"(?:ОРТО|О)\s*[- ]?\s*КРЕЗОЛ|2\s*[- ]?\s*МЕТИЛФЕНОЛ",
    re.I,
)
EXPLICIT = re.compile(
    r"(?<!\d)108\D{0,6}39\D{0,6}4(?!\d)|"
    r"(?<![A-Z])M[\s._\-·0]*CRESOLS?|FM\s*[- ]?\s*CRESOL|"
    r"(?<![A-Z0-9])META\s*[- ]?\s*CRESOL|(?<![A-Z0-9])METACRESOL|"
    r"CRESOL\s+META|3\s*[- ]?\s*METHYL\s*[- ]?\s*PHENOL|"
    r"(?<![A-Z0-9])M\s*[- ]?\s*KRE[ZS]OL|META\s*[- ]?\s*KRE[ZS]OL|"
    r"MOLCRESOL\s+META|(?:МЕТА\s*[- ]?\s*КРЕЗОЛ|МЕТАКРЕЗОЛ)|"
    r"(?<![А-Я])М\s*[- ]?\s*КРЕЗОЛ|КРЕЗОЛ\s*[- ]?\s*М|3\s*[- ]?\s*МЕТИЛФЕНОЛ",
    re.I,
)
GENERIC = re.compile(
    r"(?<![A-Z])CRESOL(?:ES|S)?(?![A-Z])|(?<![A-Z])KRESOL(?:E|S)?(?![A-Z])|"
    r"METHYL\s*PHENOL|КРЕЗОЛ(?:Ы|И|І)?",
    re.I,
)


def classify(description: str, canonical_excel_row: int) -> tuple[str, str, str]:
    s = ascii_upper(description)
    if DERIVATIVE.search(s):
        return "衍生物", "货描含氯代、戊基、氨基、磺酸盐、指示剂或其他间甲酚衍生物", "description_rule_corrected"
    if MIXED.search(s):
        return "间对/混合", "货描明确为间/对甲酚混合物、混合甲酚或CAS 1319-77-3", "description_rule_corrected"
    if ORTHO.search(s):
        return "邻甲酚", "货描明确为邻甲酚、2-甲基苯酚或对应CAS", "description_rule_corrected"
    if PARA.search(s):
        return "对甲酚", "货描明确为对甲酚、4-甲基苯酚或对应CAS", "description_rule_corrected"
    if canonical_excel_row in MOJIBAKE_META_CANONICAL_ROWS:
        return "明确间甲酚", "平台多语种货描发生错码；经首轮逐票比对确认为M-/meta-cresol", "manual_multilingual_review"
    if EXPLICIT.search(s):
        return "明确间甲酚", "货描明确为间甲酚、3-甲基苯酚或对应CAS", "name_or_cas_corrected"
    if GENERIC.search(s):
        return "泛称", "货描仅为甲酚/甲基苯酚泛称，未明确异构体", "description_rule_corrected"
    return "其他", "货描未明确指向甲酚异构体、混合物或相关衍生物", "description_rule_corrected"


def write_csv(path: Path, rows: list[dict], fields: list[str]) -> None:
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def main() -> None:
    with STANDARD_CSV.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        rows = list(reader)
        fields = list(reader.fieldnames or [])
    if len(rows) != 7072:
        raise RuntimeError(f"Unexpected source row count: {len(rows)}")

    description_field = fields[6]
    destination_field = fields[12]
    origin_field = fields[13]
    corrections: list[dict] = []
    for row in rows:
        old = row["scope_category"]
        canonical = int(row["canonical_excel_row"])
        new, reason, evidence = classify(row[description_field], canonical)
        row["scope_category"] = new
        row["scope_reason"] = reason
        row["scope_evidence"] = evidence
        if old != new:
            corrections.append({
                "excel_row": row["excel_row"],
                "canonical_excel_row": row["canonical_excel_row"],
                "dedup_keep": row["dedup_keep"],
                "old_category": old,
                "new_category": new,
                "description": row[description_field],
                "correction_reason": reason,
            })

    yes = "是"
    dedup = [r for r in rows if r["dedup_keep"] == yes]
    explicit = [r for r in rows if r["scope_category"] == "明确间甲酚"]
    explicit_dedup = [r for r in dedup if r["scope_category"] == "明确间甲酚"]
    explicit_china = [r for r in explicit_dedup if r[destination_field].strip().upper() == "CHINA"]
    generic_china_raw = [r for r in rows if r["scope_category"] == "泛称" and r[destination_field].strip().upper() == "CHINA"]
    generic_china = [r for r in dedup if r["scope_category"] == "泛称" and r[destination_field].strip().upper() == "CHINA"]
    taxed_to_india = [
        r for r in explicit_dedup
        if r[destination_field].strip().upper() == "INDIA"
        and r[origin_field].strip().upper() in TAXED_ORIGINS
    ]

    if [int(r["excel_row"]) for r in explicit_china] != [987, 1560, 5705, 5706, 6617, 6618]:
        raise RuntimeError("China explicit subset changed unexpectedly")
    if len(generic_china) != 3 or len(generic_china_raw) != 39:
        raise RuntimeError(("China generic subset changed", len(generic_china_raw), len(generic_china)))
    if len(taxed_to_india) != 369:
        raise RuntimeError(("Taxed-origin to India subset changed", len(taxed_to_india)))

    raw_counts = Counter(r["scope_category"] for r in rows)
    dedup_counts = Counter(r["scope_category"] for r in dedup)
    if sum(raw_counts.values()) != 7072 or sum(dedup_counts.values()) != 6345:
        raise RuntimeError("Category totals do not reconcile")

    write_csv(STANDARD_CSV, rows, fields)
    (OUT_DIR / "间甲酚_易迅逐票标准化.json").write_text(
        json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    write_csv(OUT_DIR / "间甲酚_明确对华6条.csv", explicit_china, fields)
    write_csv(OUT_DIR / "间甲酚_泛称对华去重3条.csv", generic_china, fields)
    write_csv(OUT_DIR / "间甲酚_受税来源至印度A腿_最终369条.csv", taxed_to_india, fields)
    correction_fields = [
        "excel_row", "canonical_excel_row", "dedup_keep", "old_category",
        "new_category", "description", "correction_reason",
    ]
    write_csv(OUT_DIR / "间甲酚_分类纠偏审计.csv", corrections, correction_fields)

    summary = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source_file": "D:/易迅数据/间甲酚2023年至2026年1月15.xlsx",
        "source_sheet": "数据列表",
        "method": "两轮规则合并后逐票重分类；衍生物/混合物/邻对异构体优先排除；多语种错码记录人工复核",
        "counts": {
            "raw_rows": len(rows),
            "dedup_rows": len(dedup),
            "removed_duplicates": len(rows) - len(dedup),
            "categories": {
                key: {"raw": raw_counts[key], "dedup": dedup_counts[key]}
                for key in ["明确间甲酚", "对甲酚", "邻甲酚", "间对/混合", "衍生物", "泛称", "其他"]
            },
            "explicit_meta_to_china_dedup": len(explicit_china),
            "generic_to_china_raw": len(generic_china_raw),
            "generic_to_china_dedup": len(generic_china),
            "taxed_origin_to_india_a_leg": len(taxed_to_india),
            "classification_changed_raw_rows": len(corrections),
        },
        "qa": {
            "category_raw_sum": sum(raw_counts.values()),
            "category_dedup_sum": sum(dedup_counts.values()),
            "all_rows_have_scope_reason": all(bool(r["scope_reason"]) for r in rows),
            "explicit_china_excel_rows": [int(r["excel_row"]) for r in explicit_china],
            "generic_china_excel_rows": [int(r["excel_row"]) for r in generic_china],
        },
    }
    (OUT_DIR / "间甲酚_交付摘要.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
