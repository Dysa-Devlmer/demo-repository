import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
  Logger,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Reflector } from '@nestjs/core';
import { CACHE_KEY_METADATA, CACHE_TTL_METADATA } from '../decorators/cache-key.decorator';

type RequestWithUser = {
  url?: string;
  method?: string;
  query?: Record<string, unknown>;
  params?: Record<string, unknown>;
  user?: { id?: string };
};

type RedisClient = {
  keys?: (pattern: string) => Promise<string[]>;
};

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheInterceptor.name);

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private reflector: Reflector
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    // Check if cache is disabled for this endpoint
    const cacheDisabled = this.reflector.getAllAndOverride<boolean>('cache:disabled', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (cacheDisabled) {
      return next.handle();
    }

    // Only cache GET requests
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    if (request.method !== 'GET') {
      return this.handleInvalidation(context, next);
    }

    // Get cache key from metadata or generate from URL
    const cacheKeyMetadata = this.reflector.getAllAndOverride<
      string | ((req: RequestWithUser) => string)
    >(CACHE_KEY_METADATA, [context.getHandler(), context.getClass()]);

    const cacheKey =
      typeof cacheKeyMetadata === 'function'
        ? cacheKeyMetadata(request)
        : cacheKeyMetadata || this.generateCacheKey(request);

    // Get TTL from metadata
    const ttl = this.reflector.getAllAndOverride<number>(CACHE_TTL_METADATA, [
      context.getHandler(),
      context.getClass(),
    ]);

    try {
      // Try to get from cache
      const cachedResponse = await this.cacheManager.get<unknown>(cacheKey);

      if (cachedResponse !== undefined && cachedResponse !== null) {
        this.logger.debug(`Cache HIT: ${cacheKey}`);
        return of(cachedResponse);
      }

      this.logger.debug(`Cache MISS: ${cacheKey}`);

      // Execute request and cache response
      return next.handle().pipe(
        tap((response) => {
          void this.cacheManager
            .set(cacheKey, response, ttl)
            .then(() => {
              this.logger.debug(`Cache SET: ${cacheKey} (TTL: ${ttl || 'default'}s)`);
            })
            .catch((error: unknown) => {
              this.logger.error(`Failed to set cache for ${cacheKey}:`, error);
            });
        })
      );
    } catch (error: unknown) {
      this.logger.error(`Cache error for ${cacheKey}:`, error);
      // On cache error, proceed without caching
      return next.handle();
    }
  }

  private handleInvalidation(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const invalidatePatterns = this.reflector.getAllAndOverride<string[]>('cache:invalidate', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!invalidatePatterns || invalidatePatterns.length === 0) {
      return next.handle();
    }

    // Execute request first, then invalidate cache on success
    return next.handle().pipe(
      tap(() => {
        for (const pattern of invalidatePatterns) {
          void this.invalidatePattern(pattern)
            .then(() => {
              this.logger.debug(`Cache invalidated: ${pattern}`);
            })
            .catch((error: unknown) => {
              this.logger.error(`Failed to invalidate cache for ${pattern}:`, error);
            });
        }
      })
    );
  }

  private async invalidatePattern(pattern: string): Promise<void> {
    // Si el patrón contiene *, necesitamos buscar todas las keys que coincidan
    if (pattern.includes('*')) {
      // Nota: cache-manager no tiene soporte nativo para patterns
      // Necesitamos usar el cliente de Redis directamente
      const redisClient = getRedisClient(this.cacheManager);
      if (redisClient && redisClient.keys) {
        try {
          const keys = await redisClient.keys(pattern);
          this.logger.debug(`Found ${keys.length} keys matching pattern: ${pattern}`);
          for (const key of keys) {
            await this.cacheManager.del(key);
            this.logger.debug(`Deleted cache key: ${key}`);
          }
        } catch (error: unknown) {
          this.logger.error(`Failed to invalidate pattern ${pattern}:`, error);
        }
      } else {
        this.logger.warn(`Redis client not available for pattern invalidation: ${pattern}`);
      }
    } else {
      // Invalidar key específica
      await this.cacheManager.del(pattern);
      this.logger.debug(`Deleted cache key: ${pattern}`);
    }
  }

  private generateCacheKey(request: RequestWithUser): string {
    const { url, query, params, user } = request;
    const userId = user?.id || 'anonymous';
    const queryString = JSON.stringify(query);
    const paramsString = JSON.stringify(params);
    return `${url}:${userId}:${queryString}:${paramsString}`;
  }
}

function getRedisClient(cache: Cache): RedisClient | null {
  const store = (cache as Cache & { store?: { client?: RedisClient } }).store;
  return store?.client ?? null;
}
