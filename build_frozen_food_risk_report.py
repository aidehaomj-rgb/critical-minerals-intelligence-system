from __future__ import annotations

from pathlib import Path
from datetime import date

from docx import Document
from docx.enum.section import WD_SECTION_START
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK, WD_LINE_SPACING
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor


ROOT = Path(r"C:\Users\59809\Documents\关键矿产")
OUT_DIR = ROOT / "outputs"
OUT_DIR.mkdir(parents=True, exist_ok=True)
OUT_PATH = OUT_DIR / "粤港澳大湾区重点水运口岸冻品夹藏与绕关走私风险分析报告_20260808.docx"

# Resolved preset: standard_business_brief.
# Named overrides:
# 1) CJK glyphs use Microsoft YaHei while Latin remains Calibri.
# 2) Risk-status fills use pale red/gold/green for consistent semantic signaling.
# 3) Title block follows memo_masthead, with a 0.75 pt rule below metadata.

COLORS = {
    "blue": "2E74B5",
    "dark_blue": "1F4D78",
    "navy": "0B2545",
    "muted": "687386",
    "light_gray": "F2F4F7",
    "blue_gray": "E8EEF5",
    "callout": "F4F6F9",
    "border": "B8C2CC",
    "risk_red": "9B1C1C",
    "risk_red_fill": "FDECEC",
    "gold": "7A5A00",
    "gold_fill": "FFF2CC",
    "medium_fill": "FFF8E8",
    "green": "2F6B3B",
    "green_fill": "E2F0D9",
    "white": "FFFFFF",
    "black": "000000",
}


def set_cell_shading(cell, fill: str) -> None:
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def set_cell_margins(cell, top=80, start=120, bottom=80, end=120) -> None:
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


def set_table_borders(table, color="B8C2CC", size="4") -> None:
    tbl_pr = table._tbl.tblPr
    borders = tbl_pr.find(qn("w:tblBorders"))
    if borders is None:
        borders = OxmlElement("w:tblBorders")
        tbl_pr.append(borders)
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        tag = borders.find(qn(f"w:{edge}"))
        if tag is None:
            tag = OxmlElement(f"w:{edge}")
            borders.append(tag)
        tag.set(qn("w:val"), "single")
        tag.set(qn("w:sz"), size)
        tag.set(qn("w:space"), "0")
        tag.set(qn("w:color"), color)


def set_repeat_table_header(row) -> None:
    tr_pr = row._tr.get_or_add_trPr()
    tbl_header = OxmlElement("w:tblHeader")
    tbl_header.set(qn("w:val"), "true")
    tr_pr.append(tbl_header)


def set_cant_split(row) -> None:
    tr_pr = row._tr.get_or_add_trPr()
    cant_split = OxmlElement("w:cantSplit")
    tr_pr.append(cant_split)


def set_table_geometry(table, widths_dxa: list[int]) -> None:
    total = sum(widths_dxa)
    table.autofit = False
    table.alignment = WD_TABLE_ALIGNMENT.LEFT
    tbl_pr = table._tbl.tblPr
    tbl_layout = tbl_pr.find(qn("w:tblLayout"))
    if tbl_layout is None:
        tbl_layout = OxmlElement("w:tblLayout")
        tbl_pr.append(tbl_layout)
    tbl_layout.set(qn("w:type"), "fixed")
    tbl_w = tbl_pr.find(qn("w:tblW"))
    if tbl_w is None:
        tbl_w = OxmlElement("w:tblW")
        tbl_pr.append(tbl_w)
    tbl_w.set(qn("w:w"), str(total))
    tbl_w.set(qn("w:type"), "dxa")
    tbl_ind = tbl_pr.find(qn("w:tblInd"))
    if tbl_ind is None:
        tbl_ind = OxmlElement("w:tblInd")
        tbl_pr.append(tbl_ind)
    tbl_ind.set(qn("w:w"), "120")
    tbl_ind.set(qn("w:type"), "dxa")

    grid = table._tbl.tblGrid
    for child in list(grid):
        grid.remove(child)
    for width in widths_dxa:
        col = OxmlElement("w:gridCol")
        col.set(qn("w:w"), str(width))
        grid.append(col)

    for row in table.rows:
        for idx, cell in enumerate(row.cells):
            w = widths_dxa[min(idx, len(widths_dxa) - 1)]
            tc_pr = cell._tc.get_or_add_tcPr()
            tc_w = tc_pr.find(qn("w:tcW"))
            if tc_w is None:
                tc_w = OxmlElement("w:tcW")
                tc_pr.append(tc_w)
            tc_w.set(qn("w:w"), str(w))
            tc_w.set(qn("w:type"), "dxa")
            set_cell_margins(cell)
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER


def set_run_font(run, size=11, bold=None, italic=None, color="000000", latin="Calibri", east_asia="Microsoft YaHei") -> None:
    run.font.name = latin
    run._element.get_or_add_rPr().get_or_add_rFonts().set(qn("w:ascii"), latin)
    run._element.get_or_add_rPr().get_or_add_rFonts().set(qn("w:hAnsi"), latin)
    run._element.get_or_add_rPr().get_or_add_rFonts().set(qn("w:eastAsia"), east_asia)
    run.font.size = Pt(size)
    run.font.color.rgb = RGBColor.from_string(color)
    if bold is not None:
        run.bold = bold
    if italic is not None:
        run.italic = italic


def set_cell_text(cell, text: str, *, bold=False, color="000000", size=9.2, align=WD_ALIGN_PARAGRAPH.LEFT) -> None:
    cell.text = ""
    p = cell.paragraphs[0]
    p.alignment = align
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.line_spacing = 1.08
    r = p.add_run(text)
    set_run_font(r, size=size, bold=bold, color=color)


def add_field(run, instruction: str) -> None:
    fld_char1 = OxmlElement("w:fldChar")
    fld_char1.set(qn("w:fldCharType"), "begin")
    instr_text = OxmlElement("w:instrText")
    instr_text.set(qn("xml:space"), "preserve")
    instr_text.text = instruction
    fld_char2 = OxmlElement("w:fldChar")
    fld_char2.set(qn("w:fldCharType"), "end")
    run._r.append(fld_char1)
    run._r.append(instr_text)
    run._r.append(fld_char2)


def add_hyperlink(paragraph, text: str, url: str, *, color="2E74B5", underline=True, size=8.5):
    part = paragraph.part
    r_id = part.relate_to(url, "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink", is_external=True)
    hyperlink = OxmlElement("w:hyperlink")
    hyperlink.set(qn("r:id"), r_id)
    new_run = OxmlElement("w:r")
    r_pr = OxmlElement("w:rPr")
    r_fonts = OxmlElement("w:rFonts")
    r_fonts.set(qn("w:ascii"), "Calibri")
    r_fonts.set(qn("w:hAnsi"), "Calibri")
    r_fonts.set(qn("w:eastAsia"), "Microsoft YaHei")
    r_pr.append(r_fonts)
    c = OxmlElement("w:color")
    c.set(qn("w:val"), color)
    r_pr.append(c)
    sz = OxmlElement("w:sz")
    sz.set(qn("w:val"), str(int(size * 2)))
    r_pr.append(sz)
    if underline:
        u = OxmlElement("w:u")
        u.set(qn("w:val"), "single")
        r_pr.append(u)
    new_run.append(r_pr)
    t = OxmlElement("w:t")
    t.text = text
    new_run.append(t)
    hyperlink.append(new_run)
    paragraph._p.append(hyperlink)


def add_bottom_border(paragraph, color="2E74B5", size="10", space="8") -> None:
    p_pr = paragraph._p.get_or_add_pPr()
    pbdr = p_pr.find(qn("w:pBdr"))
    if pbdr is None:
        pbdr = OxmlElement("w:pBdr")
        p_pr.append(pbdr)
    bottom = OxmlElement("w:bottom")
    bottom.set(qn("w:val"), "single")
    bottom.set(qn("w:sz"), size)
    bottom.set(qn("w:space"), space)
    bottom.set(qn("w:color"), color)
    pbdr.append(bottom)


def configure_document(doc: Document) -> None:
    section = doc.sections[0]
    section.page_width = Inches(8.5)
    section.page_height = Inches(11)
    section.top_margin = Inches(1)
    section.right_margin = Inches(1)
    section.bottom_margin = Inches(1)
    section.left_margin = Inches(1)
    section.header_distance = Inches(0.492)
    section.footer_distance = Inches(0.492)

    styles = doc.styles
    normal = styles["Normal"]
    normal.font.name = "Calibri"
    normal._element.rPr.rFonts.set(qn("w:ascii"), "Calibri")
    normal._element.rPr.rFonts.set(qn("w:hAnsi"), "Calibri")
    normal._element.rPr.rFonts.set(qn("w:eastAsia"), "Microsoft YaHei")
    normal.font.size = Pt(11)
    normal.paragraph_format.space_before = Pt(0)
    normal.paragraph_format.space_after = Pt(6)
    normal.paragraph_format.line_spacing = 1.10

    for name, size, color, before, after in (
        ("Heading 1", 16, COLORS["blue"], 16, 8),
        ("Heading 2", 13, COLORS["blue"], 12, 6),
        ("Heading 3", 12, COLORS["dark_blue"], 8, 4),
    ):
        st = styles[name]
        st.font.name = "Calibri"
        st._element.rPr.rFonts.set(qn("w:ascii"), "Calibri")
        st._element.rPr.rFonts.set(qn("w:hAnsi"), "Calibri")
        st._element.rPr.rFonts.set(qn("w:eastAsia"), "Microsoft YaHei")
        st.font.size = Pt(size)
        st.font.bold = True
        st.font.color.rgb = RGBColor.from_string(color)
        st.paragraph_format.space_before = Pt(before)
        st.paragraph_format.space_after = Pt(after)
        st.paragraph_format.line_spacing = 1.0
        st.paragraph_format.keep_with_next = True

    for style_name in ("Table Grid",):
        st = styles[style_name]
        st.font.name = "Calibri"
        st._element.rPr.rFonts.set(qn("w:eastAsia"), "Microsoft YaHei")
        st.font.size = Pt(9.2)


def set_header_footer(section) -> None:
    header = section.header
    p = header.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.space_after = Pt(0)
    r = p.add_run("重点水运口岸冻品走私风险分析")
    set_run_font(r, size=8.5, bold=True, color=COLORS["muted"])
    r = p.add_run("    |    公开来源初步评估")
    set_run_font(r, size=8.5, color=COLORS["muted"])

    footer = section.footer
    table = footer.add_table(rows=1, cols=3, width=Inches(6.5))
    set_table_geometry(table, [3120, 3120, 3120])
    # Footer is intentionally borderless; remove borders.
    tbl_pr = table._tbl.tblPr
    borders = OxmlElement("w:tblBorders")
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        tag = OxmlElement(f"w:{edge}")
        tag.set(qn("w:val"), "nil")
        borders.append(tag)
    tbl_pr.append(borders)
    entries = [
        (0, "基准日：2026-08-08", WD_ALIGN_PARAGRAPH.LEFT),
        (1, "内部研判参考｜非执法结论", WD_ALIGN_PARAGRAPH.CENTER),
    ]
    for idx, txt, align in entries:
        p = table.cell(0, idx).paragraphs[0]
        p.alignment = align
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(txt)
        set_run_font(r, size=8, color=COLORS["muted"])
    p = table.cell(0, 2).paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p.paragraph_format.space_after = Pt(0)
    r = p.add_run("第 ")
    set_run_font(r, size=8, color=COLORS["muted"])
    field_run = p.add_run()
    set_run_font(field_run, size=8, color=COLORS["muted"])
    add_field(field_run, "PAGE")
    r = p.add_run(" / ")
    set_run_font(r, size=8, color=COLORS["muted"])
    field_run = p.add_run()
    set_run_font(field_run, size=8, color=COLORS["muted"])
    add_field(field_run, "NUMPAGES")


def add_title_page(doc: Document) -> None:
    for _ in range(2):
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(12)

    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(6)
    r = p.add_run("风险分析报告")
    set_run_font(r, size=11, bold=True, color=COLORS["gold"])

    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(8)
    r = p.add_run("粤港澳大湾区重点水运口岸\n冻品夹藏与绕关走私风险分析")
    set_run_font(r, size=25, bold=True, color=COLORS["navy"])

    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(24)
    r = p.add_run("——南沙、东莞沙田及拱北海关管辖码头口岸；兼论山姆澳洲牛肉涨价与印度水牛肉经第三国绕道风险")
    set_run_font(r, size=13, color=COLORS["dark_blue"])

    metadata = [
        ("评估范围", "正规设关码头的夹藏/伪报风险，以及周边水域、非设关地绕关风险"),
        ("报告基准日", "2026年8月8日"),
        ("资料基础", "政府、海关、司法机关、港口公开资料及公开贸易统计"),
        ("证据边界", "未使用外贸公社数据；未取得企业级提单、报关单、采购合同或批次追溯材料"),
        ("使用提示", "风险研判，不构成对山姆或任何具体企业、人员违法行为的认定"),
    ]
    for label, value in metadata:
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.line_spacing = 1.05
        r = p.add_run(f"{label}：")
        set_run_font(r, size=10.5, bold=True, color=COLORS["navy"])
        r = p.add_run(value)
        set_run_font(r, size=10.5, color=COLORS["black"])
    rule = doc.add_paragraph()
    rule.paragraph_format.space_after = Pt(18)
    add_bottom_border(rule, color=COLORS["blue"], size="12", space="6")

    t = doc.add_table(rows=1, cols=1)
    set_table_geometry(t, [9360])
    set_table_borders(t, color=COLORS["blue_gray"], size="4")
    c = t.cell(0, 0)
    set_cell_shading(c, COLORS["callout"])
    set_cell_text(
        c,
        "核心提示：山姆澳洲牛肉涨价与2026年澳大利亚国别配额触发、配额外加征55%关税在时间和机制上高度吻合；它会提高灰色市场套利诱因，但公开资料不能据此推出山姆供应链存在走私冻品。当前更值得关注的是涨价外溢至批发、餐饮、加工和电商渠道后，对低价来源不明冻牛肉的需求拉动。",
        size=10.5,
        color=COLORS["navy"],
    )
    doc.add_page_break()


def add_heading(doc, text: str, level=1):
    return doc.add_heading(text, level=level)


def add_body(doc, text: str, *, bold_prefix: str | None = None, color="000000", after=6, keep=False):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(after)
    p.paragraph_format.keep_together = keep
    if bold_prefix and text.startswith(bold_prefix):
        r = p.add_run(bold_prefix)
        set_run_font(r, size=11, bold=True, color=color)
        r = p.add_run(text[len(bold_prefix):])
        set_run_font(r, size=11, color=color)
    else:
        r = p.add_run(text)
        set_run_font(r, size=11, color=color)
    return p


def add_small_note(doc, text: str):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.0
    r = p.add_run(text)
    set_run_font(r, size=8.5, color=COLORS["muted"])
    return p


def add_bullet(doc, text: str, level=0):
    p = doc.add_paragraph(style=None)
    p.style = doc.styles["Normal"]
    p.paragraph_format.left_indent = Inches(0.5 + 0.25 * level)
    p.paragraph_format.first_line_indent = Inches(-0.25)
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.line_spacing = 1.167
    p_pr = p._p.get_or_add_pPr()
    num_pr = OxmlElement("w:numPr")
    ilvl = OxmlElement("w:ilvl")
    ilvl.set(qn("w:val"), str(level))
    num_id = OxmlElement("w:numId")
    num_id.set(qn("w:val"), "1")
    num_pr.append(ilvl)
    num_pr.append(num_id)
    p_pr.append(num_pr)
    r = p.add_run(text)
    set_run_font(r, size=11)
    return p


def add_table(doc, headers: list[str], rows: list[list[str]], widths: list[int], *, font_size=9.0, fills: dict[int, str] | None = None):
    table = doc.add_table(rows=1, cols=len(headers))
    set_table_geometry(table, widths)
    set_table_borders(table)
    hdr = table.rows[0]
    set_repeat_table_header(hdr)
    set_cant_split(hdr)
    for i, h in enumerate(headers):
        set_cell_shading(hdr.cells[i], COLORS["light_gray"])
        set_cell_text(hdr.cells[i], h, bold=True, color=COLORS["navy"], size=font_size)
    for r_idx, row in enumerate(rows):
        cells = table.add_row().cells
        set_cant_split(table.rows[-1])
        for i, val in enumerate(row):
            if fills and r_idx in fills:
                set_cell_shading(cells[i], fills[r_idx])
            set_cell_text(cells[i], str(val), size=font_size)
    # Reapply geometry after rows are added.
    set_table_geometry(table, widths)
    return table


def add_callout(doc, label: str, text: str, fill="E8EEF5", color="0B2545"):
    t = doc.add_table(rows=1, cols=1)
    set_table_geometry(t, [9360])
    set_table_borders(t, color=COLORS["border"], size="4")
    c = t.cell(0, 0)
    set_cell_shading(c, fill)
    c.text = ""
    p = c.paragraphs[0]
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.line_spacing = 1.08
    r = p.add_run(f"{label}：")
    set_run_font(r, size=10.2, bold=True, color=color)
    r = p.add_run(text)
    set_run_font(r, size=10.2, color=color)
    return t


def add_source_link(doc, num: int, title: str, org_date: str, url: str):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.0
    r = p.add_run(f"[{num}] {title}，{org_date}。 ")
    set_run_font(r, size=8.5, color=COLORS["black"])
    add_hyperlink(p, "在线来源", url, size=8.5)


def build_report() -> None:
    doc = Document()
    configure_document(doc)
    set_header_footer(doc.sections[0])
    add_title_page(doc)

    add_heading(doc, "执行摘要", 1)
    add_body(doc, "本报告把“正规口岸夹藏/伪报”和“非设关地绕关”作为两类不同风险评估。前者依附合法舱单、冷藏箱和申报链条，主要表现为品名、原产地、生产企业、数量或证书异常；后者通常绕开口岸查验，以海上接驳、快艇/小船转运、非设关码头卸载及冻库中转为链条。公开案例表明，珠江口历史上规模更大、可验证性更强的是后者。")

    summary_rows = [
        ["山姆澳洲牛肉涨价", "直接涉私风险：低\n市场外溢风险：中高", "涨价与澳洲配额用尽、配额外加征55%关税相吻合；没有公开证据指向山姆采购链涉私。涨价会扩大低价非法冻肉与合规澳牛之间的价差。", "中高"],
        ["南沙正规口岸", "中", "超大冷链和高吞吐带来夹藏/伪报暴露面；指定监管场地和数字化监控形成明显控制抵消。", "中高"],
        ["南沙周边水域/非设关点", "高", "典型案例已证实以南沙水道、黑码头、冻库中转实施冻品走私。", "高"],
        ["东莞沙田正规口岸", "中", "对越直航、冷藏插头和综合货流提高第三国货物流入可达性；重点风险在原产地、单证、货物一致性。", "中"],
        ["东莞辖区水域/非设关点", "中高", "2025年东莞辖区海域查获220余吨无合法来源、未经检验检疫冻品，说明现实威胁仍在。", "中高"],
        ["拱北海关辖区码头及水域", "正规港区：中低—中\n万山/担杆等海域：很高", "珠海港口岸点多线长；公开案例显示珠江口、担杆岛周边存在大批量海上绕关历史。", "高"],
        ["印度水牛肉经越南等第三国", "总体：中高", "印度对越南出口规模大、单位价值低，具备供应与套利基础；风险更可能通过中越边境或珠江口非设关链条兑现。", "中高"],
    ]
    add_table(doc, ["研判对象", "风险等级", "核心判断", "证据置信度"], summary_rows, [1740, 1560, 4680, 1380], font_size=8.6)
    add_small_note(doc, "注：等级为定性剩余风险，不代表案件发生概率；“很高”用于需要优先配置核查资源的场景。证据置信度衡量公开资料对该判断的支持程度。")

    add_heading(doc, "结论先行", 2)
    for item in [
        "价格信号不是违法证据。2026年6月18日澳大利亚牛肉进口达到年度国别配额100%，自第3日起配额外进口在现行税率基础上加征55%关税；7月初山姆多款澳洲牛肉价格上调，时间上紧随政策成本冲击。[1][2][3]",
        "政策冲击会改变走私经济性。合规澳牛的边际进口成本抬升后，未经准入的低价冻肉、虚假原产地货物和来源不明替代品的套利空间增加；最先承压的通常不是大型会员店的封闭采购链，而是价格敏感、追溯较弱的批发、餐饮、加工和电商渠道。",
        "三地应分“口岸内”和“口岸外”监管。南沙、沙田正规口岸均有完整舱单、查验和场所控制，夹藏仍有风险但并非最高；珠江口水域、岛屿锚地、非设关码头与冻库的跨链条联动，才是公开案例反复出现的高风险结构。[8][9][10][11]",
        "印度货的核心是水牛肉（carabeef），不能与山姆澳大利亚谷饲牛肉作同质商品比较。其低单位价值能强化替代和掺混动机，但若进入中国市场，最可能出现在去骨冻肉、切片、碎肉、调理肉或深加工环节。",
        "“印度—越南—中国”具备结构性风险，不等于已证实具体批次绕道。2025年公开贸易数据中，印度对越南HS 020230出口约17.06万吨、约6.24亿美元；越南又具备贴近中国的陆海通道。判断必须进一步依靠企业、提单、报关、冷库和批次数据闭环。",
    ]:
        add_bullet(doc, item)

    add_heading(doc, "1. 范围、定义与方法", 1)
    add_heading(doc, "1.1 研究对象", 2)
    add_body(doc, "空间范围包括广州南沙口岸及周边水道、东莞港沙田港区及东莞辖区水域，以及拱北海关辖区内珠海港口岸相关港区与邻近万山群岛水域。根据2024年国务院批复后的整合口径，珠海港口岸相应设置高栏、斗门、洪湾、九洲、万山、唐家六个港区。[7]")
    add_body(doc, "商品范围以冻牛肉为主，并将冻鸡爪、猪副产品等历史查获物作为走私网络能力的旁证。重点关注HS 0201、0202、0206及可能用于加工或伪报的HS 1602等。")

    add_heading(doc, "1.2 概念拆分", 2)
    mechanism_rows = [
        ["正规口岸夹藏", "将未申报冻品混入合法冷藏箱或其他申报货物；也包括箱内货物与舱单/装箱单不一致", "箱单差异、重量密度、扫描图像、开箱比例、温度曲线"],
        ["正规口岸伪报", "伪报品名、数量、价格、原产地、生产企业或用途，配套虚假证书/标签", "准入清单、CIFER注册、健康证、原产地证、生产批号、估价"],
        ["海上绕关", "在境外或锚地由母船转驳至小型船舶，经非设关水域/码头卸货", "AIS异常、夜间靠泊、船货不匹配、岸线视频、船车接驳"],
        ["第三国绕道", "货物经越南等地换单、换签、换包装、简单加工或虚构原产地后再进入中国", "上游印度货源、短停留再出口、产能不匹配、包装内外层冲突"],
        ["掺混/替代", "在切片、碎肉、调理或餐饮加工环节，以低价水牛肉替代或混入标称牛肉", "批次追溯、物种PCR、采购量—销量平衡、配方和损耗"],
    ]
    add_table(doc, ["风险类型", "定义", "主要核查抓手"], mechanism_rows, [1680, 4320, 3360], font_size=8.8)

    add_heading(doc, "1.3 评级方法与证据边界", 2)
    add_body(doc, "评级综合考虑四项因素：可实现性（航线、码头、冷链和周边水域条件）、经济动机（价差、税负和市场需求）、历史验证（司法/执法案例）、控制强度（指定监管场地、单证核验、视频、查验与追溯）。本报告不把单一价格、单一航线或单一历史案件作为当前违法结论。")
    add_callout(doc, "重要限制", "外贸公社账号已过期，本次未调用、未抓取也未引用其数据。因此，报告不能识别具体提单、发货人、收货人、集装箱或企业关系网络；所有企业级结论均标记为“待核验”。", fill=COLORS["medium_fill"], color=COLORS["gold"])

    add_heading(doc, "2. 市场与政策背景：山姆牛肉为何涨价", 1)
    add_heading(doc, "2.1 配额触发构成最强解释变量", 2)
    add_body(doc, "商务部自2026年1月1日起对进口牛肉实施为期三年的国别配额及配额外加征关税措施。澳大利亚年度配额分别为2026年20.5万吨、2027年20.9万吨、2028年21.3万吨；三年配额外加征税率均为55%。2026年6月18日，澳大利亚进口量达到当年配额100%，按照“达到规定数量第3日起”执行的规则，配额外货物自6月20日起承受显著额外税负。[1][2]")

    price_rows = [
        ["澳洲谷饲上脑薄切 800g", "109.4元", "125.4元", "+14.6%"],
        ["澳洲谷饲牛霖 1200g", "约119.7元", "161.7元", "+35.1%"],
        ["澳洲谷饲肥牛薄片 900g", "105.1元", "123.1元", "+17.1%"],
    ]
    add_table(doc, ["公开报道SKU", "调整前", "调整后", "涨幅"], price_rows, [3780, 1740, 1740, 2100], font_size=9.0)
    add_small_note(doc, "来源：光明网转载经济日报综合报道，2026年7月5日。报道同时引述山姆客服称，涨价与澳洲牛肉进口配额及贸易政策导致供应链成本上升有关。[3] 该表为公开价格样本，不代表全部门店和全部SKU。")

    add_heading(doc, "2.2 涨价与走私风险之间的真实传导", 2)
    transmission_rows = [
        ["成本冲击", "澳牛配额外税负上升，合规到岸成本提高", "已证实"],
        ["零售调价", "部分山姆澳牛SKU提价或线上供应收紧", "公开报道支持"],
        ["需求替代", "消费者/餐饮转向更便宜部位、其他产地或加工肉", "高概率推断"],
        ["非法套利", "来源不明冻肉、伪原产地或未经准入货物的价差扩大", "结构性风险"],
        ["山姆供应链被污染", "需有采购、报关、批次和检测证据才能成立", "当前无公开证据"],
    ]
    add_table(doc, ["环节", "机制", "证据状态"], transmission_rows, [1680, 5520, 2160], font_size=9.0)
    add_body(doc, "由此应把“山姆是否涉险”拆成两个问题：其一，价格上涨是否提高整个市场的走私诱因——答案是肯定；其二，山姆自身是否采购了走私或伪报牛肉——当前公开信息不足以支持，直接风险评为低。")

    add_heading(doc, "3. 南沙口岸风险分析", 1)
    add_heading(doc, "3.1 口岸特征与控制基础", 2)
    add_body(doc, "南沙具备大型国际集装箱和冷链集散能力。南沙区政府公开资料显示，南沙港区国际集装箱航线超过150条，连接100多个国家和地区的300多个港口；南沙国际冷链具有冻肉等进口资质，并可同时查验162个进口冷链货柜，场区配置大量视频监控，形成“港口+园区”冷链集散模式。[5]")
    add_body(doc, "这组条件同时带来两种相反效应：规模、航线和货物复杂度增加风险暴露面；指定监管场地、电子放货、摄像和集中查验又提高被发现概率。因此，正规口岸的剩余风险不宜简单按吞吐量评为高。")

    add_heading(doc, "3.2 主要风险场景", 2)
    nansha_rows = [
        ["原产地/生产企业伪报", "中高", "第三国换单、证书或标签与内包装/生产批次不一致；需联查CIFER和健康证"],
        ["冷藏箱内夹藏", "中", "依附合法冻品、水产、果蔬或加工食品申报；重点看VGM、净重、箱单和扫描异常"],
        ["低报价格/错归税号", "中", "配额和税负冲击后估价及归类套利动机上升"],
        ["周边水道绕关", "高", "公开典型案例已证实南沙水道与黑码头可被用于冻品转运"],
        ["港后冻库洗白", "高", "合法货与来源不明货在仓储、分割、换标环节混同，口岸单点检查难覆盖"],
    ]
    add_table(doc, ["场景", "风险", "判断依据/核查重点"], nansha_rows, [2520, 1080, 5760], font_size=8.9)

    add_heading(doc, "3.3 案例支撑与总体评级", 2)
    add_body(doc, "广东高院公布案例显示，2020年一走私团伙在香港龙鼓洲、沙洲附近海域装运冻品，以中山民众、广州南沙、佛山顺德为主要水道，通过多地“黑码头”卸货，再转入冻库，涉案冻品151吨；另有团伙以“蚂蚁搬家、渔船掩护”方式在南沙大岗镇水域活动。[8] 这些案例证明的是南沙周边水网与珠江口网络的可利用性，并非证明南沙正规码头查验失守。")
    add_callout(doc, "南沙结论", "正规设关口岸：中等风险；周边水道、非设关卸货点及港后冻库：高风险。资源配置应从单纯增加开箱率，转向“舱单—箱重—证书—冷库—车辆—下游销量”的跨环节比对。")

    add_heading(doc, "4. 东莞港沙田港区风险分析", 1)
    add_heading(doc, "4.1 对越通道提高可达性，但不等于形成违规事实", 2)
    add_body(doc, "东莞港已开通至越南海防、胡志明的航线。2024年开通的东莞港—胡志明直航初期每两周一班，约4天抵达，投入船型约2100TEU并配置200个冷藏插头。[6] 对第三国风险而言，这意味着越南冷链货物进入东莞的物流可达性较强；但航线本身是正常贸易基础设施，风险判断仍必须落到货物准入、原产地、企业和批次证据。")

    add_heading(doc, "4.2 风险结构", 2)
    shatian_rows = [
        ["越南装运、印度来源", "中高", "装运国与原产国分离并不当然违法；若申报原产地与实质性加工、证书不符，则风险显著"],
        ["以水产/果蔬/加工食品名义夹藏", "中", "冷藏设备条件可兼容多类商品；需用密度、温度、图像和开箱核对"],
        ["新设贸易商+频繁换主体", "中高", "进口人、报关行、货代、冻库和下游若短期高频轮换，可能是风险隔离"],
        ["辖区海域绕关", "中高", "东莞海警2025年在辖区海域查获220余吨无合法来源、未经检验检疫冻品"],
        ["港后加工掺混", "高", "东莞制造与食品加工物流发达，低价冻肉在分割、切片、调理后更难凭标签识别"],
    ]
    add_table(doc, ["场景", "风险", "判断依据/核查重点"], shatian_rows, [2520, 1080, 5760], font_size=8.9)
    add_body(doc, "2026年4月公开报道披露，东莞海警对2025年10月在辖区海域查获的220余吨鸡爪、猪肚等走私冻品进行无害化处置；货物无合法来源证明且未经检验检疫。[10] 商品虽非牛肉，但该案能证明海上运力、接驳和销毁处置对象仍现实存在。")
    add_callout(doc, "沙田结论", "正规口岸：中等风险；辖区海域及港后加工/冻库：中高至高风险。对越航线应实施“正常贸易不预设有罪、异常批次强化核验”的风险分层。")

    add_heading(doc, "5. 拱北海关管辖码头口岸风险分析", 1)
    add_heading(doc, "5.1 港区差异决定风险差异", 2)
    add_body(doc, "珠海港口岸整合后设置高栏、斗门、洪湾、九洲、万山、唐家六个港区，且扩大开放及明确水域范围涉及多个作业区。[7] 这意味着“拱北海关管辖的码头口岸”不是单一节点：大宗货运港区、岛屿作业区、客运港区和周边开放水域的货型、船型和监管重点差异明显。")
    gongbei_rows = [
        ["高栏等大宗货运港区（正规申报）", "中低—中", "重点是资质、舱单、原产地和冷藏箱一致性；进口肉类必须以交易时点海关动态指定监管场地和准入清单为准"],
        ["斗门/洪湾等内河—近岸节点", "中高", "水网密集、陆运衔接快，需关注异常夜间船车接驳和冻库流向"],
        ["万山、外伶仃、担杆等海域", "很高", "靠近香港航路和锚地，历史案例显示可发生母船/货船向珠江口方向运输和暴力逃避检查"],
        ["九洲等客运属性较强港区", "大宗：低\n小批量：中", "大宗冻品不适配客运通道；仍需防范化整为零、行邮或“水客”式夹带，但非本报告主风险"],
        ["非设关码头—冻库链条", "很高", "一旦绕开海关，风险从税收问题升级为准入、检疫和食品安全复合风险"],
    ]
    add_table(doc, ["空间/节点", "风险", "理由"], gongbei_rows, [2880, 1320, 5160], font_size=8.8)

    add_heading(doc, "5.2 典型案件显示的网络能力", 2)
    add_body(doc, "2019年拱北海关在珠江口水域截停从香港方向驶来的货船，现场查扣32个集装箱、800余吨冻鸡爪等；当年拱北海关共立案查办冻品走私案件56起、查扣约8146吨。[11] 2022年，广东海警在担杆岛东侧附近海域查获228.26吨牛肉类冻品，涉案船舶曾抗拒检查并撞击执法船。[8]")
    add_body(doc, "最高人民法院等五部门明确：在非设关地走私进口未取得国家检验检疫准入证书的冻品，应认定为国家禁止进口的货物，构成犯罪的按相应罪名处罚。[9] 因而，印度或其他未准入来源冻肉一旦通过非设关地进入，风险性质不只是逃税，还涉及刑事和公共卫生后果。")
    add_callout(doc, "拱北辖区结论", "正规货运港区的夹藏/伪报风险为中低至中；万山—担杆—外伶仃及珠江口西岸非设关链条为很高风险，是三地中最需要进行海陆联动画像的区域。")

    add_heading(doc, "6. 印度水牛肉经越南等第三国进入中国的风险", 1)
    add_heading(doc, "6.1 供应基础与价差", 2)
    add_body(doc, "印度官方APEDA数据显示，2024—2025财年印度水牛肉出口量约125.48万吨、出口额约40.61亿美元，越南位列主要目的地。[12] 印度行业中的“beef”出口主体为去骨水牛肉，不等同于澳大利亚谷饲牛肉。")
    trade_rows = [
        ["印度→越南", "HS 020230 去骨冻牛科动物肉", "170,560,950 kg", "623,523,679.56 美元", "3.66 美元/kg"],
        ["澳大利亚→中国", "HS 020230 去骨冻牛科动物肉", "190,537,074.47 kg", "1,458,856,548.33 美元", "7.66 美元/kg"],
    ]
    add_table(doc, ["2025年流向", "口径", "净重", "贸易额", "平均单位价值"], trade_rows, [1500, 2580, 1740, 2040, 1500], font_size=8.4)
    add_small_note(doc, "来源：UN Comtrade公开API。[13][14] 平均单位价值仅是风险筛查代理变量；产品部位、品质、合同条款和运输条件不同，不能把3.66与7.66美元/kg视为同一零售商品的直接价差。按该口径，印度—越南均值约低52%，叠加澳牛配额外税负后，替代或掺混诱因会增强。")

    add_heading(doc, "6.2 准入是决定合法性的第一道门槛", 2)
    add_body(doc, "中国进口肉类的一般合规链条包括：输出国家/地区通过体系评估，产品在准入清单内，境外生产企业完成注册，进口人取得必要许可并提交官方检疫（卫生）证书、原产地证明等，货到口岸接受检验检疫。[4][15] “从越南装船”不自动把印度来源货物变成越南原产；仅换包装、分装、转口或简单处理通常不能替代实质性原产地规则和检疫准入要求。")
    add_body(doc, "截至报告基准日，本次公开检索未能确认印度水牛肉或越南国产牛肉已获得普通商业渠道对华合法准入。该判断必须在具体交易日以海关总署“符合评估审查要求的国家或地区输华肉类产品名单”、境外生产企业注册名单及对应议定书为最终依据；名单为动态信息，不能仅凭历史截图作绝对结论。")

    add_heading(doc, "6.3 路径风险排序", 2)
    route_rows = [
        ["1", "印度→越南集散→中越陆路边境→广西/广东冻库", "高", "地理连续、物流成熟；关键在边境申报、来源证书和跨省冷库流向"],
        ["2", "印度→越南/香港集散→珠江口海上转驳→非设关码头", "高", "历史海上网络可验证；无需通过正规进口肉类场地，但执法和损耗风险高"],
        ["3", "越南装运→南沙/沙田正规冷藏箱→夹藏或伪报", "中", "需突破舱单、证书、注册企业、扫描和开箱等多重控制"],
        ["4", "伪造越南原产/卫生证书→正规申报为越南牛肉", "中低（概率）\n高（影响）", "文件链可核验且后果严重；若准入不成立，单证再完整也不能合法化"],
        ["5", "进入加工厂后掺混/替换标签再销售", "中高", "物种和批次追踪难度上升，是印度水牛肉最可能影响终端市场的环节"],
    ]
    add_table(doc, ["排序", "潜在路径", "风险", "研判"], route_rows, [600, 4140, 1380, 3240], font_size=8.5)

    add_heading(doc, "7. 山姆供应链专项研判", 1)
    add_heading(doc, "7.1 直接风险为何评为低", 2)
    sam_low_rows = [
        ["品牌与会员制约束", "重大来源造假会造成全国性召回、声誉和监管损失，风险收益比不利"],
        ["合规采购可追溯", "大型零售通常掌握供应商、批次、标签、入库和销售数据，便于反向核验"],
        ["产品差异明显", "澳洲谷饲部位肉与印度去骨水牛肉在定位、规格、包装和感官上并非天然等价替代"],
        ["涨价解释完整", "配额触发、税负上升和客服解释构成可验证的合规成本链"],
        ["缺乏指向性证据", "未发现公开案件、监管通报、召回或批次证据把山姆与走私冻牛肉相连"],
    ]
    add_table(doc, ["控制/证据", "含义"], sam_low_rows, [2460, 6900], font_size=9.0)

    add_heading(doc, "7.2 仍需保留的间接与尾部风险", 2)
    sam_tail_rows = [
        ["供应商上游替代", "代工、分切或调理供应商采购来源与申报来源不一致", "核对工厂投料、损耗、批次、进口单证与产出销量"],
        ["标签/批次错配", "外包装标称澳洲，内包装生产企业代码或日期冲突", "抽样拆包，核查内外标签、注册号和生产批号"],
        ["SKU结构调整", "涨价后转用其他产地或部位，但营销表述未同步", "连续采集SKU、产地、价格、规格、供应商变化"],
        ["市场冒用品牌", "非正规渠道假冒“山姆同款/尾货/临期货”销售来源不明冻肉", "区分门店/官方App与社群、电商、二手渠道"],
        ["餐饮端外溢", "消费者从高价澳牛转向低价切片/调理肉，灰色需求上升", "监测批发价差、餐饮采购和物种检测"],
    ]
    add_table(doc, ["风险点", "可能表现", "核验方法"], sam_tail_rows, [2040, 3600, 3720], font_size=8.8)
    add_callout(doc, "山姆专项结论", "现阶段不应把价格上涨转化为对山姆的合规指控。更有价值的核验是：对涨价前后同一SKU做“门店价格—标签产地—境外工厂注册号—进口批次—采购量—销量”闭环；任何一环出现数量或身份不匹配，再升级调查。", fill=COLORS["green_fill"], color=COLORS["green"])

    add_heading(doc, "8. 风险指标与监测框架", 1)
    add_heading(doc, "8.1 单证与贸易流指标", 2)
    indicators = [
        ["装运国—原产国分离", "越南装运但上游发货人、付款方或品牌关联印度肉类企业", "高"],
        ["短停留再出口", "越南进口印度冻肉后短期内以近似重量/规格再出口中国", "高"],
        ["产能不匹配", "越南出口商缺乏对应屠宰/加工能力，出口量显著超过可解释产量", "高"],
        ["注册/证书异常", "CIFER状态、卫生证书、原产地证、船名航次、集装箱或封志相互矛盾", "很高"],
        ["申报与冷链不匹配", "申报常温/低密度货物，却使用冷藏箱且温度记录指向冻品", "很高"],
        ["重量与包装异常", "VGM、毛重、净重、件数、箱型和扫描图像无法相互解释", "高"],
        ["主体快速轮换", "新设进口商频繁更换收货人、报关行、货代、冻库或联系电话", "中高"],
        ["销售量倒挂", "标称澳洲/合规来源产品销量超过可核验进口和国内采购量", "很高"],
    ]
    add_table(doc, ["指标", "触发表现", "优先级"], indicators, [2280, 5880, 1200], font_size=8.7)

    add_heading(doc, "8.2 实物、仓储与海陆联动指标", 2)
    physical_rows = [
        ["包装", "外层越南标签、内层出现印度APEDA/工厂代码、日期或品牌；封志更换无合理记录"],
        ["检测", "标称牛肉检出水牛成分；或同一批次不同包装的物种结果不一致"],
        ["仓储", "冻库无对应入境证明但库存突增；凌晨集中入库；货物多次换库、换标、分装"],
        ["车辆", "非设关码头夜间出现冷藏车，车辆载重、进出时间与港区/冻库记录不一致"],
        ["船舶", "AIS长时间缺口、异常低速会合、无合理作业计划靠近岛屿或岸线，随后出现岸上冷链活动"],
    ]
    add_table(doc, ["维度", "异常信号"], physical_rows, [1560, 7800], font_size=8.9)
    add_small_note(doc, "检测提示：物种PCR可区分水牛/牛等成分，但通常不能单独证明地理原产国；原产地判断需要单证、生产企业、供应链和必要的同位素/溯源证据组合。")

    add_heading(doc, "9. 建议的核查与控制措施", 1)
    action_rows = [
        ["立即（0—30天）", "建立三地口岸风险清单；冻结式保存准入名单快照；对越南装运冻品开展原产地/企业注册交叉核验；采集山姆重点SKU基线"],
        ["短期（1—3个月）", "形成舱单—VGM—箱温—扫描—查验—冻库—车辆闭环；对异常批次抽取内外包装和物种样本；建立进口量—销售量平衡"],
        ["中期（3—6个月）", "把AIS、港区闸口、非设关码头视频、冷藏车和冻库数据进行时空关联；绘制企业/电话/地址/付款关系图谱"],
        ["触发调查", "出现证书冲突、产能不匹配、短停留再出口、物种不符或销量倒挂两项以上时，升级为企业和批次专项核查"],
    ]
    add_table(doc, ["阶段", "措施"], action_rows, [1920, 7440], font_size=8.9)

    add_heading(doc, "10. 后续需要补充的数据清单", 1)
    add_body(doc, "以下数据用于把“结构性风险”推进到“企业—批次—路径”可验证结论。建议以2024年1月至今为基础窗口；印度—越南贸易流为观察长期模式，可回溯至2023年。")

    data_rows_1 = [
        ["P0", "海关准入与注册快照", "按日期保存国家/产品准入、境外生产企业注册、暂停/恢复状态、卫生证书样本、指定监管场地名单", "先判断是否具备合法进口前提；避免用当前名单倒推历史"],
        ["P0", "中国进口报关与舱单", "报关号/日期、口岸、监管方式、HS/品名、毛净重、金额、原产地、启运/装运/中转港、船名航次、箱号/箱型、封志、提单号、收货人、申报企业、境内目的地、查验结果", "识别正规口岸伪报、夹藏、估价和原产地异常"],
        ["P0", "配额与实际税负", "各国配额逐日使用量、达量日期、配额外申报、实际税率、完税价格、担保/补税情况", "量化价格冲击和异常低价"],
        ["P1", "印度→越南明细贸易", "2023年至今月度HS 020230/0206/1602；出口商、进口商、数量、金额、港口、生产企业、提单/箱号、到港日", "识别上游供应商和越南进口节点"],
        ["P1", "越南→中国明细贸易", "与上项相同并增加原产地、再出口日期、加工企业、证书号；支持进出批次匹配", "计算短停留、重量相似度和产能异常"],
    ]
    add_table(doc, ["优先级", "数据包", "最小字段", "用途"], data_rows_1, [780, 1680, 4920, 1980], font_size=7.9)

    data_rows_2 = [
        ["P1", "冷库与国内流向", "冻库名称/库位、入出库时间、品名批次、重量、温度、货主、车辆、司机、上游单证、下游客户", "识别港后洗白、混货和批量分销"],
        ["P1", "山姆SKU与批次", "门店/日期/SKU/价格/规格/标签产地、境外工厂号、生产包装日期、批号、进口商、采购/入库/销售量、对应报关单", "区分政策调价、换产地、上游替代与假冒渠道"],
        ["P1", "抽样检测", "样品封存链、物种PCR、水牛/牛鉴别、病原体、兽药残留、包装油墨/标签/批号比对", "验证掺混、未经检疫和标签冲突；不单凭物种判断地理原产"],
        ["P2", "执法案件底表", "2023年至今案件时间、地点、手法、品类、数量、标称/实际来源、船舶/车辆/箱号、冻库和下游", "校准高风险水域、时段和网络复用"],
        ["P2", "AIS与港区通行", "MMSI/IMO、轨迹和缺口、会合、靠泊、闸口进出、冷藏插电/箱温、VGM/地磅、视频索引", "验证海上转驳—岸上车辆时空链"],
        ["P2", "企业与资金关系", "工商、股东、电话、地址、历史进出口、发票、付款、关联货代/报关行/冷库/物流", "识别空壳公司、主体轮换和共同控制"],
    ]
    add_table(doc, ["优先级", "数据包", "最小字段", "用途"], data_rows_2, [780, 1680, 4920, 1980], font_size=7.9)

    add_heading(doc, "10.1 建议的最小可行数据组合", 2)
    add_body(doc, "若短期只能取得少量数据，优先组合为：①交易时点准入/注册快照；②中国报关单、舱单和提单字段；③印度—越南与越南—中国月度及企业级流向；④目的冻库入出库和下游销量；⑤对异常批次实施内外包装核对与物种PCR。前四项建立“来源—入境—仓储—销售”数量链，第五项验证实物。")
    add_body(doc, "若无法获得完整提单数据，可先用月度贸易、船期、港区到港、冷库库存和零售批次做时间窗匹配；这只能生成核查名单，不能替代提单/报关级证据。")

    add_heading(doc, "11. 综合结论", 1)
    add_body(doc, "第一，2026年山姆澳洲牛肉涨价主要可由澳大利亚牛肉国别配额提前用尽及配额外55%加征关税解释。价格上升会增加全市场非法套利诱因，但对山姆自身的直接走私风险，当前证据仅支持“低”，不能作涉私推断。")
    add_body(doc, "第二，三地风险的共同特征是“正规口岸有控制、周边水域和港后链条更脆弱”。南沙和沙田正规口岸的重点是原产地、证书、箱货和估价一致性；拱北辖区的万山—担杆等海域以及珠江口非设关链条，应按很高风险实施海陆联动监测。")
    add_body(doc, "第三，印度水牛肉经越南等第三国进入中国具备供应规模、价差和物流可达性，整体风险评为中高；更可能经中越陆路或珠江口海上绕关兑现，其次才是正规口岸伪报。任何具体认定都必须落到准入状态、生产企业、证书、提单、集装箱、冻库和批次检测。")
    add_body(doc, "第四，下一阶段的核心不是继续堆叠公开新闻，而是补齐企业级和批次级数据。以“准入合法性—原产地真实性—货物一致性—数量平衡—实物检测”五条证据链并行，才能把风险地图转化为可执法、可审计、可复核的结论。")

    add_heading(doc, "参考资料", 1)
    sources = [
        (1, "中华人民共和国商务部公告2025年第87号及附件2《配额数量及加征关税税率表》", "商务部，2025-12-31", "https://www.mofcom.gov.cn/zcfb/zgdwjjmywg/art/2026/art_eb20ffdc45374e469571312d1498beda.html"),
        (2, "关于2026年度牛肉保障措施执行提示信息（五）/澳大利亚配额达到100%", "商务部贸易救济调查局，2026-06-19", "https://cacs.mofcom.gov.cn/cacscms/article/jkdc?articleId=188390&type="),
        (3, "“昨天109元，今天125元”——山姆多款牛肉被曝涨价", "光明网转载经济日报综合，2026-07-05", "https://m.gmw.cn/2026-07/05/content_1304520541.htm"),
        (4, "Safety of Imported and Exported Food", "中华人民共和国海关总署，2020-09-03", "https://english.customs.gov.cn/statics/a77a49cf-3fbe-48ac-854a-be507d7c620b.html"),
        (5, "钻进零下23℃的国内最大临港单体冷库——广州南沙港口边的“超级冰箱”", "广州市南沙区人民政府，2023", "https://www.gzns.gov.cn/zwgk/rdzt/nanshafangan/nszxd/content/post_9260418.html"),
        (6, "东莞港—越南胡志明直航正式开通", "东莞市国资委/东莞港务集团，2024-04-17", "https://www.dg.gov.cn/gzw/qyjj/qydt/content/post_4189746.html"),
        (7, "国务院批复同意珠海港口岸整合并扩大开放工作", "广东省委港澳工作办公室转载央视新闻，2024-03-15", "https://www.gdhmo.gov.cn/ygadwqcs/zh/content/post_70831.html"),
        (8, "打击走私犯罪典型案例", "广东省高级人民法院，2024-07-17", "https://www.gdcourts.gov.cn/gsxx/quanweifabu/anlihuicui/content/post_1842696.html"),
        (9, "关于打击粤港澳海上跨境走私犯罪适用法律若干问题的指导意见", "最高人民法院等五部门，2021-12-14", "https://www.court.gov.cn/zixun/xiangqing/337391.html"),
        (10, "广东东莞海警集中无害化处置走私冻品220余吨", "中国新闻网，2026-04-02", "https://www.chinanews.com.cn/sh/2026/04-02/10597735.shtml"),
        (11, "珠海拱北海关查获走私冻品入境案，查扣走私冻品800余吨", "央视网，2019-12-07", "https://news.cctv.com/2019/12/07/ARTIddErmIBBG4JoTy1khlmy191207.shtml"),
        (12, "Buffalo Meat: India Facts and Figures", "印度APEDA，访问于2026-08-08", "https://apeda.gov.in/BuffaloMeat"),
        (13, "India exports to Viet Nam, HS 020230, 2025", "UN Comtrade公开API，访问于2026-08-08", "https://comtradeapi.un.org/public/v1/preview/C/A/HS?period=2025&reporterCode=699&cmdCode=020230&flowCode=X&partnerCode=704&partner2Code=0&customsCode=C00&motCode=0&maxRecords=500"),
        (14, "Australia exports to China, HS 020230, 2025", "UN Comtrade公开API，访问于2026-08-08", "https://comtradeapi.un.org/public/v1/preview/C/A/HS?period=2025&reporterCode=36&cmdCode=020230&flowCode=X&partnerCode=156&partner2Code=0&customsCode=C00&motCode=0&maxRecords=500"),
        (15, "Assessment procedure for meat products intended to be exported to China", "中华人民共和国海关总署，2018-05-24", "https://english.customs.gov.cn/inspection/html/news1.html"),
        (16, "进口肉类指定监管场地动态管理说明（海关总署公告2019年第74号）", "海关总署/商务部政策转载，2019", "https://www.mofcom.gov.cn/zcfb/zgdwjjmywg/art/2019/art_233dc3d7537540de9e69dd23f0bee8d6.html"),
    ]
    for item in sources:
        add_source_link(doc, *item)

    add_heading(doc, "附注：判断口径", 2)
    add_small_note(doc, "1. “未发现公开证据”不等于证明不存在风险，只表示本次公开资料检索未形成指向具体主体的证据。")
    add_small_note(doc, "2. 港区资质、国家/产品准入和境外企业注册均可能动态调整，应以具体交易日的海关总署系统记录为准。")
    add_small_note(doc, "3. 贸易统计中的“报告国、伙伴国、装运国、原产国”含义不同；企业级再出口判断必须回到报关、提单、生产和库存记录。")
    add_small_note(doc, "4. 本报告仅用于风险筛查、合规审计和数据需求设计，不替代执法调查、司法认定或食品安全检测结论。")

    # Core properties; privacy-neutral.
    doc.core_properties.title = "粤港澳大湾区重点水运口岸冻品夹藏与绕关走私风险分析报告"
    doc.core_properties.subject = "南沙、东莞沙田、拱北海关辖区；山姆澳洲牛肉与印度水牛肉第三国绕道风险"
    doc.core_properties.author = "研究分析"
    doc.core_properties.keywords = "冻品走私, 南沙, 沙田, 拱北海关, 山姆牛肉, 印度水牛肉, 越南绕道"
    doc.core_properties.comments = "基于公开资料形成；未使用外贸公社数据。"
    doc.save(OUT_PATH)
    print(OUT_PATH)


if __name__ == "__main__":
    build_report()
