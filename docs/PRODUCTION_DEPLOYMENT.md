# ChatBotDysa - Production Deployment Guide

## Prerequisites

### Server Requirements
- **OS**: Ubuntu 22.04 LTS / Debian 12 / Rocky Linux 9
- **RAM**: Minimum 8GB (16GB recommended)
- **CPU**: 4 cores minimum (8 cores recommended)
- **Storage**: 50GB SSD minimum (100GB recommended)
- **Docker**: 24.0+ with Docker Compose v2

### Required Ports
| Port | Service | Access |
|------|---------|--------|
| 80 | HTTP (redirect) | Public |
| 443 | HTTPS | Public |
| 22 | SSH | Restricted |

### DNS Configuration
Configure the following DNS records:
```
A     example.com        -> SERVER_IP
A     www.example.com    -> SERVER_IP
A     api.example.com    -> SERVER_IP
A     admin.example.com  -> SERVER_IP
```

---

## Deployment Steps

### Step 1: Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl git docker.io docker-compose-plugin

# Enable Docker
sudo systemctl enable docker
sudo systemctl start docker

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Create application directory
sudo mkdir -p /opt/chatbotdysa
sudo chown $USER:$USER /opt/chatbotdysa
```

### Step 2: Clone Repository

```bash
cd /opt/chatbotdysa
git clone https://github.com/your-org/chatbotdysa.git .
```

### Step 3: Generate Production Secrets

```bash
# Generate unique secrets for this installation
./scripts/generate-secrets.sh mi_restaurante

# Review generated configuration
cat secrets/mi_restaurante/.env.production
```

### Step 4: Configure Environment

```bash
# Copy generated secrets to applications
cp secrets/mi_restaurante/.env.production apps/backend/.env.production

# Create admin panel production config
cp apps/admin-panel/.env.example apps/admin-panel/.env.production

# Create landing page production config
cp apps/landing-page/.env.example apps/landing-page/.env.production
```

Edit each `.env.production` file with:
- Real domain names
- External service API keys (SendGrid, MercadoPago, Twilio)
- Restaurant information

### Step 5: SSL Certificate Setup

```bash
# Install Let's Encrypt
sudo ./scripts/setup-letsencrypt.sh example.com admin@example.com

# Verify certificate
sudo certbot certificates
```

### Step 6: Update Nginx Configuration

```bash
# Edit nginx configuration with your domain
nano nginx/conf.d/default.conf

# Replace example.com with your actual domain
sed -i 's/example.com/your-domain.com/g' nginx/conf.d/default.conf
```

### Step 7: Create Data Directories

```bash
# Create persistent data directories
sudo mkdir -p /opt/chatbotdysa/data/{postgres,redis,ollama}
sudo mkdir -p /opt/chatbotdysa/backups/{postgres,redis,uploads}
sudo mkdir -p /var/log/chatbotdysa

# Set permissions
sudo chown -R 999:999 /opt/chatbotdysa/data/postgres  # PostgreSQL user
sudo chown -R 999:999 /opt/chatbotdysa/data/redis     # Redis user
```

### Step 8: Deploy Services

```bash
# Build and start all services
docker compose -f docker-compose.production.yml up -d --build

# Monitor startup
docker compose -f docker-compose.production.yml logs -f

# Check all services are healthy
docker compose -f docker-compose.production.yml ps
```

### Step 9: Run Database Migrations

```bash
# Apply database migrations
docker exec chatbotdysa-backend-prod npm run migration:run

# Seed initial data (if needed)
docker exec chatbotdysa-backend-prod npm run seed:run
```

### Step 10: Setup AI Model

```bash
# Pull the AI model
docker exec chatbotdysa-ollama-prod ollama pull phi3:mini

# Verify model is loaded
docker exec chatbotdysa-ollama-prod ollama list
```

### Step 11: Configure Automated Tasks

```bash
# Install production crontab
crontab infrastructure/cron/production-crontab

# Verify crontab
crontab -l
```

---

## Verification

### Health Checks
```bash
# Run health check script
./scripts/monitoring-healthcheck.sh

# Check each service individually
curl -I https://api.your-domain.com/health
curl -I https://admin.your-domain.com
curl -I https://your-domain.com
```

### View Logs
```bash
# All services
docker compose -f docker-compose.production.yml logs -f

# Specific service
docker compose -f docker-compose.production.yml logs -f backend

# Application logs
tail -f /opt/chatbotdysa/apps/backend/logs/application.log
```

---

## Post-Deployment Configuration

### Create Admin User
```bash
# Access backend container
docker exec -it chatbotdysa-backend-prod sh

# Create admin user via CLI
npm run cli:create-admin -- --email admin@example.com --password SecurePass123!
```

### Configure External Services

1. **SendGrid (Email)**
   - Create account at sendgrid.com
   - Get API key
   - Verify sender domain
   - Update `SENDGRID_API_KEY` in .env.production

2. **MercadoPago (Payments)**
   - Create account at mercadopago.cl
   - Get production credentials
   - Configure webhook URL: `https://api.your-domain.com/api/payments/webhook`
   - Update credentials in .env.production

3. **WhatsApp Business API**
   - Apply for WhatsApp Business API access
   - Configure webhook URL: `https://api.your-domain.com/api/whatsapp/webhook`
   - Update tokens in .env.production

### Configure Firewall
```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Verify
sudo ufw status
```

### Setup Fail2Ban
```bash
# Install fail2ban
sudo apt install -y fail2ban

# Configure for nginx
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## Monitoring & Alerting

### Setup Slack Alerts
```bash
# Add to .env.production
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx/xxx/xxx
```

### Run Monitoring Daemon
```bash
# Start monitoring in background
nohup ./scripts/monitoring-healthcheck.sh --daemon &

# Or use systemd
sudo cp infrastructure/systemd/chatbotdysa-monitor.service /etc/systemd/system/
sudo systemctl enable chatbotdysa-monitor
sudo systemctl start chatbotdysa-monitor
```

---

## Backup & Recovery

### Manual Backup
```bash
./scripts/automated-backup.sh full
```

### Restore Database
```bash
# Stop backend
docker compose -f docker-compose.production.yml stop backend

# Restore
docker exec -i chatbotdysa-postgres-prod pg_restore \
  -U postgres \
  -d chatbotdysa \
  -c < /opt/chatbotdysa/backups/postgres/backup_20240101_120000.dump

# Start backend
docker compose -f docker-compose.production.yml start backend
```

---

## Updating

### Zero-Downtime Update
```bash
# Pull latest code
git pull origin main

# Rebuild and restart services one by one
docker compose -f docker-compose.production.yml up -d --build --no-deps backend
docker compose -f docker-compose.production.yml up -d --build --no-deps admin-panel
docker compose -f docker-compose.production.yml up -d --build --no-deps landing-page

# Run migrations
docker exec chatbotdysa-backend-prod npm run migration:run
```

### Rollback
```bash
# Revert to previous version
git checkout v1.2.3

# Rebuild
docker compose -f docker-compose.production.yml up -d --build
```

---

## Troubleshooting

### Service Won't Start
```bash
# Check logs
docker compose -f docker-compose.production.yml logs backend

# Check container status
docker inspect chatbotdysa-backend-prod

# Restart specific service
docker compose -f docker-compose.production.yml restart backend
```

### Database Connection Issues
```bash
# Verify PostgreSQL is running
docker exec chatbotdysa-postgres-prod pg_isready -U postgres

# Check connection from backend
docker exec chatbotdysa-backend-prod nc -zv postgres 5432
```

### SSL Issues
```bash
# Check certificate status
sudo certbot certificates

# Force renewal
sudo certbot renew --force-renewal

# Reload nginx
docker exec chatbotdysa-nginx-prod nginx -s reload
```

---

## Support

- **Documentation**: docs/
- **Issues**: https://github.com/your-org/chatbotdysa/issues
- **Email**: soporte@chatbotdysa.com
