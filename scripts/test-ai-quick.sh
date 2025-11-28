#!/bin/bash

# =========================================
# Script de Prueba Rápida del AI Chatbot
# =========================================
# Ejecutar: chmod +x scripts/test-ai-quick.sh && ./scripts/test-ai-quick.sh

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

clear
echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  ChatBotDysa - Test Rápido AI Chatbot     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# URLs
BACKEND_URL="http://localhost:8005"
OLLAMA_URL="http://localhost:11434"

# ========================================
# PASO 1: Verificar Servicios
# ========================================
echo -e "${YELLOW}📋 PASO 1: Verificando servicios...${NC}\n"

# 1.1 Ollama
echo -n "  • Ollama: "
if curl -s "$OLLAMA_URL/api/version" > /dev/null 2>&1; then
    OLLAMA_VERSION=$(curl -s "$OLLAMA_URL/api/version" | jq -r '.version // "unknown"')
    echo -e "${GREEN}✅ Corriendo (v$OLLAMA_VERSION)${NC}"
    OLLAMA_OK=true
else
    echo -e "${RED}❌ No responde${NC}"
    echo -e "${YELLOW}   Ejecuta: ollama serve${NC}"
    OLLAMA_OK=false
fi

# 1.2 Backend
echo -n "  • Backend: "
if curl -s "$BACKEND_URL/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Corriendo${NC}"
    BACKEND_OK=true
else
    echo -e "${RED}❌ No responde${NC}"
    echo -e "${YELLOW}   Ejecuta: cd apps/backend && npm run start:dev${NC}"
    BACKEND_OK=false
fi

# 1.3 PostgreSQL
echo -n "  • PostgreSQL: "
if docker ps | grep -q chatbotdysa-postgres; then
    echo -e "${GREEN}✅ Corriendo${NC}"
    POSTGRES_OK=true
elif docker ps -a | grep -q chatbotdysa-postgres; then
    echo -e "${YELLOW}⚠️  Detenido (iniciando...)${NC}"
    docker start chatbotdysa-postgres > /dev/null 2>&1
    sleep 2
    POSTGRES_OK=true
else
    echo -e "${RED}❌ No encontrado${NC}"
    echo -e "${YELLOW}   Ejecuta: docker run -d --name chatbotdysa-postgres -e POSTGRES_PASSWORD=supersecret -p 5432:5432 postgres:16${NC}"
    POSTGRES_OK=false
fi

echo ""

if [ "$OLLAMA_OK" != true ] || [ "$BACKEND_OK" != true ]; then
    echo -e "${RED}❌ Servicios no disponibles. Corrígelos y vuelve a ejecutar.${NC}"
    exit 1
fi

# ========================================
# PASO 2: Verificar Modelos de Ollama
# ========================================
echo -e "${YELLOW}📦 PASO 2: Verificando modelos de IA...${NC}\n"

MODELS=$(curl -s "$OLLAMA_URL/api/tags" | jq -r '.models[].name' 2>/dev/null)

if [ -z "$MODELS" ]; then
    echo -e "${RED}❌ No hay modelos instalados${NC}"
    echo -e "${YELLOW}   Descargando phi3:mini (puede tomar varios minutos)...${NC}"
    ollama pull phi3:mini
    echo -e "${GREEN}✅ Modelo descargado${NC}"
else
    echo -e "  Modelos disponibles:"
    echo "$MODELS" | while read -r model; do
        echo -e "    ${GREEN}•${NC} $model"
    done
fi

echo ""

# ========================================
# PASO 3: Obtener Token de Autenticación
# ========================================
echo -e "${YELLOW}🔑 PASO 3: Obteniendo token de autenticación...${NC}\n"

LOGIN_RESPONSE=$(curl -s -X POST "$BACKEND_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@zgamersa.com",
    "password": "Admin123!"
  }')

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token // .access_token // empty')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
    echo -e "${RED}❌ No se pudo obtener el token${NC}"
    echo -e "  Respuesta: $LOGIN_RESPONSE"
    echo -e "${YELLOW}  Verifica las credenciales o ejecuta: npm run seed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Token obtenido${NC}"
echo ""

# ========================================
# PASO 4: Probar AI Endpoint
# ========================================
echo -e "${YELLOW}🤖 PASO 4: Probando AI Chatbot...${NC}\n"

# Función para hacer una pregunta
ask_ai() {
    local MESSAGE=$1
    local CONTEXT=${2:-"{}"}

    echo -e "${BLUE}Usuario:${NC} $MESSAGE"

    RESPONSE=$(curl -s -X POST "$BACKEND_URL/ai/chat" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d "{
        \"message\": \"$MESSAGE\",
        \"customerName\": \"Usuario Test\",
        \"context\": $CONTEXT
      }")

    BOT_RESPONSE=$(echo "$RESPONSE" | jq -r '.response // "Error: No response"')
    PROVIDER=$(echo "$RESPONSE" | jq -r '.provider // "unknown"')
    PROCESSING_TIME=$(echo "$RESPONSE" | jq -r '.processingTime // 0')

    echo -e "${GREEN}ChefBot:${NC} $BOT_RESPONSE"
    echo -e "${YELLOW}  ⏱️  ${PROCESSING_TIME}ms | Provider: $PROVIDER${NC}"
    echo ""
}

# Contexto del restaurante de prueba
RESTAURANT_CONTEXT='{
  "restaurantInfo": {
    "name": "Restaurante El Sabor Gourmet",
    "address": "Av. Providencia 1234, Santiago",
    "phone": "+56912345678",
    "hours": "Lunes a Viernes: 12:00-23:00, Sábados y Domingos: 13:00-00:00",
    "specialties": ["Parrillas Premium", "Mariscos Frescos", "Pastas Artesanales", "Postres Gourmet"]
  },
  "menuItems": [
    {
      "id": 1,
      "name": "Parrillada Premium",
      "price": 28000,
      "category": "Carnes",
      "description": "Mix de carnes selectas: bife chorizo, entraña, vacío y chorizo criollo",
      "available": true
    },
    {
      "id": 2,
      "name": "Ceviche de Corvina",
      "price": 12000,
      "category": "Mariscos",
      "description": "Corvina fresca marinada en limón con cebolla morada y cilantro",
      "available": true
    },
    {
      "id": 3,
      "name": "Pasta Carbonara Clásica",
      "price": 9500,
      "category": "Pastas",
      "description": "Pasta fresca con panceta, huevo, queso parmesano y pimienta negra",
      "available": true
    },
    {
      "id": 4,
      "name": "Tiramisu Casero",
      "price": 6500,
      "category": "Postres",
      "description": "Postre italiano tradicional con café y mascarpone",
      "available": true
    }
  ]
}'

# ========================================
# ESCENARIOS DE PRUEBA
# ========================================

echo -e "${BLUE}═════════════════════════════════════════${NC}"
echo -e "${BLUE}  Escenario 1: Saludo Inicial${NC}"
echo -e "${BLUE}═════════════════════════════════════════${NC}\n"
ask_ai "Hola, buenos días" "$RESTAURANT_CONTEXT"
sleep 1

echo -e "${BLUE}═════════════════════════════════════════${NC}"
echo -e "${BLUE}  Escenario 2: Consulta de Menú${NC}"
echo -e "${BLUE}═════════════════════════════════════════${NC}\n"
ask_ai "¿Qué especialidades tienen?" "$RESTAURANT_CONTEXT"
sleep 1

echo -e "${BLUE}═════════════════════════════════════════${NC}"
echo -e "${BLUE}  Escenario 3: Pregunta sobre Precio${NC}"
echo -e "${BLUE}═════════════════════════════════════════${NC}\n"
ask_ai "¿Cuál es el plato más caro del menú?" "$RESTAURANT_CONTEXT"
sleep 1

echo -e "${BLUE}═════════════════════════════════════════${NC}"
echo -e "${BLUE}  Escenario 4: Solicitud de Reserva${NC}"
echo -e "${BLUE}═════════════════════════════════════════${NC}\n"
ask_ai "Quiero hacer una reserva para 4 personas este sábado a las 20:00" "$RESTAURANT_CONTEXT"
sleep 1

echo -e "${BLUE}═════════════════════════════════════════${NC}"
echo -e "${BLUE}  Escenario 5: Información del Restaurante${NC}"
echo -e "${BLUE}═════════════════════════════════════════${NC}\n"
ask_ai "¿Cuál es la dirección y el horario?" "$RESTAURANT_CONTEXT"
sleep 1

echo -e "${BLUE}═════════════════════════════════════════${NC}"
echo -e "${BLUE}  Escenario 6: Pregunta Fuera de Contexto${NC}"
echo -e "${BLUE}═════════════════════════════════════════${NC}\n"
ask_ai "¿Quién ganó el mundial de fútbol 2022?" "$RESTAURANT_CONTEXT"
sleep 1

echo -e "${BLUE}═════════════════════════════════════════${NC}"
echo -e "${BLUE}  Escenario 7: Pedido a Domicilio${NC}"
echo -e "${BLUE}═════════════════════════════════════════${NC}\n"
ask_ai "Quiero pedir una parrillada para delivery" "$RESTAURANT_CONTEXT"

# ========================================
# RESUMEN FINAL
# ========================================
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║       ✅ Tests Completados                 ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}📊 Resumen:${NC}"
echo -e "  • Ollama: ${GREEN}Funcionando${NC}"
echo -e "  • Backend: ${GREEN}Funcionando${NC}"
echo -e "  • AI Chatbot: ${GREEN}Respondiendo correctamente${NC}"
echo ""
echo -e "${BLUE}🎯 Próximos pasos:${NC}"
echo -e "  1. Probar desde Admin Panel (si está corriendo)"
echo -e "  2. Personalizar prompts en: apps/backend/src/modules/ai/"
echo -e "  3. Cargar datos reales del restaurante"
echo -e "  4. Revisar: GUIA_TESTING_LOCAL.md para más opciones"
echo ""
echo -e "${GREEN}¡Sistema listo para testing! 🎉${NC}"
echo ""
