import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import * as crypto from 'crypto';

export const SKIP_CSRF_KEY = 'skipCsrf';

// ✅ Decorador correcto como factory
export const SkipCsrf = () => SetMetadata(SKIP_CSRF_KEY, true);

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const skipCsrf = this.reflector.getAllAndOverride<boolean>(SKIP_CSRF_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skipCsrf) {
      return true;
    }

    const request: Request = context.switchToHttp().getRequest();
    const method = request.method?.toLowerCase();

    // 🚀 Enterprise: Skip CSRF for safe methods
    if (['get', 'head', 'options'].includes(method)) {
      return true;
    }

    // 🚀 Enterprise: Skip CSRF for JWT authenticated requests
    // JWT in Authorization header is immune to CSRF attacks
    if (this.hasJwtAuthentication(request)) {
      return true;
    }

    // 🚀 Enterprise: Skip for API webhooks with proper authentication
    if (this.isAuthenticatedWebhook(request)) {
      return true;
    }

    const token = this.extractCsrfToken(request);
    const sessionToken = getSessionToken(request);

    if (!token || !sessionToken || !this.validateCsrfToken(token, sessionToken)) {
      throw new ForbiddenException('Invalid CSRF token');
    }

    return true;
  }

  private extractCsrfToken(request: Request): string | null {
    const body = request.body as Record<string, unknown> | undefined;
    return (
      getHeader(request, 'x-csrf-token') ||
      getHeader(request, 'x-xsrf-token') ||
      (typeof body?._token === 'string' ? body._token : null) ||
      null
    );
  }

  private validateCsrfToken(token: string, sessionToken: string): boolean {
    try {
      return crypto.timingSafeEqual(Buffer.from(token, 'utf8'), Buffer.from(sessionToken, 'utf8'));
    } catch {
      return false;
    }
  }

  private hasJwtAuthentication(request: Request): boolean {
    const authHeader = getHeader(request, 'authorization');
    // Check for Bearer token (JWT) or Demo token
    return !!(authHeader && (authHeader.startsWith('Bearer ') || authHeader.startsWith('Demo ')));
  }

  private isAuthenticatedWebhook(request: Request): boolean {
    const path = request.path;
    const isWebhook = path.includes('/webhook');
    const hasValidAuth = getHeader(request, 'authorization') || getHeader(request, 'x-api-key');

    return isWebhook && !!hasValidAuth;
  }

  static generateCsrfToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}

function getHeader(request: Request, name: string): string | null {
  const value = request.headers[name.toLowerCase()];
  return typeof value === 'string' ? value : null;
}

function getSessionToken(request: Request): string | null {
  const session = request.session as Record<string, unknown> | undefined;
  if (session && typeof session.csrfToken === 'string') {
    return session.csrfToken;
  }
  return null;
}
