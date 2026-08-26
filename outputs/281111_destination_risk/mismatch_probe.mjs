import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const input = await FileBlob.load("E:/ZMJ/281111.xlsx");
const workbook = await SpreadsheetFile.importXlsx(input);
const sheet = workbook.worksheets.getItem("Sheet1");
const values = sheet.getRange("A1:AB9456").values;
const headers = values[0].map((v) => String(v ?? "").trim());
const idx = Object.fromEntries(headers.map((h, i) => [h, i]));
const rows = values.slice(1);

const iso3ToIso2 = {
  AFG: "AF", AGO: "AO", ALB: "AL", ARE: "AE", ARG: "AR", ARM: "AM", AUS: "AU", AUT: "AT", AZE: "AZ",
  BGD: "BD", BGR: "BG", BHR: "BH", BOL: "BO", BRA: "BR", BRN: "BN",
  CAN: "CA", CHE: "CH", CHL: "CL", CHN: "CN", COL: "CO", CRI: "CR", CZE: "CZ",
  DEU: "DE", DJI: "DJ", DZA: "DZ",
  ECU: "EC", EGY: "EG", ESP: "ES", EST: "EE", ETH: "ET",
  FIN: "FI", FRA: "FR",
  GBR: "GB", GHA: "GH", GRC: "GR",
  HKG: "HK", HUN: "HU",
  IDN: "ID", IND: "IN", IRL: "IE", IRN: "IR", ISR: "IL", ITA: "IT",
  JPN: "JP", JOR: "JO",
  KAZ: "KZ", KEN: "KE", KHM: "KH", KOR: "KR", KWT: "KW",
  LAO: "LA", LBN: "LB", LKA: "LK",
  MAR: "MA", MDG: "MG", MEX: "MX", MMR: "MM", MNG: "MN", MYS: "MY",
  NLD: "NL", NOR: "NO", NZL: "NZ",
  OMN: "OM",
  PAK: "PK", PER: "PE", PHL: "PH", POL: "PL",
  QAT: "QA",
  ROU: "RO", RUS: "RU", RWA: "RW",
  SAU: "SA", SDN: "SD", SGP: "SG", SVN: "SI", SWE: "SE",
  THA: "TH", TUN: "TN", TUR: "TR", TWN: "TW", TZA: "TZ",
  UKR: "UA", USA: "US", UZB: "UZ",
  VNM: "VN",
  ZAF: "ZA",
};

function cell(row, header) { return row[idx[header]]; }
function norm(v) { return String(v ?? "").trim().toUpperCase(); }
function locPrefix(v) {
  const s = norm(v);
  const m = s.match(/[A-Z]{2}/);
  return m ? m[0] : "";
}
function displayRow(row, excelRow) {
  return {
    excelRow,
    no: cell(row, "编号"),
    declaration: cell(row, "报关单号"),
    dest: norm(cell(row, "最终目的国（地区）")),
    unload: norm(cell(row, "卸货地代码")),
    receivePlace: cell(row, "收货地点名称"),
    receiveCode: norm(cell(row, "收货地点代码")),
    transit: norm(cell(row, "经停港(I)")),
    foreignParty: cell(row, "境外收发货人名称(外文)"),
    receiver: cell(row, "收货人企业名称"),
    shipper: cell(row, "发货人企业名称"),
    goods: cell(row, "货物简要描述"),
  };
}

const strict = [];
const strictReceive = [];
const unknownDests = new Set();
for (let i = 0; i < rows.length; i++) {
  const row = rows[i];
  const dest3 = norm(cell(row, "最终目的国（地区）"));
  const dest2 = iso3ToIso2[dest3];
  if (!dest2 && dest3) unknownDests.add(dest3);
  const unload2 = locPrefix(cell(row, "卸货地代码"));
  const recv2 = locPrefix(cell(row, "收货地点代码"));
  if (dest2 && unload2 && unload2 !== dest2) strict.push(displayRow(row, i + 2));
  if (dest2 && recv2 && recv2 !== dest2) strictReceive.push(displayRow(row, i + 2));
}

function topByPair(list, field) {
  const counts = new Map();
  for (const r of list) {
    const key = `${r.dest}->${r[field]}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30).map(([pair, count]) => ({ pair, count }));
}

console.log(JSON.stringify({
  unknownDests: [...unknownDests].sort(),
  strictUnloadMismatchCount: strict.length,
  strictReceiveMismatchCount: strictReceive.length,
  topUnloadMismatchPairs: topByPair(strict, "unload"),
  topReceiveMismatchPairs: topByPair(strictReceive, "receiveCode"),
  sampleUnloadMismatches: strict.slice(0, 50),
  sampleReceiveMismatches: strictReceive.slice(0, 50),
}, null, 2));
