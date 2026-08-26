from __future__ import annotations

import hashlib
import json
import re
from collections import Counter, defaultdict
from pathlib import Path

import pandas as pd


ROOT = Path(r"D:\易迅数据")
OUT = ROOT / "反倾销税深度分析报告" / "10_聚苯醚"
OUT.mkdir(parents=True, exist_ok=True)

FILES = [
    ("中国进口", ROOT / "聚苯醚中国进口.xlsx"),
    ("美国出口", ROOT / "聚苯醚美国出口.xlsx"),
]
ORIGINAL_COLUMNS = ["数据源", "进出口", "日期", "HS编码", "商品描述", "采购商", "供应商", "重量", "数量", "金额", "目的国/地区", "原产国/地区"]


def text(value) -> str:
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return ""
    return str(value).strip()


def number(value):
    if value is None or text(value) == "":
        return None
    try:
        return float(str(value).replace(",", ""))
    except (TypeError, ValueError):
        return None


def norm(value) -> str:
    return re.sub(r"[^A-Z0-9]+", "", text(value).upper())


def stable_hash(parts) -> str:
    blob = "|".join(text(v) for v in parts)
    return hashlib.sha256(blob.encode("utf-8")).hexdigest()[:16]


def classify(desc: str):
    upper = desc.upper()
    if re.search(r"POLYPHENYLENE\s+SULF(?:IDE|HIDE)|\bPPS\b|\bRYTON\b", upper):
        return "明确排除", "聚苯硫醚PPS", "PPS不是聚苯醚PPE/PPO，属另一反倾销措施"
    if "456640" in upper and "PHENYLENEOXY" in upper:
        return "明确排除", "PEEK实验室聚合物", "Sigma 456640为PEEK，不是PPE/PPO"
    if "POLYPHENYLENE BA POLYMERS" in upper and "PHILLIPS 66" in upper:
        return "信息不足排除", "泛称Polyphenylene/疑似PPS", "货描未写ether/oxide且制造商Phillips 66存在PPS产品；外国HS39021040亦冲突，不能按PPE计入"
    if "CHỐT ĐỊNH VỊ" in upper and "POLYPHENYLENE" in upper:
        return "明确排除", "聚苯撑材料制塑料零件", "成品塑料定位销，不是初级形状PPE/PPO"

    recycled = any(token in upper for token in ("RECYC", "TÁI SINH", "TAI SINH"))
    # 墨西哥/拉美申报中同一聚苯醚存在大量连写、倒装和OCR变体。
    # 这些模式经过全表反向审计；避免只依赖标准英文而系统性漏判。
    spanish_or_lab_ppe = any((
        re.search(r"POLIFENILEN\s*E?TER|POLIFENIL\s+ETER", upper),
        re.search(r"POLIOXIFENILENO", upper),
        re.search(r"POLIOXIDO\s+(?:DE\s+)?(?:DIMETIL)?FENIL(?:O|ENO)", upper),
        re.search(r"POLI\s*(?:TER\s+)?OXID(?:O|IO)\s+DE\s+FENILENO", upper),
        re.search(r"POL\s+OXIDO\s+DE\s+FENILENO", upper),
        re.search(r"POLIETER(?:ES)?(?:\s+DE)?\s+FENILENO|ETER\s+POLIFENILENO", upper),
        re.search(r"POLIFENILENO\s+(?:ETHER|ETER)", upper),
        re.search(r"(?:RESINA|PLASTICO|POLIMERO|COPOLIMERO).*POLIFENILENO", upper),
        re.search(r"POLIFENILO\s+Y\s+POLIESTIRENO", upper),
        re.search(r"POLI\(2,6-DIMETIL-1,4-FENILENO", upper),
    ))
    relevant = any((
        re.search(r"POLYPHENYLENE\s*(?:ETHER|OXIDE)", upper),
        re.search(r"(?:POLI\s*OXIDO|POLIOXIDO)\s+DE\s+(?:FENILENO|FELINO)|ETER\s+DE\s+POLIFENILENO", upper),
        "NORYL" in upper,
        "XYRON" in upper,
        "WYRON" in upper and re.search(r"\b540Z\b", upper),
        re.search(r"\bMPPE\b|\bPPE\d", upper),
        spanish_or_lab_ppe,
        re.search(r"\bPPE\s*(?:/|\+|-)?\s*(?:PS|PA|NYLON|RESIN|PLASTIC|PELLET|POWDER|POLYMER|COMPOUND|RECYC)", upper),
        re.search(r"(?:RESIN|PLASTIC|PELLET|POWDER|POLYMER|COMPOUND|RECYC)\s*(?:/|\+|-)?\s*PPE\b", upper),
        # PPO is the long-used commercial abbreviation for polyphenylene oxide/ether.
        # The downloaded China pool contains many declarations such as
        # "PPO RECYCLE PELLET" and "PPO EN FORMAS PRIMARIAS" that do not spell
        # out the polymer name.  Treat a standalone PPO token as a scope hit;
        # PPS is excluded above before this branch.
        re.search(r"\bPPO\b", upper),
    ))
    if relevant:
        if recycled and "PA66" in upper:
            cls = "PA66+PPE再生组合物"
        elif recycled:
            cls = "再生PPE/PPO粒子"
        elif "XYRON" in upper or "WYRON" in upper or re.search(r"\b[ZX]552H\b", upper):
            cls = "XYRON改性PPE"
        elif "NORYL" in upper and "GTX" in upper:
            cls = "NORYL GTX（PPE+PA）"
        elif "NORYL" in upper and "PCN" in upper:
            cls = "NORYL PCN（改性PPE）"
        elif "NORYL" in upper and "PX" in upper:
            cls = "NORYL PX（改性PPE）"
        elif "NORYL" in upper:
            cls = "NORYL聚苯醚组合物"
        else:
            cls = "聚苯醚PPE/PPO"
        if recycled:
            return "范围待成分", cls, "货描明确PPE/PPO再生料，但聚合物含量、配方和中国归类待FTIR/DSC/TGA及申报资料确认"
        extra = "；西语连写/倒装或实验室系统命名经第二轮反向审计纳入" if spanish_or_lab_ppe else ""
        return "明确范围内", cls, "终裁范围包括PPE/PPO及其改性、与PS/尼龙等混合的组合物" + extra

    if "POLYETHYLENE GLYCOL" in upper or "CARBOWAX" in upper or "MACROGOL" in upper:
        return "明确排除", "聚乙二醇PEG", "不是聚苯醚"
    if "POLYOX" in upper or "POLYETHYLENE OXIDE" in upper:
        return "明确排除", "聚氧化乙烯PEO", "不是聚苯醚"
    if "POLYETHER POLYOL" in upper or "POLYOL" in upper:
        return "明确排除", "聚醚多元醇", "不是聚苯醚"
    if "PETROLEUM RESIN" in upper or "HYDROCARBON RESIN" in upper:
        return "明确排除", "石油/烃树脂", "不是聚苯醚"
    if upper.strip() == "":
        return "信息不足排除", "无商品描述", "无PPE/PPO/NORYL/XYRON产品描述，不能按同HS推定"
    return "明确排除", "其他聚醚/聚合物", "未出现PPE/PPO/NORYL/XYRON范围指纹"


def second_pass_variant(desc: str) -> bool:
    """标记第一次规则会漏、第二轮西语/系统名反扫补入的记录。"""
    upper = desc.upper()
    old_relevant = any((
        re.search(r"POLYPHENYLENE\s*(?:ETHER|OXIDE)", upper),
        re.search(r"(?:POLI\s*OXIDO|POLIOXIDO)\s+DE\s+(?:FENILENO|FELINO)|ETER\s+DE\s+POLIFENILENO", upper),
        "NORYL" in upper,
        "XYRON" in upper,
        re.search(r"\bMPPE\b|\bPPE\d", upper),
        re.search(r"\bPPE\s*(?:/|\+|-)?\s*(?:PS|PA|NYLON|RESIN|PLASTIC|PELLET|POWDER|POLYMER|COMPOUND|RECYC)", upper),
        re.search(r"(?:RESIN|PLASTIC|PELLET|POWDER|POLYMER|COMPOUND|RECYC)\s*(?:/|\+|-)?\s*PPE\b", upper),
        re.search(r"\bPPO\b", upper),
    ))
    if old_relevant or re.search(r"SULF|SULPH|\bPPS\b|RYTON|ISOCIAN|NITROFEN|TIOFENO", upper):
        return False
    return any((
        re.search(r"POLIFENILEN\s*E?TER|POLIFENIL\s+ETER", upper),
        re.search(r"POLIOXIFENILENO", upper),
        re.search(r"POLIOXIDO\s+(?:DE\s+)?(?:DIMETIL)?FENIL(?:O|ENO)", upper),
        re.search(r"POLI\s*(?:TER\s+)?OXID(?:O|IO)\s+DE\s+FENILENO|POL\s+OXIDO\s+DE\s+FENILENO", upper),
        re.search(r"POLIETER(?:ES)?(?:\s+DE)?\s+FENILENO|ETER\s+POLIFENILENO", upper),
        re.search(r"POLIFENILENO\s+(?:ETHER|ETER)", upper),
        re.search(r"(?:RESINA|PLASTICO|POLIMERO|COPOLIMERO).*POLIFENILENO", upper),
        re.search(r"POLIFENILO\s+Y\s+POLIESTIRENO", upper),
        re.search(r"POLI\(2,6-DIMETIL-1,4-FENILENO", upper),
    ))


def grade_from_desc(desc: str) -> str:
    upper = desc.upper()
    patterns = [
        r"\b(?:NORYL\s*)?(GTX\d+[A-Z0-9-]*)\b",
        r"\b(PCN\d+[A-Z0-9-]*)\b",
        r"\b(PX\d+[A-Z0-9-]*)\b",
        r"\b([XZ]\d{3}H)\b",
        r"\b(NH\d+[A-Z0-9-]*)\b",
        r"\b(GFN\d+[A-Z0-9-]*)\b",
        r"\b(\d{3}F?-\d{3}[A-Z]?)\b",
    ]
    for pattern in patterns:
        match = re.search(pattern, upper)
        if match:
            return match.group(1)
    return ""


def tail_origin(desc: str) -> str:
    matches = re.findall(r"#&([A-Z]{2})(?:\b|$)", desc.upper())
    return matches[-1] if matches else ""


def normalize_origin(value: str) -> str:
    v = norm(value)
    if v in {"UNITEDSTATES", "ESTADOSUNIDOS", "ESTADOSUNIDOSDENORTEAMERICA", "EEUU", "СОЕДИНЕННЫЕШТАТЫ"}:
        return "United States"
    return text(value)


records = []
for query_name, path in FILES:
    frame = pd.read_excel(path, sheet_name="数据列表")
    for row_no, raw in frame.iterrows():
        original = {col: raw.get(col) for col in ORIGINAL_COLUMNS}
        desc = text(original["商品描述"])
        scope, product_class, reason = classify(desc)
        date_val = pd.to_datetime(original["日期"], errors="coerce")
        date = date_val.strftime("%Y-%m-%d") if pd.notna(date_val) else text(original["日期"])
        visible = [date] + [text(original[col]) for col in ORIGINAL_COLUMNS if col != "日期"]
        sig = stable_hash([query_name] + visible)
        commercial_sig = stable_hash([
            date,
            norm(desc),
            norm(original["采购商"]),
            norm(original["供应商"]),
            text(original["重量"]),
            text(original["数量"]),
            text(original["金额"]),
            norm(original["目的国/地区"]),
            norm(original["原产国/地区"]),
        ])
        origin = normalize_origin(text(original["原产国/地区"]))
        destination = text(original["目的国/地区"])
        route = "范围外"
        evidence_grade = "排除"
        route_reason = reason
        if scope in {"明确范围内", "范围待成分"}:
            if query_name == "中国进口":
                route = f"{origin or '原产字段空'}→中国B腿"
                evidence_grade = "B"
                route_reason = "具体对华B腿成立；法定原产地、生产工厂和纳税状态待中国底单"
                if origin == "Vietnam" and "再生" in product_class:
                    evidence_grade = "C-范围/原产待核"
                    route_reason = f"越南再生PPE/PPO对华B腿（重量字段{text(original['重量']) or '空'}、数量字段{text(original['数量']) or '空'}）；原料、真实加工及A腿未闭合"
                elif "再生" in product_class:
                    evidence_grade = "C-范围/原产待核"
                    route_reason = f"再生PPE/PPO对华记录（重量字段{text(original['重量']) or '空'}、数量字段{text(original['数量']) or '空'}）；须先确认成分、原料与实质性加工"
                elif origin == "Vietnam" and tail_origin(desc) == "TH":
                    evidence_grade = "B-反证"
                    route_reason = "货描保留#&TH且SABIC在泰国有NORYL产能；更像泰国产经越南发华，仍需CO"
                elif origin == "Indonesia" and product_class == "XYRON改性PPE":
                    evidence_grade = "B-反证"
                    route_reason = "Asahi Kasei官方确认Nippisun在印尼受托生产Xyron改性PPE；合法印尼加工是强替代解释"
                elif origin == "Mexico" and "GTX" in desc.upper():
                    evidence_grade = "B"
                    route_reason = "NORYL GTX973对华B腿成立；无美国→墨西哥同牌号A腿，制造地与单位待核"
            else:
                route = f"美国来源字段→{destination or '目的地空'} A腿候选"
                evidence_grade = "B-供给背景"
                route_reason = "平台原产字段为美国的第三国流向；不能自动等同美国制造或后续对华转运"

        rec = {
            "record_id": f"PPE-{query_name}-{row_no + 2:05d}-{sig}",
            "query_file": path.name,
            "query_name": query_name,
            "query_row": int(row_no + 2),
            "visible_signature": sig,
            "commercial_signature": commercial_sig,
            "data_feed": text(original["数据源"]),
            "trade_direction": text(original["进出口"]),
            "date": date,
            "hs_code": text(original["HS编码"]),
            "description": desc,
            "buyer_or_consignee": text(original["采购商"]),
            "seller_or_shipper": text(original["供应商"]),
            "weight_field": text(original["重量"]),
            "quantity_field": text(original["数量"]),
            "amount_field": text(original["金额"]),
            "destination": destination,
            "platform_origin": origin,
            "tail_origin_mark": tail_origin(desc),
            "weight_num": number(original["重量"]),
            "quantity_num": number(original["数量"]),
            "amount_num": number(original["金额"]),
            "scope_screen": scope,
            "product_class": product_class,
            "grade": grade_from_desc(desc),
            "scope_reason": reason,
            "second_pass_variant": second_pass_variant(desc),
            "brand_typo_variant": bool("WYRON" in desc.upper() and re.search(r"\b540Z\b", desc.upper())),
            "route": route,
            "evidence_grade": evidence_grade,
            "route_reason": route_reason,
        }
        records.append(rec)


sig_counts = Counter(r["visible_signature"] for r in records)
commercial_counts = Counter(r["commercial_signature"] for r in records)
for r in records:
    r["visible_signature_count"] = sig_counts[r["visible_signature"]]
    r["possible_exact_visible_duplicate"] = sig_counts[r["visible_signature"]] > 1
    r["commercial_signature_count"] = commercial_counts[r["commercial_signature"]]
    r["possible_cross_feed_or_same_value_group"] = commercial_counts[r["commercial_signature"]] > 1


scope_records = [r for r in records if r["scope_screen"] in {"明确范围内", "范围待成分"}]
china_b = [r for r in scope_records if r["query_name"] == "中国进口"]
us_a = [r for r in scope_records if r["query_name"] == "美国出口"]


def unique_by(rows, key):
    seen = set()
    out = []
    for r in rows:
        if r[key] not in seen:
            seen.add(r[key])
            out.append(r)
    return out


scope_unique = unique_by(scope_records, "visible_signature")
b_unique = unique_by(china_b, "visible_signature")
a_unique = unique_by(us_a, "visible_signature")
a_commercial = unique_by(us_a, "commercial_signature")


def sum_field(rows, key):
    return float(sum((r[key] or 0) for r in rows))


def group_rows(rows, field):
    groups = defaultdict(list)
    for r in rows:
        groups[r[field] or "(空)"].append(r)
    out = []
    for name, values in groups.items():
        out.append({
            field: name,
            "records": len(values),
            "weight_field_sum": sum_field(values, "weight_num"),
            "quantity_field_sum": sum_field(values, "quantity_num"),
            "amount_field_sum": sum_field(values, "amount_num"),
        })
    return sorted(out, key=lambda x: (x["records"], x["quantity_field_sum"], x["weight_field_sum"]), reverse=True)


# A/B仅按牌号完全相同做机械筛查；空牌号不匹配。
grade_to_a = defaultdict(list)
for r in a_unique:
    if r["grade"]:
        grade_to_a[r["grade"]].append(r)
grade_matches = []
for b in b_unique:
    candidates = grade_to_a.get(b["grade"], []) if b["grade"] else []
    grade_matches.append({
        "b_record_id": b["record_id"],
        "b_date": b["date"],
        "b_origin": b["platform_origin"],
        "b_grade": b["grade"],
        "b_quantity_field": b["quantity_num"],
        "candidate_a_records": len(candidates),
        "candidate_a_destinations": sorted(set(r["destination"] for r in candidates)),
        "conclusion": "同牌号候选，仍需主体/批号/柜号" if candidates else "未找到美国来源同牌号A腿",
    })


# 再做“第三国进口实体=A腿收货人、B腿发货人”且货描完全相同的机械匹配。
# 该匹配比单纯国家流向更具体，但仍不等于同一批货：必须再有提单、柜号、批号或PO。
entity_desc_links = []
entity_desc_summary = []


def canonical_description(value: str) -> str:
    # 易迅4月9日HPP B腿把西语FENILENO误录为FELINO；仅用于匹配，原文仍完整保留。
    return norm(value).replace("FELINO", "FENILENO")


for b in b_unique:
    b_seller = norm(b["seller_or_shipper"])
    b_desc = canonical_description(b["description"])
    matches = []
    if b_seller and b_desc:
        for a in a_unique:
            if norm(a["buyer_or_consignee"]) != b_seller or canonical_description(a["description"]) != b_desc:
                continue
            a_date = pd.to_datetime(a["date"], errors="coerce")
            b_date = pd.to_datetime(b["date"], errors="coerce")
            if pd.isna(a_date) or pd.isna(b_date):
                continue
            days = int((b_date - a_date).days)
            if 0 <= days <= 365:
                aq, bq = a["quantity_num"], b["quantity_num"]
                matches.append({
                    "b_record_id": b["record_id"],
                    "b_date": b["date"],
                    "b_seller": b["seller_or_shipper"],
                    "b_buyer": b["buyer_or_consignee"],
                    "b_description": b["description"],
                    "b_quantity_field": bq,
                    "b_amount_field": b["amount_num"],
                    "a_record_id": a["record_id"],
                    "a_date": a["date"],
                    "a_buyer": a["buyer_or_consignee"],
                    "a_seller": a["seller_or_shipper"],
                    "a_destination": a["destination"],
                    "a_quantity_field": aq,
                    "a_amount_field": a["amount_num"],
                    "days_a_to_b": days,
                    "quantity_difference_abs": abs((aq or 0) - (bq or 0)) if aq is not None and bq is not None else None,
                    "same_entity": True,
                    "same_description": True,
                })
    matches.sort(key=lambda x: (x["days_a_to_b"], x["quantity_difference_abs"] if x["quantity_difference_abs"] is not None else 10**30))
    entity_desc_links.extend(matches)
    if matches:
        best = matches[0]
        if best["days_a_to_b"] == 0:
            grade = "B+实体同日同货描"
        elif best["days_a_to_b"] <= 7:
            grade = "B实体近邻同货描"
        elif best["days_a_to_b"] <= 30:
            grade = "B-实体窗口同货描"
        else:
            grade = "C+实体历史同货描"
        entity_desc_summary.append({
            "b_record_id": b["record_id"],
            "b_date": b["date"],
            "entity": b["seller_or_shipper"],
            "description": b["description"],
            "b_quantity_field": b["quantity_num"],
            "b_amount_field": b["amount_num"],
            "candidate_a_records_365d": len(matches),
            "best_a_record_id": best["a_record_id"],
            "best_a_date": best["a_date"],
            "best_a_seller": best["a_seller"],
            "best_a_quantity_field": best["a_quantity_field"],
            "best_a_amount_field": best["a_amount_field"],
            "minimum_days_a_to_b": best["days_a_to_b"],
            "evidence_grade": grade,
            "conclusion": "实体、货描和时间形成具体链路；尚缺同批/同柜/同PO及中国原产申报，不能认定绕道",
        })

# 关联名称线索：Flextronics两个墨西哥法律实体名称不同，不能作为精确实体闭环。
affiliate_links = []
for b in b_unique:
    if "FLEXTRONICS" not in norm(b["seller_or_shipper"]):
        continue
    b_date = pd.to_datetime(b["date"], errors="coerce")
    candidates = []
    for a in a_unique:
        if "FLEXTRONICS" not in norm(a["buyer_or_consignee"]):
            continue
        a_date = pd.to_datetime(a["date"], errors="coerce")
        if pd.isna(a_date) or pd.isna(b_date):
            continue
        days = int((b_date - a_date).days)
        if 0 <= days <= 90:
            candidates.append((days, a))
    if candidates:
        days, a = sorted(candidates, key=lambda x: x[0])[0]
        affiliate_links.append({
            "b_record_id": b["record_id"], "b_date": b["date"], "b_entity": b["seller_or_shipper"],
            "b_description": b["description"], "b_quantity_field": b["quantity_num"],
            "a_record_id": a["record_id"], "a_date": a["date"], "a_entity": a["buyer_or_consignee"],
            "a_description": a["description"], "a_quantity_field": a["quantity_num"], "days_a_to_b": days,
            "evidence_grade": "C+/B-关联实体品类窗口",
            "conclusion": "集团名称和品类接近，但法律实体、规格和数量不闭合",
        })


# 同期美国来源→越南/墨西哥的供给背景，仅按商业签名保守分组。
third_background = [r for r in a_commercial if r["destination"] in {"Vietnam", "Mexico", "Indonesia", "Philippines", "India"}]

summary = {
    "as_of": "2026-08-13",
    "stage_status": "两份已下载工作簿全部10,347行逐条审计；尚缺中国税号/关键词独立查询、双段提单与中国报关税单",
    "files": {
        "china_import": {"path": str(FILES[0][1]), "rows": sum(1 for r in records if r["query_name"] == "中国进口")},
        "us_export": {"path": str(FILES[1][1]), "rows": sum(1 for r in records if r["query_name"] == "美国出口")},
    },
    "all_rows": {
        "raw": len(records),
        "visible_unique": len(unique_by(records, "visible_signature")),
        "commercial_signature_unique": len(unique_by(records, "commercial_signature")),
        "date_min": min(r["date"] for r in records if r["date"]),
        "date_max": max(r["date"] for r in records if r["date"]),
    },
    "scope": {
        "raw": len(scope_records),
        "visible_unique": len(scope_unique),
        "excluded_or_insufficient": len(records) - len(scope_records),
        "screen_split_raw": dict(Counter(r["scope_screen"] for r in scope_records)),
        "screen_split_unique": dict(Counter(r["scope_screen"] for r in scope_unique)),
        "product_split_unique": dict(Counter(r["product_class"] for r in scope_unique)),
    },
    "china_b_legs": {
        "raw": len(china_b),
        "visible_unique": len(b_unique),
        "origin_split": group_rows(b_unique, "platform_origin"),
        "records": b_unique,
    },
    "us_origin_to_third_background": {
        "raw": len(us_a),
        "visible_unique": len(a_unique),
        "commercial_groups": len(a_commercial),
        "destination_split_commercial": group_rows(a_commercial, "destination"),
        "priority_destinations": group_rows(third_background, "destination"),
        "seller_split_priority": group_rows(third_background, "seller_or_shipper")[:20],
        "buyer_split_priority": group_rows(third_background, "buyer_or_consignee")[:20],
    },
    "a_b_grade_match": grade_matches,
    "a_b_exact_entity_description_links": {
        "linked_b_records": len(entity_desc_summary),
        "candidate_pairs": len(entity_desc_links),
        "summary": entity_desc_summary,
    },
    "a_b_affiliate_name_links": affiliate_links,
    "tax_rules": {
        "SHPP_US_LLC_ad_rate": 0.173,
        "other_us_company_ad_rate": 0.486,
        "import_vat_rate": 0.13,
        "SHPP_total_increment_coefficient": 0.173 * 1.13,
        "other_total_increment_coefficient": 0.486 * 1.13,
        "countervailing_measure": "2022年第2号终裁认定微量补贴并终止调查，不征反补贴税",
    },
    "evidence_conclusion": {
        "proved": f"{len(b_unique)}条中国进口池范围候选记录（其中再生料需成分复核），以及{len(a_unique)}条美国来源字段聚苯醚流向第三国的供应背景",
        "not_proved": f"虽存在HPP Mexico同日同实体同货描、Motores相邻日同实体同货描等具体链路，但{len(b_unique)}条中国端候选仍无同批/同柜/同PO闭环；缺中国法定原产地和税款书，故绕道与少缴税均未证实",
        "strong_legal_alternatives": "Nippisun印尼受托生产Xyron、SABIC泰国NORYL产能及#&TH标记为合法第三国产能反证",
    },
    "query_gaps": [
        "HS39072990→中国全页并按PPE/PPO产品描述逐条筛查",
        "POLYPHENYLENE ETHER/OXIDE、PPE/PPO RESIN、NORYL、XYRON及重点牌号独立全页",
        "美国→越南/墨西哥等A腿的提单号、柜号、批号和PO；中国进口报关单、CO和税款缴款书",
    ],
}


OUT.joinpath("聚苯醚_易迅逐票标准化.json").write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8")
pd.DataFrame(records).to_csv(OUT / "聚苯醚_易迅逐票标准化.csv", index=False, encoding="utf-8-sig")
pd.DataFrame(scope_records).to_csv(OUT / "聚苯醚_措施范围候选记录.csv", index=False, encoding="utf-8-sig")
pd.DataFrame([r for r in records if r["second_pass_variant"]]).to_csv(OUT / "聚苯醚_第二轮西语与系统名补漏144条.csv", index=False, encoding="utf-8-sig")
pd.DataFrame([r for r in records if r["brand_typo_variant"]]).to_csv(OUT / "聚苯醚_WYRON疑似XYRON补漏1条.csv", index=False, encoding="utf-8-sig")
pd.DataFrame(b_unique).to_csv(OUT / "聚苯醚_中国进口范围候选全量.csv", index=False, encoding="utf-8-sig")
pd.DataFrame(a_unique).to_csv(OUT / "聚苯醚_美国来源第三国A腿候选.csv", index=False, encoding="utf-8-sig")
pd.DataFrame(grade_matches).to_csv(OUT / "聚苯醚_AB牌号匹配审计.csv", index=False, encoding="utf-8-sig")
pd.DataFrame(entity_desc_links).to_csv(OUT / "聚苯醚_AB同实体同货描候选明细.csv", index=False, encoding="utf-8-sig")
pd.DataFrame(entity_desc_summary).to_csv(OUT / "聚苯醚_AB同实体同货描链路摘要.csv", index=False, encoding="utf-8-sig")
pd.DataFrame(affiliate_links).to_csv(OUT / "聚苯醚_AB关联实体窗口线索.csv", index=False, encoding="utf-8-sig")

duplicate_rows = []
for sig, count in sig_counts.items():
    if count > 1:
        sample = next(r for r in records if r["visible_signature"] == sig)
        duplicate_rows.append({"type": "可见字段完全重复", "signature": sig, "count": count, "sample_record_id": sample["record_id"], "date": sample["date"], "description": sample["description"]})
for sig, count in commercial_counts.items():
    if count > 1:
        sample = next(r for r in records if r["commercial_signature"] == sig)
        duplicate_rows.append({"type": "跨数据源/方向同商业字段", "signature": sig, "count": count, "sample_record_id": sample["record_id"], "date": sample["date"], "description": sample["description"]})
pd.DataFrame(duplicate_rows).to_csv(OUT / "聚苯醚_重复与镜像审计.csv", index=False, encoding="utf-8-sig")

OUT.joinpath("聚苯醚_全量阶段审计.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps({
    "out": str(OUT),
    "all_raw": len(records),
    "scope_raw": len(scope_records),
    "scope_unique": len(scope_unique),
    "b_unique": len(b_unique),
    "a_unique": len(a_unique),
    "a_commercial": len(a_commercial),
    "grade_matches_with_candidates": sum(1 for x in grade_matches if x["candidate_a_records"]),
    "entity_description_linked_b_records": len(entity_desc_summary),
    "entity_description_candidate_pairs": len(entity_desc_links),
}, ensure_ascii=False, indent=2))
