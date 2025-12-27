/**
 * Audit Interceptor
 * ChatBotDysa Enterprise
 *
 * Intercepta todas las solicitudes y registra eventos de auditoría
 * para operaciones críticas del sistema
 */

import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';

type RequestUser = {
  id?: string;
  email?: string;
  roles?: Array<{ name?: string }>;
};

type AuditUserSummary = {
  id?: string;
  email?: string;
  role?: string;
};

type RequestWithUser = Request & { user?: RequestUser };

type AuditLog = {
  timestamp: string;
  method: string;
  endpoint: string;
  user: AuditUserSummary | null;
  ip: string;
  userAgent: string;
  requestBody?: Record<string, unknown>;
  isCritical: boolean;
  isMutation: boolean;
  status?: 'success' | 'error';
  statusCode?: number;
  duration?: string;
  responseSize?: number;
  errorMessage?: string;
  errorStack?: string;
};

type SecurityAlert = {
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  details?: Record<string, unknown>;
};

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  // Endpoints críticos que requieren auditoría detallada
  private readonly criticalEndpoints = [
    '/api/users',
    '/api/roles',
    '/api/security',
    '/api/settings',
    '/api/customers',
  ];

  // Métodos HTTP que modifican datos
  private readonly mutationMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const { method, originalUrl, ip, headers } = request;
    const userAgent = normalizeHeaderValue(headers['user-agent']);
    const user = (request as RequestWithUser).user;

    const startTime = Date.now();

    // Determinar si es un endpoint crítico
    const isCritical = this.isCriticalEndpoint(originalUrl);
    const isMutation = this.mutationMethods.includes(method);

    // Datos de auditoría
    const auditData: AuditLog = {
      timestamp: new Date().toISOString(),
      method,
      endpoint: originalUrl,
      user: user
        ? {
            id: user.id,
            email: user.email,
            role: user.roles?.[0]?.name || 'unknown',
          }
        : null,
      ip,
      userAgent,
      requestBody: isCritical ? this.sanitizeRequestBody(request.body) : undefined,
      isCritical,
      isMutation,
    };

    // Log de la solicitud
    if (isCritical || isMutation) {
      this.logger.log(
        `[AUDIT] ${method} ${originalUrl} - User: ${user?.email || 'Anonymous'} - IP: ${ip}`
      );
    }

    return next.handle().pipe(
      tap((data: unknown) => {
        const duration = Date.now() - startTime;

        // Log exitoso
        const successAudit = {
          ...auditData,
          status: 'success',
          statusCode: response.statusCode,
          duration: `${duration}ms`,
          responseSize: JSON.stringify(data).length,
        };

        if (isCritical || isMutation) {
          this.logAuditEvent(successAudit, 'success');
        }

        // Alertas para operaciones críticas específicas
        this.checkForSecurityAlerts(successAudit);
      }),
      catchError((error: unknown) => {
        const duration = Date.now() - startTime;
        const errorStatus = getErrorStatus(error);
        const errorMessage = getErrorMessage(error);
        const errorStack = getErrorStack(error);

        // Log de error
        const errorAudit = {
          ...auditData,
          status: 'error',
          statusCode: errorStatus,
          errorMessage,
          errorStack: process.env.NODE_ENV === 'development' ? errorStack : undefined,
          duration: `${duration}ms`,
        };

        this.logAuditEvent(errorAudit, 'error');

        // Alertas de seguridad para errores de autorización
        if (errorStatus === 401 || errorStatus === 403) {
          this.securityAlert(errorAudit);
        }

        throw error;
      })
    );
  }

  /**
   * Verifica si el endpoint es crítico
   */
  private isCriticalEndpoint(url: string): boolean {
    return this.criticalEndpoints.some((endpoint) => url.includes(endpoint));
  }

  /**
   * Sanitiza el body de la request removiendo datos sensibles
   */
  private sanitizeRequestBody(body: unknown): Record<string, unknown> | undefined {
    if (!body) return undefined;
    if (!isPlainObject(body)) return undefined;

    const sanitized: Record<string, unknown> = { ...body };
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'credential'];

    Object.keys(sanitized).forEach((key) => {
      if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
        sanitized[key] = '***REDACTED***';
      }
    });

    return sanitized;
  }

  /**
   * Registra evento de auditoría
   */
  private logAuditEvent(audit: AuditLog, level: 'success' | 'error'): void {
    const logMessage = {
      timestamp: audit.timestamp,
      level,
      user: audit.user?.email || 'Anonymous',
      action: `${audit.method} ${audit.endpoint}`,
      status: audit.statusCode,
      duration: audit.duration,
      ip: audit.ip,
    };

    if (level === 'success') {
      this.logger.log(`[AUDIT SUCCESS] ${JSON.stringify(logMessage)}`);
    } else {
      this.logger.error(`[AUDIT ERROR] ${JSON.stringify(logMessage)}`);
    }

    // TODO: Guardar en base de datos de auditoría
    // await this.auditLogService.create(audit);
  }

  /**
   * Verifica y genera alertas de seguridad
   */
  private checkForSecurityAlerts(audit: AuditLog): void {
    const user = audit.user;

    // Alerta: Usuario eliminado
    if (audit.method === 'DELETE' && audit.endpoint.includes('/api/users/')) {
      this.securityAlert({
        type: 'USER_DELETED',
        severity: 'HIGH',
        message: `User deleted by ${user?.email}`,
        details: toRecord(audit),
      });
    }

    // Alerta: Rol modificado
    if (
      (audit.method === 'PUT' || audit.method === 'PATCH') &&
      audit.endpoint.includes('/api/roles/')
    ) {
      this.securityAlert({
        type: 'ROLE_MODIFIED',
        severity: 'HIGH',
        message: `Role modified by ${user?.email}`,
        details: toRecord(audit),
      });
    }

    // Alerta: Configuración del sistema modificada
    if (
      (audit.method === 'PUT' || audit.method === 'PATCH') &&
      audit.endpoint.includes('/api/settings')
    ) {
      this.securityAlert({
        type: 'SYSTEM_CONFIG_CHANGED',
        severity: 'MEDIUM',
        message: `System configuration changed by ${user?.email}`,
        details: toRecord(audit),
      });
    }

    // Alerta: Múltiples eliminaciones
    if (audit.method === 'DELETE' && audit.isCritical) {
      // TODO: Implementar rate limiting para detectar eliminaciones masivas
      this.logger.warn(`[SECURITY] Critical deletion by ${user?.email}`);
    }
  }

  /**
   * Genera alerta de seguridad
   */
  private securityAlert(alert: SecurityAlert | AuditLog): void {
    this.logger.warn(`[SECURITY ALERT] ${JSON.stringify(alert)}`);

    // TODO: Implementar notificaciones
    // - Enviar email a administradores
    // - Webhook a sistema de monitoreo
    // - Guardar en tabla de alertas de seguridad
    // - Notificación push si es crítico
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  return Object.getPrototypeOf(value) === Object.prototype;
}

function toRecord(value: unknown): Record<string, unknown> {
  if (isPlainObject(value)) {
    return value;
  }

  return {};
}

function normalizeHeaderValue(value: string | string[] | undefined): string {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.join(', ');
  }

  return 'Unknown';
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
