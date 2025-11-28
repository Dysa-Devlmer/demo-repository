#!/bin/bash

# ============================================
# SCRIPT SIMPLE PARA INICIAR EN PRODUCCIÓN
# ============================================

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${BLUE}🚀 ========================================${NC}"
echo -e "${BLUE}   INICIANDO SISTEMA EN PRODUCCIÓN LOCAL${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Crear directorio de logs
mkdir -p logs

# Función para limpiar procesos al salir
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Deteniendo todos los servicios...${NC}"
    jobs -p | xargs kill 2>/dev/null || true
    exit
}
trap cleanup INT TERM

# Cargar variables de entorno
if [ -f .env.production.local ]; then
    set -o allexport
    source .env.production.local
    set +o allexport
    echo -e "${GREEN}✓ Variables de entorno cargadas${NC}"
else
    echo -e "${RED}❌ Archivo .env.production.local no existe${NC}"
    exit 1
fi

# Verificar que los builds existan
if [ ! -d "apps/backend/dist" ]; then
    echo -e "${RED}❌ Backend no compilado. Ejecuta: cd apps/backend && npm run build${NC}"
    exit 1
fi

if [ ! -d "apps/admin-panel/.next" ]; then
    echo -e "${RED}❌ Admin Panel no compilado. Ejecuta: cd apps/admin-panel && npm run build${NC}"
    exit 1
fi

echo ""

# ============================================
# INICIAR BACKEND
# ============================================
echo -e "${YELLOW}▶ Iniciando Backend API (puerto 8005)...${NC}"
cd apps/backend
NODE_ENV=production npm run start:prod > ../../logs/backend-prod.log 2>&1 &
BACKEND_PID=$!
cd ../..
sleep 3

# Verificar Backend
if curl -s http://localhost:8005/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend corriendo en http://localhost:8005${NC}"
else
    echo -e "${RED}❌ Backend falló. Ver: tail -f logs/backend-prod.log${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

echo ""

# ============================================
# INICIAR ADMIN PANEL
# ============================================
echo -e "${YELLOW}▶ Iniciando Admin Panel (puerto 7001)...${NC}"
cd apps/admin-panel
NODE_ENV=production npm run start > ../../logs/admin-prod.log 2>&1 &
ADMIN_PID=$!
cd ../..

# Esperar más tiempo para Next.js
echo "   Esperando a que Next.js inicie..."
for i in {1..15}; do
    sleep 2
    if curl -s http://localhost:7001 > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Admin Panel corriendo en http://localhost:7001${NC}"
        break
    fi
    if [ $i -eq 15 ]; then
        echo -e "${RED}❌ Admin Panel falló. Ver: tail -f logs/admin-prod.log${NC}"
        cleanup
    fi
done

echo ""

# ============================================
# INICIAR WEBSITE
# ============================================
echo -e "${YELLOW}▶ Iniciando Website (puerto 6001)...${NC}"
cd apps/website
NODE_ENV=production npm run start > ../../logs/website-prod.log 2>&1 &
WEBSITE_PID=$!
cd ../..

# Esperar a que Website inicie
echo "   Esperando a que Next.js inicie..."
for i in {1..15}; do
    sleep 2
    if curl -s http://localhost:6001 > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Website corriendo en http://localhost:6001${NC}"
        break
    fi
    if [ $i -eq 15 ]; then
        echo -e "${RED}❌ Website falló. Ver: tail -f logs/website-prod.log${NC}"
        cleanup
    fi
done

echo ""

# ============================================
# INICIAR WEB WIDGET
# ============================================
echo -e "${YELLOW}▶ Iniciando Web Widget (puerto 7002)...${NC}"
cd apps/web-widget
npm run start > ../../logs/widget-prod.log 2>&1 &
WIDGET_PID=$!
cd ../..
sleep 3

if curl -s http://localhost:7002 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Web Widget corriendo en http://localhost:7002${NC}"
else
    echo -e "${YELLOW}⚠️  Web Widget puede tener problemas. Ver: tail -f logs/widget-prod.log${NC}"
fi

echo ""
echo ""

# ============================================
# RESUMEN
# ============================================
echo -e "${GREEN}✨ ======================================${NC}"
echo -e "${GREEN}   SISTEMA INICIADO CORRECTAMENTE${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""
echo -e "${BLUE}📱 APLICACIONES:${NC}"
echo "   • Backend API:    http://localhost:8005"
echo "   • Admin Panel:    http://localhost:7001"
echo "   • Website:        http://localhost:6001"
echo "   • Web Widget:     http://localhost:7002"
echo ""
echo -e "${BLUE}📊 DOCUMENTACIÓN:${NC}"
echo "   • API Docs:       http://localhost:8005/docs"
echo ""
echo -e "${BLUE}📝 LOGS:${NC}"
echo "   • Backend:        tail -f logs/backend-prod.log"
echo "   • Admin:          tail -f logs/admin-prod.log"
echo "   • Website:        tail -f logs/website-prod.log"
echo "   • Widget:         tail -f logs/widget-prod.log"
echo ""
echo -e "${BLUE}🧪 PRÓXIMOS PASOS:${NC}"
echo "   1. Abre http://localhost:7001 en tu navegador"
echo "   2. Login: admin@zgamersa.com / Admin123!"
echo "   3. Prueba el chatbot en /ai-chat"
echo "   4. En otra terminal ejecuta: ./scripts/simulate-restaurant-day.sh"
echo ""
echo -e "${YELLOW}⏹️  Presiona Ctrl+C para detener todos los servicios${NC}"
echo ""

# Mantener el script corriendo
wait
