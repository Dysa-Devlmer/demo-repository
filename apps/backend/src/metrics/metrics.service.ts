import { Injectable, OnModuleInit } from '@nestjs/common';
import client from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  private readonly registry = new client.Registry();
  private httpRequests!: client.Counter<string>;
  private httpRequestDurationSeconds!: client.Histogram<string>;

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
  }

  httpRequestsTotal() {
    return this.httpRequests;
  }

  httpRequestDuration() {
    return this.httpRequestDurationSeconds;
  }

  async metrics(): Promise<string> {
    return this.registry.metrics();
  }

  contentType(): string {
    return this.registry.contentType;
  }
}
