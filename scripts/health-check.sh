#!/bin/bash

# ============================================
# ChatBotDysa - Health Check Script
# ============================================
# Verifica el estado de todos los servicios
# Uso: ./scripts/health-check.sh
# Exit codes: 0 = healthy, 1 = unhealthy
# ============================================

set -e

# Configuración
BACKEND_URL="${BACKEND_URL:-http://localhost:8005}"
ADMIN_PANEL_URL="${ADMIN_PANEL_URL:-http://localhost:7001}"
LANDING_PAGE_URL="${LANDING_PAGE_URL:-http://localhost:3004}"
DB_HOST="${DATABASE_HOST:-127.0.0.1}"
DB_PORT="${DATABASE_PORT:-15432}"
DB_USER="${DATABASE_USER:-postgres}"
DB_PASSWORD="${DATABASE_PASSWORD:-supersecret}"
DB_NAME="${DATABASE_NAME:-chatbotdysa}"
REDIS_HOST="${REDIS_HOST:-127.0.0.1}"
REDIS_PORT="${REDIS_PORT:-16379}"
TIMEOUT="${TIMEOUT:-5}"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Contadores
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNING_CHECKS=0

# Función de logging
log() {
  echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
  echo -e "${GREEN}✅ $1${NC}"
  ((PASSED_CHECKS++))
  ((TOTAL_CHECKS++))
}

error() {
  echo -e "${RED}❌ $1${NC}"
  ((FAILED_CHECKS++))
  ((TOTAL_CHECKS++))
}

warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
  ((WARNING_CHECKS++))
  ((TOTAL_CHECKS++))
}

info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

# Banner
log "=========================================="
log "ChatBotDysa - Health Check"
log "=========================================="
log "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
log ""

# ============================================
# 1. DOCKER CONTAINERS
# ============================================
log "📦 Verificando Docker Containers..."
log ""

if command -v docker &> /dev/null; then
  EXPECTED_CONTAINERS=("chatbotdysa-backend" "chatbotdysa-admin" "chatbotdysa-landing" "chatbotdysa-postgres" "chatbotdysa-redis" "chatbotdysa-ollama")

  for container in "${EXPECTED_CONTAINERS[@]}"; do
    if docker ps --format '{{.Names}}' | grep -q "^${container}$"; then
      STATUS=$(docker inspect -f '{{.State.Status}}' "$container" 2>/dev/null)
      HEALTH=$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}no-healthcheck{{end}}' "$container" 2>/dev/null)

      if [ "$STATUS" = "running" ]; then
        if [ "$HEALTH" = "healthy" ] || [ "$HEALTH" = "no-healthcheck" ]; then
          success "Container $container: running ($HEALTH)"
        else
          warning "Container $container: running pero $HEALTH"
        fi
      else
        error "Container $container: $STATUS"
      fi
    else
      error "Container $container: no encontrado"
    fi
  done
else
  warning "Docker no está instalado o no accesible"
fi

log ""

# ============================================
# 2. DATABASE (PostgreSQL)
# ============================================
log "🗄️  Verificando PostgreSQL..."
log ""

if command -v psql &> /dev/null; then
  if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;" >/dev/null 2>&1; then
    success "PostgreSQL: Conectado ($DB_HOST:$DB_PORT)"

    # Verificar tablas principales
    TABLES=("users" "customers" "menu_items" "orders" "reservations" "roles" "permissions")
    for table in "${TABLES[@]}"; do
      if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\\dt $table" 2>/dev/null | grep -q "$table"; then
        COUNT=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM $table;" 2>/dev/null | tr -d ' ')
        info "  - Tabla $table: $COUNT registros"
      else
        warning "  - Tabla $table: no encontrada"
      fi
    done
  else
    error "PostgreSQL: No conectado ($DB_HOST:$DB_PORT)"
  fi
else
  warning "psql no está instalado - omitiendo verificación de BD"
fi

log ""

# ============================================
# 3. REDIS
# ============================================
log "📮 Verificando Redis..."
log ""

if command -v redis-cli &> /dev/null; then
  if redis-cli -h $REDIS_HOST -p $REDIS_PORT PING 2>/dev/null | grep -q "PONG"; then
    success "Redis: Conectado ($REDIS_HOST:$REDIS_PORT)"
    REDIS_KEYS=$(redis-cli -h $REDIS_HOST -p $REDIS_PORT DBSIZE 2>/dev/null | grep -oE '[0-9]+')
    info "  - Keys en cache: $REDIS_KEYS"
  else
    error "Redis: No conectado ($REDIS_HOST:$REDIS_PORT)"
  fi
else
  warning "redis-cli no está instalado - omitiendo verificación de Redis"
fi

log ""

# ============================================
# 4. BACKEND API
# ============================================
log "🚀 Verificando Backend API..."
log ""

# Health check endpoint
if curl -f -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$BACKEND_URL/health" | grep -q "200"; then
  success "Backend Health: OK ($BACKEND_URL/health)"

  # Obtener detalles del health check
  HEALTH_DATA=$(curl -s --max-time $TIMEOUT "$BACKEND_URL/health" 2>/dev/null)
  if [ -n "$HEALTH_DATA" ]; then
    info "  - Status: $(echo $HEALTH_DATA | grep -oE '"status":"[^"]*"' | cut -d'"' -f4)"
    info "  - Database: $(echo $HEALTH_DATA | grep -oE '"database":"[^"]*"' | cut -d'"' -f4)"
  fi
else
  error "Backend Health: FAILED ($BACKEND_URL/health)"
fi

# Test algunos endpoints principales
ENDPOINTS=("menu" "customers" "orders" "reservations")
for endpoint in "${ENDPOINTS[@]}"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$BACKEND_URL/api/$endpoint" 2>/dev/null)

  if [ "$STATUS" = "200" ] || [ "$STATUS" = "401" ]; then
    # 401 es OK porque significa que el endpoint existe pero requiere auth
    info "  - API /$endpoint: responde (HTTP $STATUS)"
  else
    warning "  - API /$endpoint: HTTP $STATUS"
  fi
done

log ""

# ============================================
# 5. ADMIN PANEL
# ============================================
log "💼 Verificando Admin Panel..."
log ""

STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$ADMIN_PANEL_URL" 2>/dev/null)
if [ "$STATUS" = "200" ] || [ "$STATUS" = "304" ]; then
  success "Admin Panel: Accesible ($ADMIN_PANEL_URL)"
else
  error "Admin Panel: HTTP $STATUS ($ADMIN_PANEL_URL)"
fi

log ""

# ============================================
# 6. LANDING PAGE
# ============================================
log "🌐 Verificando Landing Page..."
log ""

STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$LANDING_PAGE_URL" 2>/dev/null)
if [ "$STATUS" = "200" ] || [ "$STATUS" = "304" ]; then
  success "Landing Page: Accesible ($LANDING_PAGE_URL)"
else
  error "Landing Page: HTTP $STATUS ($LANDING_PAGE_URL)"
fi

log ""

# ============================================
# 7. OLLAMA (AI)
# ============================================
log "🤖 Verificando Ollama (AI)..."
log ""

if curl -f -s -o /dev/null --max-time $TIMEOUT "http://localhost:11434/api/tags" 2>/dev/null; then
  success "Ollama: Activo (http://localhost:11434)"

  # Listar modelos
  MODELS=$(curl -s --max-time $TIMEOUT "http://localhost:11434/api/tags" 2>/dev/null | grep -oE '"name":"[^"]*"' | cut -d'"' -f4)
  if [ -n "$MODELS" ]; then
    info "  - Modelos disponibles: $MODELS"
  fi
else
  warning "Ollama: No accesible (puerto 11434)"
fi

log ""

# ============================================
# 8. DISK SPACE
# ============================================
log "💾 Verificando Espacio en Disco..."
log ""

DISK_USAGE=$(df -h . | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
  success "Disk Space: ${DISK_USAGE}% usado"
elif [ "$DISK_USAGE" -lt 90 ]; then
  warning "Disk Space: ${DISK_USAGE}% usado (considerar limpieza)"
else
  error "Disk Space: ${DISK_USAGE}% usado (CRÍTICO)"
fi

log ""

# ============================================
# 9. MEMORY
# ============================================
log "🧠 Verificando Memoria..."
log ""

if command -v free &> /dev/null; then
  MEMORY_USED=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100}')
  if [ "$MEMORY_USED" -lt 80 ]; then
    success "Memory: ${MEMORY_USED}% usado"
  elif [ "$MEMORY_USED" -lt 90 ]; then
    warning "Memory: ${MEMORY_USED}% usado"
  else
    error "Memory: ${MEMORY_USED}% usado (CRÍTICO)"
  fi
else
  # macOS
  MEMORY_PRESSURE=$(memory_pressure 2>/dev/null | grep "System-wide memory free percentage" | awk '{print $5}' | sed 's/%//')
  if [ -n "$MEMORY_PRESSURE" ]; then
    if [ "$MEMORY_PRESSURE" -gt 20 ]; then
      success "Memory: ${MEMORY_PRESSURE}% libre"
    else
      warning "Memory: ${MEMORY_PRESSURE}% libre"
    fi
  else
    info "Memory: No se puede determinar (sistema no soportado)"
  fi
fi

log ""

# ============================================
# RESUMEN FINAL
# ============================================
log "=========================================="
log "📊 Resumen de Health Check"
log "=========================================="
log ""

echo -e "${GREEN}✅ Passed:${NC} $PASSED_CHECKS"
echo -e "${YELLOW}⚠️  Warnings:${NC} $WARNING_CHECKS"
echo -e "${RED}❌ Failed:${NC} $FAILED_CHECKS"
echo -e "${BLUE}📝 Total Checks:${NC} $TOTAL_CHECKS"

log ""

# Calcular porcentaje de salud
HEALTH_PERCENTAGE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))

if [ $FAILED_CHECKS -eq 0 ]; then
  if [ $WARNING_CHECKS -eq 0 ]; then
    log "✅ Sistema 100% SALUDABLE"
    EXIT_CODE=0
  else
    log "⚠️  Sistema OPERACIONAL con advertencias (${HEALTH_PERCENTAGE}%)"
    EXIT_CODE=0
  fi
else
  log "❌ Sistema con FALLOS (${HEALTH_PERCENTAGE}% saludable)"
  EXIT_CODE=1
fi

log ""
log "=========================================="
log "Health Check Completado"
log "=========================================="
log ""

exit $EXIT_CODE
