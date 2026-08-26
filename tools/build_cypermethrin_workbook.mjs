import fs from "node:fs/promises";
import { Workbook, SpreadsheetFile } from "@oai/artifact-tool";

const dir = "D:/易迅数据/反倾销税深度分析报告/05_氯氰菊酯";
const summary = JSON.parse(await fs.readFile(`${dir}/氯氰菊酯_全量分析结果.json`, "utf8"));
const ledgerRows = JSON.parse(await fs.readFile(`${dir}/氯氰菊酯_下载数据逐票标准化.json`, "utf8"));
const pageRows = JSON.parse(await fs.readFile(`${dir}/氯氰菊酯_页面摘录19条逐票判定.json`, "utf8"));
const outPath = `${dir}/氯氰菊酯_易迅逐票判定台账.xlsx`;
const qaDir = `${dir}/QA_工作簿预览`;
await fs.mkdir(qaDir, { recursive: true });

const wb = Workbook.create();
const overview = wb.worksheets.add("概览");
const ledger = wb.worksheets.add("逐票全量");
const page = wb.worksheets.add("页面对华19条");
const vietnam = wb.worksheets.add("越南A腿23票");
const chains = wb.worksheets.add("链路与税款");
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
  sheet.getRange(range).format = { fill: navy, font: { bold: true, color: "#FFFFFF", size: 18 }, verticalAlignment: "center" };
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
  range.format.rowHeightPx = 31;
}

function section(range, text) {
  range.merge();
  range.values = [[text]];
  range.format = { fill: paleBlue, font: { bold: true, color: navy }, verticalAlignment: "center" };
  range.format.rowHeightPx = 28;
}

function str(v) { return v === null || v === undefined ? "" : String(v); }
function num(v) { const n = Number(v); return Number.isFinite(n) ? n : 0; }

// Deduplicate the two 2026-05-29 Meghmani rows and any equivalent commercial-lot mirrors.
const vnMap = new Map();
for (const r of ledgerRows) {
  if (r.date < "2025-05-07" || str(r.destination).toUpperCase() !== "VIETNAM" || str(r.origin).toUpperCase() !== "INDIA") continue;
  if (r.scope_class !== "技术级/原药（措施范围候选）") continue;
  if (!/越南|VIETNAM/i.test(str(r.data_source))) continue;
  const key = r.commercial_lot_key || [r.date,r.buyer,r.supplier,r.weight,r.quantity,r.amount,r.destination,r.origin].join("|");
  if (!vnMap.has(key)) vnMap.set(key, r);
}
const vnRows = [...vnMap.values()].sort((a,b)=>b.date.localeCompare(a.date));

// Overview
overview.showGridLines = false;
title(overview, "A1:H1", "氯氰菊酯反倾销税与第三国转运风险核查");
overview.getRange("A2:H2").merge();
overview.getRange("A2:H2").values = [["易迅下载期：2024-08-06至2026-08-06｜措施生效：2025-05-07｜受税来源：印度｜中国申报商品编号2926909013"]];
overview.getRange("A2:H2").format = { fill: "#DCE6F1", font: { color: navy, italic: true }, wrapText: true };

section(overview.getRange("A4:H4"), "核心量化结果（公式链接逐票台账）");
overview.getRange("A5:B13").values = [
  ["5表原始命中", 1145],
  ["完全去重唯一记录", null],
  ["措施范围候选", null],
  ["措施后印度→中国", null],
  ["措施后第三国→中国B腿", null],
  ["页面对华原始记录", 19],
  ["页面保守商业批次", 8],
  ["越南进口侧印度原产技术级", null],
  ["越南进口侧数量kg", null],
];
overview.getRange("B6:B13").formulas = [
  ["=COUNTA('逐票全量'!$A$2:$A$1030)"],
  ["=COUNTIF('逐票全量'!$V$2:$V$1030,\"TRUE\")"],
  ["=COUNTIFS('逐票全量'!$W$2:$W$1030,\"高\",'逐票全量'!$R$2:$R$1030,\"China\",'逐票全量'!$S$2:$S$1030,\"India\")"],
  ["=COUNTIFS('逐票全量'!$W$2:$W$1030,\"高\",'逐票全量'!$R$2:$R$1030,\"China\",'逐票全量'!$S$2:$S$1030,\"<>India\")"],
  [19],
  [8],
  ["=COUNTA('越南A腿23票'!$A$2:$A$24)"],
  ["=SUM('越南A腿23票'!$J$2:$J$24)"],
];
overview.getRange("A5:A13").format = { fill: paleGray, font: { bold: true }, wrapText: true };
overview.getRange("B5:B13").format = { fill: "#FFFFFF", font: { bold: true, color: blue }, numberFormat: "#,##0.000" };

section(overview.getRange("D5:H5"), "核心结论");
overview.getRange("D6:H13").merge();
overview.getRange("D6:H13").values = [[
  "本批5个易迅工作簿未发现第三国→中国的技术级氯氰菊酯B腿，因而没有闭合的“印度→第三国→中国”物理转运证据。最强直接风险是2026-02-28 Tagros向IPO LTD SHNGHAI发运16,000kg、USD95,200的印度原产92%技术级产品；若未按Tagros 48.4%缴纳反倾销税，按农药进口增值税9%情景，反倾销税USD46,076.80、连带增值税差额USD4,146.91，合计USD50,223.71。越南进口侧另有23票/162,325.005kg印度原产技术级产品，其中UPL Mauritius与Sundat Singapore均为第三国商业供应商，但原产地仍明确印度，只能证明商业中介/A腿，不能认定洗产地。"
]];
overview.getRange("D6:H13").format = { fill: paleGold, font: { color: "#5C4300" }, wrapText: true, verticalAlignment: "top", borders: { preset: "outside", style: "thin", color: "#E0C15A" } };

section(overview.getRange("A15:H15"), "重点票、数量与涉及税种");
overview.getRange("A16:H16").values = [["线索","日期/路线","主体","商品","数量/金额","税率","税款情景","证据结论"]];
header(overview.getRange("A16:H16"));
overview.getRange("A17:H20").values = [
  ["直接对华","2026-02-28 India→China","Tagros→IPO LTD SHNGHAI","Cypermethrin Technical 92%; CAS52315-07-8","16,000kg / USD95,200","AD 48.4%","AD 46,076.80；VAT(9%)差额4,146.91；合计50,223.71美元","A：印度出口侧明确；缺中国报关/缴税记录"],
  ["页面保守合并","2026-01-06至02-28 India→China","Tagros 2批+Meghmani 1批","普通氯氰菊酯技术级","3批/68,000kg / USD392,800","48.4%或62%","AD 217,532.80；VAT差额19,577.95；合计237,110.75美元","A/B：出口侧；页面重复按保守批次去重"],
  ["Alpha待核","2026-02-09 India→China","Meghmani→买方未公开","Alpha-Cypermethrin Technical","9,000kg / USD83,250","暂按62%","AD 51,615.00；VAT差额4,645.35；合计56,260.35美元","B：终裁列明Alpha CAS，但该票未显示CAS"],
  ["商业中介A腿","2025-07-28 India→Vietnam","UPL Mauritius→UPL Vietnam","Technical min92%","18,000kg / VND3,200,868,000","不在中国计税环节","无中国B腿，不测中国税额","B+：第三国商业开票；仍明确印度原产"],
];
overview.getRange("A17:H20").format = { wrapText: true, verticalAlignment: "top", borders: { preset: "inside", style: "thin", color: border } };
overview.getRange("A17:H17").format.fill = paleRed;
overview.getRange("A20:H20").format.fill = paleGreen;

section(overview.getRange("A22:H22"), "政策范围与实体优先级");
overview.getRange("A23:B29").values = [
  ["措施范围","Cypermethrin / Cypermethrin technical / Cipermethrin；CAS 52315-07-8、67375-30-8、1315501-18-8；中国10位编号2926909013。"],
  ["税率","Gharda75.7%；UPL166.2%；Tagros48.4%；Meghmani/Bharat Rasayan/Heranba各62%；其他印度公司166.2%。"],
  ["直接风险主体","IPO LTD SHNGHAI（需识别完整中文注册主体）；Tagros；Meghmani；中国实际进口人。"],
  ["商业链主体","UPL India—UPL Mauritius—UPL Shanghai为官方确认关联商业链；另核UPL Vietnam、Sundat Singapore/Vietnam。"],
  ["越南批号","Shogun→Fumakilla：090126CPR、080126CPR、070825CPR等；Heranba BN:187。"],
  ["决定性证据","中国进口报关单、原产地证、生产商、COA/CAS、批号、集装箱号、商业发票、税款缴款书。"],
  ["当前结论","有直接对华应税核查线索、有第三国商业中介/A腿；无物理转运至中国或伪报原产地闭环。"],
];
overview.getRange("A23:A29").format = { fill: paleGray, font: { bold: true }, wrapText: true };
overview.getRange("B23:H29").merge(true);
overview.getRange("B23:H29").format = { wrapText: true, verticalAlignment: "top" };

overview.getRange("A1:H29").format.font = { name: "Microsoft YaHei", size: 10 };
overview.getRange("A1:H29").format.wrapText = true;
overview.getRange("A1:H29").format.borders = { preset: "outside", style: "thin", color: border };
for (const [c,w] of [["A",18],["B",18],["C",31],["D",24],["E",25],["F",15],["G",31],["H",31]]) overview.getRange(`${c}1:${c}29`).format.columnWidth = w;
overview.freezePanes.freezeRows(2);

// Full-row ledger. Every unique downloaded record has a scope and route assessment.
ledger.showGridLines = false;
const lh = ["ID","命中查询","源文件","数据源","流向","日期","HS编码","商品描述","采购商","供应商","重量","数量","折算kg","重量口径","金额","币种说明","CAS","目的国","原产国","范围分类","范围理由","措施范围候选","路线风险","证据等级","路线研判","建议动作","措施后"];
const ld = ledgerRows.map(r=>[
  num(r.record_id),str(r.query_hits),str(r.source_file),str(r.data_source),str(r.flow),str(r.date),str(r.hs),str(r.description),str(r.buyer),str(r.supplier),
  num(r.weight),num(r.quantity),num(r.mass_kg),str(r.mass_basis),num(r.amount),str(r.amount_currency_note),str(r.cas),str(r.destination),str(r.origin),str(r.scope_class),str(r.scope_reason),
  str(r.is_scope_candidate).toUpperCase(),str(r.route_risk),str(r.evidence_level),str(r.route_assessment),str(r.recommended_action),str(r.post_measure).toUpperCase(),
]);
ledger.getRange(`A1:AA${ld.length+1}`).values = [lh,...ld];
header(ledger.getRange("A1:AA1"));
ledger.tables.add(`A1:AA${ld.length+1}`, true, "CypermethrinAllRows").style = "TableStyleMedium2";
ledger.getRange(`A2:AA${ld.length+1}`).format = { wrapText: true, verticalAlignment: "top", font: { name: "Microsoft YaHei", size: 9 } };
ledger.getRange(`K2:O${ld.length+1}`).format.numberFormat = "#,##0.000";
ledger.getRange(`A2:AA${ld.length+1}`).format.rowHeightPx = 52;
ledger.freezePanes.freezeRows(1);
ledger.freezePanes.freezeColumns(7);
ledger.getRange(`W2:W${ld.length+1}`).conditionalFormats.add("containsText",{text:"高",format:{fill:paleRed,font:{bold:true,color:"#9B1C1C"}}});
ledger.getRange(`W2:W${ld.length+1}`).conditionalFormats.add("containsText",{text:"中",format:{fill:paleGold,font:{color:"#7A5A00"}}});
ledger.getRange(`T2:T${ld.length+1}`).conditionalFormats.add("containsText",{text:"实验室",format:{fill:paleGray,font:{color:"#666666"}}});
const lw=[7,21,30,12,9,12,13,56,28,30,11,11,12,19,15,27,18,16,16,30,37,14,12,12,44,40,12];
for(let i=0;i<lw.length;i++) ledger.getRangeByIndexes(0,i,ld.length+1,1).format.columnWidth=lw[i];

// Preserved page evidence.
page.showGridLines = false;
const ph=["记录ID","日期","HS","商品描述","采购商","供应商","重量","数量","折算kg","金额USD","目的国","原产国","批次/指纹","重复组","范围分类","证据等级","分析备注","来源URL"];
const pd=pageRows.map(r=>[str(r.record_id),str(r.date),str(r.hs_code),str(r.goods_description),str(r.buyer),str(r.supplier),num(r.weight_reported),num(r.quantity_reported),num(r.mass_kg),num(r.amount_reported),str(r.destination),str(r.origin),str(r.brand_grade_batch),str(r.conservative_group),str(r.scope_class),str(r.evidence_level),str(r.analyst_note),str(r.source_url)]);
page.getRange(`A1:R${pd.length+1}`).values=[ph,...pd];
header(page.getRange("A1:R1"));
page.tables.add(`A1:R${pd.length+1}`,true,"CypermethrinPage19").style="TableStyleMedium2";
page.getRange(`A2:R${pd.length+1}`).format={wrapText:true,verticalAlignment:"top",font:{name:"Microsoft YaHei",size:9}};
page.getRange(`G2:J${pd.length+1}`).format.numberFormat="#,##0.00";
page.getRange(`A2:R${pd.length+1}`).format.rowHeightPx=58;
page.freezePanes.freezeRows(1);
const pw=[13,12,13,49,25,31,11,11,12,14,13,13,24,27,31,11,37,51];
for(let i=0;i<pw.length;i++) page.getRangeByIndexes(0,i,pd.length+1,1).format.columnWidth=pw[i];

// Vietnam import-side A-leg records.
vietnam.showGridLines=false;
const vh=["序号","日期","HS","商品描述","越南买方","境外供应商","原产国","CAS","范围分类","折算kg","金额VND","商业中介标识","研判"];
const vd=vnRows.map((r,i)=>[i+1,r.date,r.hs,r.description,r.buyer,r.supplier,r.origin,r.cas,r.scope_class,num(r.mass_kg),num(r.amount),/MAURITIUS|PTE LTD/i.test(str(r.supplier))?"是":"否","仅为印度→越南A腿；无越南→中国B腿，不得认定绕道"]);
vietnam.getRange(`A1:M${vd.length+1}`).values=[vh,...vd];
header(vietnam.getRange("A1:M1"));
vietnam.tables.add(`A1:M${vd.length+1}`,true,"VietnamALeg23").style="TableStyleMedium2";
vietnam.getRange(`A2:M${vd.length+1}`).format={wrapText:true,verticalAlignment:"top",font:{name:"Microsoft YaHei",size:9}};
vietnam.getRange(`J2:K${vd.length+1}`).format.numberFormat="#,##0.000";
vietnam.getRange(`A2:M${vd.length+1}`).format.rowHeightPx=61;
vietnam.getRange(`L2:L${vd.length+1}`).conditionalFormats.add("containsText",{text:"是",format:{fill:paleGold,font:{bold:true,color:"#7A5A00"}}});
vietnam.freezePanes.freezeRows(1);
const vw=[8,12,13,53,28,31,13,18,28,13,18,16,42];
for(let i=0;i<vw.length;i++) vietnam.getRangeByIndexes(0,i,vd.length+1,1).format.columnWidth=vw[i];

// Chains and tax scenarios.
chains.showGridLines=false;
title(chains,"A1:I1","具体链路、证据分级与条件性税款测算");
chains.getRange("A3:I3").values=[["场景","日期","主体/路线","商品","数量kg","金额","AD税率","AD税/连带VAT差额","证据结论"]];
header(chains.getRange("A3:I3"));
chains.getRange("A4:I9").values=[
  ["Tagros直接对华","2026-02-28","Tagros→IPO LTD SHNGHAI；India→China","Technical92%; CAS52315-07-8",16000,95200,"48.4%","AD 46,076.80；VAT9%差额4,146.91；合计50,223.71美元","A：产品/来源/主体明确；缺中国进口单证"],
  ["Meghmani页面大票","2026-02-21","Meghmani→未公开买方；India→China","Cypermethrin Technical",36000,201600,"62.0%","AD 124,992.00；VAT9%差额11,249.28；合计136,241.28美元","A/B：出口侧大票；页面重复保守合并为1批"],
  ["Tagros第二批","2026-01-06","Tagros→未公开买方；India→China","Cypermethrin Technical",16000,96000,"48.4%","AD 46,464.00；VAT9%差额4,181.76；合计50,645.76美元","A/B：出口侧；缺中国进口人"],
  ["Alpha待核","2026-02-09","Meghmani→未公开买方；India→China","Alpha-Cypermethrin Technical",9000,83250,"暂按62%","AD 51,615.00；VAT9%差额4,645.35；合计56,260.35美元","B：Alpha CAS在终裁范围，但该票未显示CAS"],
  ["UPL毛里求斯商业链","2025-07-28","UPL Mauritius→UPL Vietnam；India→Vietnam","Technical min92%",18000,3200868000,"—","金额为VND；无中国税款测算","B+：商业中介明确且仍报印度原产；无B腿"],
  ["Sundat新加坡商业链","2026-01-22","Sundat (S) Pte→Sundat Vietnam；India→Vietnam","Cypermethrin92% TG",5250,876657600,"—","金额为VND；无中国税款测算","B：商业中介明确且仍报印度原产；无B腿"],
];
chains.getRange("A4:I9").format={wrapText:true,verticalAlignment:"top",borders:{preset:"all",style:"thin",color:border},font:{name:"Microsoft YaHei",size:9}};
chains.getRange("E4:F9").format.numberFormat="#,##0.00";
chains.getRange("A4:I4").format.fill=paleRed;
chains.getRange("A8:I9").format.fill=paleGreen;
chains.getRange("A11:I11").merge();
chains.getRange("A11:I11").values=[["税款说明：只测反倾销税及其引致的进口增值税差额，不把正常关税/基础增值税写成‘逃税额’。出口金额仅近似计税价格；农药进口增值税按9%政策情景，实际仍须以中国税单税率栏、用途与计税价格为准。"]];
chains.getRange("A11:I11").format={fill:paleGold,wrapText:true,font:{color:"#5C4300"}};
chains.getRange("A11:I11").format.rowHeightPx=60;
const cw=[23,13,38,32,13,18,14,39,43];
for(let i=0;i<cw.length;i++) chains.getRangeByIndexes(0,i,11,1).format.columnWidth=cw[i];

// Method and sources.
sources.showGridLines=false;
title(sources,"A1:D1","查询覆盖、判定规则与公开来源");
sources.getRange("A3:D3").values=[["类别","条件/规则","结果","说明/URL"]];
header(sources.getRange("A3:D3"));
sources.getRange("A4:D20").values=[
  ["下载查询","CAS 1315501-18-8；2年；全部国家/流向","4条","原始工作簿逐行分析"],
  ["下载查询","CAS 52315-07-8；2年；全部国家/流向","799条","原始工作簿逐行分析"],
  ["下载查询","CAS 67375-30-8；2年；全部国家/流向","203条","原始工作簿逐行分析"],
  ["下载查询","CIPERMETHRIN；HS292690；2年；全部","4条","原始工作簿逐行分析"],
  ["下载查询","CYPERMETHRIN TECHNICAL；HS292690；2年；全部","135条","原始工作簿逐行分析"],
  ["全量覆盖","1,145原始行；精确去重1,029；格式镜像去重1,024；保守商业票1,009","全部逐条分类","所有唯一行保留在“逐票全量”"],
  ["范围规则","终裁列明3个CAS；技术级/高纯/工业包装优先；制剂、复配和mg标准品分开","精确唯一候选534；格式镜像去重531","CAS命中不等于自动属于措施范围"],
  ["路线规则","措施后India→China=直接应税核查；India→第三国=A腿；第三国→China=B腿","B腿0条","只有A腿不得认定转运"],
  ["政策","商务部公告2025年第24号","2025-05-07起5年","https://www.mofcom.gov.cn/zcfb/zgdwjjmywg/art/2025/art_f4dda218753844ad8244cd84442c7992.html"],
  ["海关申报","海关总署公告2025年第3号；中国10位编号2926909013","3个CAS","https://www.mofcom.gov.cn/zcfb/zgdwjjmywg/art/2025/art_891c7244e10b4cbdbe1688e288a18e87.html"],
  ["增值税","销售或进口农药适用9%政策口径","税单实核","https://www.chinatax.gov.cn/chinatax/n810356/n3255681/c5236314/content.html"],
  ["UPL年报","毛里求斯、新加坡、东南亚关联网络","结构风险","https://www.upl-ltd.com/financial_result_and_report_pdfs/Da7CGgxBEBSh8KKSrznTRJFTNU3ahra0yEy0O8R4/UPL_Annual-Report_2023-24.pdf"],
  ["Tagros","印度多基地、全球出口及第三国网络","结构风险","https://tagros.com/"],
  ["Meghmani","Cypermethrin technical; CAS52315-07-8; 93%","产品指纹","https://meghmani.com/product/cypermethrin-technical/"],
  ["Gharda","93—94%、25/225kg桶、UN3352","包装指纹","https://www.gharda.com/wp-content/uploads/2023/09/Cypermethrin.pdf"],
  ["证据边界","未发现官方处罚、反规避认定或可闭合双段提单","无实证闭环","商业网络与转运能力不等于已违法"],
  ["浏览器复核","已登录页面尝试关键词+China+两年；平台响应超时，使用已下载两年全量表与保存页面19条交叉核验","透明限制","没有以局部页面代替全量数据"],
];
sources.getRange("A4:D20").format={wrapText:true,verticalAlignment:"top",font:{name:"Microsoft YaHei",size:9},borders:{preset:"inside",style:"thin",color:border}};
sources.getRange("A4:D20").format.rowHeightPx=49;
sources.getRange("A1:A20").format.columnWidth=18;
sources.getRange("B1:B20").format.columnWidth=55;
sources.getRange("C1:C20").format.columnWidth=23;
sources.getRange("D1:D20").format.columnWidth=69;
sources.freezePanes.freezeRows(3);

const specs=[
  {sheetId:"概览",range:"A1:H29"},
  {sheetId:"逐票全量",range:"A1:AA14"},
  {sheetId:"页面对华19条",range:"A1:R20"},
  {sheetId:"越南A腿23票",range:"A1:M24"},
  {sheetId:"链路与税款",range:"A1:I11"},
  {sheetId:"口径与来源",range:"A1:D20"},
];
const inspections=[];
for(const spec of specs){
  const check=await wb.inspect({kind:"table",sheetId:spec.sheetId,range:spec.range,include:"values,formulas",tableMaxRows:45,tableMaxCols:30,maxChars:15000});
  inspections.push(check.ndjson);
  const preview=await wb.render({sheetName:spec.sheetId,range:spec.range,scale:1.15,format:"png"});
  await fs.writeFile(`${qaDir}/${spec.sheetId}.png`,new Uint8Array(await preview.arrayBuffer()));
}
const errors=await wb.inspect({kind:"match",searchTerm:"#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",options:{useRegex:true,maxResults:300},summary:"final formula error scan"});
await fs.writeFile(`${qaDir}/inspect.txt`,inspections.join("\n")+"\nERRORS\n"+errors.ndjson,"utf8");
const output=await SpreadsheetFile.exportXlsx(wb);
await output.save(outPath);
console.log(JSON.stringify({outPath,rows:ledgerRows.length,vietnamRows:vnRows.length,errorScan:errors.ndjson},null,2));
