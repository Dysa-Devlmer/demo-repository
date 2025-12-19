import { Controller, Get, Post, Body, Param, Query, Headers } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiHeader,
} from '@nestjs/swagger';
import { IntegrationService } from '../services/integration.service';
import type { WhatsAppMessage, SMSMessage, MessageResult } from '../services/integration.service';

@ApiTags('Integrations')
@Controller('integrations')
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) {}

  @Get('status')
  @ApiOperation({
    summary: 'Get integration status',
    description:
      'Retrieve the current status of all integrations including Twilio and WhatsApp Business API',
  })
  @ApiResponse({
    status: 200,
    description: 'Integration status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        twilio: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean', example: true },
            configured: { type: 'boolean', example: true },
            phoneNumber: { type: 'string', example: '+1234567890' },
            whatsappNumber: {
              type: 'string',
              example: 'whatsapp:+14155238886',
            },
            clientInitialized: { type: 'boolean', example: true },
          },
        },
        whatsapp: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean', example: false },
            configured: { type: 'boolean', example: false },
            businessAccountId: { type: 'string', example: '123456789' },
            phoneNumberId: { type: 'string', example: '987654321' },
          },
        },
        features: {
          type: 'object',
          properties: {
            sms: { type: 'boolean', example: true },
            whatsappTwilio: { type: 'boolean', example: true },
            whatsappBusiness: { type: 'boolean', example: false },
            webhookVerification: { type: 'boolean', example: false },
          },
        },
      },
    },
  })
  getIntegrationStatus() {
    const status = this.integrationService.getIntegrationStatus();
    return {
      ...status,
      timestamp: new Date().toISOString(),
      message: 'Integration status retrieved successfully',
    };
  }

  @Post('sms/send')
  @ApiOperation({
    summary: 'Send SMS via Twilio',
    description:
      'Send an SMS message using Twilio integration with automatic fallback to simulation',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        to: {
          type: 'string',
          example: '+573001234567',
          description: 'Phone number in E.164 format',
        },
        message: {
          type: 'string',
          example: 'Hola, tu pedido está listo para recoger!',
          description: 'SMS message content',
        },
        from: {
          type: 'string',
          example: '+1234567890',
          description: 'Optional: Sender phone number (uses configured number if not provided)',
        },
      },
      required: ['to', 'message'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'SMS sent successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        messageId: { type: 'string', example: 'SM1234567890abcdef' },
        status: { type: 'string', example: 'queued' },
        cost: { type: 'number', example: 0.075 },
        timestamp: { type: 'string', format: 'date-time' },
        integration: { type: 'string', example: 'twilio' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid phone number or message content',
  })
  async sendSMS(@Body() smsData: SMSMessage): Promise<MessageResult & { integration: string }> {
    const result = await this.integrationService.sendSMS(smsData);

    return {
      ...result,
      integration: result.status === 'simulated' ? 'simulation' : 'twilio',
    };
  }

  @Post('whatsapp/send')
  @ApiOperation({
    summary: 'Send WhatsApp message via Twilio',
    description:
      'Send a WhatsApp message using Twilio WhatsApp Business API with automatic fallback',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        to: {
          type: 'string',
          example: '+573001234567',
          description: 'WhatsApp phone number in E.164 format',
        },
        message: {
          type: 'string',
          example: 'Tu pedido #12345 está listo para recoger en el restaurante.',
          description: 'WhatsApp message content',
        },
        mediaUrl: {
          type: 'string',
          example: 'https://example.com/image.jpg',
          description: 'Optional: URL of media file to send',
        },
        templateId: {
          type: 'string',
          example: 'order_ready',
          description: 'Optional: WhatsApp template ID for business messaging',
        },
        templateParams: {
          type: 'object',
          example: { orderNumber: '12345', customerName: 'Juan Pérez' },
          description: 'Optional: Template parameters for variable substitution',
        },
      },
      required: ['to', 'message'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'WhatsApp message sent successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        messageId: { type: 'string', example: 'SMwa1234567890abcdef' },
        status: { type: 'string', example: 'queued' },
        cost: { type: 'number', example: 0.05 },
        timestamp: { type: 'string', format: 'date-time' },
        integration: { type: 'string', example: 'twilio' },
      },
    },
  })
  async sendWhatsApp(
    @Body() whatsappData: WhatsAppMessage
  ): Promise<MessageResult & { integration: string }> {
    const result = await this.integrationService.sendWhatsApp(whatsappData);

    return {
      ...result,
      integration: result.status === 'simulated' ? 'simulation' : 'twilio',
    };
  }

  @Post('whatsapp-business/send')
  @ApiOperation({
    summary: 'Send WhatsApp message via Facebook Business API',
    description:
      'Send a WhatsApp message using Facebook WhatsApp Business API with template support',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        to: {
          type: 'string',
          example: '573001234567',
          description: 'WhatsApp phone number (without + prefix for Business API)',
        },
        message: {
          type: 'string',
          example: 'Gracias por tu pedido. Te notificaremos cuando esté listo.',
          description: 'WhatsApp message content',
        },
        templateId: {
          type: 'string',
          example: 'order_confirmation',
          description: 'Optional: WhatsApp Business template name',
        },
        templateParams: {
          type: 'object',
          example: { '1': 'Juan Pérez', '2': '12345' },
          description: 'Optional: Template parameters (indexed by position)',
        },
      },
      required: ['to', 'message'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'WhatsApp Business message sent successfully',
  })
  async sendWhatsAppBusiness(
    @Body() whatsappData: WhatsAppMessage
  ): Promise<MessageResult & { integration: string }> {
    const result = await this.integrationService.sendWhatsAppBusiness(whatsappData);

    return {
      ...result,
      integration: result.status === 'simulated' ? 'simulation' : 'whatsapp_business',
    };
  }

  @Get('whatsapp/webhook')
  @ApiOperation({
    summary: 'WhatsApp webhook verification',
    description: 'Verify WhatsApp webhook for Facebook Business API integration',
  })
  @ApiQuery({
    name: 'hub.mode',
    required: true,
    type: 'string',
    example: 'subscribe',
    description: 'Webhook verification mode',
  })
  @ApiQuery({
    name: 'hub.verify_token',
    required: true,
    type: 'string',
    example: 'your_verify_token',
    description: 'Webhook verification token',
  })
  @ApiQuery({
    name: 'hub.challenge',
    required: true,
    type: 'string',
    example: '1234567890',
    description: 'Webhook challenge string',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook verified successfully',
    schema: {
      type: 'string',
      example: '1234567890',
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Webhook verification failed',
  })
  verifyWhatsAppWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string
  ): string | { error: string } {
    const result = this.integrationService.verifyWebhook(mode, token, challenge);

    if (result) {
      return result;
    }

    return { error: 'Webhook verification failed' };
  }

  @Post('whatsapp/webhook')
  @ApiOperation({
    summary: 'WhatsApp webhook endpoint',
    description: 'Receive WhatsApp messages and status updates from Facebook Business API',
  })
  @ApiHeader({
    name: 'X-Hub-Signature-256',
    description: 'Facebook webhook signature for security verification',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
  })
  async handleWhatsAppWebhook(
    @Body() webhookData: any,
    @Headers('x-hub-signature-256') signature?: string
  ) {
    // Log webhook received
    console.log('WhatsApp webhook received:', JSON.stringify(webhookData, null, 2));

    // In a real implementation, you would:
    // 1. Verify the webhook signature
    // 2. Process incoming messages
    // 3. Update message status
    // 4. Trigger appropriate business logic

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      processed: true,
    };
  }

  @Get('test/sms/:phone')
  @ApiOperation({
    summary: 'Test SMS integration',
    description: 'Send a test SMS to verify integration is working',
  })
  @ApiParam({
    name: 'phone',
    description: 'Phone number to send test SMS',
    example: '+573001234567',
  })
  @ApiResponse({
    status: 200,
    description: 'Test SMS sent successfully',
  })
  async testSMS(@Param('phone') phone: string) {
    const testMessage: SMSMessage = {
      to: phone,
      message: '🚀 Test SMS from ChatBotDysa Enterprise API - Integration working correctly!',
    };

    const result = await this.integrationService.sendSMS(testMessage);

    return {
      test: 'sms',
      phone,
      result,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('test/whatsapp/:phone')
  @ApiOperation({
    summary: 'Test WhatsApp integration',
    description: 'Send a test WhatsApp message to verify integration is working',
  })
  @ApiParam({
    name: 'phone',
    description: 'WhatsApp phone number to send test message',
    example: '+573001234567',
  })
  @ApiResponse({
    status: 200,
    description: 'Test WhatsApp message sent successfully',
  })
  async testWhatsApp(@Param('phone') phone: string) {
    const testMessage: WhatsAppMessage = {
      to: phone,
      message:
        '🍕 Test WhatsApp from ChatBotDysa Enterprise! Your restaurant management system is ready for business. 🚀',
    };

    const result = await this.integrationService.sendWhatsApp(testMessage);

    return {
      test: 'whatsapp',
      phone,
      result,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('pricing')
  @ApiOperation({
    summary: 'Get integration pricing information',
    description: 'Retrieve current pricing for SMS and WhatsApp messages',
  })
  @ApiResponse({
    status: 200,
    description: 'Pricing information retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        sms: {
          type: 'object',
          properties: {
            perSegment: { type: 'number', example: 0.075 },
            charactersPerSegment: { type: 'number', example: 160 },
            currency: { type: 'string', example: 'USD' },
          },
        },
        whatsapp: {
          type: 'object',
          properties: {
            perMessage: { type: 'number', example: 0.05 },
            charactersIncluded: { type: 'number', example: 1000 },
            currency: { type: 'string', example: 'USD' },
          },
        },
      },
    },
  })
  getPricingInfo() {
    return {
      sms: {
        perSegment: 0.075,
        charactersPerSegment: 160,
        currency: 'USD',
        description: 'SMS messages are charged per 160-character segment',
      },
      whatsapp: {
        perMessage: 0.05,
        charactersIncluded: 1000,
        currency: 'USD',
        description: 'WhatsApp messages include up to 1000 characters',
      },
      billing: {
        frequency: 'monthly',
        minimumSpend: 0,
        payAsYouGo: true,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('logs')
  @ApiOperation({
    summary: 'Get integration logs',
    description: 'Retrieve recent integration activity and message logs',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: 'number',
    example: 50,
    description: 'Maximum number of log entries to return',
  })
  @ApiQuery({
    name: 'integration',
    required: false,
    type: 'string',
    example: 'twilio',
    description: 'Filter by integration type (twilio, whatsapp_business, simulation)',
  })
  @ApiResponse({
    status: 200,
    description: 'Integration logs retrieved successfully',
  })
  getIntegrationLogs(@Query('limit') limit?: number, @Query('integration') integration?: string) {
    // In a real implementation, this would query actual logs
    const mockLogs = [
      {
        timestamp: new Date(Date.now() - 300000).toISOString(),
        integration: 'twilio',
        action: 'sms_sent',
        to: '+573001234567',
        messageId: 'SM1234567890abcdef',
        status: 'delivered',
        cost: 0.075,
      },
      {
        timestamp: new Date(Date.now() - 600000).toISOString(),
        integration: 'twilio',
        action: 'whatsapp_sent',
        to: '+573001234567',
        messageId: 'SMwa1234567890abcdef',
        status: 'read',
        cost: 0.05,
      },
      {
        timestamp: new Date(Date.now() - 900000).toISOString(),
        integration: 'simulation',
        action: 'sms_simulated',
        to: '+573007654321',
        messageId: 'sim_sms_1757348000000_abc123',
        status: 'simulated',
        cost: 0.075,
      },
    ];

    const filteredLogs = integration
      ? mockLogs.filter((log) => log.integration === integration)
      : mockLogs;

    const limitedLogs = limit ? filteredLogs.slice(0, limit) : filteredLogs;

    return {
      logs: limitedLogs,
      total: filteredLogs.length,
      filters: {
        integration,
        limit,
      },
      summary: {
        totalMessages: filteredLogs.length,
        totalCost: filteredLogs.reduce((sum, log) => sum + log.cost, 0),
        integrations: [...new Set(filteredLogs.map((log) => log.integration))],
      },
      timestamp: new Date().toISOString(),
    };
  }
}
