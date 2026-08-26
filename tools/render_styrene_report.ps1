$ErrorActionPreference = 'Stop'
$base = 'D:\' + [char]0x6613 + [char]0x8FC5 + [char]0x6570 + [char]0x636E + '\' + [char]0x53CD + [char]0x503E + [char]0x9500 + [char]0x7A0E + [char]0x6DF1 + [char]0x5EA6 + [char]0x5206 + [char]0x6790 + [char]0x62A5 + [char]0x544A
$item = Join-Path $base ('23_' + [char]0x82EF + [char]0x4E59 + [char]0x70EF)
$src = (Get-ChildItem -LiteralPath $item -Filter '*.docx' | Select-Object -First 1).FullName
$out = Join-Path $item '_qa_render'
$tmp = 'C:\Temp\codex_styrene_item23'
$input = Join-Path $tmp ('styrene_report_' + [guid]::NewGuid().ToString('N') + '.docx')
$pdf = Join-Path $out 'styrene_report.pdf'
New-Item -ItemType Directory -Force -Path $out,$tmp | Out-Null
Copy-Item -LiteralPath $src -Destination $input -Force
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try {
  $doc = $word.Documents.Open($input,$false,$true)
  try {
    $done = $false
    for ($i=1; $i -le 8; $i++) {
      try { $doc.ExportAsFixedFormat($pdf,17); $done=$true; break }
      catch { if ($i -eq 8) { throw }; Start-Sleep -Milliseconds (800*$i) }
    }
    if (-not $done) { throw 'PDF export failed' }
    Start-Sleep -Seconds 2
  } finally { try { $doc.Close($false) } catch {} }
} finally {
  $word.Quit()
  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
}
Get-ChildItem -LiteralPath $out -Filter 'page-*.png' -ErrorAction SilentlyContinue | Remove-Item -Force
& 'C:\Users\59809\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\override\pdftoppm.cmd' -png -r 144 $pdf (Join-Path $out 'page')
Get-ChildItem -LiteralPath $out -Filter 'page-*.png' | Sort-Object Name | Select-Object Name,Length
