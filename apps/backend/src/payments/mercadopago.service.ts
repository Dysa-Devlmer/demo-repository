import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MercadoPagoConfig, Payment as MPPayment, Preference } from 'mercadopago';
import * as crypto from 'crypto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { WebhookPaymentDto } from './dto/webhook-payment.dto';
import { User, UserStatus } from '../auth/entities/user.entity';
import { Payment, PaymentStatus, PaymentProvider, BillingPeriod } from '../entities/payment.entity';
import { Subscription, SubscriptionStatus, PlanType } from '../entities/subscription.entity';
import { EmailService } from '../common/services/email.service';

@Injectable()
export class MercadoPagoService {
  private readonly logger = new Logger(MercadoPagoService.name);
  private mercadoPago: MercadoPagoConfig;
  private paymentClient: MPPayment;
  private preferenceClient: Preference;

  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    private emailService: EmailService
  ) {
    const accessToken = this.configService.get<string>('MERCADOPAGO_ACCESS_TOKEN');

    if (!accessToken) {
      this.logger.warn('⚠️  MERCADOPAGO_ACCESS_TOKEN no configurado - MercadoPago deshabilitado');
      return; // No inicializar el cliente, pero no lanzar error
    }

    this.mercadoPago = new MercadoPagoConfig({
      accessToken,
      options: {
        timeout: 5000,
      },
    });

    this.paymentClient = new MPPayment(this.mercadoPago);
    this.preferenceClient = new Preference(this.mercadoPago);

    this.logger.log('MercadoPago Service inicializado correctamente');
  }

  /**
   * Crea una preferencia de pago en Mercado Pago
   * @param dto Datos del pago
   * @returns URL de checkout y preference ID
   */
  async createPreference(dto: CreatePaymentDto) {
    if (!this.preferenceClient) {
      throw new BadRequestException('MercadoPago no está configurado');
    }

    try {
      this.logger.log(`Creando preferencia para: ${dto.email} - Plan: ${dto.planId}`);

      const appUrl = this.configService.get<string>('APP_URL') || 'http://localhost:3000';
      const apiUrl = this.configService.get<string>('API_URL') || 'http://localhost:8000';

      // Crear preferencia de pago
      const preference = await this.preferenceClient.create({
        body: {
          items: [
            {
              id: dto.planId,
              title: dto.planName,
              description: `Plan ${dto.planName} - Facturación ${dto.billingPeriod === 'annual' ? 'Anual' : 'Mensual'}`,
              quantity: 1,
              currency_id: 'CLP',
              unit_price: dto.amount,
            },
          ],
          payer: {
            name: dto.firstName,
            surname: dto.lastName,
            email: dto.email,
            phone: dto.phone ? { number: dto.phone } : undefined,
            identification: {
              type: 'RUT',
              number: dto.rut,
            },
          },
          back_urls: {
            success: `${appUrl}/checkout/success`,
            failure: `${appUrl}/checkout/payment?error=payment_failed`,
            pending: `${appUrl}/checkout/payment?status=pending`,
          },
          auto_return: 'approved' as any,
          notification_url: `${apiUrl}/payments/webhook`,
          external_reference: `${dto.email}-${Date.now()}`,
          statement_descriptor: 'ChatBotDysa',
          metadata: {
            email: dto.email,
            plan_id: dto.planId,
            plan_name: dto.planName,
            billing_period: dto.billingPeriod,
            company_name: dto.companyName,
          },
        },
      });

      this.logger.log(`Preferencia creada: ${preference.id}`);

      return {
        preferenceId: preference.id,
        initPoint: preference.init_point,
        sandboxInitPoint: preference.sandbox_init_point,
      };
    } catch (error) {
      this.logger.error(`Error creando preferencia: ${error.message}`, error.stack);
      throw new BadRequestException('Error al crear la preferencia de pago');
    }
  }

  /**
   * Obtiene los detalles de un pago
   * @param paymentId ID del pago
   * @returns Detalles del pago
   */
  async getPayment(paymentId: string) {
    try {
      this.logger.log(`Consultando pago: ${paymentId}`);

      const payment = await this.paymentClient.get({ id: paymentId });

      return {
        id: payment.id,
        status: payment.status,
        status_detail: payment.status_detail,
        transaction_amount: payment.transaction_amount,
        currency_id: payment.currency_id,
        date_created: payment.date_created,
        date_approved: payment.date_approved,
        payer: {
          email: payment.payer?.email,
          identification: payment.payer?.identification,
        },
        metadata: payment.metadata,
        external_reference: payment.external_reference,
      };
    } catch (error) {
      this.logger.error(`Error consultando pago ${paymentId}: ${error.message}`);
      throw new BadRequestException('Error al consultar el pago');
    }
  }

  /**
   * Procesa un webhook de Mercado Pago
   * @param webhookData Datos del webhook
   */
  async processWebhook(webhookData: WebhookPaymentDto) {
    try {
      this.logger.log(`Procesando webhook: ${webhookData.type} - ${webhookData.action}`);

      // Solo procesar notificaciones de pagos
      if (webhookData.type !== 'payment') {
        this.logger.log(`Webhook ignorado: tipo ${webhookData.type}`);
        return { status: 'ignored' };
      }

      // Obtener detalles del pago
      const paymentId = webhookData.data.id;
      const payment = await this.getPayment(paymentId);

      this.logger.log(`Pago ${paymentId} - Estado: ${payment.status}`);

      // Procesar según el estado del pago
      switch (payment.status) {
        case 'approved':
          await this.handleApprovedPayment(payment);
          break;
        case 'pending':
          await this.handlePendingPayment(payment);
          break;
        case 'rejected':
          await this.handleRejectedPayment(payment);
          break;
        case 'refunded':
          await this.handleRefundedPayment(payment);
          break;
        default:
          this.logger.warn(`Estado de pago no manejado: ${payment.status}`);
      }

      return { status: 'processed', paymentId, paymentStatus: payment.status };
    } catch (error) {
      this.logger.error(`Error procesando webhook: ${error.message}`, error.stack);
      throw new BadRequestException('Error al procesar webhook');
    }
  }

  /**
   * Maneja un pago aprobado
   */
  private async handleApprovedPayment(payment: any) {
    this.logger.log(
      `✅ Pago aprobado: ${payment.id} - $${payment.transaction_amount} ${payment.currency_id}`
    );

    try {
      const metadata = payment.metadata;
      const email = metadata?.email || payment.payer?.email;

      if (!email) {
        this.logger.error('No se encontró email en el pago aprobado');
        return;
      }

      this.logger.log(`Procesando activación para: ${email} - Plan: ${metadata?.plan_name}`);

      // 1. Buscar o crear usuario en base de datos
      let user = await this.userRepository.findOne({ where: { email } });

      if (!user) {
        // Crear nuevo usuario
        this.logger.log(`Creando nuevo usuario: ${email}`);

        user = this.userRepository.create({
          email,
          status: UserStatus.ACTIVE,
          firstName: payment.payer?.name || 'Usuario',
          lastName: payment.payer?.surname || 'ChatBotDysa',
          // Generar password temporal (enviar por email)
          password: this.generateTemporaryPassword(),
        });

        await this.userRepository.save(user);
        this.logger.log(`✅ Usuario creado: ${user.id}`);
      } else {
        // Actualizar usuario existente
        this.logger.log(`Actualizando usuario existente: ${user.id}`);

        user.status = UserStatus.ACTIVE;
        await this.userRepository.save(user);

        this.logger.log(`✅ Usuario activado: ${user.id}`);
      }

      // 2. Registrar el pago en la base de datos
      await this.recordPayment(user.id, payment, metadata);

      // 3. Enviar email de confirmación (TODO: implementar SendGrid)
      await this.sendPaymentConfirmationEmail(user, payment, metadata);

      // 4. Notificar al equipo sobre nuevo cliente (TODO: implementar Slack)
      await this.notifyTeamNewCustomer(user, payment, metadata);

      // 5. Provisionar recursos si es necesario (TODO: para SaaS Dedicado/On-Premise)
      if (metadata?.plan_id === 'saas-dedicated' || metadata?.plan_id === 'on-premise') {
        await this.provisionResources(user, metadata);
      }

      this.logger.log(`✅ Activación completada para usuario ${user.id}`);
    } catch (error) {
      this.logger.error(`Error activando cuenta: ${error.message}`, error.stack);
      // No lanzar error para no bloquear el webhook
    }
  }

  /**
   * Genera un password temporal aleatorio
   */
  private generateTemporaryPassword(): string {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }

    return password;
  }

  /**
   * Registra el pago en la base de datos
   */
  private async recordPayment(userId: number, paymentData: any, metadata: any) {
    this.logger.log(`Registrando pago en BD: ${paymentData.id}`);

    try {
      // Verificar si el pago ya existe
      const existingPayment = await this.paymentRepository.findOne({
        where: { external_payment_id: String(paymentData.id) },
      });

      if (existingPayment) {
        // Actualizar pago existente
        existingPayment.status = this.mapPaymentStatus(paymentData.status);
        existingPayment.status_detail = paymentData.status_detail;
        existingPayment.date_approved = paymentData.date_approved
          ? new Date(paymentData.date_approved)
          : null;
        existingPayment.webhook_data = paymentData;
        await this.paymentRepository.save(existingPayment);
        this.logger.log(`✅ Pago actualizado: ${existingPayment.id}`);
        return existingPayment;
      }

      // Crear nuevo registro de pago
      const paymentRecord = this.paymentRepository.create({
        user_id: userId,
        external_payment_id: String(paymentData.id),
        external_reference: paymentData.external_reference,
        provider: PaymentProvider.MERCADOPAGO,
        status: this.mapPaymentStatus(paymentData.status),
        status_detail: paymentData.status_detail,
        amount: paymentData.transaction_amount,
        currency: paymentData.currency_id || 'CLP',
        plan_id: metadata?.plan_id || 'saas-multi',
        plan_name: metadata?.plan_name || 'SaaS Multi-tenant',
        billing_period: this.mapBillingPeriod(metadata?.billing_period),
        payer_email: metadata?.email || paymentData.payer?.email,
        payer_name: paymentData.payer?.name,
        payer_identification: paymentData.payer?.identification?.number,
        company_name: metadata?.company_name,
        metadata: metadata,
        webhook_data: paymentData,
        date_approved: paymentData.date_approved ? new Date(paymentData.date_approved) : null,
      });

      await this.paymentRepository.save(paymentRecord);
      this.logger.log(`✅ Pago registrado: ${paymentRecord.id}`);

      // Crear o actualizar suscripción
      await this.updateSubscription(userId, paymentRecord, metadata);

      return paymentRecord;
    } catch (error) {
      this.logger.error(`Error registrando pago: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Mapea el estado de MercadoPago a nuestro enum
   */
  private mapPaymentStatus(mpStatus: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      approved: PaymentStatus.APPROVED,
      pending: PaymentStatus.PENDING,
      in_process: PaymentStatus.IN_PROCESS,
      rejected: PaymentStatus.REJECTED,
      refunded: PaymentStatus.REFUNDED,
      cancelled: PaymentStatus.CANCELLED,
      in_mediation: PaymentStatus.IN_MEDIATION,
      charged_back: PaymentStatus.CHARGED_BACK,
    };
    return statusMap[mpStatus] || PaymentStatus.PENDING;
  }

  /**
   * Mapea el periodo de facturación
   */
  private mapBillingPeriod(period: string): BillingPeriod {
    if (period === 'annual') return BillingPeriod.ANNUAL;
    if (period === 'one_time') return BillingPeriod.ONE_TIME;
    return BillingPeriod.MONTHLY;
  }

  /**
   * Actualiza o crea la suscripción del usuario
   */
  private async updateSubscription(userId: number, payment: Payment, metadata: any) {
    try {
      let subscription = await this.subscriptionRepository.findOne({
        where: { user_id: userId },
      });

      const now = new Date();
      const billingCycle = metadata?.billing_period === 'annual' ? 'annual' : 'monthly';
      const daysToAdd = billingCycle === 'annual' ? 365 : 30;
      const endsAt = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

      if (subscription) {
        // Actualizar suscripción existente
        subscription.status = SubscriptionStatus.ACTIVE;
        subscription.last_payment_at = now;
        subscription.next_payment_at = endsAt;
        subscription.ends_at = endsAt;
        subscription.payment_failures = 0;
        await this.subscriptionRepository.save(subscription);
        this.logger.log(`✅ Suscripción actualizada: ${subscription.id}`);
      } else {
        // Crear nueva suscripción
        subscription = this.subscriptionRepository.create({
          user_id: userId,
          plan_type: this.mapPlanType(payment.plan_id),
          plan_name: payment.plan_name,
          status: SubscriptionStatus.ACTIVE,
          monthly_price: payment.amount,
          currency: payment.currency,
          billing_cycle: billingCycle,
          starts_at: now,
          ends_at: endsAt,
          last_payment_at: now,
          next_payment_at: endsAt,
          auto_renew: true,
        });
        await this.subscriptionRepository.save(subscription);
        this.logger.log(`✅ Suscripción creada: ${subscription.id}`);
      }

      return subscription;
    } catch (error) {
      this.logger.error(`Error actualizando suscripción: ${error.message}`);
    }
  }

  /**
   * Mapea el plan_id al enum PlanType
   */
  private mapPlanType(planId: string): PlanType {
    const planMap: Record<string, PlanType> = {
      'saas-multi': PlanType.SAAS_MULTI_TENANT,
      'saas-dedicated': PlanType.SAAS_DEDICATED,
      'on-premise': PlanType.ON_PREMISE,
    };
    return planMap[planId] || PlanType.SAAS_MULTI_TENANT;
  }

  /**
   * Envía email de confirmación de pago
   */
  private async sendPaymentConfirmationEmail(user: User, payment: any, metadata: any) {
    try {
      const appUrl = this.configService.get<string>('APP_URL') || 'http://localhost:3000';

      await this.emailService.sendPaymentConfirmation({
        firstName: user.firstName || 'Usuario',
        email: user.email,
        planName: metadata?.plan_name || 'Plan ChatBotDysa',
        amount: payment.transaction_amount || 0,
        currency: payment.currency_id || 'CLP',
        paymentId: payment.id || '',
        transactionId: payment.external_reference || payment.id || '',
        loginUrl: `${appUrl}/login`,
      });

      this.logger.log(`✅ Email de confirmación enviado a ${user.email}`);
    } catch (error) {
      this.logger.error(`Error enviando email de confirmación: ${error.message}`);
      // No lanzar error para no bloquear el proceso de activación
    }
  }

  /**
   * Notifica al equipo sobre nuevo cliente
   */
  private async notifyTeamNewCustomer(user: User, payment: any, metadata: any) {
    this.logger.log(`Notificando equipo sobre nuevo cliente: ${user.email}`);

    // TODO: Implementar notificación a Slack
    // const webhook = this.configService.get('SLACK_WEBHOOK_URL');
    // await axios.post(webhook, {
    //   text: `🎉 Nuevo cliente: ${user.email}`,
    //   blocks: [
    //     {
    //       type: 'section',
    //       text: {
    //         type: 'mrkdwn',
    //         text: `*Nuevo cliente activado*\n` +
    //               `• Email: ${user.email}\n` +
    //               `• Plan: ${metadata?.plan_name}\n` +
    //               `• Monto: $${payment.transaction_amount.toLocaleString('es-CL')} ${payment.currency_id}\n` +
    //               `• ID Pago: ${payment.id}`,
    //       },
    //     },
    //   ],
    // });

    this.logger.log(`✅ Equipo notificado (mock) sobre ${user.email}`);
  }

  /**
   * Provisiona recursos para el usuario (SaaS Dedicado / On-Premise)
   */
  private async provisionResources(user: User, metadata: any) {
    this.logger.log(`Provisionando recursos para usuario ${user.id}`);

    // TODO: Implementar lógica de provisionamiento
    // - Crear base de datos dedicada
    // - Crear instancia de servidor
    // - Configurar subdomain
    // - Copiar código y configurar
    // - Iniciar servicios

    this.logger.log(`✅ Recursos provisionados (mock) para usuario ${user.id}`);
  }

  /**
   * Maneja un pago pendiente
   */
  private async handlePendingPayment(payment: any) {
    this.logger.log(`⏳ Pago pendiente: ${payment.id}`);

    // TODO: Enviar email notificando que el pago está en proceso
  }

  /**
   * Maneja un pago rechazado
   */
  private async handleRejectedPayment(payment: any) {
    this.logger.log(`❌ Pago rechazado: ${payment.id} - Razón: ${payment.status_detail}`);

    try {
      const metadata = payment.metadata;
      const email = metadata?.email || payment.payer?.email;

      if (!email) {
        this.logger.warn('No se encontró email para notificar pago rechazado');
        return;
      }

      const appUrl = this.configService.get<string>('APP_URL') || 'http://localhost:3000';

      // Traducir razón de rechazo al español
      const reasons: Record<string, string> = {
        cc_rejected_insufficient_amount: 'Fondos insuficientes en tu tarjeta',
        cc_rejected_bad_filled_security_code: 'Código de seguridad (CVV) incorrecto',
        cc_rejected_bad_filled_date: 'Fecha de vencimiento incorrecta',
        cc_rejected_bad_filled_other: 'Revisa los datos de tu tarjeta',
        cc_rejected_call_for_authorize: 'Debes autorizar el pago con tu banco',
        cc_rejected_card_disabled: 'Tu tarjeta está deshabilitada. Contacta a tu banco',
        cc_rejected_duplicated_payment: 'Ya realizaste un pago similar recientemente',
        cc_rejected_high_risk: 'Tu banco rechazó el pago por seguridad',
        cc_rejected_max_attempts: 'Superaste el número máximo de intentos',
        cc_rejected_other_reason: 'Tu banco rechazó el pago. Contacta a tu banco',
      };

      const reason =
        reasons[payment.status_detail] || `El pago fue rechazado. Motivo: ${payment.status_detail}`;

      await this.emailService.sendPaymentFailed({
        firstName: payment.payer?.name || 'Usuario',
        email,
        planName: metadata?.plan_name || 'Plan ChatBotDysa',
        reason,
        retryUrl: `${appUrl}/checkout/payment?plan=${metadata?.plan_id || 'saas-multi'}`,
      });

      this.logger.log(`✅ Email de pago rechazado enviado a ${email}`);
    } catch (error) {
      this.logger.error(`Error enviando email de pago rechazado: ${error.message}`);
      // No lanzar error
    }
  }

  /**
   * Maneja un reembolso
   */
  private async handleRefundedPayment(payment: any) {
    this.logger.log(`💰 Pago reembolsado: ${payment.id}`);

    // TODO: Desactivar suscripción y enviar email de confirmación
  }

  /**
   * Verifica la firma del webhook de MercadoPago
   * @see https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks
   */
  verifyWebhookSignature(xSignature: string, xRequestId: string, dataId: string): boolean {
    try {
      const webhookSecret = this.configService.get<string>('MERCADOPAGO_WEBHOOK_SECRET');

      if (!webhookSecret) {
        this.logger.warn('⚠️ MERCADOPAGO_WEBHOOK_SECRET no configurado - Omitiendo verificación');
        return true; // En desarrollo permitir sin verificación
      }

      if (!xSignature) {
        this.logger.warn('⚠️ Header x-signature no presente');
        return false;
      }

      // Parsear el header x-signature
      // Formato: ts=timestamp,v1=hash
      const signatureParts: Record<string, string> = {};
      xSignature.split(',').forEach((part) => {
        const [key, value] = part.split('=');
        if (key && value) {
          signatureParts[key.trim()] = value.trim();
        }
      });

      const ts = signatureParts['ts'];
      const v1 = signatureParts['v1'];

      if (!ts || !v1) {
        this.logger.warn('⚠️ Formato de x-signature inválido');
        return false;
      }

      // Crear el manifest según la documentación de MP
      // manifest = id:data.id;request-id:x-request-id;ts:ts;
      const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

      // Generar HMAC SHA256
      const expectedHash = crypto
        .createHmac('sha256', webhookSecret)
        .update(manifest)
        .digest('hex');

      // Comparar de forma segura
      const isValid = crypto.timingSafeEqual(Buffer.from(v1), Buffer.from(expectedHash));

      if (!isValid) {
        this.logger.warn('⚠️ Firma de webhook inválida');
      }

      return isValid;
    } catch (error) {
      this.logger.error(`Error verificando firma: ${error.message}`);
      return false;
    }
  }

  /**
   * Verifica si Mercado Pago está configurado correctamente
   */
  async healthCheck() {
    try {
      const accessToken = this.configService.get<string>('MERCADOPAGO_ACCESS_TOKEN');

      if (!accessToken) {
        return { status: 'error', message: 'Access token no configurado' };
      }

      // Verificar si es token de test o producción
      const isTest = accessToken.startsWith('TEST-');

      return {
        status: 'ok',
        environment: isTest ? 'test' : 'production',
        configured: true,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        configured: false,
      };
    }
  }
}
