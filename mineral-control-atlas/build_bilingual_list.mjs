import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const root = "C:/Users/59809/Documents/关键矿产/mineral-control-atlas";
const sourcePath = path.join(root, "关键矿产中英文清单.md");
const outputDir = path.join(root, "outputs", "critical-minerals-bilingual-list");
const outputPath = path.join(outputDir, "关键矿产中英文清单.xlsx");
const markdown = await fs.readFile(sourcePath, "utf8");

const rows = [];
let category = "";
const lines = markdown.split(/\r?\n/);
for (let i = 0; i < lines.length; i += 1) {
  const line = lines[i].trim();
  if (line.startsWith("## ")) {
    category = line.replace(/^##\s+[^、]+、/, "").trim();
    continue;
  }
  if (!line.startsWith("|") || line.includes("---") || line.includes("中文 | English") || line.includes("元素 |")) continue;
  if (category.startsWith("中重稀土材料")) continue;
  const cells = line.split("|").slice(1, -1).map((cell) => cell.trim().replaceAll("**", ""));
  if (cells.length === 2) {
    rows.push([category, "材料、制品或技术", cells[0], cells[1]]);
  } else if (cells.length === 4) {
    const [element, metal, oxide, compound] = cells;
    const match = element.match(/^(.*?)（(.*?)）$/);
    const zhElement = match ? match[1] : element;
    const enElement = match ? match[2] : "";
    rows.push([category, "金属、合金与材料", zhElement + "：" + metal, enElement ? `${enElement}: ${metal}` : metal]);
    rows.push([category, "氧化物", zhElement + "：" + oxide, enElement ? `${enElement}: ${oxide}` : oxide]);
    rows.push([category, "化合物", zhElement + "：" + compound, enElement ? `${enElement}: ${compound}` : compound]);
  }
}

const rareEarthRows = [
  ["钐", "Samarium", "金属钐、含钐合金、靶材及钐钴永磁材料", "Metal samarium, samarium-containing alloys, targets and samarium–cobalt permanent magnets", "氧化钐及其混合物", "Samarium oxide and mixtures", "含钐化合物及其混合物", "Samarium compounds and mixtures"],
  ["钆", "Gadolinium", "金属钆、含钆合金及靶材", "Metal gadolinium, gadolinium-containing alloys and targets", "氧化钆及其混合物", "Gadolinium oxide and mixtures", "含钆化合物及其混合物", "Gadolinium compounds and mixtures"],
  ["铽", "Terbium", "金属铽、含铽合金、靶材及含铽永磁材料", "Metal terbium, terbium-containing alloys, targets and terbium-containing permanent magnets", "氧化铽及其混合物", "Terbium oxide and mixtures", "含铽化合物及其混合物", "Terbium compounds and mixtures"],
  ["镝", "Dysprosium", "金属镝、含镝合金、靶材及含镝永磁材料", "Metal dysprosium, dysprosium-containing alloys, targets and dysprosium-containing permanent magnets", "氧化镝及其混合物", "Dysprosium oxide and mixtures", "含镝化合物及其混合物", "Dysprosium compounds and mixtures"],
  ["镥", "Lutetium", "金属镥、镱镥合金及镥靶", "Metal lutetium, ytterbium–lutetium alloys and lutetium targets", "氧化镥及其混合物", "Lutetium oxide and mixtures", "含镥化合物及其混合物", "Lutetium compounds and mixtures"],
  ["钪", "Scandium", "金属钪、含钪合金及钪靶", "Metal scandium, scandium-containing alloys and scandium targets", "氧化钪及其混合物", "Scandium oxide and mixtures", "含钪化合物及其混合物", "Scandium compounds and mixtures"],
  ["钇", "Yttrium", "金属钇、含钇合金及靶材", "Metal yttrium, yttrium-containing alloys and targets", "氧化钇及其混合物", "Yttrium oxide and mixtures", "含钇化合物及其混合物", "Yttrium compounds and mixtures"],
  ["钬", "Holmium", "金属钬、含钬合金及相关材料", "Metal holmium, holmium-containing alloys and related materials", "氧化钬及其混合物", "Holmium oxide and mixtures", "含钬化合物及其混合物", "Holmium compounds and mixtures"],
  ["铒", "Erbium", "金属铒、含铒合金及相关材料", "Metal erbium, erbium-containing alloys and related materials", "氧化铒及其混合物", "Erbium oxide and mixtures", "含铒化合物及其混合物", "Erbium compounds and mixtures"],
  ["铥", "Thulium", "金属铥、靶材及相关材料", "Metal thulium, thulium targets and related materials", "氧化铥及其混合物", "Thulium oxide and mixtures", "含铥化合物及其混合物", "Thulium compounds and mixtures"],
  ["铕", "Europium", "金属铕、含铕合金及相关材料", "Metal europium, europium-containing alloys and related materials", "氧化铕及其混合物", "Europium oxide and mixtures", "含铕化合物及其混合物", "Europium compounds and mixtures"],
  ["镱", "Ytterbium", "金属镱、靶材及相关材料", "Metal ytterbium, ytterbium targets and related materials", "氧化镱及其混合物", "Ytterbium oxide and mixtures", "含镱化合物及其混合物", "Ytterbium compounds and mixtures"],
];
for (const [zh, en, metalZh, metalEn, oxideZh, oxideEn, compoundZh, compoundEn] of rareEarthRows) {
  const categoryName = "中重稀土材料（Medium and Heavy Rare-earth Materials）";
  rows.push([categoryName, "金属、合金与材料", metalZh, metalEn]);
  rows.push([categoryName, "氧化物", oxideZh, oxideEn]);
  rows.push([categoryName, "化合物", compoundZh, compoundEn]);
}

const workbook = Workbook.create();
const list = workbook.worksheets.add("中英文清单");
const note = workbook.worksheets.add("使用说明");
list.showGridLines = false;
note.showGridLines = false;

list.getRange("A1:E1").merge();
list.getRange("A1").values = [["关键矿产及相关物项中英文清单"]];
list.getRange("A2:E2").merge();
list.getRange("A2").values = [["覆盖矿种、材料/制品、生产设备和工艺技术；可直接筛选检索。"]];
list.getRange("A4:E4").values = [["序号", "矿种 / 类别", "子类别", "中文名称", "英文名称"]];
const values = rows.map((row, index) => [index + 1, ...row]);
list.getRange(`A5:E${values.length + 4}`).values = values;

list.getRange("A1:E1").format = {
  fill: "#0B2C4D",
  font: { bold: true, color: "#FFFFFF", size: 16 },
  horizontalAlignment: "center",
  verticalAlignment: "center",
};
list.getRange("A1:E1").format.rowHeight = 30;
list.getRange("A2:E2").format = {
  fill: "#EAF3F8",
  font: { color: "#42606E", italic: true },
  horizontalAlignment: "left",
  verticalAlignment: "center",
};
list.getRange("A2:E2").format.rowHeight = 24;
list.getRange("A4:E4").format = {
  fill: "#147A9B",
  font: { bold: true, color: "#FFFFFF" },
  horizontalAlignment: "center",
  verticalAlignment: "center",
  wrapText: true,
  borders: { preset: "all", style: "thin", color: "#A9CAD7" },
};
list.getRange(`A5:E${values.length + 4}`).format = {
  verticalAlignment: "top",
  wrapText: true,
  borders: { preset: "insideHorizontal", style: "thin", color: "#D9E5EA" },
};
list.getRange(`A5:A${values.length + 4}`).format.horizontalAlignment = "center";
list.getRange(`B5:C${values.length + 4}`).format.fill = "#F4F9FB";
list.getRange("A:A").format.columnWidth = 8;
list.getRange("B:B").format.columnWidth = 27;
list.getRange("C:C").format.columnWidth = 21;
list.getRange("D:D").format.columnWidth = 50;
list.getRange("E:E").format.columnWidth = 65;
list.getRange(`A5:E${values.length + 4}`).format.rowHeight = 32;
list.freezePanes.freezeRows(4);
const table = list.tables.add(`A4:E${values.length + 4}`, true, "CriticalMineralsBilingualList");
table.style = "TableStyleMedium2";
table.showBandedColumns = false;

note.getRange("A1:D1").merge();
note.getRange("A1").values = [["使用说明"]];
note.getRange("A3:B6").values = [
  ["字段", "说明"],
  ["矿种 / 类别", "按镓、锗、钨、稀土矿及生产设备等业务类别归集。"],
  ["子类别", "区分材料/制品/技术、金属合金、氧化物和化合物等。"],
  ["使用边界", "本表用于中英文检索和资料归档。出口管制识别须以公告原文、管制编码、技术参数及主管部门解释为准。"],
];
note.getRange("A1:D1").format = { fill: "#0B2C4D", font: { bold: true, color: "#FFFFFF", size: 16 }, horizontalAlignment: "center" };
note.getRange("A3:B3").format = { fill: "#147A9B", font: { bold: true, color: "#FFFFFF" }, horizontalAlignment: "center" };
note.getRange("A3:B6").format = { wrapText: true, verticalAlignment: "top", borders: { preset: "all", style: "thin", color: "#D9E5EA" } };
note.getRange("A4:A6").format.fill = "#F4F9FB";
note.getRange("A:A").format.columnWidth = 22;
note.getRange("B:B").format.columnWidth = 88;
note.getRange("A4:B6").format.rowHeight = 38;

await fs.mkdir(outputDir, { recursive: true });
const preview = await workbook.render({ sheetName: "中英文清单", range: `A1:E${Math.min(values.length + 4, 32)}`, scale: 1.25, format: "png" });
await fs.writeFile(path.join(outputDir, "preview.png"), new Uint8Array(await preview.arrayBuffer()));
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
console.log(JSON.stringify({ outputPath, itemCount: rows.length }));
