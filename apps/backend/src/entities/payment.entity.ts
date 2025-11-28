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

export enum PaymentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
  IN_PROCESS = 'in_process',
  IN_MEDIATION = 'in_mediation',
  CHARGED_BACK = 'charged_back',
}

export enum PaymentProvider {
  MERCADOPAGO = 'mercadopago',
  TRANSFER = 'transfer',
  INVOICE = 'invoice',
}

export enum BillingPeriod {
  MONTHLY = 'monthly',
  ANNUAL = 'annual',
  ONE_TIME = 'one_time',
}

@Entity('payments')
@Index(['external_payment_id'], { unique: true, where: 'external_payment_id IS NOT NULL' })
@Index(['user_id', 'status'])
@Index(['created_at'])
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', nullable: true })
  user_id: number;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'external_payment_id', nullable: true })
  external_payment_id: string;

  @Column({ name: 'external_reference', nullable: true })
  external_reference: string;

  @Column({ name: 'preference_id', nullable: true })
  preference_id: string;

  @Column({
    type: 'enum',
    enum: PaymentProvider,
    default: PaymentProvider.MERCADOPAGO,
  })
  provider: PaymentProvider;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ name: 'status_detail', nullable: true })
  status_detail: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ default: 'CLP' })
  currency: string;

  @Column({ name: 'plan_id' })
  plan_id: string;

  @Column({ name: 'plan_name' })
  plan_name: string;

  @Column({
    type: 'enum',
    enum: BillingPeriod,
    default: BillingPeriod.MONTHLY,
    name: 'billing_period',
  })
  billing_period: BillingPeriod;

  @Column({ name: 'payer_email' })
  payer_email: string;

  @Column({ name: 'payer_name', nullable: true })
  payer_name: string;

  @Column({ name: 'payer_identification', nullable: true })
  payer_identification: string;

  @Column({ name: 'company_name', nullable: true })
  company_name: string;

  @Column({ type: 'json', nullable: true })
  metadata: any;

  @Column({ type: 'json', name: 'webhook_data', nullable: true })
  webhook_data: any;

  @Column({ type: 'timestamp', name: 'date_approved', nullable: true })
  date_approved: Date;

  @Column({ type: 'timestamp', name: 'date_refunded', nullable: true })
  date_refunded: Date;

  @Column({ name: 'refund_amount', type: 'decimal', precision: 12, scale: 2, nullable: true })
  refund_amount: number;

  @Column({ name: 'refund_reason', nullable: true })
  refund_reason: string;

  @Column({ name: 'invoice_number', nullable: true })
  invoice_number: string;

  @Column({ name: 'receipt_url', nullable: true })
  receipt_url: string;

  @Column({ default: false, name: 'email_sent' })
  email_sent: boolean;

  @Column({ default: false, name: 'notification_sent' })
  notification_sent: boolean;

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
