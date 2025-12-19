import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';

export interface EmailPaymentConfirmationData {
  firstName: string;
  email: string;
  planName: string;
  amount: number;
  currency: string;
  paymentId: string;
  transactionId: string;
  temporaryPassword?: string;
  loginUrl: string;
}

export interface EmailWelcomeData {
  firstName: string;
  email: string;
  temporaryPassword: string;
  loginUrl: string;
}

export interface EmailPaymentFailedData {
  firstName: string;
  email: string;
  planName: string;
  reason: string;
  retryUrl: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private isConfigured: boolean = false;

  constructor(private configService: ConfigService) {
    this.initialize();
  }

  /**
   * Inicializa SendGrid con la API key
   */
  private initialize() {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');

    if (!apiKey) {
      this.logger.warn('⚠️  SENDGRID_API_KEY no configurado - Emails en modo MOCK');
      this.isConfigured = false;
      return;
    }

    try {
      sgMail.setApiKey(apiKey);
      this.isConfigured = true;
      this.logger.log('✅ SendGrid inicializado correctamente');
    } catch (error) {
      this.logger.error('❌ Error inicializando SendGrid:', error.message);
      this.isConfigured = false;
    }
  }

  /**
   * Envía email de confirmación de pago
   */
  async sendPaymentConfirmation(data: EmailPaymentConfirmationData): Promise<boolean> {
    this.logger.log(`Enviando email de confirmación de pago a: ${data.email}`);

    if (!this.isConfigured) {
      this.logger.warn('📧 MOCK: Email de confirmación de pago');
      this.logger.log(`   → Para: ${data.email}`);
      this.logger.log(`   → Plan: ${data.planName}`);
      this.logger.log(`   → Monto: $${data.amount.toLocaleString('es-CL')} ${data.currency}`);
      this.logger.log(`   → Payment ID: ${data.paymentId}`);
      return true;
    }

    try {
      const fromEmail =
        this.configService.get<string>('SENDGRID_FROM_EMAIL') || 'noreply@chatbotdysa.com';
      const templateId = this.configService.get<string>('SENDGRID_TEMPLATE_PAYMENT_CONFIRMATION');

      const msg: any = {
        to: data.email,
        from: fromEmail,
        subject: '¡Pago confirmado! Tu cuenta ChatBotDysa está activa',
      };

      if (templateId) {
        msg.templateId = templateId;
        msg.dynamicTemplateData = {
          firstName: data.firstName,
          planName: data.planName,
          amount: data.amount,
          currency: data.currency,
          paymentId: data.paymentId,
          transactionId: data.transactionId,
          loginUrl: data.loginUrl,
          year: new Date().getFullYear(),
        };
      } else {
        msg.html = this.getPaymentConfirmationHTML(data);
      }

      await sgMail.send(msg);
      this.logger.log(`✅ Email de confirmación enviado a ${data.email}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Error enviando email de confirmación: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Envía email de bienvenida con password temporal
   */
  async sendWelcomeEmail(data: EmailWelcomeData): Promise<boolean> {
    this.logger.log(`Enviando email de bienvenida a: ${data.email}`);

    if (!this.isConfigured) {
      this.logger.warn('📧 MOCK: Email de bienvenida');
      this.logger.log(`   → Para: ${data.email}`);
      this.logger.log(`   → Password temporal: ${data.temporaryPassword}`);
      return true;
    }

    try {
      const fromEmail =
        this.configService.get<string>('SENDGRID_FROM_EMAIL') || 'noreply@chatbotdysa.com';
      const templateId = this.configService.get<string>('SENDGRID_TEMPLATE_WELCOME');

      const msg: any = {
        to: data.email,
        from: fromEmail,
        subject: '¡Bienvenido a ChatBotDysa! Tu cuenta está lista',
      };

      if (templateId) {
        msg.templateId = templateId;
        msg.dynamicTemplateData = {
          firstName: data.firstName,
          temporaryPassword: data.temporaryPassword,
          loginUrl: data.loginUrl,
          year: new Date().getFullYear(),
        };
      } else {
        msg.html = this.getWelcomeEmailHTML(data);
      }

      await sgMail.send(msg);
      this.logger.log(`✅ Email de bienvenida enviado a ${data.email}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Error enviando email de bienvenida: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Envía email de pago fallido
   */
  async sendPaymentFailed(data: EmailPaymentFailedData): Promise<boolean> {
    this.logger.log(`Enviando email de pago fallido a: ${data.email}`);

    if (!this.isConfigured) {
      this.logger.warn('📧 MOCK: Email de pago fallido');
      this.logger.log(`   → Para: ${data.email}`);
      this.logger.log(`   → Razón: ${data.reason}`);
      return true;
    }

    try {
      const fromEmail =
        this.configService.get<string>('SENDGRID_FROM_EMAIL') || 'noreply@chatbotdysa.com';
      const templateId = this.configService.get<string>('SENDGRID_TEMPLATE_PAYMENT_FAILED');

      const msg: any = {
        to: data.email,
        from: fromEmail,
        subject: 'Problema con tu pago - ChatBotDysa',
      };

      if (templateId) {
        msg.templateId = templateId;
        msg.dynamicTemplateData = {
          firstName: data.firstName,
          planName: data.planName,
          reason: data.reason,
          retryUrl: data.retryUrl,
          year: new Date().getFullYear(),
        };
      } else {
        msg.html = this.getPaymentFailedHTML(data);
      }

      await sgMail.send(msg);
      this.logger.log(`✅ Email de pago fallido enviado a ${data.email}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Error enviando email de pago fallido: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Envía email genérico
   */
  async sendEmail(
    to: string,
    subject: string,
    html: string,
    templateId?: string,
    templateData?: any
  ): Promise<boolean> {
    this.logger.log(`Enviando email genérico a: ${to}`);

    if (!this.isConfigured) {
      this.logger.warn('📧 MOCK: Email genérico');
      this.logger.log(`   → Para: ${to}`);
      this.logger.log(`   → Asunto: ${subject}`);
      return true;
    }

    try {
      const fromEmail =
        this.configService.get<string>('SENDGRID_FROM_EMAIL') || 'noreply@chatbotdysa.com';

      const msg: sgMail.MailDataRequired = {
        to,
        from: fromEmail,
        subject,
        html,
        templateId: templateId || undefined,
        dynamicTemplateData: templateData || undefined,
      };

      await sgMail.send(msg);
      this.logger.log(`✅ Email genérico enviado a ${to}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Error enviando email genérico: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Verifica si SendGrid está configurado
   */
  isReady(): boolean {
    return this.isConfigured;
  }

  /**
   * HTML fallback para email de confirmación de pago
   */
  private getPaymentConfirmationHTML(data: EmailPaymentConfirmationData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pago Confirmado - ChatBotDysa</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">¡Pago Confirmado! 🎉</h1>
        </div>

        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 18px;">Hola <strong>${data.firstName}</strong>,</p>

          <p>Tu pago ha sido procesado exitosamente. Tu cuenta de ChatBotDysa está ahora <strong>activa</strong>.</p>

          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3 style="margin-top: 0; color: #667eea;">Detalles del Pago</h3>
            <p><strong>Plan:</strong> ${data.planName}</p>
            <p><strong>Monto:</strong> $${data.amount.toLocaleString('es-CL')} ${data.currency}</p>
            <p><strong>ID de Transacción:</strong> ${data.transactionId}</p>
            <p><strong>ID de Pago:</strong> ${data.paymentId}</p>
          </div>

          <p>Ya puedes acceder a tu cuenta y comenzar a usar todas las funcionalidades de ChatBotDysa.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.loginUrl}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Acceder a mi Cuenta
            </a>
          </div>

          <p style="color: #666; font-size: 14px;">Si tienes alguna pregunta, no dudes en contactarnos respondiendo a este email.</p>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

          <p style="color: #999; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} ChatBotDysa. Todos los derechos reservados.<br>
            Este es un email automático, por favor no respondas a este mensaje.
          </p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * HTML fallback para email de bienvenida
   */
  private getWelcomeEmailHTML(data: EmailWelcomeData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bienvenido - ChatBotDysa</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">¡Bienvenido a ChatBotDysa! 👋</h1>
        </div>

        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 18px;">Hola <strong>${data.firstName}</strong>,</p>

          <p>Tu cuenta ha sido creada exitosamente. Estamos emocionados de tenerte con nosotros.</p>

          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h3 style="margin-top: 0; color: #856404;">🔐 Credenciales de Acceso</h3>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Password Temporal:</strong> <code style="background: white; padding: 5px 10px; border-radius: 3px; font-size: 16px;">${data.temporaryPassword}</code></p>
            <p style="color: #856404; font-size: 14px;">⚠️ Por seguridad, te recomendamos cambiar tu contraseña después del primer inicio de sesión.</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.loginUrl}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Iniciar Sesión Ahora
            </a>
          </div>

          <h3 style="color: #667eea;">¿Qué puedes hacer ahora?</h3>
          <ul style="line-height: 2;">
            <li>Configurar tu chatbot con IA</li>
            <li>Integrar WhatsApp Business</li>
            <li>Personalizar respuestas automáticas</li>
            <li>Ver analytics en tiempo real</li>
          </ul>

          <p style="color: #666; font-size: 14px;">Si necesitas ayuda, nuestro equipo está disponible 24/7 para asistirte.</p>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

          <p style="color: #999; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} ChatBotDysa. Todos los derechos reservados.<br>
            Este es un email automático, por favor no respondas a este mensaje.
          </p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * HTML fallback para email de pago fallido
   */
  private getPaymentFailedHTML(data: EmailPaymentFailedData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Problema con tu Pago - ChatBotDysa</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #dc3545; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Problema con tu Pago ⚠️</h1>
        </div>

        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 18px;">Hola <strong>${data.firstName}</strong>,</p>

          <p>Hemos detectado un problema al procesar tu pago para el plan <strong>${data.planName}</strong>.</p>

          <div style="background: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
            <h3 style="margin-top: 0; color: #721c24;">Razón del Rechazo</h3>
            <p>${data.reason}</p>
          </div>

          <p>No te preocupes, esto puede deberse a varios motivos como fondos insuficientes, límite de crédito alcanzado, o problemas temporales con tu banco.</p>

          <h3 style="color: #667eea;">¿Qué puedes hacer?</h3>
          <ul style="line-height: 2;">
            <li>Verifica que tu tarjeta tenga fondos suficientes</li>
            <li>Contacta a tu banco para autorizar la transacción</li>
            <li>Intenta con otra tarjeta de crédito/débito</li>
            <li>Prueba con otro método de pago (transferencia, factura)</li>
          </ul>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.retryUrl}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Reintentar Pago
            </a>
          </div>

          <p style="color: #666; font-size: 14px;">Si necesitas ayuda, contáctanos respondiendo a este email o vía WhatsApp.</p>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

          <p style="color: #999; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} ChatBotDysa. Todos los derechos reservados.<br>
            Este es un email automático, por favor no respondas a este mensaje.
          </p>
        </div>
      </body>
      </html>
    `;
  }
}
