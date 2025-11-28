#!/bin/bash

################################################################################
# ChatBotDysa - Script de Verificación Completa del Ecosistema
# Fecha: 13 de Octubre, 2025
# Versión: 1.0.0
# Descripción: Verifica todos los servicios y funcionalidades del sistema
################################################################################

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Contadores
total_tests=0
passed_tests=0
failed_tests=0

# Configuración
BACKEND_URL="http://localhost:8005"
ADMIN_URL="http://localhost:7001"
LANDING_URL="http://localhost:3004"

################################################################################
# FUNCIONES AUXILIARES
################################################################################

print_header() {
    echo ""
    echo -e "${BLUE}${BOLD}========================================${NC}"
    echo -e "${BLUE}${BOLD}$1${NC}"
    echo -e "${BLUE}${BOLD}========================================${NC}"
    echo ""
}

print_test() {
    echo -e "${YELLOW}➜${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ PASS${NC} - $1"
    ((passed_tests++))
    ((total_tests++))
}

print_fail() {
    echo -e "${RED}❌ FAIL${NC} - $1"
    ((failed_tests++))
    ((total_tests++))
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

check_http() {
    local name=$1
    local url=$2
    local expected=$3

    print_test "Verificando $name..."

    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)

    if [ "$response" = "$expected" ]; then
        print_success "$name responde correctamente (HTTP $response)"
    else
        print_fail "$name no responde (HTTP $response, esperado $expected)"
    fi
}

################################################################################
# INICIO DEL SCRIPT
################################################################################

clear
echo ""
echo -e "${BLUE}${BOLD}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}${BOLD}║  ChatBotDysa - Verificación Completa del Ecosistema   ║${NC}"
echo -e "${BLUE}${BOLD}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Fecha: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

################################################################################
# 1. SERVICIOS DOCKER
################################################################################

print_header "1️⃣  SERVICIOS DOCKER"

print_test "Verificando servicios Docker corriendo..."
echo ""
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep chatbotdysa
echo ""

# Contar servicios corriendo
docker_services=$(docker ps --filter "name=chatbotdysa" --format "{{.Names}}" | wc -l | tr -d ' ')
expected_services=5

if [ "$docker_services" -eq "$expected_services" ]; then
    print_success "Todos los servicios Docker están corriendo ($docker_services/$expected_services)"
else
    print_fail "Faltan servicios Docker ($docker_services/$expected_services esperados)"
fi

################################################################################
# 2. BACKEND API
################################################################################

print_header "2️⃣  BACKEND API ($BACKEND_URL)"

# 2.1 Health Check
check_http "Health Check" "$BACKEND_URL/health" "200"

# 2.2 Root Endpoint
check_http "Root Endpoint" "$BACKEND_URL" "200"

# 2.3 API Documentation
check_http "Swagger Docs" "$BACKEND_URL/docs" "200"

# 2.4 Login Test
print_test "Probando login con credenciales válidas..."
login_response=$(curl -s -X POST "$BACKEND_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@zgamersa.com","password":"admin123"}')

if echo "$login_response" | jq -e '.data.access_token' > /dev/null 2>&1; then
    JWT_TOKEN=$(echo "$login_response" | jq -r '.data.access_token')
    print_success "Login exitoso - Token JWT obtenido"
else
    print_fail "Login falló - No se pudo obtener token"
    JWT_TOKEN=""
fi

# 2.5 Profile Endpoint (con JWT)
if [ -n "$JWT_TOKEN" ]; then
    print_test "Probando endpoint de perfil con JWT..."
    profile_response=$(curl -s -H "Authorization: Bearer $JWT_TOKEN" "$BACKEND_URL/api/auth/profile")

    if echo "$profile_response" | jq -e '.data.email' > /dev/null 2>&1; then
        print_success "Perfil obtenido correctamente"
    else
        print_fail "No se pudo obtener perfil"
    fi
fi

# 2.6 Dashboard Stats
if [ -n "$JWT_TOKEN" ]; then
    print_test "Probando dashboard stats..."
    stats_response=$(curl -s -H "Authorization: Bearer $JWT_TOKEN" "$BACKEND_URL/api/dashboard/stats")

    if echo "$stats_response" | jq -e '.data' > /dev/null 2>&1; then
        print_success "Dashboard stats obtenido correctamente"
    else
        print_fail "No se pudo obtener dashboard stats"
    fi
fi

################################################################################
# 3. ADMIN PANEL
################################################################################

print_header "3️⃣  ADMIN PANEL ($ADMIN_URL)"

# 3.1 Home Page
check_http "Home Page" "$ADMIN_URL" "200"

# 3.2 Login Page
check_http "Login Page" "$ADMIN_URL/login" "200"

# 3.3 Dashboard Page (requiere auth - esperamos redirect)
print_test "Verificando Dashboard..."
dashboard_response=$(curl -s -o /dev/null -w "%{http_code}" "$ADMIN_URL/dashboard" 2>/dev/null)
if [ "$dashboard_response" = "200" ] || [ "$dashboard_response" = "307" ]; then
    print_success "Dashboard accesible"
else
    print_fail "Dashboard no accesible (HTTP $dashboard_response)"
fi

################################################################################
# 4. LANDING PAGE
################################################################################

print_header "4️⃣  LANDING PAGE ($LANDING_URL)"

# 4.1 Home Page
check_http "Home Page" "$LANDING_URL" "200"

# 4.2 About Page
check_http "About Page" "$LANDING_URL/about" "200"

################################################################################
# 5. POSTGRESQL
################################################################################

print_header "5️⃣  POSTGRESQL"

# 5.1 Conexión
print_test "Verificando conexión a PostgreSQL..."
if docker exec chatbotdysa-postgres pg_isready -U postgres &>/dev/null; then
    print_success "PostgreSQL está aceptando conexiones"
else
    print_fail "PostgreSQL no está respondiendo"
fi

# 5.2 Base de datos
print_test "Verificando base de datos chatbotdysa..."
db_exists=$(docker exec chatbotdysa-postgres psql -U postgres -lqt | cut -d \| -f 1 | grep -w chatbotdysa | wc -l | tr -d ' ')
if [ "$db_exists" -gt 0 ]; then
    print_success "Base de datos chatbotdysa existe"
else
    print_fail "Base de datos chatbotdysa no existe"
fi

# 5.3 Usuario admin
print_test "Verificando usuario admin..."
admin_count=$(docker exec chatbotdysa-postgres psql -U postgres -d chatbotdysa -tAc "SELECT COUNT(*) FROM users WHERE email = 'admin@zgamersa.com';" 2>/dev/null)
if [ "$admin_count" = "1" ]; then
    print_success "Usuario admin existe en la base de datos"
else
    print_fail "Usuario admin no encontrado"
fi

################################################################################
# 6. REDIS
################################################################################

print_header "6️⃣  REDIS"

# 6.1 Ping
print_test "Verificando Redis con PING..."
redis_ping=$(docker exec chatbotdysa-redis redis-cli ping 2>/dev/null)
if [ "$redis_ping" = "PONG" ]; then
    print_success "Redis responde correctamente"
else
    print_fail "Redis no responde"
fi

# 6.2 Info
print_test "Obteniendo información de Redis..."
redis_version=$(docker exec chatbotdysa-redis redis-cli INFO | grep redis_version | cut -d: -f2 | tr -d '\r')
if [ -n "$redis_version" ]; then
    print_success "Redis versión $redis_version"
else
    print_fail "No se pudo obtener versión de Redis"
fi

################################################################################
# 7. OLLAMA AI
################################################################################

print_header "7️⃣  OLLAMA AI"

# 7.1 Version
check_http "Version Endpoint" "http://localhost:21434/api/version" "200"

# 7.2 Modelo disponible
print_test "Verificando modelo phi3:mini..."
ollama_model=$(curl -s http://localhost:21434/api/tags | jq -r '.models[0].name' 2>/dev/null)
if [ "$ollama_model" = "phi3:mini" ]; then
    print_success "Modelo phi3:mini está disponible"
else
    print_fail "Modelo phi3:mini no encontrado"
fi

# 7.3 Test de generación
print_test "Probando generación de texto con IA..."
generate_response=$(curl -s -X POST http://localhost:21434/api/generate \
  -H "Content-Type: application/json" \
  -d '{"model":"phi3:mini","prompt":"Di hola en una palabra","stream":false}' 2>/dev/null)

if echo "$generate_response" | jq -e '.response' > /dev/null 2>&1; then
    ai_response=$(echo "$generate_response" | jq -r '.response' | head -c 50)
    print_success "IA generó respuesta: \"$ai_response...\""
else
    print_fail "IA no pudo generar respuesta"
fi

################################################################################
# 8. RATE LIMITER
################################################################################

print_header "8️⃣  RATE LIMITER"

print_test "Probando rate limiter progresivo..."
print_info "Haciendo 51 intentos fallidos para activar bloqueo..."

# Hacer 51 intentos
for i in {1..51}; do
    curl -s -X POST "$BACKEND_URL/api/auth/login" \
      -H "Content-Type: application/json" \
      -d '{"email":"test@test.com","password":"wrong"}' > /dev/null 2>&1
done

# Verificar bloqueo
rate_limit_response=$(curl -s -X POST "$BACKEND_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrong"}')

retry_after=$(echo "$rate_limit_response" | jq -r '.retryAfter' 2>/dev/null)
failed_attempts=$(echo "$rate_limit_response" | jq -r '.failedAttempts' 2>/dev/null)

if [ "$retry_after" = "15" ] && [ -n "$failed_attempts" ]; then
    print_success "Rate limiter activo - Bloqueo de $retry_after segundos (intento #$failed_attempts)"
else
    print_fail "Rate limiter no está funcionando correctamente"
fi

################################################################################
# 9. INTEGRACIÓN END-TO-END
################################################################################

print_header "9️⃣  INTEGRACIÓN END-TO-END"

if [ -n "$JWT_TOKEN" ]; then
    # Test completo: Crear cliente
    print_test "Test E2E: Crear cliente..."

    customer_response=$(curl -s -X POST "$BACKEND_URL/api/customers" \
      -H "Authorization: Bearer $JWT_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "firstName": "Test",
        "lastName": "User",
        "email": "test_'$(date +%s)'@example.com",
        "phone": "+56912345678"
      }')

    customer_id=$(echo "$customer_response" | jq -r '.data.id' 2>/dev/null)

    if [ -n "$customer_id" ] && [ "$customer_id" != "null" ]; then
        print_success "Cliente creado exitosamente (ID: $customer_id)"

        # Obtener cliente
        print_test "Test E2E: Obtener cliente..."
        get_customer=$(curl -s -H "Authorization: Bearer $JWT_TOKEN" \
          "$BACKEND_URL/api/customers/$customer_id")

        if echo "$get_customer" | jq -e '.data.firstName' > /dev/null 2>&1; then
            print_success "Cliente obtenido correctamente"

            # Eliminar cliente
            print_test "Test E2E: Eliminar cliente..."
            delete_response=$(curl -s -X DELETE \
              -H "Authorization: Bearer $JWT_TOKEN" \
              "$BACKEND_URL/api/customers/$customer_id")

            if echo "$delete_response" | jq -e '.success' > /dev/null 2>&1; then
                print_success "Cliente eliminado correctamente"
            else
                print_fail "No se pudo eliminar cliente"
            fi
        else
            print_fail "No se pudo obtener cliente"
        fi
    else
        print_fail "No se pudo crear cliente"
    fi
else
    print_fail "No hay JWT token - Saltando tests E2E"
fi

################################################################################
# 10. RECURSOS DEL SISTEMA
################################################################################

print_header "🔟 RECURSOS DEL SISTEMA"

print_test "Uso de recursos de contenedores..."
echo ""
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" | head -10
echo ""

################################################################################
# RESUMEN FINAL
################################################################################

print_header "📊 RESUMEN DE RESULTADOS"

echo ""
echo -e "${BOLD}Total de pruebas:${NC} $total_tests"
echo -e "${GREEN}${BOLD}Exitosas:${NC} $passed_tests"
echo -e "${RED}${BOLD}Fallidas:${NC} $failed_tests"
echo ""

# Calcular porcentaje
if [ $total_tests -gt 0 ]; then
    success_rate=$((passed_tests * 100 / total_tests))
    echo -e "${BOLD}Tasa de éxito:${NC} ${success_rate}%"
    echo ""
fi

# Conclusión
if [ $failed_tests -eq 0 ]; then
    echo -e "${GREEN}${BOLD}╔════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}${BOLD}║  ✅ TODOS LOS TESTS PASARON EXITOSAMENTE  ║${NC}"
    echo -e "${GREEN}${BOLD}╚════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}El ecosistema ChatBotDysa está 100% operativo${NC}"
    exit 0
else
    echo -e "${YELLOW}${BOLD}╔═══════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}${BOLD}║  ⚠️  ALGUNOS TESTS FALLARON              ║${NC}"
    echo -e "${YELLOW}${BOLD}╚═══════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Por favor revisa los errores arriba${NC}"
    exit 1
fi
