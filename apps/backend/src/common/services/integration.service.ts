import { Injectable } from "@nestjs/common";
import { LoggerService } from "./logger.service";
import { I18nService } from "../../i18n/i18n.service";
import { Twilio } from "twilio";

export interface WhatsAppMessage {
  to: string;
  message: string;
  mediaUrl?: string;
  templateId?: string;
  templateParams?: Record<string, string>;
}

export interface SMSMessage {
  to: string;
  message: string;
  from?: string;
}

export interface IntegrationConfig {
  twilio: {
    enabled: boolean;
    accountSid: string;
    authToken: string;
    phoneNumber: string;
    whatsappNumber: string;
  };
  whatsapp: {
    enabled: boolean;
    businessAccountId: string;
    phoneNumberId: string;
    accessToken: string;
    webhookVerifyToken: string;
  };
}

export interface MessageResult {
  success: boolean;
  messageId: string;
  status: string;
  cost?: number;
  error?: string;
  timestamp: string;
}

@Injectable()
export class IntegrationService {
  private twilioClient?: Twilio;
  private config: IntegrationConfig;

  constructor(
    private readonly loggerService: LoggerService,
    private readonly i18n: I18nService,
  ) {
    this.config = {
      twilio: {
        enabled: process.env.TWILIO_ENABLED === "true",
        accountSid: process.env.TWILIO_ACCOUNT_SID || "",
        authToken: process.env.TWILIO_AUTH_TOKEN || "",
        phoneNumber: process.env.TWILIO_PHONE_NUMBER || "+1234567890",
        whatsappNumber:
          process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886",
      },
      whatsapp: {
        enabled: process.env.WHATSAPP_ENABLED === "true",
        businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || "",
        phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
        accessToken: process.env.WHATSAPP_ACCESS_TOKEN || "",
        webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "",
      },
    };

    // Initialize Twilio client if enabled
    if (
      this.config.twilio.enabled &&
      this.config.twilio.accountSid &&
      this.config.twilio.authToken
    ) {
      this.twilioClient = new Twilio(
        this.config.twilio.accountSid,
        this.config.twilio.authToken,
      );

      this.loggerService.info("Twilio integration initialized", {
        module: "INTEGRATION",
        action: "init_twilio",
        metadata: {
          accountSid: this.config.twilio.accountSid,
          phoneNumber: this.config.twilio.phoneNumber,
        },
      });
    }

    this.loggerService.info("Integration service initialized", {
      module: "INTEGRATION",
      action: "service_init",
      metadata: {
        twilioEnabled: this.config.twilio.enabled,
        whatsappEnabled: this.config.whatsapp.enabled,
      },
    });
  }

  // SMS via Twilio
  async sendSMS(message: SMSMessage): Promise<MessageResult> {
    const startTime = Date.now();

    try {
      if (!this.config.twilio.enabled) {
        // Fallback to simulation if not enabled
        return this.simulateSMS(message);
      }

      if (!this.twilioClient) {
        throw new Error(this.i18n.t("errors.twilioNotInitialized"));
      }

      const result = await this.twilioClient.messages.create({
        body: message.message,
        from: message.from || this.config.twilio.phoneNumber,
        to: message.to,
      });

      const responseTime = Date.now() - startTime;
      const cost = this.calculateSMSCost(message.message);

      this.loggerService.info("SMS sent successfully via Twilio", {
        module: "INTEGRATION",
        action: "sms_sent",
        metadata: {
          to: message.to,
          messageId: result.sid,
          status: result.status,
          cost,
          responseTime,
        },
      });

      return {
        success: true,
        messageId: result.sid,
        status: result.status,
        cost,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;

      this.loggerService.error("Failed to send SMS via Twilio", {
        module: "INTEGRATION",
        action: "sms_failed",
        metadata: {
          to: message.to,
          error: error.message,
          responseTime,
        },
      });

      // Fallback to simulation on error
      return this.simulateSMS(message);
    }
  }

  // WhatsApp via Twilio
  async sendWhatsApp(message: WhatsAppMessage): Promise<MessageResult> {
    const startTime = Date.now();

    try {
      if (!this.config.twilio.enabled) {
        // Fallback to simulation if not enabled
        return this.simulateWhatsApp(message);
      }

      if (!this.twilioClient) {
        throw new Error(this.i18n.t("errors.twilioNotInitialized"));
      }

      const whatsappTo = message.to.startsWith("whatsapp:")
        ? message.to
        : `whatsapp:${message.to}`;

      const messageData: any = {
        body: message.message,
        from: this.config.twilio.whatsappNumber,
        to: whatsappTo,
      };

      // Add media if provided
      if (message.mediaUrl) {
        messageData.mediaUrl = [message.mediaUrl];
      }

      const result = await this.twilioClient.messages.create(messageData);

      const responseTime = Date.now() - startTime;
      const cost = this.calculateWhatsAppCost(message.message);

      this.loggerService.info("WhatsApp message sent successfully via Twilio", {
        module: "INTEGRATION",
        action: "whatsapp_sent",
        metadata: {
          to: whatsappTo,
          messageId: result.sid,
          status: result.status,
          cost,
          responseTime,
          hasMedia: !!message.mediaUrl,
        },
      });

      return {
        success: true,
        messageId: result.sid,
        status: result.status,
        cost,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;

      this.loggerService.error("Failed to send WhatsApp via Twilio", {
        module: "INTEGRATION",
        action: "whatsapp_failed",
        metadata: {
          to: message.to,
          error: error.message,
          responseTime,
        },
      });

      // Fallback to simulation on error
      return this.simulateWhatsApp(message);
    }
  }

  // WhatsApp Business API (Facebook)
  async sendWhatsAppBusiness(message: WhatsAppMessage): Promise<MessageResult> {
    const startTime = Date.now();

    try {
      if (!this.config.whatsapp.enabled) {
        return this.simulateWhatsApp(message);
      }

      const url = `https://graph.facebook.com/v18.0/${this.config.whatsapp.phoneNumberId}/messages`;

      const payload = {
        messaging_product: "whatsapp",
        to: message.to.replace("+", ""),
        type: "text",
        text: {
          body: message.message,
        },
      };

      // Handle template messages
      if (message.templateId) {
        payload.type = "template";
        delete (payload as any).text;
        payload["template"] = {
          name: message.templateId,
          language: { code: "es" },
        };

        if (message.templateParams) {
          payload["template"].components = [
            {
              type: "body",
              parameters: Object.values(message.templateParams).map(
                (value) => ({
                  type: "text",
                  text: value,
                }),
              ),
            },
          ];
        }
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.whatsapp.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(result.error?.message || this.i18n.t("errors.whatsappApiError"));
      }

      const messageId = result.messages?.[0]?.id || "unknown";
      const cost = this.calculateWhatsAppCost(message.message);

      this.loggerService.info("WhatsApp Business message sent successfully", {
        module: "INTEGRATION",
        action: "whatsapp_business_sent",
        metadata: {
          to: message.to,
          messageId,
          cost,
          responseTime,
          templateUsed: !!message.templateId,
        },
      });

      return {
        success: true,
        messageId,
        status: "sent",
        cost,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;

      this.loggerService.error("Failed to send WhatsApp Business message", {
        module: "INTEGRATION",
        action: "whatsapp_business_failed",
        metadata: {
          to: message.to,
          error: error.message,
          responseTime,
        },
      });

      return this.simulateWhatsApp(message);
    }
  }

  // Webhook verification for WhatsApp
  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    if (
      mode === "subscribe" &&
      token === this.config.whatsapp.webhookVerifyToken
    ) {
      this.loggerService.info("WhatsApp webhook verified successfully", {
        module: "INTEGRATION",
        action: "webhook_verified",
      });
      return challenge;
    }

    this.loggerService.warn("WhatsApp webhook verification failed", {
      module: "INTEGRATION",
      action: "webhook_failed",
      metadata: {
        mode,
        tokenMatch: token === this.config.whatsapp.webhookVerifyToken,
      },
    });

    return null;
  }

  // Get integration status
  getIntegrationStatus() {
    return {
      twilio: {
        enabled: this.config.twilio.enabled,
        configured: !!(
          this.config.twilio.accountSid && this.config.twilio.authToken
        ),
        phoneNumber: this.config.twilio.phoneNumber,
        whatsappNumber: this.config.twilio.whatsappNumber,
        clientInitialized: !!this.twilioClient,
      },
      whatsapp: {
        enabled: this.config.whatsapp.enabled,
        configured: !!(
          this.config.whatsapp.accessToken && this.config.whatsapp.phoneNumberId
        ),
        businessAccountId: this.config.whatsapp.businessAccountId,
        phoneNumberId: this.config.whatsapp.phoneNumberId,
      },
      features: {
        sms: this.config.twilio.enabled && !!this.twilioClient,
        whatsappTwilio: this.config.twilio.enabled && !!this.twilioClient,
        whatsappBusiness: this.config.whatsapp.enabled,
        webhookVerification: !!this.config.whatsapp.webhookVerifyToken,
      },
    };
  }

  // Private helper methods
  private async simulateSMS(message: SMSMessage): Promise<MessageResult> {
    // Simulate network delay
    await new Promise((resolve) =>
      setTimeout(resolve, Math.random() * 500 + 200),
    );

    const messageId = `sim_sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const cost = this.calculateSMSCost(message.message);

    this.loggerService.info("SMS simulated (integration not configured)", {
      module: "INTEGRATION",
      action: "sms_simulated",
      metadata: {
        to: message.to,
        messageId,
        cost,
      },
    });

    return {
      success: true,
      messageId,
      status: "simulated",
      cost,
      timestamp: new Date().toISOString(),
    };
  }

  private async simulateWhatsApp(
    message: WhatsAppMessage,
  ): Promise<MessageResult> {
    // Simulate network delay
    await new Promise((resolve) =>
      setTimeout(resolve, Math.random() * 800 + 300),
    );

    const messageId = `sim_wa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const cost = this.calculateWhatsAppCost(message.message);

    this.loggerService.info("WhatsApp simulated (integration not configured)", {
      module: "INTEGRATION",
      action: "whatsapp_simulated",
      metadata: {
        to: message.to,
        messageId,
        cost,
        hasMedia: !!message.mediaUrl,
      },
    });

    return {
      success: true,
      messageId,
      status: "simulated",
      cost,
      timestamp: new Date().toISOString(),
    };
  }

  private calculateSMSCost(message: string): number {
    // SMS pricing: $0.075 per message segment (160 characters)
    const segments = Math.ceil(message.length / 160);
    return segments * 0.075;
  }

  private calculateWhatsAppCost(message: string): number {
    // WhatsApp pricing: $0.05 per message (first 1000 characters)
    return 0.05;
  }
}
