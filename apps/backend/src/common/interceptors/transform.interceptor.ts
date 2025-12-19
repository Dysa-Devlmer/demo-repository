import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
  path?: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();

    return next.handle().pipe(
      map((data) => {
        // If the data is already in the correct format, return it as-is
        if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
          return data;
        }

        // Otherwise, wrap it in the standard format
        return {
          success: true,
          data,
          timestamp: new Date().toISOString(),
          path: request.url,
          ...(data?.message && { message: data.message }),
        };
      })
    );
  }
}
