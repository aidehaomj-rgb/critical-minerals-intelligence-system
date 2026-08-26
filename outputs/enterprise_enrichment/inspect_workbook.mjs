import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const inputPath = "E:/ZMJ/企业人员电话大表.xlsx";
const input = await FileBlob.load(inputPath);
const workbook = await SpreadsheetFile.importXlsx(input);
const summary = await workbook.inspect({
  kind: "workbook,sheet,table",
  maxChars: 12000,
  tableMaxRows: 20,
  tableMaxCols: 20,
  tableMaxCellChars: 100,
});
console.log(summary.ndjson);
