from __future__ import annotations

import csv
import json
import re
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path


SRC = Path(r"D:\易迅数据\反倾销税深度分析报告\_易迅页面采集")
OUT = Path(r"D:\易迅数据\反倾销税深度分析报告\01_卤化丁基橡胶")
PATTERNS = {
    "HS400239": "卤化丁基橡胶_HS400239_全球_2025-08-06至2026-08-06_页*.json",
    "KW_BROMOBUTYL": "卤化丁基橡胶_KW_BROMOBUTYL_全球_2025-08-06至2026-08-06_页*.json",
}

HEADERS = ["数据源", "进出口", "日期", "HS编码", "商品描述", "采购商", "供应商", "重量", "数量", "金额", "目的国地区", "原产国地区"]

EXPLICIT = re.compile(
    r"BROMO\s*BUTYL|BROMOBUTYL|CHLORO\s*BUTYL|CHLOROBUTYL|HALO[- ]?(?:ISOBUTENE|BUTYL)|"
    r"HALOGENATED\s+(?:ISOBUTYLENE|BUTYL)|BROMINATED\s+(?:ISOBUTYLENE|BUTYL)|"
    r"CHLORINATED\s+(?:ISOBUTYLENE|BUTYL)|BUTYL\s+RUBBER|X[_ -]?BUTYL|"
    r"\bBIIR\b|\bCIIR\b|\bBK[- ]?1675\b|\bBB[- ]?2255\b|EXXPRO|BROMOBUTIL|CLOROBUTIL|"
    r"CAUCHO\s+BUTILO|CAUCHO\s+HALOGENADO|IMPRAMER\s+C",
    re.I,
)
GENERIC = re.compile(r"SYNTHETIC\s+RUBBER|CAUCHO\s+SINTETICO|RUBBER\s+SYNTHETIC|COPOLYMER|POLYISOBUTYLENE|CUMAR|KAUCHUK|BORRACHA|RUBBER|CAUCHO|BUTIL", re.I)
FINISHED = re.compile(r"TYRE|TIRE|TUBE|GLOVE|GASKET|SEAL|HOSE|SHOE|FOOTWEAR|MACHINERY|SPARE\s+PART|AUTO\s+PART|BELT|CONVEYOR|CABLE|STOPPER|PHARMACEUTICALS?\s+PACKING", re.I)
FINISHED_HS_PREFIX = ("4014", "4015", "4016")

EU = {"Belgium", "Germany", "France", "Italy", "Spain", "Netherlands", "Romania", "Poland", "Austria", "Ireland", "Sweden", "Finland", "Denmark", "Portugal", "Greece", "Czech Republic", "Hungary", "Slovakia", "Slovenia", "Croatia", "Bulgaria", "Lithuania", "Latvia", "Estonia", "Luxembourg", "Malta", "Cyprus"}
TAXED = {"United States", "ESTADOS UNIDOS", "Canada", "Japan", "Singapore", "United Kingdom"} | EU
CHINA = {"China", "中国", "Mainland China", "PRC"}


def norm(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "").strip()).upper()


def ent(s: str) -> str:
    v = norm(s)
    v = re.sub(r"\b(CO\.?|COMPANY|LTD\.?|LIMITED|INC\.?|CORP\.?|CORPORATION|LLC|PLC|PTE\.?|PRIVATE|NV)\b", " ", v)
    return re.sub(r"[^A-Z0-9]+", " ", v).strip()


def val(s: str) -> float | None:
    try:
        return float((s or "").replace(",", "").strip())
    except ValueError:
        return None


def classify(hs: str, desc: str) -> tuple[str, str]:
    d = norm(desc)
    if str(hs).startswith(FINISHED_HS_PREFIX) or FINISHED.search(d):
        return "排除", "货描指向轮胎/部件等制成品"
    if EXPLICIT.search(d):
        return "纳入", "货描明确出现卤化丁基橡胶名称、化学表述或可识别牌号"
    if str(hs).startswith("400239") or GENERIC.search(d):
        return "待核", "命中HS或宽泛橡胶表述，货描不足以确认具体品种"
    return "排除", "货描和税号均不足以确认"


def route(o: str, d: str) -> str:
    if d in CHINA:
        return "受税来源直达中国" if o in TAXED else "第三国来源进入中国"
    return "受税来源流向第三国" if o in TAXED else "其他全球基线"


def dedup_key(r: dict) -> tuple:
    # A stable visible-field key. Exact duplicates across HS and keyword searches are removed,
    # while genuinely separate same-day shipments remain if any visible field differs.
    return tuple(norm(str(r.get(k, ""))) for k in HEADERS)


def aggregate(rows: list[dict], key: str, limit: int = 50) -> list[dict]:
    groups: dict[str, list[dict]] = defaultdict(list)
    for r in rows:
        groups[r[key] or "(空白)"].append(r)
    items = []
    for name, rs in groups.items():
        items.append({"名称": name, "票数": len(rs), "重量合计": sum(r["重量数值"] or 0 for r in rs), "金额合计": sum(r["金额数值"] or 0 for r in rs)})
    return sorted(items, key=lambda x: (x["票数"], x["重量合计"]), reverse=True)[:limit]


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    all_rows: list[dict] = []
    query_stats = {}
    for query, pattern in PATTERNS.items():
        files = sorted(SRC.glob(pattern))
        pages = []
        count = 0
        for file in files:
            obj = json.loads(file.read_text(encoding="utf-8"))
            for page in obj["pages"]:
                pages.append(int(page["page"]))
                for row_index, row in enumerate(page["rows"], 1):
                    values = list(row) + [""] * 12
                    rec = dict(zip(HEADERS, values[:12]))
                    rec.update({"查询口径": query, "源页码": int(page["page"]), "页内序号": row_index})
                    all_rows.append(rec)
                    count += 1
        query_stats[query] = {"原始票数": count, "页码": sorted(set(pages)), "文件数": len(files)}

    expected = {"HS400239": (4738, list(range(1, 25))), "KW_BROMOBUTYL": (2762, list(range(1, 15)))}
    for q, (cnt, pages) in expected.items():
        if query_stats[q]["原始票数"] != cnt or query_stats[q]["页码"] != pages:
            raise RuntimeError(f"Completeness failure {q}: {query_stats[q]}")

    seen: dict[tuple, dict] = {}
    for rec in all_rows:
        k = dedup_key(rec)
        if k in seen:
            prior = seen[k]
            if rec["查询口径"] not in prior["命中查询口径"].split(";"):
                prior["命中查询口径"] += ";" + rec["查询口径"]
            continue
        decision, reason = classify(rec["HS编码"], rec["商品描述"])
        rec.update({
            "命中查询口径": rec["查询口径"],
            "逐票判定": decision,
            "判定理由": reason,
            "链路类型": route(rec["原产国地区"], rec["目的国地区"]),
            "采购商标准名": ent(rec["采购商"]),
            "供应商标准名": ent(rec["供应商"]),
            "重量数值": val(rec["重量"]), "数量数值": val(rec["数量"]), "金额数值": val(rec["金额"]),
        })
        seen[k] = rec
    rows = list(seen.values())

    ledger_fields = HEADERS + ["命中查询口径", "源页码", "页内序号", "逐票判定", "判定理由", "链路类型", "采购商标准名", "供应商标准名", "重量数值", "数量数值", "金额数值"]
    ledger = OUT / "卤化丁基橡胶_易迅逐票判定台账_合并去重.csv"
    with ledger.open("w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=ledger_fields, extrasaction="ignore")
        w.writeheader(); w.writerows(rows)

    relevant = [r for r in rows if r["逐票判定"] in ("纳入", "待核")]
    routes = {}
    for kind in ["受税来源直达中国", "第三国来源进入中国", "受税来源流向第三国", "其他全球基线"]:
        subset = [r for r in relevant if r["链路类型"] == kind]
        routes[kind] = {
            "票数": len(subset), "明确纳入": sum(r["逐票判定"] == "纳入" for r in subset), "待核": sum(r["逐票判定"] == "待核" for r in subset),
            "重量合计": sum(r["重量数值"] or 0 for r in subset), "金额合计": sum(r["金额数值"] or 0 for r in subset),
            "原产国": aggregate(subset, "原产国地区"), "目的国": aggregate(subset, "目的国地区"),
            "采购商": aggregate(subset, "采购商"), "供应商": aggregate(subset, "供应商"),
        }

    # Cross-leg match by normalized entity names and exact recognizable grade tokens.
    leg_a = [r for r in relevant if r["链路类型"] == "受税来源流向第三国"]
    leg_b = [r for r in relevant if r["链路类型"] == "第三国来源进入中国"]
    overlaps = []
    for label, key in [("采购商", "采购商标准名"), ("供应商", "供应商标准名")]:
        a = defaultdict(list); b = defaultdict(list)
        for r in leg_a:
            if len(r[key]) >= 5: a[r[key]].append(r)
        for r in leg_b:
            if len(r[key]) >= 5: b[r[key]].append(r)
        for name in set(a) & set(b):
            overlaps.append({"字段": label, "标准实体名": name, "A段票数": len(a[name]), "B段票数": len(b[name]), "A段": a[name][:10], "B段": b[name][:10]})

    direct = [r for r in relevant if r["目的国地区"] in CHINA]
    summary = {
        "生成时间": datetime.now().isoformat(timespec="seconds"), "查询完整性": query_stats,
        "合并去重": {"两查询原始合计": len(all_rows), "去重后": len(rows), "重复": len(all_rows)-len(rows), "纳入": sum(r["逐票判定"]=="纳入" for r in rows), "待核": sum(r["逐票判定"]=="待核" for r in rows), "排除": sum(r["逐票判定"]=="排除" for r in rows)},
        "路线汇总": routes, "对华明细": direct, "跨段实体重合": overlaps,
        "新增于关键词查询且未命中HS查询": [r for r in rows if r["命中查询口径"] == "KW_BROMOBUTYL"],
        "货描TOP": Counter(norm(r["商品描述"]) for r in relevant).most_common(100),
    }
    out = OUT / "卤化丁基橡胶_易迅综合分析摘要.json"
    out.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"ledger": str(ledger), "summary": str(out), "query_stats": query_stats, "dedup": summary["合并去重"], "routes": {k:{kk:v[kk] for kk in ("票数","明确纳入","待核","重量合计","金额合计")} for k,v in routes.items()}, "direct": len(direct), "overlaps": len(overlaps), "keyword_only": len(summary["新增于关键词查询且未命中HS查询"])}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
