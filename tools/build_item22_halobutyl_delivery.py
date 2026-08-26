from __future__ import annotations

import csv
import hashlib
import json
import shutil
from collections import Counter
from datetime import datetime
from pathlib import Path

from docx import Document
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Pt, RGBColor


ROOT = Path(r"D:\易迅数据\反倾销税深度分析报告")
SOURCE_DIR = ROOT / "01_卤化丁基橡胶"
OUT_DIR = ROOT / "22_卤化丁基橡胶_美国欧盟英国新加坡"
SOURCE_CSV = SOURCE_DIR / "卤化丁基橡胶_易迅逐票判定台账_合并去重.csv"
SOURCE_DOCX = SOURCE_DIR / "卤化丁基橡胶_反倾销税与第三国转运风险深度分析报告.docx"
OUT_DOCX = OUT_DIR / "第22项_卤化丁基橡胶_反倾销税与第三国转运风险深度分析报告.docx"
OUT_FULL_CSV = OUT_DIR / "第22项_卤化丁基橡胶_易迅逐票判定台账_合并去重5582条.csv"


EU_COUNTRIES = {
    "Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czech Republic",
    "Denmark", "Estonia", "Finland", "France", "Germany", "Greece", "Hungary",
    "Ireland", "Italy", "Latvia", "Lithuania", "Luxembourg", "Malta",
    "Netherlands", "Poland", "Portugal", "Romania", "Slovakia", "Slovenia",
    "Spain", "Sweden",
}
TAXED_ORIGINS = EU_COUNTRIES | {
    "United States", "ESTADOS UNIDOS", "Estados Unidos", "United Kingdom", "Singapore"
}


def load_rows() -> list[dict[str, str]]:
    with SOURCE_CSV.open("r", encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def num(value: str) -> float:
    try:
        return float(value or 0)
    except (TypeError, ValueError):
        return 0.0


def write_csv(path: Path, rows: list[dict[str, str]], fieldnames: list[str]) -> None:
    with path.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        w.writeheader()
        w.writerows(rows)


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def replace_para(paragraph, text: str) -> None:
    if paragraph.runs:
        paragraph.runs[0].text = text
        for r in paragraph.runs[1:]:
            r.text = ""
    else:
        paragraph.add_run(text)


def replace_cell(cell, text: str) -> None:
    p = cell.paragraphs[0]
    replace_para(p, text)
    for extra in cell.paragraphs[1:]:
        replace_para(extra, "")


def set_cell_text(cell, text: str, bold: bool = False, color: str | None = None,
                  size: float = 8.6, align=WD_ALIGN_PARAGRAPH.LEFT) -> None:
    cell.text = ""
    p = cell.paragraphs[0]
    p.alignment = align
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.line_spacing = 1.02
    r = p.add_run(text)
    r.bold = bold
    r.font.name = "Microsoft YaHei"
    r._element.get_or_add_rPr().rFonts.set(qn("w:eastAsia"), "Microsoft YaHei")
    r.font.size = Pt(size)
    if color:
        r.font.color.rgb = RGBColor.from_string(color)
    cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER


def shade(cell, fill: str) -> None:
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def set_repeat_table_header(row) -> None:
    tr_pr = row._tr.get_or_add_trPr()
    tbl_header = OxmlElement("w:tblHeader")
    tbl_header.set(qn("w:val"), "true")
    tr_pr.append(tbl_header)


def set_cant_split(row) -> None:
    tr_pr = row._tr.get_or_add_trPr()
    if tr_pr.find(qn("w:cantSplit")) is None:
        tr_pr.append(OxmlElement("w:cantSplit"))


def restyle_table(table, header_fill: str = "E8EEF5") -> None:
    if not table.rows:
        return
    set_repeat_table_header(table.rows[0])
    for c in table.rows[0].cells:
        shade(c, header_fill)
        for p in c.paragraphs:
            for r in p.runs:
                r.bold = True
                r.font.name = "Microsoft YaHei"
                r._element.get_or_add_rPr().rFonts.set(qn("w:eastAsia"), "Microsoft YaHei")
                r.font.size = Pt(8.5)
    for row in table.rows[1:]:
        set_cant_split(row)
        for c in row.cells:
            c.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            for p in c.paragraphs:
                p.paragraph_format.space_before = Pt(0)
                p.paragraph_format.space_after = Pt(0)
                p.paragraph_format.line_spacing = 1.02
                for r in p.runs:
                    r.font.name = "Microsoft YaHei"
                    r._element.get_or_add_rPr().rFonts.set(qn("w:eastAsia"), "Microsoft YaHei")
                    r.font.size = Pt(8.1)


def build_docx(summary: dict) -> None:
    shutil.copy2(SOURCE_DOCX, OUT_DOCX)
    doc = Document(OUT_DOCX)

    replace_para(doc.paragraphs[0], "卤化丁基橡胶｜第22项")
    replace_para(doc.paragraphs[1], "美国、欧盟、英国、新加坡反倾销税与第三国转运风险深度分析报告")

    replacements = {
        6: "本项与第1项属于同一商品、不同受税来源的两套并行措施。本报告复用已完成全页采集的同品数据池，按第22项美国、欧盟、英国和新加坡现行措施重新穿透。两种查询口径原始合计7,500条，按页面可见字段精确去重后5,582条；逐条判定为明确纳入3,206条、待核1,472条、排除904条。未发现受税来源经第三国进入中国的A/B腿闭环；发现英国、比利时原产直达中国9条、335,972.8kg，属于高优先级核税对象，但是否少缴税尚待中国报关单和税款缴款书确认。",
        8: "第22项现行措施适用于原产于美国、欧盟、英国和新加坡的卤化丁基橡胶（Chlorobutyl Rubber/Bromobutyl Rubber），中国税则号40023910、40023990。商务部2024年第32号公告自2024年8月20日起续征5年，预计至2029年8月19日。另案自2026年3月14日起对日本、加拿大原产同品征税；该并行措施属于第1项，不与本项税率混算。",
        9: "本项可能涉及的少缴税种为反倾销税，以及因反倾销税未计入进口增值税计税基础而产生的进口增值税差额。若进口增值税率为13%，仅就这两项的条件性综合差额系数为：美国75.5%×1.13=85.315%；阿朗新科比利时27.4%×1.13=30.962%；其他欧盟/英国71.9%×1.13=81.247%；阿朗新科新加坡23.1%×1.13=26.103%；其他新加坡45.2%×1.13=51.076%。正式税额只能以中国海关审定完税价格和实际生产商税档复算。",
        12: "数据复用说明：查询一为HS前6位400239，2025-08-06至2026-08-06，结果4,738条，页面设为200条/页后共24页，已读至末页138条；查询二为BROMOBUTYL，同期2,762条，共14页，已读至末页162条。两口径合计38页均已完整采集，按数据源、方向、日期、HS、货描、买卖双方、重量、数量、金额、目的地、原产地等页面可见字段精确去重。",
        15: "9条页面记录均为措施范围原料货描：英国平台原产7条、227,434.8kg；比利时平台原产2条、108,538kg。页面目的国字段为China，但部分采购商显示香港或境外主体，因此仍须以中国进口报关单确认是否实际进入中国关境。重点实体包括WEST PHARMACEUTICAL SERVICES、ARCHILINKS TRANSPAC LIMITED、SINOCHEM PLASTICS CO., LTD、RAVAGO DISTRIBUTION CENTER NV、JIUCHUAN INTERNATIONAL (HK) CO.，以及EXXONMOBIL CHEMICAL ASIA PACIFIC、ELITE PALOUME EXXONMOBIL、RAVAGO HONG KONG LIMITED。",
        16: "核查重点不是先假定绕道，而是核对法定原产地、实际生产商与税档。英国原产均适用71.9%；比利时原产只有ARLANXEO Belgium NV生产时才适用27.4%，其他欧盟生产商适用71.9%。RAVAGO是贸易/分销主体，不能仅凭其名称套用列名生产商低税率。现有记录均缺中国完税价格，不能测算实际少缴税额。",
        19: "关键词查询识别31条平台标示沙特原产、目的国China的EXXON BROMOBUTYL 2222/2255记录，重量字段合计5,063,218.02kg，买卖双方字段均为Exxon Mobil Corporation。SABIC公开的KEMYA在产证书明确其朱拜勒工厂制造Bromobutyl Rubber；ExxonMobil资料亦说明沙特合资装置生产halobutyl并由ExxonMobil营销。现有5,582条底表中没有美国、欧盟、英国或新加坡先进入沙特的措施范围A腿，因而当前证据更支持沙特真实生产/集团销售，而非受税来源换产地。仍应调KEMYA工厂批次、COA、沙特非优惠原产证和中国报关原产国闭环。",
        22: "排除药用胶塞等制成品后，印度至中国只剩1条原料样品：2025-10-15，CIIR IMPRAMER C 1139，数量字段10、金额字段25，Reliance Sibur Elastomers Private Limited发往SIBUR INTERNATIONAL TRADING (SHANGH...)。印度既不属于第22项受税来源，2026年另案亦已因进口量可忽略而终止调查；该条不形成第22项逃税风险。",
        24: "按第22项受税来源重新筛选，受税来源流向非中国目的地共有2,662条（明确纳入1,990、待核672），集中流向印度633、墨西哥549、越南331、比利时238、印尼238等。对华端仅见沙特31条和印度1条范围原料记录；两端未出现同一第三国实体、同一牌号、相容时序/数量、同提单或同箱号闭合。商务部期终复审确认埃克森美孚通过关联贸易商向中国非关联客户销售，这属于官方确认的商业链，并不等同物理转运或违法。公开检索亦未发现中国海关处罚、法院判决或商务部反规避裁定披露本品经第三国逃避本项反倾销税的具体链路。",
        27: "1. 已证实：两个查询口径38页均已读完；英国/比利时直达中国字段记录9条、335,972.8kg；沙特对华字段记录31条、5,063,218.02kg；第22项受税来源流向非中国目的地2,662条。",
        28: "2. 高优先级核税线索：9条直达字段记录须核中国报关单、生产商和税款书；这不等于已经少缴反倾销税。平台原产地和目的国字段均不能替代中国海关法定申报字段。",
        29: "3. 未证实：没有美国/欧盟/英国/新加坡→第三国→中国的同批、同箱、同提单或物料数量闭环；未发现公开执法文书披露具体第三国绕道实体、口岸或报关行。",
        30: "4. 强反证：沙特KEMYA具备溴化丁基橡胶实际生产；ARLANXEO新加坡和加拿大均有真实产能；同一集团、品牌或销售主体跨国出现不能直接推定货物原产于受税国。印度原料样品不属于第22项受税来源。",
        31: "5. 局限：易迅数据覆盖多国来源但不等同中国海关全量；记录缺中国进口报关单号、法定原产地、生产商、完税价格、税款书、口岸、提单号/箱号等字段；金额/数量口径和币种不统一，不能替代正式计税资料。",
        33: "调取9条对应的中国进口报关单或核实其是否实际进入中国关境：10位商品编号、规格型号、原产国、启运国、境外发货人、境内收货人/消费使用单位、申报企业、口岸、完税价格和征免性质。",
        34: "调取反倾销税和进口环节增值税税款缴款书；英国按71.9%核，比利时先穿透实际生产商，再在27.4%与71.9%之间选档复算。",
        35: "核验RAVAGO两条贸易链的原产地证、生产商声明、COA/批次、包装唛头、采购合同、商业发票和付款受益人，防止将贸易商误当列名生产商。",
        36: "对2,662条A腿中的重点第三国按30/60/90日窗口调取提单号、箱号、封志号、船名航次、装卸港及第三国进口/再出口申报，只有与中国B腿闭合后才能升级为绕道证据。",
        37: "对沙特31条核对KEMYA朱拜勒工厂生产批次、COA plant code、沙特非优惠原产证、中国报关原产国和集团内发票；若可对应，应将该路线从绕道核查池排除。",
        40: "1. 《第22项_卤化丁基橡胶_易迅逐票判定台账_合并去重5582条.csv》：复用同品全页数据并完整保留每条判定，不与第1项重复采集。",
        41: "2. 《第22项_受税来源直达中国9条.csv》《第22项_沙特对华31条.csv》《第22项_受税来源流向第三国2662条.csv》：第22项专属路线明细。",
        42: "3. 《第22项_交付摘要.json》《第22项_查询与数据复用说明.json》：查询完整性、政策口径、数量、证据等级和数据边界。",
    }
    for idx, text in replacements.items():
        replace_para(doc.paragraphs[idx], text)

    # Metadata table
    t0 = doc.tables[0]
    meta = [
        ("项目", "第22项（AD-22）｜美国、欧盟、英国、新加坡措施"),
        ("查询平台", "易迅数据（复用同品38页完整采集）"),
        ("数据期", "2025-08-06至2026-08-06"),
        ("查询口径", "HS 400239；关键词 BROMOBUTYL"),
        ("全量范围", "HS 24页/4,738条；关键词14页/2,762条；去重5,582条"),
        ("报告日期", "2026-08-13"),
        ("保密提示", "仅供内部风险研判和后续执法核查，不作为直接定案依据"),
    ]
    while len(t0.rows) < len(meta) + 1:
        t0.add_row()
    for i, (a, b) in enumerate(meta, start=1):
        replace_cell(t0.cell(i, 0), a)
        replace_cell(t0.cell(i, 1), b)

    replace_cell(doc.tables[1].cell(0, 0),
                 "核心结论\n未形成美国、欧盟、英国或新加坡经第三国绕道进入中国的具体证据。9条英国/比利时原产、目的国China的记录是高优先级核税线索，涉及335,972.8kg；如未缴税，可能少缴的是反倾销税及其引致的进口增值税差额。沙特31条存在真实产能强反证，不宜认定绕道。")

    t2 = doc.tables[2]
    risk_rows = [
        ["风险事项", "数量/规模", "结论", "证据等级"],
        ["受税来源直达中国字段记录", "9条，335,972.8kg", "优先核实是否实际入境及是否足额缴AD/VAT", "A-核税线索；非逃税实证"],
        ["沙特原产进入中国字段记录", "31条，5,063,218.02kg", "KEMYA有真实溴化丁基产能，暂无受税A腿", "低风险/强反证"],
        ["印度原产进入中国原料", "1条样品，数量10/金额25", "印度非本项受税来源", "低风险"],
        ["第22项受税来源→非中国", "2,662条（纳入1,990/待核672）", "存在转贸条件但0条A/B闭环", "背景流量/C级"],
        ["并行措施", "日本、加拿大另案自2026-03-14征税", "同品数据共用，税率与本项分开", "口径提示"],
    ]
    while len(t2.rows) < len(risk_rows):
        t2.add_row()
    for r, vals in enumerate(risk_rows):
        for c, val in enumerate(vals):
            set_cell_text(t2.cell(r, c), val, bold=(r == 0), size=8.2)

    t3 = doc.tables[3]
    tax_rows = [
        ["来源/企业", "现行AD税率", "AD+13%VAT增量系数"],
        ["美国：埃克森美孚及其他", "75.5%", "85.315%×完税价格"],
        ["欧盟：ARLANXEO Belgium NV", "27.4%", "30.962%×完税价格"],
        ["欧盟：其他生产商", "71.9%", "81.247%×完税价格"],
        ["英国：ExxonMobil Chemical Limited及其他", "71.9%", "81.247%×完税价格"],
        ["新加坡：ARLANXEO Singapore Pte. Ltd.", "23.1%", "26.103%×完税价格"],
        ["新加坡：其他生产商", "45.2%", "51.076%×完税价格"],
        ["措施期限", "2024-08-20起续征5年", "预计至2029-08-19"],
    ]
    while len(t3.rows) < len(tax_rows):
        t3.add_row()
    while len(t3.rows) > len(tax_rows):
        t3._tbl.remove(t3.rows[-1]._tr)
    for r, vals in enumerate(tax_rows):
        for c, val in enumerate(vals):
            set_cell_text(t3.cell(r, c), val, bold=(r == 0), size=8.2)

    replace_cell(doc.tables[4].cell(0, 0),
                 "为何不把9条写成已逃税或给出金额\n现有记录无中国海关审定完税价格，也没有反倾销税缴款书；平台目的国和原产地字段不能代替中国报关单。只有确认货物实际进入中国关境、属于措施范围、生产商税档正确且未足额缴税后，才能计算少缴金额。公式：少缴AD=完税价格×适用税率；由AD增加的进口VAT差额≈少缴AD×13%。")

    # Direct-nine table: keep existing rows, tighten conclusion header.
    t5 = doc.tables[5]
    replace_cell(t5.cell(0, 6), "应核税率")
    for r in range(1, len(t5.rows)):
        origin = t5.cell(r, 5).text
        if origin == "United Kingdom":
            replace_cell(t5.cell(r, 6), "71.9%（须核已缴税）")
        elif origin == "Belgium":
            replace_cell(t5.cell(r, 6), "27.4%/71.9%（按生产商）")

    replace_cell(doc.tables[6].cell(0, 0),
                 "判定\n沙特路线有真实生产强反证，当前未发现受税来源先进入沙特的A腿，不能据Exxon品牌或集团主体认定规避。31条记录的主要剩余问题是平台目的国/主体映射与中国报关单是否一致。核得KEMYA批次及沙特非优惠原产证后，可进一步排除风险。")

    t7 = doc.tables[7]
    priorities = [
        ["优先级", "对象", "核查事项", "拟解决问题"],
        ["A", "英国/比利时9条", "中国报关单、生产商、原产证、AD及VAT税款书", "是否实际入境并足额缴税"],
        ["A", "RAVAGO相关2条/108,538kg", "穿透实际生产商、COA、批次与发票", "应按27.4%还是71.9%"],
        ["A", "英国Exxon相关7条/227,434.8kg", "核进口人、生产商、71.9%税款书", "英国税率是否执行"],
        ["B", "沙特31条/5,063,218.02kg", "KEMYA批次、沙特CO、中国报关原产国", "验证本地生产并排除转口"],
        ["C", "2,662条受税来源A腿", "30/60/90日同牌号、同箱号、同实体匹配", "寻找可闭合中国B腿"],
    ]
    while len(t7.rows) < len(priorities):
        t7.add_row()
    for r, vals in enumerate(priorities):
        for c, val in enumerate(vals):
            set_cell_text(t7.cell(r, c), val, bold=(r == 0), size=8.1)

    t8 = doc.tables[8]
    sources = [
        ["来源", "资料/链接", "用途"],
        ["易迅数据", "HS400239：4,738条/24页；BROMOBUTYL：2,762条/14页", "全球逐票底表及A/B腿筛查"],
        ["商务部2024年第32号公告", "https://www.mofcom.gov.cn/zcfb/zgdwjjmywg/art/2024/art_7f076a33af4047569631fdfb161457ad.html", "本项范围、税率、期限、关联贸易商事实"],
        ["商务部2018年第40号公告", "https://cacs.mofcom.gov.cn/cacscms/article/jkdc?articleId=155421&type=1", "原终裁产品范围和税率"],
        ["商务部2026年第15号公告", "https://cacs.mofcom.gov.cn/cacscms/article/jkdc?articleId=187465&type=1", "日本/加拿大并行措施、印度终止"],
        ["SABIC KEMYA在产证书", "https://www.sabic.com/en/Images/Al-Jubail%20Petrochemical%20Company%20%28KEMYA%29_tcm1010-42731.pdf", "沙特制造Bromobutyl Rubber反证"],
        ["ExxonMobil沙特项目资料", "https://www.exxonmobilchemical.com/-/media/project/wep/exxonmobil-chemicals/chemicals/bimsm/vogel_2017_kurt_aerts_interview_sustained_commitment_enpdf.pdf", "沙特halobutyl产线及营销权"],
        ["ARLANXEO产品手册", "https://www.arlanxeo.com/medias/ARLANXEO-Product-Brochure-Butadiene-and-Butyl-Rubber-2026.pdf", "加拿大/新加坡真实生产地及牌号"],
    ]
    while len(t8.rows) < len(sources):
        t8.add_row()
    for r, vals in enumerate(sources):
        for c, val in enumerate(vals):
            set_cell_text(t8.cell(r, c), val, bold=(r == 0), size=7.5)

    for table in doc.tables:
        restyle_table(table)

    # Keep heading styles and make Chinese rendering deterministic.
    for style_name in ["Normal", "Heading 1", "Heading 2", "Heading 3", "List Bullet"]:
        style = doc.styles[style_name]
        style.font.name = "Microsoft YaHei"
        style._element.get_or_add_rPr().rFonts.set(qn("w:eastAsia"), "Microsoft YaHei")

    # Explicit footer label.
    for section in doc.sections:
        section.header_distance = Pt(35.4)
        section.footer_distance = Pt(35.4)
        hp = section.header.paragraphs[0]
        replace_para(hp, "第22项｜卤化丁基橡胶反倾销税风险核查")
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        for r in hp.runs:
            r.font.size = Pt(8)
            r.font.color.rgb = RGBColor(100, 110, 120)

    doc.core_properties.title = "第22项 卤化丁基橡胶反倾销税与第三国转运风险深度分析报告"
    doc.core_properties.subject = "美国、欧盟、英国、新加坡措施；易迅数据全页逐票核查"
    doc.core_properties.author = ""
    doc.core_properties.keywords = "卤化丁基橡胶, 反倾销税, 第三国转运, 易迅数据"
    doc.save(OUT_DOCX)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    rows = load_rows()
    fields = list(rows[0].keys())

    direct = [
        r for r in rows
        if r["目的国地区"] == "China"
        and r["原产国地区"] in TAXED_ORIGINS
        and r["逐票判定"] == "纳入"
    ]
    saudi = [
        r for r in rows
        if r["目的国地区"] == "China"
        and r["原产国地区"] == "Saudi Arabia"
        and r["逐票判定"] == "纳入"
    ]
    india_raw = [
        r for r in rows
        if r["目的国地区"] == "China"
        and r["原产国地区"] == "India"
        and r["逐票判定"] == "纳入"
    ]
    a_legs = [
        r for r in rows
        if r["目的国地区"] != "China"
        and r["原产国地区"] in TAXED_ORIGINS
        and r["逐票判定"] in {"纳入", "待核"}
    ]

    assert len(rows) == 5582, len(rows)
    assert len(direct) == 9, len(direct)
    assert round(sum(num(r["重量数值"]) for r in direct), 2) == 335972.80
    assert len(saudi) == 31, len(saudi)
    assert round(sum(num(r["重量数值"]) for r in saudi), 2) == 5063218.02
    assert len(india_raw) == 1, len(india_raw)
    assert len(a_legs) == 2662, len(a_legs)
    assert sum(r["逐票判定"] == "纳入" for r in a_legs) == 1990
    assert sum(r["逐票判定"] == "待核" for r in a_legs) == 672

    shutil.copy2(SOURCE_CSV, OUT_FULL_CSV)
    write_csv(OUT_DIR / "第22项_受税来源直达中国9条.csv", direct, fields)
    write_csv(OUT_DIR / "第22项_沙特对华31条.csv", saudi, fields)
    write_csv(OUT_DIR / "第22项_印度对华原料样品1条.csv", india_raw, fields)
    write_csv(OUT_DIR / "第22项_受税来源流向第三国2662条.csv", a_legs, fields)

    summary = {
        "项目": "第22项（AD-22）卤化丁基橡胶—美国、欧盟、英国、新加坡措施",
        "生成时间": datetime.now().isoformat(timespec="seconds"),
        "政策": {
            "现行期限": "2024-08-20起续征5年，预计至2029-08-19",
            "税号": ["40023910", "40023990"],
            "税率": {
                "美国": "75.5%",
                "ARLANXEO Belgium NV": "27.4%",
                "其他欧盟": "71.9%",
                "英国": "71.9%",
                "ARLANXEO Singapore Pte. Ltd.": "23.1%",
                "其他新加坡": "45.2%",
            },
            "并行措施": "同品另有第1项日本/加拿大措施，自2026-03-14起；数据可共用，税率不得混算",
        },
        "易迅完整性": {
            "HS400239": {"原始条数": 4738, "页数": 24, "末页": 138},
            "BROMOBUTYL": {"原始条数": 2762, "页数": 14, "末页": 162},
            "原始合计": 7500,
            "可见字段精确去重": len(rows),
            "逐票判定": dict(Counter(r["逐票判定"] for r in rows)),
        },
        "第22项路线": {
            "受税来源直达中国": {
                "条数": len(direct),
                "重量字段合计": round(sum(num(r["重量数值"]) for r in direct), 2),
                "来源": dict(Counter(r["原产国地区"] for r in direct)),
                "结论": "高优先级核税线索，不是逃税实证；需中国报关单和税款书",
            },
            "沙特对华": {
                "条数": len(saudi),
                "重量字段合计": round(sum(num(r["重量数值"]) for r in saudi), 2),
                "结论": "KEMYA真实生产强反证，且未见受税来源→沙特A腿",
            },
            "印度对华范围原料": {
                "条数": len(india_raw),
                "结论": "印度非本项受税来源，仅样品记录",
            },
            "受税来源流向非中国": {
                "条数": len(a_legs),
                "纳入": sum(r["逐票判定"] == "纳入" for r in a_legs),
                "待核": sum(r["逐票判定"] == "待核" for r in a_legs),
                "主要目的地": dict(Counter(r["目的国地区"] for r in a_legs).most_common(15)),
            },
            "闭环结论": "0条可由现有字段闭合的受税来源→第三国→中国链",
        },
        "涉及税种": "仅在确认实际入境、措施范围、法定原产地、生产商税档及未缴税后，核反倾销税及其引致的进口VAT差额",
        "公开检索": "未发现中国海关处罚、法院判决或商务部反规避裁定披露本品经第三国逃避本项AD的具体链路",
        "关键缺口": [
            "中国进口报关单/法定原产国/生产商/完税价格",
            "反倾销税和进口VAT税款缴款书",
            "提单号、箱号、封志、船名航次、装卸港",
            "第三国进口与再出口申报、批次、COA、原产地证、工厂生产记录",
        ],
    }
    (OUT_DIR / "第22项_交付摘要.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    reuse = {
        "说明": "第1项和第22项为同一商品、不同受税来源的并行措施。易迅商品层数据池只采集一次，第22项按美国/欧盟/英国/新加坡重新筛选。",
        "共享源CSV": str(SOURCE_CSV),
        "共享源SHA256": sha256(SOURCE_CSV),
        "第22项副本": str(OUT_FULL_CSV),
        "第22项副本SHA256": sha256(OUT_FULL_CSV),
        "查询": [
            {"条件": "HS 400239；全球；2025-08-06至2026-08-06", "总数": 4738, "每页": 200, "页数": 24, "末页": 138, "状态": "已读完"},
            {"条件": "BROMOBUTYL；全球；2025-08-06至2026-08-06", "总数": 2762, "每页": 200, "页数": 14, "末页": 162, "状态": "已读完"},
        ],
        "去重规则": "按页面可见的全部23个字段精确去重；原始7,500条→5,582条",
    }
    (OUT_DIR / "第22项_查询与数据复用说明.json").write_text(
        json.dumps(reuse, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    build_docx(summary)

    qa = {
        "all_pass": True,
        "counts": {
            "full": len(rows), "direct": len(direct), "saudi": len(saudi),
            "india_raw": len(india_raw), "a_legs": len(a_legs),
        },
        "hash": {"source": sha256(SOURCE_CSV), "copy": sha256(OUT_FULL_CSV)},
        "docx_exists": OUT_DOCX.exists(),
    }
    qa["all_pass"] = qa["hash"]["source"] == qa["hash"]["copy"] and qa["docx_exists"]
    (OUT_DIR / "第22项_QA校验.json").write_text(
        json.dumps(qa, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(json.dumps({"out_dir": str(OUT_DIR), "docx": str(OUT_DOCX), **qa}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
