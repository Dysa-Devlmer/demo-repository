import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('API E2E Tests - Complete User Flow', () => {
  let app: INestApplication;
  let authToken: string;
  let customerId: number;
  let orderId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Login to get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@zgamersa.com',
        password: 'VvuOayZOstHMhxEb6Lb/6haZYRFZMr8qoaUXb3fuuZM=',
      });

    authToken = loginResponse.body.access_token;
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

      expect(response.body).toHaveProperty('totalCustomers');
      expect(response.body).toHaveProperty('totalOrders');
      expect(response.body).toHaveProperty('totalRevenue');
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
            menuItemId: 1,
            quantity: 2,
            price: 150.0,
          },
        ],
        total: 300.0,
        status: 'pending',
      };

      const response = await request(app.getHttpServer())
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newOrder)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.total).toBe(300.0);
      orderId = response.body.id;
    });

    it('Step 5: Update order status', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/orders/${orderId}`)
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

    it('Step 7: Get customer orders', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/customers/${customerId}/orders`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('Health and Status Endpoints', () => {
    it('/api/health (GET) should return healthy', () => {
      return request(app.getHttpServer())
        .get('/api/health')
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
          expect(res.body.database).toHaveProperty('status');
        });
    });

    it('/api/health/redis (GET) should confirm Redis connection', () => {
      return request(app.getHttpServer())
        .get('/api/health/redis')
        .expect(200)
        .expect((res) => {
          expect(res.body.redis).toHaveProperty('status');
        });
    });
  });

  describe('API Documentation', () => {
    it('should serve Swagger UI', () => {
      return request(app.getHttpServer()).get('/api/docs').expect(301);
    });

    it('should provide OpenAPI JSON', () => {
      return request(app.getHttpServer())
        .get('/api/docs-json')
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

      expect(duration).toBeLessThan(500);
    });

    it('should handle concurrent requests', async () => {
      const requests = Array(10)
        .fill(null)
        .map(() =>
          request(app.getHttpServer())
            .get('/api/menu')
            .set('Authorization', `Bearer ${authToken}`),
        );

      const responses = await Promise.all(requests);

      responses.forEach((res) => {
        expect(res.status).toBe(200);
      });
    });
  });

  describe('CORS and Security Headers', () => {
    it('should include security headers', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/health')
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
