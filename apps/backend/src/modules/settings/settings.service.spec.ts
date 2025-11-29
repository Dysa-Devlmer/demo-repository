import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { SettingsService, SystemSettings } from './settings.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';

describe('SettingsService - Unit Tests', () => {
  let service: SettingsService;
  let configService: jest.Mocked<ConfigService>;
  let whatsappService: jest.Mocked<WhatsAppService>;
  let dataSource: jest.Mocked<DataSource>;

  beforeEach(async () => {
    // Create mock services
    const mockConfigService = {
      get: jest.fn((key: string, defaultValue?: any) => {
        const config = {
          RESTAURANT_NAME: 'La Buena Mesa',
          RESTAURANT_PHONE: '+52 55 9876 5432',
          RESTAURANT_ADDRESS: 'Av. Reforma 456, CDMX',
          RESTAURANT_EMAIL: 'info@labuenamesa.com',
          WA_BUSINESS_PHONE_NUMBER: '+521234567890',
          WA_ACCESS_TOKEN: 'EAAB1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ',
          WA_WEBHOOK_URL: 'https://api.dysabot.com/webhook',
          TWILIO_ACCOUNT_SID: 'AC1234567890abcdefghijklmnopqrstuvwx',
          TWILIO_AUTH_TOKEN: 'abcdef1234567890abcdef1234567890',
          TWILIO_PHONE_NUMBER: '+15551234567',
          OLLAMA_URL: 'http://localhost:11434',
          OLLAMA_MODEL: 'phi3:mini',
          DATABASE_HOST: 'localhost',
          DATABASE_PORT: '15432',
          DATABASE_NAME: 'chatbotdysa',
        };
        return config[key] || defaultValue;
      }),
    };

    const mockWhatsAppService = {
      getHealthStatus: jest.fn().mockReturnValue({
        configured: true,
        connected: true,
        lastCheck: new Date(),
      }),
    };

    const mockDataSource = {
      query: jest.fn().mockResolvedValue([{ result: 1 }]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: WhatsAppService,
          useValue: mockWhatsAppService,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<SettingsService>(SettingsService);
    configService = module.get(ConfigService);
    whatsappService = module.get(WhatsAppService);
    dataSource = module.get(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have all required methods', () => {
      expect(service.getSettings).toBeDefined();
      expect(service.updateSettings).toBeDefined();
      expect(service.testConnection).toBeDefined();
    });
  });

  describe('getSettings()', () => {
    it('should return complete system settings', async () => {
      const result = await service.getSettings();

      expect(result).toHaveProperty('restaurant');
      expect(result).toHaveProperty('whatsapp');
      expect(result).toHaveProperty('twilio');
      expect(result).toHaveProperty('ollama');
      expect(result).toHaveProperty('database');
    });

    it('should return restaurant settings from config', async () => {
      const result = await service.getSettings();

      expect(result.restaurant).toEqual({
        name: 'La Buena Mesa',
        phone: '+52 55 9876 5432',
        address: 'Av. Reforma 456, CDMX',
        email: 'info@labuenamesa.com',
      });
    });

    it('should use default values when config is missing', async () => {
      configService.get.mockImplementation((key: string, defaultValue: any) => defaultValue);

      const result = await service.getSettings();

      expect(result.restaurant.name).toBe('DysaBot Restaurant');
      expect(result.restaurant.phone).toBe('+52 55 1234 5678');
      expect(result.restaurant.email).toBe('contacto@dysabot.com');
    });

    it('should return WhatsApp settings with masked token', async () => {
      const result = await service.getSettings();

      expect(result.whatsapp.phoneNumber).toBe('+521234567890');
      expect(result.whatsapp.token).toContain('****');
      expect(result.whatsapp.token).toMatch(/^EAAB.*WXYZ$/);
      expect(result.whatsapp.webhookUrl).toBe('https://api.dysabot.com/webhook');
    });

    it('should set WhatsApp status to connected when configured', async () => {
      whatsappService.getHealthStatus.mockReturnValue({
        configured: true,
        connected: true,
        lastCheck: new Date(),
      });

      const result = await service.getSettings();

      expect(result.whatsapp.status).toBe('connected');
    });

    it('should set WhatsApp status to disconnected when not configured', async () => {
      whatsappService.getHealthStatus.mockReturnValue({
        configured: false,
        connected: false,
        lastCheck: new Date(),
      });

      const result = await service.getSettings();

      expect(result.whatsapp.status).toBe('disconnected');
    });

    it('should return Twilio settings with masked credentials', async () => {
      const result = await service.getSettings();

      expect(result.twilio.accountSid).toContain('****');
      expect(result.twilio.accountSid).toMatch(/^AC12.*uvwx$/);
      expect(result.twilio.authToken).toContain('****');
      expect(result.twilio.phoneNumber).toBe('+15551234567');
    });

    it('should return Ollama settings', async () => {
      const result = await service.getSettings();

      expect(result.ollama).toEqual({
        url: 'http://localhost:11434',
        model: 'phi3:mini',
        status: 'connected',
      });
    });

    it('should return database settings with correct port type', async () => {
      const result = await service.getSettings();

      expect(result.database).toEqual({
        host: 'localhost',
        port: 15432,
        database: 'chatbotdysa',
        status: 'connected',
      });
      expect(typeof result.database.port).toBe('number');
    });

    it('should set database status to connected when query succeeds', async () => {
      dataSource.query.mockResolvedValue([{ result: 1 }]);

      const result = await service.getSettings();

      expect(result.database.status).toBe('connected');
      expect(dataSource.query).toHaveBeenCalledWith('SELECT 1');
    });

    it('should set database status to error when query fails', async () => {
      dataSource.query.mockRejectedValue(new Error('Connection timeout'));

      const result = await service.getSettings();

      expect(result.database.status).toBe('error');
    });

    it('should throw error if critical failure occurs', async () => {
      whatsappService.getHealthStatus.mockImplementation(() => {
        throw new Error('Critical WhatsApp error');
      });

      await expect(service.getSettings()).rejects.toThrow('Critical WhatsApp error');
    });
  });

  describe('updateSettings()', () => {
    it('should update settings successfully', async () => {
      const newSettings: Partial<SystemSettings> = {
        restaurant: {
          name: 'Nuevo Restaurante',
          phone: '+52 55 1111 2222',
          address: 'Nueva Dirección',
          email: 'nuevo@email.com',
        },
      };

      const result = await service.updateSettings(newSettings);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Configuraciones actualizadas correctamente');
    });

    it('should update WhatsApp settings', async () => {
      const newSettings: Partial<SystemSettings> = {
        whatsapp: {
          phoneNumber: '+529876543210',
          token: 'NEW_TOKEN_12345',
          webhookUrl: 'https://new-webhook.com',
          status: 'connected',
        },
      };

      const result = await service.updateSettings(newSettings);

      expect(result.success).toBe(true);
    });

    it('should update Twilio settings', async () => {
      const newSettings: Partial<SystemSettings> = {
        twilio: {
          accountSid: 'NEW_AC_SID',
          authToken: 'NEW_AUTH_TOKEN',
          phoneNumber: '+15559876543',
          status: 'connected',
        },
      };

      const result = await service.updateSettings(newSettings);

      expect(result.success).toBe(true);
    });

    it('should update Ollama settings', async () => {
      const newSettings: Partial<SystemSettings> = {
        ollama: {
          url: 'http://localhost:11434',
          model: 'llama3',
          status: 'connected',
        },
      };

      const result = await service.updateSettings(newSettings);

      expect(result.success).toBe(true);
    });

    it('should handle partial settings update', async () => {
      const partialSettings = {
        restaurant: {
          name: 'Only Name Updated',
        },
      };

      const result = await service.updateSettings(partialSettings as any);

      expect(result.success).toBe(true);
    });

    it('should return error on update failure', async () => {
      // Force an error by making the service throw
      jest.spyOn(service as any, 'maskSensitiveData').mockImplementation(() => {
        throw new Error('Masking error');
      });

      const result = await service.updateSettings({});

      expect(result.success).toBe(false);
      expect(result.message).toBe('Error al actualizar las configuraciones');
    });
  });

  describe('testConnection()', () => {
    describe('WhatsApp Connection', () => {
      it('should return connected status when WhatsApp is configured', async () => {
        whatsappService.getHealthStatus.mockReturnValue({
          configured: true,
          connected: true,
          lastCheck: new Date(),
        });

        const result = await service.testConnection('whatsapp');

        expect(result).toEqual({
          success: true,
          status: 'connected',
          message: 'WhatsApp Business API conectado correctamente',
        });
      });

      it('should return error status when WhatsApp is not configured', async () => {
        whatsappService.getHealthStatus.mockReturnValue({
          configured: false,
          connected: false,
          lastCheck: new Date(),
        });

        const result = await service.testConnection('whatsapp');

        expect(result).toEqual({
          success: false,
          status: 'error',
          message: 'WhatsApp Business API no está configurado',
        });
      });

      it('should handle WhatsApp connection errors', async () => {
        whatsappService.getHealthStatus.mockImplementation(() => {
          throw new Error('WhatsApp service error');
        });

        const result = await service.testConnection('whatsapp');

        expect(result.success).toBe(false);
        expect(result.status).toBe('error');
      });
    });

    describe('Twilio Connection', () => {
      it('should return disconnected status (not implemented)', async () => {
        const result = await service.testConnection('twilio');

        expect(result).toEqual({
          success: false,
          status: 'disconnected',
          message: 'Prueba de Twilio no implementada',
        });
      });
    });

    describe('Ollama Connection', () => {
      it('should return connected status', async () => {
        const result = await service.testConnection('ollama');

        expect(result).toEqual({
          success: true,
          status: 'connected',
          message: 'Ollama AI conectado correctamente',
        });
      });
    });

    describe('Database Connection', () => {
      it('should return connected status when query succeeds', async () => {
        dataSource.query.mockResolvedValue([{ result: 1 }]);

        const result = await service.testConnection('database');

        expect(result).toEqual({
          success: true,
          status: 'connected',
          message: 'Base de datos conectada correctamente',
        });
        expect(dataSource.query).toHaveBeenCalledWith('SELECT 1');
      });

      it('should return error status when query fails', async () => {
        dataSource.query.mockRejectedValue(new Error('Connection refused'));

        const result = await service.testConnection('database');

        expect(result.success).toBe(false);
        expect(result.status).toBe('error');
        expect(result.message).toContain('Error de conexión con la base de datos');
        expect(result.message).toContain('Connection refused');
      });

      it('should handle database timeout errors', async () => {
        dataSource.query.mockRejectedValue(new Error('Query timeout'));

        const result = await service.testConnection('database');

        expect(result.success).toBe(false);
        expect(result.message).toContain('Query timeout');
      });
    });

    describe('Invalid Service', () => {
      it('should return error for unrecognized service', async () => {
        const result = await service.testConnection('invalid' as any);

        expect(result).toEqual({
          success: false,
          status: 'error',
          message: 'Servicio no reconocido',
        });
      });
    });
  });

  describe('Token Masking', () => {
    it('should mask tokens with visible prefix and suffix', async () => {
      const result = await service.getSettings();

      // WhatsApp token should be masked
      expect(result.whatsapp.token).not.toBe('EAAB1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ');
      expect(result.whatsapp.token.length).toBe('EAAB1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ'.length);
      expect(result.whatsapp.token).toMatch(/^EAAB/);
      expect(result.whatsapp.token).toMatch(/WXYZ$/);
    });

    it('should mask Twilio credentials', async () => {
      const result = await service.getSettings();

      expect(result.twilio.accountSid).not.toBe('AC1234567890abcdefghijklmnopqrstuvwx');
      expect(result.twilio.accountSid).toMatch(/^AC12/);
      expect(result.twilio.authToken).not.toBe('abcdef1234567890abcdef1234567890');
      expect(result.twilio.authToken).toContain('****');
    });

    it('should not mask short tokens (less than 8 chars)', () => {
      configService.get.mockImplementation((key: string) => {
        if (key === 'WA_ACCESS_TOKEN') return 'SHORT';
        return '';
      });

      // Access private method through service instance
      const masked = (service as any).maskToken('SHORT');
      expect(masked).toBe('SHORT');
    });

    it('should handle empty tokens', () => {
      const masked = (service as any).maskToken('');
      expect(masked).toBe('');
    });

    it('should mask tokens with correct pattern', () => {
      const token = '12345678901234567890';
      const masked = (service as any).maskToken(token);

      expect(masked).toBe('1234************7890');
      expect(masked.length).toBe(token.length);
    });
  });

  describe('Sensitive Data Masking', () => {
    it('should mask sensitive fields in nested objects', () => {
      const data = {
        restaurant: {
          name: 'Test Restaurant',
        },
        whatsapp: {
          token: 'SECRET_TOKEN_12345',
          phoneNumber: '+123456789',
        },
        twilio: {
          authToken: 'AUTH_SECRET_TOKEN',
          accountSid: 'AC_SID_12345',
        },
      };

      const masked = (service as any).maskSensitiveData(data);

      expect(masked.whatsapp.token).toContain('****');
      expect(masked.whatsapp.token).not.toBe('SECRET_TOKEN_12345');
      expect(masked.whatsapp.phoneNumber).toBe('+123456789'); // Not sensitive
      expect(masked.twilio.authToken).toContain('****');
      expect(masked.twilio.accountSid).toContain('****');
    });

    it('should handle null or undefined data', () => {
      const maskedNull = (service as any).maskSensitiveData(null);
      const maskedUndefined = (service as any).maskSensitiveData(undefined);

      expect(maskedNull).toBeNull();
      expect(maskedUndefined).toBeUndefined();
    });

    it('should not modify non-sensitive fields', () => {
      const data = {
        restaurant: {
          name: 'Public Name',
          email: 'public@email.com',
        },
      };

      const masked = (service as any).maskSensitiveData(data);

      expect(masked.restaurant.name).toBe('Public Name');
      expect(masked.restaurant.email).toBe('public@email.com');
    });

    it('should handle deeply nested objects', () => {
      const data = {
        level1: {
          level2: {
            level3: {
              token: 'DEEP_SECRET_TOKEN',
              publicInfo: 'Not Masked',
            },
          },
        },
      };

      const masked = (service as any).maskSensitiveData(data);

      expect(masked.level1.level2.level3.token).toContain('****');
      expect(masked.level1.level2.level3.publicInfo).toBe('Not Masked');
    });

    it('should mask password fields', () => {
      const data = {
        database: {
          password: 'super_secret_password',
          host: 'localhost',
        },
      };

      const masked = (service as any).maskSensitiveData(data);

      expect(masked.database.password).toContain('****');
      expect(masked.database.host).toBe('localhost');
    });
  });

  describe('Integration Scenarios', () => {
    it('should get settings and mask all sensitive data', async () => {
      const result = await service.getSettings();

      // Verify all tokens are masked
      expect(result.whatsapp.token).toContain('****');
      expect(result.twilio.accountSid).toContain('****');
      expect(result.twilio.authToken).toContain('****');

      // Verify public data is not masked
      expect(result.restaurant.name).toBe('La Buena Mesa');
      expect(result.whatsapp.phoneNumber).toBe('+521234567890');
    });

    it('should test all connections in sequence', async () => {
      const whatsappResult = await service.testConnection('whatsapp');
      const twilioResult = await service.testConnection('twilio');
      const ollamaResult = await service.testConnection('ollama');
      const databaseResult = await service.testConnection('database');

      expect(whatsappResult.status).toBe('connected');
      expect(twilioResult.status).toBe('disconnected');
      expect(ollamaResult.status).toBe('connected');
      expect(databaseResult.status).toBe('connected');
    });

    it('should handle mixed success/failure scenarios', async () => {
      whatsappService.getHealthStatus.mockReturnValue({ configured: false, connected: false, lastCheck: new Date() });
      dataSource.query.mockRejectedValue(new Error('DB Error'));

      const result = await service.getSettings();

      expect(result.whatsapp.status).toBe('disconnected');
      expect(result.database.status).toBe('error');
      expect(result.ollama.status).toBe('connected'); // Still works
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing environment variables gracefully', async () => {
      configService.get.mockReturnValue(undefined);

      const result = await service.getSettings();

      expect(result).toBeDefined();
      expect(result.restaurant).toBeDefined();
    });

    it('should handle very long tokens', () => {
      const longToken = 'A'.repeat(100);
      const masked = (service as any).maskToken(longToken);

      expect(masked.length).toBe(100);
      expect(masked.startsWith('AAAA')).toBe(true);
      expect(masked.endsWith('AAAA')).toBe(true);
      expect(masked).toContain('****');
    });

    it('should handle tokens with special characters', () => {
      const specialToken = 'ABC!@#$%^&*()_+-={}[]|:;<>?,./~`';
      const masked = (service as any).maskToken(specialToken);

      expect(masked.startsWith('ABC!')).toBe(true);
      expect(masked).toContain('****');
    });
  });
});
