from __future__ import annotations

import csv
import json
import re
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path


SRC = Path(r"D:\易迅数据\反倾销税深度分析报告\_易迅页面采集")
OUT = Path(r"D:\易迅数据\反倾销税深度分析报告\01_卤化丁基橡胶")
FILES = sorted(SRC.glob("卤化丁基橡胶_HS400239_全球_2025-08-06至2026-08-06_页*.json"))

HEADERS = [
    "数据源", "进出口", "日期", "HS编码", "商品描述", "采购商", "供应商",
    "重量", "数量", "金额", "目的国地区", "原产国地区",
]

EXPLICIT = re.compile(
    r"BROMO\s*BUTYL|BROMOBUTYL|CHLORO\s*BUTYL|CHLOROBUTYL|HALO\s*BUTYL|HALOBUTYL|"
    r"BROMINATED\s+(?:ISOBUTYLENE|BUTYL)|CHLORINATED\s+(?:ISOBUTYLENE|BUTYL)|"
    r"BUTYL\s+RUBBER|X[_ -]?BUTYL|BIIR|CIIR|BK[- ]?1675|BB[- ]?2255|"
    r"EXXPRO|BROMOBUTIL|CLOROBUTIL|CAUCHO\s+BUTILO|CAUCHO\s+HALOGENADO",
    re.I,
)

GENERIC = re.compile(
    r"SYNTHETIC\s+RUBBER|CAUCHO\s+SINTETICO|RUBBER\s+SYNTHETIC|"
    r"HALOGENATED\s+ISOBUTYLENE|COPOLYMER|POLYISOBUTYLENE|"
    r"CUMAR|KAUCHUK|BORRACHA|RUBBER|CAUCHO|BUTIL",
    re.I,
)

FINISHED = re.compile(
    r"TYRE|TIRE|TUBE|GLOVE|GASKET|SEAL|HOSE|SHOE|FOOTWEAR|"
    r"MACHINERY|SPARE\s+PART|AUTO\s+PART|BELT|CONVEYOR|CABLE",
    re.I,
)

TAXED = {
    "United States", "ESTADOS UNIDOS", "Canada", "Japan", "Singapore",
    "United Kingdom", "Belgium", "Germany", "France", "Italy", "Spain",
    "Netherlands", "Romania", "Poland", "Austria", "Ireland", "Sweden",
    "Finland", "Denmark", "Portugal", "Greece", "Czech Republic", "Hungary",
    "Slovakia", "Slovenia", "Croatia", "Bulgaria", "Lithuania", "Latvia",
    "Estonia", "Luxembourg", "Malta", "Cyprus",
}

CHINA = {"China", "中国", "Mainland China", "PRC"}


def ntext(value: str) -> str:
    return re.sub(r"\s+", " ", (value or "").strip()).upper()


def nentity(value: str) -> str:
    s = ntext(value)
    s = re.sub(r"\b(CO\.?|COMPANY|LTD\.?|LIMITED|INC\.?|CORP\.?|CORPORATION|LLC|PLC|PTE\.?|PRIVATE)\b", " ", s)
    return re.sub(r"[^A-Z0-9]+", " ", s).strip()


def num(value: str) -> float | None:
    try:
        return float((value or "").replace(",", "").strip())
    except ValueError:
        return None


def classify(hs: str, desc: str) -> tuple[str, str]:
    d = ntext(desc)
    if EXPLICIT.search(d):
        return "纳入", "货描明确出现卤化丁基橡胶名称、化学表述或可识别牌号"
    if FINISHED.search(d):
        return "排除", "货描指向轮胎/部件等制成品，虽命中宽口径税号但非卤化丁基橡胶本体"
    if GENERIC.search(d) or str(hs).startswith("400239"):
        return "待核", "命中HS 400239或宽泛橡胶表述，但货描不足以确认具体卤化丁基橡胶品种"
    return "排除", "货描与卤化丁基橡胶无直接关联"


def route_type(origin: str, destination: str) -> str:
    o = (origin or "").strip()
    d = (destination or "").strip()
    if d in CHINA:
        return "受税来源直达中国" if o in TAXED else "第三国来源进入中国"
    if o in TAXED:
        return "受税来源流向第三国"
    return "其他全球基线"


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    records: list[dict] = []
    page_seen: list[int] = []
    for file in FILES:
        obj = json.loads(file.read_text(encoding="utf-8"))
        for page in obj["pages"]:
            page_no = int(page["page"])
            page_seen.append(page_no)
            for idx, row in enumerate(page["rows"], 1):
                values = list(row) + [""] * (12 - len(row))
                rec = dict(zip(HEADERS, values[:12]))
                decision, reason = classify(rec["HS编码"], rec["商品描述"])
                route = route_type(rec["原产国地区"], rec["目的国地区"])
                rec.update(
                    {
                        "源页码": page_no,
                        "页内序号": idx,
                        "逐票判定": decision,
                        "判定理由": reason,
                        "链路类型": route,
                        "采购商标准名": nentity(rec["采购商"]),
                        "供应商标准名": nentity(rec["供应商"]),
                        "重量数值": num(rec["重量"]),
                        "数量数值": num(rec["数量"]),
                        "金额数值": num(rec["金额"]),
                    }
                )
                records.append(rec)

    if len(records) != 4738 or sorted(set(page_seen)) != list(range(1, 25)):
        raise RuntimeError(f"Completeness check failed: rows={len(records)}, pages={sorted(set(page_seen))}")

    fields = HEADERS + [
        "源页码", "页内序号", "逐票判定", "判定理由", "链路类型",
        "采购商标准名", "供应商标准名", "重量数值", "数量数值", "金额数值",
    ]
    ledger = OUT / "卤化丁基橡胶_易迅逐票判定台账.csv"
    with ledger.open("w", newline="", encoding="utf-8-sig") as fh:
        writer = csv.DictWriter(fh, fieldnames=fields)
        writer.writeheader()
        writer.writerows(records)

    included = [r for r in records if r["逐票判定"] == "纳入"]
    review = [r for r in records if r["逐票判定"] == "待核"]
    excluded = [r for r in records if r["逐票判定"] == "排除"]
    analysis = included + review

    def agg(rows: list[dict], key: str) -> list[dict]:
        groups: dict[str, list[dict]] = defaultdict(list)
        for row in rows:
            groups[row[key] or "(空白)"].append(row)
        out = []
        for name, rs in groups.items():
            weights = [r["重量数值"] for r in rs if r["重量数值"] is not None]
            amounts = [r["金额数值"] for r in rs if r["金额数值"] is not None]
            out.append({"名称": name, "票数": len(rs), "重量合计": sum(weights), "金额合计": sum(amounts)})
        return sorted(out, key=lambda x: (x["票数"], x["重量合计"]), reverse=True)

    by_route = {}
    for rt in ["受税来源直达中国", "第三国来源进入中国", "受税来源流向第三国", "其他全球基线"]:
        rs = [r for r in analysis if r["链路类型"] == rt]
        by_route[rt] = {
            "票数": len(rs),
            "明确纳入票数": sum(r["逐票判定"] == "纳入" for r in rs),
            "待核票数": sum(r["逐票判定"] == "待核" for r in rs),
            "重量合计": sum(r["重量数值"] or 0 for r in rs),
            "金额合计": sum(r["金额数值"] or 0 for r in rs),
            "原产国": agg(rs, "原产国地区")[:30],
            "目的国": agg(rs, "目的国地区")[:30],
            "采购商": agg(rs, "采购商")[:50],
            "供应商": agg(rs, "供应商")[:50],
        }

    # Candidate enterprise chains: supplier in taxed-origin-to-third leg also appears as
    # buyer/supplier in third-origin-to-China leg. This is a lead, not proof.
    leg_a = [r for r in analysis if r["链路类型"] == "受税来源流向第三国"]
    leg_b = [r for r in analysis if r["链路类型"] == "第三国来源进入中国"]
    names_a: dict[str, list[dict]] = defaultdict(list)
    names_b: dict[str, list[dict]] = defaultdict(list)
    for r in leg_a:
        for k in ("采购商标准名", "供应商标准名"):
            if len(r[k]) >= 5:
                names_a[r[k]].append(r)
    for r in leg_b:
        for k in ("采购商标准名", "供应商标准名"):
            if len(r[k]) >= 5:
                names_b[r[k]].append(r)
    overlaps = []
    for name in sorted(set(names_a) & set(names_b)):
        overlaps.append(
            {
                "标准实体名": name,
                "A段票数": len(names_a[name]),
                "B段票数": len(names_b[name]),
                "A段样例": [{k: r[k] for k in ("日期", "商品描述", "采购商", "供应商", "重量", "目的国地区", "原产国地区")} for r in names_a[name][:5]],
                "B段样例": [{k: r[k] for k in ("日期", "商品描述", "采购商", "供应商", "重量", "目的国地区", "原产国地区")} for r in names_b[name][:5]],
            }
        )

    direct_china = [r for r in analysis if r["目的国地区"] in CHINA]
    summary = {
        "生成时间": datetime.now().isoformat(timespec="seconds"),
        "查询口径": {"平台": "易迅数据", "HS": "400239", "日期": "2025-08-06至2026-08-06", "范围": "全球", "页数": 24, "每页": 200},
        "完整性": {"原始票数": len(records), "明确纳入": len(included), "待核": len(review), "排除": len(excluded), "页码": sorted(set(page_seen))},
        "路线汇总": by_route,
        "对华明细": direct_china,
        "跨段实体重合": overlaps,
        "纳入货描TOP": Counter(ntext(r["商品描述"]) for r in included).most_common(100),
    }
    (OUT / "卤化丁基橡胶_易迅分析摘要.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"ledger": str(ledger), "summary": str(OUT / '卤化丁基橡胶_易迅分析摘要.json'), "counts": summary["完整性"], "routes": {k: {kk: vv for kk, vv in v.items() if kk in ("票数", "明确纳入票数", "待核票数", "重量合计", "金额合计")} for k, v in by_route.items()}, "overlaps": len(overlaps)}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
