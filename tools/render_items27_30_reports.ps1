$ErrorActionPreference = 'Stop'

$jobs = foreach ($item in 27..30) {
    $pattern = "D:\*\*\{0}_*\{0}_*.docx" -f $item
    $candidates = @(Get-ChildItem -Path $pattern -File -ErrorAction Stop | Where-Object { $_.Name -notlike '*QA*' })
    if ($candidates.Count -ne 1) { throw "Expected exactly one report for item $item, got $($candidates.Count)." }
    @{ Item = $item; Source = $candidates[0].FullName; Output = (Join-Path $candidates[0].DirectoryName '_qa_render') }
}

$tempRoot = 'C:\Temp\codex_items27_30'
New-Item -ItemType Directory -Force -Path $tempRoot | Out-Null
$wps = New-Object -ComObject kwps.Application
$wps.Visible = $false
$wps.DisplayAlerts = 0
try {
    foreach ($job in $jobs) {
        $item = $job.Item
        $outDir = $job.Output
        New-Item -ItemType Directory -Force -Path $outDir | Out-Null
        $inputDoc = Join-Path $tempRoot ("item{0}.docx" -f $item)
        $pdfTemp = Join-Path $tempRoot ("item{0}.pdf" -f $item)
        $pdfOut = Join-Path $outDir ("item{0}_QA.pdf" -f $item)
        Copy-Item -LiteralPath $job.Source -Destination $inputDoc -Force
        if (Test-Path -LiteralPath $pdfTemp) { Remove-Item -LiteralPath $pdfTemp -Force }
        $doc = $null
        for ($openTry = 1; $openTry -le 8; $openTry++) {
            try {
                $doc = $wps.Documents.Open($inputDoc, $false, $true)
                break
            }
            catch {
                if ($openTry -eq 8) { throw }
                Start-Sleep -Milliseconds (600 * $openTry)
            }
        }
        if ($null -eq $doc) { throw "Item $item open retries exhausted." }
        try {
            Start-Sleep -Milliseconds 800
            $doc.ExportAsFixedFormat($pdfTemp, 17)
            Start-Sleep -Milliseconds 800
        }
        finally {
            try { $doc.Close($false) } catch { }
        }
        if (-not (Test-Path -LiteralPath $pdfTemp)) { throw "Item $item PDF export failed." }
        Copy-Item -LiteralPath $pdfTemp -Destination $pdfOut -Force
        Get-ChildItem -LiteralPath $outDir -Filter 'page-*.png' -ErrorAction SilentlyContinue | Remove-Item -Force
        & 'C:\Users\59809\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\poppler\Library\bin\pdftoppm.exe' -png -r 120 $pdfOut (Join-Path $outDir 'page')
        $pages = @(Get-ChildItem -LiteralPath $outDir -Filter 'page-*.png' | Sort-Object Name)
        [pscustomobject]@{ Item = $item; Pages = $pages.Count; Pdf = $pdfOut }
    }
}
finally {
    try { $wps.Quit() } catch { }
    try { [System.Runtime.InteropServices.Marshal]::ReleaseComObject($wps) | Out-Null } catch { }
}
