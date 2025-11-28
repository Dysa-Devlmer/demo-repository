#!/bin/bash

# ChatBotDysa - Production Startup Script
# Inicia todos los servicios de producción

set -e

echo "🚀 Iniciando ChatBotDysa en Modo PRODUCCIÓN"
echo "================================================"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para logs
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 1. Verificar Docker
log_info "Verificando Docker..."
if ! command -v docker &> /dev/null; then
    log_error "Docker no está instalado"
    exit 1
fi

if ! docker info &> /dev/null; then
    log_error "Docker no está ejecutándose"
    exit 1
fi
log_success "Docker está listo"

# 2. Verificar archivos de configuración
log_info "Verificando archivos de configuración..."
if [ ! -f ".env" ]; then
    log_error "Archivo .env no encontrado"
    exit 1
fi

if [ ! -f "docker-compose.production.yml" ]; then
    log_error "Archivo docker-compose.production.yml no encontrado"
    exit 1
fi
log_success "Archivos de configuración encontrados"

# 3. Iniciar servicios de base de datos
log_info "Iniciando servicios PostgreSQL, Redis y Ollama..."
docker-compose -f docker-compose.production.yml up -d

# 4. Esperar a que los servicios estén listos
log_info "Esperando servicios de base de datos..."
sleep 15

# 5. Verificar conectividad PostgreSQL
log_info "Verificando PostgreSQL..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if docker-compose -f docker-compose.production.yml exec -T postgres pg_isready -U postgres -d chatbotdysa &> /dev/null; then
        log_success "PostgreSQL está listo"
        break
    fi
    
    if [ $attempt -eq $max_attempts ]; then
        log_error "PostgreSQL no está respondiendo después de $max_attempts intentos"
        exit 1
    fi
    
    log_info "Intento $attempt/$max_attempts - esperando PostgreSQL..."
    sleep 2
    ((attempt++))
done

# 6. Verificar Redis
log_info "Verificando Redis..."
if docker-compose -f docker-compose.production.yml exec -T redis redis-cli ping &> /dev/null; then
    log_success "Redis está listo"
else
    log_warning "Redis no responde, pero continuando..."
fi

# 7. Instalar/actualizar dependencias
log_info "Instalando dependencias..."
npm install
cd apps/backend && npm install && cd ../..
log_success "Dependencias instaladas"

# 8. Compilar backend
log_info "Compilando backend para producción..."
cd apps/backend && npm run build && cd ../..
log_success "Backend compilado"

# 9. Instalar PM2 si no está disponible
if ! command -v pm2 &> /dev/null; then
    log_info "Instalando PM2..."
    npm install -g pm2
fi

# 10. Configurar Ollama con modelo llama3
log_info "Configurando Ollama con modelo llama3..."
sleep 10 # Esperar a que Ollama esté completamente listo

# Verificar si el modelo ya está instalado
if ! docker-compose -f docker-compose.production.yml exec -T ollama ollama list | grep -q "llama3"; then
    log_info "Descargando modelo llama3 (esto puede tomar varios minutos)..."
    docker-compose -f docker-compose.production.yml exec -T ollama ollama pull llama3
    log_success "Modelo llama3 instalado"
else
    log_success "Modelo llama3 ya está disponible"
fi

# 11. Iniciar backend con PM2
log_info "Iniciando backend con PM2..."
cd apps/backend

# Crear archivo ecosystem para PM2
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'chatbotdysa-backend',
    script: 'dist/main.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    log_file: '../../logs/backend.log',
    out_file: '../../logs/backend-out.log',
    error_file: '../../logs/backend-error.log',
    time: true
  }]
}
EOF

# Crear directorio de logs
mkdir -p ../../logs

# Iniciar con PM2
pm2 start ecosystem.config.js
pm2 save

cd ../..

log_success "Backend iniciado con PM2"

# 12. Mostrar estado final
echo ""
echo "🎉 ChatBotDysa Producción INICIADO EXITOSAMENTE"
echo "================================================"

log_success "PostgreSQL: localhost:5432 (chatbotdysa)"
log_success "Redis: localhost:6379"
log_success "Ollama: localhost:11434 (modelo: llama3)"
log_success "Backend API: localhost:3000"

echo ""
log_info "Comandos útiles:"
echo "  • Ver logs del backend: pm2 logs chatbotdysa-backend"
echo "  • Estado de servicios: docker-compose -f docker-compose.production.yml ps"
echo "  • Reiniciar backend: pm2 restart chatbotdysa-backend"
echo "  • Detener todo: ./stop-production.sh"

echo ""
log_success "¡Sistema listo para recibir solicitudes de chatbot!"