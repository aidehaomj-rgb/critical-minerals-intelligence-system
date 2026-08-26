import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const outDir = process.env.EPDM_OUT || "D:/易迅数据/反倾销税深度分析报告/12_EPDM";
const xlsx = path.join(outDir, "EPDM_易迅逐票判定台账_阶段审计.xlsx");
const blob = await FileBlob.load(xlsx);
const wb = await SpreadsheetFile.importXlsx(blob);
const sheets = await wb.inspect({ kind: "sheet", include: "id,name", maxChars: 4000 });
const overview = await wb.inspect({
  kind: "table", range: "概览!A4:H11", include: "values,formulas",
  tableMaxRows: 8, tableMaxCols: 8, maxChars: 5000,
});
const errors = await wb.inspect({
  kind: "match", searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 300 }, summary: "post-export formula error scan", maxChars: 5000,
});
const qaDir = path.join(outDir, "QA_工作簿预览");
await fs.writeFile(path.join(qaDir, "post_export_sheets.ndjson"), sheets.ndjson || "", "utf8");
await fs.writeFile(path.join(qaDir, "post_export_overview.ndjson"), overview.ndjson || "", "utf8");
await fs.writeFile(path.join(qaDir, "post_export_formula_errors.ndjson"), errors.ndjson || "", "utf8");
console.log(sheets.ndjson);
console.log(overview.ndjson);
console.log(errors.ndjson);
