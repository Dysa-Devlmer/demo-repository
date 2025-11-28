#!/bin/bash

# ChatBotDysa - Production Stop Script
# Detiene todos los servicios de producción de forma segura

echo "🛑 Deteniendo ChatBotDysa Producción"
echo "===================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# 1. Detener backend PM2
log_info "Deteniendo backend PM2..."
if command -v pm2 &> /dev/null; then
    pm2 delete chatbotdysa-backend 2>/dev/null || true
    log_success "Backend PM2 detenido"
else
    log_info "PM2 no encontrado, saltando..."
fi

# 2. Detener servicios Docker
log_info "Deteniendo servicios Docker..."
docker-compose -f docker-compose.production.yml down
log_success "Servicios Docker detenidos"

# 3. Limpiar procesos Node.js restantes
log_info "Limpiando procesos Node.js..."
pkill -f "node" 2>/dev/null || true
log_success "Procesos limpiados"

echo ""
log_success "ChatBotDysa Producción detenido completamente"