#!/bin/bash

# ================================
# Script de Configuración Automática
# ChatBotDysa - Environment Setup
# ================================

set -e  # Salir si hay errores

echo "=============================================="
echo "🔧 ChatBotDysa - Configuración de Entorno"
echo "=============================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Debes ejecutar este script desde la raíz del proyecto${NC}"
    exit 1
fi

# Función para generar secrets seguros
generate_secret() {
    openssl rand -base64 32
}

generate_hex_secret() {
    openssl rand -hex 32
}

echo "📝 Generando secrets seguros..."
JWT_SECRET=$(generate_secret)
NEXTAUTH_SECRET=$(generate_secret)
ENCRYPTION_KEY=$(generate_hex_secret)

echo -e "${GREEN}✅ Secrets generados${NC}"
echo ""

# ================================
# BACKEND .env
# ================================
echo "🔧 Configurando Backend..."

if [ -f "apps/backend/.env" ]; then
    echo -e "${YELLOW}⚠️  Backend .env ya existe. ¿Sobrescribir? (y/N)${NC}"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "Saltando configuración de backend..."
    else
        cp apps/backend/.env.example apps/backend/.env
        
        # Reemplazar los secrets
        sed -i.bak "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" apps/backend/.env
        sed -i.bak "s|ENCRYPTION_KEY=.*|ENCRYPTION_KEY=$ENCRYPTION_KEY|" apps/backend/.env
        rm apps/backend/.env.bak
        
        echo -e "${GREEN}✅ Backend .env configurado${NC}"
    fi
else
    cp apps/backend/.env.example apps/backend/.env
    
    # Reemplazar los secrets
    sed -i.bak "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" apps/backend/.env
    sed -i.bak "s|ENCRYPTION_KEY=.*|ENCRYPTION_KEY=$ENCRYPTION_KEY|" apps/backend/.env
    rm apps/backend/.env.bak
    
    echo -e "${GREEN}✅ Backend .env creado${NC}"
fi

# ================================
# ADMIN PANEL .env.local
# ================================
echo ""
echo "🔧 Configurando Admin Panel..."

if [ -f "apps/admin-panel/.env.local" ]; then
    echo -e "${YELLOW}⚠️  Admin Panel .env.local ya existe (no se modificará)${NC}"
else
    cp apps/admin-panel/.env.example apps/admin-panel/.env.local
    
    # Reemplazar NEXTAUTH_SECRET
    sed -i.bak "s|NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=$NEXTAUTH_SECRET|" apps/admin-panel/.env.local
    rm apps/admin-panel/.env.local.bak
    
    echo -e "${GREEN}✅ Admin Panel .env.local creado${NC}"
fi

# ================================
# WEBSITE .env.local
# ================================
echo ""
echo "🔧 Configurando Website..."

if [ -f "apps/website/.env.local" ]; then
    echo -e "${YELLOW}⚠️  Website .env.local ya existe (no se modificará)${NC}"
else
    cp apps/website/.env.example apps/website/.env.local
    echo -e "${GREEN}✅ Website .env.local creado${NC}"
fi

# ================================
# RESUMEN
# ================================
echo ""
echo "=============================================="
echo "🎉 ¡Configuración completada!"
echo "=============================================="
echo ""
echo -e "${YELLOW}📝 IMPORTANTE:${NC}"
echo ""
echo "1. Revisa y edita las siguientes configuraciones manualmente:"
echo "   - apps/backend/.env"
echo "     • DATABASE_PASSWORD (si usas contraseña diferente)"
echo "     • MERCADOPAGO_* (si vas a usar pagos)"
echo "     • SENDGRID_* (si vas a enviar emails)"
echo ""
echo "2. Secrets generados automáticamente:"
echo "   • JWT_SECRET: ${JWT_SECRET:0:20}..."
echo "   • NEXTAUTH_SECRET: ${NEXTAUTH_SECRET:0:20}..."
echo "   • ENCRYPTION_KEY: ${ENCRYPTION_KEY:0:20}..."
echo ""
echo "3. Servicios necesarios:"
echo "   • Docker: docker-compose up -d postgres redis"
echo "   • Ollama: brew install ollama && ollama pull llama3:8b"
echo ""
echo "4. Siguiente paso:"
echo "   • cd apps/backend && npm install"
echo "   • npm run start:dev"
echo ""
echo "=============================================="
