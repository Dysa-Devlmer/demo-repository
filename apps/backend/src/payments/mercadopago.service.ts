import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { WebhookPaymentDto } from './dto/webhook-payment.dto';
import { User, UserStatus } from '../auth/entities/user.entity';
import { EmailService } from '../common/services/email.service';

@Injectable()
export class MercadoPagoService {
  private readonly logger = new Logger(MercadoPagoService.name);
  private mercadoPago: MercadoPagoConfig;
  private paymentClient: Payment;
  private preferenceClient: Preference;

  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private emailService: EmailService,
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
      }
    });

    this.paymentClient = new Payment(this.mercadoPago);
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
    this.logger.log(`✅ Pago aprobado: ${payment.id} - $${payment.transaction_amount} ${payment.currency_id}`);

    try {
      const metadata = payment.metadata as any;
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
  private async recordPayment(userId: number, payment: any, metadata: any) {
    this.logger.log(`Registrando pago en BD: ${payment.id}`);

    // TODO: Crear tabla Payment en la base de datos
    // const paymentRecord = this.paymentRepository.create({
    //   userId,
    //   paymentId: payment.id,
    //   amount: payment.transaction_amount,
    //   currency: payment.currency_id,
    //   status: payment.status,
    //   planId: metadata?.plan_id,
    //   planName: metadata?.plan_name,
    //   billingPeriod: metadata?.billing_period,
    //   externalReference: payment.external_reference,
    //   dateApproved: payment.date_approved,
    // });
    // await this.paymentRepository.save(paymentRecord);

    this.logger.log(`✅ Pago registrado (mock) para usuario ${userId}`);
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
      const metadata = payment.metadata as any;
      const email = metadata?.email || payment.payer?.email;

      if (!email) {
        this.logger.warn('No se encontró email para notificar pago rechazado');
        return;
      }

      const appUrl = this.configService.get<string>('APP_URL') || 'http://localhost:3000';

      // Traducir razón de rechazo al español
      const reasons: Record<string, string> = {
        'cc_rejected_insufficient_amount': 'Fondos insuficientes en tu tarjeta',
        'cc_rejected_bad_filled_security_code': 'Código de seguridad (CVV) incorrecto',
        'cc_rejected_bad_filled_date': 'Fecha de vencimiento incorrecta',
        'cc_rejected_bad_filled_other': 'Revisa los datos de tu tarjeta',
        'cc_rejected_call_for_authorize': 'Debes autorizar el pago con tu banco',
        'cc_rejected_card_disabled': 'Tu tarjeta está deshabilitada. Contacta a tu banco',
        'cc_rejected_duplicated_payment': 'Ya realizaste un pago similar recientemente',
        'cc_rejected_high_risk': 'Tu banco rechazó el pago por seguridad',
        'cc_rejected_max_attempts': 'Superaste el número máximo de intentos',
        'cc_rejected_other_reason': 'Tu banco rechazó el pago. Contacta a tu banco',
      };

      const reason = reasons[payment.status_detail] ||
                    `El pago fue rechazado. Motivo: ${payment.status_detail}`;

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
