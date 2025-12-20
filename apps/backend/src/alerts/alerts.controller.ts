import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  Ip,
  Logger,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { AlertsService } from './alerts.service';
import { ListAlertsDto } from './dto/list-alerts.dto';

@Controller('alerts')
export class AlertsController {
  private readonly logger = new Logger('AlertsWebhook');

  constructor(private readonly alertsService: AlertsService) {}

  @Post('prometheus')
  async handlePrometheusAlert(
    @Body() body: any,
    @Headers('content-type') contentType: string | undefined,
    @Ip() ip: string,
    @Req() req: Request
  ) {
    const expected = process.env.ALERT_WEBHOOK_TOKEN;
    if (expected && expected.trim().length > 0) {
      const provided = (req.header('x-alert-webhook-token') || req.header('authorization') || '')
        .trim();
      const token = provided.startsWith('Bearer ') ? provided.slice(7).trim() : provided;

      if (!token || token !== expected) {
        throw new ForbiddenException('Invalid alert webhook token');
      }
    }

    const requestId = (req as any).requestId || (req as any).id;
    const alerts = Array.isArray(body?.alerts) ? body.alerts : [];
    const summary = alerts.map((a: any) => ({
      status: a?.status,
      alertname: a?.labels?.alertname,
      severity: a?.labels?.severity,
      instance: a?.labels?.instance,
      job: a?.labels?.job,
    }));

    this.logger.log(
      JSON.stringify({
        msg: 'alertmanager_webhook',
        requestId,
        ip,
        contentType,
        alertsCount: alerts.length,
        summary,
      })
    );

    const result = await this.alertsService.saveAlertmanager(body);

    return { ok: true, ...result, requestId };
  }

  @Get()
  async listAlerts(@Query() q: ListAlertsDto) {
    const result = await this.alertsService.list({
      page: q.page ?? 1,
      limit: q.limit ?? 25,
      status: q.status,
      severity: q.severity,
      alertname: q.alertname,
      sort: q.sort ?? 'createdAt:desc',
    });

    return { ok: true, ...result };
  }

  @Get(':id')
  async getAlert(@Param('id') id: string) {
    const item = await this.alertsService.getById(id);
    return { ok: true, item };
  }

  @Post(':id/ack')
  async acknowledgeAlert(@Param('id') id: string, @Body() body: { note?: string }, @Req() req: Request) {
    const user = (req as any).user;
    const by = user?.email || user?.id || 'system';
    const item = await this.alertsService.ack(id, { by, note: body?.note });
    return { ok: true, item };
  }
}
