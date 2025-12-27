import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

type RequestWithId = Request & { requestId?: string };

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<RequestWithId>();
    const response = ctx.getResponse<Response>();
    const { method, url, ip, headers } = request;
    const userAgent = normalizeHeaderValue(headers['user-agent']);
    const requestId = request.requestId;
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
        next: () => {
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
        error: (error: unknown) => {
          const duration = Date.now() - startTime;
          const errorMessage = getErrorMessage(error);
          const errorStack = getErrorStack(error);

          this.logger.error(
            JSON.stringify({
              msg: 'http_error',
              requestId,
              method,
              path: url,
              error: errorMessage,
              durationMs: duration,
            }),
            errorStack
          );
        },
      })
    );
  }
}

function normalizeHeaderValue(value: string | string[] | undefined): string {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.join(', ');
  }

  return 'Unknown';
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof (error as { message?: unknown }).message === 'string') {
    return (error as { message: string }).message;
  }

  return 'Unknown error';
}

function getErrorStack(error: unknown): string | undefined {
  if (error instanceof Error) {
    return error.stack;
  }

  if (typeof (error as { stack?: unknown }).stack === 'string') {
    return (error as { stack: string }).stack;
  }

  return undefined;
}
