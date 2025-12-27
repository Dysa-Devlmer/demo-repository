import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';

type RequestWithUser = Request & {
  user?: {
    id?: string | number;
  };
};

interface SecurityEvent {
  timestamp: string;
  eventType: 'request' | 'response' | 'error' | 'security_violation';
  method: string;
  url: string;
  userAgent: string;
  ip: string;
  userId?: string | number;
  statusCode?: number;
  responseTime?: number;
  contentLength?: number;
  referrer?: string;
  error?: string;
  securityFlags?: string[];
}

@Injectable()
export class SecurityLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('SecurityMonitor');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const response = context.switchToHttp().getResponse<Response>();
    const startTime = Date.now();

    // Extract request information
    const ip = this.getClientIP(request);
    const userAgent = normalizeHeaderValue(request.get('user-agent'));
    const userId = request.user?.id;

    // Log incoming request
    this.logSecurityEvent({
      timestamp: new Date().toISOString(),
      eventType: 'request',
      method: request.method,
      url: request.url,
      userAgent,
      ip,
      userId,
      referrer: request.get('referrer'),
      securityFlags: this.analyzeRequest(request),
    });

    return next.handle().pipe(
      tap(() => {
        // Log successful response
        const responseTime = Date.now() - startTime;
        const contentLength = response.get('content-length');

        this.logSecurityEvent({
          timestamp: new Date().toISOString(),
          eventType: 'response',
          method: request.method,
          url: request.url,
          userAgent,
          ip,
          userId,
          statusCode: response.statusCode,
          responseTime,
          contentLength: contentLength ? parseInt(contentLength, 10) : undefined,
        });
      }),
      catchError((error: unknown) => {
        // Log error response
        const responseTime = Date.now() - startTime;
        const statusCode = getErrorStatus(error);
        const errorMessage = getErrorMessage(error);

        this.logSecurityEvent({
          timestamp: new Date().toISOString(),
          eventType: 'error',
          method: request.method,
          url: request.url,
          userAgent,
          ip,
          userId,
          statusCode,
          responseTime,
          error: errorMessage,
          securityFlags: this.analyzeError(error),
        });

        throw error;
      })
    );
  }

  private getClientIP(request: Request): string {
    const forwarded = request.get('x-forwarded-for');
    const realIp = request.get('x-real-ip');
    const cfConnectingIp = request.get('cf-connecting-ip');

    return forwarded?.split(',')[0] || realIp || cfConnectingIp || request.ip || 'unknown';
  }

  private analyzeRequest(request: Request): string[] {
    const flags: string[] = [];

    // Suspicious methods
    if (!['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'].includes(request.method)) {
      flags.push('unusual_method');
    }

    // Suspicious headers
    if (request.get('x-forwarded-host') || request.get('x-original-host')) {
      flags.push('host_header_injection');
    }

    // Large request
    const contentLength = request.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > 1024 * 1024) {
      // 1MB
      flags.push('large_request');
    }

    // Suspicious user agent
    const userAgent = request.get('user-agent') || '';
    if (/bot|crawler|scanner|hack|exploit/i.test(userAgent)) {
      flags.push('suspicious_user_agent');
    }

    // No user agent (suspicious for API calls)
    if (!userAgent) {
      flags.push('no_user_agent');
    }

    // Suspicious paths
    if (
      request.path.includes('..') ||
      request.path.includes('/etc/') ||
      request.path.includes('/.env')
    ) {
      flags.push('path_traversal_attempt');
    }

    // Multiple authentication attempts
    if (request.path.includes('/auth/login') && request.method === 'POST') {
      flags.push('authentication_attempt');
    }

    // Admin endpoints
    if (request.path.includes('/admin')) {
      flags.push('admin_access');
    }

    // Bulk operations
    if (request.path.includes('/bulk') || request.path.includes('/batch')) {
      flags.push('bulk_operation');
    }

    // Export operations
    if (request.path.includes('/export') || request.path.includes('/download')) {
      flags.push('export_operation');
    }

    return flags;
  }

  private analyzeError(error: unknown): string[] {
    const flags: string[] = [];
    const status = getErrorStatus(error);
    const message = getErrorMessage(error);

    // Authentication/Authorization errors
    if (status === 401) {
      flags.push('authentication_failure');
    }

    if (status === 403) {
      flags.push('authorization_failure');
    }

    // Rate limiting
    if (status === 429) {
      flags.push('rate_limit_exceeded');
    }

    // Security violations
    if (message.includes('Suspicious') || message.includes('Blocked')) {
      flags.push('security_violation');
    }

    // SQL injection attempts (if database errors)
    if (message.includes('syntax error') || message.includes('invalid query')) {
      flags.push('possible_sql_injection');
    }

    // Server errors (potential attacks)
    if (status >= 500) {
      flags.push('server_error');
    }

    return flags;
  }

  private logSecurityEvent(event: SecurityEvent): void {
    // High-priority security events
    const criticalFlags = [
      'path_traversal_attempt',
      'host_header_injection',
      'possible_sql_injection',
      'security_violation',
    ];

    const isCritical = event.securityFlags?.some((flag) => criticalFlags.includes(flag));
    const isAuthFailure = event.securityFlags?.includes('authentication_failure');
    const isRateLimit = event.securityFlags?.includes('rate_limit_exceeded');

    if (isCritical) {
      this.logger.error(`🚨 CRITICAL SECURITY EVENT: ${JSON.stringify(event)}`);
    } else if (isAuthFailure) {
      this.logger.warn(`🔒 Authentication failure: ${event.ip} -> ${event.url}`);
    } else if (isRateLimit) {
      this.logger.warn(`⚠️  Rate limit exceeded: ${event.ip} -> ${event.url}`);
    } else if (event.eventType === 'error' && event.statusCode && event.statusCode >= 400) {
      this.logger.warn(`⚠️  HTTP Error ${event.statusCode}: ${event.ip} -> ${event.url}`);
    } else {
      // Regular request/response logging (debug level in production)
      this.logger.debug(
        `📊 ${event.method} ${event.url} - ${event.ip} - ${event.statusCode || 'pending'}`
      );
    }

    // In production, you would also send critical events to:
    // - SIEM systems (Splunk, ELK Stack)
    // - Security monitoring services (DataDog, New Relic)
    // - Incident response systems (PagerDuty)
    // - Log aggregation services (Loggly, Papertrail)

    if (isCritical && process.env.NODE_ENV === 'production') {
      this.alertSecurityTeam(event);
    }
  }

  private alertSecurityTeam(event: SecurityEvent): void {
    // In a real enterprise system, you would:
    // 1. Send to SIEM
    // 2. Trigger incident response
    // 3. Send alerts to security team
    // 4. Potentially block IP automatically

    this.logger.error(`🚨 SECURITY ALERT TRIGGERED: ${JSON.stringify(event, null, 2)}`);

    // Example integrations (implement based on your infrastructure):
    // - await this.slackService.sendSecurityAlert(event);
    // - await this.pagerDutyService.createIncident(event);
    // - await this.siemService.sendEvent(event);
    // - await this.firewallService.blockIP(event.ip);
  }
}

function normalizeHeaderValue(value: string | undefined): string {
  return value?.trim() || 'Unknown';
}

function getErrorStatus(error: unknown): number {
  if (error instanceof Error) {
    return (error as { status?: number }).status ?? 500;
  }

  if (typeof error === 'object' && error !== null) {
    const status = (error as { status?: unknown }).status;
    if (typeof status === 'number') {
      return status;
    }
  }

  return 500;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string') {
      return message;
    }
  }

  return 'Unknown error';
}
