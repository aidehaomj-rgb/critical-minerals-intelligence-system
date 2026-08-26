import fs from "node:fs/promises";
import { Workbook, SpreadsheetFile } from "@oai/artifact-tool";

const dir = "D:/易迅数据/反倾销税深度分析报告/08_酞菁类颜料";
const records = JSON.parse(await fs.readFile(`${dir}/酞菁类颜料_易迅逐票标准化.json`, "utf8"));
const audit = JSON.parse(await fs.readFile(`${dir}/酞菁类颜料_全量阶段审计.json`, "utf8"));
const outPath = `${dir}/酞菁类颜料_易迅逐票判定台账_阶段审计.xlsx`;
const qaDir = `${dir}/QA_工作簿预览`;
await fs.mkdir(qaDir, { recursive: true });

const wb = Workbook.create();
const overview = wb.worksheets.add("概览");
const bLeg = wb.worksheets.add("越南对华31票");
const aLeg = wb.worksheets.add("印度至越南A腿候选");
const ledger = wb.worksheets.add("全部逐票记录");
const duplicates = wb.worksheets.add("可见字段重复审计");
const policy = wb.worksheets.add("政策口径与取证");

const navy = "#17324D";
const blue = "#1F4E78";
const paleBlue = "#EAF2F8";
const paleGold = "#FFF4CC";
const paleRed = "#FCE8E6";
const paleGreen = "#E6F4EA";
const paleGray = "#F3F5F7";
const border = "#D6DEE6";

function s(v) { return v === null || v === undefined ? "" : String(v); }
function n(v) { const x = Number(v); return Number.isFinite(x) ? x : null; }
function title(sheet, range, value) {
  const r = sheet.getRange(range); r.merge(); r.values = [[value]];
  r.format = { fill: navy, font: { bold: true, color: "#FFFFFF", size: 18, name: "Microsoft YaHei" }, verticalAlignment: "center" };
  r.format.rowHeightPx = 42;
}
function header(range) {
  range.format = { fill: blue, font: { bold: true, color: "#FFFFFF", name: "Microsoft YaHei" }, wrapText: true, verticalAlignment: "center", borders: { preset: "all", style: "thin", color: border } };
  range.format.rowHeightPx = 34;
}
function section(range, value) {
  range.merge(); range.values = [[value]];
  range.format = { fill: paleBlue, font: { bold: true, color: navy, name: "Microsoft YaHei" }, verticalAlignment: "center" };
  range.format.rowHeightPx = 28;
}
function body(range, size = 9) {
  range.format = { wrapText: true, verticalAlignment: "top", font: { name: "Microsoft YaHei", size }, borders: { preset: "all", style: "thin", color: border } };
}

const d = audit.downstream_findings;
const u = audit.upstream_findings;
const e = audit.specific_entity_leads;

overview.showGridLines = false;
title(overview, "A1:H1", "酞菁类颜料反倾销税与第三国转运风险核查（阶段审计）");
overview.getRange("A2:H2").merge();
overview.getRange("A2:H2").values = [["措施：2023-02-27生效｜受税来源：印度｜HS 32041700、32129000｜本台账已逐行审计现有两组PHTHALOCYANINE查询，但尚缺措施税号和扩展关键词全页查询，不能标记为最终完成。"]];
overview.getRange("A2:H2").format = { fill: paleGold, font: { bold: true, color: "#6B4E00", name: "Microsoft YaHei" }, wrapText: true };

section(overview.getRange("A4:D4"), "数据完整性");
overview.getRange("A5:D10").values = [
  ["项目", "页面出现", "可见字段唯一", "审计结论"],
  ["PHTHALOCYANINE→中国", audit.queries.downstream.raw_occurrences, audit.queries.downstream.exact_visible_signatures, "129条逐行读取；1个额外完全相同可见记录"],
  ["印度→越南PHTHALOCYANINE", audit.queries.upstream.raw_occurrences, audit.queries.upstream.exact_visible_signatures, "200+15两页完整拼接；7个额外完全相同可见记录"],
  ["两组查询合计", records.length, new Set(records.map(r => r.visible_signature)).size, "不同路线不得把数量/金额直接相加"],
  ["当前日期范围", "2025-08-07", "2026-06-26", "现有数据约近一年"],
  ["未完成口径", "HS32041700/32129000", "扩展关键词+企业反查", "待下一轮易迅补查后定稿"],
];
header(overview.getRange("A5:D5")); body(overview.getRange("A6:D10"), 10);

section(overview.getRange("E4:H4"), "结论先行");
overview.getRange("E5:H10").merge();
overview.getRange("E5:H10").values = [["已证实：印度同期向越南供应同类酞菁产品，越南又有31条对华记录在货描中标#&VN，数量字段合计903,600；供应和接收主体已具体化。尚未证实：同一货物的印度A腿—越南加工/库存—中国B腿尚无税号、箱号或申报单闭环，中国进口端是否申报越南原产、是否漏缴反倾销税也未知。因此只能列高优先核查线索，不能写成已查实逃税。"]];
overview.getRange("E5:H10").format = { fill: paleRed, font: { color: "#8B1E1E", name: "Microsoft YaHei", size: 10 }, wrapText: true, verticalAlignment: "top", borders: { preset: "all", style: "thin", color: "#E6A6A1" } };

section(overview.getRange("A12:H12"), "路线与数量（数量、金额沿用平台字段）");
overview.getRange("A13:H13").values = [["路线", "记录", "可见唯一", "数量字段", "金额字段", "币种/单位限制", "证据等级", "当前结论"]];
header(overview.getRange("A13:H13"));
overview.getRange("A14:H18").values = [
  ["印度→中国直接贸易", d.india_direct.records, d.india_direct.exact_visible_signatures, d.india_direct.quantity_field_sum, d.india_direct.amount_field_sum, "印度出口侧通常kg/USD；须原申报确认", "直接核税", "不属于第三国绕道，核生产商税率和缴款书"],
  ["越南→中国#&VN B腿", d.vietnam_to_china_hash_vn.records, d.vietnam_to_china_hash_vn.records, d.vietnam_to_china_hash_vn.quantity_field_sum, d.vietnam_to_china_hash_vn.amount_field_sum, "越南侧通常kg/VND；本地JSON未单列币种", "B+", "具体B腿成立；原产和中国端税款未闭合"],
  ["越南→中国#&DE", d.vietnam_to_china_hash_de.records, d.vietnam_to_china_hash_de.records, d.vietnam_to_china_hash_de.quantity_field_sum, d.vietnam_to_china_hash_de.amount_field_sum, "同上", "B", "德国标记，排除出印度绕道数量"],
  ["印度→越南（印度出口侧）", u.india_export_perspective.records, "—", u.india_export_perspective.quantity_field_sum, u.india_export_perspective.amount_field_sum, "通常kg/USD；与越南进口镜像不可相加", "B", "印度供应同类产品的A腿视角"],
  ["印度→越南（越南进口侧）", u.vietnam_import_perspective.records, "—", u.vietnam_import_perspective.quantity_field_sum, u.vietnam_import_perspective.amount_field_sum, "通常kg/VND；与印度出口镜像不可相加", "B", "越南接收印度同类产品的A腿视角"],
];
body(overview.getRange("A14:H18")); overview.getRange("B14:E18").format.numberFormat = "#,##0.00";

section(overview.getRange("A20:H20"), "高优先实体");
overview.getRange("A21:H21").values = [["实体/角色", "记录", "数量字段", "金额字段", "方向", "具体事实", "不能越界", "最小取证"]];
header(overview.getRange("A21:H21"));
overview.getRange("A22:H26").values = [
  ["Vinh Gia（越南出口商）", e.vinh_gia_b_leg.records, e.vinh_gia_b_leg.quantity_field_sum, e.vinh_gia_b_leg.amount_field_sum, "越南→中国", "29条；27条绿、2条蓝；官网自称贸易公司及集团工厂网络", "集团网络不证明印度原料或规避", "税号3703186307、购料发票、BOM、能耗、生产批次、CO"],
  ["Yicai（越南出口商）", e.yicai_b_leg.records, e.yicai_b_leg.quantity_field_sum, e.yicai_b_leg.amount_field_sum, "越南→中国", "2条同系列G070、各48,000", "登记制造不等于已证明本票实质加工", "工厂台账、原料进口/境内采购、批号和库存"],
  ["东莞成瀚（中国接收方）", 20, 495600, 71623166040, "越南→中国", "31条#&VN中的20条", "仅贸易数据不能证明进口申报产地", "中国报关单、原产地证、缴款书、进口口岸"],
  ["湖南亿高（中国接收方）", 11, 408000, 57914808720, "越南→中国", "31条#&VN中的11条；公开登记偏贸易/销售", "不能因公司年轻或贸易属性推定违法", "同上；另核最终客户及仓储流向"],
  ["V. G. CO. LTD.（简称候选）", e.vg_co_ltd_a_leg_abbreviation_candidate.records, e.vg_co_ltd_a_leg_abbreviation_candidate.quantity_field_sum, e.vg_co_ltd_a_leg_abbreviation_candidate.amount_field_sum, "印度→越南", "Suyog供应VEEFAST BLUE，2025-10/12两批", "名称、牌号和数量不闭合，不得等同Vinh Gia", "原越南进口申报的税号、地址、提单收货人"],
];
body(overview.getRange("A22:H26")); overview.getRange("B22:D26").format.numberFormat = "#,##0.00";

section(overview.getRange("A28:H28"), "31条#&VN的条件税负情景（不是欠税认定）");
overview.getRange("A29:H29").values = [["税档情景", "AD税率", "金额字段代理", "条件AD", "连带VAT差额", "条件合计", "适用前提", "结论"]];
header(overview.getRange("A29:H29"));
const taxRows = audit.conditional_tax_scenarios_for_31_hash_vn_records.map(x => [
  x.ad_rate === 0.119 ? "Ramdev" : x.ad_rate === 0.141 ? "Dhanveen" : x.ad_rate === 0.187 ? "Meghmani" : x.ad_rate === 0.16 ? "其他配合调查企业" : "其他印度企业",
  x.ad_rate, x.amount_field_proxy, x.conditional_antidumping_duty, x.conditional_import_vat_delta, x.conditional_total_increment,
  "实际印度原产+税档正确+金额可代理完税价+中国端未征税", "仅同币种风险情景"
]);
overview.getRange(`A30:H${29 + taxRows.length}`).values = taxRows; body(overview.getRange(`A30:H${29 + taxRows.length}`));
overview.getRange(`B30:B${29 + taxRows.length}`).format.numberFormat = "0.0%";
overview.getRange(`C30:F${29 + taxRows.length}`).format.numberFormat = "#,##0.00";
overview.getRange("A36:H37").merge(); overview.getRange("A36:H37").values = [["金额字段来自越南数据，本地JSON未显式列币种；报告仅按越南盾情景展示。正式追税必须使用中国海关审定完税价格。若中国端已申报印度原产并缴税，或越南生产确已完成非优惠原产地意义上的实质性改变，则不存在上述税差。"]];
overview.getRange("A36:H37").format = { fill: paleGold, font: { italic: true, color: "#6B4E00", name: "Microsoft YaHei" }, wrapText: true, verticalAlignment: "top", borders: { preset: "all", style: "thin", color: "#E0C15A" } };
for (const [c,w] of [["A",28],["B",14],["C",16],["D",19],["E",22],["F",33],["G",31],["H",45]]) overview.getRange(`${c}1:${c}37`).format.columnWidth = w;
overview.freezePanes.freezeRows(2);

const headers = ["记录ID","查询","原行","可见签名","同签名次数","可能重复","数据源","方向","日期","HS","商品描述","买方/收货人","卖方/发货人","重量","数量","金额","目的地","平台来源","#&尾标","产品分类","范围筛查","范围依据","路线","证据等级","路线依据","数量口径","金额口径"];
function row(r) { return [s(r.record_id),s(r.query_name),n(r.query_row),s(r.visible_signature),n(r.visible_signature_count),s(r.possible_visible_duplicate),s(r.data_feed),s(r.trade_direction),s(r.date),s(r.hs_code),s(r.description),s(r.buyer_or_consignee),s(r.seller_or_shipper),n(r.weight_num),n(r.quantity_num),n(r.amount_num),s(r.destination),s(r.platform_origin),s(r.tail_origin_marker),s(r.product_class),s(r.scope_screen),s(r.scope_reason),s(r.route),s(r.evidence_grade),s(r.route_reason),s(r.quantity_basis),s(r.amount_basis)]; }
function buildLedger(sheet, rows, tableName) {
  sheet.showGridLines = false;
  sheet.getRange(`A1:AA${rows.length + 1}`).values = [headers, ...rows.map(row)];
  header(sheet.getRange("A1:AA1"));
  sheet.tables.add(`A1:AA${rows.length + 1}`, true, tableName).style = "TableStyleMedium2";
  body(sheet.getRange(`A2:AA${rows.length + 1}`));
  sheet.getRange(`N2:P${rows.length + 1}`).format.numberFormat = "#,##0.00";
  sheet.getRange(`A2:AA${rows.length + 1}`).format.rowHeightPx = 54;
  sheet.freezePanes.freezeRows(1); sheet.freezePanes.freezeColumns(10);
  const widths=[18,30,9,18,11,11,14,9,12,15,70,35,36,12,14,19,12,14,10,18,18,46,32,11,50,42,42];
  for(let i=0;i<widths.length;i++) sheet.getRangeByIndexes(0,i,rows.length+1,1).format.columnWidth=widths[i];
}

const bRows = records.filter(r => r.route === "越南→中国B腿（#&VN）");
const aRows = records.filter(r => r.query_name.includes("印度→越南") && r.scope_screen !== "倾向范围外");
const dupRows = records.filter(r => r.visible_signature_count > 1);
buildLedger(bLeg, bRows, "PhthaloVietnamChinaB");
buildLedger(aLeg, aRows, "PhthaloIndiaVietnamA");
buildLedger(ledger, records, "PhthaloAllRecords");
buildLedger(duplicates, dupRows, "PhthaloVisibleDuplicates");

policy.showGridLines = false;
title(policy, "A1:D1", "政策口径、公开实体证据与最小取证清单");
policy.getRange("A3:D3").values = [["类别","规则/事实","本案应用","来源/取证"]]; header(policy.getRange("A3:D3"));
const policyRows = [
  ["措施范围","原产印度的酞菁类颜料，无论是否精制及/或颜料化；HS32041700、32129000","31条#&VN为酞菁蓝/绿范围候选，但来源须核","商务部公告2023年第8号及最终裁定"],
  ["税率","Ramdev 11.9%；Dhanveen 14.1%；Meghmani 18.7%；其他配合16.0%；其他印度30.7%","必须以真实印度生产商匹配税档","商务部公告附件2"],
  ["税款公式","AD=海关审定完税价格×税率；VAT计税基础包含AD","漏AD时连带VAT差额=AD×13%","商务部公告；中国进口增值税一般货物税率"],
  ["非优惠原产地","多国生产以最后实质性改变地为原产地；第32章适用“使用本四位税目外原料制成，或本地增值≥30%”","若印度3204酞菁粗品在越南处理后仍为3204，税目改变路径不成立，但满足≥30%仍可能取得越南原产；为规避反倾销而加工可被海关不予考虑","国务院令416号第2/3/10条；海关总署令273号及清单"],
  ["Vinh Gia官网","地址与税号3703186307登记一致；自称贸易公司、通过中国和越南关联工厂生产masterbatch并利用多项FTA出口","证明集团网络和masterbatch加工能力，但现有B腿申报为酞菁颜料粉末，不能由masterbatch能力推定其已完成本票酞菁生产或实质改变","vietmasterbatch.com；越南企业登记聚合页"],
  ["Yicai","公开资料称从事塑料制品制造；现有两条G070对华记录各48,000","需核本票是否由其生产、原料来自何处及是否完成实质改变","公司资料与贸易聚合页；仍需官方登记/生产台账"],
  ["V.G.简称候选","8条/14,500印度蓝颜料A腿，收货人仅写V. G. CO. LTD.","名称相似但无法等同Vinh Gia；先调越南进口申报税号","原始易迅记录"],
  ["中国接收方","东莞成瀚20条/495,600；湖南亿高11条/408,000","优先调两主体的进口报关单、缴款书与最终流向","原始易迅记录；公开贸易/企业资料"],
  ["B腿连续性","公开聚合页显示G070/150030越南→中国至少从2023年持续出现","说明路线持续存在，但非一手且无法替代完整易迅/海关查询","Volza/Eximpedia公开样本"],
  ["尚未发现","未找到官方反规避调查、原产地伪报处罚、法院判决或闭合双段提单","不得写成已查实绕道逃税","截至2026-08-13公开检索"],
  ["最小取证1","中国进口报关单+税款缴款书","确认原产国、启运国、生产商、税率、是否缴AD","东莞成瀚、湖南亿高逐票"],
  ["最小取证2","越南进口申报+出口申报+原产地证","核V.G./Vinh Gia税号、印度原料、贸易方式及原产资格","越南申报号、税号、签证依据"],
  ["最小取证3","BOM、原料领用、能耗、批记录、库存核销、国内购料发票","判断越南是否真实生产及实质性改变","Vinh Gia关联工厂、Yicai、Yeong Shing"],
  ["最小取证4","提单、箱号、封志、船名航次、包装和批号","把印度A腿与中国B腿做票级物理闭环","同一批次时间/数量/箱号比对"],
  ["查询缺口","HS32041700/32129000和PB15/PG7/CAS/CRUDE扩展词尚未全页查询","本工作簿为阶段审计；补查后覆盖更新","下一轮易迅任务"],
];
policy.getRange(`A4:D${3 + policyRows.length}`).values = policyRows; body(policy.getRange(`A4:D${3 + policyRows.length}`), 9);
policy.getRange(`A4:D${3 + policyRows.length}`).format.rowHeightPx = 64;
for (const [c,w] of [["A",22],["B",59],["C",66],["D",61]]) policy.getRange(`${c}1:${c}${3 + policyRows.length}`).format.columnWidth = w;
policy.freezePanes.freezeRows(3);

const previews = [
  { sheet: "概览", range: "A1:H37" },
  { sheet: "越南对华31票", range: "A1:AA18" },
  { sheet: "印度至越南A腿候选", range: "A1:AA18" },
  { sheet: "政策口径与取证", range: `A1:D${3 + policyRows.length}` },
];
const inspections = [];
for (const p of previews) {
  const check = await wb.inspect({ kind: "table", sheetId: p.sheet, range: p.range, include: "values,formulas", tableMaxRows: 45, tableMaxCols: 30, maxChars: 24000 });
  inspections.push(check.ndjson);
  const image = await wb.render({ sheetName: p.sheet, range: p.range, scale: 1.0, format: "png" });
  await fs.writeFile(`${qaDir}/${p.sheet}.png`, new Uint8Array(await image.arrayBuffer()));
}
const errors = await wb.inspect({ kind: "match", searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A", options: { useRegex: true, maxResults: 300 }, summary: "final formula error scan" });
await fs.writeFile(`${qaDir}/inspect.txt`, inspections.join("\n") + "\nERRORS\n" + errors.ndjson, "utf8");
const output = await SpreadsheetFile.exportXlsx(wb);
await output.save(outPath);
console.log(JSON.stringify({ outPath, records: records.length, bRows: bRows.length, aRows: aRows.length, duplicateRows: dupRows.length, errorScan: errors.ndjson }, null, 2));
