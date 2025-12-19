import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Customer } from './customer.entity';
import { User } from '../auth/entities/user.entity';

export enum NotificationType {
  ORDER_STATUS = 'order_status',
  RESERVATION_REMINDER = 'reservation_reminder',
  PROMOTION = 'promotion',
  SYSTEM = 'system',
  REVIEW_REQUEST = 'review_request',
  DELIVERY_UPDATE = 'delivery_update',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  READ = 'read',
}

export enum NotificationChannel {
  WHATSAPP = 'whatsapp',
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({
    type: 'enum',
    enum: NotificationChannel,
  })
  channel: NotificationChannel;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.PENDING,
  })
  status: NotificationStatus;

  @ManyToOne(() => Customer, (customer) => customer.notifications, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'customer_id' })
  customer?: Customer;

  @ManyToOne(() => User, (user) => user.notifications, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ nullable: true })
  recipient_phone?: string;

  @Column({ nullable: true })
  recipient_email?: string;

  @Column({ nullable: true })
  scheduled_for?: Date;

  @Column({ nullable: true })
  sent_at?: Date;

  @Column({ nullable: true })
  read_at?: Date;

  @Column({ type: 'jsonb', nullable: true })
  template_data?: {
    variables?: Record<string, any>;
    template_id?: string;
    personalization?: Record<string, any>;
  };

  @Column({ type: 'jsonb', nullable: true })
  delivery_info?: {
    provider?: string;
    message_id?: string;
    webhook_data?: any;
    retry_count?: number;
    error_message?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    campaign_id?: string;
    source?: string;
    priority?: 'low' | 'medium' | 'high';
    related_entity_type?: string;
    related_entity_id?: number;
  };

  @Column({ default: false })
  is_bulk: boolean;

  @Column({ default: 0 })
  retry_count: number;

  @Column({ nullable: true })
  error_message?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
