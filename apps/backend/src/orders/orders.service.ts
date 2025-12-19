import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Customer } from '../entities/customer.entity';
import { MenuItem } from '../entities/menu-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderStatus } from '../entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly ordersRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemsRepo: Repository<OrderItem>,
    @InjectRepository(Customer)
    private readonly customersRepo: Repository<Customer>,
    @InjectRepository(MenuItem) private readonly menuRepo: Repository<MenuItem>
  ) {}

  async create(dto: CreateOrderDto): Promise<Order> {
    const customer = await this.customersRepo.findOne({
      where: { id: dto.customerId },
    });
    if (!customer) {
      throw new BadRequestException(`Customer with ID ${dto.customerId} not found`);
    }

    const items: OrderItem[] = [];
    const itemsSnapshot: any[] = [];
    let total = 0;

    for (const item of dto.items) {
      const menuItem = await this.menuRepo.findOne({
        where: { id: item.menuItemId },
      });
      if (!menuItem) {
        throw new BadRequestException(`Menu item with ID ${item.menuItemId} not found`);
      }

      const orderItem = this.orderItemsRepo.create({
        menuItem,
        quantity: item.quantity,
        price: menuItem.price,
      });

      // Crear snapshot con información completa del item
      itemsSnapshot.push({
        id: menuItem.id,
        name: menuItem.name,
        description: menuItem.description || '',
        price: Number(menuItem.price),
        quantity: item.quantity,
        category: menuItem.category || '',
        image_url: menuItem.image || null,
      });

      total += Number(menuItem.price) * item.quantity;
      items.push(orderItem);
    }

    const tax = dto.tax || 0;
    const tip = dto.tip || 0;
    const finalTotal = total + tax + tip;

    // Generar número de orden corto y profesional (5 dígitos)
    const timestamp = Date.now();
    const shortNumber = String(timestamp).slice(-5);

    const order = this.ordersRepo.create({
      order_number: `ORDER-${shortNumber}`,
      customer_name: customer.name,
      customer_phone: customer.phone || '',
      customer_email: customer.email,
      order_type: dto.orderType || 'dine-in',
      status: 'pending',
      items: itemsSnapshot,
      subtotal: total,
      tax: tax,
      tip: tip,
      total: finalTotal,
      delivery_address: dto.deliveryAddress || '',
      notes: dto.notes || '',
    });

    return this.ordersRepo.save(order);
  }

  async findAll(): Promise<Order[]> {
    return this.ordersRepo.find();
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.ordersRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return order;
  }

  async update(id: number, dto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);
    Object.assign(order, dto);
    return this.ordersRepo.save(order);
  }

  async remove(id: number): Promise<void> {
    const order = await this.findOne(id);
    await this.ordersRepo.remove(order);
  }

  async migrateOrderItems(): Promise<{ total: number; migrated: number; errors: number }> {
    console.log('🔄 Iniciando migración de items de órdenes...');

    const orders = await this.ordersRepo.find();
    console.log(`📦 Encontradas ${orders.length} órdenes`);

    let migratedCount = 0;
    let errorCount = 0;

    for (const order of orders) {
      try {
        if (!order.items || order.items.length === 0) {
          continue;
        }

        const firstItem = order.items[0];
        // Si ya tiene 'name', no necesita migración
        if (firstItem.name) {
          continue;
        }

        // Si tiene menuItemId, necesita migración
        if (!firstItem.menuItemId) {
          console.log(`⚠️  Orden ${order.id}: Items sin menuItemId, saltando...`);
          continue;
        }

        console.log(`🔧 Migrando orden ${order.id}...`);

        const migratedItems: any[] = [];
        for (const item of order.items as any[]) {
          const menuItem = await this.menuRepo.findOne({
            where: { id: item.menuItemId },
          });

          if (!menuItem) {
            console.log(`❌ Orden ${order.id}: No se encontró menu item ${item.menuItemId}`);
            migratedItems.push({
              id: item.menuItemId,
              name: `Item #${item.menuItemId}`,
              description: 'Producto no disponible',
              price: 0,
              quantity: item.quantity,
              category: '',
              image_url: null,
            });
            continue;
          }

          migratedItems.push({
            id: menuItem.id,
            name: menuItem.name,
            description: menuItem.description || '',
            price: Number(menuItem.price),
            quantity: item.quantity,
            category: menuItem.category || '',
            image_url: menuItem.image || null,
          });
        }

        order.items = migratedItems as any;
        await this.ordersRepo.save(order);

        migratedCount++;
        console.log(`✅ Orden ${order.id} migrada exitosamente`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Error migrando orden ${order.id}:`, error.message);
      }
    }

    const result = {
      total: orders.length,
      migrated: migratedCount,
      errors: errorCount,
      unchanged: orders.length - migratedCount - errorCount,
    };

    console.log('\n📊 Resumen de migración:', result);
    return result;
  }
}
