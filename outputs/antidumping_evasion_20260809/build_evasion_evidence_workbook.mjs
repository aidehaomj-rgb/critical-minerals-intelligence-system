import fs from "node:fs";
import { Workbook, SpreadsheetFile } from "@oai/artifact-tool";

const baseDir = "C:/Users/59809/Documents/关键矿产/outputs/antidumping_evasion_20260809";
const outputPath = `${baseDir}/反倾销税偷逃风险证据清单_20260809.xlsx`;

const colors = {
  navy: "#17365D",
  blue: "#D9EAF7",
  paleBlue: "#EEF5FB",
  red: "#F4CCCC",
  orange: "#FCE4D6",
  amber: "#FFF2CC",
  green: "#D9EAD3",
  gray: "#E7E6E6",
  white: "#FFFFFF",
  text: "#1F2937",
};

const cases = [
  {
    level: "已认定（行政处罚）", date: "2025-03-12", decision: "海沧关缉违字〔2025〕100号",
    customs: "厦门海沧海关", importer: "厦门翔邦高分子科技有限公司", declarant: "厦门诚运通报关行有限公司",
    product: "三元乙丙橡胶（EPDM）", hs: "4002701000", tickets: 1, qtyKg: null, customsValue: 407077.89,
    declared: "未填报原生产商中英文名称及反倾销税率", actual: "原产美国/韩国/欧盟EPDM须按生产商适用税率申报",
    adRate: "美国214.9%–222%；韩国12.5%–24.5%；欧盟14.7%–31.7%（需按生产商）",
    adLeak: null, vatLeak: null, otherLeak: null, totalLeak: 58663.29, fine: 17600,
    taxType: "反倾销税；总额可能含由反倾销税进入计税基础形成的进口增值税差额，决定书未拆分",
    mode: "漏报原生产商/税率字段", source: "https://www.jitinfo.net/Service/Detail?detail=6883ba77-2a27-a778-0091-40de37b92d64",
    note: "涉案货值40.707789万元；公开决定未披露重量。易迅按XIAMEN XIANGBANG+EPDM检索未命中，不等于不存在进口。"
  },
  {
    level: "已认定（行政处罚）", date: "2024-03-20", decision: "沪吴淞关缉违字〔2024〕15号",
    customs: "上海吴淞海关", importer: "上海嘉助贸易有限公司", declarant: "未公开",
    product: "印度原产酞菁蓝颜料", hs: "申报3204170090；实际3204170020", tickets: 1, qtyKg: 4000, customsValue: null,
    declared: "CIF 68,000美元；HS 3204170090", actual: "应归入3204170020；适用印度其他公司30.7%反倾销税率",
    adRate: "30.7%", adLeak: 149879.24, vatLeak: 19484.30, otherLeak: 0, totalLeak: 169363.54, fine: 76200,
    taxType: "反倾销税149,879.24元；进口环节增值税19,484.30元",
    mode: "税号错报，导致反倾销措施未执行", source: "https://pdf.dfcfw.com/pdf/H2_AN202407191638089496_1.pdf?1721403630000.pdf=",
    note: "数量、税种和税额均有公开处罚文件支撑；属于直接印度进口错报，不是第三国绕道。"
  },
  {
    level: "已认定（行政处罚）", date: "2025-05-15/2025-07-23", decision: "甬奉关缉违字〔2026〕2号",
    customs: "宁波奉化海关", importer: "浙江锐泰悬挂系统科技有限公司", declarant: "未公开",
    product: "KAMAX螺栓", hs: "7318151001", tickets: 2, qtyKg: null, customsValue: 2389451.03,
    declared: "生产商KAMAX GmbH & Co.KG，反倾销税率6.1%；成交方式FOB", actual: "生产商KAMAX S.L.U，税率26%；实际EXW，另漏报1,900欧元和1,155美元费用",
    adRate: "6.1%→26%（差19.9个百分点）", adLeak: null, vatLeak: null, otherLeak: null, totalLeak: 544230.77, fine: 245000,
    taxType: "生产商税率差导致的反倾销税差额及其进口增值税；漏报运保杂费还影响关税、反倾销税和进口增值税计税基础",
    mode: "生产商错报+成交方式/完税价格低报", source: "https://m.sohu.com/a/1029239603_121218495",
    note: "公开决定未披露重量。仅按19.9个百分点测算：反倾销税差约475,500.75元、由此增加的进口增值税约61,815.10元；其余约6,914.92元与漏报费用等有关，非正式拆分。"
  },
  {
    level: "历史判例（刑事，方法参照）", date: "2018", decision: "（2018）津02刑初45号",
    customs: "天津（法院判决）", importer: "公开摘要未列全称", declarant: "—", product: "太阳能级多晶硅", hs: "未披露",
    tickets: null, qtyKg: null, customsValue: null, declared: "美国货物运至台湾简单加工后取得台湾原产地证", actual: "法院认定通过第三地简单加工规避美国原产反倾销措施",
    adRate: "未披露", adLeak: null, vatLeak: null, otherLeak: null, totalLeak: 3800000, fine: 3810000,
    taxType: "偷逃反倾销税及相关进口环节税款（公开摘要合计口径）", mode: "美国→台湾简单加工/更换原产地→中国；第三国绕道已被司法认定",
    source: "https://www.tradesichuan.com/jmzx/1987.html", note: "公开摘要称偷逃税款380余万元；数量未披露。用于说明第三国绕道需要‘简单加工+原产地证+回流中国’闭环。"
  },
  {
    level: "历史处罚（方法参照）", date: "2023", decision: "沪洋山关缉违字〔2023〕270号",
    customs: "上海洋山海关", importer: "公开摘要未列全称", declarant: "—", product: "冻鸡爪", hs: "未披露",
    tickets: 2, qtyKg: 27000, customsValue: null, declared: "C&F 140,400美元；错误适用0税率/价格承诺", actual: "生产商AGROSUL相关货物适用20.2%反倾销税率",
    adRate: "20.2%", adLeak: null, vatLeak: null, otherLeak: null, totalLeak: 196000, fine: 110000,
    taxType: "反倾销税及由此形成的进口环节税款（公开摘要未拆分）", mode: "错误适用价格承诺/0税率",
    source: "https://www.tradesichuan.com/jmzx/1987.html", note: "历史税率适用错误参照；不是第三国绕道。"
  },
];

const leads = [
  {
    id: "POM-DE-VN-CN-001", grade: "A-：字段冲突，优先调单", product: "共聚POM / HOSTAFORM LW15EWX", hs: "39071010/39071090（须判定是否共聚POM且非改性产品）",
    route: "德国→越南；越南→中国", date: "2025-10-07 / 2026-05-26", qty: 25, unit: "kg（对华第二程）", amount: 4774382.5, currency: "VND（平台金额字段）",
    upstream: "Celanese Performance Solutions Switzerland SARL→CÔNG TY TNHH BỒ CÔNG ANH SÀI GÒN：德国原产LW15EWX 1,000kg、25kg/袋",
    downstream: "CÔNG TY TNHH HAMAKYU→SHANGHAI HENGJIU HUNDRED TRANSMISSION CO., LTD：LW15EWX 25kg；同票另有越南色母粒2kg",
    conflict: "对华记录的平台原产地字段为Vietnam，但货描保留“#&DE”；25kg与德国来料每袋25kg一致",
    tax: "若中国申报为越南原产而实为德国Celanese涉案共聚POM：少缴反倾销税34.5%及因反倾销税进入税基而少缴的进口增值税",
    rate: 0.345, vatRate: 0.13, evidence: "尚非定案。上、下游越南主体不同，缺提单号/批次/原产地证/中国报关单；25kg亦可能是样品或合法转售。",
    source: "易迅数据查询（账号内检索，2026-08-08固化）；措施：https://www.mofcom.gov.cn/zcfb/zgdwjjmywg/art/2025/art_09eb6be1f50f4cdaa6a36dfbb09bb529.html"
  },
  {
    id: "PIGMENT-IN-VN-CN-001", grade: "B+：路线级高风险，未闭环", product: "酞菁蓝 / PIGMENT BLUE 150030 / CAS 147-14-8", hs: "措施范围32041700/32129000；对华记录需核具体中国税号",
    route: "印度→越南；越南→中国", date: "近3年；对华记录2023-09至2026-03", qty: 738620, unit: "kg（越南→中国35票合计）", amount: 98781668980, currency: "VND（平台金额字段）",
    upstream: "印度→越南检得490条；例：KILBURN CHEMICALS BHARUCH→U.C.C越南，多批MEGHAFAST BLUE、CAS147-14-8；另有Indian Chemical Industries→Brenntag Vietnam",
    downstream: "越南YICAI COLOR PLASTIC/Vĩnh Gia等→HUNAN YIGAO、DONGGUAN CHENGHAN等；35票均申报#&VN，常见24,000kg/票",
    conflict: "同CAS和酞菁蓝品类形成印度来料与越南对华大批量流向，但未发现同一越南企业、同型号、同批次的两程匹配",
    tax: "若经原产地核查认定仍为印度原产且生产商无法适用列名低税率：可能少缴30.7%反倾销税及相应进口增值税",
    rate: 0.307, vatRate: 0.13, evidence: "738.62吨是对华路线总量，不是已认定逃税数量；需先确认越南是否发生实质性加工及产品是否仍在措施范围。",
    source: "易迅数据查询（账号内检索，2026-08-08固化）；措施：https://dcj.mofcom.gov.cn/article/zcfb/gpmy/202302/20230203393455.shtml"
  },
  {
    id: "CYP-IN-CN-TAGROS", grade: "A：直接进口调单线索", product: "氯氰菊酯原药 / CYPERMETHRIN TECHNICAL", hs: "2926909013（CAS需核52315-07-8等措施范围）",
    route: "印度→中国（直接）", date: "2026-01-06至2026-02-28", qty: 32000, unit: "kg（去重后两票）", amount: 191200, currency: "USD（平台出口金额）",
    upstream: "—", downstream: "TAGROS CHEMICALS INDIA PRIVATE LIMITED→IPO LTD SHNGHAI/买方未展示；16,000kg×2",
    conflict: "商品名、CAS/纯度（部分记录）和列名生产商匹配；平台多日期重复，已按数量+金额组合去重",
    tax: "若中国进口报关未按Tagros 48.4%执行：可能少缴反倾销税及相应进口增值税",
    rate: 0.484, vatRate: 0.13, evidence: "直接进口，不属于第三国绕道；金额为印度出口侧平台值，不是中国海关审定完税价格。",
    source: "易迅数据查询（账号内检索，2026-08-08固化）；措施：https://www.mofcom.gov.cn/zcfb/zgdwjjmywg/art/2025/art_f4dda218753844ad8244cd84442c7992.html"
  },
  {
    id: "CYP-IN-CN-MEGHMANI", grade: "A：直接进口调单线索", product: "氯氰菊酯原药 / CYPERMETHRIN TECHNICAL", hs: "2926909013（CAS需核）",
    route: "印度→中国（直接）", date: "2026-02-20/21（疑似同票，去重1票）", qty: 36000, unit: "kg", amount: 201600, currency: "USD（平台出口金额）",
    upstream: "—", downstream: "MEGHMANI ORGANICS LIMITED→中国（买方字段---）",
    conflict: "36吨大票、商品名及列名生产商匹配；两日期字段相同，按同票去重",
    tax: "若中国进口报关未按Meghmani 62.0%执行：可能少缴反倾销税及相应进口增值税",
    rate: 0.62, vatRate: 0.13, evidence: "直接进口，不属于第三国绕道；中国实际进口人仍待报关单/提单识别。",
    source: "易迅数据查询（账号内检索，2026-08-08固化）；措施：https://www.mofcom.gov.cn/zcfb/zgdwjjmywg/art/2025/art_f4dda218753844ad8244cd84442c7992.html"
  },
  {
    id: "KAMAX-ES-CN-001", grade: "B+：生产商识别基准", product: "KAMAX S.L.U螺钉/螺栓", hs: "731815（平台）；处罚案为7318151001", route: "西班牙→中国（直接）", date: "2024-02-02",
    qty: 993.4, unit: "kg（HS731815 SCREW）", amount: null, currency: "—", upstream: "—",
    downstream: "KAMAX S.L.U→WUHAN ASIA EUROPE INTERNATIONAL SUPPLY CHAIN MANAGEMENT CO LTD；同批还见垫圈、悬挂零件等",
    conflict: "证明西班牙KAMAX S.L.U已有直接对华发货历史，可与处罚案错报德国生产商交叉核验",
    tax: "不是逃税证据；用于核查是否错误套用德国KAMAX 6.1%而非西班牙KAMAX S.L.U 26%",
    rate: 0.199, vatRate: 0.13, evidence: "与2025年两票处罚货物并非同批；只能作生产商/供应链身份基准。",
    source: "易迅数据查询（账号内检索，2026-08-08固化）"
  },
];

const checks = [
  ["中国进口申报底单", "报关单号、进口日期、申报口岸、境内收货人、消费使用单位、境外发货人、生产商、原产国、启运国、HS、规格型号、品牌、数量、单价/总价、成交方式、运保杂费、随附单证编号", "判断是否申报第三国原产、是否漏填/错填生产商、是否错报税号及完税价格"],
  ["原产地与加工证据", "原产地证、生产商声明、越南工厂BOM/配方、领料单、生产批记录、能源/人工/设备、出入库、增值比例、税则归类变化", "判定是否发生实质性改变；仅分装、换包、贴标、简单混配通常是高风险信号，但须依法依事实判断"],
  ["运输闭环", "两程提单号、主/分单、集装箱号、封志号、船名航次、到离港时间、毛净重、件数、包装规格、托盘/唛头", "把原产国→第三国与第三国→中国匹配到同一批货"],
  ["资金与合同", "采购/转售合同、发票、信用证、付款路径、保险、运费、关联关系、贸易商毛利", "识别仅转售、低附加值加工、异常低毛利或价差不足以覆盖加工成本"],
  ["税款核验", "税款缴款书、海关估价记录、反倾销税率适用依据、生产商税率证明、进口增值税完税凭证", "精确拆分少缴反倾销税、关税、进口环节增值税；避免把理论测算当认定税额"],
  ["POM专项", "2026-05-26上海买方申报底单、25kg货物包装/批号、#&DE字段来源、越南出口原产地证；追查Hamakyu上游采购", "确认平台Vietnam原产地字段是否等同中国进口申报；核对是否德国Celanese原袋转售"],
  ["酞菁蓝专项", "YICAI/Vĩnh Gia 35票的中国进口人、口岸、报关税号、CO Form E/RCEP证书、越南生产记录；KILBURN/U.C.C两程批号", "从路线级738.62吨中筛出同企业、同CAS、同型号、时间/数量可衔接的批次"],
  ["氯氰菊酯专项", "Tagros 32吨、Meghmani 36吨对应中国报关单与税款；买方IPO LTD SHNGHAI/U S L主体全称", "核是否按2926909013及列名生产商税率执行；该方向是直接税率执行风险，不是第三国绕道"],
];

const wb = Workbook.create();

function colName(n) {
  let s = "";
  while (n > 0) { n--; s = String.fromCharCode(65 + (n % 26)) + s; n = Math.floor(n / 26); }
  return s;
}

function addTitle(sheet, endCol, titleText, subtitleText) {
  sheet.showGridLines = false;
  sheet.getRange(`A1:${endCol}1`).merge();
  sheet.getRange("A1").values = [[titleText]];
  sheet.getRange("A1").format = { fill: colors.navy, font: { bold: true, color: colors.white, size: 18 }, verticalAlignment: "center" };
  sheet.getRange(`A1:${endCol}1`).format.rowHeight = 34;
  sheet.getRange(`A2:${endCol}2`).merge();
  sheet.getRange("A2").values = [[subtitleText]];
  sheet.getRange("A2").format = { fill: colors.blue, font: { color: colors.navy, italic: true, size: 10 }, wrapText: true, verticalAlignment: "center" };
  sheet.getRange(`A2:${endCol}2`).format.rowHeight = 30;
}

function styleHeader(range) {
  range.format = { fill: colors.navy, font: { bold: true, color: colors.white }, horizontalAlignment: "center", verticalAlignment: "center", wrapText: true };
  range.format.rowHeight = 32;
}

const summary = wb.worksheets.add("结论总览");
addTitle(summary, "H", "反倾销税偷逃与第三国绕道风险｜证据总览", "截至2026-08-09。金额分为‘处罚认定值’与‘以平台金额测算的理论暴露值’；二者不得混用。企业名称仅用于依法核查，不代表违法结论。");
summary.getRange("A4:B4").merge(); summary.getRange("C4:D4").merge(); summary.getRange("E4:F4").merge(); summary.getRange("G4:H4").merge();
summary.getRange("A4").formulas = [["=COUNTA('已认定案件'!C5:C7)"]];
summary.getRange("C4").formulas = [["=SUM('已认定案件'!Q5:Q7)"]];
summary.getRange("E4").formulas = [["=SUM('已认定案件'!R5:R7)"]];
summary.getRange("G4").formulas = [["=SUM('已认定案件'!J5:J7)"]];
for (const c of ["A4", "C4", "E4", "G4"]) summary.getRange(c).format = { fill: colors.paleBlue, font: { bold: true, color: colors.navy, size: 19 }, horizontalAlignment: "center", verticalAlignment: "center" };
summary.getRange("A5:B5").merge(); summary.getRange("A5").values = [["2024年以来已认定案件（宗）"]];
summary.getRange("C5:D5").merge(); summary.getRange("C5").values = [["已认定漏缴税款合计（元）"]];
summary.getRange("E5:F5").merge(); summary.getRange("E5").values = [["已处罚款合计（元）"]];
summary.getRange("G5:H5").merge(); summary.getRange("G5").values = [["已公开重量（kg，仅已认定案件）"]];
summary.getRange("A5:H5").format = { fill: "#F7FAFC", font: { color: "#4F6B82", size: 9 }, horizontalAlignment: "center" };
summary.getRange("C4:F4").format.numberFormat = "#,##0.00";
summary.getRange("G4").format.numberFormat = "#,##0";
summary.getRange("A7:H7").merge();
summary.getRange("A7").values = [["硬结论：目前公开资料中，2024年以来3宗处罚合计漏缴税款772,257.60元、罚款338,800元。只有上海酞菁蓝案公开了4,000kg并拆分税种；EPDM与KAMAX案公开决定未披露重量，不能估填。"]];
summary.getRange("A7").format = { fill: colors.orange, font: { bold: true, color: "#9C5700" }, wrapText: true, verticalAlignment: "center" };
summary.getRange("A7:H7").format.rowHeight = 42;
summary.getRange("A9:H9").values = [["线索", "涉及数量", "证据强度", "已见事实", "可能少缴税种", "理论暴露口径", "关键缺口", "处置优先级"]];
styleHeader(summary.getRange("A9:H9"));
const summaryRows = [
  ["POM：HOSTAFORM LW15EWX", "25kg", "A-", "越南对华记录原产地字段Vietnam，但货描#&DE；一袋25kg", "反倾销税34.5%+进口增值税差额", "按平台VND4,774,382.5测算合计VND1,861,293.02", "中国报关原产地、批号、越南CO及Hamakyu上游", "最高"],
  ["酞菁蓝：印度→越南→中国", "35票/738,620kg", "B+", "印度→越南490条；越南→中国同CAS/品类35票，均#&VN", "若仍为印度原产：反倾销税（可能30.7%）+进口增值税差额", "全量假设下VND34,268,348,785.85；非认定税额", "同一主体/型号/批次两程闭环、实质性加工", "高"],
  ["氯氰菊酯：Tagros", "32,000kg（去重）", "A", "印度列名生产商直接对华，16吨×2", "反倾销税48.4%+进口增值税差额", "按出口侧USD191,200测算合计USD104,571.10", "中国进口人、税款缴款书、CAS/税号", "高（直接税率执行）"],
  ["氯氰菊酯：Meghmani", "36,000kg（去重）", "A", "印度列名生产商直接对华大票", "反倾销税62.0%+进口增值税差额", "按出口侧USD201,600测算合计USD141,240.96", "中国进口人、税款缴款书、CAS/税号", "高（直接税率执行）"],
  ["KAMAX S.L.U直接对华历史", "993.4kg螺钉", "B+", "西班牙生产商已有直接中国发货历史", "用于核查6.1%与26%生产商税率错套", "不计算；与处罚票非同批", "处罚两票对应提单/生产商文件", "中高"],
];
summary.getRange(`A10:H${9 + summaryRows.length}`).values = summaryRows;
summary.getRange(`A10:H${9 + summaryRows.length}`).format = { wrapText: true, verticalAlignment: "top" };
summary.getRange("A10:H10").format.fill = colors.red;
summary.getRange("A11:H11").format.fill = colors.orange;
summary.getRange("A12:H13").format.fill = colors.amber;
summary.getRange("A16:H16").merge();
summary.getRange("A16").values = [["法律与取证口径：平台贸易记录只能形成调单线索。认定第三国规避至少需要证明涉案货物原产国、第三国加工不足以改变原产地、对华进口申报采用了不实原产地/生产商/税号，以及少缴税额。"]];
summary.getRange("A16").format = { fill: colors.green, font: { color: "#274E13" }, wrapText: true };
summary.getRange("A16:H16").format.rowHeight = 42;
summary.freezePanes.freezeRows(2);
[22,15,13,42,36,32,42,15].forEach((w, i) => summary.getRange(`${colName(i+1)}:${colName(i+1)}`).format.columnWidth = w);

const cs = wb.worksheets.add("已认定案件");
addTitle(cs, "T", "已认定漏缴反倾销税及相关税款案件", "‘总漏缴税款’和‘罚款’为处罚/判决公开数；税种未拆分处保持空白，不反推为正式认定额。数量未公开即留空。");
const caseHeaders = ["证据级别","日期","文书号","海关/机关","进口人","报关企业","商品","HS/申报差异","票数","数量kg","涉案/计税货值RMB","申报情况","实际/应申报","适用税率","少缴反倾销税RMB","少缴进口增值税RMB","总漏缴税款RMB","罚款RMB","手法与税种","来源与说明"];
cs.getRange("A4:T4").values = [caseHeaders]; styleHeader(cs.getRange("A4:T4"));
const caseValues = cases.map(c => [c.level,c.date,c.decision,c.customs,c.importer,c.declarant,c.product,c.hs,c.tickets,c.qtyKg,c.customsValue,c.declared,c.actual,c.adRate,c.adLeak,c.vatLeak,c.totalLeak,c.fine,`${c.mode}；${c.taxType}`,`${c.source}\n${c.note}`]);
cs.getRange(`A5:T${4+caseValues.length}`).values = caseValues;
cs.getRange(`A5:T${4+caseValues.length}`).format = { wrapText: true, verticalAlignment: "top" };
cs.getRange(`I5:R${4+caseValues.length}`).format.numberFormat = "#,##0.00";
cs.getRange("A5:T7").format.fill = colors.paleBlue;
cs.getRange("A8:T9").format.fill = colors.gray;
cs.tables.add(`A4:T${4+caseValues.length}`, true, "ConfirmedCases");
cs.freezePanes.freezeRows(4);
[23,17,27,18,29,27,24,27,8,12,18,36,40,28,18,18,18,15,55,70].forEach((w,i)=>cs.getRange(`${colName(i+1)}:${colName(i+1)}`).format.columnWidth=w);

const ls = wb.worksheets.add("易迅风险线索");
addTitle(ls, "V", "易迅贸易数据｜数量、税种与理论暴露值", "计算列以平台金额字段为基数：反倾销税=金额×税率；进口增值税增量=反倾销税×13%。平台金额并非中国海关审定完税价格，币种也不得换算为人民币认定税额。");
const leadHeaders = ["线索ID","证据等级","商品/牌号","HS及范围提醒","路线","日期","数量","单位","平台金额","币种","第一程/上游","第二程/对华","异常/匹配信号","可能少缴税种","税率/差率","理论反倾销税","理论进口增值税增量","理论合计","证据限制","来源"];
ls.getRange("A4:T4").values=[leadHeaders]; styleHeader(ls.getRange("A4:T4"));
const leadValues = leads.map((l,i)=>[l.id,l.grade,l.product,l.hs,l.route,l.date,l.qty,l.unit,l.amount,l.currency,l.upstream,l.downstream,l.conflict,l.tax,l.rate,null,null,null,l.evidence,l.source]);
ls.getRange(`A5:T${4+leadValues.length}`).values=leadValues;
for (let i=0;i<leadValues.length;i++) {
  const row=5+i;
  ls.getRange(`P${row}`).formulas=[[`=IF(OR(I${row}="",O${row}=""),"",I${row}*O${row})`]];
  ls.getRange(`Q${row}`).formulas=[[`=IF(P${row}="","",P${row}*13%)`]];
  ls.getRange(`R${row}`).formulas=[[`=IF(P${row}="","",P${row}+Q${row})`]];
}
ls.getRange(`A5:T${4+leadValues.length}`).format={wrapText:true,verticalAlignment:"top"};
ls.getRange(`G5:G${4+leadValues.length}`).format.numberFormat="#,##0.00";
ls.getRange(`I5:I${4+leadValues.length}`).format.numberFormat="#,##0.00";
ls.getRange(`O5:O${4+leadValues.length}`).format.numberFormat="0.0%";
ls.getRange(`P5:R${4+leadValues.length}`).format.numberFormat="#,##0.00";
ls.getRange("A5:T5").format.fill=colors.red;
ls.getRange("A6:T6").format.fill=colors.orange;
ls.getRange("A7:T8").format.fill=colors.amber;
ls.getRange("A9:T9").format.fill=colors.green;
ls.tables.add(`A4:T${4+leadValues.length}`,true,"TradeRiskLeads");
ls.freezePanes.freezeRows(4);
[23,24,32,35,20,22,14,16,18,16,55,55,48,48,13,18,20,18,55,65].forEach((w,i)=>ls.getRange(`${colName(i+1)}:${colName(i+1)}`).format.columnWidth=w);

const calc = wb.worksheets.add("税额拆分与口径");
addTitle(calc, "H", "税额拆分、公式与不可比口径", "进口增值税以完税价格+关税+反倾销税为计税基础，因此漏缴反倾销税还会形成13%的进口增值税增量。若还存在完税价格低报，则需另算关税、反倾销税和增值税。");
calc.getRange("A4:H4").values=[["项目","已知基数","币种","反倾销税率/差率","反倾销税/差额","进口增值税增量","合计","性质"]]; styleHeader(calc.getRange("A4:H4"));
const calcRows=[
  ["上海酞菁蓝处罚",68000,"USD（申报CIF）",0.307,149879.24,19484.30,169363.54,"处罚认定人民币税额，不由本表美元直接计算"],
  ["KAMAX处罚：仅生产商税率差",2389451.03,"RMB",0.199,null,null,null,"模型拆分；不含漏报运费等因素"],
  ["POM 25kg线索",4774382.5,"VND（平台）",0.345,null,null,null,"理论情景，非认定税额"],
  ["越南酞菁蓝35票",98781668980,"VND（平台）",0.307,null,null,null,"全量极端情景，非认定税额"],
  ["Tagros氯氰菊酯32吨",191200,"USD（平台出口侧）",0.484,null,null,null,"直接进口调单情景，非认定税额"],
  ["Meghmani氯氰菊酯36吨",201600,"USD（平台出口侧）",0.62,null,null,null,"直接进口调单情景，非认定税额"],
];
calc.getRange(`A5:H${4+calcRows.length}`).values=calcRows;
for(let row=6;row<=10;row++){
  calc.getRange(`E${row}`).formulas=[[`=B${row}*D${row}`]];
  calc.getRange(`F${row}`).formulas=[[`=E${row}*13%`]];
  calc.getRange(`G${row}`).formulas=[[`=E${row}+F${row}`]];
}
calc.getRange(`A5:H${4+calcRows.length}`).format={wrapText:true,verticalAlignment:"top"};
calc.getRange("B5:B10").format.numberFormat="#,##0.00";
calc.getRange("D5:D10").format.numberFormat="0.0%";
calc.getRange("E5:G10").format.numberFormat="#,##0.00";
calc.getRange("A5:H5").format.fill=colors.paleBlue;
calc.getRange("A6:H6").format.fill=colors.orange;
calc.getRange("A7:H10").format.fill=colors.amber;
calc.getRange("A12:H12").merge(); calc.getRange("A12").values=[["KAMAX校验：模型合计537,315.85元，与处罚认定544,230.77元相差6,914.92元；差额与漏报运保杂费及其影响有关，不能把模型拆分冒充海关正式税种拆分。"]];
calc.getRange("A12").format={fill:colors.green,font:{color:"#274E13"},wrapText:true}; calc.getRange("A12:H12").format.rowHeight=40;
calc.tables.add(`A4:H${4+calcRows.length}`,true,"TaxScenarioCalculations");
calc.freezePanes.freezeRows(4);
[34,20,24,20,22,22,22,55].forEach((w,i)=>calc.getRange(`${colName(i+1)}:${colName(i+1)}`).format.columnWidth=w);

const ck = wb.worksheets.add("调证清单");
addTitle(ck, "D", "进一步核查所需数据与判定目标", "优先级顺序：先调中国进口报关单与税款，再用提单/集装箱/批号闭环两程货物，最后核第三国是否发生足以改变原产地的实质性加工。");
ck.getRange("A4:D4").values=[["数据类别","具体字段/材料","解决的问题","对应线索"]]; styleHeader(ck.getRange("A4:D4"));
const checkRows=checks.map((r,i)=>[r[0],r[1],r[2],i===5?"POM":i===6?"酞菁蓝":i===7?"氯氰菊酯":"全部"]);
ck.getRange(`A5:D${4+checkRows.length}`).values=checkRows;
ck.getRange(`A5:D${4+checkRows.length}`).format={wrapText:true,verticalAlignment:"top"};
ck.getRange("A5:D9").format.fill=colors.paleBlue;
ck.getRange("A10:D12").format.fill=colors.amber;
ck.tables.add(`A4:D${4+checkRows.length}`,true,"EvidenceRequestList");
ck.freezePanes.freezeRows(4);
[24,75,65,18].forEach((w,i)=>ck.getRange(`${colName(i+1)}:${colName(i+1)}`).format.columnWidth=w);

const rule = wb.worksheets.add("证据分级");
addTitle(rule, "C", "证据分级与表述边界", "本清单是执法研判材料，不作违法定性。第三方贸易数据库可能存在字段映射、重复记录、币种和买方遮蔽问题。");
rule.getRange("A4:C4").values=[["等级","含义","允许结论"]]; styleHeader(rule.getRange("A4:C4"));
const ruleRows=[
  ["已认定","海关处罚决定或法院判决已确认申报违法及少缴/偷逃税额","可写明数量（若公开）、税种、税额、罚款和手法"],
  ["A","对华交易商品、CAS/牌号、涉税生产商高度匹配，可直接调取中国进口底单","可写‘高优先级调单线索’，不可写‘已逃税’"],
  ["A-","对华记录存在原产地/货描直接冲突或关键字段矛盾","可写‘具体第三国核查线索’，不可据平台字段单独定案"],
  ["B+","第一程和第二程路线、品类均成立，但未匹配同企业/同批次/同单证","可写‘路线级高风险’，数量是筛查池，不是逃税数量"],
  ["闭环标准","原产国→第三国→中国两程用提单号/箱号/批号/数量/日期衔接；证明第三国加工不足以改变原产地；中国进口申报不实；计算少缴税款","满足后方可形成第三国绕道实证链"],
  ["税额口径","处罚认定额优先；平台金额只能做情景测算；不同币种不得直接相加","所有理论值必须标明币种和‘非认定税额’"],
];
rule.getRange("A5:C10").values=ruleRows;
rule.getRange("A5:C10").format={wrapText:true,verticalAlignment:"top"};
rule.getRange("A5:C5").format.fill=colors.green;
rule.getRange("A6:C7").format.fill=colors.red;
rule.getRange("A8:C8").format.fill=colors.orange;
rule.getRange("A9:C10").format.fill=colors.blue;
rule.freezePanes.freezeRows(4);
[20,65,70].forEach((w,i)=>rule.getRange(`${colName(i+1)}:${colName(i+1)}`).format.columnWidth=w);

await wb.inspect({kind:"table",range:"结论总览!A1:H16",include:"values,formulas",tableMaxRows:20,tableMaxCols:10});
await wb.inspect({kind:"table",range:"易迅风险线索!A1:T9",include:"values,formulas",tableMaxRows:12,tableMaxCols:22});
const errors = await wb.inspect({kind:"match",searchTerm:"#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",options:{useRegex:true,maxResults:100},summary:"formula error scan"});
if (errors?.matches?.length) throw new Error(JSON.stringify(errors.matches));

const out = await SpreadsheetFile.exportXlsx(wb);
await out.save(outputPath);
for (const sheetName of ["结论总览","已认定案件","易迅风险线索","税额拆分与口径","调证清单","证据分级"]) {
  const img = await wb.render({sheetName,autoCrop:"all",scale:1});
  fs.writeFileSync(`${baseDir}/render_${sheetName}.png`,Buffer.from(await img.arrayBuffer()));
}
console.log(JSON.stringify({outputPath,cases:cases.length,leads:leads.length}));
