import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import * as path from 'path';

const LOG_DIR = process.env.LOG_DIR || path.join(process.cwd(), 'logs');

// Formato personalizado para logs
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Formato para consola (más legible)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
    const contextStr = context ? `[${context}]` : '';
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
    return `${timestamp} ${level} ${contextStr} ${message} ${metaStr}`;
  })
);

// Transport para logs de aplicación (info, warn, error)
const appLogTransport = new DailyRotateFile({
  filename: path.join(LOG_DIR, 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d', // Retención de 30 días
  level: 'info',
  format: customFormat,
});

// Transport para logs de errores (solo errores)
const errorLogTransport = new DailyRotateFile({
  filename: path.join(LOG_DIR, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '90d', // Retención de 90 días para errores
  level: 'error',
  format: customFormat,
});

// Transport para logs de acceso (requests HTTP)
const accessLogTransport = new DailyRotateFile({
  filename: path.join(LOG_DIR, 'access-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '50m',
  maxFiles: '30d',
  level: 'info',
  format: customFormat,
});

// Transport para logs de seguridad (auth, rate-limit, etc)
const securityLogTransport = new DailyRotateFile({
  filename: path.join(LOG_DIR, 'security-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '90d', // Retención de 90 días para seguridad
  level: 'warn',
  format: customFormat,
});

// Transport para logs de auditoría (cambios críticos)
const auditLogTransport = new DailyRotateFile({
  filename: path.join(LOG_DIR, 'audit-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '365d', // Retención de 1 año para auditoría
  level: 'info',
  format: customFormat,
});

// Configuración de Winston
export const winstonConfig: WinstonModuleOptions = {
  transports: [
    // Consola (desarrollo)
    new winston.transports.Console({
      level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
      format: consoleFormat,
    }),

    // Archivos de log (producción y desarrollo)
    appLogTransport,
    errorLogTransport,
    accessLogTransport,
    securityLogTransport,
    auditLogTransport,
  ],

  // Salir en caso de error del logger
  exitOnError: false,

  // Nivel por defecto
  level: process.env.LOG_LEVEL || 'info',
};

// Exportar transports individuales para uso directo
export const logTransports = {
  app: appLogTransport,
  error: errorLogTransport,
  access: accessLogTransport,
  security: securityLogTransport,
  audit: auditLogTransport,
};

// Helper para crear un logger específico
export function createLogger(context: string) {
  return winston.createLogger({
    ...winstonConfig,
    defaultMeta: { context },
  });
}

// Logger de seguridad específico
export const securityLogger = winston.createLogger({
  transports: [securityLogTransport],
  format: customFormat,
});

// Logger de auditoría específico
export const auditLogger = winston.createLogger({
  transports: [auditLogTransport],
  format: customFormat,
});
