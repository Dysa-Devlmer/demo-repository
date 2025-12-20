import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash } from 'crypto';
import { AlertInboxEntity } from './entities/alert-inbox.entity';

@Injectable()
export class AlertsService {
  constructor(
    @InjectRepository(AlertInboxEntity)
    private readonly repo: Repository<AlertInboxEntity>
  ) {}

  fingerprint(input: any): string {
    const labels = input?.labels ?? {};
    const status = input?.status ?? 'unknown';
    const base = JSON.stringify({ status, labels });
    return createHash('sha256').update(base).digest('hex');
  }

  async saveAlertmanager(body: any) {
    const alerts = Array.isArray(body?.alerts) ? body.alerts : [];
    const saved: string[] = [];

    for (const alert of alerts) {
      const labels = alert?.labels ?? {};
      const fingerprint = this.fingerprint(alert);

      const exists = await this.repo.findOne({ where: { fingerprint } });
      if (exists) continue;

      const row = this.repo.create({
        source: 'alertmanager',
        status: alert?.status ?? body?.status ?? 'unknown',
        alertname: labels?.alertname ?? 'unknown',
        severity: labels?.severity ?? null,
        instance: labels?.instance ?? null,
        job: labels?.job ?? null,
        fingerprint,
        payload: {
          labels,
          annotations: alert?.annotations ?? {},
          startsAt: alert?.startsAt,
          endsAt: alert?.endsAt,
          generatorURL: alert?.generatorURL,
        },
      });

      try {
        const out = await this.repo.save(row);
        saved.push(out.id);
      } catch (error: any) {
        if (error?.code !== '23505') {
          throw error;
        }
      }
    }

    return { received: alerts.length, saved: saved.length, ids: saved };
  }

  async list(params: {
    page: number;
    limit: number;
    status?: string;
    severity?: string;
    alertname?: string;
    sort?: 'createdAt:desc' | 'createdAt:asc';
  }) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 25;

    const qb = this.repo.createQueryBuilder('a');

    if (params.status) qb.andWhere('a.status = :status', { status: params.status });
    if (params.severity) qb.andWhere('a.severity = :severity', { severity: params.severity });
    if (params.alertname) qb.andWhere('a.alertname = :alertname', { alertname: params.alertname });

    const [field, dir] = (params.sort ?? 'createdAt:desc').split(':');
    qb.orderBy(`a.${field}`, dir.toUpperCase() as 'ASC' | 'DESC');

    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      items,
    };
  }

  async getById(id: string) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('Alert not found');
    }
    return item;
  }

  async ack(id: string, opts: { by: string; note?: string }) {
    const item = await this.getById(id);
    if (item.acknowledgedAt) {
      return item;
    }

    item.acknowledgedAt = new Date();
    item.acknowledgedBy = opts.by;
    item.ackNote = opts.note ?? null;

    return this.repo.save(item);
  }
}
