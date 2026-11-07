@echo off
title AcademiaRadar - Research & PhD Portal
echo ======================================================================
echo   ACADEMIARADAR - RECRUITMENT & PhD ADMISSIONS PORTAL
echo ======================================================================
echo   Tracking 253 Premier Institutions across India:
echo   - 23 IITs, IISc, 7 IISERs, NISER
echo   - 31 NITs, 28 IIITs, 38 CSIR Labs
echo   - DAE, ISRO, DRDO, ICMR, DBT, DST, MoES, ICAR Labs
echo   - 23 AIIMS Medical Institutes
echo   - 25 Top Private Research Universities
echo ======================================================================
echo.

:: Ensure Windows System32 is in path
set "PATH=C:\Windows\System32;C:\Windows;%PATH%"

:: Check Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not found in your PATH.
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo [OK] Node.js detected.
echo [*] Initializing database and starting local web server...
echo [*] Server will be available at: http://localhost:5000
echo.

:: Launch default browser after 2 seconds in background
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:5000"

:: Start Node.js server
node server.js
pause
