param([Parameter(Mandatory=$true)][string]$Xlsx)

$tmpRoot = Join-Path $env:TEMP 'codex_epdm_xlsx_qa'
$tmp = Join-Path $tmpRoot ([guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $tmp -Force | Out-Null
try {
  $zip = Join-Path $tmpRoot (([guid]::NewGuid().ToString('N')) + '.zip')
  Copy-Item -LiteralPath $Xlsx -Destination $zip
  Expand-Archive -LiteralPath $zip -DestinationPath $tmp -Force
  $sheetXml = Get-Content -Raw -Encoding UTF8 (Join-Path $tmp 'xl\worksheets\sheet1.xml')
  $workbookXml = Get-Content -Raw -Encoding UTF8 (Join-Path $tmp 'xl\workbook.xml')
  $sheetNames = [regex]::Matches($workbookXml, 'name="([^"]+)"') | ForEach-Object { $_.Groups[1].Value }
  [pscustomobject]@{
    ZipExpanded = Test-Path -LiteralPath (Join-Path $tmp '[Content_Types].xml')
    SheetXmlCount = (Get-ChildItem (Join-Path $tmp 'xl\worksheets') -Filter 'sheet*.xml').Count
    TableXmlCount = (Get-ChildItem (Join-Path $tmp 'xl\tables') -Filter '*.xml').Count
    SheetNames = $sheetNames -join ', '
    HasCountFormula = $sheetXml -match 'COUNTIF'
    HasCached9160 = $sheetXml -match '<v>9160</v>'
  } | Format-List
}
finally {
  if (Test-Path -LiteralPath $tmp) { Remove-Item -LiteralPath $tmp -Recurse -Force }
  if ($zip -and (Test-Path -LiteralPath $zip)) { Remove-Item -LiteralPath $zip -Force }
}
