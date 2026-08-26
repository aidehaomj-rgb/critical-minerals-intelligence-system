import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const inputPath = "D:/codex/氢氟酸/281111_目的国风险分析.xlsx";
const outputDir = "C:/Users/59809/Documents/关键矿产/outputs/281111_destination_recheck";
const outputPath = `${outputDir}/281111_目的国风险分析_中高风险复核_修订版.xlsx`;

const iso3ToIso2 = {
  ARE: "AE", ARM: "AM", AUS: "AU", AUT: "AT", BGD: "BD", BLR: "BY", BRA: "BR", BRN: "BN",
  CAN: "CA", CHE: "CH", CHN: "CN", CRI: "CR", DEU: "DE", DJI: "DJ", DOM: "DO", EGY: "EG",
  ETH: "ET", FRA: "FR", GBR: "GB", HKG: "HK", IDN: "ID", IND: "IN", IRN: "IR", JPN: "JP",
  KEN: "KE", KHM: "KH", KOR: "KR", LAO: "LA", LBN: "LB", MMR: "MM", MYS: "MY", NLD: "NL",
  NOR: "NO", OMN: "OM", PER: "PE", PHL: "PH", RUS: "RU", RWA: "RW", SAU: "SA", SGP: "SG",
  THA: "TH", TUR: "TR", TWN: "TW", UKR: "UA", USA: "US", VEN: "VE", VNM: "VN", ZAF: "ZA", ZWE: "ZW",
};
const iso2ToIso3 = Object.fromEntries(Object.entries(iso3ToIso2).map(([key, value]) => [value, key]));
const countryNames = {
  AE: "阿联酋", AM: "亚美尼亚", AT: "奥地利", AU: "澳大利亚", BD: "孟加拉国", BR: "巴西", BY: "白俄罗斯",
  CA: "加拿大", CH: "瑞士", CN: "中国", CR: "哥斯达黎加", DJ: "吉布提", DO: "多米尼加", EG: "埃及", ET: "埃塞俄比亚",
  GB: "英国", HK: "香港", ID: "印度尼西亚", IN: "印度", IR: "伊朗", JP: "日本", KE: "肯尼亚", KH: "柬埔寨", KR: "韩国",
  LA: "老挝", LB: "黎巴嫩", MM: "缅甸", MY: "马来西亚", NO: "挪威", OM: "阿曼", PE: "秘鲁", PH: "菲律宾",
  RU: "俄罗斯", RW: "卢旺达", SA: "沙特阿拉伯", SG: "新加坡", TH: "泰国", TR: "土耳其", TW: "台湾", UA: "乌克兰",
  US: "美国", VE: "委内瑞拉", VN: "越南", ZA: "南非", ZW: "津巴布韦",
};
const knownInlandGatewayPairs = new Set([
  "ET-DJ", // 埃塞俄比亚通常经吉布提港进出
  "ET-KE", // 埃塞俄比亚也可能经肯尼亚蒙巴萨陆路转运
  "LA-TH", // 老挝常经泰国港口
  "NP-IN", // 尼泊尔常经印度港口
  "PY-BR", // 巴拉圭常经巴西港口
  "MN-CN", // 蒙古常经中国口岸
]);

function norm(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim().toUpperCase();
}
function label(iso2) {
  return `${iso2ToIso3[iso2] ?? iso2}/${countryNames[iso2] ?? iso2}`;
}
function locationCountry(value) {
  const s = norm(value);
  if (!s) return null;
  const direct = [
    [/^(SGSIN|SGP\d{3}|SINGAPORE)$/i, "SG", "新加坡"],
    [/^(KRPUS|SKBUS|BUSAN|PUSAN)$/i, "KR", "韩国釜山"],
    [/^(KRINC|INCHEON|INCHON)$/i, "KR", "韩国仁川"],
    [/^(TWKHH|KAOHSIUNG)$/i, "TW", "台湾高雄"],
    [/^(TWKEL|KEELUNG)$/i, "TW", "台湾基隆"],
    [/^(TWTPE|TAIPEI)$/i, "TW", "台湾台北"],
    [/^(TWTXG|TAICHUNG)$/i, "TW", "台湾台中"],
    [/^(JPOSA|OSAKA)$/i, "JP", "日本大阪"],
    [/^(JPYOK|YOKOHAMA)$/i, "JP", "日本横滨"],
    [/^(JPUKB|KOBE)$/i, "JP", "日本神户"],
    [/^(JPTYO|TOKYO)$/i, "JP", "日本东京"],
    [/^(DJJIB|DJIBOUTI)$/i, "DJ", "吉布提"],
    [/^(BRPNG|PARANAGUA|BRSSZ|SANTOS|BRIOA|ITAPOA)$/i, "BR", "巴西港口"],
    [/^(VNHPH|HAIPHONG|VNSGN|HO CHI MINH)$/i, "VN", "越南港口"],
    [/^(THLCH|LAEM CHABANG)$/i, "TH", "泰国林查班"],
    [/^(IDSUB|SURABAYA|IDJKT|JAKARTA)$/i, "ID", "印度尼西亚港口"],
    [/^(INNSA|NHAVA SHEVA)$/i, "IN", "印度港口"],
    [/^(AEDXB|AEJEA|DUBAI|JEBEL ALI)$/i, "AE", "阿联酋港口"],
  ];
  for (const [re, iso2, location] of direct) if (re.test(s)) return { iso2, location, raw: s };
  const iso3 = s.slice(0, 3);
  if (/^[A-Z]{3}\d/.test(s) && iso3ToIso2[iso3]) return { iso2: iso3ToIso2[iso3], location: label(iso3ToIso2[iso3]), raw: s };
  const iso2 = s.slice(0, 2);
  if (iso2ToIso3[iso2]) return { iso2, location: label(iso2), raw: s };
  return null;
}
function explicitGeoCues(value) {
  const text = norm(value);
  const rules = [
    ["TW", /TAIWAN|TAIPEI|KAOHSIUNG|KEELUNG|TAICHUNG|HSINCHU|TAINAN|TAOYUAN/],
    ["KR", /KOREA|BUSAN|ULSAN|INCHEON|SEOUL/],
    ["JP", /JAPAN|OSAKA|YOKOHAMA|KOBE|TOKYO/],
    ["SG", /SINGAPORE/],
    ["VN", /VIETNAM|HAI PHONG|HAIPHONG|HANOI|HO CHI MINH/],
    ["TH", /THAILAND|LAEM CHABANG|BANGKOK/],
    ["ID", /INDONESIA|SURABAYA|JAKARTA/],
    ["BR", /BRAZIL|BRASIL|CURITIBA|PARANAGUA|ITAPOA|SANTOS/],
    ["AE", /UAE|UNITED ARAB EMIRATES|DUBAI|JEBEL ALI/],
    ["IN", /INDIA|MUMBAI|NHAVA SHEVA/],
    ["US", /UNITED STATES|\bUSA\b|U\.S\.A\.|HOUSTON|LOS ANGELES|NEW YORK/],
    ["ET", /ETHIOPIA|ADDIS ABABA/],
    ["DJ", /DJIBOUTI/],
  ];
  return rules.filter(([, re]) => re.test(text)).map(([iso2]) => iso2);
}
function compact(items, max = 5) {
  const unique = [...new Set(items.filter(Boolean))];
  return unique.length <= max ? unique.join("；") : `${unique.slice(0, max).join("；")}；另${unique.length - max}项`;
}

await fs.mkdir(outputDir, { recursive: true });
const input = await FileBlob.load(inputPath);
const workbook = await SpreadsheetFile.importXlsx(input);
const sheet = workbook.worksheets.getItem("Sheet1");
const used = sheet.getUsedRange();
const values = used.values;
const headers = values[0].map((v) => String(v ?? "").trim());
const index = Object.fromEntries(headers.map((header, col) => [header, col]));
const col = (row, header) => row[index[header]];
const sourceRows = values.slice(1);

function review(row) {
  const declared3 = norm(col(row, "最终目的国（地区）"));
  const declared = iso3ToIso2[declared3] ?? "";
  const unload = locationCountry(col(row, "卸货地代码"));
  const receive = locationCountry(col(row, "收货地点代码"));
  const transit = locationCountry(col(row, "经停港(I)"));
  const text = [
    col(row, "境外收发货人名称(外文)"), col(row, "收货人企业名称"), col(row, "收货地点名称"), col(row, "货物简要描述"),
  ].join(" | ");
  const receiverIsLogisticsIntermediary = /SHIPPING|FREIGHT|FORWARD|LOGISTICS|EXPRESS|TRANSPORT|AGENCY/.test(norm(col(row, "收货人企业名称")));
  const textCues = explicitGeoCues(text);
  const declaredSupport = [];
  if (unload?.iso2 === declared) declaredSupport.push("卸货地");
  if (receive?.iso2 === declared) declaredSupport.push("收货地点");
  if (transit?.iso2 === declared) declaredSupport.push("经停港");
  if (textCues.includes(declared)) declaredSupport.push("明确地理文本");

  const alternatives = new Map();
  const add = (source, item, strength) => {
    if (!declared || !item?.iso2 || item.iso2 === declared || item.iso2 === "CN") return;
    const entry = alternatives.get(item.iso2) ?? { iso2: item.iso2, sources: [], strength: 0 };
    entry.sources.push(source);
    entry.strength += strength;
    alternatives.set(item.iso2, entry);
  };
  add("卸货地", unload, 2);
  add("收货地点", receive, 3);
  add("经停港", transit, 1);
  for (const cue of textCues) add("明确地理文本", { iso2: cue }, 2);
  const alt = [...alternatives.values()].sort((a, b) => b.strength - a.strength)[0];
  const pairKey = alt ? `${declared}-${alt.iso2}` : "";
  const inlandGateway = knownInlandGatewayPairs.has(pairKey);
  const deliveryEvidence = alt?.sources.filter((source) => source === "卸货地" || source === "收货地点").length ?? 0;
  const hasExplicitText = alt?.sources.includes("明确地理文本") ?? false;
  const distinctSources = alt?.sources.length ?? 0;

  let level = "低";
  let conclusion = "原中高风险已排除：申报目的国存在充分的物流或收货支持。";
  let rule = "复核-R1：申报国支持充分，非申报国仅为单项或弱线索。";
  let advice = "留存提单、最终用户/用途材料及必要的二程运输单据。";

  if (!declared) {
    level = "待核";
    conclusion = "无法识别最终目的国代码，不能判断是否存在目的国伪报。";
    rule = "复核-R0：最终目的国代码缺失或无法映射。";
    advice = "补充最终目的国、卸货地、收货地点及提单信息后复核。";
  } else if (inlandGateway) {
    level = "低";
    conclusion = `原中高风险已排除：${label(declared)}属于常见经${label(alt.iso2)}港口/陆路通道的内陆目的国场景。`;
    rule = "复核-R2：已知内陆目的国-邻国门户港组合，不单独视为目的国矛盾。";
    advice = "核对陆路/二程运输和最终收货人资料，确认货物继续运往申报国。";
  } else if (declaredSupport.length >= 1 && (!alt || distinctSources <= 1)) {
    level = "低";
    conclusion = "原中高风险已排除：申报目的国有直接支持，其他国家仅体现为单一中转、港口或弱文本线索。";
    rule = "复核-R1：单项非申报线索不足以认定目的国异常。";
    advice = "按一般风险抽查留存运输路径、收货人和最终用户资料。";
  } else if (alt && deliveryEvidence >= 2 && hasExplicitText && declaredSupport.length === 0 && !receiverIsLogisticsIntermediary) {
    level = "高";
    conclusion = `多项独立证据指向${label(alt.iso2)}，且未见申报${label(declared)}的直接支持，存在实质性目的国不一致风险。`;
    rule = "复核-R4：卸货地+收货地点+明确地理文本共同指向同一非申报国，且申报国无支持。";
    advice = "优先核验全程提单、二程运输、实际收货人、最终用户/用途声明及出口许可证目的地；必要时核实是否发生目的国变更。";
  } else if (alt && deliveryEvidence >= 2 && declaredSupport.length === 0) {
    level = "中";
    conclusion = receiverIsLogisticsIntermediary
      ? `卸货地与收货地点均指向${label(alt.iso2)}，但收货方名称显示为运输/货代服务主体；不能排除转运，需凭二程单据核验申报${label(declared)}是否为实际最终目的地。`
      : `卸货地与收货地点均指向${label(alt.iso2)}，申报${label(declared)}缺少直接支持；需核验是否属于中转或实际目的地变更。`;
    rule = receiverIsLogisticsIntermediary
      ? "复核-R3：非申报国交付字段一致，但收货方为物流中介，保留为待单证核验的中风险。"
      : "复核-R3：两项物流交付字段共同指向同一非申报国，申报国无支持。";
    advice = "核对全程提单、二程运输、最终收货人和最终用户/用途声明。";
  } else if (alt && deliveryEvidence >= 1 && hasExplicitText && declaredSupport.length === 0) {
    level = "中";
    conclusion = `一项交付地点与明确地理文本共同指向${label(alt.iso2)}，而申报${label(declared)}缺少直接支持；需要人工核单。`;
    rule = "复核-R3：交付地点+明确地理文本一致指向非申报国，申报国无支持。";
    advice = "核对提单、目的港、二程运输和最终收货人地址；确认是否存在转运或目的国变更。";
  } else if (alt) {
    level = "低";
    conclusion = "原中高风险降级：目前仅见单项非申报国物流线索，尚不足以判断为目的国伪报。";
    rule = "复核-R1：单项港口/中转/文本线索不构成实质性矛盾。";
    advice = "保留基础运输单据；如出现收货人或二程运输指向同一国家，再升级核查。";
  }

  const evidence = [];
  if (declared) evidence.push(`申报最终目的国=${label(declared)}`);
  if (unload) evidence.push(`卸货地=${unload.raw}/${label(unload.iso2)}`);
  if (receive) evidence.push(`收货地点=${receive.raw}/${label(receive.iso2)}`);
  if (transit) evidence.push(`经停港=${transit.raw}/${label(transit.iso2)}`);
  if (textCues.length) evidence.push(`明确地理文本=${compact(textCues.map(label), 4)}`);

  return [level, conclusion, compact(evidence, 6), rule, advice];
}

const reviewHeaders = ["复核_风险等级", "复核_结论", "复核_证据摘要", "复核_适用规则", "复核_核查建议"];
const reviewRows = sourceRows.map(review);
sheet.getRange(`AJ1:AN${sourceRows.length + 1}`).values = [reviewHeaders, ...reviewRows];
sheet.getRange("AJ1:AN1").format = {
  fill: "#14532D", font: { bold: true, color: "#FFFFFF" }, wrapText: true,
  horizontalAlignment: "center", verticalAlignment: "center",
};
sheet.getRange(`AJ2:AN${sourceRows.length + 1}`).format = { wrapText: true, verticalAlignment: "top" };
sheet.getRange("AJ:AJ").format.columnWidth = 14;
sheet.getRange("AK:AK").format.columnWidth = 42;
sheet.getRange("AL:AL").format.columnWidth = 55;
sheet.getRange("AM:AM").format.columnWidth = 45;
sheet.getRange("AN:AN").format.columnWidth = 52;
sheet.getRange("AJ1:AN1").format.rowHeight = 34;
sheet.freezePanes.freezeRows(1);

const oldRiskIndex = index["分析_伪报目的国风险等级"];
const counts = new Map();
const transitions = new Map();
for (let i = 0; i < reviewRows.length; i += 1) {
  const reviewed = reviewRows[i][0];
  const original = String(sourceRows[i][oldRiskIndex] ?? "");
  counts.set(reviewed, (counts.get(reviewed) ?? 0) + 1);
  const key = `${original}→${reviewed}`;
  transitions.set(key, (transitions.get(key) ?? 0) + 1);
}

const summaryName = "中高风险复核";
const oldSummary = workbook.worksheets.items.find((item) => item.name === summaryName);
if (oldSummary) workbook.worksheets.getItem(summaryName).delete();
const summary = workbook.worksheets.add(summaryName);
const summaryRows = [
  ["281111 中高风险报关单复核", ""],
  ["复核范围", `源工作簿中原标记为中/高风险的 ${sourceRows.length} 条报关单`],
  ["复核原则", "只有当至少两项独立的交付/地理证据共同指向同一非申报国，且申报国缺少直接支持时，才保留中高风险。企业集团背景、企业名称、单一中转港或单一文本词不单独升级。"],
  ["高", counts.get("高") ?? 0],
  ["中", counts.get("中") ?? 0],
  ["低", counts.get("低") ?? 0],
  ["待核", counts.get("待核") ?? 0],
  ["", ""],
  ["原风险→复核风险", "数量"],
  ...[...transitions.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([key, value]) => [key, value]),
  ["", ""],
  ["复核规则", "说明"],
  ["复核-R1", "申报国有直接支持，或仅存在单一非申报国线索：降为低风险。"],
  ["复核-R2", "已知内陆目的国与邻国门户港组合：降为低风险，但需保留二程/陆路运输材料。"],
  ["复核-R3", "两项独立交付/地理证据指向同一非申报国，且申报国无支持：中风险，人工核单。"],
  ["复核-R4", "卸货地、收货地点和明确地理文本共同指向同一非申报国，申报国无支持，且境外收货方并非物流中介：高风险。"],
];
summary.getRange(`A1:B${summaryRows.length}`).values = summaryRows;
summary.getRange("A1:B1").merge();
summary.getRange("A1").format = { fill: "#14532D", font: { bold: true, color: "#FFFFFF", size: 14 }, horizontalAlignment: "center" };
summary.getRange("A9:B9").format = { fill: "#DCFCE7", font: { bold: true } };
const rulesRow = 11 + transitions.size;
summary.getRange(`A${rulesRow}:B${rulesRow}`).format = { fill: "#DCFCE7", font: { bold: true } };
summary.getRange(`A1:B${summaryRows.length}`).format = { wrapText: true, verticalAlignment: "top" };
summary.getRange("A:A").format.columnWidth = 34;
summary.getRange("B:B").format.columnWidth = 115;
summary.showGridLines = false;

const check = await workbook.inspect({ kind: "table", range: "Sheet1!AJ1:AN20", include: "values", tableMaxRows: 20, tableMaxCols: 5, maxChars: 8000 });
console.log(check.ndjson);
const errors = await workbook.inspect({ kind: "match", searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A", options: { useRegex: true, maxResults: 100 }, summary: "formula error scan", maxChars: 2000 });
console.log(errors.ndjson);

const dataPreview = await workbook.render({ sheetName: "Sheet1", range: "A1:AN25", scale: 1, format: "png" });
await fs.writeFile(`${outputDir}/recheck_data_preview.png`, new Uint8Array(await dataPreview.arrayBuffer()));
const summaryPreview = await workbook.render({ sheetName: summaryName, autoCrop: "all", scale: 1, format: "png" });
await fs.writeFile(`${outputDir}/recheck_summary_preview.png`, new Uint8Array(await summaryPreview.arrayBuffer()));

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
console.log(JSON.stringify({ outputPath, counts: Object.fromEntries(counts), transitions: Object.fromEntries(transitions) }, null, 2));
