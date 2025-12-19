import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum SettingStatus {
  ACTIVE = 'active',
  DRAFT = 'draft',
  ARCHIVED = 'archived',
}

export enum SettingCategory {
  RESTAURANT = 'restaurant',
  WHATSAPP = 'whatsapp',
  TWILIO = 'twilio',
  OLLAMA = 'ollama',
  DATABASE = 'database',
  GENERAL = 'general',
  SECURITY = 'security',
  NOTIFICATIONS = 'notifications',
}

@Entity('settings')
@Index(['category', 'key'])
@Index(['status'])
export class Setting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Index()
  key: string;

  @Column({ type: 'text' })
  value: string;

  @Column({
    type: 'enum',
    enum: SettingCategory,
    default: SettingCategory.GENERAL,
  })
  category: SettingCategory;

  @Column({ nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: SettingStatus,
    default: SettingStatus.ACTIVE,
  })
  status: SettingStatus;

  @Column({ default: false })
  is_sensitive: boolean; // Para passwords, tokens, etc.

  @Column({ default: false })
  is_required: boolean;

  @Column({ type: 'jsonb', nullable: true })
  validation_rules?: {
    type?: 'string' | 'number' | 'email' | 'url' | 'phone';
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[]; // Para valores predefinidos
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    changed_by?: string;
    previous_value?: string;
    environment?: 'development' | 'production';
    restart_required?: boolean;
  };

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
