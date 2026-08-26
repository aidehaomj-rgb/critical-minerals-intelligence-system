import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const input = await FileBlob.load("D:/codex/氢氟酸/281111_目的国风险分析.xlsx");
const workbook = await SpreadsheetFile.importXlsx(input);
const sheet = workbook.worksheets.getItem("Sheet1");
const values = sheet.getUsedRange().values;
const headers = values[0].map((value) => String(value ?? "").trim());
const destinationIndex = headers.indexOf("最终目的国（地区）");
const counts = new Map();
for (const row of values.slice(1)) {
  const code = String(row[destinationIndex] ?? "").trim().toUpperCase();
  counts.set(code, (counts.get(code) ?? 0) + 1);
}
console.log(JSON.stringify([...counts.entries()].sort((a, b) => b[1] - a[1]), null, 2));
