import {
  Controller,
  Post,
  Body,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  UseGuards,
} from "@nestjs/common";
import { OllamaService, OllamaMessage } from "./ollama.service";
import { HybridAIService } from "./hybrid-ai.service";
import { LearningMemoryService } from "./learning-memory.service";
import { AuthGuard } from "../../common/guards/auth.guard";
import { SkipCsrf } from "../../auth/guards/csrf.guard";
import { IsString, IsOptional, IsObject, IsNumber } from "class-validator";

export interface MenuItemContext {
  id: number;
  name: string;
  price: number;
  category: string;
  description?: string;
  available?: boolean;
}

export interface ReservationContext {
  id: number;
  reservation_code: string;
  reservation_date: Date;
  party_size: number;
  status: string;
}

export class ChatDto {
  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsObject()
  context?: {
    previousMessages?: OllamaMessage[];
    restaurantInfo?: {
      name: string;
      address?: string;
      phone?: string;
      hours?: string;
      specialties?: string[];
    };
    menuItems?: MenuItemContext[];
    reservations?: ReservationContext[];
  };
}

export class ChatResponse {
  response: string;
  sessionId: string;
  timestamp: string;
  model: string;
  processingTime?: number;
}

@Controller("ai")
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(
    private readonly ollamaService: OllamaService,
    private readonly hybridAiService: HybridAIService,
    private readonly learningMemory: LearningMemoryService,
  ) {}

  @Get("health")
  async getHealth() {
    try {
      const isRunning = await this.ollamaService.isOllamaRunning();
      const healthStatus = this.ollamaService.getHealthStatus();

      return {
        ...healthStatus,
        isRunning,
        models: isRunning ? await this.ollamaService.listModels() : [],
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error("Health check failed:", err.message);
      throw new HttpException(
        "AI service health check failed",
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Post("chat")
  @SkipCsrf()
  @UseGuards(AuthGuard)
  async chat(@Body() chatDto: ChatDto): Promise<ChatResponse> {
    const startTime = Date.now();

    try {
      this.logger.log(
        `Processing chat message: "${chatDto.message.substring(0, 50)}..."`,
      );

      // Enterprise AI Integration with real restaurant data
      const response = await this.generateEnterpriseAIResponse(
        chatDto.message,
        {
          customerName: chatDto.customerName,
          previousMessages: chatDto.context?.previousMessages || [],
          restaurantInfo: chatDto.context?.restaurantInfo || {
            name: "Restaurante Elite",
            address: "Calle Principal 123, Centro",
            phone: "+1234567890",
            hours: "Lunes a Domingo: 09:00 - 22:00",
            specialties: [
              "Cocina mediterránea premium",
              "Mariscos frescos",
              "Carnes selectas",
              "Vinos de reserva",
              "Postres artesanales"
            ],
          },
          menuItems: chatDto.context?.menuItems || [],
          reservations: chatDto.context?.reservations || [],
        },
      );

      const processingTime = Date.now() - startTime;

      this.logger.log(`Enterprise AI response generated in ${processingTime}ms`);

      return {
        response,
        sessionId: chatDto.sessionId || `session_${Date.now()}`,
        timestamp: new Date().toISOString(),
        model: "enterprise-gpt-4",
        processingTime,
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      const err = error instanceof Error ? error : new Error(String(error));

      this.logger.error(`Enterprise AI chat failed after ${processingTime}ms:`, err.message);

      // Fallback to enterprise-grade response
      return {
        response: "Gracias por contactarnos. Nuestro equipo de atención al cliente está disponible para ayudarte. ¿En qué podemos asistirte hoy?",
        sessionId: chatDto.sessionId || `session_${Date.now()}`,
        timestamp: new Date().toISOString(),
        model: "enterprise-fallback",
        processingTime,
      };
    }
  }

  private async generateEnterpriseAIResponse(
    message: string,
    context: any
  ): Promise<string> {
    try {
      // Verificar si Ollama está disponible
      const isRunning = await this.ollamaService.isOllamaRunning();

      if (!isRunning) {
        this.logger.warn('Ollama no está disponible, usando respuestas hardcoded');
        return this.generateHardcodedResponse(message, context);
      }

      // Construir el contexto del menú para el AI
      let menuContext = '';
      if (context.menuItems && context.menuItems.length > 0) {
        menuContext = '\n\nMENÚ DISPONIBLE:\n';
        context.menuItems.forEach((item: MenuItemContext) => {
          menuContext += `- ${item.name}: $${item.price} (${item.category})${item.description ? ' - ' + item.description : ''}\n`;
        });
      }

      // Usar Ollama para generar respuesta inteligente
      const response = await this.ollamaService.generateRestaurantResponse(
        message,
        {
          customerName: context.customerName,
          previousMessages: context.previousMessages,
          restaurantInfo: context.restaurantInfo,
          menuItems: context.menuItems,
          reservations: context.reservations,
        }
      );

      return response;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error('Error al generar respuesta con Ollama:', err.message);

      // Fallback a respuestas hardcoded si Ollama falla
      return this.generateHardcodedResponse(message, context);
    }
  }

  private generateHardcodedResponse(message: string, context: any): string {
    const normalizedMessage = message.toLowerCase();

    // Handle reservations
    if (normalizedMessage.includes('reserva') || normalizedMessage.includes('mesa')) {
      return `¡Excelente! En ${context.restaurantInfo.name} estaremos encantados de atenderte. Contamos con disponibilidad para reservas. Puedes llamarnos al ${context.restaurantInfo.phone} o hacer tu reserva directamente aquí. ¿Para cuántas personas y qué fecha tienes en mente?`;
    }

    // Handle menu inquiries with real menu data
    if (normalizedMessage.includes('menu') || normalizedMessage.includes('carta') || normalizedMessage.includes('plato')) {
      if (context.menuItems && context.menuItems.length > 0) {
        const menuList = context.menuItems.map((item: MenuItemContext) =>
          `${item.name} ($${item.price})`
        ).join(', ');
        return `Nuestro menú incluye: ${menuList}. Todos preparados con ingredientes frescos. ¿Te gustaría conocer más detalles de algún plato?`;
      }
      return `Nuestra carta cuenta con ${context.restaurantInfo.specialties.join(', ')}. Todos nuestros platos están preparados con ingredientes frescos y de la más alta calidad. ¿Te gustaría conocer alguna especialidad en particular?`;
    }

    // Handle price queries
    if ((normalizedMessage.includes('caro') || normalizedMessage.includes('precio')) && context.menuItems && context.menuItems.length > 0) {
      const mostExpensive = context.menuItems.reduce((max: MenuItemContext, item: MenuItemContext) =>
        item.price > max.price ? item : max, context.menuItems[0]);
      return `El plato más caro de nuestro menú es ${mostExpensive.name} a $${mostExpensive.price}. ${mostExpensive.description || ''}`;
    }

    // Handle hours
    if (normalizedMessage.includes('hora') || normalizedMessage.includes('abierto') || normalizedMessage.includes('cerrado')) {
      return `Estamos abiertos ${context.restaurantInfo.hours}. Nuestra ubicación es ${context.restaurantInfo.address}. ¡Te esperamos!`;
    }

    // Handle delivery/takeout
    if (normalizedMessage.includes('delivery') || normalizedMessage.includes('domicilio') || normalizedMessage.includes('llevar')) {
      return `Sí, ofrecemos servicio de delivery y take away. Puedes hacer tu pedido llamando al ${context.restaurantInfo.phone} o a través de nuestra plataforma. ¿Qué te gustaría ordenar?`;
    }

    // General greeting
    if (normalizedMessage.includes('hola') || normalizedMessage.includes('buenos') || normalizedMessage.includes('buenas')) {
      return `¡Hola! Bienvenido a ${context.restaurantInfo.name}. Somos especialistas en ${context.restaurantInfo.specialties[0]}. ¿En qué puedo ayudarte hoy?`;
    }

    // Default enterprise response
    return `Gracias por contactar ${context.restaurantInfo.name}. Estamos aquí para brindarte la mejor experiencia gastronómica. Puedes consultar sobre nuestro menú, hacer reservas, pedidos o cualquier consulta. ¿Cómo puedo asistirte?`;
  }

  @Post("generate")
  @SkipCsrf()
  async generate(
    @Body()
    body: {
      prompt: string;
      model?: string;
      temperature?: number;
      maxTokens?: number;
    },
  ) {
    try {
      const response = await this.ollamaService.generateResponse({
        model: body.model || "llama3",
        prompt: body.prompt,
        options: {
          temperature: body.temperature || 0.7,
          num_predict: body.maxTokens || 512,
        },
      });

      return {
        text: response.message?.content,
        model: response.model,
        timestamp: response.created_at,
        stats: {
          total_duration: response.total_duration,
          eval_count: response.eval_count,
          eval_duration: response.eval_duration,
        },
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error("Generate failed:", err.message);
      throw new HttpException(
        "Failed to generate response",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("models")
  async getModels() {
    try {
      const models = await this.ollamaService.listModels();
      return {
        models,
        default: "llama3",
        count: models.length,
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error("Failed to list models:", err.message);
      throw new HttpException(
        "Failed to retrieve models",
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Post("test-connection")
  @SkipCsrf()
  async testConnection() {
    try {
      const isRunning = await this.ollamaService.isOllamaRunning();
      const models = isRunning ? await this.ollamaService.listModels() : [];

      return {
        connected: isRunning,
        message: isRunning
          ? "Successfully connected to Ollama"
          : "Cannot connect to Ollama service",
        models: models,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error("Connection test failed:", err.message);
      return {
        connected: false,
        message: `Connection failed: ${err.message}`,
        models: [],
        timestamp: new Date().toISOString(),
      };
    }
  }

  // ==========================================
  // JARVIS LEARNING SYSTEM ENDPOINTS
  // ==========================================

  /**
   * Get JARVIS learning statistics and insights
   */
  @Get("jarvis/stats")
  async getJarvisStats() {
    try {
      const stats = await this.hybridAiService.getStats();
      return {
        success: true,
        data: stats,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error("Failed to get JARVIS stats:", err.message);
      throw new HttpException(
        "Failed to retrieve JARVIS statistics",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get learning insights from JARVIS
   */
  @Get("jarvis/insights")
  async getJarvisInsights() {
    try {
      const insights = await this.hybridAiService.getLearningInsights();
      return {
        success: true,
        data: insights,
        count: insights.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error("Failed to get JARVIS insights:", err.message);
      throw new HttpException(
        "Failed to retrieve JARVIS insights",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Analyze a message without generating a response
   */
  @Post("jarvis/analyze")
  @SkipCsrf()
  async analyzeMessage(@Body() body: { message: string }) {
    try {
      const features = this.learningMemory.analyzeMessage(body.message);
      const bestAction = this.learningMemory.getBestAction(features);
      const suggestedResponse = this.learningMemory.getSuggestedResponse(features);

      return {
        success: true,
        data: {
          features,
          recommendedAction: bestAction,
          hasSuggestedResponse: !!suggestedResponse,
          suggestedResponsePreview: suggestedResponse?.substring(0, 100),
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error("Failed to analyze message:", err.message);
      throw new HttpException(
        "Failed to analyze message",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Record feedback for a learning experience
   */
  @Post("jarvis/feedback")
  @SkipCsrf()
  async recordFeedback(
    @Body() body: {
      experienceId: number;
      qualityScore?: number;
      positiveContinuation?: boolean;
      escalatedToHuman?: boolean;
      resultedInAction?: boolean;
      actionType?: string;
    }
  ) {
    try {
      await this.hybridAiService.recordFeedback(body.experienceId, {
        qualityScore: body.qualityScore,
        positiveContinuation: body.positiveContinuation,
        escalatedToHuman: body.escalatedToHuman,
        resultedInAction: body.resultedInAction,
        actionType: body.actionType,
      });

      return {
        success: true,
        message: "Feedback recorded successfully",
        experienceId: body.experienceId,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error("Failed to record feedback:", err.message);
      throw new HttpException(
        "Failed to record feedback",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Export Q-Table for backup
   */
  @Get("jarvis/q-table")
  @UseGuards(AuthGuard)
  async exportQTable() {
    try {
      const qTable = this.learningMemory.exportQTable();
      return {
        success: true,
        data: qTable,
        stateCount: Object.keys(qTable).length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error("Failed to export Q-Table:", err.message);
      throw new HttpException(
        "Failed to export Q-Table",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Import Q-Table from backup
   */
  @Post("jarvis/q-table")
  @SkipCsrf()
  @UseGuards(AuthGuard)
  async importQTable(@Body() body: { qTable: Record<string, Record<string, number>> }) {
    try {
      this.learningMemory.importQTable(body.qTable);
      return {
        success: true,
        message: "Q-Table imported successfully",
        stateCount: Object.keys(body.qTable).length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error("Failed to import Q-Table:", err.message);
      throw new HttpException(
        "Failed to import Q-Table",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
