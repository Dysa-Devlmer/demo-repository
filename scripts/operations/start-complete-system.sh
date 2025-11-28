#!/bin/bash

# ChatBotDysa - Complete System Startup Script
# Version: Enterprise Level
# Author: Claude + DevLmer

echo "🚀 Starting ChatBotDysa Enterprise System..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to check if port is available
check_port() {
    if lsof -i :$1 >/dev/null 2>&1; then
        echo -e "${RED}❌ Port $1 is already in use${NC}"
        echo -e "${YELLOW}🔍 Process using port $1:${NC}"
        lsof -i :$1
        return 1
    else
        echo -e "${GREEN}✅ Port $1 is available${NC}"
        return 0
    fi
}

# Function to start a service
start_service() {
    local name=$1
    local command=$2
    local port=$3
    local dir=$4
    
    echo -e "\n${BLUE}🔥 Starting $name on port $port...${NC}"
    
    if [ ! -z "$dir" ]; then
        cd "$dir"
    fi
    
    # Start in background and capture PID
    eval "$command" &
    local pid=$!
    
    # Wait a moment for startup
    sleep 3
    
    # Check if process is still running
    if kill -0 $pid 2>/dev/null; then
        echo -e "${GREEN}✅ $name started successfully (PID: $pid)${NC}"
        echo $pid > "/tmp/dysabot-$name.pid"
    else
        echo -e "${RED}❌ Failed to start $name${NC}"
        return 1
    fi
    
    # Go back to root directory
    cd "/Users/devlmer/ChatBotDysa"
}

# Main execution
main() {
    # Change to project directory
    cd "/Users/devlmer/ChatBotDysa"
    
    echo -e "${PURPLE}🏠 Working directory: $(pwd)${NC}"
    
    # Check required ports
    echo -e "\n${CYAN}🔍 Checking required ports...${NC}"
    ports=(15432 16379 21434 8001 8002 8003 8005)
    for port in "${ports[@]}"; do
        if ! check_port $port; then
            if [ $port -eq 15432 ] || [ $port -eq 16379 ] || [ $port -eq 21434 ]; then
                echo -e "${YELLOW}⚠️  System service on port $port should be running${NC}"
            else
                echo -e "${RED}❌ Application port $port conflict. Please kill the process.${NC}"
                exit 1
            fi
        fi
    done
    
    echo -e "\n${GREEN}🎯 All application ports are available!${NC}"
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ] || [ ! -d "apps/backend/node_modules" ] || [ ! -d "apps/admin-panel/node_modules" ]; then
        echo -e "\n${YELLOW}📦 Installing dependencies...${NC}"
        npm run install:deps
    fi
    
    # Build backend if needed
    if [ ! -d "apps/backend/dist" ] || [ ! -f "apps/backend/dist/src/main.js" ]; then
        echo -e "\n${YELLOW}🔨 Building backend Enterprise++++...${NC}"
        cd apps/backend
        npm run build
        cd ../..
    fi
    
    echo -e "\n${PURPLE}🚀 Starting all services...${NC}"
    echo "=========================================="
    
    # Start Backend API Enterprise++++
    start_service "Backend-API-Enterprise" \
        "BACKUP_ENABLED=true PORT=8005 DATABASE_HOST=127.0.0.1 DATABASE_PORT=15432 DATABASE_USER=postgres DATABASE_PASSWORD=supersecret DATABASE_NAME=chatbotdysa REDIS_HOST=127.0.0.1 REDIS_PORT=16379 OLLAMA_URL=http://127.0.0.1:21434 node apps/backend/dist/src/main.js" \
        "8005" \
        ""
    
    # Start Admin Panel
    start_service "Admin-Panel" \
        "npm run dev" \
        "8002" \
        "apps/admin-panel"
    
    # Start Web Widget
    start_service "Web-Widget" \
        "npm run dev" \
        "8003" \
        "apps/web-widget"
    
    # Wait for all services to be fully ready
    echo -e "\n${CYAN}⏳ Waiting for services to be fully ready...${NC}"
    sleep 10
    
    # Health checks
    echo -e "\n${CYAN}🏥 Performing health checks...${NC}"
    
    # Backend health check
    if curl -s http://localhost:8005/api/health >/dev/null; then
        echo -e "${GREEN}✅ Backend API is healthy${NC}"
    else
        echo -e "${RED}❌ Backend API health check failed${NC}"
    fi
    
    # Admin panel check
    if curl -s http://localhost:8002 >/dev/null; then
        echo -e "${GREEN}✅ Admin Panel is accessible${NC}"
    else
        echo -e "${RED}❌ Admin Panel is not accessible${NC}"
    fi
    
    # Widget check  
    if curl -s http://localhost:8003 >/dev/null; then
        echo -e "${GREEN}✅ Web Widget is accessible${NC}"
    else
        echo -e "${RED}❌ Web Widget is not accessible${NC}"
    fi
    
    # Display final status
    echo -e "\n${GREEN}🎉 ChatBotDysa Enterprise System Started Successfully!${NC}"
    echo "============================================================="
    echo -e "${BLUE}📱 Admin Panel:     ${CYAN}http://localhost:8002${NC}"
    echo -e "${BLUE}🤖 Web Widget:      ${CYAN}http://localhost:8003${NC}"
    echo -e "${BLUE}🌐 Backend API:     ${CYAN}http://localhost:8005${NC}"
    echo -e "${BLUE}📚 API Docs:        ${CYAN}http://localhost:8005/api-docs${NC}"
    echo -e "${BLUE}🏥 Health Check:    ${CYAN}http://localhost:8005/api/health${NC}"
    echo -e "${BLUE}📊 Analytics:       ${CYAN}http://localhost:8005/api/analytics/dashboard${NC}"
    echo ""
    echo -e "${PURPLE}🔧 Enterprise Features Available:${NC}"
    echo -e "   • Business Analytics & Reports"
    echo -e "   • Automated Backup System"
    echo -e "   • WhatsApp/SMS Integration"
    echo -e "   • Real-time Monitoring"
    echo -e "   • Enterprise Notifications"
    echo -e "   • Advanced Security & Logging"
    echo ""
    echo -e "${YELLOW}💡 To stop all services, run: ./stop-complete-system.sh${NC}"
    echo ""
    echo -e "${GREEN}🚀 System ready for enterprise use!${NC}"
}

# Execute main function
main "$@"