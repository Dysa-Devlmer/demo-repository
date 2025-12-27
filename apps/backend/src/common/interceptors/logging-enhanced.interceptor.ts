import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { securityLogger, auditLogger } from '../../config/logger.config';

type RequestWithUser = Request & {
  user?: {
    id?: string;
    email?: string;
  };
};

@Injectable()
export class LoggingEnhancedInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingEnhancedInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, ip, headers } = request;
    const userAgent = normalizeHeaderValue(headers['user-agent']);
    const startTime = Date.now();

    // ID de request único
    const requestId = normalizeHeaderValue(headers['x-request-id']) || this.generateRequestId();

    // Añadir request ID a la response
    response.setHeader('X-Request-ID', requestId);

    // Log de inicio de request (solo en desarrollo)
    if (process.env.NODE_ENV !== 'production') {
      this.logger.debug(`➡️  ${method} ${url} - Request ID: ${requestId}`);
    }

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;

          // Log de acceso estándar
          const logData = {
            requestId,
            method,
            url,
            statusCode,
            duration: `${duration}ms`,
            ip,
            userAgent,
            timestamp: new Date().toISOString(),
          };

          // Log basado en status code
          if (statusCode >= 500) {
            this.logger.error(`❌ ${method} ${url} - ${statusCode} - ${duration}ms`, logData);
          } else if (statusCode >= 400) {
            this.logger.warn(`⚠️  ${method} ${url} - ${statusCode} - ${duration}ms`, logData);
          } else if (process.env.NODE_ENV !== 'production') {
            this.logger.log(`✅ ${method} ${url} - ${statusCode} - ${duration}ms`);
          }

          // Log de seguridad para endpoints sensibles
          if (this.isSecurityEndpoint(url)) {
            securityLogger.info('Security endpoint accessed', {
              ...logData,
              user: request.user?.id || 'anonymous',
            });
          }

          // Log de auditoría para operaciones críticas
          if (this.isAuditableOperation(method, url)) {
            auditLogger.info('Auditable operation', {
              ...logData,
              user: request.user?.id || 'anonymous',
              email: request.user?.email || 'unknown',
              body: this.sanitizeBody(request.body),
            });
          }
        },
        error: (error: unknown) => {
          const duration = Date.now() - startTime;
          const statusCode = getErrorStatus(error);

          const errorData = {
            requestId,
            method,
            url,
            statusCode,
            duration: `${duration}ms`,
            ip,
            userAgent,
            error: getErrorMessage(error),
            stack: getErrorStack(error),
            timestamp: new Date().toISOString(),
          };

          this.logger.error(
            `❌ ${method} ${url} - ${statusCode} - ${duration}ms - ${errorData.error}`,
            errorData
          );

          // Log de seguridad para errores de autenticación/autorización
          if (statusCode === 401 || statusCode === 403) {
            securityLogger.warn('Authentication/Authorization failed', {
              ...errorData,
              user: request.user?.id || 'anonymous',
            });
          }
        },
      })
    );
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private isSecurityEndpoint(url: string): boolean {
    const securityPatterns = [
      '/auth/',
      '/login',
      '/logout',
      '/register',
      '/password',
      '/users',
      '/roles',
      '/permissions',
    ];

    return securityPatterns.some((pattern) => url.includes(pattern));
  }

  private isAuditableOperation(method: string, url: string): boolean {
    // Solo auditar operaciones de escritura
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return false;
    }

    const auditablePatterns = [
      '/users',
      '/customers',
      '/orders',
      '/menu',
      '/reservations',
      '/settings',
      '/roles',
      '/permissions',
    ];

    return auditablePatterns.some((pattern) => url.includes(pattern));
  }

  private sanitizeBody(body: unknown): Record<string, unknown> {
    if (!isPlainObject(body)) return {};

    const sanitized: Record<string, unknown> = { ...body };

    // Remover campos sensibles
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'creditCard', 'ssn'];

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  return Object.getPrototypeOf(value) === Object.prototype;
}

function normalizeHeaderValue(value: string | string[] | undefined): string {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.join(', ');
  }

  return '';
}

function getErrorStatus(error: unknown): number {
  if (isPlainObject(error) && typeof error.status === 'number') {
    return error.status;
  }

  return 500;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (isPlainObject(error) && typeof error.message === 'string') {
    return error.message;
  }

  return 'Unknown error';
}

function getErrorStack(error: unknown): string | undefined {
  if (error instanceof Error) {
    return error.stack;
  }

  if (isPlainObject(error) && typeof error.stack === 'string') {
    return error.stack;
  }

  return undefined;
}
