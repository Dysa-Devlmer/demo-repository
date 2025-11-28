import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Index,
} from "typeorm";
import { Setting } from "./setting.entity";

export enum SettingChangeAction {
  CREATED = "created",
  UPDATED = "updated",
  DELETED = "deleted",
  ACTIVATED = "activated",
  ARCHIVED = "archived",
}

@Entity("setting_history")
@Index(["setting_id", "created_at"])
export class SettingHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  setting_id: number;

  @ManyToOne(() => Setting, { onDelete: "CASCADE" })
  @JoinColumn({ name: "setting_id" })
  setting: Setting;

  @Column({
    type: "enum",
    enum: SettingChangeAction,
  })
  action: SettingChangeAction;

  @Column({ type: "text", nullable: true })
  old_value?: string;

  @Column({ type: "text", nullable: true })
  new_value?: string;

  @Column({ nullable: true })
  changed_by?: string; // user email or "system"

  @Column({ nullable: true })
  reason?: string; // Motivo del cambio

  @Column({ type: "jsonb", nullable: true })
  metadata?: {
    ip_address?: string;
    user_agent?: string;
    session_id?: string;
  };

  @CreateDateColumn()
  created_at: Date;
}
