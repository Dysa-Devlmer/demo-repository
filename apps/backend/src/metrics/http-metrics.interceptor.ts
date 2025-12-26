import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import type { Request, Response } from 'express';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from './metrics.service';

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  constructor(private readonly metrics: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    const path: string = req.originalUrl || req.url || '';
    if (path.startsWith('/metrics')) {
      return next.handle();
    }

    const start = process.hrtime.bigint();

    return next.handle().pipe(
      tap({
        next: () => {
          const end = process.hrtime.bigint();
          const durationSeconds = Number(end - start) / 1e9;
          const method = (req.method || 'UNKNOWN').toUpperCase();
          const reqRoute = (req as { route?: { path?: unknown } }).route;
          const routePath = typeof reqRoute?.path === 'string' ? reqRoute.path : undefined;
          const pathSegment = typeof req.path === 'string' ? req.path : '';
          const basePath =
            typeof req.baseUrl === 'string' ? `${req.baseUrl}${pathSegment}` : undefined;
          const safeRoute = routePath || basePath || path.split('?')[0] || 'unknown';
          const statusCode = String(res.statusCode ?? 0);

          this.metrics.httpRequestsTotal().inc({ method, route: safeRoute, status: statusCode });
          this.metrics.httpRequestDuration().observe({ method, route: safeRoute }, durationSeconds);
        },
      })
    );
  }
}
