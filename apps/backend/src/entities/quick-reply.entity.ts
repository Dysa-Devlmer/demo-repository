import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum QuickReplyCategory {
  GREETING = 'greeting',
  FAREWELL = 'farewell',
  INFO = 'info',
  SUPPORT = 'support',
  SALES = 'sales',
  CUSTOM = 'custom',
}

@Entity('quick_replies')
export class QuickReply {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'enum',
    enum: QuickReplyCategory,
    default: QuickReplyCategory.CUSTOM,
  })
  category: QuickReplyCategory;

  @Column({ nullable: true })
  shortcut?: string; // e.g., "/saludo" or "!hola"

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: 0 })
  usage_count: number;

  @Column({ type: 'jsonb', nullable: true })
  variables?: string[]; // Variables like {nombre}, {producto}

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
