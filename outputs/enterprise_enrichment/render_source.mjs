import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const input = await FileBlob.load("E:/ZMJ/企业人员电话大表.xlsx");
const workbook = await SpreadsheetFile.importXlsx(input);
const preview = await workbook.render({
  sheetName: "经营单位企业注册信息",
  range: "A1:H27",
  scale: 1.5,
  format: "png",
});
await fs.writeFile(
  "C:/Users/59809/Documents/关键矿产/outputs/enterprise_enrichment/source_preview.png",
  new Uint8Array(await preview.arrayBuffer()),
);
