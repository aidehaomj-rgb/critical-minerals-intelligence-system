from __future__ import annotations

"""Build the n-propanol data-gap stage report.

This is deliberately not a shipment-audit report.  It records the completed local
filesystem audit, public-source findings, and the exact evidence still required
before any conclusion about third-country circumvention can be made.
"""

import os
from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Pt

from build_epdm_stage_report import (
    BODY,
    BLUE,
    GOLD,
    GREEN,
    INK,
    MUTED,
    NAVY,
    PALE_BLUE,
    PALE_GOLD,
    PALE_GRAY,
    PALE_GREEN,
    PALE_RED,
    RED,
    add_callout,
    add_heading,
    add_hyperlink,
    add_list_item,
    add_mixed_paragraph,
    add_page_number_field,
    add_paragraph,
    add_source,
    add_table,
    configure_document,
    create_numbering,
    set_run_font,
)


OUTPUT_DIR = Path(
    os.environ.get(
        "NPROPANOL_REPORT_DIR",
        r"D:\易迅数据\反倾销税深度分析报告\14_正丙醇",
    )
)
OUTPUT_FILE = OUTPUT_DIR / "正丙醇_反倾销反补贴与第三国转运风险_数据缺口阶段报告.docx"


def reset_header_footer(doc: Document) -> None:
    section = doc.sections[0]
    header = section.header.paragraphs[0]
    header.clear()
    header.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    header.paragraph_format.space_after = Pt(0)
    set_run_font(
        header.add_run("反倾销税风险穿透分析｜正丙醇（NPA）｜2026-08-13"),
        size=8.5,
        color=MUTED,
    )
    footer = section.footer.paragraphs[0]
    footer.clear()
    footer.paragraph_format.space_after = Pt(0)
    # Reuse the accessible PAGE field helper, then replace the inherited label.
    add_page_number_field(footer)
    if footer.runs:
        footer.runs[0].text = "正丙醇数据缺口阶段报告  |  "

    props = doc.core_properties
    props.title = "正丙醇反倾销反补贴与第三国转运风险数据缺口阶段报告"
    props.subject = "本地数据缺口审计、现行双反措施、公开供应链核查与证据闭环"
    props.author = "反倾销税风险分析项目"
    props.keywords = "正丙醇; NPA; 反倾销; 反补贴; 易迅数据; 第三国转运; 数据缺口"


def set_repeat_header_text(table) -> None:
    """Assign alternative text to a table for screen-reader navigation."""
    tbl_pr = table._tbl.tblPr
    caption = OxmlElement("w:tblCaption")
    caption.set(qn("w:val"), "正丙醇阶段报告数据表")
    tbl_pr.append(caption)


def gap_table(doc: Document, headers, rows, widths, **kwargs):
    table = add_table(doc, headers, rows, widths, **kwargs)
    set_repeat_header_text(table)
    # Keep a repeated header with at least the first data row.  Without this,
    # Word/WPS may leave a table header by itself at the foot of a page.
    if len(table.rows) > 1:
        for cell in table.rows[0].cells:
            for paragraph in cell.paragraphs:
                paragraph.paragraph_format.keep_with_next = True
    return table


def page_break(doc: Document) -> None:
    doc.add_page_break()


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    doc = Document()
    configure_document(doc)
    reset_header_footer(doc)
    bullets = create_numbering(doc, bullet=True)
    decimals = create_numbering(doc, bullet=False)

    # Cover and decision brief.
    p = doc.add_paragraph(style="Title")
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    set_run_font(p.add_run("正丙醇（NPA）"), size=27, color=NAVY, bold=True)
    add_paragraph(
        doc,
        "反倾销、反补贴与第三国转运风险｜数据缺口阶段报告",
        size=16,
        color=BLUE,
        bold=True,
        after=4,
    )
    add_paragraph(
        doc,
        "报告状态：本地全盘内容审计已完成；易迅网页全库逐票查询尚未执行",
        size=10.5,
        color=RED,
        bold=True,
        after=14,
    )
    gap_table(
        doc,
        ["本地扫描", "文本命中", "目标逐票记录", "网页逐票状态"],
        [["256个文件", "42处，已逐条复核", "0条", "未查询／不可下结论"]],
        [1900, 2600, 2100, 2760],
        header_fill=PALE_BLUE,
        font_size=10.0,
        aligns=[WD_ALIGN_PARAGRAPH.CENTER] * 4,
    )
    add_callout(
        doc,
        "阶段性结论",
        "现行政策形成极高的规避激励：美国原产正丙醇同时承受254.4%—267.4%的反倾销税与34.2%—37.7%的反补贴税。公开资料确认美国生产商在亚洲设有销售或区域实体，也确认南非、台湾等非美国来源具有真实生产能力；因此，第三国对华供货既可能是美国货转运，也可能是第三国真实生产。本地现有文件中没有正丙醇逐票原始数据，且本阶段未进入易迅网页逐页查询，故无法判断是否存在绕道、涉及多少票/数量/金额、由哪些企业或口岸实施，更不能测算实际逃税额。",
        fill=PALE_GOLD,
        title_color=GOLD,
    )
    gap_table(
        doc,
        ["判断维度", "当前等级", "可以说什么", "不能说什么"],
        [
            ["政策规避激励", "A（已证）", "双反税率高，措施在复审期间继续实施", "不能由税率反推出发生绕道"],
            ["区域链可行性", "C（待证）", "OQ、Dow、Eastman存在亚洲区域实体/供货网络", "不能把关联公司或销售办公室当作转运证据"],
            ["易迅逐票证据", "未评估", "仅能确认D盘现有文件无目标逐票记录", "不能声称易迅数据库无数据或无风险"],
            ["违法／逃税闭环", "未形成", "列出下一步所需提单、产地、申报与税款证据", "不能指控任何实体伪报产地、走私或逃税"],
        ],
        [1600, 1200, 3160, 3400],
        header_fill=PALE_GRAY,
        font_size=8.7,
    )
    add_paragraph(doc, "基准日：2026年8月13日｜公开检索与本地快照均截至该日。", size=9, color=MUTED, after=0)

    page_break(doc)
    add_heading(doc, "1. 审计边界与本地数据缺口", 1)
    add_heading(doc, "1.1 本地全盘内容审计", 2)
    add_paragraph(
        doc,
        "对D:\\易迅数据下可解析的XLSX、XLS、CSV、JSON进行只读盘点。审计对象共256个文件：28个XLSX、71个CSV、157个JSON；解析错误为0。关键词覆盖中文名、英文别名、CAS 71-23-8、HS 29051210及UN 1274，并设置异丙醇、2-丙醇、CAS 67-63-0等排除词。",
    )
    gap_table(
        doc,
        ["复核结果", "命中数", "排除依据"],
        [
            ["项目元数据", "2", "仅为清单/进度台账中的项目名称，不是交易记录"],
            ["丙二醇丙醚等其他化学品", "7", "货描指向PROPOXY PROPANOL／GLYCOL ETHER，非正丙醇"],
            ["NPA企业简称且HS不符", "32", "NPA出现在企业名；货物为聚醚/多元醇，HS 3907299900"],
            ["数字偶合", "1", "数字序列被宽松规则命中，货描和HS均为动物产品"],
            ["确认的正丙醇逐票记录", "0", "42处命中均完成排除，无待定项"],
        ],
        [2400, 1200, 5760],
        header_fill=PALE_BLUE,
        font_size=9.2,
    )
    add_callout(
        doc,
        "必须保留的边界",
        "“本地目标逐票0条”只意味着当前D盘快照没有可用于第14项审计的原始正丙醇交易记录。它不等于易迅网页数据库查询结果为0，不等于中国没有进口，也不等于不存在第三国转运。",
        fill=PALE_RED,
        title_color=RED,
    )
    add_heading(doc, "1.2 当前缺口对分析结论的影响", 2)
    gap_table(
        doc,
        ["缺失数据", "直接影响", "补齐方式"],
        [
            ["中国进口逐票数据", "无法统计美国直达、第三国对华票数/重量/金额/实体/口岸", "执行NPA-YX-01与NPA-YX-02，全量翻页"],
            ["美国出口A腿逐票数据", "无法把美国生产/出口与第三国后续对华发运做实体、时间和数量闭合", "执行NPA-YX-03，再以30/60/90天窗口匹配"],
            ["提单与海关申报闭环", "即使A/B腿相似，也不能确认同批货或原产地伪报", "调取提单号、箱号、船名航次、产地证、报关单、缴款书、批号/罐号"],
        ],
        [2200, 4000, 3160],
        header_fill=PALE_GRAY,
        font_size=9.0,
    )

    page_break(doc)
    add_heading(doc, "2. 现行反倾销与反补贴措施", 1)
    add_heading(doc, "2.1 产品范围", 2)
    add_paragraph(
        doc,
        "措施对象为原产于美国的进口正丙醇；中文别名包括1-丙醇、丙醇；英文名包括n-Propanol、n-Propylalcohol、1-Propanol、1-Propylalcohol、Propan-1-ol、Ethylcarbinol、1-Hydroxypropane，简称NPA。分子式C3H8O，税则号列29051210。原产国而非起运国决定双反税是否适用。",
    )
    add_heading(doc, "2.2 公司税率与叠加", 2)
    gap_table(
        doc,
        ["美国生产/出口公司", "反倾销税", "反补贴税", "双反合计", "若按13%增值税联动的增量系数*"],
        [
            ["陶氏化学公司（The Dow Chemical Company）", "254.4%", "37.7%", "292.1%", "330.073%"],
            ["OQ化学公司（OQ Chemicals Corporation）", "267.4%", "34.2%", "301.6%", "340.808%"],
            ["其他美国公司", "267.4%", "37.7%", "305.1%", "344.763%"],
        ],
        [3000, 1200, 1200, 1200, 2760],
        header_fill=PALE_BLUE,
        font_size=8.6,
        aligns=[WD_ALIGN_PARAGRAPH.LEFT] + [WD_ALIGN_PARAGRAPH.CENTER] * 4,
    )
    add_paragraph(
        doc,
        "* 仅作核查排序：增量系数=(反倾销税率+反补贴税率)×1.13，反映双反税进入进口增值税计税基础时的联动；不含普通关税及其他税费，也不是任何一票的实际应补税额。实际金额必须以海关审定完税价格、公司税率归属、申报原产地、已缴税款和适用税制为准。",
        size=9.2,
        color=MUTED,
    )
    add_heading(doc, "2.3 政策时间轴与复审状态", 2)
    gap_table(
        doc,
        ["日期", "节点", "当前意义"],
        [
            ["2019-07-23／07-29", "反倾销／反补贴原审立案", "措施调查启动"],
            ["2020-11-17", "商务部公告2020年第46号、47号终裁", "确认倾销、补贴及损害；公布公司税率"],
            ["2020-11-18", "双反措施开始实施", "原定5年"],
            ["2025-11-18", "商务部公告2025年第74号、75号期终复审开始", "复审期间继续按原范围和税率征收"],
            ["2026-11-18前（不含本日）", "两项复审公告规定的调查截止", "截至本报告日仍在复审期；应持续监测终裁"],
        ],
        [1900, 3300, 4160],
        header_fill=PALE_GRAY,
        font_size=9.0,
    )
    add_callout(
        doc,
        "风险含义",
        "双反合计税率达到292.1%—305.1%，足以形成显著的起运国、收发货人和原产地申报核查激励。但“高税率”只是动机层证据；只有证明美国原产货物经第三国后对华申报为非美国原产、且税款少缴，才能进入逃税闭环。",
        fill=PALE_GOLD,
        title_color=GOLD,
    )

    # Continue after the query tables to avoid a nearly empty continuation page.
    add_heading(doc, "3. 公开产能与供应链反证", 1)
    add_paragraph(
        doc,
        "第三国出口增长不能自动解释为美国货转运。公开资料显示，多地具有真实生产或商业供货能力；逐票核查必须先区分“真实第三国产品”与“美国原产货物借道”。",
    )
    gap_table(
        doc,
        ["国家/地区与实体", "公开证据", "证明力", "对绕道研判的约束"],
        [
            ["美国｜OQ Chemicals Bay City", "认证附件明确该工厂生产n-Propanol；公司材料载明Bay City设有Propanol装置", "确认美国受税来源真实生产", "若第三国A腿卖方/品牌指向OQ，须追溯批号和生产工厂"],
            ["南非｜Sasol Secunda", "环境合规审计记载038N装置生产NPA，提升后能力235.4吨/日", "量化的第三国真实产能反证", "南非对华货物可能为当地生产；不得仅凭路线判为美国原产"],
            ["台湾地区｜Dairen Chemical", "管理体系证书列明Dafa、Mailiao工厂制造n-Propanol", "第三国/地区真实制造反证", "应核验实际制造工厂、批次、原料和产地证，不可因关联贸易认定转运"],
            ["美国/亚太｜Eastman", "官方产品页列示n-Propanol，并标注亚太可供应；未在该页披露具体生产厂", "确认商业供货能力，不确认产地", "Eastman品牌货需以COA/批号/工厂字段判定，品牌或亚太卖方不足以定原产地"],
        ],
        [2100, 3300, 1760, 2200],
        header_fill=PALE_BLUE,
        font_size=8.5,
    )
    add_callout(
        doc,
        "反证优先原则",
        "出现“新加坡/日本/德国/台湾/南非发货”时，第一步不是认定绕道，而是核验该票是否由当地生产能力支撑。只有当地无产能、生产能力与货量不匹配、COA/批号指向美国工厂，或A/B腿达到同批货闭合，风险等级才能上调。",
        fill=PALE_GREEN,
        title_color=GREEN,
    )
    add_heading(doc, "3.1 美国生产商的区域实体链：仅作为查询入口", 2)
    gap_table(
        doc,
        ["候选链", "已证事实", "待查证事实", "当前等级"],
        [
            ["OQ Bay City → OQ Singapore/Tokyo/德国 → 中国", "公司全球足迹同时列有Bay City生产基地和Singapore、Tokyo等办公室", "是否有NPA A腿；中间实体是否持货/分装；B腿是否同批；申报原产地", "C"],
            ["Dow美国 → Dow Chemical Pacific Singapore/HK → 中国", "Dow官方地点/法律实体页确认新加坡与香港区域实体；Dow为列名受税公司", "这些实体是否实际收发正丙醇；生产工厂、批号、A/B腿和中国申报", "C"],
            ["Eastman美国供货 → Eastman Asia Pacific Singapore → 中国", "Eastman官方确认新加坡客户服务中心/区域总部，产品页载明亚太可供应", "具体生产工厂、美国A腿、区域实体B腿、同批关联和原产地申报", "C"],
        ],
        [2800, 2800, 2860, 900],
        header_fill=PALE_GRAY,
        font_size=8.6,
    )
    add_paragraph(
        doc,
        "说明：以上实体名称均来自公开公司资料，仅用于构造易迅查询词和调证对象。存在关联公司、区域总部、销售办公室或亚太供货能力，是合法商业安排的常见表现，本身不构成转运、伪报产地或逃税证据。",
        size=9.4,
        color=MUTED,
    )

    # Continue after the field table to use remaining page space.
    add_heading(doc, "4. 三组最简易迅查询条件", 1)
    add_callout(
        doc,
        "查询纪律",
        "每页切换为200条，从第1页读到末页；记录页面总数、查询时间和0结果；每条记录均做范围筛选与路线角色判定；不得在发现异常后提前停止。跨税号/关键词查询后按平台全部可见字段去重，同时保留重复审计表。",
        fill=PALE_BLUE,
        title_color=BLUE,
    )
    add_heading(doc, "NPA-YX-01｜中国进口基线", 2)
    gap_table(
        doc,
        ["字段", "条件"],
        [
            ["数据方向", "中国进口／目的国中国（按平台字段选择）"],
            ["日期", "2024-08-13—2026-08-13"],
            ["HS编码", "29051210"],
            ["货描/企业/来源国", "均留空／全部"],
            ["取数后排除", "ISOPROPANOL、2-PROPANOL、IPA、CAS 67-63-0"],
            ["目标", "同时覆盖美国直达与第三国对华B腿候选"],
        ],
        [2200, 7160],
        header_fill=PALE_GRAY,
        font_size=9.2,
    )
    add_heading(doc, "NPA-YX-02｜货描关键词补漏", 2)
    gap_table(
        doc,
        ["字段", "条件"],
        [
            ["数据方向/日期", "同NPA-YX-01"],
            ["HS编码", "留空"],
            ["产品词", "先N-PROPANOL；结果少时依次复用1-PROPANOL、71-23-8"],
            ["禁止的宽泛查询", "不要单独使用NPA；企业简称噪声极高"],
            ["额外排除", "PROPOXY PROPANOL、GLYCOL ETHER及NPA-YX-01排除项"],
            ["目标", "发现错分税号、缩写或CAS货描记录；跨查询去重"],
        ],
        [2200, 7160],
        header_fill=PALE_GRAY,
        font_size=9.2,
    )
    add_heading(doc, "NPA-YX-03｜美国出口A腿", 2)
    gap_table(
        doc,
        ["字段", "条件"],
        [
            ["数据方向", "美国出口"],
            ["日期", "2024-08-13—2026-08-13"],
            ["Schedule B/HS", "2905120010；平台只接受6位时使用290512"],
            ["目的国/企业/产品词", "目的国全部；企业和产品词留空"],
            ["结果内优先标记", "OQ/OXEA、DOW、EASTMAN，以及流入新加坡、日本、德国、韩国、香港等中间节点的记录"],
            ["目标", "与Q1/Q2按实体、日期、数量、货描、批号/提单做30/60/90天A/B腿匹配"],
        ],
        [2200, 7160],
        header_fill=PALE_GRAY,
        font_size=9.2,
    )

    # Continue after the compliance callout to use remaining page space.
    add_heading(doc, "5. 全量逐票分析框架", 1)
    add_heading(doc, "5.1 范围筛选与排除", 2)
    for text in [
        "产品身份：优先以CAS 71-23-8＋正丙醇明确货描确认；HS 29051210是重要入口，但不得单独决定产品身份。",
        "同分异构体排除：异丙醇/2-丙醇/IPA/CAS 67-63-0必须排除；“propanol”宽泛货描进入人工复核。",
        "衍生物排除：丙二醇醚、丙二醇丙醚、醋酸正丙酯等不直接等同于本案正丙醇。",
        "单位保真：平台数量、重量、金额和币种缺失时不得自行推断；仅在公开同票证据可验证时更正。",
    ]:
        add_list_item(doc, text, bullets)
    add_heading(doc, "5.2 路线角色与风险等级", 2)
    gap_table(
        doc,
        ["等级", "最低证据门槛", "表述边界"],
        [
            ["A｜闭环/官方确认", "官方案件，或同一提单/箱号/批号连接美国A腿与第三国B腿，并与中国申报/税款闭合", "可据证据描述已确认事实；违法结论仍以执法机关认定为准"],
            ["B+｜强关联", "同一实体链、同一产品规格，短时间窗口，数量高度吻合，且当地无充分产能解释", "可列为优先核查，不得称为走私或逃税"],
            ["B｜中关联", "实体、时间、数量、货描中多项相似，但存在库存/产能/单位等合理替代解释", "描述为第三国转运候选"],
            ["C｜弱线索", "仅有关联公司、区域实体、品牌或国家层面贸易可行性", "只用于查询扩展与调证排序"],
            ["排除/低风险", "第三国真实生产、时间不可能、产品不在范围、数量/规格明显不匹配", "保留排除依据，避免重复误报"],
        ],
        [900, 4300, 4160],
        header_fill=PALE_BLUE,
        font_size=8.7,
    )
    add_heading(doc, "5.3 逐票必须保留的关键字段", 2)
    gap_table(
        doc,
        ["字段组", "字段"],
        [
            ["交易主体", "境外发货人、境外收货人、中国进口人、通知方、报关企业"],
            ["产品身份", "完整货描、HS、CAS、品牌、纯度、包装、批号/罐号、COA生产工厂"],
            ["路线", "原产国、起运国、目的国、装货港、卸货港、船名航次、提单号、箱号"],
            ["计量", "重量及单位、数量及单位、金额、币种、单价（仅在单位明确时）"],
            ["申报与税款", "报关单、原产地证、完税价格、适用公司税率、反倾销税、反补贴税、进口增值税、缴款书"],
        ],
        [1700, 7660],
        header_fill=PALE_GRAY,
        font_size=9.0,
    )

    # Continue into the appendix; source headings retain keep-with-next behavior.
    add_heading(doc, "6. 证据闭环清单", 1)
    add_paragraph(
        doc,
        "只有下列环节全部或高度闭合，才能从“路线线索”进入“具体规避/逃税核查”。",
        after=10,
        keep=True,
    )
    closure_rows = [
        ["1", "产品同一性", "A/B腿均确认CAS 71-23-8，纯度、包装、品牌/规格可比", "货描、SDS、COA、检测报告"],
        ["2", "美国原产", "第三国发出货物的生产工厂/批号追溯至美国", "COA、生产批记录、原产地证、供应商声明、工厂装运记录"],
        ["3", "A/B腿同批", "美国→第三国与第三国→中国可由提单/箱号/罐号/批号或高度吻合的数量时间连接", "提单、箱号、船名航次、仓储出入库、罐区记录"],
        ["4", "第三国加工不足", "仅换单、换柜、分装、仓储或不足以改变原产地的处理", "BOM、工艺、成本、能耗、设备、生产日报、当地原产地规则"],
        ["5", "中国申报不一致", "申报原产国/税号/公司税率与事实不符", "中国报关单、随附单证、原产地证、审价资料"],
        ["6", "税款差额", "以海关完税价格和正确的AD/CVD公司税率重算，扣除已缴税款", "税款缴款书、完税价格、汇率、合同发票、公司身份承继材料"],
        ["7", "主观与组织链（执法层）", "指示换单、隐瞒产地或虚假单证的沟通/资金/代理安排", "邮件聊天、合同、付款路径、报关委托、货代/报关行记录"],
    ]
    gap_table(
        doc,
        ["序", "闭环环节", "通过标准", "关键调证"],
        closure_rows,
        [700, 1500, 3560, 3600],
        header_fill=PALE_BLUE,
        font_size=8.4,
    )
    add_heading(doc, "6.1 优先核查对象（待易迅命中后实名落位）", 2)
    for text in [
        "境外生产商/品牌：OQ/OXEA、Dow、Eastman；先确认美国工厂与第三国实体是否出现在同一供应链。",
        "潜在中间节点：新加坡、日本、德国、香港、韩国等区域实体所在地；仅在Q3 A腿有实际发运且Q1/Q2存在对应B腿时上调。",
        "真实第三国产能：Sasol南非、Dairen台湾等；任何对华记录先核验当地生产批次，作为排除或反证。",
        "中国侧：进口人、最终用户、报关企业和入境口岸必须由逐票结果产生；在没有逐票命中前不得预设高风险口岸或企业。",
    ]:
        add_list_item(doc, text, bullets)
    add_callout(
        doc,
        "实体合规提示",
        "本报告列名的企业均源自政策公告或企业公开资料。列名目的仅为建立查询词和调证路径，不表示其从事任何违法活动。任何实体级风险结论都必须由逐票数据和申报证据支持。",
        fill=PALE_RED,
        title_color=RED,
    )

    # Continue after the compliance callout to use remaining page space.
    add_heading(doc, "7. 当前风险结论与下一步", 1)
    gap_table(
        doc,
        ["问题", "当前结论", "理由"],
        [
            ["是否有高规避动机？", "是，A档事实", "双反合计292.1%—305.1%，且复审期间继续征收"],
            ["是否存在可查的第三国链？", "是，C档查询线索", "受税生产商/商业供应商在亚洲有区域实体；但尚无逐票发运证明"],
            ["是否存在真实第三国生产反证？", "是，A/B档事实", "Sasol南非有量化装置能力，Dairen台湾工厂认证列明NPA制造"],
            ["是否已发现美国→第三国→中国具体同批链？", "否，尚未完成检验", "本地目标逐票0条；网页未查询；无A/B腿匹配数据"],
            ["是否可以计算涉及数量和逃税额？", "不可以", "缺中国逐票重量/金额/完税价格、公司税率归属、申报与缴款数据"],
            ["是否可以锁定进口企业、报关行或口岸？", "不可以", "缺逐票中国侧主体、报关和口岸字段"],
        ],
        [2800, 1900, 4660],
        header_fill=PALE_BLUE,
        font_size=8.8,
    )
    add_heading(doc, "7.1 执行顺序", 2)
    steps = [
        "执行NPA-YX-01，完整读取中国进口HS 29051210的全部页；先形成产品范围基线。",
        "执行NPA-YX-02，按N-PROPANOL、1-PROPANOL、71-23-8分别补漏，记录0结果并跨查询去重。",
        "执行NPA-YX-03，完整读取美国出口A腿；标记OQ/OXEA、Dow、Eastman及流向潜在中间国的记录。",
        "按实体、日期、数量、规格做30/60/90天A/B腿匹配；对每个候选同时测试真实第三国产能和库存解释。",
        "只对B+以上候选调取提单、箱号/罐号、COA、产地证、中国报关单和税款缴款书；在此之后才能测算可能少缴的AD、CVD和增值税差额。",
    ]
    for item in steps:
        add_list_item(doc, item, decimals)
    add_heading(doc, "7.2 下一版报告的最低交付标准", 2)
    for text in [
        "三组查询均有查询截图/时间、页面总数和0结果记录，全部页面读取完毕。",
        "每条命中有范围判断、排除原因、路线角色、风险等级及证据缺口；原始数据不删行。",
        "按全字段精确去重与空白规范化等价去重分别报告，保留重复组审计表。",
        "每个B/B+候选给出A腿、B腿、同批证据、反证、缺口和调证对象；不得只展示异常样本。",
        "数量/金额/税款仅在单位、币种、完税价格和税率归属清楚时汇总，明确区分平台字段与税务测算。",
    ]:
        add_list_item(doc, text, bullets)

    # Continue into the appendix; source headings retain keep-with-next behavior.
    add_heading(doc, "8. 数据附件索引", 1)
    gap_table(
        doc,
        ["附件", "内容", "用途"],
        [
            ["正丙醇_本地文件盘点台账.csv", "256个文件的格式、来源类别与扫描状态", "证明扫描总体范围"],
            ["正丙醇_本地命中逐条复核42处.csv/json", "42处文本命中及逐条排除理由", "证明命中复核未留待定项"],
            ["正丙醇_本地盘点摘要.json", "文件数、格式数、命中分类、扫描深度与边界", "机器可读审计摘要"],
            ["正丙醇_本地盘点_QA.json", "7项QA全部通过", "验证256/42/0及3组查询计划"],
            ["正丙醇_易迅最简查询组合.csv/json", "NPA-YX-01至03", "后续网页全量查询输入"],
            ["正丙醇_数据缺口台账.csv/json", "中国进口、美国出口、提单/申报三类缺口", "跟踪闭环状态"],
            ["正丙醇_易迅逐票标准化_本地0条.csv/json", "预设逐票字段的空表", "明确未冒充已完成网页查询"],
        ],
        [2900, 3600, 2860],
        header_fill=PALE_GRAY,
        font_size=8.7,
    )

    add_heading(doc, "9. 公开资料来源", 1)
    sources = [
        ("P1", "商务部公告2025年第74号｜正丙醇反倾销期终复审", "https://trb.mofcom.gov.cn/myjjdc/art/2025/art_565e7a3a750c4f61bd54aca0ef147b1d.html", "确认复审、产品范围、AD税率、继续征收与2026-11-18前截止。"),
        ("P2", "商务部公告2025年第75号｜正丙醇反补贴期终复审", "https://trb.mofcom.gov.cn/myjjdc/art/2025/art_20bdb8bc57624e5bb333196a2f80911d.html", "确认复审、CVD税率、继续征收与调查期限。"),
        ("P3", "商务部公告2020年第46号｜正丙醇反倾销终裁", "https://cacs.mofcom.gov.cn/cacscms/articleDetail/jkdc?articleId=167328&id=53d8a6e276814e3f01768338fbcb0054", "确认终裁、范围、公司AD税率与计征方法。"),
        ("P4", "商务部公告2020年第47号｜正丙醇反补贴终裁", "https://cacs.mofcom.gov.cn/cacscms/articleDetail/ckys?articleId=167329&id=53d8a6e276814e3f01768339373d0058", "确认公司CVD税率、OQ/OXEA名称关系和计征方法。"),
        ("E1", "OQ Chemicals Bay City认证附件", "https://chemicals.oq.com/fileadmin/user_upload/OQ-Chemicals/Company/Service/Certificat/North_America/UM15_10005680_UM15_EN.pdf", "列明Bay City工厂的n-Propanol生产活动。"),
        ("E2", "OQ Chemicals公司足迹（2023）", "https://chemicals.oq.com/fileadmin/user_upload/OQ-Chemicals/Company/About_us/Facts_Figures/OQC_Company_Presentation_Oct_2023_EN.pdf", "列示Bay City生产基地与Singapore、Tokyo等办公室；只证明组织足迹。"),
        ("E3", "Dow全球地点", "https://corporate.dow.com/en-us/locations.html", "确认Dow Chemical Pacific (Singapore)等区域实体；不证明正丙醇发运。"),
        ("E4", "Eastman n-Propanol产品页", "https://www.eastman.com/en/products/product-detail/71000121/n-propyl-alcohol-n-propanol", "确认产品身份和亚太供应可得性；不单独确认生产工厂。"),
        ("E5", "Eastman新加坡区域总部", "https://www.eastman.com/en/who-we-are/locations/singapore", "确认新加坡客户服务中心和区域总部。"),
        ("E6", "Sasol Secunda NPA装置环境审计", "https://www.sasol.com/sites/default/files/2024-10/WSP%20Audit%20report_A1_01_Sasol_SO_SOL_EA_1.3.1.16.1%20G-21_20240615_Final.pdf", "列明038N装置生产NPA并记载235.4吨/日能力。"),
        ("E7", "Dairen Chemical管理体系证书附件", "https://www.dcc.com.tw/ccpweb.nsf/0/99B6F5F2D9273B824825878E001D2D43/%24FILE/%E6%AF%8D%E8%AD%89-50001%28%E8%8B%B1%29.002.pdf", "列明台湾Dafa、Mailiao工厂制造n-Propanol。"),
    ]
    for code, title, url, note in sources:
        add_source(doc, bullets, code, title, url, note)

    add_callout(
        doc,
        "公开检索结论",
        "以正丙醇、NPA、HS 29051210、美国原产、第三国转运、反倾销规避、原产地伪报、走私等中英文组合检索，未发现能够把具体美国正丙醇批次经第三国转入中国并少缴双反税闭合起来的权威公开案件或提单证据。该结论仅反映截至基准日的公开检索结果，不是对不存在相关行为的证明。",
        fill=PALE_GREEN,
        title_color=GREEN,
    )
    add_paragraph(
        doc,
        "免责声明：本报告用于风险筛查与调证排序，不构成海关归类、原产地、征税或违法认定。所有数量、主体、口岸和税款结论须以完整逐票数据及主管机关档案复核。",
        size=9,
        color=MUTED,
        italic=True,
        after=0,
    )

    doc.save(OUTPUT_FILE)
    print(str(OUTPUT_FILE))


if __name__ == "__main__":
    main()
