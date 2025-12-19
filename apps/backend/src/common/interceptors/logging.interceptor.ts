import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || 'Unknown';
    const startTime = Date.now();

    // Log the incoming request
    this.logger.log(`➤ ${method} ${url} - IP: ${ip} - User-Agent: ${userAgent}`);

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          const contentLength = response.get('content-length') || 0;

          this.logger.log(
            `✓ ${method} ${url} - Status: ${response.statusCode} - Duration: ${duration}ms - Size: ${contentLength}b`
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;

          this.logger.error(
            `✗ ${method} ${url} - Error: ${error.message} - Duration: ${duration}ms`,
            error.stack
          );
        },
      })
    );
  }
}
