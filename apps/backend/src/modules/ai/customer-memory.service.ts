import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { CustomerMemory, MemoryType, ConfidenceLevel } from './customer-memory.entity';

type MemoryPattern = {
  pattern: RegExp;
  key: string;
  value?: string;
  valueExtract?: boolean;
};

/**
 * Patrones de extracción de memoria
 * El bot detecta estas frases y extrae información relevante
 */
const MEMORY_PATTERNS: Record<string, MemoryPattern[]> = {
  // Preferencias alimenticias
  dietary: [
    { pattern: /soy vegetarian[oa]/i, key: 'dietary', value: 'vegetariano' },
    { pattern: /soy vegan[oa]/i, key: 'dietary', value: 'vegano' },
    { pattern: /sin gluten|celiac[oa]/i, key: 'dietary', value: 'sin gluten' },
    { pattern: /sin lactosa|intolerante.*lactosa/i, key: 'dietary', value: 'sin lactosa' },
    { pattern: /alérgico.*?(?:al|a la|a los|a las)\s+(\w+)/i, key: 'allergy', valueExtract: true },
    { pattern: /no como\s+(\w+)/i, key: 'avoidance', valueExtract: true },
    { pattern: /sin\s+(\w+)(?:\s+por favor)?/i, key: 'preference_without', valueExtract: true },
    { pattern: /me gusta\s+(?:el|la|los|las)?\s*(\w+)/i, key: 'likes', valueExtract: true },
    { pattern: /no me gusta\s+(?:el|la|los|las)?\s*(\w+)/i, key: 'dislikes', valueExtract: true },
  ],

  // Direcciones
  address: [
    {
      pattern: /(?:mi dirección es|vivo en|estoy en|enviar a|delivery a)\s*[:\-]?\s*(.+)/i,
      key: 'delivery_address',
      valueExtract: true,
    },
    {
      pattern: /(?:calle|avenida|av\.|pasaje)\s+.+\s+\d+/i,
      key: 'address_detected',
      valueExtract: true,
    },
  ],

  // Comunicación
  communication: [
    {
      pattern: /(?:puedes|puede)\s+tutearme|háblame\s+de\s+tú/i,
      key: 'formality',
      value: 'informal',
    },
    { pattern: /(?:trátame|tratame)\s+de\s+usted/i, key: 'formality', value: 'formal' },
    { pattern: /(?:llámame|llamame)\s+(\w+)/i, key: 'preferred_name', valueExtract: true },
    { pattern: /(?:mi nombre es|me llamo)\s+(\w+)/i, key: 'customer_name', valueExtract: true },
  ],

  // Pedidos frecuentes
  orders: [
    {
      pattern: /(?:siempre pido|lo de siempre|mi favorito es)\s*[:\-]?\s*(.+)/i,
      key: 'usual_order',
      valueExtract: true,
    },
    {
      pattern: /(?:quiero|dame)\s+(?:lo mismo|lo de siempre)/i,
      key: 'repeat_order',
      value: 'true',
    },
  ],

  // Personal
  personal: [
    {
      pattern: /(?:mi cumpleaños es|cumplo años)\s+(?:el\s+)?(\d{1,2})\s+(?:de\s+)?(\w+)/i,
      key: 'birthday',
      valueExtract: true,
    },
    {
      pattern: /(?:tengo|somos)\s+(\d+)\s+(?:personas|invitados)/i,
      key: 'party_size_usual',
      valueExtract: true,
    },
  ],
};

/**
 * Q-Learning Constants
 */
const Q_LEARNING = {
  LEARNING_RATE: 0.1, // Alpha - qué tan rápido aprende
  DISCOUNT_FACTOR: 0.95, // Gamma - importancia de recompensas futuras
  EXPLORATION_RATE: 0.1, // Epsilon - probabilidad de explorar vs explotar
  INITIAL_Q_VALUE: 0.5, // Valor Q inicial
};

export interface MemoryContext {
  customerId: number;
  conversationId?: number;
  channel?: string;
}

export interface ExtractedMemory {
  type: MemoryType;
  key: string;
  value: string;
  source: string;
}

/**
 * CustomerMemoryService - Sistema JARVIS de Aprendizaje
 *
 * Características:
 * - Extrae memorias automáticamente de las conversaciones
 * - Persiste información del cliente para personalización
 * - Usa Q-Learning para optimizar respuestas
 * - Aumenta confianza con uso repetido
 */
@Injectable()
export class CustomerMemoryService {
  private readonly logger = new Logger(CustomerMemoryService.name);

  // Cache en memoria para acceso rápido
  private memoryCache = new Map<number, CustomerMemory[]>();
  private readonly cacheExpiration = 300000; // 5 minutos
  private cacheTimestamps = new Map<number, number>();

  // Q-Table para optimización de respuestas
  private qTable = new Map<string, number>();

  constructor(
    @InjectRepository(CustomerMemory)
    private readonly memoryRepository: Repository<CustomerMemory>
  ) {
    this.logger.log('🧠 CustomerMemoryService (JARVIS) initialized');
  }

  // ========================================
  // EXTRACCIÓN DE MEMORIAS
  // ========================================

  /**
   * Extrae memorias automáticamente del mensaje del cliente
   */
  extractMemoriesFromMessage(message: string): ExtractedMemory[] {
    const memories: ExtractedMemory[] = [];

    for (const [category, patterns] of Object.entries(MEMORY_PATTERNS)) {
      for (const patternConfig of patterns) {
        const match = message.match(patternConfig.pattern);
        if (match) {
          let value: string;

          if (patternConfig.valueExtract && match[1]) {
            value = match[1].trim();
          } else if (patternConfig.value) {
            value = patternConfig.value;
          } else {
            value = match[0].trim();
          }

          const memoryType = this.categoryToMemoryType(category);

          memories.push({
            type: memoryType,
            key: patternConfig.key,
            value,
            source: match[0],
          });

          this.logger.debug(`🔍 Memory extracted: ${patternConfig.key} = "${value}"`);
        }
      }
    }

    return memories;
  }

  private categoryToMemoryType(category: string): MemoryType {
    switch (category) {
      case 'dietary':
        return MemoryType.PREFERENCE;
      case 'address':
        return MemoryType.ADDRESS;
      case 'communication':
        return MemoryType.COMMUNICATION;
      case 'orders':
        return MemoryType.ORDER;
      case 'personal':
        return MemoryType.PERSONAL;
      default:
        return MemoryType.PREFERENCE;
    }
  }

  // ========================================
  // GESTIÓN DE MEMORIAS
  // ========================================

  /**
   * Guarda o actualiza una memoria del cliente
   */
  async saveMemory(
    customerId: number,
    memory: ExtractedMemory,
    context: MemoryContext
  ): Promise<CustomerMemory> {
    // Buscar si ya existe esta memoria
    const existing = await this.memoryRepository.findOne({
      where: {
        customerId,
        memoryType: memory.type,
        memoryKey: memory.key,
      },
    });

    if (existing) {
      // Si el valor es diferente, actualizar
      if (existing.memoryValue !== memory.value) {
        // Si había un valor diferente, guardarlo como alternativa
        if (!existing.metadata) existing.metadata = {};
        if (!existing.metadata.alternatives) existing.metadata.alternatives = [];
        existing.metadata.alternatives.push(existing.memoryValue);

        existing.memoryValue = memory.value;
        existing.usageCount++;
        existing.lastUsedAt = new Date();

        // Aumentar confianza con uso
        existing.confidence = this.calculateConfidence(existing.usageCount);

        this.logger.log(
          `📝 Memory updated: ${memory.key} = "${memory.value}" (confidence: ${existing.confidence})`
        );

        await this.memoryRepository.save(existing);
        this.invalidateCache(customerId);
        return existing;
      } else {
        // Mismo valor, solo aumentar uso
        existing.usageCount++;
        existing.lastUsedAt = new Date();
        existing.confidence = this.calculateConfidence(existing.usageCount);

        await this.memoryRepository.save(existing);
        return existing;
      }
    }

    // Crear nueva memoria
    const newMemory = this.memoryRepository.create({
      customerId,
      memoryType: memory.type,
      memoryKey: memory.key,
      memoryValue: memory.value,
      confidence: ConfidenceLevel.LOW,
      usageCount: 1,
      lastUsedAt: new Date(),
      metadata: {
        source: 'conversation',
        conversationId: context.conversationId,
        extractedFrom: memory.source,
        isExplicit: true,
      },
    });

    const saved = await this.memoryRepository.save(newMemory);
    this.logger.log(`✨ New memory saved: ${memory.key} = "${memory.value}"`);

    this.invalidateCache(customerId);
    return saved;
  }

  /**
   * Calcula el nivel de confianza basado en el uso
   */
  private calculateConfidence(usageCount: number): ConfidenceLevel {
    if (usageCount >= 4) return ConfidenceLevel.HIGH;
    if (usageCount >= 2) return ConfidenceLevel.MEDIUM;
    return ConfidenceLevel.LOW;
  }

  /**
   * Obtiene todas las memorias de un cliente
   */
  async getCustomerMemories(
    customerId: number,
    options?: {
      type?: MemoryType;
      minConfidence?: ConfidenceLevel;
      activeOnly?: boolean;
    }
  ): Promise<CustomerMemory[]> {
    // Verificar cache
    const cached = this.getFromCache(customerId);
    if (cached) {
      let filtered = cached;

      if (options?.type) {
        filtered = filtered.filter((m) => m.memoryType === options.type);
      }
      if (options?.activeOnly !== false) {
        filtered = filtered.filter((m) => m.isActive);
      }

      return filtered;
    }

    // Buscar en DB
    const query = this.memoryRepository
      .createQueryBuilder('memory')
      .where('memory.customer_id = :customerId', { customerId })
      .orderBy('memory.usage_count', 'DESC');

    if (options?.type) {
      query.andWhere('memory.memory_type = :type', { type: options.type });
    }
    if (options?.activeOnly !== false) {
      query.andWhere('memory.is_active = true');
    }

    const memories = await query.getMany();

    // Guardar en cache
    this.saveToCache(customerId, memories);

    return memories;
  }

  /**
   * Obtiene memorias formateadas para incluir en el prompt
   */
  async getMemoriesForPrompt(customerId: number): Promise<string> {
    const memories = await this.getCustomerMemories(customerId, {
      activeOnly: true,
    });

    if (memories.length === 0) return '';

    const grouped: Record<string, string[]> = {
      preferences: [],
      addresses: [],
      communication: [],
      orders: [],
      personal: [],
    };

    for (const memory of memories) {
      const entry = `${memory.memoryKey}: ${memory.memoryValue}`;

      switch (memory.memoryType) {
        case MemoryType.PREFERENCE:
          grouped.preferences.push(entry);
          break;
        case MemoryType.ADDRESS:
          grouped.addresses.push(entry);
          break;
        case MemoryType.COMMUNICATION:
          grouped.communication.push(entry);
          break;
        case MemoryType.ORDER:
          grouped.orders.push(entry);
          break;
        case MemoryType.PERSONAL:
          grouped.personal.push(entry);
          break;
      }
    }

    let prompt = '\n👤 INFORMACIÓN DEL CLIENTE (memorizada):\n';

    if (grouped.personal.length > 0) {
      prompt += `📋 Personal: ${grouped.personal.join(', ')}\n`;
    }
    if (grouped.preferences.length > 0) {
      prompt += `🍽️ Preferencias: ${grouped.preferences.join(', ')}\n`;
    }
    if (grouped.addresses.length > 0) {
      prompt += `📍 Direcciones: ${grouped.addresses.join('; ')}\n`;
    }
    if (grouped.communication.length > 0) {
      prompt += `💬 Comunicación: ${grouped.communication.join(', ')}\n`;
    }
    if (grouped.orders.length > 0) {
      prompt += `🛒 Pedidos frecuentes: ${grouped.orders.join(', ')}\n`;
    }

    return prompt;
  }

  // ========================================
  // Q-LEARNING
  // ========================================

  /**
   * Actualiza el valor Q de una memoria basado en recompensa
   */
  async updateQValue(memoryId: number, reward: number): Promise<void> {
    const memory = await this.memoryRepository.findOne({
      where: { id: memoryId },
    });

    if (!memory) return;

    // Fórmula Q-Learning: Q(s,a) = Q(s,a) + α * (r + γ * max(Q(s',a')) - Q(s,a))
    const oldQ = memory.qValue;
    const newQ = oldQ + Q_LEARNING.LEARNING_RATE * (reward - oldQ);

    memory.qValue = Math.max(0, Math.min(1, newQ)); // Mantener entre 0 y 1
    memory.rewardSum += reward;
    memory.rewardCount++;

    await this.memoryRepository.save(memory);
    this.invalidateCache(memory.customerId);

    this.logger.debug(
      `📊 Q-Value updated: ${memory.memoryKey} ${oldQ.toFixed(3)} → ${newQ.toFixed(3)} (reward: ${reward})`
    );
  }

  /**
   * Registra feedback para una respuesta que usó memorias
   */
  async recordFeedback(
    customerId: number,
    wasHelpful: boolean,
    usedMemoryIds: number[]
  ): Promise<void> {
    const reward = wasHelpful ? 1 : -0.5;

    for (const memoryId of usedMemoryIds) {
      await this.updateQValue(memoryId, reward);
    }

    this.logger.log(
      `📈 Feedback recorded for ${usedMemoryIds.length} memories (helpful: ${wasHelpful})`
    );
  }

  /**
   * Selecciona las mejores memorias usando Q-Learning
   * Usa epsilon-greedy para balancear exploración/explotación
   */
  async selectBestMemories(customerId: number, maxMemories: number = 5): Promise<CustomerMemory[]> {
    const memories = await this.getCustomerMemories(customerId, {
      activeOnly: true,
    });

    if (memories.length <= maxMemories) return memories;

    // Epsilon-greedy: explorar o explotar
    if (Math.random() < Q_LEARNING.EXPLORATION_RATE) {
      // Exploración: selección aleatoria
      return this.shuffleArray(memories).slice(0, maxMemories);
    }

    // Explotación: usar Q-values
    return memories.sort((a, b) => b.qValue - a.qValue).slice(0, maxMemories);
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // ========================================
  // ESTADÍSTICAS Y ANÁLISIS
  // ========================================

  /**
   * Obtiene estadísticas del sistema de memoria
   */
  async getStats(): Promise<{
    totalMemories: number;
    byType: Record<string, number>;
    byConfidence: Record<string, number>;
    averageQValue: number;
    topMemories: { key: string; usageCount: number; qValue: number }[];
  }> {
    const memories = await this.memoryRepository.find({
      where: { isActive: true },
    });

    const byType: Record<string, number> = {};
    const byConfidence: Record<string, number> = {};
    let qValueSum = 0;

    for (const memory of memories) {
      byType[memory.memoryType] = (byType[memory.memoryType] || 0) + 1;
      byConfidence[memory.confidence] = (byConfidence[memory.confidence] || 0) + 1;
      qValueSum += memory.qValue;
    }

    const topMemories = memories
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 10)
      .map((m) => ({
        key: m.memoryKey,
        usageCount: m.usageCount,
        qValue: m.qValue,
      }));

    return {
      totalMemories: memories.length,
      byType,
      byConfidence,
      averageQValue: memories.length > 0 ? qValueSum / memories.length : 0,
      topMemories,
    };
  }

  /**
   * Obtiene la Q-Table para análisis
   */
  async getQTable(): Promise<
    {
      customerId: number;
      memoryKey: string;
      qValue: number;
      usageCount: number;
    }[]
  > {
    const memories = await this.memoryRepository.find({
      where: {
        isActive: true,
        rewardCount: MoreThan(0),
      },
      select: ['customerId', 'memoryKey', 'qValue', 'usageCount'],
      order: { qValue: 'DESC' },
      take: 50,
    });

    return memories.map((m) => ({
      customerId: m.customerId,
      memoryKey: m.memoryKey,
      qValue: m.qValue,
      usageCount: m.usageCount,
    }));
  }

  // ========================================
  // CACHE
  // ========================================

  private getFromCache(customerId: number): CustomerMemory[] | null {
    const timestamp = this.cacheTimestamps.get(customerId);
    if (!timestamp || Date.now() - timestamp > this.cacheExpiration) {
      this.memoryCache.delete(customerId);
      this.cacheTimestamps.delete(customerId);
      return null;
    }
    return this.memoryCache.get(customerId) || null;
  }

  private saveToCache(customerId: number, memories: CustomerMemory[]): void {
    this.memoryCache.set(customerId, memories);
    this.cacheTimestamps.set(customerId, Date.now());
  }

  private invalidateCache(customerId: number): void {
    this.memoryCache.delete(customerId);
    this.cacheTimestamps.delete(customerId);
  }

  clearCache(): void {
    this.memoryCache.clear();
    this.cacheTimestamps.clear();
    this.logger.log('🧹 Memory cache cleared');
  }
}
