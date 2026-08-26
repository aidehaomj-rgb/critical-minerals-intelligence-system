import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const path = "C:/Users/59809/Documents/关键矿产/outputs/enterprise_enrichment/企业人员电话大表_互联网补充.xlsx";
const input = await FileBlob.load(path);
const workbook = await SpreadsheetFile.importXlsx(input);

const sheets = [
  ["经营单位企业注册信息", "A1:H27", "verify_business.png"],
  ["申报单位企业注册信息", "A1:H15", "verify_declarant.png"],
  ["舱单发货人（consignor）相关信息", "A1:F25", "verify_consignor.png"],
  ["互联网补充（新增）", "A1:K6", "verify_supplement.png"],
];

for (const [sheetName, range, file] of sheets) {
  const preview = await workbook.render({ sheetName, range, scale: 0.8, format: "png" });
  await fs.writeFile(
    `C:/Users/59809/Documents/关键矿产/outputs/enterprise_enrichment/${file}`,
    new Uint8Array(await preview.arrayBuffer()),
  );
}

const supplement = await workbook.inspect({
  kind: "table",
  range: "互联网补充（新增）!A1:K6",
  include: "values,formulas",
  tableMaxRows: 10,
  tableMaxCols: 12,
});
const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  summary: "formula error scan",
});
console.log(supplement.ndjson);
console.log(errors.ndjson);
