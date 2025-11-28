# 🚀 Guía de Inicio Rápido - ChatBotDysa

Configura ChatBotDysa en tu entorno en menos de 10 minutos.

## ⚡ Inicio Rápido

### 1. Pre-requisitos

```bash
# Verificar versiones
node --version  # >= 18.0.0
npm --version   # >= 8.0.0
docker --version # >= 20.0.0
```

### 2. Clonar y Configurar

```bash
# Clonar el repositorio
git clone <tu-repo> ChatBotDysa
cd ChatBotDysa

# Instalar dependencias
npm run install:deps
```

### 3. Iniciar Servicios Base

```bash
# Iniciar PostgreSQL, Redis, Ollama
./start-infrastructure.sh

# O manualmente:
docker run -d --name postgres -p 15432:5432 -e POSTGRES_PASSWORD=supersecret postgres:15
docker run -d --name redis -p 16379:6379 redis:7-alpine
docker run -d --name ollama -p 21434:11434 ollama/ollama:latest
```

### 4. Construir Backend

```bash
cd apps/backend
npm run build
cd ../..
```

### 5. Iniciar Sistema Completo

```bash
# Opción 1: Script automático (Recomendado)
./start-complete-system.sh

# Opción 2: Manual
# Terminal 1 - Backend
cd apps/backend
PORT=8005 DATABASE_HOST=127.0.0.1 DATABASE_PORT=15432 DATABASE_USER=postgres DATABASE_PASSWORD=supersecret DATABASE_NAME=chatbotdysa node dist/main-simple.js

# Terminal 2 - Admin Panel
cd apps/admin-panel
npm run dev -- --port 8002

# Terminal 3 - Web Widget
cd apps/web-widget
npm run dev -- --port 8003
```

## 🌐 Acceder a los Servicios

Una vez iniciado, accede a:

- **🎛️ Panel Administrativo**: [http://localhost:8002](http://localhost:8002)
- **🤖 Web Widget Demo**: [http://localhost:8003](http://localhost:8003)
- **🌐 API Backend**: [http://localhost:8005](http://localhost:8005)
- **📚 Documentación API**: [http://localhost:8005/api-docs](http://localhost:8005/api-docs)
- **🏥 Health Check**: [http://localhost:8005/api/health](http://localhost:8005/api/health)

## ✅ Verificar Instalación

```bash
# Verificar salud del sistema
curl http://localhost:8005/api/health

# Verificar servicios activos
curl http://localhost:8002
curl http://localhost:8003
```

## 🛠️ Configuración Básica

### Variables de Entorno Esenciales

Crea `.env` en la raíz del proyecto:

```env
# Base de Datos
DATABASE_HOST=127.0.0.1
DATABASE_PORT=15432
DATABASE_USER=postgres
DATABASE_PASSWORD=supersecret
DATABASE_NAME=chatbotdysa

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=16379

# AI Service
OLLAMA_URL=http://127.0.0.1:21434

# Seguridad
JWT_SECRET=tu-jwt-secret-super-seguro
SESSION_SECRET=tu-session-secret-super-seguro
ENCRYPTION_KEY=tu-encryption-key-32-chars-long1234

# Puertos
BACKEND_PORT=8005
ADMIN_PORT=8002
WIDGET_PORT=8003
```

## 🔧 Comandos Útiles

```bash
# Parar todo el sistema
./stop-complete-system.sh

# Reiniciar un servicio específico
pm2 restart chatbotdysa-backend

# Ver logs en tiempo real
pm2 logs chatbotdysa-backend

# Estado de servicios
pm2 status

# Verificar puertos en uso
lsof -i :8002,8003,8005
```

## 🚨 Solución de Problemas Comunes

### Puerto en Uso
```bash
# Encontrar proceso usando puerto
lsof -i :8005

# Terminar proceso
kill -9 <PID>
```

### Base de Datos No Conecta
```bash
# Verificar PostgreSQL
docker ps | grep postgres
docker logs postgres

# Reiniciar PostgreSQL
docker restart postgres
```

### Dependencias Faltantes
```bash
# Reinstalar todas las dependencias
rm -rf node_modules apps/*/node_modules
npm run install:deps
```

## 📞 Siguientes Pasos

1. **[Configuración Básica](./configuracion-basica.md)** - Personaliza tu instalación
2. **[Tutorial Completo](../tutoriales/desarrollo-local.md)** - Desarrollo avanzado
3. **[API Reference](../api/referencia-api.md)** - Integra con tu sistema

## 🆘 Obtener Ayuda

- **Documentación**: `/docs/es/`
- **Logs del Sistema**: `pm2 logs`
- **Health Checks**: `http://localhost:8005/api/health`
- **Issues**: GitHub Issues del proyecto

---

¡Listo! 🎉 Tu instalación de ChatBotDysa está funcionando.

*Tiempo estimado de setup: **5-10 minutos***