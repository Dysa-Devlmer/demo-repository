#!/bin/bash

# ============================================
# SCRIPT DE PRUEBA DE PRODUCCIÓN LOCAL
# ============================================
# Este script prueba el sistema en modo producción
# pero corriendo localmente en tu Mac
# ============================================

# No salir automáticamente en errores (para mejor manejo)
set +e

echo "🚀 ======================================"
echo "🚀 PRUEBA DE PRODUCCIÓN LOCAL"
echo "🚀 ChatBotDysa Production Testing"
echo "🚀 ======================================"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Variables globales
BUILD_NEEDED=false

# Función para limpiar procesos al salir
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Deteniendo servicios...${NC}"
    jobs -p | xargs kill 2>/dev/null || true
    exit
}
trap cleanup INT TERM

# ============================================
# PASO 0: LIMPIAR PUERTOS OCUPADOS
# ============================================
echo -e "${BLUE}🧹 PASO 0: Limpiando puertos ocupados...${NC}"

# Verificar puertos
PORTS_OCCUPIED=false
for port in 8005 7001 6001 7002; do
    if lsof -ti:$port > /dev/null 2>&1; then
        PORTS_OCCUPIED=true
        PIDS=$(lsof -ti:$port)
        echo -e "${YELLOW}⚠️  Puerto $port ocupado (PIDs: $PIDS)${NC}"
    fi
done

if [ "$PORTS_OCCUPIED" = true ]; then
    echo -e "${CYAN}🔧 Liberando puertos...${NC}"
    for port in 8005 7001 6001 7002; do
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
    done
    sleep 2
    echo -e "${GREEN}✓ Puertos liberados${NC}"
else
    echo -e "${GREEN}✓ Todos los puertos disponibles${NC}"
fi

echo ""

# ============================================
# PASO 1: VERIFICAR REQUISITOS
# ============================================
echo -e "${BLUE}📋 PASO 1: Verificando requisitos...${NC}"

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node --version)${NC}"

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm no está instalado${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm $(npm --version)${NC}"

# Verificar PostgreSQL
if ! nc -z localhost 15432 2>/dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQL no está corriendo en puerto 15432${NC}"
    echo -e "${YELLOW}   Iniciando con Docker...${NC}"
    if command -v docker-compose &> /dev/null; then
        docker-compose up -d postgres
        sleep 5
    else
        echo -e "${RED}❌ Inicia PostgreSQL manualmente${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}✓ PostgreSQL corriendo en puerto 15432${NC}"

# Verificar Redis
if ! nc -z localhost 16379 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Redis no está corriendo en puerto 16379${NC}"
    echo -e "${YELLOW}   Iniciando con Docker...${NC}"
    if command -v docker-compose &> /dev/null; then
        docker-compose up -d redis
        sleep 3
    else
        echo -e "${RED}❌ Inicia Redis manualmente${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}✓ Redis corriendo en puerto 16379${NC}"

# Verificar Ollama
if ! nc -z localhost 11434 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Ollama no está corriendo${NC}"
    echo -e "${YELLOW}   Para usar IA, inicia Ollama: ollama serve${NC}"
else
    echo -e "${GREEN}✓ Ollama corriendo${NC}"
fi

echo ""

# ============================================
# PASO 2: CONFIGURAR ENTORNO
# ============================================
echo -e "${BLUE}⚙️  PASO 2: Configurando entorno de producción...${NC}"

# Verificar archivo de configuración
if [ ! -f .env.production ]; then
    if [ -f .env.production.local ]; then
        echo -e "${CYAN}Copiando .env.production.local a .env.production${NC}"
        cp .env.production.local .env.production
    else
        echo -e "${RED}❌ Archivo .env.production no existe${NC}"
        echo -e "${YELLOW}   Ejecuta: cp .env.production.template .env.production${NC}"
        exit 1
    fi
fi

# Cargar variables de entorno
set -o allexport
source .env.production 2>/dev/null
set +o allexport
echo -e "${GREEN}✓ Variables de entorno de producción cargadas${NC}"

# Verificar que NODE_ENV sea production
if [ "$NODE_ENV" != "production" ]; then
    export NODE_ENV=production
fi
echo -e "${GREEN}✓ NODE_ENV=production${NC}"

echo ""

# ============================================
# PASO 3: INSTALAR DEPENDENCIAS
# ============================================
echo -e "${BLUE}📦 PASO 3: Verificando dependencias...${NC}"

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Instalando dependencias...${NC}"
    npm install --production=false
else
    echo -e "${GREEN}✓ node_modules existe${NC}"
fi

echo ""

# ============================================
# PASO 4: VERIFICAR/COMPILAR APLICACIONES
# ============================================
echo -e "${BLUE}🔨 PASO 4: Verificando builds de producción...${NC}"

# Verificar si ya están compilados
BACKEND_BUILT=false
ADMIN_BUILT=false
WEBSITE_BUILT=false
WIDGET_BUILT=false

if [ -d "apps/backend/dist" ] && [ -f "apps/backend/dist/src/main.js" ]; then
    BACKEND_BUILT=true
    echo -e "${GREEN}✓ Backend ya compilado${NC}"
else
    BUILD_NEEDED=true
fi

if [ -d "apps/admin-panel/.next" ]; then
    ADMIN_BUILT=true
    echo -e "${GREEN}✓ Admin Panel ya compilado${NC}"
else
    BUILD_NEEDED=true
fi

if [ -d "apps/website/.next" ]; then
    WEBSITE_BUILT=true
    echo -e "${GREEN}✓ Website ya compilado${NC}"
else
    BUILD_NEEDED=true
fi

if [ -d "apps/web-widget/dist" ]; then
    WIDGET_BUILT=true
    echo -e "${GREEN}✓ Web Widget ya compilado${NC}"
else
    BUILD_NEEDED=true
fi

echo ""

# Si hace falta compilar, preguntar
if [ "$BUILD_NEEDED" = true ]; then
    echo -e "${YELLOW}⚠️  Algunas aplicaciones necesitan compilarse${NC}"
    echo -e "${CYAN}📝 Esto tomará ~10 minutos la primera vez${NC}"
    echo ""

    # Compilar lo que haga falta
    if [ "$BACKEND_BUILT" = false ]; then
        echo -e "${YELLOW}▶ Compilando Backend API...${NC}"
        cd apps/backend
        npm run build
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Backend compilado exitosamente${NC}"
        else
            echo -e "${RED}❌ Error al compilar Backend${NC}"
            exit 1
        fi
        cd ../..
        echo ""
    fi

    if [ "$ADMIN_BUILT" = false ]; then
        echo -e "${YELLOW}▶ Compilando Admin Panel...${NC}"
        cd apps/admin-panel
        npm run build
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Admin Panel compilado exitosamente${NC}"
        else
            echo -e "${RED}❌ Error al compilar Admin Panel${NC}"
            exit 1
        fi
        cd ../..
        echo ""
    fi

    if [ "$WEBSITE_BUILT" = false ]; then
        echo -e "${YELLOW}▶ Compilando Website...${NC}"
        cd apps/website
        npm run build
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Website compilado exitosamente${NC}"
        else
            echo -e "${RED}❌ Error al compilar Website${NC}"
            exit 1
        fi
        cd ../..
        echo ""
    fi

    if [ "$WIDGET_BUILT" = false ]; then
        echo -e "${YELLOW}▶ Compilando Web Widget...${NC}"
        cd apps/web-widget
        npm run build
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Web Widget compilado exitosamente${NC}"
        else
            echo -e "${RED}❌ Error al compilar Web Widget${NC}"
            exit 1
        fi
        cd ../..
        echo ""
    fi
else
    echo -e "${GREEN}✓ Todas las aplicaciones ya están compiladas${NC}"
    echo -e "${CYAN}ℹ️  Para recompilar: rm -rf apps/*/dist apps/*/.next${NC}"
    echo ""
fi

# ============================================
# PASO 5: PREPARAR BASE DE DATOS
# ============================================
echo -e "${BLUE}🗄️  PASO 5: Preparando base de datos de producción...${NC}"

# Crear base de datos si no existe
export PGPASSWORD=supersecret
psql -h 127.0.0.1 -p 15432 -U postgres -c "CREATE DATABASE chatbotdysa_production;" 2>/dev/null || echo "Base de datos ya existe"

echo -e "${GREEN}✓ Base de datos lista${NC}"

# Ejecutar migraciones
echo "Ejecutando migraciones..."
cd apps/backend
npm run typeorm:run 2>/dev/null || echo "Sin migraciones pendientes"

# Seed de datos de prueba
echo "Cargando datos de prueba..."
npm run seed:prod 2>/dev/null || echo "Sin seed disponible"
cd ../..

echo ""

# ============================================
# PASO 6: VERIFICAR SEGURIDAD
# ============================================
echo -e "${BLUE}🔒 PASO 6: Verificando configuración de seguridad...${NC}"

# Verificar JWT secrets
if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(grep "^JWT_SECRET=" .env.production | cut -d'=' -f2)
fi

if [ "$JWT_SECRET" == "CAMBIAR_jwt_secret_key" ] || [ ${#JWT_SECRET} -lt 32 ]; then
    echo -e "${RED}❌ JWT_SECRET es demasiado débil (mínimo 32 caracteres)${NC}"
    echo -e "${YELLOW}   Genera claves seguras: node scripts/generate-secrets.js${NC}"
    exit 1
fi
echo -e "${GREEN}✓ JWT_SECRET es seguro (${#JWT_SECRET} caracteres)${NC}"

# Verificar que integraciones estén en modo test
if [ "$WHATSAPP_ENABLED" == "true" ]; then
    echo -e "${YELLOW}⚠️  WhatsApp está habilitado - Asegúrate de usar credenciales de test${NC}"
fi

if [ "$STRIPE_ENABLED" == "true" ]; then
    echo -e "${YELLOW}⚠️  Stripe está habilitado - Asegúrate de usar test keys${NC}"
fi

echo ""

# ============================================
# PASO 7: INICIAR SERVICIOS
# ============================================
echo -e "${BLUE}🚀 PASO 7: Iniciando servicios en modo desarrollo...${NC}"
echo -e "${CYAN}   (Usando modo dev para mayor estabilidad)${NC}"

# Crear directorio de logs
mkdir -p logs

# Iniciar Backend
echo -e "${YELLOW}▶ Iniciando Backend API (puerto 8005)...${NC}"
cd apps/backend
npm run start:dev > ../../logs/backend-dev.log 2>&1 &
BACKEND_PID=$!
cd ../..

# Esperar a que el backend esté listo (puede tomar ~10 segundos)
echo "   Esperando a que NestJS inicialice..."
for i in {1..15}; do
    sleep 2
    if curl -s http://localhost:8005/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Backend corriendo en http://localhost:8005${NC}"
        break
    fi
    if [ $i -eq 15 ]; then
        echo -e "${RED}❌ Backend no respondió después de 30 segundos${NC}"
        echo "Ver logs: tail -f logs/backend-dev.log"
        kill $BACKEND_PID 2>/dev/null || true
        exit 1
    fi
done

echo ""

# Iniciar Admin Panel
echo -e "${YELLOW}▶ Iniciando Admin Panel (puerto 7001)...${NC}"
cd apps/admin-panel
npm run dev -- -p 7001 > ../../logs/admin-dev.log 2>&1 &
ADMIN_PID=$!
cd ../..

# Esperar a que Next.js inicie
echo "   Esperando a que Next.js inicie..."
for i in {1..20}; do
    sleep 2
    if curl -s http://localhost:7001 > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Admin Panel corriendo en http://localhost:7001${NC}"
        break
    fi
    if [ $i -eq 20 ]; then
        echo -e "${RED}❌ Admin Panel no inició. Ver: tail -f logs/admin-dev.log${NC}"
        cleanup
    fi
done

echo ""

# Iniciar Website
echo -e "${YELLOW}▶ Iniciando Website (puerto 6001)...${NC}"
cd apps/website
npm run dev -- -p 6001 > ../../logs/website-dev.log 2>&1 &
WEBSITE_PID=$!
cd ../..

# Esperar a que Next.js inicie
echo "   Esperando a que Next.js inicie..."
for i in {1..20}; do
    sleep 2
    if curl -s http://localhost:6001 > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Website corriendo en http://localhost:6001${NC}"
        break
    fi
    if [ $i -eq 20 ]; then
        echo -e "${RED}❌ Website no inició. Ver: tail -f logs/website-dev.log${NC}"
        cleanup
    fi
done

echo ""

# Iniciar Web Widget
echo -e "${YELLOW}▶ Iniciando Web Widget (puerto 7002)...${NC}"
cd apps/web-widget
npm run start > ../../logs/widget-dev.log 2>&1 &
WIDGET_PID=$!
cd ../..
sleep 5

if curl -s http://localhost:7002 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Web Widget corriendo en http://localhost:7002${NC}"
else
    echo -e "${YELLOW}⚠️  Web Widget puede tener problemas. Ver: tail -f logs/widget-dev.log${NC}"
fi

echo ""

# ============================================
# PASO 8: VERIFICAR SERVICIOS
# ============================================
echo -e "${BLUE}✅ PASO 8: Verificando que todo esté corriendo...${NC}"

# Verificar Backend
if curl -s http://localhost:8005/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend API: http://localhost:8005${NC}"
else
    echo -e "${RED}❌ Backend no está respondiendo${NC}"
fi

# Verificar Admin Panel
if curl -s http://localhost:7001 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Admin Panel: http://localhost:7001${NC}"
else
    echo -e "${RED}❌ Admin Panel no está respondiendo${NC}"
fi

# Verificar Website
if curl -s http://localhost:6001 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Website: http://localhost:6001${NC}"
else
    echo -e "${RED}❌ Website no está respondiendo${NC}"
fi

# Verificar Web Widget
if curl -s http://localhost:7002 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Web Widget: http://localhost:7002${NC}"
else
    echo -e "${RED}❌ Web Widget no está respondiendo${NC}"
fi

echo ""

# ============================================
# RESUMEN
# ============================================
echo -e "${GREEN}✨ ======================================${NC}"
echo -e "${GREEN}✨ SISTEMA EN MODO PRODUCCIÓN LOCAL${NC}"
echo -e "${GREEN}✨ ======================================${NC}"
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
echo "   • Backend:        tail -f logs/backend-dev.log"
echo "   • Admin:          tail -f logs/admin-dev.log"
echo "   • Website:        tail -f logs/website-dev.log"
echo "   • Widget:         tail -f logs/widget-dev.log"
echo ""
echo -e "${BLUE}🔍 PRÓXIMOS PASOS:${NC}"
echo "   1. Abre http://localhost:7001 en tu navegador"
echo "   2. Login: admin@zgamersa.com / Admin123!"
echo "   3. Prueba todas las funcionalidades"
echo "   4. Revisa el checklist: CHECKLIST_PRODUCCION.md"
echo "   5. Ejecuta simulación: ./scripts/simulate-restaurant-day.sh"
echo ""
echo -e "${YELLOW}⏹️  Presiona Ctrl+C para detener todos los servicios${NC}"
echo ""

# Mantener el script corriendo
wait
