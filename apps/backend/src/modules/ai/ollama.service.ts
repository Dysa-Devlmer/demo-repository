import { Injectable, Logger, HttpException, HttpStatus } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosInstance } from "axios";

export interface OllamaMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OllamaResponse {
  model: string;
  created_at: string;
  message: OllamaMessage;
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export interface OllamaModel {
  name: string;
  model?: string;
  modified_at?: string;
  size?: number;
  digest?: string;
  details?: {
    parent_model?: string;
    format?: string;
    family?: string;
    families?: string[];
    parameter_size?: string;
    quantization_level?: string;
  };
}

export interface OllamaModelsResponse {
  models: OllamaModel[];
}

export interface RestaurantContext {
  customerName?: string;
  previousMessages?: OllamaMessage[];
  availableActions?: string[];
  restaurantInfo?: {
    name: string;
    address?: string;
    phone?: string;
    hours?: string;
    specialties?: string[];
  };
  menuItems?: {
    id: number;
    name: string;
    price: number;
    category: string;
    description?: string;
    available?: boolean;
  }[];
  categories?: string[];
  reservations?: {
    id: number;
    reservation_code: string;
    reservation_date: Date;
    party_size: number;
    status: string;
  }[];
}

export interface AxiosErrorWithCode extends Error {
  code?: string;
  response?: {
    data?: unknown;
    status?: number;
    statusText?: string;
  };
}

export interface OllamaGenerateRequest {
  model: string;
  prompt?: string;
  messages?: OllamaMessage[];
  stream?: boolean;
  format?: string;
  options?: {
    temperature?: number;
    top_k?: number;
    top_p?: number;
    repeat_penalty?: number;
    seed?: number;
    num_ctx?: number;
    num_predict?: number;
  };
  system?: string;
  template?: string;
  context?: number[];
  raw?: boolean;
}

@Injectable()
export class OllamaService {
  private readonly logger = new Logger(OllamaService.name);
  private readonly httpClient: AxiosInstance;
  private readonly baseUrl: string;
  private readonly defaultModel: string;
  private readonly timeout: number = 90000; // 90 segundos para respuestas completas del chatbot

  constructor(private configService: ConfigService) {
    this.baseUrl = this.configService.get<string>(
      "OLLAMA_URL",
      "http://localhost:11434",
    );
    this.defaultModel = this.configService.get<string>(
      "OLLAMA_MODEL",
      "llama3:8b",
    );

    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      timeout: this.timeout,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "DysaBot/1.0.0",
      },
    });

    this.httpClient.interceptors.request.use(
      (config) => {
        this.logger.debug(
          `Making request to Ollama: ${config.method?.toUpperCase()} ${config.url}`,
        );
        return config;
      },
      (error) => {
        const err = error instanceof Error ? error : new Error(String(error));
        this.logger.error("Request error:", err.message);
        return Promise.reject(new Error(err.message));
      },
    );

    this.httpClient.interceptors.response.use(
      (response) => {
        this.logger.debug(`Ollama response: ${response.status}`);
        return response;
      },
      (error) => {
        const err = error instanceof Error ? error : new Error(String(error));
        this.logger.error("Response error:", err.message);
        return Promise.reject(new Error(err.message));
      },
    );
  }

  async isOllamaRunning(): Promise<boolean> {
    try {
      const response = await this.httpClient.get("/api/version", {
        timeout: 5000,
      });
      this.logger.log("Ollama is running", response.data);
      return true;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.warn("Ollama is not running or not accessible:", err.message);
      return false;
    }
  }

  async listModels(): Promise<string[]> {
    try {
      const response =
        await this.httpClient.get<OllamaModelsResponse>("/api/tags");
      const models =
        response.data.models?.map((model: OllamaModel) => model.name) || [];
      this.logger.debug(`Available models: ${models.join(", ")}`);
      return models;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error("Failed to list models:", err.message);
      throw new HttpException(
        "Failed to connect to Ollama service",
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async pullModel(modelName: string): Promise<boolean> {
    try {
      this.logger.log(`Pulling model: ${modelName}`);

      const response = await this.httpClient.post("/api/pull", {
        name: modelName,
      });

      if (response.status === 200) {
        this.logger.log(`Model ${modelName} pulled successfully`);
        return true;
      }

      return false;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to pull model ${modelName}:`, err.message);
      return false;
    }
  }

  async generateResponse(
    request: OllamaGenerateRequest,
  ): Promise<OllamaResponse> {
    try {
      // Asegurar que el modelo está disponible
      const models = await this.listModels();
      const targetModel = request.model || this.defaultModel;

      if (!models.includes(targetModel)) {
        this.logger.warn(
          `Model ${targetModel} not found, attempting to pull...`,
        );
        const pulled = await this.pullModel(targetModel);
        if (!pulled) {
          throw new HttpException(
            `Model ${targetModel} not available and could not be pulled`,
            HttpStatus.NOT_FOUND,
          );
        }
      }

      // Configurar request con valores por defecto
      const { model: _model, ...restRequest } = request;
      const ollamaRequest: OllamaGenerateRequest = {
        model: targetModel,
        stream: false,
        options: {
          temperature: 0.7,
          top_k: 40,
          top_p: 0.9,
          repeat_penalty: 1.1,
          num_ctx: 2048,
          num_predict: 400, // Aumentado para respuestas completas sin cortes
          ...request.options,
        },
        ...restRequest,
      };

      // Usar /api/chat si hay messages, /api/generate si hay prompt
      const endpoint = ollamaRequest.messages ? "/api/chat" : "/api/generate";
      const response = await this.httpClient.post<any>(
        endpoint,
        ollamaRequest,
      );

      // Para /api/chat: response.data.message.content
      // Para /api/generate: response.data.response
      if (response.data) {
        if (response.data.message) {
          this.logger.debug("Generated response successfully via /api/chat");
          return response.data;
        } else if (response.data.response) {
          this.logger.debug("Generated response successfully via /api/generate");
          // Convertir formato de /api/generate a formato esperado
          return {
            ...response.data,
            message: {
              role: "assistant",
              content: response.data.response,
            },
          };
        }
      }

      throw new HttpException(
        "Invalid response from Ollama service",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      const err = error as AxiosErrorWithCode;
      this.logger.error("Failed to generate response:", err.message);

      if (err.code === "ECONNREFUSED") {
        throw new HttpException(
          "Cannot connect to Ollama service. Make sure Ollama is running.",
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      if (err.code === "ETIMEDOUT") {
        throw new HttpException(
          "Ollama service timeout. The request took too long to process.",
          HttpStatus.REQUEST_TIMEOUT,
        );
      }

      throw new HttpException(
        "Failed to generate AI response",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async chat(messages: OllamaMessage[], model?: string): Promise<string> {
    try {
      const response = await this.generateResponse({
        model: model || this.defaultModel,
        messages,
        stream: false,
      });

      return response.message?.content || "No response generated";
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error("Chat error:", err.message);
      throw err;
    }
  }

  async generateRestaurantResponse(
    userMessage: string,
    context: RestaurantContext,
  ): Promise<string> {
    const systemPrompt = this.buildRestaurantSystemPrompt(context);

    const messages: OllamaMessage[] = [
      { role: "system", content: systemPrompt },
      ...(context.previousMessages || []),
      { role: "user", content: userMessage },
    ];

    return await this.chat(messages);
  }

  private buildRestaurantSystemPrompt(context: RestaurantContext): string {
    const restaurantName = context.restaurantInfo?.name || "ChatBotDysa";

    // Build categories list
    let categoriesInfo = "";
    if (context.categories && context.categories.length > 0) {
      categoriesInfo = `\nCATEGORÍAS DEL MENÚ:\n${context.categories.map(cat => `- ${cat}`).join('\n')}`;
    }

    // Build menu items list
    let menuInfo = "";
    if (context.menuItems && context.menuItems.length > 0) {
      const availableItems = context.menuItems.filter(item => item.available);
      menuInfo = `\n\nMENÚ DISPONIBLE (${availableItems.length} productos):\n`;

      // Group by category
      const byCategory = {};
      availableItems.forEach(item => {
        if (!byCategory[item.category]) {
          byCategory[item.category] = [];
        }
        byCategory[item.category].push(item);
      });

      for (const [category, items] of Object.entries(byCategory)) {
        menuInfo += `\n${category.toUpperCase()}:\n`;
        (items as any[]).forEach((item: any) => {
          menuInfo += `- ${item.name}: $${item.price.toLocaleString('es-CL')}${item.description ? ` - ${item.description}` : ''}\n`;
        });
      }
    }

    // OPTIMIZED PROMPT - Complete functionality with real data
    return `Eres el asistente virtual de ${restaurantName}. Habla siempre en español y usa un tono profesional y amable usando "usted".

DATOS DEL RESTAURANTE:
${context.restaurantInfo ? `- Nombre: ${context.restaurantInfo.name}
- Teléfono: ${context.restaurantInfo.phone || "+56965419765"}
- Horario: ${context.restaurantInfo.hours || "24/7"}
- Dirección: ${context.restaurantInfo.address || "Sistema ChatBotDysa"}` : ''}
${categoriesInfo}
${menuInfo}

REGLAS IMPORTANTES:
1. Usa SIEMPRE un tono formal con "usted" (no uses "tú" ni "tu")
2. Responde de forma CONCISA y DIRECTA (máximo 3-4 líneas)
3. Usa SOLO productos que existen en el MENÚ DISPONIBLE mostrado arriba
4. Si un producto NO está en el menú, dile claramente: "Lo siento, [producto] no está disponible en nuestro menú actual"
5. NO menciones productos que el cliente no pidió
6. NO agregues paréntesis con traducciones en inglés (como "Appetizer", "Main Course")
7. Usa SOLO las categorías listadas en "CATEGORÍAS DEL MENÚ"
8. Para pedidos: confirma productos, precios y total. Luego pregunta si desea agregar algo más o confirmar
9. Para delivery: confirma que sí ofrecemos servicio a domicilio y solicita la dirección de entrega
10. Completa SIEMPRE tu respuesta - no la dejes cortada

TONO: Profesional, amable, directo y eficiente.`;

  }

  getHealthStatus() {
    return {
      service: "Ollama AI Service",
      baseUrl: this.baseUrl,
      defaultModel: this.defaultModel,
      timeout: this.timeout,
      status: "initialized",
    };
  }
}
