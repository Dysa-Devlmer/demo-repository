/**
 * ╔════════════════════════════════════════════════════════════╗
 * ║  ChatBotDysa - Ejemplos de Uso del Chatbot IA             ║
 * ╚════════════════════════════════════════════════════════════╝
 *
 * Este archivo muestra las 3 formas de usar el chatbot:
 * 1. Con API (usando el backend - RECOMENDADO)
 * 2. Sin API (directo a Ollama)
 * 3. Personalizado (con configuración avanzada)
 */

// ============================================
// EJEMPLO 1: CON API (A través del Backend)
// ============================================
// ✅ Recomendado para producción
// ✅ Incluye fallback automático
// ✅ Sistema de caché

/**
 * Ejemplo 1A: Uso básico desde el frontend
 */
async function example1_BasicAPIUsage() {
  const API_URL = 'http://localhost:8005';

  // 1. Login para obtener token
  const loginResponse = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@zgamersa.com',
      password: 'Admin123!'
    })
  });

  const { token } = await loginResponse.json();

  // 2. Hacer pregunta al chatbot
  const chatResponse = await fetch(`${API_URL}/ai/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      message: "Hola, quisiera hacer una reserva para 4 personas",
      customerName: "Juan Pérez",
      context: {
        restaurantInfo: {
          name: "Restaurante El Sabor",
          address: "Calle Principal 123, Santiago",
          phone: "+56912345678",
          hours: "Lunes a Domingo 12:00 - 23:00",
          specialties: ["Parrillas", "Mariscos", "Pastas"]
        },
        menuItems: [
          {
            id: 1,
            name: "Parrillada Premium",
            price: 28000,
            category: "Carnes",
            description: "Mix de carnes selectas",
            available: true
          },
          {
            id: 2,
            name: "Ceviche de Corvina",
            price: 12000,
            category: "Mariscos",
            description: "Fresco del día",
            available: true
          }
        ]
      }
    })
  });

  const data = await chatResponse.json();

  console.log('Respuesta del bot:', data.response);
  console.log('Proveedor:', data.provider); // 'openai', 'ollama', o 'fallback'
  console.log('Tiempo de procesamiento:', data.processingTime, 'ms');

  return data;
}

/**
 * Ejemplo 1B: Conversación con historial
 */
async function example1_ConversationWithHistory(token: string) {
  const API_URL = 'http://localhost:8005';

  // Historial de mensajes previos
  const previousMessages = [
    {
      role: 'user' as const,
      content: '¿Tienen disponibilidad para esta noche?'
    },
    {
      role: 'assistant' as const,
      content: 'Sí, tenemos disponibilidad. ¿Para cuántas personas?'
    }
  ];

  const response = await fetch(`${API_URL}/ai/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      message: "Para 6 personas a las 20:00",
      customerName: "María González",
      sessionId: "session_123456",
      context: {
        previousMessages,
        restaurantInfo: {
          name: "Restaurante El Sabor"
        }
      }
    })
  });

  return await response.json();
}

/**
 * Ejemplo 1C: Verificar estado del AI
 */
async function example1_CheckAIHealth(token: string) {
  const API_URL = 'http://localhost:8005';

  const response = await fetch(`${API_URL}/ai/health`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const health = await response.json();

  console.log('Estado del AI:', {
    isRunning: health.isRunning,
    baseUrl: health.baseUrl,
    model: health.defaultModel,
    modelos_disponibles: health.models
  });

  return health;
}

// ============================================
// EJEMPLO 2: SIN API (Directo a Ollama)
// ============================================
// ⚠️ Solo para testing o casos específicos
// ✅ Más rápido (sin intermediarios)
// ❌ Sin fallback ni caché

/**
 * Ejemplo 2A: Uso directo de Ollama (requiere: npm install ollama)
 */
async function example2_DirectOllamaUsage() {
  // IMPORTANTE: Instalar primero: npm install ollama
  const { Ollama } = await import('ollama');

  const ollama = new Ollama({
    host: 'http://localhost:11434'
  });

  const response = await ollama.chat({
    model: 'phi3:mini',
    messages: [
      {
        role: 'system',
        content: `Eres ChefBot Dysa, asistente del Restaurante El Sabor.

Información del Restaurante:
- Nombre: Restaurante El Sabor
- Dirección: Calle Principal 123, Santiago
- Teléfono: +56912345678
- Horarios: Lunes a Domingo 12:00 - 23:00
- Especialidades: Parrillas, Mariscos, Pastas

Menú:
- Parrillada Premium: $28.000 (Mix de carnes selectas)
- Ceviche de Corvina: $12.000 (Fresco del día)
- Pasta Carbonara: $9.500 (Receta tradicional)
- Tiramisú Casero: $6.500 (Postre italiano)

Responde SOLO sobre el restaurante. Sé amigable y profesional.`
      },
      {
        role: 'user',
        content: '¿Cuál es su plato más popular?'
      }
    ],
    stream: false
  });

  console.log('Respuesta:', response.message.content);
  return response.message.content;
}

/**
 * Ejemplo 2B: Streaming de respuestas (respuesta en tiempo real)
 */
async function example2_StreamingResponse() {
  const { Ollama } = await import('ollama');

  const ollama = new Ollama({
    host: 'http://localhost:11434'
  });

  console.log('Bot: ');

  const stream = await ollama.chat({
    model: 'phi3:mini',
    messages: [
      {
        role: 'system',
        content: 'Eres ChefBot Dysa, asistente de Restaurante El Sabor.'
      },
      {
        role: 'user',
        content: 'Cuéntame sobre el restaurante'
      }
    ],
    stream: true
  });

  // Procesar el stream palabra por palabra
  for await (const chunk of stream) {
    process.stdout.write(chunk.message.content);
  }

  console.log('\n');
}

/**
 * Ejemplo 2C: Uso con axios (si prefieres usar HTTP directo)
 */
async function example2_DirectHTTPRequest() {
  const axios = (await import('axios')).default;

  const response = await axios.post('http://localhost:11434/api/generate', {
    model: 'phi3:mini',
    prompt: 'Como asistente del Restaurante El Sabor, responde: ¿Qué especialidades tienen?',
    stream: false,
    options: {
      temperature: 0.7,
      num_predict: 150
    }
  });

  console.log('Respuesta:', response.data.response);
  return response.data.response;
}

// ============================================
// EJEMPLO 3: PERSONALIZADO (Configuración Avanzada)
// ============================================
// 🎯 Para casos específicos que requieren control total

/**
 * Ejemplo 3A: Personalizar temperatura y creatividad
 */
async function example3_CustomTemperature(token: string) {
  const API_URL = 'http://localhost:8005';

  // Temperatura baja (0.3) = Respuestas más consistentes y predecibles
  const conservativeResponse = await fetch(`${API_URL}/ai/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      prompt: "Describe el Restaurante El Sabor en una oración",
      temperature: 0.3,  // Poco creativo, muy consistente
      maxTokens: 100
    })
  });

  // Temperatura alta (1.0) = Respuestas más creativas pero menos predecibles
  const creativeResponse = await fetch(`${API_URL}/ai/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      prompt: "Describe el Restaurante El Sabor en una oración",
      temperature: 1.0,  // Muy creativo, menos consistente
      maxTokens: 100
    })
  });

  console.log('Conservativa:', await conservativeResponse.json());
  console.log('Creativa:', await creativeResponse.json());
}

/**
 * Ejemplo 3B: Usar diferentes modelos
 */
async function example3_DifferentModels() {
  const { Ollama } = await import('ollama');
  const ollama = new Ollama({ host: 'http://localhost:11434' });

  const prompt = '¿Cuál es la especialidad del restaurante?';

  // Modelo pequeño y rápido
  const fast = await ollama.chat({
    model: 'phi3:mini',
    messages: [{ role: 'user', content: prompt }]
  });

  // Modelo mediano (más inteligente pero más lento)
  // Nota: primero ejecutar: ollama pull llama3:8b
  const smart = await ollama.chat({
    model: 'llama3:8b',
    messages: [{ role: 'user', content: prompt }]
  });

  console.log('Phi3 (rápido):', fast.message.content);
  console.log('Llama3 (inteligente):', smart.message.content);
}

/**
 * Ejemplo 3C: Prompt personalizado con datos dinámicos
 */
async function example3_DynamicPrompt(menuItems: any[], reservations: any[]) {
  const { Ollama } = await import('ollama');
  const ollama = new Ollama({ host: 'http://localhost:11434' });

  // Construir prompt dinámicamente
  const menuList = menuItems
    .map(item => `- ${item.name}: $${item.price} (${item.description})`)
    .join('\n');

  const reservationList = reservations
    .map(r => `- ${r.reservation_code}: ${r.party_size} personas el ${r.reservation_date}`)
    .join('\n');

  const systemPrompt = `Eres ChefBot Dysa del Restaurante El Sabor.

MENÚ ACTUAL:
${menuList}

RESERVAS DEL CLIENTE:
${reservationList || 'Sin reservas previas'}

Responde de forma natural y útil.`;

  const response = await ollama.chat({
    model: 'phi3:mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: '¿Qué me recomiendas para cenar?' }
    ]
  });

  return response.message.content;
}

/**
 * Ejemplo 3D: Manejo de errores y fallback
 */
async function example3_ErrorHandlingAndFallback(token: string) {
  const API_URL = 'http://localhost:8005';

  try {
    // Intentar con API primero
    const response = await fetch(`${API_URL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        message: "Hola"
      }),
      signal: AbortSignal.timeout(5000) // Timeout de 5 segundos
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.response;

  } catch (error) {
    console.warn('API falló, intentando Ollama directo...', error);

    try {
      // Fallback: Ollama directo
      const { Ollama } = await import('ollama');
      const ollama = new Ollama({ host: 'http://localhost:11434' });

      const response = await ollama.chat({
        model: 'phi3:mini',
        messages: [
          { role: 'user', content: 'Hola' }
        ]
      });

      return response.message.content;

    } catch (ollamaError) {
      console.error('Ollama también falló:', ollamaError);

      // Fallback final: Respuesta pre-programada
      return getFallbackResponse('Hola');
    }
  }
}

/**
 * Respuestas pre-programadas de emergencia
 */
function getFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  const responses: Record<string, string> = {
    hola: '¡Hola! Bienvenido a Restaurante El Sabor. ¿En qué puedo ayudarte?',
    menu: 'Tenemos parrillas, mariscos y pastas. ¿Te gustaría conocer más detalles?',
    reserva: '¿Para cuántas personas y qué fecha te gustaría reservar?',
    horario: 'Estamos abiertos de Lunes a Domingo de 12:00 a 23:00.',
    direccion: 'Nos encontramos en Calle Principal 123, Santiago.',
  };

  for (const [key, response] of Object.entries(responses)) {
    if (lowerMessage.includes(key)) {
      return response;
    }
  }

  return 'Gracias por contactarnos. ¿Puedo ayudarte con el menú, reservas o información del restaurante?';
}

// ============================================
// EJEMPLOS DE INTEGRACIÓN EN REACT
// ============================================

/**
 * Ejemplo 4A: Hook personalizado de React para el chatbot
 */
/*
import { useState, useCallback } from 'react';

export function useChatbot(apiUrl: string, token: string) {
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (message: string, context?: any) => {
    setIsLoading(true);

    // Agregar mensaje del usuario
    setMessages(prev => [...prev, { role: 'user', content: message }]);

    try {
      const response = await fetch(`${apiUrl}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message,
          context,
          context: {
            ...context,
            previousMessages: messages
          }
        })
      });

      const data = await response.json();

      // Agregar respuesta del bot
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);

      return data;
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Lo siento, hubo un error. Por favor intenta nuevamente.'
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, token, messages]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return { messages, isLoading, sendMessage, clearMessages };
}

// Uso del hook:
function ChatComponent() {
  const { messages, isLoading, sendMessage } = useChatbot(
    'http://localhost:8005',
    'your-token-here'
  );

  const handleSend = async () => {
    await sendMessage('Hola, quiero hacer una reserva', {
      restaurantInfo: {
        name: 'Restaurante El Sabor'
      }
    });
  };

  return (
    <div>
      {messages.map((msg, i) => (
        <div key={i} className={msg.role}>
          {msg.content}
        </div>
      ))}
      <button onClick={handleSend} disabled={isLoading}>
        Enviar
      </button>
    </div>
  );
}
*/

// ============================================
// EXPORTAR FUNCIONES PARA TESTING
// ============================================
export {
  example1_BasicAPIUsage,
  example1_ConversationWithHistory,
  example1_CheckAIHealth,
  example2_DirectOllamaUsage,
  example2_StreamingResponse,
  example2_DirectHTTPRequest,
  example3_CustomTemperature,
  example3_DifferentModels,
  example3_DynamicPrompt,
  example3_ErrorHandlingAndFallback,
  getFallbackResponse
};

// ============================================
// EJEMPLOS DE EJECUCIÓN
// ============================================

/**
 * Para ejecutar estos ejemplos:
 *
 * 1. Asegúrate de tener todo corriendo:
 *    - Ollama: ollama serve
 *    - Backend: cd apps/backend && npm run start:dev
 *    - PostgreSQL: docker start chatbotdysa-postgres
 *
 * 2. Ejecuta un ejemplo:
 *    npx ts-node examples/chatbot-usage-examples.ts
 *
 * 3. O importa en tu código:
 *    import { example1_BasicAPIUsage } from './examples/chatbot-usage-examples';
 *    await example1_BasicAPIUsage();
 */

// Ejemplo de ejecución si se ejecuta directamente
if (require.main === module) {
  console.log('🤖 Ejemplos de Uso del Chatbot ChatBotDysa\n');
  console.log('Para ejecutar los ejemplos, descomenta la función deseada:\n');
  console.log('- example1_BasicAPIUsage()');
  console.log('- example2_DirectOllamaUsage()');
  console.log('- example3_CustomTemperature(token)');
  console.log('\n📖 Ver código para más detalles');

  // Descomentar para probar:
  // example1_BasicAPIUsage().then(console.log);
}
