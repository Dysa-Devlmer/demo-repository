# 📦 Guía Completa de Instalación - ChatBotDysa

**Versión:** 1.0.0
**Fecha:** Octubre 2025
**Tiempo Estimado:** 30-45 minutos

---

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Opción 1: Instalación Desarrollo (Local)](#opción-1-instalación-desarrollo-local)
3. [Opción 2: Instalación Producción (Servidor)](#opción-2-instalación-producción-servidor)
4. [Verificación de Instalación](#verificación-de-instalación)
5. [Configuración Inicial](#configuración-inicial)
6. [Troubleshooting](#troubleshooting)

---

## Requisitos Previos

### Hardware Mínimo

**Para Desarrollo:**
- CPU: 4 cores
- RAM: 8 GB
- Disco: 20 GB libres

**Para Producción:**
- CPU: 8 cores (recomendado)
- RAM: 16 GB
- Disco: 50 GB libres (SSD recomendado)

### Software Requerido

#### Todos los Entornos:
- ✅ **Docker:** v24.0+ ([Instalar](https://docs.docker.com/get-docker/))
- ✅ **Docker Compose:** v2.20+ (incluido con Docker Desktop)
- ✅ **Git:** v2.30+ ([Instalar](https://git-scm.com/downloads))

#### Solo Producción:
- ✅ **Nginx:** v1.24+ (reverse proxy)
- ✅ **Certbot:** (certificados SSL)
- ✅ **Node.js:** v20+ (para builds)

### Puertos Requeridos

Asegúrate de que estos puertos estén libres:

```bash
# Verificar puertos
lsof -i :8005   # Backend API
lsof -i :7001   # Admin Panel
lsof -i :3004   # Landing Page
lsof -i :15432  # PostgreSQL
lsof -i :16379  # Redis
lsof -i :21434  # Ollama
```

---

## Opción 1: Instalación Desarrollo (Local)

### Paso 1: Clonar Repositorio

```bash
# Clonar proyecto
git clone https://github.com/tu-organizacion/ChatBotDysa.git
cd ChatBotDysa

# Verificar estructura
ls -la
```

**Debe contener:**
```
ChatBotDysa/
├── apps/
│   ├── backend/
│   ├── admin-panel/
│   ├── landing-page/
│   └── web-widget/
├── infrastructure/
├── docs/
├── scripts/
├── docker-compose.yml
└── README.md
```

### Paso 2: Configurar Variables de Entorno

```bash
# Copiar plantilla de desarrollo
cp .env.example .env

# Editar si es necesario (opcional)
nano .env
```

**Configuración por defecto** (ya funciona para desarrollo):
```bash
NODE_ENV=development
DATABASE_PASSWORD=supersecret
DATABASE_NAME=chatbotdysa
```

### Paso 3: Iniciar Servicios con Docker

```bash
# Opción A: Desde raíz (usando infrastructure/docker-compose.yml)
cd infrastructure
docker-compose up -d

# Opción B: Desde raíz si tienes docker-compose.yml allí
docker-compose up -d
```

**Esto iniciará:**
- PostgreSQL (puerto 15432)
- Redis (puerto 16379)
- Ollama (puerto 21434)
- Backend API (puerto 8005)
- Landing Page (puerto 3004)

### Paso 4: Verificar Servicios

```bash
# Ver servicios corriendo
docker-compose ps

# Debe mostrar:
# chatbotdysa-postgres   (healthy)
# chatbotdysa-redis      (running)
# chatbotdysa-ollama     (running)
# chatbotdysa-backend    (healthy)
# chatbotdysa-landing    (healthy)
```

### Paso 5: Instalar Modelos de Ollama

```bash
# Entrar al contenedor de Ollama
docker exec -it chatbotdysa-ollama bash

# Descargar modelo principal (phi3:mini - ~2GB)
ollama pull phi3:mini

# Opcional: Descargar más modelos
ollama pull llama3:8b      # ~4.7GB
ollama pull mistral:7b     # ~4.1GB
ollama pull gemma:7b       # ~5.0GB

# Salir
exit

# Verificar modelos instalados
curl http://localhost:21434/api/tags
```

### Paso 6: Inicializar Base de Datos

```bash
# Las migraciones se ejecutan automáticamente al iniciar el backend
# Verificar que las tablas existan
docker exec chatbotdysa-postgres psql -U postgres -d chatbotdysa -c "\\dt"

# Debe mostrar 22 tablas
```

### Paso 7: Iniciar Admin Panel (Desarrollo)

```bash
# En una nueva terminal
cd apps/admin-panel

# Instalar dependencias (primera vez)
npm install

# Iniciar servidor de desarrollo
npm run dev

# Abre: http://localhost:7001
```

**Credenciales de prueba:**
- Email: `admin@zgamersa.com`
- Password: `Admin123!`

### Paso 8: Verificar Instalación

Abrir en el navegador:

✅ **Backend API:** http://localhost:8005/health
✅ **Admin Panel:** http://localhost:7001
✅ **Landing Page:** http://localhost:3004
✅ **API Docs:** http://localhost:8005/api

---

## Opción 2: Instalación Producción (Servidor)

### Arquitectura de Producción

```
┌─────────────────────────────────────────┐
│          INTERNET                       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│     Nginx Reverse Proxy (HTTPS)          │
│     - SSL/TLS Termination                │
│     - Load Balancing                     │
└──────┬───────────────────────┬───────────┘
       │                       │
       ▼                       ▼
┌──────────────┐      ┌──────────────────┐
│   Backend    │      │   Frontend Apps  │
│   (8005)     │      │   - Admin (7001) │
│              │      │   - Landing (3004)│
└──────┬───────┘      └──────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│          Services Layer                   │
│   - PostgreSQL (15432)                   │
│   - Redis (16379)                        │
│   - Ollama (21434)                       │
└──────────────────────────────────────────┘
```

### Paso 1: Preparar Servidor

```bash
# Conectar al servidor
ssh usuario@tu-servidor.com

# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar prerequisitos
sudo apt install -y curl wget git nano ufw
```

### Paso 2: Instalar Docker

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER

# Reiniciar sesión
exit
ssh usuario@tu-servidor.com

# Verificar instalación
docker --version
docker-compose --version
```

### Paso 3: Configurar Firewall

```bash
# Permitir SSH
sudo ufw allow 22/tcp

# Permitir HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Habilitar firewall
sudo ufw enable

# Verificar reglas
sudo ufw status
```

### Paso 4: Clonar Proyecto

```bash
# Crear directorio
sudo mkdir -p /opt/chatbotdysa
sudo chown $USER:$USER /opt/chatbotdysa

# Clonar
cd /opt
git clone https://github.com/tu-organizacion/ChatBotDysa.git chatbotdysa
cd chatbotdysa
```

### Paso 5: Generar Secrets de Producción

```bash
# Ejecutar script de generación de secrets
./scripts/generate-secrets.sh mi-restaurante

# Esto crea:
# secrets/mi-restaurante/.env.production
# secrets/mi-restaurante/README.md
```

**Contenido generado:**
- JWT_SECRET (256 bits)
- DATABASE_PASSWORD (128 bits)
- CSRF_SECRET (256 bits)
- NEXTAUTH_SECRET (256 bits)
- REDIS_PASSWORD (128 bits)
- API_KEY_INTERNAL (256 bits)

### Paso 6: Configurar Variables de Entorno

```bash
# Editar .env.production generado
nano secrets/mi-restaurante/.env.production
```

**Actualizar:**

1. **URLs con tu dominio:**
```bash
API_URL=https://api.mi-restaurante.cl
FRONTEND_URL=https://www.mi-restaurante.cl
ADMIN_URL=https://admin.mi-restaurante.cl
```

2. **CORS con dominios reales:**
```bash
CORS_ORIGIN=https://mi-restaurante.cl,https://admin.mi-restaurante.cl,https://www.mi-restaurante.cl
```

3. **Servicios externos:**
```bash
# SendGrid (Email)
SENDGRID_API_KEY=SG.tu-api-key-real

# Mercado Pago (Pagos)
MERCADOPAGO_ACCESS_TOKEN=APP_USR-tu-token-real
MERCADOPAGO_PUBLIC_KEY=APP_USR-tu-public-key

# Twilio (WhatsApp)
TWILIO_ACCOUNT_SID=tu-account-sid
TWILIO_AUTH_TOKEN=tu-auth-token
```

### Paso 7: Copiar .env a Apps

```bash
# Backend
cp secrets/mi-restaurante/.env.production apps/backend/.env.production

# Admin Panel (ajustar para Next.js)
cp secrets/mi-restaurante/.env.production apps/admin-panel/.env.production

# Proteger archivos
chmod 600 apps/backend/.env.production
chmod 600 apps/admin-panel/.env.production
```

### Paso 8: Configurar SSL/HTTPS

**Opción A: Let's Encrypt (Recomendado)**

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtener certificados
sudo certbot certonly --standalone \
  -d mi-restaurante.cl \
  -d www.mi-restaurante.cl \
  -d admin.mi-restaurante.cl \
  -d api.mi-restaurante.cl

# Certificados en:
# /etc/letsencrypt/live/mi-restaurante.cl/fullchain.pem
# /etc/letsencrypt/live/mi-restaurante.cl/privkey.pem
```

**Opción B: Cloudflare** (más fácil)

Ver guía completa: [docs/SSL_HTTPS_CONFIGURATION.md](./SSL_HTTPS_CONFIGURATION.md)

### Paso 9: Configurar Nginx

```bash
# Instalar Nginx
sudo apt install nginx -y

# Crear configuración
sudo nano /etc/nginx/sites-available/chatbotdysa
```

**Contenido:**
```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name mi-restaurante.cl www.mi-restaurante.cl;
    return 301 https://$server_name$request_uri;
}

# Backend API
server {
    listen 443 ssl http2;
    server_name api.mi-restaurante.cl;

    ssl_certificate /etc/letsencrypt/live/mi-restaurante.cl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mi-restaurante.cl/privkey.pem;

    location / {
        proxy_pass http://localhost:8005;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Admin Panel
server {
    listen 443 ssl http2;
    server_name admin.mi-restaurante.cl;

    ssl_certificate /etc/letsencrypt/live/mi-restaurante.cl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mi-restaurante.cl/privkey.pem;

    location / {
        proxy_pass http://localhost:7001;
        proxy_set_header Host $host;
    }
}

# Landing Page
server {
    listen 443 ssl http2;
    server_name www.mi-restaurante.cl mi-restaurante.cl;

    ssl_certificate /etc/letsencrypt/live/mi-restaurante.cl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mi-restaurante.cl/privkey.pem;

    location / {
        proxy_pass http://localhost:3004;
        proxy_set_header Host $host;
    }
}
```

**Activar configuración:**
```bash
# Crear symlink
sudo ln -s /etc/nginx/sites-available/chatbotdysa /etc/nginx/sites-enabled/

# Verificar sintaxis
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### Paso 10: Crear Directorios de Datos

```bash
# Crear directorios para volúmenes persistentes
sudo mkdir -p /opt/chatbotdysa/data/{postgres,redis,ollama}
sudo chown -R $USER:$USER /opt/chatbotdysa/data

# Crear directorio de backups
sudo mkdir -p /opt/chatbotdysa/backups
sudo chown -R $USER:$USER /opt/chatbotdysa/backups
```

### Paso 11: Iniciar Servicios de Producción

```bash
# Ir al directorio del proyecto
cd /opt/chatbotdysa

# Iniciar servicios con docker-compose production
docker-compose -f docker-compose.production.yml up -d

# Ver logs
docker-compose -f docker-compose.production.yml logs -f
```

### Paso 12: Instalar Modelos Ollama

```bash
# Entrar al contenedor
docker exec -it chatbotdysa-ollama-prod bash

# Instalar phi3:mini
ollama pull phi3:mini

# Salir
exit
```

### Paso 13: Verificar Deployment

```bash
# Verificar servicios
docker-compose -f docker-compose.production.yml ps

# Verificar health
curl https://api.mi-restaurante.cl/health

# Verificar admin panel
curl https://admin.mi-restaurante.cl

# Verificar landing
curl https://www.mi-restaurante.cl
```

---

## Verificación de Instalación

### Script Automático

```bash
# Ejecutar script de testing
./scripts/test-system-complete.sh
```

**Debe mostrar:**
```
✅ Docker Services: 5/5 corriendo
✅ PostgreSQL: 22 tablas
✅ Redis: Funcionando
✅ Ollama: Modelos disponibles
✅ Backend: Respondiendo
✅ Frontend: Accesible

📊 RESULTADO: 100% funcionando
```

### Verificación Manual

**1. Servicios Docker:**
```bash
docker ps
# Debe mostrar 5-8 contenedores corriendo
```

**2. Base de Datos:**
```bash
docker exec chatbotdysa-postgres psql -U postgres -d chatbotdysa -c "SELECT COUNT(*) FROM users"
# Debe retornar: 1 (usuario admin)
```

**3. Backend API:**
```bash
curl http://localhost:8005/health
# Debe retornar: {"success":true,"data":{"status":"ok"}}
```

**4. Ollama:**
```bash
curl http://localhost:21434/api/tags
# Debe retornar lista de modelos
```

---

## Configuración Inicial

### 1. Crear Usuario Admin (si no existe)

```bash
# Conectar a la base de datos
docker exec -it chatbotdysa-postgres psql -U postgres -d chatbotdysa

# Verificar usuarios
SELECT id, email, role FROM users;

# Si no existe admin, crear uno...
# (Normalmente ya existe del seed inicial)
```

### 2. Configurar Información del Restaurante

Iniciar sesión en Admin Panel y configurar:

1. **Información Básica:**
   - Nombre del restaurante
   - Dirección
   - Teléfono
   - Horarios

2. **Menú:**
   - Agregar categorías
   - Agregar platillos con precios

3. **Configuración del Chatbot:**
   - Mensajes de bienvenida
   - Respuestas automáticas
   - Modelo de AI a usar

### 3. Instalar Widget en Sitio Web

Ver guía completa: [apps/web-widget/INSTALLATION.md](../apps/web-widget/INSTALLATION.md)

**Código básico:**
```html
<!-- Agregar antes de </body> -->
<link rel="stylesheet" href="/ruta/dysabot-widget.min.css">
<script src="/ruta/dysabot-widget.min.js"></script>
<script>
  const widget = new DysaBotWidget({
    apiUrl: 'https://api.mi-restaurante.cl',
    restaurantId: 'mi-restaurante',
    theme: 'purple'
  });
</script>
```

---

## Troubleshooting

### Problema: Docker no inicia servicios

**Solución:**
```bash
# Ver logs detallados
docker-compose logs

# Verificar puertos en uso
lsof -i :8005

# Limpiar y reiniciar
docker-compose down
docker-compose up -d
```

### Problema: PostgreSQL no acepta conexiones

**Solución:**
```bash
# Verificar que el contenedor esté healthy
docker inspect chatbotdysa-postgres | grep Health

# Ver logs
docker logs chatbotdysa-postgres

# Reiniciar servicio
docker restart chatbotdysa-postgres
```

### Problema: Ollama no descarga modelos

**Solución:**
```bash
# Verificar espacio en disco
df -h

# Verificar conexión a internet desde contenedor
docker exec chatbotdysa-ollama ping -c 3 ollama.ai

# Descargar manualmente
docker exec -it chatbotdysa-ollama bash
ollama pull phi3:mini --debug
```

### Problema: Admin Panel no carga

**Solución:**
```bash
# Verificar que el backend esté corriendo
curl http://localhost:8005/health

# Verificar variables de entorno
docker exec chatbotdysa-backend env | grep API_URL

# Reconstruir imagen
docker-compose up -d --build admin-panel
```

### Problema: SSL no funciona

**Solución:**
```bash
# Verificar certificados
sudo certbot certificates

# Renovar certificados
sudo certbot renew

# Verificar configuración de Nginx
sudo nginx -t

# Ver logs de Nginx
sudo tail -f /var/log/nginx/error.log
```

---

## Mantenimiento

### Backups Automáticos

```bash
# Ejecutar backup manual
docker-compose -f docker-compose.production.yml --profile backup up backup

# Configurar cron para backups diarios
crontab -e
# Agregar:
# 0 2 * * * cd /opt/chatbotdysa && docker-compose -f docker-compose.production.yml --profile backup up backup
```

### Actualización del Sistema

```bash
# 1. Hacer backup
docker-compose -f docker-compose.production.yml --profile backup up backup

# 2. Descargar nueva versión
git pull origin main

# 3. Rebuild servicios
docker-compose -f docker-compose.production.yml up -d --build

# 4. Verificar
./scripts/test-system-complete.sh
```

### Monitoreo

```bash
# Ver logs en tiempo real
docker-compose logs -f

# Ver uso de recursos
docker stats

# Ver salud de servicios
docker-compose ps
```

---

## Soporte

**Documentación:**
- Guía de Usuario: [docs/USER_GUIDE.md](./USER_GUIDE.md)
- Troubleshooting: [docs/TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- API Documentation: [docs/API.md](./API.md)

**Contacto:**
- Email: soporte@dysadev.com
- GitHub Issues: https://github.com/dysadev/chatbotdysa/issues

---

## Checklist de Instalación Completa

- [ ] Docker y Docker Compose instalados
- [ ] Proyecto clonado
- [ ] Variables de entorno configuradas
- [ ] Servicios Docker corriendo
- [ ] Modelos Ollama instalados
- [ ] Base de datos inicializada
- [ ] Admin Panel accesible
- [ ] SSL/HTTPS configurado (producción)
- [ ] Nginx configurado (producción)
- [ ] Widget instalado en sitio web
- [ ] Backups configurados
- [ ] Testing ejecutado exitosamente

---

**¡Felicidades! ChatBotDysa está instalado y listo para usar.**
