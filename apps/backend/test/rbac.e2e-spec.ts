/**
 * RBAC End-to-End Tests
 * ChatBotDysa Enterprise
 *
 * Test suite completo para verificar el sistema RBAC
 * Prueba autenticación, autorización y permisos por rol
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('RBAC System (e2e)', () => {
  let app: INestApplication;

  // Tokens de autenticación por rol
  let adminToken: string;
  let managerToken: string;
  let staffToken: string;
  let userToken: string;

  // Credenciales de prueba
  const credentials = {
    admin: {
      email: 'admin@zgamersa.com',
      password: 'Admin123!',
    },
    manager: {
      email: 'gerente@zgamersa.com',
      password: 'Manager123!',
    },
    staff: {
      email: 'mesero@zgamersa.com',
      password: 'Staff123!',
    },
    user: {
      email: 'cliente@zgamersa.com',
      password: 'User123!',
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Obtener tokens para cada rol
    adminToken = await loginAndGetToken(credentials.admin);
    managerToken = await loginAndGetToken(credentials.manager);
    staffToken = await loginAndGetToken(credentials.staff);
    userToken = await loginAndGetToken(credentials.user);
  });

  afterAll(async () => {
    await app.close();
  });

  /**
   * Helper function para login y obtener JWT token
   */
  async function loginAndGetToken(creds: { email: string; password: string }): Promise<string> {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send(creds)
      .expect(200);

    return response.body.data.accessToken;
  }

  /**
   * AUTHENTICATION TESTS
   */
  describe('Authentication', () => {
    it('should login admin successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(credentials.admin)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.roles[0].name).toBe('admin');
      expect(response.body.data.accessToken).toBeDefined();
    });

    it('should login manager successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(credentials.manager)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.roles[0].name).toBe('manager');
      expect(response.body.data.permissions).toHaveLength(26);
    });

    it('should login staff successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(credentials.staff)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.roles[0].name).toBe('staff');
      expect(response.body.data.permissions).toHaveLength(14);
    });

    it('should reject invalid credentials', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'admin@zgamersa.com', password: 'wrongpassword' })
        .expect(401);
    });

    it('should reject requests without token', async () => {
      await request(app.getHttpServer())
        .get('/api/customers')
        .expect(401);
    });
  });

  /**
   * CUSTOMERS ENDPOINT TESTS
   */
  describe('Customers Endpoints - RBAC', () => {
    let testCustomerId: number;

    it('ADMIN should create customer', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Customer Admin',
          email: 'test.admin@example.com',
          phone: '+1234567890',
        })
        .expect(201);

      testCustomerId = response.body.data.id;
      expect(response.body.data.name).toBe('Test Customer Admin');
    });

    it('MANAGER should create customer', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/customers')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          name: 'Test Customer Manager',
          email: 'test.manager@example.com',
          phone: '+1234567891',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('STAFF should create customer', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/customers')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          name: 'Test Customer Staff',
          email: 'test.staff@example.com',
          phone: '+1234567892',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('USER should NOT create customer (403)', async () => {
      await request(app.getHttpServer())
        .post('/api/customers')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Test Customer User',
          email: 'test.user@example.com',
          phone: '+1234567893',
        })
        .expect(403);
    });

    it('ADMIN should list all customers', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('MANAGER should list all customers', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/customers')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('STAFF should list all customers', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/customers')
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('USER should NOT list customers (403)', async () => {
      await request(app.getHttpServer())
        .get('/api/customers')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('MANAGER should update customer', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/customers/${testCustomerId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          phone: '+9999999999',
        })
        .expect(200);

      expect(response.body.data.phone).toBe('+9999999999');
    });

    it('ADMIN should delete customer', async () => {
      await request(app.getHttpServer())
        .delete(`/api/customers/${testCustomerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('MANAGER should delete customer', async () => {
      // Create a customer first
      const createResponse = await request(app.getHttpServer())
        .post('/api/customers')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          name: 'Delete Test',
          email: 'delete@test.com',
          phone: '+1111111111',
        });

      const customerId = createResponse.body.data.id;

      // Manager should be able to delete
      await request(app.getHttpServer())
        .delete(`/api/customers/${customerId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);
    });

    it('STAFF should NOT delete customer (403)', async () => {
      // Create a customer first
      const createResponse = await request(app.getHttpServer())
        .post('/api/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Delete Test Staff',
          email: 'deletestaff@test.com',
          phone: '+2222222222',
        });

      const customerId = createResponse.body.data.id;

      // Staff should NOT be able to delete
      await request(app.getHttpServer())
        .delete(`/api/customers/${customerId}`)
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(403);

      // Cleanup
      await request(app.getHttpServer())
        .delete(`/api/customers/${customerId}`)
        .set('Authorization', `Bearer ${adminToken}`);
    });
  });

  /**
   * REPORTS ENDPOINT TESTS
   */
  describe('Reports Endpoints - RBAC', () => {
    let testReportId: number;

    it('ADMIN should create report configuration', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/reports')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Sales Report',
          type: 'sales',
          format: 'pdf',
        })
        .expect(201);

      testReportId = response.body.data.id;
      expect(response.body.data.name).toBe('Test Sales Report');
    });

    it('MANAGER should create report configuration', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/reports')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          name: 'Manager Report',
          type: 'orders',
          format: 'excel',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('MANAGER should list reports', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/reports')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('STAFF should list reports', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/reports')
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('USER should NOT list reports (403)', async () => {
      await request(app.getHttpServer())
        .get('/api/reports')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('ADMIN should access report statistics', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/reports/statistics')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('MANAGER should NOT access report statistics (403)', async () => {
      await request(app.getHttpServer())
        .get('/api/reports/statistics')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(403);
    });

    it('MANAGER should delete report', async () => {
      // Create report first
      const createResponse = await request(app.getHttpServer())
        .post('/api/reports')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          name: 'Delete Test Report',
          type: 'customers',
          format: 'csv',
        });

      const reportId = createResponse.body.data.id;

      // Manager should be able to delete
      await request(app.getHttpServer())
        .delete(`/api/reports/${reportId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);
    });

    it('STAFF should NOT delete report (403)', async () => {
      await request(app.getHttpServer())
        .delete(`/api/reports/${testReportId}`)
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(403);
    });
  });

  /**
   * USERS ENDPOINT TESTS - Admin Only
   */
  describe('Users Endpoints - Admin Only', () => {
    it('ADMIN should list users', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('MANAGER should NOT list users (403)', async () => {
      await request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(403);
    });

    it('STAFF should NOT list users (403)', async () => {
      await request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(403);
    });
  });

  /**
   * DASHBOARD ENDPOINTS TESTS
   */
  describe('Dashboard Endpoints', () => {
    it('ADMIN should access dashboard stats', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('MANAGER should access dashboard stats', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('STAFF should access dashboard stats', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  /**
   * TOKEN VALIDATION TESTS
   */
  describe('Token Validation', () => {
    it('should reject expired token', async () => {
      // This would need a proper expired token - skipping for now
      // await request(app.getHttpServer())
      //   .get('/api/customers')
      //   .set('Authorization', `Bearer ${expiredToken}`)
      //   .expect(401);
    });

    it('should reject malformed token', async () => {
      await request(app.getHttpServer())
        .get('/api/customers')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);
    });

    it('should reject empty Authorization header', async () => {
      await request(app.getHttpServer())
        .get('/api/customers')
        .set('Authorization', '')
        .expect(401);
    });
  });
});
