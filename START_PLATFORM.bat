@echo off
chcp 65001 > nul
title MF vs Monolith - Master's Thesis Platform Launcher
echo ========================================================
echo   ⚡ STARTING MF vs MONOLITH PLATFORM (MASTER'S THESIS)
echo   Автор: Пасенко Данііл (ФеІм-12)
echo ========================================================
echo.
echo [1/3] Building federated remotes (Catalog, Checkout, Reviews)...
cd /d "%~dp0"
call npm.cmd run build:remotes
if %errorlevel% neq 0 (
    echo [ERROR] Build failed! Check npm dependencies.
    pause
    exit /b %errorlevel%
)

echo.
echo [2/3] Launching all servers concurrently:
echo   - SplitLab (Defense Dashboard)  : http://localhost:5100
echo   - MF Shell (Host Container)     : http://localhost:5200
echo   - MF Catalog Remote             : http://localhost:5201
echo   - MF Checkout Remote            : http://localhost:5202
echo   - MF Reviews Remote (Vue 3)     : http://localhost:5203
echo   - Monolith App (Control Group)  : http://localhost:5300
echo.
echo [3/3] Opening SplitLab dashboard in default browser...
start http://localhost:5100

echo.
echo Press Ctrl+C in this window to stop all servers.
call npm.cmd start
pause
