import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

export enum SnapshotType {
  HOURLY = "hourly",
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  CUSTOM = "custom",
}

export enum SnapshotStatus {
  ACTIVE = "active",
  ARCHIVED = "archived",
  DELETED = "deleted",
}

@Entity("dashboard_snapshots")
@Index(["snapshot_type", "snapshot_date"])
@Index(["status", "snapshot_date"])
export class DashboardSnapshot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "enum",
    enum: SnapshotType,
    default: SnapshotType.DAILY,
  })
  snapshot_type: SnapshotType;

  @Column({ type: "timestamp" })
  @Index()
  snapshot_date: Date;

  @Column({
    type: "enum",
    enum: SnapshotStatus,
    default: SnapshotStatus.ACTIVE,
  })
  status: SnapshotStatus;

  // Revenue Metrics
  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  total_revenue: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  average_order_value: number;

  @Column({ type: "int", default: 0 })
  total_orders: number;

  @Column({ type: "int", default: 0 })
  completed_orders: number;

  @Column({ type: "int", default: 0 })
  pending_orders: number;

  @Column({ type: "int", default: 0 })
  cancelled_orders: number;

  // Customer Metrics
  @Column({ type: "int", default: 0 })
  total_customers: number;

  @Column({ type: "int", default: 0 })
  new_customers: number;

  @Column({ type: "decimal", precision: 5, scale: 2, default: 0 })
  customer_growth_rate: number; // percentage

  @Column({ type: "int", default: 0 })
  active_customers: number;

  // Menu Metrics
  @Column({ type: "int", default: 0 })
  total_menu_items: number;

  @Column({ type: "int", default: 0 })
  active_menu_items: number;

  @Column({ type: "jsonb", nullable: true })
  top_selling_items: {
    id: number;
    name: string;
    quantity: number;
    revenue: number;
  }[];

  // Reservation Metrics
  @Column({ type: "int", default: 0 })
  total_reservations: number;

  @Column({ type: "int", default: 0 })
  confirmed_reservations: number;

  @Column({ type: "int", default: 0 })
  completed_reservations: number;

  @Column({ type: "int", default: 0 })
  cancelled_reservations: number;

  @Column({ type: "int", default: 0 })
  no_show_reservations: number;

  @Column({ type: "decimal", precision: 5, scale: 2, default: 0 })
  reservation_fulfillment_rate: number; // percentage

  // Conversation Metrics
  @Column({ type: "int", default: 0 })
  total_conversations: number;

  @Column({ type: "int", default: 0 })
  active_conversations: number;

  @Column({ type: "int", default: 0 })
  resolved_conversations: number;

  @Column({ type: "int", default: 0 })
  escalated_conversations: number;

  @Column({ type: "decimal", precision: 3, scale: 1, default: 0 })
  avg_satisfaction_score: number; // 0.0 - 5.0

  @Column({ type: "decimal", precision: 5, scale: 2, default: 0 })
  bot_resolution_rate: number; // percentage

  // Performance Metrics
  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  revenue_per_customer: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  revenue_per_order: number;

  @Column({ type: "decimal", precision: 5, scale: 2, default: 0 })
  order_completion_rate: number; // percentage

  @Column({ type: "decimal", precision: 5, scale: 2, default: 0 })
  customer_retention_rate: number; // percentage

  // Comparison with previous period
  @Column({ type: "jsonb", nullable: true })
  comparison: {
    revenue_change: number; // percentage
    orders_change: number;
    customers_change: number;
    reservations_change: number;
    satisfaction_change: number;
    period: string; // "vs last day/week/month"
  };

  // Additional metadata
  @Column({ type: "jsonb", nullable: true })
  metadata: {
    note?: string;
    triggered_by?: string; // "cron" | "manual" | "api"
    execution_time_ms?: number;
    data_sources?: string[];
  };

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
