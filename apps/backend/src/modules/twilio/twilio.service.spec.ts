import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { TwilioService, VoiceCallOptions, SMSOptions, CallStatus } from './twilio.service';
import { I18nService } from '../../i18n/i18n.service';
import { Twilio } from 'twilio';

// Mock Twilio
jest.mock('twilio');
const MockedTwilio = Twilio as jest.MockedClass<typeof Twilio>;

describe('TwilioService - Unit Tests', () => {
  let service: TwilioService;
  let configService: ConfigService;
  let i18nService: I18nService;
  let mockTwilioClient: any;

  const mockConfig = {
    TWILIO_ACCOUNT_SID: 'ACtest123',
    TWILIO_AUTH_TOKEN: 'test-auth-token',
    TWILIO_PHONE_NUMBER: '+12345678901',
    TWILIO_WEBHOOK_URL: 'https://api.test.com/webhooks',
  };

  beforeEach(async () => {
    // Mock Twilio client
    mockTwilioClient = {
      calls: {
        create: jest.fn(),
      },
      messages: {
        create: jest.fn(),
      },
    };

    // Mock para obtener call status
    const mockCallInstance = {
      fetch: jest.fn(),
      update: jest.fn(),
    };

    mockTwilioClient.calls = jest.fn((callSid?: string) => {
      if (callSid) {
        return mockCallInstance;
      }
      return { create: jest.fn() };
    });

    mockTwilioClient.calls.create = jest.fn();

    MockedTwilio.mockImplementation(() => mockTwilioClient as any);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TwilioService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: string) => {
              if (defaultValue !== undefined && !mockConfig[key]) {
                return defaultValue;
              }
              return mockConfig[key];
            }),
          },
        },
        {
          provide: I18nService,
          useValue: {
            t: jest.fn((key: string) => {
              const translations = {
                'errors.twilioNotConfigured': 'Twilio not configured',
              };
              return translations[key] || key;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<TwilioService>(TwilioService);
    configService = module.get<ConfigService>(ConfigService);
    i18nService = module.get<I18nService>(I18nService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should initialize with correct credentials', () => {
      const health = service.getHealthStatus();
      expect(health.configured).toBe(true);
      expect(health.phoneNumber).toBe('+12345678901');
      expect(health.webhookUrl).toBe('https://api.test.com/webhooks');
    });

    it('should warn when credentials are not configured', async () => {
      const module = await Test.createTestingModule({
        providers: [
          TwilioService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn(() => ''),
            },
          },
          {
            provide: I18nService,
            useValue: {
              t: jest.fn((key: string) => key),
            },
          },
        ],
      }).compile();

      const testService = module.get<TwilioService>(TwilioService);
      const health = testService.getHealthStatus();

      expect(health.configured).toBe(false);
    });

    it('should initialize Twilio client with correct parameters', () => {
      expect(MockedTwilio).toHaveBeenCalledWith('ACtest123', 'test-auth-token');
    });
  });

  describe('makeCall', () => {
    const callOptions: VoiceCallOptions = {
      to: '+19876543210',
      url: 'https://api.test.com/twiml',
    };

    it('should make call successfully', async () => {
      mockTwilioClient.calls.create.mockResolvedValue({
        sid: 'CA123456',
      });

      const result = await service.makeCall(callOptions);

      expect(result.success).toBe(true);
      expect(result.callSid).toBe('CA123456');
      expect(mockTwilioClient.calls.create).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '+19876543210',
          from: '+12345678901',
          url: 'https://api.test.com/twiml',
          timeout: 30,
          record: false,
        }),
      );
    });

    it('should make call with custom from number', async () => {
      mockTwilioClient.calls.create.mockResolvedValue({
        sid: 'CA123456',
      });

      const result = await service.makeCall({
        ...callOptions,
        from: '+11111111111',
      });

      expect(result.success).toBe(true);
      expect(mockTwilioClient.calls.create).toHaveBeenCalledWith(
        expect.objectContaining({
          from: '+11111111111',
        }),
      );
    });

    it('should make call with TwiML', async () => {
      mockTwilioClient.calls.create.mockResolvedValue({
        sid: 'CA789012',
      });

      const result = await service.makeCall({
        to: '+19876543210',
        twiml: '<Response><Say>Hello</Say></Response>',
      });

      expect(result.success).toBe(true);
      expect(mockTwilioClient.calls.create).toHaveBeenCalledWith(
        expect.objectContaining({
          twiml: '<Response><Say>Hello</Say></Response>',
        }),
      );
    });

    it('should use default restaurant TwiML when no URL or TwiML provided', async () => {
      mockTwilioClient.calls.create.mockResolvedValue({
        sid: 'CA345678',
      });

      const result = await service.makeCall({
        to: '+19876543210',
      });

      expect(result.success).toBe(true);
      const callArgs = mockTwilioClient.calls.create.mock.calls[0][0];
      expect(callArgs.twiml).toContain('ChefBot Dysa');
      expect(callArgs.twiml).toContain('Presiona 1');
    });

    it('should include statusCallback when provided', async () => {
      mockTwilioClient.calls.create.mockResolvedValue({
        sid: 'CA111222',
      });

      const result = await service.makeCall({
        to: '+19876543210',
        url: 'https://test.com/twiml',
        statusCallback: 'https://test.com/status',
        statusCallbackMethod: 'GET',
      });

      expect(result.success).toBe(true);
      expect(mockTwilioClient.calls.create).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCallback: 'https://test.com/status',
          statusCallbackMethod: 'GET',
        }),
      );
    });

    it('should handle errors', async () => {
      mockTwilioClient.calls.create.mockRejectedValue(new Error('Invalid phone number'));

      const result = await service.makeCall(callOptions);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid phone number');
    });
  });

  describe('sendSMS', () => {
    const smsOptions: SMSOptions = {
      to: '+19876543210',
      body: '¡Hola! Tu reserva ha sido confirmada.',
    };

    it('should send SMS successfully', async () => {
      mockTwilioClient.messages.create.mockResolvedValue({
        sid: 'SM123456',
      });

      const result = await service.sendSMS(smsOptions);

      expect(result.success).toBe(true);
      expect(result.messageSid).toBe('SM123456');
      expect(mockTwilioClient.messages.create).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '+19876543210',
          from: '+12345678901',
          body: '¡Hola! Tu reserva ha sido confirmada.',
        }),
      );
    });

    it('should send SMS with custom from number', async () => {
      mockTwilioClient.messages.create.mockResolvedValue({
        sid: 'SM789012',
      });

      const result = await service.sendSMS({
        ...smsOptions,
        from: '+11111111111',
      });

      expect(result.success).toBe(true);
      expect(mockTwilioClient.messages.create).toHaveBeenCalledWith(
        expect.objectContaining({
          from: '+11111111111',
        }),
      );
    });

    it('should send SMS with media URL', async () => {
      mockTwilioClient.messages.create.mockResolvedValue({
        sid: 'SM345678',
      });

      const result = await service.sendSMS({
        ...smsOptions,
        mediaUrl: ['https://example.com/image.jpg'],
      });

      expect(result.success).toBe(true);
      expect(mockTwilioClient.messages.create).toHaveBeenCalledWith(
        expect.objectContaining({
          mediaUrl: ['https://example.com/image.jpg'],
        }),
      );
    });

    it('should send SMS with statusCallback', async () => {
      mockTwilioClient.messages.create.mockResolvedValue({
        sid: 'SM111222',
      });

      const result = await service.sendSMS({
        ...smsOptions,
        statusCallback: 'https://test.com/sms-status',
      });

      expect(result.success).toBe(true);
      expect(mockTwilioClient.messages.create).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCallback: 'https://test.com/sms-status',
        }),
      );
    });

    it('should handle errors', async () => {
      mockTwilioClient.messages.create.mockRejectedValue(new Error('SMS send failed'));

      const result = await service.sendSMS(smsOptions);

      expect(result.success).toBe(false);
      expect(result.error).toBe('SMS send failed');
    });
  });

  describe('getCallStatus', () => {
    it('should get call status successfully', async () => {
      const mockCallInstance = mockTwilioClient.calls('CA123456');
      mockCallInstance.fetch.mockResolvedValue({
        sid: 'CA123456',
        status: 'completed',
        duration: '45',
        startTime: new Date('2025-01-01T10:00:00Z'),
        endTime: new Date('2025-01-01T10:00:45Z'),
        price: '-0.015',
        direction: 'outbound',
      });

      const result = await service.getCallStatus('CA123456');

      expect(result).toEqual({
        sid: 'CA123456',
        status: 'completed',
        duration: '45',
        startTime: new Date('2025-01-01T10:00:00Z'),
        endTime: new Date('2025-01-01T10:00:45Z'),
        price: '-0.015',
        direction: 'outbound',
      });
    });

    it('should return null on error', async () => {
      const mockCallInstance = mockTwilioClient.calls('CA999999');
      mockCallInstance.fetch.mockRejectedValue(new Error('Call not found'));

      const result = await service.getCallStatus('CA999999');

      expect(result).toBeNull();
    });
  });

  describe('hangupCall', () => {
    it('should hangup call successfully', async () => {
      const mockCallInstance = mockTwilioClient.calls('CA123456');
      mockCallInstance.update.mockResolvedValue({ status: 'completed' });

      const result = await service.hangupCall('CA123456');

      expect(result).toBe(true);
      expect(mockCallInstance.update).toHaveBeenCalledWith({ status: 'completed' });
    });

    it('should return false on error', async () => {
      const mockCallInstance = mockTwilioClient.calls('CA999999');
      mockCallInstance.update.mockRejectedValue(new Error('Cannot hangup'));

      const result = await service.hangupCall('CA999999');

      expect(result).toBe(false);
    });
  });

  describe('generateRestaurantTwiML', () => {
    it('should generate default restaurant TwiML', () => {
      const twiml = service.generateRestaurantTwiML();

      expect(twiml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(twiml).toContain('<Response>');
      expect(twiml).toContain('ChefBot Dysa');
      expect(twiml).toContain('Presiona 1 Para hacer una reserva');
      expect(twiml).toContain('Presiona 2 Para hacer un pedido');
      expect(twiml).toContain('Presiona 3 Para consultar horarios');
      expect(twiml).toContain('Presiona 4 Para hablar con un representante');
      expect(twiml).toContain('</Response>');
    });

    it('should generate TwiML with custom welcome message', () => {
      const twiml = service.generateRestaurantTwiML({
        welcomeMessage: '¡Bienvenido a La Buena Mesa!',
      });

      expect(twiml).toContain('¡Bienvenido a La Buena Mesa!');
    });

    it('should generate TwiML with custom menu options', () => {
      const twiml = service.generateRestaurantTwiML({
        menuOptions: [
          { digit: '1', description: 'Opción 1', action: 'test1' },
          { digit: '2', description: 'Opción 2', action: 'test2' },
        ],
      });

      expect(twiml).toContain('Presiona 1 Opción 1');
      expect(twiml).toContain('Presiona 2 Opción 2');
    });

    it('should include webhook URL in Gather', () => {
      const twiml = service.generateRestaurantTwiML();

      expect(twiml).toContain('action="https://api.test.com/webhooks/voice/menu"');
    });
  });

  describe('generateReservationTwiML', () => {
    it('should generate reservation TwiML', () => {
      const twiml = service.generateReservationTwiML();

      expect(twiml).toContain('Perfecto, te ayudaré con tu reserva');
      expect(twiml).toContain('<Record');
      expect(twiml).toContain('timeout="30"');
      expect(twiml).toContain('maxLength="120"');
      expect(twiml).toContain('action="https://api.test.com/webhooks/voice/reservation"');
    });
  });

  describe('generateOrderTwiML', () => {
    it('should generate order TwiML', () => {
      const twiml = service.generateOrderTwiML();

      expect(twiml).toContain('Excelente, tomaremos tu pedido');
      expect(twiml).toContain('<Record');
      expect(twiml).toContain('timeout="60"');
      expect(twiml).toContain('maxLength="180"');
      expect(twiml).toContain('action="https://api.test.com/webhooks/voice/order"');
    });
  });

  describe('generateHoursTwiML', () => {
    it('should generate hours TwiML with default hours', () => {
      const twiml = service.generateHoursTwiML();

      expect(twiml).toContain('Nuestros horarios de atención son');
      expect(twiml).toContain('Lunes a Viernes de 11:00 AM a 10:00 PM');
      expect(twiml).toContain('<Hangup/>');
    });

    it('should generate hours TwiML with custom hours', () => {
      const twiml = service.generateHoursTwiML('Lunes a Domingo de 9:00 AM a 9:00 PM');

      expect(twiml).toContain('Lunes a Domingo de 9:00 AM a 9:00 PM');
    });
  });

  describe('processVoiceWebhook', () => {
    it('should process reservation digit (1)', () => {
      const webhookBody = {
        Digits: '1',
        CallSid: 'CA123456',
        From: '+19876543210',
      };

      const result = service.processVoiceWebhook(webhookBody);

      expect(result.type).toBe('reservation');
      expect(result.data.callSid).toBe('CA123456');
      expect(result.data.from).toBe('+19876543210');
    });

    it('should process order digit (2)', () => {
      const webhookBody = {
        Digits: '2',
        CallSid: 'CA789012',
        From: '+19876543210',
      };

      const result = service.processVoiceWebhook(webhookBody);

      expect(result.type).toBe('order');
      expect(result.data.callSid).toBe('CA789012');
    });

    it('should process hours digit (3)', () => {
      const webhookBody = {
        Digits: '3',
        CallSid: 'CA345678',
        From: '+19876543210',
      };

      const result = service.processVoiceWebhook(webhookBody);

      expect(result.type).toBe('hours');
    });

    it('should process transfer digit (4)', () => {
      const webhookBody = {
        Digits: '4',
        CallSid: 'CA111222',
        From: '+19876543210',
      };

      const result = service.processVoiceWebhook(webhookBody);

      expect(result.type).toBe('menu');
      expect(result.data.action).toBe('transfer');
    });

    it('should process unknown digit', () => {
      const webhookBody = {
        Digits: '9',
        CallSid: 'CA999999',
        From: '+19876543210',
      };

      const result = service.processVoiceWebhook(webhookBody);

      expect(result.type).toBe('unknown');
      expect(result.data.digits).toBe('9');
    });

    it('should process reservation recording', () => {
      const webhookBody = {
        RecordingUrl: 'https://api.twilio.com/recordings/RE123456',
        CallSid: 'CA123456',
        From: '+19876543210',
        RecordingDuration: '45',
        request: {
          url: 'https://api.test.com/webhooks/voice/reservation',
        },
      };

      const result = service.processVoiceWebhook(webhookBody);

      expect(result.type).toBe('reservation');
      expect(result.data.recordingUrl).toBe('https://api.twilio.com/recordings/RE123456');
      expect(result.data.duration).toBe('45');
    });

    it('should process order recording', () => {
      const webhookBody = {
        RecordingUrl: 'https://api.twilio.com/recordings/RE789012',
        CallSid: 'CA789012',
        From: '+19876543210',
        RecordingDuration: '60',
        request: {
          url: 'https://api.test.com/webhooks/voice/order',
        },
      };

      const result = service.processVoiceWebhook(webhookBody);

      expect(result.type).toBe('order');
      expect(result.data.recordingUrl).toBe('https://api.twilio.com/recordings/RE789012');
    });
  });

  describe('transcribeRecording', () => {
    it('should return placeholder transcription', async () => {
      const result = await service.transcribeRecording('https://api.twilio.com/recordings/RE123456');

      expect(result).toBe('Transcripción pendiente de implementar');
    });
  });

  describe('sendRestaurantNotificationSMS', () => {
    it('should send reservation notification SMS', async () => {
      mockTwilioClient.messages.create.mockResolvedValue({
        sid: 'SM123456',
      });

      const result = await service.sendRestaurantNotificationSMS('+19876543210', 'reservation', {
        guests: 4,
        date: '2025-02-15',
        time: '19:00',
        status: 'confirmada',
        restaurantName: 'La Buena Mesa',
      });

      expect(result.success).toBe(true);
      const callArgs = mockTwilioClient.messages.create.mock.calls[0][0];
      expect(callArgs.body).toContain('Tu reserva para 4 personas');
      expect(callArgs.body).toContain('2025-02-15');
      expect(callArgs.body).toContain('19:00');
      expect(callArgs.body).toContain('confirmada');
    });

    it('should send order notification SMS', async () => {
      mockTwilioClient.messages.create.mockResolvedValue({
        sid: 'SM789012',
      });

      const result = await service.sendRestaurantNotificationSMS('+19876543210', 'order', {
        orderId: 'ORD-12345',
        total: 45.50,
        status: 'en preparación',
        estimatedTime: 30,
      });

      expect(result.success).toBe(true);
      const callArgs = mockTwilioClient.messages.create.mock.calls[0][0];
      expect(callArgs.body).toContain('Tu pedido #ORD-12345');
      expect(callArgs.body).toContain('$45.5');
      expect(callArgs.body).toContain('en preparación');
      expect(callArgs.body).toContain('30 min');
    });

    it('should send confirmation notification SMS', async () => {
      mockTwilioClient.messages.create.mockResolvedValue({
        sid: 'SM345678',
      });

      const result = await service.sendRestaurantNotificationSMS('+19876543210', 'confirmation', {
        message: 'Tu solicitud ha sido procesada',
        restaurantName: 'La Buena Mesa',
      });

      expect(result.success).toBe(true);
      const callArgs = mockTwilioClient.messages.create.mock.calls[0][0];
      expect(callArgs.body).toContain('Tu solicitud ha sido procesada');
      expect(callArgs.body).toContain('La Buena Mesa');
    });
  });

  describe('getHealthStatus', () => {
    it('should return health status when configured', () => {
      const health = service.getHealthStatus();

      expect(health).toEqual({
        service: 'Twilio Voice & SMS',
        configured: true,
        phoneNumber: '+12345678901',
        webhookUrl: 'https://api.test.com/webhooks',
      });
    });

    it('should return unconfigured status when credentials missing', async () => {
      const module = await Test.createTestingModule({
        providers: [
          TwilioService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn(() => ''),
            },
          },
          {
            provide: I18nService,
            useValue: {
              t: jest.fn((key: string) => key),
            },
          },
        ],
      }).compile();

      const testService = module.get<TwilioService>(TwilioService);
      const health = testService.getHealthStatus();

      expect(health.configured).toBe(false);
    });
  });
});
