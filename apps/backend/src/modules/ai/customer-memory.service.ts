import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, MoreThan, In, IsNull, LessThan } from "typeorm";
import { CustomerMemory } from "../../entities/customer-memory.entity";

/**
 * Servicio de Memoria del Cliente - JARVIS Memory Module
 *
 * Permite al bot recordar información importante de cada cliente:
 * - Preferencias alimenticias
 * - Direcciones de delivery
 * - Estilo de comunicación
 * - Historial de pedidos
 * - Información personal
 *
 * El bot se vuelve más personal y humano con cada interacción
 */

export interface CustomerProfile {
  customerId: number;
  name?: string;
  communicationStyle?: "formal" | "informal" | "neutral";
  usesEmojis?: boolean;
  preferredGreeting?: string;
  preferences: string[];
  addresses: string[];
  favoriteItems: string[];
  personalInfo: Record<string, string>;
  lastInteraction?: Date;
  totalInteractions: number;
}

export interface MemoryExtraction {
  type: "preference" | "address" | "personal" | "order_history" | "communication" | "feedback" | "custom";
  key: string;
  value: string;
  confidence: number;
  source: "explicit" | "inferred" | "action";
}

@Injectable()
export class CustomerMemoryService {
  private readonly logger = new Logger(CustomerMemoryService.name);

  // Cache en memoria para acceso rápido
  private profileCache = new Map<number, { profile: CustomerProfile; timestamp: number }>();
  private readonly cacheExpiration = 300000; // 5 minutos

  constructor(
    @InjectRepository(CustomerMemory)
    private memoryRepo: Repository<CustomerMemory>,
  ) {}

  /**
   * Obtiene el perfil completo de un cliente desde sus memorias
   */
  async getCustomerProfile(customerId: number): Promise<CustomerProfile> {
    // Verificar cache
    const cached = this.profileCache.get(customerId);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiration) {
      return cached.profile;
    }

    // Cargar memorias activas de la BD
    const memories = await this.memoryRepo.find({
      where: {
        customer_id: customerId,
        is_active: true,
      },
      order: { confidence: "DESC", usage_count: "DESC" },
    });

    // Construir perfil
    const profile: CustomerProfile = {
      customerId,
      preferences: [],
      addresses: [],
      favoriteItems: [],
      personalInfo: {},
      totalInteractions: memories.length,
    };

    for (const memory of memories) {
      // Actualizar last_accessed
      await this.memoryRepo.update(memory.id, { last_accessed_at: new Date() });

      switch (memory.memory_type) {
        case "preference":
          profile.preferences.push(memory.value);
          break;
        case "address":
          profile.addresses.push(memory.value);
          break;
        case "order_history":
          profile.favoriteItems.push(memory.value);
          break;
        case "personal":
          if (memory.key === "name") {
            profile.name = memory.value;
          } else {
            profile.personalInfo[memory.key] = memory.value;
          }
          break;
        case "communication":
          if (memory.key === "style") {
            profile.communicationStyle = memory.value as "formal" | "informal" | "neutral";
          } else if (memory.key === "uses_emojis") {
            profile.usesEmojis = memory.value === "true";
          } else if (memory.key === "greeting") {
            profile.preferredGreeting = memory.value;
          }
          break;
      }

      // Actualizar última interacción
      if (!profile.lastInteraction || memory.updated_at > profile.lastInteraction) {
        profile.lastInteraction = memory.updated_at;
      }
    }

    // Guardar en cache
    this.profileCache.set(customerId, { profile, timestamp: Date.now() });

    return profile;
  }

  /**
   * Guarda una nueva memoria para un cliente
   */
  async saveMemory(
    customerId: number,
    extraction: MemoryExtraction,
    conversationId?: number,
    context?: string,
  ): Promise<CustomerMemory> {
    // Buscar memoria existente con la misma key
    const existing = await this.memoryRepo.findOne({
      where: {
        customer_id: customerId,
        memory_type: extraction.type,
        key: extraction.key,
        is_active: true,
      },
    });

    if (existing) {
      // Actualizar memoria existente
      existing.value = extraction.value;
      existing.confidence = Math.min(1, existing.confidence + 0.1); // Incrementar confianza
      existing.usage_count++;
      existing.context = context || existing.context;
      existing.conversation_id = conversationId || existing.conversation_id;

      const saved = await this.memoryRepo.save(existing);
      this.logger.debug(`📝 Memory updated: ${extraction.key} for customer ${customerId}`);

      // Invalidar cache
      this.profileCache.delete(customerId);

      return saved;
    }

    // Crear nueva memoria
    const memory = this.memoryRepo.create({
      customer_id: customerId,
      memory_type: extraction.type,
      key: extraction.key,
      value: extraction.value,
      confidence: extraction.confidence,
      source: extraction.source,
      context,
      conversation_id: conversationId,
    });

    const saved = await this.memoryRepo.save(memory);
    this.logger.debug(`🧠 New memory saved: ${extraction.key} for customer ${customerId}`);

    // Invalidar cache
    this.profileCache.delete(customerId);

    return saved;
  }

  /**
   * Extrae memorias de un mensaje del cliente usando patrones
   */
  extractMemoriesFromMessage(
    message: string,
    customerName?: string,
  ): MemoryExtraction[] {
    const extractions: MemoryExtraction[] = [];
    const lower = message.toLowerCase();

    // Extraer preferencias alimenticias
    const preferencePatterns = [
      { pattern: /soy vegetarian[oa]/i, key: "vegetarian", value: "vegetariano" },
      { pattern: /soy vegan[oa]/i, key: "vegan", value: "vegano" },
      { pattern: /no como carne/i, key: "no_meat", value: "no come carne" },
      { pattern: /soy celiac[oa]|sin gluten/i, key: "celiac", value: "celíaco/sin gluten" },
      { pattern: /sin lactosa|intolerante a la lactosa/i, key: "lactose_free", value: "sin lactosa" },
      { pattern: /no me gust[ae] (el|la|los|las) (\w+)/i, key: "dislike", value: "" },
      { pattern: /soy alérgic[oa] (al|a la|a los|a las) (\w+)/i, key: "allergy", value: "" },
      { pattern: /sin picante|no picante|nada picante/i, key: "no_spicy", value: "sin picante" },
      { pattern: /me gusta picante|bien picante/i, key: "likes_spicy", value: "le gusta picante" },
    ];

    for (const { pattern, key, value } of preferencePatterns) {
      const match = message.match(pattern);
      if (match) {
        const extractedValue = value || match[2] || match[1];
        extractions.push({
          type: "preference",
          key,
          value: extractedValue,
          confidence: 0.8,
          source: "explicit",
        });
      }
    }

    // Extraer direcciones
    const addressPatterns = [
      /(?:vivo en|mi dirección es|envía[rm]e a|delivery a) (.+?)(?:\.|,|$)/i,
      /(?:calle|av\.|avenida|pasaje) .+? (?:#|número|nro\.?) ?\d+/i,
    ];

    for (const pattern of addressPatterns) {
      const match = message.match(pattern);
      if (match) {
        extractions.push({
          type: "address",
          key: "delivery_address",
          value: match[1] || match[0],
          confidence: 0.9,
          source: "explicit",
        });
      }
    }

    // Extraer información personal
    if (!customerName) {
      const namePatterns = [
        /(?:me llamo|mi nombre es|soy) ([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?: [A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?)/,
        /(?:para) ([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)/,
      ];

      for (const pattern of namePatterns) {
        const match = message.match(pattern);
        if (match && match[1].length > 2) {
          extractions.push({
            type: "personal",
            key: "name",
            value: match[1],
            confidence: 0.85,
            source: "explicit",
          });
          break;
        }
      }
    }

    // Detectar estilo de comunicación
    const formalIndicators = ["usted", "estimado", "por favor", "le agradecería"];
    const informalIndicators = ["tú", "hey", "wena", "porfa", "dale"];

    let formalScore = 0;
    let informalScore = 0;

    formalIndicators.forEach(w => { if (lower.includes(w)) formalScore++; });
    informalIndicators.forEach(w => { if (lower.includes(w)) informalScore++; });

    if (formalScore > informalScore + 1) {
      extractions.push({
        type: "communication",
        key: "style",
        value: "formal",
        confidence: 0.6,
        source: "inferred",
      });
    } else if (informalScore > formalScore + 1) {
      extractions.push({
        type: "communication",
        key: "style",
        value: "informal",
        confidence: 0.6,
        source: "inferred",
      });
    }

    // Detectar uso de emojis
    const hasEmojis = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/u.test(message);
    if (hasEmojis) {
      extractions.push({
        type: "communication",
        key: "uses_emojis",
        value: "true",
        confidence: 0.7,
        source: "inferred",
      });
    }

    return extractions;
  }

  /**
   * Guarda un pedido como memoria de historial
   */
  async saveOrderToMemory(
    customerId: number,
    orderItems: string[],
    conversationId?: number,
  ): Promise<void> {
    for (const item of orderItems) {
      // Buscar si ya existe este item en el historial
      const existing = await this.memoryRepo.findOne({
        where: {
          customer_id: customerId,
          memory_type: "order_history",
          key: "favorite_item",
          value: item,
        },
      });

      if (existing) {
        // Incrementar conteo y confianza
        existing.usage_count++;
        existing.confidence = Math.min(1, existing.confidence + 0.05);
        await this.memoryRepo.save(existing);
      } else {
        await this.saveMemory(customerId, {
          type: "order_history",
          key: "favorite_item",
          value: item,
          confidence: 0.3,
          source: "action",
        }, conversationId);
      }
    }

    this.logger.debug(`📦 Order saved to memory for customer ${customerId}: ${orderItems.length} items`);
  }

  /**
   * Obtiene las memorias más relevantes para contextualizar una respuesta
   */
  async getRelevantMemories(
    customerId: number,
    messageIntent?: string,
    limit: number = 5,
  ): Promise<CustomerMemory[]> {
    const query = this.memoryRepo.createQueryBuilder("memory")
      .where("memory.customer_id = :customerId", { customerId })
      .andWhere("memory.is_active = true")
      .andWhere("(memory.expires_at IS NULL OR memory.expires_at > :now)", { now: new Date() })
      .orderBy("memory.confidence", "DESC")
      .addOrderBy("memory.usage_count", "DESC")
      .addOrderBy("memory.updated_at", "DESC")
      .take(limit);

    // Priorizar memorias según intent
    if (messageIntent === "order") {
      query.andWhere("memory.memory_type IN (:...types)", {
        types: ["preference", "order_history", "address"],
      });
    } else if (messageIntent === "greeting") {
      query.andWhere("memory.memory_type IN (:...types)", {
        types: ["personal", "communication"],
      });
    }

    return query.getMany();
  }

  /**
   * Genera un resumen de contexto para el prompt del bot
   */
  async generateContextSummary(customerId: number): Promise<string> {
    const profile = await this.getCustomerProfile(customerId);

    const parts: string[] = [];

    if (profile.name) {
      parts.push(`👤 Nombre del cliente: ${profile.name}`);
    }

    if (profile.communicationStyle) {
      const styles = {
        formal: "prefiere trato formal (usar 'usted')",
        informal: "prefiere trato informal y cercano",
        neutral: "estilo de comunicación neutral",
      };
      parts.push(`💬 ${styles[profile.communicationStyle]}`);
    }

    if (profile.usesEmojis) {
      parts.push("😊 Le gustan los emojis en las respuestas");
    }

    if (profile.preferences.length > 0) {
      parts.push(`🍽️ Preferencias: ${profile.preferences.slice(0, 3).join(", ")}`);
    }

    if (profile.favoriteItems.length > 0) {
      const topItems = profile.favoriteItems.slice(0, 3);
      parts.push(`⭐ Pedidos frecuentes: ${topItems.join(", ")}`);
    }

    if (profile.addresses.length > 0) {
      parts.push(`📍 Dirección conocida: ${profile.addresses[0]}`);
    }

    if (parts.length === 0) {
      return "Cliente nuevo - sin historial previo";
    }

    return `MEMORIA DEL CLIENTE:\n${parts.join("\n")}`;
  }

  /**
   * Procesa un mensaje y guarda memorias automáticamente
   */
  async processAndSaveMemories(
    customerId: number,
    message: string,
    conversationId?: number,
    customerName?: string,
  ): Promise<MemoryExtraction[]> {
    const extractions = this.extractMemoriesFromMessage(message, customerName);

    for (const extraction of extractions) {
      await this.saveMemory(customerId, extraction, conversationId, message);
    }

    if (extractions.length > 0) {
      this.logger.log(`🧠 Extracted ${extractions.length} memories from message for customer ${customerId}`);
    }

    return extractions;
  }

  /**
   * Obtiene estadísticas de memoria del sistema
   */
  async getStats() {
    const total = await this.memoryRepo.count();
    const activeMemories = await this.memoryRepo.count({ where: { is_active: true } });
    const uniqueCustomers = await this.memoryRepo
      .createQueryBuilder("memory")
      .select("COUNT(DISTINCT customer_id)", "count")
      .getRawOne();

    const byType = await this.memoryRepo
      .createQueryBuilder("memory")
      .select("memory.memory_type", "type")
      .addSelect("COUNT(*)", "count")
      .groupBy("memory.memory_type")
      .getRawMany();

    return {
      totalMemories: total,
      activeMemories,
      uniqueCustomers: parseInt(uniqueCustomers?.count || "0"),
      byType: byType.reduce((acc, { type, count }) => {
        acc[type] = parseInt(count);
        return acc;
      }, {}),
      cacheSize: this.profileCache.size,
    };
  }

  /**
   * Limpia memorias expiradas o antiguas
   */
  async cleanup(): Promise<number> {
    const now = new Date();

    // Eliminar memorias expiradas
    const expiredResult = await this.memoryRepo.delete({
      expires_at: LessThan(now),
    });

    // Desactivar memorias muy antiguas no usadas (> 90 días)
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 90);

    const oldResult = await this.memoryRepo.update(
      {
        last_accessed_at: LessThan(oldDate),
        is_active: true,
      },
      { is_active: false }
    );

    const cleaned = (expiredResult.affected || 0) + (oldResult.affected || 0);
    if (cleaned > 0) {
      this.logger.log(`🧹 Cleaned ${cleaned} old/expired memories`);
    }

    return cleaned;
  }
}
