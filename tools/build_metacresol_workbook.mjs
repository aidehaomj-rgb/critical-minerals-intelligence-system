import fs from "node:fs/promises";
import path from "node:path";
import { Workbook, SpreadsheetFile } from "@oai/artifact-tool";

const outDir = process.env.METACRESOL_OUT || "D:/易迅数据/反倾销税深度分析报告/11_间甲酚";
const sourceRecords = JSON.parse(await fs.readFile(path.join(outDir, "间甲酚_易迅逐票标准化.json"), "utf8"));
const delivery = JSON.parse(await fs.readFile(path.join(outDir, "间甲酚_交付摘要.json"), "utf8"));
const outPath = path.join(outDir, "间甲酚_易迅逐票判定台账_阶段审计.xlsx");
const qaDir = path.join(outDir, "QA_工作簿预览");
await fs.mkdir(qaDir, { recursive: true });

const wb = Workbook.create();
const overview = wb.worksheets.add("概览");
const china = wb.worksheets.add("中国明确6条");
const chinaGeneric = wb.worksheets.add("中国泛称待核3条");
const aIndia = wb.worksheets.add("受税来源至印度369条");
const explicit = wb.worksheets.add("明确间甲酚1259条");
const allRows = wb.worksheets.add("全部7072条");
const duplicates = wb.worksheets.add("完全重复审计");
const policy = wb.worksheets.add("政策与调证");

const C = {
  navy: "#17324D", blue: "#1F4E78", paleBlue: "#EAF2F8", paleGold: "#FFF4CC",
  paleRed: "#FCE8E6", paleGreen: "#E6F4EA", border: "#CBD5E1", ink: "#102A43",
};

function s(v) { return v === null || v === undefined ? "" : String(v); }
function n(v) { const x = Number(v); return Number.isFinite(x) ? x : null; }
const productClass = {
  "明确间甲酚": "明确间甲酚",
  "泛称": "泛称cresol待核",
  "对甲酚": "对甲酚",
  "邻甲酚": "邻甲酚",
  "间对/混合": "间对/甲酚酸混合物",
  "衍生物": "衍生物/指示剂",
  "其他": "同HS其他",
};
const taxedOrigins = new Set(["UNITED STATES","USA","U.S.A.","GERMANY","JAPAN","SPAIN","FRANCE","BELGIUM","UNITED KINGDOM","UK","ITALY","NETHERLANDS","AUSTRIA","IRELAND","DENMARK","SWEDEN","FINLAND","POLAND","CZECH REPUBLIC","PORTUGAL","GREECE","LUXEMBOURG","HUNGARY","ROMANIA","BULGARIA","SLOVAKIA","SLOVENIA","CROATIA","ESTONIA","LATVIA","LITHUANIA","CYPRUS","MALTA"]);
const records = sourceRecords.map(r => {
  const cls = productClass[r.scope_category] || r.scope_category;
  const destination = s(r["目的国/地区"]);
  const origin = s(r["原产国/地区"]);
  let route = `${origin || "原产字段空"}→${destination || "目的地空"}背景`;
  let evidence = "C-同品贸易背景";
  let routeReason = r.scope_reason;
  if (r.scope_category === "明确间甲酚" && destination.toUpperCase() === "CHINA") {
    route = `${origin || "原产字段空"}→中国B腿`;
    evidence = taxedOrigins.has(origin.toUpperCase()) ? "A-直接核税" : "B-第三国对华";
    routeReason = "明确间甲酚对华记录；法定原产地、产品范围及历史缴税状态待中国底单核验";
  } else if (r.scope_category === "明确间甲酚" && destination.toUpperCase() === "INDIA" && taxedOrigins.has(origin.toUpperCase())) {
    route = `${origin}→印度A腿背景`;
    evidence = "B-受税来源外流";
    routeReason = "受税来源向印度供应明确间甲酚；尚未与中国B腿同批闭合";
  } else if (r.scope_category === "泛称" && destination.toUpperCase() === "CHINA") {
    route = `${origin || "原产字段空"}→中国泛称B腿`;
    evidence = "C-范围待CAS";
    routeReason = "对华货描仅写cresol(s)；须以CAS/COA确认是否间甲酚";
  }
  return {
    record_id: r.record_id,
    excel_row: r.excel_row,
    visible_signature: r.duplicate_group_id || r.record_id,
    data_feed: r["数据源"], trade_direction: r["进出口"], date: r["日期"], hs_code: r["HS编码"],
    description: r["商品描述"], buyer_or_consignee: r["采购商"], seller_or_shipper: r["供应商"],
    weight_field: r["重量"], quantity_field: r["数量"], amount_field: r["金额"],
    destination, platform_origin: origin,
    weight_num: n(r["重量"]), quantity_num: n(r["数量"]), amount_num: n(r["金额"]),
    product_class: cls,
    scope_screen: r.scope_category === "明确间甲酚" ? "范围候选" : (r.scope_category === "泛称" ? "范围待CAS" : "排除/分流"),
    scope_reason: r.scope_reason, route, evidence_grade: evidence, route_reason: routeReason,
    visible_signature_count: n(r.duplicate_group_size),
    possible_exact_duplicate: r.is_duplicate_all12,
    dedup_keep: r.dedup_keep,
  };
});
const rawCats = Object.fromEntries(Object.entries(delivery.counts.categories).map(([k,v]) => [productClass[k] || k, v.raw]));
const uniqueCats = Object.fromEntries(Object.entries(delivery.counts.categories).map(([k,v]) => [productClass[k] || k, v.dedup]));
const audit = { source_rows: delivery.counts.raw_rows, visible_unique_rows: delivery.counts.dedup_rows, category_raw: rawCats, category_visible_unique: uniqueCats };
function title(sheet, range, value) {
  const r = sheet.getRange(range); r.merge(); r.values = [[value]];
  r.format = { fill: C.navy, font: { bold: true, color: "#FFFFFF", size: 18, name: "Microsoft YaHei" }, verticalAlignment: "center" };
  r.format.rowHeightPx = 42;
}
function section(range, value) {
  range.merge(); range.values = [[value]];
  range.format = { fill: C.paleBlue, font: { bold: true, color: C.navy, name: "Microsoft YaHei" }, verticalAlignment: "center" };
  range.format.rowHeightPx = 28;
}
function header(range) {
  range.format = { fill: C.blue, font: { bold: true, color: "#FFFFFF", name: "Microsoft YaHei" }, wrapText: true, verticalAlignment: "center", borders: { preset: "all", style: "thin", color: C.border } };
  range.format.rowHeightPx = 34;
}
function body(range, size = 9) {
  range.format = { wrapText: true, verticalAlignment: "top", font: { name: "Microsoft YaHei", size }, borders: { preset: "all", style: "thin", color: C.border } };
}
function unique(rows) {
  return rows.filter(r => r.dedup_keep === "是");
}

const uniqueRows = unique(records);
const explicitRows = unique(records.filter(r => r.product_class === "明确间甲酚"));
const chinaRows = explicitRows.filter(r => (r.destination || "").toUpperCase() === "CHINA");
const genericRows = unique(records.filter(r => r.product_class === "泛称cresol待核" && (r.destination || "").toUpperCase() === "CHINA"));
const aIndiaRows = explicitRows.filter(r => (r.destination || "").toUpperCase() === "INDIA" && taxedOrigins.has((r.platform_origin || "").toUpperCase()));
const duplicateRows = records.filter(r => Number(r.visible_signature_count) > 1);

overview.showGridLines = false;
title(overview, "A1:H1", "间甲酚｜反倾销税与第三国转运风险阶段审计台账");
overview.getRange("A2:H2").merge();
overview.getRange("A2:H2").values = [["两轮规则合并逐票重跑7,072行：明确间甲酚1,414原始/1,259唯一；中国明确6条；受税来源至印度369条。两组在主体、批号、提单和数量上0闭合。公开法律记录支持措施于2026-01-14期满，2026-01-15起终止；网页展示状态存在冲突。"]];
overview.getRange("A2:H2").format = { fill: C.paleRed, font: { bold: true, color: "#8B1E1E", name: "Microsoft YaHei" }, wrapText: true, verticalAlignment: "center" };
overview.getRange("A2:H2").format.rowHeightPx = 48;

section(overview.getRange("A4:D4"), "数据完整性与范围");
overview.getRange("A5:D13").values = [
  ["项目", "原始", "全字段唯一", "判定"],
  ["全部宽池", audit.source_rows, audit.visible_unique_rows, "HS290712全球宽池；日期2023-01-02—2026-01-15"],
  ["明确间甲酚", audit.category_raw["明确间甲酚"], audit.category_visible_unique["明确间甲酚"], "独立m-/meta-cresol、3-methylphenol或CAS108-39-4"],
  ["泛称cresol待核", audit.category_raw["泛称cresol待核"], audit.category_visible_unique["泛称cresol待核"], "未给异构体；CAS/COA前不计风险量"],
  ["对甲酚", audit.category_raw["对甲酚"], audit.category_visible_unique["对甲酚"], "排除"],
  ["邻甲酚", audit.category_raw["邻甲酚"], audit.category_visible_unique["邻甲酚"], "排除"],
  ["间对/甲酚酸混合物", audit.category_raw["间对/甲酚酸混合物"], audit.category_visible_unique["间对/甲酚酸混合物"], "分流；不等同纯间甲酚"],
  ["衍生物/指示剂", audit.category_raw["衍生物/指示剂"], audit.category_visible_unique["衍生物/指示剂"], "排除"],
  ["同HS其他", audit.category_raw["同HS其他"], audit.category_visible_unique["同HS其他"], "排除或信息不足"],
];
header(overview.getRange("A5:D5")); body(overview.getRange("A6:D13"), 9);

section(overview.getRange("E4:H4"), "结论先行");
overview.getRange("E5:H13").merge();
overview.getRange("E5:H13").values = [["现有数据只证实6条印度发运至中国的小包装PARENTEX间甲酚记录，以及369条受税来源发往印度的上游背景。B腿供应方FINAR/ACETO在A腿印度买方或供应方中均无重合；批号40338C309CW只见于4条对华B腿；无同提单、柜号或数量闭合。因此只能列B级调单线索，不能认定第三国绕道、走私或少缴税。"]];
overview.getRange("E5:H13").format = { fill: C.paleGold, font: { color: "#6B4E00", name: "Microsoft YaHei", size: 10 }, wrapText: true, verticalAlignment: "top", borders: { preset: "all", style: "thin", color: "#E0C15A" } };

section(overview.getRange("A15:H15"), "关键路线与调证优先级");
overview.getRange("A16:H16").values = [["路线/对象", "记录", "数量/金额口径", "证据等级", "已证实", "未证实", "最先调取", "风险判断"]];
header(overview.getRange("A16:H16"));
overview.getRange("A17:H21").values = [
  ["FINAR/ACETO→RON PHARM上海", "6条", "数量5.90；金额11,073.50；含ml/L且币种未载", "B", "印度发华B腿、PARENTEX和具体批号", "受税来源、法定原产、未缴税", "中国报关/税单、COA、CO、FINAR/ACETO批次记录", "最高具体核单线索"],
  ["Sasol US→VDH India", "VDH买方92条", "数量字段2,310,872.03；单位待原单", "B", "美国大宗间甲酚进入印度", "对应中国B腿", "VDH许可、BOM、精馏工单、库存和销售批号", "高结构风险，无闭环"],
  ["LANXESS Germany→India", "58条（归一主体）", "数量字段1,076,240", "B-", "集团商业链", "印度原产/绕道", "生产厂、批号、CO及去向", "销售实体不等于生产地"],
  ["南非/印度泛称CRESOLS→中国", "3个唯一", "南非各27,420；印度30,220", "C", "对华泛称路线", "是否为间甲酚", "CAS、COA、异构体、报关规格", "不计入风险量"],
  ["措施状态", "2021-01-15—2026-01-14", "到期后原则上不再算本项AD", "法律核验", "无复审/续征公告", "网页总表为何仍保留", "单一窗口税费参数/属地海关答复", "历史期核税优先"],
];
body(overview.getRange("A17:H21"), 9); overview.getRange("A17:H21").format.rowHeightPx = 62;

section(overview.getRange("A23:H23"), "历史税率与条件性税差系数");
overview.getRange("A24:H24").values = [["原产地/企业", "AD税率", "AD引致VAT", "综合增量系数", "适用时段", "现有金额能否计税", "必须基数", "备注"]];
header(overview.getRange("A24:H24"));
overview.getRange("A25:H28").values = [
  ["美国全部企业", 1.317, "AD×13%", 1.48821, "至2026-01-14", "不能", "中国海关审定完税价格", "含Sasol"],
  ["LANXESS Deutschland", 0.279, "AD×13%", 0.31527, "至2026-01-14", "不能", "中国海关审定完税价格", "列名企业"],
  ["其他欧盟/英国", 0.495, "AD×13%", 0.55935, "至2026-01-14", "不能", "中国海关审定完税价格", "按生产商/原产核"],
  ["日本全部企业", 0.548, "AD×13%", 0.61924, "至2026-01-14", "不能", "中国海关审定完税价格", "含Mitsui/Honshu"],
];
body(overview.getRange("A25:H28"), 9); overview.getRange("B25:B28").format.numberFormat = "0.0%"; overview.getRange("D25:D28").format.numberFormat = "0.000%";
overview.getRange("A30:H32").merge(); overview.getRange("A30:H32").values = [["严格边界：数量字段跨L、ML、kg、桶/件等口径，金额字段跨币种且不是中国完税价格；不得合并写成吨数或人民币/美元，也不得据此计算实际少缴税。2026-01-15后的贸易原则上不再产生本项反倾销税差。"]];
overview.getRange("A30:H32").format = { fill: C.paleRed, font: { color: "#8B1E1E", name: "Microsoft YaHei", italic: true }, wrapText: true, verticalAlignment: "center", borders: { preset: "all", style: "thin", color: "#E6A6A1" } };
for (const [c,w] of [["A",23],["B",18],["C",25],["D",18],["E",29],["F",26],["G",36],["H",29]]) overview.getRange(`${c}1:${c}32`).format.columnWidth = w;
overview.freezePanes.freezeRows(2);

const headers = ["记录ID","原表行","全字段签名","数据源","进出口","日期","HS编码","商品描述","采购商/收货方","供应商/发货方","重量字段","数量字段","金额字段","目的国","平台原产字段","重量数值","数量数值","金额数值","产品分类","范围判定","范围理由","路线","证据等级","路线理由","完全同值次数","疑似完全重复"];
function ledgerRow(r) {
  return [s(r.record_id),n(r.excel_row),s(r.visible_signature),s(r.data_feed),s(r.trade_direction),s(r.date),s(r.hs_code),s(r.description),s(r.buyer_or_consignee),s(r.seller_or_shipper),s(r.weight_field),s(r.quantity_field),s(r.amount_field),s(r.destination),s(r.platform_origin),n(r.weight_num),n(r.quantity_num),n(r.amount_num),s(r.product_class),s(r.scope_screen),s(r.scope_reason),s(r.route),s(r.evidence_grade),s(r.route_reason),n(r.visible_signature_count),s(r.possible_exact_duplicate)];
}
function buildLedger(sheet, rows, tableName, rowHeight = 42) {
  sheet.showGridLines = false;
  const data = [headers, ...rows.map(ledgerRow)];
  sheet.getRangeByIndexes(0,0,data.length,headers.length).values = data;
  header(sheet.getRangeByIndexes(0,0,1,headers.length));
  if (rows.length) {
    body(sheet.getRangeByIndexes(1,0,rows.length,headers.length), rows.length > 1000 ? 8 : 9);
    if (rows.length <= 500) sheet.getRangeByIndexes(1,0,rows.length,headers.length).format.rowHeightPx = rowHeight;
    sheet.getRangeByIndexes(1,15,rows.length,3).format.numberFormat = "#,##0.00";
    sheet.tables.add(`A1:Z${data.length}`, true, tableName).style = "TableStyleMedium2";
  }
  sheet.freezePanes.freezeRows(1); sheet.freezePanes.freezeColumns(7);
  const widths = [21,9,18,14,9,12,14,66,34,34,13,13,15,12,16,13,13,15,19,16,44,24,15,46,12,12];
  for (let i=0;i<widths.length;i++) sheet.getRangeByIndexes(0,i,data.length,1).format.columnWidth = widths[i];
}
buildLedger(china, chinaRows, "MCChina6", 60);
buildLedger(chinaGeneric, genericRows, "MCChinaGeneric3", 60);
buildLedger(aIndia, aIndiaRows, "MCTaxedToIndia369", 52);
buildLedger(explicit, explicitRows, "MCExplicit1259");
buildLedger(allRows, records, "MCAll7072");
buildLedger(duplicates, duplicateRows, "MCDuplicates");

policy.showGridLines = false;
title(policy, "A1:D1", "间甲酚｜政策、原产地与调证清单");
policy.getRange("A3:D3").values = [["模块","事实/规则","本项应用","下一步"]]; header(policy.getRange("A3:D3"));
const policyRows = [
  ["措施期限","2021-01-15起5年；公开未见期终复审立案/续征公告","公开法律记录支持2026-01-15起终止；网页总表状态冲突","执法定案前核单一窗口和税款书"],
  ["范围","m-/meta-cresol、3-methylphenol、CAS108-39-4；中国29071211","国外HS290712宽池不能替代产品范围","逐票核CAS/COA/规格申报"],
  ["原产地","两国以上生产看最后实质性改变；分装/换标不改变原产","印度既有真实产能又有受税来源原料输入","核原料税目、BOM、成本、工单、收率、能耗"],
  ["FINAR/ACETO","PARENTEX产品线及RON PHARM分销关系成立","正常药用/实验室分销是合理替代解释","核40338C309CW批次生产厂和CO"],
  ["VDH","印度有历史许可产能；易迅又见Sasol US大宗输入","真实生产与进口加工风险并存","核当前CTO、原料/成品质量平衡和中国去向"],
  ["Mitsui/LANXESS区域实体","印度/新加坡/亚洲主体可能是销售公司","发货/开票国不等于生产原产","核plant code、CO、厂家声明"],
  ["证据升级","A=双段同批提单+中国报关/税单；B=具体B腿/实体链；C=品类国别","当前最高B，0条同批闭环","不得写具体企业走私/逃税"],
  ["补查时间","缺2021-01-15—2022-12-31；到期后数据不完整","历史措施前半段仍有盲区","按HS+8组别名/CAS补全页"],
  ["匹配","30/45/60日、数量±1%—3%，叠加牌号/纯度/批号/柜号/PO","仅同HS或同国家不升级","先从6条B腿反查供应方与批号"],
  ["税差","AD=中国完税价×税率；VAT差=AD×13%","易迅金额字段不可代替完税价","调中国报关/缴款书后再测算"],
];
policy.getRange(`A4:D${3+policyRows.length}`).values = policyRows; body(policy.getRange(`A4:D${3+policyRows.length}`), 9); policy.getRange(`A4:D${3+policyRows.length}`).format.rowHeightPx = 64;
for (const [c,w] of [["A",25],["B",62],["C",58],["D",58]]) policy.getRange(`${c}1:${c}${3+policyRows.length}`).format.columnWidth = w;
policy.freezePanes.freezeRows(3);

const output = await SpreadsheetFile.exportXlsx(wb);
await output.save(outPath);
console.log(JSON.stringify({ outPath, all: records.length, unique: uniqueRows.length, explicit: explicitRows.length, china: chinaRows.length, aIndia: aIndiaRows.length }, null, 2));
