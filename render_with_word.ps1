$ErrorActionPreference = 'Stop'
$docx = 'C:\Users\59809\Documents\关键矿产\outputs\Terra_Drone集团供应链与产能核查报告_2026-08-21.docx'
$pdf = 'C:\Users\59809\Documents\关键矿产\outputs\Terra_Drone集团供应链与产能核查报告_2026-08-21.pdf'
$word = New-Object -ComObject Word.Application
$word.Visible = $false
try {
  $doc = $word.Documents.Open($docx, $false, $true)
  $ok = $false
  for ($i=0; $i -lt 5 -and -not $ok; $i++) {
    try { Start-Sleep -Milliseconds 1200; $doc.ExportAsFixedFormat($pdf, 17); $ok = $true }
    catch { if ($i -eq 4) { throw } }
  }
  $doc.Close($false)
} finally {
  $word.Quit()
}
Write-Output $pdf
