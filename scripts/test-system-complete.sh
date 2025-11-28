#!/bin/bash

# ============================================
# ChatBotDysa - Script de Testing End-to-End
# ============================================
# Ejecuta tests completos del sistema
# ============================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Contadores
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

# Función para imprimir con color
print_header() {
    echo -e "${PURPLE}"
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║  $1"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
    ((TESTS_PASSED++))
    ((TESTS_TOTAL++))
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    ((TESTS_FAILED++))
    ((TESTS_TOTAL++))
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Función para ejecutar test y verificar resultado
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_pattern="$3"

    print_info "Testing: $test_name"

    if output=$(eval "$test_command" 2>&1); then
        if [[ -z "$expected_pattern" ]] || echo "$output" | grep -q "$expected_pattern"; then
            print_success "$test_name - PASSED"
            return 0
        else
            print_error "$test_name - FAILED (pattern not found)"
            echo "Expected pattern: $expected_pattern"
            echo "Output: $output"
            return 1
        fi
    else
        print_error "$test_name - FAILED (command error)"
        echo "Error: $output"
        return 1
    fi
}

# Banner
clear
echo -e "${PURPLE}"
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          ChatBotDysa - Testing End-to-End Suite               ║"
echo "║                    Fecha: $(date '+%Y-%m-%d %H:%M:%S')                   ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# ============================================
# 1. VERIFICACIÓN DE SERVICIOS DOCKER
# ============================================
print_header "1. VERIFICACIÓN DE SERVICIOS DOCKER"
echo ""

services=("chatbotdysa-postgres" "chatbotdysa-redis" "chatbotdysa-ollama" "chatbotdysa-backend" "chatbotdysa-landing")

for service in "${services[@]}"; do
    if docker ps --format '{{.Names}}' | grep -q "^${service}$"; then
        status=$(docker inspect --format='{{.State.Health.Status}}' "$service" 2>/dev/null || echo "running")
        if [[ "$status" == "healthy" ]] || [[ "$status" == "running" ]]; then
            print_success "Docker: $service está corriendo"
        else
            print_error "Docker: $service no está healthy (status: $status)"
        fi
    else
        print_error "Docker: $service no está corriendo"
    fi
done

echo ""

# ============================================
# 2. TESTING DE BASE DE DATOS POSTGRESQL
# ============================================
print_header "2. TESTING DE BASE DE DATOS POSTGRESQL"
echo ""

# Test: Conexión a PostgreSQL
run_test "PostgreSQL: Conexión" \
    "docker exec chatbotdysa-postgres pg_isready -U postgres" \
    "accepting connections"

# Test: Database existe
run_test "PostgreSQL: Database 'chatbotdysa' existe" \
    "docker exec chatbotdysa-postgres psql -U postgres -tAc \"SELECT 1 FROM pg_database WHERE datname='chatbotdysa'\"" \
    "1"

# Test: Contar tablas
run_test "PostgreSQL: Tablas creadas" \
    "docker exec chatbotdysa-postgres psql -U postgres -d chatbotdysa -tAc \"SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public'\"" \
    "[1-9][0-9]*"

# Test: Verificar tabla users
run_test "PostgreSQL: Tabla 'users' existe" \
    "docker exec chatbotdysa-postgres psql -U postgres -d chatbotdysa -tAc \"SELECT COUNT(*) FROM information_schema.tables WHERE table_name='users'\"" \
    "1"

# Test: Verificar usuario admin
run_test "PostgreSQL: Usuario admin existe" \
    "docker exec chatbotdysa-postgres psql -U postgres -d chatbotdysa -tAc \"SELECT email FROM users WHERE id=1 LIMIT 1\"" \
    "@"

echo ""

# ============================================
# 3. TESTING DE REDIS CACHE
# ============================================
print_header "3. TESTING DE REDIS CACHE"
echo ""

# Test: Redis ping
run_test "Redis: Ping" \
    "docker exec chatbotdysa-redis redis-cli ping" \
    "PONG"

# Test: Redis set/get
docker exec chatbotdysa-redis redis-cli SET test_key "test_value" > /dev/null 2>&1
run_test "Redis: SET/GET" \
    "docker exec chatbotdysa-redis redis-cli GET test_key" \
    "test_value"
docker exec chatbotdysa-redis redis-cli DEL test_key > /dev/null 2>&1

# Test: Redis info
run_test "Redis: Info" \
    "docker exec chatbotdysa-redis redis-cli INFO server" \
    "redis_version"

echo ""

# ============================================
# 4. TESTING DE OLLAMA AI SERVICE
# ============================================
print_header "4. TESTING DE OLLAMA AI SERVICE"
echo ""

# Test: Ollama health
run_test "Ollama: Health check" \
    "curl -s http://localhost:21434/api/tags" \
    "models"

# Test: Ollama modelo phi3:mini instalado
run_test "Ollama: Modelo phi3:mini disponible" \
    "curl -s http://localhost:21434/api/tags | grep -o 'phi3'" \
    "phi3"

# Test: Ollama generación simple
print_info "Testing: Ollama generación de texto (puede tomar 10-15 segundos)..."
if response=$(curl -s -X POST http://localhost:21434/api/generate -d '{
  "model": "phi3:mini",
  "prompt": "Di hola en una palabra",
  "stream": false
}' --max-time 30); then
    if echo "$response" | grep -q "response"; then
        print_success "Ollama: Generación de texto - PASSED"
    else
        print_error "Ollama: Generación de texto - FAILED (no response)"
    fi
else
    print_error "Ollama: Generación de texto - FAILED (timeout o error)"
fi

echo ""

# ============================================
# 5. TESTING DE BACKEND API
# ============================================
print_header "5. TESTING DE BACKEND API"
echo ""

# Test: Backend health endpoint
run_test "Backend: Health endpoint" \
    "curl -s http://localhost:8005/health" \
    "status"

# Test: Backend API documentation
run_test "Backend: API documentation (Swagger)" \
    "curl -s http://localhost:8005/api" \
    "swagger"

# Generar JWT token de prueba
print_info "Generando JWT token para testing..."
JWT=$(curl -s -X POST http://localhost:8005/auth/login \
    -H "Content-Type: application/json" \
    -d '{
        "email": "admin@zgamersa.com",
        "password": "Admin123!"
    }' | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [[ -n "$JWT" ]]; then
    print_success "Backend: JWT token generado"

    # Test: Customers endpoint (autenticado)
    run_test "Backend: GET /api/customers (autenticado)" \
        "curl -s -H \"Authorization: Bearer $JWT\" http://localhost:8005/api/customers" \
        "data"

    # Test: Menu endpoint (autenticado)
    run_test "Backend: GET /api/menu (autenticado)" \
        "curl -s -H \"Authorization: Bearer $JWT\" http://localhost:8005/api/menu" \
        "data"

    # Test: Orders endpoint (autenticado)
    run_test "Backend: GET /api/orders (autenticado)" \
        "curl -s -H \"Authorization: Bearer $JWT\" http://localhost:8005/api/orders" \
        "data"

    # Test: Dashboard stats (autenticado)
    run_test "Backend: GET /api/dashboard/stats (autenticado)" \
        "curl -s -H \"Authorization: Bearer $JWT\" http://localhost:8005/api/dashboard/stats" \
        "total"

else
    print_error "Backend: No se pudo generar JWT token"
fi

echo ""

# ============================================
# 6. TESTING DE AI CHATBOT INTEGRATION
# ============================================
print_header "6. TESTING DE AI CHATBOT INTEGRATION"
echo ""

if [[ -n "$JWT" ]]; then
    # Test: Crear conversación
    print_info "Testing: Crear nueva conversación..."
    CONV_RESPONSE=$(curl -s -X POST http://localhost:8005/api/conversations \
        -H "Authorization: Bearer $JWT" \
        -H "Content-Type: application/json" \
        -d '{
            "customer_phone": "+56912345678",
            "platform": "admin_ai_chat"
        }')

    CONV_ID=$(echo "$CONV_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

    if [[ -n "$CONV_ID" ]]; then
        print_success "AI Chatbot: Conversación creada (ID: $CONV_ID)"

        # Test: Enviar mensaje y recibir respuesta de AI
        print_info "Testing: Enviar mensaje y obtener respuesta de AI (puede tomar 15-20 segundos)..."
        AI_RESPONSE=$(curl -s -X POST "http://localhost:8005/api/conversations/${CONV_ID}/messages" \
            -H "Authorization: Bearer $JWT" \
            -H "Content-Type: application/json" \
            -d '{
                "message": "Hola, ¿cuál es el horario del restaurante?",
                "sender": "customer"
            }' --max-time 30)

        if echo "$AI_RESPONSE" | grep -q "ai_response"; then
            AI_TEXT=$(echo "$AI_RESPONSE" | grep -o '"ai_response":"[^"]*"' | cut -d'"' -f4 | head -c 100)
            print_success "AI Chatbot: Respuesta generada"
            print_info "Respuesta: ${AI_TEXT}..."
        else
            print_error "AI Chatbot: No se recibió respuesta de AI"
        fi
    else
        print_error "AI Chatbot: No se pudo crear conversación"
    fi
else
    print_warning "AI Chatbot: Saltando tests (no JWT disponible)"
fi

echo ""

# ============================================
# 7. TESTING DE LANDING PAGE
# ============================================
print_header "7. TESTING DE LANDING PAGE"
echo ""

# Test: Landing page responde
run_test "Landing Page: Responde en puerto 3004" \
    "curl -s -o /dev/null -w '%{http_code}' http://localhost:3004" \
    "200"

# Test: Landing page contiene contenido
run_test "Landing Page: Contiene HTML" \
    "curl -s http://localhost:3004" \
    "<html"

echo ""

# ============================================
# 8. TESTING DE WEB WIDGET (Build)
# ============================================
print_header "8. TESTING DE WEB WIDGET"
echo ""

# Test: Widget build existe
if [[ -f "/Users/devlmer/ChatBotDysa/apps/web-widget/dist/dysabot-widget.min.js" ]]; then
    print_success "Web Widget: Build de JS existe"
else
    print_error "Web Widget: Build de JS no existe"
fi

if [[ -f "/Users/devlmer/ChatBotDysa/apps/web-widget/dist/dysabot-widget.min.css" ]]; then
    print_success "Web Widget: Build de CSS existe"
else
    print_error "Web Widget: Build de CSS no existe"
fi

# Test: Widget demo existe
if [[ -f "/Users/devlmer/ChatBotDysa/apps/web-widget/demo/example.html" ]]; then
    print_success "Web Widget: Página demo existe"
else
    print_error "Web Widget: Página demo no existe"
fi

# Test: Widget tamaño razonable
if [[ -f "/Users/devlmer/ChatBotDysa/apps/web-widget/dist/dysabot-widget.min.js" ]]; then
    SIZE=$(stat -f%z "/Users/devlmer/ChatBotDysa/apps/web-widget/dist/dysabot-widget.min.js" 2>/dev/null || stat -c%s "/Users/devlmer/ChatBotDysa/apps/web-widget/dist/dysabot-widget.min.js")
    SIZE_KB=$((SIZE / 1024))
    if [[ $SIZE_KB -lt 200 ]]; then
        print_success "Web Widget: Tamaño del bundle (${SIZE_KB} KB)"
    else
        print_warning "Web Widget: Bundle grande (${SIZE_KB} KB)"
    fi
fi

echo ""

# ============================================
# 9. TESTING DE CONFIGURACIÓN DE PRODUCCIÓN
# ============================================
print_header "9. TESTING DE CONFIGURACIÓN DE PRODUCCIÓN"
echo ""

# Test: Script generate-secrets existe y es ejecutable
if [[ -x "/Users/devlmer/ChatBotDysa/scripts/generate-secrets.sh" ]]; then
    print_success "Producción: Script generate-secrets.sh ejecutable"
else
    print_error "Producción: Script generate-secrets.sh no ejecutable"
fi

# Test: .env.example existe
if [[ -f "/Users/devlmer/ChatBotDysa/.env.example" ]]; then
    print_success "Producción: .env.example existe"
else
    print_error "Producción: .env.example no existe"
fi

# Test: docker-compose.production.yml existe
if [[ -f "/Users/devlmer/ChatBotDysa/docker-compose.production.yml" ]]; then
    print_success "Producción: docker-compose.production.yml existe"
else
    print_error "Producción: docker-compose.production.yml no existe"
fi

# Test: Documentación SSL existe
if [[ -f "/Users/devlmer/ChatBotDysa/docs/SSL_HTTPS_CONFIGURATION.md" ]]; then
    print_success "Producción: Documentación SSL/HTTPS existe"
else
    print_error "Producción: Documentación SSL/HTTPS no existe"
fi

echo ""

# ============================================
# 10. RESUMEN DE TESTING
# ============================================
print_header "10. RESUMEN DE TESTING"
echo ""

echo -e "${BLUE}📊 Resultados de Tests:${NC}"
echo ""
echo -e "  Total de tests ejecutados: ${TESTS_TOTAL}"
echo -e "  ${GREEN}✅ Tests pasados: ${TESTS_PASSED}${NC}"
echo -e "  ${RED}❌ Tests fallidos: ${TESTS_FAILED}${NC}"
echo ""

PASS_RATE=$((TESTS_PASSED * 100 / TESTS_TOTAL))
echo -e "  Tasa de éxito: ${PASS_RATE}%"
echo ""

if [[ $TESTS_FAILED -eq 0 ]]; then
    echo -e "${GREEN}"
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║           ✅ TODOS LOS TESTS PASARON EXITOSAMENTE             ║"
    echo "║                                                                ║"
    echo "║      El sistema ChatBotDysa está funcionando correctamente    ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    exit 0
elif [[ $PASS_RATE -ge 80 ]]; then
    echo -e "${YELLOW}"
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║         ⚠️  LA MAYORÍA DE TESTS PASARON                       ║"
    echo "║                                                                ║"
    echo "║      Algunos componentes tienen issues menores                ║"
    echo "║      Revisar logs para más detalles                           ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    exit 1
else
    echo -e "${RED}"
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║              ❌ VARIOS TESTS FALLARON                          ║"
    echo "║                                                                ║"
    echo "║      El sistema necesita atención                             ║"
    echo "║      Revisar logs para resolver problemas                     ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    exit 2
fi
