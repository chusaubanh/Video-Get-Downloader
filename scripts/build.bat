@echo off
REM Build script for Video-Get-Downloader (Windows)
REM This script builds the Electron app for Windows

echo.
echo ====================================
echo  Video-Get-Downloader Build Script
echo ====================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo [INFO] Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install dependencies
        exit /b 1
    )
)

REM Install icon generation dependencies
echo [INFO] Installing icon tools...
call npm install sharp png-to-ico --save-dev 2>nul

REM Generate icons
if not exist "build\icon.ico" (
    echo [INFO] Generating icons...
    node scripts\generate-icons.js
)

REM Build web assets
echo [INFO] Building web assets...
call npm run build
if errorlevel 1 (
    echo [ERROR] Failed to build web assets
    exit /b 1
)

REM Get build target from argument or default to win
set BUILD_TARGET=%1
if "%BUILD_TARGET%"=="" set BUILD_TARGET=win

if "%BUILD_TARGET%"=="win" (
    echo [INFO] Building for Windows...
    call npm run electron:build:win
) else if "%BUILD_TARGET%"=="all" (
    echo [INFO] Building for all platforms...
    call npm run electron:build:all
) else (
    echo [ERROR] Unknown target: %BUILD_TARGET%
    echo Usage: build.bat [win^|all]
    exit /b 1
)

if errorlevel 1 (
    echo [ERROR] Build failed
    exit /b 1
)

echo.
echo ====================================
echo  Build Complete!
echo ====================================
echo.
echo Output files are in the release\ directory
echo.
dir /b release\*.exe 2>nul
echo.

pause
