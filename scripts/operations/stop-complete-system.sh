#!/bin/bash

# ChatBotDysa - Complete System Stop Script
# Version: Enterprise Level

echo "🛑 Stopping ChatBotDysa Enterprise System..."
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Function to stop service by PID file
stop_service_by_pid() {
    local name=$1
    local pid_file="/tmp/dysabot-$name.pid"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 $pid 2>/dev/null; then
            echo -e "${YELLOW}🛑 Stopping $name (PID: $pid)...${NC}"
            kill -TERM $pid
            sleep 2
            if kill -0 $pid 2>/dev/null; then
                echo -e "${RED}⚠️  Force killing $name (PID: $pid)${NC}"
                kill -KILL $pid
            fi
            echo -e "${GREEN}✅ $name stopped${NC}"
        else
            echo -e "${YELLOW}⚠️  $name was not running${NC}"
        fi
        rm -f "$pid_file"
    else
        echo -e "${YELLOW}⚠️  No PID file found for $name${NC}"
    fi
}

# Function to stop service by port
stop_service_by_port() {
    local name=$1
    local port=$2
    
    echo -e "${YELLOW}🔍 Checking for processes on port $port...${NC}"
    local pids=$(lsof -ti :$port 2>/dev/null)
    
    if [ ! -z "$pids" ]; then
        echo -e "${YELLOW}🛑 Stopping $name on port $port...${NC}"
        echo "$pids" | xargs kill -TERM 2>/dev/null
        sleep 2
        
        # Force kill if still running
        local remaining_pids=$(lsof -ti :$port 2>/dev/null)
        if [ ! -z "$remaining_pids" ]; then
            echo -e "${RED}⚠️  Force killing processes on port $port${NC}"
            echo "$remaining_pids" | xargs kill -KILL 2>/dev/null
        fi
        echo -e "${GREEN}✅ $name stopped${NC}"
    else
        echo -e "${GREEN}✅ No processes found on port $port${NC}"
    fi
}

# Main execution
main() {
    echo -e "${PURPLE}🏠 Working directory: $(pwd)${NC}"
    
    # Stop by PID files first (more graceful)
    echo -e "\n${BLUE}📋 Stopping services by PID...${NC}"
    stop_service_by_pid "Backend-API"
    stop_service_by_pid "Admin-Panel"  
    stop_service_by_pid "Web-Widget"
    
    # Wait a moment
    sleep 2
    
    # Stop by ports (cleanup any remaining processes)
    echo -e "\n${BLUE}🔌 Stopping services by port...${NC}"
    stop_service_by_port "Backend-API" "8005"
    stop_service_by_port "Admin-Panel" "8002"
    stop_service_by_port "Web-Widget" "8003"
    
    # Clean up any remaining Node.js processes related to the project
    echo -e "\n${BLUE}🧹 Cleaning up ChatBotDysa processes...${NC}"
    pkill -f "ChatBotDysa" 2>/dev/null || true
    pkill -f "dysabot" 2>/dev/null || true
    pkill -f "apps/backend/dist/main-simple.js" 2>/dev/null || true
    
    # Clean up PID files
    rm -f /tmp/dysabot-*.pid 2>/dev/null || true
    
    # Final port check
    echo -e "\n${BLUE}🔍 Final port check...${NC}"
    for port in 8001 8002 8003 8005; do
        if lsof -i :$port >/dev/null 2>&1; then
            echo -e "${YELLOW}⚠️  Port $port still in use:${NC}"
            lsof -i :$port
        else
            echo -e "${GREEN}✅ Port $port is free${NC}"
        fi
    done
    
    echo -e "\n${GREEN}🎉 ChatBotDysa Enterprise System stopped successfully!${NC}"
    echo -e "${BLUE}💡 To start the system again, run: ./start-complete-system.sh${NC}"
    echo ""
}

# Execute main function
main "$@"