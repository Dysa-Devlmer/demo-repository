import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

/**
 * LearningExperience - Almacena cada interacción para aprendizaje continuo
 * Inspirado en el Experience Buffer de JARVIS Mark VII
 */
@Entity('learning_experiences')
@Index(['intent', 'sentiment'])
@Index(['created_at'])
export class LearningExperience {
  @PrimaryGeneratedColumn()
  id: number;

  // Mensaje del usuario
  @Column('text')
  user_input: string;

  // Respuesta generada por el bot
  @Column('text')
  bot_response: string;

  // Proveedor de IA usado (openai, ollama, fallback)
  @Column({ length: 50 })
  ai_provider: string;

  // ============= FEATURES DE ANÁLISIS =============

  // Análisis de sentimiento (-1 a 1)
  @Column('float', { default: 0 })
  sentiment: number;

  // Complejidad del mensaje (1-10)
  @Column('int', { default: 5 })
  complexity: number;

  // Intención detectada (greeting, order, reservation, question, complaint, etc)
  @Column({ length: 100, nullable: true })
  intent: string;

  // Palabras clave extraídas
  @Column('simple-array', { nullable: true })
  keywords: string[];

  // Categoría del contexto (menu, reservation, order, info, etc)
  @Column({ length: 50, nullable: true })
  context_category: string;

  // ============= MÉTRICAS DE RENDIMIENTO =============

  // Tiempo de respuesta en ms
  @Column('int')
  response_time_ms: number;

  // Tokens usados (si aplica)
  @Column('int', { nullable: true })
  tokens_used: number;

  // ¿La respuesta vino del cache?
  @Column('boolean', { default: false })
  from_cache: boolean;

  // ============= FEEDBACK Y CALIDAD =============

  // Puntuación de calidad (1-5, null si no hay feedback)
  @Column('int', { nullable: true })
  quality_score: number;

  // ¿El cliente continuó la conversación positivamente?
  @Column('boolean', { nullable: true })
  positive_continuation: boolean;

  // ¿El cliente solicitó escalamiento a humano?
  @Column('boolean', { default: false })
  escalated_to_human: boolean;

  // ¿La conversación resultó en pedido/reserva exitosa?
  @Column('boolean', { nullable: true })
  resulted_in_action: boolean;

  // Tipo de acción resultante
  @Column({ length: 50, nullable: true })
  action_type: string; // order, reservation, inquiry_resolved, etc

  // ============= CONTEXTO TEMPORAL =============

  // Hora del día (0-23)
  @Column('int')
  hour_of_day: number;

  // Día de la semana (0-6, 0=domingo)
  @Column('int')
  day_of_week: number;

  // ============= Q-LEARNING =============

  // Estado codificado para Q-Learning
  @Column({ length: 255, nullable: true })
  state_key: string;

  // Acción tomada
  @Column({ length: 100, nullable: true })
  action_taken: string;

  // Recompensa calculada (-1 a 1)
  @Column('float', { nullable: true })
  reward: number;

  // ============= METADATOS =============

  // ID de la conversación relacionada
  @Column('int', { nullable: true })
  conversation_id: number;

  // ID del cliente
  @Column('int', { nullable: true })
  customer_id: number;

  // Canal (whatsapp, web_widget, etc)
  @Column({ length: 50, nullable: true })
  channel: string;

  @CreateDateColumn()
  created_at: Date;
}
