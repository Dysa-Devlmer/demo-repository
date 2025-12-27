import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export interface AuditEvent {
  timestamp: string;
  requestId: string;
  userId?: string;
  clientIP: string;
  userAgent: string;
  method: string;
  path: string;
  query: Record<string, unknown>;
  body?: Record<string, unknown>;
  statusCode?: number;
  duration: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  securityFlags: string[];
}

interface SecurityMetrics {
  totalRequests: number;
  riskLevels: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  topIPs: Array<{ ip: string; count: number }>;
  averageResponseTime: number;
  securityFlags: Record<string, number>;
}

type RequestWithContext = Request & {
  requestId?: string;
  id?: string;
  user?: {
    sub?: string;
    id?: string;
    userId?: string;
  };
};

@Injectable()
export class AuditMiddleware implements NestMiddleware {
  private readonly logger = new Logger('🔍 SecurityAudit');
  private readonly auditEvents: AuditEvent[] = [];

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const incoming = req.get('x-request-id');
    const requestId =
      (req as RequestWithContext).requestId ||
      (incoming && incoming.trim() ? incoming.trim() : undefined) ||
      this.generateRequestId();

    // Add request ID to headers for tracing
    const reqWithContext = req as RequestWithContext;
    reqWithContext.requestId = requestId;
    reqWithContext.id = requestId;
    res.setHeader('X-Request-ID', requestId);

    // Capture response data
    const originalSend = res.send.bind(res) as (body?: unknown) => Response;
    res.send = function (body?: unknown) {
      const duration = Date.now() - startTime;

      // Create audit event
      const auditEvent: AuditEvent = {
        timestamp: new Date().toISOString(),
        requestId,
        userId: getUserId(reqWithContext),
        clientIP: getClientIP(req),
        userAgent: req.get('user-agent') || 'Unknown',
        method: req.method,
        path: req.path,
        query: toRecord(req.query),
        body: shouldLogBody(req) ? sanitizeBody(req.body) : undefined,
        statusCode: res.statusCode,
        duration,
        riskLevel: calculateRiskLevel(req, res, duration),
        securityFlags: getSecurityFlags(req, res),
      };

      // Log and store audit event
      logAuditEvent(auditEvent);

      return originalSend(body);
    };

    next();
  }

  private generateRequestId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get audit events for security dashboard
  getAuditEvents(limit: number = 100): AuditEvent[] {
    return this.auditEvents.slice(-limit);
  }

  // Get security metrics
  getSecurityMetrics(): SecurityMetrics {
    const recentEvents = this.auditEvents.slice(-1000);
    const averageResponseTime =
      recentEvents.length > 0
        ? recentEvents.reduce((sum, e) => sum + e.duration, 0) / recentEvents.length
        : 0;

    return {
      totalRequests: recentEvents.length,
      riskLevels: {
        low: recentEvents.filter((e) => e.riskLevel === 'LOW').length,
        medium: recentEvents.filter((e) => e.riskLevel === 'MEDIUM').length,
        high: recentEvents.filter((e) => e.riskLevel === 'HIGH').length,
        critical: recentEvents.filter((e) => e.riskLevel === 'CRITICAL').length,
      },
      topIPs: getTopIPs(recentEvents),
      averageResponseTime,
      securityFlags: getSecurityFlagsSummary(recentEvents),
    };
  }
}

// Helper functions
function getClientIP(req: Request): string {
  const forwarded = req.get('x-forwarded-for');
  const realIp = req.get('x-real-ip');
  const cfConnectingIp = req.get('cf-connecting-ip');

  return (
    forwarded?.split(',')[0] ||
    realIp ||
    cfConnectingIp ||
    req.ip ||
    req.connection.remoteAddress ||
    'unknown'
  );
}

function shouldLogBody(req: Request): boolean {
  // Don't log sensitive endpoints
  const sensitiveEndpoints = ['/auth/login', '/auth/register', '/users/password'];
  return !sensitiveEndpoints.some((endpoint) => req.path.includes(endpoint));
}

function sanitizeBody(body: unknown): Record<string, unknown> | undefined {
  if (!body) return undefined;
  if (!isPlainObject(body)) return undefined;

  const sanitized: Record<string, unknown> = { ...body };
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'creditCard'];

  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '***REDACTED***';
    }
  }

  return sanitized;
}

function calculateRiskLevel(
  req: Request,
  res: Response,
  duration: number
): AuditEvent['riskLevel'] {
  let riskScore = 0;

  // Authentication failures
  if (res.statusCode === 401) riskScore += 30;
  if (res.statusCode === 403) riskScore += 20;

  // Server errors
  if (res.statusCode >= 500) riskScore += 15;

  // Slow responses (potential DoS)
  if (duration > 5000) riskScore += 25;
  if (duration > 10000) riskScore += 40;

  // Suspicious paths
  const suspiciousPaths = ['/admin', '/wp-admin', '/.env', '/.git'];
  if (suspiciousPaths.some((path) => req.path.includes(path))) riskScore += 50;

  // Large payloads
  const contentLength = req.get('content-length');
  if (contentLength && parseInt(contentLength) > 1000000) {
    riskScore += 30;
  }

  // SQL injection patterns
  const sqlPatterns = /union.*select|drop.*table|insert.*into|delete.*from/i;
  if (sqlPatterns.test(req.url) || sqlPatterns.test(JSON.stringify(req.body))) {
    riskScore += 80;
  }

  if (riskScore >= 80) return 'CRITICAL';
  if (riskScore >= 50) return 'HIGH';
  if (riskScore >= 25) return 'MEDIUM';
  return 'LOW';
}

function getSecurityFlags(req: Request, res: Response): string[] {
  const flags: string[] = [];

  if (res.statusCode === 401) flags.push('AUTHENTICATION_FAILURE');
  if (res.statusCode === 403) flags.push('AUTHORIZATION_FAILURE');
  if (res.statusCode === 429) flags.push('RATE_LIMIT_EXCEEDED');

  // Check for suspicious patterns
  if (req.path.includes('..')) flags.push('PATH_TRAVERSAL_ATTEMPT');
  if (req.url.includes('<script')) flags.push('XSS_ATTEMPT');
  if (/union.*select/i.test(req.url)) flags.push('SQL_INJECTION_ATTEMPT');

  // Check user agent
  const userAgent = req.get('user-agent') || '';
  if (/bot|crawler|spider/i.test(userAgent) && !req.path.startsWith('/api/public')) {
    flags.push('BOT_ACCESS');
  }

  return flags;
}

function logAuditEvent(event: AuditEvent): void {
  const logger = new Logger('🔍 SecurityAudit');

  if (event.riskLevel === 'CRITICAL') {
    logger.error(
      `🚨 CRITICAL SECURITY EVENT: ${event.method} ${event.path} from ${event.clientIP} - Flags: ${event.securityFlags.join(', ')}`
    );
  } else if (event.riskLevel === 'HIGH') {
    logger.warn(
      `⚠️ HIGH RISK EVENT: ${event.method} ${event.path} from ${event.clientIP} - Flags: ${event.securityFlags.join(', ')}`
    );
  } else if (event.securityFlags.length > 0) {
    logger.debug(
      `🛡️ Security Event: ${event.method} ${event.path} - Flags: ${event.securityFlags.join(', ')}`
    );
  }

  // Store event (in production, send to external security system)
  // auditEvents.push(event);
}

function getTopIPs(events: AuditEvent[]): Array<{ ip: string; count: number }> {
  const ipCounts: Record<string, number> = {};

  events.forEach((event) => {
    ipCounts[event.clientIP] = (ipCounts[event.clientIP] || 0) + 1;
  });

  return Object.entries(ipCounts)
    .map(([ip, count]) => ({ ip, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

function getSecurityFlagsSummary(events: AuditEvent[]): Record<string, number> {
  const flagCounts: Record<string, number> = {};

  events.forEach((event) => {
    event.securityFlags.forEach((flag) => {
      flagCounts[flag] = (flagCounts[flag] || 0) + 1;
    });
  });

  return flagCounts;
}

function getUserId(req: RequestWithContext): string | undefined {
  return req.user?.sub || req.user?.id || req.user?.userId;
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
