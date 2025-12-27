import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface CacheEntry {
  data: unknown;
  timestamp: number;
  ttl: number;
}

@Injectable()
export class CacheMiddleware implements NestMiddleware {
  private readonly logger = new Logger('CacheMiddleware');
  private cache = new Map<string, CacheEntry>();
  private readonly defaultTTL = 60 * 1000; // 1 minute default TTL

  use(req: Request, res: Response, next: NextFunction) {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip caching for auth and dynamic endpoints
    const skipPaths = ['/auth', '/ws', '/api/health'];
    if (skipPaths.some((path) => req.path.includes(path))) {
      return next();
    }

    const cacheKey = this.generateCacheKey(req);
    const cached = this.cache.get(cacheKey);

    // Return cached response if valid
    if (cached && this.isValidCache(cached)) {
      this.logger.debug(`Cache HIT: ${req.method} ${req.path}`, {
        key: cacheKey,
        age: Date.now() - cached.timestamp,
      });

      res.setHeader('X-Cache', 'HIT');
      res.setHeader('X-Cache-Age', Date.now() - cached.timestamp);
      return res.json(cached.data);
    }

    // Intercept response to cache it
    const originalJson = res.json.bind(res) as (body?: unknown) => Response;
    res.json = (data?: unknown): Response => {
      // Cache successful responses only
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const ttl = this.getTTL(req.path);
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          ttl,
        });

        this.logger.debug(`Cache MISS - Cached: ${req.method} ${req.path}`, {
          key: cacheKey,
          ttl,
          cacheSize: this.cache.size,
        });

        res.setHeader('X-Cache', 'MISS');
        res.setHeader('X-Cache-TTL', ttl);
      }

      return originalJson(data);
    };

    next();
  }

  private generateCacheKey(req: Request): string {
    const query = JSON.stringify(req.query);
    return `${req.method}:${req.path}:${query}`;
  }

  private isValidCache(cached: CacheEntry): boolean {
    return Date.now() - cached.timestamp < cached.ttl;
  }

  private getTTL(path: string): number {
    // Different TTL for different endpoints
    const ttlMap: Record<string, number> = {
      '/api/orders/stats': 5 * 60 * 1000, // 5 minutes for stats
      '/api/analytics': 10 * 60 * 1000, // 10 minutes for analytics
      '/api/orders': 30 * 1000, // 30 seconds for orders list
      '/api/customers': 2 * 60 * 1000, // 2 minutes for customers
    };

    for (const [pathPattern, ttl] of Object.entries(ttlMap)) {
      if (path.includes(pathPattern)) {
        return ttl;
      }
    }

    return this.defaultTTL;
  }

  // Clean up expired cache entries periodically
  public cleanupExpiredEntries(): void {
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (!this.isValidCache(entry)) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.debug(`Cache cleanup: removed ${cleaned} expired entries`, {
        remainingEntries: this.cache.size,
      });
    }
  }

  // Get cache statistics
  public getCacheStats() {
    let validEntries = 0;
    let expiredEntries = 0;

    for (const entry of this.cache.values()) {
      if (this.isValidCache(entry)) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    }

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      hitRate: '0%', // Would need to track hits/misses for real calculation
    };
  }
}
