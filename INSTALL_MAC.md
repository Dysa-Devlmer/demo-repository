# 🚀 Guía de Instalación en macOS - ChatBotDysa

Esta guía te llevará paso a paso para instalar y ejecutar ChatBotDysa en tu Mac desde cero.

---

## 📋 REQUISITOS PREVIOS

Antes de comenzar, asegúrate de tener instalado:

### 1. **Homebrew** (gestor de paquetes de macOS)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. **Node.js 20+**
```bash
brew install node@20
node --version  # Debe mostrar 20.x o superior
```

### 3. **Docker Desktop**
```bash
brew install --cask docker
# Luego abre Docker Desktop desde Aplicaciones
```

### 4. **Git**
```bash
brew install git
git --version
```

### 5. **Ollama** (AI Local)
```bash
brew install ollama
ollama pull llama3:8b
ollama serve &  # Ejecutar en background
```

Verificar que Ollama esté corriendo:
```bash
curl http://localhost:11434/api/version
# Debe responder con la versión
```

---

## 📥 PASO 1: CLONAR EL REPOSITORIO

```bash
# Ir al directorio donde quieres el proyecto
cd /Users/TU_USUARIO/

# Clonar el repositorio
git clone https://github.com/Dysa-Devlmer/demo-repository.git ChatBotDysa

# Entrar al proyecto
cd ChatBotDysa
```

---

## ⚙️ PASO 2: CONFIGURAR VARIABLES DE ENTORNO

### Opción A: Automático (Recomendado)

```bash
# Ejecutar script de configuración
./setup-env.sh
```

Este script:
- ✅ Crea archivos `.env` desde los `.env.example`
- ✅ Genera secrets seguros automáticamente  
- ✅ Configura todos los servicios

### Opción B: Manual

```bash
# Backend
cd apps/backend
cp .env.example .env
nano .env  # Editar manualmente

# Admin Panel
cd ../admin-panel
cp .env.example .env.local
nano .env.local

# Website
cd ../website
cp .env.example .env.local
nano .env.local

cd ../..
```

**Valores mínimos a configurar en `apps/backend/.env`:**

```bash
DATABASE_PORT=15432
DATABASE_PASSWORD=supersecret
JWT_SECRET=<generar con: openssl rand -base64 64>
OLLAMA_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3:8b
```

---

## 🐳 PASO 3: INICIAR SERVICIOS DE BASE DE DATOS

```bash
# Asegúrate de que Docker Desktop esté corriendo

# Iniciar PostgreSQL y Redis
docker-compose up -d postgres redis

# Verificar que estén corriendo
docker ps

# Deberías ver:
# chatbotdysa-postgres  en puerto 15432
# chatbotdysa-redis     en puerto 16379
```

---

## 📦 PASO 4: INSTALAR DEPENDENCIAS

```bash
# Desde la raíz del proyecto

# Si usas npm workspaces (monorepo):
npm install

# O instalar en cada app por separado:
cd apps/backend && npm install && cd ../..
cd apps/admin-panel && npm install && cd ../..
cd apps/website && npm install && cd ../..
```

---

## 🗄️ PASO 5: CONFIGURAR BASE DE DATOS

```bash
cd apps/backend

# Ejecutar migraciones
npm run typeorm:run

# O sincronizar directamente (solo desarrollo)
npm run typeorm:sync
```

---

## 🚀 PASO 6: INICIAR LOS SERVICIOS

Necesitarás **3 terminales** separadas:

### Terminal 1 - Backend API
```bash
cd /Users/TU_USUARIO/ChatBotDysa/apps/backend
npm run start:dev

# Corre en: http://localhost:8005
# API Docs (Swagger): http://localhost:8005/api
```

### Terminal 2 - Admin Panel
```bash
cd /Users/TU_USUARIO/ChatBotDysa/apps/admin-panel
npm run dev

# Corre en: http://localhost:7001
```

### Terminal 3 - Website (Opcional)
```bash
cd /Users/TU_USUARIO/ChatBotDysa/apps/website
npm run dev

# Corre en: http://localhost:6001
```

---

## ✅ PASO 7: VERIFICAR QUE TODO FUNCIONA

### Backend Health Check
```bash
curl http://localhost:8005/health
# Debe responder: {"status":"ok"}
```

### Probar en el navegador:
1. **Backend API**: http://localhost:8005/api
2. **Admin Panel**: http://localhost:7001
3. **Website**: http://localhost:6001

---

## 👤 PASO 8: CREAR USUARIO ADMINISTRADOR

### Opción 1: Vía API
```bash
curl -X POST http://localhost:8005/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "email": "admin@tucorreo.com",
    "phone": "+56912345678",
    "password": "Admin123!"
  }'
```

### Opción 2: Login con usuario por defecto
```
Email: admin@zgamersa.com
Password: Admin123456
```

---

## 📱 PASO 9: CONFIGURAR WHATSAPP (Opcional)

Para que el chatbot de WhatsApp funcione:

### 1. Instalar ngrok (para exponer localhost)
```bash
brew install ngrok
ngrok http 8005
```

### 2. Copiar la URL pública que da ngrok
```
Forwarding: https://abc123.ngrok.io -> http://localhost:8005
```

### 3. Configurar en Facebook Developer Console
- Ir a: https://developers.facebook.com/apps/
- Configurar Webhook URL: `https://abc123.ngrok.io/api/whatsapp/webhook`
- Verificar token: `chatbotdysa_webhook_verify_2024`

---

## 🧪 PRUEBAS RÁPIDAS

### Test completo del sistema:
```bash
# Backend Health
curl http://localhost:8005/health

# Login
curl -X POST http://localhost:8005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@zgamersa.com","password":"Admin123456"}'

# Obtener menú
curl http://localhost:8005/api/menu
```

---

## 📊 RESUMEN DE PUERTOS

| Servicio      | Puerto | URL                           |
|---------------|--------|-------------------------------|
| PostgreSQL    | 15432  | localhost:15432               |
| Redis         | 16379  | localhost:16379               |
| Ollama        | 11434  | http://localhost:11434        |
| Backend API   | 8005   | http://localhost:8005         |
| Admin Panel   | 7001   | http://localhost:7001         |
| Website       | 6001   | http://localhost:6001         |

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### ❌ Error: "Puerto ya en uso"
```bash
# Encontrar proceso en el puerto
lsof -i :8005

# Matar el proceso
kill -9 <PID>
```

### ❌ Error: "Cannot connect to Docker"
```bash
# Verificar que Docker Desktop esté corriendo
docker ps

# Reiniciar Docker Desktop si es necesario
```

### ❌ Error: "Ollama not found"
```bash
# Verificar que Ollama esté corriendo
curl http://localhost:11434/api/version

# Si no responde, iniciar Ollama:
ollama serve &
```

### ❌ Error: "Database connection failed"
```bash
# Verificar que PostgreSQL esté corriendo
docker ps | grep postgres

# Ver logs de PostgreSQL
docker logs chatbotdysa-postgres

# Reiniciar PostgreSQL
docker-compose restart postgres
```

### ❌ Error: "TypeORM cannot find entities"
```bash
cd apps/backend
rm -rf dist/
npm run build
npm run typeorm:sync
```

---

## 🎉 ¡LISTO!

Si todos los servicios están corriendo correctamente:

✅ Backend respondiendo en `:8005`  
✅ Admin Panel cargando en `:7001`  
✅ Website cargando en `:6001`  
✅ PostgreSQL y Redis activos  
✅ Ollama sirviendo en `:11434`  

**Puedes comenzar a usar ChatBotDysa!**

---

## 📚 DOCUMENTACIÓN ADICIONAL

- [README Principal](./README.md)
- [Documentación de API](./docs/API.md)
- [Guía de Desarrollo](./docs/DEVELOPMENT.md)

---

## 💬 SOPORTE

Si encuentras algún problema:

1. Revisa la sección de "Solución de Problemas" arriba
2. Verifica los logs:
   - Backend: `tail -f /tmp/backend_production_ready.log`
   - Admin Panel: Consola del navegador (F12)
3. Abre un issue en GitHub con los detalles del error
