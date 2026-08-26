import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const inputPath = "E:/ZMJ/企业人员电话大表.xlsx";
const outputPath = "C:/Users/59809/Documents/关键矿产/outputs/enterprise_enrichment/企业人员电话大表_互联网补充.xlsx";

const input = await FileBlob.load(inputPath);
const workbook = await SpreadsheetFile.importXlsx(input);
const sheetName = "互联网补充（新增）";
const existing = await workbook.inspect({ kind: "sheet", include: "id,name" });

let sheet;
try {
  sheet = workbook.worksheets.getItem(sheetName);
  sheet.getUsedRange().clear({ applyTo: "all" });
} catch {
  sheet = workbook.worksheets.add(sheetName);
}

const headers = [[
  "人员",
  "姓名/职务",
  "企业名称",
  "证件号",
  "手机号",
  "固定电话",
  "地址",
  "邮箱",
  "官网",
  "公开来源",
  "核验说明",
]];

const rows = [
  [
    "企业热线",
    "",
    "福建永晶科技股份有限公司邵武分公司",
    "",
    "",
    "0599-6654866",
    "",
    "",
    "https://www.yongjingtechnology.com/",
    "https://www.yongjingtechnology.com/wap_guan_cn/id/4.html",
    "官网公开热线；原表未记录该号码。",
  ],
  [
    "公开联系人",
    "许亦斌",
    "福建中欣氟材高宝科技有限公司",
    "",
    "",
    "0598-5327359",
    "三明市清流县氟新材料产业园",
    "44519788@qq.com",
    "",
    "https://www.fjql.gov.cn/zwgk/gggs/202402/t20240205_2000260.htm",
    "环评公众参与公示中的建设单位联系人及联系方式。",
  ],
  [
    "招聘联系人",
    "温女士；胡先生",
    "福建中欣氟材高宝科技有限公司",
    "",
    "18020868301；13173975334",
    "0598-5271550",
    "福建省三明市清流县温郊乡桐坑村氟新材料产业园",
    "302671051@qq.com",
    "http://www.gb-industries.com",
    "https://www.fjsmu.edu.cn/jyw/2023/1106/c3473a146316/page.htm",
    "公开招聘简章中的企业招聘联系方式。",
  ],
  [
    "企业注册地址",
    "",
    "江苏联恒电子新材料科技有限公司",
    "",
    "",
    "",
    "江苏省宿迁市宿豫区江苏宿迁生态化工科技产业园大庆路3号",
    "",
    "",
    "https://www.zhaopin.com/companydetail/9132ERXN990F5ZX3NY.htm",
    "企业公示信息转载页载明的公司地址；原表地址为空。",
  ],
  [
    "企业公开联系",
    "",
    "云南日彤商贸有限公司",
    "",
    "",
    "0871-67188095",
    "昆明市官渡区关上关兴路212号万兴花园商务楼510室",
    "info@baixugp.com",
    "https://baixuchem.com",
    "https://baixuchem.com/about",
    "企业官网公开业务联系方式；地址与原表不同，保留为新增公开地址。",
  ],
];

sheet.getRange("A1:K6").values = [...headers, ...rows];
sheet.showGridLines = false;
sheet.freezePanes.freezeRows(1);

sheet.getRange("A1:K1").format = {
  fill: "#1F4E78",
  font: { bold: true, color: "#FFFFFF" },
  horizontalAlignment: "center",
  verticalAlignment: "center",
  wrapText: true,
  borders: { preset: "all", style: "thin", color: "#B7C9D6" },
};
sheet.getRange("A2:K6").format = {
  verticalAlignment: "top",
  wrapText: true,
  borders: { preset: "all", style: "thin", color: "#D9E2F3" },
};
sheet.getRange("D2:D6").format.numberFormat = "@";
sheet.getRange("E2:F6").format.numberFormat = "@";
sheet.getRange("A1:K6").format.rowHeight = 48;
sheet.getRange("A1:K1").format.rowHeight = 34;

const widths = [14, 16, 31, 14, 22, 17, 45, 28, 30, 58, 36];
for (let i = 0; i < widths.length; i += 1) {
  sheet.getRangeByIndexes(0, i, 6, 1).format.columnWidth = widths[i];
}

sheet.tables.add("A1:K6", true, "InternetSupplementTable");

const check = await workbook.inspect({
  kind: "table",
  range: "互联网补充（新增）!A1:K6",
  include: "values,formulas",
  tableMaxRows: 10,
  tableMaxCols: 12,
});
console.log(check.ndjson);

const preview = await workbook.render({
  sheetName,
  range: "A1:K6",
  scale: 1.5,
  format: "png",
});
await fs.writeFile(
  "C:/Users/59809/Documents/关键矿产/outputs/enterprise_enrichment/enrichment_preview.png",
  new Uint8Array(await preview.arrayBuffer()),
);

const exported = await SpreadsheetFile.exportXlsx(workbook);
await exported.save(outputPath);
console.log(outputPath);
