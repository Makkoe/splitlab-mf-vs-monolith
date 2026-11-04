@echo off
chcp 65001 > nul
title Benchmark Measurements - MF vs Monolith
echo ========================================================
echo   ⚡ RUNNING BENCHMARKS (MEASURING BUILDS & BUNDLE SIZES)
echo ========================================================
echo.
cd /d "%~dp0"
call npm.cmd run measure
echo.
echo ========================================================
echo   ✔ Measurements updated in lab/public/metrics.json
echo   and defense/public/metrics.json!
echo ========================================================
pause
