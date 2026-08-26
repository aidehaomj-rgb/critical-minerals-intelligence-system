from __future__ import annotations

import csv
import hashlib
import json
import re
from collections import Counter, defaultdict
from datetime import datetime, timedelta
from pathlib import Path

import pandas as pd


ROOT = Path(r"D:\易迅数据\反倾销税深度分析报告")
COLS = ["数据源", "进出口", "日期", "HS编码", "商品描述", "采购商", "供应商", "重量", "数量", "金额", "目的国地区", "平台原产国地区", "操作"]
KEY_COLS = COLS[:12]


def load_json_any(path: Path):
    text = path.read_text(encoding="utf-8-sig", errors="replace")
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        lines = text.splitlines()
        starts = [i for i, line in enumerate(lines) if line.strip() == "{" and i + 1 < len(lines) and '"query_id"' in lines[i + 1]]
        if not starts:
            raise
        return json.loads("\n".join(lines[starts[-1] :]))


def rows_from_obj(obj, query_id: str, source_file: str):
    out = []
    rows = obj.get("rows", [])
    for pos, item in enumerate(rows, 1):
        cells = item.get("cells", item) if isinstance(item, dict) else item
        cells = list(cells)[:13] + [""] * max(0, 13 - len(cells))
        d = dict(zip(COLS, cells[:13]))
        d["query_id"] = query_id
        d["query_row"] = item.get("row", pos) if isinstance(item, dict) else pos
        d["source_file"] = source_file
        out.append(d)
    return out


def exact_key(row):
    return tuple(str(row.get(k, "")).strip() for k in KEY_COLS)


def norm_rows(rows):
    seen = {}
    unique = []
    dup_groups = defaultdict(list)
    for idx, r in enumerate(rows, 1):
        r = dict(r)
        key = exact_key(r)
        rid = hashlib.sha1("\x1f".join(key).encode("utf-8")).hexdigest()[:16]
        r["record_id"] = rid
        r["raw_seq"] = idx
        dup_groups[rid].append(r)
        if rid not in seen:
            seen[rid] = r
            unique.append(r)
    for r in unique:
        r["equivalent_occurrences"] = len(dup_groups[r["record_id"]])
    return unique, dup_groups


def num(v):
    try:
        s = str(v).strip().replace(",", "")
        return float(s) if s else 0.0
    except Exception:
        return 0.0


def mass_proxy(r):
    w, q = num(r.get("重量")), num(r.get("数量"))
    if w:
        return w, "平台重量字段"
    return q, "平台数量字段（单位待核）"


def marker(desc):
    m = re.search(r"#&([A-Z]{2})\b", str(desc).upper())
    return m.group(1) if m else ""


def write_csv(path: Path, rows, columns=None):
    path.parent.mkdir(parents=True, exist_ok=True)
    rows = list(rows)
    if columns is None:
        columns = list(rows[0]) if rows else ["record_id"]
    with path.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=columns, extrasaction="ignore")
        w.writeheader()
        w.writerows(rows)


def write_json(path: Path, obj):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2), encoding="utf-8")


def duplicate_rows(groups):
    out = []
    for rid, members in groups.items():
        if len(members) > 1:
            for seq, r in enumerate(members, 1):
                out.append({"record_id": rid, "组内序号": seq, "等价出现次数": len(members), **r})
    return out


def aggregate(rows, field):
    c = Counter(str(r.get(field, "")).strip() or "（空）" for r in rows)
    return [{field: k, "记录数": v} for k, v in c.most_common()]


def dt(s):
    try:
        return datetime.strptime(str(s)[:10], "%Y-%m-%d")
    except Exception:
        return None


def analyze_27():
    out = ROOT / "27_共聚聚甲醛_韩国泰国马来西亚"
    f = out / "POM27_易迅_POLYACETAL_中国_近一年_全151条.json"
    obj = load_json_any(f)
    rows = rows_from_obj(obj, obj.get("query_id", "POM27-POLYACETAL-CHINA-1Y"), f.name)
    unique, groups = norm_rows(rows)
    mainland = [r for r in unique if r["目的国地区"].strip() == "China"]
    taiwan = [r for r in unique if r["目的国地区"].strip() != "China"]

    for r in unique:
        d = r["商品描述"].upper()
        r["原产标记"] = marker(d)
        r["品牌穿透"] = "KOCETAL/KOLON韩国POM品牌牌号（货描疑似误拼KOCEAL）" if ("KOCEAL K700" in d or "KOCETAL K700" in d) else ""
        r["范围初筛"] = (
            "共聚POM候选" if any(x in d for x in ["POLYACETAL COPOLYMER", "POLYOXYMETHYLENE", "POM ", "POM(", "POM,"])
            else "通用品名待COA" if "POLYACETAL" in d
            else "范围外/噪声"
        )
        if any(x in d for x in ["RECYCLE", "TÁI SINH", "RECLAIM"]):
            r["范围初筛"] = "再生POM待成分/原产核定"
        if any(x in d for x in ["GF", "GLASS FIB", "MASTERBATCH", "COLOR", "COLOUR", "MÀU"]):
            r["范围初筛"] = "改性POM—原措施范围外倾向"
        mp, basis = mass_proxy(r)
        r["物量代理"] = mp
        r["物量口径"] = basis
        origin = r["平台原产国地区"]
        if origin in {"South Korea", "Korea", "Thailand", "Malaysia"}:
            r["路线判定"] = "受税来源直达中国—核税款"
            r["证据等级"] = "B"
        elif r["目的国地区"] == "China" and (r["原产标记"] in {"KR", "TH", "MY"}):
            r["路线判定"] = "第三国B腿且货描保留受税来源标记"
            r["证据等级"] = "B+"
        elif r["目的国地区"] == "China" and r["品牌穿透"]:
            r["路线判定"] = "越南B腿出现韩国KOCETAL K700牌号—缺同批A腿"
            r["证据等级"] = "B+"
        elif r["目的国地区"] == "China" and r["范围初筛"] != "范围外/噪声":
            r["路线判定"] = "非受税来源B腿—缺受税来源A腿"
            r["证据等级"] = "C+/B-"
        else:
            r["路线判定"] = "台湾目的地误纳，剔除大陆分析"
            r["证据等级"] = "排除"

    # Reuse fully audited prior POM master only as historical/direct baseline.
    old_path = ROOT / "06_共聚聚甲醛（POM）" / "POM_易迅跨查询逐票标准化.csv"
    old = pd.read_csv(old_path, dtype=str).fillna("")
    hist = old[(old["destination"] == "China") & old["origin"].isin(["South Korea", "Malaysia", "Thailand"])].copy()
    hist_rows = hist.to_dict("records")
    hist_by_origin = []
    for origin, g in hist.groupby("origin"):
        hist_by_origin.append({"平台原产国地区": origin, "记录数": int(len(g)), "物量代理合计": float(pd.to_numeric(g["mass_proxy"], errors="coerce").fillna(0).sum()), "最早日期": g["date"].min(), "最晚日期": g["date"].max()})

    # Current high value candidates: mainland candidates, excluding obvious modified/recycled/noise.
    high = [r for r in mainland if r["证据等级"] in {"B+", "B", "C+/B-"}]
    high.sort(key=lambda r: (r["证据等级"], num(r["物量代理"])), reverse=True)
    cols = ["record_id", "query_id", "query_row", *KEY_COLS, "原产标记", "品牌穿透", "范围初筛", "物量代理", "物量口径", "路线判定", "证据等级", "equivalent_occurrences", "source_file"]
    write_csv(out / "POM27_易迅逐票标准化.csv", unique, cols)
    write_csv(out / "POM27_重复审计.csv", duplicate_rows(groups))
    write_csv(out / "POM27_大陆重点线索.csv", high, cols)
    write_csv(out / "POM27_历史受税来源直达57条.csv", hist_rows)
    summary = {
        "item": 27,
        "product": "共聚聚甲醛（2017措施：韩国、泰国、马来西亚）",
        "query": obj.get("filters", {}),
        "raw_rows": len(rows),
        "exact_unique": len(unique),
        "duplicate_extra": len(rows) - len(unique),
        "mainland_unique": len(mainland),
        "taiwan_misincluded_unique": len(taiwan),
        "current_origin_counts_mainland": aggregate(mainland, "平台原产国地区"),
        "current_scope_counts_mainland": aggregate(mainland, "范围初筛"),
        "current_taxed_origin_direct": sum(r["平台原产国地区"] in {"South Korea", "Korea", "Thailand", "Malaysia"} for r in mainland),
        "current_marker_taxed_origin_b_leg": sum(r["原产标记"] in {"KR", "TH", "MY"} for r in mainland),
        "current_kocetal_k700_vietnam_b_leg": sum(bool(r["品牌穿透"]) for r in mainland),
        "historical_taxed_origin_direct_rows": len(hist_rows),
        "historical_taxed_origin_by_origin": hist_by_origin,
        "finding": "当前近一年POLYACETAL关键词结果未见韩国、泰国、马来西亚平台原产直达中国，也未见#&KR/#&TH/#&MY标记；但2026-06-27越南→中国一条货描出现KOCEAL K700 Black（高度疑似韩国可隆KOCETAL K700），数量字段5、金额字段130,555，是具体品牌穿透B腿线索。未取得同批韩国→越南A腿，不能闭环。历史底表另有57条受税来源直达，日期集中于2024年。",
        "limitations": ["关键词查询不是HS390710全量；平台将台湾目的地纳入China，已单独剔除", "改性、再生、均聚/共聚需COA和配方确认", "平台原产字段不是中国法定原产地申报"]
    }
    write_json(out / "POM27_分析摘要.json", summary)
    return summary


def analyze_28():
    out = ROOT / "28_偏二氯乙烯-氯乙烯共聚树脂"
    china_f = out / "PVDC28_易迅_HS390450_中国_近一年_全17条.json"
    china_obj = load_json_any(china_f)
    rows = rows_from_obj(china_obj, china_obj.get("query_id", "PVDC28-HS390450-CHINA-1Y"), china_f.name)
    for p in sorted(out.glob("PVDC28_易迅_HS390450_越南_近一年_第*页*条.json")):
        obj = load_json_any(p)
        rows.extend(rows_from_obj(obj, obj.get("query_id", "PVDC28-HS390450-VIETNAM-WIDE-1Y"), p.name))
    unique, groups = norm_rows(rows)
    china = [r for r in unique if r["目的国地区"] == "China"]
    vietnam = [r for r in unique if r["目的国地区"] == "Vietnam"]

    def pvdc_scope(r):
        d = r["商品描述"].upper()
        if any(x in d for x in ["VINYLIDENE CHLORIDE", "VINYLIDEN CLORUA", "PVDC", "KREHALON"]):
            return "PVDC/偏二氯乙烯聚合物候选"
        if "390450" in str(r["HS编码"]):
            return "税号候选—需单体比例/COA"
        return "范围外/噪声"

    for r in unique:
        r["范围初筛"] = pvdc_scope(r)
        r["原产标记"] = marker(r["商品描述"])
        mp, basis = mass_proxy(r)
        r["物量代理"], r["物量口径"] = mp, basis
        if r in china and r["平台原产国地区"] == "Japan":
            r["路线判定"], r["证据等级"] = "日本受税来源直达中国—核税款", "B"
        elif r in china and r["平台原产国地区"] == "Vietnam" and r["范围初筛"].startswith("PVDC"):
            r["路线判定"], r["证据等级"] = "越南B腿；Kureha链可与日本A腿交叉", "B+"
        elif r in vietnam and r["平台原产国地区"] == "Japan" and "KUREHA" in (r["供应商"] + r["采购商"]).upper() and r["范围初筛"].startswith("PVDC"):
            r["路线判定"], r["证据等级"] = "日本→Kureha Vietnam A腿", "B+"
        elif r in china:
            r["路线判定"], r["证据等级"] = "非日本来源直达；通常不适用本措施", "C/反证"
        else:
            r["路线判定"], r["证据等级"] = "越南宽池背景记录", "背景"

    b = [r for r in china if r["平台原产国地区"] == "Vietnam" and "KUREHA" in (r["供应商"] + r["采购商"]).upper()]
    a = [r for r in vietnam if r["平台原产国地区"] == "Japan" and "KUREHA" in (r["供应商"] + r["采购商"]).upper() and pvdc_scope(r).startswith("PVDC")]
    matches = []
    for br in b:
        bd = dt(br["日期"])
        for ar in a:
            ad = dt(ar["日期"])
            if bd and ad and 0 <= (bd - ad).days <= 120:
                matches.append({
                    "B_record_id": br["record_id"], "B日期": br["日期"], "B商品": br["商品描述"], "B数量字段": br["数量"], "B采购商": br["采购商"], "B供应商": br["供应商"],
                    "A_record_id": ar["record_id"], "A日期": ar["日期"], "A商品": ar["商品描述"], "A数量字段": ar["数量"], "A采购商": ar["采购商"], "A供应商": ar["供应商"], "间隔天数": (bd-ad).days,
                    "证据判断": "同集团实体+产品体系+时序；牌号/批号/柜号未闭合"
                })
    cols = ["record_id", "query_id", "query_row", *KEY_COLS, "原产标记", "范围初筛", "物量代理", "物量口径", "路线判定", "证据等级", "equivalent_occurrences", "source_file"]
    write_csv(out / "PVDC28_易迅逐票标准化.csv", unique, cols)
    write_csv(out / "PVDC28_重复审计.csv", duplicate_rows(groups))
    write_csv(out / "PVDC28_日本Kureha至越南A腿.csv", a, cols)
    write_csv(out / "PVDC28_越南Kureha至中国B腿.csv", b, cols)
    write_csv(out / "PVDC28_Kureha_AB时序匹配.csv", matches)
    summary = {
        "item": 28,
        "product": "偏二氯乙烯—氯乙烯共聚树脂",
        "query_coverage": {"china_hs390450_raw": 17, "vietnam_hs390450_raw": 469, "pages": "中国1页；越南3页（200+200+69）"},
        "raw_rows_combined": len(rows), "exact_unique": len(unique), "duplicate_extra": len(rows)-len(unique),
        "china_unique": len(china), "vietnam_unique": len(vietnam),
        "china_origin_counts": aggregate(china, "平台原产国地区"),
        "kureha_japan_to_vietnam_A_unique": len(a),
        "kureha_vietnam_to_china_B_unique": len(b),
        "ab_time_matches_120d": len(matches),
        "finding": "已证实日本Kureha→Kureha Vietnam的PVDC树脂输入与Kureha Vietnam→Kureha中国投资公司的PVDC/Krehalon compound输出同时存在，形成实体级A/B路线；但越南有PVDC compound和薄膜真实制造，且B腿货描标#&VN，尚无批次、柜号、中国报关原产地及税单，不能认定规避。",
        "limitations": ["HS390450越南宽池含非PVDC噪声，已按货描筛选", "数量/金额字段单位币种未在导出中显式给出", "需要BOM、工序、四位税目/原产地核定和中国报关底单"]
    }
    write_json(out / "PVDC28_分析摘要.json", summary)
    return summary


def analyze_29():
    out = ROOT / "29_干玉米酒糟"
    rows = []
    for p in [out / "DDGS29_易迅_DDGS_中国_近一年_全134条.json", out / "DDGS29_易迅_HS230330_中国_近一年_全101条.json"]:
        obj = load_json_any(p)
        rows.extend(rows_from_obj(obj, obj.get("query_id", p.stem), p.name))
    unique, groups = norm_rows(rows)
    mainland = [r for r in unique if r["目的国地区"] == "China"]
    taiwan = [r for r in unique if r["目的国地区"] != "China"]
    for r in unique:
        d = r["商品描述"].upper()
        r["范围初筛"] = "DDGS措施范围" if ("DDGS" in d or "DISTILLER" in d or str(r["HS编码"]).startswith("230330")) else "范围外/噪声"
        mp, basis = mass_proxy(r)
        r["物量代理"], r["物量口径"] = mp, basis
        if r["目的国地区"] != "China":
            r["路线判定"], r["证据等级"] = "台湾目的地误纳，剔除大陆分析", "排除"
        elif r["平台原产国地区"] == "United States":
            r["路线判定"], r["证据等级"] = "美国受税来源直达中国—同时核AD与CVD", "B"
        else:
            r["路线判定"], r["证据等级"] = "非美来源B腿—需追生产国/上游", "C+/B-"
    cols = ["record_id", "query_id", "query_row", *KEY_COLS, "范围初筛", "物量代理", "物量口径", "路线判定", "证据等级", "equivalent_occurrences", "source_file"]
    write_csv(out / "DDGS29_易迅跨查询逐票标准化.csv", unique, cols)
    write_csv(out / "DDGS29_重复审计.csv", duplicate_rows(groups))
    write_csv(out / "DDGS29_中国大陆记录.csv", mainland, cols)
    summary = {
        "item": 29, "product": "干玉米酒糟（DDGS）",
        "raw_rows_cross_query": len(rows), "exact_unique": len(unique), "duplicate_extra": len(rows)-len(unique),
        "mainland_unique": len(mainland), "taiwan_misincluded_unique": len(taiwan),
        "mainland_records": [{k:r.get(k,"") for k in ["日期","商品描述","采购商","供应商","重量","数量","金额","平台原产国地区","路线判定"]} for r in mainland],
        "finding": "两组全页结果大部分是台湾目的地被平台纳入China，剔除后中国大陆仅1条：2025-10-09 Tallgrass Commodities美国原产DDGS直达中国，重量字段23,524，未显示中国买方和金额。该票是核AD+CVD缴税的直接对象，不是第三国绕道证据；现有数据无第三国→中国B腿。",
        "tax_note": "美国原产DDGS同时存在反倾销税42.2%—53.7%和反补贴税11.2%—12.0%；实际税额必须以中国完税价格、生产商税档和缴款书计算。",
        "limitations": ["平台China筛选混入台湾，已剔除", "中国大陆唯一记录买方/金额空白，无法测算税额", "未取得美国→第三国与第三国→中国全链数据"]
    }
    write_json(out / "DDGS29_分析摘要.json", summary)
    return summary


def analyze_30():
    out = ROOT / "30_取向电工钢"
    rows = []
    obj = load_json_any(out / "GOES30_易迅_中国_近一年_三组查询.json")
    for q in obj.get("queries", []):
        rows.extend(rows_from_obj(q, q.get("query_id", "GOES30"), "GOES30_易迅_中国_近一年_三组查询.json"))
    a_obj = load_json_any(out / "GOES30_易迅_23JGSD080_日本至越南_近一年_全3条.json")
    rows.extend(rows_from_obj(a_obj, "GOES30-23JGSD080-JP-VN-1Y", "GOES30_易迅_23JGSD080_日本至越南_近一年_全3条.json"))
    unique, groups = norm_rows(rows)
    china = [r for r in unique if r["目的国地区"] == "China"]
    a = [r for r in unique if r["目的国地区"] == "Vietnam" and r["平台原产国地区"] == "Japan" and "23JGSD080" in r["商品描述"].upper()]
    b = [r for r in china if r["平台原产国地区"] == "Vietnam" and "23JGSD080" in r["商品描述"].upper()]
    for r in unique:
        d = r["商品描述"].upper()
        r["原产标记"] = marker(d)
        r["范围初筛"] = "GOES明确候选" if ("GRAIN ORIENTED" in d or "23JGSD080" in d or "ORIENTED SILICON" in d) else "税号/电工钢通用品名待核"
        mp, basis = mass_proxy(r)
        r["物量代理"], r["物量口径"] = mp, basis
        if r in a:
            r["路线判定"], r["证据等级"] = "日本JFE→越南JFE Shoji A腿", "A-事实/B+风险"
        elif r in b:
            r["路线判定"], r["证据等级"] = "越南JFE Shoji→中国B腿，#&JP保留日本来源", "A-事实/B+风险"
        elif r in china and r["平台原产国地区"] in {"Japan", "South Korea", "Korea"}:
            r["路线判定"], r["证据等级"] = "受税来源直达中国—核税/价格承诺", "B"
        elif r in china:
            r["路线判定"], r["证据等级"] = "第三国B腿—缺受税来源同牌号A腿", "C+/B-"
        else:
            r["路线判定"], r["证据等级"] = "背景记录", "背景"
    matches = []
    for br in b:
        bd = dt(br["日期"])
        for ar in a:
            ad = dt(ar["日期"])
            if bd and ad and 0 <= (bd-ad).days <= 300:
                matches.append({
                    "B_record_id":br["record_id"], "B日期":br["日期"], "B数量字段":br["数量"], "B采购商":br["采购商"], "B供应商":br["供应商"], "B商品":br["商品描述"],
                    "A_record_id":ar["record_id"], "A日期":ar["日期"], "A数量字段":ar["数量"], "A采购商":ar["采购商"], "A供应商":ar["供应商"], "A商品":ar["商品描述"], "间隔天数":(bd-ad).days,
                    "证据判断":"同牌号+集团实体+日本来源标记；无卷号/炉号/提单闭环，越南存在分条剪切加工"
                })
    cols = ["record_id", "query_id", "query_row", *KEY_COLS, "原产标记", "范围初筛", "物量代理", "物量口径", "路线判定", "证据等级", "equivalent_occurrences", "source_file"]
    write_csv(out / "GOES30_易迅跨查询逐票标准化.csv", unique, cols)
    write_csv(out / "GOES30_重复审计.csv", duplicate_rows(groups))
    write_csv(out / "GOES30_日本JFE至越南A腿3条.csv", a, cols)
    write_csv(out / "GOES30_越南JFE至中国B腿.csv", b, cols)
    write_csv(out / "GOES30_23JGSD080_AB时序匹配.csv", matches)
    third = [r for r in china if r["平台原产国地区"] not in {"Japan","South Korea","Korea","European Union"}]
    summary = {
        "item":30, "product":"取向电工钢",
        "raw_rows_cross_query":len(rows), "exact_unique":len(unique), "duplicate_extra":len(rows)-len(unique),
        "china_unique":len(china), "china_origin_counts":aggregate(china,"平台原产国地区"),
        "jfe_japan_to_vietnam_A_unique":len(a), "jfe_vietnam_to_china_B_unique":len(b), "ab_time_matches_300d":len(matches),
        "third_country_china_unique":len(third),
        "finding":"日本JFE Shoji Corporation→越南JFE Shoji Steel Hai Phong的23JGSD080输入3条，与越南JFE Shoji→中国同牌号输出4条（可见字段精确去重后）共同证明日本料经越南加工后发华；B腿货描均保留#&JP。该事实链为本项最强核查线索，但越南工厂具备分条、剪切等真实加工，且无卷号/炉号、中国原产申报和税单，未证明逃税。墨西哥、印度、瑞典等B腿未形成受税来源A腿闭环。",
        "limitations":["跨关键词/HS查询有重复，已按12可见字段去重", "平台原产字段与#&JP冲突不等于中国申报为越南原产", "数量金额字段单位币种未显式导出；需MTC、卷号、提单、加工工单、原产地核定和税单"]
    }
    write_json(out / "GOES30_分析摘要.json", summary)
    return summary


def main():
    summaries = [analyze_27(), analyze_28(), analyze_29(), analyze_30()]
    write_json(ROOT / "27-30项_易迅分析总摘要.json", {"generated_at":"2026-08-20", "items":summaries})
    print(json.dumps(summaries, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
