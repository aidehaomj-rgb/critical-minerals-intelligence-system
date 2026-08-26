"""Mine the local enforcement-case corpus for controlled-goods communication leads.

This script does not access any mailbox.  It searches text already extracted into
the local 2026 enforcement-case SQLite database and separates e-mail-address
mentions from message-like communication records.
"""

from __future__ import annotations

import csv
import json
import re
import sqlite3
import sys
from collections import Counter, defaultdict
from pathlib import Path


sys.stdout.reconfigure(encoding="utf-8", errors="replace")

CASE_ROOT = Path(r"D:\codex\XG执法\2026_案例库")
DB_PATH = CASE_ROOT / "enforcement_cases_2026.sqlite"
CATALOG_PATH = CASE_ROOT / "case_catalog.csv"
OUTPUT_DIR = Path(__file__).resolve().parents[1] / "outputs" / "controlled_goods_communications_20260825"

EMAIL_RE = re.compile(
    r"(?<![A-Z0-9._%+\-])"
    r"[A-Z0-9._%+\-]{1,64}@[A-Z0-9.\-]{1,253}\.[A-Z]{2,24}"
    r"(?![A-Z0-9._%+\-])",
    re.I,
)

PATTERNS = {
    "管制或两用物项": re.compile(
        r"两用物项|兩用物項|出口管制|许可证|許可證|最终用户|最終用戶|"
        r"军民两用|軍民兩用|dual[ -]?use|export control|export licence|export license|"
        r"镓|鎵|锗|鍺|锑|銻|钨|鎢|石墨|稀土|钼|鉬|铟|銦|碲|tellurium|"
        r"gallium|germanium|antimony|tungsten|graphite|rare earth",
        re.I,
    ),
    "明确申报不实或改写": re.compile(
        r"伪报|偽報|虚报|虛報|瞒报|瞞報|错报|錯報|低报|低報|申报不实|申報不實|"
        r"品名不符|貨證不符|货证不符|货不对板|貨不對板|更改品名|更換品名|改(?:成|为|為).{0,12}品名|"
        r"更改型号|更改型號|修改型号|修改型號|型号不符|型號不符|"
        r"参数不符|參數不符|删除参数|刪除參數|规格不符|規格不符|"
        r"mis-?declar|false declaration|wrong description|incorrect description",
        re.I,
    ),
    "型号参数可核查字段": re.compile(
        r"纯度|純度|成分|牌号|牌號|功率|精度|粒度|型号|型號|规格|規格|参数|參數|"
        r"model|grade|spec(?:ification)?|purity|composition|power|accuracy",
        re.I,
    ),
    "明确藏匿或未申报": re.compile(
        r"夹藏|夾藏|藏匿|暗格|未列舱单|未列艙單|"
        r"未申报|未申報|走私|conceal|commingl|undeclared cargo|unmanifested",
        re.I,
    ),
    "第三国转口或主体替换": re.compile(
        r"第三国|第三國|转口|轉口|转运|轉運|改原产地|改原產地|更换收货人|更換收貨人|"
        r"中间商|中間商|离岸公司|離岸公司|借用抬头|借用抬頭|换抬头|換抬頭|"
        r"transship|re-?export|third countr|change.{0,20}country of origin",
        re.I,
    ),
    "通讯字段": re.compile(
        r"电子邮件|電子郵件|电邮|電郵|邮箱|郵箱|邮件|郵件|联络|聯絡|联系人|聯絡人|"
        r"WhatsApp|WeChat|微信|Telegram|Skype|e-?mail|contact",
        re.I,
    ),
    "普通拼箱分票字段": re.compile(
        r"拼箱|拼柜|拼櫃|集拼|分票|拆票|less than container load|\bLCL\b|consolidat",
        re.I,
    ),
}

MESSAGE_HEADER_RE = re.compile(
    r"(?:^|\n)\s*(?:From|To|Cc|Bcc|Subject|Sent|Date|发件人|發件人|收件人|"
    r"抄送|主题|主題|发送时间|發送時間)\s*[:：]",
    re.I,
)


def clean(value: object) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def contexts(text: str, pattern: re.Pattern[str], radius: int = 140, limit: int = 4) -> list[str]:
    found: list[str] = []
    for match in pattern.finditer(text):
        start = max(0, match.start() - radius)
        end = min(len(text), match.end() + radius)
        snippet = clean(text[start:end])
        if snippet and snippet not in found:
            found.append(snippet)
        if len(found) >= limit:
            break
    return found


def terms(text: str, pattern: re.Pattern[str], limit: int = 12) -> list[str]:
    values: list[str] = []
    for match in pattern.finditer(text):
        value = clean(match.group(0))
        key = value.casefold()
        if value and key not in {item.casefold() for item in values}:
            values.append(value)
        if len(values) >= limit:
            break
    return values


def load_catalog() -> dict[str, dict[str, str]]:
    with CATALOG_PATH.open("r", encoding="utf-8-sig", newline="") as stream:
        return {row["case_id"]: row for row in csv.DictReader(stream)}


def write_csv(path: Path, rows: list[dict], fieldnames: list[str]) -> None:
    with path.open("w", encoding="utf-8-sig", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    catalog = load_catalog()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    columns = {row[1] for row in conn.execute("PRAGMA table_info(documents)")}
    required = {"case_id", "relative_path", "page_or_sheet", "extracted_text"}
    if not required.issubset(columns):
        raise RuntimeError(f"documents table missing columns: {sorted(required - columns)}")

    rows = conn.execute(
        """SELECT case_id, relative_path, page_or_sheet, extracted_text
           FROM documents
           WHERE extracted_text IS NOT NULL AND length(extracted_text) > 0"""
    ).fetchall()

    candidate_rows: list[dict] = []
    email_stats: dict[str, dict] = {}
    group_document_counts: Counter[str] = Counter()
    group_case_ids: defaultdict[str, set[str]] = defaultdict(set)
    message_like_documents = 0
    documents_with_email = 0

    for row in rows:
        case_id = row["case_id"]
        text = row["extracted_text"] or ""
        matched = {name: terms(text, pattern) for name, pattern in PATTERNS.items()}
        matched = {name: values for name, values in matched.items() if values}
        emails = sorted({value.lower().rstrip(".") for value in EMAIL_RE.findall(text)})
        message_like = bool(MESSAGE_HEADER_RE.search(text))

        if emails:
            documents_with_email += 1
        if message_like:
            message_like_documents += 1

        for name in matched:
            group_document_counts[name] += 1
            group_case_ids[name].add(case_id)

        for email in emails:
            item = email_stats.setdefault(
                email,
                {"email": email, "cases": set(), "documents": set(), "occurrences": 0, "contexts": []},
            )
            item["cases"].add(case_id)
            document_key = f"{row['relative_path']}#{row['page_or_sheet']}"
            item["documents"].add(document_key)
            item["occurrences"] += len(re.findall(re.escape(email), text, re.I))
            for snippet in contexts(text, re.compile(re.escape(email), re.I), limit=2):
                if snippet not in item["contexts"] and len(item["contexts"]) < 6:
                    item["contexts"].append(snippet)

        has_control = "管制或两用物项" in matched
        has_evasion = any(
            name in matched
            for name in ("明确申报不实或改写", "明确藏匿或未申报", "第三国转口或主体替换")
        )
        has_parameter = "型号参数可核查字段" in matched
        has_communication = bool(emails) or "通讯字段" in matched or message_like
        score = 3 * has_control + 3 * has_evasion + 2 * has_communication + has_parameter

        if score < 3:
            continue

        catalog_row = catalog.get(case_id, {})
        candidate_rows.append(
            {
                "risk_score": score,
                "case_id": case_id,
                "package_name": catalog_row.get("package_name", ""),
                "case_type": catalog_row.get("case_type", ""),
                "date_hint": catalog_row.get("date_hint", ""),
                "relative_path": row["relative_path"],
                "page_or_sheet": row["page_or_sheet"],
                "message_like": "是" if message_like else "否",
                "emails": "; ".join(emails),
                "matched_groups": "; ".join(matched),
                "matched_terms": json.dumps(matched, ensure_ascii=False),
                "evidence_snippets": json.dumps(
                    {
                        name: contexts(text, PATTERNS[name], limit=2)
                        for name in matched
                    },
                    ensure_ascii=False,
                ),
            }
        )

    candidate_rows.sort(
        key=lambda row: (-int(row["risk_score"]), row["case_id"], row["relative_path"], str(row["page_or_sheet"]))
    )

    email_rows: list[dict] = []
    for item in email_stats.values():
        email_rows.append(
            {
                "email": item["email"],
                "case_count": len(item["cases"]),
                "document_count": len(item["documents"]),
                "occurrences": item["occurrences"],
                "case_ids": "; ".join(sorted(item["cases"])),
                "documents": "; ".join(sorted(item["documents"])),
                "contexts": json.dumps(item["contexts"], ensure_ascii=False),
            }
        )
    email_rows.sort(key=lambda row: (-int(row["case_count"]), -int(row["occurrences"]), row["email"]))

    summary = {
        "source_database": str(DB_PATH),
        "documents_with_text": len(rows),
        "cases_in_catalog": len(catalog),
        "documents_with_email_address": documents_with_email,
        "unique_email_addresses": len(email_rows),
        "message_like_documents": message_like_documents,
        "candidate_documents": len(candidate_rows),
        "candidate_cases": len({row["case_id"] for row in candidate_rows}),
        "high_priority_documents_score_8_or_9": sum(int(row["risk_score"]) >= 8 for row in candidate_rows),
        "high_priority_cases_score_8_or_9": len(
            {row["case_id"] for row in candidate_rows if int(row["risk_score"]) >= 8}
        ),
        "pattern_coverage": {
            name: {
                "documents": group_document_counts[name],
                "cases": len(group_case_ids[name]),
            }
            for name in PATTERNS
        },
        "caveat": (
            "Email-address mentions are not automatically e-mail messages. "
            "Message-like status requires recognizable message headers and still needs manual verification."
        ),
    }

    write_csv(
        OUTPUT_DIR / "候选通讯与规避线索_逐文档.csv",
        candidate_rows,
        [
            "risk_score", "case_id", "package_name", "case_type", "date_hint",
            "relative_path", "page_or_sheet", "message_like", "emails",
            "matched_groups", "matched_terms", "evidence_snippets",
        ],
    )
    write_csv(
        OUTPUT_DIR / "邮箱地址线索.csv",
        email_rows,
        ["email", "case_count", "document_count", "occurrences", "case_ids", "documents", "contexts"],
    )
    (OUTPUT_DIR / "筛查摘要.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
