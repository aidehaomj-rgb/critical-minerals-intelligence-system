$ErrorActionPreference = 'Stop'

$sourceDoc = 'D:\易迅数据\反倾销税深度分析报告\22_卤化丁基橡胶_美国欧盟英国新加坡\第22项_卤化丁基橡胶_反倾销税与第三国转运风险深度分析报告.docx'
$tempDir = 'C:\Temp\codex_item22_halobutyl'
$inputDoc = Join-Path $tempDir 'item22_report.docx'
$outputDir = 'D:\易迅数据\反倾销税深度分析报告\22_卤化丁基橡胶_美国欧盟英国新加坡\_docx_qa'
$pdfPath = Join-Path $outputDir '第22项_卤化丁基橡胶_反倾销税与第三国转运风险深度分析报告.pdf'

New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null
Copy-Item -LiteralPath $sourceDoc -Destination $inputDoc -Force
$wps = New-Object -ComObject Word.Application
$wps.Visible = $false
$wps.DisplayAlerts = 0
try {
    $doc = $wps.Documents.Open($inputDoc, $false, $true)
    try {
        $exported = $false
        for ($i = 1; $i -le 8; $i++) {
            try {
                $doc.ExportAsFixedFormat($pdfPath, 17)
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

if (-not (Test-Path -LiteralPath $pdfPath)) { throw 'PDF export did not produce an output file.' }

Get-ChildItem -LiteralPath $outputDir -Filter 'page-*.png' -ErrorAction SilentlyContinue | Remove-Item -Force
& 'C:\Users\59809\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\override\pdftoppm.cmd' -png -r 144 $pdfPath (Join-Path $outputDir 'page')
Get-ChildItem -LiteralPath $outputDir -Filter 'page-*.png' | Sort-Object Name | Select-Object Name,Length
