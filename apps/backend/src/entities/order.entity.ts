import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Customer } from './customer.entity';
import { OrderItem } from './order-item.entity';
import { Review } from './review.entity';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum OrderType {
  DINE_IN = 'dine_in',
  TAKEAWAY = 'takeaway',
  DELIVERY = 'delivery',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, name: 'orderNumber' })
  order_number: string;

  // Customer relationship
  @ManyToOne(() => Customer, (customer) => customer.orders, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'customer_id' })
  customer?: Customer;

  @Column({ name: 'customerName' })
  customer_name: string;

  @Column({ name: 'customerPhone' })
  customer_phone: string;

  @Column({ name: 'customerEmail', nullable: true })
  customer_email?: string;

  @Column({ name: 'orderType' })
  order_type: string;

  @Column({ name: 'status' })
  status: string;

  // Order items relationship
  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: true,
  })
  order_items?: OrderItem[];

  // Reviews relationship
  @OneToMany(() => Review, (review) => review.order)
  reviews?: Review[];

  @Column({ type: 'json', name: 'items' })
  items: any;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'subtotal' })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'tax' })
  tax: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'tip' })
  tip: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'total' })
  total: number;

  @Column({ type: 'text', name: 'deliveryAddress', nullable: true })
  delivery_address?: string;

  @Column({ type: 'text', name: 'notes', nullable: true })
  notes?: string;

  // Enterprise Integration Fields
  @Column({ name: 'paymentIntentId', nullable: true })
  payment_intent_id?: string;

  @Column({ name: 'paymentProvider', nullable: true })
  payment_provider?: string;

  @Column({ name: 'paymentStatus', default: 'pending' })
  payment_status: string;

  @Column({ name: 'whatsappNotified', default: false })
  whatsapp_notified: boolean;

  @Column({ name: 'emailNotified', default: false })
  email_notified: boolean;

  @Column({ name: 'smsNotified', default: false })
  sms_notified: boolean;

  @Column({ type: 'json', name: 'notificationHistory', nullable: true })
  notification_history?: any[];

  @Column({ type: 'json', name: 'integrationMetadata', nullable: true })
  integration_metadata?: any;

  @CreateDateColumn({
    name: 'createdAt',
    type: 'timestamp without time zone',
    default: () => 'LOCALTIMESTAMP',
  })
  created_at: Date;

  @UpdateDateColumn({
    name: 'updatedAt',
    type: 'timestamp without time zone',
    default: () => 'LOCALTIMESTAMP',
  })
  updated_at: Date;
}
