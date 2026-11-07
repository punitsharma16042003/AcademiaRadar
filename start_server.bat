@echo off
setlocal
title AcademiaRadar - Research and PhD Portal

set "PATH=C:\Windows\System32;C:\Windows;%PATH%"

echo ======================================================================
echo   ACADEMIARADAR - RECRUITMENT AND PHD ADMISSIONS PORTAL
echo ======================================================================
echo   Tracking 253 Premier Research Institutions
echo ======================================================================
echo.

where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not found in your PATH.
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo [OK] Node.js detected.
echo [*] Checking port 5000...

:: Optional: Clean up any lingering node on port 5000 using native netstat / taskkill safely without breakable syntax
for /f "tokens=5" %%p in ('netstat -aon 2^>nul ^| findstr /r ":5000 .*LISTENING"') do (
    taskkill /F /PID %%p >nul 2>&1
)

echo [*] Initializing database and starting local web server...
echo [*] Server will be available at: http://localhost:5000
echo.

:: Launch default browser after 2 seconds
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:5000"

:: Start Node.js server
node server.js
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Server stopped with error code %ERRORLEVEL%.
    pause
)
