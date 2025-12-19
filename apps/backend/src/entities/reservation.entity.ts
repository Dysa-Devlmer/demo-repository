import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Customer } from './customer.entity';
import { Table } from './table.entity';

export enum ReservationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SEATED = 'seated',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export enum TableSection {
  INDOOR = 'indoor',
  OUTDOOR = 'outdoor',
  PRIVATE = 'private',
  BAR = 'bar',
}

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, name: 'reservation_code', nullable: true })
  reservation_code: string;

  @ManyToOne(() => Customer, (customer) => customer.reservations, {
    onDelete: 'CASCADE',
    eager: false,
  })
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @ManyToOne(() => Table, (table) => table.reservations, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'table_id' })
  table?: Table;

  @Column({ type: 'timestamp without time zone', name: 'reservationDate' })
  reservation_date: Date;

  @Column({ name: 'customerName' })
  customer_name: string;

  @Column({ name: 'customerPhone' })
  customer_phone: string;

  @Column({ name: 'customerEmail', nullable: true })
  customer_email?: string;

  @Column({ type: 'int', name: 'partySize' })
  party_size: number;

  @Column({ nullable: true })
  time?: string;

  @Column({ nullable: true })
  section?: string;

  @Column({ type: 'int', nullable: true })
  table_number?: number;

  @Column({ nullable: true })
  occasion?: string;

  @Column({ name: 'status' })
  status: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'json', name: 'specialRequests', nullable: true })
  special_requests?: any;

  @CreateDateColumn({
    name: 'createdAt',
    type: 'timestamp without time zone',
    default: () => 'LOCALTIMESTAMP',
  })
  created_at: Date;

  @UpdateDateColumn({
    name: 'updatedAt',
    type: 'timestamp without time zone',
    default: () => 'LOCALTIMESTAMP',
  })
  updated_at: Date;
}
