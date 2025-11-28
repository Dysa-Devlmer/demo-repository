import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HybridAIService } from './hybrid-ai.service';
import { OllamaService, RestaurantContext } from './ollama.service';
import OpenAI from 'openai';

// Mock OpenAI
jest.mock('openai');
const MockedOpenAI = OpenAI as jest.MockedClass<typeof OpenAI>;

describe('HybridAIService - Unit Tests', () => {
  let service: HybridAIService;
  let ollamaService: OllamaService;
  let configService: ConfigService;
  let mockOpenAI: any;

  const mockRestaurantContext: RestaurantContext = {
    customerName: 'Juan Pérez',
    restaurantInfo: {
      name: 'La Buena Mesa',
      address: 'Calle Principal 123, Madrid',
      phone: '+34 900 123 456',
      hours: 'Lunes a Domingo: 12:00-23:00',
      specialties: ['Paella Valenciana', 'Pulpo a la Gallega', 'Tarta de Santiago'],
    },
    menuItems: [
      {
        id: 1,
        name: 'Paella Valenciana',
        price: 18.50,
        category: 'Arroces',
        description: 'Arroz con pollo, conejo y verduras',
        available: true,
      },
      {
        id: 2,
        name: 'Pulpo a la Gallega',
        price: 22.00,
        category: 'Mariscos',
        description: 'Pulpo cocido con pimentón',
        available: true,
      },
    ],
    previousMessages: [
      { role: 'user', content: 'Hola' },
      { role: 'assistant', content: '¡Hola Juan! Bienvenido a La Buena Mesa' },
    ],
  };

  beforeEach(async () => {
    // Mock OpenAI instance
    mockOpenAI = {
      chat: {
        completions: {
          create: jest.fn(),
        },
      },
    };

    MockedOpenAI.mockImplementation(() => mockOpenAI);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HybridAIService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'OPENAI_API_KEY') return 'sk-test-key-12345';
              return undefined;
            }),
          },
        },
        {
          provide: OllamaService,
          useValue: {
            generateRestaurantResponse: jest.fn(),
            isOllamaRunning: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<HybridAIService>(HybridAIService);
    ollamaService = module.get<OllamaService>(OllamaService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    service.clearCache();
  });

  describe('Service Initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should initialize with OpenAI when API key is provided', () => {
      const stats = service.getStats();
      expect(stats.primaryProvider).toBe('OpenAI GPT-4o-mini');
      expect(stats.openaiConfigured).toBe(true);
    });

    it('should initialize without OpenAI when no API key', async () => {
      const testModule = await Test.createTestingModule({
        providers: [
          HybridAIService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn(() => undefined),
            },
          },
          {
            provide: OllamaService,
            useValue: {
              generateRestaurantResponse: jest.fn(),
              isOllamaRunning: jest.fn(),
            },
          },
        ],
      }).compile();

      const testService = testModule.get<HybridAIService>(HybridAIService);
      const stats = testService.getStats();

      expect(stats.primaryProvider).toBe('Ollama only');
      expect(stats.openaiConfigured).toBe(false);
    });
  });

  describe('generateResponse - OpenAI Primary', () => {
    beforeEach(() => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: {
              role: 'assistant',
              content: '¡Claro! Nuestra especialidad es la Paella Valenciana por €18.50',
            },
          },
        ],
        usage: {
          total_tokens: 150,
        },
      });
    });

    it('should generate response using OpenAI as primary', async () => {
      const result = await service.generateResponse(
        '¿Cuál es su especialidad?',
        mockRestaurantContext,
      );

      expect(result.provider).toBe('openai');
      expect(result.content).toContain('Paella Valenciana');
      expect(result.tokensUsed).toBe(150);
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalled();
    });

    it('should include restaurant context in system prompt', async () => {
      await service.generateResponse('Hola', mockRestaurantContext);

      const callArgs = mockOpenAI.chat.completions.create.mock.calls[0][0];
      const systemMessage = callArgs.messages[0];

      expect(systemMessage.role).toBe('system');
      expect(systemMessage.content).toContain('ChefBot Dysa');
      expect(systemMessage.content).toContain('La Buena Mesa');
      expect(systemMessage.content).toContain('RESTRICCIONES ABSOLUTAS');
      expect(systemMessage.content).toContain('NO tienes acceso a internet');
    });

    it('should limit tokens to 200 for concise responses', async () => {
      await service.generateResponse('Test', mockRestaurantContext);

      const callArgs = mockOpenAI.chat.completions.create.mock.calls[0][0];

      expect(callArgs.max_tokens).toBe(200);
      expect(callArgs.temperature).toBe(0.7);
    });

    it('should include previous messages in conversation', async () => {
      await service.generateResponse('Nueva pregunta', mockRestaurantContext);

      const callArgs = mockOpenAI.chat.completions.create.mock.calls[0][0];
      const messages = callArgs.messages;

      expect(messages.length).toBeGreaterThan(2);
      expect(messages.some((m: any) => m.content === 'Hola')).toBe(true);
      expect(messages.some((m: any) => m.content === '¡Hola Juan! Bienvenido a La Buena Mesa')).toBe(true);
    });

    it('should limit previous messages to last 10', async () => {
      const manyMessages = Array.from({ length: 20 }, (_, i) => ({
        role: i % 2 === 0 ? ('user' as const) : ('assistant' as const),
        content: `Message ${i}`,
      }));

      const contextWithMany: RestaurantContext = {
        ...mockRestaurantContext,
        previousMessages: manyMessages,
      };

      await service.generateResponse('Test', contextWithMany);

      const callArgs = mockOpenAI.chat.completions.create.mock.calls[0][0];
      const messages = callArgs.messages;

      // System + 10 previous + 1 current = 12
      expect(messages.length).toBeLessThanOrEqual(12);
    });

    it('should include menu items in prompt', async () => {
      await service.generateResponse('Test', mockRestaurantContext);

      const callArgs = mockOpenAI.chat.completions.create.mock.calls[0][0];
      const systemMessage = callArgs.messages[0].content;

      expect(systemMessage).toContain('Paella Valenciana');
      expect(systemMessage).toContain('18.5');
      expect(systemMessage).toContain('Pulpo a la Gallega');
    });
  });

  describe('generateResponse - Fallback to Ollama', () => {
    it('should fallback to Ollama when OpenAI fails', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValue(new Error('OpenAI API Error'));
      (ollamaService.generateRestaurantResponse as jest.Mock).mockResolvedValue(
        'Respuesta de Ollama sobre el restaurante',
      );

      const result = await service.generateResponse('Hola', mockRestaurantContext);

      expect(result.provider).toBe('ollama');
      expect(result.content).toBe('Respuesta de Ollama sobre el restaurante');
      expect(ollamaService.generateRestaurantResponse).toHaveBeenCalledWith('Hola', mockRestaurantContext);
    });

    it('should use Ollama directly when OpenAI not configured', async () => {
      const testModule = await Test.createTestingModule({
        providers: [
          HybridAIService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn(() => undefined),
            },
          },
          {
            provide: OllamaService,
            useValue: {
              generateRestaurantResponse: jest.fn().mockResolvedValue('Ollama response'),
              isOllamaRunning: jest.fn(),
            },
          },
        ],
      }).compile();

      const testService = testModule.get<HybridAIService>(HybridAIService);
      const testOllama = testModule.get<OllamaService>(OllamaService);

      const result = await testService.generateResponse('Test', mockRestaurantContext);

      expect(result.provider).toBe('ollama');
      expect(testOllama.generateRestaurantResponse).toHaveBeenCalled();
    });
  });

  describe('generateResponse - Emergency Fallback', () => {
    beforeEach(() => {
      mockOpenAI.chat.completions.create.mockRejectedValue(new Error('OpenAI failed'));
      (ollamaService.generateRestaurantResponse as jest.Mock).mockRejectedValue(new Error('Ollama failed'));
    });

    it('should use pre-programmed responses when both fail', async () => {
      const result = await service.generateResponse('Hola', mockRestaurantContext);

      expect(result.provider).toBe('fallback');
      expect(result.content).toContain('Bienvenido');
      expect(result.content).toContain('La Buena Mesa');
    });

    it('should respond to menu queries with fallback', async () => {
      const result = await service.generateResponse('¿Cuál es el menú?', mockRestaurantContext);

      expect(result.provider).toBe('fallback');
      expect(result.content).toContain('Paella Valenciana');
      expect(result.content).toContain('18.5');
    });

    it('should respond to reservation queries with fallback', async () => {
      const result = await service.generateResponse('Quiero hacer una reserva', mockRestaurantContext);

      expect(result.provider).toBe('fallback');
      expect(result.content).toContain('reserva');
      expect(result.content.toLowerCase()).toMatch(/cuántas|personas|día/);
    });

    it('should respond to delivery queries with fallback', async () => {
      const result = await service.generateResponse('Quiero pedir delivery', mockRestaurantContext);

      expect(result.provider).toBe('fallback');
      expect(result.content).toContain('pedido');
    });

    it('should respond to hours queries with fallback', async () => {
      const result = await service.generateResponse('¿Qué horarios tienen?', mockRestaurantContext);

      expect(result.provider).toBe('fallback');
      expect(result.content).toContain('12:00');
      expect(result.content).toContain('23:00');
    });

    it('should respond to location queries with fallback', async () => {
      const result = await service.generateResponse('¿Cuál es su ubicación?', mockRestaurantContext);

      expect(result.provider).toBe('fallback');
      expect(result.content).toContain('Estamos ubicados en');
      expect(result.content).toContain('Calle Principal 123');
    });

    it('should provide generic help when no pattern matches', async () => {
      const result = await service.generateResponse('xyz123', mockRestaurantContext);

      expect(result.provider).toBe('fallback');
      expect(result.content).toContain('ayudarte');
      expect(result.content.toLowerCase()).toMatch(/menú|reservas|pedidos/);
    });
  });

  describe('Response Caching', () => {
    beforeEach(() => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: 'Cached response' } }],
        usage: { total_tokens: 100 },
      });
    });

    it('should cache responses', async () => {
      await service.generateResponse('Test question', mockRestaurantContext);
      const result = await service.generateResponse('Test question', mockRestaurantContext);

      expect(result.cached).toBe(true);
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(1);
    });

    it('should not cache different questions', async () => {
      await service.generateResponse('Question 1', mockRestaurantContext);
      await service.generateResponse('Question 2', mockRestaurantContext);

      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(2);
    });

    it('should clear cache on demand', async () => {
      await service.generateResponse('Test', mockRestaurantContext);
      service.clearCache();
      await service.generateResponse('Test', mockRestaurantContext);

      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(2);
    });

    it('should expire cache after 1 hour', async () => {
      jest.useFakeTimers();

      await service.generateResponse('Test', mockRestaurantContext);

      // Avanzar 1 hora y 1 segundo
      jest.advanceTimersByTime(3600001);

      await service.generateResponse('Test', mockRestaurantContext);

      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(2);

      jest.useRealTimers();
    });

    it('should limit cache size to 100 entries', async () => {
      for (let i = 0; i < 105; i++) {
        await service.generateResponse(`Question ${i}`, mockRestaurantContext);
      }

      const stats = service.getStats();
      expect(stats.cacheSize).toBeLessThanOrEqual(101); // 100 + 1 during cleanup
    });
  });

  describe('getStats', () => {
    it('should return correct stats when OpenAI configured', () => {
      const stats = service.getStats();

      expect(stats.service).toBe('Hybrid AI Service');
      expect(stats.primaryProvider).toBe('OpenAI GPT-4o-mini');
      expect(stats.fallbackProvider).toBe('Ollama');
      expect(stats.emergencyFallback).toBe('Pre-programmed responses');
      expect(stats.openaiConfigured).toBe(true);
      expect(stats.model).toBe('gpt-4o-mini');
    });

    it('should show cache statistics', () => {
      const stats = service.getStats();

      expect(stats.cacheSize).toBe(0);
      expect(stats.cacheExpiration).toBe('60 minutes');
    });
  });

  describe('healthCheck', () => {
    it('should return healthy when both providers available', async () => {
      (ollamaService.isOllamaRunning as jest.Mock).mockResolvedValue(true);

      const health = await service.healthCheck();

      expect(health.openai).toBe(true);
      expect(health.ollama).toBe(true);
      expect(health.overall).toBe(true);
    });

    it('should return healthy when only OpenAI available', async () => {
      (ollamaService.isOllamaRunning as jest.Mock).mockResolvedValue(false);

      const health = await service.healthCheck();

      expect(health.openai).toBe(true);
      expect(health.ollama).toBe(false);
      expect(health.overall).toBe(true);
    });

    it('should return healthy when only Ollama available', async () => {
      const testModule = await Test.createTestingModule({
        providers: [
          HybridAIService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn(() => undefined),
            },
          },
          {
            provide: OllamaService,
            useValue: {
              generateRestaurantResponse: jest.fn(),
              isOllamaRunning: jest.fn().mockResolvedValue(true),
            },
          },
        ],
      }).compile();

      const testService = testModule.get<HybridAIService>(HybridAIService);
      const health = await testService.healthCheck();

      expect(health.openai).toBe(false);
      expect(health.ollama).toBe(true);
      expect(health.overall).toBe(true);
    });

    it('should return unhealthy when both unavailable', async () => {
      const testModule = await Test.createTestingModule({
        providers: [
          HybridAIService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn(() => undefined),
            },
          },
          {
            provide: OllamaService,
            useValue: {
              generateRestaurantResponse: jest.fn(),
              isOllamaRunning: jest.fn().mockResolvedValue(false),
            },
          },
        ],
      }).compile();

      const testService = testModule.get<HybridAIService>(HybridAIService);
      const health = await testService.healthCheck();

      expect(health.openai).toBe(false);
      expect(health.ollama).toBe(false);
      expect(health.overall).toBe(false);
    });
  });

  describe('Response Time Tracking', () => {
    it('should track response time', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: 'Test' } }],
        usage: { total_tokens: 50 },
      });

      const result = await service.generateResponse('Test', mockRestaurantContext);

      expect(result.responseTime).toBeGreaterThanOrEqual(0);
      expect(typeof result.responseTime).toBe('number');
    });
  });
});
