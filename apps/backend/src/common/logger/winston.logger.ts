import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

export interface LogContext {
  userId?: number;
  userEmail?: string;
  requestId?: string;
  ip?: string;
  userAgent?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  responseTime?: number;
  [key: string]: any;
}

@Injectable()
export class WinstonLogger implements LoggerService {
  private readonly logger: winston.Logger;

  constructor() {
    const logFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
      winston.format.errors({ stack: true }),
      winston.format.json(),
      winston.format.printf(({ timestamp, level, message, context, trace, ...meta }) => {
        const logEntry = {
          timestamp,
          level: level.toUpperCase(),
          message,
          context: context || 'Application',
          environment: process.env.NODE_ENV || 'development',
          service: 'chatbotdysa-backend',
          version: process.env.npm_package_version || '1.0.0',
          ...(trace ? { trace } : {}),
          ...meta,
        };
        return JSON.stringify(logEntry);
      })
    );

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: logFormat,
      defaultMeta: {
        service: 'chatbotdysa-backend',
        environment: process.env.NODE_ENV || 'development',
      },
      transports: [
        // Console transport for development
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
            winston.format.printf(({ timestamp, level, message, context }) => {
              return `${timestamp} [${context || 'App'}] ${level}: ${message}`;
            })
          ),
        }),

        // File transport for all logs
        new winston.transports.DailyRotateFile({
          filename: 'logs/app-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '100m',
          maxFiles: '30d',
          auditFile: 'logs/app-audit.json',
        }),

        // Separate file for errors
        new winston.transports.DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          maxSize: '100m',
          maxFiles: '90d',
          auditFile: 'logs/error-audit.json',
        }),

        // Separate file for HTTP requests
        new winston.transports.DailyRotateFile({
          filename: 'logs/http-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '100m',
          maxFiles: '30d',
          auditFile: 'logs/http-audit.json',
          format: winston.format.combine(logFormat, winston.format.label({ label: 'HTTP' })),
        }),

        // Security logs
        new winston.transports.DailyRotateFile({
          filename: 'logs/security-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '100m',
          maxFiles: '180d', // Keep security logs longer
          auditFile: 'logs/security-audit.json',
          format: winston.format.combine(logFormat, winston.format.label({ label: 'SECURITY' })),
        }),
      ],

      // Handle uncaught exceptions and rejections
      exceptionHandlers: [
        new winston.transports.DailyRotateFile({
          filename: 'logs/exceptions-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '100m',
          maxFiles: '90d',
        }),
      ],

      rejectionHandlers: [
        new winston.transports.DailyRotateFile({
          filename: 'logs/rejections-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '100m',
          maxFiles: '90d',
        }),
      ],
    });

    // Create logs directory if it doesn't exist
    const fs = require('fs');
    if (!fs.existsSync('logs')) {
      fs.mkdirSync('logs', { recursive: true });
    }
  }

  log(message: string, context?: string, meta?: LogContext) {
    this.logger.info(message, { context, ...meta });
  }

  error(message: string, trace?: string, context?: string, meta?: LogContext) {
    this.logger.error(message, { context, trace, ...meta });
  }

  warn(message: string, context?: string, meta?: LogContext) {
    this.logger.warn(message, { context, ...meta });
  }

  debug(message: string, context?: string, meta?: LogContext) {
    this.logger.debug(message, { context, ...meta });
  }

  verbose(message: string, context?: string, meta?: LogContext) {
    this.logger.verbose(message, { context, ...meta });
  }

  // Enterprise-specific logging methods
  logHTTPRequest(meta: LogContext) {
    this.logger.info('HTTP Request', {
      context: 'HTTP',
      label: 'HTTP',
      ...meta,
    });
  }

  logSecurityEvent(
    message: string,
    meta: LogContext & { severity: 'low' | 'medium' | 'high' | 'critical' }
  ) {
    this.logger.warn(message, {
      context: 'SECURITY',
      label: 'SECURITY',
      ...meta,
    });
  }

  logBusinessEvent(message: string, meta: LogContext & { event: string; data?: any }) {
    this.logger.info(message, {
      context: 'BUSINESS',
      ...meta,
    });
  }

  logPerformance(message: string, meta: LogContext & { duration: number; operation: string }) {
    this.logger.info(message, {
      context: 'PERFORMANCE',
      ...meta,
    });
  }

  logDatabaseQuery(query: string, duration: number, meta?: LogContext) {
    this.logger.debug('Database Query', {
      context: 'DATABASE',
      query,
      duration,
      ...meta,
    });
  }

  // Method to create child logger with persistent context
  child(context: string, persistentMeta?: LogContext): WinstonLogger {
    const childLogger = new WinstonLogger();
    const originalLog = childLogger.log.bind(childLogger);
    const originalError = childLogger.error.bind(childLogger);
    const originalWarn = childLogger.warn.bind(childLogger);
    const originalDebug = childLogger.debug.bind(childLogger);

    childLogger.log = (message: string, childContext?: string, meta?: LogContext) =>
      originalLog(message, childContext || context, {
        ...persistentMeta,
        ...meta,
      });

    childLogger.error = (
      message: string,
      trace?: string,
      childContext?: string,
      meta?: LogContext
    ) =>
      originalError(message, trace, childContext || context, {
        ...persistentMeta,
        ...meta,
      });

    childLogger.warn = (message: string, childContext?: string, meta?: LogContext) =>
      originalWarn(message, childContext || context, {
        ...persistentMeta,
        ...meta,
      });

    childLogger.debug = (message: string, childContext?: string, meta?: LogContext) =>
      originalDebug(message, childContext || context, {
        ...persistentMeta,
        ...meta,
      });

    return childLogger;
  }

  // Get logger instance for direct use
  getWinstonInstance(): winston.Logger {
    return this.logger;
  }
}
