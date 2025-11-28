import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from "typeorm";
import { Role } from "./role.entity";
import { AuditLog } from "./audit-log.entity";
import { Notification } from "../../entities/notification.entity";

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
  PENDING = "pending",
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({
    type: "enum",
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ default: false })
  isTwoFactorEnabled: boolean;

  @Column({ nullable: true })
  twoFactorSecret: string;

  @Column({ type: 'simple-array', nullable: true })
  twoFactorBackupCodes: string[];

  // Alias for consistency
  get twoFactorEnabled(): boolean {
    return this.isTwoFactorEnabled;
  }

  set twoFactorEnabled(value: boolean) {
    this.isTwoFactorEnabled = value;
  }

  @Column({ nullable: true })
  lastLoginAt: Date;

  @Column({ nullable: true })
  lastLoginIp: string;

  @Column({ default: 0 })
  failedLoginAttempts: number;

  @Column({ nullable: true })
  accountLockedUntil: Date;

  @Column({ nullable: true })
  passwordResetToken: string;

  @Column({ nullable: true })
  passwordResetExpires: Date;

  @Column({ nullable: true })
  emailVerificationToken: string;

  // Legacy role field for backward compatibility
  @Column({ default: "user" })
  role: "user" | "admin";

  @ManyToMany(() => Role, (role) => role.users, { eager: true })
  @JoinTable({
    name: "user_roles",
    joinColumn: { name: "userId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "roleId", referencedColumnName: "id" },
  })
  roles: Role[];

  @OneToMany(() => AuditLog, (log) => log.user)
  auditLogs: AuditLog[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  // Aliases for snake_case compatibility with frontend
  get first_name(): string {
    return this.firstName;
  }

  get last_name(): string {
    return this.lastName;
  }

  get created_at(): Date {
    return this.createdAt;
  }

  get updated_at(): Date {
    return this.updatedAt;
  }

  hasRole(roleName: string): boolean {
    return this.roles?.some((role) => role.name === roleName) || false;
  }

  hasPermission(permission: string): boolean {
    return (
      this.roles?.some((role) =>
        role.permissions?.some((p) => p.name === permission),
      ) || false
    );
  }

  isAccountLocked(): boolean {
    return this.accountLockedUntil && this.accountLockedUntil > new Date();
  }
}
