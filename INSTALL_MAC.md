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

# Verificar instalación
node --version   # Debe mostrar v20.x.x
npm --version    # Debe mostrar 10.x.x
```

### 3. **Docker Desktop**
```bash
brew install --cask docker
```

**Importante**: Luego abre Docker Desktop desde Aplicaciones y espera a que inicie completamente (ícono verde).

### 4. **Git**
```bash
brew install git
git --version
```

### 5. **Ollama** (AI Local - Opcional)
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

## 💾 PASO 0: RESPALDAR PROYECTO ACTUAL (Si ya tienes uno)

Si ya tienes una instalación previa de ChatBotDysa:

```bash
# Crear respaldo con fecha
cd /Users/devlmer/
mv ChatBotDysa ChatBotDysa_backup_$(date +%Y%m%d_%H%M%S)

# Verificar que se creó el respaldo
ls -la | grep ChatBotDysa
```

---

## 📥 PASO 1: CLONAR EL REPOSITORIO

```bash
# Ir al directorio donde quieres el proyecto
cd /Users/devlmer/

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

### Opción B: Manual (Configuración Detallada)

#### 2.1 Generar Secrets Seguros

Primero, genera todos los secrets que necesitarás:

```bash
echo "=== COPIA ESTOS VALORES ==="
echo ""
echo "JWT_SECRET:"
openssl rand -base64 32
echo ""
echo "ENCRYPTION_KEY:"
openssl rand -hex 32
echo ""
echo "NEXTAUTH_SECRET (Admin):"
openssl rand -base64 32
echo ""
echo "NEXTAUTH_SECRET (Website):"
openssl rand -base64 32
echo ""
echo "==========================="
```

**Guarda estos valores, los necesitarás en los siguientes pasos.**

#### 2.2 Backend - Crear .env

```bash
cd /Users/devlmer/ChatBotDysa/apps/backend

# Copiar el ejemplo
cp .env.example .env

# Abrir para editar
nano .env
```

**Edita SOLO estas líneas con tus valores:**

```bash
# ================================
# VALORES REQUERIDOS:
# ================================

# Contraseña de tu base de datos (usa una segura)
DATABASE_PASSWORD=TuPasswordSegura123!

# JWT Secret (pega el que generaste)
JWT_SECRET=PEGA_AQUI_EL_RESULTADO_DEL_COMANDO

# Encryption Key (pega el que generaste)
ENCRYPTION_KEY=PEGA_AQUI_EL_RESULTADO

# ================================
# OPCIONALES (para funcionalidades específicas):
# ================================

# Ollama AI (si instalaste Ollama)
OLLAMA_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3:8b

# MercadoPago (si vas a procesar pagos)
# Obtener en: https://www.mercadopago.cl/developers/panel/credentials
MERCADOPAGO_PUBLIC_KEY=TU_PUBLIC_KEY
MERCADOPAGO_ACCESS_TOKEN=TU_ACCESS_TOKEN

# SendGrid (si vas a enviar emails)
# Obtener en: https://app.sendgrid.com/settings/api_keys
SENDGRID_API_KEY=TU_API_KEY
SENDGRID_FROM_EMAIL=noreply@turestaurante.com

# WhatsApp Business API (si vas a usar WhatsApp)
# Obtener en: https://developers.facebook.com/
WA_ACCESS_TOKEN=TU_ACCESS_TOKEN
WA_BUSINESS_PHONE_ID=TU_PHONE_ID
WA_WEBHOOK_VERIFY_TOKEN=chatbotdysa_webhook_verify_2024
```

Guardar: `Ctrl + O`, `Enter`, `Ctrl + X`

#### 2.3 Admin Panel - Crear .env.local

```bash
cd /Users/devlmer/ChatBotDysa/apps/admin-panel

# Copiar el ejemplo
cp .env.example .env.local

# Abrir para editar
nano .env.local
```

**Edita estas líneas:**

```bash
# API del backend
NEXT_PUBLIC_API_URL=http://localhost:8005

# URLs de la aplicación
NEXT_PUBLIC_APP_URL=http://localhost:7001
NEXT_PUBLIC_ADMIN_URL=http://localhost:7001
NEXT_PUBLIC_WEBSITE_URL=http://localhost:6001

# NextAuth (pega un secret diferente al del backend)
NEXTAUTH_SECRET=PEGA_AQUI_NEXTAUTH_SECRET_ADMIN
NEXTAUTH_URL=http://localhost:7001
```

Guardar: `Ctrl + O`, `Enter`, `Ctrl + X`

#### 2.4 Website - Crear .env.local

```bash
cd /Users/devlmer/ChatBotDysa/apps/website

# Copiar el ejemplo
cp .env.example .env.local

# Abrir para editar
nano .env.local
```

**Edita estas líneas:**

```bash
# API del backend
NEXT_PUBLIC_API_URL=http://localhost:8005/api
NEXT_PUBLIC_API_BASE_URL=http://localhost:8005

# URLs
NEXT_PUBLIC_APP_URL=http://localhost:7001
NEXT_PUBLIC_WEBSITE_URL=http://localhost:6001

# Base de datos (misma contraseña que el backend)
DATABASE_URL=postgresql://postgres:TuPasswordSegura123!@localhost:15432/chatbotdysa

# NextAuth (pega otro secret diferente)
NEXTAUTH_SECRET=PEGA_AQUI_NEXTAUTH_SECRET_WEBSITE
NEXTAUTH_URL=http://localhost:6001
```

Guardar: `Ctrl + O`, `Enter`, `Ctrl + X`

---

## 🐳 PASO 3: INICIAR SERVICIOS DE BASE DE DATOS

### 3.1 Verificar Docker Desktop

Asegúrate de que Docker Desktop esté corriendo (debe tener un ícono verde).

### 3.2 Iniciar PostgreSQL y Redis

```bash
cd /Users/devlmer/ChatBotDysa

# Iniciar PostgreSQL y Redis
docker-compose up -d postgres redis

# Verificar que estén corriendo
docker ps
```

Deberías ver algo como:

```
CONTAINER ID   IMAGE           PORTS                     NAMES
xxxx           postgres:16     0.0.0.0:15432->5432/tcp   chatbotdysa-postgres
xxxx           redis:7         0.0.0.0:16379->6379/tcp   chatbotdysa-redis
```

### 3.3 Crear la Base de Datos

```bash
# Conectar a PostgreSQL y crear la base de datos
docker exec -it chatbotdysa-postgres psql -U postgres -c "CREATE DATABASE chatbotdysa;"

# Verificar que se creó correctamente
docker exec -it chatbotdysa-postgres psql -U postgres -c "\l"
```

Si ves `chatbotdysa` en la lista, ¡está listo!

---

## 📦 PASO 4: INSTALAR DEPENDENCIAS

```bash
# Volver a la raíz del proyecto
cd /Users/devlmer/ChatBotDysa

# Instalar dependencias del backend
cd apps/backend
npm install

# Instalar dependencias del admin panel
cd ../admin-panel
npm install

# Instalar dependencias del website
cd ../website
npm install

# Volver a la raíz
cd ../..
```

**Nota**: Este proceso puede tardar varios minutos dependiendo de tu conexión a internet.

---

## 🗄️ PASO 5: CONFIGURAR BASE DE DATOS

```bash
cd /Users/devlmer/ChatBotDysa/apps/backend

# Compilar el proyecto
npm run build

# Ejecutar migraciones (crear tablas)
npm run typeorm:run

# Si no hay migraciones definidas, sincronizar directamente (solo desarrollo)
npm run typeorm:sync
```

**Nota**: Si ves el error "TypeORM cannot find entities", ejecuta:

```bash
rm -rf dist/
npm run build
npm run typeorm:sync
```

---

## 🚀 PASO 6: INICIAR LOS SERVICIOS

Necesitarás **3 terminales** separadas:

### Terminal 1 - Backend API
```bash
cd /Users/devlmer/ChatBotDysa/apps/backend
npm run start:dev

# Corre en: http://localhost:8005
# API Docs (Swagger): http://localhost:8005/api
```

### Terminal 2 - Admin Panel
```bash
cd /Users/devlmer/ChatBotDysa/apps/admin-panel
npm run dev

# Corre en: http://localhost:7001
```

### Terminal 3 - Website (Opcional)
```bash
cd /Users/devlmer/ChatBotDysa/apps/website
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

### Opción 1: Si existe seed/usuario por defecto

Intenta iniciar sesión con las credenciales por defecto:

```
Email: admin@zgamersa.com
Password: Admin123456
```

### Opción 2: Crear nuevo usuario vía API

Si no existe usuario por defecto, créalo:

```bash
curl -X POST http://localhost:8005/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Administrador",
    "email": "admin@turestaurante.com",
    "phone": "+56912345678",
    "password": "Admin123!"
  }'
```

**Requisitos de contraseña:**
- ✅ Mínimo 8 caracteres
- ✅ Al menos 1 mayúscula
- ✅ Al menos 1 minúscula
- ✅ Al menos 1 número
- ✅ Al menos 1 caracter especial (!@#$%^&*)

### Opción 3: Si tienes script de seed

```bash
cd /Users/devlmer/ChatBotDysa/apps/backend
npm run seed
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
# Abre Docker Desktop y reinícialo desde el menú
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

### ❌ Error: "Base de datos no existe"
```bash
docker exec -it chatbotdysa-postgres psql -U postgres -c "CREATE DATABASE chatbotdysa;"
```

### ❌ Error: "Permisos de node_modules"
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 🔑 CREDENCIALES EXTERNAS (Opcionales)

Estas credenciales son opcionales y solo necesarias si vas a usar las funcionalidades específicas:

| Servicio        | Para qué sirve           | Dónde obtener                               |
|-----------------|--------------------------|---------------------------------------------|
| MercadoPago     | Procesar pagos           | https://www.mercadopago.cl/developers       |
| SendGrid        | Enviar emails            | https://app.sendgrid.com                    |
| WhatsApp API    | Chat por WhatsApp        | https://developers.facebook.com             |
| Ollama          | Chatbot IA local         | brew install ollama                          |
| Google Analytics| Métricas del sitio       | https://analytics.google.com                |
| Sentry          | Tracking de errores      | https://sentry.io                           |

---

## ✅ CHECKLIST FINAL

Antes de considerar que todo está funcionando, verifica:

**Requisitos previos:**
- [ ] Homebrew instalado
- [ ] Node.js 20+ instalado
- [ ] Docker Desktop corriendo (ícono verde)
- [ ] Git instalado

**Configuración:**
- [ ] Repositorio clonado
- [ ] `.env` creado en `apps/backend/`
- [ ] `.env.local` creado en `apps/admin-panel/`
- [ ] `.env.local` creado en `apps/website/`
- [ ] Secrets generados y configurados (JWT_SECRET, ENCRYPTION_KEY, NEXTAUTH_SECRET)

**Servicios:**
- [ ] PostgreSQL corriendo (docker ps)
- [ ] Redis corriendo (docker ps)
- [ ] Base de datos `chatbotdysa` creada
- [ ] Migraciones ejecutadas

**Dependencias:**
- [ ] `npm install` ejecutado en `apps/backend`
- [ ] `npm install` ejecutado en `apps/admin-panel`
- [ ] `npm install` ejecutado en `apps/website`

**Servicios activos:**
- [ ] Backend respondiendo en http://localhost:8005 (curl http://localhost:8005/health)
- [ ] Admin Panel cargando en http://localhost:7001
- [ ] Website cargando en http://localhost:6001 (opcional)

**Autenticación:**
- [ ] Usuario administrador creado
- [ ] Login funcionando en Admin Panel

---

## 📁 ARCHIVOS DE CONFIGURACIÓN

Estos archivos deben existir y estar configurados:

| Archivo                         | Ubicación                        | Copiar de       |
|---------------------------------|----------------------------------|-----------------|
| `.env`                          | `apps/backend/`                  | `.env.example`  |
| `.env.local`                    | `apps/admin-panel/`              | `.env.example`  |
| `.env.local`                    | `apps/website/`                  | `.env.example`  |

**⚠️ IMPORTANTE**: Nunca subas archivos `.env` o `.env.local` a Git. Ya están en `.gitignore`.

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
