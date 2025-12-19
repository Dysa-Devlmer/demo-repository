import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Customer } from '../../entities/customer.entity';

/**
 * Tipos de memoria del cliente - estilo JARVIS
 * Almacena preferencias aprendidas de las conversaciones
 */
export enum MemoryType {
  PREFERENCE = 'preference', // Preferencias alimenticias (vegetariano, sin gluten, etc.)
  ADDRESS = 'address', // Direcciones de entrega frecuentes
  COMMUNICATION = 'communication', // Estilo de comunicación preferido
  ORDER = 'order', // Patrones de pedidos frecuentes
  PERSONAL = 'personal', // Info personal (cumpleaños, nombre preferido, etc.)
}

/**
 * Nivel de confianza de la memoria
 * A mayor uso, mayor confianza
 */
export enum ConfidenceLevel {
  LOW = 'low', // Primera vez detectado
  MEDIUM = 'medium', // Confirmado 2-3 veces
  HIGH = 'high', // Patrón establecido (4+ veces)
  CONFIRMED = 'confirmed', // Confirmado explícitamente por el cliente
}

@Entity('customer_memories')
@Index(['customer', 'memoryType'])
@Index(['customer', 'memoryKey'])
export class CustomerMemory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Customer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ name: 'customer_id' })
  customerId: number;

  @Column({
    type: 'enum',
    enum: MemoryType,
    name: 'memory_type',
  })
  memoryType: MemoryType;

  @Column({ name: 'memory_key', length: 100 })
  memoryKey: string; // ej: "dietary_preference", "delivery_address_1", "preferred_greeting"

  @Column({ type: 'text', name: 'memory_value' })
  memoryValue: string; // ej: "vegetariano", "Av. Providencia 123, depto 45", "informal"

  @Column({
    type: 'enum',
    enum: ConfidenceLevel,
    default: ConfidenceLevel.LOW,
  })
  confidence: ConfidenceLevel;

  @Column({ name: 'usage_count', default: 1 })
  usageCount: number; // Cuántas veces se ha usado esta memoria

  @Column({ name: 'last_used_at', type: 'timestamp', nullable: true })
  lastUsedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    source?: string; // Dónde se aprendió (conversación, pedido, etc.)
    conversationId?: number; // ID de la conversación donde se aprendió
    extractedFrom?: string; // Texto del cual se extrajo
    isExplicit?: boolean; // Si el cliente lo dijo explícitamente
    alternatives?: string[]; // Valores alternativos detectados
  };

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // ======================
  // Q-LEARNING FIELDS
  // ======================

  @Column({ type: 'float', default: 0.5, name: 'q_value' })
  qValue: number; // Valor Q para optimización (0-1)

  @Column({ type: 'float', default: 0, name: 'reward_sum' })
  rewardSum: number; // Suma de recompensas recibidas

  @Column({ name: 'reward_count', default: 0 })
  rewardCount: number; // Número de recompensas recibidas
}
