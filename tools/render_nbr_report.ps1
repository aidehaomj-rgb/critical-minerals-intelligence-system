$ErrorActionPreference = 'Stop'

$sourceDoc = $env:NBR_DOCX
$tempDir = 'C:\Temp\codex_nbr_report'
$inputDoc = Join-Path $tempDir 'nbr_report.docx'
$outputDir = 'C:\Temp\codex_nbr_report\qa'
$pdfPath = Join-Path $outputDir 'nbr_report.pdf'

New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null
Copy-Item -LiteralPath $sourceDoc -Destination $inputDoc -Force
$wps = New-Object -ComObject Word.Application
$wps.Visible = $false
$wps.DisplayAlerts = 0
try {
    $doc = $wps.Documents.Open($inputDoc, $false, $true)
    try {
        $doc.ExportAsFixedFormat($pdfPath, 17)
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

if (-not (Test-Path -LiteralPath $pdfPath)) { throw "PDF export did not produce an output file." }

& 'C:\Users\59809\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\override\pdftoppm.cmd' -png -r 144 $pdfPath (Join-Path $outputDir 'page')
Get-ChildItem -LiteralPath $outputDir -Filter 'page-*.png' | Sort-Object Name | Select-Object Name,Length
