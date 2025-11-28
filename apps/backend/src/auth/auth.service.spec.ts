import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { AuditLog } from './entities/audit-log.entity';
import { Repository } from 'typeorm';

// Mock bcrypt before importing
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

const bcrypt = require('bcryptjs');

describe('AuthService - Unit Tests', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let roleRepository: Repository<Role>;
  let auditLogRepository: Repository<AuditLog>;
  let jwtService: JwtService;

  const mockUser: Partial<User> = {
    id: 1,
    email: 'test@example.com',
    password: '$2b$10$hashedpassword',
    firstName: 'Test',
    lastName: 'User',
    status: 'active',
    roles: [],
    failedLoginAttempts: 0,
    accountLockedUntil: null,
    isAccountLocked: jest.fn().mockReturnValue(false),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    find: jest.fn(),
  };

  const mockRoleRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockAuditLogRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock.jwt.token'),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Role),
          useValue: mockRoleRepository,
        },
        {
          provide: getRepositoryToken(AuditLog),
          useValue: mockAuditLogRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    roleRepository = module.get<Repository<Role>>(getRepositoryToken(Role));
    auditLogRepository = module.get<Repository<AuditLog>>(getRepositoryToken(AuditLog));
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user data when credentials are valid', async () => {
      const email = 'test@example.com';
      const password = 'Test123!';

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(email, password);

      expect(result).toBeDefined();
      expect(result.email).toBe(email);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email },
        relations: ['roles', 'roles.permissions'],
      });
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.validateUser('nonexistent@example.com', 'password')).rejects.toThrow('Credenciales inválidas');
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.validateUser('test@example.com', 'wrongpassword')).rejects.toThrow('Credenciales inválidas');
    });
  });

  describe('login', () => {
    it('should return access token and user data', async () => {
      const loginDto = { email: 'test@example.com', password: 'Test123!' };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue({ affected: 1 });
      mockAuditLogRepository.create.mockReturnValue({});
      mockAuditLogRepository.save.mockResolvedValue({});
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const loginResult = await service.login(loginDto);

      expect(loginResult).toHaveProperty('accessToken');
      expect(loginResult).toHaveProperty('user');
      expect(loginResult).toHaveProperty('refreshToken');
      expect(mockJwtService.sign).toHaveBeenCalled();
    });

    it('should include correct payload in JWT', async () => {
      const loginDto = { email: 'test@example.com', password: 'Test123!' };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue({ affected: 1 });
      mockAuditLogRepository.create.mockReturnValue({});
      mockAuditLogRepository.save.mockResolvedValue({});
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await service.login(loginDto);

      const callArgs = mockJwtService.sign.mock.calls[0][0];
      expect(callArgs).toHaveProperty('email');
      expect(callArgs).toHaveProperty('sub');
      expect(callArgs).toHaveProperty('roles');
      expect(callArgs).toHaveProperty('permissions');
    });
  });

  describe('register', () => {
    it('should hash password and create new user', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        password: 'NewPassword123!',
        firstName: 'New',
        lastName: 'User',
      };

      const hashedPassword = '$2b$10$newhashed';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue({ ...registerDto, password: hashedPassword });
      mockUserRepository.save.mockResolvedValue({ ...registerDto, id: 2, password: hashedPassword });
      mockAuditLogRepository.create.mockReturnValue({});
      mockAuditLogRepository.save.mockResolvedValue({});

      const result = await service.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 12);
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result).toHaveProperty('message');
    });

    it('should throw error if email already exists', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        service.register({
          email: 'test@example.com',
          password: 'Password123!',
          firstName: 'Test',
          lastName: 'User',
        }),
      ).rejects.toThrow('El correo ya está registrado');
    });
  });

  describe('Security Tests', () => {
    it('should use bcrypt with appropriate cost factor', async () => {
      const password = 'SecurePassword123!';
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$12$hashed');

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue({ email: 'security@test.com' });
      mockUserRepository.save.mockResolvedValue({ id: 3 });
      mockAuditLogRepository.create.mockReturnValue({});
      mockAuditLogRepository.save.mockResolvedValue({});

      await service.register({
        email: 'security@test.com',
        password,
        firstName: 'Security',
        lastName: 'Test',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith(password, expect.any(Number));
      const costFactor = (bcrypt.hash as jest.Mock).mock.calls[0][1];
      expect(costFactor).toBeGreaterThanOrEqual(10);
    });

    it('should not expose password in response', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$12$hashed');
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue({ ...mockUser });
      mockUserRepository.save.mockResolvedValue({ ...mockUser });
      mockAuditLogRepository.create.mockReturnValue({});
      mockAuditLogRepository.save.mockResolvedValue({});

      const result = await service.register({
        email: 'nopassword@test.com',
        password: 'Password123!',
        firstName: 'No',
        lastName: 'Password',
      });

      expect(result).toHaveProperty('message');
      expect(result).not.toHaveProperty('password');
    });
  });
});
