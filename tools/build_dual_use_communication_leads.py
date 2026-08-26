"""Build defensible communication-lead tables from the completed OCR corpus."""

from __future__ import annotations

import csv
import json
import re
from collections import Counter, defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "outputs" / "dual_use_query_corpus_20260825"
PAGES_JSONL = OUTPUT_DIR / "双用途疑点案件_OCR页级索引.jsonl"
EMAIL_PAGES_CSV = OUTPUT_DIR / "通讯线索_页级证据.csv"
EMAIL_INDEX_CSV = OUTPUT_DIR / "通讯线索_邮箱与案件索引.csv"
CASE_FLAGS_CSV = OUTPUT_DIR / "单证与申报异常_案件级提示.csv"
SUMMARY_JSON = OUTPUT_DIR / "通讯与单证线索_分析摘要.json"

EMAIL_MESSAGE_RE = re.compile(
    r"(?:outlook|email\s*-).{0,300}(?:\bfrom\b|发件人).{0,300}(?:\bto\b|收件人)",
    re.I | re.S,
)
MAILBOX_RE = re.compile(r"outlook|email\s*-|发件人|收件人|主题\s*[:：]|subject\s*[:：]", re.I)
END_USER_RE = re.compile(r"end[- ]user|end use|最终用户|最终用途|no[- ]transfer|不转让", re.I)
TRANSACTION_RE = re.compile(
    r"commercial invoice|packing list|purchase order|air waybill|awb\s*no|"
    r"invoice\s*no|物流联系人|logistic contact|ship from|ship to",
    re.I,
)
TECHNICAL_RE = re.compile(
    r"material safety data sheet|\bmsds\b|\bsds\b|安全技术说明书|危险性识别|检测报告|certificate of analysis",
    re.I,
)
LICENCE_ASSERTION_RE = re.compile(
    r"不需要.{0,10}(?:许可证|许可證)|无需.{0,10}(?:许可证|许可證)|"
    r"does not require.{0,20}licen[cs]e|no.{0,10}licen[cs]e required",
    re.I | re.S,
)
DESCRIPTION_GUARANTEE_RE = re.compile(r"品\s*名\s*保\s*函|品名保函", re.I)
NON_DG_ASSERTION_RE = re.compile(r"不含危险品|不含危險品|not restricted|non[- ]restricted", re.I)
CONTROL_TERMS_RE = re.compile(
    r"球化石墨|spherical graphite|天然鳞片石墨|natural flake graphite|"
    r"金属铋|bismuth(?:\s+needle)?|钼粉|molybdenum powder|"
    r"仲钨酸铵|ammonium paratungstate|氧化钨|tungsten oxide|"
    r"未烧结.{0,12}碳化钨|unsintered.{0,20}tungsten carbide|"
    r"磷化铟|indium phosphide|三甲基铟|trimethylindium|三乙基铟|triethylindium",
    re.I,
)


def compact(text: str, limit: int = 420) -> str:
    value = re.sub(r"\s+", " ", text or "").strip()
    return value[:limit]


def classify_page(row: dict) -> tuple[str, str]:
    text = row.get("text", "")
    if EMAIL_MESSAGE_RE.search(text):
        return "A", "带发件人、收件人和正文的邮件通讯记录"
    if MAILBOX_RE.search(text):
        return "B", "邮箱界面或邮件附件来源痕迹（不等于完整邮件正文）"
    if END_USER_RE.search(text):
        return "C", "最终用户/最终用途文件中的交易联系人"
    if TRANSACTION_RE.search(text):
        return "C", "发票、装箱单、运单或采购单中的交易/物流联系人"
    if TECHNICAL_RE.search(text):
        return "D", "SDS、检测或技术文件的联系邮箱"
    if row.get("role") == "实物图片":
        return "D", "包装或产品标签上的公开业务邮箱"
    return "D", "其他业务文件中的联系邮箱"


def domains(emails: list[str]) -> list[str]:
    return sorted({email.rsplit("@", 1)[1] for email in emails if "@" in email})


def matches(pattern: re.Pattern[str], text: str) -> bool:
    """Match ordinary OCR text and a whitespace-free Chinese OCR variant."""
    return bool(pattern.search(text) or pattern.search(re.sub(r"\s+", "", text)))


def main() -> None:
    rows: list[dict] = []
    with PAGES_JSONL.open("r", encoding="utf-8") as stream:
        for line in stream:
            if line.strip():
                rows.append(json.loads(line))

    page_fields = [
        "case_id",
        "evidence_level",
        "evidence_type",
        "email",
        "domain",
        "role",
        "document_name",
        "page",
        "source",
        "member",
        "document_sha256",
        "context",
    ]
    page_records: list[dict] = []
    email_cases: dict[str, set[str]] = defaultdict(set)
    email_documents: dict[str, set[str]] = defaultdict(set)
    email_types: dict[str, set[str]] = defaultdict(set)
    email_levels: dict[str, set[str]] = defaultdict(set)

    for row in rows:
        for email in sorted(set(row.get("emails") or [])):
            level, evidence_type = classify_page(row)
            email = email.lower()
            record = {
                "case_id": row["case_id"],
                "evidence_level": level,
                "evidence_type": evidence_type,
                "email": email,
                "domain": email.rsplit("@", 1)[-1],
                "role": row.get("role", ""),
                "document_name": row.get("document_name", ""),
                "page": row.get("page", ""),
                "source": row.get("source", ""),
                "member": row.get("member", ""),
                "document_sha256": row.get("document_sha256", ""),
                "context": compact(row.get("text", "")),
            }
            page_records.append(record)
            email_cases[email].add(row["case_id"])
            email_documents[email].add(row.get("document_sha256", ""))
            email_types[email].add(evidence_type)
            email_levels[email].add(level)

    page_records.sort(key=lambda item: (item["case_id"], item["email"], int(item["page"] or 0)))
    with EMAIL_PAGES_CSV.open("w", encoding="utf-8-sig", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=page_fields)
        writer.writeheader()
        writer.writerows(page_records)

    index_fields = ["email", "domain", "case_count", "case_ids", "document_count", "evidence_levels", "evidence_types"]
    index_records = []
    for email in sorted(email_cases):
        index_records.append(
            {
                "email": email,
                "domain": email.rsplit("@", 1)[-1],
                "case_count": len(email_cases[email]),
                "case_ids": ";".join(sorted(email_cases[email])),
                "document_count": len(email_documents[email]),
                "evidence_levels": ";".join(sorted(email_levels[email])),
                "evidence_types": ";".join(sorted(email_types[email])),
            }
        )
    index_records.sort(key=lambda item: (-int(item["case_count"]), item["email"]))
    with EMAIL_INDEX_CSV.open("w", encoding="utf-8-sig", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=index_fields)
        writer.writeheader()
        writer.writerows(index_records)

    case_pages: dict[str, list[dict]] = defaultdict(list)
    for row in rows:
        case_pages[row["case_id"]].append(row)
    case_fields = [
        "case_id",
        "controlled_term_hit",
        "description_guarantee_hit",
        "licence_assertion_hit",
        "non_dg_assertion_hit",
        "email_count",
        "emails",
        "domain_count",
        "domains",
        "flag_context",
    ]
    case_records = []
    for case_id, pages in case_pages.items():
        text = "\n".join(page.get("text", "") for page in pages)
        case_emails = sorted({email for page in pages for email in (page.get("emails") or [])})
        controlled_hit = matches(CONTROL_TERMS_RE, text)
        guarantee_hit = matches(DESCRIPTION_GUARANTEE_RE, text)
        licence_hit = matches(LICENCE_ASSERTION_RE, text)
        non_dg_hit = matches(NON_DG_ASSERTION_RE, text)
        if not any((controlled_hit, guarantee_hit, licence_hit, non_dg_hit, case_emails)):
            continue
        snippets = []
        for page in pages:
            page_text = page.get("text", "")
            if (
                matches(CONTROL_TERMS_RE, page_text)
                or matches(DESCRIPTION_GUARANTEE_RE, page_text)
                or matches(LICENCE_ASSERTION_RE, page_text)
                or matches(NON_DG_ASSERTION_RE, page_text)
            ):
                snippets.append(f"{page.get('document_name')} p.{page.get('page')}: {compact(page_text, 260)}")
            if len(snippets) >= 3:
                break
        case_records.append(
            {
                "case_id": case_id,
                "controlled_term_hit": int(controlled_hit),
                "description_guarantee_hit": int(guarantee_hit),
                "licence_assertion_hit": int(licence_hit),
                "non_dg_assertion_hit": int(non_dg_hit),
                "email_count": len(case_emails),
                "emails": ";".join(case_emails),
                "domain_count": len(domains(case_emails)),
                "domains": ";".join(domains(case_emails)),
                "flag_context": " || ".join(snippets),
            }
        )
    case_records.sort(
        key=lambda item: (
            -int(item["description_guarantee_hit"]),
            -int(item["licence_assertion_hit"]),
            -int(item["controlled_term_hit"]),
            -int(item["email_count"]),
            item["case_id"],
        )
    )
    with CASE_FLAGS_CSV.open("w", encoding="utf-8-sig", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=case_fields)
        writer.writeheader()
        writer.writerows(case_records)

    evidence_counts = Counter(record["evidence_level"] for record in page_records)
    evidence_page_sets: dict[str, set[tuple[str, object]]] = defaultdict(set)
    for record in page_records:
        evidence_page_sets[record["evidence_level"]].add((record["document_sha256"], record["page"]))
    evidence_page_counts = {level: len(values) for level, values in sorted(evidence_page_sets.items())}
    summary = {
        "source_pages": len(rows),
        "source_cases": len(case_pages),
        "email_evidence_pages": len({(r["document_sha256"], r["page"]) for r in page_records}),
        "unique_emails": len(email_cases),
        "unique_domains": len({record["domain"] for record in page_records}),
        "cases_with_email": len({record["case_id"] for record in page_records}),
        "evidence_email_occurrence_counts": dict(sorted(evidence_counts.items())),
        "evidence_page_counts": evidence_page_counts,
        "complete_email_header_or_body_count": evidence_page_counts.get("A", 0),
        "note": (
            "A-level pages contain recognizable sender/recipient fields and message text, but may still be partial exports. "
            "B-level evidence is mailbox/attachment provenance only and must not be represented as a complete email message."
        ),
        "cross_case_emails": [record for record in index_records if int(record["case_count"]) > 1],
        "description_guarantee_cases": [record["case_id"] for record in case_records if record["description_guarantee_hit"]],
        "licence_assertion_cases": [record["case_id"] for record in case_records if record["licence_assertion_hit"]],
        "output_files": [str(EMAIL_PAGES_CSV), str(EMAIL_INDEX_CSV), str(CASE_FLAGS_CSV)],
    }
    SUMMARY_JSON.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
