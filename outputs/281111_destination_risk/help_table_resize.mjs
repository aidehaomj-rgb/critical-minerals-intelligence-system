import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const input = await FileBlob.load("E:/ZMJ/281111.xlsx");
const workbook = await SpreadsheetFile.importXlsx(input);
console.log(workbook.help("table", { include: "index,examples,notes", maxChars: 8000 }).ndjson);
