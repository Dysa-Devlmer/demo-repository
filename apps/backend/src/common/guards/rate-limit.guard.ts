import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";

interface RateLimitRule {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  blockDurationMs?: number; // How long to block after limit exceeded
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RequestRecord {
  count: number;
  resetTime: number;
  blocked: boolean;
  blockedUntil?: number;
  failedAttempts?: number; // Track failed attempts for progressive delay
  lastAttemptTime?: number; // Track last attempt for progressive delay
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private requestCounts = new Map<string, RequestRecord>();

  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Get rate limit configuration from metadata
    const rateLimitConfig = this.reflector.getAllAndOverride<RateLimitRule>(
      "rateLimit",
      [context.getHandler(), context.getClass()],
    );

    // If no rate limit config, allow request
    if (!rateLimitConfig) {
      return true;
    }

    const clientIdentifier = this.getClientIdentifier(request);
    const now = Date.now();

    // Clean up old entries periodically
    this.cleanupOldEntries(now);

    // Get or create request record
    let record = this.requestCounts.get(clientIdentifier);

    if (!record) {
      record = {
        count: 0,
        resetTime: now + rateLimitConfig.windowMs,
        blocked: false,
      };
      this.requestCounts.set(clientIdentifier, record);
    }

    // Check if client is currently blocked
    if (record.blocked && record.blockedUntil && now < record.blockedUntil) {
      const waitTime = Math.ceil((record.blockedUntil - now) / 1000);
      throw new HttpException(
        {
          message: `Demasiados intentos. Por favor, espera ${waitTime} segundos antes de volver a intentarlo.`,
          error: "Límite de Solicitudes Excedido",
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          retryAfter: waitTime,
          failedAttempts: record.failedAttempts || 1,
          detail: `Intento ${record.failedAttempts || 1}: Espera ${waitTime}s. Cliente bloqueado hasta ${new Date(record.blockedUntil).toISOString()}`,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Reset counter if time window has passed
    if (now >= record.resetTime) {
      record.count = 0;
      record.resetTime = now + rateLimitConfig.windowMs;
      record.blocked = false;
      record.blockedUntil = undefined;
    }

    // Check if limit exceeded
    if (record.count >= rateLimitConfig.maxRequests) {
      // Initialize failed attempts if not present
      if (!record.failedAttempts) {
        record.failedAttempts = 0;
      }

      // Increment failed attempts for progressive delay
      record.failedAttempts++;

      // Calculate progressive block duration (starts at 15 seconds, doubles each time)
      // Formula: 15s * 2^(attempts - 1)
      // 1st: 15s, 2nd: 30s, 3rd: 60s, 4th: 2min, 5th: 4min, etc.
      const baseDelay = 15 * 1000; // 15 seconds base
      const maxDelay = 60 * 60 * 1000; // Max 1 hour
      const progressiveDelay = Math.min(
        baseDelay * Math.pow(2, record.failedAttempts - 1),
        maxDelay
      );

      // Block client with progressive duration
      record.blocked = true;
      record.blockedUntil = now + progressiveDelay;
      record.lastAttemptTime = now;

      throw new HttpException(
        {
          message: `Demasiados intentos. Por favor, espera ${Math.ceil(progressiveDelay / 1000)} segundos antes de volver a intentarlo.`,
          error: "Límite de Solicitudes Excedido",
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          limit: rateLimitConfig.maxRequests,
          windowMs: rateLimitConfig.windowMs,
          retryAfter: Math.ceil(progressiveDelay / 1000),
          failedAttempts: record.failedAttempts,
          detail: `Intento ${record.failedAttempts}: Espera ${Math.ceil(progressiveDelay / 1000)}s. Cada intento erróneo duplica el tiempo de espera.`,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Increment request count
    record.count++;

    // Add rate limit headers to response
    const response = context.switchToHttp().getResponse();
    response.setHeader("X-RateLimit-Limit", rateLimitConfig.maxRequests);
    response.setHeader(
      "X-RateLimit-Remaining",
      Math.max(0, rateLimitConfig.maxRequests - record.count),
    );
    response.setHeader(
      "X-RateLimit-Reset",
      new Date(record.resetTime).toISOString(),
    );
    response.setHeader("X-RateLimit-Window", rateLimitConfig.windowMs);

    return true;
  }

  private getClientIdentifier(request: Request): string {
    // Priority order for client identification
    const forwarded = request.get("x-forwarded-for");
    const realIp = request.get("x-real-ip");
    const cfConnectingIp = request.get("cf-connecting-ip");

    // Use forwarded IP, real IP, CloudFlare IP, or connection IP
    const ip =
      forwarded?.split(",")[0] ||
      realIp ||
      cfConnectingIp ||
      request.ip ||
      request.connection.remoteAddress;

    // Include user ID if authenticated for more granular limiting
    const userId = (request as any).user?.id;

    return userId ? `user:${userId}` : `ip:${ip}`;
  }

  private cleanupOldEntries(now: number): void {
    // Clean up entries that have expired (run cleanup every 100 requests)
    if (Math.random() < 0.01) {
      for (const [key, record] of this.requestCounts.entries()) {
        if (now >= record.resetTime && !record.blocked) {
          this.requestCounts.delete(key);
        }
      }
    }
  }
}
