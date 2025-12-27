import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';

export interface Response<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
  path?: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T> | T> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T> | T> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();

    return next.handle().pipe(
      map((data: unknown): T | Response<T> => {
        const requestUrl = request.originalUrl || request.url;
        if (requestUrl === '/metrics' || requestUrl.startsWith('/metrics/')) {
          return data as T;
        }
        if (requestUrl === '/api/metrics' || requestUrl.startsWith('/api/metrics/')) {
          return data as T;
        }

        // If the data is already in the correct format, return it as-is
        if (isWrappedResponse<T>(data)) {
          return data;
        }

        // Otherwise, wrap it in the standard format
        const message = getMessage(data);
        return {
          success: true,
          data: data as T,
          timestamp: new Date().toISOString(),
          path: request.url,
          ...(message ? { message } : {}),
        };
      })
    );
  }
}

function isWrappedResponse<T>(value: unknown): value is Response<T> {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;
  return typeof record.success === 'boolean' && 'data' in record;
}

function getMessage(value: unknown): string | undefined {
  if (typeof value !== 'object' || value === null) {
    return undefined;
  }

  const message = (value as Record<string, unknown>).message;
  return typeof message === 'string' ? message : undefined;
}
