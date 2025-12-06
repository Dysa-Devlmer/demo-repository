import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Customer } from "./customer.entity";

/**
 * Memoria persistente del cliente - Para respuestas personalizadas
 *
 * El bot recordará:
 * - Preferencias de comida
 * - Direcciones de delivery
 * - Estilo de comunicación
 * - Historial de pedidos favoritos
 * - Información personal mencionada
 */
@Entity("customer_memories")
@Index(["customer_id", "memory_type"])
@Index(["customer_id", "key"])
export class CustomerMemory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  customer_id: number;

  @ManyToOne(() => Customer, { onDelete: "CASCADE" })
  @JoinColumn({ name: "customer_id" })
  customer: Customer;

  /**
   * Tipo de memoria:
   * - preference: Preferencias (ej: "no picante", "vegetariano")
   * - address: Direcciones de delivery
   * - personal: Info personal (cumpleaños, nombre real)
   * - order_history: Pedidos frecuentes
   * - communication: Estilo de comunicación
   * - feedback: Feedback dado anteriormente
   * - custom: Otros datos
   */
  @Column({
    type: "enum",
    enum: ["preference", "address", "personal", "order_history", "communication", "feedback", "custom"],
    default: "custom",
  })
  memory_type: "preference" | "address" | "personal" | "order_history" | "communication" | "feedback" | "custom";

  /**
   * Clave única para este tipo de memoria
   * Ej: "delivery_address_1", "favorite_dish", "communication_style"
   */
  @Column({ length: 100 })
  key: string;

  /**
   * Valor de la memoria
   * Puede ser texto simple o JSON serializado
   */
  @Column({ type: "text" })
  value: string;

  /**
   * Confianza en esta memoria (0-1)
   * Se incrementa cada vez que se confirma
   */
  @Column({ type: "float", default: 0.5 })
  confidence: number;

  /**
   * Número de veces que se ha usado/confirmado
   */
  @Column({ default: 1 })
  usage_count: number;

  /**
   * Fuente de la memoria:
   * - explicit: El cliente lo dijo directamente
   * - inferred: Inferido de la conversación
   * - action: Derivado de acciones (ej: pedido completado)
   */
  @Column({
    type: "enum",
    enum: ["explicit", "inferred", "action"],
    default: "inferred",
  })
  source: "explicit" | "inferred" | "action";

  /**
   * Contexto donde se aprendió esta memoria
   */
  @Column({ type: "text", nullable: true })
  context?: string;

  /**
   * ID de la conversación donde se aprendió
   */
  @Column({ nullable: true })
  conversation_id?: number;

  /**
   * Fecha de expiración (algunas memorias expiran)
   */
  @Column({ type: "timestamp", nullable: true })
  expires_at?: Date;

  /**
   * Si esta memoria está activa
   */
  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  /**
   * Última vez que se accedió a esta memoria
   */
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  last_accessed_at: Date;
}
