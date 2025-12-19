import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import { Role } from './role.entity';

export enum PermissionModule {
  DASHBOARD = 'dashboard',
  CUSTOMERS = 'customers',
  ORDERS = 'orders',
  MENU = 'menu',
  RESERVATIONS = 'reservations',
  CONVERSATIONS = 'conversations',
  SETTINGS = 'settings',
  USERS = 'users',
  ROLES = 'roles',
  AUDIT = 'audit',
  REPORTS = 'reports',
  SYSTEM = 'system',
}

export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  EXPORT = 'export',
  IMPORT = 'import',
  MANAGE = 'manage',
}

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string; // e.g., 'customers:read', 'orders:create', 'settings:manage'

  @Column()
  displayName: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: PermissionModule,
  })
  module: PermissionModule;

  @Column({
    type: 'enum',
    enum: PermissionAction,
  })
  action: PermissionAction;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isSystem: boolean; // System permissions cannot be deleted

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
