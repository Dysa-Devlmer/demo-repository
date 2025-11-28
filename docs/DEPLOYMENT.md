# 🚀 ChatBotDysa - Guía de Despliegue en Producción

## 📋 Tabla de Contenidos
- [Requisitos del Sistema](#requisitos-del-sistema)
- [Configuración Inicial](#configuración-inicial)
- [Despliegue con Docker](#despliegue-con-docker)
- [Despliegue con PM2](#despliegue-con-pm2)
- [Configuración de Nginx](#configuración-de-nginx)
- [SSL y Certificados](#ssl-y-certificados)
- [Monitoreo y Logs](#monitoreo-y-logs)
- [Backup y Recuperación](#backup-y-recuperación)
- [Troubleshooting](#troubleshooting)

## 🖥️ Requisitos del Sistema

### Mínimo Recomendado
- **OS**: Ubuntu 20.04+ / CentOS 8+ / RHEL 8+
- **CPU**: 4 cores
- **RAM**: 8GB
- **Almacenamiento**: 50GB SSD
- **Red**: 100 Mbps

### Recomendado para Producción
- **OS**: Ubuntu 22.04 LTS
- **CPU**: 8 cores
- **RAM**: 16GB
- **Almacenamiento**: 100GB NVMe SSD
- **Red**: 1 Gbps

### Software Requerido
```bash
# Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# PM2
sudo npm install -g pm2

# Nginx
sudo apt update
sudo apt install -y nginx

# Certbot (para SSL)
sudo apt install -y certbot python3-certbot-nginx
```

## ⚙️ Configuración Inicial

### 1. Preparar el Servidor
```bash
# Crear usuario dedicado
sudo adduser chatbot
sudo usermod -aG docker chatbot
sudo usermod -aG sudo chatbot

# Cambiar al usuario
su - chatbot

# Crear directorios necesarios
mkdir -p /home/chatbot/{apps,logs,backups,ssl}
```

### 2. Clonar el Repositorio
```bash
cd /home/chatbot/apps
git clone <your-repository-url> chatbotdysa
cd chatbotdysa
```

### 3. Configurar Variables de Entorno
```bash
# Copiar template de configuración
cp .env.example .env

# Editar configuración
nano .env
```

**Variables Críticas para Producción:**
```env
NODE_ENV=production
DATABASE_PASSWORD=your_super_secure_db_password
JWT_SECRET=your_64_character_jwt_secret_key_for_production_use_only
GRAFANA_PASSWORD=your_grafana_admin_password
DOMAIN=your-domain.com
ACME_EMAIL=admin@your-domain.com
```

## 🐳 Despliegue con Docker

### Método 1: Servicios Completos con Docker
```bash
# Iniciar servicios de infraestructura
docker-compose -f docker-compose.production.yml up -d postgres redis ollama

# Esperar a que los servicios estén listos
sleep 30

# Verificar estado
docker-compose -f docker-compose.production.yml ps

# Inicializar base de datos
docker-compose -f docker-compose.production.yml exec postgres \
  psql -U postgres -d chatbotdysa -f /docker-entrypoint-initdb.d/init-db.sql

# Instalar dependencias y compilar
npm run install:deps
npm run build

# Iniciar aplicaciones con PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### Método 2: Todo con Docker
```bash
# Construir y ejecutar todo el stack
docker-compose -f docker-compose.production.yml up -d

# Verificar logs
docker-compose -f docker-compose.production.yml logs -f backend
```

### Comandos Útiles
```bash
# Ver estado de contenedores
docker-compose -f docker-compose.production.yml ps

# Ver logs en tiempo real
docker-compose -f docker-compose.production.yml logs -f

# Reiniciar servicios
docker-compose -f docker-compose.production.yml restart

# Detener todo
docker-compose -f docker-compose.production.yml down

# Actualizar servicios
docker-compose -f docker-compose.production.yml pull
docker-compose -f docker-compose.production.yml up -d
```

## 🚀 Despliegue con PM2

### Configuración Avanzada de PM2
```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar aplicaciones
pm2 start ecosystem.config.js --env production

# Configurar autostart
pm2 startup
pm2 save

# Monitorear
pm2 monit

# Logs
pm2 logs

# Reiniciar aplicación específica
pm2 restart chatbotdysa-backend

# Escalar aplicación
pm2 scale chatbotdysa-backend 4
```

### Configuración de Logs con PM2
```bash
# Instalar rotador de logs
pm2 install pm2-logrotate

# Configurar rotación
pm2 set pm2-logrotate:max_size 100M
pm2 set pm2-logrotate:compress true
pm2 set pm2-logrotate:rotateInterval '0 0 * * *'
pm2 set pm2-logrotate:retain 7
```

## 🌐 Configuración de Nginx

### Copiar Configuración
```bash
# Copiar configuración
sudo cp nginx.conf /etc/nginx/sites-available/chatbotdysa

# Crear enlaces simbólicos
sudo ln -s /etc/nginx/sites-available/chatbotdysa /etc/nginx/sites-enabled/

# Eliminar configuración por defecto
sudo rm /etc/nginx/sites-enabled/default

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### Optimizaciones de Nginx
```bash
# Editar configuración principal
sudo nano /etc/nginx/nginx.conf
```

Agregar en la sección `http`:
```nginx
# Optimizaciones de rendimiento
sendfile on;
tcp_nopush on;
tcp_nodelay on;
keepalive_timeout 65;
types_hash_max_size 2048;
server_names_hash_bucket_size 128;

# Compresión
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_comp_level 6;
gzip_types
    application/json
    application/javascript
    application/x-javascript
    text/css
    text/javascript
    text/plain
    text/xml;

# Límites de rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=admin:10m rate=5r/s;

# Buffers
client_body_buffer_size 128k;
client_header_buffer_size 1k;
client_max_body_size 10m;
large_client_header_buffers 4 4k;
```

## 🔒 SSL y Certificados

### Configurar Let's Encrypt
```bash
# Obtener certificados SSL
sudo certbot --nginx -d api.your-domain.com
sudo certbot --nginx -d admin.your-domain.com
sudo certbot --nginx -d widget.your-domain.com

# Verificar renovación automática
sudo certbot renew --dry-run

# Configurar cron para renovación
sudo crontab -e
# Agregar: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Configuración Manual de SSL
```bash
# Generar certificado auto-firmado (solo para testing)
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/chatbotdysa.key \
  -out /etc/ssl/certs/chatbotdysa.crt
```

## 📊 Monitoreo y Logs

### Habilitar Monitoreo con Grafana y Prometheus
```bash
# Iniciar servicios de monitoreo
docker-compose -f docker-compose.production.yml --profile monitoring up -d

# Acceder a Grafana
# URL: http://your-server:3000
# Usuario: admin
# Contraseña: la configurada en GRAFANA_PASSWORD
```

### Configurar Alertas
```bash
# Crear directorio de alertas
mkdir -p monitoring/alerts

# Configurar alertas de Prometheus
cat > monitoring/alerts/chatbotdysa.yml << 'EOF'
groups:
- name: chatbotdysa
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: High error rate detected

  - alert: DatabaseDown
    expr: up{job="postgres"} == 0
    for: 2m
    labels:
      severity: critical
    annotations:
      summary: Database is down
EOF
```

### Logs Centralizados
```bash
# Configurar log rotation
sudo nano /etc/logrotate.d/chatbotdysa
```

```
/home/chatbot/apps/chatbotdysa/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 chatbot chatbot
    postrotate
        pm2 reloadLogs
    endscript
}
```

## 💾 Backup y Recuperación

### Script de Backup Automático
```bash
# Crear script de backup
cat > /home/chatbot/backup-chatbot.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/chatbot/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="chatbotdysa_${DATE}"

# Crear directorio
mkdir -p "$BACKUP_DIR"

# Backup de base de datos
docker-compose -f /home/chatbot/apps/chatbotdysa/docker-compose.production.yml exec -T postgres \
  pg_dump -U postgres chatbotdysa > "$BACKUP_DIR/${BACKUP_NAME}_database.sql"

# Backup de archivos
tar -czf "$BACKUP_DIR/${BACKUP_NAME}_files.tar.gz" \
  -C /home/chatbot/apps \
  --exclude="node_modules" \
  --exclude=".next" \
  --exclude="dist" \
  chatbotdysa

# Limpiar backups antiguos (mantener 7 días)
find "$BACKUP_DIR" -name "chatbotdysa_*" -type f -mtime +7 -delete

echo "Backup completed: $BACKUP_NAME"
EOF

chmod +x /home/chatbot/backup-chatbot.sh

# Configurar cron para backup diario
crontab -e
# Agregar: 0 2 * * * /home/chatbot/backup-chatbot.sh
```

### Restaurar desde Backup
```bash
# Restaurar base de datos
docker-compose -f docker-compose.production.yml exec -T postgres \
  psql -U postgres -d chatbotdysa < backup_database.sql

# Restaurar archivos
tar -xzf backup_files.tar.gz -C /home/chatbot/apps/

# Reiniciar servicios
pm2 restart all
```

## 🛠️ Script de Despliegue Automatizado

### Usar el Script Incluido
```bash
# Hacer ejecutable
chmod +x deploy.sh

# Despliegue completo
sudo ./deploy.sh production deploy

# Ver estado
./deploy.sh production status

# Reiniciar servicios
sudo ./deploy.sh production restart

# Verificar salud del sistema
./deploy.sh production health
```

## 🔍 Troubleshooting

### Problemas Comunes

#### 1. Error de Conexión a Base de Datos
```bash
# Verificar estado del contenedor
docker-compose -f docker-compose.production.yml ps postgres

# Ver logs de PostgreSQL
docker-compose -f docker-compose.production.yml logs postgres

# Conectar manualmente a la DB
docker-compose -f docker-compose.production.yml exec postgres \
  psql -U postgres -d chatbotdysa
```

#### 2. Ollama No Responde
```bash
# Verificar estado de Ollama
curl http://localhost:11434/api/version

# Descargar modelo si es necesario
docker-compose -f docker-compose.production.yml exec ollama \
  ollama pull llama3

# Ver logs de Ollama
docker-compose -f docker-compose.production.yml logs ollama
```

#### 3. PM2 No Inicia
```bash
# Verificar configuración
pm2 show chatbotdysa-backend

# Ver logs detallados
pm2 logs --lines 100

# Reiniciar PM2 daemon
pm2 kill
pm2 start ecosystem.config.js --env production
```

#### 4. Nginx Error 502
```bash
# Verificar configuración
sudo nginx -t

# Ver logs de Nginx
sudo tail -f /var/log/nginx/error.log

# Verificar procesos backend
netstat -tulnp | grep :3005
```

### Comandos de Diagnóstico
```bash
# Estado general del sistema
./deploy.sh production status

# Verificar puertos
sudo netstat -tulnp | grep -E ':(3005|3001|5433|6379|11434)'

# Verificar memoria y CPU
htop
df -h
free -h

# Verificar logs del sistema
journalctl -u nginx -f
journalctl -f --since "1 hour ago"

# Test de conectividad
curl -I http://localhost:3005/health
curl -I http://localhost:3001
```

### Logs Importantes
```bash
# Logs de aplicación
tail -f /home/chatbot/apps/chatbotdysa/logs/*.log

# Logs de PM2
pm2 logs

# Logs de Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Logs de Docker
docker-compose -f docker-compose.production.yml logs -f
```

## 📈 Escalado y Optimización

### Escalado Horizontal con PM2
```bash
# Escalar backend a 4 instancias
pm2 scale chatbotdysa-backend 4

# Configurar load balancing en Nginx
# Editar upstream en nginx.conf para incluir múltiples backends
upstream backend {
    server 127.0.0.1:3005;
    server 127.0.0.1:3006;
    server 127.0.0.1:3007;
    server 127.0.0.1:3008;
    keepalive 64;
}
```

### Optimizaciones de Base de Datos
```bash
# Conectar a PostgreSQL
docker-compose -f docker-compose.production.yml exec postgres psql -U postgres -d chatbotdysa

-- Crear índices adicionales si es necesario
CREATE INDEX CONCURRENTLY idx_messages_created_at ON ai.messages(created_at DESC);
CREATE INDEX CONCURRENTLY idx_orders_customer_phone ON restaurant.orders(customer_phone);

-- Configurar autovacuum más agresivo para tablas frecuentemente actualizadas
ALTER TABLE ai.messages SET (autovacuum_vacuum_scale_factor = 0.1);
ALTER TABLE communications.message_logs SET (autovacuum_vacuum_scale_factor = 0.1);
```

## 🔒 Seguridad Adicional

### Firewall
```bash
# Configurar UFW
sudo ufw enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### Fail2ban
```bash
# Instalar Fail2ban
sudo apt install fail2ban

# Configurar para Nginx
sudo nano /etc/fail2ban/jail.local
```

```ini
[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 10
```

## 📞 Soporte y Contacto

Para soporte técnico o problemas con el despliegue:
- Email: soporte@zgamersa.com
- Documentación: [Ver README.md](./README.md)
- Issues: Crear un issue en el repositorio

---

## ✅ Checklist de Despliegue

- [ ] Servidor configurado con requisitos mínimos
- [ ] Variables de entorno configuradas
- [ ] Base de datos inicializada
- [ ] Aplicaciones compiladas sin errores
- [ ] PM2 configurado y funcionando
- [ ] Nginx configurado con SSL
- [ ] Monitoreo habilitado
- [ ] Backups automáticos configurados
- [ ] Firewall y seguridad configurados
- [ ] Health checks funcionando
- [ ] Documentación revisada

**¡Despliegue Completado!** 🎉