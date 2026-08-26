$ErrorActionPreference = 'Stop'

$inputDoc = 'C:\Temp\codex_halobutyl\halobutyl_report.docx'
$outputDir = 'C:\Temp\codex_halobutyl\docx_qa'
$pdfPath = Join-Path $outputDir 'halobutyl_report.pdf'

New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try {
    $doc = $word.Documents.Open($inputDoc, $false, $true)
    try {
        # 17 = wdExportFormatPDF
        $doc.ExportAsFixedFormat($pdfPath, 17)
    }
    finally {
        $doc.Close($false)
    }
}
finally {
    $word.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
}

& 'C:\Users\59809\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\override\pdftoppm.cmd' -png -r 144 $pdfPath (Join-Path $outputDir 'page')
Get-ChildItem -LiteralPath $outputDir -Filter 'page-*.png' | Sort-Object Name | Select-Object Name,Length
