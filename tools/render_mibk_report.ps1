$ErrorActionPreference = 'Stop'

$sourceDoc = 'D:\易迅数据\反倾销税深度分析报告\25_甲基异丁基酮\甲基异丁基（甲）酮_反倾销税与第三国转运风险深度审计报告.docx'
$tempDir = 'C:\Temp\codex_item25_mibk'
$inputDoc = Join-Path $tempDir 'item25_mibk_report_v2.docx'
$outputDir = 'D:\易迅数据\反倾销税深度分析报告\25_甲基异丁基酮\_qa_render_current'
$pdfPath = Join-Path $outputDir 'mibk_report_QA.pdf'
$pdfTemp = Join-Path $tempDir 'item25_mibk_report_v2.pdf'

New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null
Copy-Item -LiteralPath $sourceDoc -Destination $inputDoc -Force

$wps = New-Object -ComObject kwps.Application
$wps.Visible = $false
$wps.DisplayAlerts = 0
try {
    $doc = $null
    for ($openTry = 1; $openTry -le 8; $openTry++) {
        try {
            $doc = $wps.Documents.Open($inputDoc, $false, $true)
            break
        }
        catch {
            if ($openTry -eq 8) { throw }
            Start-Sleep -Milliseconds (750 * $openTry)
        }
    }
    if ($null -eq $doc) { throw 'Document open retries exhausted.' }
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
    try { $wps.Quit() } catch { }
    try { [System.Runtime.InteropServices.Marshal]::ReleaseComObject($wps) | Out-Null } catch { }
}

if (-not (Test-Path -LiteralPath $pdfTemp)) { throw 'PDF export did not produce an output file.' }
Copy-Item -LiteralPath $pdfTemp -Destination $pdfPath -Force
Get-ChildItem -LiteralPath $outputDir -Filter 'page-*.png' -ErrorAction SilentlyContinue | Remove-Item -Force
& 'C:\Users\59809\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\poppler\Library\bin\pdftoppm.exe' -png -r 144 $pdfPath (Join-Path $outputDir 'page')
Get-ChildItem -LiteralPath $outputDir -Filter 'page-*.png' | Sort-Object Name | Select-Object Name,Length
