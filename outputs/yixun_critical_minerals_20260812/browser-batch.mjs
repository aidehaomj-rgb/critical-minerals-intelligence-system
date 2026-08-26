import fs from 'node:fs/promises';

export const primaryQueries = [
  ['gallium', '镓', 'GALLIUM'],
  ['germanium', '锗', 'GERMANIUM'],
  ['graphite', '石墨', 'NATURAL FLAKE GRAPHITE'],
  ['antimony', '锑', 'ANTIMONY TRIOXIDE'],
  ['diamond', '金刚石', 'INDUSTRIAL DIAMOND'],
  ['tungsten', '钨', 'TUNGSTEN CARBIDE'],
  ['tellurium', '碲', 'TELLURIUM METAL'],
  ['bismuth', '铋', 'BISMUTH METAL'],
  ['molybdenum', '钼', 'MOLYBDENUM POWDER'],
  ['indium', '铟', 'INDIUM PHOSPHIDE'],
  ['samarium', '钐', 'SAMARIUM OXIDE'],
  ['gadolinium', '钆', 'GADOLINIUM OXIDE'],
  ['terbium', '铽', 'TERBIUM OXIDE'],
  ['dysprosium', '镝', 'DYSPROSIUM OXIDE'],
  ['lutetium', '镥', 'LUTETIUM OXIDE'],
  ['scandium', '钪', 'SCANDIUM OXIDE'],
  ['yttrium', '钇', 'YTTRIUM OXIDE'],
  ['holmium', '钬', 'HOLMIUM OXIDE'],
  ['erbium', '铒', 'ERBIUM OXIDE'],
  ['thulium', '铥', 'THULIUM OXIDE'],
  ['europium', '铕', 'EUROPIUM OXIDE'],
  ['ytterbium', '镱', 'YTTERBIUM OXIDE'],
  ['lithium', '锂', 'LITHIUM IRON PHOSPHATE'],
  ['nickel', '镍', 'NICKEL COBALT MANGANESE HYDROXIDE'],
  ['cobalt', '钴', 'NICKEL COBALT ALUMINUM HYDROXIDE'],
  ['manganese', '锰', 'LITHIUM RICH MANGANESE CATHODE'],
];

export async function extractRows(tab) {
  return await tab.playwright.locator('table tbody tr').evaluateAll(
    rows => rows.map(r => Array.from(r.querySelectorAll('td')).map(td => td.innerText.trim())),
    null,
    { timeoutMs: 30000 },
  );
}

export async function saveResult(dir, key, payload) {
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(`${dir}/${key}.json`, JSON.stringify(payload, null, 2), 'utf8');
}
