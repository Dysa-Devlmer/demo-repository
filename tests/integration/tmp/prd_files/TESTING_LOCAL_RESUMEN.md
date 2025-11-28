# 🚀 Resumen Ejecutivo - Testing Local ChatBotDysa

**Fecha:** 2025-11-01
**Objetivo:** Probar el sistema localmente antes de llevarlo a restaurantes

---

## ✅ Lo Que Hemos Preparado

### 📚 Documentación Creada

1. **[GUIA_TESTING_LOCAL.md](./GUIA_TESTING_LOCAL.md)** - Guía completa (+ 600 líneas)
   - 3 formas de usar el chatbot IA (con API, sin API, personalizado)
   - Configuración paso a paso
   - Scripts de prueba
   - Troubleshooting completo

2. **Este archivo** - Resumen rápido para empezar YA

### 🛠️ Scripts de Automatización

1. **`scripts/quick-setup-local.sh`** ⭐ EJECUTA ESTO PRIMERO
   - Instala Ollama (si no lo tienes)
   - Descarga el modelo de IA (phi3:mini)
   - Configura PostgreSQL (Docker)
   - Configura el backend automáticamente
   - Ejecuta migraciones y seeds

2. **`scripts/test-ai-quick.sh`** ⭐ PRUEBA EL SISTEMA
   - Verifica que todo esté corriendo
   - Prueba 7 escenarios diferentes
   - Muestra respuestas en tiempo real

### 💻 Ejemplos de Código

**`examples/chatbot-usage-examples.ts`** - 15+ ejemplos prácticos
- Cómo usar desde frontend (fetch/axios)
- Cómo usar directo Ollama
- Personalización avanzada
- Hook de React
- Manejo de errores

---

## 🎯 Inicio Rápido (5 Minutos)

### Opción A: Setup Automático (RECOMENDADO)

```bash
# 1. Ejecutar script de setup (hace todo por ti)
cd /Users/devlmer/ChatBotDysa
./scripts/quick-setup-local.sh

# 2. Iniciar backend
cd apps/backend
npm run start:dev

# 3. Probar sistema (en otra terminal)
./scripts/test-ai-quick.sh
```

### Opción B: Setup Manual

```bash
# 1. Instalar Ollama
brew install ollama  # macOS
# o descargar de https://ollama.com/download

# 2. Iniciar Ollama
ollama serve

# 3. Descargar modelo (en otra terminal)
ollama pull phi3:mini

# 4. PostgreSQL (Docker)
docker run -d \
  --name chatbotdysa-postgres \
  -e POSTGRES_PASSWORD=supersecret \
  -e POSTGRES_DB=chatbotdysa \
  -p 5432:5432 \
  postgres:16

# 5. Configurar Backend
cd apps/backend
cp .env.example .env
npm install
npm run migration:run
npm run seed

# 6. Iniciar Backend
npm run start:dev

# 7. Probar
./scripts/test-ai-quick.sh
```

---

## 🤖 Las 3 Formas de Usar el Chatbot

### 1️⃣ CON API (Backend) - RECOMENDADO ✅

**Ventajas:**
- ✅ Sistema híbrido (OpenAI → Ollama → Fallback)
- ✅ Caché de respuestas
- ✅ Fallback automático
- ✅ Listo para producción

**Cómo usar:**
```bash
# Probar con cURL
curl -X POST http://localhost:8005/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "message": "Hola, quiero hacer una reserva",
    "customerName": "Juan Pérez"
  }'
```

**Configuración en .env:**
```bash
# Solo Ollama (sin OpenAI)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=phi3:mini

# Con OpenAI + Ollama (opcional)
OPENAI_API_KEY=sk-proj-xxxxx
OPENAI_MODEL=gpt-4o-mini
```

### 2️⃣ SIN API (Directo a Ollama) - PARA TESTING

**Ventajas:**
- ✅ Más rápido (sin intermediarios)
- ✅ Útil para prototipos

**Desventajas:**
- ❌ Sin fallback automático
- ❌ Sin caché
- ❌ Más básico

**Cómo usar:**
```typescript
import { Ollama } from 'ollama';

const ollama = new Ollama({ host: 'http://localhost:11434' });

const response = await ollama.chat({
  model: 'phi3:mini',
  messages: [
    { role: 'system', content: 'Eres ChefBot del Restaurante X' },
    { role: 'user', content: '¿Tienen reservas disponibles?' }
  ]
});

console.log(response.message.content);
```

### 3️⃣ PERSONALIZADO - PARA CASOS ESPECÍFICOS

**Modificar prompts:**
- `apps/backend/src/modules/ai/ollama.service.ts` (línea 320)
- `apps/backend/src/modules/ai/hybrid-ai.service.ts` (línea 119)

**Cambiar modelo:**
```bash
# En .env
OLLAMA_MODEL=llama3:8b  # Más inteligente pero más lento

# Descargar modelo
ollama pull llama3:8b
```

**Ajustar parámetros:**
```typescript
// En ollama.service.ts línea 234
options: {
  temperature: 0.7,    // Creatividad (0-1)
  num_predict: 150,    // Tokens de respuesta
}
```

---

## 📊 Verificar que Todo Funciona

### Checklist Rápido

```bash
# 1. Ollama corriendo
curl http://localhost:11434/api/version
# Debería mostrar: {"version":"..."}

# 2. Backend corriendo
curl http://localhost:8005/health
# Debería mostrar: {"status":"ok"}

# 3. PostgreSQL corriendo
docker ps | grep postgres
# Debería mostrar el contenedor

# 4. AI responde
curl http://localhost:8005/ai/health
# Debería mostrar: {"isRunning":true}
```

### Script Automático

```bash
# Ejecutar todos los tests
./scripts/test-ai-quick.sh

# Debería mostrar:
# ✅ Ollama: Corriendo
# ✅ Backend: Corriendo
# ✅ PostgreSQL: Corriendo
# ✅ 7 escenarios probados
```

---

## 🎨 Próximos Pasos

### Para Probar Ahora

1. **Ejecutar setup:**
   ```bash
   ./scripts/quick-setup-local.sh
   ```

2. **Iniciar backend:**
   ```bash
   cd apps/backend && npm run start:dev
   ```

3. **Probar sistema:**
   ```bash
   ./scripts/test-ai-quick.sh
   ```

4. **Ver API Docs:**
   - Abrir: http://localhost:8005/api
   - Probar endpoints directamente

### Para Integrar en tu App

1. **Ver ejemplos:**
   - Abrir: `examples/chatbot-usage-examples.ts`
   - Copiar el código que necesites

2. **Personalizar prompts:**
   - Editar: `apps/backend/src/modules/ai/ollama.service.ts`
   - Cambiar la personalidad del bot
   - Agregar capacidades específicas

3. **Probar con tu restaurante:**
   - Actualizar info del restaurante
   - Agregar menú real
   - Probar conversaciones

### Para Llevar a Producción

1. **Probar localmente primero** ✅ (estamos aquí)

2. **Configurar datos reales:**
   - Menú del restaurante
   - Información de contacto
   - Horarios reales

3. **Ajustar prompts** según feedback

4. **Desplegar:**
   - Seguir: [COMO_DESPLEGAR.md](./COMO_DESPLEGAR.md)

---

## 🐛 Problemas Comunes

### "Ollama no responde"
```bash
# Solución:
ollama serve

# Verificar:
curl http://localhost:11434/api/version
```

### "Modelo no encontrado"
```bash
# Solución:
ollama pull phi3:mini

# Ver modelos:
ollama list
```

### "PostgreSQL connection refused"
```bash
# Solución:
docker start chatbotdysa-postgres

# O crear nuevo:
docker run -d --name chatbotdysa-postgres \
  -e POSTGRES_PASSWORD=supersecret \
  -e POSTGRES_DB=chatbotdysa \
  -p 5432:5432 postgres:16
```

### "Backend no inicia"
```bash
# Solución:
cd apps/backend
npm install --legacy-peer-deps
npm run migration:run
npm run start:dev
```

---

## 📖 Documentación Adicional

| Documento | Descripción | Cuándo Usar |
|-----------|-------------|-------------|
| **GUIA_TESTING_LOCAL.md** | Guía completa y detallada | Cuando necesites información específica |
| **examples/chatbot-usage-examples.ts** | Ejemplos de código | Cuando estés programando la integración |
| **COMO_DESPLEGAR.md** | Guía de deployment | Cuando quieras llevarlo a producción |
| **QUICK_START.md** | Inicio rápido general | Primera vez con el sistema completo |

---

## 🎯 Casos de Uso del Chatbot

El chatbot puede:

1. **Gestionar Reservas**
   - Crear, modificar, cancelar
   - Verificar disponibilidad
   - Confirmar por WhatsApp

2. **Tomar Pedidos**
   - Delivery y takeaway
   - Sugerir platos
   - Calcular totales

3. **Consultar Menú**
   - Mostrar platos disponibles
   - Precios y descripciones
   - Alérgenos e ingredientes

4. **Información del Restaurante**
   - Horarios y ubicación
   - Teléfono de contacto
   - Promociones especiales

5. **Asistencia General**
   - Métodos de pago
   - Políticas de cancelación
   - Preguntas frecuentes

---

## 📞 Soporte

**¿Algo no funciona?**

1. **Verifica logs:**
   ```bash
   # Backend
   tail -f apps/backend/logs/app.log

   # Ollama
   ollama list
   ```

2. **Ejecuta health checks:**
   ```bash
   ./scripts/test-ai-quick.sh
   ```

3. **Revisa documentación:**
   - [GUIA_TESTING_LOCAL.md](./GUIA_TESTING_LOCAL.md)
   - [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

## 🎉 ¡Todo Listo!

**Tienes ahora:**
- ✅ Sistema de IA configurado localmente
- ✅ Scripts de testing automatizados
- ✅ Ejemplos de código listos para usar
- ✅ Documentación completa
- ✅ 3 formas diferentes de usar el chatbot

**Siguiente comando:**
```bash
./scripts/quick-setup-local.sh
```

**¡Disfruta probando el sistema!** 🚀

---

_Última actualización: 2025-11-01_
_Estado: ✅ Todo funcionando localmente_
