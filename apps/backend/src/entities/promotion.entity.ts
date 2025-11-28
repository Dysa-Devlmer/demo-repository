import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

export enum PromotionType {
  PERCENTAGE = "percentage",
  FIXED_AMOUNT = "fixed_amount",
  BUY_ONE_GET_ONE = "buy_one_get_one",
  FREE_DELIVERY = "free_delivery",
  COMBO = "combo",
}

export enum PromotionTarget {
  ALL_CUSTOMERS = "all_customers",
  NEW_CUSTOMERS = "new_customers",
  RETURNING_CUSTOMERS = "returning_customers",
  VIP_CUSTOMERS = "vip_customers",
}

@Entity("promotions")
export class Promotion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 150 })
  title: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ unique: true })
  promo_code: string;

  @Column({
    type: "enum",
    enum: PromotionType,
    default: PromotionType.PERCENTAGE,
  })
  type: PromotionType;

  @Column({
    type: "enum",
    enum: PromotionTarget,
    default: PromotionTarget.ALL_CUSTOMERS,
  })
  target: PromotionTarget;

  @Column({ type: "decimal", precision: 8, scale: 2, nullable: true })
  discount_value?: number;

  @Column({ type: "decimal", precision: 8, scale: 2, nullable: true })
  minimum_order_amount?: number;

  @Column({ type: "decimal", precision: 8, scale: 2, nullable: true })
  maximum_discount_amount?: number;

  @Column({ nullable: true })
  usage_limit?: number;

  @Column({ default: 0 })
  usage_count: number;

  @Column({ type: "timestamp" })
  valid_from: Date;

  @Column({ type: "timestamp" })
  valid_until: Date;

  @Column({ type: "simple-array", nullable: true })
  applicable_days?: string[]; // ['monday', 'tuesday', etc.]

  @Column({ type: "time", nullable: true })
  applicable_time_from?: string;

  @Column({ type: "time", nullable: true })
  applicable_time_until?: string;

  @Column({ type: "simple-array", nullable: true })
  applicable_categories?: string[]; // menu categories

  @Column({ type: "simple-array", nullable: true })
  applicable_items?: string[]; // specific menu item IDs

  @Column({ nullable: true })
  image_url?: string;

  @Column({ default: true })
  active: boolean;

  @Column({ default: false })
  is_featured: boolean;

  @Column({ type: "jsonb", nullable: true })
  conditions?: {
    first_time_customer?: boolean;
    minimum_items?: number;
    exclude_categories?: string[];
    require_categories?: string[];
    max_uses_per_customer?: number;
  };

  @Column({ type: "jsonb", nullable: true })
  metadata?: {
    campaign_name?: string;
    created_by?: string;
    notes?: string;
    analytics?: {
      total_savings?: number;
      customer_acquisition?: number;
      revenue_impact?: number;
    };
  };

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at: Date;
}
