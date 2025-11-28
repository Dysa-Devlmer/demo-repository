import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Customer } from '../entities/customer.entity';
import { MenuItem } from '../entities/menu-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

describe('OrdersService - Unit Tests', () => {
  let service: OrdersService;
  let ordersRepo: Repository<Order>;
  let orderItemsRepo: Repository<OrderItem>;
  let customersRepo: Repository<Customer>;
  let menuRepo: Repository<MenuItem>;

  const mockCustomer: Partial<Customer> = {
    id: 1,
    name: 'Juan Pérez',
    email: 'juan@example.com',
    phone: '+1234567890',
  };

  const mockMenuItem1: Partial<MenuItem> = {
    id: 1,
    name: 'Paella Valenciana',
    price: 18.50,
    category: 'Arroces',
    available: true,
  };

  const mockMenuItem2: Partial<MenuItem> = {
    id: 2,
    name: 'Pulpo a la Gallega',
    price: 22.00,
    category: 'Mariscos',
    available: true,
  };

  const mockOrder: Partial<Order> = {
    id: 1,
    order_number: 'ORDER-1640000000000',
    customer_name: 'Juan Pérez',
    customer_phone: '+1234567890',
    customer_email: 'juan@example.com',
    order_type: 'delivery',
    status: 'pending',
    items: [
      { menuItemId: 1, quantity: 2 },
      { menuItemId: 2, quantity: 1 },
    ],
    subtotal: 59.00,
    tax: 0,
    tip: 0,
    total: 59.00,
    delivery_address: '',
    notes: '',
    payment_status: 'pending',
    whatsapp_notified: false,
    email_notified: false,
    sms_notified: false,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(OrderItem),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Customer),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(MenuItem),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    ordersRepo = module.get<Repository<Order>>(getRepositoryToken(Order));
    orderItemsRepo = module.get<Repository<OrderItem>>(getRepositoryToken(OrderItem));
    customersRepo = module.get<Repository<Customer>>(getRepositoryToken(Customer));
    menuRepo = module.get<Repository<MenuItem>>(getRepositoryToken(MenuItem));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have all repositories injected', () => {
      expect(ordersRepo).toBeDefined();
      expect(orderItemsRepo).toBeDefined();
      expect(customersRepo).toBeDefined();
      expect(menuRepo).toBeDefined();
    });
  });

  describe('create', () => {
    const createOrderDto: CreateOrderDto = {
      customerId: 1,
      items: [
        { menuItemId: 1, quantity: 2 },
        { menuItemId: 2, quantity: 1 },
      ],
    };

    it('should create an order successfully', async () => {
      jest.spyOn(customersRepo, 'findOne').mockResolvedValue(mockCustomer as Customer);
      jest.spyOn(menuRepo, 'findOne')
        .mockResolvedValueOnce(mockMenuItem1 as MenuItem)
        .mockResolvedValueOnce(mockMenuItem2 as MenuItem);
      jest.spyOn(orderItemsRepo, 'create')
        .mockReturnValueOnce({ menuItem: mockMenuItem1, quantity: 2, price: 18.50 } as OrderItem)
        .mockReturnValueOnce({ menuItem: mockMenuItem2, quantity: 1, price: 22.00 } as OrderItem);
      jest.spyOn(ordersRepo, 'create').mockReturnValue(mockOrder as Order);
      jest.spyOn(ordersRepo, 'save').mockResolvedValue(mockOrder as Order);

      const result = await service.create(createOrderDto);

      expect(result).toBeDefined();
      expect(customersRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(menuRepo.findOne).toHaveBeenCalledTimes(2);
      expect(ordersRepo.create).toHaveBeenCalled();
      expect(ordersRepo.save).toHaveBeenCalled();
    });

    it('should calculate total correctly', async () => {
      jest.spyOn(customersRepo, 'findOne').mockResolvedValue(mockCustomer as Customer);
      jest.spyOn(menuRepo, 'findOne')
        .mockResolvedValueOnce(mockMenuItem1 as MenuItem)
        .mockResolvedValueOnce(mockMenuItem2 as MenuItem);
      jest.spyOn(orderItemsRepo, 'create')
        .mockReturnValueOnce({ menuItem: mockMenuItem1, quantity: 2, price: 18.50 } as OrderItem)
        .mockReturnValueOnce({ menuItem: mockMenuItem2, quantity: 1, price: 22.00 } as OrderItem);
      jest.spyOn(ordersRepo, 'create').mockReturnValue(mockOrder as Order);
      jest.spyOn(ordersRepo, 'save').mockResolvedValue(mockOrder as Order);

      await service.create(createOrderDto);

      const createCallArgs = (ordersRepo.create as jest.Mock).mock.calls[0][0];

      // 2 × 18.50 + 1 × 22.00 = 37.00 + 22.00 = 59.00
      expect(createCallArgs.subtotal).toBe(59.00);
      expect(createCallArgs.total).toBe(59.00);
    });

    it('should generate unique order number', async () => {
      jest.spyOn(customersRepo, 'findOne').mockResolvedValue(mockCustomer as Customer);
      jest.spyOn(menuRepo, 'findOne')
        .mockResolvedValueOnce(mockMenuItem1 as MenuItem)
        .mockResolvedValueOnce(mockMenuItem2 as MenuItem);
      jest.spyOn(orderItemsRepo, 'create').mockReturnValue({} as OrderItem);
      jest.spyOn(ordersRepo, 'create').mockReturnValue(mockOrder as Order);
      jest.spyOn(ordersRepo, 'save').mockResolvedValue(mockOrder as Order);

      await service.create(createOrderDto);

      const createCallArgs = (ordersRepo.create as jest.Mock).mock.calls[0][0];
      expect(createCallArgs.order_number).toMatch(/^ORDER-\d+$/);
    });

    it('should set default status to pending', async () => {
      jest.spyOn(customersRepo, 'findOne').mockResolvedValue(mockCustomer as Customer);
      jest.spyOn(menuRepo, 'findOne')
        .mockResolvedValueOnce(mockMenuItem1 as MenuItem)
        .mockResolvedValueOnce(mockMenuItem2 as MenuItem);
      jest.spyOn(orderItemsRepo, 'create').mockReturnValue({} as OrderItem);
      jest.spyOn(ordersRepo, 'create').mockReturnValue(mockOrder as Order);
      jest.spyOn(ordersRepo, 'save').mockResolvedValue(mockOrder as Order);

      await service.create(createOrderDto);

      const createCallArgs = (ordersRepo.create as jest.Mock).mock.calls[0][0];
      expect(createCallArgs.status).toBe('pending');
    });

    it('should include customer information', async () => {
      jest.spyOn(customersRepo, 'findOne').mockResolvedValue(mockCustomer as Customer);
      jest.spyOn(menuRepo, 'findOne')
        .mockResolvedValueOnce(mockMenuItem1 as MenuItem)
        .mockResolvedValueOnce(mockMenuItem2 as MenuItem);
      jest.spyOn(orderItemsRepo, 'create').mockReturnValue({} as OrderItem);
      jest.spyOn(ordersRepo, 'create').mockReturnValue(mockOrder as Order);
      jest.spyOn(ordersRepo, 'save').mockResolvedValue(mockOrder as Order);

      await service.create(createOrderDto);

      const createCallArgs = (ordersRepo.create as jest.Mock).mock.calls[0][0];
      expect(createCallArgs.customer_name).toBe('Juan Pérez');
      expect(createCallArgs.customer_phone).toBe('+1234567890');
      expect(createCallArgs.customer_email).toBe('juan@example.com');
    });

    it('should throw BadRequestException when customer not found', async () => {
      jest.spyOn(customersRepo, 'findOne').mockResolvedValue(null);

      await expect(service.create(createOrderDto)).rejects.toThrow(
        new BadRequestException('Customer with ID 1 not found'),
      );
    });

    it('should throw BadRequestException when menu item not found', async () => {
      jest.spyOn(customersRepo, 'findOne').mockResolvedValue(mockCustomer as Customer);
      jest.spyOn(menuRepo, 'findOne').mockResolvedValue(null);

      await expect(service.create(createOrderDto)).rejects.toThrow(
        new BadRequestException('Menu item with ID 1 not found'),
      );
    });

    it('should handle multiple quantities correctly', async () => {
      const multiQuantityDto: CreateOrderDto = {
        customerId: 1,
        items: [{ menuItemId: 1, quantity: 5 }],
      };

      jest.spyOn(customersRepo, 'findOne').mockResolvedValue(mockCustomer as Customer);
      jest.spyOn(menuRepo, 'findOne').mockResolvedValue(mockMenuItem1 as MenuItem);
      jest.spyOn(orderItemsRepo, 'create').mockReturnValue({} as OrderItem);
      jest.spyOn(ordersRepo, 'create').mockReturnValue(mockOrder as Order);
      jest.spyOn(ordersRepo, 'save').mockResolvedValue(mockOrder as Order);

      await service.create(multiQuantityDto);

      const createCallArgs = (ordersRepo.create as jest.Mock).mock.calls[0][0];
      // 5 × 18.50 = 92.50
      expect(createCallArgs.total).toBe(92.50);
    });

    it('should create order items for each menu item', async () => {
      jest.spyOn(customersRepo, 'findOne').mockResolvedValue(mockCustomer as Customer);
      jest.spyOn(menuRepo, 'findOne')
        .mockResolvedValueOnce(mockMenuItem1 as MenuItem)
        .mockResolvedValueOnce(mockMenuItem2 as MenuItem);
      jest.spyOn(orderItemsRepo, 'create').mockReturnValue({} as OrderItem);
      jest.spyOn(ordersRepo, 'create').mockReturnValue(mockOrder as Order);
      jest.spyOn(ordersRepo, 'save').mockResolvedValue(mockOrder as Order);

      await service.create(createOrderDto);

      expect(orderItemsRepo.create).toHaveBeenCalledTimes(2);
      expect(orderItemsRepo.create).toHaveBeenCalledWith({
        menuItem: mockMenuItem1,
        quantity: 2,
        price: 18.50,
      });
      expect(orderItemsRepo.create).toHaveBeenCalledWith({
        menuItem: mockMenuItem2,
        quantity: 1,
        price: 22.00,
      });
    });
  });

  describe('findAll', () => {
    it('should return all orders', async () => {
      const mockOrders = [mockOrder, { ...mockOrder, id: 2 }];
      jest.spyOn(ordersRepo, 'find').mockResolvedValue(mockOrders as Order[]);

      const result = await service.findAll();

      expect(result).toEqual(mockOrders);
      expect(ordersRepo.find).toHaveBeenCalled();
    });

    it('should return empty array when no orders', async () => {
      jest.spyOn(ordersRepo, 'find').mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return order by id', async () => {
      jest.spyOn(ordersRepo, 'findOne').mockResolvedValue(mockOrder as Order);

      const result = await service.findOne(1);

      expect(result).toEqual(mockOrder);
      expect(ordersRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException when order not found', async () => {
      jest.spyOn(ordersRepo, 'findOne').mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(
        new NotFoundException('Order 999 not found'),
      );
    });
  });

  describe('update', () => {
    const updateOrderDto: UpdateOrderDto = {
      status: 'confirmed',
      delivery_address: 'Calle Principal 123, Madrid',
      notes: 'Sin cebolla, por favor',
    };

    it('should update order successfully', async () => {
      const updatedOrder = { ...mockOrder, ...updateOrderDto };
      jest.spyOn(ordersRepo, 'findOne').mockResolvedValue(mockOrder as Order);
      jest.spyOn(ordersRepo, 'save').mockResolvedValue(updatedOrder as Order);

      const result = await service.update(1, updateOrderDto);

      expect(result).toEqual(updatedOrder);
      expect(ordersRepo.save).toHaveBeenCalled();
    });

    it('should update status to confirmed', async () => {
      jest.spyOn(ordersRepo, 'findOne').mockResolvedValue(mockOrder as Order);
      jest.spyOn(ordersRepo, 'save').mockResolvedValue({ ...mockOrder, status: 'confirmed' } as Order);

      const result = await service.update(1, { status: 'confirmed' });

      expect(result.status).toBe('confirmed');
    });

    it('should update status to preparing', async () => {
      jest.spyOn(ordersRepo, 'findOne').mockResolvedValue(mockOrder as Order);
      jest.spyOn(ordersRepo, 'save').mockResolvedValue({ ...mockOrder, status: 'preparing' } as Order);

      const result = await service.update(1, { status: 'preparing' });

      expect(result.status).toBe('preparing');
    });

    it('should update status to ready', async () => {
      jest.spyOn(ordersRepo, 'findOne').mockResolvedValue(mockOrder as Order);
      jest.spyOn(ordersRepo, 'save').mockResolvedValue({ ...mockOrder, status: 'ready' } as Order);

      const result = await service.update(1, { status: 'ready' });

      expect(result.status).toBe('ready');
    });

    it('should update status to delivered', async () => {
      jest.spyOn(ordersRepo, 'findOne').mockResolvedValue(mockOrder as Order);
      jest.spyOn(ordersRepo, 'save').mockResolvedValue({ ...mockOrder, status: 'delivered' } as Order);

      const result = await service.update(1, { status: 'delivered' });

      expect(result.status).toBe('delivered');
    });

    it('should update status to cancelled', async () => {
      jest.spyOn(ordersRepo, 'findOne').mockResolvedValue(mockOrder as Order);
      jest.spyOn(ordersRepo, 'save').mockResolvedValue({ ...mockOrder, status: 'cancelled' } as Order);

      const result = await service.update(1, { status: 'cancelled' });

      expect(result.status).toBe('cancelled');
    });

    it('should update delivery address', async () => {
      jest.spyOn(ordersRepo, 'findOne').mockResolvedValue(mockOrder as Order);
      jest.spyOn(ordersRepo, 'save').mockResolvedValue({
        ...mockOrder,
        delivery_address: 'Nueva dirección',
      } as Order);

      const result = await service.update(1, { delivery_address: 'Nueva dirección' });

      expect(result.delivery_address).toBe('Nueva dirección');
    });

    it('should update notes', async () => {
      jest.spyOn(ordersRepo, 'findOne').mockResolvedValue(mockOrder as Order);
      jest.spyOn(ordersRepo, 'save').mockResolvedValue({
        ...mockOrder,
        notes: 'Sin picante',
      } as Order);

      const result = await service.update(1, { notes: 'Sin picante' });

      expect(result.notes).toBe('Sin picante');
    });

    it('should throw NotFoundException when order not found', async () => {
      jest.spyOn(ordersRepo, 'findOne').mockResolvedValue(null);

      await expect(service.update(999, updateOrderDto)).rejects.toThrow(
        new NotFoundException('Order 999 not found'),
      );
    });

    it('should update multiple fields at once', async () => {
      const multiUpdateDto: UpdateOrderDto = {
        status: 'confirmed',
        delivery_address: 'Calle Nueva 456',
        notes: 'Llamar al llegar',
      };

      jest.spyOn(ordersRepo, 'findOne').mockResolvedValue(mockOrder as Order);
      jest.spyOn(ordersRepo, 'save').mockResolvedValue({
        ...mockOrder,
        ...multiUpdateDto,
      } as Order);

      const result = await service.update(1, multiUpdateDto);

      expect(result.status).toBe('confirmed');
      expect(result.delivery_address).toBe('Calle Nueva 456');
      expect(result.notes).toBe('Llamar al llegar');
    });
  });

  describe('remove', () => {
    it('should remove order successfully', async () => {
      jest.spyOn(ordersRepo, 'findOne').mockResolvedValue(mockOrder as Order);
      jest.spyOn(ordersRepo, 'remove').mockResolvedValue(mockOrder as Order);

      await service.remove(1);

      expect(ordersRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(ordersRepo.remove).toHaveBeenCalledWith(mockOrder);
    });

    it('should throw NotFoundException when order not found', async () => {
      jest.spyOn(ordersRepo, 'findOne').mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(
        new NotFoundException('Order 999 not found'),
      );
    });
  });

  describe('Order Lifecycle', () => {
    it('should follow complete order lifecycle: pending → confirmed → preparing → ready → delivered', async () => {
      let currentOrder = { ...mockOrder };
      jest.spyOn(ordersRepo, 'findOne').mockImplementation(async () => currentOrder as Order);
      jest.spyOn(ordersRepo, 'save').mockImplementation(async (order) => {
        currentOrder = { ...currentOrder, ...order };
        return currentOrder as Order;
      });

      // pending → confirmed
      let result = await service.update(1, { status: 'confirmed' });
      expect(result.status).toBe('confirmed');

      // confirmed → preparing
      result = await service.update(1, { status: 'preparing' });
      expect(result.status).toBe('preparing');

      // preparing → ready
      result = await service.update(1, { status: 'ready' });
      expect(result.status).toBe('ready');

      // ready → delivered
      result = await service.update(1, { status: 'delivered' });
      expect(result.status).toBe('delivered');
    });

    it('should allow cancellation at any stage', async () => {
      jest.spyOn(ordersRepo, 'findOne').mockResolvedValue(mockOrder as Order);
      jest.spyOn(ordersRepo, 'save').mockResolvedValue({ ...mockOrder, status: 'cancelled' } as Order);

      const result = await service.update(1, { status: 'cancelled' });

      expect(result.status).toBe('cancelled');
    });
  });

  describe('Edge Cases', () => {
    it('should handle order with single item', async () => {
      const singleItemDto: CreateOrderDto = {
        customerId: 1,
        items: [{ menuItemId: 1, quantity: 1 }],
      };

      jest.spyOn(customersRepo, 'findOne').mockResolvedValue(mockCustomer as Customer);
      jest.spyOn(menuRepo, 'findOne').mockResolvedValue(mockMenuItem1 as MenuItem);
      jest.spyOn(orderItemsRepo, 'create').mockReturnValue({} as OrderItem);
      jest.spyOn(ordersRepo, 'create').mockReturnValue(mockOrder as Order);
      jest.spyOn(ordersRepo, 'save').mockResolvedValue(mockOrder as Order);

      const result = await service.create(singleItemDto);

      expect(result).toBeDefined();
      expect(orderItemsRepo.create).toHaveBeenCalledTimes(1);
    });

    it('should handle order with many items', async () => {
      const manyItemsDto: CreateOrderDto = {
        customerId: 1,
        items: [
          { menuItemId: 1, quantity: 3 },
          { menuItemId: 2, quantity: 2 },
          { menuItemId: 1, quantity: 1 },
        ],
      };

      jest.spyOn(customersRepo, 'findOne').mockResolvedValue(mockCustomer as Customer);
      jest.spyOn(menuRepo, 'findOne').mockResolvedValue(mockMenuItem1 as MenuItem);
      jest.spyOn(orderItemsRepo, 'create').mockReturnValue({} as OrderItem);
      jest.spyOn(ordersRepo, 'create').mockReturnValue(mockOrder as Order);
      jest.spyOn(ordersRepo, 'save').mockResolvedValue(mockOrder as Order);

      const result = await service.create(manyItemsDto);

      expect(result).toBeDefined();
      expect(orderItemsRepo.create).toHaveBeenCalledTimes(3);
    });

    it('should handle decimal prices correctly', async () => {
      const decimalMenuItem: Partial<MenuItem> = {
        id: 3,
        name: 'Café',
        price: 2.75,
      };

      const dto: CreateOrderDto = {
        customerId: 1,
        items: [{ menuItemId: 3, quantity: 3 }],
      };

      jest.spyOn(customersRepo, 'findOne').mockResolvedValue(mockCustomer as Customer);
      jest.spyOn(menuRepo, 'findOne').mockResolvedValue(decimalMenuItem as MenuItem);
      jest.spyOn(orderItemsRepo, 'create').mockReturnValue({} as OrderItem);
      jest.spyOn(ordersRepo, 'create').mockReturnValue(mockOrder as Order);
      jest.spyOn(ordersRepo, 'save').mockResolvedValue(mockOrder as Order);

      await service.create(dto);

      const createCallArgs = (ordersRepo.create as jest.Mock).mock.calls[0][0];
      // 3 × 2.75 = 8.25
      expect(createCallArgs.total).toBe(8.25);
    });
  });
});
