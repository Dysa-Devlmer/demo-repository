import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller()
export class HealthController {
  constructor(
    private readonly configService: ConfigService,
    @InjectDataSource()
    private readonly dataSource: DataSource
  ) {}

  @Get('health')
  async getHealth() {
    const dbStatus = await this.checkDatabaseConnection();

    return {
      status: dbStatus.connected ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      service: 'ChatBotDysa Backend API',
      version: '1.0.0',
      environment: this.configService.get<string>('NODE_ENV', 'development'),
      database: dbStatus,
      services: {
        whatsapp: {
          configured: !!(
            this.configService.get('WA_ACCESS_TOKEN') &&
            this.configService.get('WA_BUSINESS_PHONE_ID')
          ),
        },
        twilio: {
          configured: !!(
            this.configService.get('TWILIO_ACCOUNT_SID') &&
            this.configService.get('TWILIO_AUTH_TOKEN')
          ),
        },
        ollama: {
          url: this.configService.get('OLLAMA_URL', 'http://localhost:11434'),
          model: this.configService.get('OLLAMA_MODEL', 'llama3.2:3b'),
        },
      },
    };
  }

  private async checkDatabaseConnection() {
    try {
      const result = await this.dataSource.query('SELECT 1');
      return {
        connected: true,
        host: this.configService.get('DATABASE_HOST'),
        port: this.configService.get('DATABASE_PORT'),
        database: this.configService.get('DATABASE_NAME'),
        message: 'Database connection successful',
      };
    } catch (error) {
      return {
        connected: false,
        host: this.configService.get('DATABASE_HOST'),
        port: this.configService.get('DATABASE_PORT'),
        database: this.configService.get('DATABASE_NAME'),
        message: error.message,
        error: error.name,
      };
    }
  }

  @Get('health/database')
  async getDatabaseHealth() {
    const dbStatus = await this.checkDatabaseConnection();

    return {
      success: true,
      data: dbStatus,
      timestamp: new Date().toISOString(),
      path: '/health/database',
    };
  }

  @Get('health/ai')
  async getAiHealth() {
    const ollamaUrl = this.configService.get('OLLAMA_URL', 'http://localhost:11434');
    const ollamaModel = this.configService.get('OLLAMA_MODEL', 'llama3.2:3b');

    const aiStatus = {
      service: 'ollama',
      url: ollamaUrl,
      model: ollamaModel,
      status: 'unknown',
      message: '',
    };

    try {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(`${ollamaUrl}/api/tags`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        const models = data.models || [];
        const modelExists = models.some((m: any) => m.name === ollamaModel);

        aiStatus.status = modelExists ? 'healthy' : 'model_not_found';
        aiStatus.message = modelExists
          ? `Model ${ollamaModel} is loaded and ready`
          : `Model ${ollamaModel} not found. Available models: ${models.map((m: any) => m.name).join(', ')}`;
      } else {
        aiStatus.status = 'error';
        aiStatus.message = `HTTP ${response.status}: ${response.statusText}`;
      }
    } catch (error) {
      aiStatus.status = 'offline';
      aiStatus.message = error.message || 'Cannot connect to Ollama service';
    }

    return {
      success: aiStatus.status === 'healthy',
      data: aiStatus,
      timestamp: new Date().toISOString(),
      path: '/health/ai',
    };
  }

  @Get()
  getRoot() {
    return {
      message: '🤖 ChatBotDysa Backend API is running!',
      status: 'online',
      timestamp: new Date().toISOString(),
      endpoints: {
        health: '/health',
        healthDatabase: '/health/database',
        healthAI: '/health/ai',
        api: '/api',
        ai: '/api/ai',
        websocket: '/socket.io',
        whatsapp: '/api/whatsapp',
        twilio: '/api/twilio',
      },
    };
  }
}
