---
name: waimaogongshe-query
description: Query 外贸公社/Tradesparq trade intelligence data with Codex Browser for shipment, bill-of-lading, import/export, enterprise, product, HS code, country, date-range, and rerouting-risk research. Use when the user asks to search 外贸公社, 外贸数据, 提单数据, 贸易情报, 进口/出口记录, or to export and standardize shipment results.
---

# Waimaogongshe Query

Use this skill to query 外贸公社 trade data through the Codex in-app Browser, verify that filters actually applied, and export both raw and standardized results.

## Inputs to Support

Accept any subset of these inputs and infer reasonable defaults when safe:

- 查询关键词
- 产品名称
- HS编码
- 企业名称
- 进口国或出口国
- 起止日期
- 进口或出口方向
- 结果数量

If the request is about rerouting risk, treat the selected country as a possible supplier/exporter, buyer/importer, origin, destination, or transit signal depending on page fields.

## Browser Rules

- Use @Browser / Codex in-app Browser. Do not switch to Chrome unless the user explicitly asks.
- Start from `https://home.tradesparq.com/dashboard`; if already logged in, open `https://data.tradesparq.com/shipments/search`.
- Use the existing logged-in session. Do not store or reveal account names, passwords, cookies, SMS codes, or verification codes.
- If login expires, CAPTCHA appears, SMS verification appears, or a security prompt blocks access, pause and ask the user to handle it in the browser, then continue after they confirm.
- Prefer semantic selectors: button text, input placeholder, field label, ARIA role, table headers, search chips, and detail-page labels.
- Use fixed screen coordinates only as a last resort for a visible one-off recovery action. Do not build the workflow around coordinates.
- If the page is slow or the DOM is heavy, use visible-DOM snapshots, screenshots, short keyboard actions, and small targeted reads instead of full page extraction.

## Query Workflow

1. Open the data search page.
2. Record the query start time in local timezone.
3. Fill fields according to the user input:
   - 产品名称 or 查询关键词 -> 产品 field.
   - HS编码 -> HS编码 field.
   - 企业名称 -> supplier/buyer/company field most consistent with requested direction.
   - 出口方向 -> supplier/exporter/origin country fields first; for 中国出口风险, prefer supplier country/address/origin containing China/中国.
   - 进口方向 -> buyer/importer/destination country fields first.
   - 起止日期 -> start/end date fields or built-in period chips if exact date entry is unreliable.
4. Submit with the visible “搜索” button.
5. If results are too broad, iteratively narrow with HS code, country, supplier/buyer, product phrase, or date range.
6. For rerouting/third-country risk, run at least two complementary searches when data permits:
   - China/origin/supplier + controlled product or HS code.
   - Known third-country importer/destination + controlled product or HS code.

## Mandatory Filter Verification

Do not treat navigation or a result page as success by itself. Verify filters by at least two signals:

- visible query chips, search summary, or retained form values;
- URL query state plus decoded/visible criteria when available;
- first result/detail page fields matching product/HS/company/country/date;
- table headers/rows showing the expected controlled product or company;
- total result count changes after adding/removing a key filter.

If filter verification is incomplete, say exactly which fields were verified and which remain uncertain.

## Result Collection

Collect up to the requested result quantity. For each relevant record, capture:

- 企业名称
- 企业角色（供应商、采购商、进口商、出口商、报关/申报主体等）
- 产品名称
- HS编码
- 国家或地区
- 日期
- 数量、重量、金额
- 提运单号、报关单号、集装箱号、封志号 when present
- 原始记录链接
- 数据来源页面 URL
- 查询时间

For “从中国出口绕道第三国” risk, additionally flag:

- 原产地为中国但供应商登记在第三国；
- 供应商缺失、目的国/数据源字段冲突；
- 第三国收货后再出口到敏感目的地；
- 同一企业、地址、联系人、税号或路线在管制生效后重复出现；
- 商品描述与 HS 编码、重量、金额、运输方式明显不匹配。

Distinguish “事实字段” from “风险推断”. Do not state a violation unless the record itself or official enforcement source supports it.

## Export Priority

1. If the site offers export/download, download the raw Excel/CSV first and keep it unchanged.
2. Then run `scripts/normalize_trade_records.py` to create a standardized Excel workbook.
3. If export is not available, scrape visible table/detail records up to the requested quantity and save them into the same standardized workbook format.
4. Name outputs with a stable timestamp and query theme, for example:
   - `waimaogongshe_raw_YYYYMMDD_HHMMSS.xlsx`
   - `waimaogongshe_standardized_YYYYMMDD_HHMMSS.xlsx`

## Standard Output

Report these items to the user:

- 查询条件
- 数据来源页面
- 查询时间
- 结果总数
- 已采集结果数量
- 原始导出文件 path, if available
- 标准化 Excel path
- Key risk findings, grouped by evidence level

## Standardization Script

Use `scripts/normalize_trade_records.py` after downloading or scraping data.

Example:

```powershell
& "<python>" "path\to\waimaogongshe-query\scripts\normalize_trade_records.py" `
  --input "raw.xlsx" `
  --output "standardized.xlsx" `
  --source-url "https://data.tradesparq.com/shipments/search/record?..." `
  --query "产品=tungsten carbide powder; HS=284990; 起始=2025-01-01; 截止=2026-07-12"
```

If no raw file is available, create a small CSV from scraped rows and pass that CSV as `--input`.
