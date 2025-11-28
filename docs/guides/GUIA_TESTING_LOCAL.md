# 🧪 Guía de Testing Local - ChatBotDysa

**Fecha:** 2025-11-01
**Propósito:** Probar el sistema localmente antes de llevarlo a restaurantes

---

## 📋 Tabla de Contenidos

1. [Configuración Rápida](#configuración-rápida)
2. [3 Formas de Usar el Chatbot IA](#3-formas-de-usar-el-chatbot-ia)
3. [Testing del Sistema Completo](#testing-del-sistema-completo)
4. [Scripts de Prueba Rápida](#scripts-de-prueba-rápida)
5. [Troubleshooting](#troubleshooting)

---

## 🚀 Configuración Rápida

### Opción A: Solo Backend + Ollama (Recomendado para Testing)

```bash
# 1. Instalar Ollama (si no lo tienes)
# macOS:
brew install ollama

# Linux:
curl -fsSL https://ollama.com/install.sh | sh

# Windows:
# Descargar de https://ollama.com/download

# 2. Iniciar Ollama
ollama serve

# 3. En otra terminal, descargar el modelo
ollama pull phi3:mini

# 4. Configurar Backend
cd /Users/devlmer/ChatBotDysa/apps/backend

# 5. Copiar .env.example
cp .env.example .env

# 6. Editar .env (valores mínimos para testing)
nano .env
```

**Configuración mínima de .env:**
```bash
# Database (usar PostgreSQL local o Docker)
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=supersecret
DATABASE_NAME=chatbotdysa

# JWT
JWT_SECRET=your-super-secret-jwt-key-for-testing
JWT_EXPIRES_IN=24h

# Ollama (IA Local)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=phi3:mini

# OpenAI (OPCIONAL - si no lo configuras, usa solo Ollama)
# OPENAI_API_KEY=sk-...
# OPENAI_MODEL=gpt-4o-mini

# URLs
APP_URL=http://localhost:3004
ADMIN_URL=http://localhost:7001
API_URL=http://localhost:8005

# CORS
CORS_ORIGINS=http://localhost:3004,http://localhost:7001

# Features
ENABLE_SWAGGER=true
ENABLE_RATE_LIMITING=false
NODE_ENV=development
PORT=8005
```

```bash
# 7. Instalar dependencias
npm install

# 8. Iniciar PostgreSQL (Docker)
docker run -d \
  --name chatbotdysa-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=supersecret \
  -e POSTGRES_DB=chatbotdysa \
  -p 5432:5432 \
  postgres:16

# 9. Ejecutar migraciones
npm run migration:run

# 10. Cargar datos de prueba (opcional)
npm run seed

# 11. Iniciar backend
npm run start:dev

# ✅ Backend corriendo en http://localhost:8005
# ✅ API Docs en http://localhost:8005/api
```

### Opción B: Sistema Completo (Backend + Admin Panel + Landing)

```bash
# Terminal 1: Backend (arriba)
cd apps/backend
npm run start:dev

# Terminal 2: Admin Panel
cd apps/admin-panel
npm install
cp .env.example .env.local

# Editar .env.local
nano .env.local
```

**.env.local para Admin Panel:**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8005
NEXTAUTH_URL=http://localhost:7001
NEXTAUTH_SECRET=your-nextauth-secret-key
```

```bash
npm run dev
# ✅ Admin Panel en http://localhost:7001
```

```bash
# Terminal 3: Landing Page (opcional)
cd apps/landing-page
npm install
cp .env.example .env.local
npm run dev
# ✅ Landing en http://localhost:3004
```

---

## 🤖 3 Formas de Usar el Chatbot IA

### 1️⃣ CON API (Modo Híbrido - RECOMENDADO)

**Cómo funciona:**
- Tu frontend → Backend API → HybridAIService
- El sistema intenta: **OpenAI** (si configurado) → **Ollama** → **Respuestas pre-programadas**
- ✅ Mejor para producción
- ✅ Incluye caché de respuestas
- ✅ Fallback automático
- ✅ Control centralizado

**Configuración:**

**Solo Ollama (Sin OpenAI):**
```bash
# En apps/backend/.env
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=phi3:mini

# NO configurar OPENAI_API_KEY
# El sistema usará solo Ollama
```

**Con OpenAI + Ollama (Fallback):**
```bash
# En apps/backend/.env
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=phi3:mini

# Configurar OpenAI (opcional)
OPENAI_API_KEY=sk-proj-xxxxx
OPENAI_MODEL=gpt-4o-mini
```

**Probar con cURL:**
```bash
# 1. Login para obtener token
TOKEN=$(curl -s -X POST http://localhost:8005/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@zgamersa.com",
    "password": "Admin123!"
  }' | jq -r '.token')

# 2. Hacer una pregunta al chatbot
curl -X POST http://localhost:8005/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "message": "Hola, quisiera hacer una reserva para 4 personas",
    "customerName": "Juan Pérez",
    "context": {
      "restaurantInfo": {
        "name": "Restaurante El Sabor",
        "address": "Calle Principal 123",
        "phone": "+56912345678",
        "hours": "Lunes a Domingo 12:00 - 23:00",
        "specialties": ["Parrillas", "Mariscos", "Pastas"]
      },
      "menuItems": [
        {
          "id": 1,
          "name": "Parrillada Premium",
          "price": 25000,
          "category": "Carnes",
          "description": "Mix de carnes selectas",
          "available": true
        },
        {
          "id": 2,
          "name": "Ceviche de Corvina",
          "price": 12000,
          "category": "Mariscos",
          "description": "Fresco del día",
          "available": true
        }
      ]
    }
  }'
```

**Probar desde Frontend (Admin Panel):**
```javascript
// En Admin Panel, crear página de prueba: apps/admin-panel/src/app/test-chat/page.tsx
const response = await fetch('http://localhost:8005/ai/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    message: "Hola, quisiera ver el menú",
    customerName: "Cliente Test",
    context: {
      restaurantInfo: {
        name: "Mi Restaurante",
        // ... resto del contexto
      }
    }
  })
});

const data = await response.json();
console.log(data.response); // Respuesta del AI
```

---

### 2️⃣ SIN API (Directo a Ollama)

**Cómo funciona:**
- Tu código → Ollama directamente (sin backend)
- ✅ Más rápido (sin intermediarios)
- ✅ Útil para testing local
- ❌ Sin fallback automático
- ❌ Sin caché
- ❌ Sin autenticación

**Instalación del cliente Ollama:**
```bash
npm install ollama
```

**Código de ejemplo:**
```typescript
// test-ollama-direct.ts
import { Ollama } from 'ollama';

const ollama = new Ollama({
  host: 'http://localhost:11434'
});

async function chatDirectWithOllama() {
  const response = await ollama.chat({
    model: 'phi3:mini',
    messages: [
      {
        role: 'system',
        content: `Eres ChefBot Dysa, asistente del Restaurante El Sabor.

INFORMACIÓN:
- Nombre: Restaurante El Sabor
- Horarios: Lunes a Domingo 12:00 - 23:00
- Especialidades: Parrillas, Mariscos, Pastas

MENÚ:
- Parrillada Premium: $25.000
- Ceviche de Corvina: $12.000
- Pasta Carbonara: $8.500

Responde solo sobre el restaurante.`
      },
      {
        role: 'user',
        content: '¿Cuál es el plato más caro?'
      }
    ],
    stream: false,
  });

  console.log('Respuesta:', response.message.content);
}

chatDirectWithOllama();
```

**Ejecutar:**
```bash
npx ts-node test-ollama-direct.ts
```

**Ventajas:**
- Sin necesidad de backend
- Más rápido para prototipos
- Control total del prompt

**Desventajas:**
- Sin integración con la base de datos
- Sin sistema de fallback
- Tienes que manejar errores manualmente

---

### 3️⃣ PERSONALIZADO (Modificar Prompts y Comportamiento)

**Ubicación de los prompts:**

**A. OllamaService (Solo Ollama)**
- Archivo: `/Users/devlmer/ChatBotDysa/apps/backend/src/modules/ai/ollama.service.ts`
- Línea: 320-365
- Método: `buildRestaurantSystemPrompt()`

**B. HybridAIService (Sistema Híbrido)**
- Archivo: `/Users/devlmer/ChatBotDysa/apps/backend/src/modules/ai/hybrid-ai.service.ts`
- Línea: 119-178
- Método: `buildRestrictedSystemPrompt()`

**Personalización 1: Cambiar la Personalidad del Bot**

```typescript
// En ollama.service.ts línea 324
return `Eres ChefBot Dysa 👨‍🍳, el asistente inteligente de ${restaurantName}.

PERSONALIDAD:
- Muy formal y elegante (CAMBIO AQUÍ)
- Experto en alta cocina
- Usa lenguaje sofisticado
- Evita emojis (CAMBIO AQUÍ)

CAPACIDADES PRINCIPALES:
1. 📅 Gestionar reservas
...
```

**Personalización 2: Agregar Nuevas Capacidades**

```typescript
// En hybrid-ai.service.ts línea 134
✅ PUEDES AYUDAR CON:
- 🍽️ Consultar menú, precios, ingredientes, platos del día
- 📅 Hacer, modificar o cancelar reservas
- 🛵 Tomar pedidos para delivery o takeaway
- 🎂 Sugerir menús para eventos especiales (NUEVO)
- 🍷 Recomendar maridajes de vino (NUEVO)
- ℹ️ Información del restaurante
```

**Personalización 3: Cambiar Restricciones**

```typescript
// En hybrid-ai.service.ts línea 124
🚫 RESTRICCIONES ABSOLUTAS:
1. SOLO puedes hablar sobre ${restaurantName}
2. PUEDES dar consejos gastronómicos generales (CAMBIO AQUÍ)
3. NO respondas sobre competidores
4. SI te preguntan recetas, comparte solo las del restaurante
```

**Personalización 4: Cambiar Modelo de Ollama**

```bash
# En .env
OLLAMA_MODEL=llama3:8b  # Más inteligente pero más lento
# OLLAMA_MODEL=phi3:mini  # Más rápido pero menos inteligente
# OLLAMA_MODEL=mistral   # Balance entre velocidad e inteligencia
```

**Descargar modelos adicionales:**
```bash
# Modelo pequeño y rápido
ollama pull phi3:mini

# Modelo mediano (recomendado)
ollama pull llama3:8b

# Modelo grande (más inteligente)
ollama pull llama3:70b

# Ver modelos instalados
ollama list
```

**Personalización 5: Ajustar Parámetros de Generación**

```typescript
// En ollama.service.ts línea 234
options: {
  temperature: 0.5,        // 0.0 = determinista, 1.0 = creativo
  top_k: 40,               // Limita opciones de palabras
  top_p: 0.9,              // Núcleo de probabilidad
  repeat_penalty: 1.2,     // Evita repetición (más alto = menos repetición)
  num_ctx: 4096,           // Contexto (más = más memoria)
  num_predict: 200,        // Tokens máximos de respuesta
}
```

**Personalización 6: Agregar Respuestas Pre-programadas (Fallback)**

```typescript
// En hybrid-ai.service.ts línea 257
private getFallbackResponse(userMessage: string, context: RestaurantContext): string {
  const lowerMessage = userMessage.toLowerCase();

  // AGREGAR NUEVA RESPUESTA PERSONALIZADA
  if (lowerMessage.includes('evento') || lowerMessage.includes('celebración')) {
    return `¡Perfecto para eventos! 🎉 En ${restaurantName} organizamos:
    - Cumpleaños
    - Aniversarios
    - Eventos corporativos
    - Cenas privadas

    ¿Para cuántas personas sería el evento?`;
  }

  // ... resto de respuestas
}
```

---

## 🧪 Testing del Sistema Completo

### Test 1: Verificar que Ollama está Corriendo

```bash
# Verificar versión
curl http://localhost:11434/api/version

# Verificar modelos instalados
curl http://localhost:11434/api/tags

# Test desde el backend
curl http://localhost:8005/ai/health
```

### Test 2: Probar Diferentes Tipos de Mensajes

Crea un script de prueba:

```bash
# /Users/devlmer/ChatBotDysa/test-ai-scenarios.sh
#!/bin/bash

TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." # Tu token de admin

BASE_URL="http://localhost:8005"

echo "🧪 Probando diferentes escenarios del chatbot..."

# Escenario 1: Saludo
echo -e "\n1️⃣ SALUDO"
curl -X POST $BASE_URL/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"message": "Hola, buenos días"}' | jq -r '.response'

# Escenario 2: Consulta de menú
echo -e "\n2️⃣ CONSULTA DE MENÚ"
curl -X POST $BASE_URL/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "message": "¿Cuáles son sus especialidades?",
    "context": {
      "restaurantInfo": {
        "name": "El Sabor Gourmet",
        "specialties": ["Parrillas Premium", "Mariscos Frescos", "Pastas Artesanales"]
      }
    }
  }' | jq -r '.response'

# Escenario 3: Reserva
echo -e "\n3️⃣ SOLICITUD DE RESERVA"
curl -X POST $BASE_URL/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "message": "Quiero hacer una reserva para 6 personas este sábado",
    "customerName": "María González"
  }' | jq -r '.response'

# Escenario 4: Pregunta fuera de contexto
echo -e "\n4️⃣ PREGUNTA FUERA DE CONTEXTO"
curl -X POST $BASE_URL/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"message": "¿Quién ganó el mundial 2022?"}' | jq -r '.response'

# Escenario 5: Consulta con menú real
echo -e "\n5️⃣ CONSULTA CON MENÚ REAL"
curl -X POST $BASE_URL/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "message": "¿Cuál es el plato más caro?",
    "context": {
      "menuItems": [
        {"name": "Ensalada César", "price": 8500, "category": "Entradas"},
        {"name": "Parrillada Premium", "price": 28000, "category": "Carnes"},
        {"name": "Ceviche", "price": 12000, "category": "Mariscos"}
      ]
    }
  }' | jq -r '.response'

echo -e "\n✅ Tests completados"
```

```bash
chmod +x test-ai-scenarios.sh
./test-ai-scenarios.sh
```

### Test 3: Probar Performance

```bash
# test-ai-performance.sh
#!/bin/bash

echo "⏱️ Probando performance del AI..."

for i in {1..10}
do
  echo "Request $i..."
  time curl -s -X POST http://localhost:8005/ai/chat \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"message": "Hola"}' > /dev/null
done
```

---

## 📊 Scripts de Prueba Rápida

### Script 1: Setup Rápido

```bash
# quick-setup.sh
#!/bin/bash

echo "🚀 Setup rápido de ChatBotDysa..."

# 1. Verificar Ollama
if ! command -v ollama &> /dev/null; then
    echo "❌ Ollama no está instalado. Instalando..."
    brew install ollama
fi

# 2. Iniciar Ollama (background)
echo "✅ Iniciando Ollama..."
ollama serve &
sleep 3

# 3. Descargar modelo
echo "📥 Descargando modelo phi3:mini..."
ollama pull phi3:mini

# 4. Iniciar PostgreSQL (Docker)
echo "🐘 Iniciando PostgreSQL..."
docker run -d \
  --name chatbotdysa-postgres \
  -e POSTGRES_PASSWORD=supersecret \
  -e POSTGRES_DB=chatbotdysa \
  -p 5432:5432 \
  postgres:16

# 5. Configurar backend
echo "⚙️ Configurando backend..."
cd apps/backend
cp .env.example .env

# 6. Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# 7. Migraciones
echo "🗄️ Ejecutando migraciones..."
npm run migration:run

# 8. Seeds
echo "🌱 Cargando datos de prueba..."
npm run seed

echo "✅ Setup completo. Ejecuta: npm run start:dev"
```

### Script 2: Test Completo del Sistema

```bash
# test-complete-system.sh
#!/bin/bash

echo "🧪 Testing completo del sistema..."

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# 1. Test Ollama
echo -e "\n1️⃣ Testing Ollama..."
if curl -s http://localhost:11434/api/version > /dev/null; then
    echo -e "${GREEN}✅ Ollama OK${NC}"
else
    echo -e "${RED}❌ Ollama no responde${NC}"
fi

# 2. Test Backend
echo -e "\n2️⃣ Testing Backend..."
if curl -s http://localhost:8005/health > /dev/null; then
    echo -e "${GREEN}✅ Backend OK${NC}"
else
    echo -e "${RED}❌ Backend no responde${NC}"
fi

# 3. Test PostgreSQL
echo -e "\n3️⃣ Testing PostgreSQL..."
if docker exec chatbotdysa-postgres pg_isready > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL OK${NC}"
else
    echo -e "${RED}❌ PostgreSQL no responde${NC}"
fi

# 4. Test AI Endpoint
echo -e "\n4️⃣ Testing AI Endpoint..."
AI_HEALTH=$(curl -s http://localhost:8005/ai/health | jq -r '.isRunning')
if [ "$AI_HEALTH" = "true" ]; then
    echo -e "${GREEN}✅ AI Service OK${NC}"
else
    echo -e "${RED}❌ AI Service no funciona${NC}"
fi

# 5. Test Admin Panel (si está corriendo)
echo -e "\n5️⃣ Testing Admin Panel..."
if curl -s http://localhost:7001 > /dev/null; then
    echo -e "${GREEN}✅ Admin Panel OK${NC}"
else
    echo -e "${RED}⚠️  Admin Panel no está corriendo${NC}"
fi

echo -e "\n🎉 Tests completados"
```

---

## 🐛 Troubleshooting

### Problema 1: Ollama no se conecta

```bash
# Error: ECONNREFUSED
# Solución:

# 1. Verificar que Ollama está corriendo
ps aux | grep ollama

# 2. Si no está corriendo
ollama serve

# 3. Verificar puerto
lsof -i :11434

# 4. Verificar configuración en .env
echo $OLLAMA_URL  # Debe ser http://localhost:11434
```

### Problema 2: Modelo no encontrado

```bash
# Error: Model phi3:mini not found
# Solución:

# 1. Ver modelos instalados
ollama list

# 2. Descargar el modelo
ollama pull phi3:mini

# 3. Verificar que el nombre en .env coincide
# OLLAMA_MODEL=phi3:mini
```

### Problema 3: PostgreSQL no conecta

```bash
# Error: Connection refused to PostgreSQL
# Solución:

# 1. Verificar que PostgreSQL está corriendo
docker ps | grep postgres

# 2. Si no está, iniciarlo
docker start chatbotdysa-postgres

# 3. Verificar conexión
psql -h localhost -U postgres -d chatbotdysa

# 4. Verificar credenciales en .env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=supersecret
```

### Problema 4: Respuestas muy lentas

```bash
# Solución 1: Usar modelo más pequeño
ollama pull phi3:mini  # ~2GB, rápido
# En lugar de:
# ollama pull llama3:8b  # ~5GB, más lento

# Solución 2: Ajustar parámetros
# En ollama.service.ts línea 239
num_ctx: 2048,      # Reducir contexto
num_predict: 100,   # Reducir tokens de respuesta
```

### Problema 5: OpenAI API Key inválida

```bash
# Error: Invalid API key
# Solución:

# 1. Verificar que la key es correcta
echo $OPENAI_API_KEY

# 2. Si no tienes OpenAI, desactivarlo
# En .env, NO configurar OPENAI_API_KEY
# El sistema usará solo Ollama

# 3. Verificar logs
tail -f apps/backend/logs/app.log
```

---

## 📝 Checklist de Testing

Antes de llevar el sistema a un restaurante:

- [ ] Ollama corriendo y responde
- [ ] Modelo phi3:mini descargado
- [ ] Backend responde en /health
- [ ] PostgreSQL conectado
- [ ] Migraciones ejecutadas
- [ ] Seeds cargados (datos de prueba)
- [ ] AI endpoint /ai/chat responde
- [ ] Admin Panel carga correctamente
- [ ] Login funciona (admin@zgamersa.com)
- [ ] Probados 5+ escenarios diferentes
- [ ] Respuestas coherentes del chatbot
- [ ] Tiempo de respuesta < 5 segundos
- [ ] Fallback funciona si Ollama falla

---

## 🎯 Próximos Pasos

Una vez probado localmente:

1. **Configurar datos reales del restaurante**
   - Actualizar menú en la base de datos
   - Configurar información del restaurante
   - Personalizar prompts del AI

2. **Entrenar el modelo** (opcional)
   - Fine-tuning con conversaciones reales
   - Ajustar prompts según feedback

3. **Desplegar en producción**
   - Seguir guía: [COMO_DESPLEGAR.md](./COMO_DESPLEGAR.md)
   - Configurar dominio y SSL
   - Configurar backups

---

**¿Preguntas?**
Consulta [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) para despliegue en producción.

🎉 **¡Listo para probar el sistema!**
