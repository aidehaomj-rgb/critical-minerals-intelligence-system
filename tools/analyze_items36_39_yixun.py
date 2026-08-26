from __future__ import annotations

import csv
import hashlib
import json
import re
from collections import Counter, defaultdict
from pathlib import Path


ROOT = Path(r"D:\易迅数据\反倾销专题\反倾销税深度分析报告")
HEADERS = [
    "数据源", "进出口", "日期", "HS编码", "商品描述", "采购商", "供应商",
    "重量字段", "数量字段", "金额字段", "目的国地区", "平台原产国地区", "操作",
]
EU = {
    "Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czech Republic",
    "Denmark", "Estonia", "Finland", "France", "Germany", "Greece", "Hungary",
    "Ireland", "Italy", "Latvia", "Lithuania", "Luxembourg", "Malta",
    "Netherlands", "Poland", "Portugal", "Romania", "Slovakia", "Slovenia",
    "Spain", "Sweden",
}


def read_rows(path: Path) -> list[list[str]]:
    data = json.loads(path.read_text(encoding="utf-8-sig"))
    rows = data.get("rows") or []
    return [["" if v is None else str(v).strip() for v in row] for row in rows]


def pad(row: list[str]) -> list[str]:
    return (row + [""] * len(HEADERS))[: len(HEADERS)]


def canonical(row: list[str]) -> str:
    # “收藏”是界面操作列，不属于贸易记录字段。
    return "\x1f".join(re.sub(r"\s+", " ", x).strip() for x in pad(row)[:12])


def num(v: str) -> float | None:
    try:
        return float(str(v).replace(",", "").strip())
    except Exception:
        return None


def save_csv(path: Path, records: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if not records:
        path.write_text("", encoding="utf-8-sig")
        return
    fields = list(records[0].keys())
    with path.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fields, extrasaction="ignore")
        w.writeheader()
        w.writerows(records)


def make_records(rows_with_query: list[tuple[list[str], str]], item: int) -> list[dict]:
    counts = Counter(canonical(row) for row, _ in rows_with_query)
    seen: set[str] = set()
    out: list[dict] = []
    for idx, (raw, query) in enumerate(rows_with_query, 1):
        row = pad(raw)
        key = canonical(row)
        rec = dict(zip(HEADERS, row))
        rec.update({
            "record_id": f"{item}-{hashlib.sha1((query+'|'+key).encode('utf-8')).hexdigest()[:12]}",
            "查询来源": query,
            "可见字段重复次数": counts[key],
            "可见字段首次记录": "是" if key not in seen else "否",
            "货描产地尾码": ",".join(re.findall(r"#&([A-Z]{2})\b", row[4].upper())),
        })
        seen.add(key)
        out.append(rec)
    return out


def classify36(rec: dict) -> tuple[str, str, str]:
    d = rec["商品描述"].upper()
    origin = rec["平台原产国地区"]
    if re.search(r"RECYC|REPROCES|SCRAP|TÁI SINH|TAI SINH", d):
        scope = "范围待核—再生PA66"
        reason = "明确为再生料；需成分、聚合物来源和海关范围认定，不能按原生切片直接计税"
    elif re.search(r"GLASS|FIBER|FIBRE|GF\b|COMPOUND|MODIFI|REINFOR|MASTERBATCH|FLAME|RETARD|PPE|PA6\+|PA66\+|GN1001BF|KA30|70%\s*[-–]\s*80%|87%", d):
        scope = "初步排除/待核—改性或混配"
        reason = "描述出现玻纤、增强、改性、复合或混配特征；公告明确二次混配改性切片排除"
    elif re.search(r"PA\s*66|PA66|POLYAMIDE[-\s]*66|NYLON[-\s]*66|POLYHEXAMETHYLENE ADIPAMIDE", d):
        scope = "范围候选—PA66初级形态"
        reason = "描述直接指向PA66/尼龙66切片或粒料，仍需COA确认未改性"
    else:
        scope = "范围待核—关键词命中但品名不足"
        reason = "关键词命中但不足以确认PA66切片"
    marker = rec.get("货描产地尾码", "")
    if "CN" in marker.split(","):
        route = f"第三国对华B腿—{origin or '未知'}/货描#&CN"
    elif origin == "United States":
        route = "受税来源直达—美国"
    elif origin:
        route = f"第三国对华B腿—{origin}"
    else:
        route = "原产字段空白—待核"
    risk = "高" if scope.startswith("范围候选") and origin == "United States" else (
        "中高" if scope.startswith("范围候选") and origin not in ("", "China") else "中/低"
    )
    return scope, route, risk + "；" + reason


def classify37(rec: dict) -> tuple[str, str, str]:
    d = rec["商品描述"].upper()
    hs = rec["HS编码"]
    origin = rec["平台原产国地区"]
    if "EXCL." in d and "POTATO" in d:
        scope, reason = "明确排除—货描明确排除马铃薯淀粉", "货描写明starch excl. potato"
    elif re.search(r"MODIFIED|DEXTRIN|PREGELAT|ESTERIFIED|ETHERIFIED|CATIONIC", d):
        scope, reason = "初步排除/待核—改性淀粉", "措施为原淀粉；描述显示改性/衍生"
    elif re.search(r"POTATO STARCH|POTATO FLOUR|КАРТОП.*КРОХМАЛ|KARTOFFELSTÄRKE|KARTOFFELSTAERKE", d) or hs.startswith("110813"):
        scope, reason = "范围候选—马铃薯原淀粉", "品名或税号指向马铃薯淀粉；物化指标仍需COA"
    else:
        scope, reason = "范围待核—品名不足", "关键词命中但异种淀粉/产品属性不清"
    taxed = origin in EU
    route = (f"受税来源直达—欧盟/{origin}" if taxed else
             (f"第三国对华B腿—{origin}" if origin else "原产字段空白—待核"))
    risk = "高" if scope.startswith("范围候选") and taxed else (
        "中高" if scope.startswith("范围候选") and origin not in ("", "China") else "低/待核"
    )
    return scope, route, risk + "；" + reason


def classify38(rec: dict) -> tuple[str, str, str]:
    d = rec["商品描述"].upper()
    origin = rec["平台原产国地区"]
    if re.search(r"ELECTROLYTIC|CAPACITOR|CONDENSER PAPER|电容器", d):
        scope, reason = "范围候选—电解电容器纸", "用途词直接命中，仍需克重/浸渍/涂布状态"
    elif re.search(r"GOLD|JOSS|VOTIVE|瓦楞|CORRUGAT|MEDIUM PAPER|PACKAGING|BOARD|KRAFT|VÀNG MÃ|VANG MA", d):
        scope, reason = "明确排除—包装/祭祀/瓦楞等其他纸", "用途明显不是电解电容器纸"
    else:
        scope, reason = "范围待核—仅税号/通用未涂布纸", "480591为宽税号，缺电容器用途和技术指标"
    route = "受税来源直达—日本" if origin == "Japan" else (
        f"第三国对华B腿—{origin}" if origin else "原产字段空白—待核"
    )
    risk = "高" if scope.startswith("范围候选") and origin == "Japan" else (
        "中" if scope.startswith("范围待核") and origin == "Japan" else "低/待核"
    )
    return scope, route, risk + "；" + reason


def classify39(rec: dict) -> tuple[str, str, str]:
    d = rec["商品描述"].upper()
    origin = rec["平台原产国地区"]
    if re.search(r"WASHER|PAD|SPONGE|ADHESIVE|GLUE|KEO DÁN|GLOVE|SHEET PRODUCT|ARTICLE", d):
        scope, reason = "明确排除—制品/胶粘剂", "下游制品或配制胶粘剂，不是初级形态氯丁橡胶"
    elif re.search(r"CHLOROPRENE|POLYCHLOROPRENE|CHLOROBUTADIENE|NEOPRENE|\bCR\b", d):
        scope, reason = "范围候选—氯丁橡胶初级形态", "品名指向CR/聚氯丁二烯；仍需成分、形态与税号复核"
    else:
        scope, reason = "范围待核—税号命中但品名不足", "税号或关键词命中，产品形态不明"
    taxed = origin in ({"Japan", "United States"} | EU)
    marker = rec.get("货描产地尾码", "")
    if "CN" in marker.split(",") and "HÀNG XUẤT TRẢ" in d:
        route = "越南返运对华—货描#&CN并引用原进口申报"
    elif origin == "Japan":
        route = "受税来源直达—日本"
    elif origin == "United States":
        route = "受税来源直达—美国"
    elif origin in EU:
        route = f"受税来源直达—欧盟/{origin}"
    elif origin:
        route = f"第三国对华B腿—{origin}"
    else:
        route = "原产字段空白—待核"
    risk = "高" if scope.startswith("范围候选") and taxed else (
        "中高" if scope.startswith("范围候选") and origin not in ("", "China") else "低/待核"
    )
    return scope, route, risk + "；" + reason


def summarize(records: list[dict]) -> dict:
    first = [r for r in records if r["可见字段首次记录"] == "是"]
    def agg(field: str):
        return dict(Counter(r[field] for r in first))
    origins = Counter(r["平台原产国地区"] or "空白" for r in first)
    suppliers = Counter(r["供应商"] or "空白" for r in first)
    buyers = Counter(r["采购商"] or "空白" for r in first)
    return {
        "raw_rows": len(records),
        "visible_field_unique_rows": len(first),
        "visible_duplicate_extra_rows": len(records) - len(first),
        "scope_counts_unique": agg("范围判定"),
        "route_counts_unique": agg("路线判定"),
        "origins_top_unique": origins.most_common(20),
        "suppliers_top_unique": suppliers.most_common(20),
        "buyers_top_unique": buyers.most_common(20),
    }


def run_item(item: int, folder: str, sources: list[tuple[str, str]], classifier) -> dict:
    item_dir = ROOT / folder
    rows_with_query: list[tuple[list[str], str]] = []
    source_counts = {}
    for filename, query_name in sources:
        rows = read_rows(item_dir / filename)
        source_counts[query_name] = len(rows)
        rows_with_query.extend((r, query_name) for r in rows)
    records = make_records(rows_with_query, item)
    for r in records:
        scope, route, evidence = classifier(r)
        r["范围判定"] = scope
        r["路线判定"] = route
        r["证据等级及理由"] = evidence
    summary = summarize(records)
    summary.update({"item": item, "folder": folder, "source_query_rows": source_counts})
    save_csv(item_dir / f"{item}_易迅逐票标准化_全部查询原始行.csv", records)
    save_csv(item_dir / f"{item}_易迅逐票标准化_可见字段去重.csv",
             [r for r in records if r["可见字段首次记录"] == "是"])
    (item_dir / f"{item}_易迅逐票分析摘要.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    return summary


def main() -> None:
    summaries = []
    summaries.append(run_item(36, "36_聚酰胺-6,6切片", [
        ("聚酰胺66_易迅_POLYAMIDE66_China_两年.json", "POLYAMIDE 66→China两年全页"),
        ("聚酰胺66_易迅_HS390810_China_两年_宽池阶段.json", "HS390810→China两年首20条阶段池"),
    ], classify36))
    summaries.append(run_item(37, "37_马铃薯淀粉", [
        ("马铃薯淀粉_易迅_POTATO_STARCH_China_两年_全页240条.json", "POTATO STARCH→China两年全页"),
        ("马铃薯淀粉_易迅_HS110813_China_两年_全页224条.json", "HS110813→China两年全页"),
    ], classify37))
    summaries.append(run_item(38, "38_电解电容器纸", [
        ("电解电容器纸_易迅_HS480591_China_两年_全页649条.json", "HS480591→China两年全页"),
    ], classify38))
    summaries.append(run_item(39, "39_氯丁橡胶", [
        ("氯丁橡胶_易迅_CHLOROPRENE_RUBBER_China_两年_全页13条.json", "CHLOROPRENE RUBBER→China两年全页"),
        ("氯丁橡胶_易迅_HS400249_China_两年_全页9条.json", "HS400249→China两年全页"),
    ], classify39))
    (ROOT / "36_39_易迅阶段汇总.json").write_text(
        json.dumps(summaries, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    # Keep stdout ASCII-safe on Windows GBK consoles; artifact files retain UTF-8 Chinese.
    print(json.dumps(summaries, ensure_ascii=True, indent=2))


if __name__ == "__main__":
    main()
