import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MenuItem } from './menu-item.entity';

export enum PreparationArea {
  KITCHEN = 'kitchen',
  BAR = 'bar',
  BOTH = 'both',
}

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  name: string;

  @Column({ length: 100, unique: true })
  slug: string; // Para URL amigable: "platos-principales"

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ nullable: true })
  icon?: string; // Nombre del icono (ej: "utensils", "coffee", "cake")

  @Column({
    type: 'enum',
    enum: PreparationArea,
    default: PreparationArea.KITCHEN,
  })
  preparation_area: PreparationArea;

  @Column({ default: 0 })
  display_order: number; // Para ordenar las categorías

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => MenuItem, (menuItem) => menuItem.category_ref)
  menu_items: MenuItem[];
}
