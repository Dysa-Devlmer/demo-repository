// =============================================================================
// 🚀 CHATBOTDYSA ENTERPRISE+++++ INTEGRATION TESTS
// AuthController Integration Tests - Fortune 500 Quality Standards
// =============================================================================

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

import { AuthController } from '../../../src/auth/auth.controller';
import { AuthService } from '../../../src/auth/auth.service';
import { User } from '../../../src/entities/user.entity';
import { RateLimitGuard } from '../../../src/common/guards/rate-limit.guard';
import { CsrfGuard } from '../../../src/auth/guards/csrf.guard';

describe('AuthController (Integration)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let authService: AuthService;

  // Test database configuration
  const testDbConfig = {
    type: 'sqlite' as const,
    database: ':memory:',
    entities: [User],
    synchronize: true,
    logging: false,
  };

  // Test user data
  const testUser = {
    email: 'integration.test@chatbotdysa.com',
    password: 'Enterprise123!',
    firstName: 'Integration',
    lastName: 'Test',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        TypeOrmModule.forRoot(testDbConfig),
        TypeOrmModule.forFeature([User]),
        JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            secret: configService.get<string>('JWT_SECRET') || 'test-secret',
            signOptions: { expiresIn: '1h' },
          }),
          inject: [ConfigService],
        }),
      ],
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: RateLimitGuard,
          useValue: {
            canActivate: () => true, // Disable rate limiting for tests
          },
        },
        {
          provide: CsrfGuard,
          useValue: {
            canActivate: () => true, // Disable CSRF for tests
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply global pipes for validation
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    await app.init();

    userRepository = app.get<Repository<User>>(getRepositoryToken(User));
    authService = app.get<AuthService>(AuthService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await userRepository.clear();
  });

  describe('POST /auth/register', () => {
    it('should successfully register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body).toEqual({
        token: expect.any(String),
        user: {
          id: expect.any(Number),
          email: testUser.email,
          firstName: testUser.firstName,
          lastName: testUser.lastName,
          roles: ['user'],
          permissions: ['users.read'],
        },
        expiresIn: expect.any(String),
      });

      // Verify user was created in database
      const createdUser = await userRepository.findOne({
        where: { email: testUser.email },
      });
      expect(createdUser).toBeDefined();
      expect(createdUser.email).toBe(testUser.email);
      expect(createdUser.isActive).toBe(true);
    });

    it('should return 409 when email already exists', async () => {
      // First registration
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      // Second registration with same email
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(409);

      expect(response.body.message).toContain('Email already exists');
    });

    it('should return 400 for invalid email format', async () => {
      const invalidUser = { ...testUser, email: 'invalid-email' };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body.message).toContain('email must be an email');
    });

    it('should return 400 for weak password', async () => {
      const weakPasswordUser = { ...testUser, password: '123' };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(weakPasswordUser)
        .expect(400);

      expect(response.body.message).toContain('password');
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteUser = { email: testUser.email };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(incompleteUser)
        .expect(400);

      expect(response.body.message).toContain('required');
    });

    // Enterprise Security Test
    it('should sanitize input to prevent XSS', async () => {
      const xssUser = {
        ...testUser,
        firstName: '<script>alert("xss")</script>',
        lastName: '<img src=x onerror=alert("xss")>',
        email: 'xss.test@chatbotdysa.com',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(xssUser)
        .expect(201);

      const createdUser = await userRepository.findOne({
        where: { email: xssUser.email },
      });

      // Verify that script tags are not stored (should be sanitized)
      expect(createdUser.firstName).not.toContain('<script>');
      expect(createdUser.lastName).not.toContain('<img');
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Create a test user for login tests
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser);
    });

    it('should successfully login with valid credentials', async () => {
      const loginData = {
        email: testUser.email,
        password: testUser.password,
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toEqual({
        token: expect.any(String),
        user: {
          id: expect.any(Number),
          email: testUser.email,
          firstName: testUser.firstName,
          lastName: testUser.lastName,
          roles: ['user'],
          permissions: ['users.read'],
        },
        expiresIn: expect.any(String),
      });

      // Verify JWT token is valid
      const token = response.body.token;
      expect(token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
    });

    it('should return 401 for invalid email', async () => {
      const loginData = {
        email: 'nonexistent@chatbotdysa.com',
        password: testUser.password,
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should return 401 for invalid password', async () => {
      const loginData = {
        email: testUser.email,
        password: 'wrongpassword',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should return 400 for missing credentials', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({})
        .expect(400);
    });

    // Enterprise Security Test
    it('should not leak user existence information', async () => {
      const nonExistentUser = {
        email: 'nonexistent@chatbotdysa.com',
        password: 'anypassword',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(nonExistentUser)
        .expect(401);

      // Error message should be generic
      expect(response.body.message).toBe('Invalid credentials');
      expect(response.body.message).not.toContain('user not found');
      expect(response.body.message).not.toContain('does not exist');
    });

    // Enterprise Performance Test
    it('should complete login within performance threshold', async () => {
      const loginData = {
        email: testUser.email,
        password: testUser.password,
      };

      const startTime = Date.now();

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Should complete within 1 second for integration test
      expect(responseTime).toBeLessThan(1000);
    });
  });

  describe('GET /auth/csrf-token', () => {
    it('should return a CSRF token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/csrf-token')
        .expect(200);

      expect(response.body).toEqual({
        csrfToken: expect.any(String),
        success: true,
        message: 'CSRF token generated',
      });

      expect(response.body.csrfToken).toHaveLength(36); // UUID length
    });

    it('should return the same CSRF token for the same session', async () => {
      const agent = request.agent(app.getHttpServer());

      const response1 = await agent
        .get('/auth/csrf-token')
        .expect(200);

      const response2 = await agent
        .get('/auth/csrf-token')
        .expect(200);

      expect(response1.body.csrfToken).toBe(response2.body.csrfToken);
    });
  });

  // Enterprise Stress Testing
  describe('Stress Testing', () => {
    it('should handle concurrent registration requests', async () => {
      const concurrentUsers = Array.from({ length: 10 }, (_, index) => ({
        email: `concurrent.user.${index}@chatbotdysa.com`,
        password: 'Enterprise123!',
        firstName: `User${index}`,
        lastName: 'Test',
      }));

      const requests = concurrentUsers.map(user =>
        request(app.getHttpServer())
          .post('/auth/register')
          .send(user)
      );

      const responses = await Promise.all(requests);

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body.token).toBeDefined();
      });

      // Verify all users were created
      const userCount = await userRepository.count();
      expect(userCount).toBe(10);
    });

    it('should handle concurrent login requests for the same user', async () => {
      // Create a test user
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser);

      const loginData = {
        email: testUser.email,
        password: testUser.password,
      };

      // Simulate 5 concurrent logins
      const requests = Array(5).fill(null).map(() =>
        request(app.getHttpServer())
          .post('/auth/login')
          .send(loginData)
      );

      const responses = await Promise.all(requests);

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.token).toBeDefined();
      });
    });
  });

  // Enterprise Security Testing
  describe('Security Testing', () => {
    it('should prevent SQL injection in login', async () => {
      const maliciousLogin = {
        email: "admin@chatbotdysa.com'; DROP TABLE users; --",
        password: 'anypassword',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(maliciousLogin)
        .expect(401);

      expect(response.body.message).toBe('Invalid credentials');

      // Verify that users table still exists
      const userCount = await userRepository.count();
      expect(userCount).toBeGreaterThanOrEqual(0);
    });

    it('should handle extremely long input gracefully', async () => {
      const longData = {
        email: 'a'.repeat(1000) + '@chatbotdysa.com',
        password: 'b'.repeat(1000),
        firstName: 'c'.repeat(1000),
        lastName: 'd'.repeat(1000),
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(longData);

      // Should handle gracefully (either reject or truncate)
      expect([400, 422, 413]).toContain(response.status);
    });

    it('should set secure HTTP headers', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/csrf-token');

      // Check for security headers (if implemented)
      expect(response.headers['x-content-type-options']).toBeDefined();
      expect(response.headers['x-frame-options']).toBeDefined();
    });
  });

  // Enterprise Edge Cases
  describe('Edge Cases', () => {
    it('should handle special characters in user data', async () => {
      const specialCharUser = {
        email: 'special.chars@chatbotdysa.com',
        password: 'Enterprise123!@#$%^&*()',
        firstName: 'José María',
        lastName: 'O\'Connor-Smith',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(specialCharUser)
        .expect(201);

      expect(response.body.user.firstName).toBe(specialCharUser.firstName);
      expect(response.body.user.lastName).toBe(specialCharUser.lastName);
    });

    it('should handle unicode characters', async () => {
      const unicodeUser = {
        email: 'unicode@chatbotdysa.com',
        password: 'Enterprise123!',
        firstName: '测试',
        lastName: 'テスト',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(unicodeUser)
        .expect(201);

      expect(response.body.user.firstName).toBe(unicodeUser.firstName);
      expect(response.body.user.lastName).toBe(unicodeUser.lastName);
    });

    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send('{ invalid json }')
        .set('Content-Type', 'application/json')
        .expect(400);

      expect(response.body.message).toContain('Bad Request');
    });
  });
});

// =============================================================================
// ENTERPRISE INTEGRATION TESTING STANDARDS IMPLEMENTED:
// =============================================================================
// ✅ Complete HTTP endpoint testing
// ✅ Database integration with in-memory SQLite
// ✅ Request/Response validation
// ✅ Authentication flow testing
// ✅ Error handling and status codes
// ✅ Security testing (XSS, SQL injection)
// ✅ Performance threshold testing
// ✅ Concurrent request handling
// ✅ Edge case handling
// ✅ Input validation testing
// ✅ Session and CSRF token testing
// ✅ Stress testing with multiple concurrent users
// ✅ Proper test isolation and cleanup
// ✅ Enterprise-grade security headers validation
// =============================================================================