import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum ReportType {
  SALES = 'sales',
  CUSTOMERS = 'customers',
  MENU = 'menu',
  RESERVATIONS = 'reservations',
  OPERATIONS = 'operations',
  CUSTOM = 'custom',
}

export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
}

export enum ReportSchedule {
  MANUAL = 'manual',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export enum ReportStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: ReportType,
    default: ReportType.SALES,
  })
  type: ReportType;

  @Column({
    type: 'enum',
    enum: ReportFormat,
    default: ReportFormat.PDF,
  })
  format: ReportFormat;

  @Column({
    type: 'enum',
    enum: ReportSchedule,
    default: ReportSchedule.MANUAL,
  })
  schedule: ReportSchedule;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.ACTIVE,
  })
  status: ReportStatus;

  @Column({ type: 'simple-array' })
  metrics: string[];

  @Column({ type: 'json', nullable: true })
  filters?: Record<string, any>;

  @Column({ nullable: true })
  dateRange?: string;

  @Column({ nullable: true })
  lastGenerated?: Date;

  @Column({ nullable: true })
  lastGeneratedUrl?: string;

  @Column()
  createdBy: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
