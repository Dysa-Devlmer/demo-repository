# 🚀 Guía Completa de Despliegue a Producción

**Sistema:** ChatBotDysa Enterprise
**Fecha:** 2025-11-01
**Versión:** 1.0.0

---

## 📋 Tabla de Contenidos

1. [Opciones de Despliegue](#opciones-de-despliegue)
2. [Prerrequisitos](#prerrequisitos)
3. [Preparación del Servidor](#preparación-del-servidor)
4. [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
5. [Despliegue con Docker (Recomendado)](#despliegue-con-docker-recomendado)
6. [Configuración de SSL/HTTPS](#configuración-de-sslhttps)
7. [Verificación del Sistema](#verificación-del-sistema)
8. [Comandos Útiles](#comandos-útiles)
9. [Mantenimiento y Backups](#mantenimiento-y-backups)
10. [Troubleshooting](#troubleshooting)

---

## Opciones de Despliegue

### Opción 1: Docker Compose (⭐ Recomendado)
**Ventajas:**
- ✅ Instalación con 1 comando
- ✅ Todo preconfigurado y optimizado
- ✅ Fácil de actualizar
- ✅ Aislamiento de servicios
- ✅ Backups automáticos
- ✅ Incluye Nginx, PostgreSQL, Redis, Ollama

**Ideal para:**
- Servidores dedicados
- VPS (DigitalOcean, AWS, Azure, etc.)
- Producción estándar

### Opción 2: Kubernetes
**Ventajas:**
- ✅ Alta disponibilidad
- ✅ Escalado automático
- ✅ Auto-healing

**Ideal para:**
- Empresas grandes
- Multi-región
- Alta demanda

### Opción 3: Serverless (AWS/Vercel)
**Ventajas:**
- ✅ Pago por uso
- ✅ Escalado infinito
- ✅ Zero mantenimiento

**Ideal para:**
- Startups
- Tráfico variable
- Presupuesto limitado

---

## Prerrequisitos

### Opción Docker (Recomendado)

#### Hardware Mínimo
```
CPU: 2 cores (4 recomendado)
RAM: 4 GB (8 GB recomendado)
Disco: 50 GB SSD (100 GB recomendado)
```

#### Software Requerido
```bash
✅ Docker Engine 24.0+
✅ Docker Compose 2.20+
✅ Git
✅ Nginx (opcional, incluido en Docker)
```

#### Sistema Operativo
- Ubuntu 22.04 LTS (recomendado)
- Debian 11+
- CentOS 8+
- macOS (desarrollo)

---

## Preparación del Servidor

### 1. Conectar al Servidor

```bash
# SSH al servidor
ssh usuario@tu-servidor.com

# Actualizar sistema
sudo apt update && sudo apt upgrade -y
```

### 2. Instalar Docker y Docker Compose

#### Ubuntu/Debian
```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo apt install docker-compose-plugin -y

# Verificar instalación
docker --version
docker compose version
```

#### CentOS/RHEL
```bash
# Instalar Docker
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Iniciar Docker
sudo systemctl start docker
sudo systemctl enable docker

# Verificar
docker --version
```

### 3. Crear Estructura de Directorios

```bash
# Crear directorio principal
sudo mkdir -p /opt/chatbotdysa
sudo chown $USER:$USER /opt/chatbotdysa

# Crear directorios de datos
sudo mkdir -p /opt/chatbotdysa/data/{postgres,redis,ollama}
sudo mkdir -p /opt/chatbotdysa/backups
sudo mkdir -p /opt/chatbotdysa/logs
sudo mkdir -p /opt/chatbotdysa/ssl
```

### 4. Clonar Repositorio

```bash
cd /opt/chatbotdysa
git clone https://github.com/tu-usuario/ChatBotDysa.git app
cd app
```

---

## Configuración de Variables de Entorno

### 1. Generar Secretos de Seguridad

```bash
# Ejecutar script de generación de secretos
chmod +x scripts/generate-secrets.sh
./scripts/generate-secrets.sh
```

Este script genera automáticamente:
- `DATABASE_PASSWORD` - Contraseña PostgreSQL
- `REDIS_PASSWORD` - Contraseña Redis
- `JWT_SECRET` - Secret para tokens JWT
- `NEXTAUTH_SECRET` - Secret para NextAuth
- `ENCRYPTION_KEY` - Clave de encriptación

### 2. Configurar Variables de Entorno Principal

```bash
# Copiar archivo de ejemplo
cp .env.example .env.production

# Editar con tus valores
nano .env.production
```

**Contenido mínimo de `.env.production`:**

```bash
# ============================================
# CONFIGURACIÓN GENERAL
# ============================================
NODE_ENV=production
APP_NAME="ChatBotDysa"
APP_URL=https://tudominio.com
API_URL=https://api.tudominio.com

# ============================================
# BASE DE DATOS (PostgreSQL)
# ============================================
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_NAME=chatbotdysa
DATABASE_USER=postgres
DATABASE_PASSWORD=YOUR_GENERATED_PASSWORD_HERE  # Del script generate-secrets.sh
DATABASE_SSL=false

# ============================================
# CACHE (Redis)
# ============================================
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=YOUR_REDIS_PASSWORD_HERE  # Del script generate-secrets.sh

# ============================================
# SEGURIDAD
# ============================================
JWT_SECRET=YOUR_JWT_SECRET_HERE  # Del script generate-secrets.sh
JWT_EXPIRES_IN=3600
NEXTAUTH_URL=https://tudominio.com
NEXTAUTH_SECRET=YOUR_NEXTAUTH_SECRET_HERE  # Del script generate-secrets.sh
ENCRYPTION_KEY=YOUR_ENCRYPTION_KEY_HERE  # Del script generate-secrets.sh

# ============================================
# OLLAMA AI
# ============================================
OLLAMA_URL=http://ollama:11434
OLLAMA_MODEL=phi3:mini
OLLAMA_ENABLED=true

# ============================================
# WHATSAPP (Opcional)
# ============================================
WHATSAPP_API_URL=https://api.whatsapp.com
WHATSAPP_API_TOKEN=tu_token_aqui
WHATSAPP_PHONE_NUMBER_ID=tu_numero_id

# ============================================
# TWILIO (Opcional)
# ============================================
TWILIO_ACCOUNT_SID=tu_account_sid
TWILIO_AUTH_TOKEN=tu_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# ============================================
# EMAIL (Opcional)
# ============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=tu_password
SMTP_FROM=noreply@tudominio.com

# ============================================
# LOGS Y MONITOREO
# ============================================
LOG_LEVEL=info
ENABLE_LOGS=true
SENTRY_DSN=  # Opcional para monitoreo de errores
```

### 3. Configurar Backend

```bash
# Crear archivo de producción
cp apps/backend/.env.example apps/backend/.env.production
nano apps/backend/.env.production
```

### 4. Configurar Admin Panel

```bash
# Crear archivo de producción
cp apps/admin-panel/.env.example apps/admin-panel/.env.production
nano apps/admin-panel/.env.production
```

**Contenido de `apps/admin-panel/.env.production`:**
```bash
NEXT_PUBLIC_API_URL=https://api.tudominio.com
NEXTAUTH_URL=https://admin.tudominio.com
NEXTAUTH_SECRET=YOUR_NEXTAUTH_SECRET_HERE
```

### 5. Configurar Landing Page

```bash
cp apps/landing-page/.env.example apps/landing-page/.env.production
nano apps/landing-page/.env.production
```

**Contenido:**
```bash
NEXT_PUBLIC_API_URL=https://api.tudominio.com
NEXT_PUBLIC_SITE_URL=https://tudominio.com
```

---

## Despliegue con Docker (Recomendado)

### Opción A: Instalación Automática (⭐ Más Fácil)

```bash
# Desde el directorio raíz del proyecto
chmod +x scripts/install/install.sh
sudo ./scripts/install/install.sh
```

Este script:
- ✅ Verifica prerrequisitos
- ✅ Genera secretos seguros
- ✅ Configura variables de entorno
- ✅ Construye contenedores Docker
- ✅ Inicia todos los servicios
- ✅ Verifica que todo funcione
- ✅ Muestra URLs de acceso

### Opción B: Instalación Manual (Paso a Paso)

#### 1. Construir Imágenes Docker

```bash
# Construir todos los servicios
docker compose -f docker-compose.production.yml build

# O construir uno por uno
docker compose -f docker-compose.production.yml build backend
docker compose -f docker-compose.production.yml build admin-panel
docker compose -f docker-compose.production.yml build landing-page
```

#### 2. Iniciar Servicios

```bash
# Iniciar todos los servicios
docker compose -f docker-compose.production.yml up -d

# Verificar que estén corriendo
docker compose -f docker-compose.production.yml ps
```

**Salida esperada:**
```
NAME                           STATUS    PORTS
chatbotdysa-postgres-prod      Up        127.0.0.1:15432->5432/tcp
chatbotdysa-redis-prod         Up        127.0.0.1:16379->6379/tcp
chatbotdysa-ollama-prod        Up        127.0.0.1:21434->11434/tcp
chatbotdysa-backend-prod       Up        127.0.0.1:8005->8005/tcp
chatbotdysa-admin-prod         Up        127.0.0.1:7001->7001/tcp
chatbotdysa-landing-prod       Up        127.0.0.1:3004->3000/tcp
chatbotdysa-nginx-prod         Up        0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
```

#### 3. Ver Logs

```bash
# Ver logs de todos los servicios
docker compose -f docker-compose.production.yml logs -f

# Ver logs de un servicio específico
docker compose -f docker-compose.production.yml logs -f backend
docker compose -f docker-compose.production.yml logs -f admin-panel
```

#### 4. Ejecutar Migraciones de Base de Datos

```bash
# Ejecutar migraciones
docker compose -f docker-compose.production.yml exec backend npm run migration:run

# O manualmente
docker compose -f docker-compose.production.yml exec backend npx typeorm migration:run
```

#### 5. Cargar Datos Iniciales (Opcional)

```bash
# Seeds de desarrollo/demo
docker compose -f docker-compose.production.yml exec backend npm run seed
```

---

## Configuración de SSL/HTTPS

### Opción 1: Let's Encrypt (Gratis y Automático) ⭐

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtener certificados SSL (reemplaza con tu dominio)
sudo certbot --nginx -d tudominio.com -d www.tudominio.com -d api.tudominio.com -d admin.tudominio.com

# Renovación automática (ya configurada)
sudo systemctl status certbot.timer
```

### Opción 2: Certificado Propio

```bash
# Generar certificado autofirmado (solo desarrollo)
./scripts/generate-ssl-certs.sh

# Copiar certificados al directorio SSL
sudo cp tu-certificado.crt /opt/chatbotdysa/ssl/
sudo cp tu-clave-privada.key /opt/chatbotdysa/ssl/

# Reiniciar Nginx
docker compose -f docker-compose.production.yml restart nginx
```

### Configuración de Nginx

El archivo `nginx/conf.d/default.conf` debe tener:

```nginx
# API Backend
server {
    listen 443 ssl http2;
    server_name api.tudominio.com;

    ssl_certificate /etc/letsencrypt/live/tudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tudominio.com/privkey.pem;

    location / {
        proxy_pass http://backend:8005;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Admin Panel
server {
    listen 443 ssl http2;
    server_name admin.tudominio.com;

    ssl_certificate /etc/letsencrypt/live/tudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tudominio.com/privkey.pem;

    location / {
        proxy_pass http://admin-panel:7001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Landing Page
server {
    listen 443 ssl http2;
    server_name tudominio.com www.tudominio.com;

    ssl_certificate /etc/letsencrypt/live/tudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tudominio.com/privkey.pem;

    location / {
        proxy_pass http://landing-page:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name tudominio.com www.tudominio.com api.tudominio.com admin.tudominio.com;
    return 301 https://$host$request_uri;
}
```

---

## Verificación del Sistema

### 1. Health Checks Automáticos

```bash
# Verificar todos los servicios
./scripts/health-check.sh
```

### 2. Verificación Manual

#### Backend API
```bash
# Health check
curl http://localhost:8005/health

# API Docs
curl http://localhost:8005/api

# Con dominio
curl https://api.tudominio.com/health
```

#### Admin Panel
```bash
# Health check
curl http://localhost:7001/api/health

# Con dominio
curl https://admin.tudominio.com
```

#### Base de Datos
```bash
# Conectar a PostgreSQL
docker compose -f docker-compose.production.yml exec postgres psql -U postgres -d chatbotdysa

# Verificar tablas
\dt

# Salir
\q
```

#### Redis
```bash
# Conectar a Redis
docker compose -f docker-compose.production.yml exec redis redis-cli -a YOUR_REDIS_PASSWORD

# Test
PING
# Debe responder: PONG

# Salir
exit
```

#### Ollama AI
```bash
# Verificar modelos instalados
curl http://localhost:21434/api/tags
```

### 3. Verificar Recursos del Sistema

```bash
# Ver uso de recursos de cada contenedor
docker stats

# Ver logs de errores
docker compose -f docker-compose.production.yml logs --tail=50 | grep -i error
```

---

## Comandos Útiles

### Gestión de Servicios

```bash
# Iniciar todos los servicios
docker compose -f docker-compose.production.yml up -d

# Detener todos los servicios
docker compose -f docker-compose.production.yml down

# Reiniciar un servicio
docker compose -f docker-compose.production.yml restart backend

# Reconstruir y actualizar
docker compose -f docker-compose.production.yml up -d --build backend

# Ver estado
docker compose -f docker-compose.production.yml ps

# Ver logs en tiempo real
docker compose -f docker-compose.production.yml logs -f [servicio]
```

### Gestión de Datos

```bash
# Entrar a un contenedor
docker compose -f docker-compose.production.yml exec backend sh
docker compose -f docker-compose.production.yml exec postgres bash

# Ejecutar comando en contenedor
docker compose -f docker-compose.production.yml exec backend npm run migration:run

# Copiar archivos
docker cp archivo.txt chatbotdysa-backend-prod:/app/
```

---

## Mantenimiento y Backups

### Backups Automáticos de Base de Datos

```bash
# Hacer backup manual
docker compose -f docker-compose.production.yml --profile backup up backup

# Configurar backup automático (crontab)
sudo crontab -e

# Agregar esta línea (backup diario a las 2 AM)
0 2 * * * cd /opt/chatbotdysa/app && docker compose -f docker-compose.production.yml --profile backup up backup
```

### Restaurar Backup

```bash
# Listar backups disponibles
ls -lh /opt/chatbotdysa/backups/

# Restaurar backup
docker compose -f docker-compose.production.yml exec postgres pg_restore -U postgres -d chatbotdysa -c /backups/backup_20251101_020000.dump
```

### Actualización del Sistema

```bash
# 1. Hacer backup
docker compose -f docker-compose.production.yml --profile backup up backup

# 2. Detener servicios
docker compose -f docker-compose.production.yml down

# 3. Actualizar código
git pull origin main

# 4. Reconstruir y iniciar
docker compose -f docker-compose.production.yml up -d --build

# 5. Ejecutar migraciones si es necesario
docker compose -f docker-compose.production.yml exec backend npm run migration:run

# 6. Verificar
docker compose -f docker-compose.production.yml ps
```

### Limpieza de Recursos

```bash
# Limpiar imágenes antiguas
docker system prune -a

# Limpiar volúmenes no usados
docker volume prune

# Ver espacio usado
docker system df
```

---

## Troubleshooting

### Problema: Servicio no inicia

```bash
# Ver logs detallados
docker compose -f docker-compose.production.yml logs [servicio]

# Verificar configuración
docker compose -f docker-compose.production.yml config

# Verificar variables de entorno
docker compose -f docker-compose.production.yml exec backend env | grep DATABASE
```

### Problema: Error de conexión a base de datos

```bash
# Verificar que PostgreSQL esté corriendo
docker compose -f docker-compose.production.yml ps postgres

# Verificar logs de PostgreSQL
docker compose -f docker-compose.production.yml logs postgres

# Verificar conectividad desde backend
docker compose -f docker-compose.production.yml exec backend nc -zv postgres 5432
```

### Problema: Alto uso de memoria

```bash
# Ver consumo actual
docker stats

# Reiniciar servicios pesados
docker compose -f docker-compose.production.yml restart ollama backend

# Ajustar límites en docker-compose.production.yml si es necesario
```

### Problema: SSL no funciona

```bash
# Verificar certificados
sudo certbot certificates

# Renovar certificados
sudo certbot renew --dry-run

# Ver logs de Nginx
docker compose -f docker-compose.production.yml logs nginx

# Verificar configuración
docker compose -f docker-compose.production.yml exec nginx nginx -t
```

### Problema: Performance lento

```bash
# 1. Ver recursos del sistema
htop
df -h

# 2. Optimizar PostgreSQL
docker compose -f docker-compose.production.yml exec postgres psql -U postgres -d chatbotdysa -c "VACUUM ANALYZE;"

# 3. Limpiar Redis cache
docker compose -f docker-compose.production.yml exec redis redis-cli -a PASSWORD FLUSHDB

# 4. Verificar logs de errores
docker compose -f docker-compose.production.yml logs | grep -i error | tail -100
```

---

## 🔐 Seguridad en Producción

### Checklist de Seguridad

- [ ] ✅ Contraseñas seguras generadas
- [ ] ✅ SSL/HTTPS configurado
- [ ] ✅ Firewall configurado (solo puertos 80, 443, 22)
- [ ] ✅ Backups automáticos activados
- [ ] ✅ Logs de acceso habilitados
- [ ] ✅ Variables de entorno protegidas
- [ ] ✅ Servicios solo escuchan en localhost (no expuestos)
- [ ] ✅ Nginx como reverse proxy

### Configurar Firewall

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Verificar
sudo ufw status
```

### Monitoreo de Logs

```bash
# Ver intentos de acceso no autorizado
docker compose -f docker-compose.production.yml logs nginx | grep "401\|403\|404"

# Configurar alertas (opcional)
# Instalar logwatch o fail2ban
```

---

## 📊 Monitoreo (Opcional)

### Opción 1: Grafana + Prometheus

```bash
# Ya incluido en docker-compose (descomentar)
docker compose -f docker-compose.production.yml --profile monitoring up -d
```

### Opción 2: Servicios Cloud

- **Datadog** - Monitoreo completo
- **New Relic** - APM
- **Sentry** - Error tracking
- **Uptime Robot** - Uptime monitoring

---

## 🎉 Acceso al Sistema

Una vez desplegado, accede a:

- **Landing Page:** https://tudominio.com
- **Admin Panel:** https://admin.tudominio.com
- **API Docs:** https://api.tudominio.com/api
- **API Health:** https://api.tudominio.com/health

**Credenciales por defecto:**
- Email: `admin@zgamersa.com`
- Password: `Admin123!` (cámbialo inmediatamente)

---

## 📞 Soporte

Si necesitas ayuda:

1. Revisa los logs: `docker compose logs -f [servicio]`
2. Consulta esta guía de troubleshooting
3. Revisa la documentación en `/docs`
4. Abre un issue en GitHub

---

**¡Felicidades! Tu sistema ChatBotDysa está en producción.** 🚀

**Última actualización:** 2025-11-01
**Versión de la guía:** 1.0.0
