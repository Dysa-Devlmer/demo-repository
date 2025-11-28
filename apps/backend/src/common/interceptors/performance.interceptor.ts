import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger('PerformanceInterceptor');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const startTime = Date.now();
    const method = request.method;
    const url = request.url;

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - startTime;

        // Log slow requests (> 100ms for enterprise standards)
        if (responseTime > 100) {
          this.logger.warn(
            `SLOW REQUEST: ${method} ${url} took ${responseTime}ms`,
            {
              method,
              url,
              responseTime,
              userAgent: request.get('user-agent'),
              ip: request.ip,
            }
          );
        }

        // Log all requests in development
        if (process.env.NODE_ENV === 'development') {
          this.logger.debug(
            `${method} ${url} - ${responseTime}ms`,
            {
              method,
              url,
              responseTime,
            }
          );
        }
      })
    );
  }
}