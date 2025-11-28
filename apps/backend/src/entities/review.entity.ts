import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from "typeorm";
import { Customer } from "./customer.entity";
import { Order } from "./order.entity";

export enum ReviewStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  FLAGGED = "flagged",
}

export enum ReviewType {
  ORDER = "order",
  RESTAURANT = "restaurant",
  SERVICE = "service",
  DELIVERY = "delivery",
}

@Entity("reviews")
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Customer, (customer) => customer.reviews, {
    onDelete: "CASCADE",
    eager: true,
  })
  @JoinColumn({ name: "customer_id" })
  customer: Customer;

  @ManyToOne(() => Order, (order) => order.reviews, {
    onDelete: "CASCADE",
    nullable: true,
  })
  @JoinColumn({ name: "order_id" })
  order?: Order;

  @Column({
    type: "enum",
    enum: ReviewType,
    default: ReviewType.RESTAURANT,
  })
  type: ReviewType;

  @Column({ type: "int", width: 1 })
  rating: number; // 1-5 stars

  @Column({ type: "text", nullable: true })
  comment?: string;

  @Column({
    type: "enum",
    enum: ReviewStatus,
    default: ReviewStatus.PENDING,
  })
  status: ReviewStatus;

  @Column({ type: "jsonb", nullable: true })
  ratings_breakdown?: {
    food_quality?: number;
    service?: number;
    ambiance?: number;
    value_for_money?: number;
    delivery_time?: number;
  };

  @Column({ type: "simple-array", nullable: true })
  photos?: string[]; // URLs de fotos subidas

  @Column({ type: "jsonb", nullable: true })
  metadata?: {
    source?: "whatsapp" | "web_widget" | "email" | "admin";
    ip_address?: string;
    user_agent?: string;
    flagged_reason?: string;
    admin_response?: string;
    admin_response_date?: Date;
    helpful_votes?: number;
    total_votes?: number;
  };

  @Column({ default: true })
  is_anonymous: boolean;

  @Column({ default: false })
  is_verified: boolean; // Si el cliente realmente hizo el pedido

  @Column({ default: false })
  is_featured: boolean;

  @Column({ nullable: true })
  admin_notes?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
