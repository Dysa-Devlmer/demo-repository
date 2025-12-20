import { Injectable } from '@nestjs/common';
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
}
