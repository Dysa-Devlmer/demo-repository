# 🧪 Guía Completa de Pruebas del Ecosistema ChatBotDysa

**Fecha**: 13 de Octubre, 2025 - 00:03
**Versión**: 1.0.0
**Estado**: ✅ Listo para usar

---

## 📋 ÍNDICE

1. [Verificación Rápida del Sistema](#verificación-rápida-del-sistema)
2. [Pruebas por Servicio](#pruebas-por-servicio)
3. [Pruebas de Integración](#pruebas-de-integración)
4. [Pruebas de Seguridad](#pruebas-de-seguridad)
5. [Pruebas de Rendimiento](#pruebas-de-rendimiento)
6. [Troubleshooting](#troubleshooting)

---

## 🚀 VERIFICACIÓN RÁPIDA DEL SISTEMA

### 1. Estado de Servicios Docker

```bash
# Ver todos los servicios corriendo
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Resultado esperado:
# NAMES                  STATUS                  PORTS
# chatbotdysa-backend    Up XX hours (healthy)   0.0.0.0:8005->8005/tcp
# chatbotdysa-postgres   Up XX hours (healthy)   0.0.0.0:15432->5432/tcp
# chatbotdysa-redis      Up XX hours             0.0.0.0:16379->6379/tcp
# chatbotdysa-landing    Up XX hours (healthy)   0.0.0.0:3004->3004/tcp
# chatbotdysa-ollama     Up XX hours             0.0.0.0:21434->11434/tcp
```

### 2. Health Check Global

```bash
# Script rápido para verificar todos los servicios
echo "🔍 Verificando servicios..."
echo ""

echo "Backend API:"
curl -s http://localhost:8005/health | jq '.'
echo ""

echo "Admin Panel:"
curl -I http://localhost:7001 2>/dev/null | head -1
echo ""

echo "Landing Page:"
curl -I http://localhost:3004 2>/dev/null | head -1
echo ""

echo "PostgreSQL:"
docker exec chatbotdysa-postgres pg_isready -U postgres
echo ""

echo "Redis:"
docker exec chatbotdysa-redis redis-cli ping
echo ""

echo "Ollama:"
curl -s http://localhost:21434/api/version | jq '.'
```

**✅ Todo OK si**:
- Backend: Status `ok`
- Admin Panel: `HTTP/1.1 200 OK`
- Landing Page: `HTTP/1.1 200 OK`
- PostgreSQL: `accepting connections`
- Redis: `PONG`
- Ollama: Retorna versión

---

## 🔧 PRUEBAS POR SERVICIO

### 🎯 BACKEND API (Puerto 8005)

#### 1. Health Check
```bash
curl http://localhost:8005/health | jq '.'
```

**Respuesta esperada**:
```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "redis": { "status": "up" },
    "ollama": { "status": "up" }
  },
  "error": {},
  "details": {
    "database": { "status": "up" },
    "redis": { "status": "up" },
    "ollama": { "status": "up" }
  }
}
```

#### 2. Root Endpoint
```bash
curl http://localhost:8005 | jq '.'
```

**Respuesta esperada**:
```json
{
  "success": true,
  "data": {
    "service": "ChatBotDysa Backend API",
    "version": "1.0.0",
    "environment": "production",
    "status": "operational"
  }
}
```

#### 3. Documentación API (Swagger)
```bash
# Abrir en navegador
open http://localhost:8005/docs
```

#### 4. Login con Credenciales Válidas
```bash
curl -X POST http://localhost:8005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@zgamersa.com",
    "password": "admin123"
  }' | jq '.'
```

**Respuesta esperada**:
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "admin@zgamersa.com",
      "firstName": "Admin",
      "lastName": "System",
      "roles": ["admin"]
    }
  }
}
```

#### 5. Probar Rate Limiter
```bash
# Hacer 51 intentos fallidos para activar rate limiter
for i in {1..51}; do
  curl -s -X POST http://localhost:8005/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}' > /dev/null
  echo -n "."
done
echo ""

# Verificar bloqueo
curl -X POST http://localhost:8005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrong"}' | jq '.'
```

**Respuesta esperada**: HTTP 429 con información detallada
```json
{
  "statusCode": 429,
  "message": "Demasiados intentos. Por favor, espera 15 segundos...",
  "error": "Límite de Solicitudes Excedido",
  "retryAfter": 15,
  "failedAttempts": 1
}
```

#### 6. Endpoints Principales del Backend

```bash
# Obtener JWT token primero
JWT=$(curl -s -X POST http://localhost:8005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@zgamersa.com","password":"admin123"}' | jq -r '.data.access_token')

# Dashboard Stats
curl -H "Authorization: Bearer $JWT" \
  http://localhost:8005/api/dashboard/stats | jq '.'

# Customers
curl -H "Authorization: Bearer $JWT" \
  http://localhost:8005/api/customers | jq '.'

# Menu Items
curl -H "Authorization: Bearer $JWT" \
  http://localhost:8005/api/menu | jq '.'

# Orders
curl -H "Authorization: Bearer $JWT" \
  http://localhost:8005/api/orders | jq '.'

# Reservations
curl -H "Authorization: Bearer $JWT" \
  http://localhost:8005/api/reservations | jq '.'

# Users
curl -H "Authorization: Bearer $JWT" \
  http://localhost:8005/api/users | jq '.'
```

---

### 🖥️ ADMIN PANEL (Puerto 7001)

#### 1. Verificar acceso
```bash
curl -I http://localhost:7001
```

**Respuesta esperada**: `HTTP/1.1 200 OK`

#### 2. Abrir en navegador
```bash
open http://localhost:7001
```

#### 3. Test de Login UI

1. **Abrir**: http://localhost:7001/login
2. **Credenciales**:
   - Email: `admin@zgamersa.com`
   - Password: `admin123`
3. **Verificar**: Redirección a dashboard después de login exitoso

#### 4. Navegación por todas las páginas

```bash
# Verificar todas las rutas principales
for page in "" login customers menu orders reservations analytics settings ai-chat; do
  echo "Testing: /$page"
  curl -I http://localhost:7001/$page 2>/dev/null | head -1
done
```

#### 5. Test de Funcionalidades

**Dashboard**:
- ✅ Estadísticas cargan correctamente
- ✅ Gráficos se renderizan
- ✅ Datos en tiempo real

**Customers**:
- ✅ Listado de clientes
- ✅ Búsqueda funciona
- ✅ Crear nuevo cliente
- ✅ Editar cliente existente
- ✅ Eliminar cliente

**Menu**:
- ✅ Listado de items del menú
- ✅ Categorías visibles
- ✅ Crear nuevo item
- ✅ Upload de imágenes
- ✅ Editar precios

**Orders**:
- ✅ Listado de órdenes
- ✅ Filtros por estado
- ✅ Ver detalles de orden
- ✅ Actualizar estado

**Reservations**:
- ✅ Calendario de reservas
- ✅ Crear nueva reserva
- ✅ Confirmar/Cancelar reservas

**AI Chat**:
- ✅ Chat con Ollama funciona
- ✅ Respuestas coherentes
- ✅ Historial de conversación

**Settings**:
- ✅ Configuración general
- ✅ Usuarios y roles
- ✅ Permisos

---

### 🌐 LANDING PAGE (Puerto 3004)

#### 1. Verificar acceso
```bash
curl -I http://localhost:3004
```

#### 2. Abrir en navegador
```bash
open http://localhost:3004
```

#### 3. Verificar secciones

```bash
# Verificar todas las rutas
for page in "" about features pricing contact; do
  echo "Testing: /$page"
  curl -I http://localhost:3004/$page 2>/dev/null | head -1
done
```

#### 4. Test de Formulario de Contacto

1. **Abrir**: http://localhost:3004/contact
2. **Llenar formulario**:
   - Nombre
   - Email
   - Mensaje
3. **Enviar**: Verificar que se envía correctamente

---

### 🗄️ POSTGRESQL (Puerto 15432)

#### 1. Conectar a la base de datos
```bash
docker exec -it chatbotdysa-postgres psql -U postgres -d chatbotdysa
```

#### 2. Verificar tablas
```sql
-- Listar todas las tablas
\dt

-- Ver estructura de tabla users
\d users

-- Contar registros
SELECT
  'users' as table_name, COUNT(*) as records FROM users
UNION ALL
SELECT 'customers', COUNT(*) FROM customers
UNION ALL
SELECT 'menu_items', COUNT(*) FROM menu_items
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'reservations', COUNT(*) FROM reservations;
```

#### 3. Verificar usuario admin
```bash
docker exec chatbotdysa-postgres psql -U postgres -d chatbotdysa -c \
  "SELECT id, email, \"firstName\", \"lastName\", roles, status FROM users WHERE email = 'admin@zgamersa.com';"
```

#### 4. Backup de base de datos
```bash
# Crear backup
docker exec chatbotdysa-postgres pg_dump -U postgres chatbotdysa > backup_$(date +%Y%m%d_%H%M%S).sql

# Verificar backup
ls -lh backup_*.sql
```

---

### 🔴 REDIS (Puerto 16379)

#### 1. Conectar a Redis
```bash
docker exec -it chatbotdysa-redis redis-cli
```

#### 2. Comandos básicos
```bash
# Verificar conexión
docker exec chatbotdysa-redis redis-cli ping

# Ver todas las keys
docker exec chatbotdysa-redis redis-cli KEYS '*'

# Obtener info del servidor
docker exec chatbotdysa-redis redis-cli INFO | grep -E "redis_version|used_memory_human|connected_clients"

# Ver keys de rate limiting
docker exec chatbotdysa-redis redis-cli KEYS 'ratelimit:*'
```

#### 3. Limpiar cache (si es necesario)
```bash
# CUIDADO: Esto elimina TODAS las keys
docker exec chatbotdysa-redis redis-cli FLUSHALL

# Eliminar solo keys de rate limiting
docker exec chatbotdysa-redis redis-cli --scan --pattern 'ratelimit:*' | xargs -L 1 docker exec -i chatbotdysa-redis redis-cli DEL
```

---

### 🤖 OLLAMA (Puerto 21434)

#### 1. Verificar versión
```bash
curl http://localhost:21434/api/version | jq '.'
```

#### 2. Listar modelos disponibles
```bash
curl http://localhost:21434/api/tags | jq '.models'
```

#### 3. Test de chat
```bash
curl -X POST http://localhost:21434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "phi3:mini",
    "prompt": "Explica en una oración qué es un chatbot",
    "stream": false
  }' | jq '.response'
```

#### 4. Descargar modelo (si no existe)
```bash
docker exec chatbotdysa-ollama ollama pull phi3:mini
```

---

## 🔗 PRUEBAS DE INTEGRACIÓN

### 1. Flujo Completo de Login

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:8005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@zgamersa.com","password":"admin123"}' \
  | jq -r '.data.access_token')

echo "Token obtenido: ${TOKEN:0:50}..."

# 2. Obtener perfil
curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:8005/api/auth/profile | jq '.'

# 3. Acceder a recursos protegidos
curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:8005/api/dashboard/stats | jq '.'
```

### 2. Flujo de Creación de Cliente

```bash
# 1. Obtener token
JWT=$(curl -s -X POST http://localhost:8005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@zgamersa.com","password":"admin123"}' \
  | jq -r '.data.access_token')

# 2. Crear cliente
CUSTOMER_ID=$(curl -s -X POST http://localhost:8005/api/customers \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan.perez@example.com",
    "phone": "+56912345678"
  }' | jq -r '.data.id')

echo "Cliente creado con ID: $CUSTOMER_ID"

# 3. Obtener cliente
curl -s -H "Authorization: Bearer $JWT" \
  http://localhost:8005/api/customers/$CUSTOMER_ID | jq '.'

# 4. Actualizar cliente
curl -s -X PATCH http://localhost:8005/api/customers/$CUSTOMER_ID \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"phone": "+56987654321"}' | jq '.'

# 5. Eliminar cliente (opcional)
# curl -X DELETE -H "Authorization: Bearer $JWT" \
#   http://localhost:8005/api/customers/$CUSTOMER_ID
```

### 3. Flujo de Orden Completa

```bash
JWT=$(curl -s -X POST http://localhost:8005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@zgamersa.com","password":"admin123"}' \
  | jq -r '.data.access_token')

# 1. Obtener menú disponible
curl -s -H "Authorization: Bearer $JWT" \
  http://localhost:8005/api/menu | jq '.data[0:3]'

# 2. Crear orden
ORDER_ID=$(curl -s -X POST http://localhost:8005/api/orders \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "items": [
      {"menuItemId": 1, "quantity": 2, "notes": "Sin cebolla"},
      {"menuItemId": 2, "quantity": 1}
    ],
    "deliveryAddress": "Calle Falsa 123",
    "paymentMethod": "cash"
  }' | jq -r '.data.id')

echo "Orden creada con ID: $ORDER_ID"

# 3. Actualizar estado de orden
curl -s -X PATCH http://localhost:8005/api/orders/$ORDER_ID/status \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"status": "preparing"}' | jq '.'
```

### 4. Flujo de Chat con IA

```bash
JWT=$(curl -s -X POST http://localhost:8005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@zgamersa.com","password":"admin123"}' \
  | jq -r '.data.access_token')

# Crear conversación
CONVERSATION_ID=$(curl -s -X POST http://localhost:8005/api/conversations \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "channel": "web"
  }' | jq -r '.data.id')

echo "Conversación creada: $CONVERSATION_ID"

# Enviar mensaje
curl -s -X POST http://localhost:8005/api/conversations/$CONVERSATION_ID/messages \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hola, quisiera hacer una reserva para 4 personas"
  }' | jq '.'
```

---

## 🔒 PRUEBAS DE SEGURIDAD

### 1. Test de Autenticación

```bash
# 1. Acceso sin token (debe fallar)
curl -s http://localhost:8005/api/customers | jq '.'
# Esperado: 401 Unauthorized

# 2. Token inválido (debe fallar)
curl -s -H "Authorization: Bearer invalid_token_xyz" \
  http://localhost:8005/api/customers | jq '.'
# Esperado: 401 Unauthorized

# 3. Token expirado (debe fallar)
# Token expira después de 1 hora por defecto
```

### 2. Test de Rate Limiting

```bash
# Test progresivo del rate limiter
echo "🔒 Test de Rate Limiter Progresivo"
echo "Haciendo 51 intentos para activar bloqueo..."

for i in {1..51}; do
  curl -s -X POST http://localhost:8005/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}' > /dev/null
done

echo "Verificando primer bloqueo (15s):"
curl -s -X POST http://localhost:8005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrong"}' | jq '.retryAfter'

echo "Esperando 16 segundos..."
sleep 16

echo "Intentando nuevamente (51 intentos más):"
for i in {1..51}; do
  curl -s -X POST http://localhost:8005/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}' > /dev/null
done

echo "Verificando segundo bloqueo (30s):"
curl -s -X POST http://localhost:8005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrong"}' | jq '.retryAfter'
```

### 3. Test de Permisos

```bash
JWT=$(curl -s -X POST http://localhost:8005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@zgamersa.com","password":"admin123"}' \
  | jq -r '.data.access_token')

# Verificar acceso a endpoints de admin
echo "Test de permisos de admin:"

curl -s -H "Authorization: Bearer $JWT" \
  http://localhost:8005/api/users | jq '.success'

curl -s -H "Authorization: Bearer $JWT" \
  http://localhost:8005/api/settings | jq '.success'
```

### 4. Test de SQL Injection

```bash
# Intentar SQL injection en login (debe ser sanitizado)
curl -X POST http://localhost:8005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@zgamersa.com OR 1=1--",
    "password": "anything"
  }' | jq '.'
# Esperado: Error de login, NO debe dar acceso
```

---

## ⚡ PRUEBAS DE RENDIMIENTO

### 1. Test de Carga Simple

```bash
# Instalar Apache Bench si no está disponible
# macOS: brew install httpd
# Linux: sudo apt-get install apache2-utils

# Test con 100 requests, 10 concurrent
ab -n 100 -c 10 http://localhost:8005/health
```

### 2. Test de Carga en Login

```bash
# Crear archivo con datos de login
cat > /tmp/login.json << EOF
{
  "email": "admin@zgamersa.com",
  "password": "admin123"
}
EOF

# Test de carga
ab -n 50 -c 5 -p /tmp/login.json -T application/json \
  http://localhost:8005/api/auth/login
```

### 3. Monitoreo de Recursos

```bash
# Ver uso de CPU y memoria de cada contenedor
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Logs en tiempo real
docker logs -f chatbotdysa-backend --tail 50
```

---

## 🔧 TROUBLESHOOTING

### Problema: Servicio no responde

```bash
# 1. Verificar si está corriendo
docker ps | grep chatbotdysa

# 2. Ver logs
docker logs chatbotdysa-backend --tail 100

# 3. Reiniciar servicio
docker-compose restart backend

# 4. Verificar health
curl http://localhost:8005/health
```

### Problema: Base de datos no conecta

```bash
# 1. Verificar postgres está corriendo
docker ps | grep postgres

# 2. Verificar conexión
docker exec chatbotdysa-postgres pg_isready -U postgres

# 3. Ver logs
docker logs chatbotdysa-postgres --tail 50

# 4. Conectar manualmente
docker exec -it chatbotdysa-postgres psql -U postgres -d chatbotdysa
```

### Problema: Redis no responde

```bash
# 1. Verificar redis
docker exec chatbotdysa-redis redis-cli ping

# 2. Limpiar cache si es necesario
docker exec chatbotdysa-redis redis-cli FLUSHALL

# 3. Reiniciar
docker-compose restart redis
```

### Problema: Ollama no genera respuestas

```bash
# 1. Verificar modelo descargado
curl http://localhost:21434/api/tags

# 2. Descargar modelo si falta
docker exec chatbotdysa-ollama ollama pull phi3:mini

# 3. Ver logs
docker logs chatbotdysa-ollama --tail 50
```

### Problema: Admin Panel error 500

```bash
# 1. Ver logs del container
docker logs chatbotdysa-admin --tail 100

# 2. Verificar variables de entorno
docker exec chatbotdysa-admin env | grep NEXT_PUBLIC

# 3. Rebuild si es necesario
docker-compose build --no-cache admin-panel
docker-compose up -d admin-panel
```

---

## 📊 SCRIPT DE VERIFICACIÓN COMPLETA

Guarda este script como `test-ecosystem.sh`:

```bash
#!/bin/bash

echo "🔍 ChatBotDysa - Verificación Completa del Ecosistema"
echo "=================================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar servicio
check_service() {
    local name=$1
    local url=$2
    local expected=$3

    echo -n "Verificando $name... "

    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)

    if [ "$response" = "$expected" ]; then
        echo -e "${GREEN}✅ OK${NC} (HTTP $response)"
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (HTTP $response, esperado $expected)"
        return 1
    fi
}

# Contadores
total=0
passed=0

# 1. Docker Services
echo "📦 1. Servicios Docker"
echo "----------------------"
docker ps --format "table {{.Names}}\t{{.Status}}" | grep chatbotdysa
echo ""

# 2. Backend
echo "🎯 2. Backend API"
echo "----------------------"
((total++))
check_service "Health Check" "http://localhost:8005/health" "200" && ((passed++))
((total++))
check_service "Root Endpoint" "http://localhost:8005" "200" && ((passed++))
echo ""

# 3. Admin Panel
echo "🖥️  3. Admin Panel"
echo "----------------------"
((total++))
check_service "Home Page" "http://localhost:7001" "200" && ((passed++))
echo ""

# 4. Landing Page
echo "🌐 4. Landing Page"
echo "----------------------"
((total++))
check_service "Home Page" "http://localhost:3004" "200" && ((passed++))
echo ""

# 5. Database
echo "🗄️  5. PostgreSQL"
echo "----------------------"
echo -n "Verificando conexión... "
if docker exec chatbotdysa-postgres pg_isready -U postgres &>/dev/null; then
    echo -e "${GREEN}✅ OK${NC}"
    ((total++))
    ((passed++))
else
    echo -e "${RED}❌ FAIL${NC}"
    ((total++))
fi
echo ""

# 6. Redis
echo "🔴 6. Redis"
echo "----------------------"
echo -n "Verificando conexión... "
if [ "$(docker exec chatbotdysa-redis redis-cli ping 2>/dev/null)" = "PONG" ]; then
    echo -e "${GREEN}✅ OK${NC}"
    ((total++))
    ((passed++))
else
    echo -e "${RED}❌ FAIL${NC}"
    ((total++))
fi
echo ""

# 7. Ollama
echo "🤖 7. Ollama AI"
echo "----------------------"
((total++))
check_service "Version" "http://localhost:21434/api/version" "200" && ((passed++))
echo ""

# 8. Test de Login
echo "🔐 8. Test de Login"
echo "----------------------"
echo -n "Login con credenciales válidas... "
login_response=$(curl -s -X POST http://localhost:8005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@zgamersa.com","password":"admin123"}')

if echo "$login_response" | jq -e '.data.access_token' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ OK${NC}"
    ((total++))
    ((passed++))
else
    echo -e "${RED}❌ FAIL${NC}"
    ((total++))
fi
echo ""

# Resumen
echo "=================================================="
echo "📊 RESUMEN"
echo "=================================================="
echo "Total de pruebas: $total"
echo -e "Exitosas: ${GREEN}$passed${NC}"
echo -e "Fallidas: ${RED}$((total - passed))${NC}"
echo ""

if [ $passed -eq $total ]; then
    echo -e "${GREEN}✅ TODOS LOS SERVICIOS FUNCIONANDO CORRECTAMENTE${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  ALGUNOS SERVICIOS PRESENTAN PROBLEMAS${NC}"
    exit 1
fi
```

**Usar el script**:
```bash
chmod +x test-ecosystem.sh
./test-ecosystem.sh
```

---

## 📞 CREDENCIALES Y ACCESOS

### Credenciales de Admin
- **Email**: `admin@zgamersa.com`
- **Password**: `admin123`
- **Roles**: `admin`
- **Permisos**: Todos

### URLs de Acceso
- **Backend API**: http://localhost:8005
- **API Docs**: http://localhost:8005/docs
- **Admin Panel**: http://localhost:7001
- **Landing Page**: http://localhost:3004

### Puertos de Servicios
- **Backend**: 8005
- **Admin Panel**: 7001
- **Landing Page**: 3004
- **PostgreSQL**: 15432
- **Redis**: 16379
- **Ollama**: 21434

---

**FIN DE LA GUÍA DE PRUEBAS**

✅ Guía completa para probar todo el ecosistema ChatBotDysa Enterprise
