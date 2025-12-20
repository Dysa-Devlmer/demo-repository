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
    const requestId = (request as any).requestId;
    const startTime = Date.now();

    // Log the incoming request
    this.logger.log(
      JSON.stringify({
        msg: 'http_request',
        requestId,
        method,
        path: url,
        ip,
        userAgent,
      })
    );

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          const contentLength = response.get('content-length') || 0;

          this.logger.log(
            JSON.stringify({
              msg: 'http_response',
              requestId,
              method,
              path: url,
              statusCode: response.statusCode,
              durationMs: duration,
              sizeBytes: Number(contentLength),
            })
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;

          this.logger.error(
            JSON.stringify({
              msg: 'http_error',
              requestId,
              method,
              path: url,
              error: error.message,
              durationMs: duration,
            }),
            error.stack
          );
        },
      })
    );
  }
}
