$ErrorActionPreference = 'Stop'

$base = 'D:\易迅数据\反倾销专题\反倾销税深度分析报告'
$tempRoot = 'C:\Temp\codex_items36_39'
New-Item -ItemType Directory -Force -Path $tempRoot | Out-Null

$wps = New-Object -ComObject kwps.Application
$wps.Visible = $false
$wps.DisplayAlerts = 0
try {
    foreach ($item in 36..39) {
        $folder = Get-ChildItem -LiteralPath $base -Directory | Where-Object Name -Like "$item`_*"
        $source = Get-ChildItem -LiteralPath $folder.FullName -Filter "$item`_*.docx" | Select-Object -First 1
        if ($null -eq $source) { throw "Missing DOCX for item $item" }
        $renderDir = Join-Path $folder.FullName '_qa_render'
        New-Item -ItemType Directory -Force -Path $renderDir | Out-Null

        $tempDoc = Join-Path $tempRoot "item$item.docx"
        $tempPdf = Join-Path $tempRoot "item$item.pdf"
        Copy-Item -LiteralPath $source.FullName -Destination $tempDoc -Force
        $doc = $wps.Documents.Open($tempDoc, $false, $true)
        try {
            Start-Sleep -Milliseconds 500
            $doc.ExportAsFixedFormat($tempPdf, 17)
        }
        finally {
            $doc.Close($false)
        }

        $pdfOut = Join-Path $folder.FullName ("_qa_" + $source.BaseName + '.pdf')
        Copy-Item -LiteralPath $tempPdf -Destination $pdfOut -Force
        Get-ChildItem -LiteralPath $renderDir -Filter 'page-*.png' -ErrorAction SilentlyContinue | Remove-Item -Force
        & 'C:\Users\59809\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\poppler\Library\bin\pdftoppm.exe' -png -r 110 $pdfOut (Join-Path $renderDir 'page')
        $pages = @(Get-ChildItem -LiteralPath $renderDir -Filter 'page-*.png')
        [pscustomobject]@{ Item = $item; Pages = $pages.Count; PDF = $pdfOut }
    }
}
finally {
    try { $wps.Quit() } catch { }
    try { [System.Runtime.InteropServices.Marshal]::ReleaseComObject($wps) | Out-Null } catch { }
}
