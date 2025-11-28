#!/bin/bash

# ==============================================
# ChatBotDysa - Verificación Pre-Demo
# Ejecutar 5 minutos antes de la demostración
# ==============================================

echo "🔍 Verificando preparación para la demo..."
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

errors=0

# ==============================================
# 1. Verificar servicios corriendo
# ==============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📡 VERIFICANDO SERVICIOS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_port() {
  local port=$1
  local service=$2

  if lsof -i :$port > /dev/null 2>&1; then
    echo -e "${GREEN}✅ $service (puerto $port)${NC}"
  else
    echo -e "${RED}❌ $service (puerto $port) - NO ESTÁ CORRIENDO${NC}"
    ((errors++))
  fi
}

check_port 8005 "Backend API       "
check_port 7001 "Admin Panel       "
check_port 6001 "Landing Page      "
check_port 3000 "Web Widget        "

echo ""

# ==============================================
# 2. Verificar conexión a base de datos
# ==============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🗄️  VERIFICANDO BASE DE DATOS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if PGPASSWORD=supersecret psql -h 127.0.0.1 -p 15432 -U postgres -d chatbotdysa -c "SELECT 1" > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Conexión a PostgreSQL${NC}"

  # Contar datos de demo
  menu_count=$(PGPASSWORD=supersecret psql -h 127.0.0.1 -p 15432 -U postgres -d chatbotdysa -t -c "SELECT COUNT(*) FROM menu_items WHERE name LIKE '%Pizza%' OR name LIKE '%Burger%' OR name LIKE '%Pastel%'" 2>/dev/null | tr -d ' ')
  orders_count=$(PGPASSWORD=supersecret psql -h 127.0.0.1 -p 15432 -U postgres -d chatbotdysa -t -c "SELECT COUNT(*) FROM orders WHERE \"customerPhone\" LIKE '+569%'" 2>/dev/null | tr -d ' ')
  customers_count=$(PGPASSWORD=supersecret psql -h 127.0.0.1 -p 15432 -U postgres -d chatbotdysa -t -c "SELECT COUNT(*) FROM customers WHERE phone LIKE '+569%'" 2>/dev/null | tr -d ' ')
  reservations_count=$(PGPASSWORD=supersecret psql -h 127.0.0.1 -p 15432 -U postgres -d chatbotdysa -t -c "SELECT COUNT(*) FROM reservations WHERE \"customerPhone\" LIKE '+569%'" 2>/dev/null | tr -d ' ')

  echo -e "${GREEN}✅ Datos de demo cargados:${NC}"
  echo "   - Menu Items: $menu_count"
  echo "   - Pedidos: $orders_count"
  echo "   - Clientes: $customers_count"
  echo "   - Reservas: $reservations_count"

  if [ "$menu_count" -lt 10 ] || [ "$orders_count" -lt 5 ]; then
    echo -e "${RED}⚠️  ADVERTENCIA: Faltan datos de demo${NC}"
    echo "   Ejecuta: cd /Users/devlmer/ChatBotDysa/apps/backend && PGPASSWORD=supersecret psql -h 127.0.0.1 -p 15432 -U postgres -d chatbotdysa -f scripts/seed-demo-clients.sql"
    ((errors++))
  fi
else
  echo -e "${RED}❌ No se puede conectar a PostgreSQL${NC}"
  ((errors++))
fi

echo ""

# ==============================================
# 3. Verificar endpoints críticos de API
# ==============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔌 VERIFICANDO ENDPOINTS API"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_endpoint() {
  local url=$1
  local name=$2

  if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200\|401"; then
    echo -e "${GREEN}✅ $name${NC}"
  else
    echo -e "${RED}❌ $name - No responde${NC}"
    ((errors++))
  fi
}

check_endpoint "http://localhost:8005/health" "Health Check        "
check_endpoint "http://localhost:8005/api/menu" "Menu Endpoint       "
check_endpoint "http://localhost:8005/api/orders" "Orders Endpoint     "
check_endpoint "http://localhost:8005/api/reservations" "Reservations Endpoint"
check_endpoint "http://localhost:8005/api/customers" "Customers Endpoint  "

echo ""

# ==============================================
# 4. Verificar páginas web accesibles
# ==============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 VERIFICANDO PÁGINAS WEB"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_endpoint "http://localhost:7001/login" "Admin Panel Login   "
check_endpoint "http://localhost:6001" "Landing Page        "
check_endpoint "http://localhost:3000" "Web Widget          "

echo ""

# ==============================================
# 5. Información útil para la demo
# ==============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 INFORMACIÓN PARA LA DEMO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo -e "${BLUE}🔐 Credenciales Admin Panel:${NC}"
echo "   Email: admin@chatbotdysa.com"
echo "   Password: admin123"
echo ""

echo -e "${BLUE}🌐 URLs importantes:${NC}"
echo "   Admin Panel: http://localhost:7001/login"
echo "   Landing Page: http://localhost:6001"
echo "   Web Widget: http://localhost:3000"
echo "   Backend API: http://localhost:8005/api"
echo ""

echo -e "${BLUE}📊 Pedidos de demo disponibles:${NC}"
PGPASSWORD=supersecret psql -h 127.0.0.1 -p 15432 -U postgres -d chatbotdysa -c "
SELECT
  SUBSTRING(\"orderNumber\" FROM 1 FOR 2) as rest,
  \"orderNumber\" as pedido,
  \"customerName\" as cliente,
  status,
  total
FROM orders
WHERE \"customerPhone\" LIKE '+569%'
ORDER BY \"createdAt\" DESC
LIMIT 5
" 2>/dev/null

echo ""

echo -e "${BLUE}📅 Reservas próximas:${NC}"
PGPASSWORD=supersecret psql -h 127.0.0.1 -p 15432 -U postgres -d chatbotdysa -c "
SELECT
  \"reservationCode\" as codigo,
  \"customerName\" as cliente,
  \"partySize\" as personas,
  TO_CHAR(\"reservationDate\", 'DD/MM HH24:MI') as fecha,
  status
FROM reservations
WHERE \"customerPhone\" LIKE '+569%'
ORDER BY \"reservationDate\"
LIMIT 5
" 2>/dev/null

echo ""

# ==============================================
# 6. Resultado final
# ==============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $errors -eq 0 ]; then
  echo -e "${GREEN}✅ TODO LISTO PARA LA DEMO${NC}"
  echo ""
  echo "📖 Guía de demostración: /Users/devlmer/ChatBotDysa/GUIA_DEMO_CLIENTES.md"
  echo ""
  echo "🎯 Próximos pasos:"
  echo "   1. Abrir navegador con pestañas:"
  echo "      open http://localhost:7001/login"
  echo "      open http://localhost:6001"
  echo "      open http://localhost:3000"
  echo ""
  echo "   2. Tener credenciales visibles"
  echo "   3. Preparar calculadora ROI con datos del cliente"
  echo "   4. ¡Éxito en tu demo! 🚀"
else
  echo -e "${RED}⚠️  HAY $errors ERRORES - REVISAR ANTES DE LA DEMO${NC}"
  echo ""
  echo "❌ Soluciones rápidas:"
  echo "   - Si falta un servicio, ejecuta: cd [directorio] && npm run dev"
  echo "   - Si falta BD, ejecuta: docker-compose up -d"
  echo "   - Si faltan datos, ejecuta el script seed SQL"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
