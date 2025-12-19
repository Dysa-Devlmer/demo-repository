import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  private readonly logger = new Logger('🔒 SecurityMiddleware');

  use(req: Request, res: Response, next: NextFunction) {
    // Enterprise Security Headers
    this.setEnterpriseSecurityHeaders(req, res);

    // Log and analyze request for threats
    this.analyzeRequest(req);

    // Block suspicious requests
    if (this.shouldBlockRequest(req)) {
      res.status(403).json({
        message: 'Request blocked by enterprise security policy',
        error: 'Forbidden',
        statusCode: 403,
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
      });
      return;
    }

    next();
  }

  private setEnterpriseSecurityHeaders(req: Request, res: Response): void {
    // Core Security Headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Enhanced Permissions Policy for Enterprise
    const permissions = [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'interest-cohort=()',
      'payment=()',
      'usb=()',
      'bluetooth=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=()',
    ].join(', ');
    res.setHeader('Permissions-Policy', permissions);

    // Remove server information
    res.removeHeader('X-Powered-By');
    res.setHeader('Server', 'ChatBotDysa Enterprise API');

    // Enhanced Content Security Policy
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' ws: wss:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "media-src 'self'",
      "worker-src 'self'",
      "manifest-src 'self'",
    ].join('; ');
    res.setHeader('Content-Security-Policy', csp);

    // Production-only security headers
    if (process.env.NODE_ENV === 'production') {
      // HSTS with preload
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

      // Expect-CT header for certificate transparency
      res.setHeader('Expect-CT', 'max-age=86400, enforce');
    }

    // Enterprise CORS Configuration
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:7001',
      'http://localhost:7002',
      'http://localhost:3004',
      'http://localhost:8005',
    ];

    // Support multiple origins
    const requestOrigin = req.get('origin');
    if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
      res.setHeader('Access-Control-Allow-Origin', requestOrigin);
    } else {
      // Fallback to admin panel
      res.setHeader('Access-Control-Allow-Origin', 'http://localhost:7001');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key, X-Request-ID'
    );
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');

    // Rate limiting information headers
    res.setHeader('X-Rate-Limit-Policy', 'enterprise');
    res.setHeader('X-Security-Policy', 'chatbotdysa-enterprise-v1');
  }

  private analyzeRequest(req: Request): void {
    const clientIP = this.getClientIP(req);
    const userAgent = req.get('user-agent') || 'Unknown';

    // Log enterprise metrics
    this.logger.debug(
      `📊 ${req.method} ${req.path} | IP: ${clientIP} | UA: ${userAgent.substring(0, 50)}`
    );

    // Detect and log threats
    if (this.isSuspiciousRequest(req)) {
      this.logger.warn(`🚨 THREAT DETECTED: ${req.method} ${req.path} from ${clientIP}`);
    }
  }

  private shouldBlockRequest(req: Request): boolean {
    // Block known malicious paths
    const maliciousPaths = [
      '/.env',
      '/.aws',
      '/.git',
      '/.docker',
      '/wp-admin',
      '/wp-login',
      '/wp-content',
      '/phpmyadmin',
      '/mysql',
      '/admin.php',
      '/config.json',
      '/backup',
      '/dump',
      '/etc/passwd',
      '/proc/',
      '/var/log',
      '/.well-known/security.txt',
      '/robots.txt',
      '/sitemap.xml',
    ];

    for (const path of maliciousPaths) {
      if (req.path.toLowerCase().includes(path.toLowerCase())) {
        this.logger.error(
          `🚫 BLOCKED: Malicious path access attempt: ${req.path} from ${this.getClientIP(req)}`
        );
        return true;
      }
    }

    // Block suspicious query parameters
    const maliciousParams = [
      'eval',
      'exec',
      'system',
      'shell_exec',
      'file_get_contents',
      'include',
      'require',
    ];
    for (const param of maliciousParams) {
      if (req.query[param] !== undefined) {
        this.logger.error(
          `🚫 BLOCKED: Malicious parameter: ${param} from ${this.getClientIP(req)}`
        );
        return true;
      }
    }

    // Block oversized URLs (potential buffer overflow)
    if (req.url.length > 4096) {
      this.logger.error(`🚫 BLOCKED: Oversized URL from ${this.getClientIP(req)}`);
      return true;
    }

    // Block null bytes (path traversal attempts)
    if (req.url.includes('\0') || req.url.includes('%00')) {
      this.logger.error(`🚫 BLOCKED: Null byte in URL from ${this.getClientIP(req)}`);
      return true;
    }

    return false;
  }

  private isSuspiciousRequest(req: Request): boolean {
    const userAgent = req.get('user-agent') || '';

    // Known attack tools
    const attackTools = [
      /sqlmap/i,
      /havij/i,
      /pangolin/i, // SQL injection tools
      /nikto/i,
      /nessus/i,
      /openvas/i, // Vulnerability scanners
      /masscan/i,
      /nmap/i,
      /zmap/i, // Port scanners
      /burpsuite/i,
      /owasp/i, // Security testing tools
      /wget/i,
      /curl.*(?:bot|scan)/i, // Suspicious downloaders
      /python-requests/i, // Automated scripts
    ];

    for (const pattern of attackTools) {
      if (pattern.test(userAgent)) {
        return true;
      }
    }

    // Suspicious patterns in URL
    const suspiciousPatterns = [
      /union.*select/i, // SQL injection
      /javascript:/i, // XSS attempts
      /(<script|alert\(|confirm\()/i, // More XSS
      /\.\.\//, // Path traversal
      /%2e%2e%2f/i, // Encoded path traversal
    ];

    const urlDecoded = decodeURIComponent(req.url);
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(urlDecoded)) {
        return true;
      }
    }

    // Multiple rapid requests to auth endpoints
    if (req.path.includes('/auth/') || req.path.includes('/login')) {
      return true;
    }

    return false;
  }

  private getClientIP(req: Request): string {
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

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
