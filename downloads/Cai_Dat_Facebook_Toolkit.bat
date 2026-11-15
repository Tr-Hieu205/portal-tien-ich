@echo off
chcp 65001 >nul
title Cai Dat Facebook Toolkit Pro - Google Chrome
echo ====================================================
echo   CAI DAT TIEN ICH FACEBOOK TOOLKIT PRO VAO CHROME
echo ====================================================
echo.
echo [*] Dang mo trang Quan ly Tien ich tren Google Chrome...
start chrome.exe "chrome://extensions"
echo [*] Dang mo thu muc tien ich facebook-toolkit tren may tinh...
if exist "%~dp0..\..\facebook-toolkit" (
  explorer.exe "%~dp0..\..\facebook-toolkit"
) else if exist "%~dp0..\facebook-toolkit" (
  explorer.exe "%~dp0..\facebook-toolkit"
) else (
  explorer.exe "%~dp0.."
)
echo.
echo ====================================================
echo   HUONG DAN 1-CHAM:
echo   1. Bat cong tac "Che do danh cho nha phat trien" (goc tren ben phai Chrome)
echo   2. Keo thu muc facebook-toolkit vua hien ra tha vao giua man hinh Chrome!
echo ====================================================
echo.
pause
