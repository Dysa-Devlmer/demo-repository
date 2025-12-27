/**
 * Notification Service
 * Handles email/SMS notifications with external provider APIs (untyped data)
 * Using selective eslint-disable for unavoidable any types from external email/SMS APIs
 */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable no-useless-escape */
/* eslint-disable no-case-declarations */
import { Injectable } from '@nestjs/common';
import { LoggerService } from './logger.service';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  from: string;
}

export interface SMSConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
}

export interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  verifyToken: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'whatsapp' | 'push';
  subject?: string;
  template: string;
  variables: string[];
}

export interface NotificationPayload {
  to: string;
  templateId?: string;
  subject?: string;
  message?: string;
  variables?: Record<string, any>;
  priority: 'low' | 'normal' | 'high' | 'critical';
  channel: 'email' | 'sms' | 'whatsapp' | 'push' | 'all';
  metadata?: Record<string, any>;
}

@Injectable()
export class NotificationService {
  private emailConfig: EmailConfig;
  private smsConfig: SMSConfig;
  private whatsappConfig: WhatsAppConfig;

  // Enterprise notification templates
  private templates: NotificationTemplate[] = [
    {
      id: 'order_confirmation',
      name: 'Order Confirmation',
      type: 'email',
      subject: 'Order Confirmed - {{orderNumber}}',
      template: `
        <h2>¡Gracias por tu pedido!</h2>
        <p>Hola {{customerName}},</p>
        <p>Tu pedido <strong>{{orderNumber}}</strong> ha sido confirmado.</p>
        <h3>Detalles del pedido:</h3>
        <ul>{{orderItems}}</ul>
        <p><strong>Total: $\{\{total\}\}</strong></p>
        <p>Tiempo estimado de entrega: {{estimatedTime}} minutos</p>
        <p>¡Gracias por elegirnos!</p>
      `,
      variables: ['customerName', 'orderNumber', 'orderItems', 'total', 'estimatedTime'],
    },
    {
      id: 'reservation_confirmed',
      name: 'Reservation Confirmed',
      type: 'whatsapp',
      template: `🍽️ *Reserva Confirmada*\n\nHola {{customerName}}!\n\n✅ Tu reserva está confirmada:\n📅 {{date}}\n🕐 {{time}}\n👥 {{partySize}} personas\n📍 {{restaurantName}}\n\n¡Te esperamos!`,
      variables: ['customerName', 'date', 'time', 'partySize', 'restaurantName'],
    },
    {
      id: 'order_ready',
      name: 'Order Ready',
      type: 'sms',
      template: `🍕 ¡Tu pedido \{\{orderNumber\}\} está listo para recoger! Restaurante \{\{restaurantName\}\}. Total: $\{\{total\}\}`,
      variables: ['orderNumber', 'restaurantName', 'total'],
    },
    {
      id: 'reservation_reminder',
      name: 'Reservation Reminder',
      type: 'whatsapp',
      template: `⏰ *Recordatorio de Reserva*\n\nHola {{customerName}},\n\nTe recordamos tu reserva:\n📅 {{date}} a las {{time}}\n👥 {{partySize}} personas\n📍 {{restaurantName}}\n\n¿Necesitas modificar algo? Responde a este mensaje.`,
      variables: ['customerName', 'date', 'time', 'partySize', 'restaurantName'],
    },
    {
      id: 'order_cancelled',
      name: 'Order Cancelled',
      type: 'email',
      subject: 'Order Cancelled - {{orderNumber}}',
      template: `
        <h2>Pedido Cancelado</h2>
        <p>Hola {{customerName}},</p>
        <p>Tu pedido <strong>{{orderNumber}}</strong> ha sido cancelado.</p>
        <p><strong>Motivo:</strong> {{reason}}</p>
        <p>Si el pago ya fue procesado, será reembolsado en 3-5 días hábiles.</p>
        <p>¡Esperamos verte pronto!</p>
      `,
      variables: ['customerName', 'orderNumber', 'reason'],
    },
    {
      id: 'weekly_summary',
      name: 'Weekly Business Summary',
      type: 'email',
      subject: 'Weekly Summary - {{restaurantName}}',
      template: `
        <h2>📊 Resumen Semanal</h2>
        <p>Del {{startDate}} al {{endDate}}</p>
        
        <h3>📈 Métricas de Negocio:</h3>
        <ul>
          <li>🛍️ Pedidos totales: {{totalOrders}}</li>
          <li>💰 Ingresos: $\{\{totalRevenue\}\}</li>
          <li>👥 Nuevos clientes: {{newCustomers}}</li>
          <li>📅 Reservas: {{totalReservations}}</li>
          <li>⭐ Rating promedio: {{avgRating}}/5</li>
        </ul>
        
        <h3>🔝 Productos más vendidos:</h3>
        <ol>{{topProducts}}</ol>
        
        <p>¡Excelente semana! 🎉</p>
      `,
      variables: [
        'restaurantName',
        'startDate',
        'endDate',
        'totalOrders',
        'totalRevenue',
        'newCustomers',
        'totalReservations',
        'avgRating',
        'topProducts',
      ],
    },
  ];

  constructor(private readonly logger: LoggerService) {
    this.initializeConfigs();
  }

  private initializeConfigs() {
    // Initialize from environment variables or settings
    this.emailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER || '',
      password: process.env.SMTP_PASSWORD || '',
      from: process.env.SMTP_FROM || 'noreply@chatbotdysa.com',
    };

    this.smsConfig = {
      accountSid: process.env.TWILIO_ACCOUNT_SID || '',
      authToken: process.env.TWILIO_AUTH_TOKEN || '',
      fromNumber: process.env.TWILIO_FROM_NUMBER || '',
    };

    this.whatsappConfig = {
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
      verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || '',
    };
  }

  // Main notification sending method
  async sendNotification(payload: NotificationPayload): Promise<boolean> {
    try {
      let success = false;

      this.logger.info(`Sending ${payload.channel} notification`, {
        module: 'Notifications',
        action: 'send',
        metadata: {
          to: payload.to,
          channel: payload.channel,
          priority: payload.priority,
          templateId: payload.templateId,
        },
      });

      switch (payload.channel) {
        case 'email':
          success = await this.sendEmail(payload);
          break;
        case 'sms':
          success = await this.sendSMS(payload);
          break;
        case 'whatsapp':
          success = await this.sendWhatsApp(payload);
          break;
        case 'push':
          success = await this.sendPushNotification(payload);
          break;
        case 'all':
          // Send to all available channels
          const results = await Promise.allSettled([
            this.sendEmail(payload),
            this.sendSMS(payload),
            this.sendWhatsApp(payload),
          ]);
          success = results.some((r) => r.status === 'fulfilled' && r.value);
          break;
      }

      // Log notification result
      if (success) {
        this.logger.info(`Notification sent successfully`, {
          module: 'Notifications',
          action: 'sent',
          metadata: payload.metadata,
        });
      } else {
        this.logger.warn(`Failed to send notification`, {
          module: 'Notifications',
          action: 'failed',
          metadata: payload.metadata,
        });
      }

      return success;
    } catch (error) {
      this.logger.error(
        `Notification error: ${error.message}`,
        {
          module: 'Notifications',
          action: 'error',
          metadata: payload.metadata,
        },
        error
      );
      return false;
    }
  }

  // Email notifications
  private async sendEmail(payload: NotificationPayload): Promise<boolean> {
    try {
      // In a real implementation, you'd use nodemailer or similar
      const template = payload.templateId
        ? this.getTemplate(payload.templateId, 'email')
        : undefined;
      const message = this.processTemplate(
        template?.template || payload.message || '',
        payload.variables
      );
      const subject =
        payload.subject ||
        (template?.subject
          ? this.processTemplate(template.subject, payload.variables)
          : 'Notification');

      // Simulate email sending
      await this.simulateEmailSend(payload.to, subject, message);

      this.logger.logIntegration('email', 'sent', {
        success: true,
        responseTime: 150,
        metadata: { to: payload.to, subject },
      });

      return true;
    } catch (error) {
      this.logger.logIntegration('email', 'failed', {
        success: false,
        responseTime: 100,
        metadata: { error: error.message },
      });
      return false;
    }
  }

  // SMS notifications via Twilio
  private async sendSMS(payload: NotificationPayload): Promise<boolean> {
    try {
      const template = payload.templateId ? this.getTemplate(payload.templateId, 'sms') : undefined;
      const message = this.processTemplate(
        template?.template || payload.message || '',
        payload.variables
      );

      // Simulate SMS sending
      await this.simulateSMSSend(payload.to, message);

      this.logger.logIntegration('twilio', 'sms_sent', {
        success: true,
        responseTime: 200,
        cost: 0.02,
        messageId: `SMS_${Date.now()}`,
        metadata: { to: payload.to },
      });

      return true;
    } catch (error) {
      this.logger.logIntegration('twilio', 'sms_failed', {
        success: false,
        responseTime: 150,
        metadata: { error: error.message },
      });
      return false;
    }
  }

  // WhatsApp notifications
  private async sendWhatsApp(payload: NotificationPayload): Promise<boolean> {
    try {
      const template = payload.templateId
        ? this.getTemplate(payload.templateId, 'whatsapp')
        : undefined;
      const message = this.processTemplate(
        template?.template || payload.message || '',
        payload.variables
      );

      // Simulate WhatsApp sending
      await this.simulateWhatsAppSend(payload.to, message);

      this.logger.logIntegration('whatsapp', 'message_sent', {
        success: true,
        responseTime: 300,
        messageId: `WA_${Date.now()}`,
        metadata: { to: payload.to },
      });

      return true;
    } catch (error) {
      this.logger.logIntegration('whatsapp', 'message_failed', {
        success: false,
        responseTime: 200,
        metadata: { error: error.message },
      });
      return false;
    }
  }

  // Push notifications
  private async sendPushNotification(payload: NotificationPayload): Promise<boolean> {
    try {
      // Simulate push notification
      await this.simulatePushSend(payload.to, payload.message || '');

      this.logger.logIntegration('push', 'notification_sent', {
        success: true,
        responseTime: 100,
        metadata: { to: payload.to },
      });

      return true;
    } catch (error) {
      this.logger.logIntegration('push', 'notification_failed', {
        success: false,
        responseTime: 50,
        metadata: { error: error.message },
      });
      return false;
    }
  }

  // Business-specific notification methods
  async sendOrderConfirmation(orderData: any): Promise<boolean> {
    return this.sendNotification({
      to: orderData.customerEmail,
      templateId: 'order_confirmation',
      channel: 'email',
      priority: 'high',
      variables: {
        customerName: orderData.customerName,
        orderNumber: orderData.orderNumber,
        orderItems: orderData.items
          .map((item) => `<li>${item.name} x${item.quantity} - $${item.price}</li>`)
          .join(''),
        total: orderData.total.toFixed(2),
        estimatedTime: orderData.estimatedTime,
      },
      metadata: { orderId: orderData.id },
    });
  }

  async sendReservationConfirmation(reservationData: any): Promise<boolean> {
    return this.sendNotification({
      to: reservationData.customerPhone,
      templateId: 'reservation_confirmed',
      channel: 'whatsapp',
      priority: 'normal',
      variables: {
        customerName: reservationData.customerName,
        date: new Date(reservationData.date).toLocaleDateString(),
        time: reservationData.time,
        partySize: reservationData.partySize,
        restaurantName: 'ChatBotDysa Restaurant',
      },
      metadata: { reservationId: reservationData.id },
    });
  }

  async sendOrderReady(orderData: any): Promise<boolean> {
    return this.sendNotification({
      to: orderData.customerPhone,
      templateId: 'order_ready',
      channel: 'sms',
      priority: 'high',
      variables: {
        orderNumber: orderData.orderNumber,
        restaurantName: 'ChatBotDysa',
        total: orderData.total.toFixed(2),
      },
      metadata: { orderId: orderData.id },
    });
  }

  async sendWeeklySummary(businessData: any, recipients: string[]): Promise<boolean> {
    const promises = recipients.map((email) =>
      this.sendNotification({
        to: email,
        templateId: 'weekly_summary',
        channel: 'email',
        priority: 'normal',
        variables: businessData,
        metadata: { type: 'weekly_summary' },
      })
    );

    const results = await Promise.allSettled(promises);
    return results.some((r) => r.status === 'fulfilled' && r.value);
  }

  // Bulk notifications for marketing campaigns
  async sendBulkNotification(
    recipients: string[],
    payload: Omit<NotificationPayload, 'to'>
  ): Promise<{ sent: number; failed: number }> {
    const results = await Promise.allSettled(
      recipients.map((recipient) => this.sendNotification({ ...payload, to: recipient }))
    );

    const sent = results.filter((r) => r.status === 'fulfilled' && r.value).length;
    const failed = results.length - sent;

    this.logger.logBusinessProcess('notifications', 'bulk_send', {
      metadata: {
        totalRecipients: recipients.length,
        sent,
        failed,
        channel: payload.channel,
      },
    });

    return { sent, failed };
  }

  // Utility methods
  private getTemplate(templateId: string, type?: string): NotificationTemplate | undefined {
    return this.templates.find((t) => t.id === templateId && (!type || t.type === type));
  }

  private processTemplate(template: string, variables?: Record<string, any>): string {
    if (!template || !variables) return template;

    let processed = template;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(regex, String(value || ''));
    });

    return processed;
  }

  // Simulation methods (replace with real implementations)
  private async simulateEmailSend(to: string, subject: string, message: string): Promise<void> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));
    console.log(`📧 EMAIL SENT to ${to}: ${subject} - ${message.substring(0, 100)}...`);
  }

  private async simulateSMSSend(to: string, message: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    console.log(`📱 SMS SENT to ${to}: ${message.substring(0, 50)}...`);
  }

  private async simulateWhatsAppSend(to: string, message: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    console.log(`💬 WHATSAPP SENT to ${to}: ${message.substring(0, 50)}...`);
  }

  private async simulatePushSend(to: string, message: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    console.log(`🔔 PUSH SENT to ${to}: ${message.substring(0, 50)}...`);
  }

  // Template management
  getTemplates(): NotificationTemplate[] {
    return this.templates;
  }

  addTemplate(template: NotificationTemplate): void {
    this.templates.push(template);
  }

  updateTemplate(id: string, updates: Partial<NotificationTemplate>): boolean {
    const index = this.templates.findIndex((t) => t.id === id);
    if (index >= 0) {
      this.templates[index] = { ...this.templates[index], ...updates };
      return true;
    }
    return false;
  }

  deleteTemplate(id: string): boolean {
    const index = this.templates.findIndex((t) => t.id === id);
    if (index >= 0) {
      this.templates.splice(index, 1);
      return true;
    }
    return false;
  }
}
