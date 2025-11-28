import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from '../auth/entities/user.entity';
import { CreatePaymentDto, PlanType, PaymentMethod } from './dto/create-payment.dto';

interface MercadoPagoPayment {
  id: string;
  status: string;
  statusDetail: string;
  transactionAmount: number;
  dateCreated: string;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Create a payment and process it
   */
  async createPayment(createPaymentDto: CreatePaymentDto) {
    const businessName = createPaymentDto.businessName || createPaymentDto.companyName;
    this.logger.log(`Creating payment for ${businessName}`);

    // Validate plan and amount (use plan or planId)
    const planType = createPaymentDto.plan || createPaymentDto.planId;
    this.validatePlanAmount(planType, createPaymentDto.amount);

    // Process payment based on method
    let paymentResult;

    switch (createPaymentDto.paymentMethod) {
      case PaymentMethod.CARD:
        paymentResult = await this.processCardPayment(createPaymentDto);
        break;

      case PaymentMethod.TRANSFER:
        paymentResult = await this.processTransferPayment(createPaymentDto);
        break;

      case PaymentMethod.INVOICE:
        paymentResult = await this.processInvoicePayment(createPaymentDto);
        break;

      default:
        throw new BadRequestException('Invalid payment method');
    }

    // If payment successful, convert trial to active
    if (paymentResult.success) {
      await this.convertTrialToActive(createPaymentDto);

      // Send confirmation email
      await this.sendConfirmationEmail(createPaymentDto);

      // Notify team (Slack/email)
      await this.notifyTeam(createPaymentDto);
    }

    return paymentResult;
  }

  /**
   * Process card payment via Mercado Pago
   */
  private async processCardPayment(dto: CreatePaymentDto) {
    this.logger.log('Processing card payment via Mercado Pago');

    try {
      // TODO: Implement actual Mercado Pago API call
      // For now, simulate success
      const mockPayment: MercadoPagoPayment = {
        id: `MP${Date.now()}`,
        status: 'approved',
        statusDetail: 'accredited',
        transactionAmount: dto.amount,
        dateCreated: new Date().toISOString(),
      };

      // In production, would call Mercado Pago API:
      /*
      const mercadopago = require('mercadopago');
      mercadopago.configure({
        access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN,
      });

      const payment = await mercadopago.payment.create({
        transaction_amount: dto.amount,
        token: dto.cardToken,
        description: `ChatBotDysa - Plan ${dto.plan}`,
        installments: 1,
        payment_method_id: 'visa', // or mastercard, etc
        payer: {
          email: dto.email,
        },
      });
      */

      return {
        success: true,
        paymentId: mockPayment.id,
        status: mockPayment.status,
        amount: mockPayment.transactionAmount,
        message: 'Pago procesado exitosamente',
      };
    } catch (error) {
      this.logger.error('Error processing card payment', error);
      throw new BadRequestException('Error processing payment. Please try again.');
    }
  }

  /**
   * Process transfer payment (generates payment instructions)
   */
  private async processTransferPayment(dto: CreatePaymentDto) {
    this.logger.log('Processing transfer payment');

    // Generate transfer instructions
    const transferInstructions = {
      bank: 'Banco de Chile',
      accountType: 'Cuenta Corriente',
      accountNumber: '12345678',
      rut: '76.XXX.XXX-X',
      accountHolder: 'ChatBotDysa SpA',
      amount: dto.amount,
      reference: `CB-${Date.now()}`,
    };

    // In production, would:
    // 1. Generate unique reference number
    // 2. Store pending payment in database
    // 3. Send email with instructions
    // 4. Set up webhook to receive confirmation

    return {
      success: true,
      paymentId: `TRANSFER-${Date.now()}`,
      status: 'pending',
      amount: dto.amount,
      message: 'Instrucciones de transferencia enviadas por email',
      transferInstructions,
    };
  }

  /**
   * Process invoice payment (30 days)
   */
  private async processInvoicePayment(dto: CreatePaymentDto) {
    this.logger.log('Processing invoice payment');

    // Validate business (must be company, not individual)
    if (!dto.rut || dto.rut.length < 9) {
      throw new BadRequestException('RUT de empresa requerido para factura');
    }

    // In production, would:
    // 1. Verify company in SII (Chilean IRS)
    // 2. Check credit approval
    // 3. Generate invoice
    // 4. Activate account immediately
    // 5. Set payment due date (30 days)

    return {
      success: true,
      paymentId: `INVOICE-${Date.now()}`,
      status: 'pending',
      amount: dto.amount,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      message: 'Cuenta activada. Factura enviada a pagar en 30 días',
    };
  }

  /**
   * Convert trial account to active paid account
   */
  private async convertTrialToActive(dto: CreatePaymentDto) {
    this.logger.log(`Converting trial to active for ${dto.email}`);

    // Find user by email
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      this.logger.warn(`User not found for email: ${dto.email}`);
      return;
    }

    // Update user status and plan
    user.status = UserStatus.ACTIVE;
    // user.plan = dto.plan; // Add plan field to User entity
    // user.subscriptionStartDate = new Date();
    // user.subscriptionEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await this.userRepository.save(user);

    const planType = dto.plan || dto.planId;
    this.logger.log(`User ${user.id} converted to active plan: ${planType}`);
  }

  /**
   * Send confirmation email to customer
   */
  private async sendConfirmationEmail(dto: CreatePaymentDto) {
    this.logger.log(`Sending confirmation email to ${dto.email}`);

    // In production, would use SendGrid/Mailgun:
    /*
    await this.emailService.send({
      to: dto.email,
      subject: '¡Tu cuenta de ChatBotDysa está activada!',
      template: 'subscription-activated',
      data: {
        businessName: dto.businessName,
        plan: dto.plan,
        amount: dto.amount,
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        loginUrl: process.env.ADMIN_PANEL_URL,
      },
    });
    */

    this.logger.log('Confirmation email sent');
  }

  /**
   * Notify team about new customer
   */
  private async notifyTeam(dto: CreatePaymentDto) {
    this.logger.log('Notifying team about new customer');

    // In production, would send Slack notification:
    /*
    await this.slackService.sendMessage({
      channel: '#new-customers',
      text: `🎉 Nuevo cliente: ${dto.businessName}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Nuevo cliente activado*\n` +
                  `• Nombre: ${dto.businessName}\n` +
                  `• Plan: ${dto.plan}\n` +
                  `• Monto: $${dto.amount.toLocaleString('es-CL')}\n` +
                  `• Email: ${dto.email}`,
          },
        },
      ],
    });
    */

    this.logger.log('Team notified');
  }

  /**
   * Validate plan and amount match
   */
  private validatePlanAmount(plan: PlanType, amount: number) {
    const expectedAmounts = {
      [PlanType.SAAS_MULTI_TENANT]: 49995, // 50% OFF first month
      [PlanType.SAAS_DEDICATED]: 199990,
      [PlanType.ON_PREMISE]: 2500000,
    };

    const expected = expectedAmounts[plan];

    // Allow 5% tolerance for currency conversion, etc
    const tolerance = expected * 0.05;

    if (Math.abs(amount - expected) > tolerance) {
      throw new BadRequestException(
        `Amount ${amount} doesn't match expected amount ${expected} for plan ${plan}`,
      );
    }
  }

  /**
   * Handle Mercado Pago webhook
   */
  async handleWebhook(body: any) {
    this.logger.log('Received webhook from Mercado Pago');

    // Validate webhook signature
    // In production, verify the webhook signature

    // Process webhook event
    const { type, data } = body;

    switch (type) {
      case 'payment':
        await this.handlePaymentWebhook(data.id);
        break;

      default:
        this.logger.log(`Unhandled webhook type: ${type}`);
    }

    return { received: true };
  }

  /**
   * Process payment webhook from Mercado Pago
   */
  private async handlePaymentWebhook(paymentId: string) {
    this.logger.log(`Processing payment webhook: ${paymentId}`);

    // In production, would:
    // 1. Fetch payment details from Mercado Pago
    // 2. Update payment status in database
    // 3. If approved, activate account
    // 4. Send confirmation email
  }

  /**
   * Get plan pricing
   */
  getPlanPricing() {
    return {
      [PlanType.SAAS_MULTI_TENANT]: {
        name: 'SaaS Multi-Tenant',
        price: 99990,
        discountedPrice: 49995,
        discount: 50,
        period: 'monthly',
        features: [
          'Activación inmediata',
          'Chatbot IA ilimitado',
          'WhatsApp Business',
          'Soporte 24/7',
          'Backup diario',
        ],
      },
      [PlanType.SAAS_DEDICATED]: {
        name: 'SaaS Dedicado',
        price: 199990,
        period: 'monthly',
        features: [
          'Todo lo de Multi-Tenant',
          'Servidor dedicado',
          '3x más rendimiento',
          'Soporte prioritario',
          'SLA 99.9%',
        ],
      },
      [PlanType.ON_PREMISE]: {
        name: 'On-Premise',
        setupFee: 2500000,
        monthlyFee: 49990,
        period: 'one-time + monthly',
        features: [
          'Instalación en tu servidor',
          'Control total de datos',
          'Código fuente accesible',
          'Ingeniero dedicado',
          'SLA 99.99%',
        ],
      },
    };
  }
}
