#!/bin/bash

###############################################################################
# ChatBotDysa Enterprise - Quick Start Script
# Autor: Claude (Anthropic)
# Fecha: 2025-10-06
# Descripción: Script de inicio rápido para desarrollo
###############################################################################

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║         ChatBotDysa Enterprise - Quick Start                ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check prerequisites
echo -e "${BLUE}[1/6]${NC} Verificando requisitos previos..."

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker no está instalado${NC}"
    echo "   Instalar desde: https://www.docker.com/products/docker-desktop"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker no está corriendo${NC}"
    echo "   Por favor inicia Docker Desktop"
    exit 1
fi

echo -e "${GREEN}   ✓ Docker instalado y corriendo${NC}"

# Check docker-compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ docker-compose no está instalado${NC}"
    exit 1
fi

echo -e "${GREEN}   ✓ docker-compose instalado${NC}"

# Check .env file
echo -e "${BLUE}[2/6]${NC} Verificando configuración..."

if [ ! -f .env ]; then
    echo -e "${YELLOW}   ⚠ Archivo .env no existe${NC}"

    if [ -f .env.example ]; then
        echo "   Creando .env desde .env.example..."
        cp .env.example .env
        echo -e "${GREEN}   ✓ Archivo .env creado${NC}"
        echo -e "${YELLOW}   ⚠ IMPORTANTE: Revisa y actualiza los valores en .env${NC}"
    else
        echo -e "${RED}   ❌ .env.example tampoco existe${NC}"
        echo "   Crear manualmente el archivo .env"
        exit 1
    fi
else
    echo -e "${GREEN}   ✓ Archivo .env existe${NC}"
fi

# Check ports
echo -e "${BLUE}[3/6]${NC} Verificando puertos disponibles..."

PORTS=(8005 7001 3004 15432 16379 21434)
PORT_NAMES=("Backend" "Admin Panel" "Landing Page" "PostgreSQL" "Redis" "Ollama")
PORTS_OK=true

for i in "${!PORTS[@]}"; do
    PORT=${PORTS[$i]}
    NAME=${PORT_NAMES[$i]}

    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo -e "${RED}   ✗ Puerto $PORT ($NAME) ya está en uso${NC}"
        PORTS_OK=false
    else
        echo -e "${GREEN}   ✓ Puerto $PORT ($NAME) disponible${NC}"
    fi
done

if [ "$PORTS_OK" = false ]; then
    echo ""
    echo -e "${YELLOW}Algunos puertos están en uso. ¿Continuar de todos modos? (y/n)${NC}"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "Abortado por el usuario"
        exit 1
    fi
fi

# Stop existing containers
echo ""
echo -e "${BLUE}[4/6]${NC} Deteniendo contenedores existentes..."
docker-compose down 2>/dev/null || true
echo -e "${GREEN}   ✓ Contenedores detenidos${NC}"

# Start services
echo ""
echo -e "${BLUE}[5/6]${NC} Iniciando servicios..."
echo ""
echo "   Esto puede tomar 30-45 segundos..."
echo ""

docker-compose up -d

# Wait for services
echo ""
echo -e "${BLUE}[6/6]${NC} Esperando que los servicios estén listos..."
echo ""

MAX_WAIT=60
WAIT_COUNT=0

# Wait for PostgreSQL
echo -n "   PostgreSQL (15432): "
until docker exec chatbotdysa-db pg_isready -U postgres &>/dev/null || [ $WAIT_COUNT -eq $MAX_WAIT ]; do
    echo -n "."
    sleep 1
    WAIT_COUNT=$((WAIT_COUNT + 1))
done

if [ $WAIT_COUNT -eq $MAX_WAIT ]; then
    echo -e " ${RED}✗ Timeout${NC}"
else
    echo -e " ${GREEN}✓ Ready${NC}"
fi

# Wait for Redis
WAIT_COUNT=0
echo -n "   Redis (16379):      "
until docker exec chatbotdysa-redis redis-cli ping &>/dev/null || [ $WAIT_COUNT -eq $MAX_WAIT ]; do
    echo -n "."
    sleep 1
    WAIT_COUNT=$((WAIT_COUNT + 1))
done

if [ $WAIT_COUNT -eq $MAX_WAIT ]; then
    echo -e " ${RED}✗ Timeout${NC}"
else
    echo -e " ${GREEN}✓ Ready${NC}"
fi

# Wait for Backend
WAIT_COUNT=0
echo -n "   Backend (8005):     "
until curl -s http://localhost:8005/api/health &>/dev/null || [ $WAIT_COUNT -eq $MAX_WAIT ]; do
    echo -n "."
    sleep 1
    WAIT_COUNT=$((WAIT_COUNT + 1))
done

if [ $WAIT_COUNT -eq $MAX_WAIT ]; then
    echo -e " ${RED}✗ Timeout${NC}"
else
    echo -e " ${GREEN}✓ Ready${NC}"
fi

# Wait for Admin Panel
WAIT_COUNT=0
echo -n "   Admin Panel (7001): "
until curl -s http://localhost:7001 &>/dev/null || [ $WAIT_COUNT -eq $MAX_WAIT ]; do
    echo -n "."
    sleep 1
    WAIT_COUNT=$((WAIT_COUNT + 1))
done

if [ $WAIT_COUNT -eq $MAX_WAIT ]; then
    echo -e " ${RED}✗ Timeout${NC}"
else
    echo -e " ${GREEN}✓ Ready${NC}"
fi

# Wait for Landing Page
WAIT_COUNT=0
echo -n "   Landing (3004):     "
until curl -s http://localhost:3004 &>/dev/null || [ $WAIT_COUNT -eq $MAX_WAIT ]; do
    echo -n "."
    sleep 1
    WAIT_COUNT=$((WAIT_COUNT + 1))
done

if [ $WAIT_COUNT -eq $MAX_WAIT ]; then
    echo -e " ${RED}✗ Timeout${NC}"
else
    echo -e " ${GREEN}✓ Ready${NC}"
fi

# Wait for Ollama
WAIT_COUNT=0
echo -n "   Ollama (21434):     "
until curl -s http://localhost:21434/api/tags &>/dev/null || [ $WAIT_COUNT -eq $MAX_WAIT ]; do
    echo -n "."
    sleep 1
    WAIT_COUNT=$((WAIT_COUNT + 1))
done

if [ $WAIT_COUNT -eq $MAX_WAIT ]; then
    echo -e " ${RED}✗ Timeout${NC}"
else
    echo -e " ${GREEN}✓ Ready${NC}"
fi

# Final status
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║                    ¡Sistema Iniciado! ✅                     ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Show URLs
echo -e "${GREEN}URLs de Acceso:${NC}"
echo ""
echo "  🌐 Admin Panel:    http://localhost:7001"
echo "  🌐 Landing Page:   http://localhost:3004"
echo "  🌐 API Backend:    http://localhost:8005"
echo "  📚 API Docs:       http://localhost:8005/docs"
echo ""

# Show credentials info
echo -e "${YELLOW}Credenciales:${NC}"
echo ""
echo "  📧 Email:    admin@zgamersa.com"
echo "  🔑 Password: Ver archivo CREDENCIALES_ADMIN_SEGURAS.md"
echo "  📁 Ubicación: /Reportes/Sesiones/2025-10-06_Cierre_Final_Dia_1317/"
echo ""

# Show useful commands
echo -e "${BLUE}Comandos Útiles:${NC}"
echo ""
echo "  Ver logs en tiempo real:"
echo "    docker-compose logs -f"
echo ""
echo "  Ver logs de un servicio:"
echo "    docker-compose logs -f backend"
echo "    docker-compose logs -f admin-panel"
echo ""
echo "  Reiniciar un servicio:"
echo "    docker-compose restart backend"
echo ""
echo "  Health check completo:"
echo "    ./scripts/health-check.sh"
echo ""
echo "  Detener todos los servicios:"
echo "    docker-compose down"
echo ""

# Offer to open browser
echo -e "${YELLOW}¿Abrir Admin Panel en el navegador? (y/n)${NC}"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    if command -v open &> /dev/null; then
        # macOS
        open http://localhost:7001
        echo -e "${GREEN}✓ Navegador abierto${NC}"
    elif command -v xdg-open &> /dev/null; then
        # Linux
        xdg-open http://localhost:7001
        echo -e "${GREEN}✓ Navegador abierto${NC}"
    else
        echo -e "${YELLOW}No se pudo abrir el navegador automáticamente${NC}"
        echo "Abre manualmente: http://localhost:7001"
    fi
fi

echo ""
echo -e "${GREEN}¡Listo para desarrollar! 🚀${NC}"
echo ""

# Optional: Show container status
echo -e "${BLUE}Estado de Contenedores:${NC}"
echo ""
docker-compose ps
echo ""

exit 0
