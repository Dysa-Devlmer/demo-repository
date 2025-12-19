import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum AuditAction {
  LOGIN = 'login',
  LOGOUT = 'logout',
  LOGIN_FAILED = 'login_failed',
  PASSWORD_CHANGED = 'password_changed',
  PROFILE_UPDATED = 'profile_updated',
  CUSTOMER_CREATED = 'customer_created',
  CUSTOMER_UPDATED = 'customer_updated',
  CUSTOMER_DELETED = 'customer_deleted',
  ORDER_CREATED = 'order_created',
  ORDER_UPDATED = 'order_updated',
  ORDER_DELETED = 'order_deleted',
  RESERVATION_CREATED = 'reservation_created',
  RESERVATION_UPDATED = 'reservation_updated',
  RESERVATION_DELETED = 'reservation_deleted',
  MENU_CREATED = 'menu_created',
  MENU_UPDATED = 'menu_updated',
  MENU_DELETED = 'menu_deleted',
  SETTINGS_UPDATED = 'settings_updated',
  USER_CREATED = 'user_created',
  USER_UPDATED = 'user_updated',
  USER_DELETED = 'user_deleted',
  ROLE_ASSIGNED = 'role_assigned',
  ROLE_REMOVED = 'role_removed',
  DATA_EXPORTED = 'data_exported',
  DATA_IMPORTED = 'data_imported',
  SYSTEM_BACKUP = 'system_backup',
  SYSTEM_RESTORE = 'system_restore',
}

export enum AuditSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action: AuditAction;

  @Column({
    type: 'enum',
    enum: AuditSeverity,
    default: AuditSeverity.LOW,
  })
  severity: AuditSeverity;

  @Column()
  resource: string; // e.g., 'Customer', 'Order', 'User'

  @Column({ nullable: true })
  resourceId: string; // ID of the affected resource

  @Column('json', { nullable: true })
  oldValues: any; // Previous state for updates/deletes

  @Column('json', { nullable: true })
  newValues: any; // New state for creates/updates

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ nullable: true })
  sessionId: string;

  @Column('json', { nullable: true })
  metadata: any; // Additional context

  @Column({ nullable: true })
  errorMessage: string; // For failed actions

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: true })
  userId: number;

  @CreateDateColumn()
  createdAt: Date;
}
