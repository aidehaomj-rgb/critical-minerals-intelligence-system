$ErrorActionPreference = 'Stop'

$sourceDoc = 'D:\易迅数据\反倾销税深度分析报告\26_邻氯对硝基苯胺\邻氯对硝基苯胺_反倾销税与第三国转运风险阶段审计报告.docx'
$tempDir = 'C:\Temp\codex_item26_ocpna'
$inputDoc = Join-Path $tempDir 'item26_report_v3.docx'
$outputDir = 'D:\易迅数据\反倾销税深度分析报告\26_邻氯对硝基苯胺\_qa_render_v2'
$pdfPath = Join-Path $outputDir '邻氯对硝基苯胺_反倾销税与第三国转运风险阶段审计报告_QA.pdf'
$pdfTemp = Join-Path $tempDir 'item26_report_v3.pdf'

New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null
Copy-Item -LiteralPath $sourceDoc -Destination $inputDoc -Force
$word = New-Object -ComObject kwps.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try {
    $doc = $word.Documents.Open($inputDoc)
    try {
        Start-Sleep -Seconds 2
        $exported = $false
        for ($i = 1; $i -le 8; $i++) {
            try {
                $doc.ExportAsFixedFormat($pdfTemp, 17)
                $exported = $true
                break
            }
            catch {
                if ($i -eq 8) { throw }
                Start-Sleep -Milliseconds (750 * $i)
            }
        }
        if (-not $exported) { throw 'PDF export retries exhausted.' }
        Start-Sleep -Seconds 2
    }
    finally {
        try { $doc.Close($false) } catch { }
    }
}
finally {
    try { $word.Quit() } catch { }
    try { [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null } catch { }
}

if (-not (Test-Path -LiteralPath $pdfTemp)) { throw 'PDF export did not produce an output file.' }
Copy-Item -LiteralPath $pdfTemp -Destination $pdfPath -Force

Get-ChildItem -LiteralPath $outputDir -Filter 'page-*.png' -ErrorAction SilentlyContinue | Remove-Item -Force
& 'C:\Users\59809\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\override\pdftoppm.cmd' -png -r 144 $pdfPath (Join-Path $outputDir 'page')
Get-ChildItem -LiteralPath $outputDir -Filter 'page-*.png' | Sort-Object Name | Select-Object Name,Length
