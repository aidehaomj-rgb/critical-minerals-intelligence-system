import fs from "node:fs/promises";
import path from "node:path";
import { Workbook, SpreadsheetFile } from "@oai/artifact-tool";

const outDir = process.env.EPDM_OUT || "D:/易迅数据/反倾销税深度分析报告/12_EPDM";
const outPath = path.join(outDir, "EPDM_易迅逐票判定台账_阶段审计.xlsx");
const qaDir = path.join(outDir, "QA_工作簿预览");
await fs.mkdir(qaDir, { recursive: true });

const load = async (name) => JSON.parse(await fs.readFile(path.join(outDir, name), "utf8"));
const delivery = await load("EPDM_交付摘要.json");
const all = await load("EPDM_易迅逐票标准化.json");
const china55 = await load("EPDM_对华55条.json");
const direct6 = await load("EPDM_受税来源直达中国6条.json");
const third49 = await load("EPDM_第三国对华49条.json");
const hexpolA = await load("EPDM_HEXPOL_A腿418条.json");
const hexpolB = await load("EPDM_HEXPOL_B腿4条.json");
const duplicateAudit = await load("EPDM_全12字段重复审计.json");

const wb = Workbook.create();
const overview = wb.worksheets.add("概览");
const sChina = wb.worksheets.add("中国对华55");
const sDirect = wb.worksheets.add("受税来源直达6");
const sThird = wb.worksheets.add("第三国对华49");
const sHexA = wb.worksheets.add("HEXPOL A418");
const sHexB = wb.worksheets.add("HEXPOL B4");
const sAll = wb.worksheets.add("全量9356");
const sDup = wb.worksheets.add("重复审计");
const policy = wb.worksheets.add("政策与调证");

const C = {
  navy: "#17324D", blue: "#1F4E78", teal: "#0F766E", paleBlue: "#EAF2F8",
  paleGold: "#FFF4CC", paleRed: "#FCE8E6", paleGreen: "#E6F4EA",
  paleGray: "#F4F6F8", border: "#CBD5E1", ink: "#102A43", muted: "#52606D",
};

const s = (v) => v === null || v === undefined ? "" : String(v);
const bool = (v) => v === true || v === "true" || v === "是";
const boolText = (v) => bool(v) ? "是" : "否";
const dateValue = (v) => {
  if (!v) return "";
  const d = new Date(`${v}T00:00:00`);
  return Number.isNaN(d.getTime()) ? s(v) : d;
};

function title(sheet, range, text) {
  const r = sheet.getRange(range);
  r.merge();
  r.values = [[text]];
  r.format = {
    fill: C.navy,
    font: { bold: true, color: "#FFFFFF", size: 18, name: "Microsoft YaHei" },
    verticalAlignment: "center",
  };
  r.format.rowHeightPx = 44;
}

function section(range, text) {
  range.merge();
  range.values = [[text]];
  range.format = {
    fill: C.paleBlue,
    font: { bold: true, color: C.navy, name: "Microsoft YaHei", size: 10 },
    verticalAlignment: "center",
    borders: { preset: "outside", style: "thin", color: C.border },
  };
  range.format.rowHeightPx = 28;
}

function header(range) {
  range.format = {
    fill: C.blue,
    font: { bold: true, color: "#FFFFFF", name: "Microsoft YaHei", size: 9 },
    wrapText: true,
    horizontalAlignment: "center",
    verticalAlignment: "center",
    borders: { preset: "all", style: "thin", color: C.border },
  };
  range.format.rowHeightPx = 36;
}

function body(range, fontSize = 9) {
  range.format = {
    font: { name: "Microsoft YaHei", size: fontSize, color: C.ink },
    verticalAlignment: "top",
    borders: { preset: "all", style: "thin", color: C.border },
  };
}

const headers = [
  "记录ID", "原表行", "规范记录ID", "规范原表行", "重复组ID", "重复组行数", "组内序号",
  "去重保留", "是否完全重复", "数据源", "进出口", "日期", "HS编码", "商品描述",
  "采购商/收货方", "供应商/发货方", "重量字段（原值）", "数量字段（原值）", "金额字段（原值）",
  "目的国/地区", "平台原产字段", "范围分类", "规则代码", "命中词", "范围处置", "范围理由",
  "路线分类", "受税来源标记", "中国目的地标记", "证据等级", "证据理由", "决定性数据缺口",
];

function ledgerRow(r) {
  return [
    s(r.record_id), Number(r.excel_row), s(r.canonical_record_id), Number(r.canonical_excel_row),
    s(r.duplicate_group_id), Number(r.duplicate_group_size), Number(r.duplicate_ordinal), boolText(r.dedup_keep),
    boolText(r.is_exact_duplicate), s(r["数据源"]), s(r["进出口"]), dateValue(r["日期"]), s(r["HS编码"]),
    s(r["商品描述"]), s(r["采购商"]), s(r["供应商"]), s(r["重量"]), s(r["数量"]), s(r["金额"]),
    s(r["目的国/地区"]), s(r["原产国/地区"]), s(r.scope_class), s(r.scope_rule_code),
    s(r.scope_matched_terms), s(r.scope_disposition), s(r.scope_reason), s(r.route_class),
    boolText(r.taxed_origin_flag), boolText(r.china_destination_flag), s(r.evidence_grade), s(r.evidence_reason),
    s(r.decisive_data_gap),
  ];
}

function buildLedger(sheet, rows, tableName, compact = false) {
  sheet.showGridLines = false;
  const matrix = [headers, ...rows.map(ledgerRow)];
  const used = sheet.getRangeByIndexes(0, 0, matrix.length, headers.length);
  used.values = matrix;
  header(sheet.getRangeByIndexes(0, 0, 1, headers.length));
  if (rows.length) {
    const dataRange = sheet.getRangeByIndexes(1, 0, rows.length, headers.length);
    body(dataRange, rows.length > 1000 ? 8 : 9);
    dataRange.format.rowHeightPx = compact ? 32 : 54;
    sheet.getRangeByIndexes(1, 11, rows.length, 1).format.numberFormat = "yyyy-mm-dd";
    sheet.getRangeByIndexes(1, 1, rows.length, 1).format.numberFormat = "#,##0";
    sheet.getRangeByIndexes(1, 3, rows.length, 1).format.numberFormat = "#,##0";
    sheet.getRangeByIndexes(1, 5, rows.length, 2).format.numberFormat = "#,##0";
    sheet.getRangeByIndexes(1, 16, rows.length, 3).format.numberFormat = "@";
    for (const col of [13, 14, 15, 23, 25, 26, 29, 30, 31]) {
      sheet.getRangeByIndexes(1, col, rows.length, 1).format.wrapText = true;
    }
    const table = sheet.tables.add(`A1:AF${matrix.length}`, true, tableName);
    table.style = "TableStyleMedium2";
    table.showFilterButton = true;

    const grade = sheet.getRangeByIndexes(1, 29, rows.length, 1);
    grade.conditionalFormats.add("beginsWith", { text: "A（", format: { fill: C.paleRed, font: { bold: true, color: "#8B1E1E" } } });
    grade.conditionalFormats.add("beginsWith", { text: "B+", format: { fill: C.paleGold, font: { bold: true, color: "#6B4E00" } } });
    grade.conditionalFormats.add("beginsWith", { text: "C", format: { fill: C.paleBlue, font: { color: C.navy } } });
  }
  sheet.freezePanes.freezeRows(1);
  sheet.freezePanes.freezeColumns(13);
  const widths = [21, 9, 24, 10, 25, 10, 9, 10, 12, 12, 9, 12, 13, 62, 30, 30, 16, 16, 16, 15, 16, 24, 10, 25, 16, 52, 34, 14, 15, 19, 58, 48];
  for (let i = 0; i < widths.length; i++) {
    sheet.getRangeByIndexes(0, i, matrix.length, 1).format.columnWidth = widths[i];
  }
}

buildLedger(sChina, china55, "EPDMChina55");
buildLedger(sDirect, direct6, "EPDMDirect6");
buildLedger(sThird, third49, "EPDMThird49");
buildLedger(sHexA, hexpolA, "EPDMHexpolA418", true);
buildLedger(sHexB, hexpolB, "EPDMHexpolB4");
buildLedger(sAll, all, "EPDMAll9356", true);
buildLedger(sDup, duplicateAudit, "EPDMDuplicateAudit", true);

overview.showGridLines = false;
title(overview, "A1:H1", "EPDM｜反倾销税与第三国转运风险逐票审计台账");
overview.getRange("A2:H2").merge();
overview.getRange("A2:H2").values = [[
  "全量核查9,356行，按原12字段完全相等去重后9,160行。现有数据形成HEXPOL墨西哥实体级双腿与时间关联（B+），但缺少牌号、批次、数量、提单、柜号及原产证闭合；不得据此认定同货转运、原产地虚假、走私或逃税。",
]];
overview.getRange("A2:H2").format = {
  fill: C.paleGold, font: { bold: true, color: "#6B4E00", name: "Microsoft YaHei", size: 10 },
  wrapText: true, verticalAlignment: "center", borders: { preset: "outside", style: "thin", color: "#E0C15A" },
};
overview.getRange("A2:H2").format.rowHeightPx = 54;

section(overview.getRange("A4:D4"), "数据完整性与五层范围口径（全字段唯一）");
overview.getRange("A5:D5").values = [["项目", "台账公式计数", "权威预期", "校验"]];
header(overview.getRange("A5:D5"));
overview.getRange("A6:A11").values = [
  ["全部宽池"], ["原胶/通用EPDM候选"], ["税目标准表述（初步纳入）"],
  ["板/片/带/卷/粒料等形态待核"], ["混炼改性/TPV/TPE/功能聚合物待核"],
  ["疑似制品/型材/密封件等范围外"],
];
overview.getRange("B6").formulas = [["=COUNTIF('全量9356'!$H$2:$H$9357,\"是\")"]];
for (let row = 7; row <= 11; row++) {
  overview.getRange(`B${row}`).formulas = [[`=COUNTIFS('全量9356'!$V$2:$V$9357,A${row},'全量9356'!$H$2:$H$9357,\"是\")`]];
}
overview.getRange("C6:C11").values = [[9160], [6306], [504], [1163], [300], [887]];
overview.getRange("D6").formulas = [["=IF(B6=C6,\"通过\",\"复核\")"]];
overview.getRange("D6:D11").fillDown();
body(overview.getRange("A6:D11"), 9);
overview.getRange("B6:C11").format.numberFormat = "#,##0";
overview.getRange("D6:D11").conditionalFormats.add("containsText", { text: "通过", format: { fill: C.paleGreen, font: { bold: true, color: "#256029" } } });
overview.getRange("D6:D11").conditionalFormats.add("containsText", { text: "复核", format: { fill: C.paleRed, font: { bold: true, color: "#8B1E1E" } } });

section(overview.getRange("E4:H4"), "路线子集计数与证据属性");
overview.getRange("E5:H5").values = [["子集", "台账公式计数", "权威预期", "属性"]];
header(overview.getRange("E5:H5"));
overview.getRange("E6:E11").values = [["原始行"], ["对华"], ["受税来源直达中国"], ["第三国对华"], ["HEXPOL A腿"], ["HEXPOL B腿"]];
overview.getRange("F6:F11").formulas = [
  ["=COUNTA('全量9356'!$A$2:$A$9357)"], ["=COUNTA('中国对华55'!$A$2:$A$56)"],
  ["=COUNTA('受税来源直达6'!$A$2:$A$7)"], ["=COUNTA('第三国对华49'!$A$2:$A$50)"],
  ["=COUNTA('HEXPOL A418'!$A$2:$A$419)"], ["=COUNTA('HEXPOL B4'!$A$2:$A$5)"],
];
overview.getRange("G6:G11").values = [[9356], [55], [6], [49], [418], [4]];
overview.getRange("H6:H11").values = [
  ["全量逐票展开"], ["直接贸易事实；非违法结论"], ["A：核税/原产/范围"],
  ["C至B+：第三国对华线索"], ["B+：受税来源进入同一墨西哥实体"], ["B+：同一实体发华；无同批闭合"],
];
body(overview.getRange("E6:H11"), 9);
overview.getRange("F6:G11").format.numberFormat = "#,##0";

section(overview.getRange("A13:H13"), "重点路线结论与调证优先级");
overview.getRange("A14:H14").values = [["对象/路线", "行数", "原始字段机械汇总", "证据等级", "已证实", "仍未证实", "最先调取", "结论"]];
header(overview.getRange("A14:H14"));
overview.getRange("A15:H20").values = [
  ["HEXPOL墨西哥双腿", "A418 / B4", "A数量2,987,820.95、金额8,477,644.31；B数量618.20、金额3,378.88；单位/币种未统一", "B+", "同一墨西哥实体、受税来源入境、后续发华；B腿日期2025-12-23", "同牌号、同批次、同数量、同提单/柜号、原产证及库存流转", "418条A腿提单、4条B腿中国底单、BOM/工单/库存/原产证", "最具体第三国核查线索；不能认定违法"],
  ["HEXPOL时间窗口", "B前171；前30日36；前7日3", "B前同标准化货描78条；仅为记录数/字段口径", "B+", "实体级、方向级、时间级关联", "同货、同批或虚假原产", "以B腿4条逐票反查最近A腿牌号、PO、柜号和批次", "可升级调证，当前无闭环"],
  ["受税来源直达中国", "6", "重量字段226,987；数量字段212；金额字段空", "A（贸易事实）", "比利时5、意大利1直接对华", "是否落入措施范围、实际生产商、适用税率与已缴税", "中国报关单、税款书、COA、原产证、生产商声明", "优先核税；A不等于违法"],
  ["沙特来源→中国", "40", "重量字段6,419,911.08；单位以原单为准", "C", "沙特原产字段对华", "受税来源绕道", "生产厂代码、原产证、聚合工艺和产能台账", "当地真实EPDM产能构成强替代解释"],
  ["加拿大FUSABOND→中国", "4", "单行重量20,330；疑有重复组；单位以原单为准", "C+", "产品和对华方向", "是否属于EPDM措施范围", "成分、CAS、牌号说明、归类与用途", "FUSABOND N302可能为功能化聚合物，先核范围"],
  ["KEI印度→中国", "1", "数量106、金额271.36；单位/币种未载", "C+", "印度实体发华", "与受税来源A腿的时间闭合", "该票生产批次、BOM、原料入库日期", "已见A腿均晚于B腿，时间上不支持该票绕道"],
];
body(overview.getRange("A15:H20"), 9);
overview.getRange("A15:H20").format.rowHeightPx = 76;

section(overview.getRange("A22:H22"), "“0716”系列案：产品级执法事实与本台账边界");
overview.getRange("A23:H26").merge();
overview.getRange("A23:H26").values = [[
  "公开报道证实南京海关缉私部门侦办“0716”系列案件，涉及走私进口反倾销商品三元乙丙橡胶4,900余吨、案值2.87亿元。这是EPDM产品层面的高强度执法事实，但公开材料未披露受税来源国、第三国路线、涉案企业、报关行、具体口岸、报关单号或实际少缴税额，不能将本台账中的HEXPOL、沙特、加拿大、印度或任何企业自动等同于该案主体；“案值”也不能直接替代中国海关审定完税价格计算税损。",
]];
overview.getRange("A23:H26").format = {
  fill: C.paleRed, font: { color: "#8B1E1E", name: "Microsoft YaHei", size: 10 }, wrapText: true,
  verticalAlignment: "center", borders: { preset: "all", style: "thin", color: "#E6A6A1" },
};

section(overview.getRange("A28:H28"), "字段口径警示");
overview.getRange("A29:H32").merge();
overview.getRange("A29:H32").values = [[
  "重量、数量、金额均按易迅源表原字段保留。源表没有统一单位和币种，字段机械求和只用于完整性复核，不得写成kg、吨、美元、人民币，也不得互相换算。任何税差只能在取得中国报关单、海关审定完税价格、法定原产地、生产商和实际适用反倾销税率后测算。",
]];
overview.getRange("A29:H32").format = {
  fill: C.paleGold, font: { color: "#6B4E00", italic: true, name: "Microsoft YaHei", size: 10 },
  wrapText: true, verticalAlignment: "center", borders: { preset: "all", style: "thin", color: "#E0C15A" },
};

section(overview.getRange("A34:F34"), "现行税率与条件性税差系数");
overview.getRange("G34").values = [["进口增值税率"]];
overview.getRange("H34").values = [[0.13]];
overview.getRange("G34:H34").format = { fill: C.paleBlue, font: { bold: true, color: C.navy, name: "Microsoft YaHei" }, borders: { preset: "all", style: "thin", color: C.border } };
overview.getRange("H34").format.numberFormat = "0.0%";
overview.getRange("A35:H35").values = [["原产地/企业", "AD税率", "AD引致VAT后综合增量系数", "现行状态", "本数据能否直接计税", "必须取得的计税要素", "解读", "来源"]];
header(overview.getRange("A35:H35"));
const rateRows = [
  ["美国：Dow及其他", 2.22, null, "复审期间继续实施", "不能", "完税价格、生产商、原产地、税款书", "最高系数场景；非实际税损", "https://www.mofcom.gov.cn/zwgk/zcfb/art/2025/art_50c8adab6b72437b84b0f04a69b5ab0d.html"],
  ["美国：Exxon", 2.149, null, "复审期间继续实施", "不能", "同上", "列名企业", "同上"],
  ["美国：ARLANXEO USA/Lion", 2.198, null, "复审期间继续实施", "不能", "同上", "列名企业", "同上"],
  ["韩国：Kumho", 0.125, null, "复审期间继续实施", "不能", "同上", "列名企业", "同上"],
  ["韩国：Lotte Versalis", 0.211, null, "复审期间继续实施", "不能", "同上", "列名企业", "同上"],
  ["韩国：其他", 0.245, null, "复审期间继续实施", "不能", "同上", "其他企业率", "同上"],
  ["欧盟：ARLANXEO Netherlands", 0.181, null, "复审期间继续实施", "不能", "同上", "列名企业", "同上"],
  ["欧盟：Exxon France", 0.147, null, "复审期间继续实施", "不能", "同上", "列名企业", "同上"],
  ["欧盟：Versalis Italy", 0.165, null, "复审期间继续实施", "不能", "同上", "列名企业", "同上"],
  ["欧盟：其他", 0.317, null, "复审期间继续实施", "不能", "同上", "其他企业率", "同上"],
];
overview.getRange("A36:H45").values = rateRows;
for (let row = 36; row <= 45; row++) overview.getRange(`C${row}`).formulas = [[`=B${row}*(1+$H$34)`]];
body(overview.getRange("A36:H45"), 9);
overview.getRange("B36:C45").format.numberFormat = "0.000%";
overview.getRange("A36:H45").format.rowHeightPx = 52;

for (const [col, width] of [["A", 27], ["B", 19], ["C", 27], ["D", 22], ["E", 31], ["F", 34], ["G", 37], ["H", 46]]) {
  overview.getRange(`${col}1:${col}45`).format.columnWidth = width;
}
overview.freezePanes.freezeRows(2);

policy.showGridLines = false;
title(policy, "A1:E1", "EPDM｜政策、原产地判断与调证清单");
policy.getRange("A3:E3").values = [["模块", "事实/规则", "本项应用", "下一步调证", "公开来源"]];
header(policy.getRange("A3:E3"));
const policyRows = [
  ["措施与复审", "中国对原产美国、韩国、欧盟的EPDM反倾销措施于2025-12-20启动期终复审，复审期间继续实施；英国部分因未申请复审于2025-12-20终止。", "数据期覆盖复审期间，须按进口日期、原产地和生产商核率。", "调中国税款书与单一窗口税费参数。", "https://www.mofcom.gov.cn/zwgk/zcfb/art/2025/art_50c8adab6b72437b84b0f04a69b5ab0d.html"],
  ["措施范围", "措施产品为三元乙丙橡胶，申报税号40027010/40027090等仅是范围入口；形态、成分和是否制品仍需核验。", "本台账将9,160唯一行分为6306/504/1163/300/887五层。", "逐票调COA、成分、形态、是否硫化、用途和归类依据。", "https://dcj.mofcom.gov.cn/article/zcfb/gpmy/202012/20201203024350.shtml"],
  ["原产地", "聚合发生地通常是EPDM原产判断的核心事实；仓储、分装、换标通常不构成实质性改变。混炼/改性则须按成分、税号和规则具体判断。", "品牌或开票地不等于原产地；Keltan/Vistalon等可有多地生产。", "核plant code、生产厂声明、聚合工单、原料和能耗。", "https://www.gov.cn/zhengce/content/2008-09/05/content_1606.htm"],
  ["HEXPOL B+", "同一墨西哥实体出现受税来源A腿418条和对华B腿4条；B前171条、30日内36条、7日内3条。", "实体、方向、时间关联成立；无同批闭合。", "以4条B腿为锚，核牌号、批号、数量、PO、柜号、提单、BOM、库存和原产证。", "https://www.hexpol.com/plant-locations/hexpol-compounding-qro/"],
  ["HEXPOL替代解释", "HEXPOL墨西哥具有真实橡胶混炼能力。", "可能存在实质加工或正常供应链，不能只凭双腿认定绕道。", "核产品成分变化、工艺、成本和适用原产规则。", "https://www.hexpol.com/plant-locations/hexpol-compounding-qro/"],
  ["沙特来源", "沙特存在KEMYA等EPDM生产能力。", "40条沙特对华记录有正常原产替代解释，且本数据未见受税来源至沙特A腿闭合。", "核生产厂、批号、产能、原产证和出口提单。", "https://www.sabic.com/en/Images/Al-Jubail%20Petrochemical%20Company%20%28KEMYA%29_tcm1010-42731.pdf"],
  ["加拿大FUSABOND", "FUSABOND N302公开描述为功能化聚合物。", "4条记录首要问题是是否落入EPDM措施范围，而非先推定绕道。", "核TDS、COA、单体组成、归类和用途。", "https://www.dow.com/en-us/pdp.fusabond-n302-functional-polymer.1892752z.html"],
  ["KEI印度", "现有受税来源进入KEI的记录日期均晚于2025-12-07对华B腿。", "时间顺序不支持该票由现有A腿绕道。", "若继续核查，调更早期原料入库和该票生产批次。", "易迅结构化逐票数据"],
  ["0716案", "公开报道：南京海关缉私部门侦办EPDM反倾销商品走私案，4,900余吨、案值2.87亿元。", "只证明EPDM产品层面存在真实执法风险；未公开第三国路线、企业、报关行、具体口岸或税损。", "向有权机关核案件报关单、口岸、企业、代理、原产证和税款。", "https://www.chinanews.com.cn/sh/2025/02-17/10369828.shtml"],
  ["0716原始报道", "地方权威报纸披露“0716”系列案件的产品、数量和案值。", "不得将案值直接作为完税价格或据此倒算实际逃税。", "税损只能以审定完税价格、税率和缴税状态测算。", "https://doss.xhby.net/zpaper/njcb/pc/att/202502/18/8c924621-8910-48c9-968f-0441fdc593ca.pdf"],
  ["证据等级", "A=直接贸易/执法事实；B+=实体双腿和时间关联；C=方向或范围线索；均不自动等于违法。", "当前HEXPOL最高B+，0716为产品级执法事实但与本台账实体无闭合。", "只有中国底单+两段提单+同批货证据闭合后才可升级。", "本项目方法规则"],
  ["税差", "条件性增量系数=AD税率×(1+13%)；实际税额以中国海关审定完税价格为基数。", "易迅重量/数量/金额单位币种不统一，不能直接计税。", "调报关单、税款书、完税价格、生产商、原产地和适用率。", "https://www.mofcom.gov.cn/zwgk/zcfb/art/2025/art_50c8adab6b72437b84b0f04a69b5ab0d.html"],
];
policy.getRange(`A4:E${3 + policyRows.length}`).values = policyRows;
body(policy.getRange(`A4:E${3 + policyRows.length}`), 9);
policy.getRange(`A4:E${3 + policyRows.length}`).format.wrapText = true;
policy.getRange(`A4:E${3 + policyRows.length}`).format.rowHeightPx = 78;
for (const [col, width] of [["A", 23], ["B", 64], ["C", 62], ["D", 60], ["E", 62]]) {
  policy.getRange(`${col}1:${col}${3 + policyRows.length}`).format.columnWidth = width;
}
policy.freezePanes.freezeRows(3);

// Compact workbook verification before export.
const overviewCheck = await wb.inspect({
  kind: "table", range: "概览!A1:H45", include: "values,formulas",
  tableMaxRows: 45, tableMaxCols: 8, maxChars: 12000,
});
const errorCheck = await wb.inspect({
  kind: "match", searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 300 }, summary: "final formula error scan", maxChars: 5000,
});
await fs.writeFile(path.join(qaDir, "overview_inspect.ndjson"), overviewCheck.ndjson || "", "utf8");
await fs.writeFile(path.join(qaDir, "formula_error_scan.ndjson"), errorCheck.ndjson || "", "utf8");

const previews = [
  ["概览", "A1:H45", "01_概览.png"], ["中国对华55", "A1:AF8", "02_中国对华55.png"],
  ["受税来源直达6", "A1:AF7", "03_受税来源直达6.png"], ["第三国对华49", "A1:AF8", "04_第三国对华49.png"],
  ["HEXPOL A418", "A1:AF8", "05_HEXPOL_A418.png"], ["HEXPOL B4", "A1:AF5", "06_HEXPOL_B4.png"],
  ["全量9356", "A1:AF8", "07_全量9356.png"], ["重复审计", "A1:AF8", "08_重复审计.png"],
  ["政策与调证", `A1:E${3 + policyRows.length}`, "09_政策与调证.png"],
];
if (process.env.EPDM_SKIP_PREVIEWS !== "1") {
  for (const [sheetName, range, fileName] of previews) {
    const image = await wb.render({ sheetName, range, scale: 0.8, format: "png" });
    await fs.writeFile(path.join(qaDir, fileName), new Uint8Array(await image.arrayBuffer()));
  }
}

try {
  // Refresh the overview preview after the final formula/text fixes.
  if (process.env.EPDM_SKIP_PREVIEWS === "1") {
    const image = await wb.render({ sheetName: "概览", range: "A1:H45", scale: 0.8, format: "png" });
    await fs.writeFile(path.join(qaDir, "01_概览.png"), new Uint8Array(await image.arrayBuffer()));
  }
  const output = await SpreadsheetFile.exportXlsx(wb);
  await output.save(outPath);
} catch (error) {
  console.error("EPDM_XLSX_EXPORT_ERROR:", error?.message || String(error));
  process.exit(1);
}

console.log(JSON.stringify({
  outPath,
  counts: { all: all.length, unique: all.filter(r => r.dedup_keep).length, china55: china55.length, direct6: direct6.length, third49: third49.length, hexpolA: hexpolA.length, hexpolB: hexpolB.length, duplicateAudit: duplicateAudit.length },
  expectedScope: delivery.scope_counts_exact_unique,
  previews: previews.map(x => x[2]),
}, null, 2));
