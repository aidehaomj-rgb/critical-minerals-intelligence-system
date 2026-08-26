import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const inputPath = "D:/codex/氢氟酸/281111_目的国风险分析.xlsx";
const outputDir = "C:/Users/59809/Documents/关键矿产/outputs/281111_destination_risk";
const input = await FileBlob.load(inputPath);
const workbook = await SpreadsheetFile.importXlsx(input);

const summary = await workbook.inspect({
  kind: "workbook,sheet,table",
  maxChars: 10000,
  tableMaxRows: 8,
  tableMaxCols: 40,
  tableMaxCellChars: 100,
});
console.log(summary.ndjson);

const sheet = workbook.worksheets.getItem("Sheet1");
const used = sheet.getUsedRange();
console.log(JSON.stringify({ usedRange: used.address, rows: used.values.length, cols: used.values[0].length }));
console.log(JSON.stringify({ headers: used.values[0] }, null, 2));

const preview = await workbook.render({ sheetName: "Sheet1", range: "A1:AI25", scale: 1, format: "png" });
await fs.writeFile(`${outputDir}/review_input_preview.png`, new Uint8Array(await preview.arrayBuffer()));
