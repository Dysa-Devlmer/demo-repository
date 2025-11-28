#!/bin/bash

# 🚀 ChatBotDysa Enterprise+++++ Installation Script
# Fortune 500 Military-Grade Restaurant AI System
# Compatible: Linux, macOS
# Author: ChatBotDysa Enterprise Team
# Version: 2.0.0

set -e

# Colors for beautiful output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Enterprise Banner
print_banner() {
    echo -e "${PURPLE}"
    echo "████████████████████████████████████████████████████████████████"
    echo "██                                                            ██"
    echo "██    🚀 ChatBotDysa Enterprise+++++ Installation System     ██"
    echo "██                                                            ██"
    echo "██    Fortune 500 Military-Grade Restaurant AI Platform      ██"
    echo "██    Production-Ready • Scalable • Enterprise Security      ██"
    echo "██                                                            ██"
    echo "████████████████████████████████████████████████████████████████"
    echo -e "${NC}"
    echo ""
}

# Logging system
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${CYAN}[STEP]${NC} $1"
}

# System detection
detect_system() {
    log_step "Detecting operating system..."

    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
        if command -v apt-get &> /dev/null; then
            DISTRO="ubuntu"
            PACKAGE_MANAGER="apt-get"
        elif command -v yum &> /dev/null; then
            DISTRO="centos"
            PACKAGE_MANAGER="yum"
        elif command -v dnf &> /dev/null; then
            DISTRO="fedora"
            PACKAGE_MANAGER="dnf"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
        PACKAGE_MANAGER="brew"
    else
        log_error "Unsupported operating system: $OSTYPE"
        exit 1
    fi

    log_success "Detected: $OS ($DISTRO)"
}

# Check if running as root
check_permissions() {
    if [[ $EUID -eq 0 ]]; then
        log_warning "Running as root. This is not recommended for development installations."
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Dependency verification
check_dependencies() {
    log_step "Checking system dependencies..."

    MISSING_DEPS=()

    # Check Node.js
    if ! command -v node &> /dev/null; then
        MISSING_DEPS+=("nodejs")
        log_warning "Node.js not found"
    else
        NODE_VERSION=$(node --version | sed 's/v//')
        REQUIRED_NODE="18.0.0"
        if [ "$(printf '%s\n' "$REQUIRED_NODE" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_NODE" ]; then
            log_warning "Node.js version $NODE_VERSION found, but $REQUIRED_NODE+ required"
            MISSING_DEPS+=("nodejs")
        else
            log_success "Node.js $NODE_VERSION ✓"
        fi
    fi

    # Check npm
    if ! command -v npm &> /dev/null; then
        MISSING_DEPS+=("npm")
        log_warning "npm not found"
    else
        log_success "npm $(npm --version) ✓"
    fi

    # Check PostgreSQL
    if ! command -v psql &> /dev/null; then
        MISSING_DEPS+=("postgresql")
        log_warning "PostgreSQL not found"
    else
        log_success "PostgreSQL $(psql --version | awk '{print $3}') ✓"
    fi

    # Check Redis
    if ! command -v redis-server &> /dev/null; then
        MISSING_DEPS+=("redis")
        log_warning "Redis not found"
    else
        log_success "Redis server ✓"
    fi

    # Check Git
    if ! command -v git &> /dev/null; then
        MISSING_DEPS+=("git")
        log_warning "Git not found"
    else
        log_success "Git $(git --version | awk '{print $3}') ✓"
    fi

    # Check Docker (optional but recommended)
    if ! command -v docker &> /dev/null; then
        log_warning "Docker not found (optional but recommended for production)"
    else
        log_success "Docker $(docker --version | awk '{print $3}' | sed 's/,//') ✓"
    fi

    if [ ${#MISSING_DEPS[@]} -ne 0 ]; then
        log_error "Missing dependencies: ${MISSING_DEPS[*]}"
        echo ""
        log_info "Would you like to install missing dependencies automatically? (Requires admin privileges)"
        read -p "Install dependencies? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            install_dependencies
        else
            log_error "Please install missing dependencies manually and run this script again."
            exit 1
        fi
    fi
}

# Install dependencies
install_dependencies() {
    log_step "Installing missing dependencies..."

    case $OS in
        "linux")
            case $DISTRO in
                "ubuntu")
                    sudo apt-get update
                    for dep in "${MISSING_DEPS[@]}"; do
                        case $dep in
                            "nodejs")
                                curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
                                sudo apt-get install -y nodejs
                                ;;
                            "postgresql")
                                sudo apt-get install -y postgresql postgresql-contrib
                                ;;
                            "redis")
                                sudo apt-get install -y redis-server
                                ;;
                            "git")
                                sudo apt-get install -y git
                                ;;
                        esac
                    done
                    ;;
                "centos"|"fedora")
                    for dep in "${MISSING_DEPS[@]}"; do
                        case $dep in
                            "nodejs")
                                curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
                                sudo $PACKAGE_MANAGER install -y nodejs
                                ;;
                            "postgresql")
                                sudo $PACKAGE_MANAGER install -y postgresql postgresql-server
                                ;;
                            "redis")
                                sudo $PACKAGE_MANAGER install -y redis
                                ;;
                            "git")
                                sudo $PACKAGE_MANAGER install -y git
                                ;;
                        esac
                    done
                    ;;
            esac
            ;;
        "macos")
            if ! command -v brew &> /dev/null; then
                log_info "Installing Homebrew..."
                /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            fi

            for dep in "${MISSING_DEPS[@]}"; do
                case $dep in
                    "nodejs")
                        brew install node@18
                        ;;
                    "postgresql")
                        brew install postgresql
                        ;;
                    "redis")
                        brew install redis
                        ;;
                    "git")
                        brew install git
                        ;;
                esac
            done
            ;;
    esac

    log_success "Dependencies installed successfully"
}

# Download ChatBotDysa
download_chatbotdysa() {
    log_step "Downloading ChatBotDysa Enterprise+++++ source code..."

    INSTALL_DIR="${INSTALL_DIR:-$HOME/chatbotdysa-enterprise}"

    if [ -d "$INSTALL_DIR" ]; then
        log_warning "Directory $INSTALL_DIR already exists"
        read -p "Remove existing installation? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rm -rf "$INSTALL_DIR"
        else
            log_error "Installation cancelled"
            exit 1
        fi
    fi

    # For demo purposes, we'll create the structure
    # In production, this would clone from your Git repository
    log_info "Creating installation directory: $INSTALL_DIR"
    mkdir -p "$INSTALL_DIR"
    cd "$INSTALL_DIR"

    # Simulate git clone (replace with actual repository)
    log_info "Note: In production, this would clone from your Git repository"
    log_info "For now, please copy your ChatBotDysa source code to: $INSTALL_DIR"

    export CHATBOTDYSA_ROOT="$INSTALL_DIR"
    log_success "Installation directory prepared: $INSTALL_DIR"
}

# Setup databases
setup_databases() {
    log_step "Setting up databases..."

    # PostgreSQL setup
    log_info "Configuring PostgreSQL..."

    case $OS in
        "linux")
            sudo systemctl start postgresql
            sudo systemctl enable postgresql
            ;;
        "macos")
            brew services start postgresql
            ;;
    esac

    # Create database and user
    DB_NAME="${DB_NAME:-chatbotdysa_enterprise}"
    DB_USER="${DB_USER:-chatbotdysa}"
    DB_PASSWORD="${DB_PASSWORD:-$(openssl rand -base64 32)}"

    log_info "Creating database: $DB_NAME"

    # Create user and database
    sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || true
    sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" 2>/dev/null || true
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>/dev/null || true

    # Redis setup
    log_info "Configuring Redis..."

    case $OS in
        "linux")
            sudo systemctl start redis
            sudo systemctl enable redis
            ;;
        "macos")
            brew services start redis
            ;;
    esac

    log_success "Databases configured successfully"

    # Save database credentials
    cat > "$INSTALL_DIR/.env.database" << EOF
# 🚀 ChatBotDysa Enterprise+++++ Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Database URLs
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME
REDIS_URL=redis://localhost:6379
EOF

    log_success "Database credentials saved to .env.database"
}

# Install Node.js dependencies
install_node_dependencies() {
    log_step "Installing Node.js dependencies..."

    if [ ! -d "$CHATBOTDYSA_ROOT" ]; then
        log_error "ChatBotDysa installation directory not found"
        exit 1
    fi

    cd "$CHATBOTDYSA_ROOT"

    # Install root dependencies
    log_info "Installing root dependencies..."
    npm install

    # Install backend dependencies
    if [ -d "apps/backend" ]; then
        log_info "Installing backend dependencies..."
        cd apps/backend
        npm install
        cd ../..
    fi

    # Install admin panel dependencies
    if [ -d "apps/admin-panel" ]; then
        log_info "Installing admin panel dependencies..."
        cd apps/admin-panel
        npm install
        cd ../..
    fi

    # Install web widget dependencies
    if [ -d "apps/web-widget" ]; then
        log_info "Installing web widget dependencies..."
        cd apps/web-widget
        npm install
        cd ../..
    fi

    log_success "Node.js dependencies installed successfully"
}

# Generate configuration files
generate_config() {
    log_step "Generating configuration files..."

    cd "$CHATBOTDYSA_ROOT"

    # Generate JWT secret
    JWT_SECRET=$(openssl rand -base64 64)

    # Generate encryption keys
    ENCRYPTION_KEY=$(openssl rand -base64 32)

    # Generate main .env file
    cat > ".env" << EOF
# 🚀 ChatBotDysa Enterprise+++++ Configuration
# Generated on: $(date)
# Environment: production

# Application
NODE_ENV=production
PORT=8005
APP_NAME="ChatBotDysa Enterprise"
APP_VERSION="2.0.0"

# Security
JWT_SECRET="$JWT_SECRET"
JWT_EXPIRES_IN="24h"
ENCRYPTION_KEY="$ENCRYPTION_KEY"
BCRYPT_ROUNDS=12

# CORS
CORS_ORIGIN="*"
CORS_METHODS="GET,HEAD,PUT,PATCH,POST,DELETE"
CORS_CREDENTIALS=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Database (loaded from .env.database)
$(cat .env.database)

# AI Configuration
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama2

# WhatsApp Business API (configure with your credentials)
WHATSAPP_BUSINESS_ACCOUNT_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_WEBHOOK_VERIFY_TOKEN=$(openssl rand -base64 32)
WHATSAPP_PHONE_NUMBER_ID=

# Twilio (configure with your credentials)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Email (configure with your SMTP provider)
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DEST=./uploads

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/chatbotdysa.log

# Analytics
ANALYTICS_ENABLED=true
ANALYTICS_RETENTION_DAYS=365

# Demo System
DEMO_ENABLED=true
DEMO_SESSION_DURATION=1800000

# Development/Debug
DEBUG_ENABLED=false
SWAGGER_ENABLED=true
EOF

    # Create logs directory
    mkdir -p logs uploads

    log_success "Configuration files generated successfully"
}

# Create systemd service (Linux only)
create_systemd_service() {
    if [ "$OS" != "linux" ]; then
        return
    fi

    log_step "Creating systemd service..."

    cat > "/tmp/chatbotdysa.service" << EOF
[Unit]
Description=ChatBotDysa Enterprise+++++ Application
Documentation=https://docs.chatbotdysa.com
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$CHATBOTDYSA_ROOT
Environment=NODE_ENV=production
ExecStart=/usr/bin/node apps/backend/dist/main.js
Restart=on-failure
RestartSec=10
KillMode=process

# Output to journal
StandardOutput=journal
StandardError=journal
SyslogIdentifier=chatbotdysa

# Security
NoNewPrivileges=yes
PrivateTmp=yes
ProtectSystem=strict
ProtectHome=yes
ReadWritePaths=$CHATBOTDYSA_ROOT

[Install]
WantedBy=multi-user.target
EOF

    sudo mv "/tmp/chatbotdysa.service" "/etc/systemd/system/"
    sudo systemctl daemon-reload
    sudo systemctl enable chatbotdysa

    log_success "Systemd service created and enabled"
}

# Create startup scripts
create_startup_scripts() {
    log_step "Creating startup scripts..."

    cd "$CHATBOTDYSA_ROOT"

    # Main startup script
    cat > "start.sh" << 'EOF'
#!/bin/bash

# 🚀 ChatBotDysa Enterprise+++++ Startup Script

set -e

echo "🚀 Starting ChatBotDysa Enterprise+++++ System..."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '#' | xargs)
fi

# Check if database is running
if ! pg_isready -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-chatbotdysa} >/dev/null 2>&1; then
    echo "❌ PostgreSQL is not running or not accessible"
    exit 1
fi

# Check if Redis is running
if ! redis-cli -h ${REDIS_HOST:-localhost} -p ${REDIS_PORT:-6379} ping >/dev/null 2>&1; then
    echo "❌ Redis is not running or not accessible"
    exit 1
fi

echo "✅ Database connections verified"

# Build the application
echo "📦 Building application..."
npm run build:all

# Run database migrations
echo "🗄️ Running database migrations..."
cd apps/backend
npm run migration:run
cd ../..

# Start all services
echo "🚀 Starting services..."

# Start backend
cd apps/backend
npm run start:prod &
BACKEND_PID=$!
cd ../..

# Start admin panel
cd apps/admin-panel
npm run start &
ADMIN_PID=$!
cd ../..

# Start web widget
cd apps/web-widget
npm run start &
WIDGET_PID=$!
cd ../..

echo "✅ ChatBotDysa Enterprise+++++ started successfully!"
echo "📊 Backend running on port 8005"
echo "🎛️ Admin Panel running on port 8001"
echo "🔗 Web Widget running on port 8002"
echo ""
echo "💡 Use 'stop.sh' to stop all services"

# Save PIDs for stop script
echo "$BACKEND_PID $ADMIN_PID $WIDGET_PID" > .pids

# Wait for services
wait
EOF

    # Stop script
    cat > "stop.sh" << 'EOF'
#!/bin/bash

# 🚀 ChatBotDysa Enterprise+++++ Stop Script

echo "🛑 Stopping ChatBotDysa Enterprise+++++ System..."

if [ -f .pids ]; then
    read -r BACKEND_PID ADMIN_PID WIDGET_PID < .pids

    echo "Stopping Backend (PID: $BACKEND_PID)..."
    kill $BACKEND_PID 2>/dev/null || true

    echo "Stopping Admin Panel (PID: $ADMIN_PID)..."
    kill $ADMIN_PID 2>/dev/null || true

    echo "Stopping Web Widget (PID: $WIDGET_PID)..."
    kill $WIDGET_PID 2>/dev/null || true

    rm .pids
fi

# Kill any remaining Node processes related to ChatBotDysa
pkill -f "chatbotdysa\|backend\|admin-panel\|web-widget" 2>/dev/null || true

echo "✅ All services stopped"
EOF

    # Development script
    cat > "dev.sh" << 'EOF'
#!/bin/bash

# 🚀 ChatBotDysa Enterprise+++++ Development Script

set -e

echo "🔧 Starting ChatBotDysa Enterprise+++++ in Development Mode..."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '#' | xargs)
fi

# Set development environment
export NODE_ENV=development

# Start services in development mode
echo "🚀 Starting development servers..."

# Start backend in watch mode
cd apps/backend
npm run start:dev &
BACKEND_PID=$!
cd ../..

# Start admin panel in development mode
cd apps/admin-panel
npm run dev &
ADMIN_PID=$!
cd ../..

# Start web widget in development mode
cd apps/web-widget
npm run dev &
WIDGET_PID=$!
cd ../..

echo "✅ Development environment started!"
echo "📊 Backend: http://localhost:8005"
echo "🎛️ Admin Panel: http://localhost:8001"
echo "🔗 Web Widget: http://localhost:8002"
echo ""
echo "💡 Press Ctrl+C to stop all services"

# Save PIDs
echo "$BACKEND_PID $ADMIN_PID $WIDGET_PID" > .dev-pids

# Handle Ctrl+C
trap 'echo ""; echo "🛑 Stopping development servers..."; kill $BACKEND_PID $ADMIN_PID $WIDGET_PID 2>/dev/null; rm -f .dev-pids; exit' INT

# Wait for services
wait
EOF

    # Make scripts executable
    chmod +x start.sh stop.sh dev.sh

    log_success "Startup scripts created successfully"
}

# Run installation tests
run_tests() {
    log_step "Running installation verification tests..."

    cd "$CHATBOTDYSA_ROOT"

    # Test database connection
    log_info "Testing database connection..."
    if pg_isready -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-chatbotdysa} >/dev/null 2>&1; then
        log_success "PostgreSQL connection ✓"
    else
        log_error "PostgreSQL connection failed"
        return 1
    fi

    # Test Redis connection
    log_info "Testing Redis connection..."
    if redis-cli -h ${REDIS_HOST:-localhost} -p ${REDIS_PORT:-6379} ping >/dev/null 2>&1; then
        log_success "Redis connection ✓"
    else
        log_error "Redis connection failed"
        return 1
    fi

    # Test Node.js dependencies
    log_info "Testing Node.js dependencies..."
    if npm list --depth=0 >/dev/null 2>&1; then
        log_success "Node.js dependencies ✓"
    else
        log_warning "Some Node.js dependencies may have issues"
    fi

    log_success "Installation verification completed"
}

# Print installation summary
print_summary() {
    echo ""
    echo -e "${GREEN}████████████████████████████████████████████████████████████████${NC}"
    echo -e "${GREEN}██                                                            ██${NC}"
    echo -e "${GREEN}██    🎉 ChatBotDysa Enterprise+++++ Installation Complete!  ██${NC}"
    echo -e "${GREEN}██                                                            ██${NC}"
    echo -e "${GREEN}████████████████████████████████████████████████████████████████${NC}"
    echo ""

    log_success "Installation completed successfully!"
    echo ""

    echo -e "${CYAN}📁 Installation Directory:${NC} $CHATBOTDYSA_ROOT"
    echo -e "${CYAN}🗄️ Database:${NC} $DB_NAME"
    echo -e "${CYAN}👤 Database User:${NC} $DB_USER"
    echo ""

    echo -e "${YELLOW}🚀 Quick Start Commands:${NC}"
    echo "  cd $CHATBOTDYSA_ROOT"
    echo "  ./start.sh              # Start in production mode"
    echo "  ./dev.sh                # Start in development mode"
    echo "  ./stop.sh               # Stop all services"
    echo ""

    echo -e "${YELLOW}🌐 Access URLs:${NC}"
    echo "  Backend API:    http://localhost:8005"
    echo "  Admin Panel:    http://localhost:8001"
    echo "  Web Widget:     http://localhost:8002"
    echo "  Health Check:   http://localhost:8005/health"
    echo ""

    echo -e "${YELLOW}📚 Documentation:${NC}"
    echo "  Configuration:  $CHATBOTDYSA_ROOT/.env"
    echo "  Database Info:  $CHATBOTDYSA_ROOT/.env.database"
    echo "  Logs:          $CHATBOTDYSA_ROOT/logs/"
    echo ""

    if [ "$OS" == "linux" ]; then
        echo -e "${YELLOW}🔧 System Service:${NC}"
        echo "  sudo systemctl start chatbotdysa"
        echo "  sudo systemctl stop chatbotdysa"
        echo "  sudo systemctl status chatbotdysa"
        echo ""
    fi

    echo -e "${GREEN}✨ Ready for Fortune 500 Enterprise deployment!${NC}"
    echo ""
}

# Main installation function
main() {
    print_banner

    log_info "Starting ChatBotDysa Enterprise+++++ installation..."
    log_info "This will install a complete restaurant AI management system."
    echo ""

    # Get installation preferences
    read -p "Installation directory [$HOME/chatbotdysa-enterprise]: " INSTALL_DIR
    INSTALL_DIR="${INSTALL_DIR:-$HOME/chatbotdysa-enterprise}"

    echo ""
    log_info "Starting installation with the following settings:"
    log_info "Installation directory: $INSTALL_DIR"
    echo ""

    read -p "Proceed with installation? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Installation cancelled by user."
        exit 0
    fi

    # Run installation steps
    detect_system
    check_permissions
    check_dependencies
    download_chatbotdysa
    setup_databases
    install_node_dependencies
    generate_config
    create_systemd_service
    create_startup_scripts
    run_tests
    print_summary

    log_success "🚀 ChatBotDysa Enterprise+++++ installation completed successfully!"
}

# Run main function
main "$@"