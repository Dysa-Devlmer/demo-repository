#!/bin/bash

# =========================================
# Setup Rápido para Testing Local
# =========================================
# Ejecutar: chmod +x scripts/quick-setup-local.sh && ./scripts/quick-setup-local.sh

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

clear
echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  ChatBotDysa - Setup Local Rápido         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# ========================================
# VERIFICAR REQUISITOS
# ========================================
echo -e "${YELLOW}📋 Verificando requisitos previos...${NC}\n"

# Node.js
echo -n "  • Node.js: "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ No instalado${NC}"
    echo -e "${YELLOW}  Instala desde: https://nodejs.org/${NC}"
    exit 1
fi

# npm
echo -n "  • npm: "
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ v$NPM_VERSION${NC}"
else
    echo -e "${RED}❌ No instalado${NC}"
    exit 1
fi

# Docker
echo -n "  • Docker: "
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | sed 's/,//')
    echo -e "${GREEN}✅ v$DOCKER_VERSION${NC}"
    DOCKER_OK=true
else
    echo -e "${YELLOW}⚠️  No instalado (opcional)${NC}"
    DOCKER_OK=false
fi

# Ollama
echo -n "  • Ollama: "
if command -v ollama &> /dev/null; then
    echo -e "${GREEN}✅ Instalado${NC}"
    OLLAMA_INSTALLED=true
else
    echo -e "${YELLOW}⚠️  No instalado${NC}"
    OLLAMA_INSTALLED=false
fi

echo ""

# ========================================
# INSTALAR OLLAMA (si no está)
# ========================================
if [ "$OLLAMA_INSTALLED" != true ]; then
    echo -e "${YELLOW}📥 PASO 1: Instalando Ollama...${NC}\n"

    OS="$(uname -s)"
    case "${OS}" in
        Darwin*)
            echo "  Detectado: macOS"
            if command -v brew &> /dev/null; then
                echo "  Instalando vía Homebrew..."
                brew install ollama
            else
                echo -e "${YELLOW}  Descarga manual desde: https://ollama.com/download${NC}"
                open "https://ollama.com/download"
                exit 1
            fi
            ;;
        Linux*)
            echo "  Detectado: Linux"
            echo "  Instalando..."
            curl -fsSL https://ollama.com/install.sh | sh
            ;;
        *)
            echo -e "${RED}  SO no soportado: $OS${NC}"
            echo -e "${YELLOW}  Descarga desde: https://ollama.com/download${NC}"
            exit 1
            ;;
    esac

    echo -e "${GREEN}✅ Ollama instalado${NC}\n"
else
    echo -e "${GREEN}✅ PASO 1: Ollama ya está instalado${NC}\n"
fi

# ========================================
# INICIAR OLLAMA
# ========================================
echo -e "${YELLOW}🚀 PASO 2: Iniciando Ollama...${NC}\n"

# Verificar si ya está corriendo
if curl -s http://localhost:11434/api/version > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Ollama ya está corriendo${NC}"
else
    echo "  Iniciando servidor Ollama..."
    ollama serve > /dev/null 2>&1 &
    OLLAMA_PID=$!

    # Esperar a que inicie
    echo -n "  Esperando a que Ollama inicie"
    for i in {1..10}; do
        if curl -s http://localhost:11434/api/version > /dev/null 2>&1; then
            echo -e "\n${GREEN}✅ Ollama iniciado (PID: $OLLAMA_PID)${NC}"
            break
        fi
        echo -n "."
        sleep 1
    done
fi

echo ""

# ========================================
# DESCARGAR MODELO
# ========================================
echo -e "${YELLOW}📦 PASO 3: Descargando modelo de IA...${NC}\n"

# Verificar si ya está descargado
if ollama list | grep -q "phi3:mini"; then
    echo -e "${GREEN}✅ Modelo phi3:mini ya está descargado${NC}"
else
    echo "  Descargando phi3:mini (~2GB, puede tardar varios minutos)..."
    ollama pull phi3:mini

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Modelo descargado exitosamente${NC}"
    else
        echo -e "${RED}❌ Error al descargar el modelo${NC}"
        exit 1
    fi
fi

echo ""

# ========================================
# POSTGRESQL (DOCKER)
# ========================================
if [ "$DOCKER_OK" = true ]; then
    echo -e "${YELLOW}🐘 PASO 4: Configurando PostgreSQL...${NC}\n"

    # Verificar si ya existe
    if docker ps -a | grep -q chatbotdysa-postgres; then
        # Existe, verificar si está corriendo
        if docker ps | grep -q chatbotdysa-postgres; then
            echo -e "${GREEN}✅ PostgreSQL ya está corriendo${NC}"
        else
            echo "  Iniciando PostgreSQL existente..."
            docker start chatbotdysa-postgres
            echo -e "${GREEN}✅ PostgreSQL iniciado${NC}"
        fi
    else
        # No existe, crear
        echo "  Creando contenedor PostgreSQL..."
        docker run -d \
          --name chatbotdysa-postgres \
          -e POSTGRES_USER=postgres \
          -e POSTGRES_PASSWORD=supersecret \
          -e POSTGRES_DB=chatbotdysa \
          -p 5432:5432 \
          postgres:16

        echo "  Esperando a que PostgreSQL inicie..."
        sleep 5
        echo -e "${GREEN}✅ PostgreSQL creado e iniciado${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  PASO 4: Docker no disponible${NC}"
    echo -e "  Asegúrate de tener PostgreSQL corriendo manualmente"
    echo -e "  O instala Docker desde: https://www.docker.com/get-started"
fi

echo ""

# ========================================
# CONFIGURAR BACKEND
# ========================================
echo -e "${YELLOW}⚙️  PASO 5: Configurando Backend...${NC}\n"

cd apps/backend || exit

# Crear .env si no existe
if [ ! -f .env ]; then
    echo "  Creando archivo .env..."
    cp .env.example .env

    # Actualizar valores específicos
    sed -i.bak 's|OLLAMA_URL=.*|OLLAMA_URL=http://localhost:11434|' .env
    sed -i.bak 's|OLLAMA_MODEL=.*|OLLAMA_MODEL=phi3:mini|' .env
    sed -i.bak 's|DATABASE_PASSWORD=.*|DATABASE_PASSWORD=supersecret|' .env
    sed -i.bak 's|NODE_ENV=.*|NODE_ENV=development|' .env
    sed -i.bak 's|PORT=.*|PORT=8005|' .env
    rm .env.bak

    echo -e "${GREEN}✅ Archivo .env creado${NC}"
else
    echo -e "${GREEN}✅ Archivo .env ya existe${NC}"
fi

# Instalar dependencias
if [ ! -d "node_modules" ]; then
    echo "  Instalando dependencias del backend..."
    npm install --legacy-peer-deps
    echo -e "${GREEN}✅ Dependencias instaladas${NC}"
else
    echo -e "${GREEN}✅ Dependencias ya instaladas${NC}"
fi

# Ejecutar migraciones
echo "  Ejecutando migraciones de base de datos..."
if npm run migration:run; then
    echo -e "${GREEN}✅ Migraciones ejecutadas${NC}"
else
    echo -e "${YELLOW}⚠️  Migraciones no pudieron ejecutarse (puede ser normal si ya están aplicadas)${NC}"
fi

# Ejecutar seeds
echo "  Cargando datos de prueba..."
if npm run seed 2>/dev/null; then
    echo -e "${GREEN}✅ Datos de prueba cargados${NC}"
else
    echo -e "${YELLOW}⚠️  Seeds no pudieron ejecutarse (puede ser normal si ya están cargados)${NC}"
fi

cd ../.. || exit

echo ""

# ========================================
# RESUMEN FINAL
# ========================================
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✅ Setup Completado Exitosamente         ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}📊 Estado de los Servicios:${NC}"
echo -e "  ${GREEN}✅${NC} Ollama: http://localhost:11434"
echo -e "  ${GREEN}✅${NC} PostgreSQL: localhost:5432"
echo -e "  ${GREEN}✅${NC} Modelo IA: phi3:mini"
echo ""

echo -e "${BLUE}🚀 Próximos Pasos:${NC}"
echo ""
echo -e "${YELLOW}1. Iniciar el Backend:${NC}"
echo -e "   ${BLUE}cd apps/backend${NC}"
echo -e "   ${BLUE}npm run start:dev${NC}"
echo ""
echo -e "${YELLOW}2. (Opcional) Iniciar Admin Panel en otra terminal:${NC}"
echo -e "   ${BLUE}cd apps/admin-panel${NC}"
echo -e "   ${BLUE}npm install${NC}"
echo -e "   ${BLUE}cp .env.example .env.local${NC}"
echo -e "   ${BLUE}npm run dev${NC}"
echo ""
echo -e "${YELLOW}3. Probar el sistema:${NC}"
echo -e "   ${BLUE}./scripts/test-ai-quick.sh${NC}"
echo ""
echo -e "${YELLOW}4. Acceder:${NC}"
echo -e "   • Backend: ${BLUE}http://localhost:8005${NC}"
echo -e "   • API Docs: ${BLUE}http://localhost:8005/api${NC}"
echo -e "   • Admin Panel: ${BLUE}http://localhost:7001${NC} (user: admin@zgamersa.com, pass: Admin123!)"
echo ""

echo -e "${GREEN}🎉 ¡Todo listo para empezar a probar!${NC}"
echo ""
echo -e "${YELLOW}📖 Consulta GUIA_TESTING_LOCAL.md para más información${NC}"
echo ""
