from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.section import WD_SECTION
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from pathlib import Path

OUT = Path(r"C:\Users\59809\Documents\关键矿产\outputs\yixun_rerouting_20260808\近3个月数据源_第三国绕道交叉核验报告_20260808.docx")
BLUE = "1F4E79"; LIGHT = "D9EAF7"; PALE = "F3F6F9"; RED = "C00000"; AMBER = "BF8F00"; GREEN = "548235"; GRAY = "666666"

doc = Document()
sec = doc.sections[0]
sec.page_width, sec.page_height = Inches(8.5), Inches(11)
sec.top_margin = sec.bottom_margin = sec.left_margin = sec.right_margin = Inches(1)
sec.header_distance = sec.footer_distance = Inches(0.492)

styles = doc.styles
normal = styles['Normal']; normal.font.name='Arial'; normal.font.size=Pt(10.5)
normal.paragraph_format.space_after=Pt(6); normal.paragraph_format.line_spacing=1.1
for sn,size,before,after in [('Heading 1',16,12,6),('Heading 2',13,10,5),('Heading 3',11.5,8,4)]:
    s=styles[sn]; s.font.name='Arial'; s.font.size=Pt(size); s.font.bold=True; s.font.color.rgb=RGBColor.from_string(BLUE)
    s.paragraph_format.space_before=Pt(before); s.paragraph_format.space_after=Pt(after)

def set_cell_shading(cell, fill):
    tcPr=cell._tc.get_or_add_tcPr(); shd=tcPr.find(qn('w:shd'))
    if shd is None: shd=OxmlElement('w:shd'); tcPr.append(shd)
    shd.set(qn('w:fill'),fill)

def set_cell_margins(cell, top=80, start=120, bottom=80, end=120):
    tc=cell._tc; tcPr=tc.get_or_add_tcPr(); tcMar=tcPr.first_child_found_in('w:tcMar')
    if tcMar is None: tcMar=OxmlElement('w:tcMar'); tcPr.append(tcMar)
    for m,v in [('top',top),('start',start),('bottom',bottom),('end',end)]:
        node=tcMar.find(qn('w:'+m))
        if node is None: node=OxmlElement('w:'+m); tcMar.append(node)
        node.set(qn('w:w'),str(v)); node.set(qn('w:type'),'dxa')

def style_table(t, widths=None, header=True):
    t.alignment=WD_TABLE_ALIGNMENT.CENTER; t.autofit=False
    for ri,row in enumerate(t.rows):
        for ci,c in enumerate(row.cells):
            c.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER; set_cell_margins(c)
            if widths: c.width=Inches(widths[ci])
            for p in c.paragraphs:
                p.paragraph_format.space_after=Pt(2); p.paragraph_format.line_spacing=1.05
                for r in p.runs: r.font.name='Arial'; r.font.size=Pt(9)
            if header and ri==0:
                set_cell_shading(c,BLUE)
                for r in c.paragraphs[0].runs: r.font.bold=True; r.font.color.rgb=RGBColor(255,255,255)

def add_bullet(text, level=0):
    p=doc.add_paragraph(style='List Bullet'); p.paragraph_format.left_indent=Inches(0.5); p.paragraph_format.first_line_indent=Inches(-0.25); p.paragraph_format.space_after=Pt(4)
    p.add_run(text); return p

def add_source(text,url):
    p=doc.add_paragraph(); p.paragraph_format.space_before=Pt(2); p.paragraph_format.space_after=Pt(4)
    r=p.add_run(f"来源：{text}  {url}"); r.font.size=Pt(8.5); r.font.color.rgb=RGBColor.from_string(GRAY)

# Memo masthead
p=doc.add_paragraph(); p.paragraph_format.space_after=Pt(4)
r=p.add_run('风险核验报告'); r.font.name='Arial'; r.font.size=Pt(11); r.font.bold=True; r.font.color.rgb=RGBColor.from_string(BLUE)
p=doc.add_paragraph(); p.paragraph_format.space_after=Pt(4)
r=p.add_run('近3个月仍更新国家数据：第三国绕道中国逃避反倾销税交叉核验'); r.font.name='Arial'; r.font.size=Pt(23); r.font.bold=True; r.font.color.rgb=RGBColor.from_string('111111')
p=doc.add_paragraph(); p.paragraph_format.space_after=Pt(14)
r=p.add_run('易讯海关数据、企业公开资料与商务部贸易救济公告交叉验证'); r.font.size=Pt(12.5); r.font.color.rgb=RGBColor.from_string(GRAY)
for label,value in [('核验日期','2026-08-08（北京时间）'),('数据范围','29个近3个月仍更新的国家/综合数据源；重点复核POM、PPS、豌豆淀粉、氯氰菊酯'),('证据口径','仅将可复核贸易字段视为事实；风险判断不等于违法认定'),('结论状态','发现1条高优先级两程组合线索，尚未形成同批次、同提单或同集装箱闭环')]:
    p=doc.add_paragraph(); p.paragraph_format.space_after=Pt(2)
    a=p.add_run(label+'：'); a.bold=True; a.font.size=Pt(10.5); p.add_run(value)

doc.add_heading('一、执行摘要', level=1)
p=doc.add_paragraph(); r=p.add_run('核心结论：'); r.bold=True; r.font.color.rgb=RGBColor.from_string(RED)
p.add_run('目前最接近“原产国→第三国→中国”直接证据的是共聚聚甲醛（POM）HOSTAFORM LW15EWX链路。平台出现德国原产同型号进入越南，并在措施实施后由越南企业向上海发出同型号货物；对华票商品描述明确含“#&DE”，而结构化原产地字段显示Vietnam。该冲突足以支持调取中国进口报关单、原产地证书和越南出口底单，但尚不足以认定逃税。')
add_bullet('PPS：美国原产FORTRON 1140L6大量、连续进入越南；对同一精确型号限定目的地China检索结果为0。现有证据证明上游渠道存在，但未发现对华第二程。')
add_bullet('加拿大豌豆淀粉：平台对华记录均早于2026年7月1日临时措施；加拿大原产仍被保留。措施后仅见新加坡贸易主体参与其他目的地交易，未见回流中国。')
add_bullet('印度氯氰菊酯：措施后存在印度生产商直接向中国发货，属于直接进口税负核查，不属于第三国绕道证据。')

doc.add_heading('二、近3个月仍更新的数据源范围', level=1)
p=doc.add_paragraph('平台日期控件最新日距2026年8月8日不超过92天的数据源共29个。重点包括美国、墨西哥全港、越南全港、印度尼西亚、巴基斯坦关单、环球提单及多个拉美、非洲数据库。日期上限仅代表平台可查询覆盖期，不保证最新日存在实际记录。')
t=doc.add_table(rows=1, cols=3); t.rows[0].cells[0].text='区域'; t.rows[0].cells[1].text='数据源'; t.rows[0].cells[2].text='最新日范围'
groups=[('北美洲','美国、墨西哥全港、巴拿马','2026-05-31至2026-08-04'),('南美洲','阿根廷、智利、秘鲁、哥伦比亚、巴拉圭、乌拉圭、厄瓜多尔','2026-05-31至2026-07-31'),('欧洲','乌克兰、英国','2026-05-30至2026-06-30'),('亚洲','孟加拉、巴基斯坦关单、越南全港、哈萨克斯坦、乌兹别克斯坦、菲律宾新版、斯里兰卡、印度尼西亚','2026-05-31至2026-07-31'),('非洲','埃塞俄比亚、乌干达、肯尼亚、莱索托、纳米比亚、科特迪瓦、加纳、喀麦隆、坦桑尼亚','2026-05-31至2026-06-30'),('综合','环球提单','2026-05-31')]
for row in groups:
    c=t.add_row().cells
    for i,v in enumerate(row): c[i].text=v
style_table(t,[1.0,4.25,1.25])

doc.add_heading('三、高优先级线索：POM经越南节点对华', level=1)
doc.add_heading('3.1 官方措施对应关系', level=2)
p=doc.add_paragraph('商务部2025年第25号公告决定自2025年5月19日起，对原产于美国、欧盟、台湾地区和日本的进口共聚聚甲醛征收反倾销税。欧盟列名企业塞拉尼斯生产德国有限及两合公司的税率为34.5%；涉案税则号为39071010、39071090。')
add_source('商务部公告2025年第25号','https://cacs.mofcom.gov.cn/cacscms/articleDetail/ckys?articleId=184327&id=53d8a9ed96a9aec50196e68a111c0496')
doc.add_heading('3.2 两程记录与字段冲突', level=2)
t=doc.add_table(rows=1, cols=7)
for i,h in enumerate(['环节','日期','流向','主体','商品/型号','数量','原产地字段']): t.rows[0].cells[i].text=h
rows=[
('第一程','2025-10-07','德国→越南','买方：CÔNG TY TNHH BỒ CÔNG ANH SÀI GÒN；卖方：CELANESE PERFORMANCE SOLUTIONS SWITZERLAND SARL','HOSTAFORM LW15EWX NATURAL；25kg/包','1,000','Germany'),
('第二程','2026-05-26','越南→中国','买方：SHANGHAI HENGJIU HUNDRED TRANSMISSION CO., LTD；卖方：Công Ty TNHH Hamakyu','HOSTAFORM LW15EWX，Celanese，商品描述含“#&DE”','25','平台列Vietnam；描述列DE'),
('配套料','2026-05-26','越南→中国','同上','用于按2%比例与LW15EWX混配的浅蓝色母料，描述含“#&VN”','2','Vietnam')]
for row in rows:
    c=t.add_row().cells
    for i,v in enumerate(row): c[i].text=v
style_table(t,[.65,.75,.85,1.55,1.7,.45,.75])
p=doc.add_paragraph(); r=p.add_run('证据解释：'); r.bold=True
p.add_run('第一程和第二程的越南企业并非同一主体，因此不能声称是同一批货直接中转；但精确牌号、德国来源、25kg标准包装、措施后对华流向以及“#&DE/Vietnam”字段冲突叠加，使该票具备最高调单价值。第二程25kg恰为第一程所示一袋规格，属于数量可衔接信号，但不是批次证据。')
doc.add_heading('3.3 实体风险画像', level=2)
add_bullet('Công Ty TNHH Hamakyu：公开资料显示其在越南经营工程塑料、板棒管膜及加工件，并具有工厂；这既使其具备真实加工/贸易能力，也意味着应核实是否发生足以改变原产地的实质性加工。')
add_bullet('Shanghai Hengjiu Hundred Transmission：公开资料显示其从事链传动、园林工具及工业零部件制造，POM低摩擦牌号与链条/传动件用途具有商业合理性；因此进口行为本身不能证明规避。')
add_source('Hamakyu官网与上海恒久百链公开企业资料','https://hamakyu.com.vn/gioi-thieu ; https://shanghaihengjiu.en.made-in-china.com/')

doc.add_heading('四、PPS：存在美国→越南上游，但未找到中国第二程', level=1)
p=doc.add_paragraph('商务部2025年第77号公告确认复审期间继续对日本、美国、韩国和马来西亚PPS征税。美国Solvay税率214.1%，Fortron Industries及其他美国公司220.9%；涉案产品包括改性、加玻纤等PPS组合物，税则号39119000。')
add_source('商务部公告2025年第77号','https://trb.mofcom.gov.cn/myjjdc/art/2025/art_9fa4ea413043469c8794445b2a5ac31f.html')
t=doc.add_table(rows=1, cols=6)
for i,h in enumerate(['日期','流向','型号','数量','越南买方','平台原产地']): t.rows[0].cells[i].text=h
for row in [('2026-05-27','美国→越南','FORTRON 1140L6 SF3001 NT','1,000','DURING Việt Nam','United States'),('2026-05-27','美国→越南','FORTRON 1140L6 SD3002 BK','4,000','DURING Việt Nam','United States'),('2026-04-23','美国→越南','同上两型号','2,000+5,000','DURING Việt Nam','United States'),('2026-03-24','美国→越南','FORTRON 1140L6 SF3001 NATURAL GF40','25','DONGJIN TECHWIN VINA','United States')]:
    c=t.add_row().cells
    for i,v in enumerate(row): c[i].text=v
style_table(t,[.8,.8,1.65,.8,1.55,.9])
p=doc.add_paragraph(); r=p.add_run('交叉结果：'); r.bold=True
p.add_run('以精确型号FORTRON 1140L6、三年范围并限定目的地China检索，平台结果为0。该型号共192次交易、目的地集中在越南和印度。结论为“上游敏感货物流入第三国已证实，但对华再出口未证实”。')

doc.add_heading('五、加拿大豌豆淀粉：措施后未见对华回流闭环', level=1)
p=doc.add_paragraph('商务部2026年第25号公告自2026年7月1日起，对原产加拿大的豌豆淀粉实施73.5%保证金措施，商品编号细分为11081900.10。')
add_source('商务部公告2026年第25号','https://www.mofcom.gov.cn/zcfb/blgg/gg/2026/art/2026/art_b1ce17f4575c4eacb6e64941364998c1.html')
add_bullet('对华N-735记录集中在2025年6月至8月，早于临时措施；香港贸易主体ORIGIN CHEM参与，但环球提单仍显示Canada原产。')
add_bullet('2026年7月26日出现加拿大生产商向新加坡贸易主体C AND D SINGAPORE BUSINESS PTE LTD销售并发往美国的记录；这是贸易节点变化信号，不是中国第二程。')
add_bullet('截至平台当前覆盖日，未发现2026年7月1日以后N-735经新加坡、越南或香港转发中国的对应记录。')

doc.add_heading('六、印度氯氰菊酯：直接进口税负风险，不是第三国绕道', level=1)
p=doc.add_paragraph('商务部2025年第24号公告自2025年5月7日起征税，税率48.4%—166.2%，涉案CAS包括52315-07-8等，税则号29269090。平台发现TAGROS、MEGHMANI等列名企业在措施后仍有氯氰菊酯原药直接发中国的记录。')
add_source('商务部公告2025年第24号','https://www.mofcom.gov.cn/zcfb/zgdwjjmywg/art/2025/art_f4dda218753844ad8244cd84442c7992.html')
p=doc.add_paragraph('风险点是平台出口HS多出现38089135等印度税号，与中国执行税号29269090不一致。该差异可能仅是两国税则归类不同，必须以中国进口报关商品编号、生产商、原产国及反倾销税缴款书判断，不能据此认定逃税。')

doc.add_heading('七、证据分级与总体判断', level=1)
t=doc.add_table(rows=1, cols=6)
for i,h in enumerate(['商品','原产国→第三国','第三国→中国','关键一致字段','当前等级','判断']): t.rows[0].cells[i].text=h
matrix=[('POM HOSTAFORM LW15EWX','德国→越南已见','越南→中国已见','精确牌号、品牌、25kg包装、#&DE','A-','高优先级调单；未同企业/同批次闭环'),('PPS FORTRON 1140L6','美国→越南多票','精确型号对华为0','型号、原产地、连续月份','B+','供应链存在；无中国第二程'),('豌豆淀粉N-735','加拿大→新加坡/越南等','措施后未见','品牌型号、生产商','B','贸易节点监测；暂无回流证据'),('氯氰菊酯','不适用','印度→中国直达','CAS、纯度、列名生产商','A（直达）','核反倾销税缴纳，不属于绕道')]
for row in matrix:
    c=t.add_row().cells
    for i,v in enumerate(row): c[i].text=v
style_table(t,[1.35,1.15,1.05,1.45,.6,.9])

doc.add_heading('八、涉及数量、税种与可能逃税方式', level=1)
p=doc.add_paragraph('以下数量以平台字段为准。平台部分国家数据库存在重复收录、重量/数量单位混用以及以当地货币列示金额等问题，因此数量用于风险排序，税额必须以中国海关完税价格和底单为准。')
t=doc.add_table(rows=1, cols=6)
for i,h in enumerate(['线索','已见数量','涉及税负','适用税率','可能少缴情形','目前能否计算税额']): t.rows[0].cells[i].text=h
tax_rows=[
('POM：越南→中国LW15EWX','POM 25kg；同票配套色母料2kg','反倾销税；由反倾销税抬高计税基础后增加的进口环节增值税','若实际为德国Celanese涉案共聚POM：反倾销税34.5%','若中国申报原产越南且未征反倾销税，而实际原产德国、越南加工不足以改变原产地，则可能少缴34.5%反倾销税及相应增值税','不能；缺中国完税价格、税号、原产地申报和缴款书'),
('PPS：美国→越南FORTRON 1140L6','2026-05-27两型号合计5,000kg；另有4—5月多批1,000—5,000kg记录','若再出口中国且仍属美国原产：反倾销税及相应进口环节增值税','美国Fortron及其他美国公司220.9%','若经越南仅换单/分装后对华改报越南原产，可能规避PPS反倾销税','不能；且精确型号对华第二程检索为0'),
('加拿大豌豆淀粉N-735','历史对华两组环球提单重量合计195,220kg（117,132+78,088kg），均早于措施','临时反倾销保证金；相应进口环节增值税','自2026-07-01起保证金73.5%','措施后如经第三国改报非加拿大原产，可能规避保证金及相应增值税','当前不适用；现有对华票早于措施，未发现措施后第二程'),
('印度氯氰菊酯直达中国','去重后A类记录报告数量合计约68,000kg：TAGROS 16,000+16,000kg，MEGHMANI 36,000kg','反倾销税及相应进口环节增值税','TAGROS 48.4%；MEGHMANI 62.0%','不是第三国绕道；如中国进口未按涉案CAS/生产商缴税，可能发生归类或税率适用风险','不能；缺中国进口底单和完税价格')]
for row in tax_rows:
    c=t.add_row().cells
    for i,v in enumerate(row): c[i].text=v
style_table(t,[1.15,1.0,1.25,.8,1.55,.75])
p=doc.add_paragraph(); r=p.add_run('税额公式：'); r.bold=True
p.add_run('反倾销税（或保证金）＝中国海关确定的完税价格×适用税率；进口环节增值税＝（完税价格＋关税＋反倾销税）×增值税税率。因此，规避反倾销税不仅影响反倾销税本身，也会降低进口环节增值税计税基础。')
p=doc.add_paragraph(); r=p.add_run('POM线索的定量含义：'); r.bold=True
p.add_run('如25kg货物经中国海关认定实际原产德国且属于涉案共聚POM，理论应按34.5%征收反倾销税。每100元海关完税价格对应34.5元反倾销税；增值税还需在包含该34.5元后的计税基础上计算。当前越南平台金额4,774,382.50很可能为越南盾申报金额，不能直接作为中国完税价格。')

doc.add_heading('九、建议立即调取的单证与比对字段', level=1)
for x in [
'POM越南对华票：越南出口申报单号、商业发票、装箱单、原产地证书、运输单号、生产商、批次号；中国进口报关单号、境内收货人统一社会信用代码、境外发货人、启运国、原产国、商品编号、品牌型号、随附单证及反倾销税缴款书。',
'POM越南上游：向Hamakyu调取LW15EWX采购台账、供应商、入库批次、25kg包装标签、库存流水和加工记录；重点比对2025-10至2026-05间是否收到德国/欧盟来源同型号。',
'PPS：持续监测DURING Việt Nam和DONGJIN TECHWIN VINA对外销售；以SF3001 NT、SD3002 BK、包装数量和发票号做精确匹配，出现China目的地即升级。',
'豌豆淀粉：从2026-07-01起按11081900.10监测中国进口；穿透ORIGIN CHEM、C AND D SINGAPORE及Roquette Singapore，核原产地是否仍申报Canada。',
'氯氰菊酯：调取TAGROS、MEGHMANI等列名生产商对华票的中国进口底单，核适用税率、完税价格、CAS及是否以制剂税号申报。']:
    add_bullet(x)

doc.add_heading('十、结论边界', level=1)
p=doc.add_paragraph('本次核验找到了可支持执法调单的具体贸易事实，但尚未获得同一提单号、集装箱号、批次号或原产地证书串联的完整闭环。尤其POM线索虽最强，仍存在真实贸易、样品寄送、越南境内加工或库存调拨等合法解释。只有在中国进口申报将德国/欧盟原产改报为越南，且越南加工不足以构成实质性改变，并与上游批次、包装或物流单号相互印证时，方可进一步判断是否构成规避反倾销税。')

# Footer
for section in doc.sections:
    fp=section.footer.paragraphs[0]; fp.alignment=WD_ALIGN_PARAGRAPH.RIGHT
    rr=fp.add_run('内部风险研判｜2026-08-08'); rr.font.name='Arial'; rr.font.size=Pt(8); rr.font.color.rgb=RGBColor.from_string(GRAY)

doc.core_properties.title='近3个月数据源第三国绕道交叉核验报告'
doc.core_properties.subject='反倾销税第三国绕道风险核验'
doc.core_properties.author='User'
OUT.parent.mkdir(parents=True, exist_ok=True)
doc.save(OUT)
print(OUT)
