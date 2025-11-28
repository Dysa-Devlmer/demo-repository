#!/bin/bash
# ============================================
# ChatBotDysa Enterprise - Instalador para Linux
# ============================================
# Actualizado: 2025-10-11
# Version: 2.0
# Ubuntu/Debian/CentOS/Fedora
# ============================================

set -e

echo "============================================"
echo "ChatBotDysa Enterprise - Instalador Linux"
echo "============================================"
echo ""

# Detectar distribución
if [ -f /etc/os-release ]; then
    . /etc/os-release
    DISTRO=$ID
    VERSION=$VERSION_ID
    echo "📋 Distribución detectada: $NAME $VERSION"
else
    DISTRO="unknown"
    echo "⚠️  No se pudo detectar la distribución"
fi
echo ""

# Verificar Docker
echo "[1/8] Verificando Docker..."
if ! command -v docker &> /dev/null; then
    echo "Docker no está instalado. Instalando..."
    echo ""

    # Instalar Docker según la distribución
    case $DISTRO in
        ubuntu|debian)
            echo "Instalando Docker en Ubuntu/Debian..."
            sudo apt-get update
            sudo apt-get install -y curl
            curl -fsSL https://get.docker.com -o get-docker.sh
            sudo sh get-docker.sh
            ;;
        centos|rhel|fedora)
            echo "Instalando Docker en CentOS/RHEL/Fedora..."
            sudo yum install -y yum-utils
            sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
            sudo yum install -y docker-ce docker-ce-cli containerd.io
            sudo systemctl start docker
            sudo systemctl enable docker
            ;;
        *)
            echo "Usando instalador genérico de Docker..."
            curl -fsSL https://get.docker.com -o get-docker.sh
            sudo sh get-docker.sh
            ;;
    esac

    # Agregar usuario al grupo docker
    sudo usermod -aG docker $USER
    echo ""
    echo "⚠️  Docker instalado. Por favor:"
    echo "1. Cerrar sesión y volver a iniciar sesión"
    echo "2. Verificar con: docker --version"
    echo "3. Volver a ejecutar este script"
    exit 0
fi
echo "✅ Docker encontrado"
docker --version
echo ""

# Verificar que Docker esté corriendo
echo "[2/8] Verificando que Docker esté corriendo..."
if ! docker ps &> /dev/null; then
    echo "Docker no está corriendo. Intentando iniciar..."
    sudo systemctl start docker 2>/dev/null || sudo service docker start 2>/dev/null || {
        echo "❌ ERROR: No se pudo iniciar Docker"
        echo "Por favor iniciar Docker manualmente:"
        echo "  sudo systemctl start docker"
        echo "  o"
        echo "  sudo service docker start"
        exit 1
    }
    sleep 3
fi
echo "✅ Docker está corriendo"
echo ""

# Verificar docker-compose
echo "[3/8] Verificando Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose no está instalado. Instalando..."
    COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
    sudo curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose

    # Crear symlink si es necesario
    if [ ! -f /usr/bin/docker-compose ]; then
        sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
    fi
fi
echo "✅ Docker Compose encontrado"
docker-compose --version
echo ""

# Verificar permisos Docker
echo "[4/8] Verificando permisos Docker..."
if ! docker ps &> /dev/null 2>&1; then
    echo "⚠️  El usuario actual no tiene permisos para usar Docker."
    echo "Ejecutando comandos con sudo..."
    DOCKER_CMD="sudo docker"
    COMPOSE_CMD="sudo docker-compose"
    echo ""
    echo "💡 Para evitar usar sudo en el futuro:"
    echo "   1. sudo usermod -aG docker $USER"
    echo "   2. Cerrar sesión y volver a iniciar"
else
    DOCKER_CMD="docker"
    COMPOSE_CMD="docker-compose"
fi
echo "✅ Permisos verificados"
echo ""

# Verificar archivo .env
echo "[5/8] Verificando configuración..."
if [ ! -f .env ]; then
    echo "Archivo .env no encontrado. Copiando desde .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
    else
        echo "❌ ERROR: Archivo .env.example no encontrado"
        echo "Por favor asegúrese de estar en el directorio correcto"
        exit 1
    fi
    echo ""
    echo "📝 IMPORTANTE: Debe editar el archivo .env con los datos del restaurante"
    echo ""
    echo "Configuraciones importantes:"
    echo "  - RESTAURANT_NAME"
    echo "  - DATABASE_PASSWORD"
    echo "  - JWT_SECRET"
    echo ""
    echo "Presionar ENTER para abrir el archivo .env..."
    read

    # Intentar abrir con diferentes editores
    if command -v nano &> /dev/null; then
        nano .env
    elif command -v vim &> /dev/null; then
        vim .env
    elif command -v vi &> /dev/null; then
        vi .env
    else
        echo "⚠️  No se encontró un editor de texto"
        echo "Por favor editar manualmente el archivo .env antes de continuar"
        exit 1
    fi

    echo ""
    read -p "¿Ha completado la configuración? (s/n): " CONFIG_CONFIRM
    if [[ ! "$CONFIG_CONFIRM" =~ ^[Ss]$ ]]; then
        echo "Por favor completar la configuración antes de continuar"
        exit 1
    fi
fi
echo "✅ Configuración lista"
echo ""

# Limpiar contenedores y volúmenes anteriores si existen
echo "[6/8] Limpiando instalación anterior (si existe)..."
$COMPOSE_CMD down -v 2>/dev/null || true
echo "✅ Limpieza completada"
echo ""

# Construir y descargar imágenes Docker
echo "[7/8] Preparando componentes del sistema..."
echo "⏱️  Esto puede tomar 10-15 minutos la primera vez..."
echo ""
echo "[7.1] Descargando imágenes base (PostgreSQL, Redis, Ollama)..."
if ! $COMPOSE_CMD pull postgres redis ollama; then
    echo "❌ ERROR: Falló al descargar imágenes base"
    exit 1
fi
echo "✅ Imágenes base descargadas"
echo ""

echo "[7.2] Construyendo aplicaciones (Backend, Landing Page)..."
echo "⏱️  Esto tomará varios minutos..."
if ! $COMPOSE_CMD build --no-cache backend landing-page; then
    echo "❌ ERROR: Falló al construir aplicaciones"
    echo ""
    echo "Logs del error:"
    $COMPOSE_CMD logs backend landing-page
    exit 1
fi
echo "✅ Aplicaciones construidas exitosamente"
echo ""

# Iniciar servicios
echo "[8/8] Iniciando ChatBotDysa Enterprise..."
if ! $COMPOSE_CMD up -d; then
    echo "❌ ERROR: Falló al iniciar servicios"
    exit 1
fi
echo ""

# Esperar a que los servicios estén listos
echo "⏱️  Esperando a que los servicios estén listos..."
echo "(Esto puede tomar 1-2 minutos)"
sleep 60

# Verificar estado
echo ""
echo "============================================"
echo "Estado de los servicios:"
echo "============================================"
$COMPOSE_CMD ps
echo ""

# Verificar health checks
echo "🔍 Verificando salud de los servicios..."
sleep 5

# Verificar backend health
echo "Verificando Backend API..."
if curl -f http://localhost:8005/health &> /dev/null; then
    echo "✅ Backend API respondiendo correctamente"
else
    echo "⚠️  Backend API aún no está listo (puede tomar unos segundos más)"
fi
echo ""

# Configurar firewall (si existe)
if command -v ufw &> /dev/null; then
    echo "🔒 Configurando firewall UFW..."
    sudo ufw allow 8005/tcp comment 'ChatBotDysa Backend' || true
    sudo ufw allow 3004/tcp comment 'ChatBotDysa Landing' || true
    sudo ufw allow 15432/tcp comment 'PostgreSQL' || true
    echo "✅ Firewall configurado"
    echo ""
elif command -v firewall-cmd &> /dev/null; then
    echo "🔒 Configurando firewall FirewallD..."
    sudo firewall-cmd --permanent --add-port=8005/tcp || true
    sudo firewall-cmd --permanent --add-port=3004/tcp || true
    sudo firewall-cmd --permanent --add-port=15432/tcp || true
    sudo firewall-cmd --reload || true
    echo "✅ Firewall configurado"
    echo ""
fi

# Mostrar URLs de acceso
echo "============================================"
echo "✅ INSTALACIÓN COMPLETADA EXITOSAMENTE!"
echo "============================================"
echo ""
echo "🚀 El sistema ChatBotDysa Enterprise está accesible en:"
echo ""
echo "  📡 BACKEND API (NestJS):"
echo "    - URL: http://localhost:8005"
echo "    - Docs: http://localhost:8005/api"
echo "    - Health: http://localhost:8005/health"
echo ""
echo "  🌐 LANDING PAGE:"
echo "    - URL: http://localhost:3004"
echo ""
echo "  🖥️  ADMIN PANEL (Desarrollo):"
echo "    - Ejecutar: cd apps/admin-panel && npm run dev"
echo "    - URL: http://localhost:7001"
echo ""
echo "  💾 BASES DE DATOS:"
echo "    - PostgreSQL: localhost:15432"
echo "    - Redis: localhost:16379"
echo "    - Ollama AI: localhost:21434"
echo ""
echo "============================================"
echo "📚 COMANDOS ÚTILES:"
echo "============================================"
echo ""
echo "  Ver logs de todos los servicios:"
echo "    $COMPOSE_CMD logs -f"
echo ""
echo "  Ver logs de un servicio específico:"
echo "    $COMPOSE_CMD logs -f backend"
echo "    $COMPOSE_CMD logs -f postgres"
echo ""
echo "  Detener todos los servicios:"
echo "    $COMPOSE_CMD down"
echo ""
echo "  Reiniciar todos los servicios:"
echo "    $COMPOSE_CMD restart"
echo ""
echo "  Reiniciar un servicio específico:"
echo "    $COMPOSE_CMD restart backend"
echo ""
echo "  Ver estado de servicios:"
echo "    $COMPOSE_CMD ps"
echo ""
echo "  Limpiar todo (⚠️  CUIDADO: borra datos):"
echo "    $COMPOSE_CMD down -v"
echo ""
echo "============================================"
echo "🎯 PRÓXIMOS PASOS:"
echo "============================================"
echo ""
echo "  1. Abrir http://localhost:8005/health para verificar backend"
echo "  2. Abrir http://localhost:3004 para ver landing page"
echo "  3. Revisar logs: $COMPOSE_CMD logs -f"
echo ""
echo "Para más información, consultar la documentación en:"
echo "  📁 /docs o /reportes"
echo ""
echo "💡 NOTA: Si usó sudo, recuerde agregar su usuario al grupo docker:"
echo "   sudo usermod -aG docker $USER"
echo "   Luego cerrar sesión y volver a iniciar"
echo ""
echo "¡Gracias por usar ChatBotDysa Enterprise! 🚀"
echo ""
