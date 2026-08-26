import fs from "node:fs/promises";
import path from "node:path";
import { Workbook, SpreadsheetFile } from "@oai/artifact-tool";

process.on("uncaughtException", (error) => {
  console.error("PPS_WORKBOOK_FATAL:", error?.message || String(error));
  process.exit(1);
});
process.on("unhandledRejection", (error) => {
  console.error("PPS_WORKBOOK_REJECTION:", error?.message || String(error));
  process.exit(1);
});

const outDir = process.env.PPS_OUT || "D:/易迅数据/反倾销税深度分析报告/13_PPS";
const outPath = path.join(outDir, "PPS_易迅逐票判定台账_阶段审计.xlsx");
const qaDir = path.join(outDir, "QA_工作簿预览");
await fs.mkdir(qaDir, { recursive: true });

const load = async (name) => JSON.parse(await fs.readFile(path.join(outDir, name), "utf8"));
const delivery = await load("PPS_交付摘要.json");
const all = await load("PPS_易迅逐票标准化_全量7858条.json");
const platformChina = await load("PPS_平台目的国中国420条.json");
const hdcConflict = await load("PPS_HDC目的国冲突314条.json");
const corrected = await load("PPS_纠偏后非HDC平台中国106条.json");
const mainland = await load("PPS_中国内地实体名49条.json");
const hwaseung = await load("PPS_Hwaseung非HDC对华39条.json");
const chaoJu = await load("PPS_ChaoJu重点B腿9条.json");
const hdcInput = await load("PPS_HDC至Hwaseung重点A腿130条.json");
const recycled = await load("PPS_回收料对华全部62条.json");
const duplicateAudit = await load("PPS_全12字段trim重复审计.json");

const wb = Workbook.create();
const overview = wb.worksheets.add("概览");
const sPlatform = wb.worksheets.add("平台中国420");
const sHdcConflict = wb.worksheets.add("HDC目的国冲突314");
const sCorrected = wb.worksheets.add("纠偏非HDC106");
const sMainland = wb.worksheets.add("内地实体名49");
const sHwaseung = wb.worksheets.add("Hwaseung非HDC39");
const sChao = wb.worksheets.add("Chao Ju9");
const sHdcInput = wb.worksheets.add("HDC-Hwaseung130");
const sRecycled = wb.worksheets.add("回收对华62");
const sAll = wb.worksheets.add("全量7858");
const sDup = wb.worksheets.add("trim重复审计");
const policy = wb.worksheets.add("政策与调证");

const C = {
  navy: "#17324D", blue: "#1F4E78", paleBlue: "#EAF2F8", paleGold: "#FFF4CC",
  paleRed: "#FCE8E6", paleGreen: "#E6F4EA", border: "#CBD5E1", ink: "#102A43",
};
const s = (v) => v === null || v === undefined ? "" : String(v);
const yesNo = (v) => v === true || v === "true" || v === "是" ? "是" : "否";
const dateValue = (v) => {
  if (!v) return "";
  const d = new Date(`${v}T00:00:00`);
  return Number.isNaN(d.getTime()) ? s(v) : d;
};
function title(sheet, range, text) {
  const r = sheet.getRange(range); r.merge(); r.values = [[text]];
  r.format = { fill: C.navy, font: { bold: true, color: "#FFFFFF", size: 18, name: "Microsoft YaHei" }, verticalAlignment: "center" };
  r.format.rowHeightPx = 44;
}
function section(range, text) {
  range.merge(); range.values = [[text]];
  range.format = { fill: C.paleBlue, font: { bold: true, color: C.navy, name: "Microsoft YaHei", size: 10 }, verticalAlignment: "center", borders: { preset: "outside", style: "thin", color: C.border } };
  range.format.rowHeightPx = 28;
}
function header(range) {
  range.format = { fill: C.blue, font: { bold: true, color: "#FFFFFF", name: "Microsoft YaHei", size: 9 }, wrapText: true, horizontalAlignment: "center", verticalAlignment: "center", borders: { preset: "all", style: "thin", color: C.border } };
  range.format.rowHeightPx = 38;
}
function body(range, fontSize = 9) {
  range.format = { font: { name: "Microsoft YaHei", size: fontSize, color: C.ink }, verticalAlignment: "top", borders: { preset: "all", style: "thin", color: C.border } };
}

const headers = [
  "记录ID", "源文件", "源表", "源Excel行号", "trim规范记录ID", "trim规范源位置", "trim重复组ID", "trim组大小", "组内序号", "trim保留", "trim重复展开",
  "空白等价记录ID", "空白等价源位置", "空白等价组大小", "空白等价序号", "空白等价保留", "跨文件精确组",
  "产品层级", "产品范围处置", "产品层级理由", "路线层级", "买方地域分类", "平台中国", "受税来源", "受税来源直达中国", "HDC目的国冲突", "纠偏非HDC中国", "内地实体名", "Hwaseung非HDC中国", "ChaoJu", "HDC至Hwaseung A腿", "回收PPS中国", "回收PPS内地实体", "HPP-SHPP样品",
  "目的地纠偏", "原产地问题", "证据等级", "证据理由", "反证/替代解释", "决定性数据缺口",
  "数据源", "进出口", "日期", "HS编码", "商品描述", "采购商", "供应商", "重量原值", "数量原值", "金额原值", "目的国/地区", "平台原产字段",
];
function ledgerRow(r) {
  return [
    s(r.record_id), s(r["源文件"]), s(r["源工作表"]), Number(r["源Excel行号"] || 0), s(r.trim_canonical_record_id), s(r.trim_canonical_source_location), s(r.trim_duplicate_group_id), Number(r.trim_duplicate_group_size || 0), Number(r.trim_duplicate_ordinal || 0), yesNo(r.trim_dedup_keep), yesNo(r.trim_is_duplicate_extra),
    s(r.whitespace_equivalent_record_id), s(r.whitespace_equivalent_source_location), Number(r.whitespace_equivalent_group_size || 0), Number(r.whitespace_equivalent_ordinal || 0), yesNo(r.whitespace_equivalent_keep), yesNo(r.cross_file_exact_group),
    s(r.product_layer), s(r.product_scope_disposition), s(r.product_layer_reason), s(r.route_layer), s(r.buyer_geo_class), yesNo(r.platform_china_flag), yesNo(r.taxed_origin_flag), yesNo(r.direct_taxed_origin_china_flag), yesNo(r.hdc_destination_conflict_flag), yesNo(r.corrected_non_hdc_china_flag), yesNo(r.mainland_name_china_flag), yesNo(r.hwaseung_non_hdc_china_flag), yesNo(r.chaoju_china_flag), yesNo(r.hdc_to_hwaseung_a_flag), yesNo(r.recycled_pps_china_flag), yesNo(r.recycled_pps_mainland_name_flag), yesNo(r.hpp_shpp_sample_flag),
    s(r.destination_correction), s(r.origin_issue), s(r.evidence_grade), s(r.evidence_reason), s(r.counterevidence_or_alternative), s(r.decisive_data_gap),
    s(r["数据源"]), s(r["进出口"]), dateValue(r["日期"]), s(r["HS编码"]), s(r["商品描述"]), s(r["采购商"]), s(r["供应商"]), s(r["重量"]), s(r["数量"]), s(r["金额"]), s(r["目的国/地区"]), s(r["原产国/地区"]),
  ];
}
function buildLedger(sheet, rows, tableName, compact = false) {
  sheet.showGridLines = false;
  const matrix = [headers, ...rows.map(ledgerRow)];
  sheet.getRangeByIndexes(0, 0, matrix.length, headers.length).values = matrix;
  header(sheet.getRangeByIndexes(0, 0, 1, headers.length));
  if (rows.length) {
    const dr = sheet.getRangeByIndexes(1, 0, rows.length, headers.length); body(dr, rows.length > 1000 ? 8 : 9); dr.format.rowHeightPx = compact ? 30 : 50;
    sheet.getRangeByIndexes(1, 42, rows.length, 1).format.numberFormat = "yyyy-mm-dd";
    for (const col of [19, 20, 34, 35, 37, 38, 39, 44, 45, 46]) sheet.getRangeByIndexes(1, col, rows.length, 1).format.wrapText = true;
    const endCol = "AZ";
    const table = sheet.tables.add(`A1:${endCol}${matrix.length}`, true, tableName); table.style = "TableStyleMedium2"; table.showFilterButton = true;
    const grade = sheet.getRangeByIndexes(1, 36, rows.length, 1);
    grade.conditionalFormats.add("beginsWith", { text: "B+", format: { fill: C.paleGold, font: { bold: true, color: "#6B4E00" } } });
    grade.conditionalFormats.add("beginsWith", { text: "C", format: { fill: C.paleBlue, font: { color: C.navy } } });
  }
  sheet.freezePanes.freezeRows(1); sheet.freezePanes.freezeColumns(4);
  const widths = [20,18,12,10,24,28,24,9,9,9,11,24,28,10,10,10,11,28,18,50,36,18,11,11,13,14,14,12,16,11,17,13,16,13,36,50,18,55,55,48,12,9,12,14,62,32,32,14,14,14,16,16];
  for (let i = 0; i < widths.length; i++) sheet.getRangeByIndexes(0, i, matrix.length, 1).format.columnWidth = widths[i];
}

buildLedger(sPlatform, platformChina, "PPSPlatform420");
buildLedger(sHdcConflict, hdcConflict, "PPSHdcConflict314");
buildLedger(sCorrected, corrected, "PPSCorrected106");
buildLedger(sMainland, mainland, "PPSMainland49");
buildLedger(sHwaseung, hwaseung, "PPSHwaseung39");
buildLedger(sChao, chaoJu, "PPSChaoJu9");
buildLedger(sHdcInput, hdcInput, "PPSHdcInput130");
buildLedger(sRecycled, recycled, "PPSRecycled62");
buildLedger(sAll, all, "PPSAll7858", true);
buildLedger(sDup, duplicateAudit, "PPSDuplicateAudit", true);

overview.showGridLines = false;
title(overview, "A1:H1", "PPS｜反倾销税与第三国转运风险逐票审计台账");
overview.getRange("A2:H3").merge();
overview.getRange("A2:H3").values = [["全量读取两份易迅工作簿7,858行；12原字段trim精确唯一6,726行，连续空白等价唯一6,725行。最强具体线索为HDC韩国→Hwaseung越南→CHAO JU的E5060G六日局部匹配（B+），但同货、越南加工性质、中国进口申报、原产地核定和税款状态均未闭合。平台China 420条中HDC买方314条存在目的国冲突，至少一票公开同票证据指向韩国，必须单列纠偏。"]];
overview.getRange("A2:H3").format = { fill: C.paleGold, font: { bold: true, color: "#6B4E00", name: "Microsoft YaHei", size: 10 }, wrapText: true, verticalAlignment: "center", borders: { preset: "all", style: "thin", color: "#E0C15A" } };

section(overview.getRange("A5:D5"), "全量与去重口径");
overview.getRange("A6:D6").values = [["项目", "台账公式计数", "权威预期", "校验"]]; header(overview.getRange("A6:D6"));
overview.getRange("A7:A9").values = [["原始源行"],["12字段trim唯一"],["空白等价唯一"]];
overview.getRange("B7:B9").formulas = [["=COUNTA('全量7858'!$A$2:$A$7859)"],["=COUNTIF('全量7858'!$J$2:$J$7859,\"是\")"],["=COUNTIF('全量7858'!$P$2:$P$7859,\"是\")"]];
overview.getRange("C7:C9").values = [[7858],[6726],[6725]];
overview.getRange("D7").formulas = [["=IF(B7=C7,\"通过\",\"复核\")"]]; overview.getRange("D7:D9").fillDown(); body(overview.getRange("A7:D9"));
overview.getRange("D7:D9").conditionalFormats.add("containsText", { text: "通过", format: { fill: C.paleGreen, font: { bold: true, color: "#256029" } } });

section(overview.getRange("E5:H5"), "重点子集计数");
overview.getRange("E6:H6").values = [["子集", "公式计数", "权威预期", "审计属性"]]; header(overview.getRange("E6:H6"));
overview.getRange("E7:E15").values = [["平台China"],["HDC目的国冲突"],["纠偏非HDC"],["内地实体名"],["Hwaseung非HDC"],["Chao Ju"],["HDC→Hwaseung"],["回收对华"],["受税来源直达中国"]];
overview.getRange("F7:F15").formulas = [["=COUNTA('平台中国420'!$A$2:$A$421)"],["=COUNTA('HDC目的国冲突314'!$A$2:$A$315)"],["=COUNTA('纠偏非HDC106'!$A$2:$A$107)"],["=COUNTA('内地实体名49'!$A$2:$A$50)"],["=COUNTA('Hwaseung非HDC39'!$A$2:$A$40)"],["=COUNTA('Chao Ju9'!$A$2:$A$10)"],["=COUNTA('HDC-Hwaseung130'!$A$2:$A$131)"],["=COUNTA('回收对华62'!$A$2:$A$63)"],["=COUNTIF('全量7858'!$Y$2:$Y$7859,\"是\")"]];
overview.getRange("G7:G15").values = [[420],[314],[106],[49],[39],[9],[130],[62],[0]];
overview.getRange("H7:H15").values = [["平台字段，非中国进口确证"],["目的国冲突/疑似返韩"],["继续核中国底单"],["实体名线索"],["B腿背景"],["B+调单线索"],["真实输入池"],["范围/来源待核"],["本样本未见"]]; body(overview.getRange("E7:H15"));

section(overview.getRange("A17:H17"), "具体风险链、反证和调证终点");
overview.getRange("A18:H18").values = [["对象", "行数/窗口", "已证实", "证据级", "仍未证实", "反证/替代解释", "最先调取", "结论"]]; header(overview.getRange("A18:H18"));
overview.getRange("A19:H23").values = [
  ["HDC平台China", "314", "至少一票同票公开证据目的国韩国", "B+纠偏", "314票是否全部返韩", "韩国HDC买方及长期返韩流", "逐票提单、卸货港、越南出口申报", "不得计入已确认输华量"],
  ["HDC→Hwaseung", "130", "同一韩国供应实体持续输入越南", "B", "是否对应中国B腿", "Hwaseung真实配混工厂及返韩业务", "批号、BOM、工单、库存", "A腿不是绕道证据"],
  ["CHAO JU B腿", "9", "Hwaseung向同名主体发PPS、平台China", "B+", "中国进口人身份和报关", "名称仅高度疑似上海超聚", "中国报关单、地址、统一代码", "优先核单"],
  ["E5060G六日链", "9,000→12,000", "同牌号、同实体、6日、HS3911", "B+", "同货、同批、少缴税", "BK/NC→BR且量差3,000；真实配混", "双腿提单、批号、BOM、领料/库存", "最具体线索，非定案"],
  ["回收PPS", "62", "越南至平台China路线", "C", "措施范围及来源", "本地回收/再生生产可能", "成分、归类、来源、报关单", "单独分层"],
  ]; body(overview.getRange("A19:H23"), 9); overview.getRange("A19:H23").format.rowHeightPx = 72;

section(overview.getRange("A25:H25"), "原产地与条件税差边界");
overview.getRange("A26:H29").merge(); overview.getRange("A26:H29").values = [["中国反倾销适用非优惠原产地规则。若韩国PPS 3911在越南配混、配色或加填料后仍归3911，可能未发生四位税目改变；但最终须由中国海关依据BOM、工艺和个案资料核定。CHAO JU 9条平台金额字段合计22,023,517,728，单位和币种未统一。只有同时确认中国实际进口、韩国原产、HDC 32.7%、未缴税且金额可代理完税价格时，AD及其13%VAT增量系数才为36.951%；任何机械结果都不是实际欠税。"]]; overview.getRange("A26:H29").format = { fill: C.paleRed, font: { color: "#8B1E1E", name: "Microsoft YaHei", size: 10 }, wrapText: true, verticalAlignment: "center", borders: { preset: "all", style: "thin", color: "#E6A6A1" } };

section(overview.getRange("A31:H31"), "完整公司税率（现行复审期间继续实施）");
overview.getRange("A32:H32").values = [["来源", "企业", "AD税率", "AD+13%VAT增量系数", "适用前提", "本项目用途", "状态", "来源"]]; header(overview.getRange("A32:H32"));
const rates = [
  ["日本","Toray Industries",0.269,null,"确认对应生产商","核税情景","复审中","MOFCOM 2025#77"],["日本","DIC",0.273,null,"同左","核税情景","复审中","同左"],["日本","Polyplastics",0.252,null,"同左","核税情景","复审中","同左"],["日本","Tosoh",0.256,null,"同左","核税情景","复审中","同左"],["日本","Idemitsu Fine Composites",0.336,null,"同左","核税情景","复审中","同左"],["日本","Sumitomo Bakelite",0.345,null,"同左","核税情景","复审中","同左"],["日本","其他日本公司",0.691,null,"无法列名时可能适用","核税情景","复审中","同左"],
  ["美国","Solvay Specialty Polymers USA",2.141,null,"确认对应生产商","核税情景","复审中","同左"],["美国","Fortron Industries",2.209,null,"同左","核税情景","复审中","同左"],["美国","其他美国公司",2.209,null,"无法列名时","核税情景","复审中","同左"],
  ["韩国","Toray Advanced Materials Korea",0.264,null,"确认对应生产商","核税情景","复审中","同左"],["韩国","HDC POLYALL",0.327,null,"货物原产韩国且适用HDC","Chao Ju条件情景","复审中","2022#26/2025#77"],["韩国","其他韩国公司",0.468,null,"无法证明列名时可能适用","替代情景","复审中","2025#77"],
  ["马来西亚","Polyplastics Asia Pacific",0.233,null,"确认对应生产商","核税情景","复审中","同左"],["马来西亚","DIC Compounds Malaysia",0.405,null,"同左","核税情景","复审中","同左"],["马来西亚","其他马来西亚公司",0.405,null,"无法列名时","核税情景","复审中","同左"],
]; overview.getRange(`A33:H${32+rates.length}`).values = rates; for(let r=33;r<33+rates.length;r++) overview.getRange(`D${r}`).formulas=[[`=C${r}*(1+13%)`]]; body(overview.getRange(`A33:H${32+rates.length}`),9); overview.getRange(`C33:D${32+rates.length}`).format.numberFormat="0.000%";
for (const [col,width] of [["A",27],["B",31],["C",19],["D",24],["E",35],["F",33],["G",24],["H",38]]) overview.getRange(`${col}1:${col}${32+rates.length}`).format.columnWidth=width;
overview.freezePanes.freezeRows(3);

policy.showGridLines=false; title(policy,"A1:E1","PPS｜政策、原产地、证据边界与调证清单");
policy.getRange("A3:E3").values=[["模块","事实/规则","本项应用","下一步调证","公开来源"]]; header(policy.getRange("A3:E3"));
const policyRows=[
 ["措施与复审","2025-12-01启动PPS期终复审，复审期间继续按现行范围和税率征税。","日本、美国、韩国、马来西亚仍为受税来源。","核进口日期、生产商及缴税书。","https://www.mofcom.gov.cn/zcfb/blgg/art/2025/art_17bdfd38212c42beb0c74157ab21ec59.html"],
 ["措施范围","PPS及组合物；改性、混合、添加玻纤、矿粉和助剂仍可能纳入，主要税号39119000。","不可因改性/填充自动排除。","调TDS/COA、PPS含量、初级形态和归类。","同上"],
 ["HDC税率","HDC继承SK Chemicals 32.7%；使用旧名可能适用其他韩国公司档。","Chao Ju条件情景须先证明HDC适用。","调生产商声明、发票和报关生产商栏。","https://cacs.mofcom.gov.cn/cacscms/article/jkdc?articleId=174580&type=11"],
 ["目的国纠偏","HDC买方314条中至少一票公开同票资料指向韩国。","314条整体单列冲突，不计确认输华。","逐票提单、卸货港、越南申报。","https://www.volza.com/p/resin/buyers/buyers-in-south-korea/hsn-code-3911/"],
 ["真实配混反证","HDC有韩国PPS生产；Hwaseung越南有真实工程塑料配混业务及进出口库存监管。","真实加工反驳纸面空壳，但不自动赋予越南原产。","BOM、生产工单、能耗、库存结算。","https://static.cninfo.com.cn/finalpage/2026-02-03/1224963318.PDF"],
 ["原产地","非优惠原产以实质性改变为核心；3911输入输出同税目可能无四位税目改变。","#&VN不替代中国海关原产审定。","申请预确定/行政裁定，调完整工艺与配方。","https://policy.mofcom.gov.cn/claw/clawContent.shtml?id=101350"],
 ["CHAO JU","英文名高度疑似上海超聚，但贸易记录缺地址和中国进口人编码。","主体映射B，法律进口人闭环C。","越南收货地址、中国统一代码、海关注册编码。","https://en.chinapeek.com/pps_rod/"],
 ["E5060G","2026-05-09输入BK 6,000+NC 3,000；05-15输出BR 12,000。","同牌号/6日为B+，量和色号不闭合。","双腿提单、批号、PO、BOM、领料/库存。","易迅全量逐票数据；HDC TDS"],
 ["执法检索","未检出权威公开PPS专项反规避、行政处罚或判决。","未检出不等于不存在未公开核查。","向有权机关核处罚/稽查/补税资料。","公开检索结论"],
 ["税差","实际税差以中国海关完税价格、原产地、生产商、已缴税为准。","平台金额字段不能直接认定人民币或完税价。","调报关单、税款书、成交币种和汇率。","MOFCOM 2025#77"],
]; policy.getRange(`A4:E${3+policyRows.length}`).values=policyRows; body(policy.getRange(`A4:E${3+policyRows.length}`),9); policy.getRange(`A4:E${3+policyRows.length}`).format.wrapText=true; policy.getRange(`A4:E${3+policyRows.length}`).format.rowHeightPx=78;
for (const [col,width] of [["A",23],["B",65],["C",62],["D",62],["E",65]]) policy.getRange(`${col}1:${col}${3+policyRows.length}`).format.columnWidth=width; policy.freezePanes.freezeRows(3);

const overviewCheck=await wb.inspect({kind:"table",range:`概览!A1:H${32+rates.length}`,include:"values,formulas",tableMaxRows:60,tableMaxCols:8,maxChars:18000});
const errorCheck=await wb.inspect({kind:"match",searchTerm:"#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",options:{useRegex:true,maxResults:300},summary:"formula error scan",maxChars:5000});
await fs.writeFile(path.join(qaDir,"overview_inspect.ndjson"),overviewCheck.ndjson||"","utf8"); await fs.writeFile(path.join(qaDir,"formula_error_scan.ndjson"),errorCheck.ndjson||"","utf8");
console.error("PPS_WORKBOOK_STAGE: inspect-complete");
const previews=[
 ["概览",`A1:H${32+rates.length}`,"01_概览.png"],["平台中国420","A1:AZ8","02_平台中国420.png"],["HDC目的国冲突314","A1:AZ8","03_HDC冲突.png"],["纠偏非HDC106","A1:AZ8","04_纠偏106.png"],["内地实体名49","A1:AZ8","05_内地49.png"],["Hwaseung非HDC39","A1:AZ8","06_Hwaseung39.png"],["Chao Ju9","A1:AZ10","07_ChaoJu9.png"],["HDC-Hwaseung130","A1:AZ8","08_HDC输入130.png"],["回收对华62","A1:AZ8","09_回收62.png"],["全量7858","A1:AZ8","10_全量7858.png"],["trim重复审计","A1:AZ8","11_重复审计.png"],["政策与调证",`A1:E${3+policyRows.length}`,"12_政策调证.png"],
];
if(process.env.PPS_SKIP_PREVIEWS!=="1") for(const [sheetName,range,fileName] of previews){const img=await wb.render({sheetName,range,scale:0.65,format:"png"}); await fs.writeFile(path.join(qaDir,fileName),new Uint8Array(await img.arrayBuffer()));}
console.error("PPS_WORKBOOK_STAGE: previews-complete");
const output=await SpreadsheetFile.exportXlsx(wb); await output.save(outPath);
console.error("PPS_WORKBOOK_STAGE: export-complete");
console.log(JSON.stringify({outPath,counts:{all:all.length,trimUnique:all.filter(r=>r.trim_dedup_keep).length,wsUnique:all.filter(r=>r.whitespace_equivalent_keep).length,platformChina:platformChina.length,hdcConflict:hdcConflict.length,corrected:corrected.length,mainland:mainland.length,hwaseung:hwaseung.length,chaoJu:chaoJu.length,hdcInput:hdcInput.length,recycled:recycled.length,duplicateAudit:duplicateAudit.length},expected:{all:7858,trimUnique:6726,wsUnique:6725,platformChina:420,hdcConflict:314,corrected:106,mainland:49,hwaseung:39,chaoJu:9,hdcInput:130,recycled:62,duplicateAudit:2067},previews:previews.map(x=>x[2]),summaryId:delivery.delivery_id},null,2));
