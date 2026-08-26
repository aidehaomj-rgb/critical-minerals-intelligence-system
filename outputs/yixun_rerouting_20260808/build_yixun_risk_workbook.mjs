import fs from "node:fs";
import { Workbook, SpreadsheetFile } from "@oai/artifact-tool";

const baseDir = "C:/Users/59809/Documents/关键矿产/outputs/yixun_rerouting_20260808";
const csvPath = `${baseDir}/yixun_selected_raw_20260808.csv`;
const outputPath = `${baseDir}/易迅海关数据_第三国绕道风险分析_20260808.xlsx`;

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (ch === '"') {
        quoted = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }
  if (field.length || row.length) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }
  return rows;
}

const rawRows = parseCsv(fs.readFileSync(csvPath, "utf8"));
const headers = rawRows[0];
const records = rawRows.slice(1).filter((r) => r.length && r[0]).map((row) =>
  Object.fromEntries(headers.map((h, idx) => [h, row[idx] ?? ""]))
);

const num = (v) => (v === "" || v == null ? null : Number(v));
const rawHeaders = [
  "记录ID", "查询主题", "数据来源", "流向", "日期", "HS编码", "商品描述",
  "境内收发货人/买方", "境外收发货人/卖方", "申报重量", "申报数量", "申报金额",
  "目的地", "原产地", "品牌/牌号/批次", "疑似重复组", "路径标识", "HS/原产地风险",
  "证据等级", "分析备注", "来源链接", "查询时间"
];
const rawValues = records.map((r) => [
  r.record_id, r.query_theme, r.data_source, r.trade_flow, r.date, r.hs_code,
  r.goods_description, r.buyer, r.supplier, num(r.weight_reported),
  num(r.quantity_reported), num(r.amount_reported), r.destination, r.origin,
  r.brand_grade_batch, r.duplicate_group, r.route_flag, r.hs_risk_flag,
  r.evidence_level, r.analyst_note, r.source_url, r.query_timestamp
]);

const highRiskIds = new Set([
  "CYP-CN-001", "CYP-CN-003", "CYP-CN-006", "CYP-CN-010", "CYP-CN-018",
  "PPS-CN-001", "PPS-CN-002", "PPS-CN-003", "POM-CN-001", "PEA-CN-001", "PEA-CN-002"
]);
const highRisk = records.filter((r) => highRiskIds.has(r.record_id));
const highHeaders = [
  "记录ID", "商品方向", "日期", "境外供应商", "中国/目的地买方", "路线",
  "HS编码", "关键商品描述", "数量", "金额", "证据等级", "风险判断", "下一步核查"
];
const nextStep = (r) => {
  if (r.record_id.startsWith("CYP")) return "调取中国进口报关单、原产地证、税款缴款书，核执行税号2926909013及涉税厂商";
  if (r.record_id === "POM-CN-001") return "核中国报关原产地；比对越南出口申报中的#&DE、原产地证和加工增值证明";
  if (r.record_id.startsWith("PPS")) return "核是否为涉案PPS树脂或下游零件/改性料；调配方、批次、原产地证和价格发票";
  return "调措施生效后的中国进口记录；以批次/提单号追踪香港或新加坡贸易商第二程流向";
};
const highValues = highRisk.map((r) => [
  r.record_id, r.query_theme, r.date, r.supplier, r.buyer,
  `${r.origin || "?"}→${r.destination || "?"}`, r.hs_code, r.goods_description,
  num(r.quantity_reported), num(r.amount_reported), r.evidence_level,
  r.analyst_note, nextStep(r)
]);

const querySummary = [
  ["CYPERMETHRIN TECHNICAL→China", 40, 19, "商品名；目的地中国；近一年", "印度生产商直达中国；精确CAS/纯度记录", "A：直接风险，尚非第三国绕道"],
  ["FORTRON→China", 1, 1, "商品名；目的地中国", "印度企业向深圳发50kg GF40 PPS样品；HS39071000", "A-：跨HS线索，需判定是否涉案树脂"],
  ["DURAFIDE→China", 3, 3, "商品名；目的地中国", "印度/印尼→中国25kg记录；HS39079900/39081090/40169990", "A-/B+：小样/部件，不足以证明规避"],
  ["HOSTAFORM→China", 19, 5, "商品名；目的地中国", "越南供应商→上海25kg，描述含#&DE而平台原产地为越南", "A-：原产地字段冲突，优先调单"],
  ["ROQUETTE N-735→Vietnam", 6, 5, "精确牌号；目的地越南；两年", "Roquette Singapore为卖方，申报仍注明加拿大生产/原产", "B+：交易节点成立，反向证明原产地被保留"],
  ["ROQUETTE N-735→China", 486, 3, "精确牌号；目的地中国；两年", "香港贸易商作为买方，供应商/原产地仍为加拿大；均为措施前", "B+/B：措施后回流链未闭合"],
  ["RYTON USA→India", 11, 3, "精确牌号；全球；近一年", "美国PPS进入印度并带批次号2584U00296/2584U00379", "B+：第一程具体；未匹配印度→中国同批次"],
  ["FORTRON USA/Malaysia→Vietnam", 310, 3, "品牌词；全球；近一年", "韩国开票、美国/马来西亚原产进入越南，原产地被保留", "B+/C+：供应链存在，但无中国第二程"],
  ["DURAFIDE Malaysia→Indonesia", 1192, 2, "品牌词；全球；近一年", "马来西亚PPS向印尼批量供货", "C+：真实区域生产/分销，不能当然认定转口"],
  ["POM→Singapore", 122, 3, "POM/HS390710；目的地新加坡；两年", "印度→新加坡，含HOSTAFORM/DELRIN批次号", "B：可作为后续同批次匹配键"]
];

const matrix = [
  ["氯氰菊酯", "印度→中国直达", "未发现第三国第二程", "精确CAS、纯度、生产商；多票16–36吨", "中国进口申报税号/涉税厂商/完税证明", "最高"],
  ["聚苯硫醚（PPS）", "美国→印度；印尼/印度→中国小票", "存在第一程及小票第二程，但未同批次闭环", "RYTON批次号；FORTRON/DURAFIDE跨HS", "配方、批次、原产地证、加工增值", "高"],
  ["共聚聚甲醛（POM）", "印度→新加坡；越南→中国", "越南记录出现德国标记与越南原产地冲突", "HOSTAFORM牌号/批次；#&DE", "中越双边申报、原产地证、工厂加工记录", "高"],
  ["豌豆淀粉", "加拿大→香港/新加坡/越南", "贸易商节点成立，现有申报保留加拿大原产", "N-735精确牌号、加拿大生产商", "措施后中国第二程、提单号/批次匹配", "中高"],
  ["总体", "多条可核查供应链", "未形成‘原产国→第三国→中国’同批次完整闭环", "已定位企业、牌号、批次和异常HS", "调取中国海关底单与原产地单证是决定性一步", "结论"]
];

const rules = [
  ["A", "中国为目的地，商品/生产商/CAS或批次高度匹配，足以直接调单", "不等于已证明逃税或绕道"],
  ["A-", "中国为目的地并有跨HS、原产地字段冲突或第三国供应商", "需排除样品、零件、改性料和真实加工"],
  ["B+", "第一程、贸易商节点或供应链实体明确，但缺中国第二程", "适合批次/提单号持续监测"],
  ["B", "方向相关但时间、货量或产品范围不足", "仅作辅助线索"],
  ["C+", "证明区域产能或分销存在", "亦可能是反向证据，不能推定规避"],
  ["闭环标准", "原产国→第三国→中国两程交易可用提单号、集装箱号、批次、数量/金额、日期衔接", "还应核第三国实质性加工与中国进口原产地申报"]
];

const wb = Workbook.create();
const navy = "#17365D";
const blue = "#D9EAF7";
const orange = "#F4B183";
const red = "#F4CCCC";
const green = "#D9EAD3";
const gray = "#E7E6E6";
const white = "#FFFFFF";

function title(sheet, address, textValue, subtitleAddress, subtitle) {
  sheet.getRange(address).merge();
  const t = sheet.getRange(address.split(":")[0]);
  t.values = [[textValue]];
  t.format = { fill: navy, font: { bold: true, color: white, size: 18 }, horizontalAlignment: "left", verticalAlignment: "center" };
  sheet.getRange(address).format.rowHeight = 32;
  sheet.getRange(subtitleAddress).merge();
  const s = sheet.getRange(subtitleAddress.split(":")[0]);
  s.values = [[subtitle]];
  s.format = { fill: blue, font: { color: "#274E75", italic: true, size: 10 }, wrapText: true, verticalAlignment: "center" };
  sheet.getRange(subtitleAddress).format.rowHeight = 30;
}

function headerStyle(range) {
  range.format = { fill: navy, font: { bold: true, color: white }, horizontalAlignment: "center", verticalAlignment: "center", wrapText: true };
  range.format.rowHeight = 30;
}

const overview = wb.worksheets.add("风险总览");
overview.showGridLines = false;
title(overview, "A1:H1", "易迅海关数据｜第三国绕道风险核查", "A2:H2", "查询日：2026-08-08（CST）｜逐票样本仅用于风险筛查，不构成对相关企业违法行为的认定");
overview.getRange("A4:B4").merge();
overview.getRange("C4:D4").merge();
overview.getRange("E4:F4").merge();
overview.getRange("G4:H4").merge();
for (const cell of ["A4", "C4", "E4", "G4"]) overview.getRange(cell).format = { fill: blue, font: { bold: true, color: navy, size: 18 }, horizontalAlignment: "center", verticalAlignment: "center" };
overview.getRange("A5:B5").merge(); overview.getRange("A5").values = [["已固化逐票记录"]];
overview.getRange("C5:D5").merge(); overview.getRange("C5").values = [["目的地为中国"]];
overview.getRange("E5:F5").merge(); overview.getRange("E5").values = [["A/A-级调单线索"]];
overview.getRange("G5:H5").merge(); overview.getRange("G5").values = [["含品牌/批次字段"]];
overview.getRange("A5:H5").format = { fill: "#EEF5FB", font: { color: "#4F6B82", size: 9 }, horizontalAlignment: "center" };
overview.getRange("A7:H7").merge(); overview.getRange("A7").values = [["核心判断：已找到可具体调单的企业和货物记录，但尚未形成同一批货物‘原产国→第三国→中国’的完整证据闭环。"]];
overview.getRange("A7:H7").format = { fill: orange, font: { bold: true, color: "#7F3F00" }, wrapText: true, verticalAlignment: "center" };
overview.getRange("A7:H7").format.rowHeight = 32;
overview.getRange("A9:F9").values = [["商品", "已见路径", "闭环状态", "具体证据", "决定性缺口", "优先级"]];
headerStyle(overview.getRange("A9:F9"));
overview.getRange(`A10:F${9 + matrix.length}`).values = matrix;
overview.getRange(`A10:F${9 + matrix.length}`).format = { wrapText: true, verticalAlignment: "top" };
overview.getRange("A10:F10").format.fill = red;
overview.getRange("A11:F12").format.fill = "#FCE4D6";
overview.getRange("A14:F14").format.fill = gray;
overview.getRange("A17:H17").merge(); overview.getRange("A17").values = [["使用口径：第三国供应商、贸易商或第一程物流本身不等于规避；必须结合原产地证、加工工序、批次/提单匹配及中国进口申报。"]];
overview.getRange("A17:H17").format = { fill: green, font: { color: "#274E13" }, wrapText: true };
overview.getRange("A17:H17").format.rowHeight = 32;
overview.freezePanes.freezeRows(2);
overview.getRange("A:H").format.columnWidth = 15;
overview.getRange("B:B").format.columnWidth = 22;
overview.getRange("C:C").format.columnWidth = 24;
overview.getRange("D:E").format.columnWidth = 34;
overview.getRange("F:F").format.columnWidth = 10;

const high = wb.worksheets.add("高风险线索");
high.showGridLines = false;
title(high, "A1:M1", "高风险逐票线索与调单动作", "A2:M2", "A/A-代表‘优先核查’，并非违法结论；对样品、零件、改性料和重复收录须先去伪存真");
high.getRange("A4:M4").values = [highHeaders];
headerStyle(high.getRange("A4:M4"));
high.getRange(`A5:M${4 + highValues.length}`).values = highValues;
high.getRange(`A5:M${4 + highValues.length}`).format = { wrapText: true, verticalAlignment: "top" };
high.getRange(`I5:J${4 + highValues.length}`).format.numberFormat = "#,##0.00";
high.getRange(`K5:K${4 + highValues.length}`).conditionalFormats.add("containsText", { text: "A", format: { fill: red, font: { bold: true, color: "#9C0006" } } });
high.tables.add(`A4:M${4 + highValues.length}`, true, "HighRiskLeads");
high.freezePanes.freezeRows(4);
const highWidths = [14,24,12,30,30,18,12,45,12,14,10,42,48];
highWidths.forEach((w, i) => high.getRange(`${String.fromCharCode(65 + i)}:${String.fromCharCode(65 + i)}`).format.columnWidth = w);

const raw = wb.worksheets.add("原始明细");
raw.showGridLines = false;
raw.getRange("A1:V1").values = [rawHeaders];
headerStyle(raw.getRange("A1:V1"));
raw.getRange(`A2:V${records.length + 1}`).values = rawValues;
raw.getRange(`A2:V${records.length + 1}`).format = { wrapText: true, verticalAlignment: "top" };
raw.getRange(`J2:L${records.length + 1}`).format.numberFormat = "#,##0.00";
raw.getRange(`S2:S${records.length + 1}`).conditionalFormats.add("containsText", { text: "A", format: { fill: red, font: { bold: true, color: "#9C0006" } } });
raw.getRange(`S2:S${records.length + 1}`).conditionalFormats.add("containsText", { text: "B+", format: { fill: "#FCE4D6", font: { color: "#9C5700" } } });
raw.tables.add(`A1:V${records.length + 1}`, true, "RawTradeRecords");
raw.freezePanes.freezeRows(1);
const widths = [14,28,13,9,12,12,58,32,34,13,13,15,12,12,32,22,25,42,11,48,42,20];
widths.forEach((w, i) => {
  const col = i < 26 ? String.fromCharCode(65 + i) : "A";
  raw.getRange(`${col}:${col}`).format.columnWidth = w;
});

// Cross-sheet formulas are written only after the referenced sheet exists.
overview.getRange("A4").formulas = [[`=COUNTA('原始明细'!A2:A${records.length + 1})`]];
overview.getRange("C4").formulas = [[`=COUNTIF('原始明细'!M2:M${records.length + 1},"China")`]];
overview.getRange("E4").formulas = [[`=COUNTIF('原始明细'!S2:S${records.length + 1},"A")+COUNTIF('原始明细'!S2:S${records.length + 1},"A-")`]];
overview.getRange("G4").formulas = [[`=COUNTIF('原始明细'!O2:O${records.length + 1},"<>")`]];

const qs = wb.worksheets.add("查询汇总");
qs.showGridLines = false;
title(qs, "A1:F1", "查询口径与结果覆盖", "A2:F2", "‘平台总量’为检索结果显示值；‘固化样本’为本次逐票核验并写入工作簿的代表性记录数");
qs.getRange("A4:F4").values = [["查询主题", "平台总量", "固化样本", "检索条件", "已核实信号", "证据结论"]];
headerStyle(qs.getRange("A4:F4"));
qs.getRange(`A5:F${4 + querySummary.length}`).values = querySummary;
qs.getRange(`A5:F${4 + querySummary.length}`).format = { wrapText: true, verticalAlignment: "top" };
qs.tables.add(`A4:F${4 + querySummary.length}`, true, "QueryCoverage");
qs.freezePanes.freezeRows(4);
[28,13,13,34,52,42].forEach((w, i) => qs.getRange(`${String.fromCharCode(65+i)}:${String.fromCharCode(65+i)}`).format.columnWidth = w);

const ruleSheet = wb.worksheets.add("核查规则");
ruleSheet.showGridLines = false;
title(ruleSheet, "A1:C1", "证据分级与闭环判定规则", "A2:C2", "用于内部筛查排序；所有主体名称均源自贸易数据页面，不代表其存在违法行为");
ruleSheet.getRange("A4:C4").values = [["等级/标准", "含义", "使用限制"]];
headerStyle(ruleSheet.getRange("A4:C4"));
ruleSheet.getRange(`A5:C${4 + rules.length}`).values = rules;
ruleSheet.getRange(`A5:C${4 + rules.length}`).format = { wrapText: true, verticalAlignment: "top" };
ruleSheet.getRange("A5:C5").format.fill = red;
ruleSheet.getRange("A6:C6").format.fill = "#FCE4D6";
ruleSheet.getRange("A7:C7").format.fill = orange;
ruleSheet.getRange("A10:C10").format.fill = green;
ruleSheet.getRange("A12:C12").merge(); ruleSheet.getRange("A12").values = [["建议优先调取字段：进口申报单号、运输工具/航次、提单号、集装箱号、境内收货人、消费使用单位、境外发货人、生产商、原产国（地区）、启运国（地区）、成交方式、商品编码、规格型号、品牌/牌号、批次、数量、金额、原产地证号、随附单证。"]];
ruleSheet.getRange("A12:C12").format = { fill: blue, font: { color: navy }, wrapText: true };
ruleSheet.getRange("A12:C12").format.rowHeight = 58;
[18,62,52].forEach((w, i) => ruleSheet.getRange(`${String.fromCharCode(65+i)}:${String.fromCharCode(65+i)}`).format.columnWidth = w);

await wb.inspect({ kind: "table", range: "风险总览!A1:H17", include: "values,formulas", tableMaxRows: 25, tableMaxCols: 10 });
const errorScan = await wb.inspect({ kind: "match", searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A", options: { useRegex: true, maxResults: 100 }, summary: "formula error scan" });
if (errorScan?.matches?.length) throw new Error(`Formula errors detected: ${JSON.stringify(errorScan.matches)}`);

const out = await SpreadsheetFile.exportXlsx(wb);
await out.save(outputPath);
for (const sheetName of ["风险总览", "高风险线索", "原始明细", "查询汇总", "核查规则"]) {
  const img = await wb.render({ sheetName, autoCrop: "all", scale: 1 });
  fs.writeFileSync(`${baseDir}/render_${sheetName}.png`, Buffer.from(await img.arrayBuffer()));
}
console.log(JSON.stringify({ outputPath, records: records.length, highRisk: highRisk.length }));
