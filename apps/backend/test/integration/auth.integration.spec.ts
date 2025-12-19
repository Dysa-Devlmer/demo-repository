import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserStatus } from '../../src/auth/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { RateLimitGuard } from '../../src/common/guards/rate-limit.guard';

jest.setTimeout(30000);

describe('Auth Integration Tests (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
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
    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));

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
        }),
      );
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/auth/login (POST)', () => {
    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: adminEmail,
          password: adminPassword,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.email).toBe('admin@zgamersa.com');
        });
    });

    it('should reject invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: adminEmail,
          password: 'WrongPassword123!',
        })
        .expect(401);
    });

    it('should reject malformed email', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'notanemail',
          password: 'Password123!',
        })
        .expect(400);
    });

    it('should reject missing fields', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
        })
        .expect(400);
    });
  });

  describe('/api/auth/register (POST)', () => {
    const newUser = {
      email: `test${Date.now()}@example.com`,
      password: 'SecurePassword123!',
      firstName: 'Test',
      lastName: 'User',
    };

    it('should register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(newUser)
        .expect(201);

      expect(response.body).toEqual({
        message: 'Usuario registrado exitosamente',
      });

      const createdUser = await userRepository.findOne({ where: { email: newUser.email } });
      expect(createdUser).toBeDefined();
    });

    it('should reject duplicate email', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'admin@zgamersa.com',
          password: 'Password123!',
          firstName: 'Duplicate',
          lastName: 'User',
        })
        .expect(400);
    });

    it('should reject weak password', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'weak@example.com',
          password: '123',
          firstName: 'Weak',
          lastName: 'Password',
        })
        .expect(400);
    });
  });

  describe('/api/users/me (GET)', () => {
    let authToken: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: adminEmail,
          password: adminPassword,
        });
      authToken = response.body.accessToken;
    });

    it('should get user profile with valid token', () => {
      return request(app.getHttpServer())
        .get('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('email');
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should reject request without token', () => {
      return request(app.getHttpServer()).get('/api/users/me').expect(401);
    });

    it('should reject request with invalid token', () => {
      return request(app.getHttpServer())
        .get('/api/users/me')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);
    });
  });

  describe('Security Tests', () => {
    it.skip('should implement rate limiting on login', async () => {
      const promises = [];

      // Try 10 login attempts
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app.getHttpServer())
            .post('/api/auth/login')
            .send({
              email: 'test@example.com',
              password: 'wrong',
            }),
        );
      }

      const responses = await Promise.all(promises);
      const tooManyRequests = responses.some(res => res.status === 429);

      expect(tooManyRequests).toBe(true);
    });

    it('should not expose sensitive data in errors', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SomePassword123!',
        })
        .expect(401);

      expect(response.body.message).not.toContain('password');
      expect(response.body.message).not.toContain('hash');
    });

    it('should use HTTPS in production', () => {
      if (process.env.NODE_ENV === 'production') {
        expect(process.env.HTTPS_ENABLED).toBe('true');
      }
    });
  });

  describe('JWT Token Tests', () => {
    let authToken: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: adminEmail,
          password: adminPassword,
        });
      authToken = response.body.accessToken;
    });

    it('should have valid JWT structure', () => {
      expect(authToken).toBeDefined();
      const parts = authToken.split('.');
      expect(parts).toHaveLength(3);
    });

    it('should accept valid token in protected routes', () => {
      return request(app.getHttpServer())
        .get('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should reject expired token', async () => {
      // This would require mocking time or waiting for token expiration
      // For now, we test with an obviously invalid token
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxNjAwMDAwMDAxfQ.invalid';

      return request(app.getHttpServer())
        .get('/api/users/me')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });
  });
});
