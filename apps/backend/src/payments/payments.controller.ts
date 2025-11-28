import { Controller, Post, Body, Get, Headers, HttpCode, HttpStatus, Logger, Param, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { MercadoPagoService } from './mercadopago.service';
import { EmailService } from '../common/services/email.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { WebhookPaymentDto } from './dto/webhook-payment.dto';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly mercadoPagoService: MercadoPagoService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Create a new payment
   * POST /api/payments
   */
  @Post()
  async createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    this.logger.log(`Received payment request for ${createPaymentDto.businessName}`);

    try {
      const result = await this.paymentsService.createPayment(createPaymentDto);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error('Error creating payment', error);
      throw error;
    }
  }

  /**
   * Get plan pricing
   * GET /api/payments/pricing
   */
  @Get('pricing')
  getPricing() {
    return {
      success: true,
      data: this.paymentsService.getPlanPricing(),
    };
  }

  /**
   * Create Mercado Pago preference (NEW)
   * POST /api/payments/create-preference
   */
  @Post('create-preference')
  @HttpCode(HttpStatus.OK)
  async createPreference(@Body() createPaymentDto: CreatePaymentDto) {
    this.logger.log(`Creating Mercado Pago preference for: ${createPaymentDto.email}`);

    try {
      const result = await this.mercadoPagoService.createPreference(createPaymentDto);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error('Error creating preference', error);
      throw error;
    }
  }

  /**
   * Mercado Pago health check (NEW)
   * GET /api/payments/health
   */
  @Get('health')
  async healthCheck() {
    const health = await this.mercadoPagoService.healthCheck();
    return {
      success: health.status === 'ok',
      data: health,
    };
  }

  /**
   * Test email endpoint (for SendGrid verification)
   * GET /api/payments/test-email?email=your@email.com
   */
  @Get('test-email')
  async testEmail(@Query('email') email?: string) {
    this.logger.log(`Testing email to: ${email || 'default address'}`);

    try {
      await this.emailService.sendPaymentConfirmation({
        firstName: 'Usuario de Prueba',
        email: email || 'test@chatbotdysa.com',
        planName: 'SaaS Multi-tenant',
        amount: 49990,
        currency: 'CLP',
        paymentId: 'test_' + Date.now(),
        transactionId: 'TXN_' + Date.now() + '_test',
        loginUrl: 'http://localhost:8001/login',
      });

      return {
        success: true,
        message: `Email de prueba enviado a ${email || 'test@chatbotdysa.com'}`,
        note: 'Verifica tu inbox (puede tardar 10-30 segundos). Revisa spam si no llega.',
      };
    } catch (error) {
      this.logger.error('Error sending test email', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get payment details by ID (NEW)
   * GET /api/payments/:id
   * IMPORTANTE: Este debe estar AL FINAL para no capturar rutas específicas
   */
  @Get(':id')
  async getPayment(@Param('id') id: string) {
    this.logger.log(`Getting payment: ${id}`);

    try {
      const payment = await this.mercadoPagoService.getPayment(id);
      return {
        success: true,
        data: payment,
      };
    } catch (error) {
      this.logger.error(`Error getting payment ${id}`, error);
      throw error;
    }
  }

  /**
   * Webhook endpoint for Mercado Pago (UPDATED)
   * POST /api/payments/webhook
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Body() webhookData: WebhookPaymentDto,
    @Headers('x-signature') signature?: string,
    @Headers('x-request-id') requestId?: string,
  ) {
    this.logger.log(`Received webhook with request ID: ${requestId}`);

    // TODO: Verify webhook signature in production
    // if (!this.verifyWebhookSignature(webhookData, signature)) {
    //   throw new UnauthorizedException('Invalid webhook signature');
    // }

    try {
      const result = await this.mercadoPagoService.processWebhook(webhookData);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error('Error processing webhook', error);
      // Still return 200 to avoid retries from Mercado Pago
      return { received: false, error: error.message };
    }
  }
}
