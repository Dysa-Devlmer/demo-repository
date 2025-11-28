#!/bin/bash
# ============================================
# ChatBotDysa Enterprise - Instalador para macOS
# ============================================
# Actualizado: 2025-10-11
# Version: 2.0
# ============================================

set -e

echo "============================================"
echo "ChatBotDysa Enterprise - Instalador macOS"
echo "============================================"
echo ""

# Verificar Docker
echo "[1/7] Verificando Docker Desktop..."
if ! command -v docker &> /dev/null; then
    echo "❌ ERROR: Docker Desktop no está instalado"
    echo ""
    echo "Por favor instalar Docker Desktop desde:"
    echo "https://www.docker.com/products/docker-desktop"
    echo ""
    echo "Instrucciones:"
    echo "1. Descargar Docker Desktop para Mac"
    echo "2. Instalar y abrir Docker Desktop"
    echo "3. Esperar a que Docker esté corriendo (icono en la barra de menú)"
    echo "4. Volver a ejecutar este script"
    exit 1
fi
echo "✅ Docker Desktop encontrado"
docker --version
echo ""

# Verificar que Docker esté corriendo
echo "[2/7] Verificando que Docker esté corriendo..."
if ! docker ps &> /dev/null; then
    echo "❌ ERROR: Docker Desktop no está corriendo"
    echo ""
    echo "Por favor:"
    echo "1. Abrir Docker Desktop desde Aplicaciones"
    echo "2. Esperar a que el icono de Docker aparezca en la barra de menú"
    echo "3. Volver a ejecutar este script"
    exit 1
fi
echo "✅ Docker Desktop está corriendo"
echo ""

# Verificar docker-compose
echo "[3/7] Verificando Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    echo "❌ ERROR: Docker Compose no está disponible"
    echo "Docker Desktop debería incluir Docker Compose"
    echo "Por favor reinstalar Docker Desktop"
    exit 1
fi
echo "✅ Docker Compose encontrado"
docker-compose --version
echo ""

# Verificar archivo .env
echo "[4/7] Verificando configuración..."
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
    echo "Presionar ENTER para abrir el archivo .env con el editor..."
    read
    if command -v code &> /dev/null; then
        code .env
    elif command -v nano &> /dev/null; then
        nano .env
    else
        open -e .env
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
echo "[5/7] Limpiando instalación anterior (si existe)..."
docker-compose down -v 2>/dev/null || true
echo "✅ Limpieza completada"
echo ""

# Construir y descargar imágenes Docker
echo "[6/7] Preparando componentes del sistema..."
echo "⏱️  Esto puede tomar 10-15 minutos la primera vez..."
echo ""
echo "[6.1] Descargando imágenes base (PostgreSQL, Redis, Ollama)..."
if ! docker-compose pull postgres redis ollama; then
    echo "❌ ERROR: Falló al descargar imágenes base"
    exit 1
fi
echo "✅ Imágenes base descargadas"
echo ""

echo "[6.2] Construyendo aplicaciones (Backend, Landing Page)..."
echo "⏱️  Esto tomará varios minutos..."
if ! docker-compose build --no-cache backend landing-page; then
    echo "❌ ERROR: Falló al construir aplicaciones"
    echo ""
    echo "Logs del error:"
    docker-compose logs backend landing-page
    exit 1
fi
echo "✅ Aplicaciones construidas exitosamente"
echo ""

# Iniciar servicios
echo "[7/7] Iniciando ChatBotDysa Enterprise..."
if ! docker-compose up -d; then
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
docker-compose ps
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
echo "    docker-compose logs -f"
echo ""
echo "  Ver logs de un servicio específico:"
echo "    docker-compose logs -f backend"
echo "    docker-compose logs -f postgres"
echo ""
echo "  Detener todos los servicios:"
echo "    docker-compose down"
echo ""
echo "  Reiniciar todos los servicios:"
echo "    docker-compose restart"
echo ""
echo "  Reiniciar un servicio específico:"
echo "    docker-compose restart backend"
echo ""
echo "  Ver estado de servicios:"
echo "    docker-compose ps"
echo ""
echo "  Limpiar todo (⚠️  CUIDADO: borra datos):"
echo "    docker-compose down -v"
echo ""
echo "============================================"
echo "🎯 PRÓXIMOS PASOS:"
echo "============================================"
echo ""
echo "  1. Abrir http://localhost:8005/health para verificar backend"
echo "  2. Abrir http://localhost:3004 para ver landing page"
echo "  3. Revisar logs: docker-compose logs -f"
echo ""
echo "Para más información, consultar la documentación en:"
echo "  📁 /docs o /reportes"
echo ""
echo "¡Gracias por usar ChatBotDysa Enterprise! 🚀"
echo ""
