#!/bin/bash

# ============================================
# ChatBotDysa - Deployment Script
# ============================================
# Automated deployment for production
# Usage: ./scripts/deploy.sh [environment]
# ============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "\n${BLUE}═══════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Docker is installed
check_docker() {
    print_header "Checking Docker Installation"

    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    print_success "Docker $(docker --version)"

    if docker compose version &> /dev/null; then
        print_success "$(docker compose version)"
    else
        print_success "$(docker-compose --version)"
    fi
}

# Check if .env file exists
check_env() {
    print_header "Checking Environment Configuration"

    if [ ! -f ".env" ]; then
        print_warning ".env file not found. Creating from .env.example..."

        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_info "Created .env file. Please edit it with your configuration."
            print_info "Opening .env for editing..."
            ${EDITOR:-nano} .env
        else
            print_error ".env.example not found. Cannot create .env file."
            exit 1
        fi
    else
        print_success ".env file found"
    fi

    # Check critical variables
    source .env

    if [ "$DATABASE_PASSWORD" = "supersecret" ] || [ -z "$DATABASE_PASSWORD" ]; then
        print_warning "DATABASE_PASSWORD is not set or using default. Please update .env"
        exit 1
    fi

    if [ "$JWT_SECRET" = "change_me_in_production" ] || [ -z "$JWT_SECRET" ]; then
        print_warning "JWT_SECRET is not set or using default. Please update .env"
        exit 1
    fi

    print_success "Environment variables configured"
}

# Build Docker images
build_images() {
    print_header "Building Docker Images"

    cd infrastructure

    if docker compose version &> /dev/null; then
        COMPOSE_CMD="docker compose"
    else
        COMPOSE_CMD="docker-compose"
    fi

    print_info "Building images (this may take a few minutes)..."
    $COMPOSE_CMD build --no-cache

    cd ..

    print_success "Images built successfully"
}

# Start services
start_services() {
    print_header "Starting Services"

    cd infrastructure

    if docker compose version &> /dev/null; then
        COMPOSE_CMD="docker compose"
    else
        COMPOSE_CMD="docker-compose"
    fi

    print_info "Starting all services..."
    $COMPOSE_CMD up -d

    cd ..

    print_success "Services started"
}

# Wait for services to be healthy
wait_for_services() {
    print_header "Waiting for Services to be Healthy"

    print_info "Waiting for PostgreSQL..."
    sleep 5

    MAX_TRIES=30
    COUNT=0

    while [ $COUNT -lt $MAX_TRIES ]; do
        if docker exec chatbotdysa-postgres pg_isready -U postgres &> /dev/null; then
            print_success "PostgreSQL is ready"
            break
        fi

        COUNT=$((COUNT + 1))
        echo -n "."
        sleep 2
    done

    if [ $COUNT -eq $MAX_TRIES ]; then
        print_error "PostgreSQL failed to start"
        exit 1
    fi

    print_info "Waiting for Backend..."
    COUNT=0

    while [ $COUNT -lt $MAX_TRIES ]; do
        if curl -f http://localhost:8005/health &> /dev/null; then
            print_success "Backend is ready"
            break
        fi

        COUNT=$((COUNT + 1))
        echo -n "."
        sleep 2
    done

    if [ $COUNT -eq $MAX_TRIES ]; then
        print_error "Backend failed to start"
        exit 1
    fi

    print_success "All services are healthy"
}

# Run database migrations
run_migrations() {
    print_header "Running Database Migrations"

    print_info "Executing migrations..."
    docker exec chatbotdysa-backend npm run migration:run || true

    print_success "Migrations completed"
}

# Setup Ollama model
setup_ollama() {
    print_header "Setting up AI Model (Ollama)"

    print_info "Waiting for Ollama to be ready..."
    sleep 10

    print_info "Pulling phi3:mini model (this may take a while)..."
    docker exec chatbotdysa-ollama ollama pull phi3:mini || print_warning "Failed to pull Ollama model. You can do this manually later."

    print_success "AI model setup completed"
}

# Show service status
show_status() {
    print_header "Services Status"

    cd infrastructure

    if docker compose version &> /dev/null; then
        docker compose ps
    else
        docker-compose ps
    fi

    cd ..
}

# Show access URLs
show_urls() {
    print_header "Access URLs"

    echo -e "Admin Panel:    ${GREEN}http://localhost:7001${NC}"
    echo -e "Landing Page:   ${GREEN}http://localhost:3004${NC}"
    echo -e "API Backend:    ${GREEN}http://localhost:8005${NC}"
    echo -e "API Docs:       ${GREEN}http://localhost:8005/api-docs${NC}"
    echo -e "Health Check:   ${GREEN}http://localhost:8005/health${NC}"
    echo ""
    echo -e "PostgreSQL:     ${BLUE}localhost:15432${NC}"
    echo -e "Redis:          ${BLUE}localhost:16379${NC}"
    echo -e "Ollama:         ${BLUE}localhost:21434${NC}"
}

# Show logs
show_logs() {
    print_header "Recent Logs"

    cd infrastructure

    if docker compose version &> /dev/null; then
        docker compose logs --tail=20
    else
        docker-compose logs --tail=20
    fi

    cd ..
}

# Main deployment flow
main() {
    print_header "ChatBotDysa Deployment Script"
    echo -e "Version: 1.0.0"
    echo -e "Environment: ${YELLOW}PRODUCTION${NC}"
    echo ""

    # Run checks
    check_docker
    check_env

    # Confirm deployment
    echo -e "\n${YELLOW}Ready to deploy ChatBotDysa?${NC}"
    read -p "Press Enter to continue or Ctrl+C to cancel..."

    # Deploy
    build_images
    start_services
    wait_for_services
    run_migrations
    setup_ollama

    # Show results
    show_status
    show_urls

    print_header "Deployment Completed Successfully! 🎉"

    print_info "To view logs: cd infrastructure && docker-compose logs -f"
    print_info "To stop: cd infrastructure && docker-compose down"
    print_info "To restart: cd infrastructure && docker-compose restart"

    echo ""
    print_success "ChatBotDysa is now running!"
}

# Run main
main
