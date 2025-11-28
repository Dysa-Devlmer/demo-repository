# 🔍 Guía Completa de Verificación del Sistema ChatBotDysa

**Fecha**: 2025-11-06
**Objetivo**: Verificar el 100% del sistema paso a paso
**Incluye**: Todas las páginas web + 3 formas de usar el chatbot

---

## 📋 ÍNDICE

1. [URLs del Sistema](#urls-del-sistema)
2. [Credenciales de Acceso](#credenciales-de-acceso)
3. [Verificación Paso a Paso](#verificación-paso-a-paso)
4. [Las 3 Formas del Chatbot](#las-3-formas-del-chatbot)
5. [Checklist Completo](#checklist-completo)

---

## 🌐 URLs DEL SISTEMA

### Panel de Administración (Admin Panel)
**Base URL**: http://localhost:7001

| # | Página | URL | Descripción |
|---|--------|-----|-------------|
| 1 | Login | http://localhost:7001/login | Inicio de sesión |
| 2 | Dashboard | http://localhost:7001 | Panel principal con estadísticas |
| 3 | Clientes | http://localhost:7001/customers | Gestión de clientes |
| 4 | Menú | http://localhost:7001/menu | Gestión de platillos |
| 5 | Pedidos | http://localhost:7001/orders | Gestión de pedidos |
| 6 | Reservas | http://localhost:7001/reservations | Gestión de reservas |
| 7 | Conversaciones | http://localhost:7001/conversations | Ver chats del bot |
| 8 | Detalle Conversación | http://localhost:7001/conversations/[id] | Ver conversación específica |
| 9 | Analíticas | http://localhost:7001/analytics | Gráficos y métricas |
| 10 | AI Chat | http://localhost:7001/ai-chat | Chat con IA (Admin) |
| 11 | Configuración | http://localhost:7001/settings | Ajustes del sistema |
| 12 | Usuarios | http://localhost:7001/users | Gestión de usuarios |
| 13 | Nuevo Usuario | http://localhost:7001/users/new | Crear usuario |
| 14 | Editar Usuario | http://localhost:7001/users/[id] | Editar usuario específico |
| 15 | Reportes | http://localhost:7001/reports | Lista de reportes |
| 16 | Crear Reporte | http://localhost:7001/reports/builder | Constructor de reportes |
| 17 | Ver Reporte | http://localhost:7001/reports/[id] | Ver reporte específico |
| 18 | Perfil | http://localhost:7001/profile | Perfil del usuario |

### Backend API
**Base URL**: http://localhost:8005

| Endpoint | URL | Descripción |
|----------|-----|-------------|
| Health Check | http://localhost:8005/health | Estado del sistema |
| API Docs | http://localhost:8005/api | Documentación Swagger |
| Auth Login | http://localhost:8005/api/auth/login | Login API |
| Dashboard Stats | http://localhost:8005/api/dashboard/stats | Estadísticas |
| AI Chat | http://localhost:8005/api/ai/chat | Endpoint del chatbot |
| Customers | http://localhost:8005/api/customers | CRUD clientes |
| Menu | http://localhost:8005/api/menu | CRUD menú |
| Orders | http://localhost:8005/api/orders | CRUD pedidos |
| Reservations | http://localhost:8005/api/reservations | CRUD reservas |
| Conversations | http://localhost:8005/api/conversations | CRUD conversaciones |
| Users | http://localhost:8005/api/users | CRUD usuarios |
| Settings | http://localhost:8005/api/settings | Configuración |

### Servicios Adicionales
| Servicio | URL | Descripción |
|----------|-----|-------------|
| PostgreSQL | 127.0.0.1:15432 | Base de datos |
| Redis | 127.0.0.1:16379 | Cache |
| Ollama AI | http://localhost:11434 | Servicio IA local |

---

## 🔑 CREDENCIALES DE ACCESO

### Admin Panel
```
Email: admin@zgamersa.com
Password: Admin123!
```

### PostgreSQL
```
Host: 127.0.0.1
Port: 15432
Database: chatbotdysa
User: postgres
Password: supersecret
```

### API Direct Access
```bash
# Obtener token JWT
curl -X POST http://localhost:8005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@zgamersa.com","password":"Admin123!"}'
```

---

## ✅ VERIFICACIÓN PASO A PASO

### PASO 1: Verificar Servicios Base

#### 1.1 Backend API
```bash
# Verificar que el backend está corriendo
curl http://localhost:8005/health

# Resultado esperado:
# {"status":"ok","timestamp":"2025-11-06T..."}
```

#### 1.2 PostgreSQL
```bash
# Verificar conexión a base de datos
PGPASSWORD=supersecret psql -h 127.0.0.1 -p 15432 -U postgres -d chatbotdysa -c "SELECT 1;"

# Resultado esperado:
# ?column?
# ----------
#         1
```

#### 1.3 Ollama AI
```bash
# Verificar que Ollama está activo
curl http://localhost:11434/api/tags

# Resultado esperado: Lista de modelos instalados
# Debe incluir "llama3:8b"
```

#### 1.4 Admin Panel
```bash
# Verificar que el admin panel está corriendo
curl -I http://localhost:7001

# Resultado esperado:
# HTTP/1.1 200 OK
```

---

### PASO 2: Verificar Páginas del Admin Panel

#### 2.1 Login (http://localhost:7001/login)
**Qué probar**:
- [ ] La página carga sin errores
- [ ] Formulario de login visible
- [ ] Ingresar credenciales: admin@zgamersa.com / Admin123!
- [ ] Redirección al dashboard después del login

**Cómo probar**:
1. Abre http://localhost:7001/login en tu navegador
2. Ingresa email y password
3. Click en "Iniciar Sesión"
4. Verifica que te redirige a http://localhost:7001

---

#### 2.2 Dashboard (http://localhost:7001)
**Qué probar**:
- [ ] Estadísticas visibles (Total Conversaciones, Clientes Activos, etc.)
- [ ] Gráficos se cargan
- [ ] No hay errores en consola del navegador

**Cómo probar**:
1. Después del login, debes estar en el dashboard
2. Abre DevTools (F12) > Console
3. Verifica que no hay errores rojos
4. Observa las tarjetas de estadísticas

---

#### 2.3 Clientes (http://localhost:7001/customers)
**Qué probar**:
- [ ] Lista de clientes carga
- [ ] Buscador funciona
- [ ] Botón "Nuevo Cliente" funciona
- [ ] Editar cliente funciona
- [ ] Eliminar cliente funciona

**Cómo probar**:
1. Click en "Customers" en el menú lateral
2. Verifica que la tabla de clientes se muestra
3. Usa la barra de búsqueda para filtrar
4. Click en "Nuevo Cliente" y completa el formulario
5. Edita un cliente existente
6. (Opcional) Elimina un cliente de prueba

---

#### 2.4 Menú (http://localhost:7001/menu) ✅ CORREGIDO
**Qué probar**:
- [ ] Lista de platillos carga sin errores TypeError
- [ ] Buscador funciona
- [ ] Filtros por categoría funcionan
- [ ] Crear nuevo platillo funciona
- [ ] Editar platillo funciona
- [ ] Cambiar disponibilidad funciona
- [ ] Estadísticas del menú se muestran

**Cómo probar**:
1. Click en "Menu" en el menú lateral
2. **IMPORTANTE**: Verifica que NO aparece el error "Cannot read properties of undefined (reading 'toLowerCase')"
3. Busca un platillo por nombre
4. Filtra por categoría (Platos Principales, Bebidas, etc.)
5. Crea un nuevo platillo con el botón "Agregar Platillo"
6. Edita un platillo existente
7. Activa/Desactiva la disponibilidad de un platillo
8. Revisa las estadísticas al final de la página

---

#### 2.5 Pedidos (http://localhost:7001/orders)
**Qué probar**:
- [ ] Lista de pedidos carga
- [ ] Filtros por estado funcionan
- [ ] Cambiar estado de pedido funciona
- [ ] Ver detalle de pedido funciona

**Cómo probar**:
1. Click en "Orders" en el menú lateral
2. Filtra por estado (Pendiente, En Preparación, etc.)
3. Cambia el estado de un pedido
4. Click en un pedido para ver detalles

---

#### 2.6 Reservas (http://localhost:7001/reservations) ✅ CORREGIDO
**Qué probar**:
- [ ] Lista de reservas carga
- [ ] Filtros funcionan
- [ ] Crear nueva reserva funciona
- [ ] **Cambiar estado de reserva funciona (CORREGIDO)**
- [ ] Editar reserva funciona
- [ ] Eliminar reserva funciona

**Cómo probar**:
1. Click en "Reservations" en el menú lateral
2. **IMPORTANTE**: Cambia el estado de una reserva (Pendiente → Confirmada → Sentado → Completado)
3. **Verifica que NO aparece** "Error al actualizar estado"
4. Crea una nueva reserva
5. Edita una reserva existente
6. Filtra por estado

---

#### 2.7 Conversaciones (http://localhost:7001/conversations)
**Qué probar**:
- [ ] Lista de conversaciones carga
- [ ] Buscador funciona
- [ ] Click en conversación muestra detalle
- [ ] Mensajes se muestran correctamente

**Cómo probar**:
1. Click en "Conversations" en el menú lateral
2. Busca una conversación
3. Click en una conversación para ver el detalle
4. Verifica que los mensajes se muestran en formato chat

---

#### 2.8 Analíticas (http://localhost:7001/analytics)
**Qué probar**:
- [ ] Página carga sin errores
- [ ] Gráficos se renderizan
- [ ] Filtros de fecha funcionan
- [ ] Métricas se actualizan

**Cómo probar**:
1. Click en "Analytics" en el menú lateral
2. Verifica que los gráficos se cargan
3. Cambia el rango de fechas
4. Observa que las métricas se actualizan

---

#### 2.9 AI Chat (http://localhost:7001/ai-chat) ✅ CORREGIDO
**Qué probar**:
- [ ] Página carga
- [ ] **Modelo seleccionado es "Llama 3 8B" (CORREGIDO)**
- [ ] Enviar mensaje funciona
- [ ] Respuestas son contextuales (no genéricas)
- [ ] Cambiar modelo funciona

**Cómo probar**:
1. Click en "AI Chat" en el menú lateral
2. **IMPORTANTE**: Verifica que el selector de modelo muestra "Llama 3 8B" por defecto
3. Envía un mensaje: "¿Cuál es el reporte de ventas de hoy?"
4. Espera la respuesta (30-60 segundos)
5. **Verifica que la respuesta es contextual** (relacionada con análisis de negocio, no genérica)
6. Cambia el modelo a "Phi-3 Mini" y prueba otro mensaje
7. Compara las respuestas

---

#### 2.10 Configuración (http://localhost:7001/settings)
**Qué probar**:
- [ ] Formularios de configuración cargan
- [ ] Actualizar información del restaurante funciona
- [ ] Guardar cambios funciona
- [ ] Configuración de WhatsApp/Twilio visible

**Cómo probar**:
1. Click en "Settings" en el menú lateral
2. Actualiza el nombre del restaurante
3. Guarda los cambios
4. Verifica que aparece mensaje de éxito
5. Recarga la página y verifica que los cambios persisten

---

#### 2.11 Usuarios (http://localhost:7001/users) ✅ CORREGIDO
**Qué probar**:
- [ ] Lista de usuarios carga sin errores TypeError
- [ ] **Badges de roles se muestran correctamente (CORREGIDO)**
- [ ] Buscador funciona
- [ ] Crear nuevo usuario funciona
- [ ] Editar usuario funciona

**Cómo probar**:
1. Click en "Users" en el menú lateral
2. **IMPORTANTE**: Verifica que los badges de roles (Admin, Staff, Viewer) se muestran correctamente
3. **Verifica que NO aparece** el error "role.toLowerCase is not a function"
4. Busca un usuario
5. Click en "Nuevo Usuario"
6. Crea un usuario de prueba
7. Edita el usuario recién creado

---

#### 2.12 Reportes (http://localhost:7001/reports)
**Qué probar**:
- [ ] Página carga
- [ ] Lista de reportes se muestra
- [ ] Crear nuevo reporte funciona
- [ ] Ver reporte funciona
- [ ] Exportar reporte funciona

**Cómo probar**:
1. Click en "Reports" en el menú lateral
2. Verifica la lista de reportes
3. Click en "Crear Reporte"
4. Completa el formulario del constructor
5. Genera el reporte
6. Verifica que se puede exportar

---

#### 2.13 Perfil (http://localhost:7001/profile)
**Qué probar**:
- [ ] Página carga
- [ ] Información del usuario se muestra
- [ ] Editar perfil funciona
- [ ] Cambiar contraseña funciona
- [ ] Cambiar foto de perfil funciona

**Cómo probar**:
1. Click en el avatar/nombre de usuario (arriba a la derecha)
2. Click en "Perfil" o ve a http://localhost:7001/profile
3. Edita tu información
4. Guarda cambios
5. Verifica que se actualizan

---

### PASO 3: Verificar Endpoints de API

#### 3.1 Obtener Token JWT
```bash
# Login y obtener token
TOKEN=$(curl -s -X POST http://localhost:8005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@zgamersa.com","password":"Admin123!"}' | \
  grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

echo "Token: $TOKEN"
```

#### 3.2 Probar Endpoints Principales
```bash
# Dashboard Stats
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8005/api/dashboard/stats

# Customers
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8005/api/customers

# Menu
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8005/api/menu

# Orders
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8005/api/orders

# Reservations
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8005/api/reservations

# Reservations Status Update (NUEVO - CORREGIDO)
curl -X PATCH \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"confirmed"}' \
  http://localhost:8005/api/reservations/1/status

# AI Chat
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "¿Cuáles son las ventas de hoy?",
    "customerName": "Admin Test"
  }' \
  http://localhost:8005/api/ai/chat
```

---

## 🤖 LAS 3 FORMAS DEL CHATBOT

### FORMA 1: Chat Directo con Ollama (Sin Backend)

**Cuándo usar**: Para pruebas rápidas del modelo IA sin contexto de restaurante.

**Cómo usar**:
```bash
# Prueba directa con Ollama
curl -s http://127.0.0.1:11434/api/generate -d '{
  "model": "llama3:8b",
  "prompt": "Eres un asistente de restaurante. Un cliente pregunta: ¿Tienen mesas disponibles para 4 personas?",
  "stream": false,
  "options": {
    "temperature": 0.7,
    "num_predict": 100
  }
}' | python3 -m json.tool
```

**Ventajas**:
- ⚡ Más rápido (sin overhead del backend)
- 🔧 Control total sobre parámetros del modelo
- 🧪 Ideal para experimentar con prompts

**Desventajas**:
- ❌ Sin contexto del restaurante
- ❌ Sin historial de conversación
- ❌ Sin logging en base de datos

---

### FORMA 2: Chat vía Backend API (Con Contexto)

**Cuándo usar**: Para chatbot de producción con contexto del restaurante.

**Cómo usar**:
```bash
# 1. Obtener token
TOKEN=$(curl -s -X POST http://localhost:8005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@zgamersa.com","password":"Admin123!"}' | \
  grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

# 2. Enviar mensaje al chatbot con contexto
curl -X POST http://localhost:8005/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "message": "Quiero hacer una reserva para 6 personas este sábado",
    "customerName": "María González",
    "context": {
      "restaurantInfo": {
        "name": "Restaurante El Sabor Gourmet",
        "phone": "+56912345678",
        "address": "Av. Providencia 1234, Santiago",
        "hours": "Lunes a Domingo 12:00 - 23:00",
        "specialties": ["Parrillas Premium", "Mariscos Frescos", "Pastas Artesanales"]
      }
    }
  }'
```

**Ventajas**:
- ✅ Respuestas contextuales al restaurante
- ✅ Historial guardado en base de datos
- ✅ Integración con sistema de reservas/pedidos
- ✅ Métricas y analytics

**Desventajas**:
- ⏱️ Más lento (procesa contexto)
- 🔐 Requiere autenticación

---

### FORMA 3: Chat vía Admin Panel (Interfaz Web)

**Cuándo usar**: Para dueños de restaurante que quieren probar el chatbot visualmente.

**Cómo usar**:
1. Abre http://localhost:7001/ai-chat
2. Selecciona el modelo "Llama 3 8B" (ya está por defecto después de la corrección)
3. Escribe tu mensaje en el chat
4. Click en "Enviar"
5. Espera la respuesta (30-60 segundos)

**Ventajas**:
- 👥 Interfaz amigable para no-técnicos
- 💬 Vista de conversación tipo WhatsApp
- 🎨 Selección de modelos visual
- 📊 Ver historial de mensajes

**Desventajas**:
- 🌐 Requiere navegador web
- 🔐 Requiere login

---

### COMPARACIÓN DE LAS 3 FORMAS

| Característica | Forma 1 (Ollama) | Forma 2 (API) | Forma 3 (Web UI) |
|----------------|------------------|---------------|-------------------|
| **Velocidad** | ⚡⚡⚡ Rápido | ⚡⚡ Medio | ⚡⚡ Medio |
| **Contexto** | ❌ No | ✅ Sí | ✅ Sí |
| **Historial** | ❌ No | ✅ Sí | ✅ Sí |
| **Autenticación** | ❌ No | ✅ Requerida | ✅ Requerida |
| **Facilidad de uso** | 🔧 Técnico | 🔧 Técnico | 👥 Fácil |
| **Ideal para** | Testing | Producción | Demo a clientes |

---

### EJEMPLOS DE PREGUNTAS PARA CADA FORMA

#### Para Forma 1 (Testing del modelo):
```
"Responde brevemente: ¿Qué es un restaurante?"
"Genera una lista de 5 platillos italianos"
"Traduce al inglés: Quiero hacer una reserva"
```

#### Para Forma 2 (Contexto del restaurante):
```
"¿Cuáles son las especialidades del chef?"
"¿Tienen opciones vegetarianas?"
"Quiero hacer una reserva para 6 personas este sábado a las 20:00"
"¿Cuál es el horario de atención?"
```

#### Para Forma 3 (Análisis de negocio):
```
"¿Cuál es el reporte de ventas de hoy?"
"Analiza las tendencias de reservas del último mes"
"¿Qué platillos son los más pedidos?"
"Dame un resumen de las conversaciones del chatbot"
```

---

## 🎯 CÓMO MEJORAR LA IA Y RESPUESTAS

### 1. Ajustar el System Prompt

El system prompt define el comportamiento del chatbot. Para mejorarlo:

**Ubicación**: `apps/backend/src/modules/ai/ai.service.ts`

```typescript
// PROMPT BÁSICO (Actual):
const systemPrompt = `Eres un asistente virtual para ${restaurantName}.
Ayuda a los clientes con reservas, consultas del menú, etc.`;

// PROMPT MEJORADO:
const systemPrompt = `Eres ChefBot, asistente virtual del restaurante "${restaurantName}".

Tu personalidad:
- Amable, profesional y servicial
- Entusiasta sobre la comida
- Conciso pero informativo

Tus especialidades son:
${specialties.join(', ')}

Horario: ${hours}
Ubicación: ${address}
Teléfono: ${phone}

Tareas principales:
1. Ayudar con reservas (máximo 20 personas)
2. Recomendar platillos según preferencias
3. Informar sobre ingredientes y alergias
4. Gestionar pedidos para delivery
5. Responder sobre horarios y ubicación

IMPORTANTE:
- Siempre pregunta por alergias
- Si no sabes algo, admítelo
- Para reservas >10 personas, pide que llamen
- Sé breve: máximo 3-4 líneas por respuesta`;
```

---

### 2. Optimizar Parámetros del Modelo

**Ubicación**: Configuración de Ollama

```bash
# Temperatura (creatividad):
# - 0.0 a 0.3: Respuestas muy precisas y consistentes
# - 0.4 a 0.7: Balance entre creatividad y precisión (RECOMENDADO)
# - 0.8 a 1.0: Muy creativo, menos predecible

# Top-p (diversidad):
# - 0.1 a 0.5: Respuestas más predecibles
# - 0.6 a 0.9: Balance (RECOMENDADO)
# - 0.9 a 1.0: Muy diversas

# Num Predict (longitud):
# - 50-100: Respuestas cortas
# - 100-200: Respuestas medianas (RECOMENDADO)
# - 200-500: Respuestas largas
```

**Ejemplo de configuración óptima**:
```json
{
  "temperature": 0.7,
  "top_p": 0.9,
  "num_predict": 150,
  "repeat_penalty": 1.1
}
```

---

### 3. Entrenar con Ejemplos (Few-Shot Learning)

Agrega ejemplos de conversaciones exitosas al prompt:

```typescript
const fewShotExamples = `
Ejemplos de conversaciones:

Cliente: "Quiero reservar para 4 personas el sábado"
ChefBot: "¡Perfecto! ¿A qué hora prefieres? Tenemos disponibilidad a las 19:00, 20:00 y 21:30."

Cliente: "¿Tienen opciones sin gluten?"
ChefBot: "Sí, tenemos varias opciones: ensaladas frescas, pescados a la plancha, y nuestro risotto especial sin gluten. ¿Alguna preferencia?"

Cliente: "¿Cuál es la especialidad del chef?"
ChefBot: "Nuestra especialidad es la Parrillada Premium: cortes selectos de carne, acompañados de papas al horno y chimichurri de la casa. ¡Muy recomendada! 🍖"
`;
```

---

### 4. Mejorar el Contexto que se Envía

**Ubicación**: `apps/admin-panel/src/app/ai-chat/page.tsx`

```typescript
// CONTEXTO BÁSICO:
const context = {
  restaurantInfo: {
    name: "Restaurante",
    specialties: ["Plato 1", "Plato 2"]
  }
};

// CONTEXTO MEJORADO:
const context = {
  restaurantInfo: {
    name: "Restaurante El Sabor Gourmet",
    specialties: ["Parrillas Premium", "Mariscos Frescos"],
    hours: "Lun-Dom 12:00-23:00",
    phone: "+56912345678",
    address: "Av. Providencia 1234",
    priceRange: "$$-$$$",
    capacity: 40,
    delivery: true,
    paymentMethods: ["Efectivo", "Tarjeta", "Transferencia"]
  },
  currentDate: new Date().toISOString(),
  availableReservations: ["19:00", "20:00", "21:30"],
  popularDishes: ["Parrillada Premium", "Salmón al Grill"],
  promotions: ["2x1 en pizzas los martes"]
};
```

---

### 5. Implementar Memoria de Conversación

Permite que el chatbot recuerde conversaciones previas:

```typescript
// Agregar historial de mensajes al prompt
const conversationHistory = messages.slice(-5).map(msg =>
  `${msg.role === 'user' ? 'Cliente' : 'ChefBot'}: ${msg.content}`
).join('\n');

const fullPrompt = `
${systemPrompt}

Historial reciente:
${conversationHistory}

Pregunta actual del cliente: ${userMessage}

Responde:`;
```

---

### 6. A/B Testing de Modelos

Prueba diferentes modelos para encontrar el mejor:

```bash
# Test con Llama 3
curl -X POST http://localhost:8005/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"message": "Test", "model": "llama3:8b"}'

# Test con Mistral
curl -X POST http://localhost:8005/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"message": "Test", "model": "mistral:7b"}'

# Compara velocidad, calidad y relevancia
```

**Recomendación de modelos**:
- **llama3:8b**: Mejor balance calidad/velocidad (RECOMENDADO)
- **mistral:7b**: Excelente para conversaciones naturales
- **phi3:mini**: Más rápido, menos contexto
- **gemma:7b**: Bueno para análisis de datos

---

### 7. Monitoreo y Mejora Continua

Crea un sistema de feedback:

```typescript
interface ChatFeedback {
  messageId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  wasHelpful: boolean;
  feedback?: string;
}

// Agregar botones "👍 Útil" / "👎 No útil" en cada respuesta
// Analizar respuestas mal calificadas
// Ajustar prompts basándose en feedback
```

---

## 📝 CHECKLIST COMPLETO DE VERIFICACIÓN

### ✅ Servicios Base
- [ ] Backend API corriendo (puerto 8005)
- [ ] Admin Panel corriendo (puerto 7001)
- [ ] PostgreSQL activo (puerto 15432)
- [ ] Redis activo (puerto 16379)
- [ ] Ollama activo (puerto 11434)
- [ ] Modelo llama3:8b descargado

### ✅ Páginas Admin Panel (18 páginas)
- [ ] 1. Login
- [ ] 2. Dashboard
- [ ] 3. Clientes
- [ ] 4. Menú (sin error toLowerCase) ✅ CORREGIDO
- [ ] 5. Pedidos
- [ ] 6. Reservas (actualización de estado funciona) ✅ CORREGIDO
- [ ] 7. Conversaciones
- [ ] 8. Detalle Conversación
- [ ] 9. Analíticas
- [ ] 10. AI Chat (usa llama3:8b) ✅ CORREGIDO
- [ ] 11. Configuración
- [ ] 12. Usuarios (badges de roles funcionan) ✅ CORREGIDO
- [ ] 13. Nuevo Usuario
- [ ] 14. Editar Usuario
- [ ] 15. Reportes
- [ ] 16. Crear Reporte
- [ ] 17. Ver Reporte
- [ ] 18. Perfil

### ✅ Endpoints API
- [ ] POST /api/auth/login
- [ ] GET /api/dashboard/stats
- [ ] GET /api/customers
- [ ] GET /api/menu
- [ ] GET /api/orders
- [ ] GET /api/reservations
- [ ] PATCH /api/reservations/:id/status ✅ NUEVO
- [ ] GET /api/conversations
- [ ] POST /api/ai/chat
- [ ] GET /api/users
- [ ] GET /api/settings

### ✅ Chatbot (3 Formas)
- [ ] Forma 1: Ollama directo
- [ ] Forma 2: API con contexto
- [ ] Forma 3: Admin Panel UI
- [ ] Respuestas contextuales
- [ ] Modelo llama3:8b activo
- [ ] Tiempos de respuesta aceptables (<60s)

### ✅ Mejoras de IA
- [ ] System prompt optimizado
- [ ] Parámetros de modelo ajustados
- [ ] Ejemplos few-shot agregados
- [ ] Contexto enriquecido
- [ ] Memoria de conversación implementada
- [ ] A/B testing de modelos realizado
- [ ] Sistema de feedback creado

---

## 🚀 COMANDO RÁPIDO DE VERIFICACIÓN COMPLETA

Ejecuta este script para verificar todo el sistema automáticamente:

```bash
#!/bin/bash

echo "=== VERIFICACIÓN COMPLETA DEL SISTEMA ==="
echo ""

# 1. Servicios
echo "1. Verificando servicios..."
curl -s http://localhost:8005/health > /dev/null && echo "✅ Backend OK" || echo "❌ Backend ERROR"
curl -s http://localhost:7001 > /dev/null && echo "✅ Admin Panel OK" || echo "❌ Admin Panel ERROR"
curl -s http://localhost:11434/api/tags > /dev/null && echo "✅ Ollama OK" || echo "❌ Ollama ERROR"

# 2. Login y obtener token
echo ""
echo "2. Verificando autenticación..."
TOKEN=$(curl -s -X POST http://localhost:8005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@zgamersa.com","password":"Admin123!"}' | \
  grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
  echo "✅ Login OK"
else
  echo "❌ Login ERROR"
  exit 1
fi

# 3. Endpoints API
echo ""
echo "3. Verificando endpoints..."
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8005/api/dashboard/stats > /dev/null && echo "✅ Dashboard API OK" || echo "❌ Dashboard API ERROR"
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8005/api/customers > /dev/null && echo "✅ Customers API OK" || echo "❌ Customers API ERROR"
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8005/api/menu > /dev/null && echo "✅ Menu API OK" || echo "❌ Menu API ERROR"
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8005/api/orders > /dev/null && echo "✅ Orders API OK" || echo "❌ Orders API ERROR"
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8005/api/reservations > /dev/null && echo "✅ Reservations API OK" || echo "❌ Reservations API ERROR"

# 4. Chatbot
echo ""
echo "4. Verificando chatbot..."
RESPONSE=$(curl -s -X POST http://localhost:8005/api/ai/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Test","customerName":"Test"}')

if echo "$RESPONSE" | grep -q "response"; then
  echo "✅ Chatbot OK"
else
  echo "❌ Chatbot ERROR"
fi

echo ""
echo "=== VERIFICACIÓN COMPLETADA ==="
```

---

## 📚 DOCUMENTACIÓN ADICIONAL

- **Reporte de Errores Original**: `/Users/devlmer/ChatBotDysa/REPORTE_ERRORES_ADMIN_PANEL.md`
- **Resumen de Correcciones**: `/Users/devlmer/ChatBotDysa/RESUMEN_CORRECCIONES_ADMIN_PANEL.md`
- **Guía de Prueba para Restaurantes**: `/Users/devlmer/ChatBotDysa/GUIA_PRUEBA_RESTAURANTE.md`

---

*Generado el 2025-11-06 por Claude Code*
*ChatBotDysa - Guía Completa de Verificación*
