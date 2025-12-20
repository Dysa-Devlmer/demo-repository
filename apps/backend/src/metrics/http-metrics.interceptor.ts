import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from './metrics.service';

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  constructor(private readonly metrics: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const req = http.getRequest();
    const res = http.getResponse();

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
          const route =
            (req.route && req.route.path) ||
            (req.baseUrl ? `${req.baseUrl}${req.path || ''}` : '') ||
            (path.split('?')[0] || 'unknown');
          const statusCode = String(res.statusCode ?? 0);

          this.metrics.httpRequestsTotal().inc({ method, route, status: statusCode });
          this.metrics.httpRequestDuration().observe({ method, route }, durationSeconds);
        },
      })
    );
  }
}
