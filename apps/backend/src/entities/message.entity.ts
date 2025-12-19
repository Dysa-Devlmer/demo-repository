import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Conversation } from './conversation.entity';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  AUDIO = 'audio',
  VIDEO = 'video',
  LOCATION = 'location',
  SYSTEM = 'system',
  MENU = 'menu',
  BUTTON = 'button',
}

export enum MessageRole {
  USER = 'user',
  BOT = 'bot',
  AGENT = 'agent',
  SYSTEM = 'system',
}

export enum MessageDeliveryStatus {
  PENDING = 'pending', // Mensaje creado, aún no enviado
  SENT = 'sent', // Enviado al servidor de WhatsApp
  DELIVERED = 'delivered', // Entregado al dispositivo del usuario
  READ = 'read', // Leído por el usuario
  FAILED = 'failed', // Error al enviar
}

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  // Explicit FK column - required for QueryBuilder INSERT
  @Column({ name: 'conversation_id', nullable: true })
  conversation_id: number;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @Column({
    type: 'enum',
    enum: MessageRole,
    default: MessageRole.USER,
  })
  role: MessageRole;

  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.TEXT,
  })
  type: MessageType;

  @Column({ type: 'text' })
  content: string;

  @Column({ nullable: true })
  media_url?: string;

  @Column({ nullable: true })
  media_type?: string; // MIME type

  @Column({ nullable: true })
  sender_name?: string;

  @Column({ nullable: true })
  sender_id?: string; // WhatsApp phone, agent ID, etc.

  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    whatsapp_message_id?: string;
    processing_time?: number;
    ai_model_used?: string;
    intent_detected?: string;
    confidence_score?: number;
    entities_extracted?: any[];
    buttons?: { id: string; title: string }[];
    quick_replies?: string[];
    template_name?: string;
  };

  @Column({ default: false })
  is_read: boolean;

  @Column({ default: false })
  is_delivered: boolean;

  @Column({
    type: 'enum',
    enum: MessageDeliveryStatus,
    default: MessageDeliveryStatus.PENDING,
  })
  delivery_status: MessageDeliveryStatus;

  @Column({ nullable: true })
  delivered_at?: Date;

  @Column({ nullable: true })
  read_at?: Date;

  @Column({ nullable: true })
  error_message?: string;

  @CreateDateColumn()
  created_at: Date;
}
