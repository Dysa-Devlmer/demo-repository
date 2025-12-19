import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// Mock data para las APIs
const mockReservations = [
  {
    id: 1,
    customerName: 'Juan Pérez',
    date: '2025-01-15',
    time: '19:00',
    guests: 4,
    status: 'confirmed',
  },
  {
    id: 2,
    customerName: 'María García',
    date: '2025-01-16',
    time: '20:30',
    guests: 2,
    status: 'pending',
  },
  {
    id: 3,
    customerName: 'Carlos López',
    date: '2025-01-17',
    time: '18:00',
    guests: 6,
    status: 'confirmed',
  },
];

const mockSettings = {
  restaurantName: 'Mi Restaurante',
  address: 'Calle Principal 123',
  phone: '+1234567890',
  email: 'info@mirestaurante.com',
  openHours: '10:00 - 22:00',
  timezone: 'America/Santiago',
};

const mockCustomers = [
  { id: 1, name: 'Ana Martínez', email: 'ana@email.com', phone: '+56912345678', visits: 5 },
  { id: 2, name: 'Pedro Rodríguez', email: 'pedro@email.com', phone: '+56987654321', visits: 3 },
  { id: 3, name: 'Lucía Fernández', email: 'lucia@email.com', phone: '+56955555555', visits: 8 },
];

const mockOrders = [
  {
    id: 1,
    customerId: 1,
    items: ['Pizza Margherita', 'Coca Cola'],
    total: 15500,
    status: 'completed',
  },
  { id: 2, customerId: 2, items: ['Hamburguesa', 'Papas Fritas'], total: 12000, status: 'pending' },
  { id: 3, customerId: 3, items: ['Ensalada César', 'Agua'], total: 8500, status: 'completed' },
];

const mockMenu = [
  {
    id: 1,
    name: 'Pizza Margherita',
    description: 'Pizza clásica con tomate y mozzarella',
    price: 12000,
    category: 'Pizzas',
  },
  {
    id: 2,
    name: 'Hamburguesa Premium',
    description: 'Hamburguesa con carne angus',
    price: 15000,
    category: 'Hamburguesas',
  },
  {
    id: 3,
    name: 'Ensalada César',
    description: 'Ensalada fresca con pollo',
    price: 8500,
    category: 'Ensaladas',
  },
];

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar CORS
  app.enableCors({
    origin: ['http://localhost:8001', 'http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  // Pipes globales
  app.useGlobalPipes(new ValidationPipe());

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('ChatBotDysa API')
    .setDescription('API para gestión de restaurante')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // Mock endpoints para que el frontend funcione
  const express = app.getHttpAdapter().getInstance();

  // Health check
  express.get('/health', (req: any, res: any) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'ChatBotDysa Backend Mock',
      version: '1.0.0',
    });
  });

  // Reservations endpoints
  express.get('/api/reservations', (req: any, res: any) => {
    res.json(mockReservations);
  });

  express.post('/api/reservations', (req: any, res: any) => {
    const newReservation = {
      id: mockReservations.length + 1,
      ...req.body,
      status: 'pending',
    };
    mockReservations.push(newReservation);
    res.status(201).json(newReservation);
  });

  express.put('/api/reservations/:id', (req: any, res: any) => {
    const id = parseInt(req.params.id);
    const index = mockReservations.findIndex((r) => r.id === id);
    if (index !== -1) {
      mockReservations[index] = { ...mockReservations[index], ...req.body };
      res.json(mockReservations[index]);
    } else {
      res.status(404).json({ message: 'Reservation not found' });
    }
  });

  express.delete('/api/reservations/:id', (req: any, res: any) => {
    const id = parseInt(req.params.id);
    const index = mockReservations.findIndex((r) => r.id === id);
    if (index !== -1) {
      mockReservations.splice(index, 1);
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Reservation not found' });
    }
  });

  // Settings endpoints
  express.get('/api/settings', (req: any, res: any) => {
    res.json(mockSettings);
  });

  express.put('/api/settings', (req: any, res: any) => {
    Object.assign(mockSettings, req.body);
    res.json(mockSettings);
  });

  // Customers endpoints
  express.get('/api/customers', (req: any, res: any) => {
    res.json(mockCustomers);
  });

  express.post('/api/customers', (req: any, res: any) => {
    const newCustomer = {
      id: mockCustomers.length + 1,
      ...req.body,
      visits: 0,
    };
    mockCustomers.push(newCustomer);
    res.status(201).json(newCustomer);
  });

  // Orders endpoints
  express.get('/api/orders', (req: any, res: any) => {
    res.json(mockOrders);
  });

  express.post('/api/orders', (req: any, res: any) => {
    const newOrder = {
      id: mockOrders.length + 1,
      ...req.body,
      status: 'pending',
    };
    mockOrders.push(newOrder);
    res.status(201).json(newOrder);
  });

  // Menu endpoints
  express.get('/api/menu', (req: any, res: any) => {
    res.json(mockMenu);
  });

  express.post('/api/menu', (req: any, res: any) => {
    const newItem = {
      id: mockMenu.length + 1,
      ...req.body,
    };
    mockMenu.push(newItem);
    res.status(201).json(newItem);
  });

  // Conversations endpoint
  express.get('/api/conversations', (req: any, res: any) => {
    res.json([
      {
        id: 1,
        customerName: 'Cliente 1',
        lastMessage: 'Hola, quiero hacer una reserva',
        timestamp: new Date(),
      },
      {
        id: 2,
        customerName: 'Cliente 2',
        lastMessage: '¿Tienen disponibilidad?',
        timestamp: new Date(),
      },
    ]);
  });

  const port = process.env.PORT || 8005;
  await app.listen(port);
  console.log(`🚀 ChatBotDysa Mock Backend running on http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api-docs`);
  console.log(`🏥 Health Check: http://localhost:${port}/health`);
}

bootstrap();
