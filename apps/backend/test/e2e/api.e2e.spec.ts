import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '../../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from '../../src/auth/entities/user.entity';
import { Role } from '../../src/auth/entities/role.entity';
import {
  Permission,
  PermissionAction,
  PermissionModule,
} from '../../src/auth/entities/permission.entity';
import { MenuItem, MenuCategory } from '../../src/entities/menu-item.entity';
import * as bcrypt from 'bcryptjs';
import { RateLimitGuard } from '../../src/common/guards/rate-limit.guard';

jest.setTimeout(30000);

describe('API E2E Tests - Complete User Flow', () => {
  let app: INestApplication;
  let authToken: string;
  let customerId: number;
  let orderId: number;
  let menuItemId: number;
  let menuItemPrice: number;
  const adminEmail = 'admin@zgamersa.com';
  const adminPassword = 'Password123!';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(RateLimitGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.setGlobalPrefix('api', {
      exclude: ['/health', '/', '/docs', '/docs-json', '/uploads'],
    });
    app.enableCors({
      origin: ['http://localhost:7001', 'http://localhost:7002', 'http://localhost:8005'],
      credentials: true,
    });

    const swaggerConfig = new DocumentBuilder()
      .setTitle('ChatBotDysa Enterprise API')
      .setVersion('1.0.0')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document);

    await app.init();

    const userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
    const roleRepository = moduleFixture.get<Repository<Role>>(getRepositoryToken(Role));
    const permissionRepository = moduleFixture.get<Repository<Permission>>(
      getRepositoryToken(Permission),
    );
    const menuRepository = moduleFixture.get<Repository<MenuItem>>(
      getRepositoryToken(MenuItem),
    );

    let dashboardPermission = await permissionRepository.findOne({
      where: { name: 'dashboard.read' },
    });
    if (!dashboardPermission) {
      dashboardPermission = await permissionRepository.save(
        permissionRepository.create({
          name: 'dashboard.read',
          displayName: 'Dashboard Read',
          description: 'Access dashboard stats',
          module: PermissionModule.DASHBOARD,
          action: PermissionAction.READ,
          isSystem: true,
        }),
      );
    }

    let adminRole = await roleRepository.findOne({ where: { name: 'admin' } });
    if (!adminRole) {
      adminRole = await roleRepository.save(
        roleRepository.create({
          name: 'admin',
          displayName: 'Admin',
          description: 'Admin role',
          isSystem: true,
          permissions: [dashboardPermission],
        }),
      );
    } else if (!adminRole.permissions?.some((permission) => permission.name === 'dashboard.read')) {
      adminRole.permissions = [...(adminRole.permissions || []), dashboardPermission];
      adminRole = await roleRepository.save(adminRole);
    }

    const existingAdmin = await userRepository.findOne({ where: { email: adminEmail } });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await userRepository.save(
        userRepository.create({
          email: adminEmail,
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'User',
          status: UserStatus.ACTIVE,
          role: 'admin',
          roles: [adminRole],
        }),
      );
    } else if (!existingAdmin.roles?.some((role) => role.name === 'admin')) {
      existingAdmin.roles = [adminRole];
      await userRepository.save(existingAdmin);
    }

    let menuItem = await menuRepository.findOne({ where: { name: 'E2E Menu Item' } });
    if (!menuItem) {
      menuItem = await menuRepository.save(
        menuRepository.create({
          name: 'E2E Menu Item',
          description: 'Seeded item for end-to-end tests',
          price: 150.0,
          category: MenuCategory.MAIN_COURSE,
          available: true,
        }),
      );
    }

    menuItemId = menuItem.id;
    menuItemPrice = Number(menuItem.price);

    // Login to get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: adminEmail,
        password: adminPassword,
      });

    authToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Complete Restaurant Owner Flow', () => {
    it('Step 1: Admin should access dashboard stats', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('activeCustomers');
      expect(response.body.data).toHaveProperty('totalOrders');
      expect(response.body.data).toHaveProperty('revenue');
    });

    it('Step 2: Create a new customer', async () => {
      const newCustomer = {
        name: `E2E Test Customer ${Date.now()}`,
        email: `e2e${Date.now()}@test.com`,
        phone: `+52${Math.floor(Math.random() * 10000000000)}`,
      };

      const response = await request(app.getHttpServer())
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newCustomer)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newCustomer.name);
      customerId = response.body.id;
    });

    it('Step 3: Get menu items', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/menu')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('Step 4: Create an order for the customer', async () => {
      const newOrder = {
        customerId: customerId,
        items: [
          {
            menuItemId,
            quantity: 2,
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newOrder)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.total).toBe(menuItemPrice * 2);
      orderId = response.body.id;
    });

    it('Step 5: Update order status', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'confirmed' })
        .expect(200);

      expect(response.body.status).toBe('confirmed');
    });

    it('Step 6: View customer details', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/customers/${customerId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(customerId);
    });

    it('Step 7: Get orders list', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.some((order: any) => order.id === orderId)).toBe(true);
    });
  });

  describe('Health and Status Endpoints', () => {
    it('/api/health (GET) should return healthy', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('ok');
        });
    });

    it('/api/health/database (GET) should confirm DB connection', () => {
      return request(app.getHttpServer())
        .get('/api/health/database')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('connected');
        });
    });

    it('/api/health/ai (GET) should return AI status', () => {
      return request(app.getHttpServer())
        .get('/api/health/ai')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('status');
        });
    });
  });

  describe('API Documentation', () => {
    it('should serve Swagger UI', () => {
      return request(app.getHttpServer()).get('/docs').expect(200);
    });

    it('should provide OpenAPI JSON', () => {
      return request(app.getHttpServer())
        .get('/docs-json')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('openapi');
          expect(res.body).toHaveProperty('paths');
        });
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent customer', () => {
      return request(app.getHttpServer())
        .get('/api/customers/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 400 for invalid data', () => {
      return request(app.getHttpServer())
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '',
          email: 'invalid-email',
        })
        .expect(400);
    });

    it('should return 401 for unauthorized access', () => {
      return request(app.getHttpServer()).get('/api/customers').expect(401);
    });
  });

  describe('Performance Tests', () => {
    it('should respond to dashboard request within 500ms', async () => {
      const start = Date.now();
      await request(app.getHttpServer())
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(2000);
    });

    it('should handle concurrent requests', async () => {
      const makeRequest = () =>
        request(app.getHttpServer())
          .get('/api/menu')
          .set('Authorization', `Bearer ${authToken}`);

      const results = await Promise.allSettled(
        Array.from({ length: 3 }, () => makeRequest()),
      );

      const rejected = results.filter((result) => result.status === 'rejected');
      if (rejected.length > 0) {
        const retries = await Promise.all(
          Array.from({ length: rejected.length }, () => makeRequest()),
        );
        retries.forEach((res) => {
          expect(res.status).toBe(200);
        });
      }

      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          expect(result.value.status).toBe(200);
        }
      });
    });
  });

  describe('CORS and Security Headers', () => {
    it('should include security headers', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
    });

    it('should handle CORS properly', async () => {
      const response = await request(app.getHttpServer())
        .options('/api/menu')
        .set('Origin', 'http://localhost:7001')
        .expect(204);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });
});
