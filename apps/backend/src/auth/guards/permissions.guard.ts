import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserFromJwt } from '../jwt.strategy';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required permissions from metadata
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>('permissions', [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no permissions required, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // Get user from request
    const request = context.switchToHttp().getRequest();
    const user: UserFromJwt = request.user;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // Check if user has any of the required permissions
    const hasPermission = requiredPermissions.some((permission) =>
      user.permissions?.includes(permission)
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Acceso denegado. Se requieren permisos: ${requiredPermissions.join(', ')}`
      );
    }

    return true;
  }
}
