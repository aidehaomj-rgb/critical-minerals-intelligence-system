import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const inputPath = "E:/ZMJ/281111.xlsx";
const outputDir = "C:/Users/59809/Documents/关键矿产/outputs/281111_destination_risk";
const outputPath = `${outputDir}/281111_目的国风险分析.xlsx`;

const iso3ToIso2 = {
  AFG: "AF", AGO: "AO", ALB: "AL", ARE: "AE", ARG: "AR", ARM: "AM", AUS: "AU", AUT: "AT", AZE: "AZ",
  BGD: "BD", BGR: "BG", BHR: "BH", BLR: "BY", BOL: "BO", BRA: "BR", BRN: "BN",
  CAN: "CA", CHE: "CH", CHL: "CL", CHN: "CN", COL: "CO", CRI: "CR", CZE: "CZ",
  DEU: "DE", DJI: "DJ", DOM: "DO", DZA: "DZ",
  ECU: "EC", EGY: "EG", ESP: "ES", EST: "EE", ETH: "ET",
  FIN: "FI", FRA: "FR",
  GBR: "GB", GHA: "GH", GIN: "GN", GRC: "GR",
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
  VEN: "VE", VNM: "VN",
  ZAF: "ZA", ZWE: "ZW",
};
const iso2ToIso3 = Object.fromEntries(Object.entries(iso3ToIso2).map(([k, v]) => [v, k]));
const countryNames = {
  AE: "阿联酋", AR: "阿根廷", AU: "澳大利亚", BD: "孟加拉国", BR: "巴西", BY: "白俄罗斯",
  CA: "加拿大", CN: "中国", DJ: "吉布提", DO: "多米尼加", EG: "埃及", ET: "埃塞俄比亚",
  GN: "几内亚", HK: "香港", ID: "印度尼西亚", IL: "以色列", IN: "印度", IR: "伊朗",
  JP: "日本", KE: "肯尼亚", KH: "柬埔寨", KR: "韩国", KZ: "哈萨克斯坦", LA: "老挝",
  MG: "马达加斯加", MM: "缅甸", MY: "马来西亚", OM: "阿曼", PH: "菲律宾", RU: "俄罗斯",
  RW: "卢旺达", SG: "新加坡", TH: "泰国", TR: "土耳其", TW: "台湾", TZ: "坦桑尼亚",
  UA: "乌克兰", US: "美国", VE: "委内瑞拉", VN: "越南", ZA: "南非", ZW: "津巴布韦",
};

const cityAliases = [
  { re: /^(SKBUS|KRPUS|BUSAN|PUSAN)$/i, iso2: "KR", label: "韩国/釜山" },
  { re: /^(KRUSN|ULSAN)$/i, iso2: "KR", label: "韩国/蔚山" },
  { re: /^(KRINC|INCHEON|INCHON)$/i, iso2: "KR", label: "韩国/仁川" },
  { re: /^(TWKHH|KAOHSIUNG)$/i, iso2: "TW", label: "台湾/高雄" },
  { re: /^(TWKEL|KEELUNG)$/i, iso2: "TW", label: "台湾/基隆" },
  { re: /^(TWTPE|TAIPEI)$/i, iso2: "TW", label: "台湾/台北" },
  { re: /^(TWTXG|TAICHUNG)$/i, iso2: "TW", label: "台湾/台中" },
  { re: /^(JPOSA|OSAKA)$/i, iso2: "JP", label: "日本/大阪" },
  { re: /^(JPYOK|YOKOHAMA)$/i, iso2: "JP", label: "日本/横滨" },
  { re: /^(JPUKB|KOBE)$/i, iso2: "JP", label: "日本/神户" },
  { re: /^(JPTYO|TOKYO)$/i, iso2: "JP", label: "日本/东京" },
  { re: /^(THLCH|LAEM CHABANG)$/i, iso2: "TH", label: "泰国/林查班" },
  { re: /^(IDSUB|SURABAYA)$/i, iso2: "ID", label: "印度尼西亚/泗水" },
  { re: /^(IDJKT|JAKARTA)$/i, iso2: "ID", label: "印度尼西亚/雅加达" },
  { re: /^(AEJEA|JEBEL ALI|AEDXB|DUBAI)$/i, iso2: "AE", label: "阿联酋/杰贝阿里或迪拜" },
  { re: /^(DJJIB|DJIBOUTI)$/i, iso2: "DJ", label: "吉布提" },
  { re: /^(AMBAR|AMBARLI|DUZCE)$/i, iso2: "TR", label: "土耳其" },
  { re: /^(BRPNG|PARANAGUA|PARANAGU.|BRIOA|ITAPOA|BRSSZ|SANTOS)$/i, iso2: "BR", label: "巴西" },
  { re: /^(VNHPH|HAIPHONG|VNSGN|HO CHI MINH)$/i, iso2: "VN", label: "越南" },
];

const textCueRules = [
  { iso2: "TW", label: "台湾文本线索", re: /TAIWAN|TAIPEI|KAOHSIUNG|KEELUNG|TAICHUNG|HSINCHU|TAINAN|TAOYUAN|FORMOSA DAIKIN|SUNLIT FLUO|JM-APPLIED|TRANS CHIEF|巨茂|台塑|格力达|东祈/i },
  { iso2: "KR", label: "韩国文本线索", re: /KOREA|BUSAN|ULSAN|INCHEON|SEOUL|SK SPECIALTY|FOOSUNG|SOULBRAIN|DAIKIN KOREA|CHEMTRONICS/i },
  { iso2: "JP", label: "日本文本线索", re: /JAPAN|OSAKA|YOKOHAMA|KOBE|TOKYO|DAIKIN INDUSTRIES|STELLA CHEMIFA|KANTO|UTSU|BLUE EXPRESS/i },
  { iso2: "VN", label: "越南文本线索", re: /VIETNAM|VIET\s|HAI PHONG|HAIPHONG|HANOI|HO CHI MINH/i },
  { iso2: "TH", label: "泰国文本线索", re: /THAILAND|THAI|LAEM CHABANG|RUNG SIAM|TANIOBIS/i },
  { iso2: "ID", label: "印尼文本线索", re: /INDONESIA|SURABAYA|JAKARTA|^PT\.|\sPT\./i },
  { iso2: "BR", label: "巴西文本线索", re: /BRAZIL|BRASIL|CURITIBA|PARANAGUA|ITAPOA|SANTOS|CNPJ/i },
  { iso2: "SG", label: "新加坡文本线索", re: /SINGAPORE|PTE\.?\s+LTD/i },
  { iso2: "AE", label: "阿联酋文本线索", re: /UAE|UNITED ARAB EMIRATES|DUBAI|JEBEL ALI|L\.L\.C/i },
  { iso2: "TR", label: "土耳其文本线索", re: /TURKEY|TURKIYE|ISTANBUL|KIMYA|TICARET|ANONIM SIRKETI/i },
  { iso2: "US", label: "美国文本线索", re: /UNITED STATES|\bUSA\b|U\.S\.A\.|HOUSTON|LOS ANGELES|NEW YORK/i },
];

function norm(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim().toUpperCase();
}

function countryLabel(iso2) {
  if (!iso2) return "";
  const iso3 = iso2ToIso3[iso2] ?? iso2;
  const name = countryNames[iso2] ?? iso2;
  return `${iso3}/${name}`;
}

function countryFromLoc(value) {
  const s = norm(value);
  if (!s) return null;
  for (const alias of cityAliases) {
    if (alias.re.test(s)) return { iso2: alias.iso2, label: alias.label, raw: s };
  }
  const iso3 = s.slice(0, 3);
  if (/^[A-Z]{3}\d/.test(s) && iso3ToIso2[iso3]) return { iso2: iso3ToIso2[iso3], label: countryLabel(iso3ToIso2[iso3]), raw: s };
  const iso2 = s.slice(0, 2);
  if (iso2ToIso3[iso2]) return { iso2, label: countryLabel(iso2), raw: s };
  return null;
}

function countryFromTransit(value) {
  return countryFromLoc(value);
}

function detectTextCues(text) {
  const hits = [];
  for (const rule of textCueRules) {
    if (rule.re.test(text)) hits.push({ iso2: rule.iso2, label: rule.label });
  }
  return hits;
}

function shortList(items, max = 5) {
  const unique = [...new Set(items.filter(Boolean))];
  if (unique.length <= max) return unique.join("；");
  return `${unique.slice(0, max).join("；")}；另${unique.length - max}项`;
}

function addCount(map, key) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

await fs.mkdir(outputDir, { recursive: true });

const input = await FileBlob.load(inputPath);
const workbook = await SpreadsheetFile.importXlsx(input);
const sheet = workbook.worksheets.getItem("Sheet1");

const prePreview = await workbook.render({
  sheetName: "Sheet1",
  range: "A1:AB25",
  scale: 1,
  format: "png",
});
await fs.writeFile(`${outputDir}/pre_edit_preview.png`, new Uint8Array(await prePreview.arrayBuffer()));

const sourceRange = "A1:AB9456";
const values = sheet.getRange(sourceRange).values;
const headers = values[0].map((value) => String(value ?? "").trim());
const headerIndex = Object.fromEntries(headers.map((header, index) => [header, index]));
const rows = values.slice(1);

function cell(row, header) {
  return row[headerIndex[header]];
}

function analyze(row) {
  const declared3 = norm(cell(row, "最终目的国（地区）"));
  const declared2 = iso3ToIso2[declared3] ?? "";
  const unload = countryFromLoc(cell(row, "卸货地代码"));
  const receive = countryFromLoc(cell(row, "收货地点代码"));
  const transit = countryFromTransit(cell(row, "经停港(I)"));
  const text = [
    cell(row, "境外收发货人名称(外文)"),
    cell(row, "收货人企业名称"),
    cell(row, "收货地点名称"),
    cell(row, "货物简要描述"),
  ].map(norm).join(" | ");
  const textCues = detectTextCues(text);

  const evidence = [];
  if (declared2) evidence.push(`申报最终目的国=${countryLabel(declared2)}`);
  else evidence.push(`申报最终目的国代码未识别：${declared3 || "空"}`);
  if (unload) evidence.push(`卸货地=${unload.raw}/${unload.label}`);
  if (receive) evidence.push(`收货地点代码=${receive.raw}/${receive.label}`);
  if (transit) evidence.push(`经停港(I)=${transit.raw}/${transit.label}`);
  if (textCues.length) evidence.push(`文本线索=${shortList(textCues.map((cue) => `${countryLabel(cue.iso2)}(${cue.label})`), 4)}`);

  const support = [];
  if (declared2 && unload?.iso2 === declared2) support.push("卸货地支持最终目的国");
  if (declared2 && receive?.iso2 === declared2) support.push("收货地点代码支持最终目的国");
  if (declared2 && transit?.iso2 === declared2) support.push("经停港(I)支持最终目的国");
  if (declared2 && textCues.some((cue) => cue.iso2 === declared2)) support.push("收/发货人文本支持最终目的国");

  const mismatches = [];
  if (declared2 && unload && unload.iso2 !== declared2) {
    mismatches.push(`卸货地${countryLabel(unload.iso2)}≠最终目的国${countryLabel(declared2)}`);
  }
  if (declared2 && receive && receive.iso2 !== declared2 && receive.iso2 !== "CN") {
    mismatches.push(`收货地点代码${countryLabel(receive.iso2)}≠最终目的国${countryLabel(declared2)}`);
  }
  if (declared2 && transit && transit.iso2 !== declared2) {
    mismatches.push(`经停港(I)${countryLabel(transit.iso2)}≠最终目的国${countryLabel(declared2)}`);
  }
  const textMismatchCues = textCues.filter((cue) => declared2 && cue.iso2 !== declared2);
  if (textMismatchCues.length) {
    mismatches.push(`文本国别线索${shortList(textMismatchCues.map((cue) => countryLabel(cue.iso2)), 3)}≠最终目的国${countryLabel(declared2)}`);
  }

  const hasTaiwanPort = unload?.iso2 === "TW" || receive?.iso2 === "TW" || transit?.iso2 === "TW";
  const hasTaiwanText = textCues.some((cue) => cue.iso2 === "TW");
  const hasTaiwanDeclared = declared2 === "TW";
  const taiwanDetails = [];
  if (hasTaiwanDeclared) taiwanDetails.push("最终目的国=TWN");
  if (unload?.iso2 === "TW") taiwanDetails.push(`卸货地=${unload.raw}`);
  if (receive?.iso2 === "TW") taiwanDetails.push(`收货地点代码=${receive.raw}`);
  if (transit?.iso2 === "TW") taiwanDetails.push(`经停港(I)=${transit.raw}`);
  if (hasTaiwanText) taiwanDetails.push("收/发货人或地址文本含台湾线索");

  const nonDeclaredEvidence = new Map();
  function pushNonDeclared(source, info) {
    if (!declared2 || !info?.iso2 || info.iso2 === declared2) return;
    if (source === "收货地点代码" && info.iso2 === "CN") return;
    const item = nonDeclaredEvidence.get(info.iso2) ?? { count: 0, sources: [] };
    item.count += 1;
    item.sources.push(source);
    nonDeclaredEvidence.set(info.iso2, item);
  }
  pushNonDeclared("卸货地", unload);
  pushNonDeclared("收货地点代码", receive);
  pushNonDeclared("经停港(I)", transit);
  for (const cue of textCues) pushNonDeclared("文本线索", cue);
  const strongContradiction = [...nonDeclaredEvidence.values()].some((item) => item.count >= 2 && item.sources.includes("文本线索"));
  const declaredSupport = support.length > 0;

  let risk = "低";
  let conclusion = "未见直接伪报目的国迹象";
  const rules = [];
  let advice = "低风险抽查；保留最终目的国、最终用户、提单和运输路径材料。";

  if (!declared2) {
    risk = "待核";
    conclusion = "最终目的国代码未识别，需补充字段后复核";
    rules.push("R0-目的国代码未识别");
    advice = "补充或校验最终目的国代码、卸货地、收货地点及提单信息后复核。";
  } else if (strongContradiction && !declaredSupport) {
    risk = "高";
    conclusion = "目的国字段与多项目的地线索冲突，重点核查是否伪报";
    rules.push("R4-多项非申报目的地线索冲突");
    advice = "重点核对提单、舱单、订舱单、最终用户/最终用途声明及两用物项出口许可证目的地；核实是否存在改港、转运或最终收货人变更。";
  } else if (declared2 !== "TW" && hasTaiwanPort && hasTaiwanText && !declaredSupport) {
    risk = "高";
    conclusion = "非台湾目的国但台湾港口与台湾文本线索同时出现，重点核查";
    rules.push("R4-TW港口+TW文本且缺少申报国支撑");
    advice = "重点核对是否实际交付台湾客户或在台湾改变最终目的地；同时核验二程运输和许可证目的地。";
  } else if (declared2 !== "TW" && hasTaiwanPort) {
    risk = "中";
    conclusion = "存在台湾卸货/中转线索，需核查是否仅为转运";
    rules.push("R2-非台湾最终目的国但出现台湾港口/地点");
    advice = "核对台湾卸货或中转证明、二程提单、最终收货人、最终用户声明，确认是否仅经台湾转运。";
  } else if (declared2 === "TW" && !hasTaiwanPort && !hasTaiwanText) {
    risk = "中";
    conclusion = "申报台湾但缺少台湾港口/文本支撑，需核查运输路径";
    rules.push("R3-台湾目的国缺少台湾路径支撑");
    advice = "核对卸货港、收货地点代码、二程运输和台湾最终用户材料。";
  } else if (mismatches.length) {
    risk = "中";
    conclusion = "运输或收货线索与最终目的国不完全一致，需核查中转/绕道";
    rules.push("R3-目的国与卸货/收货/文本线索不一致");
    advice = "核对中转港、收货地点代码含义、二程运输单据和最终用户声明；确认是否存在实际目的国变更。";
  } else {
    rules.push("R1-关键字段一致或有申报国支撑");
  }

  if (support.length) rules.push(shortList(support, 4));
  if (mismatches.length) rules.push(shortList(mismatches, 5));

  const consistency = mismatches.length
    ? `不完全一致：${shortList(mismatches, 4)}`
    : `一致/有支撑：${shortList(support, 4) || "未发现冲突线索"}`;

  return {
    risk,
    conclusion,
    taiwan: taiwanDetails.length ? `是：${shortList(taiwanDetails, 5)}` : "否",
    evidence: shortList(evidence, 6),
    consistency,
    rules: shortList(rules, 7),
    advice,
  };
}

const analysisHeaders = [
  "分析_伪报目的国风险等级",
  "分析_筛查结论",
  "分析_涉及台湾线索",
  "分析_推断目的地线索",
  "分析_字段一致性",
  "分析_命中规则",
  "分析_核查建议",
];

const results = rows.map(analyze);
const analysisMatrix = [
  analysisHeaders,
  ...results.map((result) => [
    result.risk,
    result.conclusion,
    result.taiwan,
    result.evidence,
    result.consistency,
    result.rules,
    result.advice,
  ]),
];

sheet.getRange(`AC1:AI${rows.length + 1}`).values = analysisMatrix;
sheet.getRange("AC1:AI1").format = {
  fill: "#7C2D12",
  font: { bold: true, color: "#FFFFFF" },
  wrapText: true,
  horizontalAlignment: "center",
  verticalAlignment: "center",
};
sheet.getRange(`AC2:AI${rows.length + 1}`).format = {
  font: { color: "#111827" },
  verticalAlignment: "top",
};
sheet.getRange("AC1:AC9456").format.columnWidth = 13;
sheet.getRange("AD1:AD9456").format.columnWidth = 28;
sheet.getRange("AE1:AE9456").format.columnWidth = 32;
sheet.getRange("AF1:AF9456").format.columnWidth = 52;
sheet.getRange("AG1:AG9456").format.columnWidth = 50;
sheet.getRange("AH1:AH9456").format.columnWidth = 55;
sheet.getRange("AI1:AI9456").format.columnWidth = 48;
sheet.getRange("AC1:AI1").format.rowHeight = 36;
sheet.freezePanes.freezeRows(1);

const riskCounts = new Map();
const conclusionCounts = new Map();
let taiwanAny = 0;
let nonTaiwanWithTaiwanRoute = 0;
let highRows = 0;
let mediumRows = 0;
for (const result of results) {
  addCount(riskCounts, result.risk);
  addCount(conclusionCounts, result.conclusion);
  if (result.taiwan.startsWith("是")) taiwanAny += 1;
  if (result.risk === "高") highRows += 1;
  if (result.risk === "中") mediumRows += 1;
}
for (let i = 0; i < rows.length; i++) {
  const declared2 = iso3ToIso2[norm(cell(rows[i], "最终目的国（地区）"))] ?? "";
  if (declared2 !== "TW" && results[i].taiwan.startsWith("是")) nonTaiwanWithTaiwanRoute += 1;
}

const summary = workbook.worksheets.add("筛查汇总");
const summaryRows = [
  ["281111 目的国伪报风险筛查", ""],
  ["源文件", inputPath],
  ["数据行数", rows.length],
  ["新增分析列", analysisHeaders.join("，")],
  ["分析口径", "基于表内最终目的国、卸货地代码、收货地点代码、经停港(I)、境外收发货人/收货人及地址文本线索做一致性筛查；中转、卸货港不一致不等同于伪报，风险列用于人工核查。"],
  ["", ""],
  ["风险等级", "数量"],
  ["高", riskCounts.get("高") ?? 0],
  ["中", riskCounts.get("中") ?? 0],
  ["低", riskCounts.get("低") ?? 0],
  ["待核", riskCounts.get("待核") ?? 0],
  ["", ""],
  ["台湾线索行数", taiwanAny],
  ["非台湾最终目的国但出现台湾线索", nonTaiwanWithTaiwanRoute],
  ["高风险行数", highRows],
  ["中风险行数", mediumRows],
  ["", ""],
  ["规则", "说明"],
  ["R1", "关键字段一致，或卸货地/经停港/收货地点/文本至少一项支持申报最终目的国。"],
  ["R2", "最终目的国不是台湾，但出现台湾卸货、收货地点、经停港或文本线索；需确认是否仅为转运。"],
  ["R3", "最终目的国与卸货地、收货地点或文本线索不完全一致；常见于中转、内陆目的国借港、或字段口径差异。"],
  ["R4", "多项目的地线索共同指向非申报目的地，或台湾港口+台湾文本线索同时出现且缺少申报国支撑；重点核查。"],
  ["R0", "最终目的国代码未识别或关键字段不足，需补充数据后复核。"],
];
summary.getRange(`A1:B${summaryRows.length}`).values = summaryRows;
summary.getRange("A1:B1").merge();
summary.getRange("A1").format = {
  fill: "#1F2937",
  font: { bold: true, color: "#FFFFFF", size: 14 },
  horizontalAlignment: "center",
};
summary.getRange("A7:B7").format = {
  fill: "#E5E7EB",
  font: { bold: true },
};
summary.getRange("A18:B18").format = {
  fill: "#E5E7EB",
  font: { bold: true },
};
summary.getRange(`A1:B${summaryRows.length}`).format = {
  verticalAlignment: "top",
  wrapText: true,
};
summary.getRange("A:A").format.columnWidth = 28;
summary.getRange("B:B").format.columnWidth = 110;
summary.showGridLines = false;

const check = await workbook.inspect({
  kind: "table",
  range: "Sheet1!AC1:AI20",
  include: "values",
  tableMaxRows: 20,
  tableMaxCols: 7,
  maxChars: 8000,
});
console.log(check.ndjson);

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  summary: "final formula error scan",
  maxChars: 2000,
});
console.log(errors.ndjson);

const previewSheet = await workbook.render({
  sheetName: "Sheet1",
  range: "A1:AI30",
  scale: 1,
  format: "png",
});
await fs.writeFile(`${outputDir}/sheet1_analysis_preview.png`, new Uint8Array(await previewSheet.arrayBuffer()));

const previewSummary = await workbook.render({
  sheetName: "筛查汇总",
  autoCrop: "all",
  scale: 1,
  format: "png",
});
await fs.writeFile(`${outputDir}/summary_preview.png`, new Uint8Array(await previewSummary.arrayBuffer()));

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);

console.log(JSON.stringify({
  outputPath,
  rows: rows.length,
  riskCounts: Object.fromEntries(riskCounts),
  taiwanAny,
  nonTaiwanWithTaiwanRoute,
  highRows,
  mediumRows,
}, null, 2));
