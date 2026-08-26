import fs from "node:fs/promises";
import { Workbook, SpreadsheetFile } from "@oai/artifact-tool";

const dir = "D:/易迅数据/反倾销税深度分析报告/07_聚碳酸酯";
const records = JSON.parse(await fs.readFile(`${dir}/聚碳酸酯_易迅_HS390740_逐票标准化.json`, "utf8"));
const audit = JSON.parse(await fs.readFile(`${dir}/聚碳酸酯_易迅_HS390740_全量分析结果.json`, "utf8"));
const review = JSON.parse(await fs.readFile(`${dir}/聚碳酸酯_TW线索人工复核.json`, "utf8"));
const recovery = JSON.parse(await fs.readFile(`${dir}/聚碳酸酯_易迅_HS390740_缺页恢复候选.json`, "utf8"));
const outPath = `${dir}/聚碳酸酯_易迅逐票判定台账_阶段审计.xlsx`;
const qaDir = `${dir}/QA_工作簿预览`;
await fs.mkdir(qaDir, { recursive: true });

const wb = Workbook.create();
const overview = wb.worksheets.add("概览");
const leads = wb.worksheets.add("TW线索人工复核");
const ledger = wb.worksheets.add("HS逐票唯一记录");
const gap = wb.worksheets.add("缺页恢复候选");
const method = wb.worksheets.add("政策口径与取证");

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
function title(sheet, range, text) {
  const r = sheet.getRange(range); r.merge(); r.values = [[text]];
  r.format = { fill: navy, font: { bold: true, color: "#FFFFFF", size: 18, name: "Microsoft YaHei" }, verticalAlignment: "center" };
  r.format.rowHeightPx = 42;
}
function header(r) {
  r.format = { fill: blue, font: { bold: true, color: "#FFFFFF", name: "Microsoft YaHei" }, wrapText: true, verticalAlignment: "center", borders: { preset: "all", style: "thin", color: border } };
  r.format.rowHeightPx = 34;
}
function section(r, text) {
  r.merge(); r.values = [[text]];
  r.format = { fill: paleBlue, font: { bold: true, color: navy, name: "Microsoft YaHei" }, verticalAlignment: "center" };
  r.format.rowHeightPx = 28;
}

const sum = review.summary;
const producerScenarios = sum.producer_specific_tax_scenarios;
const trinseo = producerScenarios.find(x => x.producer_scenario.startsWith("Trinseo"));
const chimei = producerScenarios.find(x => x.producer_scenario.startsWith("奇美"));
const unknownMin = producerScenarios.find(x => x.producer_scenario === "待查" && x.ad_rate === 0.09);
const unknownMax = producerScenarios.find(x => x.producer_scenario === "待查" && x.ad_rate === 0.224);
const aggMin = trinseo.conditional_total + chimei.conditional_total + unknownMin.conditional_total;
const aggMax = trinseo.conditional_total + chimei.conditional_total + unknownMax.conditional_total;

overview.showGridLines = false;
title(overview, "A1:H1", "聚碳酸酯反倾销税与第三国转运风险核查（阶段审计）");
overview.getRange("A2:H2").merge();
overview.getRange("A2:H2").values = [["措施：2024-04-20生效｜受税来源：台湾地区｜HS 39074000｜本台账尚待补抓重复页造成的缺口、关键词查询及台湾A腿，不标记为最终完成"]];
overview.getRange("A2:H2").format = { fill: paleGold, font: { color: "#6B4E00", bold: true, name: "Microsoft YaHei" }, wrapText: true };

section(overview.getRange("A4:H4"), "数据完整性审计");
overview.getRange("A5:D12").values = [
  ["项目", "数量", "口径", "结论"],
  ["页面显示总数", sum.data_integrity.page_occurrences_claimed, "旧抓取14页槽位合计", "不能直接称2629条不同记录"],
  ["有效页面槽位", sum.data_integrity.effective_page_slots_after_removing_copied_page, "剔除整页复制的第7页", "第6/7页200行逐行相同"],
  ["精确唯一记录", sum.data_integrity.exact_unique_records, "跨现有页精确去重", "全部逐票进入“HS逐票唯一记录”"],
  ["缺页恢复候选", recovery.length, "备用旧抓取，筛选状态未完全固化", "仅用于重抓校验，不并入主计数"],
  ["缺页候选中的#&TW", recovery.filter(r => r.tail_origin_marker === "TW").length, "数量字段合计7,050", "待重抓确认"],
  ["当前日期覆盖", "2024-08-06—2026-06-30", "目的地均为China", "缺口约2025-06-17—08-15"],
  ["完成状态", "未完成", "HS缺页+关键词+A腿均待补", "旧报告“全页通过”结论废止"],
];
header(overview.getRange("A5:D5"));
overview.getRange("A6:D12").format = { wrapText: true, borders: { preset: "all", style: "thin", color: border }, font: { name: "Microsoft YaHei", size: 10 }, verticalAlignment: "top" };
overview.getRange("B6:B10").format.numberFormat = "#,##0";

section(overview.getRange("E5:H5"), "结论先行");
overview.getRange("E6:H12").merge();
overview.getRange("E6:H12").values = [[
  "已证实：越南对华记录中有17条货描保留#&TW，数量字段合计48,094；其中4条/3,294还引用越南前序进口申报或再出口信息，构成可追溯的台湾来源—越南—中国B腿线索。尚未证实：中国进口端把台湾原产改报为越南、漏缴反倾销税，或同一批次台湾A腿与中国B腿闭合。越南记录主动保留#&TW，也可能是合规申报的反证。"
]];
overview.getRange("E6:H12").format = { fill: paleGold, font: { color: "#5C4300", name: "Microsoft YaHei", size: 10 }, wrapText: true, verticalAlignment: "top", borders: { preset: "all", style: "thin", color: "#E0C15A" } };

section(overview.getRange("A14:H14"), "#&TW记录分拆与范围门槛");
overview.getRange("A15:H15").values = [["分组", "记录数", "数量字段", "金额字段", "范围结论", "主体/牌号", "证据级别", "下一步"]];
header(overview.getRange("A15:H15"));
overview.getRange("A16:H21").values = [
  ["全部可见#&TW B腿", 17, 48094, 6839076988.15, "不能整体认定涉税", "越南5组供应链", "B", "逐票TDS/COA+中国报关税单"],
  ["范围仍待核", 10, 41044, 5999245916.15, "须确认双酚A型PC≥99%", "EMERGE 38,425；U415 2,319；PC-6715VT 300", "B/B+", "生产商、色号配方、原产地和税单"],
  ["同色号范围外反证", 2, 1300, 169445560, "公开贸易货描显示PC90–98%+TiO2", "IC8800624/IC8800412", "C+", "调原始越南申报/TDS后排除或恢复"],
  ["PC合金", 4, 5350, 543148600, "PC/ABS，通常低于99%", "多主体", "C", "COA确认；低于99%排除"],
  ["非PC误归", 1, 400, 127236912, "PPA+50%GF，不是PC", "Nishoku链", "D", "核税号误用"],
  ["缺页备用#&TW", 3, 7050, 942257590, "尚未并入主计数", "EMERGE/SIL-MORE等", "待重抓", "以实时第7页复核"],
];
overview.getRange("A16:H21").format = { wrapText: true, verticalAlignment: "top", borders: { preset: "all", style: "thin", color: border }, font: { name: "Microsoft YaHei", size: 9 } };
overview.getRange("A16:H17").format.fill = paleRed;
overview.getRange("A18:H20").format.fill = paleGreen;
overview.getRange("B16:D21").format.numberFormat = "#,##0.00";

section(overview.getRange("A23:H23"), "条件税款暴露上限（不是欠税认定）");
overview.getRange("A24:H24").values = [["牌号/生产商情景", "记录", "数量字段", "金额代理", "AD税率", "条件AD", "条件VAT增量", "条件合计"]];
header(overview.getRange("A24:H24"));
overview.getRange("A25:H29").values = [
  ["EMERGE/Trinseo Taiwan", trinseo.records, trinseo.quantity_field_sum, trinseo.amount_field_proxy, trinseo.ad_rate, trinseo.conditional_ad, trinseo.conditional_vat_delta, trinseo.conditional_total],
  ["WONDERLITE PC-6715VT/奇美", chimei.records, chimei.quantity_field_sum, chimei.amount_field_proxy, chimei.ad_rate, chimei.conditional_ad, chimei.conditional_vat_delta, chimei.conditional_total],
  ["U415生产商待查—最低档情景", unknownMin.records, unknownMin.quantity_field_sum, unknownMin.amount_field_proxy, unknownMin.ad_rate, unknownMin.conditional_ad, unknownMin.conditional_vat_delta, unknownMin.conditional_total],
  ["U415生产商待查—最高档情景", unknownMax.records, unknownMax.quantity_field_sum, unknownMax.amount_field_proxy, unknownMax.ad_rate, unknownMax.conditional_ad, unknownMax.conditional_vat_delta, unknownMax.conditional_total],
  ["10条范围待核合计区间", 10, 41044, 5999245916.15, "按牌号推定", "—", "—", `${aggMin.toFixed(2)}—${aggMax.toFixed(2)}`],
];
overview.getRange("A25:H29").format = { wrapText: true, verticalAlignment: "top", borders: { preset: "all", style: "thin", color: border }, font: { name: "Microsoft YaHei", size: 9 } };
overview.getRange("C25:D29").format.numberFormat = "#,##0.00";
overview.getRange("E25:E28").format.numberFormat = "0.0%";
overview.getRange("F25:H28").format.numberFormat = "#,##0.00";
overview.getRange("A30:H31").merge();
overview.getRange("A30:H31").values = [["严格前提：仅当对应牌号双酚A型PC≥99%、生产商/税档推定正确、金额字段可作为同币种完税价格代理，且中国端未征反倾销税时成立。平台本地JSON未单列币种，严禁写成人民币或美元；正式追税必须使用中国海关审定完税价格。"]];
overview.getRange("A30:H31").format = { fill: paleGold, font: { color: "#6B4E00", italic: true, name: "Microsoft YaHei" }, wrapText: true, verticalAlignment: "top", borders: { preset: "all", style: "thin", color: "#E0C15A" } };
for (const [c,w] of [["A",24],["B",15],["C",16],["D",19],["E",31],["F",31],["G",14],["H",43]]) overview.getRange(`${c}1:${c}31`).format.columnWidth = w;
overview.freezePanes.freezeRows(2);

leads.showGridLines = false;
title(leads, "A1:S1", "台湾来源经越南对华线索逐票人工复核");
leads.getRange("A2:S2").merge();
leads.getRange("A2:S2").values = [["主抓取17条 + 缺页备用3条；数量和金额沿用平台字段。缺页备用记录不并入主计数。"]];
leads.getRange("A2:S2").format = { fill: paleGold, font: { color: "#6B4E00", name: "Microsoft YaHei" }, wrapText: true };
const leadRows = review.records;
const lh = ["状态","记录ID","日期","数据源","商品描述","中国方向主体","越南主体","重量","数量","金额","平台产地字段","货描尾码","初始分类","人工范围结论","范围依据","优先级","前序申报号","生产商/税档推定","建议动作"];
const ld = leadRows.map(r => [
  s(r.dataset_status),s(r.record_id),s(r.date),s(r.data_source),s(r.description),s(r.china_party),s(r.foreign_party),n(r.weight),n(r.quantity),n(r.amount),s(r.platform_origin),s(r.tail_origin_marker),s(r.scope_category),s(r.final_scope_screen),s(r.scope_basis),s(r.route_priority),Array.isArray(r.pre_entry_numbers)?r.pre_entry_numbers.join(";"):s(r.pre_entry_numbers),`${s(r.producer_inference)}｜${s(r.rate_basis)}`,s(r.recommended_action)
]);
leads.getRange(`A4:S${ld.length+4}`).values = [lh,...ld];
header(leads.getRange("A4:S4"));
leads.tables.add(`A4:S${ld.length+4}`, true, "PCTaiwanBLeads").style = "TableStyleMedium2";
leads.getRange(`A5:S${ld.length+4}`).format = { wrapText: true, verticalAlignment: "top", font: { name: "Microsoft YaHei", size: 9 } };
leads.getRange(`H5:J${ld.length+4}`).format.numberFormat = "#,##0.00";
leads.getRange(`A5:S${ld.length+4}`).format.rowHeightPx = 66;
leads.getRange(`N5:N${ld.length+4}`).conditionalFormats.add("containsText", {text:"范围待",format:{fill:paleRed,font:{bold:true,color:"#9B1C1C"}}});
leads.getRange(`N5:N${ld.length+4}`).conditionalFormats.add("containsText", {text:"范围外",format:{fill:paleGreen,font:{color:"#256029"}}});
leads.freezePanes.freezeRows(4); leads.freezePanes.freezeColumns(5);
const leadWidths=[24,16,12,14,64,31,34,12,12,18,16,11,28,25,48,11,22,48,48];
for(let i=0;i<leadWidths.length;i++) leads.getRangeByIndexes(0,i,ld.length+4,1).format.columnWidth=leadWidths[i];

ledger.showGridLines = false;
const fullHeader = ["记录ID","原始页","出现次数","数据源","方向","日期","HS","商品描述","中国方向主体","境外主体","重量","数量","金额","目的地","平台产地","#&代码","范围分类","范围理由","路线判断","证据级别","路线理由","数量代理","代理口径"];
const fullRows = records.map(r => [s(r.record_id),s(r.input_pages),n(r.input_occurrence_count),s(r.data_source),s(r.trade_direction),s(r.date),s(r.hs_code),s(r.description),s(r.china_party),s(r.foreign_party),n(r.weight_num),n(r.quantity_num),n(r.amount_num),s(r.destination),s(r.platform_origin),s(r.tail_origin_marker),s(r.scope_category),s(r.scope_reason),s(r.route_assessment),s(r.evidence_grade),s(r.route_reason),n(r.quantity_proxy),s(r.quantity_proxy_basis)]);
ledger.getRange(`A1:W${fullRows.length+1}`).values = [fullHeader,...fullRows];
header(ledger.getRange("A1:W1"));
ledger.tables.add(`A1:W${fullRows.length+1}`, true, "PCHSUniqueLedger").style = "TableStyleMedium2";
ledger.getRange(`A2:W${fullRows.length+1}`).format = { wrapText: true, verticalAlignment: "top", font: { name: "Microsoft YaHei", size: 9 } };
ledger.getRange(`K2:M${fullRows.length+1}`).format.numberFormat = "#,##0.00";
ledger.getRange(`V2:V${fullRows.length+1}`).format.numberFormat = "#,##0.00";
ledger.getRange(`A2:W${fullRows.length+1}`).format.rowHeightPx = 50;
ledger.freezePanes.freezeRows(1); ledger.freezePanes.freezeColumns(7);
const fullWidths=[17,12,11,14,9,12,15,64,32,34,12,12,18,13,16,11,31,47,31,11,47,14,25];
for(let i=0;i<fullWidths.length;i++) ledger.getRangeByIndexes(0,i,fullRows.length+1,1).format.columnWidth=fullWidths[i];

gap.showGridLines = false;
title(gap, "A1:R1", "缺页恢复候选（备用旧抓取，仅供重抓校验）");
gap.getRange("A2:R2").merge();
gap.getRange("A2:R2").values = [["这些记录来自另一轮旧抓取，筛选状态未完全固化；不得当作已补齐的实时第7页，也不得并入主计数。"]];
gap.getRange("A2:R2").format = { fill: paleGold, font: { color: "#6B4E00", bold: true, name: "Microsoft YaHei" }, wrapText: true };
const gh=["备用页","位置","数据源","日期","HS","商品描述","中国方向主体","境外主体","重量","数量","金额","目的地","平台产地","#&代码","范围分类","路线判断","证据级别","状态"];
const gd=recovery.map(r=>[n(r.alternate_page),n(r.alternate_position),s(r.data_source),s(r.date),s(r.hs_code),s(r.description),s(r.china_party),s(r.foreign_party),n(r.weight),n(r.quantity),n(r.amount),s(r.destination),s(r.platform_origin),s(r.tail_origin_marker),s(r.scope_category),s(r.route_assessment),s(r.evidence_grade),s(r.recovery_status)]);
gap.getRange(`A4:R${gd.length+4}`).values=[gh,...gd]; header(gap.getRange("A4:R4"));
gap.tables.add(`A4:R${gd.length+4}`,true,"PCGapRecoveryCandidates").style="TableStyleMedium2";
gap.getRange(`A5:R${gd.length+4}`).format={wrapText:true,verticalAlignment:"top",font:{name:"Microsoft YaHei",size:9}};
gap.getRange(`I5:K${gd.length+4}`).format.numberFormat="#,##0.00";
gap.getRange(`A5:R${gd.length+4}`).format.rowHeightPx=52; gap.freezePanes.freezeRows(4);
const gapWidths=[10,10,14,12,15,64,31,34,12,12,18,13,16,11,31,30,11,35]; for(let i=0;i<gapWidths.length;i++) gap.getRangeByIndexes(0,i,gd.length+4,1).format.columnWidth=gapWidths[i];

method.showGridLines=false;
title(method,"A1:D1","政策口径、公开证据与最小取证清单");
method.getRange("A3:D3").values=[["类别","规则/事实","本项目应用","来源"]]; header(method.getRange("A3:D3"));
method.getRange("A4:D20").values=[
  ["终裁范围","台湾原产、双酚A型PC按重量计含量≥99%；<99%排除","HS和“PC”品名仅是入口，逐色号取TDS/COA","商务部公告2024年第13号"],
  ["添加剂/改性","医疗级、阻燃、着色等只要PC≥99%仍可在范围","不能因“modified/阻燃/ECO”自动排除","商务部终裁产品范围部分"],
  ["税率","台化/台湾出光9%；奇美/奇菱12.2%；其他台湾公司22.4%","Trinseo Taiwan符合范围时按22.4%情景；生产商栏仍须核实","商务部公告2024年第13号"],
  ["税种","AD=完税价格×税率；VAT增量=AD×13%","只写反倾销税及连带VAT差额，不把正常关税/基础VAT称逃税","商务部公告及税务机关税率查询"],
  ["第三国商业链","台化/出光官方披露多层第三国关联贸易商及上海关联贸易商路径","A级商业/开票链，不等于物理转运或违法","商务部最终裁定"],
  ["Trinseo台湾能力","新竹为compounds & blends，认证页面列EMERGE PC/PC-ABS及再生含量牌号","能解释台湾原产混配牌号；不能仅据牌号推断PC含量","Trinseo官网、2024 Form 10-K"],
  ["EMERGE范围","官方说明EMERGE可结合PC与ABS/PET/色料/添加剂","必须按完整牌号+色号+物料号映射","Trinseo EMERGE官网"],
  ["同色号反证","IC8800624/IC8800412公开聚合页显示PC90–98%+TiO2","只对同色号作C级反证；须调原始越南申报/TDS","Volza聚合页，非官方一手"],
  ["PC-6715VT","奇美官网确认WONDERLITE透明阻燃PC","若台湾奇美生产且PC≥99%，适用12.2%","奇美官方产品页"],
  ["U415","公开一手资料无法锁定生产商/配方","不得自动归入22.4%或12.2%","需越南进口申报、包装和COA"],
  ["B腿证据","17条越南对华货描保留#&TW；4条引用前序越南进口申报","证明具体可核查B腿，不证明中国端改报产地","易迅逐票记录"],
  ["合规反证","越南出口主动保留#&TW","若中国端同样申报台湾并缴税，不存在逃税","需中国报关单/税款缴款书"],
  ["缺页","第6/7页逐行完全相同，缺约200条","必须重新抓实时第7页，不能用备用旧抓取替代","原始JSON哈希与逐行比对"],
  ["关键词缺口","尚未完成POLYCARBONATE、PC RESIN、EMERGE、LEXAN、MAKROLON等全页查询","本台账是阶段审计，不是最终报告","后续易迅任务"],
  ["A腿缺口","尚无台湾→越南/其他第三国的同期易迅全量数据","围绕EMERGE/Trinseo/完整色号与越南E11申报反查","后续易迅任务"],
  ["最小取证","中国进口报关单、税款缴款书、TDS/COA、越南原进口+再出口申报、提单箱号","五项齐备即可判断产品范围、原产申报、税款与物理链","核查清单"],
  ["公开执法检索","未发现措施后官方反规避调查、专门处罚、法院判决或双段提单案件","不得写“已查实绕道逃税”","截至2026-08-13"],
];
method.getRange("A4:D20").format={wrapText:true,verticalAlignment:"top",font:{name:"Microsoft YaHei",size:9},borders:{preset:"all",style:"thin",color:border}};
method.getRange("A4:D20").format.rowHeightPx=56;
for(const [c,w] of [["A",20],["B",55],["C",59],["D",70]]) method.getRange(`${c}1:${c}20`).format.columnWidth=w;
method.freezePanes.freezeRows(3);

const specs=[
  {sheetId:"概览",range:"A1:H31"},
  {sheetId:"TW线索人工复核",range:`A1:S${leadRows.length+4}`},
  {sheetId:"HS逐票唯一记录",range:"A1:W14"},
  {sheetId:"缺页恢复候选",range:"A1:R15"},
  {sheetId:"政策口径与取证",range:"A1:D20"},
];
const inspections=[];
for(const spec of specs){
  const check=await wb.inspect({kind:"table",sheetId:spec.sheetId,range:spec.range,include:"values,formulas",tableMaxRows:45,tableMaxCols:30,maxChars:20000});
  inspections.push(check.ndjson);
  const preview=await wb.render({sheetName:spec.sheetId,range:spec.range,scale:1.0,format:"png"});
  await fs.writeFile(`${qaDir}/${spec.sheetId}.png`,new Uint8Array(await preview.arrayBuffer()));
}
const errors=await wb.inspect({kind:"match",searchTerm:"#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",options:{useRegex:true,maxResults:300},summary:"final formula error scan"});
await fs.writeFile(`${qaDir}/inspect.txt`,inspections.join("\n")+"\nERRORS\n"+errors.ndjson,"utf8");
const output=await SpreadsheetFile.exportXlsx(wb); await output.save(outPath);
console.log(JSON.stringify({outPath,uniqueRows:records.length,leadRows:leadRows.length,recoveryRows:recovery.length,errorScan:errors.ndjson},null,2));
