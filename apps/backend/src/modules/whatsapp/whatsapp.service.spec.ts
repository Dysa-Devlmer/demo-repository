import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { WhatsAppService, WhatsAppMessage, WebhookMessage } from './whatsapp.service';
import { I18nService } from '../../i18n/i18n.service';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('WhatsAppService - Unit Tests', () => {
  let service: WhatsAppService;
  let configService: ConfigService;
  let i18nService: I18nService;
  let mockAxiosInstance: any;

  const mockConfig = {
    WA_ACCESS_TOKEN: 'test-access-token-12345',
    WA_BUSINESS_PHONE_ID: '123456789',
    WA_WEBHOOK_VERIFY_TOKEN: 'test-verify-token',
  };

  beforeEach(async () => {
    // Mock axios instance
    mockAxiosInstance = {
      post: jest.fn(),
      get: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    };

    mockedAxios.create.mockReturnValue(mockAxiosInstance as any);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WhatsAppService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => mockConfig[key]),
          },
        },
        {
          provide: I18nService,
          useValue: {
            t: jest.fn((key: string) => {
              const translations = {
                'errors.whatsappNotConfigured': 'WhatsApp not configured',
                'errors.invalidWhatsappResponse': 'Invalid WhatsApp response',
                'errors.maxButtonsExceeded': 'Maximum 3 buttons allowed',
              };
              return translations[key] || key;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<WhatsAppService>(WhatsAppService);
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
      expect(health.phoneNumberId).toBe('123456789');
      expect(health.apiVersion).toBe('v18.0');
    });

    it('should warn when credentials are not configured', async () => {
      const module = await Test.createTestingModule({
        providers: [
          WhatsAppService,
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

      const testService = module.get<WhatsAppService>(WhatsAppService);
      const health = testService.getHealthStatus();

      expect(health.configured).toBe(false);
    });

    it('should create axios instance with correct configuration', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://graph.facebook.com/v18.0',
        timeout: 30000,
        headers: {
          Authorization: 'Bearer test-access-token-12345',
          'Content-Type': 'application/json',
          'User-Agent': 'DysaBot/1.0.0',
        },
      });
    });

    it('should setup axios interceptors', () => {
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
    });
  });

  describe('verifyWebhook', () => {
    it('should verify webhook with correct token', () => {
      const result = service.verifyWebhook('subscribe', 'test-verify-token', 'challenge-string');
      expect(result).toBe('challenge-string');
    });

    it('should reject webhook with incorrect token', () => {
      const result = service.verifyWebhook('subscribe', 'wrong-token', 'challenge-string');
      expect(result).toBeNull();
    });

    it('should reject webhook with incorrect mode', () => {
      const result = service.verifyWebhook('unsubscribe', 'test-verify-token', 'challenge-string');
      expect(result).toBeNull();
    });
  });

  describe('sendMessage', () => {
    const mockMessage: WhatsAppMessage = {
      messaging_product: 'whatsapp',
      to: '+1234567890',
      type: 'text',
      text: {
        body: 'Test message',
      },
    };

    it('should send message successfully', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: {
          messages: [{ id: 'wamid.12345' }],
        },
      });

      const result = await service.sendMessage(mockMessage);

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('wamid.12345');
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/123456789/messages', mockMessage);
    });

    it('should handle API errors', async () => {
      mockAxiosInstance.post.mockRejectedValue({
        response: {
          data: {
            error: {
              message: 'Invalid phone number',
            },
          },
        },
        message: 'API Error',
      });

      const result = await service.sendMessage(mockMessage);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid phone number');
    });

    it('should handle network errors', async () => {
      mockAxiosInstance.post.mockRejectedValue(new Error('Network timeout'));

      const result = await service.sendMessage(mockMessage);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network timeout');
    });

    it('should throw error when not configured', async () => {
      const module = await Test.createTestingModule({
        providers: [
          WhatsAppService,
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

      const testService = module.get<WhatsAppService>(WhatsAppService);
      const result = await testService.sendMessage(mockMessage);

      expect(result.success).toBe(false);
      expect(result.error).toContain('errors.whatsappNotConfigured');
    });
  });

  describe('sendTextMessage', () => {
    it('should send text message with correct format', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: {
          messages: [{ id: 'wamid.text123' }],
        },
      });

      const result = await service.sendTextMessage('+1234567890', '¡Hola! ¿Cómo estás?');

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('wamid.text123');
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/123456789/messages', {
        messaging_product: 'whatsapp',
        to: '+1234567890',
        type: 'text',
        text: {
          body: '¡Hola! ¿Cómo estás?',
        },
      });
    });
  });

  describe('sendInteractiveMenu', () => {
    const sections = [
      {
        title: 'Entradas',
        rows: [
          { id: 'menu_1', title: 'Ceviche - $12', description: 'Pescado fresco marinado' },
          { id: 'menu_2', title: 'Empanadas - $8', description: 'Empanadas de carne' },
        ],
      },
    ];

    it('should send interactive menu successfully', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: {
          messages: [{ id: 'wamid.menu123' }],
        },
      });

      const result = await service.sendInteractiveMenu(
        '+1234567890',
        'Selecciona del menú',
        'Ver opciones',
        sections,
        'Menú del día',
        'Powered by DysaBot',
      );

      expect(result.success).toBe(true);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/123456789/messages',
        expect.objectContaining({
          messaging_product: 'whatsapp',
          type: 'interactive',
          interactive: expect.objectContaining({
            type: 'list',
            header: { type: 'text', text: 'Menú del día' },
            body: { text: 'Selecciona del menú' },
            footer: { text: 'Powered by DysaBot' },
            action: {
              button: 'Ver opciones',
              sections,
            },
          }),
        }),
      );
    });

    it('should send menu without header and footer', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: {
          messages: [{ id: 'wamid.menu456' }],
        },
      });

      const result = await service.sendInteractiveMenu(
        '+1234567890',
        'Selecciona una opción',
        'Ver menú',
        sections,
      );

      expect(result.success).toBe(true);
      const callArgs = mockAxiosInstance.post.mock.calls[0][1];
      expect(callArgs.interactive.header).toBeUndefined();
      expect(callArgs.interactive.footer).toBeUndefined();
    });
  });

  describe('sendButtonMessage', () => {
    const buttons = [
      { id: 'btn_1', title: 'Opción 1' },
      { id: 'btn_2', title: 'Opción 2' },
    ];

    it('should send button message successfully', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: {
          messages: [{ id: 'wamid.btn123' }],
        },
      });

      const result = await service.sendButtonMessage(
        '+1234567890',
        '¿Qué te gustaría hacer?',
        buttons,
        'ChefBot',
        'Selecciona una opción',
      );

      expect(result.success).toBe(true);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/123456789/messages',
        expect.objectContaining({
          messaging_product: 'whatsapp',
          type: 'interactive',
          interactive: expect.objectContaining({
            type: 'button',
            header: { type: 'text', text: 'ChefBot' },
            body: { text: '¿Qué te gustaría hacer?' },
            footer: { text: 'Selecciona una opción' },
            action: {
              buttons: [
                { type: 'reply', reply: { id: 'btn_1', title: 'Opción 1' } },
                { type: 'reply', reply: { id: 'btn_2', title: 'Opción 2' } },
              ],
            },
          }),
        }),
      );
    });

    it('should throw error when more than 3 buttons', async () => {
      const tooManyButtons = [
        { id: 'btn_1', title: 'Btn 1' },
        { id: 'btn_2', title: 'Btn 2' },
        { id: 'btn_3', title: 'Btn 3' },
        { id: 'btn_4', title: 'Btn 4' },
      ];

      await expect(
        service.sendButtonMessage('+1234567890', 'Test', tooManyButtons),
      ).rejects.toThrow('Maximum 3 buttons allowed');
    });

    it('should send button message without header and footer', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: {
          messages: [{ id: 'wamid.btn456' }],
        },
      });

      const result = await service.sendButtonMessage('+1234567890', 'Test body', buttons);

      expect(result.success).toBe(true);
      const callArgs = mockAxiosInstance.post.mock.calls[0][1];
      expect(callArgs.interactive.header).toBeUndefined();
      expect(callArgs.interactive.footer).toBeUndefined();
    });
  });

  describe('sendRestaurantMenu', () => {
    const menuItems = [
      {
        id: 1,
        name: 'Paella Valenciana',
        price: 18.5,
        category: 'Arroces',
        description: 'Arroz con pollo, conejo y verduras del día',
      },
      {
        id: 2,
        name: 'Pulpo a la Gallega',
        price: 22.0,
        category: 'Mariscos',
        description: 'Pulpo cocido con pimentón de la Vera',
      },
    ];

    it('should send restaurant menu successfully', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: {
          messages: [{ id: 'wamid.resto123' }],
        },
      });

      const result = await service.sendRestaurantMenu('+1234567890', menuItems);

      expect(result.success).toBe(true);
      const callArgs = mockAxiosInstance.post.mock.calls[0][1];
      expect(callArgs.interactive.type).toBe('list');
      expect(callArgs.interactive.header.text).toContain('ChefBot Dysa');
      expect(callArgs.interactive.body.text).toContain('menú');
      expect(callArgs.interactive.action.sections).toHaveLength(2);
    });
  });

  describe('sendReservationOptions', () => {
    it('should send reservation options with customer name', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: {
          messages: [{ id: 'wamid.resv123' }],
        },
      });

      const result = await service.sendReservationOptions('+1234567890', 'Juan Pérez');

      expect(result.success).toBe(true);
      const callArgs = mockAxiosInstance.post.mock.calls[0][1];
      expect(callArgs.interactive.body.text).toContain('Juan Pérez');
      expect(callArgs.interactive.action.buttons).toHaveLength(3);
      expect(callArgs.interactive.action.buttons[0].reply.id).toBe('new_reservation');
    });

    it('should send reservation options without customer name', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: {
          messages: [{ id: 'wamid.resv456' }],
        },
      });

      const result = await service.sendReservationOptions('+1234567890');

      expect(result.success).toBe(true);
      const callArgs = mockAxiosInstance.post.mock.calls[0][1];
      expect(callArgs.interactive.body.text).toContain('¡Hola!');
      expect(callArgs.interactive.body.text).not.toContain('undefined');
    });
  });

  describe('sendOrderOptions', () => {
    it('should send order options successfully', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: {
          messages: [{ id: 'wamid.order123' }],
        },
      });

      const result = await service.sendOrderOptions('+1234567890');

      expect(result.success).toBe(true);
      const callArgs = mockAxiosInstance.post.mock.calls[0][1];
      expect(callArgs.interactive.type).toBe('button');
      expect(callArgs.interactive.action.buttons).toHaveLength(3);
      expect(callArgs.interactive.action.buttons[0].reply.id).toBe('delivery_order');
      expect(callArgs.interactive.action.buttons[1].reply.id).toBe('takeaway_order');
      expect(callArgs.interactive.action.buttons[2].reply.id).toBe('view_menu');
    });
  });

  describe('processWebhookMessage', () => {
    it('should process text message correctly', () => {
      const webhookData: WebhookMessage = {
        object: 'whatsapp_business_account',
        entry: [
          {
            id: 'entry_id',
            changes: [
              {
                value: {
                  messaging_product: 'whatsapp',
                  metadata: {
                    display_phone_number: '1234567890',
                    phone_number_id: '123456789',
                  },
                  messages: [
                    {
                      from: '+1234567890',
                      id: 'wamid.msg123',
                      timestamp: '1640000000',
                      type: 'text',
                      text: {
                        body: 'Hola, quiero hacer una reserva',
                      },
                    },
                  ],
                },
                field: 'messages',
              },
            ],
          },
        ],
      };

      const result = service.processWebhookMessage(webhookData);

      expect(result).toHaveLength(1);
      expect(result[0].from).toBe('+1234567890');
      expect(result[0].messageId).toBe('wamid.msg123');
      expect(result[0].type).toBe('text');
      expect(result[0].content).toBe('Hola, quiero hacer una reserva');
      expect(result[0].timestamp).toBeInstanceOf(Date);
    });

    it('should process interactive list reply', () => {
      const webhookData: WebhookMessage = {
        object: 'whatsapp_business_account',
        entry: [
          {
            id: 'entry_id',
            changes: [
              {
                value: {
                  messaging_product: 'whatsapp',
                  metadata: {
                    display_phone_number: '1234567890',
                    phone_number_id: '123456789',
                  },
                  messages: [
                    {
                      from: '+1234567890',
                      id: 'wamid.interactive123',
                      timestamp: '1640000000',
                      type: 'interactive',
                      interactive: {
                        type: 'list_reply',
                        list_reply: {
                          id: 'menu_1',
                          title: 'Paella Valenciana - $18.50',
                        },
                      },
                    },
                  ],
                },
                field: 'messages',
              },
            ],
          },
        ],
      };

      const result = service.processWebhookMessage(webhookData);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('interactive');
      expect(result[0].content).toBe('Paella Valenciana - $18.50');
      expect(result[0].interactionData).toEqual({
        type: 'list_reply',
        id: 'menu_1',
        title: 'Paella Valenciana - $18.50',
      });
    });

    it('should process interactive button reply', () => {
      const webhookData: WebhookMessage = {
        object: 'whatsapp_business_account',
        entry: [
          {
            id: 'entry_id',
            changes: [
              {
                value: {
                  messaging_product: 'whatsapp',
                  metadata: {
                    display_phone_number: '1234567890',
                    phone_number_id: '123456789',
                  },
                  messages: [
                    {
                      from: '+1234567890',
                      id: 'wamid.btn123',
                      timestamp: '1640000000',
                      type: 'interactive',
                      interactive: {
                        type: 'button_reply',
                        button_reply: {
                          id: 'new_reservation',
                          title: '🆕 Nueva Reserva',
                        },
                      },
                    },
                  ],
                },
                field: 'messages',
              },
            ],
          },
        ],
      };

      const result = service.processWebhookMessage(webhookData);

      expect(result).toHaveLength(1);
      expect(result[0].content).toBe('🆕 Nueva Reserva');
      expect(result[0].interactionData).toEqual({
        type: 'button_reply',
        id: 'new_reservation',
        title: '🆕 Nueva Reserva',
      });
    });

    it('should process button message', () => {
      const webhookData: WebhookMessage = {
        object: 'whatsapp_business_account',
        entry: [
          {
            id: 'entry_id',
            changes: [
              {
                value: {
                  messaging_product: 'whatsapp',
                  metadata: {
                    display_phone_number: '1234567890',
                    phone_number_id: '123456789',
                  },
                  messages: [
                    {
                      from: '+1234567890',
                      id: 'wamid.btn456',
                      timestamp: '1640000000',
                      type: 'button',
                      button: {
                        payload: 'confirm_order',
                        text: 'Confirmar Pedido',
                      },
                    },
                  ],
                },
                field: 'messages',
              },
            ],
          },
        ],
      };

      const result = service.processWebhookMessage(webhookData);

      expect(result).toHaveLength(1);
      expect(result[0].content).toBe('Confirmar Pedido');
      expect(result[0].interactionData).toEqual({
        type: 'button',
        payload: 'confirm_order',
      });
    });

    it('should handle multiple messages in webhook', () => {
      const webhookData: WebhookMessage = {
        object: 'whatsapp_business_account',
        entry: [
          {
            id: 'entry_id',
            changes: [
              {
                value: {
                  messaging_product: 'whatsapp',
                  metadata: {
                    display_phone_number: '1234567890',
                    phone_number_id: '123456789',
                  },
                  messages: [
                    {
                      from: '+1111111111',
                      id: 'msg1',
                      timestamp: '1640000000',
                      type: 'text',
                      text: { body: 'Message 1' },
                    },
                    {
                      from: '+2222222222',
                      id: 'msg2',
                      timestamp: '1640000001',
                      type: 'text',
                      text: { body: 'Message 2' },
                    },
                  ],
                },
                field: 'messages',
              },
            ],
          },
        ],
      };

      const result = service.processWebhookMessage(webhookData);

      expect(result).toHaveLength(2);
      expect(result[0].from).toBe('+1111111111');
      expect(result[1].from).toBe('+2222222222');
    });
  });

  describe('markAsRead', () => {
    it('should mark message as read successfully', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: { success: true } });

      const result = await service.markAsRead('wamid.msg123');

      expect(result).toBe(true);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/123456789/messages', {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: 'wamid.msg123',
      });
    });

    it('should return false on error', async () => {
      mockAxiosInstance.post.mockRejectedValue(new Error('API Error'));

      const result = await service.markAsRead('wamid.msg123');

      expect(result).toBe(false);
    });
  });

  describe('getHealthStatus', () => {
    it('should return health status when configured', () => {
      const health = service.getHealthStatus();

      expect(health).toEqual({
        service: 'WhatsApp Business API',
        configured: true,
        phoneNumberId: '123456789',
        apiVersion: 'v18.0',
      });
    });

    it('should return unconfigured status when credentials missing', async () => {
      const module = await Test.createTestingModule({
        providers: [
          WhatsAppService,
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

      const testService = module.get<WhatsAppService>(WhatsAppService);
      const health = testService.getHealthStatus();

      expect(health.configured).toBe(false);
    });
  });
});
