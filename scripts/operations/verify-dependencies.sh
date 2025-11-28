#!/bin/bash
# =============================================================================
# 🚀 CHATBOTDYSA ENTERPRISE+++++ DEPENDENCY VERIFICATION
# Fortune 500 System Readiness Checker
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Enterprise Version
ENTERPRISE_VERSION="1.0.0"
MIN_NODE_VERSION="18.0.0"
MIN_NPM_VERSION="8.0.0"
REQUIRED_POSTGRES_VERSION="13"
REQUIRED_REDIS_VERSION="6"

# Status tracking
TOTAL_CHECKS=0
PASSED_CHECKS=0
WARNINGS=0
ERRORS=()

echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                     CHATBOTDYSA ENTERPRISE+++++                              ║${NC}"
echo -e "${PURPLE}║                   DEPENDENCY VERIFICATION SYSTEM                            ║${NC}"
echo -e "${PURPLE}║                        Fortune 500 Ready                                    ║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Utility functions
log_check() {
    ((TOTAL_CHECKS++))
    echo -e "${BLUE}[CHECK $TOTAL_CHECKS]${NC} $1"
}

log_success() {
    ((PASSED_CHECKS++))
    echo -e "${GREEN}  ✅ PASS:${NC} $1"
}

log_warning() {
    ((WARNINGS++))
    echo -e "${YELLOW}  ⚠️  WARN:${NC} $1"
}

log_error() {
    ERRORS+=("$1")
    echo -e "${RED}  ❌ FAIL:${NC} $1"
}

log_info() {
    echo -e "${CYAN}  ℹ️  INFO:${NC} $1"
}

# Version comparison function
version_compare() {
    if [[ $1 == $2 ]]; then
        return 0
    fi
    local IFS=.
    local i ver1=($1) ver2=($2)
    # fill empty fields in ver1 with zeros
    for ((i=${#ver1[@]}; i<${#ver2[@]}; i++)); do
        ver1[i]=0
    done
    for ((i=0; i<${#ver1[@]}; i++)); do
        if [[ -z ${ver2[i]} ]]; then
            # fill empty fields in ver2 with zeros
            ver2[i]=0
        fi
        if ((10#${ver1[i]} > 10#${ver2[i]})); then
            return 1
        fi
        if ((10#${ver1[i]} < 10#${ver2[i]})); then
            return 2
        fi
    done
    return 0
}

# Check Node.js
check_nodejs() {
    log_check "Node.js Installation and Version"

    if command -v node >/dev/null 2>&1; then
        local node_version=$(node --version | sed 's/v//')
        log_info "Found Node.js version: $node_version"

        version_compare $node_version $MIN_NODE_VERSION
        case $? in
            0|1) log_success "Node.js version is compatible (>= $MIN_NODE_VERSION)" ;;
            2) log_error "Node.js version $node_version is below minimum required $MIN_NODE_VERSION" ;;
        esac
    else
        log_error "Node.js not found. Please install Node.js >= $MIN_NODE_VERSION"
    fi
}

# Check NPM
check_npm() {
    log_check "NPM Installation and Version"

    if command -v npm >/dev/null 2>&1; then
        local npm_version=$(npm --version)
        log_info "Found NPM version: $npm_version"

        version_compare $npm_version $MIN_NPM_VERSION
        case $? in
            0|1) log_success "NPM version is compatible (>= $MIN_NPM_VERSION)" ;;
            2) log_error "NPM version $npm_version is below minimum required $MIN_NPM_VERSION" ;;
        esac
    else
        log_error "NPM not found. Please install NPM >= $MIN_NPM_VERSION"
    fi
}

# Check PostgreSQL
check_postgresql() {
    log_check "PostgreSQL Installation and Service"

    if command -v psql >/dev/null 2>&1; then
        local pg_version=$(psql --version | grep -oP '\d+\.\d+' | head -1)
        log_info "Found PostgreSQL version: $pg_version"

        if (( $(echo "$pg_version >= $REQUIRED_POSTGRES_VERSION" | bc -l) )); then
            log_success "PostgreSQL version is compatible (>= $REQUIRED_POSTGRES_VERSION)"
        else
            log_error "PostgreSQL version $pg_version is below minimum required $REQUIRED_POSTGRES_VERSION"
        fi

        # Check if PostgreSQL service is running
        if systemctl is-active --quiet postgresql 2>/dev/null || brew services list | grep postgresql | grep started >/dev/null 2>&1; then
            log_success "PostgreSQL service is running"
        else
            log_warning "PostgreSQL service is not running"
        fi
    else
        log_error "PostgreSQL not found. Please install PostgreSQL >= $REQUIRED_POSTGRES_VERSION"
    fi
}

# Check Redis
check_redis() {
    log_check "Redis Installation and Service"

    if command -v redis-server >/dev/null 2>&1; then
        local redis_version=$(redis-server --version | grep -oP 'v=\K\d+\.\d+' | head -1)
        log_info "Found Redis version: $redis_version"

        if (( $(echo "$redis_version >= $REQUIRED_REDIS_VERSION" | bc -l) )); then
            log_success "Redis version is compatible (>= $REQUIRED_REDIS_VERSION)"
        else
            log_error "Redis version $redis_version is below minimum required $REQUIRED_REDIS_VERSION"
        fi

        # Check if Redis service is running
        if systemctl is-active --quiet redis 2>/dev/null || brew services list | grep redis | grep started >/dev/null 2>&1; then
            log_success "Redis service is running"
        else
            log_warning "Redis service is not running"
        fi
    else
        log_error "Redis not found. Please install Redis >= $REQUIRED_REDIS_VERSION"
    fi
}

# Check Git
check_git() {
    log_check "Git Installation"

    if command -v git >/dev/null 2>&1; then
        local git_version=$(git --version | grep -oP '\d+\.\d+\.\d+')
        log_info "Found Git version: $git_version"
        log_success "Git is installed and available"
    else
        log_error "Git not found. Please install Git"
    fi
}

# Check system requirements
check_system_requirements() {
    log_check "System Requirements"

    # Check available memory
    local total_memory
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        total_memory=$(free -m | awk 'NR==2{printf "%.0f", $2/1024}')
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        total_memory=$(echo "$(sysctl -n hw.memsize) / 1024 / 1024 / 1024" | bc)
    fi

    log_info "Total system memory: ${total_memory}GB"

    if (( total_memory >= 4 )); then
        log_success "Sufficient memory available (>= 4GB)"
    else
        log_warning "Low memory detected. Recommend at least 4GB for optimal performance"
    fi

    # Check available disk space
    local available_space=$(df . | tail -1 | awk '{print $4}')
    local available_space_gb=$((available_space / 1024 / 1024))

    log_info "Available disk space: ${available_space_gb}GB"

    if (( available_space_gb >= 10 )); then
        log_success "Sufficient disk space available (>= 10GB)"
    else
        log_error "Insufficient disk space. Need at least 10GB free"
    fi
}

# Check project dependencies
check_project_dependencies() {
    log_check "ChatBotDysa Project Dependencies"

    # Check if package.json exists
    if [[ -f "package.json" ]]; then
        log_success "package.json found"

        # Check if node_modules exists
        if [[ -d "node_modules" ]]; then
            log_success "node_modules directory exists"
        else
            log_warning "node_modules not found. Run 'npm install' to install dependencies"
        fi

        # Check specific enterprise dependencies
        local deps=("@nestjs/core" "@nestjs/common" "typeorm" "pg" "redis" "jsonwebtoken" "bcryptjs")
        for dep in "${deps[@]}"; do
            if npm list $dep >/dev/null 2>&1; then
                log_success "Enterprise dependency '$dep' is installed"
            else
                log_error "Missing enterprise dependency: $dep"
            fi
        done
    else
        log_error "package.json not found. Please run this script from the ChatBotDysa root directory"
    fi
}

# Check network connectivity
check_network() {
    log_check "Network Connectivity"

    # Check if we can reach common package registries
    if curl -s --max-time 5 https://registry.npmjs.org/ >/dev/null; then
        log_success "NPM registry is reachable"
    else
        log_warning "Cannot reach NPM registry. May affect package installation"
    fi

    if curl -s --max-time 5 https://github.com >/dev/null; then
        log_success "GitHub is reachable"
    else
        log_warning "Cannot reach GitHub. May affect Git operations"
    fi
}

# Check ports availability
check_ports() {
    log_check "Required Ports Availability"

    local ports=(8001 8002 8005 5432 6379)
    local port_names=("Admin Panel" "Web Widget" "Backend API" "PostgreSQL" "Redis")

    for i in "${!ports[@]}"; do
        local port=${ports[i]}
        local name=${port_names[i]}

        if lsof -i :$port >/dev/null 2>&1; then
            log_warning "Port $port ($name) is already in use"
        else
            log_success "Port $port ($name) is available"
        fi
    done
}

# Check environment configuration
check_environment() {
    log_check "Environment Configuration"

    if [[ -f ".env" ]]; then
        log_success ".env file exists"

        # Check for required environment variables
        local required_vars=("DATABASE_URL" "JWT_SECRET" "REDIS_URL")
        for var in "${required_vars[@]}"; do
            if grep -q "^$var=" .env; then
                log_success "Environment variable '$var' is configured"
            else
                log_error "Missing environment variable: $var"
            fi
        done
    else
        log_error ".env file not found. Please create environment configuration"
    fi
}

# Main execution
main() {
    echo -e "${WHITE}Starting Enterprise+++++ dependency verification...${NC}"
    echo ""

    check_nodejs
    echo ""

    check_npm
    echo ""

    check_postgresql
    echo ""

    check_redis
    echo ""

    check_git
    echo ""

    check_system_requirements
    echo ""

    check_project_dependencies
    echo ""

    check_network
    echo ""

    check_ports
    echo ""

    check_environment
    echo ""

    # Final report
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║                           VERIFICATION REPORT                               ║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    echo -e "${WHITE}📊 SUMMARY:${NC}"
    echo -e "   Total Checks: $TOTAL_CHECKS"
    echo -e "   ${GREEN}Passed: $PASSED_CHECKS${NC}"
    echo -e "   ${YELLOW}Warnings: $WARNINGS${NC}"
    echo -e "   ${RED}Errors: ${#ERRORS[@]}${NC}"
    echo ""

    if [[ ${#ERRORS[@]} -eq 0 ]]; then
        echo -e "${GREEN}🎉 ENTERPRISE+++++ SYSTEM READY!${NC}"
        echo -e "${GREEN}   All critical dependencies are satisfied.${NC}"
        echo -e "${GREEN}   ChatBotDysa is ready for Fortune 500 deployment.${NC}"

        if [[ $WARNINGS -gt 0 ]]; then
            echo -e "${YELLOW}   ⚠️  Some warnings detected. Review for optimal performance.${NC}"
        fi

        exit 0
    else
        echo -e "${RED}❌ ENTERPRISE READINESS FAILED${NC}"
        echo -e "${RED}   Critical issues must be resolved:${NC}"
        echo ""

        for error in "${ERRORS[@]}"; do
            echo -e "${RED}   • $error${NC}"
        done

        echo ""
        echo -e "${WHITE}🔧 RECOMMENDED ACTIONS:${NC}"
        echo -e "   1. Run the installation script: ./install.sh"
        echo -e "   2. Install missing dependencies manually"
        echo -e "   3. Re-run this verification: ./verify-dependencies.sh"

        exit 1
    fi
}

# Check if bc is available for version comparisons
if ! command -v bc >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Warning: 'bc' calculator not found. Some version checks may be skipped.${NC}"
    echo "   Install bc: apt-get install bc (Ubuntu/Debian) or brew install bc (macOS)"
    echo ""
fi

# Run main function
main "$@"