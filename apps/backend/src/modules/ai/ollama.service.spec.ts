import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus } from '@nestjs/common';
import { OllamaService, OllamaMessage, RestaurantContext } from './ollama.service';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('OllamaService - Unit Tests', () => {
  let service: OllamaService;
  let configService: ConfigService;
  let mockAxiosInstance: any;

  beforeEach(async () => {
    // Mock de axios instance
    mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
      interceptors: {
        request: {
          use: jest.fn((onFulfilled, onRejected) => {
            // Store interceptors for testing if needed
            return 0;
          }),
        },
        response: {
          use: jest.fn((onFulfilled, onRejected) => {
            // Store interceptors for testing if needed
            return 0;
          }),
        },
      },
    };

    mockedAxios.create.mockReturnValue(mockAxiosInstance as any);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OllamaService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: string) => {
              if (key === 'OLLAMA_URL') return 'http://localhost:21434';
              if (key === 'OLLAMA_MODEL') return 'phi3:mini';
              return defaultValue;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<OllamaService>(OllamaService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should initialize with default configuration', () => {
      expect(configService.get).toHaveBeenCalledWith('OLLAMA_URL', 'http://localhost:21434');
      expect(configService.get).toHaveBeenCalledWith('OLLAMA_MODEL', 'phi3:mini');
    });

    it('should create axios instance with correct config', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:21434',
        timeout: 120000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'DysaBot/1.0.0',
        },
      });
    });

    it('should setup request and response interceptors', () => {
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
    });
  });

  describe('isOllamaRunning', () => {
    it('should return true when Ollama is accessible', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        status: 200,
        data: { version: '0.1.0' },
      });

      const result = await service.isOllamaRunning();

      expect(result).toBe(true);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/version', {
        timeout: 5000,
      });
    });

    it('should return false when Ollama is not accessible', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Connection refused'));

      const result = await service.isOllamaRunning();

      expect(result).toBe(false);
    });

    it('should handle network errors gracefully', async () => {
      mockAxiosInstance.get.mockRejectedValue({ code: 'ECONNREFUSED' });

      const result = await service.isOllamaRunning();

      expect(result).toBe(false);
    });
  });

  describe('listModels', () => {
    it('should return list of available models', async () => {
      const mockResponse = {
        status: 200,
        data: {
          models: [
            { name: 'phi3:mini', size: 1234567890 },
            { name: 'llama2', size: 9876543210 },
          ],
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await service.listModels();

      expect(result).toEqual(['phi3:mini', 'llama2']);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/tags');
    });

    it('should return empty array when no models available', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        status: 200,
        data: { models: [] },
      });

      const result = await service.listModels();

      expect(result).toEqual([]);
    });

    it('should throw HttpException when Ollama service is unavailable', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Service unavailable'));

      await expect(service.listModels()).rejects.toThrow(HttpException);
      await expect(service.listModels()).rejects.toThrow('Failed to connect to Ollama service');
    });
  });

  describe('pullModel', () => {
    it('should successfully pull a model', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        status: 200,
        data: { status: 'success' },
      });

      const result = await service.pullModel('llama2');

      expect(result).toBe(true);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/pull', {
        name: 'llama2',
      });
    });

    it('should return false when pull fails', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        status: 500,
        data: { error: 'Failed' },
      });

      const result = await service.pullModel('invalid-model');

      expect(result).toBe(false);
    });

    it('should handle network errors during pull', async () => {
      mockAxiosInstance.post.mockRejectedValue(new Error('Network error'));

      const result = await service.pullModel('llama2');

      expect(result).toBe(false);
    });
  });

  describe('generateResponse', () => {
    const mockModels = ['phi3:mini', 'llama2'];
    const mockGenerateResponse = {
      status: 200,
      data: {
        model: 'phi3:mini',
        created_at: '2025-01-01T00:00:00Z',
        message: {
          role: 'assistant' as const,
          content: 'Test response',
        },
        done: true,
      },
    };

    beforeEach(() => {
      mockAxiosInstance.get.mockResolvedValue({
        status: 200,
        data: { models: mockModels.map(name => ({ name })) },
      });
    });

    it('should generate response with default model', async () => {
      mockAxiosInstance.post.mockResolvedValue(mockGenerateResponse);

      const result = await service.generateResponse({
        model: 'phi3:mini',
        messages: [{ role: 'user', content: 'Hello' }],
      });

      expect(result).toEqual(mockGenerateResponse.data);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/generate', expect.objectContaining({
        model: 'phi3:mini',
        messages: [{ role: 'user', content: 'Hello' }],
        stream: false,
      }));
    });

    it('should apply default options', async () => {
      mockAxiosInstance.post.mockResolvedValue(mockGenerateResponse);

      await service.generateResponse({
        model: 'phi3:mini',
        prompt: 'Test prompt',
      });

      const callArgs = mockAxiosInstance.post.mock.calls[0][1];
      expect(callArgs.options).toMatchObject({
        temperature: 0.7,
        top_k: 40,
        top_p: 0.9,
        repeat_penalty: 1.1,
        num_ctx: 2048,
        num_predict: 150,
      });
    });

    it('should override default options when provided', async () => {
      mockAxiosInstance.post.mockResolvedValue(mockGenerateResponse);

      await service.generateResponse({
        model: 'phi3:mini',
        prompt: 'Test',
        options: {
          temperature: 0.5,
          num_predict: 300,
        },
      });

      const callArgs = mockAxiosInstance.post.mock.calls[0][1];
      expect(callArgs.options.temperature).toBe(0.5);
      expect(callArgs.options.num_predict).toBe(300);
    });

    it('should pull model if not available', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        status: 200,
        data: { models: [{ name: 'llama2' }] },
      });
      mockAxiosInstance.post
        .mockResolvedValueOnce({ status: 200 }) // pullModel
        .mockResolvedValueOnce(mockGenerateResponse); // generateResponse

      await service.generateResponse({
        model: 'phi3:mini',
        prompt: 'Test',
      });

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/pull', {
        name: 'phi3:mini',
      });
    });

    it('should throw HttpException if model cannot be pulled', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        status: 200,
        data: { models: [] },
      });
      mockAxiosInstance.post.mockResolvedValue({ status: 500 });

      await expect(service.generateResponse({
        model: 'non-existent-model',
        prompt: 'Test',
      })).rejects.toThrow('Model non-existent-model not available and could not be pulled');
    });

    it('should throw HttpException on ECONNREFUSED', async () => {
      const error = new Error('Connection refused') as any;
      error.code = 'ECONNREFUSED';
      mockAxiosInstance.post.mockRejectedValue(error);

      await expect(service.generateResponse({
        model: 'phi3:mini',
        prompt: 'Test',
      })).rejects.toThrow('Cannot connect to Ollama service');
    });

    it('should throw HttpException on timeout', async () => {
      const error = new Error('Timeout') as any;
      error.code = 'ETIMEDOUT';
      mockAxiosInstance.post.mockRejectedValue(error);

      await expect(service.generateResponse({
        model: 'phi3:mini',
        prompt: 'Test',
      })).rejects.toThrow('Ollama service timeout');
    });

    it('should throw HttpException when response is invalid', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        status: 200,
        data: { done: true }, // Missing message
      });

      await expect(service.generateResponse({
        model: 'phi3:mini',
        prompt: 'Test',
      })).rejects.toThrow('Invalid response from Ollama service');
    });
  });

  describe('chat', () => {
    const mockMessages: OllamaMessage[] = [
      { role: 'system', content: 'You are a helpful assistant' },
      { role: 'user', content: 'Hello' },
    ];

    it('should return generated chat response', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        status: 200,
        data: { models: [{ name: 'phi3:mini' }] },
      });
      mockAxiosInstance.post.mockResolvedValue({
        status: 200,
        data: {
          model: 'phi3:mini',
          message: {
            role: 'assistant',
            content: 'Hello! How can I help you?',
          },
          done: true,
        },
      });

      const result = await service.chat(mockMessages);

      expect(result).toBe('Hello! How can I help you?');
    });

    it('should use custom model when provided', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        status: 200,
        data: { models: [{ name: 'llama2' }] },
      });
      mockAxiosInstance.post.mockResolvedValue({
        status: 200,
        data: {
          model: 'llama2',
          message: { role: 'assistant', content: 'Response' },
          done: true,
        },
      });

      await service.chat(mockMessages, 'llama2');

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/generate', expect.objectContaining({
        model: 'llama2',
      }));
    });

    it('should return default message when no content generated', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        status: 200,
        data: { models: [{ name: 'phi3:mini' }] },
      });
      mockAxiosInstance.post.mockResolvedValue({
        status: 200,
        data: {
          model: 'phi3:mini',
          message: { role: 'assistant', content: '' },
          done: true,
        },
      });

      const result = await service.chat(mockMessages);

      expect(result).toBe('No response generated');
    });

    it('should propagate errors from generateResponse', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Service unavailable'));

      await expect(service.chat(mockMessages)).rejects.toThrow();
    });
  });

  describe('generateRestaurantResponse', () => {
    const mockContext: RestaurantContext = {
      customerName: 'Juan',
      restaurantInfo: {
        name: 'La Buena Mesa',
        address: 'Calle Principal 123',
        phone: '+34 900 123 456',
        hours: 'L-D 12:00-23:00',
        specialties: ['Paella', 'Tapas'],
      },
      previousMessages: [
        { role: 'user', content: 'Hola' },
        { role: 'assistant', content: 'Hola Juan, bienvenido' },
      ],
    };

    beforeEach(() => {
      mockAxiosInstance.get.mockResolvedValue({
        status: 200,
        data: { models: [{ name: 'phi3:mini' }] },
      });
      mockAxiosInstance.post.mockResolvedValue({
        status: 200,
        data: {
          model: 'phi3:mini',
          message: {
            role: 'assistant',
            content: '¡Claro! Te ayudo con tu reserva.',
          },
          done: true,
        },
      });
    });

    it('should generate restaurant-specific response', async () => {
      const result = await service.generateRestaurantResponse(
        'Quiero hacer una reserva',
        mockContext,
      );

      expect(result).toBe('¡Claro! Te ayudo con tu reserva.');
    });

    it('should include system prompt with restaurant context', async () => {
      await service.generateRestaurantResponse('Test message', mockContext);

      const callArgs = mockAxiosInstance.post.mock.calls[0][1];
      const systemMessage = callArgs.messages[0];

      expect(systemMessage.role).toBe('system');
      expect(systemMessage.content).toContain('ChefBot Dysa');
      expect(systemMessage.content).toContain('La Buena Mesa');
      expect(systemMessage.content).toContain('Paella');
    });

    it('should include previous messages in context', async () => {
      await service.generateRestaurantResponse('New message', mockContext);

      const callArgs = mockAxiosInstance.post.mock.calls[0][1];
      const messages = callArgs.messages;

      expect(messages.length).toBeGreaterThan(2);
      expect(messages).toContainEqual({ role: 'user', content: 'Hola' });
      expect(messages).toContainEqual({ role: 'assistant', content: 'Hola Juan, bienvenido' });
    });

    it('should append user message at the end', async () => {
      await service.generateRestaurantResponse('Final message', mockContext);

      const callArgs = mockAxiosInstance.post.mock.calls[0][1];
      const messages = callArgs.messages;
      const lastMessage = messages[messages.length - 1];

      expect(lastMessage).toEqual({ role: 'user', content: 'Final message' });
    });

    it('should work with minimal context', async () => {
      const minimalContext: RestaurantContext = {};

      const result = await service.generateRestaurantResponse('Hello', minimalContext);

      expect(result).toBe('¡Claro! Te ayudo con tu reserva.');
    });
  });

  describe('getHealthStatus', () => {
    it('should return correct health status', () => {
      const status = service.getHealthStatus();

      expect(status).toEqual({
        service: 'Ollama AI Service',
        baseUrl: 'http://localhost:21434',
        defaultModel: 'phi3:mini',
        timeout: 120000,
        status: 'initialized',
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle non-Error exceptions gracefully', async () => {
      mockAxiosInstance.get.mockRejectedValue('String error');

      const result = await service.isOllamaRunning();

      expect(result).toBe(false);
    });

    it('should handle undefined/null errors', async () => {
      mockAxiosInstance.get.mockRejectedValue(null);

      const result = await service.isOllamaRunning();

      expect(result).toBe(false);
    });
  });
});
