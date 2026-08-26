import fs from "node:fs/promises";
import { Workbook, SpreadsheetFile } from "@oai/artifact-tool";

const dir = "D:/易迅数据/反倾销税深度分析报告/06_共聚聚甲醛（POM）";
const records = JSON.parse(await fs.readFile(`${dir}/POM_易迅跨查询逐票标准化.json`, "utf8"));
const summary = JSON.parse(await fs.readFile(`${dir}/POM_全量分析结果.json`, "utf8"));
const outPath = `${dir}/POM_易迅全量逐票判定台账.xlsx`;
const qaDir = `${dir}/QA_工作簿预览`;
await fs.mkdir(qaDir, { recursive: true });

const wb = Workbook.create();
const overview = wb.worksheets.add("概览");
const ledger = wb.worksheets.add("逐票全量");
const leads = wb.worksheets.add("重点线索");
const direct = wb.worksheets.add("直接受税来源");
const method = wb.worksheets.add("查询口径与来源");

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
  r.format.rowHeightPx = 40;
}
function header(r) {
  r.format = { fill: blue, font: { bold: true, color: "#FFFFFF", name: "Microsoft YaHei" }, wrapText: true, verticalAlignment: "center", borders: { preset: "all", style: "thin", color: border } };
  r.format.rowHeightPx = 32;
}
function section(r, text) {
  r.merge(); r.values = [[text]];
  r.format = { fill: paleBlue, font: { bold: true, color: navy, name: "Microsoft YaHei" }, verticalAlignment: "center" };
  r.format.rowHeightPx = 28;
}

// 概览
overview.showGridLines = false;
title(overview, "A1:H1", "共聚聚甲醛（POM）反倾销税与第三国转运风险核查");
overview.getRange("A2:H2").merge();
overview.getRange("A2:H2").values = [["措施：2025-01-24临时措施；2025-05-19终裁生效｜受税来源：美国、欧盟、台湾地区、日本｜易迅窗口：2024-08-06—2026-08-06"]];
overview.getRange("A2:H2").format = { fill: "#DCE6F1", font: { color: navy, italic: true, name: "Microsoft YaHei" }, wrapText: true };

section(overview.getRange("A4:H4"), "检索覆盖与跨查询去重");
overview.getRange("A5:C15").values = [
  ["查询", "页面原始行", "说明"],
  ["HS 390710", summary.query_raw_counts.HS390710, "7页×200；最后198条；全页完成"],
  ["POM", summary.query_raw_counts.POM, "15页×200；最后120条；全页完成"],
  ["HOSTAFORM", summary.query_raw_counts.HOSTAFORM, "3页：200+200+43"],
  ["DELRIN", summary.query_raw_counts.DELRIN, "6页：最后28条；均聚牌号用于排除"],
  ["DURACON", summary.query_raw_counts.DURACON, "1页；75条"],
  ["TENAC", summary.query_raw_counts.TENAC, "1页；3条"],
  ["CELCON", summary.query_raw_counts.CELCON, "2页：200+94"],
  ["共聚描述词", summary.query_raw_counts["POLYACETAL COPOLYMER"], "另查POLYOXYMETHYLENE COPOLYMER及CAS 24969-26-4，均0条"],
  ["合计（含跨查询重叠）", summary.raw_rows_total_including_cross_query_overlap, "所有页面行均已保存"],
  ["跨查询精确唯一记录", summary.exact_unique_cross_query, `中国大陆${summary.mainland_unique}；台湾/其他目的地${summary.taiwan_or_other_destination_unique}`],
];
header(overview.getRange("A5:C5"));
overview.getRange("A6:C15").format = { wrapText: true, borders: { preset: "all", style: "thin", color: border }, font: { name: "Microsoft YaHei", size: 10 }, verticalAlignment: "top" };
overview.getRange("B6:B15").format.numberFormat = "#,##0";

section(overview.getRange("E5:H5"), "核心结论");
overview.getRange("E6:H15").merge();
overview.getRange("E6:H15").values = [[
  "尚未获得能证明受税来源POM经第三国物理转运、改报第三国原产并逃缴中国反倾销税的闭合证据。最强核单线索为Acumen同批HOSTAFORM C52021：5,000kg、200包、金额字段9,000、买卖双方完全一致，仅相邻日期的原产字段在Germany与Philippines之间切换；该基础未填充牌号熔点约166℃，初步落入措施范围。第二条为越南Yamato向苏州东方发运TENAC-C EX352 50kg，货描#&JP而平台字段为Vietnam。两条均需中国报关单、原产地证、COA、批号、提单和税款缴款书才能定性。LW15EWX 25kg虽有#&DE，但公开参数显示蜡改性且熔点约173℃，初步不属于本案征税产品。"
]];
overview.getRange("E6:H15").format = { fill: paleGold, font: { color: "#5C4300", name: "Microsoft YaHei", size: 10 }, wrapText: true, verticalAlignment: "top", borders: { preset: "all", style: "thin", color: "#E0C15A" } };

section(overview.getRange("A17:H17"), "最具体线索、数量与条件税款");
overview.getRange("A18:H18").values = [["线索", "日期/路线", "实体", "商品/范围", "数量", "金额字段", "条件税款", "证据结论"]];
header(overview.getRange("A18:H18"));
overview.getRange("A19:H23").values = [
  ["Acumen原产字段切换", "2025-07-21/23 菲律宾数据→中国", "ACUMEN ENGINEERING PTE LTD→ACUMEN ENGINEERING SHANGHAI", "HOSTAFORM C52021 NATURAL；基础未填充、熔点约166℃", "保守1个事件/5,000kg；高值情景2票/10,000kg", "9,000/票；平台未标币种", "按德国34.5%及VAT13%：3,508.65/票；两票7,017.30（同金额币种）", "B+：同货票关键字段一致而原产切换；未取得中国申报，尚非逃税证明"],
  ["TENAC-C日本标记B腿", "2026-01-14 越南→中国", "YAMATO INDUSTRIES VIETNAM→SUZHOU INDUSTRIAL PARK ORIENTAL I/E", "TENAC-C EX352；共聚候选，需COA", "50kg（数量字段）", "10,732,331.50；平台未标币种", "若旭化成日本原产且漏税：按24.5%×1.13=2,971,245.98（同币种）", "B+：#&JP与Vietnam字段冲突；尚缺中国法定原产地申报"],
  ["沙特集中放量", "2025-07后 沙特→中国", "Hizam Al-Qahtani→Beijing Kang Jie Kong；SABIC链", "POLYACETALS/POM 90S/140S；范围待COA", "HS查询11行/959,650kg；POM查询另见7行/201,320kg，可能存在口径重叠", "无可用金额", "不测算", "B：措施后突然出现，需核生产厂；尚无受税来源A腿"],
  ["LW15EWX纠偏", "2026-05-26 越南→中国", "Hamakyu→上海恒久百传动", "HOSTAFORM LW15EWX；特殊蜡改性、熔点约173℃", "25kg（另有2kg色母）", "4,774,382.50；越南数据源币种未在JSON列示", "不计POM反倾销税", "B/C：原产字段核验线索，但当前范围反证较强"],
  ["欧盟直达核税", "终裁后 欧盟→中国", "Leschaco Nederland→Leschaco China Nanjing等", "POM PULVER、HOSTAFORM/CELCON；逐牌号核范围", "POM关键词47行/约3,511.5t；HOSTAFORM终裁后欧盟6组/平台242.816t", "多数无金额", "范围内按计税价×34.5%×1.13", "直接受税来源税款合规，不是第三国绕道"],
];
overview.getRange("A19:H23").format = { wrapText: true, verticalAlignment: "top", borders: { preset: "all", style: "thin", color: border }, font: { name: "Microsoft YaHei", size: 9 } };
overview.getRange("A19:H20").format.fill = paleRed;
overview.getRange("A22:H22").format.fill = paleGreen;

section(overview.getRange("A25:H25"), "税率与税种口径");
overview.getRange("A26:H30").values = [
  ["美国", "Ticona及其他美国公司", "74.9%", "条件总差额=完税价格×74.9%×1.13", "欧盟", "Celanese Germany及其他欧盟公司", "34.5%", "条件总差额=完税价格×34.5%×1.13"],
  ["台湾", "Polyplastics Taiwan", "3.8%", "×1.13", "台湾", "Formosa Plastics", "4.0%", "×1.13"],
  ["台湾", "其他台湾地区公司", "32.6%", "×1.13", "日本", "Polyplastics/其他日本公司", "35.5%", "×1.13"],
  ["日本", "Asahi Kasei", "24.5%", "×1.13", "税种", "仅反倾销税+其导致的进口VAT增量", "13%情景", "正常关税/基础VAT不写作逃税额"],
  ["范围", "HS39071010/39071090只是入口", "需同时满足公告结构和性能", "熔点160≤T<170℃、密度1.38—1.43等", "排除", "均聚POM、改性POM等", "逐牌号", "必须取TDS/COA，不得仅凭品牌或HS"],
];
overview.getRange("A26:H30").format = { wrapText: true, borders: { preset: "all", style: "thin", color: border }, font: { name: "Microsoft YaHei", size: 9 }, verticalAlignment: "top" };
overview.getRange("A26:H26").format.fill = paleBlue;
for (const [c,w] of [["A",19],["B",29],["C",15],["D",30],["E",18],["F",29],["G",16],["H",35]]) overview.getRange(`${c}1:${c}30`).format.columnWidth = w;
overview.freezePanes.freezeRows(2);

// 全量逐票台账：跨查询每一条唯一记录均有产品范围和路线判定；query_occurrences保留页面重复次数。
ledger.showGridLines = false;
const lh = ["序号","记录ID","命中查询","查询内出现次数","数据源","流向","日期","措施阶段","HS","商品描述","牌号","采购商","供应商","重量字段","数量字段","质量代理","质量口径","金额字段","目的地","平台原产字段","货描#&代码","#&对应国家","字段冲突","范围分类","范围理由","候选","路线风险","证据级别","路线研判","AD率%","税率说明","条件AD","条件VAT差额","条件合计","建议动作"];
const ld = records.map(r => [
  n(r.seq),s(r.record_id),s(r.query_hits),s(r.query_occurrences),s(r.data_source),s(r.flow),s(r.date),s(r.phase),s(r.hs),s(r.description),s(r.brand_grade),s(r.buyer),s(r.supplier),n(r.weight),n(r.quantity),n(r.mass_proxy),s(r.mass_basis),n(r.amount),s(r.destination),s(r.origin),s(r.origin_marker),s(r.marker_country),r.marker_conflict?"是":"否",s(r.scope_class),s(r.scope_reason),r.scope_candidate?"是":"否",s(r.route_risk),s(r.evidence_level),s(r.route_assessment),n(r.ad_rate_pct),s(r.rate_note),n(r.conditional_ad),n(r.conditional_vat_delta),n(r.conditional_total),s(r.recommended_action)
]);
ledger.getRange(`A1:AI${ld.length+1}`).values = [lh,...ld];
header(ledger.getRange("A1:AI1"));
ledger.tables.add(`A1:AI${ld.length+1}`, true, "POMAllUniqueRows").style = "TableStyleMedium2";
ledger.getRange(`A2:AI${ld.length+1}`).format = { wrapText: true, verticalAlignment: "top", font: { name: "Microsoft YaHei", size: 9 } };
ledger.getRange(`N2:R${ld.length+1}`).format.numberFormat = "#,##0.000";
ledger.getRange(`AD2:AH${ld.length+1}`).format.numberFormat = "#,##0.00";
ledger.getRange(`A2:AI${ld.length+1}`).format.rowHeightPx = 50;
ledger.freezePanes.freezeRows(1); ledger.freezePanes.freezeColumns(9);
ledger.getRange(`AA2:AA${ld.length+1}`).conditionalFormats.add("containsText", {text:"高",format:{fill:paleRed,font:{bold:true,color:"#9B1C1C"}}});
ledger.getRange(`AA2:AA${ld.length+1}`).conditionalFormats.add("containsText", {text:"中",format:{fill:paleGold,font:{color:"#7A5A00"}}});
ledger.getRange(`X2:X${ld.length+1}`).conditionalFormats.add("containsText", {text:"范围外",format:{fill:paleGreen,font:{color:"#256029"}}});
const lw=[8,17,24,22,15,10,12,15,14,58,22,29,31,12,12,12,20,16,14,18,12,18,11,25,42,10,12,12,45,11,31,15,15,15,42];
for(let i=0;i<lw.length;i++) ledger.getRangeByIndexes(0,i,ld.length+1,1).format.columnWidth=lw[i];

// 重点线索
leads.showGridLines = false;
title(leads,"A1:J1","重点第三国线索、直接核税对象及反证");
leads.getRange("A3:J3").values=[["线索","日期","路线/主体","商品","数量","金额字段","范围判断","税款情景","证据级别","下一步决定性数据"]];
header(leads.getRange("A3:J3"));
leads.getRange("A4:J12").values=[
  ["Acumen同批原产切换","2025-07-21/23","Acumen Singapore→Acumen Shanghai；平台分别Philippines/Germany","HOSTAFORM C52021 NATURAL","保守5,000kg；高值10,000kg","9,000/票；币种未标","基础未填充、熔点166℃，初步在范围","德国34.5%：每票AD3,105+VAT403.65=3,508.65","B+","中国进口报关单、CO、税单、批号、200袋包装、两个日期修撤单"],
  ["日本标记经越南","2026-01-14","Yamato Vietnam→Suzhou Oriental I/E","TENAC-C EX352 #&JP","50kg","10,732,331.50；币种未标","共聚候选；需全部性能COA","若旭化成日本24.5%，条件合计2,971,245.98同币种","B+","越南出口申报、中国原产地申报、COA、工厂批号、税单"],
  ["日本牌号经越南","2026-02-04","Morimura Vietnam→Morimura Shanghai","IUPITAL FV-30 NATURAL #&JP","50kg","11,563,400；币种未标","疑增强牌号，先核TDS","范围未定，不测税","B","TDS/COA、前序进口申报、生产批号、中国报关单"],
  ["德国/美国混合试料","2026-05-26","Hamakyu Vietnam→上海恒久百传动","LW15EWX25kg #&DE；CELCON LW90-S2 25kg #&US；越南色母4kg","54kg合票","8,293,037合计；币种未标","两种受税来源料均有较强改性/范围外指征","不计本案税差","B/C","同票报关单、四行原产地、两牌号TDS/COA"],
  ["沙特短期集中放量","2025-07起","Hizam→Beijing Kang Jie Kong；SABIC链","POLYACETALS/POM90S/140S","HS口径959,650kg；品牌口径201,320kg","无","通用品名，需COA与生产厂","不测税","B","沙特生产厂/产能、真实货主、House B/L、中国进口人"],
  ["POM PULVER欧盟直达","终裁后","Leschaco Nederland→Leschaco China Nanjing","09034/27045/13014 MB800等","47行/约3,511,503.4kg","无","粉料/MB800是否改性待核","若范围内：计税价×34.5%×1.13","A-/B+","真实进口人、生产商、TDS、House B/L、税款缴款书"],
  ["CELCON美国直达","终裁后","Ticona/美国节点→中国","CELCON M25/M90天然标准料","标准料约716,609.595kg","无","基础共聚料候选","计税价×74.9%×1.13","A-/B+","中国报关单、生产商税率、完税价格和缴款书"],
  ["日本宝理商业链","调查期/公开源","日本宝理→第三国关联贸易商→中国","DURACON等","公开文书未披露具体票量","—","官方确认商业中间环节","不证明物理转运","A2结构证据","关联贸易商合同/发票链、是否实际进入第三国、批号/箱号"],
  ["LW15EWX反证","2026-05-26","越南→中国；#&DE","HOSTAFORM LW15EWX","25kg","4,774,382.50","特殊蜡改性、熔点约173℃，初步范围外","不计POM反倾销税","B/C","当前批次TDS/COA、海关归类；仅留字段核验"],
];
leads.getRange("A4:J12").format={wrapText:true,verticalAlignment:"top",borders:{preset:"all",style:"thin",color:border},font:{name:"Microsoft YaHei",size:9}};
leads.getRange("A4:J5").format.fill=paleRed;
leads.getRange("A7:J7").format.fill=paleGold;
leads.getRange("A12:J12").format.fill=paleGreen;
const kw=[21,13,38,34,21,20,34,34,13,43]; for(let i=0;i<kw.length;i++) leads.getRangeByIndexes(0,i,12,1).format.columnWidth=kw[i];
leads.freezePanes.freezeRows(3);

// 直接受税来源候选（所有措施期/终裁期、受税来源、范围候选）
direct.showGridLines=false;
const taxed = new Set(["UNITED STATES","USA","U.S.A.","GERMANY","NETHERLANDS","BELGIUM","FRANCE","ITALY","SPAIN","AUSTRIA","EUROPEAN UNION","JAPAN","TAIWAN, PROVINCE OF CHINA","TAIWAN","TAIWAN, CHINA"]);
const directRows = records.filter(r=>r.destination_u==="CHINA" && r.phase!=="临时措施前" && taxed.has(r.origin_u) && r.scope_candidate);
const dh=["记录ID","日期","阶段","HS","商品描述","采购商","供应商","质量代理","质量口径","金额字段","原产字段","范围分类","AD率%","税率说明","条件税差","核查重点"];
const dd=directRows.map(r=>[s(r.record_id),s(r.date),s(r.phase),s(r.hs),s(r.description),s(r.buyer),s(r.supplier),n(r.mass_proxy),s(r.mass_basis),n(r.amount),s(r.origin),s(r.scope_class),n(r.ad_rate_pct),s(r.rate_note),n(r.conditional_total),s(r.recommended_action)]);
direct.getRange(`A1:P${dd.length+1}`).values=[dh,...dd]; header(direct.getRange("A1:P1"));
direct.tables.add(`A1:P${dd.length+1}`,true,"POMDirectTaxedCandidates").style="TableStyleMedium2";
direct.getRange(`A2:P${dd.length+1}`).format={wrapText:true,verticalAlignment:"top",font:{name:"Microsoft YaHei",size:9}};
direct.getRange(`H2:J${dd.length+1}`).format.numberFormat="#,##0.000"; direct.getRange(`M2:O${dd.length+1}`).format.numberFormat="#,##0.00";
direct.getRange(`A2:P${dd.length+1}`).format.rowHeightPx=48; direct.freezePanes.freezeRows(1);
const dw=[17,12,15,14,55,28,30,13,18,16,17,25,11,33,17,42]; for(let i=0;i<dw.length;i++) direct.getRangeByIndexes(0,i,dd.length+1,1).format.columnWidth=dw[i];

// 方法和来源
method.showGridLines=false; title(method,"A1:D1","查询口径、判定边界与公开来源");
method.getRange("A3:D3").values=[["类别","条件/规则","结果/边界","来源或说明"]]; header(method.getRange("A3:D3"));
method.getRange("A4:D23").values=[
  ["易迅税号","HS390710、目的地China、两年","1,398行；7页全量","平台目的地China会误纳台湾，逐票剔除"],
  ["易迅关键词","POM、HOSTAFORM、DELRIN、DURACON、TENAC、CELCON","共4,763行；全部页面完成","另查共聚描述词与CAS；保留0结果"],
  ["逐票覆盖","合计6,162页面行，跨查询精确唯一4,179","逐票范围+路线判定；查询内重复次数保留","工作簿“逐票全量”"],
  ["产品范围","HS39071010/39071090且满足公告化学结构/性能","熔点160≤T<170℃、密度1.38—1.43等","均聚、改性POM等排除；必须TDS/COA"],
  ["措施","商务部公告2025年第25号","2025-05-19起5年","https://www.mofcom.gov.cn/zcfb/zgdwjjmywg/art/2025/art_09eb6be1f50f4cdaa6a36dfbb09bb529.html"],
  ["初裁","商务部公告2025年第5号","2025-01-24起保证金；终裁范围/税率转税","https://www.mofcom.gov.cn/zwgk/zcfb/art/2025/art_980edf9a52a4464bbe38582874eca3ee.html"],
  ["税款公式","反倾销税=完税价格×企业税率","VAT增量=反倾销税×13%；合计=AD×1.13","金额字段只作代理；币种未标时不得写成美元"],
  ["德国Celanese链","德国生产商→欧盟关联贸易商→第三国关联贸易商→中国","官方核实商业链，不等于物理转运","商务部终裁调查文书"],
  ["日本宝理链","经第三国关联/非关联贸易商对华销售","官方核实商业链，不等于原产地伪报","商务部终裁调查文书"],
  ["宝理生产网络","日本、马来西亚、台湾、中国有生产厂","合法切换真实生产国与转售必须区分","https://www.polyplastics-global.com/cn/aboutus/network/production.html"],
  ["大赛璐说明","公开提及应根据反倾销税率切换出口国","供货来源优化意图；不证明违法","https://www.daicel.com/en/ir/pdf/q%26a_summary_25e-2q.pdf"],
  ["Hostaform手册","C52021基础未填充/熔点166℃；LW15EWX蜡改性/173℃","C52021为强核单线索；LW15EWX降级","https://www.celanese.com/-/media/Engineered%20Materials/Files/Product%20Sell%20Sheets/POM-062_HostaformProductManual_EU_EN_0614.pdf"],
  ["TENAC-C","旭化成官方说明TENAC-C为共聚POM","EX352仍须当前TDS/COA确认全指标","https://www.asahi-kasei-plastics.com/en/products/tenac/"],
  ["越南#&代码","中国大陆记录中#&与平台字段冲突约148条","多为#&CN，说明平台字段常是报告/发运国","只能作为原产地核验线索，不能单独定性"],
  ["证据门槛","A腿+B腿需同生产商、牌号、批号/箱号、数量包装、合理时滞","还须中国申报改报第三国且未缴税","当前无闭合双段提单/处罚/反规避认定"],
  ["Acumen","同批5t在Germany/Philippines字段间切换","保守1个商业事件；不能把重复行算10t","调修撤单、报关单、CO、批号和税单"],
  ["TENAC-C EX352","越南出口#&JP、平台Vietnam","50kg具体B腿线索；非已证实逃税","调中国申报原产地与日本工厂批号"],
  ["沙特","措施后集中出现POLYACETALS/POM","可能是真实替代供应，也可能需核实生产实质","调生产商证明、产能、COA及House B/L"],
  ["公开检索结论","未检出官方处罚、法院判决或反规避认定","商业网络/宏观流量只列结构风险","截至2026-08-13"],
  ["数据限制","没有中国18位报关编号、法定原产地、口岸、报关行、税单","不能认定少缴税或锁定口岸","下一步必须以中国进口申报闭环"],
];
method.getRange("A4:D23").format={wrapText:true,verticalAlignment:"top",font:{name:"Microsoft YaHei",size:9},borders:{preset:"all",style:"thin",color:border}};
method.getRange("A4:D23").format.rowHeightPx=50;
for(const [c,w] of [["A",20],["B",54],["C",42],["D",72]]) method.getRange(`${c}1:${c}23`).format.columnWidth=w;
method.freezePanes.freezeRows(3);

const specs=[
  {sheetId:"概览",range:"A1:H30"},
  {sheetId:"逐票全量",range:"A1:AI14"},
  {sheetId:"重点线索",range:"A1:J12"},
  {sheetId:"直接受税来源",range:`A1:P${Math.min(directRows.length+1,18)}`},
  {sheetId:"查询口径与来源",range:"A1:D23"},
];
const inspections=[];
for(const spec of specs){
  const check=await wb.inspect({kind:"table",sheetId:spec.sheetId,range:spec.range,include:"values,formulas",tableMaxRows:45,tableMaxCols:40,maxChars:20000});
  inspections.push(check.ndjson);
  const preview=await wb.render({sheetName:spec.sheetId,range:spec.range,scale:1.05,format:"png"});
  await fs.writeFile(`${qaDir}/${spec.sheetId}.png`,new Uint8Array(await preview.arrayBuffer()));
}
const errors=await wb.inspect({kind:"match",searchTerm:"#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",options:{useRegex:true,maxResults:300},summary:"final formula error scan"});
await fs.writeFile(`${qaDir}/inspect.txt`,inspections.join("\n")+"\nERRORS\n"+errors.ndjson,"utf8");
const output=await SpreadsheetFile.exportXlsx(wb); await output.save(outPath);
console.log(JSON.stringify({outPath,allRows:records.length,directRows:directRows.length,errorScan:errors.ndjson},null,2));
