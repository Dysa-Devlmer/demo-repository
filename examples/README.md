# 💡 Ejemplos de Uso - ChatBotDysa

Esta carpeta contiene ejemplos prácticos de cómo integrar y usar el chatbot de IA en diferentes escenarios.

## 📁 Archivos

### `chatbot-usage-examples.ts`

Ejemplos completos que muestran:

#### 1. Uso con API (Backend) ⭐ RECOMENDADO
- `example1_BasicAPIUsage()` - Uso básico desde el frontend
- `example1_ConversationWithHistory()` - Conversación con historial
- `example1_CheckAIHealth()` - Verificar estado del AI

#### 2. Uso Directo con Ollama
- `example2_DirectOllamaUsage()` - Cliente Ollama directo
- `example2_StreamingResponse()` - Respuestas en tiempo real (stream)
- `example2_DirectHTTPRequest()` - Peticiones HTTP directas con axios

#### 3. Configuración Personalizada
- `example3_CustomTemperature()` - Ajustar creatividad vs consistencia
- `example3_DifferentModels()` - Comparar diferentes modelos
- `example3_DynamicPrompt()` - Construir prompts dinámicamente
- `example3_ErrorHandlingAndFallback()` - Manejo robusto de errores

#### 4. Integración en React
- Hook personalizado `useChatbot()`
- Componente de ejemplo

## 🚀 Cómo Usar

### Requisitos Previos

```bash
# 1. Ollama corriendo
ollama serve

# 2. Backend corriendo
cd apps/backend
npm run start:dev

# 3. PostgreSQL corriendo
docker ps | grep postgres
```

### Ejecutar Ejemplos

#### Opción 1: Ejecutar directamente

```bash
# Instalar ts-node si no lo tienes
npm install -g ts-node

# Ejecutar
npx ts-node examples/chatbot-usage-examples.ts
```

#### Opción 2: Importar en tu código

```typescript
import { example1_BasicAPIUsage } from './examples/chatbot-usage-examples';

// Ejecutar
const result = await example1_BasicAPIUsage();
console.log(result);
```

## 📚 Ejemplos por Caso de Uso

### Caso 1: Chat Básico desde Frontend

```typescript
// Ver: example1_BasicAPIUsage()

const response = await fetch('http://localhost:8005/ai/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    message: "Hola, quiero hacer una reserva",
    customerName: "Cliente Test"
  })
});

const { response: botMessage } = await response.json();
```

### Caso 2: Chat con Contexto del Restaurante

```typescript
// Ver: example1_BasicAPIUsage() - con contexto completo

const response = await fetch('http://localhost:8005/ai/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    message: "¿Cuál es el plato más caro?",
    context: {
      restaurantInfo: {
        name: "Mi Restaurante",
        address: "Calle 123",
        phone: "+56912345678"
      },
      menuItems: [
        {
          id: 1,
          name: "Parrillada",
          price: 28000,
          category: "Carnes"
        }
      ]
    }
  })
});
```

### Caso 3: Conversación con Historial

```typescript
// Ver: example1_ConversationWithHistory()

const previousMessages = [
  { role: 'user', content: '¿Tienen disponibilidad?' },
  { role: 'assistant', content: 'Sí, ¿para cuántas personas?' }
];

const response = await fetch('http://localhost:8005/ai/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    message: "Para 4 personas",
    context: {
      previousMessages
    }
  })
});
```

### Caso 4: Uso Directo de Ollama (Sin Backend)

```typescript
// Ver: example2_DirectOllamaUsage()

import { Ollama } from 'ollama';

const ollama = new Ollama({ host: 'http://localhost:11434' });

const response = await ollama.chat({
  model: 'phi3:mini',
  messages: [
    { role: 'system', content: 'Eres ChefBot Dysa' },
    { role: 'user', content: '¿Qué especialidades tienen?' }
  ]
});

console.log(response.message.content);
```

### Caso 5: Streaming (Respuestas en Tiempo Real)

```typescript
// Ver: example2_StreamingResponse()

const stream = await ollama.chat({
  model: 'phi3:mini',
  messages: [{ role: 'user', content: 'Hola' }],
  stream: true
});

for await (const chunk of stream) {
  process.stdout.write(chunk.message.content);
}
```

### Caso 6: Hook de React

```typescript
// Ver comentarios en chatbot-usage-examples.ts

import { useChatbot } from './hooks/useChatbot';

function ChatComponent() {
  const { messages, isLoading, sendMessage } = useChatbot(
    'http://localhost:8005',
    token
  );

  return (
    <div>
      {messages.map((msg, i) => (
        <div key={i}>{msg.content}</div>
      ))}
      <button onClick={() => sendMessage('Hola')}>
        Enviar
      </button>
    </div>
  );
}
```

## 🎯 Cuándo Usar Cada Método

### Usa la API (Ejemplos 1.x)
- ✅ Para producción
- ✅ Necesitas fallback automático
- ✅ Quieres caché de respuestas
- ✅ Integración completa con el sistema

### Usa Ollama Directo (Ejemplos 2.x)
- ✅ Para prototipos rápidos
- ✅ Testing local
- ✅ No necesitas backend
- ✅ Control total del prompt

### Usa Personalizado (Ejemplos 3.x)
- ✅ Casos específicos
- ✅ Ajustar temperatura/creatividad
- ✅ Probar diferentes modelos
- ✅ Fallback personalizado

## 🔧 Configuración

### Variables de Entorno

```bash
# Backend (.env)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=phi3:mini

# Opcional: OpenAI
OPENAI_API_KEY=sk-proj-xxxxx
OPENAI_MODEL=gpt-4o-mini
```

### Modelos Disponibles

```bash
# Descargar modelos
ollama pull phi3:mini        # Rápido (~2GB)
ollama pull llama3:8b        # Balanceado (~5GB)
ollama pull llama3:70b       # Más inteligente (~40GB)

# Ver instalados
ollama list
```

## 📊 Comparación de Rendimiento

| Modelo | Tamaño | Velocidad | Calidad | Uso Recomendado |
|--------|--------|-----------|---------|-----------------|
| phi3:mini | ~2GB | ⚡⚡⚡ | ⭐⭐⭐ | Testing, prototipos |
| llama3:8b | ~5GB | ⚡⚡ | ⭐⭐⭐⭐ | Producción |
| llama3:70b | ~40GB | ⚡ | ⭐⭐⭐⭐⭐ | Alta precisión |

## 🐛 Troubleshooting

### Error: "Cannot connect to Ollama"

```bash
# Verificar que Ollama está corriendo
curl http://localhost:11434/api/version

# Si no responde, iniciar
ollama serve
```

### Error: "Model not found"

```bash
# Descargar el modelo
ollama pull phi3:mini

# Verificar modelos instalados
ollama list
```

### Error: "401 Unauthorized"

```bash
# Obtener nuevo token
curl -X POST http://localhost:8005/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@zgamersa.com","password":"Admin123!"}'
```

## 📖 Documentación Relacionada

- [GUIA_TESTING_LOCAL.md](../GUIA_TESTING_LOCAL.md) - Guía completa de testing
- [TESTING_LOCAL_RESUMEN.md](../TESTING_LOCAL_RESUMEN.md) - Resumen ejecutivo
- [COMO_DESPLEGAR.md](../COMO_DESPLEGAR.md) - Despliegue en producción

## 🎓 Aprende Más

### Conceptos Clave

**Temperature (Temperatura):**
- `0.0` = Determinista, siempre la misma respuesta
- `0.7` = Balanceado (recomendado)
- `1.0` = Creativo, respuestas variadas

**Tokens:**
- Unidad de texto que el modelo procesa
- ~1 token = 0.75 palabras en español
- `num_predict: 150` = ~112 palabras máximo

**Streaming:**
- Respuestas palabra por palabra en tiempo real
- Mejor UX para respuestas largas
- Requiere manejo de eventos

### Recursos

- [Ollama Docs](https://github.com/ollama/ollama)
- [Ollama Models](https://ollama.com/library)
- [OpenAI API](https://platform.openai.com/docs)

## 💬 Preguntas Frecuentes

**¿Puedo usar GPT-4 en lugar de Ollama?**
Sí, configura `OPENAI_API_KEY` en `.env` y el sistema usará GPT-4o-mini primero.

**¿Cómo cambio la personalidad del bot?**
Edita `apps/backend/src/modules/ai/ollama.service.ts` línea 320.

**¿Cuál es el mejor modelo para producción?**
`llama3:8b` ofrece el mejor balance entre velocidad y calidad.

**¿Puedo usar otros modelos?**
Sí, cualquier modelo de Ollama. Descárgalo con `ollama pull nombre-modelo`.

---

**¿Tienes más preguntas?**
Revisa [GUIA_TESTING_LOCAL.md](../GUIA_TESTING_LOCAL.md) para información detallada.

🎉 **¡Feliz coding!**
