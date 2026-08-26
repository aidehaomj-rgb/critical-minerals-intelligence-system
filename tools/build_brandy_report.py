from __future__ import annotations

import json
from pathlib import Path
from datetime import date

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_ROW_HEIGHT_RULE
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.enum.style import WD_STYLE_TYPE
from docx.shared import Inches, Pt, RGBColor
from docx.oxml import OxmlElement
from docx.oxml.ns import qn


PRODUCT_DIR = Path(r"D:\易迅数据\反倾销税深度分析报告\04_白兰地（200升以下容器）")
ANALYSIS_PATH = PRODUCT_DIR / "白兰地_分析结果.json"
OUT_PATH = PRODUCT_DIR / "白兰地_反倾销税与第三国转运风险深度分析报告.docx"

BLUE = "2E74B5"
DARK_BLUE = "1F4D78"
INK = "0B2545"
MUTED = "666666"
LIGHT_GRAY = "F2F4F7"
PALE_BLUE = "E8EEF5"
CALLOUT = "F4F6F9"
PALE_GOLD = "FFF4CC"
PALE_RED = "FCE8E6"
PALE_GREEN = "E6F4EA"
BORDER = "CBD5E1"
RISK_RED = "9B1C1C"
CAUTION = "7A5A00"


def rgb(hex_string: str) -> RGBColor:
    return RGBColor.from_string(hex_string)


def set_run_font(run, name="Calibri", size=None, color=None, bold=None, italic=None):
    run.font.name = name
    rpr = run._element.get_or_add_rPr()
    rfonts = rpr.rFonts
    if rfonts is None:
        rfonts = OxmlElement("w:rFonts")
        rpr.insert(0, rfonts)
    rfonts.set(qn("w:ascii"), name)
    rfonts.set(qn("w:hAnsi"), name)
    rfonts.set(qn("w:eastAsia"), "Microsoft YaHei")
    if size is not None:
        run.font.size = Pt(size)
    if color is not None:
        run.font.color.rgb = rgb(color)
    if bold is not None:
        run.bold = bold
    if italic is not None:
        run.italic = italic


def set_cell_shading(cell, fill: str):
    tcpr = cell._tc.get_or_add_tcPr()
    shd = tcpr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tcpr.append(shd)
    shd.set(qn("w:fill"), fill)


def set_repeat_header(row):
    trpr = row._tr.get_or_add_trPr()
    header = trpr.find(qn("w:tblHeader"))
    if header is None:
        header = OxmlElement("w:tblHeader")
        trpr.append(header)
    header.set(qn("w:val"), "true")


def set_table_geometry(table, widths_dxa):
    table.autofit = False
    tbl = table._tbl
    tblpr = tbl.tblPr
    for tag in ("w:tblW", "w:tblInd", "w:tblLayout", "w:tblCellMar"):
        old = tblpr.find(qn(tag))
        if old is not None:
            tblpr.remove(old)

    tblw = OxmlElement("w:tblW")
    tblw.set(qn("w:w"), "9360")
    tblw.set(qn("w:type"), "dxa")
    tblpr.append(tblw)

    tblind = OxmlElement("w:tblInd")
    tblind.set(qn("w:w"), "120")
    tblind.set(qn("w:type"), "dxa")
    tblpr.append(tblind)

    layout = OxmlElement("w:tblLayout")
    layout.set(qn("w:type"), "fixed")
    tblpr.append(layout)

    margins = OxmlElement("w:tblCellMar")
    for tag, val in (("top", 80), ("bottom", 80), ("start", 120), ("end", 120)):
        node = OxmlElement(f"w:{tag}")
        node.set(qn("w:w"), str(val))
        node.set(qn("w:type"), "dxa")
        margins.append(node)
    tblpr.append(margins)

    grid = tbl.tblGrid
    for child in list(grid):
        grid.remove(child)
    for width in widths_dxa:
        col = OxmlElement("w:gridCol")
        col.set(qn("w:w"), str(width))
        grid.append(col)

    for row in table.rows:
        for cell, width in zip(row.cells, widths_dxa):
            tcpr = cell._tc.get_or_add_tcPr()
            tcw = tcpr.find(qn("w:tcW"))
            if tcw is None:
                tcw = OxmlElement("w:tcW")
                tcpr.append(tcw)
            tcw.set(qn("w:w"), str(width))
            tcw.set(qn("w:type"), "dxa")
            cell.width = Inches(width / 1440)
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.TOP


def set_table_borders(table, color=BORDER, size="4"):
    tblpr = table._tbl.tblPr
    borders = tblpr.find(qn("w:tblBorders"))
    if borders is None:
        borders = OxmlElement("w:tblBorders")
        tblpr.append(borders)
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        node = borders.find(qn(f"w:{edge}"))
        if node is None:
            node = OxmlElement(f"w:{edge}")
            borders.append(node)
        node.set(qn("w:val"), "single")
        node.set(qn("w:sz"), size)
        node.set(qn("w:color"), color)


def format_cell(cell, *, bold=False, color="000000", size=9.5, align=None):
    for paragraph in cell.paragraphs:
        paragraph.paragraph_format.space_before = Pt(0)
        paragraph.paragraph_format.space_after = Pt(0)
        paragraph.paragraph_format.line_spacing = 1.05
        if align is not None:
            paragraph.alignment = align
        for run in paragraph.runs:
            set_run_font(run, size=size, color=color, bold=bold)


def add_table(doc, headers, rows, widths_dxa, *, header_fill=LIGHT_GRAY, font_size=9.5):
    table = doc.add_table(rows=1, cols=len(headers))
    table.style = "Table Grid"
    for idx, text in enumerate(headers):
        table.cell(0, idx).text = str(text)
        set_cell_shading(table.cell(0, idx), header_fill)
        format_cell(table.cell(0, idx), bold=True, color=INK, size=font_size)
    set_repeat_header(table.rows[0])
    for row_values in rows:
        cells = table.add_row().cells
        for idx, value in enumerate(row_values):
            cells[idx].text = "" if value is None else str(value)
            format_cell(cells[idx], size=font_size)
    set_table_geometry(table, widths_dxa)
    set_table_borders(table)
    return table


def add_caption(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(4)
    r = p.add_run(text)
    set_run_font(r, size=9, color=MUTED, italic=True)
    return p


def add_callout(doc, title, text, fill=CALLOUT, title_color=INK):
    table = doc.add_table(rows=1, cols=1)
    cell = table.cell(0, 0)
    set_cell_shading(cell, fill)
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(3)
    r = p.add_run(title)
    set_run_font(r, size=10.5, color=title_color, bold=True)
    p2 = cell.add_paragraph()
    p2.paragraph_format.space_after = Pt(0)
    p2.paragraph_format.line_spacing = 1.1
    r2 = p2.add_run(text)
    set_run_font(r2, size=10.5, color="333333")
    set_table_geometry(table, [9360])
    set_table_borders(table, color=BORDER, size="6")
    return table


def add_hyperlink(paragraph, text, url):
    part = paragraph.part
    rid = part.relate_to(url, "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink", is_external=True)
    hyperlink = OxmlElement("w:hyperlink")
    hyperlink.set(qn("r:id"), rid)
    new_run = OxmlElement("w:r")
    rpr = OxmlElement("w:rPr")
    color = OxmlElement("w:color")
    color.set(qn("w:val"), BLUE)
    underline = OxmlElement("w:u")
    underline.set(qn("w:val"), "single")
    rfonts = OxmlElement("w:rFonts")
    rfonts.set(qn("w:ascii"), "Calibri")
    rfonts.set(qn("w:hAnsi"), "Calibri")
    rfonts.set(qn("w:eastAsia"), "Microsoft YaHei")
    rpr.extend([rfonts, color, underline])
    new_run.append(rpr)
    t = OxmlElement("w:t")
    t.text = text
    new_run.append(t)
    hyperlink.append(new_run)
    paragraph._p.append(hyperlink)


def add_page_field(paragraph):
    run = paragraph.add_run("第 ")
    set_run_font(run, size=9, color=MUTED)
    begin = OxmlElement("w:fldChar")
    begin.set(qn("w:fldCharType"), "begin")
    instr = OxmlElement("w:instrText")
    instr.set(qn("xml:space"), "preserve")
    instr.text = " PAGE "
    separate = OxmlElement("w:fldChar")
    separate.set(qn("w:fldCharType"), "separate")
    text = OxmlElement("w:t")
    text.text = "1"
    end = OxmlElement("w:fldChar")
    end.set(qn("w:fldCharType"), "end")
    r = paragraph.add_run()._r
    r.extend([begin, instr, separate, text, end])
    run2 = paragraph.add_run(" 页")
    set_run_font(run2, size=9, color=MUTED)


def add_body_rule(paragraph, color=BLUE, size="14"):
    ppr = paragraph._p.get_or_add_pPr()
    pbdr = OxmlElement("w:pBdr")
    bottom = OxmlElement("w:bottom")
    bottom.set(qn("w:val"), "single")
    bottom.set(qn("w:sz"), size)
    bottom.set(qn("w:space"), "1")
    bottom.set(qn("w:color"), color)
    pbdr.append(bottom)
    ppr.append(pbdr)


def add_heading(doc, text, level=1):
    p = doc.add_paragraph(text, style=f"Heading {level}")
    p.paragraph_format.keep_with_next = True
    return p


def add_body(doc, text, *, bold_prefix=None):
    p = doc.add_paragraph()
    if bold_prefix and text.startswith(bold_prefix):
        r1 = p.add_run(bold_prefix)
        set_run_font(r1, bold=True)
        r2 = p.add_run(text[len(bold_prefix):])
        set_run_font(r2)
    else:
        r = p.add_run(text)
        set_run_font(r)
    return p


def fmt_num(value, digits=2):
    return f"{value:,.{digits}f}"


data = json.loads(ANALYSIS_PATH.read_text(encoding="utf-8"))
s = data["summary"]

doc = Document()
section = doc.sections[0]
section.page_width = Inches(8.5)
section.page_height = Inches(11)
section.top_margin = Inches(1)
section.bottom_margin = Inches(1)
section.left_margin = Inches(1)
section.right_margin = Inches(1)
section.header_distance = Inches(0.492)
section.footer_distance = Inches(0.492)

# standard_business_brief preset
normal = doc.styles["Normal"]
normal.font.name = "Calibri"
normal._element.rPr.rFonts.set(qn("w:ascii"), "Calibri")
normal._element.rPr.rFonts.set(qn("w:hAnsi"), "Calibri")
normal._element.rPr.rFonts.set(qn("w:eastAsia"), "Microsoft YaHei")
normal.font.size = Pt(11)
normal.paragraph_format.space_before = Pt(0)
normal.paragraph_format.space_after = Pt(6)
normal.paragraph_format.line_spacing = 1.10
normal.paragraph_format.widow_control = True

for level, size, color, before, after in (
    (1, 16, BLUE, 16, 8),
    (2, 13, BLUE, 12, 6),
    (3, 12, DARK_BLUE, 8, 4),
):
    style = doc.styles[f"Heading {level}"]
    style.font.name = "Calibri"
    style._element.rPr.rFonts.set(qn("w:ascii"), "Calibri")
    style._element.rPr.rFonts.set(qn("w:hAnsi"), "Calibri")
    style._element.rPr.rFonts.set(qn("w:eastAsia"), "Microsoft YaHei")
    style.font.size = Pt(size)
    style.font.color.rgb = rgb(color)
    style.font.bold = True
    style.paragraph_format.space_before = Pt(before)
    style.paragraph_format.space_after = Pt(after)
    style.paragraph_format.keep_with_next = True

# memo_masthead running furniture: quiet, no header border
header_p = section.header.paragraphs[0]
header_p.alignment = WD_ALIGN_PARAGRAPH.LEFT
header_p.paragraph_format.space_after = Pt(0)
hr = header_p.add_run("反倾销税深度分析  |  白兰地（200升以下容器）")
set_run_font(hr, size=9, color=MUTED)
footer_p = section.footer.paragraphs[0]
footer_p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
add_page_field(footer_p)

# First page masthead
p = doc.add_paragraph()
p.paragraph_format.space_after = Pt(3)
r = p.add_run("贸易救济合规风险研究")
set_run_font(r, size=10.5, color=BLUE, bold=True)

p = doc.add_paragraph()
p.paragraph_format.space_after = Pt(5)
r = p.add_run("白兰地（200升以下容器）")
set_run_font(r, size=23, color="000000", bold=True)

p = doc.add_paragraph()
p.paragraph_format.space_after = Pt(14)
r = p.add_run("反倾销税、价格承诺与第三国转运风险深度分析报告")
set_run_font(r, size=14, color="373737")

for label, value in (
    ("措施对象", "原产于欧盟的进口相关白兰地；容器小于200升"),
    ("政策口径", "商务部公告2025年第34号；2025年7月5日起实施5年"),
    ("易迅口径", "2025年8月6日至2026年8月6日；200条/页；各查询全页逐条判定"),
    ("报告日期", "2026年8月12日（中国标准时间）"),
    ("证据原则", "已证实 / 高度疑似 / 线索 / 无法判断；平台字段不等同海关原始申报"),
):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(2)
    r1 = p.add_run(f"{label}：")
    set_run_font(r1, size=10.5, bold=True)
    r2 = p.add_run(value)
    set_run_font(r2, size=10.5)

rule = doc.add_paragraph()
rule.paragraph_format.space_before = Pt(8)
rule.paragraph_format.space_after = Pt(10)
add_body_rule(rule)

add_heading(doc, "一、执行摘要", 1)
add_callout(
    doc,
    "核心结论（证据等级：第三国实物转供已证实；逃避中国反倾销税无法认定）",
    "易迅逐票数据中形成一条高度具体的两段链：2026年6月24日，阿联酋EMIRATES AIRLINE IFS DEPARTMENT向印度尼西亚AEROFOOD INDONESIA供货“HENNESSY XO 5CL”6件、16.32kg、768.62美元；两天后AEROFOOD向CHINA AIRLINES发出同品6件、7kg、768.48美元，平台目的国字段为China。商品、数量、金额和主体在极短时滞内闭合，足以证明实物转供或航空补给链；但Aerofood官方业务是航空配餐/机上物流，且买方为航空公司，因此现有证据更支持机供品或航材补给，而非进入中国境内一般贸易。缺少中国进口报关单、进境口岸、贸易方式和税款缴款书，不能据此认定逃避反倾销税。",
    fill=PALE_GOLD,
    title_color=CAUTION,
)

add_caption(doc, "表1  主要结论及证据等级")
add_table(
    doc,
    ["事项", "量化规模", "证据等级", "研判"],
    [
        ["对华查询全量", f"501条查询命中；去重{s['uniqueRows']}票", "已证实", f"商品类型相关{s['relevantRows']}票，排除同词异物{s['excludedRows']}票"],
        ["欧盟原产直供", f"{s['euRows']}票；{fmt_num(s['euWeightKg'])}kg", "已证实", "应核容器容量、生产商税率、价格承诺文件与贸易方式"],
        ["第三国精确链", "1票后段；7kg；6件；USD 768.48", "实物链已证实 / 逃税无法判断", "阿联酋→印尼→平台标记中国；较可能航空配餐/机供品"],
        ["英国来源字段", "2票；24,013kg", "线索", "未发现法国/欧盟前段对应，不能仅凭英国发运认定绕道"],
        ["散装边界", f"{s['scope']['explicitBulk']}票；{fmt_num(s['explicitBulkWeightKg'],0)}kg", "已证实为待核边界", "罐式/散装迹象强；若容器≥200升则不在措施范围"],
        ["Hennessy价格承诺核查", f"{s['undertakingDirectRows']}票；{fmt_num(s['undertakingDirectWeightKg'])}kg", "合规核查线索", "金额缺失，无法测算实际应征税；需核承诺证明函、有效发票、MIP和贸易方式"],
    ],
    [1750, 1600, 1900, 4110],
)

add_heading(doc, "二、政策范围、税率与税款逻辑", 1)
add_body(doc, "商务部公告2025年第34号于2025年7月4日发布，自2025年7月5日起，对原产于欧盟、装入200升以下容器的蒸馏葡萄酒制得烈性酒征收反倾销税，实施期5年。税号为22082000，但税号只是参考；商品原料、用途和单个进口容器容量共同决定是否落入措施范围。装入200升及以上容器的同类商品明确排除。")
add_caption(doc, "表2  政策与计税要点")
add_table(
    doc,
    ["项目", "核验结论"],
    [
        ["受税来源", "欧盟原产。出口国、起运国或平台“报告国”不是决定性字段，原产地需由生产商、原产地证及报关申报支持。"],
        ["最终税率", "Martell & Co 27.7%；Jas Hennessy & Co 34.9%；E. Rémy Martin & C° 34.3%；其他合作公司32.2%；其他公司34.9%。"],
        ["价格承诺", "商务部接受34家企业价格承诺。满足最低价格、有效发票和承诺证明函时可不征反倾销税；违反承诺或承诺终止时按最终税率征收。"],
        ["限制条件", "价格承诺公开文本要求核验出口商/生产商、发票、证明函及贸易方式；加工贸易手册、保税区或保税仓库场景不得直接套用一般承诺免税结论。"],
        ["反规避", "价格承诺文本明确禁止经第三国转售/再出口、误导原产地/出口商身份、错误分类或改变贸易模式规避措施。"],
        ["税款公式", "反倾销税=海关确定计税价格×适用税率；反倾销税会进入进口消费税和进口增值税计税基础。其他酒消费税比例税率10%，一般进口货物增值税率13%。"],
    ],
    [2150, 7210],
)

add_callout(
    doc,
    "执法口径提醒",
    "“来源国字段不是欧盟”只能触发核查，不能自动证明原产地伪报；反之，“法国原产”也不能自动证明已经正确纳税。决定性材料包括中国进口报关单、原产地证、生产商身份、进口容器容量、商业发票、价格承诺证明函、贸易方式与税款缴款书。",
    fill=CALLOUT,
)

add_heading(doc, "三、易迅数据查询矩阵与逐票覆盖", 1)
add_body(doc, "查询期间统一为2025年8月6日至2026年8月6日。页面均切换为每页200条后，逐条采集全部结果；由于单个查询均少于200条，每个查询均为1页。对华三组结果合计501条查询命中，按日期、HS、描述、交易双方、重量/数量/金额、目的国和原产国去重后为199票。另对精确链前段执行HENNESSY→印度尼西亚查询，完整提取78票。")
add_caption(doc, "表3  易迅查询日志（均已全页完成）")
add_table(
    doc,
    ["查询ID", "筛选条件", "结果数", "覆盖说明"],
    [
        ["Q1", "目的国China；HS 220820；ARMAGNAC补充；一年", "144", "税号基线；ARMAGNAC未增加新记录"],
        ["Q2", "目的国China；关键词BRANDY；一年", "187", "逐条排除Brandy Melville、服装、标签等同词异物"],
        ["Q3", "目的国China；关键词COGNAC；一年", "170", "逐条排除皮革、鞋、颜色名等同词异物"],
        ["Q4", "目的国Indonesia；关键词HENNESSY；一年", "78", "为第三国后段线索追查前段；全部提取"],
    ],
    [900, 4600, 900, 2960],
)
add_body(doc, f"去重后的199票中，商品类型相关{s['relevantRows']}票、重量{fmt_num(s['weightKg'])}kg；同词异物或明显非饮料记录{s['excludedRows']}票。相关票中欧盟原产字段{s['euRows']}票、非欧盟字段{s['nonEuRows']}票。平台金额字段在中国进口提单类记录中大面积缺失，因此无法对欧盟直供总体反倾销税额作可靠汇总；不得用重量乘以猜测单价代替完税价格。")

add_caption(doc, "表4  相关记录按原产国字段分布")
origin_rows = []
for item in s["origins"]:
    origin_rows.append([item["name"], item["tickets"], fmt_num(item["weight"]), f"USD {fmt_num(item['amount'])}" if item["amount"] else "金额缺失/0"])
add_table(doc, ["原产国字段", "票数", "重量kg", "金额字段"], origin_rows, [2500, 1000, 2500, 3360], font_size=9)

add_heading(doc, "四、第三国绕道证据：阿联酋—印度尼西亚—平台标记中国", 1)
add_heading(doc, "4.1 两段记录逐字段匹配", 2)
add_caption(doc, "表5  精确匹配链路")
add_table(
    doc,
    ["字段", "前段A", "后段B", "匹配意义"],
    [
        ["日期/路线", "2026-06-24；UAE→Indonesia", "2026-06-26；Indonesia→China（平台）", "间隔2天，时间相容"],
        ["商品", "COGNAC MINI - HENNESSY XO (5 CL)", "同品，附BC.23.000197", "描述完全一致"],
        ["主体", "EMIRATES AIRLINE IFS DEPARTMENT→AEROFOOD INDONESIA", "AEROFOOD INDONESIA→CHINA AIRLINES", "中间主体完全重合"],
        ["数量", "6", "6", "数量完全一致"],
        ["重量", "16.32kg", "7kg", "不一致；可能存在毛/净重、包装或记录口径差"],
        ["金额", "USD 768.62", "USD 768.48", "仅差USD 0.14，强关联"],
    ],
    [1450, 2900, 2800, 2210],
)

add_heading(doc, "4.2 证据支持到哪一步", 2)
add_body(doc, "已证实：同一商品以相同数量、近乎相同金额，经Aerofood在两天内完成前后段转供。该事实超出单纯宏观流量同向，具备商品、时间、数量、金额和中间主体五重关联。")
add_body(doc, "未证实：后段是否真正作为一般贸易进入中国关境、在哪个口岸报关、是否申报欧盟原产、是否适用价格承诺、是否缴纳反倾销税。平台目的国“China”与买方CHINA AIRLINES不能替代中国海关申报事实；China Airlines为航空公司名称，不能据公司名推定货物目的地即中国大陆。")
add_body(doc, "替代解释：Aerowisata官方资料称Aerofood ACS从事航空配餐、机上物流、饮料供应和自有仓储，并服务40多家商业航空公司。因此，该链更符合航空器机供品/机上服务补给。重量差异也与包装/毛净重或航空供应场景相容。")

add_callout(
    doc,
    "置信度结论",
    "实物转供链：已证实。欧盟原产经第三国伪报：线索（商品为法国受保护产区/品牌，但平台原产字段为Indonesia；尚无原产地证或生产商证据）。逃避中国反倾销税：无法判断。建议首先调取两票原始提单、航班号、舱单、机供品备案、中国进境报关单和税款缴款书。",
    fill=PALE_GREEN,
    title_color="176B35",
)

add_heading(doc, "4.3 条件性少缴税款测算", 2)
add_body(doc, "仅为刻画风险敞口，假设后段USD 768.48可近似海关计税价格、货物确以一般贸易进入中国、实际欧盟原产且应按Hennessy 34.9%征税、价格承诺不适用，并暂不考虑关税及从量税因素。")
add_caption(doc, "表6  条件性税款差额（不是已认定欠税）")
add_table(
    doc,
    ["税种", "计算", "金额USD", "性质"],
    [
        ["反倾销税", "768.48×34.9%", "268.30", "直接可能少缴"],
        ["进口消费税差额", "268.30×10%÷(1−10%)", "29.81", "因反倾销税进入组成计税价格而连带增加"],
        ["进口增值税差额", "(268.30+29.81)×13%", "38.75", "因AD和新增消费税进入计税基础而连带增加"],
        ["合计", "268.30+29.81+38.75", "336.86", "仅在上述全部假设成立时"],
    ],
    [2200, 2600, 1500, 3060],
)

add_heading(doc, "五、其他重点主体与风险边界", 1)
add_heading(doc, "5.1 欧盟直供与价格承诺企业", 2)
add_body(doc, f"5票、{fmt_num(s['undertakingDirectWeightKg'])}kg记录指向JAS HENNESSY & CO与MOET HENNESSY SHANGHAI/DIAGEO (CHINA)。这些是价格承诺合规核查对象，不应因企业名称出现就推定漏税。平台金额字段均缺失，现阶段不能给出实际反倾销税金额。核查重点是：有效商业发票、价格承诺证明函、最低价格、生产商/出口商对应、贸易方式，以及税款缴款书。")

add_heading(doc, "5.2 散装/罐式运输边界", 2)
add_body(doc, f"18票、{fmt_num(s['explicitBulkWeightKg'],0)}kg记录指向STOLT TANK CONTAINERS及罐式/散装描述。措施明确排除装入200升及以上容器的商品，因此大宗重量不能直接计入涉税数量。应以每个进口容器的实际容量、罐号、装箱单和报关品名核定。若证实为罐式容器≥200升，应从措施数量中排除；若只是运输设备而商品实际分装小于200升，则需重新评估。")

add_heading(doc, "5.3 英国字段两票", 2)
add_caption(doc, "表7  英国来源/原产字段核查线索")
add_table(
    doc,
    ["日期", "主体", "数量", "研判"],
    [
        ["2026-05-05", "HILLEBRAND GORI (SCOTLAND) LTD→HILLEBRAND GORI CHINA", "1,000；10,595kg", "酒类物流商链路明确，但无法国/欧盟前段和品牌字段；需查前段提单、生产商及原产地证"],
        ["2026-03-03", "CHARLES EDGE LONDON LTD→TENGYI (XIAMEN) TRADING", "560；13,418kg", "品名宽泛，现有字段不足以指向欧盟原产绕道；保留为低等级线索"],
    ],
    [1400, 3000, 1700, 3260],
)
add_body(doc, "DHL官方资料表明Hillebrand Gori专门从事饮料、葡萄酒和烈酒物流，这使其成为合理的行业承运/货代主体，也使前段货源核查具有价值；但物流专业属性本身既不是违法证据，也不能证明英国是虚假原产地。")

add_heading(doc, "5.4 需重点核验的中国端主体", 2)
add_caption(doc, "表8  主体优先级（来自易迅记录，不等同违法主体名单）")
add_table(
    doc,
    ["主体/主体组", "易迅规模", "角色", "优先核验事项"],
    [
        ["MOET HENNESSY SHANGHAI / DIAGEO (CHINA)", "5票；187,956.8kg", "进口人/品牌关联", "价格承诺证明函、发票、MIP、贸易方式、缴税凭证"],
        ["STOLT-NIELSEN / STOLT TANK CONTAINERS", "18票；824,975kg", "罐式/散装物流", "单罐容量、罐号、装箱单；确认≥200升排除边界"],
        ["HILLEBRAND GORI CHINA及法国/苏格兰网络", "多票；含英国10,595kg", "酒类物流/货代", "前段生产商、原产地证、换单和口岸记录"],
        ["SHANGHAI RC TRADING / CLS REMY COINTREAU", "15票；1,041,612.7kg", "进口/供应链", "生产商识别、容器容量、适用税率或承诺资格"],
        ["AEROFOOD INDONESIA / CHINA AIRLINES", "后段1票；7kg", "航空配餐/航空公司", "航班号、机供品备案、是否进入中国关境"],
    ],
    [2600, 1800, 1800, 3160],
)

add_heading(doc, "六、公开互联网检索结论", 1)
add_body(doc, "公开互联网检索确认了政策、税率和税款公式，也确认Aerofood的航空配餐/机上物流属性、Hillebrand Gori的酒类物流专业属性，以及欧盟就中国白兰地措施提起的WTO争端。公开来源没有提供某一企业借印度尼西亚、英国、新加坡或其他第三国伪报原产地进入中国、并少缴中国反倾销税的可核实案例。")
add_body(doc, "因此，互联网材料对本案的作用主要是提供替代解释和合规背景，而非补足逃税闭环。不能用行业争端、转运能力或第三国酒类进口增加替代逐票原产地、报关和税款证据。")

add_heading(doc, "七、后续核查清单与执法取证顺序", 1)
add_caption(doc, "表9  建议按证据增益排序调取资料")
add_table(
    doc,
    ["优先级", "对象", "具体资料", "可回答的问题"],
    [
        ["P1", "印尼精确链", "两票原始提单/申报记录、舱单、航班号、装箱单、机供品或航空器物料备案、中国进境报关单", "是否真正进入中国关境；是否为机供品；原产地如何申报"],
        ["P1", "Hennessy直供5票", "商业发票、价格承诺证明函、最低价格核对、报关单、贸易方式、反倾销税及进口税缴款书", "承诺是否有效；是否存在应征未征；实际税额是多少"],
        ["P1", "散装18票", "单罐容量、罐号、运输合同、装箱单、报关品名与包装字段", "是否因≥200升而排除，避免把不涉税货物误判为风险"],
        ["P2", "英国2票", "英国前段进口/生产记录、原产地证、生产商、换单、集装箱/船名航次、到中国口岸资料", "是否实际法国/欧盟原产经英国再出口"],
        ["P2", "中国端进口/货代主体", "统一社会信用代码、报关企业、代理报关委托、口岸、税则归类变更历史", "识别重复主体、固定代理链和HS/原产地申报异常"],
    ],
    [950, 1850, 4100, 2460],
)

add_heading(doc, "八、证据限制与使用边界", 1)
add_body(doc, "第一，易迅数据是贸易情报平台记录集合，覆盖国家、字段和更新日期不一致，不能视为中国海关全量申报。第二，环球提单类记录金额大量为0或空白，0不代表货值为0。第三，目的国、报告国、起运国和原产国字段可能来自不同国家报关口径，平台“China”也不必然等同中国大陆一般贸易进口。第四，名称相似、相同HS或宏观流量只能形成线索，不能证明原产地伪报。第五，本报告仅用于合规核查和风险识别，不构成对企业违法、欠税或走私的认定。")
add_callout(doc, "最终研判", "目前最强证据是一条航空供应场景下的精确第三国转供链；它值得调取原始单证，但现有证据反而提供了合理的机供品替代解释。白兰地项下尚未发现可直接证明“欧盟原产→第三国换产地→中国一般贸易进口→未缴反倾销税”的闭环。", fill=PALE_RED, title_color=RISK_RED)

add_heading(doc, "附录：公开来源与工作底稿", 1)
sources = [
    ("商务部", "公告2025年第34号（范围、期限、公式及附件）", "https://cacs.mofcom.gov.cn/cacscms/article/jkdc?articleId=184863&type=1"),
    ("国家税务总局", "《中华人民共和国消费税暂行条例》（其他酒10%）", "https://fgk.chinatax.gov.cn/zcfgk/c100010/c5194422/content.html"),
    ("国家税务总局12366", "2019年第39号公告（进口货物13%增值税）", "https://12366.chinatax.gov.cn/bzds/118/118-1-8.html"),
    ("Aerowisata", "Aerofood Foodservice（航空配餐、机上物流和饮料供应）", "https://www.aerowisata.com/id/foodservice/"),
    ("DHL Group", "Hillebrand Gori酒类和散装液体物流专业属性", "https://group.dhl.com/en/media-relations/press-releases/2022/j-f-hillebrand-group-ag-is-now-part-of-dhl-global-forwarding-freight.html"),
    ("WTO", "DS631：欧盟诉中国白兰地临时反倾销措施", "https://www.wto.org/english/tratop_e/dispu_e/cases_e/ds631_e.htm"),
]
table = add_table(doc, ["来源", "支持内容", "链接"], [[a, b, ""] for a, b, _ in sources], [1700, 5600, 2060], font_size=9)
for idx, (_, _, url) in enumerate(sources, start=1):
    p = table.cell(idx, 2).paragraphs[0]
    add_hyperlink(p, "打开官方页面", url)

add_body(doc, "易迅原始查询文件：易迅_HS220820_ARMAGNAC查询_全部144条.json、易迅_BRANDY_全部187条.json、易迅_COGNAC_全部170条.json、易迅_HENNESSY至印度尼西亚_全部78条.json。逐票标准化判定、全量78条前段记录和公式测算见同目录《白兰地_易迅逐票判定台账.xlsx》。")

# Core properties and save
doc.core_properties.title = "白兰地（200升以下容器）反倾销税与第三国转运风险深度分析报告"
doc.core_properties.subject = "中国进口反倾销税合规、价格承诺与第三国转运风险"
doc.core_properties.author = "反倾销税风险分析项目"
doc.core_properties.keywords = "白兰地, 反倾销税, 欧盟, 价格承诺, 第三国转运, 易迅数据"
doc.core_properties.comments = "基于公开资料与易迅逐票数据形成；不构成违法认定。"

doc.save(OUT_PATH)
print(json.dumps({"output": str(OUT_PATH), "tables": len(doc.tables), "paragraphs": len(doc.paragraphs)}, ensure_ascii=False, indent=2))
