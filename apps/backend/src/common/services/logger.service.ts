import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import * as path from 'path';
import * as fs from 'fs';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  HTTP = 'http',
  VERBOSE = 'verbose',
  DEBUG = 'debug',
  SILLY = 'silly',
}

export interface LogContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  userAgent?: string;
  ip?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  responseTime?: number;
  module?: string;
  action?: string;
  resourceId?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.initializeLogger();
  }

  private initializeLogger() {
    // Ensure logs directory exists
    const logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    // Custom format for structured logging
    const logFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
      winston.format.errors({ stack: true }),
      winston.format.json(),
      winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
        const logEntry: any = {
          timestamp,
          level: level.toUpperCase(),
          message,
          ...meta,
        };

        if (stack) {
          logEntry.stack = stack;
        }

        return JSON.stringify(logEntry);
      })
    );

    // Console format for development
    const consoleFormat = winston.format.combine(
      winston.format.timestamp({ format: 'HH:mm:ss' }),
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, module, action }) => {
        const moduleInfo = module && action ? `[${module}:${action}]` : '';
        return `${timestamp} ${level} ${moduleInfo} ${message}`;
      })
    );

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: logFormat,
      defaultMeta: {
        service: 'chatbotdysa-api',
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        hostname: require('os').hostname(),
        pid: process.pid,
      },
      transports: [
        // Console transport for development
        new winston.transports.Console({
          format: process.env.NODE_ENV === 'production' ? logFormat : consoleFormat,
          level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        }),

        // Application logs
        new winston.transports.File({
          filename: path.join(logDir, 'app.log'),
          level: 'info',
          maxsize: 10485760, // 10MB
          maxFiles: 5,
        }),

        // Error logs
        new winston.transports.File({
          filename: path.join(logDir, 'error.log'),
          level: 'error',
          maxsize: 10485760, // 10MB
          maxFiles: 5,
        }),

        // Access logs (HTTP requests)
        new winston.transports.File({
          filename: path.join(logDir, 'access.log'),
          level: 'http',
          maxsize: 10485760, // 10MB
          maxFiles: 10,
        }),

        // Audit logs (security and business events)
        new winston.transports.File({
          filename: path.join(logDir, 'audit.log'),
          level: 'info',
          maxsize: 10485760, // 10MB
          maxFiles: 10,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
            winston.format((info) => {
              return info.type === 'audit' ? info : false;
            })()
          ),
        }),
      ],

      // Handle uncaught exceptions
      exceptionHandlers: [
        new winston.transports.File({
          filename: path.join(logDir, 'exceptions.log'),
          maxsize: 10485760,
          maxFiles: 3,
        }),
      ],

      // Handle unhandled promise rejections
      rejectionHandlers: [
        new winston.transports.File({
          filename: path.join(logDir, 'rejections.log'),
          maxsize: 10485760,
          maxFiles: 3,
        }),
      ],
    });
  }

  // Standard logging methods
  error(message: string, context?: LogContext, error?: Error) {
    const meta: any = {
      type: 'application',
      ...context,
    };

    if (error) {
      meta.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    this.logger.error(message, meta);
  }

  warn(message: string, context?: LogContext) {
    this.logger.warn(message, {
      type: 'application',
      ...context,
    });
  }

  info(message: string, context?: LogContext) {
    this.logger.info(message, {
      type: 'application',
      ...context,
    });
  }

  debug(message: string, context?: LogContext) {
    this.logger.debug(message, {
      type: 'application',
      ...context,
    });
  }

  verbose(message: string, context?: LogContext) {
    this.logger.verbose(message, {
      type: 'application',
      ...context,
    });
  }

  // HTTP request logging
  logHttpRequest(request: any, response: any, responseTime: number) {
    const context: LogContext = {
      method: request.method,
      endpoint: request.originalUrl || request.url,
      statusCode: response.statusCode,
      responseTime,
      ip: request.ip || request.connection?.remoteAddress,
      userAgent: request.get('user-agent'),
      requestId: request.id,
    };

    const message = `${request.method} ${request.originalUrl || request.url} ${response.statusCode} - ${responseTime}ms`;

    this.logger.http(message, {
      type: 'http',
      ...context,
    });
  }

  // Business audit logging
  logAudit(
    event: string,
    context: LogContext & {
      userId?: string;
      action: string;
      resource: string;
      resourceId?: string;
      result: 'success' | 'failure' | 'blocked';
      reason?: string;
      oldValue?: any;
      newValue?: any;
    }
  ) {
    this.logger.info(`AUDIT: ${event}`, {
      type: 'audit',
      event,
      ...context,
    });
  }

  // Security event logging
  logSecurity(
    event: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    context: LogContext & {
      threat?: string;
      blocked?: boolean;
      countryCode?: string;
    }
  ) {
    this.logger.warn(`SECURITY: ${event}`, {
      type: 'security',
      severity,
      event,
      ...context,
    });
  }

  // Business metrics logging
  logMetrics(
    metric: string,
    value: number,
    unit: string,
    context?: LogContext & {
      aggregation?: 'sum' | 'avg' | 'count' | 'gauge';
      tags?: Record<string, string>;
    }
  ) {
    this.logger.info(`METRIC: ${metric}`, {
      type: 'metric',
      metric,
      value,
      unit,
      ...context,
    });
  }

  // Performance logging
  logPerformance(
    operation: string,
    duration: number,
    context?: LogContext & {
      success?: boolean;
      errorCount?: number;
      memoryUsed?: number;
      cpuUsed?: number;
    }
  ) {
    this.logger.info(`PERFORMANCE: ${operation}`, {
      type: 'performance',
      operation,
      duration,
      ...context,
    });
  }

  // Database query logging
  logDatabase(
    query: string,
    duration: number,
    context?: LogContext & {
      table?: string;
      operation?: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
      rowsAffected?: number;
      parameters?: any[];
    }
  ) {
    this.logger.debug(`DATABASE: ${query}`, {
      type: 'database',
      query: query.substring(0, 1000), // Truncate long queries
      duration,
      ...context,
    });
  }

  // API rate limit logging
  logRateLimit(
    event: 'hit' | 'exceeded',
    context: LogContext & {
      limit: number;
      remaining: number;
      resetTime?: number;
      endpoint: string;
    }
  ) {
    const level = event === 'exceeded' ? 'warn' : 'info';
    this.logger[level](`RATE_LIMIT: ${event}`, {
      type: 'rate_limit',
      event,
      ...context,
    });
  }

  // Integration logging (WhatsApp, Twilio, etc.)
  logIntegration(
    service: string,
    event: string,
    context: LogContext & {
      success?: boolean;
      responseCode?: number;
      responseTime?: number;
      messageId?: string;
      cost?: number;
    }
  ) {
    this.logger.info(`INTEGRATION: ${service} - ${event}`, {
      type: 'integration',
      service,
      event,
      ...context,
    });
  }

  // Business process logging
  logBusinessProcess(
    process: string,
    step: string,
    context: LogContext & {
      orderId?: string;
      customerId?: string;
      reservationId?: string;
      amount?: number;
      status?: string;
      duration?: number;
    }
  ) {
    this.logger.info(`BUSINESS: ${process} - ${step}`, {
      type: 'business',
      process,
      step,
      ...context,
    });
  }
}
