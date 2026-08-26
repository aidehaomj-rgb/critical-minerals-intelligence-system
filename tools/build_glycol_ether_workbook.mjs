import fs from "node:fs/promises";
import path from "node:path";
import { Workbook, SpreadsheetFile } from "@oai/artifact-tool";

const dir = process.env.GLYCOL_OUT_DIR || "D:/易迅数据/反倾销税深度分析报告/09_乙二醇和丙二醇的单烷基醚";
const records = JSON.parse(await fs.readFile(path.join(dir, "单烷基醚_易迅逐票标准化.json"), "utf8"));
const audit = JSON.parse(await fs.readFile(path.join(dir, "单烷基醚_全量阶段审计.json"), "utf8"));
const outPath = path.join(dir, "单烷基醚_易迅逐票判定台账_阶段审计.xlsx");
const qaDir = path.join(dir, "QA_工作簿预览");
await fs.mkdir(qaDir, { recursive: true });

const wb = Workbook.create();
const overview = wb.worksheets.add("概览");
const inScope = wb.worksheets.add("明确范围内18条");
const pending = wb.worksheets.add("范围待CAS4条");
const allRows = wb.worksheets.add("全部84条");
const dup = wb.worksheets.add("重复与同票审计");
const keys = wb.worksheets.add("重点调单键值");
const policy = wb.worksheets.add("政策范围与取证");

const navy = "#17324D", blue = "#1F4E78", paleBlue = "#EAF2F8";
const paleGold = "#FFF4CC", paleRed = "#FCE8E6", paleGreen = "#E6F4EA";
const border = "#D6DEE6", ink = "#102A43";

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

const q = audit.query;
const scope = audit.scope_screen_exact_unique;
const definite = audit.definite_in_scope_range;

overview.showGridLines = false;
title(overview, "A1:H1", "乙二醇和丙二醇单烷基醚｜反倾销税与第三国转运风险阶段审计");
overview.getRange("A2:H2").merge();
overview.getRange("A2:H2").values = [["措施：2022-01-11起对美国原产货征反倾销税｜Dow 57.4%，其他美国公司65.3%｜本台账对现有GLYCOL ETHER查询84条逐行判定；尚缺税号、20项具体品名/CAS/品牌及美国A腿全页补查。"]];
overview.getRange("A2:H2").format = { fill: paleGold, font: { bold: true, color: "#6B4E00", name: "Microsoft YaHei" }, wrapText: true };

section(overview.getRange("A4:D4"), "数据完整性");
overview.getRange("A5:D10").values = [
  ["项目", "数值", "口径", "结论"],
  ["分页", "20+20+20+20+4", "5页", "与all84逐行一致，无跨页漏接/错序"],
  ["原始出现", q.raw_occurrences, "页面行", "全部目的国China"],
  ["可见字段唯一", q.exact_visible_unique, "精确重复后", "3个完全重复组"],
  ["保守商业组", q.conservative_commercial_groups, "再折叠高概率同票", "仍保留原始行与候选分组"],
  ["日期覆盖", q.date_min, q.date_max, "现有近一年数据的实际覆盖"],
];
header(overview.getRange("A5:D5")); body(overview.getRange("A6:D10"), 10);

section(overview.getRange("E4:H4"), "结论先行");
overview.getRange("E5:H10").merge();
overview.getRange("E5:H10").values = [["明确范围内：20次原始出现、18条可见唯一；美国直达5条/重量字段114,366.02，德国B腿13条/259,382。比利时4条/95,177仅写通用品名或ISOPROPYL GLYCOL ETHER，须CAS。最大纠偏：沙特15条/489,457.68是公告明确排除的乙二醇/二乙二醇单丁醚；越南28条是PTMEG聚合物，也全部排除。现有证据没有美国→德国A腿，也没有中国报关原产国和税单，故第三国绕道及少缴税均未证实。"]];
overview.getRange("E5:H10").format = { fill: paleRed, font: { color: "#8B1E1E", name: "Microsoft YaHei", size: 10 }, wrapText: true, verticalAlignment: "top", borders: { preset: "all", style: "thin", color: "#E6A6A1" } };

section(overview.getRange("A12:H12"), "逐条产品范围纠偏");
overview.getRange("A13:H13").values = [["分类", "原始/唯一", "记录或字段量", "主要产品", "路线", "证据等级", "为什么", "下一步"]];
header(overview.getRange("A13:H13"));
overview.getRange("A14:H20").values = [
  ["明确范围内", "20/18", scope.definite_in_scope.weight_field_sum, "DPnB、PnB、EGHE、PnP、DPnP", "美国直达+德国B腿", "A-核税/B+", "均命中公告20项具体产品", "查原产国、生产商和税单"],
  ["范围待CAS", "5/4", scope.pending_cas.weight_field_sum, "通用单烷基醚、异丙基乙二醇醚", "比利时B腿", "B/C", "简称不足以确认结构", "调CAS、SDS、TDS"],
  ["排除", "29/29", 721520, "PTMEG聚醚（越南28条）", "越南→中国", "OUT", "HS39072910/CAS25190-06-1，非小分子单烷基醚", "不纳入本案"],
  ["排除", "15/15", 489457.68, "乙二醇/二乙二醇单丁醚", "沙特→中国", "OUT", "公告明确排除；HS290943", "不纳入本案"],
  ["排除", "8/8", 212767.18, "PPh/EPh苯基醚", "美国→中国", "OUT", "phenyl为芳基，不是alkyl", "不纳入本案"],
  ["排除", "4+2+1", "—", "醋酸酯、氨基醚、DPM样品", "印度/印尼→中国", "OUT", "均不在公告具体清单", "不纳入本案"],
  ["关键结论", "—", "—", "真正的第三国B腿", "德国13条（唯一）", "仅线索", "无美国A腿、无中国税单", "补A腿和中国底单"],
];
body(overview.getRange("A14:H20")); overview.getRange("C14:C20").format.numberFormat = "#,##0.00";

section(overview.getRange("A22:H22"), "路线与数量（平台重量字段，不等于海关净重）");
overview.getRange("A23:H23").values = [["路线", "可见唯一", "保守商业组", "重量字段（唯一）", "重量字段（保守）", "当前产品范围", "能否证实绕道", "优先动作"]];
header(overview.getRange("A23:H23"));
overview.getRange("A24:H27").values = [
  ["美国→中国直达", definite.us_direct.exact_unique_records, definite.us_direct.conservative_records, definite.us_direct.exact_unique_weight_field_sum, definite.us_direct.conservative_weight_field_sum, "明确范围内", "不适用：这是直接进口", "查57.4% AD及其VAT差额是否已缴"],
  ["德国→中国B腿", definite.third_country_b_leg.exact_unique_records, definite.third_country_b_leg.conservative_records, definite.third_country_b_leg.exact_unique_weight_field_sum, definite.third_country_b_leg.conservative_weight_field_sum, "明确范围内", "否：无美国A腿", "以箱号/PO/LC反查CO和生产批次"],
  ["比利时→中国B腿", 4, 3, scope.pending_cas.weight_field_sum, 69622, "待CAS", "否：产品范围先未确认", "先调CAS/SDS，再查原产"],
  ["沙特/越南等", 44, "—", "—", "—", "已排除", "不纳入本案", "避免继续误报风险量"],
];
body(overview.getRange("A24:H27")); overview.getRange("B24:E27").format.numberFormat = "#,##0.00";

section(overview.getRange("A29:H29"), "税种与条件税差口径");
overview.getRange("A30:H30").values = [["税档", "AD税率", "AD引起的VAT差额", "合计系数", "现有金额", "可否算税额", "反补贴措施", "结论"]];
header(overview.getRange("A30:H30"));
overview.getRange("A31:H32").values = [
  ["The Dow Chemical Company", 0.574, "AD×13%", 0.64862, "直达5条均为空；德国一条金额333,488但币种不明", "不能", "16.8%补贴率但暂不实施", "只核AD及其连带VAT"],
  ["其他美国公司", 0.653, "AD×13%", 0.73789, "同上", "不能", "同上", "生产商未确认前只列税率情景"],
];
body(overview.getRange("A31:H32")); overview.getRange("B31:D32").format.numberFormat = "0.000%";
overview.getRange("A34:H36").merge(); overview.getRange("A34:H36").values = [["条件税差=海关审定完税价格×AD税率＋反倾销税×13%。德国记录只有一条金额字段333,488且无币种、无中国完税价；即使按Dow税档，216,306.99也只能是“同金额字段币种、完税价代理、美国原产、未缴税”四项同时成立时的示例，绝不是实际欠税。反补贴终裁明确暂不实施措施，禁止再加16.8%反补贴税。"]];
overview.getRange("A34:H36").format = { fill: paleGold, font: { italic: true, color: "#6B4E00", name: "Microsoft YaHei" }, wrapText: true, verticalAlignment: "top", borders: { preset: "all", style: "thin", color: "#E0C15A" } };
for (const [c,w] of [["A",26],["B",15],["C",18],["D",23],["E",26],["F",29],["G",32],["H",43]]) overview.getRange(`${c}1:${c}36`).format.columnWidth = w;
overview.freezePanes.freezeRows(2);

const headers = ["记录ID","原行","可见签名","同签名次数","完全重复","商业组","保守保留","数据源","方向","日期","HS","商品描述","中国方/第一主体","境外方/第二主体","重量字段","数量字段","金额字段","目的地","平台国家/原产字段","范围判定","产品分类","范围依据","路线","证据等级","路线依据","AD税率","条件AD","条件VAT差额","条件合计","箱号","封志","LC","PO","SO","服务合同","发货人参考","货描净重kg","货描港口"];
function row(r) { return [s(r.record_id),n(r.query_row),s(r.visible_signature),n(r.visible_signature_count),s(r.possible_exact_visible_duplicate),s(r.commercial_group_id),s(r.conservative_group_keep),s(r.data_feed),s(r.trade_direction),s(r.date),s(r.hs_code),s(r.description),s(r.buyer_or_consignee),s(r.seller_or_shipper),n(r.weight_num),n(r.quantity_num),n(r.amount_num),s(r.destination),s(r.platform_origin),s(r.scope_screen),s(r.product_class),s(r.scope_reason),s(r.route),s(r.evidence_grade),s(r.route_reason),n(r.conditional_ad_rate),n(r.conditional_ad_same_currency),n(r.conditional_vat_delta_same_currency),n(r.conditional_total_same_currency),s(r.container_numbers),s(r.seal_numbers),s(r.lc_numbers),s(r.po_numbers),s(r.so_numbers),s(r.service_contracts),s(r.shipper_references),s(r.description_net_weight_kg),s(r.ports_in_description)]; }
function buildLedger(sheet, rows, tableName) {
  sheet.showGridLines = false;
  const end = rows.length + 1;
  sheet.getRange(`A1:AL${end}`).values = [headers, ...rows.map(row)];
  header(sheet.getRange("A1:AL1"));
  sheet.tables.add(`A1:AL${end}`, true, tableName).style = "TableStyleMedium2";
  body(sheet.getRange(`A2:AL${end}`));
  sheet.getRange(`O2:AC${end}`).format.numberFormat = "#,##0.00";
  sheet.getRange(`A2:AL${end}`).format.rowHeightPx = 54;
  sheet.freezePanes.freezeRows(1); sheet.freezePanes.freezeColumns(11);
  const widths=[19,8,18,10,10,24,10,13,9,12,14,70,34,34,13,13,16,11,15,15,22,42,28,11,48,11,16,16,16,18,16,22,30,18,18,25,18,22];
  for(let i=0;i<widths.length;i++) sheet.getRangeByIndexes(0,i,end,1).format.columnWidth=widths[i];
}
buildLedger(inScope, records.filter(r => r.scope_screen === "明确范围内"), "GlycolDefiniteScope");
buildLedger(pending, records.filter(r => r.scope_screen === "范围待CAS"), "GlycolPendingCAS");
buildLedger(allRows, records, "GlycolAll84");

const duplicateRows = records.filter(r => r.possible_exact_visible_duplicate || !String(r.commercial_group_id).startsWith("ROW-"));
buildLedger(dup, duplicateRows, "GlycolDuplicateAudit");

keys.showGridLines = false;
title(keys, "A1:H1", "重点调单键值｜德国对华B腿");
keys.getRange("A3:H3").values = [["日期","产品/路线","主体","重量","箱号/封志","合同与信用证","PO/SO/参考号","为什么优先"]]; header(keys.getRange("A3:H3"));
const keyRows = audit.priority_shipment_keys.map(x => [x.date, `${x.product}\n${x.route}`, x.parties, `平台${x.platform_weight_field}\n货描净重${x.description_net_weight_kg}kg`, [x.container,x.seal].filter(Boolean).join(" / ") || "—", [x.lc,x.service_contracts,x.references?.includes("service contract") ? x.references : ""].filter(Boolean).join("\n"), [x.po,x.so,x.references].filter(Boolean).join("\n"), x.reason]);
keys.getRange(`A4:H${3+keyRows.length}`).values = keyRows; body(keys.getRange(`A4:H${3+keyRows.length}`), 9);
keys.getRange(`A4:H${3+keyRows.length}`).format.rowHeightPx = 92;
for (const [c,w] of [["A",14],["B",28],["C",38],["D",20],["E",24],["F",34],["G",45],["H",50]]) keys.getRange(`${c}1:${c}${3+keyRows.length}`).format.columnWidth=w;
keys.getRange("A10:H12").merge(); keys.getRange("A10:H12").values = [["注意：BDP、Stolt、Newport在这些记录中更可能是货代/罐箱经营人，不应直接写成生产商。DOWANOL品牌和Dow Europe集团关系也不能证明美国原产。BASF德国N-Hexyl Glycol已有德国供应主体和当地生产链替代解释；最终须以CO、生产批次、工厂声明和中国报关单为准。"]];
keys.getRange("A10:H12").format = { fill: paleRed, font: { color: "#8B1E1E", name: "Microsoft YaHei" }, wrapText: true, verticalAlignment: "top", borders: { preset: "all", style: "thin", color: "#E6A6A1" } };

policy.showGridLines = false;
title(policy, "A1:D1", "政策范围、公开反证与最小取证清单");
policy.getRange("A3:D3").values = [["类别","规则/事实","本案应用","来源/取证"]]; header(policy.getRange("A3:D3"));
const policyRows = [
  ["措施范围","美国原产的20项乙二醇/丙二醇单烷基醚；HS29094400、29094990","必须命中具体产品，不能按GLYCOL ETHER宽词整体计入","商务部2022年第3号"],
  ["明确排除","乙二醇/二乙二醇单丁醚、丙二醇甲醚，以及公告清单外产品","沙特15条、越南PTMEG、PPh/EPh、醋酸酯、氨基醚、DPM均排除","公告具体产品表+Dow官方化学名"],
  ["反倾销税率","Dow 57.4%；其他美国公司65.3%","生产商与美国原产同时确认后才适用","商务部2022年第3号"],
  ["反补贴措施","终裁认定补贴率16.8%，但决定暂不实施反补贴措施","不得把16.8%加进风险税额","商务部2022年第4号"],
  ["德国当地生产反证","Dow Stade官方厂址资料列Dowanol产品；BASF SDS列N-Hexyl Glycol供应主体BASF SE Ludwigshafen","德国B腿可能为当地生产，不得因Dow品牌推定美国原产","Dow Stade fact sheet；BASF SDS"],
  ["沙特当地产业反证","Dow官网称沙特有Sadara等大型制造网络","且沙特15条本就属于公告排除品，不再进入本案路线","Dow Saudi Arabia官方页"],
  ["第三国链结论","德国13条范围内B腿成立；美国A腿为0条","当前仅能列原产地核查线索，不能称绕道","现有易迅84条全量审计"],
  ["中国端最小证据","进口报关单、CO、税款缴款书、生产商栏、完税价格/币种","核是否按美国原产和57.4%/65.3%缴AD","Nanjing Golden、Dow Shanghai、Polystar优先"],
  ["A/B物理闭环","美国出口+德国进口/再出口+中国进口三端申报；箱号、封志、批号、PO/LC、重量和日期","同箱/同批/同PO且原产冲突才能显著升级","先查MSKU510989-6和4组BDP单据"],
  ["查询缺口","HS29094400/29094990、20项品名/CAS、DOWANOL牌号和美国→德国A腿尚未全页","本工作簿是阶段审计，不是最终完成","下一轮易迅任务"],
];
policy.getRange(`A4:D${3+policyRows.length}`).values = policyRows; body(policy.getRange(`A4:D${3+policyRows.length}`), 9);
policy.getRange(`A4:D${3+policyRows.length}`).format.rowHeightPx = 66;
for (const [c,w] of [["A",24],["B",64],["C",69],["D",58]]) policy.getRange(`${c}1:${c}${3+policyRows.length}`).format.columnWidth=w;
policy.freezePanes.freezeRows(3);

const previews = [
  { sheet: "概览", range: "A1:H36" },
  { sheet: "明确范围内18条", range: "A1:AL19" },
  { sheet: "重点调单键值", range: "A1:H12" },
  { sheet: "政策范围与取证", range: `A1:D${3+policyRows.length}` },
];
const inspections = [];
for (const p of previews) {
  const check = await wb.inspect({ kind: "table", sheetId: p.sheet, range: p.range, include: "values,formulas", tableMaxRows: 45, tableMaxCols: 40, maxChars: 26000 });
  inspections.push(check.ndjson);
  const image = await wb.render({ sheetName: p.sheet, range: p.range, scale: 1.0, format: "png" });
  await fs.writeFile(path.join(qaDir, `${p.sheet}.png`), new Uint8Array(await image.arrayBuffer()));
}
const errors = await wb.inspect({ kind: "match", searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A", options: { useRegex: true, maxResults: 300 }, summary: "final formula error scan" });
await fs.writeFile(path.join(qaDir, "inspect.txt"), inspections.join("\n") + "\nERRORS\n" + errors.ndjson, "utf8");
const output = await SpreadsheetFile.exportXlsx(wb);
await output.save(outPath);
console.log(JSON.stringify({ outPath, records: records.length, definite: records.filter(r=>r.scope_screen==="明确范围内").length, pending: records.filter(r=>r.scope_screen==="范围待CAS").length, errorScan: errors.ndjson }, null, 2));
