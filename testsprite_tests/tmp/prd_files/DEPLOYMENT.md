# 🚀 ChatBotDysa - Guía de Deployment

**Versión:** 1.0.0
**Última actualización:** 22 de Octubre, 2025
**Estado:** Production Ready ✅

---

## 📋 Tabla de Contenidos

1. [Requisitos del Sistema](#requisitos-del-sistema)
2. [Arquitectura](#arquitectura)
3. [Instalación Rápida](#instalación-rápida)
4. [Deployment con Docker](#deployment-con-docker)
5. [Configuración de Entorno](#configuración-de-entorno)
6. [Verificación Post-Deployment](#verificación-post-deployment)
7. [Troubleshooting](#troubleshooting)
8. [Mantenimiento](#mantenimiento)

---

## 🖥️ Requisitos del Sistema

### Hardware Mínimo (Por Restaurante)

| Componente | Mínimo | Recomendado |
|------------|--------|-------------|
| **CPU** | 2 cores | 4 cores |
| **RAM** | 4 GB | 8 GB |
| **Disco** | 20 GB SSD | 50 GB SSD |
| **Red** | 10 Mbps | 50 Mbps |

### Software Requerido

| Software | Versión | Propósito |
|----------|---------|-----------|
| **Docker** | 24.0+ | Containerización |
| **Docker Compose** | 2.20+ | Orquestación |
| **Node.js** | 20.x | Runtime (opcional) |
| **Git** | 2.x | Control de versiones |

### Sistemas Operativos Soportados

- ✅ **Windows 10/11** (Pro, Enterprise, Education)
- ✅ **macOS** 12+ (Monterey o superior)
- ✅ **Linux** (Ubuntu 20.04+, Debian 11+, CentOS 8+)

---

## 🏗️ Arquitectura

### Componentes del Sistema

```
┌─────────────────────────────────────────────────────────┐
│                  ChatBotDysa Platform                    │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Admin Panel  │  │  Landing     │  │   Backend    │  │
│  │  (Next.js)   │  │   Page       │  │   (NestJS)   │  │
│  │  Port: 7001  │  │ Port: 3004   │  │  Port: 8005  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│          │                 │                  │          │
│          └─────────────────┴──────────────────┘          │
│                            │                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  PostgreSQL  │  │    Redis     │  │    Ollama    │  │
│  │   Database   │  │    Cache     │  │   AI Model   │  │
│  │ Port: 15432  │  │ Port: 16379  │  │ Port: 21434  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Servicios Docker

| Servicio | Imagen | Puerto | Descripción |
|----------|--------|--------|-------------|
| **backend** | `chatbotdysa/backend:latest` | 8005 | API REST (NestJS) |
| **admin-panel** | `chatbotdysa/admin-panel:latest` | 7001 | Panel de administración |
| **landing** | `chatbotdysa/landing:latest` | 3004 | Página de aterrizaje |
| **postgres** | `postgres:16-alpine` | 15432 | Base de datos |
| **redis** | `redis:7-alpine` | 16379 | Cache y sesiones |
| **ollama** | `ollama/ollama:latest` | 21434 | Modelo AI local |

### Volúmenes Persistentes

```
chatbotdysa-postgres-data    → Datos de PostgreSQL
chatbotdysa-redis-data       → Datos de Redis
chatbotdysa-ollama-data      → Modelos de AI
chatbotdysa-backend-logs     → Logs del backend
chatbotdysa-backend-uploads  → Archivos subidos
```

---

## ⚡ Instalación Rápida

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-org/ChatBotDysa.git
cd ChatBotDysa
```

### 2. Configurar Variables de Entorno

```bash
# Copiar plantilla de configuración
cp .env.example .env

# Editar con tus credenciales
nano .env
```

### 3. Iniciar con Docker Compose

```bash
# Levantar todos los servicios
docker-compose -f infrastructure/docker-compose.yml up -d

# Ver logs
docker-compose -f infrastructure/docker-compose.yml logs -f

# Verificar estado
docker-compose -f infrastructure/docker-compose.yml ps
```

### 4. Verificar Instalación

```bash
# Health check del backend
curl http://localhost:8005/health

# Abrir Admin Panel
open http://localhost:7001

# Abrir Landing Page
open http://localhost:3004
```

---

## 🐳 Deployment con Docker

### Deployment Paso a Paso

#### 1. Preparación del Entorno

```bash
# Verificar Docker instalado
docker --version
docker-compose --version

# Crear directorio de deployment
mkdir -p ~/chatbotdysa-production
cd ~/chatbotdysa-production
```

#### 2. Configurar Secretos

Crear archivo `.env` en la raíz:

```bash
# ============================================
# DATABASE
# ============================================
DATABASE_PASSWORD=TU_PASSWORD_SEGURO_AQUI
DATABASE_NAME=chatbotdysa

# ============================================
# AUTHENTICATION
# ============================================
JWT_SECRET=TU_JWT_SECRET_LARGO_Y_ALEATORIO
NEXTAUTH_SECRET=TU_NEXTAUTH_SECRET_AQUI

# ============================================
# EMAIL (SendGrid)
# ============================================
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@turestaurante.com

# ============================================
# PAYMENTS (MercadoPago - Opcional)
# ============================================
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxxx

# ============================================
# WHATSAPP (Meta Business - Opcional)
# ============================================
WHATSAPP_PHONE_NUMBER_ID=xxxxxxxxxxxxx
WHATSAPP_ACCESS_TOKEN=xxxxxxxxxxxxx
WHATSAPP_VERIFY_TOKEN=tu_token_verificacion

# ============================================
# TWILIO (Opcional)
# ============================================
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890

# ============================================
# CONTACT
# ============================================
CONTACT_EMAIL=contacto@turestaurante.com
```

#### 3. Build de Imágenes

```bash
# Build backend
docker build -t chatbotdysa/backend:latest ./apps/backend

# Build admin panel
docker build -t chatbotdysa/admin-panel:latest ./apps/admin-panel

# Build landing page
docker build -t chatbotdysa/landing:latest ./apps/landing-page
```

#### 4. Iniciar Servicios

```bash
# Iniciar en modo detached
docker-compose -f infrastructure/docker-compose.yml up -d

# Ver logs en tiempo real
docker-compose -f infrastructure/docker-compose.yml logs -f backend

# Verificar que todos los servicios están corriendo
docker-compose -f infrastructure/docker-compose.yml ps
```

Expected output:
```
NAME                       STATUS         PORTS
chatbotdysa-admin          Up 2 minutes   0.0.0.0:7001->7001/tcp
chatbotdysa-backend        Up 2 minutes   0.0.0.0:8005->8005/tcp
chatbotdysa-landing        Up 2 minutes   0.0.0.0:3004->3004/tcp
chatbotdysa-ollama         Up 2 minutes   0.0.0.0:21434->11434/tcp
chatbotdysa-postgres       Up 2 minutes   0.0.0.0:15432->5432/tcp
chatbotdysa-redis          Up 2 minutes   0.0.0.0:16379->6379/tcp
```

#### 5. Inicializar Base de Datos

```bash
# Ejecutar migraciones
docker exec chatbotdysa-backend npm run migration:run

# Crear usuario admin inicial
docker exec -it chatbotdysa-postgres psql -U postgres -d chatbotdysa -c "
INSERT INTO users (email, password, first_name, last_name, status)
VALUES ('admin@turestaurante.com', '$2b$10$hashedpassword', 'Admin', 'Sistema', 'active');
"
```

#### 6. Configurar Modelo AI

```bash
# Entrar al contenedor de Ollama
docker exec -it chatbotdysa-ollama bash

# Descargar modelo phi3:mini
ollama pull phi3:mini

# Verificar modelo
ollama list

# Salir
exit
```

---

## ⚙️ Configuración de Entorno

### Variables de Entorno Críticas

#### Backend (`apps/backend/.env`)

```env
# Server
NODE_ENV=production
PORT=8005

# Database
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=${DATABASE_PASSWORD}
DATABASE_NAME=chatbotdysa
DATABASE_SSL=false

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

# AI
OLLAMA_URL=http://ollama:11434
OLLAMA_MODEL=phi3:mini
OPENAI_API_KEY=                    # Opcional: fallback a OpenAI

# Auth
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRATION=24h

# Email
SENDGRID_API_KEY=${SENDGRID_API_KEY}
SENDGRID_FROM_EMAIL=${SENDGRID_FROM_EMAIL}

# WhatsApp (Meta)
WHATSAPP_PHONE_NUMBER_ID=${WHATSAPP_PHONE_NUMBER_ID}
WHATSAPP_ACCESS_TOKEN=${WHATSAPP_ACCESS_TOKEN}
WHATSAPP_VERIFY_TOKEN=${WHATSAPP_VERIFY_TOKEN}

# Twilio
TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID}
TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN}
TWILIO_PHONE_NUMBER=${TWILIO_PHONE_NUMBER}

# Payments
MERCADOPAGO_ACCESS_TOKEN=${MERCADOPAGO_ACCESS_TOKEN}
```

#### Admin Panel (`apps/admin-panel/.env`)

```env
# Server
NODE_ENV=production
HOSTNAME=0.0.0.0
PORT=7001

# API
NEXT_PUBLIC_API_URL=http://localhost:8005
NEXT_PUBLIC_ADMIN_URL=http://localhost:7001

# Auth
NEXTAUTH_URL=http://localhost:7001
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
```

### Generación de Secretos

```bash
# Generar JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generar NEXTAUTH_SECRET
openssl rand -base64 32

# Generar DATABASE_PASSWORD
openssl rand -base64 32
```

---

## ✅ Verificación Post-Deployment

### 1. Health Checks

```bash
# Backend health
curl -f http://localhost:8005/health || echo "Backend DOWN"

# Admin Panel health
curl -f http://localhost:7001 || echo "Admin Panel DOWN"

# Landing health
curl -f http://localhost:3004 || echo "Landing DOWN"

# PostgreSQL
docker exec chatbotdysa-postgres pg_isready -U postgres

# Redis
docker exec chatbotdysa-redis redis-cli ping
```

### 2. Test de Endpoints

```bash
# Test login API
curl -X POST http://localhost:8005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@turestaurante.com","password":"admin123"}'

# Test health endpoint
curl http://localhost:8005/health

# Test dashboard stats
curl http://localhost:8005/api/dashboard/stats
```

### 3. Verificar Logs

```bash
# Logs del backend
docker logs chatbotdysa-backend --tail=50

# Logs de PostgreSQL
docker logs chatbotdysa-postgres --tail=50

# Logs de todos los servicios
docker-compose -f infrastructure/docker-compose.yml logs --tail=20
```

### 4. Test de Conectividad Interna

```bash
# Backend puede conectar a PostgreSQL
docker exec chatbotdysa-backend node -e "
const { Client } = require('pg');
const client = new Client({
  host: 'postgres',
  port: 5432,
  database: 'chatbotdysa',
  user: 'postgres',
  password: process.env.DATABASE_PASSWORD
});
client.connect()
  .then(() => console.log('✅ PostgreSQL OK'))
  .catch(err => console.error('❌ PostgreSQL FAIL:', err.message));
"

# Backend puede conectar a Redis
docker exec chatbotdysa-backend node -e "
const Redis = require('ioredis');
const redis = new Redis({ host: 'redis', port: 6379 });
redis.ping()
  .then(() => console.log('✅ Redis OK'))
  .catch(err => console.error('❌ Redis FAIL:', err.message));
"
```

---

## 🔧 Troubleshooting

### Problema: Contenedores no Inician

```bash
# Ver logs de error
docker-compose -f infrastructure/docker-compose.yml logs

# Reiniciar servicio específico
docker-compose -f infrastructure/docker-compose.yml restart backend

# Rebuild completo
docker-compose -f infrastructure/docker-compose.yml down
docker-compose -f infrastructure/docker-compose.yml build --no-cache
docker-compose -f infrastructure/docker-compose.yml up -d
```

### Problema: Error de Conexión a Base de Datos

```bash
# Verificar PostgreSQL está corriendo
docker ps | grep postgres

# Verificar password
docker exec chatbotdysa-postgres env | grep POSTGRES_PASSWORD

# Test de conexión manual
docker exec -it chatbotdysa-postgres psql -U postgres -d chatbotdysa
```

### Problema: Puerto Ya en Uso

```bash
# Encontrar proceso usando puerto
lsof -i :8005
lsof -i :7001

# Matar proceso
kill -9 <PID>

# O cambiar puerto en docker-compose.yml
# Editar: ports: - "8006:8005"  # Puerto externo diferente
```

### Problema: Memoria Insuficiente

```bash
# Verificar uso de memoria
docker stats

# Aumentar límites en docker-compose.yml
# Agregar bajo cada servicio:
# deploy:
#   resources:
#     limits:
#       memory: 2G
#     reservations:
#       memory: 1G
```

### Problema: Volúmenes Corruptos

```bash
# Backup de datos
docker exec chatbotdysa-postgres pg_dump -U postgres chatbotdysa > backup.sql

# Eliminar volúmenes
docker-compose -f infrastructure/docker-compose.yml down -v

# Recrear
docker-compose -f infrastructure/docker-compose.yml up -d

# Restaurar backup
cat backup.sql | docker exec -i chatbotdysa-postgres psql -U postgres -d chatbotdysa
```

---

## 🔄 Mantenimiento

### Backups Automáticos

```bash
# Crear script de backup
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups/chatbotdysa"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup PostgreSQL
docker exec chatbotdysa-postgres pg_dump -U postgres chatbotdysa | \
  gzip > "$BACKUP_DIR/db_$DATE.sql.gz"

# Backup archivos subidos
docker run --rm -v chatbotdysa-backend-uploads:/data \
  -v $BACKUP_DIR:/backup \
  alpine tar czf /backup/uploads_$DATE.tar.gz /data

# Eliminar backups antiguos (>7 días)
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "✅ Backup completado: $DATE"
```

```bash
# Hacer ejecutable
chmod +x backup.sh

# Agregar a cron (diario a las 2 AM)
crontab -e
# Agregar: 0 2 * * * /path/to/backup.sh
```

### Actualizaciones

```bash
# Pull últimas imágenes
docker-compose -f infrastructure/docker-compose.yml pull

# Recrear servicios con nuevas imágenes
docker-compose -f infrastructure/docker-compose.yml up -d --force-recreate

# Limpiar imágenes antiguas
docker image prune -a
```

### Monitoreo

```bash
# Uso de recursos
docker stats

# Estado de servicios
docker-compose -f infrastructure/docker-compose.yml ps

# Logs en tiempo real
docker-compose -f infrastructure/docker-compose.yml logs -f --tail=100
```

### Limpieza

```bash
# Eliminar contenedores stopped
docker container prune

# Eliminar imágenes no usadas
docker image prune -a

# Eliminar volúmenes no usados
docker volume prune

# Limpieza completa (cuidado!)
docker system prune -a --volumes
```

---

## 🌐 Acceso a Servicios

Una vez deployado, accede a:

| Servicio | URL | Credenciales |
|----------|-----|--------------|
| **Admin Panel** | http://localhost:7001 | admin@turestaurante.com / admin123 |
| **Landing Page** | http://localhost:3004 | - |
| **API Docs** | http://localhost:8005/api-docs | - |
| **Health Check** | http://localhost:8005/health | - |

---

## 📞 Soporte

Para problemas o consultas:
- Email: devlmer@zgamersa.com
- Docs: `/docs`
- Issues: GitHub Issues

---

**ChatBotDysa** - Sistema Empresarial de Gestión de Restaurantes
Version 1.0.0 | Production Ready ✅
