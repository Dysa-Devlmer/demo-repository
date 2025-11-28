# 🐳 INICIO DE DOCKERIZACIÓN DEL SISTEMA CHATBOTDYSA

**Fecha:** 4 de Octubre de 2025
**Hora inicio:** 00:08 hrs
**Objetivo:** Crear instaladores Docker para 3 sistemas operativos

---

## 🎯 OBJETIVO DE ESTA SESIÓN

Crear Dockerfiles y docker-compose.yml para empaquetar todo el sistema ChatBotDysa y poder instalarlo fácilmente en los 3 restaurantes con diferentes sistemas operativos:
- Windows 10/11
- macOS (Intel/Apple Silicon)
- Linux (Ubuntu/Debian)

---

## 📋 PROGRESO DE DOCKERIZACIÓN

### ✅ Completado:

#### 1. Backend (NestJS) - ✅ COMPLETADO

**Archivos creados:**
- `/Users/devlmer/ChatBotDysa/apps/backend/Dockerfile`
- `/Users/devlmer/ChatBotDysa/apps/backend/.dockerignore`
- `/Users/devlmer/ChatBotDysa/apps/backend/.env.production.example`

**Características del Dockerfile:**
- ✅ Multi-stage build (optimizado para tamaño)
- ✅ Base: node:20-alpine (ligera)
- ✅ Usuario no-root (seguridad)
- ✅ Health check incluido
- ✅ Dumb-init para signal handling
- ✅ Puerto: 8005
- ✅ Tamaño estimado: ~200 MB

**Comando para construir:**
```bash
cd /Users/devlmer/ChatBotDysa/apps/backend
docker build -t chatbotdysa/backend:1.0.0 .
docker tag chatbotdysa/backend:1.0.0 chatbotdysa/backend:latest
```

---

### ⏳ Pendiente:

#### 2. Admin Panel (Next.js 15) - EN PROGRESO
- Crear Dockerfile
- Crear .dockerignore
- Puerto: 7001

#### 3. Landing Page (Next.js 15) - PENDIENTE
- Crear Dockerfile
- Crear .dockerignore
- Puerto: 3004

#### 4. docker-compose.yml - PENDIENTE
- Orquestar todos los servicios
- Incluir: Backend, Admin, Landing, PostgreSQL, Redis, Ollama
- Configurar networking
- Configurar volúmenes persistentes

#### 5. Scripts de instalación - PENDIENTE
- install-windows.bat
- install-macos.sh
- install-linux.sh
- start/stop scripts

---

## 📊 ARQUITECTURA DOCKER

### Servicios que incluirá el docker-compose.yml:

```yaml
services:
  # 1. Backend NestJS ✅
  backend:
    image: chatbotdysa/backend:latest
    ports: ["8005:8005"]
    depends_on: [postgres, redis, ollama]

  # 2. Admin Panel (Next.js) ⏳
  admin-panel:
    image: chatbotdysa/admin-panel:latest
    ports: ["7001:7001"]
    depends_on: [backend]

  # 3. Landing Page (Next.js) 📝
  landing:
    image: chatbotdysa/landing-page:latest
    ports: ["3004:3004"]

  # 4. PostgreSQL
  postgres:
    image: postgres:16-alpine
    ports: ["15432:5432"]
    volumes: [postgres_data:/var/lib/postgresql/data]

  # 5. Redis
  redis:
    image: redis:7-alpine
    ports: ["16379:6379"]
    volumes: [redis_data:/data]

  # 6. Ollama (AI)
  ollama:
    image: ollama/ollama:latest
    ports: ["21434:11434"]
    volumes: [ollama_data:/root/.ollama]
```

---

## 🔧 CONFIGURACIÓN POR RESTAURANTE

Cada instalación incluirá un archivo `.env` personalizado con:

```bash
# Datos del restaurante
RESTAURANT_ID=labellaitalia
RESTAURANT_NAME=La Bella Italia
RESTAURANT_TYPE=Italian Restaurant
RESTAURANT_ADDRESS=Av. Providencia 1234, Santiago
RESTAURANT_PHONE=+56912345678
RESTAURANT_EMAIL=contacto@labellaitalia.cl

# Tema del widget
WIDGET_THEME=red
WIDGET_POSITION=bottom-right
WIDGET_LANGUAGE=es

# Features habilitadas
ENABLE_WHATSAPP=true
ENABLE_PAYMENTS=true
ENABLE_RESERVATIONS=true
ENABLE_DELIVERY=false
```

---

## 📝 DETALLES TÉCNICOS DEL DOCKERFILE BACKEND

### Stage 1: Builder
1. Usa node:20-alpine como base
2. Copia package.json y package-lock.json
3. Ejecuta `npm ci` (instalación limpia y rápida)
4. Copia código fuente
5. Ejecuta `npm run build` (compila TypeScript)
6. Ejecuta `npm prune --production` (elimina devDependencies)

### Stage 2: Production
1. Usa node:20-alpine limpia
2. Instala dumb-init (manejo de señales)
3. Crea usuario nodejs (no-root)
4. Copia solo archivos necesarios del builder:
   - dist/ (código compilado)
   - node_modules/ (solo producción)
   - package.json
5. Crea directorios para logs y uploads
6. Cambia a usuario nodejs
7. Expone puerto 8005
8. Configura health check
9. Inicia con dumb-init

**Resultado:** Imagen optimizada, segura y liviana

---

## 📦 TAMAÑOS ESTIMADOS

| Componente | Tamaño Docker Image |
|------------|---------------------|
| Backend | ~200 MB |
| Admin Panel | ~250 MB |
| Landing Page | ~200 MB |
| PostgreSQL 16 | ~80 MB |
| Redis 7 | ~30 MB |
| Ollama | ~500 MB |
| **TOTAL** | **~1.3 GB** |

**Nota:** Primera descarga toma tiempo, pero se cachea localmente.

---

## 🚀 PRÓXIMOS PASOS (Esta Sesión)

1. ✅ Dockerfile Backend - COMPLETADO
2. ⏳ Dockerfile Admin Panel - EN PROGRESO
3. 📝 Dockerfile Landing Page - SIGUIENTE
4. 📝 docker-compose.yml completo
5. 📝 Scripts de instalación
6. 📝 Documentación de uso

---

## 📁 ESTRUCTURA DE ARCHIVOS

```
ChatBotDysa/
├── apps/
│   ├── backend/
│   │   ├── Dockerfile ✅
│   │   ├── .dockerignore ✅
│   │   └── .env.production.example ✅
│   ├── admin-panel/
│   │   ├── Dockerfile ⏳
│   │   └── .dockerignore ⏳
│   └── landing-page/
│       ├── Dockerfile 📝
│       └── .dockerignore 📝
├── docker-compose.yml 📝
└── scripts/
    ├── install-windows.bat 📝
    ├── install-macos.sh 📝
    └── install-linux.sh 📝
```

---

## ⏱️ TIEMPO ESTIMADO

- ✅ Backend Dockerfile: 15 minutos
- ⏳ Admin Panel Dockerfile: 15 minutos
- 📝 Landing Dockerfile: 15 minutos
- 📝 docker-compose.yml: 30 minutos
- 📝 Scripts instalación: 30 minutos
- 📝 Testing: 1 hora

**Total:** ~3 horas para tener el instalador completo

---

**Guardado en:** `/Users/devlmer/ChatBotDysa/Reportes/Sesiones/2025-10-04_Creacion_Instaladores/`
**Hora:** 00:10 hrs
**Estado:** Backend dockerizado, continuando con Admin Panel...
