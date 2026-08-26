import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const input = await FileBlob.load("C:/Users/59809/Documents/关键矿产/outputs/281111_destination_recheck/281111_目的国风险分析_中高风险复核.xlsx");
const workbook = await SpreadsheetFile.importXlsx(input);
const sheet = workbook.worksheets.getItem("Sheet1");
const values = sheet.getUsedRange().values;
const headers = values[0].map((value) => String(value ?? "").trim());
const index = Object.fromEntries(headers.map((header, col) => [header, col]));
const wanted = ["编号", "报关单号", "最终目的国（地区）", "卸货地代码", "收货地点名称", "收货地点代码", "经停港(I)", "境外收发货人名称(外文)", "收货人企业名称", "复核_风险等级", "复核_结论", "复核_证据摘要", "复核_适用规则"];
const output = values.slice(1)
  .filter((row) => ["中", "高"].includes(String(row[index["复核_风险等级"]] ?? "")))
  .map((row) => Object.fromEntries(wanted.map((header) => [header, row[index[header]]])));
console.log(JSON.stringify(output, null, 2));
