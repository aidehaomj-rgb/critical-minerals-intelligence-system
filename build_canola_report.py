from __future__ import annotations

import json
from pathlib import Path

from docx import Document
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor


BASE = Path(r"D:\易迅数据\反倾销税深度分析报告\02_油菜籽")
SUMMARY = json.loads((BASE / "油菜籽_易迅综合分析摘要.json").read_text(encoding="utf-8"))
OUT = BASE / "油菜籽_反倾销税与第三国转运风险深度分析报告.docx"

BLUE = "2E74B5"
DARK = "1F4D78"
INK = "253444"
GRAY = "F2F4F7"
AMBER = "FFF3CD"
GREEN = "E2F0D9"
RED = "FDE2E2"


def set_run_font(run, size=11, bold=False, color=INK):
    run.font.name = "Calibri"
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = RGBColor.from_string(color)
    rpr = run._element.get_or_add_rPr()
    rfonts = rpr.rFonts
    if rfonts is None:
        rfonts = OxmlElement("w:rFonts")
        rpr.append(rfonts)
    rfonts.set(qn("w:ascii"), "Calibri")
    rfonts.set(qn("w:hAnsi"), "Calibri")
    rfonts.set(qn("w:eastAsia"), "Microsoft YaHei")


def add_text(p, text, **kwargs):
    r = p.add_run(str(text))
    set_run_font(r, **kwargs)
    return r


def set_cell_shading(cell, fill):
    tcpr = cell._tc.get_or_add_tcPr()
    shd = tcpr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tcpr.append(shd)
    shd.set(qn("w:fill"), fill)


def set_cell_margins(cell, top=80, start=120, bottom=80, end=120):
    tcpr = cell._tc.get_or_add_tcPr()
    tcmar = tcpr.first_child_found_in("w:tcMar")
    if tcmar is None:
        tcmar = OxmlElement("w:tcMar")
        tcpr.append(tcmar)
    for name, value in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        node = tcmar.find(qn(f"w:{name}"))
        if node is None:
            node = OxmlElement(f"w:{name}")
            tcmar.append(node)
        node.set(qn("w:w"), str(value))
        node.set(qn("w:type"), "dxa")


def set_repeat_header(row):
    trpr = row._tr.get_or_add_trPr()
    header = OxmlElement("w:tblHeader")
    header.set(qn("w:val"), "true")
    trpr.append(header)


def set_table_geometry(table, widths_dxa):
    total = sum(widths_dxa)
    table.autofit = False
    tblpr = table._tbl.tblPr
    tblw = tblpr.find(qn("w:tblW"))
    if tblw is None:
        tblw = OxmlElement("w:tblW")
        tblpr.append(tblw)
    tblw.set(qn("w:w"), str(total)); tblw.set(qn("w:type"), "dxa")
    tblind = tblpr.find(qn("w:tblInd"))
    if tblind is None:
        tblind = OxmlElement("w:tblInd")
        tblpr.append(tblind)
    tblind.set(qn("w:w"), "120"); tblind.set(qn("w:type"), "dxa")
    grid = table._tbl.tblGrid
    for child in list(grid):
        grid.remove(child)
    for width in widths_dxa:
        col = OxmlElement("w:gridCol"); col.set(qn("w:w"), str(width)); grid.append(col)
    for row in table.rows:
        for idx, cell in enumerate(row.cells):
            tcpr = cell._tc.get_or_add_tcPr()
            tcw = tcpr.find(qn("w:tcW"))
            if tcw is None:
                tcw = OxmlElement("w:tcW"); tcpr.append(tcw)
            tcw.set(qn("w:w"), str(widths_dxa[idx])); tcw.set(qn("w:type"), "dxa")


def add_table(doc, headers, rows, widths_dxa, font_size=9):
    table = doc.add_table(rows=1, cols=len(headers))
    table.style = "Table Grid"
    table.alignment = WD_TABLE_ALIGNMENT.LEFT
    set_repeat_header(table.rows[0])
    for i, h in enumerate(headers):
        cell = table.rows[0].cells[i]
        set_cell_shading(cell, GRAY); set_cell_margins(cell)
        cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
        p = cell.paragraphs[0]; p.alignment = WD_ALIGN_PARAGRAPH.CENTER; p.paragraph_format.space_after = Pt(0)
        add_text(p, h, size=font_size, bold=True, color=DARK)
    for row in rows:
        cells = table.add_row().cells
        for i, value in enumerate(row):
            cell = cells[i]; set_cell_margins(cell); cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.TOP
            p = cell.paragraphs[0]; p.paragraph_format.space_after = Pt(0)
            add_text(p, "" if value is None else value, size=font_size)
    set_table_geometry(table, widths_dxa)
    return table


def add_callout(doc, title, text, fill=AMBER, title_color="7A5A00"):
    table = doc.add_table(rows=1, cols=1); table.style = "Table Grid"; table.alignment = WD_TABLE_ALIGNMENT.LEFT
    set_repeat_header(table.rows[0])
    cell = table.cell(0, 0); set_cell_shading(cell, fill); set_cell_margins(cell, 150, 180, 150, 180)
    p = cell.paragraphs[0]; p.paragraph_format.space_after = Pt(0)
    add_text(p, title + "\n", size=12, bold=True, color=title_color)
    add_text(p, text, size=10.5)
    set_table_geometry(table, [9360])
    doc.add_paragraph().paragraph_format.space_after = Pt(0)


def bullet(doc, text):
    p = doc.add_paragraph(style="List Bullet")
    p.paragraph_format.space_after = Pt(6)
    add_text(p, text, size=11)


def fmt_num(v, decimals=0):
    return f"{float(v or 0):,.{decimals}f}"


doc = Document()
sec = doc.sections[0]
sec.page_width = Inches(8.5); sec.page_height = Inches(11)
sec.top_margin = sec.right_margin = sec.bottom_margin = sec.left_margin = Inches(1)
sec.header_distance = sec.footer_distance = Inches(0.492)

normal = doc.styles["Normal"]
normal.font.name = "Calibri"; normal._element.rPr.rFonts.set(qn("w:eastAsia"), "Microsoft YaHei"); normal.font.size = Pt(11)
normal.paragraph_format.space_before = Pt(0); normal.paragraph_format.space_after = Pt(6); normal.paragraph_format.line_spacing = 1.10
for name, size, color, before, after in (("Heading 1", 16, BLUE, 16, 8), ("Heading 2", 13, BLUE, 12, 6), ("Heading 3", 12, DARK, 8, 4)):
    st = doc.styles[name]; st.font.name = "Calibri"; st._element.rPr.rFonts.set(qn("w:eastAsia"), "Microsoft YaHei")
    st.font.size = Pt(size); st.font.bold = True; st.font.color.rgb = RGBColor.from_string(color)
    st.paragraph_format.space_before = Pt(before); st.paragraph_format.space_after = Pt(after); st.paragraph_format.keep_with_next = True

header = sec.header.paragraphs[0]; header.alignment = WD_ALIGN_PARAGRAPH.RIGHT
add_text(header, "中国反倾销税商品深度排查｜油菜籽", size=8.5, color="6B7280")
footer = sec.footer.paragraphs[0]; footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
add_text(footer, "仅供风险研判｜易迅数据不等同海关全量统计", size=8, color="6B7280")

# memo masthead
p = doc.add_paragraph(); p.paragraph_format.space_before = Pt(20); p.paragraph_format.space_after = Pt(4)
add_text(p, "油菜籽", size=25, bold=True, color=DARK)
p = doc.add_paragraph(); p.paragraph_format.space_after = Pt(18)
add_text(p, "反倾销税与第三国转运风险深度分析报告", size=16, bold=True, color=BLUE)
for label, value in [
    ("报告日期", "2026-08-12"), ("易迅查询期", "2025-08-06至2026-08-06"),
    ("查询口径", "HS 120510、120590；关键词 CANOLA SEED、RAPESEED"),
    ("全量分页", "27页+5页+4页+26页，合计62页/12,100条原始命中"),
    ("措施范围", "加拿大原产非种用油菜籽；中国税号12051090、12059090；反倾销税5.9%"),
]:
    p = doc.add_paragraph(); p.paragraph_format.space_after = Pt(2)
    add_text(p, label + "：", size=10.5, bold=True, color=DARK); add_text(p, value, size=10.5)
doc.add_paragraph().paragraph_format.space_after = Pt(4)
add_callout(doc, "核心结论", "现有易迅逐票数据和公开资料没有形成“加拿大油菜籽经第三国换单、改报原产地后进入中国”的具体证据。加拿大流向巴基斯坦、孟加拉国、墨西哥等国的A段流量明显，但这些国家对华同商品B段为空；易迅对华端识别的251票均为哈萨克斯坦原产，公开资料与货描也支持其本国产供应。风险等级为低至中：保留宏观路线线索，但不能认定逃避反倾销税。")

doc.add_heading("一、执行摘要", level=1)
doc.add_paragraph("本次严格按“税号+关键词”双路径，对易迅所有分页和所有页面可见记录逐条采集、去重和判定。四个查询原始合计12,100条，按12项页面可见字段精确去重后10,145票；逐票判定为明确纳入4,177票、待核365票、排除5,603票。排除项主要为菜籽油、菜籽粕、机械设备、种用油菜籽及关键词误命中。")
add_table(doc, ["事项", "数量/规模", "分析结论", "证据等级"], [
    ["加拿大→中国（易迅）", "0票", "平台本次未覆盖到，但外部官方统计显示直达贸易真实存在", "平台覆盖缺口"],
    ["加拿大→第三国", "560票；其中513票纳入、47票待核", "主要为巴基斯坦、孟加拉国、墨西哥；可解释为市场转移", "背景/线索"],
    ["第三国→中国", "251票；37,560,217kg", "全部为哈萨克斯坦原产；无加拿大A段进入哈萨克斯坦", "已核实的数据事实"],
    ["两段共同中间国", "0个", "未形成加拿大→X→中国的国家级闭环", "无闭环"],
    ["跨段主体重合", "0个", "未见企业名跨A/B段重合", "无主体证据"],
    ["公开检索具体转运证据", "未发现", "未见同箱、同提单、换单、原产证伪造或企业串联证据", "未证实"],
], [1900, 2100, 3660, 1700], 8.8)

doc.add_heading("二、政策口径、税率与涉及税种", level=1)
doc.add_paragraph("商务部公告2026年第14号终裁认定原产于加拿大的进口油菜籽存在倾销，自2026年3月1日起征收反倾销税，实施期5年；英文名称Rape or colza seeds，中国税号为12051090、12059090，所有加拿大公司税率5.9%。")
add_table(doc, ["阶段", "期间", "税率/保证金", "税务处理"], [
    ["初裁临时措施", "2025-08-14至2025-12-13", "保证金比率75.8%", "依终裁5.9%结算转税；超出部分及多征增值税退还，少征不补"],
    ["过渡期", "2025-12-14至2026-02-28", "已提供保证金", "海关退还"],
    ["终裁措施", "2026-03-01起5年", "反倾销税5.9%", "反倾销税=海关计税价格×5.9%"],
], [1900, 2100, 1800, 3560], 9)
doc.add_paragraph("除反倾销税外，进口环节增值税计税基础还包括海关计税价格、关税和反倾销税。若将加拿大原产货物伪报为第三国原产，潜在少缴不仅包括5.9%反倾销税，还包括因反倾销税未计入增值税税基而少缴的进口环节增值税差额。由于易迅金额字段币种和口径不统一，且不是中国海关审定完税价格，本报告不以平台金额估算逃税额。")
add_callout(doc, "数量与税额边界", "本次未发现可归为加拿大原产的第三国对华票，因此“涉嫌逃避反倾销税的可确认数量”为0。哈萨克斯坦对华37,560,217kg属于真实第三国产品线索，不应计入逃税数量。若后续取得原产证、报关单或提单证明其中夹有加拿大货，才能据实际完税价格核算少缴反倾销税及进口增值税差额。", fill=GREEN, title_color="215E21")

doc.add_heading("三、易迅全量查询与逐票方法", level=1)
add_table(doc, ["查询口径", "结果数", "分页", "完整性"], [
    ["HS 120510", "5,364", "27页（末页164条）", "已逐页采集"],
    ["HS 120590", "887", "5页（末页87条）", "已逐页采集"],
    ["CANOLA SEED", "682", "4页（末页82条）", "已逐页采集"],
    ["RAPESEED", "5,167", "26页（末页167条）", "已逐页采集"],
], [2500, 1500, 2700, 2660], 9.2)
doc.add_paragraph("判定规则：明确油菜籽名称、哈俄乌语等同义词，或命中中国列明8位非种用税号且未显示衍生物/种用用途的，列“纳入”；命中六位税号但用途或品名不足的列“待核”；菜籽油、菜籽粕、种用/播种用种子、机械设备和其他误命中列“排除”。路线按原产国与目的国拆分为加拿大直达中国、加拿大流向第三国、第三国来源进入中国和其他全球基线。")

doc.add_heading("四、加拿大流向第三国：存在市场转移，但不是绕道证据", level=1)
canada_dest = SUMMARY["路线汇总"]["加拿大流向第三国"]["目的国"][:10]
rows = [[x["名称"], x["票数"], x["明确纳入"], x["待核"], fmt_num(x["重量合计_原字段"], 2), fmt_num(x["数量合计_原字段"], 2), fmt_num(x["金额合计_原字段"], 2)] for x in canada_dest]
add_table(doc, ["目的国", "票数", "纳入", "待核", "重量原字段", "数量原字段", "金额原字段"], rows, [1400, 850, 800, 800, 1650, 1650, 2210], 8.2)
doc.add_paragraph("巴基斯坦、孟加拉国、墨西哥是加拿大油菜籽的重要终端市场，易迅A段流量与加拿大统计/行业公开数据方向一致。加拿大农业部门披露，巴基斯坦在2025年10月批准若干转基因油菜事件，使加拿大对巴出口在2025年末恢复；因此2026年巴基斯坦大幅进口具有明确监管和消费市场解释。墨西哥长期是加拿大主要油菜籽市场，孟加拉国亦为2025—2026年显著增长市场。")
doc.add_paragraph("仅有“加拿大对第三国出口增多”不能证明再出口中国。现有数据没有显示巴基斯坦、孟加拉国、墨西哥以本国原产油菜籽对华出口；也没有同一企业、同一票量或时间闭合。更合理的解释是加拿大在初裁高保证金期间开拓替代终端市场和当地压榨需求。")

doc.add_heading("五、第三国对华链路：哈萨克斯坦真实供应链", level=1)
doc.add_paragraph("易迅识别251票第三国原产油菜籽进入中国，全部原产国为哈萨克斯坦，合计重量字段37,560,217kg。月度由2025年10月15票上升至2026年2月45票，并持续至2026年6月。货描普遍直接写明“哈萨克斯坦原产”“2025年收获”“非播种用”，HS集中为1205109000。")
add_table(doc, ["境内采购商（标准化后）", "主要境外供应商", "票数", "风险解释"], [
    ["INNER MONGOLIA HUIFENGSHOU AGRICULTURAL TECHNOLOGY", "KOSTANAY ZERNOKORM（多种俄文写法）", "99票左右", "稳定跨境粮油贸易；需常规核原产证"],
    ["GANSU MILIANG INTERNATIONAL TRADING", "MILIANG AGRICULTURE CORPORATION", "42票", "企业名关联但链路为哈萨克斯坦→中国，不连加拿大"],
    ["INNER MONGOLIA YIPENG GRAIN AND OIL", "KOSTANAY ZERNOKORM", "多票", "与内蒙古/满洲里区域贸易相符"],
    ["GANSU JULIANGYUAN TRADING", "ALLIANCEEXPORT", "18票左右", "可进一步核查产地证与农场/仓单"],
    ["MANZHOULI HUIYUE / FENGHE", "TA-GRANIT / EBX SOIL / MILIANG", "多票", "口岸型进口主体；无加拿大上游证据"],
], [2700, 2700, 1100, 2860], 8.4)
doc.add_paragraph("哈萨克斯坦政府公开资料显示其对华农产品出口持续增长，双方已签署多类植物产品准入协议，大量本国企业获准对华出口。易迅数据中也没有任何加拿大原产油菜籽先进入哈萨克斯坦的A段记录；因此不存在供给能力或上游来源矛盾。")
add_callout(doc, "对哈萨克斯坦251票的判定", "这些票是应做原产地合规抽核的真实第三国产品，而不是现有证据下的加拿大绕道票。建议抽取头部供应商、满洲里/内蒙古进口主体和2026年3月峰值批次，核验哈萨克斯坦原产证、生产者/农场、仓单、铁路运单和批次；只有出现加拿大上游货权、加拿大装运单据或产能矛盾，风险才可升级。", fill=GREEN, title_color="215E21")

doc.add_heading("六、外部统计交叉验证与平台覆盖差异", level=1)
doc.add_paragraph("加拿大油菜籽行业公开表（数据源为加拿大统计局）显示：2026年1—6月加拿大对中国油菜籽出口1,876,339吨，其中1月为0、2月114,223吨、3月368,974吨、4月452,240吨、5月608,418吨、6月332,483吨。易迅本次四口径未出现加拿大→中国记录，说明平台结果对该贸易流存在覆盖缺口或报告国/数据源差异。")
doc.add_paragraph("这一差异有两层含义：第一，不能把易迅“0票”解释成真实贸易“0吨”；第二，外部统计显示3月终裁后直达贸易快速恢复，说明5.9%税率下直接进口仍可进行，绕道规避的边际动机明显弱于2025年初裁75.8%保证金阶段。加拿大政府也称自2026年3月1日起加拿大油菜籽综合适用税率降至14.9%（含反倾销税等），由接近85%大幅下降。")

doc.add_heading("七、第三国绕道证据检验", level=1)
add_table(doc, ["指标", "本次结果", "判断"], [
    ["同一中间国双段", "加拿大A段目的国与第三国B段原产国无交集", "不支持"],
    ["进口—再出口时滞", "无可匹配B段", "无法形成"],
    ["数量近似/闭合", "无同国B段，未见近似批次", "不支持"],
    ["主体重合", "跨段企业标准名重合0个", "不支持"],
    ["提单/箱号/船名", "易迅页面字段未提供，公开检索未发现", "关键数据缺失"],
    ["原产地矛盾", "对华251票均明确哈萨克斯坦，且有真实产业/准入背景", "存在反证"],
    ["路线动机", "2025年高保证金时存在转移压力；2026年税率降低且直达恢复", "动机下降"],
], [2500, 4200, 2660], 9)
add_callout(doc, "总体风险评级：低至中（线索级）", "没有具体证据指向加拿大油菜籽经第三国逃避5.9%反倾销税。A段市场转移是需要持续监测的宏观线索，但尚缺B段、主体、数量、提单和原产证闭合。不可将第三国进口或哈萨克斯坦对华贸易直接认定为走私。", fill=AMBER)

doc.add_heading("八、建议优先核查实体与单证", level=1)
add_table(doc, ["优先级", "对象", "核查资料", "目标"], [
    ["A", "易迅对华哈萨克斯坦票的头部进口商及供应商", "原产证、农场/生产者、仓单、铁路运单、合同发票、付款路径", "确认哈萨克斯坦实质原产"],
    ["A", "2026年3月对华峰值批次", "逐票报关单、税号、原产国、启运国、境外发货人、净重、口岸", "排除加拿大货混入或启运/原产混淆"],
    ["B", "巴基斯坦加拿大进口链：BUNGE CANADA、RICHARDSON等", "当地进口人、卸港、压榨厂入库与加工记录", "验证终端压榨而非原状再出口"],
    ["B", "孟加拉国、墨西哥大宗加拿大进口链", "港口、进口人、加工产能、再出口报关", "持续监测是否新出现对华B段"],
    ["C", "加拿大直达中国（外部统计流）", "中国报关单和税款缴款书", "确认5.9%反倾销税依法缴纳；这是核税，不是绕道调查"],
], [950, 2700, 3400, 2310], 8.7)

doc.add_heading("九、进一步数据需求", level=1)
for t in [
    "中国进口报关单全字段：10位税号、原产国、启运国、境外发货人、境内收货人、成交方式、完税价格、征免性质和口岸。",
    "历史提单/铁路运单：提单号、箱号、封志、船名航次/车皮号、装卸港（站）、通知方和货代，以开展同箱或短期换单匹配。",
    "原产地证及其签发机构、生产者/农场、收获年度、仓单、植检证和质量证书，重点覆盖哈萨克斯坦头部主体。",
    "巴基斯坦、孟加拉国、墨西哥对中国HS120510/120590的官方出口明细，至少按月、企业、数量和原产国拆分。",
    "加拿大对华直达贸易的中国侧进口数据，用于与加拿大统计局1,876,339吨镜像比对并核验税款。",
]:
    bullet(doc, t)

doc.add_heading("十、查询日志与公开来源", level=1)
add_table(doc, ["来源", "口径/链接", "用途"], [
    ["易迅数据", "HS120510、HS120590、CANOLA SEED、RAPESEED；2025-08-06至2026-08-06", "62页逐票底表与路线匹配"],
    ["商务部公告2026年第14号", "https://policy.mofcom.gov.cn/claw/clawContent.shtml?id=104994", "终裁范围、5.9%税率、税款公式、追溯期"],
    ["商务部公告2025年第40号", "https://interview.mofcom.gov.cn/mofcom_interview/front/opdata/downlodePdfNew?id=e7f48170937843acbb38b7e9f260bb7d", "初裁75.8%保证金"],
    ["Canola Council/Statistics Canada", "https://www.canolacouncil.org/markets-stats/exports/", "2026年加拿大分目的国月度油菜籽出口"],
    ["Global Affairs Canada", "https://www.canada.ca/en/global-affairs/news/2026/03/canada-secures-renewed-market-access-with-china-to-boost-exports-and-strengthen-economic-collaboration.html", "2026年3月税率下降和市场恢复背景"],
    ["Agriculture and Agri-Food Canada", "https://agriculture.canada.ca/en/department/transparency/briefing-documents/committee-appearances/deputy-ministers-briefing-book-february-10-2026", "巴基斯坦转基因准入与加拿大出口恢复"],
    ["Kazakhstan Ministry of Agriculture", "https://www.gov.kz/memleket/entities/moa/press/news/details/1224873?lang=en", "哈萨克斯坦对华农产品出口和准入背景"],
], [1900, 5200, 2260], 8)

doc.add_heading("十一、局限与证据等级", level=1)
doc.add_paragraph("已证实：四口径所有分页完整采集；去重后每票均有判定；加拿大A段560票、哈萨克斯坦B段251票及其页面字段可复核。")
doc.add_paragraph("未证实：加拿大经巴基斯坦、孟加拉国、墨西哥等第三国再进入中国；没有同箱、同提单、同企业或数量闭合证据。")
doc.add_paragraph("反证/替代解释：第三国进口目的地具有真实压榨和消费市场；哈萨克斯坦具备真实本国产供应链；2026年3月税率降低后加拿大直达中国贸易恢复。")
doc.add_paragraph("局限：易迅是多国贸易情报记录集合，不等同各国海关全量统计；不同数据源的重量、数量、金额单位不完全一致；页面缺少箱号、提单号、船名航次和中国税款信息。")

doc.core_properties.title = "油菜籽反倾销税与第三国转运风险深度分析报告"
doc.core_properties.subject = "加拿大油菜籽第三国转运风险"
doc.core_properties.author = ""
doc.core_properties.keywords = "油菜籽,反倾销税,加拿大,第三国转运,易迅数据"
doc.save(OUT)
print(OUT)
