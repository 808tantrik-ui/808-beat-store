Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "d:\anti gravity workspace"
WshShell.Run "cmd /c ""d:\anti gravity workspace\scripts\run-whatsapp-bot.bat""", 0, False
