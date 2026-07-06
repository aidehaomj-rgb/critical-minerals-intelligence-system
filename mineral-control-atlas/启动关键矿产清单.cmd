@echo off
cd /d "%~dp0"
start "关键矿产清单本地服务" /min "C:\Program Files\nodejs\node.exe" "%~dp0local-server.cjs"
timeout /t 1 /nobreak >nul
start "" "http://127.0.0.1:8765/#/export-controls"
