import fs from "node:fs/promises";
import path from "node:path";
import { Workbook, SpreadsheetFile } from "@oai/artifact-tool";

const source = "D:/易迅数据/反倾销税深度分析报告/01_卤化丁基橡胶/卤化丁基橡胶_易迅逐票判定台账_合并去重.csv";
const summaryPath = "D:/易迅数据/反倾销税深度分析报告/01_卤化丁基橡胶/卤化丁基橡胶_易迅综合分析摘要.json";
const outputDir = "D:/易迅数据/反倾销税深度分析报告/01_卤化丁基橡胶";
const output = `${outputDir}/卤化丁基橡胶_易迅逐票判定台账.xlsx`;
const previewDir = `${outputDir}/_xlsx_qa`;

const csvText = (await fs.readFile(source, "utf8")).replace(/^\uFEFF/, "");
const summary = JSON.parse(await fs.readFile(summaryPath, "utf8"));
const wb = await Workbook.fromCSV(csvText, { sheetName: "逐票明细" });
const detail = wb.worksheets.getItem("逐票明细");
const overview = wb.worksheets.add("核查摘要");
const routes = wb.worksheets.add("路线汇总");
const policy = wb.worksheets.add("政策与口径");

const navy = "#17324D";
const blue = "#2A6F97";
const light = "#EAF2F8";
const pale = "#F7FAFC";
const amber = "#FFF3CD";
const red = "#FDE2E2";
const green = "#E2F0D9";
const gray = "#E5E7EB";

// Detail sheet
detail.showGridLines = false;
detail.freezePanes.freezeRows(1);
detail.freezePanes.freezeColumns(4);
const used = detail.getUsedRange();
used.format.font = { name: "Microsoft YaHei", size: 9, color: "#253444" };
detail.getRange("A1:V1").format = {
  fill: navy,
  font: { name: "Microsoft YaHei", size: 9, bold: true, color: "#FFFFFF" },
  wrapText: true,
  verticalAlignment: "center",
  horizontalAlignment: "center",
  borders: { preset: "outside", style: "thin", color: navy },
};
detail.getRange("A1:V1").format.rowHeight = 34;
const widths = {
  A: 14, B: 10, C: 12, D: 13, E: 52, F: 30, G: 30, H: 13, I: 13, J: 14,
  K: 15, L: 15, M: 18, N: 10, O: 10, P: 12, Q: 38, R: 19, S: 28, T: 28,
  U: 14, V: 14,
};
for (const [col, width] of Object.entries(widths)) detail.getRange(`${col}:${col}`).format.columnWidth = width;
detail.getRange("C2:C5583").format.numberFormat = "yyyy-mm-dd";
detail.getRange("H2:J5583").format.numberFormat = "#,##0.00";
detail.getRange("U2:W5583").format.numberFormat = "#,##0.00";
detail.getRange("E2:T5583").format.wrapText = true;
detail.getRange("A2:V5583").format.verticalAlignment = "top";
detail.getRange("P2:P5583").conditionalFormats.add("containsText", { text: "纳入", format: { fill: green, font: { color: "#215E21", bold: true } } });
detail.getRange("P2:P5583").conditionalFormats.add("containsText", { text: "待核", format: { fill: amber, font: { color: "#7A5500", bold: true } } });
detail.getRange("P2:P5583").conditionalFormats.add("containsText", { text: "排除", format: { fill: gray, font: { color: "#5B6573" } } });
detail.getRange("R2:R5583").conditionalFormats.add("containsText", { text: "直达中国", format: { fill: red, font: { color: "#9B1C1C", bold: true } } });
detail.getRange("R2:R5583").conditionalFormats.add("containsText", { text: "第三国来源进入中国", format: { fill: amber, font: { color: "#7A5500", bold: true } } });

// Overview
overview.showGridLines = false;
overview.freezePanes.freezeRows(3);
overview.getRange("A1:H1").merge();
overview.getRange("A1").values = [["卤化丁基橡胶｜易迅全量逐票核查摘要"]];
overview.getRange("A1:H1").format = { fill: navy, font: { name: "Microsoft YaHei", size: 18, bold: true, color: "#FFFFFF" }, horizontalAlignment: "left", verticalAlignment: "center" };
overview.getRange("A1:H1").format.rowHeight = 42;
overview.getRange("A2:H2").merge();
overview.getRange("A2").values = [["查询期：2025-08-06至2026-08-06｜HS 400239 + BROMOBUTYL｜全页分析并按可见字段去重"]];
overview.getRange("A2:H2").format = { fill: light, font: { name: "Microsoft YaHei", size: 10, color: navy }, wrapText: true };

overview.getRange("A4:H10").values = [
  ["指标", "数值", "说明", "指标", "数值", "说明", "状态", "备注"],
  ["HS查询原始票数", summary["查询完整性"]["HS400239"]["原始票数"], "24页全部采集", "关键词原始票数", summary["查询完整性"]["KW_BROMOBUTYL"]["原始票数"], "14页全部采集", "完成", ""],
  ["两口径原始合计", summary["合并去重"]["两查询原始合计"], "", "去重后票数", summary["合并去重"]["去重后"], "可见字段精确去重", "完成", ""],
  ["明确纳入", summary["合并去重"]["纳入"], "原料本体或明确牌号", "待核", summary["合并去重"]["待核"], "货描不足", "需复核", ""],
  ["排除", summary["合并去重"]["排除"], "制成品/无关货物", "受税来源直达中国", summary["路线汇总"]["受税来源直达中国"]["票数"], "9票，335,972.8kg", "高优先", "核税而非转口"],
  ["第三国来源进入中国", summary["路线汇总"]["第三国来源进入中国"]["票数"], "31票沙特原料+1票印度样品", "第三国进入中国重量", summary["路线汇总"]["第三国来源进入中国"]["重量合计"], "主要为沙特", "低/中", "沙特有真实产能"],
  ["跨段实体重合", summary["跨段实体重合"].length, "Exxon Mobil集团名重合", "绕道具体证据", 0, "未见提单/集装箱/数量闭合证据", "未证实", "不得据此认定规避"],
];
overview.getRange("A4:H4").format = { fill: blue, font: { name: "Microsoft YaHei", bold: true, color: "#FFFFFF" }, horizontalAlignment: "center", wrapText: true };
overview.getRange("A5:H10").format = { font: { name: "Microsoft YaHei", size: 10, color: "#253444" }, wrapText: true, verticalAlignment: "top", borders: { insideHorizontal: { style: "thin", color: "#DCE3EA" }, bottom: { style: "thin", color: "#DCE3EA" } } };
overview.getRange("B5:B10").format.numberFormat = "#,##0.00";
overview.getRange("E5:E10").format.numberFormat = "#,##0.00";
overview.getRange("A12:H12").merge();
overview.getRange("A12").values = [["结论：现有数据未形成第三国绕道的具体证据。沙特2222/2255大票有当地11万吨/年真实产能支持；9票英国/比利时原产直达中国是税款核验线索，应核对原产证、生产商与反倾销税缴款书。"]];
overview.getRange("A12:H12").format = { fill: amber, font: { name: "Microsoft YaHei", size: 11, bold: true, color: "#674D00" }, wrapText: true, verticalAlignment: "center", borders: { preset: "outside", style: "thin", color: "#E6B800" } };
overview.getRange("A12:H12").format.rowHeight = 64;
for (const c of ["A", "C", "D", "F", "G", "H"]) overview.getRange(`${c}:${c}`).format.columnWidth = c === "C" || c === "F" ? 26 : 18;
overview.getRange("B:B").format.columnWidth = 16;
overview.getRange("E:E").format.columnWidth = 18;

// Route summary
routes.showGridLines = false;
routes.getRange("A1:J1").merge();
routes.getRange("A1").values = [["路线与主体汇总"]];
routes.getRange("A1:J1").format = { fill: navy, font: { name: "Microsoft YaHei", size: 16, bold: true, color: "#FFFFFF" } };
routes.getRange("A3:F8").values = [
  ["路线", "票数", "明确纳入", "待核", "重量合计", "金额合计（原币混合，不可直接汇总为税基）"],
  ...Object.entries(summary["路线汇总"]).map(([name, r]) => [name, r["票数"], r["明确纳入"], r["待核"], r["重量合计"], r["金额合计"]]),
  ["合计", "=SUM(B4:B7)", "=SUM(C4:C7)", "=SUM(D4:D7)", "=SUM(E4:E7)", "=SUM(F4:F7)"],
];
routes.getRange("A3:F3").format = { fill: blue, font: { name: "Microsoft YaHei", bold: true, color: "#FFFFFF" }, wrapText: true };
routes.getRange("A4:F8").format = { font: { name: "Microsoft YaHei", size: 10 }, borders: { insideHorizontal: { style: "thin", color: "#DCE3EA" }, bottom: { style: "thin", color: "#DCE3EA" } } };
routes.getRange("B4:F8").format.numberFormat = "#,##0.00";
routes.getRange("A:A").format.columnWidth = 24; routes.getRange("B:E").format.columnWidth = 15; routes.getRange("F:F").format.columnWidth = 38;

const directRows = summary["对华明细"].filter(r => r["链路类型"] === "受税来源直达中国");
routes.getRange("A11:J11").values = [["日期", "货描", "采购商", "供应商", "重量kg", "目的国", "原产国", "税率口径", "证据等级", "下一步"]];
routes.getRange("A12:J20").values = directRows.map(r => [r["日期"], r["商品描述"], r["采购商"], r["供应商"], r["重量数值"], r["目的国地区"], r["原产国地区"], r["原产国地区"] === "United Kingdom" ? "71.9%" : "27.4%或71.9%，视生产商", "线索", "核对生产商、原产证、报关单、税款缴款书"]);
routes.getRange("A11:J11").format = { fill: blue, font: { name: "Microsoft YaHei", bold: true, color: "#FFFFFF" }, wrapText: true };
routes.getRange("A12:J20").format = { font: { name: "Microsoft YaHei", size: 9 }, wrapText: true, verticalAlignment: "top" };
routes.getRange("A:A").format.columnWidth = 13; routes.getRange("B:B").format.columnWidth = 45; routes.getRange("C:D").format.columnWidth = 28; routes.getRange("E:E").format.columnWidth = 14; routes.getRange("F:G").format.columnWidth = 14; routes.getRange("H:I").format.columnWidth = 20; routes.getRange("J:J").format.columnWidth = 35;
routes.getRange("E12:E20").format.numberFormat = "#,##0.00";
routes.freezePanes.freezeRows(3);

// Policy
policy.showGridLines = false;
policy.getRange("A1:F1").merge();
policy.getRange("A1").values = [["政策口径、税款公式与证据边界"]];
policy.getRange("A1:F1").format = { fill: navy, font: { name: "Microsoft YaHei", size: 16, bold: true, color: "#FFFFFF" } };
policy.getRange("A3:F10").values = [
  ["项目", "适用来源/企业", "税率", "生效期", "税款/核验口径", "来源"],
  ["现行措施", "美国公司", "75.5%", "2024-08-20起5年", "反倾销税=完税价格×税率", "https://www.mofcom.gov.cn/zwgk/zcfb/art/2024/art_fb218a61ce0f449cb678ce91617cfe1e.html"],
  ["现行措施", "ARLANXEO Belgium NV", "27.4%", "2024-08-20起5年", "进口增值税计税基础含反倾销税", "同上"],
  ["现行措施", "其他欧盟公司", "71.9%", "2024-08-20起5年", "比利时原产票必须确认生产商", "同上"],
  ["现行措施", "英国公司", "71.9%", "2024-08-20起5年", "英国原产票应核对反倾销税缴款书", "同上"],
  ["现行措施", "ARLANXEO Singapore Pte. Ltd.", "23.1%", "2024-08-20起5年", "", "同上"],
  ["现行措施", "其他新加坡公司", "45.2%", "2024-08-20起5年", "", "同上"],
  ["新增措施", "日本丁基株式会社/其他日本", "15.0%/30.1%", "2026-03-14起5年", "", "https://cacs.mofcom.gov.cn/cacscms/article/jkdc?articleId=187465&type=1"],
  ["新增措施", "加拿大公司", "13.8%", "2026-03-14起5年", "", "同上"],
];
policy.getRange("A3:F3").format = { fill: blue, font: { name: "Microsoft YaHei", bold: true, color: "#FFFFFF" }, wrapText: true };
policy.getRange("A4:F10").format = { font: { name: "Microsoft YaHei", size: 10 }, wrapText: true, verticalAlignment: "top", borders: { insideHorizontal: { style: "thin", color: "#DCE3EA" }, bottom: { style: "thin", color: "#DCE3EA" } } };
policy.getRange("A:A").format.columnWidth = 16; policy.getRange("B:B").format.columnWidth = 30; policy.getRange("C:D").format.columnWidth = 19; policy.getRange("E:E").format.columnWidth = 36; policy.getRange("F:F").format.columnWidth = 52;
policy.getRange("A12:F12").merge();
policy.getRange("A12").values = [["证据边界：易迅是贸易情报记录集合，不等同海关全量统计。平台金额混有不同币种/数据源，不能直接合计作为完税价格。本台账只给出线索级筛查，最终需以中国进口报关单、原产地证、生产商声明、合同发票及税款缴款书核验。"]];
policy.getRange("A12:F12").format = { fill: amber, font: { name: "Microsoft YaHei", size: 10, bold: true, color: "#674D00" }, wrapText: true, verticalAlignment: "center" };
policy.getRange("A12:F12").format.rowHeight = 72;
policy.freezePanes.freezeRows(3);

await fs.mkdir(outputDir, { recursive: true });
await fs.mkdir(previewDir, { recursive: true });

const inspect = await wb.inspect({ kind: "table", sheetId: "核查摘要", range: "A1:H12", include: "values,formulas", tableMaxRows: 20, tableMaxCols: 10, maxChars: 8000 });
await fs.writeFile(`${previewDir}/inspect_summary.ndjson`, inspect.ndjson, "utf8");
const errors = await wb.inspect({ kind: "match", searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A", options: { useRegex: true, maxResults: 200 }, summary: "formula error scan" });
await fs.writeFile(`${previewDir}/formula_errors.ndjson`, errors.ndjson, "utf8");
for (const [sheetName, range] of [["核查摘要", "A1:H12"], ["路线汇总", "A1:J20"], ["政策与口径", "A1:F12"], ["逐票明细", "A1:V25"]]) {
  const blob = await wb.render({ sheetName, range, scale: 1.4, format: "png" });
  await fs.writeFile(`${previewDir}/${sheetName}.png`, new Uint8Array(await blob.arrayBuffer()));
}

const xlsx = await SpreadsheetFile.exportXlsx(wb);
await xlsx.save(output);
console.log(JSON.stringify({ output, sheets: ["核查摘要", "路线汇总", "政策与口径", "逐票明细"], formulaErrors: errors.ndjson }, null, 2));
