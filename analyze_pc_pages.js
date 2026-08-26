const fs = require('fs');
const path = require('path');
let rows = [], audit = [];
for (let p = 1; p <= 14; p++) {
  const f = path.join(process.cwd(), `.pc_verified_page${p}.json`);
  const d = JSON.parse(fs.readFileSync(f, 'utf8'));
  audit.push({ page: p, count: d.rows.length, first: d.rows[0]?.slice(0, 7), last: d.rows.at(-1)?.slice(0, 7) });
  rows.push(...d.rows.map(r => ({ page: p, c: r })));
}
const num = x => { const n = Number(String(x || '').replace(/,/g, '')); return Number.isFinite(n) ? n : 0; };
const byOrigin = {}, bySupplier = {}, byBuyer = {}, byData = {};
for (const o of rows) {
  const c = o.c;
  const origin = c[11] || '(blank)', sup = c[6] || '(blank)', buy = c[5] || '(blank)', src = c[0] || '';
  const q = num(c[8]), w = num(c[7]), amt = num(c[9]);
  for (const [map, key] of [[byOrigin, origin], [bySupplier, sup], [byBuyer, buy], [byData, src]]) {
    map[key] ??= { count: 0, weight: 0, qty: 0, amount: 0 };
    map[key].count++; map[key].weight += w; map[key].qty += q; map[key].amount += amt;
  }
}
const top = (m, n = 30) => Object.entries(m).sort((a, b) => b[1].count - a[1].count).slice(0, n).map(([name, v]) => ({ name, ...v }));
const risky = rows.filter(o => /Taiwan|Vietnam|Malaysia|Thailand|Singapore|Hong Kong|Korea|Japan|Indonesia/i.test(`${o.c[11] || ''} ${o.c[6] || ''} ${o.c[4] || ''}`));
const out = { audit, totalRows: rows.length, topOrigins: top(byOrigin, 50), topSuppliers: top(bySupplier, 50), topBuyers: top(byBuyer, 40), dataSources: top(byData, 20), risky };
fs.writeFileSync('.pc_analysis.json', JSON.stringify(out, null, 2));
console.log(JSON.stringify({ totalRows: rows.length, audit: audit.map(x => ({ page: x.page, count: x.count })), topOrigins: out.topOrigins.slice(0, 15), topSuppliers: out.topSuppliers.slice(0, 15), sources: out.dataSources }, null, 2));
