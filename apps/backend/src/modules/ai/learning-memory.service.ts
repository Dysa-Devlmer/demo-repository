import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, Between } from 'typeorm';
import { LearningExperience } from '../../entities/learning-experience.entity';

/**
 * Sistema de Memoria de Aprendizaje - Inspirado en JARVIS Mark VII
 *
 * Capas de memoria:
 * 1. Sesión (Redis/memoria) - Contexto inmediato
 * 2. Corto plazo (últimas 24h) - Patrones recientes
 * 3. Largo plazo (PostgreSQL) - Conocimiento persistente
 *
 * Funcionalidades:
 * - Experience Buffer: Almacena cada interacción con features
 * - Q-Learning: Aprende qué respuestas funcionan mejor
 * - Análisis de patrones: Detecta tendencias y mejora respuestas
 */

export interface ExperienceFeatures {
  wordCount: number;
  sentiment: number;  // -1 a 1
  complexity: number; // 1-10
  keywords: string[];
  intent: string;
  contextCategory: string;
  hourOfDay: number;
  dayOfWeek: number;
  // Nuevos campos para adaptación humana
  communicationStyle: 'formal' | 'informal' | 'neutral';
  usesEmojis: boolean;
  messageLength: 'short' | 'medium' | 'long';
  politenessLevel: 'very_polite' | 'polite' | 'casual' | 'direct';
  language: 'spanish' | 'english' | 'mixed';
}

export interface QLearningState {
  complexity: 'simple' | 'normal' | 'complex';
  sentiment: 'negative' | 'neutral' | 'positive';
  intent: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
}

export interface LearningInsight {
  type: 'pattern' | 'improvement' | 'warning';
  message: string;
  confidence: number;
  data?: any;
}

@Injectable()
export class LearningMemoryService {
  private readonly logger = new Logger(LearningMemoryService.name);

  // Q-Table para aprendizaje por refuerzo
  private qTable: Map<string, Map<string, number>> = new Map();

  // Parámetros de Q-Learning
  private readonly learningRate = 0.1;
  private readonly discountFactor = 0.95;
  private explorationRate = 0.3;
  private readonly explorationDecay = 0.998;
  private readonly minExplorationRate = 0.01;

  // Estadísticas
  private totalInteractions = 0;
  private totalReward = 0;

  // Cache de patrones frecuentes
  private frequentPatterns: Map<string, { count: number; bestResponse: string }> = new Map();

  constructor(
    @InjectRepository(LearningExperience)
    private experienceRepo: Repository<LearningExperience>,
  ) {
    this.loadQTable();
  }

  /**
   * Analiza el mensaje del usuario y extrae features para aprendizaje
   * Incluye detección de estilo de comunicación para respuestas más humanas
   */
  analyzeMessage(message: string): ExperienceFeatures {
    const words = message.toLowerCase().split(/\s+/);
    const now = new Date();

    return {
      wordCount: words.length,
      sentiment: this.analyzeSentiment(message),
      complexity: this.analyzeComplexity(message),
      keywords: this.extractKeywords(message),
      intent: this.detectIntent(message),
      contextCategory: this.detectCategory(message),
      hourOfDay: now.getHours(),
      dayOfWeek: now.getDay(),
      // Análisis de estilo para respuestas adaptativas
      communicationStyle: this.detectCommunicationStyle(message),
      usesEmojis: this.detectEmojis(message),
      messageLength: this.detectMessageLength(message),
      politenessLevel: this.detectPoliteness(message),
      language: this.detectLanguage(message),
    };
  }

  /**
   * Detecta el estilo de comunicación (formal vs informal)
   */
  private detectCommunicationStyle(message: string): 'formal' | 'informal' | 'neutral' {
    const lower = message.toLowerCase();

    // Indicadores de formalidad
    const formalIndicators = [
      'usted', 'estimado', 'cordialmente', 'atentamente', 'por favor',
      'sería tan amable', 'podría', 'quisiera', 'le agradecería',
      'buenos días', 'buenas tardes', 'buenas noches', 'disculpe',
    ];

    // Indicadores de informalidad
    const informalIndicators = [
      'hola', 'hey', 'que tal', 'como estas', 'wena', 'oye', 'mira',
      'porfa', 'plis', 'dale', 'va', 'oka', 'ok', 'sip', 'nop',
      'jaja', 'jeje', 'xd', 'lol', 'bro', 'wey', 'tío', 'crack',
    ];

    let formalScore = 0;
    let informalScore = 0;

    formalIndicators.forEach(word => {
      if (lower.includes(word)) formalScore++;
    });

    informalIndicators.forEach(word => {
      if (lower.includes(word)) informalScore++;
    });

    // Mayúsculas excesivas = informal/entusiasta
    const capsRatio = (message.match(/[A-Z]/g) || []).length / message.length;
    if (capsRatio > 0.5) informalScore += 2;

    if (formalScore > informalScore + 1) return 'formal';
    if (informalScore > formalScore + 1) return 'informal';
    return 'neutral';
  }

  /**
   * Detecta si el mensaje usa emojis
   */
  private detectEmojis(message: string): boolean {
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]/u;
    return emojiRegex.test(message);
  }

  /**
   * Detecta la longitud del mensaje
   */
  private detectMessageLength(message: string): 'short' | 'medium' | 'long' {
    const words = message.split(/\s+/).length;
    if (words <= 5) return 'short';
    if (words <= 20) return 'medium';
    return 'long';
  }

  /**
   * Detecta el nivel de cortesía
   */
  private detectPoliteness(message: string): 'very_polite' | 'polite' | 'casual' | 'direct' {
    const lower = message.toLowerCase();

    const veryPoliteWords = ['por favor', 'sería tan amable', 'le agradecería', 'disculpe', 'perdone'];
    const politeWords = ['gracias', 'buenos días', 'buenas', 'podría', 'quisiera'];
    const casualWords = ['hola', 'hey', 'oye', 'dale', 'va'];

    for (const word of veryPoliteWords) {
      if (lower.includes(word)) return 'very_polite';
    }

    for (const word of politeWords) {
      if (lower.includes(word)) return 'polite';
    }

    for (const word of casualWords) {
      if (lower.includes(word)) return 'casual';
    }

    return 'direct';
  }

  /**
   * Detecta el idioma predominante
   */
  private detectLanguage(message: string): 'spanish' | 'english' | 'mixed' {
    const lower = message.toLowerCase();

    const spanishWords = ['hola', 'gracias', 'por favor', 'quiero', 'menú', 'mesa', 'reserva', 'pedido'];
    const englishWords = ['hello', 'thanks', 'please', 'want', 'menu', 'table', 'order', 'book'];

    let spanishCount = 0;
    let englishCount = 0;

    spanishWords.forEach(word => {
      if (lower.includes(word)) spanishCount++;
    });

    englishWords.forEach(word => {
      if (lower.includes(word)) englishCount++;
    });

    if (spanishCount > 0 && englishCount > 0) return 'mixed';
    if (englishCount > spanishCount) return 'english';
    return 'spanish';
  }

  /**
   * Análisis de sentimiento básico (sin dependencias externas)
   */
  private analyzeSentiment(message: string): number {
    const lower = message.toLowerCase();

    // Palabras positivas
    const positiveWords = [
      'gracias', 'excelente', 'perfecto', 'genial', 'bien', 'bueno',
      'delicioso', 'rico', 'increíble', 'maravilloso', 'encanta',
      'feliz', 'contento', 'satisfecho', 'recomiendo', 'me gusta',
    ];

    // Palabras negativas
    const negativeWords = [
      'malo', 'terrible', 'horrible', 'pésimo', 'no me gusta',
      'queja', 'problema', 'error', 'lento', 'frío', 'caro',
      'demora', 'molesto', 'frustrado', 'enojado', 'decepcionado',
    ];

    let score = 0;
    positiveWords.forEach(word => {
      if (lower.includes(word)) score += 0.2;
    });
    negativeWords.forEach(word => {
      if (lower.includes(word)) score -= 0.2;
    });

    return Math.max(-1, Math.min(1, score));
  }

  /**
   * Análisis de complejidad del mensaje
   */
  private analyzeComplexity(message: string): number {
    const words = message.split(/\s+/);
    const sentences = message.split(/[.!?]+/).filter(s => s.trim());

    // Factores de complejidad
    let complexity = 1;

    // Longitud del mensaje
    if (words.length > 20) complexity += 2;
    else if (words.length > 10) complexity += 1;

    // Múltiples oraciones
    if (sentences.length > 2) complexity += 2;
    else if (sentences.length > 1) complexity += 1;

    // Palabras complejas (más de 8 caracteres)
    const complexWords = words.filter(w => w.length > 8).length;
    complexity += Math.min(3, complexWords);

    // Preguntas múltiples
    const questionMarks = (message.match(/\?/g) || []).length;
    if (questionMarks > 1) complexity += 2;

    return Math.min(10, complexity);
  }

  /**
   * Extrae palabras clave del mensaje
   */
  private extractKeywords(message: string): string[] {
    const lower = message.toLowerCase();
    const keywords: string[] = [];

    // Palabras clave relacionadas con restaurante
    const restaurantKeywords = {
      menu: ['menú', 'menu', 'carta', 'platos', 'comida'],
      order: ['pedido', 'ordenar', 'quiero', 'pedir', 'delivery'],
      reservation: ['reserva', 'mesa', 'reservar', 'personas'],
      price: ['precio', 'costo', 'cuánto', 'valor', 'pagar'],
      hours: ['horario', 'hora', 'abierto', 'cerrado', 'abre'],
      location: ['dirección', 'ubicación', 'donde', 'llegar'],
      promotion: ['promoción', 'oferta', 'descuento', 'especial'],
    };

    for (const [category, words] of Object.entries(restaurantKeywords)) {
      if (words.some(w => lower.includes(w))) {
        keywords.push(category);
      }
    }

    return keywords;
  }

  /**
   * Detecta la intención del mensaje
   */
  private detectIntent(message: string): string {
    const lower = message.toLowerCase();

    // Patrones de intención
    const intentPatterns: [RegExp, string][] = [
      [/^(hola|buenos|buenas|hey|hi)/i, 'greeting'],
      [/(menú|menu|carta|platos|qué tienen)/i, 'menu_inquiry'],
      [/(pedir|pedido|ordenar|quiero|delivery)/i, 'order'],
      [/(reserva|reservar|mesa|personas)/i, 'reservation'],
      [/(precio|costo|cuánto|valor)/i, 'price_inquiry'],
      [/(horario|hora|abierto|cerrado)/i, 'hours_inquiry'],
      [/(dirección|ubicación|donde|llegar)/i, 'location_inquiry'],
      [/(promoción|oferta|descuento)/i, 'promotion_inquiry'],
      [/(gracias|perfecto|listo)/i, 'confirmation'],
      [/(queja|problema|malo|terrible)/i, 'complaint'],
      [/(ayuda|ayúdame|no entiendo)/i, 'help'],
      [/(adiós|chao|hasta luego|bye)/i, 'farewell'],
    ];

    for (const [pattern, intent] of intentPatterns) {
      if (pattern.test(lower)) {
        return intent;
      }
    }

    return 'general';
  }

  /**
   * Detecta la categoría del contexto
   */
  private detectCategory(message: string): string {
    const lower = message.toLowerCase();

    if (lower.includes('reserv')) return 'reservation';
    if (lower.includes('pedido') || lower.includes('delivery')) return 'order';
    if (lower.includes('menú') || lower.includes('menu') || lower.includes('plato')) return 'menu';
    if (lower.includes('precio') || lower.includes('costo')) return 'pricing';
    if (lower.includes('horario') || lower.includes('hora')) return 'info';
    if (lower.includes('dirección') || lower.includes('ubicación')) return 'info';

    return 'general';
  }

  /**
   * Guarda una experiencia de interacción para aprendizaje
   */
  async saveExperience(data: {
    userInput: string;
    botResponse: string;
    aiProvider: string;
    responseTimeMs: number;
    tokensUsed?: number;
    fromCache?: boolean;
    conversationId?: number;
    customerId?: number;
    channel?: string;
  }): Promise<LearningExperience> {
    const features = this.analyzeMessage(data.userInput);
    const now = new Date();

    const experience = this.experienceRepo.create({
      user_input: data.userInput,
      bot_response: data.botResponse,
      ai_provider: data.aiProvider,
      sentiment: features.sentiment,
      complexity: features.complexity,
      intent: features.intent,
      keywords: features.keywords,
      context_category: features.contextCategory,
      response_time_ms: data.responseTimeMs,
      tokens_used: data.tokensUsed,
      from_cache: data.fromCache || false,
      hour_of_day: now.getHours(),
      day_of_week: now.getDay(),
      conversation_id: data.conversationId,
      customer_id: data.customerId,
      channel: data.channel,
      state_key: this.encodeState(this.getQLearningState(features)),
      action_taken: features.intent,
    });

    const saved = await this.experienceRepo.save(experience);

    // Actualizar estadísticas
    this.totalInteractions++;

    // Actualizar patrones frecuentes
    this.updatePatterns(data.userInput, data.botResponse, features);

    this.logger.debug(`Experience saved: ${features.intent} (sentiment: ${features.sentiment.toFixed(2)})`);

    return saved;
  }

  /**
   * Registra feedback del usuario para una experiencia
   */
  async recordFeedback(experienceId: number, feedback: {
    qualityScore?: number;
    positiveContinuation?: boolean;
    escalatedToHuman?: boolean;
    resultedInAction?: boolean;
    actionType?: string;
  }): Promise<void> {
    const experience = await this.experienceRepo.findOne({
      where: { id: experienceId },
    });

    if (!experience) return;

    // Actualizar experiencia con feedback
    Object.assign(experience, {
      quality_score: feedback.qualityScore,
      positive_continuation: feedback.positiveContinuation,
      escalated_to_human: feedback.escalatedToHuman,
      resulted_in_action: feedback.resultedInAction,
      action_type: feedback.actionType,
    });

    // Calcular recompensa para Q-Learning
    const reward = this.calculateReward(feedback);
    experience.reward = reward;

    await this.experienceRepo.save(experience);

    // Actualizar Q-Table
    if (experience.state_key && experience.action_taken) {
      this.updateQValue(experience.state_key, experience.action_taken, reward);
    }

    this.totalReward += reward;
    this.logger.debug(`Feedback recorded: reward=${reward.toFixed(2)}`);
  }

  /**
   * Calcula la recompensa basada en feedback
   */
  private calculateReward(feedback: {
    qualityScore?: number;
    positiveContinuation?: boolean;
    escalatedToHuman?: boolean;
    resultedInAction?: boolean;
  }): number {
    let reward = 0;

    // Puntuación de calidad (más peso)
    if (feedback.qualityScore) {
      reward += (feedback.qualityScore - 3) * 0.3; // -0.6 a +0.6
    }

    // Continuación positiva
    if (feedback.positiveContinuation === true) reward += 0.2;
    if (feedback.positiveContinuation === false) reward -= 0.1;

    // Escalamiento a humano (penalización)
    if (feedback.escalatedToHuman) reward -= 0.3;

    // Resultó en acción (bonus)
    if (feedback.resultedInAction) reward += 0.4;

    return Math.max(-1, Math.min(1, reward));
  }

  /**
   * Convierte features a estado de Q-Learning
   */
  private getQLearningState(features: ExperienceFeatures): QLearningState {
    // Complejidad
    let complexity: 'simple' | 'normal' | 'complex';
    if (features.complexity <= 3) complexity = 'simple';
    else if (features.complexity <= 6) complexity = 'normal';
    else complexity = 'complex';

    // Sentimiento
    let sentiment: 'negative' | 'neutral' | 'positive';
    if (features.sentiment < -0.2) sentiment = 'negative';
    else if (features.sentiment > 0.2) sentiment = 'positive';
    else sentiment = 'neutral';

    // Hora del día
    let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    const hour = features.hourOfDay;
    if (hour >= 6 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 18) timeOfDay = 'afternoon';
    else if (hour >= 18 && hour < 22) timeOfDay = 'evening';
    else timeOfDay = 'night';

    return {
      complexity,
      sentiment,
      intent: features.intent,
      timeOfDay,
    };
  }

  /**
   * Codifica estado para Q-Table
   */
  private encodeState(state: QLearningState): string {
    return `${state.complexity}:${state.sentiment}:${state.intent}:${state.timeOfDay}`;
  }

  /**
   * Actualiza valor en Q-Table
   */
  private updateQValue(stateKey: string, action: string, reward: number): void {
    if (!this.qTable.has(stateKey)) {
      this.qTable.set(stateKey, new Map());
    }

    const stateActions = this.qTable.get(stateKey)!;
    const currentQ = stateActions.get(action) || 0;

    // Q-Learning update rule
    const newQ = currentQ + this.learningRate * (reward - currentQ);
    stateActions.set(action, newQ);

    // Decay exploration rate
    this.explorationRate = Math.max(
      this.minExplorationRate,
      this.explorationRate * this.explorationDecay
    );
  }

  /**
   * Obtiene la mejor acción para un estado
   */
  getBestAction(features: ExperienceFeatures): string | null {
    const state = this.getQLearningState(features);
    const stateKey = this.encodeState(state);

    const stateActions = this.qTable.get(stateKey);
    if (!stateActions || stateActions.size === 0) {
      return null;
    }

    // Exploración vs Explotación
    if (Math.random() < this.explorationRate) {
      const actions = Array.from(stateActions.keys());
      return actions[Math.floor(Math.random() * actions.length)];
    }

    // Elegir acción con mayor Q-value
    let bestAction = '';
    let bestQ = -Infinity;

    for (const [action, qValue] of stateActions) {
      if (qValue > bestQ) {
        bestQ = qValue;
        bestAction = action;
      }
    }

    return bestAction;
  }

  /**
   * Actualiza patrones frecuentes
   */
  private updatePatterns(input: string, response: string, features: ExperienceFeatures): void {
    const patternKey = `${features.intent}:${features.contextCategory}`;

    const existing = this.frequentPatterns.get(patternKey);
    if (existing) {
      existing.count++;
      // Actualizar mejor respuesta solo si es más reciente
      existing.bestResponse = response;
    } else {
      this.frequentPatterns.set(patternKey, {
        count: 1,
        bestResponse: response,
      });
    }
  }

  /**
   * Obtiene insights de aprendizaje
   */
  async getInsights(): Promise<LearningInsight[]> {
    const insights: LearningInsight[] = [];

    // Estadísticas de las últimas 24 horas
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    const recentExperiences = await this.experienceRepo.find({
      where: { created_at: MoreThan(yesterday) },
    });

    if (recentExperiences.length > 0) {
      // Calcular métricas
      const avgResponseTime = recentExperiences.reduce((sum, e) => sum + e.response_time_ms, 0) / recentExperiences.length;
      const avgSentiment = recentExperiences.reduce((sum, e) => sum + e.sentiment, 0) / recentExperiences.length;
      const cacheHitRate = recentExperiences.filter(e => e.from_cache).length / recentExperiences.length;

      // Insights de rendimiento
      if (avgResponseTime > 15000) {
        insights.push({
          type: 'warning',
          message: `Tiempo de respuesta promedio alto: ${(avgResponseTime / 1000).toFixed(1)}s`,
          confidence: 0.9,
          data: { avgResponseTime },
        });
      }

      // Insights de sentimiento
      if (avgSentiment < -0.1) {
        insights.push({
          type: 'warning',
          message: 'Sentimiento promedio negativo detectado en conversaciones recientes',
          confidence: 0.8,
          data: { avgSentiment },
        });
      } else if (avgSentiment > 0.3) {
        insights.push({
          type: 'improvement',
          message: 'Excelente sentimiento en conversaciones - los clientes están satisfechos',
          confidence: 0.8,
          data: { avgSentiment },
        });
      }

      // Insights de cache
      if (cacheHitRate > 0.5) {
        insights.push({
          type: 'pattern',
          message: `Alta tasa de cache (${(cacheHitRate * 100).toFixed(0)}%) - muchas preguntas repetitivas`,
          confidence: 0.95,
          data: { cacheHitRate },
        });
      }

      // Intenciones más comunes
      const intentCounts = new Map<string, number>();
      recentExperiences.forEach(e => {
        if (e.intent) {
          intentCounts.set(e.intent, (intentCounts.get(e.intent) || 0) + 1);
        }
      });

      const sortedIntents = Array.from(intentCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

      if (sortedIntents.length > 0) {
        insights.push({
          type: 'pattern',
          message: `Intenciones más comunes: ${sortedIntents.map(([i, c]) => `${i} (${c})`).join(', ')}`,
          confidence: 0.9,
          data: { topIntents: sortedIntents },
        });
      }
    }

    return insights;
  }

  /**
   * Obtiene estadísticas del sistema de aprendizaje
   */
  async getStats() {
    const totalExperiences = await this.experienceRepo.count();
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    const last24h = await this.experienceRepo.count({
      where: { created_at: MoreThan(yesterday) },
    });

    const withFeedback = await this.experienceRepo.count({
      where: { quality_score: MoreThan(0) },
    });

    return {
      totalExperiences,
      last24hExperiences: last24h,
      experiencesWithFeedback: withFeedback,
      qTableSize: this.qTable.size,
      frequentPatternsCount: this.frequentPatterns.size,
      totalInteractions: this.totalInteractions,
      averageReward: this.totalInteractions > 0 ? this.totalReward / this.totalInteractions : 0,
      explorationRate: this.explorationRate,
      learningRate: this.learningRate,
      discountFactor: this.discountFactor,
    };
  }

  /**
   * Carga Q-Table desde la base de datos (al iniciar)
   */
  private async loadQTable(): Promise<void> {
    try {
      const experiences = await this.experienceRepo.find({
        where: {
          reward: MoreThan(-2), // Cualquier experiencia con reward
        },
        order: { created_at: 'DESC' },
        take: 1000, // Últimas 1000 experiencias
      });

      for (const exp of experiences) {
        if (exp.state_key && exp.action_taken && exp.reward !== null) {
          if (!this.qTable.has(exp.state_key)) {
            this.qTable.set(exp.state_key, new Map());
          }
          const stateActions = this.qTable.get(exp.state_key)!;
          const currentQ = stateActions.get(exp.action_taken) || 0;
          // Promedio ponderado con experiencias existentes
          stateActions.set(exp.action_taken, (currentQ + exp.reward) / 2);
        }
      }

      this.logger.log(`Q-Table loaded: ${this.qTable.size} states from ${experiences.length} experiences`);
    } catch (error) {
      this.logger.warn('Could not load Q-Table (table might not exist yet)');
    }
  }

  /**
   * Obtiene respuesta sugerida basada en patrones aprendidos
   */
  getSuggestedResponse(features: ExperienceFeatures): string | null {
    const patternKey = `${features.intent}:${features.contextCategory}`;
    const pattern = this.frequentPatterns.get(patternKey);

    if (pattern && pattern.count >= 5) {
      return pattern.bestResponse;
    }

    return null;
  }

  /**
   * Exporta Q-Table para persistencia externa
   */
  exportQTable(): Record<string, Record<string, number>> {
    const result: Record<string, Record<string, number>> = {};

    for (const [state, actions] of this.qTable) {
      result[state] = {};
      for (const [action, value] of actions) {
        result[state][action] = value;
      }
    }

    return result;
  }

  /**
   * Importa Q-Table desde JSON
   */
  importQTable(data: Record<string, Record<string, number>>): void {
    this.qTable.clear();

    for (const [state, actions] of Object.entries(data)) {
      this.qTable.set(state, new Map(Object.entries(actions)));
    }

    this.logger.log(`Q-Table imported: ${this.qTable.size} states`);
  }
}
