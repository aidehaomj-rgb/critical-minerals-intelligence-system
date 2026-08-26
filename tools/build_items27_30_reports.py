from __future__ import annotations

import csv
import json
from pathlib import Path
from typing import Iterable

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.style import WD_STYLE_TYPE
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK, WD_COLOR_INDEX
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Inches, Pt, RGBColor


ROOT = Path(r"D:\易迅数据\反倾销税深度分析报告")
ASOF = "2026年8月20日"
NAVY = "16324F"
BLUE = "246B91"
TEAL = "168A84"
GOLD = "D99B2B"
RED = "B2483C"
LIGHT = "EDF4F7"
PALE = "F7F9FB"
MID = "D4E1E8"
WHITE = "FFFFFF"
TEXT = "20303C"
MUTED = "60717D"


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def read_csv(path: Path):
    if not path.exists():
        return []
    with path.open(encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def set_cell_shading(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def set_cell_margins(cell, top=80, start=90, bottom=80, end=90):
    tc = cell._tc
    tc_pr = tc.get_or_add_tcPr()
    tc_mar = tc_pr.first_child_found_in("w:tcMar")
    if tc_mar is None:
        tc_mar = OxmlElement("w:tcMar")
        tc_pr.append(tc_mar)
    for m, v in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        node = tc_mar.find(qn(f"w:{m}"))
        if node is None:
            node = OxmlElement(f"w:{m}")
            tc_mar.append(node)
        node.set(qn("w:w"), str(v))
        node.set(qn("w:type"), "dxa")


def set_repeat_table_header(row):
    tr_pr = row._tr.get_or_add_trPr()
    tbl_header = OxmlElement("w:tblHeader")
    tbl_header.set(qn("w:val"), "true")
    tr_pr.append(tbl_header)


def set_keep_with_next(paragraph, value=True):
    p_pr = paragraph._p.get_or_add_pPr()
    node = p_pr.find(qn("w:keepNext"))
    if value and node is None:
        node = OxmlElement("w:keepNext")
        p_pr.append(node)
    elif not value and node is not None:
        p_pr.remove(node)


def add_page_number(paragraph):
    run = paragraph.add_run()
    fld_char1 = OxmlElement("w:fldChar")
    fld_char1.set(qn("w:fldCharType"), "begin")
    instr_text = OxmlElement("w:instrText")
    instr_text.set(qn("xml:space"), "preserve")
    instr_text.text = " PAGE "
    fld_char2 = OxmlElement("w:fldChar")
    fld_char2.set(qn("w:fldCharType"), "end")
    run._r.append(fld_char1)
    run._r.append(instr_text)
    run._r.append(fld_char2)


def add_hyperlink(paragraph, text, url, color=BLUE, underline=True):
    part = paragraph.part
    rid = part.relate_to(url, "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink", is_external=True)
    hyperlink = OxmlElement("w:hyperlink")
    hyperlink.set(qn("r:id"), rid)
    run = OxmlElement("w:r")
    rpr = OxmlElement("w:rPr")
    c = OxmlElement("w:color")
    c.set(qn("w:val"), color)
    rpr.append(c)
    if underline:
        u = OxmlElement("w:u")
        u.set(qn("w:val"), "single")
        rpr.append(u)
    run.append(rpr)
    text_el = OxmlElement("w:t")
    text_el.text = text
    run.append(text_el)
    hyperlink.append(run)
    paragraph._p.append(hyperlink)
    return hyperlink


def add_run_cn(paragraph, text, bold=False, size=None, color=None):
    run = paragraph.add_run(text)
    run.bold = bold
    if size:
        run.font.size = Pt(size)
    if color:
        run.font.color.rgb = RGBColor.from_string(color)
    run.font.name = "Aptos"
    run._element.rPr.rFonts.set(qn("w:eastAsia"), "微软雅黑")
    return run


def setup_doc(item, short_title):
    doc = Document()
    sec = doc.sections[0]
    sec.page_width = Cm(21)
    sec.page_height = Cm(29.7)
    sec.top_margin = Cm(1.8)
    sec.bottom_margin = Cm(1.7)
    sec.left_margin = Cm(1.8)
    sec.right_margin = Cm(1.8)
    sec.header_distance = Cm(0.7)
    sec.footer_distance = Cm(0.7)

    styles = doc.styles
    normal = styles["Normal"]
    normal.font.name = "Aptos"
    normal._element.rPr.rFonts.set(qn("w:eastAsia"), "微软雅黑")
    normal.font.size = Pt(9.5)
    normal.font.color.rgb = RGBColor.from_string(TEXT)
    normal.paragraph_format.space_after = Pt(4)
    normal.paragraph_format.line_spacing = 1.12

    for name, size, color in [("Title", 24, NAVY), ("Heading 1", 15, NAVY), ("Heading 2", 11.5, BLUE), ("Heading 3", 10, TEAL)]:
        s = styles[name]
        s.font.name = "Aptos Display"
        s._element.rPr.rFonts.set(qn("w:eastAsia"), "微软雅黑")
        s.font.size = Pt(size)
        s.font.color.rgb = RGBColor.from_string(color)
        s.font.bold = True
        s.paragraph_format.space_before = Pt(8 if name != "Title" else 0)
        s.paragraph_format.space_after = Pt(4)
        s.paragraph_format.keep_with_next = True

    if "Small Note" not in [s.name for s in styles]:
        s = styles.add_style("Small Note", WD_STYLE_TYPE.PARAGRAPH)
        s.font.name = "Aptos"
        s._element.rPr.rFonts.set(qn("w:eastAsia"), "微软雅黑")
        s.font.size = Pt(8)
        s.font.color.rgb = RGBColor.from_string(MUTED)
        s.paragraph_format.space_after = Pt(2)
        s.paragraph_format.line_spacing = 1.05

    header = sec.header
    p = header.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    add_run_cn(p, f"反倾销税深度核查 · ITEM {item:02d}  |  {short_title}", bold=True, size=8.5, color=NAVY)
    p_border = OxmlElement("w:pBdr")
    bottom = OxmlElement("w:bottom")
    bottom.set(qn("w:val"), "single")
    bottom.set(qn("w:sz"), "10")
    bottom.set(qn("w:space"), "3")
    bottom.set(qn("w:color"), TEAL)
    p_border.append(bottom)
    p._p.get_or_add_pPr().append(p_border)

    footer = sec.footer
    fp = footer.paragraphs[0]
    fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    add_run_cn(fp, "内部核查材料｜证据分级基于公开来源与易迅可见字段｜第 ", size=7.5, color=MUTED)
    add_page_number(fp)
    add_run_cn(fp, " 页", size=7.5, color=MUTED)
    return doc


def add_masthead(doc, item, title, subtitle, rating, rating_color):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(8)
    add_run_cn(p, f"ITEM {item:02d}  /  TRADE REMEDY REVIEW", bold=True, size=8.5, color=TEAL)
    p = doc.add_paragraph(style="Title")
    p.paragraph_format.space_after = Pt(3)
    add_run_cn(p, title, bold=True, size=24, color=NAVY)
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(11)
    add_run_cn(p, subtitle, size=11, color=MUTED)

    table = doc.add_table(rows=1, cols=3)
    set_repeat_table_header(table.rows[0])
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    widths = [Cm(5.4), Cm(5.4), Cm(5.4)]
    vals = [("风险评级", rating), ("核查日期", ASOF), ("分析口径", "易迅全页逐票 + 公开源深检")]
    for i, ((label, value), width) in enumerate(zip(vals, widths)):
        cell = table.cell(0, i)
        cell.width = width
        set_cell_shading(cell, rating_color if i == 0 else LIGHT)
        set_cell_margins(cell, 110, 130, 110, 130)
        p = cell.paragraphs[0]
        add_run_cn(p, label + "\n", bold=True, size=8, color=WHITE if i == 0 else MUTED)
        add_run_cn(p, value, bold=True, size=10.5, color=WHITE if i == 0 else NAVY)
    doc.add_paragraph()


def add_section(doc, title):
    p = doc.add_paragraph(style="Heading 1")
    add_run_cn(p, title, bold=True, size=15, color=NAVY)
    return p


def add_subsection(doc, title):
    p = doc.add_paragraph(style="Heading 2")
    add_run_cn(p, title, bold=True, size=11.5, color=BLUE)
    return p


def add_body(doc, text, bold_prefix=None):
    p = doc.add_paragraph()
    if bold_prefix and text.startswith(bold_prefix):
        add_run_cn(p, bold_prefix, bold=True)
        add_run_cn(p, text[len(bold_prefix):])
    else:
        add_run_cn(p, text)
    return p


def add_bullets(doc, items, level=0):
    for text in items:
        p = doc.add_paragraph(style="List Bullet" if level == 0 else "List Bullet 2")
        p.paragraph_format.left_indent = Cm(0.65 + level * 0.4)
        p.paragraph_format.first_line_indent = Cm(-0.3)
        add_run_cn(p, text)


def add_callout(doc, title, text, color=TEAL):
    t = doc.add_table(rows=1, cols=1)
    set_repeat_table_header(t.rows[0])
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = t.cell(0, 0)
    set_cell_shading(cell, LIGHT)
    set_cell_margins(cell, 140, 180, 140, 180)
    p = cell.paragraphs[0]
    add_run_cn(p, title + "\n", bold=True, size=10, color=color)
    add_run_cn(p, text, size=9.5, color=TEXT)
    doc.add_paragraph().paragraph_format.space_after = Pt(1)


def add_table(doc, headers, rows, widths=None, small=False):
    table = doc.add_table(rows=1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.style = "Table Grid"
    table.autofit = widths is None
    hdr = table.rows[0]
    set_repeat_table_header(hdr)
    for i, h in enumerate(headers):
        cell = hdr.cells[i]
        set_cell_shading(cell, NAVY)
        set_cell_margins(cell, 80, 90, 80, 90)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        add_run_cn(p, str(h), bold=True, size=7.8 if small else 8.2, color=WHITE)
        cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
        if widths:
            cell.width = Cm(widths[i])
    for ridx, row in enumerate(rows):
        cells = table.add_row().cells
        if ridx % 2:
            for c in cells:
                set_cell_shading(c, PALE)
        for i, value in enumerate(row):
            cell = cells[i]
            set_cell_margins(cell, 70, 80, 70, 80)
            p = cell.paragraphs[0]
            add_run_cn(p, str(value), size=7.6 if small else 8.3)
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            if widths:
                cell.width = Cm(widths[i])
    doc.add_paragraph().paragraph_format.space_after = Pt(1)
    return table


def add_source_list(doc, sources):
    for i, (label, url) in enumerate(sources, 1):
        p = doc.add_paragraph(style="Small Note")
        add_run_cn(p, f"[{i}] {label}：", bold=True, size=8, color=MUTED)
        add_hyperlink(p, "打开原文", url, color=BLUE, underline=True)


def compact_desc(text, n=90):
    text = " ".join(str(text).split())
    return text if len(text) <= n else text[: n - 1] + "…"


def common_evidence_scale(doc):
    add_subsection(doc, "证据分级口径")
    add_table(doc, ["等级", "含义", "本报告使用边界"], [
        ["A", "官方查处、判决，或同批次/同柜号闭环", "可以支持违法或同货链判断"],
        ["B+", "实体、牌号、时序高度吻合，但缺关键单证", "高优先调单，不直接定性"],
        ["B", "受税来源直达或实体级贸易链", "核税/核原产对象"],
        ["C", "品牌、路线、宏观变化或字段冲突", "仅筛查线索"],
    ], widths=[1.2, 5.0, 10.0])


def add_tax_note(doc, rows):
    add_table(doc, ["适用情景", "反倾销/反补贴税率", "仅因贸易救济税增加的VAT", "综合增量系数"], rows, widths=[5.1, 3.4, 3.8, 3.9], small=True)
    p = doc.add_paragraph(style="Small Note")
    add_run_cn(p, "注：综合增量系数按进口增值税13%作筛查，即贸易救济税率×1.13；不代表整票全部税负。正式追税必须使用中国海关完税价格、生产商税档及缴款书。", size=8, color=MUTED)


def build_27():
    folder = ROOT / "27_共聚聚甲醛_韩国泰国马来西亚"
    s = read_json(folder / "POM27_分析摘要.json")
    leads = read_csv(folder / "POM27_大陆重点线索.csv")
    doc = setup_doc(27, "共聚聚甲醛")
    add_masthead(doc, 27, "共聚聚甲醛（POM）反倾销税风险深度核查", "2017措施来源：韩国、泰国、马来西亚｜第三国转运与品牌穿透复核", "中高（B+线索）", GOLD)
    add_callout(doc, "结论先行", "近一年易迅POLYACETAL结果未见受税三国平台原产直达大陆，也未见#&KR/#&TH/#&MY尾标；但出现一条越南→中国“KOCEAL K700 Black”记录。公开牌号资料表明其高度疑似韩国可隆KOCETAL K700共聚POM，熔点约166℃，初步落入措施技术范围。这是具体品牌穿透B腿线索，尚缺韩国→越南同批A腿和中国报关税单。")
    add_section(doc, "一、政策与产品范围")
    add_table(doc, ["项目", "核定内容"], [
        ["受税来源/期限", "韩国、泰国、马来西亚；2023-10-24续征5年，至2028-10-23"],
        ["税号", "39071010、39071090"],
        ["技术范围", "共聚POM；-CH₂-O-含量>50%，熔融温度160≤T<170℃，并满足公告性能指标"],
        ["明确排除", "均聚聚甲醛、改性聚甲醛等其他产品"],
        ["主要税率", "韩国：KEP 30.0%、可隆继承企业6.2%、其他30.4%；泰国：Thai Polyacetal 18.5%、其他34.9%；马来西亚：大赛璐继承企业8.0%、其他9.5%"],
    ], widths=[3.2, 13.0])
    add_tax_note(doc, [
        ["韩国可隆/KOCETAL", "6.2%", "0.806%", "7.006%×完税价"],
        ["韩国KEP", "30.0%", "3.900%", "33.900%×完税价"],
        ["泰国列名公司", "18.5%", "2.405%", "20.905%×完税价"],
        ["马来西亚列名继承企业", "8.0%", "1.040%", "9.040%×完税价"],
    ])
    add_section(doc, "二、易迅全页审计结果")
    add_table(doc, ["口径", "结果"], [
        ["查询", "POLYACETAL + 目的国China + 近一年；200条/页；结果151条，1页全读"],
        ["精确去重", f"原始151条；12个可见字段精确去重{s['exact_unique']}条；重复多余{s['duplicate_extra']}条"],
        ["大陆/台湾", f"中国大陆{s['mainland_unique']}条；台湾误纳{s['taiwan_misincluded_unique']}条，已剔除"],
        ["当前受税来源直达", "0条（韩国/泰国/马来西亚）"],
        ["历史基线", "既有POM全量底表发现57条受税来源直达：韩国44条/物量代理823,742；马来西亚13条/375,612；均集中于2024年"],
    ], widths=[4.0, 12.2])
    add_subsection(doc, "最具体线索：越南KOCETAL K700 B腿")
    k = [r for r in leads if "K700" in r.get("商品描述", "").upper()][:1]
    if k:
        r = k[0]
        add_table(doc, ["日期", "路线", "货描", "中国方", "越南方", "数量/金额字段"], [[r["日期"], "越南→中国", compact_desc(r["商品描述"], 100), r["采购商"], r["供应商"], f"{r['数量']} / {r['金额']}"]], widths=[1.8, 1.8, 5.5, 3.0, 2.8, 2.0], small=True)
    add_bullets(doc, [
        "公开KOLON资料确认KOCETAL是共聚POM品牌，K700熔点约166℃；易迅货描“KOCEAL”高度疑似录入误拼。",
        "若中国进口申报原产越南，而实际仅由韩国成品料在越南分装/换标，则原产仍应重点核定；若越南发生满足原产规则的实质加工，结论可能不同。",
        "数量字段仅5，金额字段130,555，平台未明示单位/币种；无完税价格，不计算实际欠税。",
    ])
    add_section(doc, "三、第三国风险判断")
    common_evidence_scale(doc)
    doc.add_page_break()
    add_table(doc, ["线索", "等级", "支持事实", "关键缺口"], [
        ["KOCEAL/KOCETAL K700 越南B腿", "B+", "牌号对应韩国受税企业产品；技术参数初步在范围；越南发华", "韩国→越南A腿、批号、柜号、越南BOM/工单、中国原产申报"],
        ["越南EW901/玻纤POM", "C", "存在越南复合/改性输出", "改性POM可能不在本措施范围；需配方/COA"],
        ["历史韩国/马来西亚直达57条", "B", "受税来源直接对华", "是否已正常缴AD、税档和税单"],
    ], widths=[3.5, 1.2, 5.5, 6.1], small=True)
    add_section(doc, "四、实体与调证清单")
    add_table(doc, ["优先级", "实体/对象", "应调资料"], [
        ["1", "Công ty TNHH Taeguang E&M / Weihai Taiguang Electromechanical", "2026-06-27中国报关单、合同、发票、原产证、批号、包装袋照片、税款缴款书"],
        ["2", "KOLON ENP / KOCETAL供应链", "K700生产批次、韩国出厂COA、韩国→越南提单/出口申报、销售发票"],
        ["3", "Titan Polymer Compounds Vietnam", "EW901及GF910/GF925配方、生产工单、原料台账、投入产出/能耗"],
        ["4", "历史KEP/韩国POM及马来西亚POM进口人", "2024年57条对应报关单、适用企业税率、反倾销税缴款书"],
    ], widths=[1.4, 5.3, 9.9])
    add_section(doc, "五、结论与下一步")
    add_body(doc, "目前没有A等级证据证明韩国/泰国/马来西亚POM经第三国伪报后进入中国。KOCETAL K700越南B腿是最值得立即调单的B+线索；若中国底单仍申报日本/韩国并正常缴税，或能证明越南实质加工/原产，则风险降级。")
    add_bullets(doc, ["第一步：调中国进口报关单原产国、生产商、完税价格及反倾销税款书。", "第二步：按牌号、批号、重量、30—120日窗口回查韩国→越南A腿。", "第三步：对越南加工是否仅分装/着色/混配，结合投入产出HS、BOM、增值与海关原产地预裁定核定。"])
    add_section(doc, "公开来源")
    add_source_list(doc, [
        ("商务部公告2023年第38号（范围、税率、期限）", "https://interview.mofcom.gov.cn/mofcom_interview/front/opdata/downlodePdf?id=20231003448181"),
        ("商务部2026年企业权利义务继承专题", "https://www.mofcom.gov.cn/cms_files/filemanager/policySummary/viewcore_e27fea7508b6480395eaefa65c79c1f5.html"),
        ("KOLON ENP官方KOCETAL产品页", "https://www.kolonplastics.com/en/sub/KOCETAL.php"),
        ("Korea Engineering Plastics官方历史与产能", "https://www.kepital.com/en/about/history.php"),
        ("进出口货物原产地条例", "https://xzfg.moj.gov.cn/front/law/detail?LawID=1523&Query=%E8%B4%A7%E7%89%A9%E5%8E%9F%E4%BA%A7%E5%9C%B0"),
    ])
    path = folder / "27_共聚聚甲醛_反倾销税与第三国转运风险深度分析报告.docx"
    doc.save(path)
    return path


def build_28():
    folder = ROOT / "28_偏二氯乙烯-氯乙烯共聚树脂"
    s = read_json(folder / "PVDC28_分析摘要.json")
    b = read_csv(folder / "PVDC28_越南Kureha至中国B腿.csv")
    doc = setup_doc(28, "偏二氯乙烯—氯乙烯共聚树脂")
    add_masthead(doc, 28, "偏二氯乙烯—氯乙烯共聚树脂深度核查", "日本原产PVDC共聚树脂｜Kureha日本—越南—中国实体链", "高优先调单（B+）", GOLD)
    add_callout(doc, "结论先行", f"易迅中国HS390450全页17条与越南宽池469条均已读完。精确去重后，识别日本Kureha→Kureha Vietnam的PVDC树脂粉A腿{s['kureha_japan_to_vietnam_A_unique']}条，数量字段合计2,335,700；越南Kureha→Kureha中国投资公司的PVDC/Krehalon compound B腿2条，数量字段合计50。实体链、产品链和时序成立，但Kureha Vietnam官方存在PVDC compound/薄膜真实制造，当前不能把路线等同于规避。")
    add_section(doc, "一、政策与产品范围")
    add_table(doc, ["项目", "核定内容"], [
        ["受税来源/期限", "日本；2023-04-20续征5年，至2028-04-19"],
        ["税号", "39045000"],
        ["税率", "所有日本公司47.1%"],
        ["范围注意", "仅偏二氯乙烯—氯乙烯共聚树脂；同税号其他偏二氯乙烯聚合物不当然在范围"],
        ["核定门槛", "单体组成、共聚比例、初级形状、牌号和COA/TDS"],
    ], widths=[3.2, 13.0])
    add_tax_note(doc, [["日本原产范围产品", "47.1%", "6.123%", "53.223%×完税价"]])
    add_section(doc, "二、易迅全页逐票结果")
    add_table(doc, ["查询", "页数/原始条数", "去重后结论"], [
        ["中国进口 HS390450", "1页 / 17条", "15条唯一：比利时12、越南2、法国1；日本直达0"],
        ["越南 HS390450 宽池", "3页 / 469条（200+200+69）", "452条唯一；其中日本Kureha→越南PVDC树脂A腿73条"],
        ["跨查询合并", "486条", f"474条唯一；重复多余12条；120日窗口形成{s['ab_time_matches_120d']}组A/B候选配对"],
    ], widths=[4.5, 4.4, 7.3])
    add_subsection(doc, "中国B腿两条")
    rows = []
    for r in b:
        rows.append([r["日期"], compact_desc(r["商品描述"], 90), r["采购商"], r["供应商"], r["数量"], r["金额"], r["平台原产国地区"]])
    add_table(doc, ["日期", "商品", "中国方", "越南方", "数量字段", "金额字段", "平台原产"], rows, widths=[1.7, 4.5, 3.1, 2.7, 1.3, 1.8, 1.3], small=True)
    add_subsection(doc, "上游A腿指纹")
    add_bullets(doc, [
        "日本KUREHA CORPORATION向Kureha Vietnam持续供应C-No、Y-No、M-No、EV-No、YA-No等PVDC resin powder。",
        "2025-11-01两条B腿之前，2025-10-29、10-09、10-02、09-09、08-15均有日本PVDC树脂输入，形成53日、23日等时序窗口。",
        "A、B牌号并非一一相同；B为PC101 F/C与FB-8 CLEAR compound，说明至少存在配方/复配加工，不能按数量直接配对。",
    ])
    add_section(doc, "三、公开来源交叉核验")
    add_table(doc, ["事实", "含义", "风险边界"], [
        ["Kureha官方列Kureha Vietnam为食品包装膜生产销售企业", "越南不是纯贸易壳公司", "真实薄膜加工是强合法替代解释"],
        ["Kureha 2012报告称越南建立compound工厂并形成一体化流程", "越南发生compound生产的可能性高", "仍需核是否达到中国非优惠原产地实质性改变"],
        ["B腿买方为Kureha (China) Investment", "集团内链条清晰", "关联交易和集团内调拨不等于违法"],
    ], widths=[5.3, 5.0, 5.5])
    doc.add_page_break()
    common_evidence_scale(doc)
    add_section(doc, "四、税务暴露与核查重点")
    add_callout(doc, "条件性税差", "若且仅若B腿货物仍属日本原产、落入措施技术范围、中国进口申报未缴反倾销税，则少缴反倾销税及其引致的13%进口增值税增量=中国海关完税价格×53.223%。平台B腿金额字段13,076,000的币种和成交条件未核，不能直接作为中国完税价格或欠税额。", RED)
    add_table(doc, ["资料", "核查目的"], [
        ["中国进口报关单、税款缴款书", "确认原产国、生产商、HS、完税价格、AD是否缴纳"],
        ["越南进口申报、原产证、COA", "确认日本树脂牌号、批次、成分和进入越南时间"],
        ["越南BOM、工单、配方、能耗、损耗、库存", "判断compound加工实质与投入产出平衡"],
        ["提单、柜号、批号、包装袋唛", "判断A/B是否同批或仅集团库存轮转"],
        ["非优惠原产地预裁定/签证底稿", "判断越南加工是否赋予原产地；RCEP优惠资格不能替代AD原产判断"],
    ], widths=[5.2, 11.0])
    add_section(doc, "五、结论")
    add_body(doc, "本项已形成实体级和产品级的日本—越南—中国事实链，证据等级B+，是第27—30项中最值得调单的化工路线之一；但公开产能和加工事实构成强反证，只有在中国报关原产地、批次物料平衡和越南实质加工不足同时成立时，才可升级为规避证据。公开检索未发现中国海关处罚、法院判决或商务部反规避裁定披露该具体链。")
    add_section(doc, "公开来源")
    add_source_list(doc, [
        ("商务部公告2023年第14号", "https://dcj.mofcom.gov.cn/article/zcfb/zcwg/202309/20230903437748.shtml"),
        ("Kureha海外集团公司目录", "https://www.kureha.co.jp/en/about/foreign.html"),
        ("Kureha 2012 Business Report（越南compound一体化工厂）", "https://www.kureha.co.jp/en/ir/pdf/br2012.pdf"),
        ("Krehalon PVDC薄膜官方产品页", "https://www.kureha.co.jp/en/business/polymer/krehalon_film.html"),
        ("进出口货物原产地条例", "https://xzfg.moj.gov.cn/front/law/detail?LawID=1523"),
    ])
    path = folder / "28_偏二氯乙烯-氯乙烯共聚树脂_反倾销税与第三国转运风险深度分析报告.docx"
    doc.save(path)
    return path


def build_29():
    folder = ROOT / "29_干玉米酒糟"
    s = read_json(folder / "DDGS29_分析摘要.json")
    main = read_csv(folder / "DDGS29_中国大陆记录.csv")
    doc = setup_doc(29, "干玉米酒糟")
    add_masthead(doc, 29, "干玉米酒糟（DDGS）贸易救济税风险核查", "美国原产｜反倾销税 + 反补贴税双重措施｜第三国绕道筛查", "中（直达核税）", BLUE)
    add_callout(doc, "结论先行", "DDGS与HS230330两组近一年结果全部读完，共235行。平台把台湾目的地大量纳入“China”，跨查询精确去重并剔除台湾后，中国大陆仅1条：2025-10-09 Tallgrass Commodities美国原产DDGS直达中国，重量字段23,524。该票应同时核反倾销税与反补贴税，但它不是第三国绕道证据；现有B腿数据中没有第三国→中国DDGS。")
    add_section(doc, "一、政策与税种")
    add_table(doc, ["项目", "反倾销", "反补贴"], [
        ["现行依据", "商务部2023年第2号", "商务部2023年第1号"],
        ["受税来源", "美国", "美国"],
        ["期限", "2023-01-12续征5年，至2028-01-11", "同左"],
        ["税率区间", "42.2%—53.7%", "11.2%—12.0%"],
        ["产品范围", "HS23033000项下全部产品", "与反倾销范围一致"],
    ], widths=[3.0, 6.6, 6.6])
    add_tax_note(doc, [
        ["最低税率组合", "AD 42.2% + CVD 11.2%", "6.942%", "60.342%×完税价"],
        ["最高/其他公司情景", "AD 53.7% + CVD 12.0%", "8.541%", "74.241%×完税价"],
    ])
    add_section(doc, "二、易迅全页审计")
    add_table(doc, ["指标", "结果"], [
        ["DDGS关键词查询", "134条，1页（200条/页）；其中中国大陆1条、台湾133条"],
        ["HS230330查询", "101条，1页；全部为台湾目的地"],
        ["跨查询合并", f"235条；12可见字段精确去重{s['exact_unique']}条；重复多余{s['duplicate_extra']}条"],
        ["目的地纠偏", f"中国大陆{s['mainland_unique']}条；台湾误纳{s['taiwan_misincluded_unique']}条，全部从大陆风险量剔除"],
        ["第三国B腿", "0条"],
    ], widths=[4.2, 12.0])
    add_subsection(doc, "中国大陆唯一记录")
    if main:
        r = main[0]
        add_table(doc, ["日期", "商品", "供应商", "买方", "重量字段", "数量字段", "金额", "平台原产"], [[r["日期"], compact_desc(r["商品描述"], 70), r["供应商"], r["采购商"], r["重量"], r["数量"], r["金额"] or "空", r["平台原产国地区"]]], widths=[1.6, 4.2, 3.0, 1.6, 1.5, 1.3, 1.3, 1.7], small=True)
    add_bullets(doc, [
        "平台买方为“---”、金额为空，无法识别中国进口人、口岸、完税价格或税款。",
        "供应商Tallgrass Commodities不等于生产商；税率需穿透实际美国生产企业。若无法对应列名企业，才可能适用其他公司档，不能仅凭出口商名称直接套最高税率。",
        "USDA 2025报告显示美国DDGS含AD/CVD后的对华报价显著高于不含税报价，说明措施具有很强的税负激励，但宏观价差不能替代逐票违法证据。",
    ])
    add_section(doc, "三、第三国绕道风险")
    common_evidence_scale(doc)
    add_table(doc, ["方向", "当前证据", "判断"], [
        ["美国→中国", "1条美国原产直达", "B：核双税是否正常缴纳；非绕道"],
        ["美国→第三国→中国", "本次中国B池没有第三国来源", "未形成链；不能据美国对墨西哥/越南出口宏观量认定"],
        ["巴西→中国", "USDA称2025年中国放开巴西DDGS准入并有真实生产供应", "合法非美来源反证；须核巴西工厂注册和植物检疫"],
        ["台湾数据", "224条精确唯一被平台纳入China", "目的地统计噪声，严禁计入中国大陆风险量"],
    ], widths=[4.0, 6.1, 6.1])
    add_section(doc, "四、税额与调证")
    add_callout(doc, "无法计算实际税额", "唯一大陆票没有金额/中国完税价格。若生产商最终适用最高组合档且中国底单未缴税，贸易救济税及其引致VAT增量为完税价格×74.241%；但这只是条件公式，不是本票欠税结论。", RED)
    add_table(doc, ["优先资料", "核查问题"], [
        ["中国报关单与税款缴款书", "HS23033000、原产美国、AD/CVD税档及实际缴税"],
        ["生产商声明/美国工厂发票", "Tallgrass是贸易商还是生产商；对应列名税率"],
        ["提单、卸货港、检疫证书", "识别进口口岸、收货人、植物检疫与实际批次"],
        ["合同、发票、付款", "完税价格及关联/转售链"],
        ["若后续出现第三国B腿", "回查美国A腿、第三国生产注册、原料/生产/库存和非优惠原产地"],
    ], widths=[5.2, 11.0])
    add_section(doc, "五、结论")
    add_body(doc, "本次数据只支持“美国原产DDGS直达中国的双税核查”，不支持“绕道第三国”结论。最大数据风险反而是平台将台湾纳入China造成的224条虚增。公开检索未发现中国海关或法院公开披露本品第三国规避案件；该负面结果不代表不存在未公开案件。")
    add_section(doc, "公开来源")
    add_source_list(doc, [
        ("商务部公告2023年第2号（反倾销）", "https://www.mofcom.gov.cn/zcfb/zgdwjjmywg/art/2023/art_580b79c32f0947f1a0fe1ca207629b9f.html"),
        ("商务部公告2023年第1号（反补贴）", "https://cacs.mofcom.gov.cn/cacscms/case/jkdc?caseId=78462"),
        ("USDA GAIN Grain and Feed Update 2025", "https://apps.fas.usda.gov/newgainapi/api/Report/DownloadReportByFileName?fileName=Grain+and+Feed+Update_Beijing_China+-+People%27s+Republic+of_CH2025-0132"),
        ("USDA DDGS出口开放数据集", "https://agtransport.usda.gov/Exports/Distillers-Dried-Grains-with-Solubles-DDGS-Exports/x6nd-z74y"),
        ("进出口货物原产地条例", "https://xzfg.moj.gov.cn/front/law/detail?LawID=1523&Query=%E8%B4%A7%E7%89%A9%E5%8E%9F%E4%BA%A7%E5%9C%B0"),
    ])
    path = folder / "29_干玉米酒糟_反倾销反补贴税与第三国转运风险深度分析报告.docx"
    doc.save(path)
    return path


def build_30():
    folder = ROOT / "30_取向电工钢"
    s = read_json(folder / "GOES30_分析摘要.json")
    a = read_csv(folder / "GOES30_日本JFE至越南A腿3条.csv")
    b = read_csv(folder / "GOES30_越南JFE至中国B腿.csv")
    doc = setup_doc(30, "取向电工钢")
    add_masthead(doc, 30, "取向电工钢（GOES）第三国转运风险深度核查", "日本、韩国、欧盟原产｜JFE日本—越南海防—中国同牌号链", "高优先调单（B+）", GOLD)
    add_callout(doc, "结论先行", f"三组中国查询与一组牌号A腿查询全部读完。精确去重后，日本JFE Shoji→越南海防加工中心23JGSD080 A腿3条，数量字段合计146,625；越南海防→中国同牌号B腿4条，数量字段合计72,635，货描均保留#&JP。日本—越南—中国事实链已成立；但越南工厂官方具备分条、剪切、冲压等真实加工，且缺卷号/炉号和中国报关原产地，尚不能认定逃税。")
    add_section(doc, "一、政策与范围")
    add_table(doc, ["项目", "核定内容"], [
        ["受税来源/期限", "日本、韩国、欧盟；2022-07-23续征5年，至2027-07-22"],
        ["税号", "72251100、72261100"],
        ["技术范围", "GOES/冷轧取向硅钢；Si≥0.6%、C≤0.08%、Al≤1.0%、厚度≤0.56mm；卷可为任意宽度"],
        ["日本税率", "JFE Steel 39.0%；Nippon Steel及其他日本公司45.7%"],
        ["韩国/欧盟", "韩国POSCO及其他37.3%；POSCO有效价格承诺成交期间不征AD；欧盟46.3%"],
    ], widths=[3.2, 13.0])
    add_tax_note(doc, [
        ["JFE日本原产", "39.0%", "5.070%", "44.070%×完税价"],
        ["日本制铁/其他日本公司", "45.7%", "5.941%", "51.641%×完税价"],
        ["韩国（价格承诺不适用/违反时）", "37.3%", "4.849%", "42.149%×完税价"],
        ["欧盟", "46.3%", "6.019%", "52.319%×完税价"],
    ])
    add_section(doc, "二、易迅查询覆盖与去重")
    add_table(doc, ["查询", "原始结果", "核心发现"], [
        ["GRAIN ORIENTED ELECTRICAL STEEL + China", "3条", "印度→中国2个唯一记录（1条重复）"],
        ["HS722511 + China", "19条", "越南JFE 6行（4唯一）、墨西哥10、瑞典3"],
        ["HS722611 + China", "5条", "印度3行（2唯一）、印尼1条、台湾目的地1条"],
        ["23JGSD080 + Vietnam", "3条", "全部日本JFE Shoji→越南JFE Shoji"],
        ["跨查询合并", "30条", f"24条精确唯一；中国大陆{s['china_unique']}条；重复多余6条"],
    ], widths=[5.1, 3.2, 7.9])
    add_section(doc, "三、JFE 23JGSD080 A/B事实链")
    add_subsection(doc, "A腿：日本→越南")
    add_table(doc, ["日期", "卖方", "越南买方", "牌号/规格", "数量字段", "金额字段"], [[r["日期"], r["供应商"], r["采购商"], compact_desc(r["商品描述"], 75), r["数量"], r["金额"]] for r in a], widths=[1.6, 2.8, 3.1, 5.3, 1.5, 2.3], small=True)
    add_subsection(doc, "B腿：越南→中国")
    add_table(doc, ["日期", "中国买方", "越南卖方", "牌号/尾标", "数量字段", "金额字段"], [[r["日期"], r["采购商"], r["供应商"], "23JGSD080 / #&JP", r["数量"], r["金额"]] for r in b], widths=[1.7, 3.4, 3.6, 3.0, 1.6, 2.9], small=True)
    add_bullets(doc, [
        "同牌号、同JFE集团实体、日本来源标记和时序共同支持日本母卷进入越南后再发中国。",
        "B腿2025-11-10发生在2025-10-10 A腿后31日；2026-06-10 B腿与2026-01-29 A腿间隔132日。数量不能一一相等，符合库存/分条后的多卷输出，也可能是合法加工。",
        "平台原产字段为Vietnam、货描尾标#&JP；这只是字段冲突和日本料来源提示，必须看中国进口报关单实际申报原产国。",
    ])
    add_section(doc, "四、公开产能与原产地边界")
    add_table(doc, ["公开事实", "合规含义", "仍需核查"], [
        ["JFE Shoji官方：海防为钢材加工中心，设备含大型分条机、矫平机", "越南存在真实加工，不是纯转卖壳公司", "分条/剪切是否构成中国非优惠原产地实质改变"],
        ["海防服务页列GOES及slitting/shearing/pressing/punching", "加工可改变规格和形态", "投入/产出仍归7225/7226何种四位税目、加工目的和预裁定"],
        ["B腿货描#&JP", "越南出口环节未完全隐去日本来源", "中国端是否仍申报日本并按JFE 39%缴税"],
    ], widths=[5.5, 5.3, 5.4])
    common_evidence_scale(doc)
    add_section(doc, "五、税额与实体核查")
    add_callout(doc, "条件性税差", "若B腿仍应认定日本JFE原产、且中国进口未缴AD，则少缴AD及其引致13%进口VAT增量=中国海关完税价格×44.07%。越南B腿金额字段合计6,730,774,382.70，币种/成交条件未核，不能作为中国完税价格或欠税额。", RED)
    doc.add_page_break()
    add_table(doc, ["对象", "核查资料"], [
        ["JFE Shoji Steel Hai Phong", "日本进口申报、MTC、卷号/炉号、分条工单、损耗、库存、越南出口申报、Form B底稿"],
        ["GMGO Magnetic Materials / Nicore Electrical", "中国报关单、生产商/原产国、完税价格、AD税单、提单与入库记录"],
        ["JFE Shoji Corporation / JFE Steel", "原卷销售发票、牌号/卷号、生产厂、原产声明"],
        ["其他墨西哥B腿主体", "Integración Adm. Logística、Varium Steel、Metson Power等的上游来源、MTC和墨西哥加工能力"],
        ["印度/瑞典/印尼B腿", "先核是否符合GOES技术范围，再回查受税来源同牌号A腿"],
    ], widths=[5.5, 10.7])
    add_section(doc, "六、结论")
    add_body(doc, "本项已取得最具体的日本—越南—中国同牌号事实链，证据等级B+，应优先调取卷号/MTC和中国税单。当前公开材料同时证明越南海防具备真实加工能力，故不能把第三国加工或发货直接定性为虚假原产。公开定向检索未发现中国海关处罚、法院判决或商务部反规避裁定公开认定该链逃税。")
    add_section(doc, "公开来源")
    add_source_list(doc, [
        ("商务部公告2022年第22号", "https://interview.mofcom.gov.cn/mofcom_interview/front/opdata/downlodePdf?id=20220703335084"),
        ("JFE Shoji Steel Hai Phong第二工厂官方公告", "https://www.jfe-shoji.co.jp/wjfep/wp-content/uploads/2022/01/JFE-Shoji-Steel-Hai-Phong-to-start-operations-at-Second-Plant.pdf"),
        ("JFE Shoji Steel Hai Phong官方服务页", "https://jshp.com.vn/en/services/"),
        ("JFE Shoji全球网络", "https://en.jfe-shoji.co.jp/network/"),
        ("进出口货物原产地条例", "https://xzfg.moj.gov.cn/front/law/detail?LawID=1523&Query=%E8%B4%A7%E7%89%A9%E5%8E%9F%E4%BA%A7%E5%9C%B0"),
    ])
    path = folder / "30_取向电工钢_反倾销税与第三国转运风险深度分析报告.docx"
    doc.save(path)
    return path


def main():
    paths = [build_27(), build_28(), build_29(), build_30()]
    print(json.dumps([str(p) for p in paths], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
