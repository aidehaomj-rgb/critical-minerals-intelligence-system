from __future__ import annotations

import csv
import os
from pathlib import Path


TRACKER = Path(os.environ["TRACKER_PATH"])

UPDATES = {
    "11": {
        "易迅税号查询": "HS290712全球宽池：7,072行，覆盖2023-01-02至2026-01-15，全量逐行完成",
        "易迅关键词查询": "CAS108-39-4及M-/META-CRESOL、3-METHYLPHENOL、多语种/错码二轮合并复核完成",
        "易迅页数": "1份下载工作簿/7,072行（非分页导出）",
        "易迅记录数": "原始7,072；全12字段唯一6,345；明确间甲酚1,414/1,259；对华6；受税来源→印度369；闭环0",
        "互联网实体检索": "完成：措施到期冲突、FINAR/ACETO/RON、Sasol→VDH、Mitsui/LANXESS、产能与原产规则；未发现公开违法闭环",
        "报告状态": "已完成：11_间甲酚（报告+逐票XLSX+CSV/JSON+分类纠偏审计）",
    },
    "12": {
        "易迅税号查询": "HS400270全球宽池：9,356行，覆盖2025-09-01至2026-08-05，全量逐行完成",
        "易迅关键词查询": "EPDM/三元乙丙橡胶、原胶/板片带颗粒、混炼改性/TPV/TPE及制品多语种全表反扫完成",
        "易迅页数": "1份下载工作簿/9,356行（非分页导出）",
        "易迅记录数": "原始9,356；全12字段唯一9,160；对华55；受税来源直达6；第三国对华49；HEXPOL A腿418/B腿4；闭环0",
        "互联网实体检索": "完成：现行复审与完整税率；南京海关‘0716’案；HEXPOL墨西哥双腿；沙特KEMYA/Petro Rabigh、巴西/日本等真实产能及品牌多工厂反证",
        "报告状态": "已完成：12_EPDM（报告+逐票XLSX+CSV/JSON；HEXPOL为B+调单线索，公开执法证实产品级风险，但第三国绕道和少缴税未闭环）",
    },
    "13": {
        "易迅税号查询": "HS391190两份近两年下载宽池：6,311+1,547行，全量逐行完成",
        "易迅关键词查询": "POLYPHENYLENE SULFIDE/PPS、CAS25212-74-2、牌号与多语种全表反扫完成",
        "易迅页数": "2份下载工作簿/合计7,858行（非分页导出）",
        "易迅记录数": "原始7,858；全12字段trim唯一6,726；空白等价唯一6,725；平台中国420中HDC目的国冲突314；纠偏非HDC106；Chao Ju9",
        "互联网实体检索": "完成：现行复审/全税率；HDC韩国工厂—Hwaseung越南真实配混；同票证实HDC记录返韩；Chao Ju候选映射；HS3911原产规则；未发现公开违法闭环",
        "报告状态": "已完成：13_PPS（17页报告+12表逐票XLSX+CSV/JSON；Chao Ju/E5060G为B+核单线索；HDC旧‘对华314条’已撤回纠偏；绕道和少缴税未证实）",
    },
    "14": {
        "易迅税号查询": "D盘现存文件全盘扫描完成；尚无HS29051210正丙醇原始逐票数据，需补易迅网页查询",
        "易迅关键词查询": "N-PROPANOL/1-PROPANOL/CAS71-23-8/NPA等本地内容扫描；42处命中逐条复核后目标贸易记录0，NPA多为NPA DE MEXICO企业名噪声",
        "易迅页数": "本地256个有效文件全盘扫描；网页页数待补",
        "易迅记录数": "本地确认正丙醇逐票记录0、待定0；仅代表D盘现存数据，不代表易迅网页无记录",
        "互联网实体检索": "完成：现行AD/CVD复审及完整税率；OQ/OXEA、Dow、Eastman区域销售链；BASF德国、Sasol南非、大连化工台湾/江苏真实产能反证；公开源未见专项绕道处罚",
        "报告状态": "阶段完成：14_正丙醇（11页数据缺口报告+256文件全盘审计+42处逐条复核+3组查询条件；本地目标记录0，不代表易迅网页无数据；待网页全页后定稿/逐票XLSX）",
    },
    "15": {
        "易迅税号查询": "D盘273个文件内容级预筛、75个候选逐行深扫完成；未发现HS29071110单体苯酚原始逐票底表",
        "易迅关键词查询": "PHENOL/苯酚/CAS108-95-2及衍生物排除；19,410处命中，25处重点逐条复核均排除",
        "易迅页数": "本地273个文件全盘扫描；网页全页待补",
        "易迅记录数": "本地确认单体苯酚逐票记录0；仅代表D盘现存数据，不代表易迅网页无记录",
        "互联网实体检索": "完成：现行完整税率；韩国/泰国→台湾宏观C+线索；INEOS新加坡、台湾、沙特、印度真实产能反证；未发现公开违法闭环",
        "报告状态": "阶段完成：15_苯酚（本地全盘审计+25处逐条复核+3组查询条件；本地目标记录0，待网页全页后定稿）",
    },
    "16": {
        "易迅税号查询": "D盘288个文件内容级预筛完成；22个涉案税号命中文件0，需补易迅网页Q1-Q3全页数据",
        "易迅关键词查询": "STAINLESS/BILLET/SLAB/HOT ROLLED/SSHR/HRC及中文同义词；27个宽词候选均非本项原始底表",
        "易迅页数": "本地288个文件全盘扫描；网页查询页持续搜索中，未形成可验证页数/零结果",
        "易迅记录数": "本地可确认第16项逐票记录0；仅为数据缺口，不代表易迅全库无记录",
        "互联网实体检索": "完成：现行措施/完整税率/POSCO价格承诺；印尼板坯→土耳其Çolakoğlu代工→欧盟实体链；司法状态、原产规则与真实加工反证",
        "报告状态": "阶段完成：16_不锈钢钢坯和热轧板卷（4页数据缺口报告+288文件盘点+3组查询矩阵；公开链不等于对华逃税，待易迅全页后定稿）",
    },
}


def main() -> None:
    with TRACKER.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        rows = list(reader)
        fields = list(reader.fieldnames or [])
    changed = []
    for row in rows:
        key = row.get("序号", "")
        if key in UPDATES:
            row.update(UPDATES[key])
            changed.append(key)
    if sorted(changed) != sorted(UPDATES):
        raise RuntimeError(f"Tracker rows not found: expected {sorted(UPDATES)}, got {sorted(changed)}")
    tmp = TRACKER.with_suffix(TRACKER.suffix + ".tmp")
    with tmp.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)
    os.replace(tmp, TRACKER)
    print(f"updated {TRACKER}: rows {changed}")


if __name__ == "__main__":
    main()
