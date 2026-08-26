import fs from "node:fs/promises";
import { Workbook, SpreadsheetFile } from "@oai/artifact-tool";

const productDir = "D:/易迅数据/反倾销税深度分析报告/04_白兰地（200升以下容器）";
const analysis = JSON.parse(await fs.readFile(`${productDir}/白兰地_分析结果.json`, "utf8"));
const { summary, rows, aLegRows } = analysis;
const outPath = `${productDir}/白兰地_易迅逐票判定台账.xlsx`;
const qaDir = `${productDir}/QA_工作簿预览`;
await fs.mkdir(qaDir, { recursive: true });

const wb = Workbook.create();
const overview = wb.worksheets.add("概览");
const ledger = wb.worksheets.add("逐票判定");
const aLeg = wb.worksheets.add("印尼前段78条");
const chain = wb.worksheets.add("匹配链路");
const sources = wb.worksheets.add("口径与来源");

const navy = "#16324F";
const blue = "#1F4E78";
const paleBlue = "#EAF2F8";
const paleGold = "#FFF4CC";
const paleRed = "#FCE8E6";
const paleGreen = "#E6F4EA";
const paleGray = "#F3F5F7";
const border = "#D6DEE6";

function title(sheet, range, text) {
  sheet.getRange(range).merge();
  sheet.getRange(range).values = [[text]];
  sheet.getRange(range).format = {
    fill: navy,
    font: { bold: true, color: "#FFFFFF", size: 18 },
    verticalAlignment: "center",
  };
  sheet.getRange(range).format.rowHeightPx = 38;
}

function header(range) {
  range.format = {
    fill: blue,
    font: { bold: true, color: "#FFFFFF" },
    verticalAlignment: "center",
    wrapText: true,
    borders: { preset: "outside", style: "thin", color: border },
  };
  range.format.rowHeightPx = 30;
}

function section(range, text) {
  range.merge();
  range.values = [[text]];
  range.format = { fill: paleBlue, font: { bold: true, color: navy }, verticalAlignment: "center" };
  range.format.rowHeightPx = 28;
}

// 概览
overview.showGridLines = false;
title(overview, "A1:H1", "白兰地（200升以下容器）反倾销税与第三国转运风险核查");
overview.getRange("A2:H2").merge();
overview.getRange("A2:H2").values = [["易迅查询期：2025-08-06至2026-08-06｜政策生效：2025-07-05｜受税来源：欧盟｜HS 22082000"]];
overview.getRange("A2:H2").format = { fill: "#DCE6F1", font: { color: navy, italic: true }, wrapText: true };

section(overview.getRange("A4:H4"), "核心量化结果（公式链接逐票台账）");
overview.getRange("A5:B11").values = [
  ["去重唯一记录", null],
  ["确认商品相关", null],
  ["第三国高优先级线索", null],
  ["疑似≥200升散装边界", null],
  ["相关记录重量（kg）", null],
  ["价格承诺企业直发线索", null],
  ["前段HENNESSY→印尼记录", null],
];
overview.getRange("B5:B11").formulas = [
  ["=COUNTA('逐票判定'!$A$2:$A$200)"],
  ["=COUNTIF('逐票判定'!$S$2:$S$200,\"是\")"],
  ["=COUNTIF('逐票判定'!$Q$2:$Q$200,\"高\")"],
  ["=COUNTIF('逐票判定'!$P$2:$P$200,\"疑似≥200升散装/罐式运输，原则上排除但需核包装容量\")"],
  ["=SUMIF('逐票判定'!$S$2:$S$200,\"是\",'逐票判定'!$J$2:$J$200)"],
  ["=COUNTIFS('逐票判定'!$V$2:$V$200,\"HENNESSY\",'逐票判定'!$O$2:$O$200,\"是\")"],
  ["=COUNTA('印尼前段78条'!$A$2:$A$79)"],
];
overview.getRange("A5:A11").format = { fill: paleGray, font: { bold: true }, wrapText: true };
overview.getRange("B5:B11").format = { fill: "#FFFFFF", font: { bold: true, color: blue }, numberFormat: "#,##0.00" };

section(overview.getRange("D4:H4"), "研判结论");
overview.getRange("D5:H11").merge();
overview.getRange("D5:H11").values = [[
  `结论：已发现一条“阿联酋→印度尼西亚→平台标记中国”的精确两段链。前段2026-06-24由EMIRATES AIRLINE IFS DEPARTMENT供货给AEROFOOD INDONESIA，后段2026-06-26由AEROFOOD发给CHINA AIRLINES；商品均为HENNESSY XO 5CL、数量均6、金额768.62/768.48美元。该链证明实物转供，但结合Aerofood航空配餐属性与China Airlines买方，较可能属于机供品/航材补给，不足以证明进入中国境内并逃避反倾销税。另有英国原产字段2票、24,013kg，仅属待核线索；未形成欧盟原产前段对应。`
]];
overview.getRange("D5:H11").format = { fill: paleGold, font: { color: "#5C4300" }, wrapText: true, verticalAlignment: "top", borders: { preset: "outside", style: "thin", color: "#E0C15A" } };

section(overview.getRange("A13:H13"), "具体链路、数量与可能少缴情形");
overview.getRange("A14:H14").values = [["环节","日期","路线/对象","商品","数量/重量","金额","税务含义","结论"]];
header(overview.getRange("A14:H14"));
overview.getRange("A15:H17").values = [
  ["前段","2026-06-24","阿联酋→印尼；EMIRATES IFS→AEROFOOD","COGNAC MINI - HENNESSY XO (5 CL)","6；16.32kg","USD 768.62","为后段提供同品同量来源","精确匹配"],
  ["后段","2026-06-26","印尼→平台目的国China；AEROFOOD→CHINA AIRLINES","同品，附BC.23.000197","6；7kg","USD 768.48","若实际一般贸易进入中国，Hennessy税率34.9%","需核运输性质"],
  ["条件测算","—","按后段金额近似完税价格，且价格承诺不适用","反倾销税USD 268.30；消费税差额USD 29.81；增值税差额USD 38.75","合计USD 336.86","仅为情景测算","所涉税种：反倾销税及其引致的进口消费税、增值税差额","现有证据更支持航空配餐/机供品，不能认定逃税"],
];
overview.getRange("A15:H17").format = { wrapText: true, verticalAlignment: "top", borders: { preset: "inside", style: "thin", color: border } };
overview.getRange("A15:H15").format.fill = paleGreen;
overview.getRange("A16:H16").format.fill = paleRed;

section(overview.getRange("A19:H19"), "政策与征税边界");
overview.getRange("A20:B26").values = [
  ["涉税范围","蒸馏葡萄酒取得、进口容器小于200升的烈性酒；通常包括白兰地、Cognac、Armagnac。≥200升容器不在措施范围。"],
  ["税号","22082000（税号仅供参考，商品描述和容器容量决定范围）"],
  ["最终税率","Martell 27.7%；Hennessy 34.9%；Rémy Martin 34.3%；其他合作公司32.2%；其他公司34.9%。"],
  ["价格承诺","34家公司可在满足最低价格、有效发票和承诺证明函等条件时不征反倾销税。"],
  ["不适用场景","加工贸易手册、保税区/保税仓库进口不适用价格承诺；应核贸易方式与税款缴款书。"],
  ["反规避条款","价格承诺文本明确禁止经第三国转售/再出口、隐瞒产品或出口商身份、误导原产地或改变贸易模式规避措施。"],
  ["税种","反倾销税；并改变进口消费税（其他酒10%）及进口增值税（13%）的计税基础。"],
];
overview.getRange("A20:A26").format = { fill: paleGray, font: { bold: true }, wrapText: true };
overview.getRange("B20:H26").merge(true);
overview.getRange("B20:H26").format = { wrapText: true, verticalAlignment: "top" };

section(overview.getRange("A28:H28"), "需优先调取的原始资料");
overview.getRange("A29:D32").values = [
  ["1","印尼链路","2026-06-24与2026-06-26两票原始提单、舱单、装箱单、航班号、机供品/航空器物料备案","确认是否进入中国关境、是否按机供品监管"],
  ["2","Hennessy直发5票","MOET HENNESSY SHANGHAI/DIAGEO (CHINA)的报关单、税款缴款书、承诺证明函、商业发票","确认187,956.8kg是否满足价格承诺及非保税/非加工贸易条件"],
  ["3","散装18票","STOLT TANK CONTAINERS相关装箱单、罐号、单罐容积、报关品名","确认824,975kg是否确属≥200升容器而排除"],
  ["4","英国2票","HILLEBRAND GORI (SCOTLAND)/CHARLES EDGE LONDON前段提单、生产商、原产地证","排除法国/欧盟原产经英国再出口"],
];
overview.getRange("D29:H32").merge(true);
overview.getRange("A29:H32").format = { wrapText: true, verticalAlignment: "top", borders: { preset: "inside", style: "thin", color: border } };

overview.getRange("A1:H32").format.font = { name: "Microsoft YaHei", size: 10 };
overview.getRange("A1:H32").format.wrapText = true;
overview.getRange("A1:H32").format.borders = { preset: "outside", style: "thin", color: border };
overview.getRange("A1:A32").format.columnWidth = 14;
overview.getRange("B1:B32").format.columnWidth = 18;
overview.getRange("C1:C32").format.columnWidth = 32;
overview.getRange("D1:D32").format.columnWidth = 21;
overview.getRange("E1:E32").format.columnWidth = 17;
overview.getRange("F1:F32").format.columnWidth = 16;
overview.getRange("G1:G32").format.columnWidth = 25;
overview.getRange("H1:H32").format.columnWidth = 22;
overview.freezePanes.freezeRows(2);

// 逐票判定
ledger.showGridLines = false;
const ledgerHeaders = ["ID","命中查询","数据源","流向","日期","HS编码","商品描述","采购商","供应商","重量kg","数量","金额USD","目的国","原产国","欧盟原产","容量/包装判定","风险等级","证据等级","是否为措施商品类型","判定理由","适用反倾销税率/条件","价格承诺企业线索"];
const ledgerData = rows.map((r)=>[
  r.id,r.queries,r.source,r.flow,r.date,r.hs,r.description,r.buyer,r.supplier,r.weight,r.quantity,r.amount,r.destination,r.origin,r.isEU?"是":"否",r.scope,r.risk,r.evidenceLevel,r.relevant?"是":"否",r.reason,r.rate,r.undertaking,
]);
ledger.getRange(`A1:V${ledgerData.length+1}`).values = [ledgerHeaders, ...ledgerData];
header(ledger.getRange("A1:V1"));
ledger.getRange(`A2:V${ledgerData.length+1}`).format = { wrapText: true, verticalAlignment: "top", font: { name: "Microsoft YaHei", size: 9 } };
ledger.getRange(`J2:L${ledgerData.length+1}`).format.numberFormat = "#,##0.00";
ledger.tables.add(`A1:V${ledgerData.length+1}`, true, "BrandyTicketLedger").style = "TableStyleMedium2";
ledger.freezePanes.freezeRows(1);
ledger.freezePanes.freezeColumns(6);
ledger.getRange(`Q2:Q${ledgerData.length+1}`).conditionalFormats.add("containsText", {text:"高", format:{fill:paleRed,font:{bold:true,color:"#9B1C1C"}}});
ledger.getRange(`Q2:Q${ledgerData.length+1}`).conditionalFormats.add("containsText", {text:"中", format:{fill:paleGold,font:{color:"#7A5A00"}}});
ledger.getRange(`S2:S${ledgerData.length+1}`).conditionalFormats.add("containsText", {text:"否", format:{fill:paleGray,font:{color:"#666666"}}});
const widths = [7,18,12,9,12,12,52,30,30,13,12,14,14,16,11,31,12,11,13,40,30,20];
for (let i=0;i<widths.length;i++) ledger.getRangeByIndexes(0,i,ledgerData.length+1,1).format.columnWidth = widths[i];
ledger.getRange(`A2:V${ledgerData.length+1}`).format.rowHeightPx = 56;

// 印尼前段
aLeg.showGridLines = false;
const aHeaders = ["序号","数据源","流向","日期","HS编码","商品描述","采购商","供应商","重量kg","数量","金额USD","目的国","原产国","与后段匹配"];
const aData = aLegRows.map((r)=>[r.row,r.source,r.flow,r.date,r.hs,r.description,r.buyer,r.supplier,r.weight,r.quantity,r.amount,r.destination,r.origin,(r.date==="2026-06-24"&&r.quantity===6&&/AEROFOOD/i.test(r.buyer)&&/HENNESSY XO \(5 CL\)/i.test(r.description))?"精确前段":""]);
aLeg.getRange(`A1:N${aData.length+1}`).values = [aHeaders,...aData];
header(aLeg.getRange("A1:N1"));
aLeg.tables.add(`A1:N${aData.length+1}`, true, "HennessyIndonesiaLeg").style = "TableStyleMedium2";
aLeg.getRange(`A2:N${aData.length+1}`).format = { wrapText: true, verticalAlignment: "top", font: {name:"Microsoft YaHei",size:9} };
aLeg.getRange(`A2:N${aData.length+1}`).format.rowHeightPx = 48;
aLeg.getRange(`I2:K${aData.length+1}`).format.numberFormat = "#,##0.00";
aLeg.getRange(`N2:N${aData.length+1}`).conditionalFormats.add("containsText",{text:"精确",format:{fill:paleGreen,font:{bold:true,color:"#176B35"}}});
aLeg.freezePanes.freezeRows(1);
const aWidths=[8,12,9,12,12,45,26,30,13,12,14,14,18,14];
for(let i=0;i<aWidths.length;i++) aLeg.getRangeByIndexes(0,i,aData.length+1,1).format.columnWidth=aWidths[i];

// 匹配链路
chain.showGridLines = false;
title(chain,"A1:H1","两段链路证据与税款情景测算");
chain.getRange("A3:H3").values=[["项目","前段A","后段B","匹配强度","数量差","金额差USD","税款情景","研判"]];
header(chain.getRange("A3:H3"));
chain.getRange("A4:H4").values=[["HENNESSY XO 5CL","2026-06-24 UAE→Indonesia；EMIRATES IFS→AEROFOOD；6件/16.32kg/USD768.62","2026-06-26 Indonesia→China(平台)；AEROFOOD→CHINA AIRLINES；6件/7kg/USD768.48","描述完全一致+数量相同+2天间隔",0,-0.14,"AD 34.9%=268.30；消费税差额=29.81；VAT差额=38.75；合计336.86美元","实物转供证据强；逃避中国反倾销税证据不足，优先核机供品/航材监管"]];
chain.getRange("A4:H4").format={wrapText:true,verticalAlignment:"top",borders:{preset:"all",style:"thin",color:border}};
chain.getRange("A4:H4").format.rowHeightPx=92;
chain.getRange("A6:H6").merge();
chain.getRange("A6:H6").values=[["计算说明：以上税款仅在后段金额可视为完税价格、货物确已作为一般贸易进入中国、价格承诺不适用且不考虑关税变动时成立。消费税按其他酒10%，进口增值税13%；测算的是因漏征反倾销税而连带少缴的消费税和增值税差额。"]];
chain.getRange("A6:H6").format={fill:paleGold,wrapText:true,font:{color:"#5C4300"}};
chain.getRange("A6:H6").format.rowHeightPx=56;
chain.getRange("A1:H6").format.font={name:"Microsoft YaHei",size:10};
for (const [col,w] of [["A",18],["B",34],["C",34],["D",24],["E",12],["F",14],["G",34],["H",34]]) chain.getRange(`${col}1:${col}6`).format.columnWidth=w;

// 口径与来源
sources.showGridLines = false;
title(sources,"A1:D1","查询口径、判定规则与公开来源");
sources.getRange("A3:D3").values=[["类别","条件/内容","结果规模","说明/URL"]];
header(sources.getRange("A3:D3"));
sources.getRange("A4:D15").values=[
  ["易迅基线","目的国CHINA；HS 220820；一年","144条","页面切至200条/页后全量提取"],
  ["易迅关键词","目的国CHINA；BRANDY；一年","187条","包含Brandy Melville等同词异物，逐条排除"],
  ["易迅关键词","目的国CHINA；COGNAC；一年","170条","包含皮革/鞋/颜色名等同词异物，逐条排除"],
  ["易迅关键词","目的国CHINA；ARMAGNAC；HS220820；一年","144条","无税号基线外新增记录"],
  ["前段查询","目的国INDONESIA；HENNESSY；一年","78条","全部提取；65条原产新加坡、10条阿联酋等"],
  ["去重规则","日期+HS+描述+买卖双方+重量/数量/金额+目的国+原产国","199条唯一","501条查询命中合并后去重"],
  ["范围规则","HS220820或饮料语境关键词；排除服装、皮革、颜色、标签等","131条相关","容器<200升决定是否最终纳税"],
  ["商务部公告","商务部公告2025年第34号","2025-07-05起5年","https://cacs.mofcom.gov.cn/cacscms/article/jkdc?articleId=184863&type=1"],
  ["最终税率附表","Martell/Hennessy/Rémy Martin及其他公司税率","27.7%—34.9%","商务部公告附件《各公司反倾销税税率列表》"],
  ["价格承诺","34家公司；含反规避、发票/证明函、保税/加工贸易限制","条件满足可不征AD","商务部公告附件《适用价格承诺公司名单及价格承诺公开文本》"],
  ["消费税","其他酒10%","现行有效","https://fgk.chinatax.gov.cn/zcfgk/c100010/c5194422/content.html"],
  ["进口增值税","一般货物13%","现行有效","https://12366.chinatax.gov.cn/bzds/118/118-1-8.html"],
];
sources.getRange("A4:D15").format={wrapText:true,verticalAlignment:"top",font:{name:"Microsoft YaHei",size:9},borders:{preset:"inside",style:"thin",color:border}};
sources.getRange("A4:D15").format.rowHeightPx=46;
sources.getRange("A1:A15").format.columnWidth=17;
sources.getRange("B1:B15").format.columnWidth=46;
sources.getRange("C1:C15").format.columnWidth=22;
sources.getRange("D1:D15").format.columnWidth=62;
sources.freezePanes.freezeRows(3);

const inspections = [];
for (const spec of [
  {sheetId:"概览",range:"A1:H32"},
  {sheetId:"逐票判定",range:"A1:V12"},
  {sheetId:"印尼前段78条",range:"A1:N12"},
  {sheetId:"匹配链路",range:"A1:H6"},
  {sheetId:"口径与来源",range:"A1:D15"},
]) {
  const check = await wb.inspect({kind:"table",sheetId:spec.sheetId,range:spec.range,include:"values,formulas",tableMaxRows:40,tableMaxCols:24,maxChars:12000});
  inspections.push(check.ndjson);
  const preview = await wb.render({sheetName:spec.sheetId,range:spec.range,scale:1.2,format:"png"});
  await fs.writeFile(`${qaDir}/${spec.sheetId}.png`,new Uint8Array(await preview.arrayBuffer()));
}
const errors = await wb.inspect({kind:"match",searchTerm:"#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",options:{useRegex:true,maxResults:300},summary:"final formula error scan"});
await fs.writeFile(`${qaDir}/inspect.txt`,inspections.join("\n")+"\nERRORS\n"+errors.ndjson,"utf8");
const output = await SpreadsheetFile.exportXlsx(wb);
await output.save(outPath);
console.log(JSON.stringify({outPath, previews:5, errorScan:errors.ndjson},null,2));
