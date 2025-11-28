import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../auth/entities/user.entity';

export enum SubscriptionStatus {
  TRIAL = 'trial',
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended',
  PENDING_PAYMENT = 'pending_payment',
}

export enum PlanType {
  SAAS_MULTI_TENANT = 'saas-multi',
  SAAS_DEDICATED = 'saas-dedicated',
  ON_PREMISE = 'on-premise',
}

@Entity('subscriptions')
@Index(['user_id'], { unique: true })
@Index(['status'])
@Index(['ends_at'])
export class Subscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  user_id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: PlanType,
    default: PlanType.SAAS_MULTI_TENANT,
    name: 'plan_type',
  })
  plan_type: PlanType;

  @Column({ name: 'plan_name' })
  plan_name: string;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.TRIAL,
  })
  status: SubscriptionStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'monthly_price' })
  monthly_price: number;

  @Column({ default: 'CLP' })
  currency: string;

  @Column({ default: 'monthly', name: 'billing_cycle' })
  billing_cycle: string;

  @Column({ type: 'timestamp', name: 'starts_at' })
  starts_at: Date;

  @Column({ type: 'timestamp', name: 'ends_at', nullable: true })
  ends_at: Date;

  @Column({ type: 'timestamp', name: 'trial_ends_at', nullable: true })
  trial_ends_at: Date;

  @Column({ type: 'timestamp', name: 'cancelled_at', nullable: true })
  cancelled_at: Date;

  @Column({ name: 'cancel_reason', nullable: true })
  cancel_reason: string;

  @Column({ type: 'timestamp', name: 'last_payment_at', nullable: true })
  last_payment_at: Date;

  @Column({ type: 'timestamp', name: 'next_payment_at', nullable: true })
  next_payment_at: Date;

  @Column({ default: 0, name: 'payment_failures' })
  payment_failures: number;

  @Column({ type: 'json', nullable: true })
  features: any;

  @Column({ type: 'json', nullable: true })
  limits: any;

  @Column({ type: 'json', nullable: true })
  metadata: any;

  @Column({ default: true, name: 'auto_renew' })
  auto_renew: boolean;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp without time zone',
    default: () => 'LOCALTIMESTAMP',
  })
  created_at: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp without time zone',
    default: () => 'LOCALTIMESTAMP',
  })
  updated_at: Date;
}
