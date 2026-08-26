import fs from "node:fs/promises";
import { Workbook, SpreadsheetFile } from "@oai/artifact-tool";

const source = "D:/易迅数据/反倾销税深度分析报告/02_油菜籽/油菜籽_易迅逐票判定台账_合并去重.csv";
const summaryPath = "D:/易迅数据/反倾销税深度分析报告/02_油菜籽/油菜籽_易迅综合分析摘要.json";
const outputDir = "D:/易迅数据/反倾销税深度分析报告/02_油菜籽";
const output = `${outputDir}/油菜籽_易迅逐票判定台账.xlsx`;
const previewDir = `${outputDir}/_xlsx_qa`;

const csvText = (await fs.readFile(source, "utf8")).replace(/^\uFEFF/, "");
const summary = JSON.parse(await fs.readFile(summaryPath, "utf8"));
const wb = await Workbook.fromCSV(csvText, { sheetName: "逐票明细" });
const detail = wb.worksheets.getItem("逐票明细");
const overview = wb.worksheets.add("核查摘要");
const routes = wb.worksheets.add("路线与实体");
const policy = wb.worksheets.add("政策与口径");
const n = summary["合并去重"]["去重后"];

const navy = "#17324D", blue = "#2A6F97", light = "#EAF2F8", amber = "#FFF3CD", red = "#FDE2E2", green = "#E2F0D9", gray = "#E5E7EB";

detail.showGridLines = false;
detail.freezePanes.freezeRows(1); detail.freezePanes.freezeColumns(4);
const used = detail.getUsedRange();
used.format.font = { name: "Microsoft YaHei", size: 9, color: "#253444" };
detail.getRange("A1:X1").format = { fill: navy, font: { name: "Microsoft YaHei", size: 9, bold: true, color: "#FFFFFF" }, wrapText: true, verticalAlignment: "center", horizontalAlignment: "center", borders: { preset: "outside", style: "thin", color: navy } };
detail.getRange("A1:X1").format.rowHeight = 34;
const widths = { A:14,B:10,C:12,D:13,E:52,F:30,G:30,H:13,I:13,J:14,K:15,L:15,M:20,N:28,O:10,P:10,Q:12,R:40,S:22,T:28,U:28,V:14,W:14,X:14 };
for (const [c,w] of Object.entries(widths)) detail.getRange(`${c}:${c}`).format.columnWidth = w;
detail.getRange(`H2:J${n+1}`).format.numberFormat = "#,##0.00";
detail.getRange(`V2:X${n+1}`).format.numberFormat = "#,##0.00";
detail.getRange(`E2:U${n+1}`).format.wrapText = true;
detail.getRange(`A2:X${n+1}`).format.verticalAlignment = "top";
detail.getRange(`Q2:Q${n+1}`).conditionalFormats.add("containsText", { text:"纳入", format:{fill:green,font:{color:"#215E21",bold:true}} });
detail.getRange(`Q2:Q${n+1}`).conditionalFormats.add("containsText", { text:"待核", format:{fill:amber,font:{color:"#7A5500",bold:true}} });
detail.getRange(`Q2:Q${n+1}`).conditionalFormats.add("containsText", { text:"排除", format:{fill:gray,font:{color:"#5B6573"}} });
detail.getRange(`S2:S${n+1}`).conditionalFormats.add("containsText", { text:"直达中国", format:{fill:red,font:{color:"#9B1C1C",bold:true}} });
detail.getRange(`S2:S${n+1}`).conditionalFormats.add("containsText", { text:"第三国来源进入中国", format:{fill:amber,font:{color:"#7A5500",bold:true}} });

overview.showGridLines = false;
overview.getRange("A1:H1").merge(); overview.getRange("A1").values = [["油菜籽｜易迅全量逐票核查摘要"]];
overview.getRange("A1:H1").format = { fill:navy,font:{name:"Microsoft YaHei",size:18,bold:true,color:"#FFFFFF"},verticalAlignment:"center" }; overview.getRange("A1:H1").format.rowHeight=42;
overview.getRange("A2:H2").merge(); overview.getRange("A2").values = [["查询期：2025-08-06至2026-08-06｜HS120510、120590 + CANOLA SEED、RAPESEED｜62页全部分析"]];
overview.getRange("A2:H2").format = { fill:light,font:{name:"Microsoft YaHei",size:10,color:navy},wrapText:true };
overview.getRange("A4:H9").values = [
  ["指标","数值","说明","指标","数值","说明","状态","备注"],
  ["四口径原始合计",summary["合并去重"]["四查询原始合计"],"12,100条","去重后",n,"可见字段精确去重","完成",""],
  ["明确纳入",summary["合并去重"]["纳入"],"本体/列明税号","待核",summary["合并去重"]["待核"],"六位税号且品名不足","需复核",""],
  ["排除",summary["合并去重"]["排除"],"油/粕/种用/误命中","加拿大直达中国（易迅）",0,"外部统计显示平台漏覆盖","覆盖缺口","不可推成真实0吨"],
  ["加拿大流向第三国",summary["路线汇总"]["加拿大流向第三国"]["票数"],"513纳入+47待核","第三国来源进入中国",summary["路线汇总"]["第三国来源进入中国"]["票数"],"全部哈萨克斯坦原产","低/中","无加拿大A段进入哈国"],
  ["两段共同中间国",summary["两段链路共同中间国"].length,"无国家闭环","跨段实体重合",summary["跨段实体重合"].length,"无企业闭环","未证实","无具体绕道证据"],
];
overview.getRange("A4:H4").format = {fill:blue,font:{name:"Microsoft YaHei",bold:true,color:"#FFFFFF"},horizontalAlignment:"center",wrapText:true};
overview.getRange("A5:H9").format = {font:{name:"Microsoft YaHei",size:10,color:"#253444"},wrapText:true,verticalAlignment:"top",borders:{insideHorizontal:{style:"thin",color:"#DCE3EA"},bottom:{style:"thin",color:"#DCE3EA"}}};
overview.getRange("A11:H11").merge(); overview.getRange("A11").values = [["结论：未形成加拿大油菜籽经第三国进入中国并逃避5.9%反倾销税的具体证据。加拿大A段流向巴基斯坦、孟加拉国、墨西哥，但对华B段为空；对华251票均为哈萨克斯坦原产。"]];
overview.getRange("A11:H11").format = {fill:amber,font:{name:"Microsoft YaHei",size:11,bold:true,color:"#674D00"},wrapText:true,verticalAlignment:"center",borders:{preset:"outside",style:"thin",color:"#E6B800"}}; overview.getRange("A11:H11").format.rowHeight=64;
for (const c of ["A","D","G","H"]) overview.getRange(`${c}:${c}`).format.columnWidth=19;
for (const c of ["C","F"]) overview.getRange(`${c}:${c}`).format.columnWidth=28;
overview.getRange("B:B").format.columnWidth=16; overview.getRange("E:E").format.columnWidth=18;

routes.showGridLines=false; routes.freezePanes.freezeRows(3);
routes.getRange("A1:G1").merge(); routes.getRange("A1").values=[["路线、国家与重点实体"]]; routes.getRange("A1:G1").format={fill:navy,font:{name:"Microsoft YaHei",size:16,bold:true,color:"#FFFFFF"}};
routes.getRange("A3:G8").values=[
  ["路线","票数","明确纳入","待核","重量原字段","数量原字段","金额原字段"],
  ...Object.entries(summary["路线汇总"]).map(([name,r])=>[name,r["票数"],r["明确纳入"],r["待核"],r["重量合计_原字段"],r["数量合计_原字段"],r["金额合计_原字段"]]),
  ["合计","=SUM(B4:B7)","=SUM(C4:C7)","=SUM(D4:D7)","=SUM(E4:E7)","=SUM(F4:F7)","=SUM(G4:G7)"],
];
routes.getRange("A3:G3").format={fill:blue,font:{name:"Microsoft YaHei",bold:true,color:"#FFFFFF"},wrapText:true}; routes.getRange("A4:G8").format={font:{name:"Microsoft YaHei",size:10},borders:{insideHorizontal:{style:"thin",color:"#DCE3EA"},bottom:{style:"thin",color:"#DCE3EA"}}}; routes.getRange("B4:G8").format.numberFormat="#,##0.00";
routes.getRange("A:A").format.columnWidth=24; routes.getRange("B:D").format.columnWidth=14; routes.getRange("E:G").format.columnWidth=22;
const thirdOrigins=summary["路线汇总"]["第三国来源进入中国"]["原产国"];
routes.getRange("A11:G11").values=[["对华第三国原产","票数","纳入","重量原字段","数量原字段","金额原字段","判断"]];
routes.getRange("A12:G12").values=thirdOrigins.map(x=>[x["名称"],x["票数"],x["明确纳入"],x["重量合计_原字段"],x["数量合计_原字段"],x["金额合计_原字段"],"真实第三国产品线索；无加拿大A段"]);
routes.getRange("A11:G11").format={fill:blue,font:{name:"Microsoft YaHei",bold:true,color:"#FFFFFF"},wrapText:true}; routes.getRange("A12:G12").format={font:{name:"Microsoft YaHei",size:10},wrapText:true};
routes.getRange("A15:G15").values=[["重点对象","角色","票数（名称变体未完全合并）","主要中国对手方","风险点","反证","下一步"]];
routes.getRange("A16:G20").values=[
  ["KOSTANAY ZERNOKORM","哈萨克供应商","约108","内蒙古汇丰收/伊鹏粮油","对华量较大","货描明确哈萨克原产；无加拿大A段","核农场、仓单、原产证"],
  ["MILIANG AGRICULTURE CORPORATION","哈萨克供应商","约60","甘肃米粮/满洲里丰和","同名关联链","仍为哈→中直接链","核生产者与铁路运单"],
  ["ALLIANCEEXPORT","哈萨克供应商","约18","甘肃聚粮源","多票稳定供应","公开产业背景可解释","抽核原产证"],
  ["BUNGE CANADA / RICHARDSON","加拿大A段供应商","多票","巴基斯坦压榨企业","高保证金期市场转移","巴基斯坦GM准入恢复","核当地入库和压榨"],
  ["加拿大直达中国","外部统计流","2026年1-6月187.6万吨","中国进口商未在易迅呈现","平台覆盖缺口","官方统计显示直达恢复","调中国报关单核5.9%税款"],
];
routes.getRange("A15:G15").format={fill:blue,font:{name:"Microsoft YaHei",bold:true,color:"#FFFFFF"},wrapText:true}; routes.getRange("A16:G20").format={font:{name:"Microsoft YaHei",size:9},wrapText:true,verticalAlignment:"top"};
routes.getRange("A:A").format.columnWidth=29; routes.getRange("B:B").format.columnWidth=20; routes.getRange("C:C").format.columnWidth=18; routes.getRange("D:G").format.columnWidth=30;

policy.showGridLines=false; policy.freezePanes.freezeRows(3);
policy.getRange("A1:F1").merge(); policy.getRange("A1").values=[["政策、税款口径与证据边界"]]; policy.getRange("A1:F1").format={fill:navy,font:{name:"Microsoft YaHei",size:16,bold:true,color:"#FFFFFF"}};
policy.getRange("A3:F7").values=[
  ["阶段","期间","税率/保证金","范围","税务口径","来源"],
  ["初裁","2025-08-14至2025-12-13","75.8%保证金","加拿大原产油菜籽","按终裁5.9%结算；多退少不补","https://interview.mofcom.gov.cn/mofcom_interview/front/opdata/downlodePdfNew?id=e7f48170937843acbb38b7e9f260bb7d"],
  ["过渡期","2025-12-14至2026-02-28","保证金退还","同上","海关退还","https://policy.mofcom.gov.cn/claw/clawContent.shtml?id=104994"],
  ["终裁","2026-03-01起5年","5.9%反倾销税","中国税号12051090、12059090","反倾销税=海关计税价格×5.9%","https://policy.mofcom.gov.cn/claw/clawContent.shtml?id=104994"],
  ["外部贸易","2026年1-6月","加拿大对华1,876,339吨","直达贸易","证明易迅0票是覆盖缺口","https://www.canolacouncil.org/markets-stats/exports/"],
];
policy.getRange("A3:F3").format={fill:blue,font:{name:"Microsoft YaHei",bold:true,color:"#FFFFFF"},wrapText:true}; policy.getRange("A4:F7").format={font:{name:"Microsoft YaHei",size:10},wrapText:true,verticalAlignment:"top",borders:{insideHorizontal:{style:"thin",color:"#DCE3EA"},bottom:{style:"thin",color:"#DCE3EA"}}};
policy.getRange("A:A").format.columnWidth=17; policy.getRange("B:C").format.columnWidth=22; policy.getRange("D:E").format.columnWidth=34; policy.getRange("F:F").format.columnWidth=55;
policy.getRange("A9:F9").merge(); policy.getRange("A9").values=[["证据边界：易迅未见加拿大直达中国不能解释为真实贸易为零。平台金额/重量/数量字段跨国口径不同，不能直接作为中国完税价格或混合求和税基。涉嫌逃避反倾销税的可确认数量为0；哈萨克斯坦对华37,560,217kg不得计入逃税数量。"]];
policy.getRange("A9:F9").format={fill:amber,font:{name:"Microsoft YaHei",size:10,bold:true,color:"#674D00"},wrapText:true,verticalAlignment:"center"}; policy.getRange("A9:F9").format.rowHeight=75;

await fs.mkdir(outputDir,{recursive:true}); await fs.mkdir(previewDir,{recursive:true});
const inspect=await wb.inspect({kind:"table",sheetId:"核查摘要",range:"A1:H11",include:"values,formulas",tableMaxRows:20,tableMaxCols:10,maxChars:8000}); await fs.writeFile(`${previewDir}/inspect_summary.ndjson`,inspect.ndjson,"utf8");
const errors=await wb.inspect({kind:"match",searchTerm:"#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",options:{useRegex:true,maxResults:200},summary:"formula error scan"}); await fs.writeFile(`${previewDir}/formula_errors.ndjson`,errors.ndjson,"utf8");
for(const [sheetName,range] of [["核查摘要","A1:H11"],["路线与实体","A1:G20"],["政策与口径","A1:F9"],["逐票明细","A1:X25"]]){const blob=await wb.render({sheetName,range,scale:1.3,format:"png"});await fs.writeFile(`${previewDir}/${sheetName}.png`,new Uint8Array(await blob.arrayBuffer()));}
const xlsx=await SpreadsheetFile.exportXlsx(wb); await xlsx.save(output);
console.log(JSON.stringify({output,sheets:["核查摘要","路线与实体","政策与口径","逐票明细"],formulaErrors:errors.ndjson},null,2));
