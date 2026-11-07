@echo off
setlocal
title AcademiaRadar - Push to GitHub
set "PATH=C:\Windows\System32;C:\Windows;C:\Program Files\Git\cmd;%PATH%"

echo ======================================================================
echo   ACADEMIARADAR - GITHUB REPO PUBLISHER
echo ======================================================================
echo.
echo Target GitHub Account:
echo   User:   punitsharma16042003
echo   Repo:   AcademiaRadar
echo   Remote: https://github.com/punitsharma16042003/AcademiaRadar.git
echo.
echo ----------------------------------------------------------------------
echo IMPORTANT FIRST STEP:
echo Before pushing, create the empty repository on GitHub:
echo   1. Visit: https://github.com/new
echo   2. Set Repository name to: AcademiaRadar
echo   3. Leave "Add a README file" UNCHECKED (we already have a full README)
echo   4. Leave ".gitignore" UNCHECKED
echo   5. Click "Create repository"
echo ----------------------------------------------------------------------
echo.
echo When ready, press any key to push your code to GitHub...
pause >nul

echo.
echo [*] Pushing branch 'main' to GitHub...
echo.

git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ======================================================================
    echo   [SUCCESS] Code successfully pushed to your GitHub repository!
    echo   View online: https://github.com/punitsharma16042003/AcademiaRadar
    echo ======================================================================
) else (
    echo.
    echo [*] Standard push rejected. Attempting sync with --force...
    git push -u origin main --force
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ======================================================================
        echo   [SUCCESS] Code successfully pushed to your GitHub repository!
        echo   View online: https://github.com/punitsharma16042003/AcademiaRadar
        echo ======================================================================
    ) else (
        echo.
        echo ======================================================================
        echo   [ERROR] Push failed. Please check your internet connection.
        echo ======================================================================
    )
)

echo.
pause
