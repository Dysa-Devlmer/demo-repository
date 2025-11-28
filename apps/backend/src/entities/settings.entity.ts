import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

export enum SettingType {
  SYSTEM = "system",
  WHATSAPP = "whatsapp",
  PAYMENT = "payment",
  NOTIFICATION = "notification",
  RESTAURANT = "restaurant",
}

@Entity("settings")
export class Settings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100 })
  key: string;

  @Column({ type: "text" })
  value: string;

  @Column({
    type: "enum",
    enum: SettingType,
    default: SettingType.SYSTEM,
  })
  type: SettingType;

  @Column({ nullable: true })
  description?: string;

  @Column({ default: true })
  is_public: boolean; // Si puede ser accedido desde el frontend

  @Column({ default: false })
  is_encrypted: boolean; // Para credenciales sensibles

  @Column({ type: "jsonb", nullable: true })
  metadata?: {
    default_value?: string;
    options?: string[];
    validation_rules?: string;
    ui_component?: "text" | "password" | "select" | "textarea" | "boolean";
    category?: string;
    sort_order?: number;
  };

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
