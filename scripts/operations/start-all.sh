#!/bin/bash

echo "🚀 Iniciando ChatBotDysa Enterprise+++++"
echo ""

# Abrir 4 terminales
osascript -e 'tell app "Terminal" to do script "cd ~/ChatBotDysa/apps/backend && npm run start:dev"'
sleep 2
osascript -e 'tell app "Terminal" to do script "cd ~/ChatBotDysa/apps/admin-panel && npm run dev"'
sleep 2
osascript -e 'tell app "Terminal" to do script "cd ~/ChatBotDysa/apps/website && npm run dev"'
sleep 2
osascript -e 'tell app "Terminal" to do script "cd ~/ChatBotDysa/apps/web-widget && npm run dev"'

echo "✅ Sistema iniciando..."
echo "Espera 30 segundos y abre:"
echo "- http://localhost:7001 (Admin Panel)"
echo "- http://localhost:6001 (Website)"
sleep 5

open http://localhost:7001
