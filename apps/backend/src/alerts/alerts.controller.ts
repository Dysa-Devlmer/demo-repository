import { Body, Controller, ForbiddenException, Headers, Ip, Logger, Post, Req } from '@nestjs/common';
import type { Request } from 'express';

@Controller('alerts')
export class AlertsController {
  private readonly logger = new Logger('AlertsWebhook');

  @Post('prometheus')
  handlePrometheusAlert(
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

    return { ok: true, received: alerts.length, requestId };
  }
}
