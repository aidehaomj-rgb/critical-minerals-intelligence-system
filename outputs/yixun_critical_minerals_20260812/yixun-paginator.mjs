import fs from 'node:fs/promises';

const OUT = 'C:/Users/59809/Documents/关键矿产/outputs/yixun_critical_minerals_20260812';

async function rowsOnPage(tab) {
  return tab.playwright.locator('table tbody tr').evaluateAll(
    rs => rs.map(r => Array.from(r.querySelectorAll('td')).map(td => td.innerText.trim())),
    null,
    { timeoutMs: 30000 },
  );
}

export async function startPagedQuery(tab, { key, mineral, term, policyNote = '' }) {
  await tab.playwright.getByRole('button', { name: '重置', exact: true }).click({ timeoutMs: 30000 });
  await tab.playwright.getByPlaceholder('请输入产品英文关键词').fill(term, { timeoutMs: 30000 });
  await tab.playwright.getByPlaceholder('请输入原产国/地区名称').fill('CHINA', { timeoutMs: 30000 });
  await tab.playwright.waitForTimeout(350);
  const countries = await tab.playwright.getByText('CHINA', { exact: true }).all();
  await countries[countries.length - 1].click({ timeoutMs: 30000 });
  await tab.playwright.getByText('本年度', { exact: true }).click({ timeoutMs: 30000 });
  await tab.playwright.getByRole('button', { name: '搜索', exact: true }).click({ timeoutMs: 30000 });
  await tab.playwright.waitForTimeout(1200);
  const body = await tab.playwright.locator('body').innerText({ timeoutMs: 30000 });
  const match = body.match(/([\d,]+)\s*次交易次数/);
  const total = match ? Number(match[1].replace(/,/g, '')) : 0;
  if (total > 20) {
    await tab.playwright.locator('.el-pagination .el-select').click({ timeoutMs: 30000 });
    await tab.playwright.getByText('200条/页', { exact: true }).click({ timeoutMs: 30000 });
    await tab.playwright.waitForTimeout(900);
  }
  const rows = await rowsOnPage(tab);
  const payload = {
    mineral, term,
    scope: '页面显示日期：2026-01-01 ~ 2026-08-06；原产国/地区=CHINA',
    checkedAt: new Date().toISOString(), total, reviewedRows: rows.length,
    coverage: total <= rows.length ? '页面结果全量' : `已查看第1页，共${rows.length}条`,
    policyNote, lastPage: 1, rows,
  };
  await fs.writeFile(`${OUT}/${key}_refined.json`, JSON.stringify(payload, null, 2), 'utf8');
  return { key, total, lastPage: 1, saved: rows.length };
}

export async function continuePagedQuery(tab, { key, pages }) {
  const path = `${OUT}/${key}_refined.json`;
  const payload = JSON.parse(await fs.readFile(path, 'utf8'));
  const updates = [];
  for (let i = 0; i < pages && payload.reviewedRows < payload.total; i += 1) {
    const next = tab.playwright.locator('.el-pagination .btn-next');
    const disabled = await next.getAttribute('disabled', { timeoutMs: 30000 });
    if (disabled !== null) break;
    await next.click({ timeoutMs: 30000 });
    await tab.playwright.waitForTimeout(650);
    const pageRows = await rowsOnPage(tab);
    payload.lastPage += 1;
    payload.rows.push(...pageRows);
    payload.reviewedRows = payload.rows.length;
    payload.coverage = payload.reviewedRows >= payload.total
      ? '页面结果全量'
      : `已查看第1—${payload.lastPage}页，共${payload.reviewedRows}条`;
    await fs.writeFile(path, JSON.stringify(payload, null, 2), 'utf8');
    updates.push({ page: payload.lastPage, pageRows: pageRows.length, saved: payload.reviewedRows });
  }
  return { key, total: payload.total, lastPage: payload.lastPage, saved: payload.reviewedRows, coverage: payload.coverage, updates };
}
