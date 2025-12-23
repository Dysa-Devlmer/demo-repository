import { Injectable, OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { MetricsService } from './metrics.service';

@Injectable()
export class ConnectivityProbe implements OnModuleInit, OnModuleDestroy {
  private timer: NodeJS.Timeout | null = null;
  constructor(
    private readonly dataSource: DataSource,
    private readonly metrics: MetricsService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  onModuleInit() {
    const run = async () => {
      try {
        await this.dataSource.query('SELECT 1');
        this.metrics.setDbUp(1);
      } catch {
        this.metrics.setDbUp(0);
      }

      try {
        const store = (this.cacheManager as any).store;
        const redisClient =
          store?.client ||
          (typeof store?.getClient === 'function' ? store.getClient() : undefined);

        if (redisClient?.status === 'ready') {
          this.metrics.setRedisUp(1);
          return;
        }

        if (redisClient && typeof redisClient.ping === 'function') {
          const pong = await redisClient.ping();
          this.metrics.setRedisUp(pong === 'PONG' ? 1 : 0);
          return;
        }

        const key = '__metrics_redis_probe';
        await this.cacheManager.set(key, '1', 5);
        const value = await this.cacheManager.get<string>(key);
        this.metrics.setRedisUp(value === '1' ? 1 : 0);
      } catch {
        this.metrics.setRedisUp(0);
      }
    };

    void run();
    this.timer = setInterval(run, 15_000);
    this.timer.unref?.();
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
