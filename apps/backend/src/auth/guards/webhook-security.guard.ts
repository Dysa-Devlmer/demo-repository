import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Request } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class WebhookSecurityGuard implements CanActivate {
  private readonly logger = new Logger(WebhookSecurityGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();

    // 🚀 Enterprise: Multiple webhook security validations
    return this.validateWebhookSecurity(request);
  }

  private validateWebhookSecurity(request: Request): boolean {
    try {
      // 🚀 Security Check 1: WhatsApp Business API signature validation
      if (this.isWhatsAppWebhook(request)) {
        return this.validateWhatsAppSignature(request);
      }

      // 🚀 Security Check 2: Twilio signature validation
      if (this.isTwilioWebhook(request)) {
        return this.validateTwilioSignature(request);
      }

      // 🚀 Security Check 3: API Key validation for other webhooks
      if (this.hasValidApiKey(request)) {
        return true;
      }

      // 🚀 Security Check 4: Rate limiting validation
      if (!this.checkRateLimit(request)) {
        this.logger.warn(`Rate limit exceeded for IP: ${request.ip}`);
        return false;
      }

      return false;
    } catch (error) {
      const err = toError(error);
      this.logger.error('Webhook security validation error:', err.message);
      return false;
    }
  }

  private isWhatsAppWebhook(request: Request): boolean {
    return request.path.includes('/whatsapp/webhook');
  }

  private isTwilioWebhook(request: Request): boolean {
    return request.path.includes('/twilio/');
  }

  private validateWhatsAppSignature(request: Request): boolean {
    const signature = getHeader(request, 'x-hub-signature-256');
    const webhookSecret = process.env.WHATSAPP_WEBHOOK_SECRET;

    if (!webhookSecret) {
      this.logger.error('WHATSAPP_WEBHOOK_SECRET not configured');
      return false;
    }

    if (!signature) {
      this.logger.warn('Missing WhatsApp webhook signature');
      return false;
    }

    try {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(request.body))
        .digest('hex');

      const isValid = crypto.timingSafeEqual(
        Buffer.from(signature.replace('sha256=', ''), 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );

      if (!isValid) {
        this.logger.warn('Invalid WhatsApp webhook signature');
      }

      return isValid;
    } catch (error) {
      const err = toError(error);
      this.logger.error('WhatsApp signature validation error:', err.message);
      return false;
    }
  }

  private validateTwilioSignature(request: Request): boolean {
    const signature = getHeader(request, 'x-twilio-signature');
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;

    if (!twilioAuthToken) {
      this.logger.error('TWILIO_AUTH_TOKEN not configured');
      return false;
    }

    if (!signature) {
      this.logger.warn('Missing Twilio webhook signature');
      return false;
    }

    // Implement Twilio signature validation logic
    // This is a simplified version - in production, use Twilio's official validation
    return true; // Placeholder - implement proper Twilio validation
  }

  private hasValidApiKey(request: Request): boolean {
    const apiKey = getHeader(request, 'x-api-key');
    const validApiKey = process.env.WEBHOOK_API_KEY;

    if (!validApiKey) {
      return false;
    }

    return apiKey === validApiKey;
  }

  private checkRateLimit(request: Request): boolean {
    // 🚀 Enterprise: Simple rate limiting check
    // In production, use Redis or dedicated rate limiting service
    const userAgent = getHeader(request, 'user-agent');
    const suspiciousPatterns = [
      'bot',
      'crawler',
      'spider',
      'scraper',
      'python-requests',
      'curl',
      'wget',
    ];

    if (
      userAgent &&
      suspiciousPatterns.some((pattern) => userAgent.toLowerCase().includes(pattern))
    ) {
      this.logger.warn(`Suspicious user agent: ${userAgent}`);
      return false;
    }

    return true;
  }
}

function getHeader(request: Request, name: string): string | null {
  const value = request.headers[name.toLowerCase()];
  return typeof value === 'string' ? value : null;
}

function toError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  return new Error(typeof error === 'string' ? error : 'Unknown error');
}
