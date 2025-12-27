import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from '../services/logger.service';
import { v4 as uuidv4 } from 'uuid';

type RequestWithId = Request & { id?: string };
type SendFn = (body?: unknown) => Response;

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(private readonly loggerService: LoggerService) {}

  use(req: RequestWithId, res: Response, next: NextFunction): void {
    // Generate unique request ID
    req.id = uuidv4();

    const startTime = Date.now();
    const originalUrl = req.originalUrl || req.url;
    const method = req.method;
    const userAgent = req.get('user-agent') || '';
    const ip = req.ip || req.connection?.remoteAddress || '';

    // Log request start
    this.loggerService.debug(`${method} ${originalUrl} - START`, {
      requestId: req.id,
      method,
      endpoint: originalUrl,
      ip,
      userAgent,
      module: 'HTTP',
      action: 'request_start',
      metadata: {
        headers: req.headers,
        query: req.query,
        params: req.params,
      },
    });

    // Hook into response finish
    const loggerService = this.loggerService;
    const originalSend = res.send.bind(res) as SendFn;

    res.send = function (body?: unknown) {
      const responseTime = Date.now() - startTime;
      const statusCode = res.statusCode;

      // Log response
      loggerService.logHttpRequest(req, res, responseTime);

      // Log slow requests (>2 seconds)
      if (responseTime > 2000) {
        loggerService.warn(`Slow request detected: ${method} ${originalUrl}`, {
          requestId: req.id,
          method,
          endpoint: originalUrl,
          statusCode,
          responseTime,
          ip,
          userAgent,
          module: 'HTTP',
          action: 'slow_request',
        });
      }

      // Log errors
      if (statusCode >= 400) {
        const level = statusCode >= 500 ? 'error' : 'warn';
        loggerService[level](`HTTP ${statusCode}: ${method} ${originalUrl}`, {
          requestId: req.id,
          method,
          endpoint: originalUrl,
          statusCode,
          responseTime,
          ip,
          userAgent,
          module: 'HTTP',
          action: 'error_response',
          metadata: {
            responseBody: toSafeString(body).substring(0, 500),
          },
        });
      }

      return originalSend(body);
    };

    next();
  }
}

function toSafeString(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  try {
    return JSON.stringify(value);
  } catch {
    return '[unserializable]';
  }
}
