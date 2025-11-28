# 🔍 Pruebas de Botones de Estado de Servicios
## Admin Panel - Página de Configuración

**Fecha**: 11 de Octubre, 2025 - 01:25
**Ubicación**: `/dashboard/settings`
**Archivo**: `apps/admin-panel/src/app/settings/page.tsx`

---

## 📊 Resumen

La página de **Configuración** (Settings) del Admin Panel contiene botones de prueba para verificar el estado de TODOS los servicios del sistema.

---

## 🎯 Servicios con Botones de Prueba

### 1. WhatsApp Business API ✅
**Card**: "WhatsApp Business API"
**Icono**: MessageSquare
**Estado Posible**: connected | disconnected | error

**Botón de Prueba**:
- **Texto**: "Probar"
- **Icono**: TestTube
- **Acción**: `testConnection('whatsapp')`
- **Endpoint**: `POST /api/settings/test/whatsapp`

**Badge de Estado**:
- 🟢 **Conectado**: `<Badge className="bg-green-500">✓ Conectado</Badge>`
- ⚪ **Desconectado**: `<Badge variant="secondary">○ No configurado (esperado en desarrollo)</Badge>`
- 🔴 **Error**: `<Badge variant="destructive">✗ Error de conexión</Badge>`

**Funcionalidades Adicionales**:
- Enviar mensaje de prueba
- Enviar menú de prueba
- Requiere número de teléfono de prueba

---

### 2. Twilio Voice API ✅
**Card**: "Twilio Voice API"
**Icono**: Phone
**Estado Posible**: connected | disconnected | error

**Botón de Prueba**:
- **Texto**: "Probar"
- **Icono**: TestTube
- **Acción**: `testConnection('twilio')`
- **Endpoint**: `POST /api/settings/test/twilio`

**Badge de Estado**:
- Igual que WhatsApp

---

### 3. Ollama AI ✅
**Card**: "Ollama AI"
**Icono**: Bot
**Estado Posible**: connected | disconnected | error

**Botón de Prueba**:
- **Texto**: "Probar"
- **Icono**: TestTube
- **Acción**: `testConnection('ollama')`
- **Endpoint**: `POST /api/settings/test/ollama`

**Badge de Estado**:
- Igual que WhatsApp

**Configuración**:
- URL de Ollama (default: `http://localhost:11434`)
- Modelo (ej: `llama3.2`, `llama2`)

---

### 4. Base de Datos (PostgreSQL) ✅
**Card**: "Base de Datos"
**Icono**: Database
**Estado Posible**: connected | disconnected | error

**Botón de Prueba**:
- **Texto**: "Probar"
- **Icono**: TestTube
- **Acción**: `testConnection('database')`
- **Endpoint**: `POST /api/settings/test/database`

**Badge de Estado**:
- Igual que WhatsApp

**Configuración**:
- Host
- Puerto (default: 5432)
- Nombre de base de datos

---

## 🧪 Plan de Pruebas Detallado

### Pre-requisitos

**Servicios que deben estar corriendo**:
```bash
# 1. Backend API (puerto 8005)
cd apps/backend && npm run start:dev

# 2. PostgreSQL (puerto 15432)
docker-compose up -d postgres

# 3. Redis (puerto 16379) - opcional
docker-compose up -d redis

# 4. Ollama (puerto 11434) - opcional para pruebas de IA
ollama serve

# 5. Admin Panel (puerto 7001)
cd apps/admin-panel && npm run dev
```

---

### Prueba 1: WhatsApp Business API

#### Paso 1: Navegar a Settings
```
URL: http://localhost:7001/dashboard/settings
```

#### Paso 2: Ubicar Card de WhatsApp
- Buscar card con título "WhatsApp Business API"
- Verificar que tenga icono de MessageSquare
- Verificar que badge de estado esté visible

#### Paso 3: Verificar Campos
**Campos a verificar**:
- [ ] Número de Teléfono
- [ ] Token de Acceso (tipo password)
- [ ] Badge de estado (inicialmente "disconnected")

#### Paso 4: Clic en Botón "Probar"
**Acción**: Clic en botón "Probar" (con icono TestTube)

**Resultado Esperado (sin WhatsApp configurado)**:
```javascript
// Notificación toast
{
  title: "❌ Error en la prueba",
  description: "No se puede conectar al backend (puerto 8005)...",
  variant: "destructive"
}

// Badge cambia a:
status: 'error'
<Badge variant="destructive">✗ Error de conexión</Badge>
```

**Resultado Esperado (con backend corriendo)**:
```javascript
// Request
POST http://localhost:8005/api/settings/test/whatsapp
Content-Type: application/json

// Response esperado
{
  "success": true/false,
  "status": "connected" | "disconnected" | "error",
  "message": "Mensaje de resultado"
}

// Si success: true
{
  title: "✅ Prueba exitosa",
  description: "Conexión con whatsapp exitosa"
}

// Badge actualizado
<Badge className="bg-green-500">✓ Conectado</Badge>
```

#### Paso 5: Probar Mensajes de WhatsApp
**Pre-requisito**: Ingresar número de prueba

**Campo**: "Número de prueba (con código de país)"
**Ejemplo**: `+52 55 1234 5678`

**Botón 1**: "Enviar mensaje de prueba"
- Endpoint: `POST /api/settings/whatsapp/test-message`
- Body: `{ "to": "+52 55 1234 5678" }`

**Botón 2**: "Enviar menú de prueba"
- Endpoint: `POST /api/settings/whatsapp/test-menu`
- Body: `{ "to": "+52 55 1234 5678" }`

---

### Prueba 2: Twilio Voice API

#### Paso 1: Ubicar Card de Twilio
- Buscar card con título "Twilio Voice API"
- Verificar icono de Phone
- Verificar badge de estado

#### Paso 2: Verificar Campos
- [ ] Account SID (tipo password)
- [ ] Auth Token (tipo password)
- [ ] Badge de estado

#### Paso 3: Clic en Botón "Probar"
**Request**:
```
POST http://localhost:8005/api/settings/test/twilio
```

**Verificaciones**:
- [ ] Request enviado al backend
- [ ] Toast de notificación aparece
- [ ] Badge de estado actualiza
- [ ] Error manejado si backend no responde

**Resultado con Twilio configurado**:
- Badge: ✓ Conectado (verde)
- Toast: "✅ Prueba exitosa - Conexión con twilio exitosa"

**Resultado sin Twilio configurado**:
- Badge: ○ No configurado
- Toast: Mensaje apropiado

---

### Prueba 3: Ollama AI

#### Paso 1: Ubicar Card de Ollama
- Card: "Ollama AI"
- Icono: Bot
- Badge de estado visible

#### Paso 2: Verificar Campos
- [ ] URL de Ollama (default: `http://localhost:11434`)
- [ ] Modelo (ej: `llama3.2`)

#### Paso 3: Clic en Botón "Probar"
**Request**:
```
POST http://localhost:8005/api/settings/test/ollama
```

**Escenarios a Probar**:

**A. Ollama NO corriendo**:
```javascript
// Badge
status: 'error'
<Badge variant="destructive">✗ Error de conexión</Badge>

// Toast
{
  title: "❌ Error en la prueba",
  description: "No se puede conectar a Ollama...",
  variant: "destructive"
}
```

**B. Ollama corriendo (ollama serve)**:
```javascript
// Badge
status: 'connected'
<Badge className="bg-green-500">✓ Conectado</Badge>

// Toast
{
  title: "✅ Prueba exitosa",
  description: "Conexión con ollama exitosa"
}
```

**Comandos para probar**:
```bash
# Verificar si Ollama está corriendo
lsof -ti:11434

# Si no está, iniciar Ollama
ollama serve

# En otra terminal, verificar modelo
ollama list
```

---

### Prueba 4: Base de Datos (PostgreSQL)

#### Paso 1: Ubicar Card de Database
- Card: "Base de Datos"
- Icono: Database
- Badge de estado

#### Paso 2: Verificar Campos
- [ ] Host (ejemplo: `localhost`)
- [ ] Puerto (default: `5432` o `15432`)
- [ ] Base de Datos (ejemplo: `chatbotdysa`)

#### Paso 3: Clic en Botón "Probar"
**Request**:
```
POST http://localhost:8005/api/settings/test/database
```

**Escenarios**:

**A. PostgreSQL NO corriendo**:
```javascript
status: 'error'
Badge: ✗ Error de conexión
Toast: Error de conexión con base de datos
```

**B. PostgreSQL corriendo**:
```javascript
status: 'connected'
Badge: ✓ Conectado (verde)
Toast: ✅ Prueba exitosa - Conexión con database exitosa
```

**Verificar PostgreSQL**:
```bash
# Ver si está corriendo
lsof -ti:15432

# Si no, iniciar con Docker
docker-compose up -d postgres

# Verificar conexión
psql -h localhost -p 15432 -U postgres -d chatbotdysa
```

---

## 🎨 Estados de los Badges

### Función getStatusBadge()

```typescript
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'connected':
      return <Badge className="bg-green-500">✓ Conectado</Badge>;
    case 'disconnected':
      return <Badge variant="secondary">○ No configurado (esperado en desarrollo)</Badge>;
    case 'error':
      return <Badge variant="destructive">✗ Error de conexión</Badge>;
    default:
      return <Badge variant="outline">? Desconocido</Badge>;
  }
}
```

### Colores y Significados

| Estado | Color | Icono | Significado |
|--------|-------|-------|-------------|
| `connected` | 🟢 Verde | ✓ | Servicio funcionando correctamente |
| `disconnected` | ⚪ Gris | ○ | No configurado (normal en desarrollo) |
| `error` | 🔴 Rojo | ✗ | Error de conexión al servicio |
| `unknown` | ⚪ Outline | ? | Estado desconocido |

---

## 🔄 Flujo de Prueba Completo

### Flujo Cuando Backend ESTÁ Corriendo

```
1. Usuario carga página /dashboard/settings
2. Página hace GET /api/settings para cargar configuraciones
3. Settings cargadas → formularios poblados
4. Usuario ve badges en estado "disconnected" (por defecto)
5. Usuario hace clic en "Probar" de un servicio
6. Frontend envía POST /api/settings/test/{service}
7. Backend verifica conexión con el servicio real
8. Backend responde con { success: true/false, status, message }
9. Frontend actualiza badge según respuesta
10. Toast notification muestra resultado
```

### Flujo Cuando Backend NO está Corriendo

```
1. Usuario carga página /dashboard/settings
2. GET /api/settings falla (backend apagado)
3. Toast de error: "No se pudieron cargar las configuraciones"
4. Se usan valores por defecto
5. Usuario hace clic en "Probar"
6. Fetch falla (Connection refused)
7. Catch captura el error
8. Badge actualiza a 'error'
9. Toast: "No se puede conectar al backend (puerto 8005)..."
```

---

## 📋 Checklist de Verificación

### Verificación Visual
- [ ] Todas las cards visibles
- [ ] Iconos correctos en cada card
- [ ] Badges de estado visibles
- [ ] Botones "Probar" visibles
- [ ] Campos de formulario renderizados

### Verificación Funcional
- [ ] Botón "Probar" de WhatsApp funciona
- [ ] Botón "Probar" de Twilio funciona
- [ ] Botón "Probar" de Ollama funciona
- [ ] Botón "Probar" de Database funciona

### Verificación de Estados
- [ ] Badge actualiza de "disconnected" a "connected"
- [ ] Badge actualiza a "error" cuando falla
- [ ] Estados persisten visualmente
- [ ] Colores correctos según estado

### Verificación de Notificaciones
- [ ] Toast aparece después de prueba
- [ ] Título correcto según resultado
- [ ] Descripción clara y útil
- [ ] Variant correcto (success/destructive)
- [ ] Toast se auto-cierra

### Verificación de Errores
- [ ] Backend apagado → error claro
- [ ] Servicio no disponible → mensaje apropiado
- [ ] Timeout manejado correctamente
- [ ] No crash de aplicación

---

## 🧪 Casos de Prueba Específicos

### Caso 1: Todos los Servicios Apagados
**Condiciones**:
- Backend apagado
- PostgreSQL apagado
- Ollama apagado

**Resultado Esperado**:
- Página carga con valores por defecto
- Todos los badges en "disconnected"
- Botones "Probar" hacen request pero fallan
- Toast de error para cada uno
- Badges cambian a "error"

### Caso 2: Solo Backend Corriendo
**Condiciones**:
- Backend: ✅ Corriendo (puerto 8005)
- PostgreSQL: ❌ Apagado
- Ollama: ❌ Apagado

**Resultado Esperado**:
- Settings cargan del backend
- WhatsApp/Twilio: responden según configuración
- Database test: falla (error de conexión)
- Ollama test: falla (no disponible)

### Caso 3: Todos los Servicios Corriendo
**Condiciones**:
- Backend: ✅
- PostgreSQL: ✅
- Ollama: ✅

**Resultado Esperado**:
- Todas las pruebas exitosas
- Todos los badges en "connected" (verde)
- Toast de éxito para cada servicio

---

## 🔧 Endpoints del Backend a Verificar

### 1. GET /api/settings
**Propósito**: Cargar configuraciones del sistema
**Response**:
```json
[
  {
    "key": "restaurant_name",
    "value": "ZG Amers Restaurant",
    "category": "restaurant",
    "status": "active"
  },
  {
    "key": "ollama_url",
    "value": "http://localhost:11434",
    "category": "ollama",
    "status": "active"
  }
  // ... más settings
]
```

### 2. POST /api/settings/test/{service}
**Servicios**: `whatsapp`, `twilio`, `ollama`, `database`
**Response**:
```json
{
  "success": true,
  "status": "connected",
  "message": "Conexión exitosa con {service}"
}
```

### 3. POST /api/settings/whatsapp/test-message
**Body**: `{ "to": "+52 55 1234 5678" }`
**Response**:
```json
{
  "success": true,
  "message": "Mensaje de prueba enviado exitosamente"
}
```

### 4. POST /api/settings/whatsapp/test-menu
**Body**: `{ "to": "+52 55 1234 5678" }`
**Response**:
```json
{
  "success": true,
  "message": "Menú de prueba enviado exitosamente"
}
```

---

## 📝 Comandos de Verificación Rápida

```bash
# 1. Verificar servicios corriendo
echo "=== SERVICIOS ==="
lsof -ti:8005 && echo "✅ Backend (8005)" || echo "❌ Backend"
lsof -ti:15432 && echo "✅ PostgreSQL (15432)" || echo "❌ PostgreSQL"
lsof -ti:11434 && echo "✅ Ollama (11434)" || echo "❌ Ollama"
lsof -ti:7001 && echo "✅ Admin Panel (7001)" || echo "❌ Admin Panel"

# 2. Iniciar servicios necesarios
# Backend
cd apps/backend && npm run start:dev &

# PostgreSQL
docker-compose up -d postgres

# Ollama (opcional)
ollama serve &

# Admin Panel
cd apps/admin-panel && npm run dev

# 3. Probar endpoints manualmente
curl http://localhost:8005/api/health
curl -X POST http://localhost:8005/api/settings/test/database
curl -X POST http://localhost:8005/api/settings/test/ollama
```

---

## ✅ Resumen de Funcionalidades

### Servicios Testeables
1. ✅ WhatsApp Business API
2. ✅ Twilio Voice API
3. ✅ Ollama AI
4. ✅ PostgreSQL Database

### Acciones Disponibles
- ✅ Ver estado actual (badge)
- ✅ Probar conexión (botón)
- ✅ Ver resultado (toast)
- ✅ Actualizar configuración
- ✅ Guardar cambios
- ✅ Enviar mensajes de prueba (WhatsApp)

### Estados Manejados
- ✅ Conectado (green badge)
- ✅ Desconectado (gray badge)
- ✅ Error (red badge)
- ✅ Loading states
- ✅ Error handling completo

---

**ChatBotDysa Enterprise+++++**
*Documentación de Pruebas - Botones de Estado de Servicios*

© 2025 ChatBotDysa - Todos los derechos reservados

**Última actualización:** 11 de Octubre, 2025 - 01:25
**Ubicación:** `/dashboard/settings` en Admin Panel
**Autor:** Devlmer + Claude Code
