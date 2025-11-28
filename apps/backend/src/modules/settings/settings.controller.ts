import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { SettingsService, SystemSettings } from "./settings.service";
import { WhatsAppService } from "../whatsapp/whatsapp.service";

@Controller("settings")
export class SettingsController {
  private readonly logger = new Logger(SettingsController.name);

  constructor(
    private readonly settingsService: SettingsService,
    private readonly whatsappService: WhatsAppService,
  ) {}

  @Get()
  async getSettings() {
    try {
      const settings = await this.settingsService.getSettings();
      return {
        success: true,
        data: settings,
      };
    } catch (error) {
      this.logger.error("Error getting settings:", error.message);
      throw new HttpException(
        "Error al obtener las configuraciones",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put()
  async updateSettings(@Body() settings: Partial<SystemSettings>) {
    try {
      const result = await this.settingsService.updateSettings(settings);

      if (result.success) {
        return {
          success: true,
          message: result.message,
        };
      } else {
        throw new HttpException(result.message, HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      this.logger.error("Error updating settings:", error.message);
      throw new HttpException(
        "Error al actualizar las configuraciones",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post("test/:service")
  async testConnection(@Param("service") service: string) {
    try {
      if (!["whatsapp", "twilio", "ollama", "database"].includes(service)) {
        throw new HttpException("Servicio no válido", HttpStatus.BAD_REQUEST);
      }

      const result = await this.settingsService.testConnection(
        service as "whatsapp" | "twilio" | "ollama" | "database",
      );

      return {
        success: result.success,
        status: result.status,
        message: result.message,
      };
    } catch (error) {
      this.logger.error(`Error testing ${service} connection:`, error.message);
      throw new HttpException(
        `Error al probar conexión con ${service}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("whatsapp/health")
  getWhatsAppHealth() {
    try {
      const health = this.whatsappService.getHealthStatus();
      return {
        success: true,
        data: health,
      };
    } catch (error) {
      this.logger.error("Error getting WhatsApp health:", error.message);
      throw new HttpException(
        "Error al obtener el estado de WhatsApp",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post("whatsapp/test-message")
  async testWhatsAppMessage(@Body() body: { to: string; message?: string }) {
    try {
      if (!body.to) {
        throw new HttpException(
          "Número de teléfono requerido",
          HttpStatus.BAD_REQUEST,
        );
      }

      const message =
        body.message ||
        "🤖 ¡Hola! Este es un mensaje de prueba desde DysaBot. ¡Tu WhatsApp está configurado correctamente! 🎉";

      const result = await this.whatsappService.sendTextMessage(
        body.to,
        message,
      );

      if (result.success) {
        return {
          success: true,
          message: "Mensaje de prueba enviado correctamente",
          messageId: result.messageId,
        };
      } else {
        throw new HttpException(
          result.error || "Error al enviar mensaje de prueba",
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      this.logger.error("Error sending WhatsApp test message:", error.message);
      throw new HttpException(
        "Error al enviar mensaje de prueba",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post("whatsapp/test-menu")
  async testWhatsAppMenu(@Body() body: { to: string }) {
    try {
      if (!body.to) {
        throw new HttpException(
          "Número de teléfono requerido",
          HttpStatus.BAD_REQUEST,
        );
      }

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
          name: "Pasta Carbonara",
          price: 12.99,
          category: "🍝 Pastas",
          description: "Pasta cremosa con pancetta y huevo",
        },
        {
          id: 3,
          name: "Tiramisu",
          price: 6.99,
          category: "🍰 Postres",
          description: "Postre italiano con café y mascarpone",
        },
      ];

      const result = await this.whatsappService.sendRestaurantMenu(
        body.to,
        testMenuItems,
      );

      if (result.success) {
        return {
          success: true,
          message: "Menú de prueba enviado correctamente",
          messageId: result.messageId,
        };
      } else {
        throw new HttpException(
          result.error || "Error al enviar menú de prueba",
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      this.logger.error("Error sending WhatsApp test menu:", error.message);
      throw new HttpException(
        "Error al enviar menú de prueba",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
