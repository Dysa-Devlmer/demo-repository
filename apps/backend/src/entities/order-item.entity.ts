import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  JoinColumn,
} from "typeorm";
import { Order } from "./order.entity";
import { MenuItem } from "./menu-item.entity";

@Entity("order_items")
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.items, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "order_id" })
  order: Order;

  @ManyToOne(() => MenuItem, { eager: true })
  @JoinColumn({ name: "menu_item_id" })
  menuItem: MenuItem;

  @Column({ type: "int" })
  quantity: number;

  @Column({ type: "numeric", precision: 10, scale: 2 })
  price: number;
}
