import json
import os
from datetime import date

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor


OUT_DIR = r"D:\易迅数据\反倾销税风险"
OUT_PATH = os.path.join(OUT_DIR, "酞菁类颜料第三国转运及反倾销税风险分析报告.docx")
DATA_CN = r"C:\Users\59809\Documents\关键矿产\temp\yixun_phthalocyanine_all129.json"
DATA_IV = r"C:\Users\59809\Documents\关键矿产\temp\yixun_phthalocyanine_india_vietnam_all215.json"

BLUE = "2E74B5"
DARK = "1F4D78"
NAVY = "163A5F"
LIGHT = "F2F4F7"
PALE_BLUE = "E8EEF5"
PALE_RED = "FCE8E6"
RED = "9B1C1C"
MUTED = "666666"


def set_cell_shading(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def set_cell_margins(cell, top=80, start=120, bottom=80, end=120):
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


def set_table_widths(table, widths_dxa):
    table.autofit = False
    tbl_pr = table._tbl.tblPr
    tbl_w = tbl_pr.find(qn("w:tblW"))
    if tbl_w is None:
        tbl_w = OxmlElement("w:tblW")
        tbl_pr.append(tbl_w)
    tbl_w.set(qn("w:w"), str(sum(widths_dxa)))
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
            tc_pr = cell._tc.get_or_add_tcPr()
            tc_w = tc_pr.find(qn("w:tcW"))
            if tc_w is None:
                tc_w = OxmlElement("w:tcW")
                tc_pr.append(tc_w)
            tc_w.set(qn("w:w"), str(widths_dxa[idx]))
            tc_w.set(qn("w:type"), "dxa")
            set_cell_margins(cell)


def repeat_header(row):
    tr_pr = row._tr.get_or_add_trPr()
    tbl_header = OxmlElement("w:tblHeader")
    tbl_header.set(qn("w:val"), "true")
    tr_pr.append(tbl_header)


def set_font(run, size=10.5, bold=False, color=None, name="Microsoft YaHei"):
    run.font.name = name
    run._element.get_or_add_rPr().rFonts.set(qn("w:eastAsia"), name)
    run._element.get_or_add_rPr().rFonts.set(qn("w:ascii"), "Calibri")
    run._element.get_or_add_rPr().rFonts.set(qn("w:hAnsi"), "Calibri")
    run.font.size = Pt(size)
    run.bold = bold
    if color:
        run.font.color.rgb = RGBColor.from_string(color)


def add_para(doc, text="", bold=False, color=None, align=None, after=6, size=10.5):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(after)
    p.paragraph_format.line_spacing = 1.1
    if align is not None:
        p.alignment = align
    r = p.add_run(text)
    set_font(r, size=size, bold=bold, color=color)
    return p


def add_bullet(doc, text, level=0):
    p = doc.add_paragraph(style="List Bullet")
    p.paragraph_format.left_indent = Inches(0.5)
    p.paragraph_format.first_line_indent = Inches(-0.25)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.167
    set_font(p.add_run(text), size=10.5)
    return p


def add_heading(doc, text, level=1):
    p = doc.add_paragraph(style=f"Heading {level}")
    p.paragraph_format.keep_with_next = True
    p.paragraph_format.space_before = Pt({1: 16, 2: 12, 3: 8}[level])
    p.paragraph_format.space_after = Pt({1: 8, 2: 6, 3: 4}[level])
    r = p.add_run(text)
    set_font(r, size={1: 16, 2: 13, 3: 12}[level], bold=True, color=BLUE if level < 3 else DARK)
    return p


def add_table(doc, headers, rows, widths, aligns=None, font_size=9.2):
    table = doc.add_table(rows=1, cols=len(headers))
    table.style = "Table Grid"
    table.alignment = WD_TABLE_ALIGNMENT.LEFT
    hdr = table.rows[0]
    repeat_header(hdr)
    for i, h in enumerate(headers):
        set_cell_shading(hdr.cells[i], LIGHT)
        hdr.cells[i].vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
        p = hdr.cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_after = Pt(0)
        set_font(p.add_run(h), size=font_size, bold=True, color=NAVY)
    for row in rows:
        cells = table.add_row().cells
        for i, val in enumerate(row):
            cells[i].vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            p = cells[i].paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.05
            p.alignment = aligns[i] if aligns else WD_ALIGN_PARAGRAPH.LEFT
            set_font(p.add_run(str(val)), size=font_size)
    set_table_widths(table, widths)
    doc.add_paragraph().paragraph_format.space_after = Pt(1)
    return table


def add_callout(doc, label, text, fill=PALE_BLUE, color=NAVY):
    table = doc.add_table(rows=1, cols=1)
    table.style = "Table Grid"
    set_table_widths(table, [9360])
    cell = table.cell(0, 0)
    set_cell_shading(cell, fill)
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(0)
    r = p.add_run(label + "：")
    set_font(r, size=10.5, bold=True, color=color)
    set_font(p.add_run(text), size=10.5, color=color)
    doc.add_paragraph().paragraph_format.space_after = Pt(2)


def add_page_number(paragraph):
    paragraph.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    run = paragraph.add_run("第 ")
    set_font(run, size=9, color=MUTED)
    fld = OxmlElement("w:fldSimple")
    fld.set(qn("w:instr"), "PAGE")
    paragraph._p.append(fld)
    run2 = paragraph.add_run(" 页")
    set_font(run2, size=9, color=MUTED)


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    with open(DATA_CN, encoding="utf-8") as f:
        china_rows = json.load(f)
    with open(DATA_IV, encoding="utf-8") as f:
        iv_rows = json.load(f)

    doc = Document()
    sec = doc.sections[0]
    sec.page_width = Inches(8.5)
    sec.page_height = Inches(11)
    sec.top_margin = Inches(0.82)
    sec.bottom_margin = Inches(0.82)
    sec.left_margin = Inches(0.9)
    sec.right_margin = Inches(0.9)
    sec.header_distance = Inches(0.35)
    sec.footer_distance = Inches(0.35)

    styles = doc.styles
    normal = styles["Normal"]
    normal.font.name = "Microsoft YaHei"
    normal._element.rPr.rFonts.set(qn("w:eastAsia"), "Microsoft YaHei")
    normal.font.size = Pt(10.5)
    normal.paragraph_format.space_after = Pt(6)
    normal.paragraph_format.line_spacing = 1.1
    for level, size, color in ((1, 16, BLUE), (2, 13, BLUE), (3, 12, DARK)):
        st = styles[f"Heading {level}"]
        st.font.name = "Microsoft YaHei"
        st._element.rPr.rFonts.set(qn("w:eastAsia"), "Microsoft YaHei")
        st.font.size = Pt(size)
        st.font.bold = True
        st.font.color.rgb = RGBColor.from_string(color)

    header = sec.header.paragraphs[0]
    header.alignment = WD_ALIGN_PARAGRAPH.LEFT
    set_font(header.add_run("反倾销税风险专项分析 | 酞菁类颜料"), size=9, color=MUTED)
    add_page_number(sec.footer.paragraphs[0])

    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after = Pt(5)
    r = p.add_run("酞菁类颜料第三国转运及反倾销税风险分析报告")
    set_font(r, size=23, bold=True, color=NAVY)
    p2 = doc.add_paragraph()
    p2.paragraph_format.space_after = Pt(14)
    set_font(p2.add_run("基于易迅贸易数据与公开政策、企业信息的专项核查"), size=13, color=MUTED)

    meta = [
        ("报告日期", "2026年8月12日"),
        ("数据期间", "2025年8月6日至2026年8月6日"),
        ("核查对象", "酞菁类颜料（Phthalocyanine / Phthalocyanine Pigment）"),
        ("重点路线", "印度→越南→中国；并与印度→中国直接贸易对照"),
        ("风险等级", "B+（高度疑似核查对象，尚未形成票级闭环证据）"),
    ]
    for k, v in meta:
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(2)
        set_font(p.add_run(k + "："), size=10.5, bold=True, color=NAVY)
        set_font(p.add_run(v), size=10.5)

    add_callout(doc, "核心结论", "越南对华酞菁出口存在主体集中、批量规律、贸易型出口商大额申报越南原产等异常。现有数据支持开展专项核查，但印度上游与越南对华下游尚未在企业、提单或集装箱层面直接对应，不能据此认定全部货物为印度原产转口。", fill=PALE_RED, color=RED)

    add_heading(doc, "一、政策与征税范围", 1)
    add_para(doc, "商务部公告2023年第8号决定，自2023年2月27日起，对原产于印度的进口酞菁类颜料征收反倾销税，实施期限为5年。涉案产品归入税则号列32041700和32129000，但上述号列中非酞菁类颜料不在征税范围。")
    add_table(doc, ["印度企业类别", "反倾销税率"], [
        ["Ramdev Chemical Industries", "11.9%"],
        ["Dhanveen Pigments Pvt. Ltd.", "14.1%"],
        ["Meghmani Organics Limited", "18.7%"],
        ["其他配合调查企业", "16.0%"],
        ["其他印度企业", "30.7%"],
    ], [7000, 2360], [WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER])
    add_para(doc, "税款计算口径：反倾销税＝海关审定完税价格×适用税率；进口环节增值税以完税价格、关税和反倾销税之和为计税基础。", color=MUTED, size=9.5)

    add_heading(doc, "二、查询口径与数据完整性", 1)
    add_bullet(doc, "易迅下游查询：商品关键词PHTHALOCYANINE，目的国中国，近一年；129条记录全部切换为200条/页读取。")
    add_bullet(doc, "易迅上游查询：商品关键词PHTHALOCYANINE，目的国越南，原产国印度，近一年；共215条，按200条/页分两页完整读取。")
    add_bullet(doc, "印度出口侧与越南进口侧属于贸易镜像，不能相加作为独立货运量；本报告分别列示。")
    add_bullet(doc, "平台金额字段未统一标注币种；越南全港金额按越南海关数据通常口径暂按越南盾情景测算，最终须以原始申报单核实。")

    add_heading(doc, "三、全量贸易结果", 1)
    add_table(doc, ["贸易路线/数据视角", "记录数", "数量（公斤）", "说明"], [
        ["印度→中国", "97", "616,150.80", "印度原产直接对华"],
        ["越南→中国", "32", "903,645.00", "其中31条标记#&VN"],
        ["印度→越南（印度出口侧）", "95", "343,655.00", "上游出口镜像之一"],
        ["印度→越南（越南进口侧）", "120", "291,057.25", "上游进口镜像之一"],
    ], [3300, 1300, 2000, 2760], [WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.RIGHT, WD_ALIGN_PARAGRAPH.LEFT])

    add_heading(doc, "四、越南对华出口异常", 1)
    add_para(doc, "32条越南名义来源记录合计903,645公斤。其中31条、903,600公斤在商品描述中标记#&VN；另有1条45公斤标记#&DE，属于德国原产字段冲突线索，不计入印度转口数量。")
    add_table(doc, ["品类", "数量（公斤）", "占越南对华总量"], [
        ["酞菁绿", "867,600", "96.0%"],
        ["酞菁蓝及含147-14-8记录", "36,045", "4.0%"],
    ], [4500, 2400, 2460], [WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.RIGHT, WD_ALIGN_PARAGRAPH.CENTER])

    add_heading(doc, "五、重点企业与数量", 1)
    add_heading(doc, "（一）越南出口商", 2)
    add_table(doc, ["出口商", "票数", "数量（公斤）", "占比"], [
        ["VINH GIA IMPORT AND EXPORT CO., LTD", "29", "807,600", "89.4%"],
        ["YICAI COLOR PLASTIC", "2", "96,000", "10.6%"],
        ["VINH PHONG COLOR", "1", "45", "<0.1%"],
    ], [4800, 1000, 2100, 1460], [WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.RIGHT, WD_ALIGN_PARAGRAPH.CENTER])
    add_heading(doc, "（二）中国收货主体", 2)
    add_table(doc, ["收货人", "票数", "数量（公斤）"], [
        ["DONGGUAN CHENGHAN PLASTIC TRADING CO., LTD", "20", "495,600"],
        ["HUNAN YIGAO HIGH-TECH MATERIALS CO., LTD", "11", "408,000"],
        ["LUCKY (VIETNAM) INDUSTRIAL COMPANY LIMITED", "1", "45"],
    ], [6100, 1200, 2060], [WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.RIGHT])

    add_heading(doc, "六、最高风险主体：Vinh Gia", 1)
    add_callout(doc, "研判", "Vinh Gia是本案优先级最高的境外核查对象。其对华出口数量大、批次规律、成立时间较短且公开登记偏贸易批发性质，但尚无证据证明其不具备生产能力或货物必然来自印度。")
    add_bullet(doc, "公开登记名称：VINH GIA IMPORT AND EXPORT COMPANY LIMITED；税号3703186307。")
    add_bullet(doc, "登记成立日期：2024年1月22日；主营行业代码4669，为其他专业批发。")
    add_bullet(doc, "29票、807,600公斤，占越南对华可疑数量约89.4%。")
    add_bullet(doc, "规格高度规律，主要为24吨、48吨和96吨整批，产品集中为PIGMENT GREEN G070、CAS 1328-53-6。")
    add_bullet(doc, "印度→越南记录中未发现与Vinh Gia完全同名的直接进口主体，可能存在越南境内采购、名称差异或平台覆盖缺口。")

    add_heading(doc, "七、印度→越南上游比对", 1)
    add_table(doc, ["数据视角", "蓝色颜料（公斤）", "绿色颜料（公斤）", "合计（公斤）"], [
        ["印度出口侧", "132,155", "211,500", "343,655"],
        ["越南进口侧", "219,845.25", "70,011.25", "291,057.25"],
        ["越南→中国", "36,045", "867,600", "903,645"],
    ], [2800, 2100, 2100, 2360], [WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.RIGHT, WD_ALIGN_PARAGRAPH.RIGHT, WD_ALIGN_PARAGRAPH.RIGHT])
    add_para(doc, "上下游在产品大类、CAS和时间窗口上存在同向关系；但越南对华酞菁绿数量远高于平台可见的印度对越酞菁绿，且上下游主要交易主体没有直接重合。因此，宏观流量只能作为线索，不能证明903,600公斤全部属于印度原产。")
    add_para(doc, "印度上游主要供应商包括Kilburn Chemicals、Ramdev Chemical Industries、Meghmani Organics、Lona Industries、Sudarshan、Suyog Dye Chemie、Subhasri Pigments、Mazda Colours和AksharChem等。", color=MUTED)

    add_heading(doc, "八、反倾销税风险敞口", 1)
    add_para(doc, "如31条标记#&VN的903,600公斤货物经核查实际属于印度原产，则可能涉及少缴反倾销税，以及因反倾销税未计入增值税计税基础而少缴的进口环节增值税。")
    add_table(doc, ["情景", "反倾销税率", "反倾销税", "增值税差额", "合计潜在税负"], [
        ["最低列名税率", "11.9%", "154.15亿越南盾", "20.04亿越南盾", "174.19亿越南盾"],
        ["其他配合调查企业", "16.0%", "207.26亿越南盾", "26.94亿越南盾", "234.20亿越南盾"],
        ["其他印度企业", "30.7%", "397.68亿越南盾", "51.70亿越南盾", "449.38亿越南盾"],
    ], [2300, 1200, 1950, 1850, 2060], [WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.RIGHT, WD_ALIGN_PARAGRAPH.RIGHT, WD_ALIGN_PARAGRAPH.RIGHT], font_size=8.7)
    add_para(doc, "重要限制：上述测算以平台越南全港金额合计1295.38亿为基础，暂按越南盾处理，仅为风险情景，不是查实税款。实际税款应以中国进口报关单的海关审定完税价格、生产商和适用税率重新计算。", color=RED, size=9.5)

    add_heading(doc, "九、证据等级与替代解释", 1)
    add_table(doc, ["判断事项", "证据等级", "说明"], [
        ["越南对华存在连续大批量酞菁出口", "已证实", "32条、903,645公斤"],
        ["Vinh Gia为主要出口主体", "已证实", "29条、807,600公斤"],
        ["印度同期向越南供应同类商品", "已证实", "产品、CAS、HS和时间均存在重叠"],
        ["Vinh Gia货物来自印度", "线索", "未发现同名上游进口或票级对应"],
        ["存在规避反倾销税行为", "无法认定", "缺原产地、生产、付款和物流闭环证据"],
    ], [3200, 1300, 4860], [WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT], font_size=9.0)
    add_para(doc, "需要排除的替代解释包括：越南本地产能；越南境内采购；合法实质性加工；库存周期；印度上游使用其他品名导致关键词漏检；不同国家数据覆盖范围不一致。")

    add_heading(doc, "十、建议的票级核查方案", 1)
    actions = [
        "优先调取Vinh Gia 29票及两家中国主要收货人的进口报关单、原产地证、合同、发票和付款资料。",
        "核验Vinh Gia厂房地址、生产设备、环保许可、能耗、员工、原料投入及酞菁绿年产能。",
        "核对G070产品的CAS、CI编号、批号、包装唛头、生产日期和生产商声明。",
        "追查越南境内采购链：国内采购发票、仓储入库、领料、生产批记录和库存台账。",
        "比对印度进口与对华出口的集装箱号、封志号、船名航次、港口、货代和时间间隔。",
        "核验原产地证签发机构、签证依据及是否满足越南原产地实质性改变规则。",
        "按照具体印度生产商重新确定11.9%-30.7%的反倾销税率，并以中国海关完税价格测算税款。",
    ]
    for item in actions:
        add_bullet(doc, item)

    add_heading(doc, "十一、综合结论", 1)
    add_para(doc, "本案综合风险等级为B+。越南对华酞菁颜料链条具有明显的主体集中、规律性整批发运和贸易型企业大额申报越南原产等风险特征，应将Vinh Gia、东莞成翰和湖南益高列为优先核查对象。现阶段证据足以支持专项核查，但不足以直接认定印度原产转口或偷逃反倾销税。执法结论应以生产能力、原产地证据、国内采购链和票级物流对应为核心。")

    add_heading(doc, "附录：查询日志与来源", 1)
    add_bullet(doc, "易迅数据查询日期：2026年8月11日；报告整理日期：2026年8月12日。")
    add_bullet(doc, "下游查询：PHTHALOCYANINE×目的国中国×近一年，共129条，单页全量复核。")
    add_bullet(doc, "上游查询：PHTHALOCYANINE×目的国越南×原产国印度×近一年，共215条，两页全量复核。")
    add_bullet(doc, "政策来源：商务部公告2023年第8号及附件2《各公司反倾销税税率列表》。")
    add_bullet(doc, "公开企业来源：越南企业登记信息、公开贸易数据页面；相关信息仅作线索，需以官方登记档案和执法调取材料复核。")
    add_para(doc, "数据限制：易迅记录不等同于中国海关或外国海关全量数据；平台可能存在镜像重复、字段缺失、币种未标注及企业名称不统一。本报告严格区分数据事实、风险推断与尚待核验事项。", color=MUTED, size=9.5)

    doc.core_properties.title = "酞菁类颜料第三国转运及反倾销税风险分析报告"
    doc.core_properties.subject = "印度—越南—中国酞菁类颜料贸易风险"
    doc.core_properties.author = "反倾销税风险分析项目"
    doc.save(OUT_PATH)
    print(OUT_PATH)


if __name__ == "__main__":
    main()
