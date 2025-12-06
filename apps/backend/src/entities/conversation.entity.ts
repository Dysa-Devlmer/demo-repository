import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from "typeorm";
import { Customer } from "./customer.entity";
import { Message } from "./message.entity";

export enum ConversationStatus {
  ACTIVE = "active",
  RESOLVED = "resolved",
  CLOSED = "closed",
  ESCALATED = "escalated",
}

export enum ConversationChannel {
  WHATSAPP = "whatsapp",
  WEB_WIDGET = "web_widget",
  PHONE = "phone",
}

export enum ConversationMode {
  AUTO = "auto",      // Bot responde automáticamente
  MANUAL = "manual",  // Solo agente humano responde
  HYBRID = "hybrid",  // Bot responde, pero agente puede intervenir
}

@Entity("conversations")
export class Conversation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  session_id: string;

  @ManyToOne(() => Customer, (customer) => customer.conversations, {
    onDelete: "CASCADE",
    eager: true,
  })
  @JoinColumn({ name: "customer_id" })
  customer: Customer;

  @Column({
    type: "enum",
    enum: ConversationChannel,
    default: ConversationChannel.WEB_WIDGET,
  })
  channel: ConversationChannel;

  @Column({
    type: "enum",
    enum: ConversationStatus,
    default: ConversationStatus.ACTIVE,
  })
  status: ConversationStatus;

  @Column({
    type: "enum",
    enum: ConversationMode,
    default: ConversationMode.AUTO,
  })
  mode: ConversationMode;

  @Column({ nullable: true })
  subject?: string;

  @Column({ nullable: true })
  agent_id?: string; // if escalated to human agent

  @Column({ type: "jsonb", nullable: true })
  context?: {
    intent?: string;
    entities?: any[];
    current_flow?: string;
    collected_data?: any;
    last_menu_shown?: string;
    pending_action?: string;
  };

  @Column({ type: "jsonb", nullable: true })
  metadata?: {
    user_agent?: string;
    ip_address?: string;
    location?: string;
    language?: string;
    timezone?: string;
    device_type?: "desktop" | "mobile" | "tablet";
  };

  @Column({ nullable: true })
  last_activity?: Date;

  @Column({ default: 0 })
  message_count: number;

  @Column({ default: 0 })
  bot_messages: number;

  @Column({ default: 0 })
  human_messages: number;

  @Column({ nullable: true })
  satisfaction_score?: number; // 1-5

  @Column({ nullable: true })
  feedback?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Message, (message) => message.conversation, {
    cascade: true,
  })
  messages: Message[];
}
