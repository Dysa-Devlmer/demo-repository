import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Reservation } from './reservation.entity';
import { Order } from './order.entity';
import { Conversation } from './conversation.entity';
import { Review } from './review.entity';
import { Notification } from './notification.entity';

export enum CustomerSource {
  WHATSAPP = 'whatsapp',
  WEB_WIDGET = 'web_widget',
  PHONE = 'phone',
  ADMIN = 'admin',
}

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true, nullable: true })
  email?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  whatsapp_phone?: string;

  @Column({
    type: 'enum',
    enum: CustomerSource,
    default: CustomerSource.WEB_WIDGET,
  })
  source: CustomerSource;

  @Column({ nullable: true })
  address?: string;

  @Column({ type: 'jsonb', nullable: true })
  preferences?: {
    dietary_restrictions?: string[];
    favorite_dishes?: string[];
    preferred_contact_method?: 'whatsapp' | 'email' | 'phone';
    language?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    first_visit?: Date;
    total_orders?: number;
    total_spent?: number;
    loyalty_points?: number;
    notes?: string;
  };

  @Column({ default: true })
  is_active: boolean;

  @Column({ nullable: true })
  last_interaction?: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Reservation, (reservation) => reservation.customer)
  reservations: Reservation[];

  @OneToMany(() => Order, (order) => order.customer)
  orders: Order[];

  @OneToMany(() => Conversation, (conversation) => conversation.customer)
  conversations: Conversation[];

  @OneToMany(() => Review, (review) => review.customer)
  reviews: Review[];

  @OneToMany(() => Notification, (notification) => notification.customer)
  notifications: Notification[];
}
