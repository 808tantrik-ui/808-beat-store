@echo off
echo ==============================================================
echo Installing 808 Beat Store WhatsApp Bot to Windows Auto-Startup
echo ==============================================================
copy /y "d:\anti gravity workspace\scripts\start-bot-silent.vbs" "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\808-beatstore-bot.vbs"
if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] Auto-start installed successfully!
    echo Laptop on hote hi background me WhatsApp Bot apne aap run ho jayega!
) else (
    echo.
    echo [ERROR] Failed to install startup shortcut.
)
timeout /t 5
