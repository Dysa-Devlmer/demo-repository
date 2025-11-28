#!/bin/bash

# ============================================
# ChatBotDysa - Let's Encrypt SSL Setup
# ============================================
# Configures SSL certificates for production
# Usage: ./scripts/setup-letsencrypt.sh <domain> <email>
# ============================================

set -e

DOMAIN=$1
EMAIL=$2
CERTBOT_PATH="/etc/letsencrypt"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "\n${BLUE}═══════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════${NC}\n"
}

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

# Validate arguments
if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    print_error "Usage: $0 <domain> <email>"
    echo ""
    echo "Examples:"
    echo "  $0 mirestaurante.com admin@mirestaurante.com"
    echo "  $0 chatbotdysa.com contacto@chatbotdysa.com"
    exit 1
fi

print_header "ChatBotDysa - Let's Encrypt SSL Setup"
echo "Domain: $DOMAIN"
echo "Email: $EMAIL"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "This script must be run as root (sudo)"
    exit 1
fi

# Install certbot if not installed
print_info "Checking certbot installation..."
if ! command -v certbot &> /dev/null; then
    print_warning "Certbot not found. Installing..."

    if command -v apt-get &> /dev/null; then
        apt-get update
        apt-get install -y certbot python3-certbot-nginx
    elif command -v yum &> /dev/null; then
        yum install -y certbot python3-certbot-nginx
    elif command -v dnf &> /dev/null; then
        dnf install -y certbot python3-certbot-nginx
    else
        print_error "Unsupported package manager. Please install certbot manually."
        exit 1
    fi
fi
print_success "Certbot installed: $(certbot --version)"

# Create webroot directory for ACME challenges
print_info "Creating ACME challenge directory..."
mkdir -p /var/www/certbot/.well-known/acme-challenge
chown -R www-data:www-data /var/www/certbot 2>/dev/null || chown -R nginx:nginx /var/www/certbot 2>/dev/null || true

# Generate certificate
print_header "Generating SSL Certificate"

print_info "Requesting certificate for:"
echo "  - $DOMAIN"
echo "  - www.$DOMAIN"
echo "  - api.$DOMAIN"
echo "  - admin.$DOMAIN"
echo ""

certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d "$DOMAIN" \
    -d "www.$DOMAIN" \
    -d "api.$DOMAIN" \
    -d "admin.$DOMAIN"

if [ $? -eq 0 ]; then
    print_success "SSL certificate generated successfully!"
else
    print_error "Failed to generate SSL certificate"
    print_info "Make sure your DNS is configured correctly and ports 80/443 are open"
    exit 1
fi

# Update nginx configuration with actual domain
print_header "Updating Nginx Configuration"

NGINX_CONF_DIR="$(dirname "$0")/../nginx/conf.d"

if [ -f "$NGINX_CONF_DIR/default.conf" ]; then
    print_info "Updating nginx configuration with domain: $DOMAIN"

    sed -i "s/example.com/$DOMAIN/g" "$NGINX_CONF_DIR/default.conf"

    print_success "Nginx configuration updated"
fi

# Setup auto-renewal
print_header "Setting Up Auto-Renewal"

# Create renewal hook script
cat > /etc/letsencrypt/renewal-hooks/post/reload-nginx.sh <<'EOF'
#!/bin/bash
# Reload nginx after certificate renewal
docker exec chatbotdysa-nginx-prod nginx -s reload 2>/dev/null || systemctl reload nginx 2>/dev/null || true
EOF
chmod +x /etc/letsencrypt/renewal-hooks/post/reload-nginx.sh

# Add cron job for renewal
(crontab -l 2>/dev/null | grep -v "certbot renew"; echo "0 3 * * * certbot renew --quiet --post-hook 'docker exec chatbotdysa-nginx-prod nginx -s reload'") | crontab -

print_success "Auto-renewal configured (runs daily at 3 AM)"

# Test configuration
print_header "Testing Configuration"

print_info "Testing certbot renewal..."
certbot renew --dry-run

if [ $? -eq 0 ]; then
    print_success "Renewal test passed!"
else
    print_warning "Renewal test failed. Check configuration."
fi

# Show certificate info
print_header "Certificate Information"

CERT_PATH="$CERTBOT_PATH/live/$DOMAIN"
if [ -d "$CERT_PATH" ]; then
    echo "Certificate files:"
    echo "  - Fullchain: $CERT_PATH/fullchain.pem"
    echo "  - Private Key: $CERT_PATH/privkey.pem"
    echo ""

    EXPIRY=$(openssl x509 -in "$CERT_PATH/fullchain.pem" -noout -enddate | cut -d= -f2)
    echo "Expires: $EXPIRY"
fi

# Final instructions
print_header "Next Steps"

echo "1. Update your docker-compose.production.yml:"
echo "   volumes:"
echo "     - /etc/letsencrypt:/etc/letsencrypt:ro"
echo ""
echo "2. Update nginx/conf.d/default.conf with your domain:"
echo "   server_name $DOMAIN www.$DOMAIN;"
echo ""
echo "3. Restart nginx container:"
echo "   docker-compose -f docker-compose.production.yml restart nginx"
echo ""
echo "4. Test HTTPS:"
echo "   curl -I https://$DOMAIN"
echo ""

print_success "Let's Encrypt setup completed!"
