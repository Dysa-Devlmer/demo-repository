import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { WinstonLogger } from '../common/logger/winston.logger';
import { I18nService } from '../i18n/i18n.service';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import * as crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

export interface SecurityConfig {
  rateLimit: {
    windowMs: number;
    max: number;
    message: string;
    standardHeaders: boolean;
    legacyHeaders: boolean;
  };
  cors: {
    origin: string[] | boolean;
    methods: string[];
    allowedHeaders: string[];
    credentials: boolean;
    optionsSuccessStatus: number;
    maxAge: number;
  };
  helmet: {
    contentSecurityPolicy: boolean;
    crossOriginEmbedderPolicy: boolean;
    crossOriginOpenerPolicy: boolean;
    crossOriginResourcePolicy: boolean;
    dnsPrefetchControl: boolean;
    frameguard: boolean;
    hidePoweredBy: boolean;
    hsts: boolean;
    ieNoOpen: boolean;
    noSniff: boolean;
    originAgentCluster: boolean;
    permittedCrossDomainPolicies: boolean;
    referrerPolicy: boolean;
    xssFilter: boolean;
  };
  bruteForce: {
    freeRetries: number;
    minWait: number;
    maxWait: number;
    lifetime: number;
  };
  encryption: {
    algorithm: string;
    keyLength: number;
    ivLength: number;
  };
}

export interface SecurityAlert {
  id: string;
  type:
    | 'rate_limit'
    | 'brute_force'
    | 'suspicious_activity'
    | 'xss_attempt'
    | 'sql_injection'
    | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  ip: string;
  userAgent?: string;
  endpoint?: string;
  payload?: any;
  timestamp: Date;
  blocked: boolean;
  description: string;
}

@Injectable()
export class SecurityService implements OnModuleDestroy {
  private readonly logger = new WinstonLogger();
  private config: SecurityConfig;
  private failedAttempts: Map<string, { count: number; firstAttempt: Date; lockedUntil?: Date }> =
    new Map();
  private suspiciousIPs: Set<string> = new Set();
  private encryptionKey: string;
  private alerts: SecurityAlert[] = [];
  private cleanupIntervals: NodeJS.Timeout[] = [];

  constructor(private readonly i18n: I18nService) {
    this.config = {
      rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
        message: 'Too many requests from this IP, please try again later.',
        standardHeaders: true,
        legacyHeaders: false,
      },
      cors: {
        origin: process.env.CORS_ORIGIN
          ? process.env.CORS_ORIGIN === '*'
            ? true
            : process.env.CORS_ORIGIN.split(',')
          : ['http://localhost:3000', 'http://localhost:3001'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
        credentials: true,
        optionsSuccessStatus: 200,
        maxAge: 86400, // 24 hours
      },
      helmet: {
        contentSecurityPolicy: true,
        crossOriginEmbedderPolicy: false,
        crossOriginOpenerPolicy: true,
        crossOriginResourcePolicy: false,
        dnsPrefetchControl: true,
        frameguard: true,
        hidePoweredBy: true,
        hsts: true,
        ieNoOpen: true,
        noSniff: true,
        originAgentCluster: true,
        permittedCrossDomainPolicies: false,
        referrerPolicy: true,
        xssFilter: true,
      },
      bruteForce: {
        freeRetries: 5,
        minWait: 5 * 60 * 1000, // 5 minutes
        maxWait: 60 * 60 * 1000, // 1 hour
        lifetime: 24 * 60 * 60 * 1000, // 24 hours
      },
      encryption: {
        algorithm: 'aes-256-gcm',
        keyLength: 32,
        ivLength: 16,
      },
    };

    this.encryptionKey = process.env.ENCRYPTION_KEY || this.generateEncryptionKey();
    this.initializeSecurity();
  }

  private initializeSecurity() {
    try {
      // Clean up old failed attempts periodically
      const failedAttemptsInterval = setInterval(
        () => {
          this.cleanupFailedAttempts();
        },
        60 * 60 * 1000
      ); // Every hour
      failedAttemptsInterval.unref?.();
      this.cleanupIntervals.push(failedAttemptsInterval);

      // Clean up old alerts
      const alertsInterval = setInterval(
        () => {
          this.cleanupOldAlerts();
        },
        24 * 60 * 60 * 1000
      ); // Daily
      alertsInterval.unref?.();
      this.cleanupIntervals.push(alertsInterval);

      this.logger.log('Security service initialized', 'SecurityService', {
        rateLimitMax: this.config.rateLimit.max,
        corsOrigins: this.config.cors.origin,
        encryptionEnabled: !!this.encryptionKey,
      });
    } catch (error) {
      const err = toError(error);
      this.logger.error('Failed to initialize security service', err.stack, 'SecurityService');
    }
  }

  onModuleDestroy() {
    this.cleanupIntervals.forEach((intervalId) => clearInterval(intervalId));
    this.cleanupIntervals = [];
  }

  getRateLimitMiddleware() {
    return rateLimit({
      windowMs: this.config.rateLimit.windowMs,
      max: this.config.rateLimit.max,
      message: this.config.rateLimit.message,
      standardHeaders: this.config.rateLimit.standardHeaders,
      legacyHeaders: this.config.rateLimit.legacyHeaders,
      handler: (req: Request, res: Response) => {
        this.createSecurityAlert({
          type: 'rate_limit',
          severity: 'medium',
          ip: this.getClientIP(req),
          userAgent: req.get('User-Agent'),
          endpoint: req.path,
          blocked: true,
          description: `Rate limit exceeded for IP: ${this.getClientIP(req)}`,
        });

        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: this.config.rateLimit.message,
          retryAfter: Math.ceil(this.config.rateLimit.windowMs / 1000),
        });
      },
    });
  }

  getHelmetMiddleware() {
    return helmet({
      contentSecurityPolicy: this.config.helmet.contentSecurityPolicy
        ? {
            directives: {
              defaultSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
              fontSrc: ["'self'", 'https://fonts.gstatic.com'],
              imgSrc: ["'self'", 'data:', 'https:'],
              scriptSrc: ["'self'"],
              objectSrc: ["'none'"],
              upgradeInsecureRequests: [],
            },
          }
        : false,
      crossOriginEmbedderPolicy: this.config.helmet.crossOriginEmbedderPolicy,
      crossOriginOpenerPolicy: this.config.helmet.crossOriginOpenerPolicy,
      crossOriginResourcePolicy: this.config.helmet.crossOriginResourcePolicy
        ? { policy: 'cross-origin' }
        : false,
      dnsPrefetchControl: this.config.helmet.dnsPrefetchControl,
      frameguard: this.config.helmet.frameguard ? { action: 'deny' } : false,
      hidePoweredBy: this.config.helmet.hidePoweredBy,
      hsts: this.config.helmet.hsts
        ? {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true,
          }
        : false,
      ieNoOpen: this.config.helmet.ieNoOpen,
      noSniff: this.config.helmet.noSniff,
      originAgentCluster: this.config.helmet.originAgentCluster,
      permittedCrossDomainPolicies: this.config.helmet.permittedCrossDomainPolicies,
      referrerPolicy: this.config.helmet.referrerPolicy ? { policy: 'no-referrer' } : false,
      xssFilter: this.config.helmet.xssFilter,
    });
  }

  getCORSMiddleware() {
    return cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, etc.)
        if (!origin) return callback(null, true);

        const origins = Array.isArray(this.config.cors.origin)
          ? this.config.cors.origin
          : this.config.cors.origin === true
            ? [origin]
            : [];

        if (origins.includes(origin) || this.config.cors.origin === true) {
          callback(null, true);
        } else {
          this.createSecurityAlert({
            type: 'suspicious_activity',
            severity: 'medium',
            ip: 'unknown',
            description: `CORS violation: Unauthorized origin ${origin}`,
            blocked: true,
          });
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: this.config.cors.methods,
      allowedHeaders: this.config.cors.allowedHeaders,
      credentials: this.config.cors.credentials,
      optionsSuccessStatus: this.config.cors.optionsSuccessStatus,
      maxAge: this.config.cors.maxAge,
    });
  }

  createBruteForceProtection() {
    return (req: Request, res: Response, next: NextFunction) => {
      const ip = this.getClientIP(req);
      const key = `${ip}:${req.path}`;
      const now = new Date();

      const attempt = this.failedAttempts.get(key);

      if (attempt && attempt.lockedUntil && now < attempt.lockedUntil) {
        const remainingTime = Math.ceil((attempt.lockedUntil.getTime() - now.getTime()) / 1000);

        this.createSecurityAlert({
          type: 'brute_force',
          severity: 'high',
          ip,
          userAgent: req.get('User-Agent'),
          endpoint: req.path,
          blocked: true,
          description: `Brute force protection: IP ${ip} is locked`,
        });

        return res.status(429).json({
          error: 'Account temporarily locked',
          message: 'Too many failed attempts. Please try again later.',
          retryAfter: remainingTime,
        });
      }

      next();
    };
  }

  recordFailedAttempt(req: Request) {
    const ip = this.getClientIP(req);
    const key = `${ip}:${req.path}`;
    const now = new Date();

    const attempt = this.failedAttempts.get(key);

    if (!attempt) {
      this.failedAttempts.set(key, {
        count: 1,
        firstAttempt: now,
      });
    } else {
      attempt.count++;

      if (attempt.count >= this.config.bruteForce.freeRetries) {
        const lockDuration = Math.min(
          this.config.bruteForce.minWait *
            Math.pow(2, attempt.count - this.config.bruteForce.freeRetries),
          this.config.bruteForce.maxWait
        );

        attempt.lockedUntil = new Date(now.getTime() + lockDuration);

        this.createSecurityAlert({
          type: 'brute_force',
          severity: 'high',
          ip,
          userAgent: req.get('User-Agent'),
          endpoint: req.path,
          blocked: false,
          description: `Brute force detected: ${attempt.count} failed attempts from IP ${ip}`,
        });
      }
    }
  }

  clearFailedAttempts(req: Request) {
    const ip = this.getClientIP(req);
    const key = `${ip}:${req.path}`;
    this.failedAttempts.delete(key);
  }

  createXSSProtection() {
    return (req: Request, res: Response, next: NextFunction) => {
      const xssPatterns = [
        /<script[^>]*>[\s\S]*?<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /<iframe[^>]*>[\s\S]*?<\/iframe>/gi,
        /<object[^>]*>[\s\S]*?<\/object>/gi,
        /<embed[^>]*>/gi,
      ];

      const checkForXSS = (obj: unknown): boolean => {
        if (typeof obj === 'string') {
          return xssPatterns.some((pattern) => pattern.test(obj));
        } else if (typeof obj === 'object' && obj !== null) {
          return Object.values(obj as Record<string, unknown>).some((value) => checkForXSS(value));
        }
        return false;
      };

      if (checkForXSS(req.body) || checkForXSS(req.query) || checkForXSS(req.params)) {
        this.createSecurityAlert({
          type: 'xss_attempt',
          severity: 'high',
          ip: this.getClientIP(req),
          userAgent: req.get('User-Agent'),
          endpoint: req.path,
          payload: {
            body: toRecord(req.body),
            query: toRecord(req.query),
            params: toRecord(req.params),
          },
          blocked: true,
          description: 'XSS attempt detected in request',
        });

        return res.status(400).json({
          error: 'Invalid request',
          message: 'Potentially malicious content detected',
        });
      }

      next();
    };
  }

  createSQLInjectionProtection() {
    return (req: Request, res: Response, next: NextFunction) => {
      const sqlPatterns = [
        /(\b(ALTER|CREATE|DELETE|DROP|EXEC(UTE){0,1}|INSERT( +INTO){0,1}|MERGE|SELECT|UPDATE|UNION( +ALL){0,1})\b)/gi,
        /'[^']*('|$)/gi,
        /;[\s]*$/gi,
        /--[\s]*.*/gi,
        /\/\*[\s\S]*?\*\//gi,
      ];

      const checkForSQLInjection = (obj: unknown): boolean => {
        if (typeof obj === 'string') {
          return sqlPatterns.some((pattern) => pattern.test(obj));
        } else if (typeof obj === 'object' && obj !== null) {
          return Object.values(obj as Record<string, unknown>).some((value) =>
            checkForSQLInjection(value)
          );
        }
        return false;
      };

      if (
        checkForSQLInjection(req.body) ||
        checkForSQLInjection(req.query) ||
        checkForSQLInjection(req.params)
      ) {
        this.createSecurityAlert({
          type: 'sql_injection',
          severity: 'critical',
          ip: this.getClientIP(req),
          userAgent: req.get('User-Agent'),
          endpoint: req.path,
          payload: {
            body: toRecord(req.body),
            query: toRecord(req.query),
            params: toRecord(req.params),
          },
          blocked: true,
          description: 'SQL injection attempt detected',
        });

        return res.status(400).json({
          error: 'Invalid request',
          message: 'Potentially malicious content detected',
        });
      }

      next();
    };
  }

  encrypt(text: string): string {
    try {
      const iv = crypto.randomBytes(this.config.encryption.ivLength);
      const cipher = crypto.createCipheriv(
        this.config.encryption.algorithm,
        Buffer.from(this.encryptionKey.slice(0, 32)),
        iv
      );

      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      const err = toError(error);
      this.logger.error('Encryption failed', err.stack, 'SecurityService');
      throw new Error(this.i18n.t('errors.encryptionFailed'));
    }
  }

  decrypt(encryptedText: string): string {
    try {
      const parts = encryptedText.split(':');
      if (parts.length !== 2) {
        throw new Error(this.i18n.t('errors.invalidEncryptedFormat'));
      }

      const iv = Buffer.from(parts[0], 'hex');
      const encryptedData = parts[1];

      const decipher = crypto.createDecipheriv(
        this.config.encryption.algorithm,
        Buffer.from(this.encryptionKey.slice(0, 32)),
        iv
      );

      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      const err = toError(error);
      this.logger.error('Decryption failed', err.stack, 'SecurityService');
      throw new Error(this.i18n.t('errors.decryptionFailed'));
    }
  }

  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  hashPassword(password: string, salt?: string): { hash: string; salt: string } {
    const saltValue = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, saltValue, 10000, 64, 'sha512').toString('hex');
    return { hash, salt: saltValue };
  }

  verifyPassword(password: string, hash: string, salt: string): boolean {
    const expectedHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === expectedHash;
  }

  private createSecurityAlert(alert: Omit<SecurityAlert, 'id' | 'timestamp'>) {
    const fullAlert: SecurityAlert = {
      ...alert,
      id: this.generateSecureToken(16),
      timestamp: new Date(),
    };

    this.alerts.push(fullAlert);

    // Log security alert
    this.logger.logSecurityEvent(fullAlert.description, {
      alertId: fullAlert.id,
      type: fullAlert.type,
      severity: fullAlert.severity,
      ip: fullAlert.ip,
      endpoint: fullAlert.endpoint,
      blocked: fullAlert.blocked,
    });

    // Keep only last 1000 alerts
    if (this.alerts.length > 1000) {
      this.alerts = this.alerts.slice(-1000);
    }
  }

  private getClientIP(req: Request): string {
    const forwarded = req.get('x-forwarded-for');
    const realIP = req.get('x-real-ip');
    const remoteAddress = req.connection?.remoteAddress;

    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    if (realIP) {
      return realIP;
    }
    return remoteAddress || 'unknown';
  }

  private generateEncryptionKey(): string {
    const key = crypto.randomBytes(this.config.encryption.keyLength).toString('hex');
    this.logger.warn(
      'Generated new encryption key. Store this securely: ENCRYPTION_KEY=' + key,
      'SecurityService'
    );
    return key;
  }

  private cleanupFailedAttempts() {
    const now = new Date();
    const expired: string[] = [];

    for (const [key, attempt] of this.failedAttempts.entries()) {
      if (now.getTime() - attempt.firstAttempt.getTime() > this.config.bruteForce.lifetime) {
        expired.push(key);
      }
    }

    expired.forEach((key) => this.failedAttempts.delete(key));

    if (expired.length > 0) {
      this.logger.log(`Cleaned up ${expired.length} expired failed attempts`, 'SecurityService');
    }
  }

  private cleanupOldAlerts() {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30); // Keep alerts for 30 days

    const initialCount = this.alerts.length;
    this.alerts = this.alerts.filter((alert) => alert.timestamp > cutoff);

    const removedCount = initialCount - this.alerts.length;
    if (removedCount > 0) {
      this.logger.log(`Cleaned up ${removedCount} old security alerts`, 'SecurityService');
    }
  }

  getSecurityAlerts(limit: number = 100): SecurityAlert[] {
    return this.alerts
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  getSecurityStats() {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recent = this.alerts.filter((a) => a.timestamp > last24h);
    const weekly = this.alerts.filter((a) => a.timestamp > last7d);

    return {
      total: this.alerts.length,
      last24h: recent.length,
      last7d: weekly.length,
      blocked: this.alerts.filter((a) => a.blocked).length,
      byType: this.alerts.reduce(
        (acc, alert) => {
          acc[alert.type] = (acc[alert.type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      bySeverity: this.alerts.reduce(
        (acc, alert) => {
          acc[alert.severity] = (acc[alert.severity] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      failedAttempts: this.failedAttempts.size,
      suspiciousIPs: this.suspiciousIPs.size,
    };
  }

  updateSecurityConfig(newConfig: Partial<SecurityConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.logger.log('Security configuration updated', 'SecurityService');
  }

  getSecurityConfig(): SecurityConfig {
    return { ...this.config };
  }
}

function toError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  return new Error(typeof error === 'string' ? error : 'Unknown error');
}

function toRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object') {
    return {};
  }
  return value as Record<string, unknown>;
}
