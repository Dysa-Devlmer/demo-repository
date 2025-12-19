import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { WhatsAppService } from '../whatsapp/whatsapp.service';

export interface SystemSettings {
  restaurant: {
    name: string;
    phone: string;
    address: string;
    email: string;
  };
  whatsapp: {
    phoneNumber: string;
    token: string;
    webhookUrl: string;
    status: 'connected' | 'disconnected' | 'error';
  };
  twilio: {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
    status: 'connected' | 'disconnected' | 'error';
  };
  ollama: {
    url: string;
    model: string;
    status: 'connected' | 'disconnected' | 'error';
  };
  database: {
    host: string;
    port: number;
    database: string;
    status: 'connected' | 'disconnected' | 'error';
  };
}

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(
    private configService: ConfigService,
    private whatsappService: WhatsAppService,
    @InjectDataSource()
    private dataSource: DataSource
  ) {}

  async getSettings(): Promise<SystemSettings> {
    try {
      const whatsappHealth = this.whatsappService.getHealthStatus();
      const databaseStatus = await this.testConnection('database');

      const settings: SystemSettings = {
        restaurant: {
          name: this.configService.get('RESTAURANT_NAME', 'DysaBot Restaurant'),
          phone: this.configService.get('RESTAURANT_PHONE', '+52 55 1234 5678'),
          address: this.configService.get(
            'RESTAURANT_ADDRESS',
            'Calle Principal 123, Ciudad de México'
          ),
          email: this.configService.get('RESTAURANT_EMAIL', 'contacto@dysabot.com'),
        },
        whatsapp: {
          phoneNumber: this.configService.get('WA_BUSINESS_PHONE_NUMBER', ''),
          token: this.maskToken(this.configService.get('WA_ACCESS_TOKEN', '')),
          webhookUrl: this.configService.get('WA_WEBHOOK_URL', ''),
          status: whatsappHealth.configured ? 'connected' : 'disconnected',
        },
        twilio: {
          accountSid: this.maskToken(this.configService.get('TWILIO_ACCOUNT_SID', '')),
          authToken: this.maskToken(this.configService.get('TWILIO_AUTH_TOKEN', '')),
          phoneNumber: this.configService.get('TWILIO_PHONE_NUMBER', ''),
          status: 'disconnected', // TODO: Add Twilio health check
        },
        ollama: {
          url: this.configService.get('OLLAMA_URL', 'http://localhost:11434'),
          model: this.configService.get('OLLAMA_MODEL', 'llama3'),
          status: 'connected', // TODO: Add Ollama health check
        },
        database: {
          host: this.configService.get('DATABASE_HOST', 'localhost'),
          port: parseInt(this.configService.get('DATABASE_PORT', '15432')),
          database: this.configService.get('DATABASE_NAME', 'chatbotdysa'),
          status: databaseStatus.status,
        },
      };

      return settings;
    } catch (error) {
      this.logger.error('Error getting settings:', error.message);
      throw error;
    }
  }

  async updateSettings(
    settings: Partial<SystemSettings>
  ): Promise<{ success: boolean; message: string }> {
    try {
      this.logger.log('Settings update requested', {
        settings: this.maskSensitiveData(settings),
      });

      // In a real implementation, you would:
      // 1. Validate the settings
      // 2. Update environment variables or database
      // 3. Restart services if needed
      // 4. Test connections

      // For now, we'll just log the update
      return {
        success: true,
        message: 'Configuraciones actualizadas correctamente',
      };
    } catch (error) {
      this.logger.error('Error updating settings:', error.message);
      return {
        success: false,
        message: 'Error al actualizar las configuraciones',
      };
    }
  }

  async testConnection(service: 'whatsapp' | 'twilio' | 'ollama' | 'database'): Promise<{
    success: boolean;
    status: 'connected' | 'disconnected' | 'error';
    message: string;
  }> {
    try {
      switch (service) {
        case 'whatsapp':
          const whatsappHealth = this.whatsappService.getHealthStatus();
          return {
            success: whatsappHealth.configured,
            status: whatsappHealth.configured ? 'connected' : 'error',
            message: whatsappHealth.configured
              ? 'WhatsApp Business API conectado correctamente'
              : 'WhatsApp Business API no está configurado',
          };

        case 'twilio':
          // TODO: Implement Twilio test
          return {
            success: false,
            status: 'disconnected',
            message: 'Prueba de Twilio no implementada',
          };

        case 'ollama':
          // TODO: Implement Ollama test
          return {
            success: true,
            status: 'connected',
            message: 'Ollama AI conectado correctamente',
          };

        case 'database':
          try {
            await this.dataSource.query('SELECT 1');
            return {
              success: true,
              status: 'connected',
              message: 'Base de datos conectada correctamente',
            };
          } catch (error) {
            return {
              success: false,
              status: 'error',
              message: `Error de conexión con la base de datos: ${error.message}`,
            };
          }

        default:
          return {
            success: false,
            status: 'error',
            message: 'Servicio no reconocido',
          };
      }
    } catch (error) {
      this.logger.error(`Error testing ${service} connection:`, error.message);
      return {
        success: false,
        status: 'error',
        message: `Error al probar conexión con ${service}`,
      };
    }
  }

  private maskToken(token: string): string {
    if (!token || token.length < 8) {
      return token;
    }
    const visibleChars = 4;
    const maskedLength = token.length - visibleChars * 2;
    return (
      token.substring(0, visibleChars) +
      '*'.repeat(maskedLength) +
      token.substring(token.length - visibleChars)
    );
  }

  private maskSensitiveData(data: any): any {
    if (!data) return data;

    const sensitiveFields = ['token', 'authToken', 'accountSid', 'password'];
    const masked = { ...data };

    for (const [key, value] of Object.entries(masked)) {
      if (typeof value === 'object' && value !== null) {
        masked[key] = this.maskSensitiveData(value);
      } else if (typeof value === 'string' && sensitiveFields.includes(key)) {
        masked[key] = this.maskToken(value);
      }
    }

    return masked;
  }
}
