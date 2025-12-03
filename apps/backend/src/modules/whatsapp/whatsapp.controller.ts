import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { IsString, IsOptional, IsEnum } from "class-validator";
import type { WebhookMessage } from "./whatsapp.service";
import { WhatsAppService } from "./whatsapp.service";
import { HybridAIService } from "../ai/hybrid-ai.service";
import { WebSocketsGateway } from "../websockets/websockets.gateway";
import { BusinessHoursService } from "./business-hours.service";
import { MenuService } from "../../menu/menu.service";
import { CategoriesService } from "../../categories/categories.service";
import { ReservationsService } from "../../reservations/reservations.service";
import { OrdersService } from "../../orders/orders.service";
import { ConversationsService } from "../../conversations/conversations.service";
import { CustomersService } from "../../customers/customers.service";
import { ConversationChannel } from "../../entities/conversation.entity";

export class SendMessageDto {
  @IsString()
  to: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsEnum(["text", "menu", "buttons", "reservation", "order"])
  type?: "text" | "menu" | "buttons" | "reservation" | "order";
}

@Controller("whatsapp")
export class WhatsAppController {
  private readonly logger = new Logger(WhatsAppController.name);

  constructor(
    private readonly whatsappService: WhatsAppService,
    private readonly hybridAiService: HybridAIService,
    private readonly websocketGateway: WebSocketsGateway,
    private readonly businessHoursService: BusinessHoursService,
    private readonly configService: ConfigService,
    private readonly menuService: MenuService,
    private readonly categoriesService: CategoriesService,
    private readonly reservationsService: ReservationsService,
    private readonly ordersService: OrdersService,
    private readonly conversationsService: ConversationsService,
    private readonly customersService: CustomersService,
  ) {}

  @Get("webhook")
  verifyWebhook(
    @Query("hub.mode") mode: string,
    @Query("hub.verify_token") token: string,
    @Query("hub.challenge") challenge: string,
  ) {
    this.logger.log(`Webhook verification attempt: mode=${mode}`);

    const verification = this.whatsappService.verifyWebhook(
      mode,
      token,
      challenge,
    );

    if (verification) {
      return parseInt(verification);
    }

    throw new HttpException(
      "Webhook verification failed",
      HttpStatus.FORBIDDEN,
    );
  }

  @Post("webhook")
  async handleWebhook(@Body() webhookData: WebhookMessage) {
    try {
      this.logger.log("Received WhatsApp webhook");

      // Process incoming messages
      const messages = this.whatsappService.processWebhookMessage(webhookData);

      for (const message of messages) {
        this.logger.log(
          `Processing message from ${message.from}: "${message.content}"`,
        );

        // Mark message as read
        await this.whatsappService.markAsRead(message.messageId);

        // ====================================
        // SAVE TO DATABASE: Find/Create Customer and Conversation
        // ====================================
        let customer;
        let conversation;

        try {
          // Find or create customer by WhatsApp phone
          customer = await this.customersService.findOrCreateByWhatsApp(message.from);
          this.logger.log(`Customer found/created: ${customer.name} (ID: ${customer.id})`);

          // Create or get active conversation for this customer
          conversation = await this.conversationsService.create({
            customerId: customer.id,
            channel: ConversationChannel.WHATSAPP,
            metadata: {
              whatsapp_phone: message.from,
              last_message_id: message.messageId,
            },
          });
          this.logger.log(`Conversation: ${conversation.session_id} (ID: ${conversation.id})`);

          // Save incoming customer message
          await this.conversationsService.addMessage(conversation.id, {
            content: message.content,
            sender: 'customer',
            metadata: {
              whatsapp_message_id: message.messageId,
              timestamp: message.timestamp,
            },
          });
          this.logger.log(`Customer message saved to conversation ${conversation.session_id}`);
        } catch (dbError) {
          this.logger.error(`Error saving to database: ${dbError.message}`);
          // Continue processing even if DB save fails
        }

        // Check if restaurant is open
        const isOpen = this.businessHoursService.isOpen();

        let responseText: string;
        let result: { success: boolean; messageId?: string; error?: string };

        if (isOpen) {
          // Business is OPEN - Generate AI response with ChatBotDysa context
          this.logger.log("Business is OPEN - Processing with AI");

          // Get company information from environment variables
          const restaurantName = this.configService.get<string>("RESTAURANT_NAME") || "ChatBotDysa";
          const restaurantPhone = this.configService.get<string>("RESTAURANT_PHONE") || "+56965419765";
          const restaurantHours = this.configService.get<string>("RESTAURANT_HOURS") || "24/7";
          const restaurantAddress = this.configService.get<string>("RESTAURANT_ADDRESS") || "Sistema de chatbot inteligente";
          const restaurantSpecialtiesStr = this.configService.get<string>("RESTAURANT_SPECIALTIES") || "Chatbot con IA,Atención automatizada";
          const restaurantSpecialties = restaurantSpecialtiesStr.split(",").map(s => s.trim());

          // Get real data from database services
          const [menuItems, categories] = await Promise.all([
            this.menuService.findAll(), // Get all menu items
            this.categoriesService.findAll(), // Get all categories
          ]);

          // Format menu items for the AI context
          const formattedMenuItems = menuItems.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            category: item.category_ref?.name || item.category || 'Sin categoría',
            description: item.description,
            available: item.available,
          }));

          // Get categories with real names
          const categoryNames = categories.map(cat => cat.name);

          this.logger.log(`Providing AI with ${formattedMenuItems.length} menu items and ${categoryNames.length} categories`);

          // Use HybridAIService: OpenAI (fast, ~1-2s) -> Ollama (fallback) -> Cached responses
          const aiResult = await this.hybridAiService.generateResponse(
            message.content,
            {
              restaurantInfo: {
                name: restaurantName,
                phone: restaurantPhone,
                hours: restaurantHours,
                address: restaurantAddress,
                specialties: restaurantSpecialties,
              },
              menuItems: formattedMenuItems,
              categories: categoryNames,
            },
          );

          this.logger.log(`AI Response from ${aiResult.provider} in ${aiResult.responseTime}ms${aiResult.cached ? ' (cached)' : ''}`);
          responseText = aiResult.content;

          // Send AI response back to WhatsApp
          result = await this.whatsappService.sendTextMessage(
            message.from,
            aiResponse,
          );
        } else {
          // Restaurant is CLOSED - Send closed message
          this.logger.log("Restaurant is CLOSED - Sending closed message");

          const closedMessage = this.businessHoursService.getClosedMessage();
          responseText = closedMessage;

          // Check if we should use WhatsApp template
          if (this.businessHoursService.shouldUseTemplate()) {
            const templateName = this.businessHoursService.getTemplateName();
            this.logger.log(`Sending template message: ${templateName}`);

            result = await this.whatsappService.sendTemplateMessage(
              message.from,
              templateName!,
            );
          } else {
            // Send regular text message with closed hours info
            result = await this.whatsappService.sendTextMessage(
              message.from,
              closedMessage,
            );
          }
        }

        if (result.success) {
          this.logger.log(`Response sent successfully: ${result.messageId}`);
        } else {
          this.logger.error(`Failed to send response: ${result.error}`);
        }

        // ====================================
        // SAVE BOT RESPONSE TO DATABASE
        // ====================================
        if (conversation) {
          try {
            await this.conversationsService.addMessage(conversation.id, {
              content: responseText,
              sender: 'bot',
              metadata: {
                whatsapp_message_id: result.messageId,
                success: result.success,
              },
            });
            this.logger.log(`Bot response saved to conversation ${conversation.session_id}`);
          } catch (dbError) {
            this.logger.error(`Error saving bot response: ${dbError.message}`);
          }
        }

        // Notify admin panel via WebSocket
        this.websocketGateway.notifyWhatsAppMessage({
          from: message.from,
          message: message.content,
          response: responseText,
          timestamp: message.timestamp,
          success: result.success,
          conversationId: conversation?.id,
          customerId: customer?.id,
        });
      }

      return { status: "success", processed: messages.length };
    } catch (error) {
      this.logger.error("Webhook processing error:", error.message);
      throw new HttpException(
        "Failed to process webhook",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post("send-message")
  async sendMessage(@Body() dto: SendMessageDto) {
    try {
      let result;

      switch (dto.type) {
        case "menu":
          // TODO: Get menu items from database
          const menuItems = [
            {
              id: 1,
              name: "Pizza Margherita",
              price: 15.99,
              category: "Pizzas",
              description: "Deliciosa pizza con tomate, mozzarella y albahaca",
            },
            {
              id: 2,
              name: "Pasta Carbonara",
              price: 12.99,
              category: "Pastas",
              description: "Pasta cremosa con pancetta y huevo",
            },
            {
              id: 3,
              name: "Tiramisu",
              price: 6.99,
              category: "Postres",
              description: "Postre italiano tradicional",
            },
          ];
          result = await this.whatsappService.sendRestaurantMenu(
            dto.to,
            menuItems,
          );
          break;

        case "reservation":
          result = await this.whatsappService.sendReservationOptions(dto.to);
          break;

        case "order":
          result = await this.whatsappService.sendOrderOptions(dto.to);
          break;

        case "buttons":
          result = await this.whatsappService.sendButtonMessage(
            dto.to,
            dto.message,
            [
              { id: "option_1", title: "Opción 1" },
              { id: "option_2", title: "Opción 2" },
              { id: "option_3", title: "Opción 3" },
            ],
          );
          break;

        default:
          result = await this.whatsappService.sendTextMessage(
            dto.to,
            dto.message,
          );
          break;
      }

      if (result.success) {
        return {
          success: true,
          messageId: result.messageId,
          message: "Message sent successfully",
        };
      } else {
        throw new HttpException(
          result.error || "Failed to send message",
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      this.logger.error("Send message error:", error.message);
      throw new HttpException(
        "Failed to send WhatsApp message",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("health")
  getHealth() {
    return this.whatsappService.getHealthStatus();
  }

  @Post("test-menu")
  async sendTestMenu(@Body() body: { to: string }) {
    try {
      const testMenuItems = [
        {
          id: 1,
          name: "Pizza Margherita",
          price: 15.99,
          category: "🍕 Pizzas",
          description: "Tomate, mozzarella fresca, albahaca",
        },
        {
          id: 2,
          name: "Pizza Pepperoni",
          price: 17.99,
          category: "🍕 Pizzas",
          description: "Pepperoni, mozzarella, salsa de tomate",
        },
        {
          id: 3,
          name: "Pasta Carbonara",
          price: 12.99,
          category: "🍝 Pastas",
          description: "Pasta cremosa con pancetta y huevo",
        },
        {
          id: 4,
          name: "Pasta Bolognese",
          price: 13.99,
          category: "🍝 Pastas",
          description: "Pasta con salsa de carne tradicional",
        },
        {
          id: 5,
          name: "Tiramisu",
          price: 6.99,
          category: "🍰 Postres",
          description: "Postre italiano con café y mascarpone",
        },
        {
          id: 6,
          name: "Panna Cotta",
          price: 5.99,
          category: "🍰 Postres",
          description: "Postre cremoso con frutos rojos",
        },
        {
          id: 7,
          name: "Coca Cola",
          price: 2.99,
          category: "🥤 Bebidas",
          description: "Bebida gaseosa 330ml",
        },
        {
          id: 8,
          name: "Agua Mineral",
          price: 1.99,
          category: "🥤 Bebidas",
          description: "Agua mineral 500ml",
        },
      ];

      const result = await this.whatsappService.sendRestaurantMenu(
        body.to,
        testMenuItems,
      );

      return {
        success: result.success,
        messageId: result.messageId,
        error: result.error,
      };
    } catch (error) {
      this.logger.error("Test menu error:", error.message);
      throw new HttpException(
        "Failed to send test menu",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post("test-reservation")
  async sendTestReservation(
    @Body() body: { to: string; customerName?: string },
  ) {
    try {
      const result = await this.whatsappService.sendReservationOptions(
        body.to,
        body.customerName,
      );

      return {
        success: result.success,
        messageId: result.messageId,
        error: result.error,
      };
    } catch (error) {
      this.logger.error("Test reservation error:", error.message);
      throw new HttpException(
        "Failed to send test reservation options",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post("test-order")
  async sendTestOrder(@Body() body: { to: string }) {
    try {
      const result = await this.whatsappService.sendOrderOptions(body.to);

      return {
        success: result.success,
        messageId: result.messageId,
        error: result.error,
      };
    } catch (error) {
      this.logger.error("Test order error:", error.message);
      throw new HttpException(
        "Failed to send test order options",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
