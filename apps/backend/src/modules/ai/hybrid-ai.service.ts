import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OllamaService, RestaurantContext } from './ollama.service';
import OpenAI from 'openai';

export interface AIResponse {
  content: string;
  provider: 'openai' | 'ollama' | 'fallback';
  tokensUsed?: number;
  responseTime: number;
  cached?: boolean;
}

export interface ConversationMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

@Injectable()
export class HybridAIService {
  private readonly logger = new Logger(HybridAIService.name);
  private openai: OpenAI | null = null;
  private readonly useOpenAI: boolean;
  private readonly openaiModel: string = 'gpt-4o-mini';

  // Cache de respuestas para preguntas frecuentes
  private responseCache = new Map<string, { response: string; timestamp: number }>();
  private readonly cacheExpiration = 3600000; // 1 hora

  constructor(
    private readonly configService: ConfigService,
    private readonly ollamaService: OllamaService,
  ) {
    const openaiKey = this.configService.get<string>('OPENAI_API_KEY');

    if (openaiKey && openaiKey.trim().length > 0) {
      this.openai = new OpenAI({
        apiKey: openaiKey,
      });
      this.useOpenAI = true;
      this.logger.log('✅ HybridAI initialized with OpenAI GPT-4o-mini (primary) + Ollama (fallback)');
    } else {
      this.useOpenAI = false;
      this.logger.warn('⚠️  OpenAI not configured, using Ollama only');
    }
  }

  /**
   * Genera una respuesta inteligente usando el mejor proveedor disponible
   */
  async generateResponse(
    userMessage: string,
    context: RestaurantContext,
  ): Promise<AIResponse> {
    const startTime = Date.now();

    // 1. Verificar cache para preguntas frecuentes
    const cacheKey = this.getCacheKey(userMessage, context);
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      this.logger.debug('📦 Response from cache');
      return {
        content: cached,
        provider: 'openai',
        responseTime: Date.now() - startTime,
        cached: true,
      };
    }

    // 2. Construir el prompt con RESTRICCIONES ESTRICTAS
    const systemPrompt = this.buildRestrictedSystemPrompt(context);
    const messages = this.buildMessages(systemPrompt, userMessage, context);

    // 3. Intentar OpenAI primero (más natural)
    if (this.useOpenAI && this.openai) {
      try {
        const response = await this.generateWithOpenAI(messages);

        // Guardar en cache si es exitoso
        this.saveToCache(cacheKey, response.content);

        return {
          ...response,
          responseTime: Date.now() - startTime,
        };
      } catch (error) {
        this.logger.warn('OpenAI failed, falling back to Ollama:', error instanceof Error ? error.message : 'Unknown error');
      }
    }

    // 4. Fallback a Ollama
    try {
      const content = await this.ollamaService.generateRestaurantResponse(
        userMessage,
        context,
      );

      return {
        content,
        provider: 'ollama',
        responseTime: Date.now() - startTime,
      };
    } catch (error) {
      this.logger.error('Both AI providers failed, using fallback:', error instanceof Error ? error.message : 'Unknown error');

      // 5. Fallback final: respuestas pre-programadas
      return {
        content: this.getFallbackResponse(userMessage, context),
        provider: 'fallback',
        responseTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Construye un prompt con restricciones ESTRICTAS para que solo hable del restaurante
   */
  private buildRestrictedSystemPrompt(context: RestaurantContext): string {
    const restaurantName = context.restaurantInfo?.name || 'nuestro restaurante';

    return `Eres ChefBot Dysa 👨‍🍳, el asistente virtual EXCLUSIVO de ${restaurantName}.

🚫 RESTRICCIONES ABSOLUTAS:
1. SOLO puedes hablar sobre ${restaurantName}: menú, reservas, pedidos, horarios, ubicación, especialidades
2. NO tienes acceso a internet ni información externa
3. NO respondas preguntas sobre otros restaurantes, noticias, clima, deportes, etc.
4. SI te preguntan algo fuera del restaurante, responde: "Lo siento, solo puedo ayudarte con información sobre ${restaurantName}. ¿Te gustaría conocer nuestro menú, hacer una reserva o realizar un pedido?"

✅ PUEDES AYUDAR CON:
- 🍽️ Consultar menú, precios, ingredientes, platos del día
- 📅 Hacer, modificar o cancelar reservas
- 🛵 Tomar pedidos para delivery o takeaway
- ℹ️ Información del restaurante (horarios, ubicación, teléfono)
- 🎁 Promociones y especialidades actuales
- ❓ Preguntas sobre métodos de pago, políticas de cancelación

📋 INFORMACIÓN DEL RESTAURANTE:
${context.restaurantInfo ? `
- Nombre: ${context.restaurantInfo.name}
- Dirección: ${context.restaurantInfo.address || 'Consultar'}
- Teléfono: ${context.restaurantInfo.phone || 'Consultar'}
- Horarios: ${context.restaurantInfo.hours || 'Consultar'}
- Especialidades: ${context.restaurantInfo.specialties?.join(', ') || 'Consultar menú'}
` : 'Información no disponible'}

${context.menuItems && context.menuItems.length > 0 ? `
🍽️ MENÚ DISPONIBLE (${context.menuItems.length} items):
${context.menuItems.map(item =>
  `- ${item.name}: $${item.price} - ${item.description || item.category}${item.available === false ? ' (No disponible)' : ''}`
).join('\n')}
` : ''}

👤 CONTEXTO DEL CLIENTE:
${context.customerName ? `Nombre: ${context.customerName}` : 'Cliente nuevo'}
${context.reservations && context.reservations.length > 0 ? `
Reservas activas: ${context.reservations.length}
${context.reservations.map(r =>
  `- ${r.reservation_code}: ${r.reservation_date} para ${r.party_size} personas (${r.status})`
).join('\n')}
` : ''}

🎯 ESTILO DE RESPUESTA:
- Natural, cálido y profesional (como un mesero experto)
- Usa emojis apropiados pero sin exagerar
- Respuestas concisas (2-3 oraciones máximo)
- Si no sabes algo del restaurante, sé honesto y ofrece contactar al personal
- Termina con una pregunta amigable para continuar la conversación
- NUNCA inventes información que no tengas

🚫 LO QUE NUNCA DEBES HACER:
- Hablar de temas fuera del restaurante
- Inventar platos o precios que no están en el menú
- Dar información sobre otros restaurantes
- Responder preguntas generales de internet
- Hacer recomendaciones basadas en información externa

RECUERDA: Eres el asistente del restaurante, no un asistente general de IA.`;
  }

  /**
   * Construye los mensajes para la conversación
   */
  private buildMessages(
    systemPrompt: string,
    userMessage: string,
    context: RestaurantContext,
  ): ConversationMessage[] {
    const messages: ConversationMessage[] = [
      { role: 'system', content: systemPrompt },
    ];

    // Agregar mensajes previos (máximo 10 para no exceder contexto)
    if (context.previousMessages && context.previousMessages.length > 0) {
      const recentMessages = context.previousMessages.slice(-10);
      messages.push(...recentMessages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: new Date(),
      })));
    }

    // Agregar mensaje actual
    messages.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    });

    return messages;
  }

  /**
   * Genera respuesta con OpenAI GPT-4o-mini
   */
  private async generateWithOpenAI(
    messages: ConversationMessage[],
  ): Promise<Omit<AIResponse, 'responseTime'>> {
    if (!this.openai) {
      throw new Error('OpenAI not initialized');
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.openaiModel,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        temperature: 0.7, // Natural pero consistente
        max_tokens: 200, // Respuestas concisas
        presence_penalty: 0.6, // Evita repetición
        frequency_penalty: 0.3, // Más variedad en palabras
      });

      const content = completion.choices[0]?.message?.content || '';
      const tokensUsed = completion.usage?.total_tokens || 0;

      this.logger.debug(`OpenAI response: ${tokensUsed} tokens`);

      return {
        content,
        provider: 'openai',
        tokensUsed,
      };
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error('OpenAI API error:', error.message);
      }
      throw error;
    }
  }

  /**
   * Obtiene una respuesta de fallback pre-programada
   */
  private getFallbackResponse(
    userMessage: string,
    context: RestaurantContext,
  ): string {
    const lowerMessage = userMessage.toLowerCase();
    const restaurantName = context.restaurantInfo?.name || 'nuestro restaurante';

    // Respuestas comunes pre-programadas
    if (lowerMessage.includes('hola') || lowerMessage.includes('buenos') || lowerMessage.includes('buenas')) {
      return `¡Hola! 👋 Bienvenido a ${restaurantName}. ¿Te gustaría conocer nuestro menú, hacer una reserva o realizar un pedido?`;
    }

    if (lowerMessage.includes('menú') || lowerMessage.includes('menu') || lowerMessage.includes('platos')) {
      if (context.menuItems && context.menuItems.length > 0) {
        return `Te muestro nuestro menú:\n\n${context.menuItems.slice(0, 5).map(item => `🍽️ ${item.name} - $${item.price}`).join('\n')}\n\n¿Te gustaría saber más sobre algún plato?`;
      }
      return `Tenemos un menú delicioso. ¿Qué tipo de comida te gustaría? 🍽️`;
    }

    if (lowerMessage.includes('reserva')) {
      return `Con gusto te ayudo con tu reserva 📅. ¿Para cuántas personas y qué día te gustaría reservar?`;
    }

    if (lowerMessage.includes('pedido') || lowerMessage.includes('delivery') || lowerMessage.includes('ordenar')) {
      return `¡Perfecto! 🛵 ¿Qué te gustaría ordenar? Puedo ayudarte a armar tu pedido del menú.`;
    }

    if (lowerMessage.includes('horario') || lowerMessage.includes('hora')) {
      const hours = context.restaurantInfo?.hours || 'Lunes a Domingo de 12:00 a 23:00';
      return `Nuestros horarios son: ${hours} ⏰`;
    }

    if (lowerMessage.includes('dirección') || lowerMessage.includes('direccion') || lowerMessage.includes('ubicación') || lowerMessage.includes('ubicacion') || lowerMessage.includes('donde')) {
      const address = context.restaurantInfo?.address || 'Consulta con nosotros';
      return `Estamos ubicados en: ${address} 📍`;
    }

    // Respuesta genérica
    return `Disculpa, en este momento tengo dificultades técnicas para responderte. 😅 Pero puedo ayudarte con:\n\n🍽️ Consultar el menú\n📅 Hacer reservas\n🛵 Tomar pedidos\n📞 Información del restaurante\n\n¿Con qué te gustaría ayuda?`;
  }

  /**
   * Sistema de caché para respuestas frecuentes
   */
  private getCacheKey(message: string, context: RestaurantContext): string {
    const normalized = message.toLowerCase().trim();
    const restaurantId = context.restaurantInfo?.name || 'default';
    return `${restaurantId}:${normalized}`;
  }

  private getFromCache(key: string): string | null {
    const cached = this.responseCache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > this.cacheExpiration;
    if (isExpired) {
      this.responseCache.delete(key);
      return null;
    }

    return cached.response;
  }

  private saveToCache(key: string, response: string): void {
    // Limpiar cache si es muy grande (máximo 100 entradas)
    if (this.responseCache.size > 100) {
      const firstKey = this.responseCache.keys().next().value;
      if (firstKey) {
        this.responseCache.delete(firstKey);
      }
    }

    this.responseCache.set(key, {
      response,
      timestamp: Date.now(),
    });
  }

  /**
   * Limpia el caché (útil para testing o reinicio)
   */
  clearCache(): void {
    this.responseCache.clear();
    this.logger.log('Cache cleared');
  }

  /**
   * Obtiene estadísticas del servicio
   */
  getStats() {
    return {
      service: 'Hybrid AI Service',
      primaryProvider: this.useOpenAI ? 'OpenAI GPT-4o-mini' : 'Ollama only',
      fallbackProvider: 'Ollama',
      emergencyFallback: 'Pre-programmed responses',
      cacheSize: this.responseCache.size,
      cacheExpiration: `${this.cacheExpiration / 60000} minutes`,
      openaiConfigured: this.useOpenAI,
      model: this.openaiModel,
    };
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{
    openai: boolean;
    ollama: boolean;
    overall: boolean;
  }> {
    const openaiHealthy = this.openai !== null;
    const ollamaHealthy = await this.ollamaService.isOllamaRunning();

    return {
      openai: openaiHealthy,
      ollama: ollamaHealthy,
      overall: openaiHealthy || ollamaHealthy,
    };
  }
}
