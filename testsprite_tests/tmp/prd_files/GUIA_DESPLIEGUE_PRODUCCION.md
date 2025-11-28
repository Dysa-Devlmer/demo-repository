# 🚀 GUÍA DE DESPLIEGUE A PRODUCCIÓN - ChatBotDysa

## 📋 ÍNDICE
1. [Opciones de Infraestructura](#opciones-de-infraestructura)
2. [Requisitos del Servidor](#requisitos-del-servidor)
3. [Preparación del Sistema](#preparación-del-sistema)
4. [Configuración de Producción](#configuración-de-producción)
5. [Build de Aplicaciones](#build-de-aplicaciones)
6. [Despliegue en Servidor](#despliegue-en-servidor)
7. [Configuración de Dominio y SSL](#configuración-de-dominio-y-ssl)
8. [Integraciones de Producción](#integraciones-de-producción)
9. [Monitoreo y Mantenimiento](#monitoreo-y-mantenimiento)
10. [Costos Estimados](#costos-estimados)

---

## 🏢 OPCIONES DE INFRAESTRUCTURA

### **Opción 1: VPS (Recomendada para empezar)**
**Proveedores sugeridos**:
- **DigitalOcean** - $24/mes (Droplet Premium)
- **Linode/Akamai** - $24/mes (Dedicated CPU)
- **Hetzner** - €15/mes (CPX31)
- **Vultr** - $24/mes (High Performance)

**Ventajas**:
- Costo fijo mensual
- Control total del servidor
- Fácil de escalar
- Bueno para 5-20 restaurantes

**Desventajas**:
- Requiere mantenimiento manual
- Necesitas conocimientos de Linux

---

### **Opción 2: Cloud Platform (Para escalar)**
**Proveedores**:
- **AWS** (Amazon Web Services)
- **Google Cloud Platform**
- **Microsoft Azure**

**Ventajas**:
- Escalabilidad automática
- Alta disponibilidad
- Servicios administrados

**Desventajas**:
- Más complejo de configurar
- Costo variable (puede ser caro)

---

### **Opción 3: PaaS - Platform as a Service (Más fácil)**
**Proveedores**:
- **Railway.app** - ~$20-50/mes
- **Render.com** - ~$25-50/mes
- **Fly.io** - ~$15-40/mes

**Ventajas**:
- Despliegue muy simple (git push)
- SSL automático
- Escalado fácil

**Desventajas**:
- Menos control
- Puede ser más caro a largo plazo
- Limitaciones de personalización

---

## 💻 REQUISITOS DEL SERVIDOR

### **Mínimo (1-5 restaurantes)**
```
CPU: 2 vCPUs
RAM: 4 GB
Disco: 50 GB SSD
Ancho de banda: 2 TB/mes
Sistema Operativo: Ubuntu 22.04 LTS
```

### **Recomendado (5-20 restaurantes)**
```
CPU: 4 vCPUs
RAM: 8 GB
Disco: 100 GB SSD
Ancho de banda: 4 TB/mes
Sistema Operativo: Ubuntu 22.04 LTS
```

### **Profesional (20-100 restaurantes)**
```
CPU: 8 vCPUs
RAM: 16 GB
Disco: 200 GB SSD
Ancho de banda: 6 TB/mes
Sistema Operativo: Ubuntu 22.04 LTS
```

**IMPORTANTE**: El modelo Ollama (llama3:8b) requiere mínimo 6 GB de RAM.

---

## 🛠️ PREPARACIÓN DEL SISTEMA

### **PASO 1: Crear archivos de configuración de producción**

#### **1.1 Variables de entorno de producción**

Crear `.env.production` en la raíz:

```bash
# ============================================
# CHATBOTDYSA - PRODUCCIÓN
# ============================================

# === ENTORNO ===
NODE_ENV=production
PORT=8005
API_PREFIX=api

# === BASE DE DATOS ===
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=chatbotdysa_prod
DATABASE_PASSWORD=CAMBIAR_CONTRASEÑA_SEGURA_AQUI
DATABASE_NAME=chatbotdysa_prod
DATABASE_SSL=true
DATABASE_SYNCHRONIZE=false

# === REDIS ===
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=CAMBIAR_CONTRASEÑA_REDIS_AQUI
REDIS_TTL=3600

# === JWT (GENERAR CLAVES ÚNICAS) ===
JWT_SECRET=GENERAR_CLAVE_SUPER_SECRETA_MINIMO_64_CARACTERES
JWT_REFRESH_SECRET=GENERAR_OTRA_CLAVE_DIFERENTE_MINIMO_64_CARACTERES
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# === CORS (DOMINIOS DE PRODUCCIÓN) ===
CORS_ORIGIN=https://chatbotdysa.com,https://admin.chatbotdysa.com,https://widget.chatbotdysa.com

# === OLLAMA ===
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3:8b
OLLAMA_TIMEOUT=60000

# === WHATSAPP BUSINESS (CREDENCIALES REALES) ===
WHATSAPP_PHONE_ID=TU_PHONE_ID_DE_META
WHATSAPP_TOKEN=TU_TOKEN_DE_META
WHATSAPP_VERIFY_TOKEN=GENERAR_TOKEN_VERIFICACION_UNICO
WHATSAPP_WEBHOOK_URL=https://api.chatbotdysa.com/api/whatsapp/webhook

# === TWILIO (CREDENCIALES REALES) ===
TWILIO_ACCOUNT_SID=TU_ACCOUNT_SID_DE_TWILIO
TWILIO_AUTH_TOKEN=TU_AUTH_TOKEN_DE_TWILIO
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WEBHOOK_URL=https://api.chatbotdysa.com/api/twilio/webhook

# === STRIPE (CREDENCIALES REALES) ===
STRIPE_SECRET_KEY=sk_live_XXXXXXXXXXXXXXXXX
STRIPE_PUBLISHABLE_KEY=pk_live_XXXXXXXXXXXXXXXXX
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXX

# === EMAIL (SMTP) ===
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@chatbotdysa.com
SMTP_PASSWORD=TU_CONTRASEÑA_APP_GMAIL
SMTP_FROM=ChatBotDysa <noreply@chatbotdysa.com>

# === URLS DE PRODUCCIÓN ===
FRONTEND_URL=https://chatbotdysa.com
ADMIN_URL=https://admin.chatbotdysa.com
WIDGET_URL=https://widget.chatbotdysa.com
API_URL=https://api.chatbotdysa.com

# === SEGURIDAD ===
RATE_LIMIT_TTL=60000
RATE_LIMIT_MAX=100
RATE_LIMIT_AUTH_MAX=5
BCRYPT_ROUNDS=12
SESSION_SECRET=GENERAR_OTRA_CLAVE_SECRETA_UNICA

# === BACKUPS ===
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 3 * * *
BACKUP_RETENTION_DAYS=30
BACKUP_S3_BUCKET=chatbotdysa-backups
AWS_ACCESS_KEY_ID=TU_AWS_KEY
AWS_SECRET_ACCESS_KEY=TU_AWS_SECRET
AWS_REGION=us-east-1

# === MONITOREO ===
LOG_LEVEL=error
SENTRY_DSN=https://TU_SENTRY_DSN
```

#### **1.2 Generar claves secretas seguras**

```bash
# Ejecutar estos comandos para generar claves únicas:

# JWT Secret (64 caracteres)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# JWT Refresh Secret (64 caracteres)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Session Secret (64 caracteres)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# WhatsApp Verify Token (32 caracteres)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🏗️ BUILD DE APLICACIONES

### **PASO 2: Compilar todas las aplicaciones**

#### **2.1 Backend API**

```bash
cd apps/backend

# Instalar dependencias de producción
npm ci --production=false

# Compilar TypeScript
npm run build

# Verificar build
ls -lh dist/

# Debería ver:
# dist/
#   └── main.js
#   └── ...archivos compilados
```

#### **2.2 Admin Panel**

```bash
cd apps/admin-panel

# Instalar dependencias
npm ci

# Build de producción
npm run build

# Verificar build
ls -lh .next/

# Debería ver:
# .next/
#   ├── static/
#   ├── server/
#   └── ...archivos compilados
```

#### **2.3 Landing Page (Website)**

```bash
cd apps/website

# Instalar dependencias
npm ci

# Build de producción
npm run build

# Exportar estático (si es necesario)
npm run export

# Verificar build
ls -lh out/

# Debería ver carpeta out/ con HTML estático
```

#### **2.4 Web Widget**

```bash
cd apps/web-widget

# Instalar dependencias
npm ci

# Build de producción
npm run build

# Verificar build
ls -lh dist/

# Debería ver:
# dist/
#   └── dysabot-widget.min.js (versión minificada)
```

---

## 🚀 DESPLIEGUE EN SERVIDOR

### **PASO 3: Configurar servidor VPS (DigitalOcean)**

#### **3.1 Crear Droplet**

1. Ir a DigitalOcean → Create → Droplets
2. Elegir:
   - **Imagen**: Ubuntu 22.04 LTS
   - **Plan**: Premium AMD - 8 GB RAM / 4 vCPUs ($48/mes)
   - **Datacenter**: Más cercano a tu ubicación
   - **Autenticación**: SSH Key (más seguro)

#### **3.2 Conectar al servidor**

```bash
# Desde tu Mac
ssh root@TU_IP_DEL_SERVIDOR
```

#### **3.3 Configuración inicial del servidor**

```bash
# Actualizar sistema
apt update && apt upgrade -y

# Instalar dependencias básicas
apt install -y curl wget git nginx certbot python3-certbot-nginx

# Instalar Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

# Verificar instalación
node --version  # debe ser v22.x
npm --version   # debe ser v10.x

# Instalar PostgreSQL 15
apt install -y postgresql postgresql-contrib

# Instalar Redis
apt install -y redis-server

# Instalar PM2 (gestor de procesos)
npm install -g pm2

# Instalar Ollama
curl -fsSL https://ollama.com/install.sh | sh
```

#### **3.4 Crear usuario para la aplicación**

```bash
# Crear usuario chatbot
adduser chatbot

# Dar permisos sudo
usermod -aG sudo chatbot

# Cambiar a usuario chatbot
su - chatbot
```

#### **3.5 Configurar PostgreSQL**

```bash
# Volver a root
exit

# Crear usuario y base de datos
sudo -u postgres psql

# En psql:
CREATE USER chatbotdysa_prod WITH PASSWORD 'CONTRASEÑA_SEGURA_AQUI';
CREATE DATABASE chatbotdysa_prod OWNER chatbotdysa_prod;
GRANT ALL PRIVILEGES ON DATABASE chatbotdysa_prod TO chatbotdysa_prod;
\q

# Configurar PostgreSQL para escuchar en localhost
nano /etc/postgresql/15/main/postgresql.conf
# Cambiar: listen_addresses = 'localhost'

# Configurar autenticación
nano /etc/postgresql/15/main/pg_hba.conf
# Agregar: local   chatbotdysa_prod    chatbotdysa_prod                md5

# Reiniciar PostgreSQL
systemctl restart postgresql
```

#### **3.6 Configurar Redis**

```bash
# Editar configuración
nano /etc/redis/redis.conf

# Cambiar:
# requirepass TU_CONTRASEÑA_REDIS_AQUI
# maxmemory 256mb
# maxmemory-policy allkeys-lru

# Reiniciar Redis
systemctl restart redis

# Verificar
redis-cli ping
# Debe responder: PONG
```

#### **3.7 Descargar Ollama y modelo**

```bash
# Descargar modelo llama3:8b
ollama pull llama3:8b

# Verificar
ollama list
# Debe mostrar: llama3:8b    4.3 GB

# Configurar Ollama como servicio
systemctl enable ollama
systemctl start ollama
```

---

### **PASO 4: Subir aplicación al servidor**

#### **4.1 Opción A: Git (Recomendado)**

En tu Mac:
```bash
# Crear repositorio Git
cd /Users/devlmer/ChatBotDysa
git init
git add .
git commit -m "Preparación para producción"

# Subir a GitHub/GitLab (privado)
git remote add origin https://github.com/TU_USUARIO/chatbotdysa.git
git push -u origin main
```

En el servidor:
```bash
# Cambiar a usuario chatbot
su - chatbot

# Clonar repositorio
cd ~
git clone https://github.com/TU_USUARIO/chatbotdysa.git
cd chatbotdysa
```

#### **4.2 Opción B: rsync (Alternativa)**

Desde tu Mac:
```bash
# Sincronizar archivos (excluir node_modules)
rsync -avz --exclude 'node_modules' \
  --exclude '.next' \
  --exclude 'dist' \
  /Users/devlmer/ChatBotDysa/ \
  chatbot@TU_IP_SERVIDOR:~/chatbotdysa/
```

#### **4.3 Instalar dependencias en servidor**

```bash
# En el servidor como usuario chatbot
cd ~/chatbotdysa

# Copiar .env de producción
cp .env.production .env

# IMPORTANTE: Editar .env con tus claves reales
nano .env

# Instalar dependencias
npm install

# Instalar dependencias de cada app
cd apps/backend && npm ci --production && cd ../..
cd apps/admin-panel && npm ci --production && cd ../..
cd apps/website && npm ci --production && cd ../..
cd apps/web-widget && npm ci --production && cd ../..
```

#### **4.4 Ejecutar migraciones de base de datos**

```bash
cd apps/backend

# Ejecutar migraciones
npm run migration:run

# Crear datos iniciales (usuario admin)
npm run seed

# Verificar
PGPASSWORD='TU_CONTRASEÑA' psql -h localhost -U chatbotdysa_prod -d chatbotdysa_prod -c "\dt"
# Debe mostrar 23 tablas
```

---

### **PASO 5: Configurar PM2 (Gestor de procesos)**

#### **5.1 Crear archivo de configuración PM2**

```bash
cd ~/chatbotdysa
nano ecosystem.config.js
```

Contenido:
```javascript
module.exports = {
  apps: [
    {
      name: 'chatbot-backend',
      cwd: './apps/backend',
      script: 'dist/main.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 8005
      },
      error_file: '~/.pm2/logs/backend-error.log',
      out_file: '~/.pm2/logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'chatbot-admin',
      cwd: './apps/admin-panel',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 7001',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 7001
      },
      error_file: '~/.pm2/logs/admin-error.log',
      out_file: '~/.pm2/logs/admin-out.log',
      autorestart: true,
      max_memory_restart: '512M'
    },
    {
      name: 'chatbot-website',
      cwd: './apps/website',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 6001',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 6001
      },
      error_file: '~/.pm2/logs/website-error.log',
      out_file: '~/.pm2/logs/website-out.log',
      autorestart: true,
      max_memory_restart: '512M'
    }
  ]
};
```

#### **5.2 Iniciar aplicaciones con PM2**

```bash
# Iniciar todas las apps
pm2 start ecosystem.config.js

# Ver status
pm2 status

# Ver logs
pm2 logs

# Guardar configuración PM2
pm2 save

# Configurar PM2 para iniciar al arranque
pm2 startup
# Ejecutar el comando que te muestra

# Reiniciar todo
pm2 restart all
```

---

## 🌐 CONFIGURACIÓN DE DOMINIO Y SSL

### **PASO 6: Configurar Nginx como Reverse Proxy**

#### **6.1 Configurar DNS**

En tu proveedor de dominio (Namecheap, GoDaddy, etc.):

```
Tipo    Nombre              Valor               TTL
A       @                   TU_IP_SERVIDOR      3600
A       admin               TU_IP_SERVIDOR      3600
A       api                 TU_IP_SERVIDOR      3600
A       widget              TU_IP_SERVIDOR      3600
CNAME   www                 chatbotdysa.com     3600
```

Resultado:
- `chatbotdysa.com` → Landing Page
- `admin.chatbotdysa.com` → Admin Panel
- `api.chatbotdysa.com` → Backend API
- `widget.chatbotdysa.com` → Web Widget

#### **6.2 Configurar Nginx**

```bash
# Volver a root
exit

# Crear configuración para backend API
nano /etc/nginx/sites-available/chatbot-api
```

Contenido:
```nginx
server {
    listen 80;
    server_name api.chatbotdysa.com;

    location / {
        proxy_pass http://localhost:8005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    client_max_body_size 10M;
}
```

Crear configuración para admin panel:
```bash
nano /etc/nginx/sites-available/chatbot-admin
```

Contenido:
```nginx
server {
    listen 80;
    server_name admin.chatbotdysa.com;

    location / {
        proxy_pass http://localhost:7001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Crear configuración para landing page:
```bash
nano /etc/nginx/sites-available/chatbot-website
```

Contenido:
```nginx
server {
    listen 80;
    server_name chatbotdysa.com www.chatbotdysa.com;

    location / {
        proxy_pass http://localhost:6001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Crear configuración para widget:
```bash
nano /etc/nginx/sites-available/chatbot-widget
```

Contenido:
```nginx
server {
    listen 80;
    server_name widget.chatbotdysa.com;

    root /home/chatbot/chatbotdysa/apps/web-widget/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
        add_header Access-Control-Allow-Origin *;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Habilitar sitios:
```bash
ln -s /etc/nginx/sites-available/chatbot-api /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/chatbot-admin /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/chatbot-website /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/chatbot-widget /etc/nginx/sites-enabled/

# Probar configuración
nginx -t

# Reiniciar Nginx
systemctl restart nginx
```

#### **6.3 Configurar SSL con Let's Encrypt**

```bash
# Obtener certificados SSL (GRATIS)
certbot --nginx -d chatbotdysa.com -d www.chatbotdysa.com
certbot --nginx -d admin.chatbotdysa.com
certbot --nginx -d api.chatbotdysa.com
certbot --nginx -d widget.chatbotdysa.com

# Renovación automática (ya configurado por defecto)
certbot renew --dry-run

# Verificar
systemctl status certbot.timer
```

---

## 🔌 INTEGRACIONES DE PRODUCCIÓN

### **PASO 7: Configurar integraciones reales**

#### **7.1 WhatsApp Business API**

1. Ir a [Facebook Developers](https://developers.facebook.com/)
2. Crear App → Business → WhatsApp
3. Configurar WhatsApp Business:
   - Obtener Phone ID
   - Generar Access Token permanente
   - Configurar Webhook: `https://api.chatbotdysa.com/api/whatsapp/webhook`
   - Verify Token: el que generaste en .env

4. Actualizar `.env`:
```bash
WHATSAPP_PHONE_ID=tu_phone_id_real
WHATSAPP_TOKEN=tu_token_permanente
```

#### **7.2 Twilio Voice**

1. Ir a [Twilio Console](https://www.twilio.com/console)
2. Comprar número de teléfono
3. Configurar Webhook:
   - Voice URL: `https://api.chatbotdysa.com/api/twilio/webhook`
4. Obtener credenciales:
   - Account SID
   - Auth Token

5. Actualizar `.env`:
```bash
TWILIO_ACCOUNT_SID=tu_account_sid
TWILIO_AUTH_TOKEN=tu_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

#### **7.3 Stripe Payments**

1. Ir a [Stripe Dashboard](https://dashboard.stripe.com/)
2. Activar cuenta empresarial
3. Obtener API Keys (Live mode):
   - Secret Key (sk_live_...)
   - Publishable Key (pk_live_...)
4. Configurar Webhook:
   - Endpoint: `https://api.chatbotdysa.com/api/payments/webhook`
   - Eventos a escuchar: payment_intent.succeeded, etc.

5. Actualizar `.env`:
```bash
STRIPE_SECRET_KEY=sk_live_XXXXXXX
STRIPE_PUBLISHABLE_KEY=pk_live_XXXXXXX
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXX
```

---

## 📊 MONITOREO Y MANTENIMIENTO

### **PASO 8: Configurar monitoreo**

#### **8.1 PM2 Monitoring (Gratis)**

```bash
# Crear cuenta en https://app.pm2.io/
pm2 link TU_KEY TU_SECRET
```

#### **8.2 Sentry (Errores) - Gratis hasta 5k eventos/mes**

1. Crear cuenta en [Sentry.io](https://sentry.io/)
2. Crear proyecto Node.js
3. Obtener DSN
4. Actualizar `.env`:
```bash
SENTRY_DSN=https://tu_sentry_dsn
```

#### **8.3 Uptime Monitoring**

Usar servicios gratuitos:
- [UptimeRobot](https://uptimerobot.com/) - Gratis 50 monitores
- [Pingdom](https://www.pingdom.com/) - Gratis 1 monitor

Monitorear:
- `https://chatbotdysa.com`
- `https://admin.chatbotdysa.com`
- `https://api.chatbotdysa.com/health`

---

### **PASO 9: Configurar backups automáticos**

#### **9.1 Backup de base de datos**

```bash
# Crear script de backup
nano /home/chatbot/backup-db.sh
```

Contenido:
```bash
#!/bin/bash
BACKUP_DIR="/home/chatbot/backups"
DATE=$(date +"%Y%m%d_%H%M%S")
DB_NAME="chatbotdysa_prod"
DB_USER="chatbotdysa_prod"

mkdir -p $BACKUP_DIR

# Backup
PGPASSWORD="TU_CONTRASEÑA" pg_dump -h localhost -U $DB_USER $DB_NAME > "$BACKUP_DIR/db_$DATE.sql"

# Comprimir
gzip "$BACKUP_DIR/db_$DATE.sql"

# Eliminar backups mayores a 30 días
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete

# Subir a S3 (opcional)
# aws s3 cp "$BACKUP_DIR/db_$DATE.sql.gz" s3://chatbotdysa-backups/
```

Dar permisos:
```bash
chmod +x /home/chatbot/backup-db.sh
```

Configurar cron:
```bash
crontab -e

# Agregar:
# Backup diario a las 3 AM
0 3 * * * /home/chatbot/backup-db.sh
```

#### **9.2 Backup de archivos**

```bash
# Backup del código y configuración
tar -czf /home/chatbot/backups/app_$(date +\%Y\%m\%d).tar.gz \
  /home/chatbot/chatbotdysa \
  --exclude='node_modules' \
  --exclude='.next'
```

---

## 💰 COSTOS ESTIMADOS MENSUALES

### **Infraestructura Base**

| Item | Proveedor | Costo |
|------|-----------|-------|
| VPS 8GB RAM | DigitalOcean | $48/mes |
| Dominio .com | Namecheap | $12/año = $1/mes |
| SSL | Let's Encrypt | GRATIS |
| **SUBTOTAL** | | **$49/mes** |

### **Integraciones (Opcionales)**

| Servicio | Plan | Costo |
|----------|------|-------|
| WhatsApp Business API | Meta | $0.005 - $0.09/mensaje |
| Twilio Voice | Pay-as-you-go | $0.013/min + $1/mes/número |
| Stripe | 2.9% + $0.30 | Por transacción |
| SendGrid (Email) | Free | Hasta 100 emails/día |
| Sentry (Errores) | Free | Hasta 5k eventos/mes |
| UptimeRobot | Free | 50 monitores |
| **SUBTOTAL** | | **~$10-50/mes** |

### **TOTAL ESTIMADO: $60-100/mes**

Para **5 restaurantes** = $12-20 por restaurante/mes

---

## ✅ CHECKLIST DE DESPLIEGUE

Antes de lanzar a producción, verificar:

```
□ Servidor configurado y actualizado
□ Node.js 22, PostgreSQL, Redis, Nginx instalados
□ Usuario chatbot creado
□ Base de datos creada y migraciones ejecutadas
□ Variables de entorno configuradas (.env)
□ Claves secretas generadas y únicas
□ Builds de producción compilados
□ PM2 configurado y aplicaciones corriendo
□ Nginx configurado como reverse proxy
□ DNS apuntando al servidor
□ SSL/HTTPS configurado (Let's Encrypt)
□ Integraciones configuradas (WhatsApp, Twilio, Stripe)
□ Backups automáticos configurados
□ Monitoreo configurado (PM2, Sentry, Uptime)
□ Firewall configurado (UFW)
□ Pruebas de producción realizadas
□ Usuario admin creado en base de datos
□ Documentación actualizada
```

---

## 🔥 COMANDOS ÚTILES DE PRODUCCIÓN

```bash
# Ver status de aplicaciones
pm2 status

# Ver logs en tiempo real
pm2 logs

# Reiniciar todas las apps
pm2 restart all

# Reiniciar solo backend
pm2 restart chatbot-backend

# Ver uso de recursos
pm2 monit

# Ver logs de Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Verificar SSL
certbot certificates

# Renovar SSL manualmente
certbot renew

# Ver procesos de PostgreSQL
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"

# Backup manual de BD
PGPASSWORD='TU_CONTRASEÑA' pg_dump -h localhost -U chatbotdysa_prod chatbotdysa_prod > backup.sql

# Restaurar BD
PGPASSWORD='TU_CONTRASEÑA' psql -h localhost -U chatbotdysa_prod chatbotdysa_prod < backup.sql

# Ver uso de disco
df -h

# Ver uso de RAM
free -h

# Ver procesos que más consumen
htop
```

---

## 🆘 SOPORTE Y AYUDA

Si tienes problemas:

1. Revisar logs: `pm2 logs`
2. Revisar logs de Nginx: `tail -f /var/log/nginx/error.log`
3. Verificar servicios: `systemctl status postgresql redis nginx`
4. Verificar firewall: `ufw status`
5. Probar conectividad: `curl http://localhost:8005/health`

---

**Última actualización**: 2025-11-06
**Versión**: 1.0.0
**Estado**: Listo para producción
