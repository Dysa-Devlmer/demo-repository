/**
 * Security Alerts Service
 * ChatBotDysa Enterprise - Professional Security Alert System
 *
 * Features:
 * - Multi-channel notifications (Email, SMS, Webhook)
 * - Alert throttling and deduplication
 * - Priority-based routing
 * - Alert aggregation
 * - Incident tracking
 */

import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailService } from '../../common/services/email.service';
import { TwilioService } from '../../modules/twilio/twilio.service';
import { AuditLog, AuditSeverity } from '../../common/entities/audit-log.entity';
import * as crypto from 'crypto';

export enum AlertPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum AlertChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  WEBHOOK = 'WEBHOOK',
  SLACK = 'SLACK',
}

export interface SecurityAlert {
  id: string;
  type: string;
  priority: AlertPriority;
  title: string;
  description: string;
  severity: AuditSeverity;
  timestamp: Date;
  source: string;
  metadata: any;
  affectedResources?: string[];
  recommendedActions?: string[];
  evidence?: any[];
}

export interface AlertConfig {
  enabled: boolean;
  channels: AlertChannel[];
  throttleWindow: number; // minutes
  maxAlertsPerWindow: number;
  recipients: {
    email?: string[];
    sms?: string[];
    webhook?: string[];
  };
  filters?: {
    minPriority?: AlertPriority;
    types?: string[];
    excludeTypes?: string[];
  };
}

interface AlertThrottle {
  alertType: string;
  count: number;
  firstSeen: Date;
  lastSeen: Date;
  alertIds: string[];
}

@Injectable()
export class SecurityAlertsService implements OnModuleDestroy {
  private readonly logger = new Logger(SecurityAlertsService.name);
  private readonly throttleCache = new Map<string, AlertThrottle>();
  private readonly alertHistory: SecurityAlert[] = [];
  private readonly maxHistorySize = 10000;
  private throttleCleanupInterval?: NodeJS.Timeout;

  // Default configuration
  private config: AlertConfig = {
    enabled: true,
    channels: [AlertChannel.EMAIL],
    throttleWindow: 15, // 15 minutes
    maxAlertsPerWindow: 5,
    recipients: {
      email: ['admin@zgamersa.com'],
      sms: [],
      webhook: [],
    },
    filters: {
      minPriority: AlertPriority.MEDIUM,
    },
  };

  constructor(
    private readonly emailService: EmailService,
    private readonly twilioService: TwilioService,
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>
  ) {
    this.startThrottleCleanup();
  }

  /**
   * Send security alert through configured channels
   */
  async sendAlert(alert: Omit<SecurityAlert, 'id' | 'timestamp'>): Promise<boolean> {
    try {
      const fullAlert: SecurityAlert = {
        ...alert,
        id: this.generateAlertId(),
        timestamp: new Date(),
      };

      // Check if alerts are enabled
      if (!this.config.enabled) {
        this.logger.warn('Security alerts are disabled');
        return false;
      }

      // Apply filters
      if (!this.shouldSendAlert(fullAlert)) {
        this.logger.debug(`Alert filtered out: ${fullAlert.type}`);
        return false;
      }

      // Check throttling
      const throttleKey = this.getThrottleKey(fullAlert);
      if (this.isThrottled(throttleKey, fullAlert)) {
        this.logger.warn(`Alert throttled: ${fullAlert.type}`);
        return false;
      }

      // Add to history
      this.addToHistory(fullAlert);

      // Send through all configured channels
      const results = await Promise.allSettled([
        this.sendEmailAlert(fullAlert),
        this.sendSMSAlert(fullAlert),
        this.sendWebhookAlert(fullAlert),
      ]);

      const successCount = results.filter((r) => r.status === 'fulfilled').length;

      this.logger.log(
        `Alert sent: ${fullAlert.type} | Priority: ${fullAlert.priority} | Channels: ${successCount}/${results.length}`
      );

      return successCount > 0;
    } catch (error) {
      const err = toError(error);
      this.logger.error(`Failed to send alert: ${err.message}`, err.stack);
      return false;
    }
  }

  /**
   * Send email alert with professional HTML template
   */
  private async sendEmailAlert(alert: SecurityAlert): Promise<void> {
    if (!this.config.channels.includes(AlertChannel.EMAIL)) {
      return;
    }

    const recipients = this.config.recipients.email || [];
    if (recipients.length === 0) {
      return;
    }

    const htmlContent = this.generateEmailHTML(alert);
    const subject = `[${alert.priority}] ${alert.title}`;

    for (const recipient of recipients) {
      await this.emailService.sendEmail(recipient, subject, htmlContent);
    }
  }

  /**
   * Generate professional HTML email template
   */
  private generateEmailHTML(alert: SecurityAlert): string {
    const priorityColors = {
      LOW: '#4CAF50',
      MEDIUM: '#FF9800',
      HIGH: '#F44336',
      CRITICAL: '#9C27B0',
    };

    const color = priorityColors[alert.priority];

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Security Alert</title>
      </head>
      <body style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

        <!-- Header -->
        <div style="background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 600;">
            🔒 Security Alert
          </h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 14px;">
            ChatBotDysa Enterprise Security System
          </p>
        </div>

        <!-- Alert Badge -->
        <div style="background: #f5f5f5; padding: 15px; text-align: center; border-left: 4px solid ${color};">
          <span style="background: ${color}; color: white; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 14px;">
            ${alert.priority} PRIORITY
          </span>
        </div>

        <!-- Content -->
        <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">

          <!-- Title -->
          <h2 style="color: #333; margin: 0 0 20px 0; font-size: 20px; border-bottom: 2px solid ${color}; padding-bottom: 10px;">
            ${alert.title}
          </h2>

          <!-- Description -->
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0; color: #555; font-size: 15px;">
              ${alert.description}
            </p>
          </div>

          <!-- Details Grid -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 12px; background: #f5f5f5; border: 1px solid #e0e0e0; font-weight: 600; width: 30%;">
                Type
              </td>
              <td style="padding: 12px; background: white; border: 1px solid #e0e0e0;">
                ${alert.type}
              </td>
            </tr>
            <tr>
              <td style="padding: 12px; background: #f5f5f5; border: 1px solid #e0e0e0; font-weight: 600;">
                Severity
              </td>
              <td style="padding: 12px; background: white; border: 1px solid #e0e0e0;">
                ${alert.severity}
              </td>
            </tr>
            <tr>
              <td style="padding: 12px; background: #f5f5f5; border: 1px solid #e0e0e0; font-weight: 600;">
                Source
              </td>
              <td style="padding: 12px; background: white; border: 1px solid #e0e0e0;">
                ${alert.source}
              </td>
            </tr>
            <tr>
              <td style="padding: 12px; background: #f5f5f5; border: 1px solid #e0e0e0; font-weight: 600;">
                Timestamp
              </td>
              <td style="padding: 12px; background: white; border: 1px solid #e0e0e0;">
                ${alert.timestamp.toISOString()}
              </td>
            </tr>
          </table>

          ${
            alert.affectedResources && alert.affectedResources.length > 0
              ? `
          <!-- Affected Resources -->
          <div style="margin-bottom: 20px;">
            <h3 style="color: #333; font-size: 16px; margin: 0 0 10px 0;">
              📋 Affected Resources
            </h3>
            <ul style="margin: 0; padding-left: 20px; color: #555;">
              ${alert.affectedResources.map((r) => `<li style="margin-bottom: 5px;">${r}</li>`).join('')}
            </ul>
          </div>
          `
              : ''
          }

          ${
            alert.recommendedActions && alert.recommendedActions.length > 0
              ? `
          <!-- Recommended Actions -->
          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <h3 style="color: #856404; font-size: 16px; margin: 0 0 10px 0;">
              ⚠️ Recommended Actions
            </h3>
            <ol style="margin: 0; padding-left: 20px; color: #856404;">
              ${alert.recommendedActions.map((a) => `<li style="margin-bottom: 5px;">${a}</li>`).join('')}
            </ol>
          </div>
          `
              : ''
          }

          <!-- Action Button -->
          <div style="text-align: center; margin-top: 30px;">
            <a href="http://localhost:7001/security/alerts"
               style="background: ${color}; color: white; padding: 14px 30px; text-decoration: none; border-radius: 5px; font-weight: 600; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              View in Security Dashboard →
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f5f5f5; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
          <p style="margin: 0 0 10px 0; color: #777; font-size: 13px;">
            This is an automated security alert from ChatBotDysa Enterprise
          </p>
          <p style="margin: 0; color: #999; font-size: 12px;">
            © ${new Date().getFullYear()} DysaDev SpA. All rights reserved.
          </p>
        </div>

      </body>
      </html>
    `;
  }

  /**
   * Send SMS alert for critical issues
   */
  private async sendSMSAlert(alert: SecurityAlert): Promise<void> {
    if (!this.config.channels.includes(AlertChannel.SMS)) {
      return;
    }

    // Only send SMS for HIGH and CRITICAL alerts
    if (![AlertPriority.HIGH, AlertPriority.CRITICAL].includes(alert.priority)) {
      return;
    }

    const recipients = this.config.recipients.sms || [];
    if (recipients.length === 0) {
      return;
    }

    const message = `[${alert.priority}] ChatBotDysa Security Alert: ${alert.title}. Check your email for details.`;

    for (const phone of recipients) {
      try {
        await this.twilioService.sendSMS({
          to: phone,
          body: message,
        });
      } catch (error) {
        const err = toError(error);
        this.logger.error(`Failed to send SMS to ${phone}: ${err.message}`);
      }
    }
  }

  /**
   * Send webhook alert for external integrations
   */
  private async sendWebhookAlert(alert: SecurityAlert): Promise<void> {
    if (!this.config.channels.includes(AlertChannel.WEBHOOK)) {
      return;
    }

    const webhooks = this.config.recipients.webhook || [];
    if (webhooks.length === 0) {
      return;
    }

    const payload = {
      alert,
      system: 'ChatBotDysa Enterprise',
      environment: process.env.NODE_ENV,
      version: '1.0.0',
    };

    for (const url of webhooks) {
      try {
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (error) {
        const err = toError(error);
        this.logger.error(`Failed to send webhook to ${url}: ${err.message}`);
      }
    }
  }

  /**
   * Check if alert should be sent based on filters
   */
  private shouldSendAlert(alert: SecurityAlert): boolean {
    const filters = this.config.filters;
    if (!filters) return true;

    // Check minimum priority
    if (filters.minPriority) {
      const priorities = [
        AlertPriority.LOW,
        AlertPriority.MEDIUM,
        AlertPriority.HIGH,
        AlertPriority.CRITICAL,
      ];
      const minIndex = priorities.indexOf(filters.minPriority);
      const alertIndex = priorities.indexOf(alert.priority);
      if (alertIndex < minIndex) return false;
    }

    // Check type whitelist
    if (filters.types && filters.types.length > 0) {
      if (!filters.types.includes(alert.type)) return false;
    }

    // Check type blacklist
    if (filters.excludeTypes && filters.excludeTypes.length > 0) {
      if (filters.excludeTypes.includes(alert.type)) return false;
    }

    return true;
  }

  /**
   * Check if alert is throttled
   */
  private isThrottled(throttleKey: string, alert: SecurityAlert): boolean {
    const now = new Date();
    const throttle = this.throttleCache.get(throttleKey);

    if (!throttle) {
      // First occurrence
      this.throttleCache.set(throttleKey, {
        alertType: alert.type,
        count: 1,
        firstSeen: now,
        lastSeen: now,
        alertIds: [alert.id],
      });
      return false;
    }

    // Check if window has expired
    const windowMs = this.config.throttleWindow * 60 * 1000;
    const timeSinceFirst = now.getTime() - throttle.firstSeen.getTime();

    if (timeSinceFirst > windowMs) {
      // Reset window
      this.throttleCache.set(throttleKey, {
        alertType: alert.type,
        count: 1,
        firstSeen: now,
        lastSeen: now,
        alertIds: [alert.id],
      });
      return false;
    }

    // Increment count
    throttle.count++;
    throttle.lastSeen = now;
    throttle.alertIds.push(alert.id);

    // Check if exceeded max alerts
    return throttle.count > this.config.maxAlertsPerWindow;
  }

  /**
   * Generate throttle key for alert type
   */
  private getThrottleKey(alert: SecurityAlert): string {
    return `${alert.type}:${alert.source}`;
  }

  /**
   * Generate unique alert ID
   */
  private generateAlertId(): string {
    return `alert_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  /**
   * Add alert to history
   */
  private addToHistory(alert: SecurityAlert): void {
    this.alertHistory.unshift(alert);
    if (this.alertHistory.length > this.maxHistorySize) {
      this.alertHistory.pop();
    }
  }

  /**
   * Get recent alerts
   */
  getRecentAlerts(limit: number = 100): SecurityAlert[] {
    return this.alertHistory.slice(0, limit);
  }

  /**
   * Get alert statistics
   */
  getStatistics() {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const recent = this.alertHistory.filter((a) => a.timestamp >= last24h);

    return {
      total24h: recent.length,
      byPriority: {
        critical: recent.filter((a) => a.priority === AlertPriority.CRITICAL).length,
        high: recent.filter((a) => a.priority === AlertPriority.HIGH).length,
        medium: recent.filter((a) => a.priority === AlertPriority.MEDIUM).length,
        low: recent.filter((a) => a.priority === AlertPriority.LOW).length,
      },
      byType: this.groupByType(recent),
      throttledCount: this.throttleCache.size,
    };
  }

  /**
   * Group alerts by type
   */
  private groupByType(alerts: SecurityAlert[]): Record<string, number> {
    return alerts.reduce(
      (acc, alert) => {
        acc[alert.type] = (acc[alert.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  }

  /**
   * Update alert configuration
   */
  updateConfig(config: Partial<AlertConfig>): void {
    this.config = { ...this.config, ...config };
    this.logger.log('Alert configuration updated');
  }

  /**
   * Get current configuration
   */
  getConfig(): AlertConfig {
    return { ...this.config };
  }

  /**
   * Cleanup old throttle entries periodically
   */
  private startThrottleCleanup(): void {
    this.throttleCleanupInterval = setInterval(
      () => {
        const now = new Date();
        const windowMs = this.config.throttleWindow * 60 * 1000;

        for (const [key, throttle] of this.throttleCache.entries()) {
          const timeSinceFirst = now.getTime() - throttle.firstSeen.getTime();
          if (timeSinceFirst > windowMs) {
            this.throttleCache.delete(key);
          }
        }
      },
      5 * 60 * 1000
    ); // Every 5 minutes
    this.throttleCleanupInterval.unref?.();
  }

  onModuleDestroy() {
    if (this.throttleCleanupInterval) {
      clearInterval(this.throttleCleanupInterval);
      this.throttleCleanupInterval = undefined;
    }
  }

  /**
   * Create alert from audit log
   */
  async createAlertFromAuditLog(auditLog: AuditLog): Promise<void> {
    // Only create alerts for critical/suspicious events
    if (!auditLog.isCritical && !auditLog.isSuspicious) {
      return;
    }

    const priority = this.determinePriority(auditLog);
    const title = this.generateTitle(auditLog);
    const description = this.generateDescription(auditLog);

    await this.sendAlert({
      type: auditLog.action,
      priority,
      title,
      description,
      severity: auditLog.severity,
      source: auditLog.endpoint,
      metadata: toRecord(auditLog.metadata),
      affectedResources: [
        auditLog.resourceType && auditLog.resourceId
          ? `${auditLog.resourceType}:${auditLog.resourceId}`
          : 'System',
      ],
      recommendedActions: this.getRecommendedActions(auditLog),
      evidence: [
        {
          user: auditLog.userEmail,
          ip: auditLog.ip,
          userAgent: auditLog.userAgent,
          timestamp: auditLog.createdAt,
        },
      ],
    });
  }

  /**
   * Determine alert priority from audit log
   */
  private determinePriority(auditLog: AuditLog): AlertPriority {
    if (auditLog.isCritical) return AlertPriority.CRITICAL;
    if (auditLog.severity === AuditSeverity.HIGH) return AlertPriority.HIGH;
    if (auditLog.severity === AuditSeverity.MEDIUM) return AlertPriority.MEDIUM;
    return AlertPriority.LOW;
  }

  /**
   * Generate alert title from audit log
   */
  private generateTitle(auditLog: AuditLog): string {
    const titles: Partial<Record<AuditAction, string>> = {
      FAILED_LOGIN: 'Multiple Failed Login Attempts Detected',
      UNAUTHORIZED_ACCESS: 'Unauthorized Access Attempt',
      SUSPICIOUS_ACTIVITY: 'Suspicious Activity Detected',
      RATE_LIMIT_EXCEEDED: 'Rate Limit Exceeded',
      DATA_EXPORT: 'Large Data Export Detected',
    };

    return titles[auditLog.action] || `Security Event: ${auditLog.action}`;
  }

  /**
   * Generate alert description from audit log
   */
  private generateDescription(auditLog: AuditLog): string {
    return `A security event was detected in the system. User: ${auditLog.userEmail || 'Unknown'}, IP: ${auditLog.ip}, Action: ${auditLog.action}`;
  }

  /**
   * Get recommended actions based on audit log
   */
  private getRecommendedActions(auditLog: AuditLog): string[] {
    const actions: Partial<Record<AuditAction, string[]>> = {
      FAILED_LOGIN: [
        'Review user account for potential compromise',
        'Consider implementing account lockout',
        'Check for brute force attack patterns',
      ],
      UNAUTHORIZED_ACCESS: [
        'Review user permissions immediately',
        'Verify user identity',
        'Consider revoking access temporarily',
      ],
      SUSPICIOUS_ACTIVITY: [
        'Investigate user activity timeline',
        'Review recent system changes',
        'Contact user to verify legitimacy',
      ],
      RATE_LIMIT_EXCEEDED: [
        'Check for automated attacks',
        'Review API usage patterns',
        'Consider blocking source IP temporarily',
      ],
    };

    return (
      actions[auditLog.action] ?? ['Review security logs', 'Contact security team if suspicious']
    );
  }
}

function toError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  return new Error(typeof error === 'string' ? error : 'Unknown error');
}

function toRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object') {
    return {};
  }
  return value as Record<string, unknown>;
}
