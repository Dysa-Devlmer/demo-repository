@echo off
echo 🚀 Iniciando ChatBotDysa Enterprise+++++
echo.

start "Backend" cmd /k "cd C:\ChatBotDysa\apps\backend && npm run start:dev"
timeout /t 2 /nobreak > nul

start "Admin Panel" cmd /k "cd C:\ChatBotDysa\apps\admin-panel && npm run dev"
timeout /t 2 /nobreak > nul

start "Website" cmd /k "cd C:\ChatBotDysa\apps\website && npm run dev"
timeout /t 2 /nobreak > nul

start "Widget" cmd /k "cd C:\ChatBotDysa\apps\web-widget && npm run dev"

echo ✅ Sistema iniciando...
echo Espera 30 segundos y abre:
echo - http://localhost:7001 (Admin Panel)
echo - http://localhost:6001 (Website)

timeout /t 5 /nobreak > nul
start http://localhost:7001
