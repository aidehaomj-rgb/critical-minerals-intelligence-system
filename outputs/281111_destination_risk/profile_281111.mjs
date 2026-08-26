import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const inputPath = "E:/ZMJ/281111.xlsx";
const input = await FileBlob.load(inputPath);
const workbook = await SpreadsheetFile.importXlsx(input);
const sheet = workbook.worksheets.getItem("Sheet1");
const values = sheet.getRange("A1:AB9456").values;
const headers = values[0].map((v) => String(v ?? "").trim());
const idx = Object.fromEntries(headers.map((h, i) => [h, i]));
const rows = values.slice(1);

function cell(row, header) {
  return row[idx[header]];
}

function norm(v) {
  return String(v ?? "").trim().toUpperCase();
}

function topCounts(items, n = 20) {
  const counts = new Map();
  for (const item of items) {
    const key = item || "(blank)";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])))
    .slice(0, n)
    .map(([value, count]) => ({ value, count }));
}

const destCodes = rows.map((r) => norm(cell(r, "最终目的国（地区）")));
const dischargePrefixes = rows.map((r) => norm(cell(r, "卸货地代码")).slice(0, 2));
const receivePrefixes = rows.map((r) => norm(cell(r, "收货地点代码")).slice(0, 2));
const transitCodes = rows.map((r) => norm(cell(r, "经停港(I)")));
const consigneeText = rows.map((r) =>
  [
    cell(r, "境外收发货人名称(外文)"),
    cell(r, "收货人企业名称"),
    cell(r, "收货地点名称"),
    cell(r, "货物简要描述"),
  ]
    .map(norm)
    .join(" | "),
);

const taiwanTextRows = rows
  .map((r, i) => ({ i: i + 2, text: consigneeText[i], dest: destCodes[i], unload: norm(cell(r, "卸货地代码")), receive: norm(cell(r, "收货地点代码")), no: cell(r, "编号") }))
  .filter((r) => /TAIWAN|TAIPEI|KAOHSIUNG|KEELUNG|TAICHUNG|HSINCHU|TAINAN|TAOYUAN|TWN|TW[A-Z]{3}/.test(r.text + " " + r.unload + " " + r.receive));

console.log(JSON.stringify({
  rows: rows.length,
  headers,
  destinationTop: topCounts(destCodes, 30),
  dischargePrefixTop: topCounts(dischargePrefixes, 30),
  receivePrefixTop: topCounts(receivePrefixes, 30),
  transitTop: topCounts(transitCodes, 30),
  taiwanTextRows: taiwanTextRows.slice(0, 30),
  taiwanTextRowsCount: taiwanTextRows.length,
}, null, 2));
