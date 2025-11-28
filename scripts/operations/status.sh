#!/bin/bash

# ChatBotDysa - Verificador de Estado del Sistema
echo "🤖 CHATBOTDYSA - ESTADO DEL SISTEMA"
echo "==================================="

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${BLUE}📊 SERVICIOS DOCKER:${NC}"
docker-compose -f docker-compose.production.yml ps

echo ""
echo -e "${BLUE}🐳 CONTENEDORES:${NC}"
docker ps --filter "name=chatbotdysa" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo -e "${BLUE}💾 RECURSOS:${NC}"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

echo ""
echo -e "${BLUE}🌐 ENDPOINTS DISPONIBLES:${NC}"
echo "• API Backend: http://localhost:3000"
echo "• Health Check: http://localhost:3000/health"
echo "• IA Chat: http://localhost:3000/api/ai"
echo "• WhatsApp Webhook: http://localhost:3000/api/whatsapp"

echo ""
echo -e "${BLUE}🔍 VERIFICACIÓN DE CONECTIVIDAD:${NC}"

# Verificar API Backend
if curl -s http://localhost:3000/health > /dev/null; then
    echo -e "${GREEN}✅ Backend API: Online${NC}"
else
    echo -e "${RED}❌ Backend API: Offline${NC}"
fi

# Verificar PostgreSQL
if docker-compose -f docker-compose.production.yml exec -T postgres pg_isready -U postgres -d chatbotdysa &> /dev/null; then
    echo -e "${GREEN}✅ PostgreSQL: Conectado${NC}"
else
    echo -e "${RED}❌ PostgreSQL: Desconectado${NC}"
fi

# Verificar Redis
if docker-compose -f docker-compose.production.yml exec -T redis redis-cli ping &> /dev/null; then
    echo -e "${GREEN}✅ Redis: Conectado${NC}"
else
    echo -e "${RED}❌ Redis: Desconectado${NC}"
fi

# Verificar Ollama
if curl -s http://localhost:11434/api/version > /dev/null; then
    echo -e "${GREEN}✅ Ollama IA: Conectado${NC}"
else
    echo -e "${RED}❌ Ollama IA: Desconectado${NC}"
fi

echo ""
echo -e "${BLUE}📋 LOGS RECIENTES:${NC}"
echo "Para ver logs en tiempo real:"
echo "  docker-compose -f docker-compose.production.yml logs -f backend"
echo "  docker-compose -f docker-compose.production.yml logs -f postgres"
echo "  docker-compose -f docker-compose.production.yml logs -f ollama"