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
  query: any;
  body?: any;
  statusCode?: number;
  duration: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  securityFlags: string[];
}

@Injectable()
export class AuditMiddleware implements NestMiddleware {
  private readonly logger = new Logger('🔍 SecurityAudit');
  private readonly auditEvents: AuditEvent[] = [];

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    // Add request ID to headers for tracing
    req['requestId'] = requestId;
    res.setHeader('X-Request-ID', requestId);

    // Capture response data
    const originalSend = res.send;
    res.send = function (body) {
      const duration = Date.now() - startTime;

      // Create audit event
      const auditEvent: AuditEvent = {
        timestamp: new Date().toISOString(),
        requestId,
        userId:
          (req as any)['user']?.sub || (req as any)['user']?.id || (req as any)['user']?.userId,
        clientIP: getClientIP(req),
        userAgent: req.get('user-agent') || 'Unknown',
        method: req.method,
        path: req.path,
        query: req.query,
        body: shouldLogBody(req) ? sanitizeBody(req.body) : undefined,
        statusCode: res.statusCode,
        duration,
        riskLevel: calculateRiskLevel(req, res, duration),
        securityFlags: getSecurityFlags(req, res),
      };

      // Log and store audit event
      logAuditEvent(auditEvent);

      return originalSend.call(this, body);
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
  getSecurityMetrics(): any {
    const recentEvents = this.auditEvents.slice(-1000);

    return {
      totalRequests: recentEvents.length,
      riskLevels: {
        low: recentEvents.filter((e) => e.riskLevel === 'LOW').length,
        medium: recentEvents.filter((e) => e.riskLevel === 'MEDIUM').length,
        high: recentEvents.filter((e) => e.riskLevel === 'HIGH').length,
        critical: recentEvents.filter((e) => e.riskLevel === 'CRITICAL').length,
      },
      topIPs: getTopIPs(recentEvents),
      averageResponseTime:
        recentEvents.reduce((sum, e) => sum + e.duration, 0) / recentEvents.length,
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

function sanitizeBody(body: any): any {
  if (!body) return body;

  const sanitized = { ...body };
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
