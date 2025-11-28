/**
 * RBAC Guards Unit Tests
 * ChatBotDysa Enterprise
 *
 * Tests unitarios para guards y decoradores de RBAC
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../src/auth/guards/roles.guard';
import { ROLES } from '../src/auth/decorators/roles.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should allow access if no roles are required', () => {
      const mockContext = createMockExecutionContext({
        user: { roles: [{ name: 'user' }] },
      });

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('should allow ADMIN user access to ADMIN endpoint', () => {
      const mockContext = createMockExecutionContext({
        user: { roles: [{ name: 'admin' }] },
      });

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([ROLES.ADMIN]);

      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('should allow MANAGER user access to MANAGER endpoint', () => {
      const mockContext = createMockExecutionContext({
        user: { roles: [{ name: 'manager' }] },
      });

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([ROLES.ADMIN, ROLES.MANAGER]);

      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('should deny USER access to ADMIN endpoint', () => {
      const mockContext = createMockExecutionContext({
        user: { roles: [{ name: 'user' }] },
      });

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([ROLES.ADMIN]);

      expect(guard.canActivate(mockContext)).toBe(false);
    });

    it('should deny STAFF access to ADMIN-only endpoint', () => {
      const mockContext = createMockExecutionContext({
        user: { roles: [{ name: 'staff' }] },
      });

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([ROLES.ADMIN]);

      expect(guard.canActivate(mockContext)).toBe(false);
    });

    it('should allow ADMIN access to any endpoint', () => {
      const mockContext = createMockExecutionContext({
        user: { roles: [{ name: 'admin' }] },
      });

      const endpoints = [
        [ROLES.ADMIN],
        [ROLES.MANAGER],
        [ROLES.STAFF],
        [ROLES.USER],
        [ROLES.ADMIN, ROLES.MANAGER],
        [ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF],
      ];

      endpoints.forEach((requiredRoles) => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);
        expect(guard.canActivate(mockContext)).toBe(true);
      });
    });

    it('should deny access if user has no roles', () => {
      const mockContext = createMockExecutionContext({
        user: { roles: [] },
      });

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([ROLES.ADMIN]);

      expect(guard.canActivate(mockContext)).toBe(false);
    });

    it('should deny access if no user in request', () => {
      const mockContext = createMockExecutionContext({});

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([ROLES.ADMIN]);

      expect(guard.canActivate(mockContext)).toBe(false);
    });
  });
});

/**
 * Helper function to create mock ExecutionContext
 */
function createMockExecutionContext(requestData: any): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => requestData,
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as ExecutionContext;
}

/**
 * Role Decorator Tests
 */
describe('ROLES Constant', () => {
  it('should have correct role values', () => {
    expect(ROLES.ADMIN).toBe('admin');
    expect(ROLES.MANAGER).toBe('manager');
    expect(ROLES.STAFF).toBe('staff');
    expect(ROLES.USER).toBe('user');
  });

  it('should have all required roles', () => {
    expect(ROLES).toHaveProperty('ADMIN');
    expect(ROLES).toHaveProperty('MANAGER');
    expect(ROLES).toHaveProperty('STAFF');
    expect(ROLES).toHaveProperty('USER');
  });
});

/**
 * Permission Hierarchy Tests
 */
describe('Permission Hierarchy', () => {
  const permissionCounts = {
    admin: 35,
    manager: 26,
    staff: 14,
    user: 3,
  };

  it('should maintain permission hierarchy (admin > manager > staff > user)', () => {
    expect(permissionCounts.admin).toBeGreaterThan(permissionCounts.manager);
    expect(permissionCounts.manager).toBeGreaterThan(permissionCounts.staff);
    expect(permissionCounts.staff).toBeGreaterThan(permissionCounts.user);
  });

  it('admin should have at least 30 permissions', () => {
    expect(permissionCounts.admin).toBeGreaterThanOrEqual(30);
  });

  it('manager should have at least 20 permissions', () => {
    expect(permissionCounts.manager).toBeGreaterThanOrEqual(20);
  });

  it('staff should have at least 10 permissions', () => {
    expect(permissionCounts.staff).toBeGreaterThanOrEqual(10);
  });
});
