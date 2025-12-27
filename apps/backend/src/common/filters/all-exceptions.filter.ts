import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';
    let errors: SafeErrorDetails | null = null;

    let extraFields: Record<string, unknown> = {};

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (isPlainObject(exceptionResponse)) {
        const responseMessage = exceptionResponse.message;
        message = typeof responseMessage === 'string' ? responseMessage : exception.message;
        errors = normalizeErrors(exceptionResponse.errors);

        // Preserve additional fields (e.g., rate limit info, retryAfter, etc.)
        extraFields = omitKeys(exceptionResponse, ['message', 'errors']);
      } else {
        message = getSafeMessage(exceptionResponse, exception.message);
      }
    } else {
      // Unhandled errors
      // Log the original error for debugging
      this.logger.error(
        'Unhandled exception',
        exception instanceof Error ? exception.stack : exception,
        AllExceptionsFilter.name
      );
    }

    const errorResponse: Record<string, unknown> = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      ...(errors ? { errors } : {}),
      ...extraFields, // Include all extra fields (retryAfter, failedAttempts, detail, etc.)
      ...(process.env.NODE_ENV === 'development' && {
        stack: exception instanceof Error ? exception.stack : undefined,
      }),
    };

    // Log error details
    this.logger.error(
      `${request.method} ${request.url} - Status: ${status} - Message: ${message}`,
      exception instanceof Error ? exception.stack : undefined
    );

    response.status(status).json(errorResponse);
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  return Object.getPrototypeOf(value) === Object.prototype;
}

function omitKeys(
  input: Record<string, unknown>,
  keys: Array<keyof Record<string, unknown>>
): Record<string, unknown> {
  const output: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(input)) {
    if (!keys.includes(key)) {
      output[key] = value;
    }
  }

  return output;
}

function getSafeMessage(value: unknown, fallback: string): string {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return fallback;
}

type SafeErrorDetails = Record<string, unknown> | string[] | string;

function normalizeErrors(value: unknown): SafeErrorDetails | null {
  if (isPlainObject(value)) {
    return value;
  }

  if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
    return value;
  }

  if (typeof value === 'string') {
    return value;
  }

  return null;
}
