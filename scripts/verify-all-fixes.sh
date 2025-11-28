#!/bin/bash

# ============================================================================
# Script de Verificación Completa - ChatBotDysa Enterprise
# ============================================================================
# Verifica todas las correcciones aplicadas en la auditoría del 11-Nov-2025
# ============================================================================

set -e  # Exit on error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Contadores
PASSED=0
FAILED=0
WARNINGS=0

# Función para imprimir con color
print_section() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
    ((PASSED++))
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    ((FAILED++))
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARNINGS++))
}

# ============================================================================
# 1. VERIFICAR SERVICIOS CORRIENDO
# ============================================================================
print_section "1. Verificando servicios y puertos"

check_port() {
    local port=$1
    local service=$2

    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_success "$service corriendo en puerto $port"
        return 0
    else
        print_error "$service NO está corriendo en puerto $port"
        return 1
    fi
}

# Verificar servicios principales
check_port 8005 "Backend API"
check_port 7001 "Admin Panel"
check_port 6001 "Website"
check_port 15432 "PostgreSQL"
check_port 16379 "Redis"

# Web Widget es opcional
if lsof -Pi :7002 -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_success "Web Widget corriendo en puerto 7002"
else
    print_warning "Web Widget NO está corriendo (opcional)"
fi

# ============================================================================
# 2. VERIFICAR ARCHIVOS CREADOS/MODIFICADOS
# ============================================================================
print_section "2. Verificando archivos corregidos"

verify_file() {
    local file=$1
    local description=$2

    if [ -f "$file" ]; then
        print_success "$description existe"
        return 0
    else
        print_error "$description NO existe: $file"
        return 1
    fi
}

# Backend - Módulo Leads
verify_file "/Users/devlmer/ChatBotDysa/apps/backend/src/modules/leads/leads.module.ts" "LeadsModule"
verify_file "/Users/devlmer/ChatBotDysa/apps/backend/src/modules/leads/leads.controller.ts" "LeadsController"
verify_file "/Users/devlmer/ChatBotDysa/apps/backend/src/modules/leads/leads.service.ts" "LeadsService"
verify_file "/Users/devlmer/ChatBotDysa/apps/backend/src/modules/leads/dto/create-demo-request.dto.ts" "CreateDemoRequestDto"
verify_file "/Users/devlmer/ChatBotDysa/apps/backend/src/modules/leads/dto/create-registration.dto.ts" "CreateRegistrationDto"

# Admin Panel
verify_file "/Users/devlmer/ChatBotDysa/apps/admin-panel/src/app/conversations/new/page.tsx" "Página Nueva Conversación"
verify_file "/Users/devlmer/ChatBotDysa/apps/admin-panel/src/components/dashboard/quick-actions.tsx" "Quick Actions corregido"

# Website
verify_file "/Users/devlmer/ChatBotDysa/apps/website/.env.local" "Variables de entorno Website"

# Documentación
verify_file "/Users/devlmer/ChatBotDysa/AUDITORIA_Y_CORRECCIONES_2025-11-11.md" "Documentación auditoría"
verify_file "/Users/devlmer/ChatBotDysa/CORRECCIONES_COMPLETAS_2025-11-11.md" "Documentación correcciones completas"
verify_file "/Users/devlmer/ChatBotDysa/GUIA_RAPIDA_USO.md" "Guía rápida de uso"

# ============================================================================
# 3. VERIFICAR COMPILACIÓN BACKEND
# ============================================================================
print_section "3. Verificando compilación del Backend"

if [ -d "/Users/devlmer/ChatBotDysa/apps/backend/dist/src/modules/leads" ]; then
    print_success "Backend compilado correctamente (módulo Leads existe en dist/)"
else
    print_error "Backend NO compilado o falta módulo Leads"
fi

# Verificar que AppModule importa LeadsModule
if grep -q "LeadsModule" /Users/devlmer/ChatBotDysa/apps/backend/src/app.module.ts; then
    print_success "LeadsModule importado en AppModule"
else
    print_error "LeadsModule NO importado en AppModule"
fi

# ============================================================================
# 4. VERIFICAR ENDPOINTS DEL BACKEND
# ============================================================================
print_section "4. Verificando endpoints del backend"

test_endpoint() {
    local method=$1
    local url=$2
    local description=$3
    local data=$4

    if [ "$method" = "GET" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$url" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi

    if [ "$response" = "200" ] || [ "$response" = "201" ] || [ "$response" = "400" ]; then
        print_success "$description responde (HTTP $response)"
        return 0
    else
        print_error "$description no responde correctamente (HTTP $response)"
        return 1
    fi
}

# Health check
test_endpoint "GET" "http://localhost:8005/health" "Health Check"

# Endpoints Leads (esperamos 400 por validación, lo cual es correcto)
test_endpoint "POST" "http://localhost:8005/api/leads/demo" "POST /api/leads/demo" '{}'
test_endpoint "POST" "http://localhost:8005/api/leads/contact" "POST /api/leads/contact" '{}'
test_endpoint "POST" "http://localhost:8005/api/leads/register" "POST /api/leads/register" '{}'

# ============================================================================
# 5. VERIFICAR VARIABLES DE ENTORNO
# ============================================================================
print_section "5. Verificando variables de entorno"

check_env_var() {
    local file=$1
    local var=$2

    if grep -q "^$var=" "$file" 2>/dev/null; then
        print_success "$var definida en $file"
        return 0
    else
        print_error "$var NO definida en $file"
        return 1
    fi
}

# Website .env.local
if [ -f "/Users/devlmer/ChatBotDysa/apps/website/.env.local" ]; then
    check_env_var "/Users/devlmer/ChatBotDysa/apps/website/.env.local" "NEXT_PUBLIC_API_URL"
    check_env_var "/Users/devlmer/ChatBotDysa/apps/website/.env.local" "NEXT_PUBLIC_APP_URL"
    check_env_var "/Users/devlmer/ChatBotDysa/apps/website/.env.local" "NEXT_PUBLIC_DEMO_URL"
else
    print_error "Archivo .env.local NO existe en Website"
fi

# ============================================================================
# 6. VERIFICAR CORRECCIONES ESPECÍFICAS
# ============================================================================
print_section "6. Verificando correcciones específicas"

# Verificar que quick-actions usa useRouter
if grep -q "useRouter" /Users/devlmer/ChatBotDysa/apps/admin-panel/src/components/dashboard/quick-actions.tsx; then
    print_success "Quick Actions usa useRouter (navegación optimizada)"
else
    print_error "Quick Actions NO usa useRouter"
fi

# Verificar que conversations/page.tsx tiene onClick para nueva conversación
if grep -q "router.push('/conversations/new')" /Users/devlmer/ChatBotDysa/apps/admin-panel/src/app/conversations/page.tsx; then
    print_success "Botón 'Nueva Conversación' tiene onClick handler"
else
    print_error "Botón 'Nueva Conversación' NO tiene onClick handler"
fi

# Verificar que ROICalculator apunta a /demo en vez de #pricing
if grep -q 'href="/demo"' /Users/devlmer/ChatBotDysa/apps/website/src/components/ROICalculator.tsx; then
    print_success "ROI Calculator link corregido (/demo)"
else
    print_error "ROI Calculator link incorrecto"
fi

# Verificar que demo/page.tsx hace POST real al backend
if grep -q "fetch.*api/leads/demo" /Users/devlmer/ChatBotDysa/apps/website/src/app/demo/page.tsx; then
    print_success "Formulario demo integrado con backend"
else
    print_error "Formulario demo NO integrado con backend"
fi

# Verificar que registro/page.tsx hace POST real al backend
if grep -q "fetch.*api/leads/register" /Users/devlmer/ChatBotDysa/apps/website/src/app/registro/page.tsx; then
    print_success "Formulario registro integrado con backend"
else
    print_error "Formulario registro NO integrado con backend"
fi

# Verificar que welcome/page.tsx usa env var para demoUrl
if grep -q "NEXT_PUBLIC_DEMO_URL" /Users/devlmer/ChatBotDysa/apps/website/src/app/welcome/page.tsx; then
    print_success "Welcome page usa variable de entorno para demo URL"
else
    print_error "Welcome page NO usa variable de entorno"
fi

# ============================================================================
# 7. VERIFICAR API SERVICE
# ============================================================================
print_section "7. Verificando API Service Layer"

# Verificar que api.ts tiene conversations.create
if grep -q "create:.*data.*api.post.*conversations" /Users/devlmer/ChatBotDysa/apps/admin-panel/src/lib/api.ts; then
    print_success "API Service tiene conversations.create()"
else
    print_error "API Service NO tiene conversations.create()"
fi

# ============================================================================
# 8. RESUMEN FINAL
# ============================================================================
print_section "RESUMEN DE VERIFICACIÓN"

TOTAL=$((PASSED + FAILED))

echo -e "${GREEN}✅ Tests pasados:    $PASSED${NC}"
echo -e "${RED}❌ Tests fallidos:   $FAILED${NC}"
echo -e "${YELLOW}⚠️  Advertencias:    $WARNINGS${NC}"
echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "Total tests:         $TOTAL"

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 ¡TODAS LAS VERIFICACIONES PASARON!${NC}"
    echo -e "${GREEN}El sistema está correctamente configurado y funcionando.${NC}\n"
    exit 0
else
    echo -e "\n${RED}⚠️  HAY PROBLEMAS QUE REQUIEREN ATENCIÓN${NC}"
    echo -e "${RED}Revisa los errores arriba para corregirlos.${NC}\n"
    exit 1
fi
