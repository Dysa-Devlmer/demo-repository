# 🤖 CONFIGURACIÓN AI: LOCAL vs CLOUD

**ChatBotDysa Enterprise - Opciones de IA**
**Fecha:** 28 de Octubre de 2025

---

## 🎯 ARQUITECTURA ACTUAL

### Sistema Principal: 100% LOCAL ✅
```
┌─────────────────────────────────────────────┐
│         TODO EN TU MAC (Docker)             │
│                                             │
│  ✅ Backend (NestJS)        → Local        │
│  ✅ PostgreSQL              → Local        │
│  ✅ Redis                   → Local        │
│  ✅ Frontend                → Local        │
│  ✅ Ollama AI (phi3:mini)   → Local        │
└─────────────────────────────────────────────┘

💰 Costo: $0/mes
🔒 Privacidad: 100% (sin envío de datos)
⚡ Velocidad: Sin latencia de red
```

### AI Conversacional: FLEXIBLE ⚙️

**Configuración Actual (Default):**
- ✅ **Ollama Local** con modelo `phi3:mini` descargado en tu máquina
- ✅ **Sin conexión a internet** para generar respuestas
- ✅ **Privacidad total** - Conversaciones no salen de tu Mac

**Opciones Disponibles (Configurables):**

#### Opción 1: Ollama Local (ACTUAL) ✅
```typescript
// apps/backend/src/modules/ai/ollama.service.ts
OLLAMA_URL=http://chatbotdysa-ollama:11434
OLLAMA_MODEL=phi3:mini

Ventajas:
  ✅ Gratis ($0)
  ✅ Privado (datos no salen)
  ✅ Rápido (sin latencia red)
  ✅ Sin límites de uso

Desventajas:
  ⚠️ Calidad de respuestas menor que GPT-4/Claude
  ⚠️ Consume recursos locales (RAM/CPU)
```

#### Opción 2: OpenAI API (Configurable)
```typescript
// .env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo-preview

Ventajas:
  ✅ Mejor calidad de respuestas
  ✅ No consume recursos locales
  ✅ Modelos más avanzados

Desventajas:
  ❌ Costo por uso (~$0.01-0.03 por request)
  ❌ Requiere internet
  ❌ Datos enviados a OpenAI
  ❌ Límites de rate (RPM)
```

#### Opción 3: Anthropic Claude API (Configurable)
```typescript
// .env
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022

Ventajas:
  ✅ Excelente calidad de respuestas
  ✅ Contexto largo (200K tokens)
  ✅ Muy bueno para español

Desventajas:
  ❌ Costo por uso (~$0.003-0.015 por request)
  ❌ Requiere internet
  ❌ Datos enviados a Anthropic
```

#### Opción 4: Hybrid (Configurable)
```typescript
// Backend puede elegir automáticamente
- Ollama local para queries simples
- API cloud para queries complejas
- Fallback a local si API falla

Archivo: apps/backend/src/modules/ai/hybrid-ai.service.ts
```

---

## 🔧 CÓMO CAMBIAR LA CONFIGURACIÓN

### Mantener Todo Local (ACTUAL) ✅

**No hacer nada.** Sistema ya configurado con Ollama local.

### Agregar OpenAI API (Opcional)

1. Obtener API key de OpenAI: https://platform.openai.com/api-keys

2. Agregar a `.env`:
```bash
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4-turbo-preview
USE_OPENAI=true
```

3. Reiniciar backend:
```bash
docker restart chatbotdysa-backend
```

### Agregar Anthropic Claude API (Opcional)

1. Obtener API key de Anthropic: https://console.anthropic.com/

2. Agregar a `.env`:
```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
USE_ANTHROPIC=true
```

3. Reiniciar backend:
```bash
docker restart chatbotdysa-backend
```

### Modo Hybrid (Lo mejor de ambos)

```bash
# .env
USE_HYBRID=true
OLLAMA_URL=http://chatbotdysa-ollama:11434
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-api03-...

# Estrategia
AI_STRATEGY=smart  # Usa local para simple, cloud para complejo
```

---

## 📊 COMPARACIÓN DE COSTOS

### Escenario: 1,000 conversaciones/mes

| Opción | Costo Mensual | Calidad | Privacidad | Internet |
|--------|---------------|---------|------------|----------|
| **Ollama Local** | $0 | 7/10 | 100% | No requiere |
| **OpenAI GPT-3.5** | ~$10-20 | 8/10 | Datos a OpenAI | Requiere |
| **OpenAI GPT-4** | ~$30-50 | 9.5/10 | Datos a OpenAI | Requiere |
| **Claude 3.5 Sonnet** | ~$15-30 | 9/10 | Datos a Anthropic | Requiere |
| **Hybrid** | ~$5-15 | 8.5/10 | Parcial | Requiere |

---

## 🔒 PRIVACIDAD Y DATOS

### Ollama Local (Actual)
```
Usuario → Backend Local → Ollama Local → Respuesta
         └─ PostgreSQL Local (guarda conversación)

✅ NADA sale de tu Mac
✅ Conversaciones 100% privadas
✅ Sin términos de servicio de terceros
```

### APIs Cloud (Si se configura)
```
Usuario → Backend Local → API Cloud (OpenAI/Claude) → Respuesta
         └─ PostgreSQL Local (guarda conversación)

⚠️ Mensaje enviado a proveedor cloud
⚠️ Sujeto a términos de servicio
⚠️ Datos procesados en servidores externos
```

---

## 💡 RECOMENDACIÓN

### Para Desarrollo/Testing (AHORA)
**Usar Ollama Local** ✅
- Gratis
- Rápido para probar
- Sin dependencias externas
- Privacidad total

### Para Producción con Clientes Reales (FUTURO)
**Considerar Hybrid:**
- Ollama local para queries básicas (70% de casos)
- Claude/GPT-4 para queries complejas (30% de casos)
- Balance entre costo y calidad
- Fallback a local si API falla

### Para Clientes Enterprise (FUTURO)
**Opción On-Premise:**
- Ollama con modelos más grandes (llama3:70b, mixtral:8x7b)
- Sin conexión a internet
- Privacidad garantizada
- Puede requerir GPU dedicado

---

## 🚀 MODELOS OLLAMA DISPONIBLES

### Actuales en tu Sistema
```bash
# Verificar modelos instalados
docker exec chatbotdysa-ollama ollama list

# Actualmente tienes:
phi3:mini (2.4GB) ✅ - Instalado y funcionando
```

### Otros Modelos Disponibles para Descargar

**Pequeños (para laptop):**
```bash
# Descargar modelos adicionales
docker exec chatbotdysa-ollama ollama pull llama3.2:3b  # 2GB
docker exec chatbotdysa-ollama ollama pull gemma2:2b    # 1.6GB
```

**Medianos (mejor calidad):**
```bash
docker exec chatbotdysa-ollama ollama pull llama3:8b    # 4.7GB
docker exec chatbotdysa-ollama ollama pull mistral:7b   # 4.1GB
```

**Grandes (requiere GPU/mucha RAM):**
```bash
docker exec chatbotdysa-ollama ollama pull llama3:70b   # 40GB
docker exec chatbotdysa-ollama ollama pull mixtral:8x7b # 26GB
```

**Cambiar modelo activo:**
```bash
# En .env
OLLAMA_MODEL=llama3:8b  # Cambiar de phi3:mini a llama3:8b
```

---

## 📝 CONFIGURACIÓN ACTUAL

```bash
# apps/backend/.env (o variables Docker)

# AI Configuration
OLLAMA_URL=http://chatbotdysa-ollama:11434
OLLAMA_MODEL=phi3:mini

# Opcionales (comentadas por defecto)
# OPENAI_API_KEY=
# OPENAI_MODEL=gpt-4-turbo-preview
# ANTHROPIC_API_KEY=
# ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
# USE_HYBRID=false
```

---

## ✅ RESUMEN

```
╔══════════════════════════════════════════════════════════╗
║  CONFIGURACIÓN ACTUAL (RECOMENDADA PARA AHORA)          ║
╚══════════════════════════════════════════════════════════╝

Sistema Core:       100% Local ✅
  - Backend         → Local
  - Database        → Local
  - Cache           → Local
  - Frontend        → Local

AI Conversacional:  Local (Ollama phi3:mini) ✅
  - Modelo          → phi3:mini (2.4GB)
  - Ubicación       → localhost:21434
  - Costo           → $0/mes
  - Privacidad      → 100%
  - Internet        → No requiere

Opción Futura:      APIs Cloud (OpenAI/Claude)
  - Estado          → Disponible pero NO activado
  - Activación      → Manual (agregar API keys)
  - Uso             → Solo si tú lo configuras
```

**El bot solo usará APIs externas si TÚ explícitamente las configuras.
Por defecto, todo es 100% local.**

---

**Generado:** 28 de Octubre de 2025, 22:10 CLT
**Estado:** Sistema 100% Local con AI Local (Ollama)
