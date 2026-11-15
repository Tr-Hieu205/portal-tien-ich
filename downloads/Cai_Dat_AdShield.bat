@echo off
chcp 65001 >nul
title Cai Dat AdShield Pro - Google Chrome
echo ====================================================
echo   CAI DAT TIEN ICH ADSHIELD PRO VAO CHROME
echo ====================================================
echo.
echo [*] Dang mo trang Quan ly Tien ich tren Google Chrome...
start chrome.exe "chrome://extensions"
echo [*] Dang mo thu muc tien ich tren may tinh...
explorer.exe "%~dp0..\..\adblock-extension"
echo.
echo ====================================================
echo   HUONG DAN 1-CHAM:
echo   1. Bat cong tac "Che do danh cho nha phat trien" (goc tren ben phai Chrome)
echo   2. Keo thu muc adblock-extension vua hien ra tha vao giua man hinh Chrome!
echo ====================================================
echo.
pause
