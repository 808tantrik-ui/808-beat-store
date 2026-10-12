@echo off
echo ========================================================
echo   808 BEAT STORE - BULK UPLOAD & SCHEDULE TO YOUTUBE
echo ========================================================
echo.
cd /d "%~dp0"
node scripts/deploy-and-upload-all.mjs
echo.
echo ========================================================
echo   EXECUTION FINISHED
echo ========================================================
pause
