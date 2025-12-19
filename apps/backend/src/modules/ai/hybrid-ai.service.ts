import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OllamaService, RestaurantContext } from './ollama.service';
import { LearningMemoryService, ExperienceFeatures } from './learning-memory.service';
import { CustomerMemoryService } from './customer-memory.service';
import OpenAI from 'openai';

export interface AIResponse {
  content: string;
  provider: 'openai' | 'ollama' | 'fallback';
  tokensUsed?: number;
  responseTime: number;
  cached?: boolean;
  experienceId?: number; // ID de la experiencia para feedback posterior
  features?: ExperienceFeatures; // Features analizados del mensaje
  memoriesUsed?: number; // Número de memorias del cliente usadas
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
    private readonly learningMemory: LearningMemoryService,
    private readonly customerMemory: CustomerMemoryService
  ) {
    const openaiKey = this.configService.get<string>('OPENAI_API_KEY');

    if (openaiKey && openaiKey.trim().length > 0) {
      this.openai = new OpenAI({
        apiKey: openaiKey,
      });
      this.useOpenAI = true;
      this.logger.log(
        '✅ HybridAI initialized with OpenAI GPT-4o-mini (primary) + Ollama (fallback) + JARVIS Learning'
      );
    } else {
      this.useOpenAI = false;
      this.logger.warn('⚠️  OpenAI not configured, using Ollama only + JARVIS Learning');
    }
  }

  /**
   * Genera una respuesta inteligente usando el mejor proveedor disponible
   * Con sistema de aprendizaje JARVIS + memoria del cliente integrado
   */
  async generateResponse(
    userMessage: string,
    context: RestaurantContext & {
      conversationId?: number;
      customerId?: number;
      channel?: string;
    }
  ): Promise<AIResponse> {
    const startTime = Date.now();
    let memoriesUsed = 0;

    // 0. Analizar mensaje con JARVIS Learning
    const features = this.learningMemory.analyzeMessage(userMessage);
    this.logger.debug(
      `📊 JARVIS Analysis: intent=${features.intent}, sentiment=${features.sentiment.toFixed(2)}, complexity=${features.complexity}`
    );

    // 0.5 Extraer y guardar memorias del mensaje del cliente
    if (context.customerId) {
      try {
        const extractedMemories = this.customerMemory.extractMemoriesFromMessage(userMessage);
        for (const memory of extractedMemories) {
          await this.customerMemory.saveMemory(context.customerId, memory, {
            customerId: context.customerId,
            conversationId: context.conversationId,
            channel: context.channel,
          });
        }
        if (extractedMemories.length > 0) {
          this.logger.log(`🧠 Extracted ${extractedMemories.length} memories from message`);
        }
      } catch (error) {
        this.logger.warn(
          'Failed to extract memories:',
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    }

    // 1. Verificar cache para preguntas frecuentes
    const cacheKey = this.getCacheKey(userMessage, context);
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      this.logger.debug('📦 Response from cache');

      // Guardar experiencia incluso para cache hits
      const experience = await this.learningMemory.saveExperience({
        userInput: userMessage,
        botResponse: cached,
        aiProvider: 'cache',
        responseTimeMs: Date.now() - startTime,
        fromCache: true,
        conversationId: context.conversationId,
        customerId: context.customerId,
        channel: context.channel,
      });

      return {
        content: cached,
        provider: 'openai',
        responseTime: Date.now() - startTime,
        cached: true,
        experienceId: experience.id,
        features,
      };
    }

    // 1.5 Verificar si hay una respuesta sugerida del aprendizaje
    const suggestedResponse = this.learningMemory.getSuggestedResponse(features);
    if (suggestedResponse && features.complexity <= 5) {
      this.logger.debug('🧠 Using JARVIS learned response');
      // Guardar en cache la respuesta aprendida
      this.saveToCache(cacheKey, suggestedResponse);

      const experience = await this.learningMemory.saveExperience({
        userInput: userMessage,
        botResponse: suggestedResponse,
        aiProvider: 'jarvis_learned',
        responseTimeMs: Date.now() - startTime,
        fromCache: false,
        conversationId: context.conversationId,
        customerId: context.customerId,
        channel: context.channel,
      });

      return {
        content: suggestedResponse,
        provider: 'ollama', // Reportamos como ollama para estadísticas
        responseTime: Date.now() - startTime,
        cached: false,
        experienceId: experience.id,
        features,
      };
    }

    // 2. Obtener memorias del cliente para personalización
    let customerMemoriesPrompt = '';
    if (context.customerId) {
      try {
        customerMemoriesPrompt = await this.customerMemory.getMemoriesForPrompt(context.customerId);
        const memories = await this.customerMemory.getCustomerMemories(context.customerId);
        memoriesUsed = memories.length;
        if (memoriesUsed > 0) {
          this.logger.debug(`📚 Using ${memoriesUsed} customer memories for response`);
        }
      } catch (error) {
        this.logger.warn(
          'Failed to get customer memories:',
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    }

    // 3. Construir el prompt con RESTRICCIONES ESTRICTAS + adaptación al estilo del cliente + memorias
    const systemPrompt = this.buildAdaptiveSystemPrompt(context, features, customerMemoriesPrompt);
    const messages = this.buildMessages(systemPrompt, userMessage, context);

    let response: AIResponse | null = null;

    // 3. Intentar OpenAI primero (más natural)
    if (this.useOpenAI && this.openai) {
      try {
        const openaiResponse = await this.generateWithOpenAI(messages);

        // Guardar en cache si es exitoso
        this.saveToCache(cacheKey, openaiResponse.content);

        response = {
          ...openaiResponse,
          responseTime: Date.now() - startTime,
          features,
        };
      } catch (error) {
        this.logger.warn(
          'OpenAI failed, falling back to Ollama:',
          error instanceof Error ? error.message : 'Unknown error'
        );
        // response permanece null, continuará con Ollama
      }
    }

    // 4. Fallback a Ollama
    if (!response) {
      try {
        const content = await this.ollamaService.generateRestaurantResponse(userMessage, context);

        response = {
          content,
          provider: 'ollama',
          responseTime: Date.now() - startTime,
          features,
        };
      } catch (error) {
        this.logger.error(
          'Both AI providers failed, using fallback:',
          error instanceof Error ? error.message : 'Unknown error'
        );

        // 5. Fallback final: respuestas pre-programadas
        response = {
          content: this.getFallbackResponse(userMessage, context),
          provider: 'fallback',
          responseTime: Date.now() - startTime,
          features,
        };
      }
    }

    // 6. Guardar experiencia para aprendizaje JARVIS
    try {
      const experience = await this.learningMemory.saveExperience({
        userInput: userMessage,
        botResponse: response.content,
        aiProvider: response.provider,
        responseTimeMs: response.responseTime,
        tokensUsed: response.tokensUsed,
        fromCache: false,
        conversationId: context.conversationId,
        customerId: context.customerId,
        channel: context.channel,
      });

      response.experienceId = experience.id;
      this.logger.debug(`🧠 JARVIS Experience saved: #${experience.id}`);
    } catch (error) {
      this.logger.warn(
        'Failed to save learning experience:',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }

    return response;
  }

  /**
   * Registra feedback para una experiencia (para aprendizaje)
   */
  async recordFeedback(
    experienceId: number,
    feedback: {
      qualityScore?: number;
      positiveContinuation?: boolean;
      escalatedToHuman?: boolean;
      resultedInAction?: boolean;
      actionType?: string;
    }
  ): Promise<void> {
    await this.learningMemory.recordFeedback(experienceId, feedback);
  }

  /**
   * Obtiene insights del sistema de aprendizaje
   */
  async getLearningInsights() {
    return this.learningMemory.getInsights();
  }

  /**
   * Obtiene estadísticas del sistema de aprendizaje
   */
  async getLearningStats() {
    return this.learningMemory.getStats();
  }

  /**
   * Construye un prompt ADAPTATIVO que se ajusta al estilo del cliente
   * El bot "espejeará" la forma de comunicarse del cliente para ser más humano
   * Incluye memorias del cliente para personalización
   */
  private buildAdaptiveSystemPrompt(
    context: RestaurantContext,
    features: ExperienceFeatures,
    customerMemoriesPrompt: string = ''
  ): string {
    const restaurantName = context.restaurantInfo?.name || 'nuestro restaurante';

    // Determinar el estilo de respuesta basado en cómo escribe el cliente
    let styleInstructions = '';
    let greetingStyle = '';
    let emojiStyle = '';

    // Adaptar formalidad
    if (features.communicationStyle === 'formal') {
      styleInstructions = `
🎭 ESTILO ADAPTATIVO - FORMAL:
- Usa "usted" siempre, nunca "tú"
- Mantén un tono profesional y respetuoso
- Evita expresiones coloquiales
- Sé cortés y educado en cada respuesta`;
      greetingStyle = 'Buenos días/tardes, es un placer atenderle';
    } else if (features.communicationStyle === 'informal') {
      styleInstructions = `
🎭 ESTILO ADAPTATIVO - AMIGABLE:
- Puedes usar "tú" y expresiones cercanas
- Sé amigable y relajado, como un amigo
- Puedes usar expresiones como "dale", "perfecto", "genial"
- Mantén la calidez pero siendo profesional`;
      greetingStyle = '¡Hola! ¿Qué tal?';
    } else {
      styleInstructions = `
🎭 ESTILO ADAPTATIVO - NEUTRO:
- Equilibra formalidad con cercanía
- Sé natural y cálido
- Adapta tu tono según la conversación`;
      greetingStyle = '¡Hola! Bienvenido';
    }

    // Adaptar uso de emojis
    if (features.usesEmojis) {
      emojiStyle = '- USA emojis en tus respuestas para ser más expresivo 🍽️😊👍';
    } else {
      emojiStyle = '- Usa pocos o ningún emoji, mantén respuestas limpias';
    }

    // Adaptar longitud de respuesta
    let lengthStyle = '';
    if (features.messageLength === 'short') {
      lengthStyle = '- El cliente escribe corto, responde BREVE (1-2 oraciones máximo)';
    } else if (features.messageLength === 'long') {
      lengthStyle = '- El cliente detalla mucho, puedes dar respuestas más completas';
    } else {
      lengthStyle = '- Respuestas de longitud moderada (2-3 oraciones)';
    }

    // Adaptar según sentimiento
    let sentimentStyle = '';
    if (features.sentiment < -0.2) {
      sentimentStyle = `
⚠️ CLIENTE POSIBLEMENTE MOLESTO:
- Muestra empatía y comprensión
- Ofrece soluciones, no excusas
- Mantén la calma y sé extra amable`;
    } else if (features.sentiment > 0.3) {
      sentimentStyle = `
😊 CLIENTE CONTENTO:
- Comparte su entusiasmo
- Refuerza su buena experiencia`;
    }

    return `Eres el asistente virtual de ${restaurantName}. Tu trabajo es ayudar a los clientes de forma NATURAL y HUMANA.

${styleInstructions}
${sentimentStyle}

📝 REGLAS DE COMUNICACIÓN:
${emojiStyle}
${lengthStyle}
- ESPEJA el estilo del cliente: si es breve, sé breve; si detalla, detalla
- Responde como un humano real, no como un robot
- Si el cliente usa mayúsculas o signos de exclamación, muestra entusiasmo también

📋 INFORMACIÓN DEL RESTAURANTE:
${
  context.restaurantInfo
    ? `
- Nombre: ${context.restaurantInfo.name}
- Teléfono: ${context.restaurantInfo.phone || '+56965419765'}
- Horarios: ${context.restaurantInfo.hours || '24/7'}
- Dirección: ${context.restaurantInfo.address || 'Consultar'}
`
    : ''
}

${
  context.menuItems && context.menuItems.length > 0
    ? `
🍽️ MENÚ (${context.menuItems.length} productos):
${context.menuItems
  .slice(0, 15)
  .map((item) => `- ${item.name}: $${item.price}${item.available === false ? ' (Agotado)' : ''}`)
  .join('\n')}
`
    : ''
}

${context.customerName ? `👤 Cliente: ${context.customerName}` : ''}

🎯 PRIORIDADES:
1. Entiende qué quiere el cliente
2. Responde de forma útil y natural
3. Si no sabes algo, admítelo honestamente
4. Ofrece ayuda adicional solo si es relevante

⚠️ RESTRICCIONES:
- Solo habla del restaurante, menú, pedidos y reservas
- No inventes información
- Si preguntan algo fuera del tema, redirige amablemente

IMPORTANTE: Responde como lo haría un humano real que trabaja en el restaurante, no como una IA.`;
  }

  /**
   * Construye un prompt con restricciones ESTRICTAS (versión legacy)
   */
  private buildRestrictedSystemPrompt(context: RestaurantContext): string {
    // Usar el método adaptativo con features por defecto
    return this.buildAdaptiveSystemPrompt(context, {
      wordCount: 10,
      sentiment: 0,
      complexity: 5,
      keywords: [],
      intent: 'general',
      contextCategory: 'general',
      hourOfDay: new Date().getHours(),
      dayOfWeek: new Date().getDay(),
      communicationStyle: 'neutral',
      usesEmojis: true,
      messageLength: 'medium',
      politenessLevel: 'polite',
      language: 'spanish',
    });
  }

  /**
   * Construye los mensajes para la conversación
   */
  private buildMessages(
    systemPrompt: string,
    userMessage: string,
    context: RestaurantContext
  ): ConversationMessage[] {
    const messages: ConversationMessage[] = [{ role: 'system', content: systemPrompt }];

    // Agregar mensajes previos (máximo 10 para no exceder contexto)
    if (context.previousMessages && context.previousMessages.length > 0) {
      const recentMessages = context.previousMessages.slice(-10);
      messages.push(
        ...recentMessages.map((msg) => ({
          role: msg.role,
          content: msg.content,
          timestamp: new Date(),
        }))
      );
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
    messages: ConversationMessage[]
  ): Promise<Omit<AIResponse, 'responseTime'>> {
    if (!this.openai) {
      throw new Error('OpenAI not initialized');
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.openaiModel,
        messages: messages.map((m) => ({
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
  private getFallbackResponse(userMessage: string, context: RestaurantContext): string {
    const lowerMessage = userMessage.toLowerCase();
    const restaurantName = context.restaurantInfo?.name || 'nuestro restaurante';

    // Respuestas comunes pre-programadas
    if (
      lowerMessage.includes('hola') ||
      lowerMessage.includes('buenos') ||
      lowerMessage.includes('buenas')
    ) {
      return `¡Hola! 👋 Bienvenido a ${restaurantName}. ¿Te gustaría conocer nuestro menú, hacer una reserva o realizar un pedido?`;
    }

    if (
      lowerMessage.includes('menú') ||
      lowerMessage.includes('menu') ||
      lowerMessage.includes('platos')
    ) {
      if (context.menuItems && context.menuItems.length > 0) {
        return `Te muestro nuestro menú:\n\n${context.menuItems
          .slice(0, 5)
          .map((item) => `🍽️ ${item.name} - $${item.price}`)
          .join('\n')}\n\n¿Te gustaría saber más sobre algún plato?`;
      }
      return `Tenemos un menú delicioso. ¿Qué tipo de comida te gustaría? 🍽️`;
    }

    if (lowerMessage.includes('reserva')) {
      return `Con gusto te ayudo con tu reserva 📅. ¿Para cuántas personas y qué día te gustaría reservar?`;
    }

    if (
      lowerMessage.includes('pedido') ||
      lowerMessage.includes('delivery') ||
      lowerMessage.includes('ordenar')
    ) {
      return `¡Perfecto! 🛵 ¿Qué te gustaría ordenar? Puedo ayudarte a armar tu pedido del menú.`;
    }

    if (lowerMessage.includes('horario') || lowerMessage.includes('hora')) {
      const hours = context.restaurantInfo?.hours || 'Lunes a Domingo de 12:00 a 23:00';
      return `Nuestros horarios son: ${hours} ⏰`;
    }

    if (
      lowerMessage.includes('dirección') ||
      lowerMessage.includes('direccion') ||
      lowerMessage.includes('ubicación') ||
      lowerMessage.includes('ubicacion') ||
      lowerMessage.includes('donde')
    ) {
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
  async getStats() {
    const learningStats = await this.learningMemory.getStats();

    return {
      service: 'Hybrid AI Service + JARVIS Learning',
      primaryProvider: this.useOpenAI ? 'OpenAI GPT-4o-mini' : 'Ollama only',
      fallbackProvider: 'Ollama',
      emergencyFallback: 'Pre-programmed responses',
      cacheSize: this.responseCache.size,
      cacheExpiration: `${this.cacheExpiration / 60000} minutes`,
      openaiConfigured: this.useOpenAI,
      model: this.openaiModel,
      learning: learningStats,
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
