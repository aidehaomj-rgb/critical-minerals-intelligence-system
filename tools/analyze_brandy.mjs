import fs from "node:fs/promises";
import path from "node:path";

const productDir = "D:/易迅数据/反倾销税深度分析报告/04_白兰地（200升以下容器）";
const inputs = [
  ["HS220820+ARMAGNAC", "易迅_HS220820_ARMAGNAC查询_全部144条.json"],
  ["BRANDY", "易迅_BRANDY_全部187条.json"],
  ["COGNAC", "易迅_COGNAC_全部170条.json"],
];

const EU = new Set([
  "Austria","Belgium","Bulgaria","Croatia","Cyprus","Czech Republic","Denmark","Estonia","Finland","France","Germany","Greece","Hungary","Ireland","Italy","Latvia","Lithuania","Luxembourg","Malta","Netherlands","Poland","Portugal","Romania","Slovakia","Slovenia","Spain","Sweden",
]);

const frenchProtected = /\b(COGNAC|ARMAGNAC)\b/i;
const euBrand = /HENNESSY|MARTELL|REMY|R[ÉE]MY|COURVOISIER|CAMUS|HINE\b|LOUIS ROYER|FERRAND|DELAMAIN|TESSERON|GODET|BACHE.?GABRIELSEN|DARTIGALONGUE|RAGNAUD|BOINAUD|GROSPERRIN|H\.MOUNIER|MOUNIER/i;
const productTerm = /\bBRANDY\b|\bCOGNAC\b|\bARMAGNAC\b|GRAPE (?:WINE|MARC)|PISCO|AGUARDIENTE[^\n]{0,60}(?:UVA|UVAS|VINO|ORUJO)|EAU[- ]DE[- ]VIE/i;
const obviousOther = /BRANDY MELVILLE|GARMENT|T[- ]?SHIRT|TROUSER|PANTS|SKIRT|DRESS|SHOE|FOOTWEAR|SANDAL|HANDBAG|CLOTHING|FABRIC|COTTON|POLYESTER|SPandex/i;
const nonGoods = /\b(?:LABEL|LABLE|PAPER|PACKAGING|TRIM CARD|COLOUR|COLOR)\b|LEATHER|HIDE OF|TEXTILE|UPHOLSTERY|PVC|MONOGRAM|JACQUARD/i;
const beverageContext = /ALCOHOL|SPIRIT|DISTILL|GRAPE|WINE|MARC|PISCO|AGUARDIENTE|BOTTLE|BOT\.|BOTELLA|\b\d+(?:\.\d+)?\s*(?:ML|CL|CC|LIT(?:ER|RE)?S?)\b|HENNESSY|MARTELL|REMY|R[ÉE]MY|COURVOISIER|CAMUS/i;
const bulkTerm = /FLEXI|FLEXITANK|ISO.?TANK|TANK.?CONTAINER|TANKCONTAINER|\bBULK\b|STOLT/i;
const bottleTerm = /\b\d+(?:\.\d+)?\s*(?:ML|CL|CC)\b|\b\d+(?:\.\d+)?\s*L(?:IT(?:ER|RE)S?)?\b|BOTTLE|BOT\.|BOTELLA|BOT\.D\/VIDRIO|CASES? OF|CARTONS?|CTNS?/i;

const undertakingNames = [
  "MARTELL", "HENNESSY", "REMY MARTIN", "H.MOUNIER", "RAGNAUD SABOURIN", "COMPAGNIE FRANCAISE DES SPIRITUEUX", "MAINE DRILHON", "FTD SASU", "CHATEAU MONTIFAUD", "DOBBE", "MAISON BOINAUD", "DISTILLERIE DES MOISANS", "THOMAS HINE", "LOUIS ROYER", "COGNAC GROSPERRIN", "DISTILLERIE MERLET", "BACHE GABRIELSEN", "COGNAC FERRAND", "SVE SAS", "MAISON DES PIERRES", "CAMUS", "COURVOISIER", "MAUXION", "GODET", "ARMAGNAC J. GOUDOULIN", "FRANCIS DARROZE", "CHATEAU DE LACQUY", "TESSERON", "JEAN FILLIOUX", "DELAMAIN", "DARTIGALONGUE", "CLUB DES MARQUES", "CHATEAU SAINT-AUBIN", "JOY SELECTION",
];

function num(s) {
  const v = Number(String(s ?? "").replace(/,/g, ""));
  return Number.isFinite(v) ? v : null;
}

function norm(s) {
  return String(s ?? "").replace(/\s+/g, " ").trim();
}

function dedupKey(r) {
  return [r.date,r.hs,r.description,r.buyer,r.supplier,r.weight,r.quantity,r.amount,r.destination,r.origin].map(norm).join("|").toUpperCase();
}

function undertakingMatch(text) {
  const up = text.toUpperCase();
  return undertakingNames.find((n) => up.includes(n)) || "";
}

const all = [];
for (const [query, file] of inputs) {
  const data = JSON.parse(await fs.readFile(path.join(productDir, file), "utf8"));
  for (const rec of data) {
    const c = rec.cells;
    all.push({
      query,
      source: norm(c[0]), flow: norm(c[1]), date: norm(c[2]), hs: norm(c[3]),
      description: norm(c[4]), buyer: norm(c[5]), supplier: norm(c[6]),
      weight: num(c[7]), quantity: num(c[8]), amount: num(c[9]),
      destination: norm(c[10]), origin: norm(c[11]),
    });
  }
}

const byKey = new Map();
for (const r of all) {
  const k = dedupKey(r);
  if (!byKey.has(k)) byKey.set(k, {...r, queries: new Set([r.query])});
  else byKey.get(k).queries.add(r.query);
}

const unique = [...byKey.values()].map((r, i) => {
  const text = `${r.description} ${r.supplier} ${r.buyer}`;
  const hsRelevant = r.hs.startsWith("220820");
  const keywordRelevant = productTerm.test(r.description) && beverageContext.test(r.description) && !obviousOther.test(r.description) && !nonGoods.test(r.description);
  const relevant = hsRelevant || keywordRelevant;
  let scope = "不属于涉税商品/同词异物";
  if (relevant) {
    if (bulkTerm.test(text)) scope = "疑似≥200升散装/罐式运输，原则上排除但需核包装容量";
    else if (bottleTerm.test(r.description)) scope = "描述支持<200升零售/小包装";
    else scope = "容量未披露，需原始提单/装箱单核验";
  }
  const isEU = EU.has(r.origin);
  const protectedMark = frenchProtected.test(r.description);
  const brandMark = euBrand.test(text);
  const undertaking = undertakingMatch(text);
  let risk = "排除";
  let reason = "非白兰地或同词异物";
  let evidenceLevel = "C";
  if (relevant) {
    risk = "低";
    evidenceLevel = "C+";
    reason = "税号/描述相关，但现有字段未显示受税来源绕道";
    if (scope.startsWith("疑似≥200升")) {
      risk = "中";
      evidenceLevel = "B-";
      reason = "散装/罐式运输可能在200升边界外；需核实际包装容量及是否拆分申报";
    }
    if (isEU) {
      risk = undertaking ? "中高" : "中";
      evidenceLevel = undertaking ? "B" : "B-";
      reason = undertaking
        ? `欧盟原产且指向价格承诺企业/品牌（${undertaking}）；需核有效发票、承诺证明函、成交价及贸易方式`
        : "欧盟原产直接对华；需核生产商身份、适用税率、完税凭证和是否经保税/加工贸易";
    } else if (protectedMark || brandMark) {
      risk = "高";
      evidenceLevel = "B+";
      reason = "非欧盟原产字段与法国受保护产区名称/欧盟品牌同时出现，构成具体第三国再出口核查线索";
    } else if (r.origin === "United Kingdom" && /HILLEBRAND|FRANCE|REMY|HENNESSY|MARTELL/i.test(text)) {
      risk = "中";
      evidenceLevel = "B-";
      reason = "英国原产字段且由跨境酒类物流商发运；尚无欧盟原产标记，需用前段提单核是否经英国再出口";
    } else if (!isEU && scope.includes("容量未披露") && /FRANCE|FRENCH/i.test(text)) {
      risk = "中高";
      evidenceLevel = "B";
      reason = "非欧盟原产字段与法国供应链标记冲突，需核原产地证";
    }
  }
  let rate = "不适用/待核";
  if (relevant && isEU) {
    if (/MARTELL/i.test(text)) rate = "27.7%（承诺条件满足时可不征）";
    else if (/HENNESSY/i.test(text)) rate = "34.9%（承诺条件满足时可不征）";
    else if (/REMY|R[ÉE]MY/i.test(text)) rate = "34.3%（承诺条件满足时可不征）";
    else if (undertaking) rate = "32.2%或列名税率（需核附表；承诺条件满足时可不征）";
    else rate = "32.2%/34.9%待生产商识别";
  } else if (relevant && !isEU && (protectedMark || brandMark)) {
    rate = "若实为欧盟原产：按生产商27.7%—34.9%补征";
  }
  return {
    id: i + 1,
    ...r,
    queries: [...r.queries].sort().join(";"),
    relevant, scope, isEU, protectedMark, brandMark, undertaking,
    risk, evidenceLevel, reason, rate,
  };
});

function group(rows, field) {
  const m = new Map();
  for (const r of rows) {
    const k = r[field] || "(空白)";
    const x = m.get(k) || {name:k, tickets:0, weight:0, amount:0};
    x.tickets += 1; x.weight += r.weight || 0; x.amount += r.amount || 0; m.set(k,x);
  }
  return [...m.values()].sort((a,b)=>b.tickets-a.tickets || b.weight-a.weight);
}

const relevantRows = unique.filter((r)=>r.relevant);
const highRows = relevantRows.filter((r)=>r.risk === "高" || r.risk === "中高");
const euRows = relevantRows.filter((r)=>r.isEU);
const nonEuRows = relevantRows.filter((r)=>!r.isEU);
const explicitBulk = relevantRows.filter((r)=>r.scope.startsWith("疑似≥200升"));
const smallPack = relevantRows.filter((r)=>r.scope.startsWith("描述支持"));
const unverified = relevantRows.filter((r)=>r.scope.startsWith("容量未披露"));
const thirdCountryPriority = relevantRows.filter((r)=>!r.isEU && r.risk === "高");
const undertakingDirect = relevantRows.filter((r)=>r.isEU && r.undertaking);

const hennessyIndonesiaRaw = JSON.parse(await fs.readFile(path.join(productDir, "易迅_HENNESSY至印度尼西亚_全部78条.json"), "utf8"));
const hennessyIndonesia = hennessyIndonesiaRaw.map((rec, i)=>{
  const c = rec.cells;
  return {
    row:i+1, source:norm(c[0]), flow:norm(c[1]), date:norm(c[2]), hs:norm(c[3]), description:norm(c[4]),
    buyer:norm(c[5]), supplier:norm(c[6]), weight:num(c[7]), quantity:num(c[8]), amount:num(c[9]),
    destination:norm(c[10]), origin:norm(c[11]),
  };
});
const aerofoodMini = hennessyIndonesia.filter((r)=>/AEROFOOD/i.test(r.buyer) && /HENNESSY\s*XO\s*\(5\s*CL\)/i.test(r.description));
const bLeg = thirdCountryPriority.find((r)=>r.origin === "Indonesia" && /HENNESSY\s*XO\s*\(5\s*CL\)/i.test(r.description));
const exactALeg = aerofoodMini.find((r)=>r.date === "2026-06-24" && r.quantity === 6);
const matchedChains = bLeg && exactALeg ? [{
  product:"COGNAC MINI - HENNESSY XO (5 CL)",
  aLeg:{date:exactALeg.date,route:`${exactALeg.origin}→Indonesia`,supplier:exactALeg.supplier,buyer:exactALeg.buyer,quantity:exactALeg.quantity,weightKg:exactALeg.weight,amountUsd:exactALeg.amount},
  bLeg:{date:bLeg.date,route:"Indonesia→China（平台目的国）",supplier:bLeg.supplier,buyer:bLeg.buyer,quantity:bLeg.quantity,weightKg:bLeg.weight,amountUsd:bLeg.amount},
  match:"商品描述完全一致、数量均为6、金额768.62/768.48美元、间隔2天",
  interpretation:"已形成实物转供/航材补给链证据；结合Aerofood航空配餐属性与China Airlines买方，较可能属于机供品而非中国境内一般贸易进口，不能据此认定逃避反倾销税。",
}] : [];

const summary = {
  queryRows: {total: all.length, hsArmagnac: 144, brandy: 187, cognac: 170},
  uniqueRows: unique.length,
  relevantRows: relevantRows.length,
  excludedRows: unique.length - relevantRows.length,
  euRows: euRows.length,
  nonEuRows: nonEuRows.length,
  highOrMediumHigh: highRows.length,
  thirdCountryPriorityRows: thirdCountryPriority.length,
  thirdCountryPriorityWeightKg: thirdCountryPriority.reduce((s,r)=>s+(r.weight||0),0),
  undertakingDirectRows: undertakingDirect.length,
  undertakingDirectWeightKg: undertakingDirect.reduce((s,r)=>s+(r.weight||0),0),
  scope: {explicitBulk: explicitBulk.length, smallPack: smallPack.length, unverified: unverified.length},
  explicitBulkWeightKg: explicitBulk.reduce((s,r)=>s+(r.weight||0),0),
  weightKg: relevantRows.reduce((s,r)=>s+(r.weight||0),0),
  euWeightKg: euRows.reduce((s,r)=>s+(r.weight||0),0),
  highWeightKg: highRows.reduce((s,r)=>s+(r.weight||0),0),
  origins: group(relevantRows,"origin"),
  buyers: group(relevantRows,"buyer").slice(0,30),
  suppliers: group(relevantRows,"supplier").slice(0,30),
  highOrigins: group(highRows,"origin"),
  bulkRows: explicitBulk,
  highRows,
  aLeg:{total:hennessyIndonesia.length,origins:group(hennessyIndonesia,"origin"),aerofoodMiniRows:aerofoodMini},
  matchedChains,
};

await fs.writeFile(path.join(productDir, "白兰地_分析结果.json"), JSON.stringify({summary, rows: unique, aLegRows:hennessyIndonesia}, null, 2), "utf8");
const compact = {...summary};
compact.bulkRows = compact.bulkRows.map((r)=>({id:r.id,date:r.date,origin:r.origin,buyer:r.buyer,supplier:r.supplier,weight:r.weight}));
compact.highRows = compact.highRows.map((r)=>({id:r.id,date:r.date,hs:r.hs,origin:r.origin,description:r.description,buyer:r.buyer,supplier:r.supplier,weight:r.weight,risk:r.risk,evidenceLevel:r.evidenceLevel}));
compact.aLeg = {total:compact.aLeg.total,origins:compact.aLeg.origins,aerofoodMiniRows:compact.aLeg.aerofoodMiniRows};
console.log(JSON.stringify(compact, null, 2));
