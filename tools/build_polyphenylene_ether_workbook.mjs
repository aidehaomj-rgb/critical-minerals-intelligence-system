import fs from "node:fs/promises";
import path from "node:path";
import { Workbook, SpreadsheetFile } from "@oai/artifact-tool";

const outDir = process.env.PPE_OUT_DIR || "D:/易迅数据/反倾销税深度分析报告/10_聚苯醚";
const records = JSON.parse(await fs.readFile(path.join(outDir, "聚苯醚_易迅逐票标准化.json"), "utf8"));
const audit = JSON.parse(await fs.readFile(path.join(outDir, "聚苯醚_全量阶段审计.json"), "utf8"));
const workbookPath = path.join(outDir, "聚苯醚_易迅逐票判定台账_阶段审计.xlsx");
const qaDir = path.join(outDir, "QA_工作簿预览");
await fs.mkdir(qaDir, { recursive: true });

const wb = Workbook.create();
const overview = wb.worksheets.add("概览");
const bLegs = wb.worksheets.add("中国端范围候选");
const aLegs = wb.worksheets.add("美国来源第三国供给");
const scopeRows = wb.worksheets.add("全部范围候选");
const allRows = wb.worksheets.add("全部10347条");
const abMatch = wb.worksheets.add("AB牌号匹配");
const entityLinks = wb.worksheets.add("AB实体货描链");
const duplicates = wb.worksheets.add("重复与镜像审计");
const policy = wb.worksheets.add("政策与调证");

const colors = {
  navy: "#17324D", blue: "#1F4E78", paleBlue: "#EAF2F8",
  paleGold: "#FFF4CC", paleRed: "#FCE8E6", paleGreen: "#E6F4EA",
  border: "#D6DEE6", ink: "#102A43", gray: "#F4F6F8"
};

function s(v) { return v === null || v === undefined ? "" : String(v); }
function n(v) { const x = Number(v); return Number.isFinite(x) ? x : null; }
function title(sheet, range, value) {
  const r = sheet.getRange(range); r.merge(); r.values = [[value]];
  r.format = { fill: colors.navy, font: { bold: true, color: "#FFFFFF", size: 18, name: "Microsoft YaHei" }, verticalAlignment: "center" };
  r.format.rowHeightPx = 42;
}
function section(range, value) {
  range.merge(); range.values = [[value]];
  range.format = { fill: colors.paleBlue, font: { bold: true, color: colors.navy, name: "Microsoft YaHei" }, verticalAlignment: "center" };
  range.format.rowHeightPx = 28;
}
function header(range) {
  range.format = { fill: colors.blue, font: { bold: true, color: "#FFFFFF", name: "Microsoft YaHei" }, wrapText: true, verticalAlignment: "center", borders: { preset: "all", style: "thin", color: colors.border } };
  range.format.rowHeightPx = 34;
}
function body(range, size = 9) {
  range.format = { wrapText: true, verticalAlignment: "top", font: { name: "Microsoft YaHei", size }, borders: { preset: "all", style: "thin", color: colors.border } };
}

const all = audit.all_rows;
const scope = audit.scope;
const b = audit.china_b_legs;
const a = audit.us_origin_to_third_background;
const recycledB = b.records.filter(r => r.scope_screen === "范围待成分");
const clearB = b.records.filter(r => r.scope_screen === "明确范围内");
function metric(rows, field) { return rows.reduce((sum, r) => sum + (Number(r[field]) || 0), 0); }
function byOrigin(rows, origin) { return rows.filter(r => (r.platform_origin || "(空)") === origin); }

overview.showGridLines = false;
title(overview, "A1:H1", "聚苯醚（PPE/PPO）｜反倾销税与第三国转运风险阶段审计");
overview.getRange("A2:H2").merge();
overview.getRange("A2:H2").values = [[`已逐条审计两份已下载数据共${all.raw.toLocaleString()}行。检出措施范围候选${scope.raw}行（可见字段精确去重${scope.visible_unique}条），其中中国端候选${b.visible_unique}条、美国来源字段流向第三国供给背景${a.visible_unique}条；发现${audit.a_b_exact_entity_description_links.linked_b_records}条中国端记录具有“同一第三国实体＋同货描＋相邻时间”的具体链路，但尚无同柜/同批/同PO及中国原产申报闭环。`]];
overview.getRange("A2:H2").format = { fill: colors.paleGold, font: { bold: true, color: "#6B4E00", name: "Microsoft YaHei" }, wrapText: true };
overview.getRange("A2:H2").format.rowHeightPx = 42;

section(overview.getRange("A4:D4"), "数据完整性");
overview.getRange("A5:D10").values = [
  ["项目", "数量", "口径", "结论"],
  ["原始行", all.raw, "两表合计", `中国进口${audit.files.china_import.rows}行；美国出口${audit.files.us_export.rows}行`],
  ["可见字段精确唯一", all.visible_unique, "完全相同字段折叠", `重复冗余${all.raw - all.visible_unique}行`],
  ["商业签名唯一", all.commercial_signature_unique, "再折叠跨数据源同值", "不因缺少票号而擅自删除原始行"],
  ["日期覆盖", all.date_min, all.date_max, "仅代表两份已下载数据覆盖"],
  ["阶段缺口", "中国税号/关键词独立查询", "双段提单与中国底单", "报告为阶段审计，不是结案认定"],
];
header(overview.getRange("A5:D5")); body(overview.getRange("A6:D10"), 10);

section(overview.getRange("E4:H4"), "结论先行");
overview.getRange("E5:H10").merge();
overview.getRange("E5:H10").values = [[`已证实：${b.visible_unique}条中国端范围候选，其中54条为明确写有PPO/PPE的再生料成分候选；美国来源字段流向第三国的供给背景${a.visible_unique}条。最具体线索：HPP Mexico三条B腿与美国A腿存在同实体同货描，其中2026-04-09和2026-02-03为同日；Motores链为相邻1日；Flextronics为关联实体15日窗口。未证实：没有同柜、同批号、同PO，也没有中国法定原产地及税款书。HPP虽有真实配混工厂，但若投入和产出均归3907，配混未必满足非优惠原产地四位税目改变。`]];
overview.getRange("E5:H10").format = { fill: colors.paleRed, font: { color: "#8B1E1E", name: "Microsoft YaHei", size: 10 }, wrapText: true, verticalAlignment: "top", borders: { preset: "all", style: "thin", color: "#E6A6A1" } };

section(overview.getRange("A12:H12"), "范围筛查与线路结果");
overview.getRange("A13:H13").values = [["项目", "原始", "精确唯一", "数量/金额口径", "主要结果", "证据等级", "当前判断", "下一步"]];
header(overview.getRange("A13:H13"));
overview.getRange("A14:H20").values = [
  ["措施范围候选", scope.raw, scope.visible_unique, "跨来源不可合计金额", "PPE/PPO、NORYL、XYRON及再生/混配料", "筛查", `明确范围${scope.screen_split_unique["明确范围内"]}；再生料待成分${scope.screen_split_unique["范围待成分"]}`, "中国10位税号与成分复核"],
  ["范围外/信息不足", scope.excluded_or_insufficient, "—", "逐条保留", "PPS、PEG/PEO、聚醚多元醇等", "OUT/待判", "宽HS池中大多数非案涉产品", "不计入风险量"],
  ["中国端范围候选", b.raw, b.visible_unique, "重量/数量字段按数据源分开", "越南42、印尼8、菲律宾8、墨西哥7、原产空2", "B至C", "对华线路成立，规避未证实", "调CO/COA/报关单/税款书"],
  ["美国来源→第三国供给", a.raw, a.visible_unique, `商业组${a.commercial_groups}`, "墨西哥489、越南66、印度17、菲律宾4等", "供应背景", "平台来源字段不等于法定美国原产", "调出口申报、制造商、批号"],
  ["同牌号A/B闭合", 0, 0, `${b.visible_unique}条逐票匹配`, "GTX973、X552H/Z552H、PCN2615等均无匹配A腿", "未闭合", "没有具体绕道证据", "柜号/批号/PO再匹配"],
  ["同实体同货描链", audit.a_b_exact_entity_description_links.candidate_pairs, audit.a_b_exact_entity_description_links.linked_b_records, `${audit.a_b_exact_entity_description_links.linked_b_records}条B腿对应${audit.a_b_exact_entity_description_links.candidate_pairs}个历史A腿候选`, "HPP Mexico三条；Motores一条", "B+ / B", "具体链路成立，同批与报关原产未证实", "优先调同日/相邻日提单、批号、生产工单"],
  ["再生料待成分", recycledB.length, recycledB.length, "候选物理量868,069kg（单位待原单）", "越南39、菲律宾10、印尼5", "C", "PPO/PPE名称明确，成分及实质加工待核", "FTIR/DSC/TGA、BOM、库存、能耗、原产底稿"],
];
body(overview.getRange("A14:H20"), 9);

section(overview.getRange("A22:H22"), `中国端${b.visible_unique}条范围候选分层`);
overview.getRange("A23:H23").values = [["分层", "路线", "条数", "重量/数量口径", "主要境外主体", "主要中国主体", "证据等级", "研判"]];
header(overview.getRange("A23:H23"));
const bSummary = [
  ["再生PPO/PPE", "越南→中国", byOrigin(recycledB,"Vietnam").length, `数量字段${metric(byOrigin(recycledB,"Vietnam"),"quantity_num").toLocaleString()}；描述为kg/袋，待原单`, "VIỆT-CAM、Huangying、Thủy Anh、Houseware等", "HETE、Hong Kong Haolang、Ningbo Langcong等", "C", "产品名称明确，但成分、废料来源、真实加工及原产地均待核"],
  ["再生PPO/PPE", "菲律宾→中国", byOrigin(recycledB,"Philippines").length + byOrigin(recycledB,"(空)").length, `重量字段${(metric(byOrigin(recycledB,"Philippines"),"weight_num")+metric(byOrigin(recycledB,"(空)"),"weight_num")).toLocaleString()}`, "GBW Acritech Plastic Products", "Xiamen Xiefuhao等", "C", "两票原产字段空；全部须核菲律宾制造能力和废料来源"],
  ["再生PPO/PPE", "印尼→中国", byOrigin(recycledB,"Indonesia").length, `重量字段${metric(byOrigin(recycledB,"Indonesia"),"weight_num").toLocaleString()}`, "PT Wahana Lautan Xpedisi、PT Alam Kencana Sejati", "NINGBO ENJOYLIFE", "C", "须区分货代/生产商并核加工账"],
  ["明确化学范围", "墨西哥→中国", byOrigin(clearB,"Mexico").length, `数量字段${metric(byOrigin(clearB,"Mexico"),"quantity_num").toLocaleString()}`, "TB&C及墨西哥出口主体", "Suzhou Hillion等", "B", "含GTX973及西语PPO/PPE；无同牌号美国A腿"],
  ["明确化学范围", "印尼→中国", byOrigin(clearB,"Indonesia").length, `重量字段${metric(byOrigin(clearB,"Indonesia"),"weight_num").toLocaleString()}`, "Nippisun Indonesia", "Sojitz/Hudson Shenzhen", "B-反证", "官方确认Nippisun受托生产XYRON，合法印尼制造解释较强"],
  ["明确化学范围", "越南→中国", byOrigin(clearB,"Vietnam").length, `数量字段${metric(byOrigin(clearB,"Vietnam"),"quantity_num").toLocaleString()}`, "Nagase Vietnam等", "上海华昌等", "B-反证/待核", "货描尾标#&TH/#&KR/#&CN，平台Vietnam字段不能当法定原产"],
];
overview.getRange(`A24:H${23 + bSummary.length}`).values = bSummary; body(overview.getRange(`A24:H${23 + bSummary.length}`), 8);
overview.getRange(`A24:H${23 + bSummary.length}`).format.rowHeightPx = 70;

section(overview.getRange("A32:H32"), "税种与条件税差口径");
overview.getRange("A33:H33").values = [["生产商税档", "AD税率", "AD引致VAT", "合计增量系数", "反补贴税", "现有金额字段", "能否算实际税额", "条件公式"]];
header(overview.getRange("A33:H33"));
overview.getRange("A34:H35").values = [
  ["SHPP US LLC", 0.173, "AD×13%", audit.tax_rules.SHPP_total_increment_coefficient, "不征", "多来源、无币种/非中国完税价", "不能", "完税价×19.549%"],
  ["其他美国公司", 0.486, "AD×13%", audit.tax_rules.other_total_increment_coefficient, "不征", "同上", "不能", "完税价×54.918%"],
];
body(overview.getRange("A34:H35"), 9); overview.getRange("B34:D35").format.numberFormat = "0.000%";
overview.getRange("A37:H39").merge();
overview.getRange("A37:H39").values = [["只有在“货物实际美国原产＋中国进口申报为第三国原产＋未按适用企业税率缴纳反倾销税＋金额可确认为中国海关完税价格”同时成立时，才可计算少缴情景。当前平台金额字段无统一币种，且不是中国完税价，不展示实际欠税额。反补贴调查因微量补贴终止，不加征反补贴税。"]];
overview.getRange("A37:H39").format = { fill: colors.paleGold, font: { italic: true, color: "#6B4E00", name: "Microsoft YaHei" }, wrapText: true, verticalAlignment: "top", borders: { preset: "all", style: "thin", color: "#E0C15A" } };
for (const [c,w] of [["A",22],["B",24],["C",27],["D",32],["E",35],["F",25],["G",18],["H",54]]) overview.getRange(`${c}1:${c}39`).format.columnWidth = w;
overview.freezePanes.freezeRows(2);

const headers = ["记录ID","查询文件","查询集","原始行","可见签名","商业签名","数据源","方向","日期","HS编码","商品描述","中国方/收货方","境外方/发货方","重量字段","数量字段","金额字段","目的国","平台来源/原产字段","货描尾标","范围判定","产品分类","牌号","范围理由","路线","证据等级","路线理由","完全同值次数","可能精确重复","商业签名次数","可能跨源/同值组"];
function ledgerRow(r) {
  return [s(r.record_id),s(r.query_file),s(r.query_name),n(r.query_row),s(r.visible_signature),s(r.commercial_signature),s(r.data_feed),s(r.trade_direction),s(r.date),s(r.hs_code),s(r.description),s(r.buyer_or_consignee),s(r.seller_or_shipper),n(r.weight_num),n(r.quantity_num),n(r.amount_num),s(r.destination),s(r.platform_origin),s(r.tail_origin_mark),s(r.scope_screen),s(r.product_class),s(r.grade),s(r.scope_reason),s(r.route),s(r.evidence_grade),s(r.route_reason),n(r.visible_signature_count),s(r.possible_exact_visible_duplicate),n(r.commercial_signature_count),s(r.possible_cross_feed_or_same_value_group)];
}
function buildLedger(sheet, rows, tableName) {
  sheet.showGridLines = false;
  const end = rows.length + 1;
  sheet.getRangeByIndexes(0, 0, end, headers.length).values = [headers, ...rows.map(ledgerRow)];
  header(sheet.getRangeByIndexes(0, 0, 1, headers.length));
  sheet.tables.add(`A1:AD${end}`, true, tableName).style = "TableStyleMedium2";
  body(sheet.getRangeByIndexes(1, 0, Math.max(1, rows.length), headers.length), rows.length > 1000 ? 8 : 9);
  sheet.getRangeByIndexes(1, 13, Math.max(1, rows.length), 3).format.numberFormat = "#,##0.00";
  sheet.freezePanes.freezeRows(1); sheet.freezePanes.freezeColumns(10);
  const widths = [20,22,12,9,18,18,15,9,12,15,72,34,34,13,13,16,12,16,10,14,24,18,45,22,13,52,12,12,12,14];
  for (let i=0; i<widths.length; i++) sheet.getRangeByIndexes(0, i, end, 1).format.columnWidth = widths[i];
  if (rows.length <= 250) sheet.getRangeByIndexes(1, 0, rows.length, headers.length).format.rowHeightPx = 58;
}

const scopeAll = records.filter(r => ["明确范围内","范围待成分"].includes(r.scope_screen));
const aCandidate = records.filter(r => r.query_name === "美国出口" && ["明确范围内","范围待成分"].includes(r.scope_screen));
buildLedger(bLegs, b.records, "PPEChinaBLegs");
buildLedger(aLegs, aCandidate, "PPEUSSourceALegs");
buildLedger(scopeRows, scopeAll, "PPEScopeRows");
buildLedger(allRows, records, "PPEAllRows");

abMatch.showGridLines = false;
title(abMatch, "A1:H1", `A/B牌号匹配审计｜中国端${b.visible_unique}条均未闭合`);
abMatch.getRange("A3:H3").values = [["B腿记录ID","日期","平台来源","B腿牌号","数量字段","候选A腿数","候选目的地","结论"]]; header(abMatch.getRange("A3:H3"));
const abRows = audit.a_b_grade_match.map(x => [x.b_record_id,x.b_date,x.b_origin,x.b_grade || "（通用品名/再生料）",n(x.b_quantity_field),n(x.candidate_a_records),x.candidate_a_destinations.join("、"),x.conclusion]);
abMatch.getRange(`A4:H${3+abRows.length}`).values = abRows; body(abMatch.getRange(`A4:H${3+abRows.length}`), 9);
abMatch.getRange(`A4:H${3+abRows.length}`).format.rowHeightPx = 50;
const abNoteStart = 5 + abRows.length;
abMatch.getRange(`A${abNoteStart}:H${abNoteStart+3}`).merge(); abMatch.getRange(`A${abNoteStart}:H${abNoteStart+3}`).values = [[`匹配规则：先按同一牌号精确匹配，再核第三国目的地、日期先后、重量/数量、主体、批号、柜号与PO。当前GTX973、X552H、Z552H、PCN2615-BK1066等均无美国来源同牌号A腿；通用再生PPE/PPO亦无相同主体/批次。${a.visible_unique}条美国来源字段供给记录只证明背景，不能与中国端${b.visible_unique}条相加或推定为同货。`]];
abMatch.getRange(`A${abNoteStart}:H${abNoteStart+3}`).format = { fill: colors.paleRed, font: { color: "#8B1E1E", name: "Microsoft YaHei" }, wrapText: true, verticalAlignment: "top", borders: { preset: "all", style: "thin", color: "#E6A6A1" } };
for (const [c,w] of [["A",28],["B",14],["C",16],["D",26],["E",14],["F",14],["G",24],["H",42]]) abMatch.getRange(`${c}1:${c}${abNoteStart+3}`).format.columnWidth=w;
abMatch.freezePanes.freezeRows(3);

entityLinks.showGridLines = false;
title(entityLinks, "A1:N1", `A/B同实体同货描链｜${audit.a_b_exact_entity_description_links.linked_b_records}条中国端记录、${audit.a_b_exact_entity_description_links.candidate_pairs}个历史A腿候选`);
entityLinks.getRange("A2:N2").merge();
entityLinks.getRange("A2:N2").values = [["判断边界：同一第三国实体、完全相同货描和相邻日期显著提升核查价值，但仍可能是本地配混、库存周转或样品出口；没有同一提单/柜号/批号/PO与中国报关原产地前，不得认定为绕道。"]];
entityLinks.getRange("A2:N2").format = { fill: colors.paleGold, font: { bold: true, color: "#6B4E00", name: "Microsoft YaHei" }, wrapText: true };
const linkHeaders = ["B腿记录ID","B日期","第三国实体","中国方","B货描","B数量字段","B金额字段","A记录ID","A日期","美国端供应方","A数量字段","A金额字段","A→B天数","判定"];
entityLinks.getRange("A4:N4").values = [linkHeaders]; header(entityLinks.getRange("A4:N4"));
// CSV is also delivered separately; the table below loads every detailed candidate pair.
// To keep the workbook self-contained, use a compact summary table followed by the full candidate-pair table loaded below with a small CSV parser.
const csvText = await fs.readFile(path.join(outDir, "聚苯醚_AB同实体同货描候选明细.csv"), "utf8");
function parseCsv(textValue) {
  const rows = []; let row = [], field = "", quoted = false;
  for (let i=0; i<textValue.length; i++) {
    const ch = textValue[i];
    if (quoted) {
      if (ch === '"' && textValue[i+1] === '"') { field += '"'; i++; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else {
      if (ch === '"') quoted = true;
      else if (ch === ',') { row.push(field); field = ""; }
      else if (ch === '\n') { row.push(field.replace(/\r$/, "")); rows.push(row); row = []; field = ""; }
      else field += ch;
    }
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}
const parsedLinks = parseCsv(csvText.replace(/^\uFEFF/, ""));
const linkCols = parsedLinks[0];
const li = Object.fromEntries(linkCols.map((x,i)=>[x,i]));
const linkRows = parsedLinks.slice(1).filter(r=>r.length>1).map(r => [
  r[li.b_record_id],r[li.b_date],r[li.b_seller],r[li.b_buyer],r[li.b_description],n(r[li.b_quantity_field]),n(r[li.b_amount_field]),
  r[li.a_record_id],r[li.a_date],r[li.a_seller],n(r[li.a_quantity_field]),n(r[li.a_amount_field]),n(r[li.days_a_to_b]),
  n(r[li.days_a_to_b]) === 0 ? "B+同日同实体同货描" : n(r[li.days_a_to_b]) <= 7 ? "B相邻日同实体同货描" : "C+历史同实体同货描"
]);
entityLinks.getRange(`A5:N${4+linkRows.length}`).values = linkRows; body(entityLinks.getRange(`A5:N${4+linkRows.length}`), 8);
entityLinks.tables.add(`A4:N${4+linkRows.length}`, true, "PPEEntityDescriptionLinks").style = "TableStyleMedium2";
entityLinks.getRange(`F5:M${4+linkRows.length}`).format.numberFormat = "#,##0.00";
entityLinks.getRange(`A5:N${4+linkRows.length}`).format.rowHeightPx = 54;
for (const [c,w] of [["A",28],["B",13],["C",39],["D",32],["E",66],["F",14],["G",15],["H",28],["I",13],["J",30],["K",14],["L",15],["M",12],["N",24]]) entityLinks.getRange(`${c}1:${c}${4+linkRows.length}`).format.columnWidth=w;
entityLinks.freezePanes.freezeRows(4); entityLinks.freezePanes.freezeColumns(5);

const duplicateRows = records.filter(r => r.possible_exact_visible_duplicate || r.possible_cross_feed_or_same_value_group);
buildLedger(duplicates, duplicateRows, "PPEDuplicateAudit");

policy.showGridLines = false;
title(policy, "A1:D1", "政策、公开产能反证与最小调证清单");
policy.getRange("A3:D3").values = [["类别","规则/事实","本案应用","来源或取证"]]; header(policy.getRange("A3:D3"));
const policyRows = [
  ["措施范围","原产于美国的PPE/PPO，以及改性或与PS、氢化苯乙烯-丁二烯嵌段共聚物、尼龙、填料/添加剂等混合的组合物；HS39072990","NORYL、XYRON、PPE/PA及再生PPE先纳入范围候选，最终以成分与中国申报归类核定","商务部公告2022年第1号"],
  ["税率","SHPP US LLC 17.3%；其他美国公司48.6%","必须先确认法定美国原产和实际生产商；集团品牌不等于美国原产","商务部公告2022年第1号、第20号"],
  ["反补贴","微量补贴，终止调查，不实施反补贴措施","不得把反补贴税加进风险税额","商务部公告2022年第2号"],
  ["印尼产能反证","Asahi Kasei确认P.T. Nippisun Indonesia受托生产XYRON改性PPE","3条印尼B腿合计重量/数量字段1,000，优先视为合法印尼加工替代解释","Asahi Kasei 2013官方公告；逐批仍核CO/工单"],
  ["泰国产能反证","SABIC公开资料列Rayong生产NORYL；一票PCN2615货描明确#&TH","更像泰国产经越南发华，不能把平台Vietnam字段直接当法定越南原产或美国绕道","SABIC官方产能资料、原货描"],
  ["再生料总体风险","54条精确唯一，候选物理量868,069kg：越南594,069、菲律宾243,150、印尼30,850；均明确写PPO/PPE","先确认成分和措施范围，再核废料来源、投入产出、非优惠原产地及是否仅分拣/造粒","FTIR/DSC/TGA、BOM、库存、能耗、工单、设备与原产资格底稿"],
  ["墨西哥GTX973","NORYL GTX属PPE+PA范围；存在1,800数量字段对华B腿","没有同牌号美国A腿，也未确认墨西哥制造地；保留B级核查","制造商声明、COA、批号、TB&C采购和加工记录"],
  ["菲律宾再生PPE","8,000重量字段/320数量字段对华B腿成立","无同主体/同牌号A腿；需核GBW Acritech制造能力与原料来源","菲律宾进口申报、BOM、生产账、原产地证"],
  ["原产地规则","简单分装、仓储、标签不赋予新原产地；多国加工以最后实质性改变认定；为规避贸易救济的加工可不予考虑","3907未见特定加工标准时原则上看四位税目改变；若美国投入和墨西哥产出均归3907，真实配混也未必改变原产地","《进出口货物原产地条例》、商务部实质性改变规则及附件"],
  ["A/B具体线索","HPP Mexico在2026-04-09、2026-02-03有同日同实体同货描链；Motores为相邻1日；Flextronics为关联实体15日窗口","应从一般供给背景升级为优先调单对象，但仍不是同批闭环或违法结论","先调HPP两组同日单证、Motores 2月27/28单证"],
  ["A/B闭环门槛","美国出口→第三国进口/加工→第三国再出口→中国进口四端单证，叠加柜号、批号、PO、日期与数量平衡","当前0条同批闭环；只有证据链闭合才能升级为涉嫌绕道或原产地伪报","两程提单、原产证、生产账、中国报关单与税款书"],
  ["查询缺口","尚缺HS39072990与PPE/PPO/NORYL/XYRON各自独立全页；也缺中国进口底单","本台账为两份下载数据全量审计，不声称覆盖易迅全部历史或所有关键词","下一轮易迅查询与执法调证"],
];
policy.getRange(`A4:D${3+policyRows.length}`).values = policyRows; body(policy.getRange(`A4:D${3+policyRows.length}`), 9);
policy.getRange(`A4:D${3+policyRows.length}`).format.rowHeightPx = 68;
for (const [c,w] of [["A",24],["B",69],["C",72],["D",58]]) policy.getRange(`${c}1:${c}${3+policyRows.length}`).format.columnWidth=w;
policy.freezePanes.freezeRows(3);

const previews = [
  { sheet: "概览", range: "A1:H39" },
  { sheet: "中国端范围候选", range: "A1:AD20" },
  { sheet: "AB牌号匹配", range: "A1:H20" },
  { sheet: "AB实体货描链", range: "A1:N14" },
  { sheet: "政策与调证", range: `A1:D${3+policyRows.length}` },
];
const inspection = [];
for (const p of previews) {
  const check = await wb.inspect({ kind: "table", sheetId: p.sheet, range: p.range, include: "values,formulas", tableMaxRows: 50, tableMaxCols: 35, maxChars: 30000 });
  inspection.push(check.ndjson);
  const img = await wb.render({ sheetName: p.sheet, range: p.range, scale: 1.0, format: "png" });
  await fs.writeFile(path.join(qaDir, `${p.sheet}.png`), new Uint8Array(await img.arrayBuffer()));
}
const errors = await wb.inspect({ kind: "match", searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A", options: { useRegex: true, maxResults: 300 }, summary: "final formula error scan" });
await fs.writeFile(path.join(qaDir, "inspect.txt"), inspection.join("\n") + "\nERRORS\n" + errors.ndjson, "utf8");
const output = await SpreadsheetFile.exportXlsx(wb);
await output.save(workbookPath);
console.log(JSON.stringify({ workbookPath, allRows: records.length, scopeRows: scopeAll.length, bLegs: b.records.length, aLegs: aCandidate.length, duplicateRows: duplicateRows.length, errorScan: errors.ndjson }, null, 2));
