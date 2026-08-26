import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const inputPath = "E:/ZMJ/281111.xlsx";
const input = await FileBlob.load(inputPath);
const workbook = await SpreadsheetFile.importXlsx(input);

const summary = await workbook.inspect({
  kind: "workbook,sheet,table",
  maxChars: 20000,
  tableMaxRows: 8,
  tableMaxCols: 40,
  tableMaxCellChars: 120,
});

console.log(summary.ndjson);
