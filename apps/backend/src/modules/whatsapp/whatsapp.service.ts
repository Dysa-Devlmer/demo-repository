import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nService } from '../../i18n/i18n.service';
import axios, { AxiosInstance } from 'axios';

export interface WhatsAppMessage {
  messaging_product: 'whatsapp';
  to: string;
  type: 'text' | 'image' | 'document' | 'template' | 'interactive';
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
    type: 'list' | 'button';
    header?: {
      type: 'text' | 'image' | 'document';
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
        type: 'reply';
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
          image?: {
            id: string;
            mime_type: string;
            sha256: string;
            caption?: string;
          };
          audio?: {
            id: string;
            mime_type: string;
            sha256: string;
            voice?: boolean;
          };
          video?: {
            id: string;
            mime_type: string;
            sha256: string;
            caption?: string;
          };
          document?: {
            id: string;
            mime_type: string;
            sha256: string;
            filename?: string;
            caption?: string;
          };
          location?: {
            latitude: number;
            longitude: number;
            name?: string;
            address?: string;
          };
          sticker?: {
            id: string;
            mime_type: string;
            sha256: string;
            animated?: boolean;
          };
          contacts?: Array<{
            name: { formatted_name: string };
            phones?: Array<{ phone: string; type: string }>;
          }>;
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
          status: 'sent' | 'delivered' | 'read' | 'failed';
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
  private readonly apiVersion: string = 'v18.0';

  constructor(
    private configService: ConfigService,
    private readonly i18n: I18nService
  ) {
    this.accessToken = this.configService.get<string>('WA_ACCESS_TOKEN') || '';
    this.phoneNumberId = this.configService.get<string>('WA_BUSINESS_PHONE_ID') || '';
    this.verifyToken = this.configService.get<string>('WA_WEBHOOK_VERIFY_TOKEN') || '';

    if (!this.accessToken || !this.phoneNumberId) {
      this.logger.warn('WhatsApp Business credentials not configured');
    } else {
      this.logger.log(
        `📱 WhatsApp configured: Phone ID=${this.phoneNumberId.substring(0, 8)}... Token=${this.accessToken.substring(0, 20)}...`
      );
    }

    this.httpClient = axios.create({
      baseURL: `https://graph.facebook.com/${this.apiVersion}`,
      timeout: 30000,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'DysaBot/1.0.0',
      },
    });

    this.httpClient.interceptors.request.use((config) => {
      this.logger.debug(`WhatsApp API request: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    });

    this.httpClient.interceptors.response.use(
      (response) => {
        this.logger.debug(`WhatsApp API response: ${response.status}`);
        return response;
      },
      (error) => {
        this.logger.error('WhatsApp API error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    if (mode === 'subscribe' && token === this.verifyToken) {
      this.logger.log('WhatsApp webhook verified successfully');
      return challenge;
    }

    this.logger.error('WhatsApp webhook verification failed');
    return null;
  }

  async sendMessage(
    message: WhatsAppMessage
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!this.accessToken || !this.phoneNumberId) {
        throw new Error(this.i18n.t('errors.whatsappNotConfigured'));
      }

      const response = await this.httpClient.post(`/${this.phoneNumberId}/messages`, message);

      if (response.data && response.data.messages && response.data.messages[0]) {
        const messageId = response.data.messages[0].id;
        this.logger.log(`Message sent successfully: ${messageId}`);

        return {
          success: true,
          messageId,
        };
      }

      throw new Error(this.i18n.t('errors.invalidWhatsappResponse'));
    } catch (error) {
      this.logger.error('Failed to send WhatsApp message:', error.message);

      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }

  async sendTextMessage(
    to: string,
    text: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const message: WhatsAppMessage = {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
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
    footerText?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const message: WhatsAppMessage = {
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'list',
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
        type: 'text',
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
    footerText?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (buttons.length > 3) {
      throw new Error(this.i18n.t('errors.maxButtonsExceeded'));
    }

    const message: WhatsAppMessage = {
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: bodyText,
        },
        action: {
          buttons: buttons.map((button) => ({
            type: 'reply' as const,
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
        type: 'text',
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
    languageCode: string = 'es',
    components?: any[]
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const message: WhatsAppMessage = {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
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
    menuItems: any[]
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const sections = this.buildMenuSections(menuItems);
    const restaurantName = this.configService.get<string>('RESTAURANT_NAME') || 'ChatBotDysa';
    const restaurantDescription =
      this.configService.get<string>('RESTAURANT_DESCRIPTION') || 'Sistema de chatbot inteligente';

    return this.sendInteractiveMenu(
      to,
      '🍽️ ¡Aquí tienes nuestro menú! Selecciona lo que te gustaría ordenar:',
      'Ver Menú',
      sections,
      `${restaurantName} - Menú`,
      restaurantDescription
    );
  }

  async sendReservationOptions(
    to: string,
    customerName?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const greeting = customerName ? `¡Hola ${customerName}!` : '¡Hola!';
    const restaurantName = this.configService.get<string>('RESTAURANT_NAME') || 'ChatBotDysa';

    return this.sendButtonMessage(
      to,
      `${greeting} 📅 ¿Te ayudo con una reserva? Selecciona una opción:`,
      [
        { id: 'new_reservation', title: '🆕 Nueva Reserva' },
        { id: 'check_reservation', title: '🔍 Consultar Reserva' },
        { id: 'modify_reservation', title: '✏️ Modificar Reserva' },
      ],
      `${restaurantName} - Reservas`,
      'También puedes escribir directamente tu consulta'
    );
  }

  async sendOrderOptions(
    to: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const restaurantName = this.configService.get<string>('RESTAURANT_NAME') || 'ChatBotDysa';

    return this.sendButtonMessage(
      to,
      '🛒 ¿Qué tipo de pedido te gustaría hacer?',
      [
        { id: 'delivery_order', title: '🚗 Delivery' },
        { id: 'takeaway_order', title: '🏃 Para llevar' },
        { id: 'view_menu', title: '📋 Ver menú' },
      ],
      `${restaurantName} - Pedidos`,
      'Selecciona tu opción preferida'
    );
  }

  private buildMenuSections(menuItems: any[]): Array<{
    title: string;
    rows: Array<{ id: string; title: string; description?: string }>;
  }> {
    const categories = menuItems.reduce((acc, item) => {
      const category = item.category || 'Otros';
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
          item.description?.substring(0, 70) + (item.description?.length > 70 ? '...' : ''),
      })),
    }));
  }

  /**
   * Process status updates from WhatsApp webhook
   * Returns array of status updates for messages (sent, delivered, read, failed)
   */
  processStatusUpdates(webhookData: WebhookMessage): Array<{
    messageId: string;
    status: 'sent' | 'delivered' | 'read' | 'failed';
    timestamp: Date;
    recipientId: string;
  }> {
    const statusUpdates: Array<{
      messageId: string;
      status: 'sent' | 'delivered' | 'read' | 'failed';
      timestamp: Date;
      recipientId: string;
    }> = [];

    for (const entry of webhookData.entry) {
      for (const change of entry.changes) {
        if (change.value.statuses) {
          for (const status of change.value.statuses) {
            statusUpdates.push({
              messageId: status.id,
              status: status.status,
              timestamp: new Date(parseInt(status.timestamp) * 1000),
              recipientId: status.recipient_id,
            });
          }
        }
      }
    }

    return statusUpdates;
  }

  processWebhookMessage(webhookData: WebhookMessage): Array<{
    from: string;
    messageId: string;
    timestamp: Date;
    type: string;
    content: string;
    interactionData?: any;
    mediaData?: {
      mediaId: string;
      mimeType: string;
      caption?: string;
      filename?: string;
      isVoice?: boolean;
      isAnimated?: boolean;
    };
    locationData?: {
      latitude: number;
      longitude: number;
      name?: string;
      address?: string;
    };
  }> {
    const processedMessages: Array<{
      from: string;
      messageId: string;
      timestamp: Date;
      type: string;
      content: string;
      interactionData?: any;
      mediaData?: {
        mediaId: string;
        mimeType: string;
        caption?: string;
        filename?: string;
        isVoice?: boolean;
        isAnimated?: boolean;
      };
      locationData?: {
        latitude: number;
        longitude: number;
        name?: string;
        address?: string;
      };
    }> = [];

    for (const entry of webhookData.entry) {
      for (const change of entry.changes) {
        if (change.value.messages) {
          for (const message of change.value.messages) {
            let content = '';
            let interactionData: any = undefined;
            let mediaData: any = undefined;
            let locationData: any = undefined;

            switch (message.type) {
              case 'text':
                content = message.text?.body || '';
                break;

              case 'image':
                content = message.image?.caption || '[Imagen recibida]';
                mediaData = {
                  mediaId: message.image?.id,
                  mimeType: message.image?.mime_type,
                  caption: message.image?.caption,
                };
                break;

              case 'audio':
                content = message.audio?.voice ? '[Nota de voz]' : '[Audio recibido]';
                mediaData = {
                  mediaId: message.audio?.id,
                  mimeType: message.audio?.mime_type,
                  isVoice: message.audio?.voice,
                };
                break;

              case 'video':
                content = message.video?.caption || '[Video recibido]';
                mediaData = {
                  mediaId: message.video?.id,
                  mimeType: message.video?.mime_type,
                  caption: message.video?.caption,
                };
                break;

              case 'document':
                content =
                  message.document?.caption ||
                  `[Documento: ${message.document?.filename || 'archivo'}]`;
                mediaData = {
                  mediaId: message.document?.id,
                  mimeType: message.document?.mime_type,
                  caption: message.document?.caption,
                  filename: message.document?.filename,
                };
                break;

              case 'sticker':
                content = '[Sticker]';
                mediaData = {
                  mediaId: message.sticker?.id,
                  mimeType: message.sticker?.mime_type,
                  isAnimated: message.sticker?.animated,
                };
                break;

              case 'location':
                content =
                  message.location?.name || message.location?.address || '[Ubicación compartida]';
                locationData = {
                  latitude: message.location?.latitude,
                  longitude: message.location?.longitude,
                  name: message.location?.name,
                  address: message.location?.address,
                };
                break;

              case 'contacts':
                const contactNames = message.contacts?.map((c) => c.name.formatted_name).join(', ');
                content = `[Contacto: ${contactNames || 'compartido'}]`;
                interactionData = {
                  type: 'contacts',
                  contacts: message.contacts,
                };
                break;

              case 'interactive':
                if (message.interactive?.list_reply) {
                  content = message.interactive.list_reply.title;
                  interactionData = {
                    type: 'list_reply',
                    id: message.interactive.list_reply.id,
                    title: message.interactive.list_reply.title,
                  };
                } else if (message.interactive?.button_reply) {
                  content = message.interactive.button_reply.title;
                  interactionData = {
                    type: 'button_reply',
                    id: message.interactive.button_reply.id,
                    title: message.interactive.button_reply.title,
                  };
                }
                break;

              case 'button':
                content = message.button?.text || '';
                interactionData = {
                  type: 'button',
                  payload: message.button?.payload,
                };
                break;

              default:
                content = `[Mensaje tipo: ${message.type}]`;
            }

            processedMessages.push({
              from: message.from,
              messageId: message.id,
              timestamp: new Date(parseInt(message.timestamp) * 1000),
              type: message.type,
              content,
              interactionData,
              mediaData,
              locationData,
            });
          }
        }
      }
    }

    return processedMessages;
  }

  /**
   * Download media from WhatsApp
   * Step 1: Get media URL using mediaId
   * Step 2: Download the file from that URL
   */
  async downloadMedia(mediaId: string): Promise<{
    success: boolean;
    buffer?: Buffer;
    mimeType?: string;
    error?: string;
  }> {
    try {
      // Step 1: Get media URL
      const mediaResponse = await this.httpClient.get(`/${mediaId}`);
      const mediaUrl = mediaResponse.data?.url;

      if (!mediaUrl) {
        return { success: false, error: 'Media URL not found' };
      }

      this.logger.log(`Downloading media from: ${mediaUrl.substring(0, 50)}...`);

      // Step 2: Download the file (requires auth header)
      const downloadResponse = await axios.get(mediaUrl, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
        responseType: 'arraybuffer',
      });

      return {
        success: true,
        buffer: Buffer.from(downloadResponse.data),
        mimeType: downloadResponse.headers['content-type'] || mediaResponse.data?.mime_type,
      };
    } catch (error) {
      this.logger.error(`Failed to download media ${mediaId}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get media URL (without downloading)
   */
  async getMediaUrl(mediaId: string): Promise<string | null> {
    try {
      const response = await this.httpClient.get(`/${mediaId}`);
      return response.data?.url || null;
    } catch (error) {
      this.logger.error(`Failed to get media URL for ${mediaId}:`, error.message);
      return null;
    }
  }

  async markAsRead(messageId: string): Promise<boolean> {
    try {
      await this.httpClient.post(`/${this.phoneNumberId}/messages`, {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId,
      });

      return true;
    } catch (error) {
      this.logger.error('Failed to mark message as read:', error.message);
      return false;
    }
  }

  getHealthStatus() {
    return {
      service: 'WhatsApp Business API',
      configured: !!(this.accessToken && this.phoneNumberId),
      phoneNumberId: this.phoneNumberId,
      apiVersion: this.apiVersion,
    };
  }

  /**
   * Send an image message (for menu items with photos)
   */
  async sendImageMessage(
    to: string,
    imageUrl: string,
    caption?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const message: WhatsAppMessage = {
      messaging_product: 'whatsapp',
      to,
      type: 'image',
      image: {
        link: imageUrl,
        caption: caption,
      },
    };

    return this.sendMessage(message);
  }

  /**
   * Send menu item with image
   */
  async sendMenuItemWithImage(
    to: string,
    item: {
      name: string;
      description: string;
      price: number;
      imageUrl?: string;
    }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const caption = `🍽️ *${item.name}*\n\n${item.description}\n\n💰 Precio: $${item.price.toLocaleString('es-CL')}`;

    if (item.imageUrl) {
      return this.sendImageMessage(to, item.imageUrl, caption);
    }

    return this.sendTextMessage(to, caption);
  }

  /**
   * Send order confirmation with summary
   */
  async sendOrderConfirmation(
    to: string,
    order: {
      orderNumber: string;
      items: Array<{ name: string; quantity: number; price: number }>;
      subtotal: number;
      tax: number;
      total: number;
      deliveryAddress?: string;
      estimatedTime?: number;
      paymentStatus?: string;
    }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const itemsText = order.items
      .map(
        (item) =>
          `• ${item.quantity}x ${item.name} - $${(item.price * item.quantity).toLocaleString('es-CL')}`
      )
      .join('\n');

    let message = `✅ *PEDIDO CONFIRMADO*\n\n`;
    message += `📋 Pedido #${order.orderNumber}\n\n`;
    message += `*Detalle:*\n${itemsText}\n\n`;
    message += `─────────────\n`;
    message += `Subtotal: $${order.subtotal.toLocaleString('es-CL')}\n`;
    message += `IVA (19%): $${order.tax.toLocaleString('es-CL')}\n`;
    message += `*TOTAL: $${order.total.toLocaleString('es-CL')}*\n`;
    message += `─────────────\n\n`;

    if (order.deliveryAddress) {
      message += `📍 Dirección: ${order.deliveryAddress}\n`;
    }

    if (order.estimatedTime) {
      message += `⏱️ Tiempo estimado: ${order.estimatedTime} minutos\n`;
    }

    if (order.paymentStatus) {
      const paymentEmoji = order.paymentStatus === 'paid' ? '✅' : '⏳';
      const paymentText = order.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente';
      message += `${paymentEmoji} Estado de pago: ${paymentText}\n`;
    }

    message += `\n¡Gracias por tu pedido! 🙏`;

    return this.sendTextMessage(to, message);
  }

  /**
   * Send order status update
   */
  async sendOrderStatusUpdate(
    to: string,
    orderNumber: string,
    status: 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled',
    additionalInfo?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const statusMessages: Record<string, { emoji: string; text: string }> = {
      confirmed: { emoji: '✅', text: 'Tu pedido ha sido confirmado' },
      preparing: { emoji: '👨‍🍳', text: 'Tu pedido está siendo preparado' },
      ready: { emoji: '🍽️', text: '¡Tu pedido está listo!' },
      delivered: { emoji: '📦', text: 'Tu pedido ha sido entregado' },
      cancelled: { emoji: '❌', text: 'Tu pedido ha sido cancelado' },
    };

    const statusInfo = statusMessages[status];
    let message = `${statusInfo.emoji} *Actualización de Pedido*\n\n`;
    message += `Pedido #${orderNumber}\n`;
    message += `${statusInfo.text}\n`;

    if (additionalInfo) {
      message += `\n${additionalInfo}`;
    }

    if (status === 'ready') {
      message += `\n\n🏃 ¡Te esperamos para recoger tu pedido!`;
    }

    return this.sendTextMessage(to, message);
  }

  /**
   * Send reservation confirmation
   */
  async sendReservationConfirmation(
    to: string,
    reservation: {
      code: string;
      customerName: string;
      date: string;
      time: string;
      partySize: number;
      notes?: string;
    }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const restaurantName = this.configService.get<string>('RESTAURANT_NAME') || 'ChatBotDysa';

    let message = `✅ *RESERVA CONFIRMADA*\n\n`;
    message += `Hola ${reservation.customerName}!\n\n`;
    message += `Tu reserva en *${restaurantName}* está confirmada:\n\n`;
    message += `📋 Código: ${reservation.code}\n`;
    message += `📅 Fecha: ${reservation.date}\n`;
    message += `🕐 Hora: ${reservation.time}\n`;
    message += `👥 Personas: ${reservation.partySize}\n`;

    if (reservation.notes) {
      message += `📝 Notas: ${reservation.notes}\n`;
    }

    message += `\n¡Te esperamos! 🎉`;

    return this.sendTextMessage(to, message);
  }

  /**
   * Send reservation reminder
   */
  async sendReservationReminder(
    to: string,
    reservation: {
      code: string;
      customerName: string;
      date: string;
      time: string;
      partySize: number;
    }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const restaurantName = this.configService.get<string>('RESTAURANT_NAME') || 'ChatBotDysa';

    return this.sendButtonMessage(
      to,
      `⏰ *Recordatorio de Reserva*\n\nHola ${reservation.customerName}!\n\nTe recordamos tu reserva en *${restaurantName}*:\n\n📅 ${reservation.date} a las ${reservation.time}\n👥 ${reservation.partySize} personas\n\n¿Confirmas tu asistencia?`,
      [
        { id: `confirm_${reservation.code}`, title: '✅ Confirmo' },
        { id: `cancel_${reservation.code}`, title: '❌ Cancelar' },
        { id: `modify_${reservation.code}`, title: '✏️ Modificar' },
      ],
      `${restaurantName} - Recordatorio`,
      `Código: ${reservation.code}`
    );
  }

  /**
   * Send payment confirmation
   */
  async sendPaymentConfirmation(
    to: string,
    payment: {
      orderNumber: string;
      amount: number;
      currency: string;
      method: string;
      transactionId: string;
    }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    let message = `💳 *PAGO CONFIRMADO*\n\n`;
    message += `Pedido #${payment.orderNumber}\n\n`;
    message += `✅ Monto: $${payment.amount.toLocaleString('es-CL')} ${payment.currency}\n`;
    message += `💳 Método: ${payment.method}\n`;
    message += `🔑 ID Transacción: ${payment.transactionId}\n\n`;
    message += `¡Gracias por tu pago! Tu pedido será procesado inmediatamente. 🚀`;

    return this.sendTextMessage(to, message);
  }

  /**
   * Send satisfaction survey after order delivery
   */
  async sendSatisfactionSurvey(
    to: string,
    orderNumber: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const restaurantName = this.configService.get<string>('RESTAURANT_NAME') || 'ChatBotDysa';

    return this.sendButtonMessage(
      to,
      `⭐ *Tu opinión es importante*\n\n¿Cómo fue tu experiencia con el pedido #${orderNumber}?\n\nTu feedback nos ayuda a mejorar.`,
      [
        { id: `rating_5_${orderNumber}`, title: '⭐⭐⭐⭐⭐ Excelente' },
        { id: `rating_3_${orderNumber}`, title: '⭐⭐⭐ Regular' },
        { id: `rating_1_${orderNumber}`, title: '⭐ Malo' },
      ],
      `${restaurantName} - Encuesta`,
      'Responde tocando un botón'
    );
  }
}
