import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'alerts_inbox' })
export class AlertInboxEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @Index()
  @Column({ type: 'text' })
  source!: string;

  @Index()
  @Column({ type: 'text' })
  status!: string;

  @Index()
  @Column({ type: 'text' })
  alertname!: string;

  @Column({ type: 'text', nullable: true })
  severity!: string | null;

  @Column({ type: 'text', nullable: true })
  instance!: string | null;

  @Column({ type: 'text', nullable: true })
  job!: string | null;

  @Column({ type: 'jsonb' })
  payload!: any;

  @Index()
  @Column({ type: 'text' })
  fingerprint!: string;
}
