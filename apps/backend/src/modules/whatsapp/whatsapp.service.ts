import { Injectable, Logger, HttpException, HttpStatus } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { I18nService } from "../../i18n/i18n.service";
import axios, { AxiosInstance } from "axios";

export interface WhatsAppMessage {
  messaging_product: "whatsapp";
  to: string;
  type: "text" | "image" | "document" | "template" | "interactive";
  text?: {
    body: string;
  };
  image?: {
    link?: string;
    id?: string;
    caption?: string;
  };
  document?: {
    link?: string;
    id?: string;
    filename?: string;
    caption?: string;
  };
  template?: {
    name: string;
    language: {
      code: string;
    };
    components?: any[];
  };
  interactive?: {
    type: "list" | "button";
    header?: {
      type: "text" | "image" | "document";
      text?: string;
      image?: { link: string };
      document?: { link: string };
    };
    body: {
      text: string;
    };
    footer?: {
      text: string;
    };
    action: {
      button?: string;
      buttons?: Array<{
        type: "reply";
        reply: {
          id: string;
          title: string;
        };
      }>;
      sections?: Array<{
        title: string;
        rows: Array<{
          id: string;
          title: string;
          description?: string;
        }>;
      }>;
    };
  };
}

export interface WebhookMessage {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        messages?: Array<{
          from: string;
          id: string;
          timestamp: string;
          type: string;
          text?: {
            body: string;
          };
          interactive?: {
            type: string;
            list_reply?: {
              id: string;
              title: string;
            };
            button_reply?: {
              id: string;
              title: string;
            };
          };
          button?: {
            payload: string;
            text: string;
          };
        }>;
        statuses?: Array<{
          id: string;
          status: "sent" | "delivered" | "read" | "failed";
          timestamp: string;
          recipient_id: string;
        }>;
      };
      field: string;
    }>;
  }>;
}

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  private readonly httpClient: AxiosInstance;
  private readonly accessToken: string;
  private readonly phoneNumberId: string;
  private readonly verifyToken: string;
  private readonly apiVersion: string = "v18.0";

  constructor(
    private configService: ConfigService,
    private readonly i18n: I18nService,
  ) {
    this.accessToken = this.configService.get<string>("WA_ACCESS_TOKEN") || "";
    this.phoneNumberId =
      this.configService.get<string>("WA_BUSINESS_PHONE_ID") || "";
    this.verifyToken =
      this.configService.get<string>("WA_WEBHOOK_VERIFY_TOKEN") || "";

    if (!this.accessToken || !this.phoneNumberId) {
      this.logger.warn("WhatsApp Business credentials not configured");
    } else {
      this.logger.log(`📱 WhatsApp configured: Phone ID=${this.phoneNumberId.substring(0, 8)}... Token=${this.accessToken.substring(0, 20)}...`);
    }

    this.httpClient = axios.create({
      baseURL: `https://graph.facebook.com/${this.apiVersion}`,
      timeout: 30000,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
        "User-Agent": "DysaBot/1.0.0",
      },
    });

    this.httpClient.interceptors.request.use((config) => {
      this.logger.debug(
        `WhatsApp API request: ${config.method?.toUpperCase()} ${config.url}`,
      );
      return config;
    });

    this.httpClient.interceptors.response.use(
      (response) => {
        this.logger.debug(`WhatsApp API response: ${response.status}`);
        return response;
      },
      (error) => {
        this.logger.error(
          "WhatsApp API error:",
          error.response?.data || error.message,
        );
        return Promise.reject(error);
      },
    );
  }

  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    if (mode === "subscribe" && token === this.verifyToken) {
      this.logger.log("WhatsApp webhook verified successfully");
      return challenge;
    }

    this.logger.error("WhatsApp webhook verification failed");
    return null;
  }

  async sendMessage(
    message: WhatsAppMessage,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!this.accessToken || !this.phoneNumberId) {
        throw new Error(this.i18n.t("errors.whatsappNotConfigured"));
      }

      const response = await this.httpClient.post(
        `/${this.phoneNumberId}/messages`,
        message,
      );

      if (
        response.data &&
        response.data.messages &&
        response.data.messages[0]
      ) {
        const messageId = response.data.messages[0].id;
        this.logger.log(`Message sent successfully: ${messageId}`);

        return {
          success: true,
          messageId,
        };
      }

      throw new Error(this.i18n.t("errors.invalidWhatsappResponse"));
    } catch (error) {
      this.logger.error("Failed to send WhatsApp message:", error.message);

      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }

  async sendTextMessage(
    to: string,
    text: string,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const message: WhatsAppMessage = {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: {
        body: text,
      },
    };

    return this.sendMessage(message);
  }

  async sendInteractiveMenu(
    to: string,
    bodyText: string,
    buttonText: string,
    sections: Array<{
      title: string;
      rows: Array<{
        id: string;
        title: string;
        description?: string;
      }>;
    }>,
    headerText?: string,
    footerText?: string,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const message: WhatsAppMessage = {
      messaging_product: "whatsapp",
      to,
      type: "interactive",
      interactive: {
        type: "list",
        body: {
          text: bodyText,
        },
        action: {
          button: buttonText,
          sections,
        },
      },
    };

    if (headerText) {
      message.interactive!.header = {
        type: "text",
        text: headerText,
      };
    }

    if (footerText) {
      message.interactive!.footer = {
        text: footerText,
      };
    }

    return this.sendMessage(message);
  }

  async sendButtonMessage(
    to: string,
    bodyText: string,
    buttons: Array<{
      id: string;
      title: string;
    }>,
    headerText?: string,
    footerText?: string,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (buttons.length > 3) {
      throw new Error(this.i18n.t("errors.maxButtonsExceeded"));
    }

    const message: WhatsAppMessage = {
      messaging_product: "whatsapp",
      to,
      type: "interactive",
      interactive: {
        type: "button",
        body: {
          text: bodyText,
        },
        action: {
          buttons: buttons.map((button) => ({
            type: "reply" as const,
            reply: {
              id: button.id,
              title: button.title,
            },
          })),
        },
      },
    };

    if (headerText) {
      message.interactive!.header = {
        type: "text",
        text: headerText,
      };
    }

    if (footerText) {
      message.interactive!.footer = {
        text: footerText,
      };
    }

    return this.sendMessage(message);
  }

  async sendTemplateMessage(
    to: string,
    templateName: string,
    languageCode: string = "es",
    components?: any[],
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const message: WhatsAppMessage = {
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: templateName,
        language: {
          code: languageCode,
        },
        components: components || [],
      },
    };

    return this.sendMessage(message);
  }

  async sendRestaurantMenu(
    to: string,
    menuItems: any[],
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const sections = this.buildMenuSections(menuItems);
    const restaurantName = this.configService.get<string>("RESTAURANT_NAME") || "ChatBotDysa";
    const restaurantDescription = this.configService.get<string>("RESTAURANT_DESCRIPTION") || "Sistema de chatbot inteligente";

    return this.sendInteractiveMenu(
      to,
      "🍽️ ¡Aquí tienes nuestro menú! Selecciona lo que te gustaría ordenar:",
      "Ver Menú",
      sections,
      `${restaurantName} - Menú`,
      restaurantDescription,
    );
  }

  async sendReservationOptions(
    to: string,
    customerName?: string,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const greeting = customerName ? `¡Hola ${customerName}!` : "¡Hola!";
    const restaurantName = this.configService.get<string>("RESTAURANT_NAME") || "ChatBotDysa";

    return this.sendButtonMessage(
      to,
      `${greeting} 📅 ¿Te ayudo con una reserva? Selecciona una opción:`,
      [
        { id: "new_reservation", title: "🆕 Nueva Reserva" },
        { id: "check_reservation", title: "🔍 Consultar Reserva" },
        { id: "modify_reservation", title: "✏️ Modificar Reserva" },
      ],
      `${restaurantName} - Reservas`,
      "También puedes escribir directamente tu consulta",
    );
  }

  async sendOrderOptions(
    to: string,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const restaurantName = this.configService.get<string>("RESTAURANT_NAME") || "ChatBotDysa";

    return this.sendButtonMessage(
      to,
      "🛒 ¿Qué tipo de pedido te gustaría hacer?",
      [
        { id: "delivery_order", title: "🚗 Delivery" },
        { id: "takeaway_order", title: "🏃 Para llevar" },
        { id: "view_menu", title: "📋 Ver menú" },
      ],
      `${restaurantName} - Pedidos`,
      "Selecciona tu opción preferida",
    );
  }

  private buildMenuSections(menuItems: any[]): Array<{
    title: string;
    rows: Array<{ id: string; title: string; description?: string }>;
  }> {
    const categories = menuItems.reduce((acc, item) => {
      const category = item.category || "Otros";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {});

    return Object.entries(categories).map(([categoryName, items]) => ({
      title: categoryName,
      rows: (items as any[]).slice(0, 10).map((item) => ({
        id: `menu_${item.id}`,
        title: `${item.name} - $${item.price}`,
        description:
          item.description?.substring(0, 70) +
          (item.description?.length > 70 ? "..." : ""),
      })),
    }));
  }

  processWebhookMessage(webhookData: WebhookMessage): Array<{
    from: string;
    messageId: string;
    timestamp: Date;
    type: string;
    content: string;
    interactionData?: any;
  }> {
    const processedMessages: Array<{
      from: string;
      messageId: string;
      timestamp: Date;
      type: string;
      content: string;
      interactionData?: any;
    }> = [];

    for (const entry of webhookData.entry) {
      for (const change of entry.changes) {
        if (change.value.messages) {
          for (const message of change.value.messages) {
            let content = "";
            let interactionData: any = undefined;

            switch (message.type) {
              case "text":
                content = message.text?.body || "";
                break;
              case "interactive":
                if (message.interactive?.list_reply) {
                  content = message.interactive.list_reply.title;
                  interactionData = {
                    type: "list_reply",
                    id: message.interactive.list_reply.id,
                    title: message.interactive.list_reply.title,
                  };
                } else if (message.interactive?.button_reply) {
                  content = message.interactive.button_reply.title;
                  interactionData = {
                    type: "button_reply",
                    id: message.interactive.button_reply.id,
                    title: message.interactive.button_reply.title,
                  };
                }
                break;
              case "button":
                content = message.button?.text || "";
                interactionData = {
                  type: "button",
                  payload: message.button?.payload,
                };
                break;
            }

            processedMessages.push({
              from: message.from,
              messageId: message.id,
              timestamp: new Date(parseInt(message.timestamp) * 1000),
              type: message.type,
              content,
              interactionData,
            });
          }
        }
      }
    }

    return processedMessages;
  }

  async markAsRead(messageId: string): Promise<boolean> {
    try {
      await this.httpClient.post(`/${this.phoneNumberId}/messages`, {
        messaging_product: "whatsapp",
        status: "read",
        message_id: messageId,
      });

      return true;
    } catch (error) {
      this.logger.error("Failed to mark message as read:", error.message);
      return false;
    }
  }

  getHealthStatus() {
    return {
      service: "WhatsApp Business API",
      configured: !!(this.accessToken && this.phoneNumberId),
      phoneNumberId: this.phoneNumberId,
      apiVersion: this.apiVersion,
    };
  }
}
