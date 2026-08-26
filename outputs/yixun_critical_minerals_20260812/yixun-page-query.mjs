import fs from 'node:fs/promises';

const OUTPUT_DIR = 'C:/Users/59809/Documents/关键矿产/outputs/yixun_critical_minerals_20260812';

export async function queryAndSave(tab, { key, mineral, term }) {
  await tab.playwright.getByRole('button', { name: '重置', exact: true }).click({ timeoutMs: 30000 });
  await tab.playwright.getByPlaceholder('请输入产品英文关键词').fill(term, { timeoutMs: 30000 });
  await tab.playwright.getByPlaceholder('请输入原产国/地区名称').fill('CHINA', { timeoutMs: 30000 });
  await tab.playwright.waitForTimeout(350);
  const countryOptions = await tab.playwright.getByText('CHINA', { exact: true }).all();
  await countryOptions[countryOptions.length - 1].click({ timeoutMs: 30000 });
  await tab.playwright.getByText('本年度', { exact: true }).click({ timeoutMs: 30000 });
  await tab.playwright.getByRole('button', { name: '搜索', exact: true }).click({ timeoutMs: 30000 });
  await tab.playwright.waitForTimeout(1200);

  let body = await tab.playwright.locator('body').innerText({ timeoutMs: 30000 });
  const match = body.match(/([\d,]+)\s*次交易次数/);
  const total = match ? Number(match[1].replace(/,/g, '')) : 0;

  if (total > 20 && total <= 200) {
    await tab.playwright.locator('.el-pagination .el-select').click({ timeoutMs: 30000 });
    await tab.playwright.getByText('200条/页', { exact: true }).click({ timeoutMs: 30000 });
    await tab.playwright.waitForTimeout(900);
    body = await tab.playwright.locator('body').innerText({ timeoutMs: 30000 });
  }

  const rows = await tab.playwright.locator('table tbody tr').evaluateAll(
    rs => rs.map(r => Array.from(r.querySelectorAll('td')).map(td => td.innerText.trim())),
    null,
    { timeoutMs: 30000 },
  );
  const tags = await tab.playwright.locator('.el-tag').allTextContents({ timeoutMs: 30000 });
  const dateValue = await tab.playwright.locator('input[placeholder="请选择日期"]').getAttribute('value', { timeoutMs: 30000 });
  const validation = {
    termTag: tags.some(t => t.trim() === term),
    chinaTag: tags.some(t => t.trim() === 'CHINA'),
    dateValue,
    firstDescription: rows[0]?.[4] || '',
  };
  if (!validation.termTag || !validation.chinaTag) {
    throw new Error(`筛选校验失败: ${JSON.stringify(validation)}`);
  }

  const payload = {
    mineral,
    term,
    scope: `页面显示日期：${dateValue}；原产国/地区=CHINA`,
    checkedAt: new Date().toISOString(),
    total,
    reviewedRows: rows.length,
    coverage: total <= rows.length ? '页面结果全量' : `页面可见前${rows.length}条`,
    validation,
    rows,
  };
  await fs.writeFile(`${OUTPUT_DIR}/${key}_refined.json`, JSON.stringify(payload, null, 2), 'utf8');
  return { key, mineral, term, total, saved: rows.length, coverage: payload.coverage, validation };
}
