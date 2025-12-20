import { Injectable, OnModuleInit } from '@nestjs/common';
import client from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  private readonly registry = new client.Registry();
  private httpRequests!: client.Counter<string>;
  private httpRequestDurationSeconds!: client.Histogram<string>;
  private dbUp!: client.Gauge<string>;
  private redisUp!: client.Gauge<string>;

  onModuleInit() {
    client.collectDefaultMetrics({ register: this.registry });

    this.httpRequests = new client.Counter({
      name: 'http_requests_total',
      help: 'Total HTTP requests',
      labelNames: ['method', 'route', 'status'],
      registers: [this.registry],
    });

    this.httpRequestDurationSeconds = new client.Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route'],
      buckets: [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
      registers: [this.registry],
    });

    this.dbUp = new client.Gauge({
      name: 'db_up',
      help: 'Database connectivity (1=up, 0=down)',
      registers: [this.registry],
    });

    this.redisUp = new client.Gauge({
      name: 'redis_up',
      help: 'Redis connectivity (1=up, 0=down)',
      registers: [this.registry],
    });

    this.dbUp.set(0);
    this.redisUp.set(0);
  }

  httpRequestsTotal() {
    return this.httpRequests;
  }

  httpRequestDuration() {
    return this.httpRequestDurationSeconds;
  }

  setDbUp(value: number) {
    this.dbUp.set(value);
  }

  setRedisUp(value: number) {
    this.redisUp.set(value);
  }

  async metrics(): Promise<string> {
    return this.registry.metrics();
  }

  contentType(): string {
    return this.registry.contentType;
  }
}
