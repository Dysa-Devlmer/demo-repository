import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from "typeorm";
import { OrderItem } from "./order-item.entity";
import { Category, PreparationArea } from "./category.entity";

export enum MenuCategory {
  APPETIZER = "appetizer",
  MAIN_COURSE = "main_course",
  DESSERT = "dessert",
  BEVERAGE = "beverage",
  SPECIAL = "special",
}

export enum DietaryType {
  REGULAR = "regular",
  VEGETARIAN = "vegetarian",
  VEGAN = "vegan",
  GLUTEN_FREE = "gluten_free",
  KETO = "keto",
}

@Entity("menu_items")
export class MenuItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column("decimal", { precision: 8, scale: 2 })
  price: number;

  @Column({
    type: "enum",
    enum: MenuCategory,
    default: MenuCategory.MAIN_COURSE,
  })
  category: MenuCategory;

  @Column({
    type: "enum",
    enum: DietaryType,
    default: DietaryType.REGULAR,
  })
  dietary_type: DietaryType;

  @Column({ nullable: true })
  image?: string;

  @Column({ type: "simple-array", nullable: true })
  ingredients?: string[];

  @Column({ type: "simple-array", nullable: true })
  allergens?: string[];

  @Column({ nullable: true })
  preparationTime?: number; // minutes

  @Column({ default: true })
  available: boolean;

  // ========== NUEVOS CAMPOS PARA SISTEMA PROFESIONAL ==========

  // Área de preparación: cocina, barra o ambas
  @Column({
    type: "enum",
    enum: ["kitchen", "bar", "both"],
    enumName: "preparation_area_enum",
    default: "kitchen",
    nullable: true, // Nullable para compatibilidad con datos existentes
  })
  preparation_area?: PreparationArea;

  // Relación con la nueva tabla de categorías dinámicas
  @Column({ nullable: true })
  category_id?: number;

  @ManyToOne(() => Category, (category) => category.menu_items, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "category_id" })
  category_ref?: Category;

  // ========== FIN NUEVOS CAMPOS ==========

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // TODO: Agregar soft delete cuando se ejecute la migración
  // @DeleteDateColumn()
  // deletedAt?: Date;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.menuItem)
  order_items: OrderItem[];
}
