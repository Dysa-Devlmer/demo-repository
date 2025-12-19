import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Reservation } from './reservation.entity';

export enum TableStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  OUT_OF_SERVICE = 'out_of_service',
}

export enum TableSection {
  INDOOR = 'indoor',
  OUTDOOR = 'outdoor',
  PRIVATE = 'private',
  BAR = 'bar',
  VIP = 'vip',
}

@Entity('tables')
export class Table {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 20 })
  table_number: string;

  @Column({ type: 'int' })
  capacity: number;

  @Column({ type: 'int', default: 2 })
  min_capacity: number;

  @Column({
    type: 'enum',
    enum: TableStatus,
    default: TableStatus.AVAILABLE,
  })
  status: TableStatus;

  @Column({
    type: 'enum',
    enum: TableSection,
    default: TableSection.INDOOR,
  })
  section: TableSection;

  @Column({ nullable: true })
  location_description?: string; // "Junto a la ventana", "Cerca del bar"

  @Column({ default: false })
  is_accessible: boolean; // Accesible para discapacitados

  @Column({ default: false })
  has_view: boolean;

  @Column({ default: false })
  is_quiet: boolean;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  x_position?: number; // Para representación visual

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  y_position?: number; // Para representación visual

  @Column({ type: 'jsonb', nullable: true })
  amenities?: {
    has_power_outlet?: boolean;
    has_high_chair?: boolean;
    is_round_table?: boolean;
    special_features?: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    last_cleaned?: Date;
    maintenance_notes?: string;
    reservation_preferences?: string[];
  };

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Reservation, (reservation) => reservation.table)
  reservations: Reservation[];
}
