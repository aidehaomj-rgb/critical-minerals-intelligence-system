from __future__ import annotations

import csv
import json
import re
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path


SRC = Path(r"D:\易迅数据\反倾销税深度分析报告\_易迅页面采集")
OUT = Path(r"D:\易迅数据\反倾销税深度分析报告\02_油菜籽")
PATTERNS = {
    "HS120510": "油菜籽_HS120510_全球_2025-08-06至2026-08-06_页*.json",
    "HS120590": "油菜籽_HS120590_全球_2025-08-06至2026-08-06_页*.json",
    "KW_CANOLA_SEED": "油菜籽_KW_CANOLA_SEED_全球_2025-08-06至2026-08-06_页*.json",
    "KW_RAPESEED": "油菜籽_KW_RAPESEED_全球_2025-08-06至2026-08-06_页*.json",
}
EXPECTED = {
    "HS120510": (5364, list(range(1, 28))),
    "HS120590": (887, list(range(1, 6))),
    "KW_CANOLA_SEED": (682, list(range(1, 5))),
    "KW_RAPESEED": (5167, list(range(1, 27))),
}
HEADERS = ["数据源", "进出口", "日期", "HS编码", "商品描述", "采购商", "供应商", "重量", "数量", "金额", "目的国地区", "原产国地区"]

SEED = re.compile(
    r"\bCANOLA\s+SEEDS?\b|\bRAPE\s*SEEDS?\b|\bRAPESEEDS?\b|\bCOLZA\s+SEEDS?\b|"
    r"SEMILLAS?\s+DE\s+CANOLA|SEMILLAS?\s+DE\s+COLZA|SEMILLAS?\s+DE\s+NABO|"
    r"GRAINES?\s+DE\s+COLZA|SEMILLA\s+DE\s+RAPS|\bRAPS\s*SAAT\b|\bRAPS\b",
    re.I,
)
SEED_CYRILLIC = re.compile(
    r"СЕМЕНА\s+РАПСА|\bРАПС\b|НАСІННЯ[^;]{0,100}(?:РІПАКУ|СВИРІПИ)|ЗЕРНО\s+РІПАКУ|\bРІПАК\b|КАНОЛА",
    re.I,
)
SEED_GENERIC = re.compile(
    r"^(?:CANADIAN\s+GMO\s+)?CANOLA(?:,?\s*NO\.?\s*CANADA)?(?:\s+GMO)?(?:\s+PACKING\s*:\s*)?\s*(?:IN\s+BULK)?$|"
    r"^AUSTRALIAN\s+CANOLA$|^CANOLA\s+GMO\s+IN\s+BULK|^GMO\s+CANOLA\s+IN\s+BULK",
    re.I,
)
SOWING = re.compile(
    r"FOR\s+(?:SOWING|PLANTING|SEEDING)|SOWING\s+PURPOSE|PLANTING\s+SEEDS?|HYBRID\s+(?:CANOLA|RAPE)|"
    r"CERTIFIED\s+SEEDS?|BREEDING\s+SEEDS?|SEMILLA.*SIEMBRA|PARA\s+SIEMBRA|SAATGUT|"
    r"VARIETY\s*[:：]|GERMINATION|LOT\s+NO\.?\s*[:：].*(?:EXP|TEST)|"
    r"(?<!НЕ\s)ДЛЯ\s+(?:СІВБИ|ПОСІВУ|ПОСЕВА)|ПОСЕВНОЙ\s+МАТЕРИАЛ|НАСІННЯ[^;]{0,120}ДЛЯ\s+СІВБИ",
    re.I,
)
DERIVATIVE = re.compile(
    r"\b(?:CANOLA|RAPESEED|RAPE\s+SEED|COLZA)\s+(?:(?:EXTRACTION|EXTRACTED)\s+)?(?:OIL(?!SEED)|MEAL|CAKE|FLOUR|BRAN|EXPELLER|PELLETS?|"
    r"METHYL\s+ESTER|FATTY\s+ACID|BIODIESEL|SOAPSTOCK|WAX)|"
    r"\bOIL\s+OF\s+(?:RAPESEED|COLZA)\b|\bCRUDE\s+(?:RAPESEED|CANOLA)\b|"
    r"\bRAPESEED\s+EXTRACT\b|\bCANOLA\s+PROTEIN\b|РАПСОВ(?:ОЕ|АЯ)\s+(?:МАСЛО|ШРОТ)|"
    r"ШРОТ\s+РАПСОВ|ОЛІЯ\s+РІПАК|МАКУХА\s+РІПАК",
    re.I,
)
MACHINERY = re.compile(r"MACHIN|EQUIPMENT|EXTRACTOR|CRUSH(?:ING|ER)|PRESS|SPARE\s+PART|MODEL\s+NO", re.I)

CHINA = {"China", "中国", "Mainland China", "PRC", "CHINA", "КИТАЙ", "КНР"}
CANADA = {"Canada", "CANADA"}


def norm(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "").strip()).upper()


def ent(s: str) -> str:
    v = norm(s)
    v = re.sub(r"\b(CO\.?|COMPANY|LTD\.?|LIMITED|INC\.?|CORP\.?|CORPORATION|LLC|PLC|PTE\.?|PRIVATE|PVT\.?|SAS|SA|SRL|NV)\b", " ", v)
    return re.sub(r"[^A-Z0-9]+", " ", v).strip()


def val(s: str) -> float | None:
    try:
        return float((s or "").replace(",", "").strip())
    except ValueError:
        return None


def classify(hs: str, desc: str) -> tuple[str, str]:
    h = re.sub(r"\D", "", hs or "")
    d = norm(desc)
    if SOWING.search(d):
        return "排除", "货描指向种用/播种用油菜籽；中国措施仅覆盖12051090、12059090非种用税号"
    if DERIVATIVE.search(d):
        return "排除", "货描为菜籽油、菜籽粕或其他加工衍生物，不属于涉税油菜籽"
    if MACHINERY.search(d) and not SEED.search(d):
        return "排除", "货描为机械设备或零部件"
    if SEED.search(d) or SEED_CYRILLIC.search(d) or SEED_GENERIC.search(d):
        return "纳入", "货描明确为非种用CANOLA/RAPE/COLZA SEED油菜籽"
    if h.startswith(("12051090", "12059090")):
        return "纳入", "命中中国措施列明的非种用8位税号12051090/12059090，且货描未显示种用或衍生物"
    if h.startswith(("120510", "120590")):
        return "待核", "命中六位税号但货描不明确；需以中国10位税号、用途和原产地证核实"
    return "排除", "仅宽关键词命中，货描/税号不支持涉税油菜籽"


def route(origin: str, destination: str) -> str:
    o, d = norm(origin), norm(destination)
    if d in {norm(x) for x in CHINA}:
        return "加拿大直达中国" if o in {norm(x) for x in CANADA} else "第三国来源进入中国"
    return "加拿大流向第三国" if o in {norm(x) for x in CANADA} else "其他全球基线"


def dedup_key(r: dict) -> tuple:
    return tuple(norm(str(r.get(k, ""))) for k in HEADERS)


def aggregate(rows: list[dict], key: str, limit: int = 100) -> list[dict]:
    groups: dict[str, list[dict]] = defaultdict(list)
    for r in rows:
        groups[r[key] or "(空白)"].append(r)
    result = []
    for name, rs in groups.items():
        result.append({
            "名称": name,
            "票数": len(rs),
            "明确纳入": sum(x["逐票判定"] == "纳入" for x in rs),
            "待核": sum(x["逐票判定"] == "待核" for x in rs),
            "重量合计_原字段": sum(x["重量数值"] or 0 for x in rs),
            "数量合计_原字段": sum(x["数量数值"] or 0 for x in rs),
            "金额合计_原字段": sum(x["金额数值"] or 0 for x in rs),
        })
    return sorted(result, key=lambda x: (x["票数"], x["重量合计_原字段"], x["数量合计_原字段"]), reverse=True)[:limit]


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    all_rows: list[dict] = []
    query_stats = {}
    for query, pattern in PATTERNS.items():
        files = sorted(SRC.glob(pattern))
        pages, count = [], 0
        for file in files:
            obj = json.loads(file.read_text(encoding="utf-8"))
            for page in obj["pages"]:
                p = int(page["page"])
                pages.append(p)
                for row_index, row in enumerate(page["rows"], 1):
                    values = list(row) + [""] * len(HEADERS)
                    rec = dict(zip(HEADERS, values[:len(HEADERS)]))
                    rec.update({"查询口径": query, "源文件": file.name, "源页码": p, "页内序号": row_index})
                    all_rows.append(rec)
                    count += 1
        query_stats[query] = {"原始票数": count, "页码": sorted(set(pages)), "文件数": len(files)}

    for q, (expected_count, expected_pages) in EXPECTED.items():
        actual = query_stats[q]
        if actual["原始票数"] != expected_count or actual["页码"] != expected_pages:
            raise RuntimeError(f"Completeness failure {q}: {actual}")

    seen: dict[tuple, dict] = {}
    for rec in all_rows:
        key = dedup_key(rec)
        if key in seen:
            prior = seen[key]
            hits = set(prior["命中查询口径"].split(";"))
            hits.add(rec["查询口径"])
            prior["命中查询口径"] = ";".join(sorted(hits))
            continue
        decision, reason = classify(rec["HS编码"], rec["商品描述"])
        rec.update({
            "命中查询口径": rec["查询口径"],
            "逐票判定": decision,
            "判定理由": reason,
            "链路类型": route(rec["原产国地区"], rec["目的国地区"]),
            "采购商标准名": ent(rec["采购商"]),
            "供应商标准名": ent(rec["供应商"]),
            "重量数值": val(rec["重量"]),
            "数量数值": val(rec["数量"]),
            "金额数值": val(rec["金额"]),
        })
        seen[key] = rec
    rows = list(seen.values())

    ledger_fields = HEADERS + ["命中查询口径", "源文件", "源页码", "页内序号", "逐票判定", "判定理由", "链路类型", "采购商标准名", "供应商标准名", "重量数值", "数量数值", "金额数值"]
    ledger_path = OUT / "油菜籽_易迅逐票判定台账_合并去重.csv"
    with ledger_path.open("w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=ledger_fields, extrasaction="ignore")
        w.writeheader()
        w.writerows(rows)

    relevant = [r for r in rows if r["逐票判定"] in ("纳入", "待核")]
    routes = {}
    route_names = ["加拿大直达中国", "第三国来源进入中国", "加拿大流向第三国", "其他全球基线"]
    for kind in route_names:
        subset = [r for r in relevant if r["链路类型"] == kind]
        routes[kind] = {
            "票数": len(subset),
            "明确纳入": sum(r["逐票判定"] == "纳入" for r in subset),
            "待核": sum(r["逐票判定"] == "待核" for r in subset),
            "重量合计_原字段": sum(r["重量数值"] or 0 for r in subset),
            "数量合计_原字段": sum(r["数量数值"] or 0 for r in subset),
            "金额合计_原字段": sum(r["金额数值"] or 0 for r in subset),
            "原产国": aggregate(subset, "原产国地区"),
            "目的国": aggregate(subset, "目的国地区"),
            "采购商": aggregate(subset, "采购商"),
            "供应商": aggregate(subset, "供应商"),
        }

    leg_a = [r for r in relevant if r["链路类型"] == "加拿大流向第三国"]
    leg_b = [r for r in relevant if r["链路类型"] == "第三国来源进入中国"]
    a_by_country: dict[str, list[dict]] = defaultdict(list)
    b_by_country: dict[str, list[dict]] = defaultdict(list)
    for r in leg_a:
        a_by_country[norm(r["目的国地区"])].append(r)
    for r in leg_b:
        b_by_country[norm(r["原产国地区"])].append(r)
    country_candidates = []
    for country in sorted(set(a_by_country) & set(b_by_country)):
        aa, bb = a_by_country[country], b_by_country[country]
        country_candidates.append({
            "中间国": country,
            "A段_加拿大至中间国票数": len(aa),
            "A段_重量合计_原字段": sum(r["重量数值"] or 0 for r in aa),
            "A段_数量合计_原字段": sum(r["数量数值"] or 0 for r in aa),
            "B段_中间国至中国票数": len(bb),
            "B段_重量合计_原字段": sum(r["重量数值"] or 0 for r in bb),
            "B段_数量合计_原字段": sum(r["数量数值"] or 0 for r in bb),
            "A段_日期范围": [min(r["日期"] for r in aa), max(r["日期"] for r in aa)],
            "B段_日期范围": [min(r["日期"] for r in bb), max(r["日期"] for r in bb)],
            "A段_主要采购商": aggregate(aa, "采购商", 15),
            "A段_主要供应商": aggregate(aa, "供应商", 15),
            "B段_主要采购商": aggregate(bb, "采购商", 15),
            "B段_主要供应商": aggregate(bb, "供应商", 15),
        })

    entity_overlaps = []
    for a_role, a_key in [("A段采购商", "采购商标准名"), ("A段供应商", "供应商标准名")]:
        for b_role, b_key in [("B段采购商", "采购商标准名"), ("B段供应商", "供应商标准名")]:
            aa, bb = defaultdict(list), defaultdict(list)
            for r in leg_a:
                if len(r[a_key]) >= 5:
                    aa[r[a_key]].append(r)
            for r in leg_b:
                if len(r[b_key]) >= 5:
                    bb[r[b_key]].append(r)
            for name in sorted(set(aa) & set(bb)):
                entity_overlaps.append({
                    "实体标准名": name,
                    "A段角色": a_role,
                    "B段角色": b_role,
                    "A段票数": len(aa[name]),
                    "B段票数": len(bb[name]),
                    "A段样本": aa[name][:10],
                    "B段样本": bb[name][:10],
                })

    summary = {
        "生成时间": datetime.now().isoformat(timespec="seconds"),
        "查询完整性": query_stats,
        "合并去重": {
            "四查询原始合计": len(all_rows),
            "去重后": len(rows),
            "重复": len(all_rows) - len(rows),
            "纳入": sum(r["逐票判定"] == "纳入" for r in rows),
            "待核": sum(r["逐票判定"] == "待核" for r in rows),
            "排除": sum(r["逐票判定"] == "排除" for r in rows),
        },
        "路线汇总": routes,
        "两段链路共同中间国": country_candidates,
        "跨段实体重合": entity_overlaps,
        "加拿大直达中国明细": [r for r in relevant if r["链路类型"] == "加拿大直达中国"],
        "第三国来源进入中国明细": leg_b,
        "加拿大流向第三国明细": leg_a,
        "判定理由分布": Counter(r["判定理由"] for r in rows).most_common(),
        "纳入待核货描TOP": Counter(norm(r["商品描述"]) for r in relevant).most_common(100),
    }
    summary_path = OUT / "油菜籽_易迅综合分析摘要.json"
    summary_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({
        "ledger": str(ledger_path),
        "summary": str(summary_path),
        "query_stats": query_stats,
        "dedup": summary["合并去重"],
        "routes": {k: {kk: v[kk] for kk in ("票数", "明确纳入", "待核", "重量合计_原字段", "数量合计_原字段", "金额合计_原字段")} for k, v in routes.items()},
        "country_candidates": [{k: v for k, v in x.items() if not k.startswith("A段_主要") and not k.startswith("B段_主要")} for x in country_candidates],
        "entity_overlaps": len(entity_overlaps),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
