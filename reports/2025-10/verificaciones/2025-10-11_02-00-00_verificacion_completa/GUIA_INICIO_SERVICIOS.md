# 🚀 Guía de Inicio de Todos los Servicios

**Fecha**: 11 de Octubre, 2025 - 02:00
**Objetivo**: Iniciar todos los servicios necesarios para pruebas completas

---

## ✅ SÍ, NECESITAS TODOS LOS SERVICIOS CORRIENDO

Para probar **TODO** el sistema necesitas estos servicios activos:

### Servicios Backend (Infraestructura)
1. ✅ **Docker Desktop** - Orquestador de contenedores
2. ✅ **PostgreSQL** (puerto 15432) - Base de datos
3. ✅ **Redis** (puerto 16379) - Cache y sesiones
4. ✅ **Backend API** (puerto 8005) - API NestJS

### Servicios Frontend (Aplicaciones)
5. ✅ **Admin Panel** (puerto 7001) - Panel administrativo
6. ✅ **Landing Page** (puerto 3000) - Página de aterrizaje
7. ✅ **Website** (puerto 3001) - Sitio web principal

### Servicios Opcionales
8. ⚪ **Ollama AI** (puerto 11434) - Para pruebas de IA
9. ⚪ **Web Widget** - Si se necesita probar el widget

---

## 📋 ORDEN CORRECTO DE INICIO

### PASO 1: Docker Desktop (PRIMERO)

```bash
# Abrir Docker Desktop
open -a Docker

# Esperar a que Docker esté listo
# El ícono en la barra superior debe estar quieto (no animado)

# Verificar que funciona
docker ps
# Debe mostrar una tabla (puede estar vacía)
```

⚠️ **IMPORTANTE**: Si Docker no está corriendo, NADA más funcionará.

---

### PASO 2: Base de Datos y Cache

```bash
cd /Users/devlmer/ChatBotDysa

# Iniciar PostgreSQL y Redis con Docker Compose
docker-compose up -d postgres redis

# Verificar que están corriendo
docker ps

# Deberías ver:
# chatbotdysa-postgres (15432->5432)
# chatbotdysa-redis (16379->6379)
```

**Verificación**:
```bash
# PostgreSQL
lsof -ti:15432 && echo "✅ PostgreSQL OK" || echo "❌ No corriendo"

# Redis
lsof -ti:16379 && echo "✅ Redis OK" || echo "❌ No corriendo"
```

---

### PASO 3: Backend API

```bash
cd /Users/devlmer/ChatBotDysa/apps/backend

# Matar cualquier proceso previo
pkill -f "nest start"

# Iniciar en modo desarrollo
npm run start:dev

# ESPERAR a ver este mensaje:
# [Nest] LOG [NestApplication] Nest application successfully started
# [Nest] LOG Application is running on: http://localhost:8005
```

**Verificación Backend** (en otra terminal):
```bash
# Health check
curl http://localhost:8005/api/health

# Debe responder algo como:
# {"status":"ok","database":"connected","redis":"connected"}

# Verificar puerto
lsof -ti:8005 && echo "✅ Backend corriendo en 8005"
```

⏱️ **Tiempo estimado**: 20-30 segundos para iniciar

---

### PASO 4: Admin Panel

```bash
cd /Users/devlmer/ChatBotDysa/apps/admin-panel

npm run dev

# ESPERAR a ver:
# ✓ Ready in Xms
# ○ Local:   http://localhost:7001
# ○ Network: http://192.168.x.x:7001
```

**Verificación**:
```bash
# En navegador o curl
curl http://localhost:7001

# Debe retornar HTML (página de login)

# Verificar puerto
lsof -ti:7001 && echo "✅ Admin Panel en 7001"
```

⏱️ **Tiempo estimado**: 5-10 segundos

---

### PASO 5: Landing Page

```bash
cd /Users/devlmer/ChatBotDysa/apps/landing-page

npm run dev

# ESPERAR a ver:
# ✓ Ready in Xms
# ○ Local:   http://localhost:3000
```

**Verificación**:
```bash
curl http://localhost:3000

lsof -ti:3000 && echo "✅ Landing Page en 3000"
```

⏱️ **Tiempo estimado**: 5-10 segundos

---

### PASO 6: Website

```bash
cd /Users/devlmer/ChatBotDysa/apps/website

npm run dev

# ESPERAR a ver:
# ✓ Ready in Xms
# ○ Local:   http://localhost:3001
```

**Verificación**:
```bash
curl http://localhost:3001

lsof -ti:3001 && echo "✅ Website en 3001"
```

⏱️ **Tiempo estimado**: 5-10 segundos

---

### PASO 7 (Opcional): Ollama AI

```bash
# Iniciar Ollama (si está instalado)
ollama serve

# En otra terminal, verificar
ollama list

# Si no tienes el modelo, descargarlo
ollama pull llama3.2
```

**Verificación**:
```bash
lsof -ti:11434 && echo "✅ Ollama en 11434"

# Test de IA
curl http://localhost:11434/api/tags
```

---

## 🔍 SCRIPT DE VERIFICACIÓN COMPLETA

### Script Automatizado

Crea este archivo: `/tmp/verify-all-services.sh`

```bash
#!/bin/bash

echo "╔══════════════════════════════════════════════════════╗"
echo "║    VERIFICACIÓN COMPLETA DE SERVICIOS                ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Función de verificación
check_service() {
    local port=$1
    local name=$2

    if lsof -ti:$port > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $name (puerto $port)${NC}"
        return 0
    else
        echo -e "${RED}❌ $name (puerto $port)${NC}"
        return 1
    fi
}

echo "=== SERVICIOS BACKEND ==="
check_service 15432 "PostgreSQL"
check_service 16379 "Redis"
check_service 8005 "Backend API"

echo ""
echo "=== SERVICIOS FRONTEND ==="
check_service 7001 "Admin Panel"
check_service 3000 "Landing Page"
check_service 3001 "Website"

echo ""
echo "=== SERVICIOS OPCIONALES ==="
check_service 11434 "Ollama AI" || echo "  (No requerido)"

echo ""
echo "=== HEALTH CHECKS ==="

# Backend health
if curl -s http://localhost:8005/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend API responde${NC}"
else
    echo -e "${RED}❌ Backend API no responde${NC}"
fi

# Admin Panel
if curl -s http://localhost:7001 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Admin Panel responde${NC}"
else
    echo -e "${RED}❌ Admin Panel no responde${NC}"
fi

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║    VERIFICACIÓN COMPLETADA                           ║"
echo "╚══════════════════════════════════════════════════════╝"
```

**Usar el script**:
```bash
chmod +x /tmp/verify-all-services.sh
/tmp/verify-all-services.sh
```

---

## 📊 ORDEN DE INICIO VISUAL

```
1. Docker Desktop
   ↓
2. PostgreSQL + Redis (docker-compose)
   ↓
3. Backend API (npm run start:dev)
   ↓
4. Admin Panel (npm run dev)
   ↓
5. Landing Page (npm run dev)
   ↓
6. Website (npm run dev)
   ↓
7. Ollama AI (opcional)
```

---

## ⚠️ PROBLEMAS COMUNES Y SOLUCIONES

### Problema 1: "Docker daemon not running"
```bash
# Solución:
open -a Docker
# Esperar a que el ícono esté quieto

# Verificar:
docker ps
```

### Problema 2: "Port already in use"
```bash
# Ver qué proceso usa el puerto
lsof -ti:8005

# Matar el proceso
kill -9 $(lsof -ti:8005)

# O específico para Node:
pkill -f "nest start"
pkill -f "next dev"
```

### Problema 3: "Database connection failed"
```bash
# Verificar PostgreSQL
docker ps | grep postgres

# Ver logs
docker logs chatbotdysa-postgres

# Reiniciar PostgreSQL
docker-compose restart postgres
```

### Problema 4: "Cannot find module"
```bash
# Reinstalar dependencias
cd apps/backend
npm install

cd ../admin-panel
npm install
```

### Problema 5: Backend no inicia (loop de reintentos)
```bash
# Problema: PostgreSQL no está listo
# Solución: Esperar 10 segundos después de iniciar Docker

# O verificar que PostgreSQL está UP
docker ps | grep postgres | grep "Up"
```

---

## 🎯 CHECKLIST RÁPIDO DE INICIO

Usa este checklist para iniciar todo:

### Pre-inicio
- [ ] Docker Desktop instalado
- [ ] Node.js instalado (v18+)
- [ ] npm disponible

### Inicio Paso a Paso
- [ ] 1. Abrir Docker Desktop
- [ ] 2. Esperar Docker listo (ícono quieto)
- [ ] 3. `docker-compose up -d postgres redis`
- [ ] 4. Esperar 10 segundos
- [ ] 5. Verificar PostgreSQL: `lsof -ti:15432`
- [ ] 6. Iniciar Backend: `cd apps/backend && npm run start:dev`
- [ ] 7. Esperar mensaje "successfully started"
- [ ] 8. Verificar Backend: `curl localhost:8005/api/health`
- [ ] 9. Iniciar Admin: `cd apps/admin-panel && npm run dev`
- [ ] 10. Iniciar Landing: `cd apps/landing-page && npm run dev`
- [ ] 11. Iniciar Website: `cd apps/website && npm run dev`

### Verificación Final
- [ ] Todos los servicios en `lsof` check
- [ ] Backend responde en `/api/health`
- [ ] Admin Panel carga en navegador
- [ ] Landing Page carga
- [ ] Website carga

---

## 🚀 SCRIPT DE INICIO AUTOMATIZADO

### Script Completo de Inicio

Crea: `/tmp/start-all-services.sh`

```bash
#!/bin/bash

echo "🚀 Iniciando todos los servicios..."
echo ""

# 1. Verificar Docker
echo "1. Verificando Docker..."
if ! docker ps > /dev/null 2>&1; then
    echo "⚠️  Docker no está corriendo"
    echo "   Iniciando Docker Desktop..."
    open -a Docker
    echo "   Esperando a Docker..."
    sleep 10
fi

# 2. Iniciar PostgreSQL y Redis
echo ""
echo "2. Iniciando PostgreSQL y Redis..."
cd /Users/devlmer/ChatBotDysa
docker-compose up -d postgres redis
sleep 5

# 3. Verificar DB
echo ""
echo "3. Verificando base de datos..."
if lsof -ti:15432 > /dev/null 2>&1; then
    echo "✅ PostgreSQL corriendo"
else
    echo "❌ PostgreSQL no inició"
    exit 1
fi

# 4. Iniciar Backend
echo ""
echo "4. Iniciando Backend API..."
cd /Users/devlmer/ChatBotDysa/apps/backend
pkill -f "nest start" 2>/dev/null
npm run start:dev > /tmp/backend.log 2>&1 &
sleep 15

# 5. Verificar Backend
echo ""
echo "5. Verificando Backend..."
if curl -s http://localhost:8005/api/health > /dev/null 2>&1; then
    echo "✅ Backend API corriendo"
else
    echo "❌ Backend no responde"
    echo "   Ver logs: tail -f /tmp/backend.log"
fi

# 6. Iniciar Admin Panel
echo ""
echo "6. Iniciando Admin Panel..."
cd /Users/devlmer/ChatBotDysa/apps/admin-panel
pkill -f "next-server" 2>/dev/null
npm run dev > /tmp/admin.log 2>&1 &
sleep 10

# 7. Iniciar Landing
echo ""
echo "7. Iniciando Landing Page..."
cd /Users/devlmer/ChatBotDysa/apps/landing-page
npm run dev > /tmp/landing.log 2>&1 &
sleep 5

# 8. Iniciar Website
echo ""
echo "8. Iniciando Website..."
cd /Users/devlmer/ChatBotDysa/apps/website
npm run dev > /tmp/website.log 2>&1 &
sleep 5

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║    ✅ TODOS LOS SERVICIOS INICIADOS                  ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "📊 URLs disponibles:"
echo "   Backend:      http://localhost:8005"
echo "   Admin Panel:  http://localhost:7001"
echo "   Landing:      http://localhost:3000"
echo "   Website:      http://localhost:3001"
echo ""
echo "📝 Ver logs:"
echo "   Backend:  tail -f /tmp/backend.log"
echo "   Admin:    tail -f /tmp/admin.log"
echo "   Landing:  tail -f /tmp/landing.log"
echo "   Website:  tail -f /tmp/website.log"
```

**Ejecutar**:
```bash
chmod +x /tmp/start-all-services.sh
/tmp/start-all-services.sh
```

---

## ⏱️ TIEMPOS ESTIMADOS

| Servicio | Tiempo de Inicio | Orden |
|----------|------------------|-------|
| Docker Desktop | 10-30 segundos | 1° |
| PostgreSQL | 3-5 segundos | 2° |
| Redis | 2-3 segundos | 2° |
| Backend API | 20-30 segundos | 3° |
| Admin Panel | 10-15 segundos | 4° |
| Landing Page | 5-10 segundos | 5° |
| Website | 5-10 segundos | 6° |

**TOTAL**: ~1-2 minutos para tener todo corriendo

---

## ✅ RESUMEN

### Para Probar TODO Necesitas:

1. ✅ **Docker Desktop** - Base de todo
2. ✅ **PostgreSQL** - Datos
3. ✅ **Redis** - Cache (opcional pero recomendado)
4. ✅ **Backend API** - Lógica de negocio
5. ✅ **Admin Panel** - Interfaz de administración
6. ✅ **Landing Page** - (Para probar landing)
7. ✅ **Website** - (Para probar website)

### Sin Estos Servicios:
- ❌ No puedes probar botones de estado
- ❌ No puedes probar CRUD operations
- ❌ No puedes probar notificaciones
- ❌ No puedes probar sincronización
- ❌ No puedes hacer login
- ❌ No hay datos para mostrar

### Una Vez Todo Corriendo:
- ✅ Puedes probar TODA la funcionalidad
- ✅ Login, CRUD, botones, notificaciones
- ✅ Todo sincronizado en tiempo real
- ✅ Frontends comunicándose con backend
- ✅ Base de datos con datos reales

---

**ChatBotDysa Enterprise+++++**
*Guía de Inicio de Todos los Servicios*

© 2025 ChatBotDysa - Todos los derechos reservados

**Última actualización:** 11 de Octubre, 2025 - 02:00
**Autor:** Devlmer + Claude Code
**Tiempo total estimado:** 1-2 minutos
