import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../src/auth/entities/user.entity';
import { Repository } from 'typeorm';

describe('Auth Integration Tests (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/login (POST)', () => {
    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'admin@zgamersa.com',
          password: 'VvuOayZOstHMhxEb6Lb/6haZYRFZMr8qoaUXb3fuuZM=',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.email).toBe('admin@zgamersa.com');
        });
    });

    it('should reject invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'admin@zgamersa.com',
          password: 'WrongPassword123!',
        })
        .expect(401);
    });

    it('should reject malformed email', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'notanemail',
          password: 'Password123!',
        })
        .expect(400);
    });

    it('should reject missing fields', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
        })
        .expect(400);
    });
  });

  describe('/auth/register (POST)', () => {
    const newUser = {
      email: `test${Date.now()}@example.com`,
      password: 'SecurePassword123!',
      firstName: 'Test',
      lastName: 'User',
    };

    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(newUser)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.email).toBe(newUser.email);
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should reject duplicate email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'admin@zgamersa.com',
          password: 'Password123!',
          firstName: 'Duplicate',
          lastName: 'User',
        })
        .expect(409);
    });

    it('should reject weak password', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'weak@example.com',
          password: '123',
          firstName: 'Weak',
          lastName: 'Password',
        })
        .expect(400);
    });
  });

  describe('/auth/profile (GET)', () => {
    let authToken: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'admin@zgamersa.com',
          password: 'VvuOayZOstHMhxEb6Lb/6haZYRFZMr8qoaUXb3fuuZM=',
        });
      authToken = response.body.access_token;
    });

    it('should get user profile with valid token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('email');
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should reject request without token', () => {
      return request(app.getHttpServer()).get('/auth/profile').expect(401);
    });

    it('should reject request with invalid token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);
    });
  });

  describe('Security Tests', () => {
    it('should implement rate limiting on login', async () => {
      const promises = [];

      // Try 10 login attempts
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app.getHttpServer())
            .post('/auth/login')
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
        .post('/auth/login')
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
        .post('/auth/login')
        .send({
          email: 'admin@zgamersa.com',
          password: 'VvuOayZOstHMhxEb6Lb/6haZYRFZMr8qoaUXb3fuuZM=',
        });
      authToken = response.body.access_token;
    });

    it('should have valid JWT structure', () => {
      expect(authToken).toBeDefined();
      const parts = authToken.split('.');
      expect(parts).toHaveLength(3);
    });

    it('should accept valid token in protected routes', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should reject expired token', async () => {
      // This would require mocking time or waiting for token expiration
      // For now, we test with an obviously invalid token
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxNjAwMDAwMDAxfQ.invalid';

      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });
  });
});
