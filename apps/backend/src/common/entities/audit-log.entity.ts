/**
 * Audit Log Entity
 * ChatBotDysa Enterprise
 *
 * Entity para almacenar todos los eventos de auditoría del sistema
 * con capacidad de búsqueda y análisis forense
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum AuditSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum AuditAction {
  // Authentication
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  REFRESH_TOKEN = 'REFRESH_TOKEN',
  FAILED_LOGIN = 'FAILED_LOGIN',

  // CRUD Operations
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',

  // Role & Permission
  ROLE_ASSIGNED = 'ROLE_ASSIGNED',
  ROLE_REMOVED = 'ROLE_REMOVED',
  PERMISSION_GRANTED = 'PERMISSION_GRANTED',
  PERMISSION_REVOKED = 'PERMISSION_REVOKED',

  // Security
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  FORBIDDEN_ACCESS = 'FORBIDDEN_ACCESS',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',

  // Configuration
  CONFIG_CHANGED = 'CONFIG_CHANGED',
  SYSTEM_SETTING_CHANGED = 'SYSTEM_SETTING_CHANGED',

  // Data Export
  DATA_EXPORT = 'DATA_EXPORT',
  BULK_OPERATION = 'BULK_OPERATION',
}

@Entity('audit_logs')
@Index(['userId', 'createdAt'])
@Index(['action', 'createdAt'])
@Index(['severity', 'createdAt'])
@Index(['endpoint', 'createdAt'])
@Index(['ip', 'createdAt'])
@Index(['success', 'createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  // Temporal
  @CreateDateColumn({ type: 'timestamp' })
  @Index()
  createdAt: Date;

  // Usuario
  @Column({ type: 'int', nullable: true })
  @Index()
  userId: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Index()
  userEmail: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  role: string | null;

  // Request Info
  @Column({ type: 'enum', enum: AuditAction })
  @Index()
  action: AuditAction;

  @Column({ type: 'varchar', length: 10, nullable: true, default: 'GET' })
  method: string;

  @Column({ type: 'varchar', length: 500, nullable: true, default: '/' })
  @Index()
  endpoint: string;

  // Network
  @Column({ type: 'varchar', length: 45, name: 'ipAddress', nullable: true, default: '0.0.0.0' })
  ip: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string | null;

  // Request/Response
  @Column({ type: 'jsonb', nullable: true })
  requestBody: any;

  @Column({ type: 'jsonb', nullable: true })
  requestHeaders: any;

  @Column({ type: 'int', nullable: true, default: 200 })
  responseStatus: number;

  @Column({ type: 'int', nullable: true, default: 0 })
  duration: number; // milliseconds

  @Column({ type: 'boolean', default: true, nullable: true })
  @Index()
  success: boolean;

  // Error Info
  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;

  @Column({ type: 'text', nullable: true })
  errorStack: string | null;

  // Security
  @Column({ type: 'enum', enum: AuditSeverity, default: AuditSeverity.LOW })
  @Index()
  severity: AuditSeverity;

  @Column({ type: 'boolean', default: false })
  @Index()
  isCritical: boolean;

  @Column({ type: 'boolean', default: false })
  @Index()
  isSuspicious: boolean;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  // Resource (legacy column from old schema)
  @Column({ type: 'varchar', nullable: false, default: 'unknown' })
  resource: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  resourceType: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  resourceId: string | null;

  // Old/New values (legacy columns from old schema)
  @Column({ type: 'json', nullable: true })
  oldValues: any;

  @Column({ type: 'json', nullable: true })
  newValues: any;

  // Forensics
  @Column({ type: 'varchar', length: 64, nullable: true })
  requestId: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  sessionId: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  correlationId: string | null;

  // Retention
  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date | null;

  @Column({ type: 'boolean', default: false })
  archived: boolean;

  // Review
  @Column({ type: 'boolean', default: false })
  reviewed: boolean;

  @Column({ type: 'int', nullable: true })
  reviewedBy: number | null;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  reviewNotes: string | null;
}
