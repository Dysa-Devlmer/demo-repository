import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { I18nService } from "../../i18n/i18n.service";
import { Twilio } from "twilio";

export interface TwilioCallOptions {
  to: string;
  from: string;
  timeout?: number;
  record?: boolean;
  machineDetection?: string;
  twiml?: string;
  url?: string;
  statusCallback?: string;
  statusCallbackMethod?: string;
}

export interface TwilioSMSOptions {
  to: string;
  from: string;
  body: string;
  mediaUrl?: string[];
  statusCallback?: string;
}

export interface WebhookBody {
  Digits?: string;
  RecordingUrl?: string;
  From?: string;
  CallSid?: string;
  [key: string]: unknown;
}

export interface VoiceCallOptions {
  to: string;
  from?: string;
  url?: string;
  twiml?: string;
  statusCallback?: string;
  statusCallbackMethod?: "GET" | "POST";
  record?: boolean;
  timeout?: number;
  machineDetection?: "Enable" | "DetectMessageEnd";
}

export interface SMSOptions {
  to: string;
  from?: string;
  body: string;
  mediaUrl?: string[];
  statusCallback?: string;
}

export interface CallStatus {
  sid: string;
  status:
    | "queued"
    | "initiated"
    | "ringing"
    | "answered"
    | "completed"
    | "busy"
    | "failed"
    | "no-answer"
    | "canceled";
  duration?: string;
  startTime?: Date;
  endTime?: Date;
  price?: string;
  direction: "inbound" | "outbound";
}

@Injectable()
export class TwilioService {
  private readonly logger = new Logger(TwilioService.name);
  private readonly twilioClient: Twilio;
  private readonly accountSid: string;
  private readonly authToken: string;
  private readonly phoneNumber: string;
  private readonly webhookUrl: string;

  constructor(
    private configService: ConfigService,
    private readonly i18n: I18nService,
  ) {
    this.accountSid =
      this.configService.get<string>("TWILIO_ACCOUNT_SID") || "";
    this.authToken = this.configService.get<string>("TWILIO_AUTH_TOKEN") || "";
    this.phoneNumber =
      this.configService.get<string>("TWILIO_PHONE_NUMBER") || "";
    this.webhookUrl = this.configService.get<string>("TWILIO_WEBHOOK_URL", "");

    if (!this.accountSid || !this.authToken || !this.phoneNumber) {
      this.logger.warn("Twilio credentials not configured");
      return;
    }

    try {
      this.twilioClient = new Twilio(this.accountSid, this.authToken);
      this.logger.log("Twilio client initialized successfully");
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error("Failed to initialize Twilio client:", err.message);
    }
  }

  async makeCall(
    options: VoiceCallOptions,
  ): Promise<{ success: boolean; callSid?: string; error?: string }> {
    try {
      if (!this.twilioClient) {
        throw new Error(this.i18n.t("errors.twilioNotConfigured"));
      }

      const callOptions: any = {
        to: options.to,
        from: options.from || this.phoneNumber,
        timeout: options.timeout || 30,
        record: options.record || false,
        machineDetection: options.machineDetection,
      };

      if (options.twiml) {
        callOptions.twiml = options.twiml;
      } else if (options.url) {
        callOptions.url = options.url;
      } else {
        // TwiML por defecto para restaurante
        callOptions.twiml = this.generateRestaurantTwiML();
      }

      if (options.statusCallback) {
        callOptions.statusCallback = options.statusCallback;
        callOptions.statusCallbackMethod =
          options.statusCallbackMethod || "POST";
      }

      const call = await this.twilioClient.calls.create(callOptions);

      this.logger.log(`Call initiated successfully: ${call.sid}`);

      return {
        success: true,
        callSid: call.sid,
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error("Failed to make call:", err.message);

      return {
        success: false,
        error: err.message,
      };
    }
  }

  async sendSMS(
    options: SMSOptions,
  ): Promise<{ success: boolean; messageSid?: string; error?: string }> {
    try {
      if (!this.twilioClient) {
        throw new Error(this.i18n.t("errors.twilioNotConfigured"));
      }

      const messageOptions: any = {
        to: options.to,
        from: options.from || this.phoneNumber,
        body: options.body,
      };

      if (options.mediaUrl && options.mediaUrl.length > 0) {
        messageOptions.mediaUrl = options.mediaUrl;
      }

      if (options.statusCallback) {
        messageOptions.statusCallback = options.statusCallback;
      }

      const message = await this.twilioClient.messages.create(messageOptions);

      this.logger.log(`SMS sent successfully: ${message.sid}`);

      return {
        success: true,
        messageSid: message.sid,
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error("Failed to send SMS:", err.message);

      return {
        success: false,
        error: err.message,
      };
    }
  }

  async getCallStatus(callSid: string): Promise<CallStatus | null> {
    try {
      if (!this.twilioClient) {
        throw new Error(this.i18n.t("errors.twilioNotConfigured"));
      }

      const call = await this.twilioClient.calls(callSid).fetch();

      return {
        sid: call.sid,
        status: call.status as any,
        duration: call.duration,
        startTime: call.startTime,
        endTime: call.endTime,
        price: call.price,
        direction: call.direction as any,
      };
    } catch (error) {
      this.logger.error("Failed to get call status:", error.message);
      return null;
    }
  }

  async hangupCall(callSid: string): Promise<boolean> {
    try {
      if (!this.twilioClient) {
        throw new Error(this.i18n.t("errors.twilioNotConfigured"));
      }

      await this.twilioClient.calls(callSid).update({ status: "completed" });

      this.logger.log(`Call ${callSid} hung up successfully`);
      return true;
    } catch (error) {
      this.logger.error("Failed to hangup call:", error.message);
      return false;
    }
  }

  generateRestaurantTwiML(options?: {
    welcomeMessage?: string;
    menuOptions?: Array<{
      digit: string;
      description: string;
      action: string;
    }>;
    transferNumber?: string;
  }): string {
    const welcomeMessage =
      options?.welcomeMessage ||
      "¡Hola! Gracias por llamar a nuestro restaurante. Soy ChefBot Dysa, tu asistente telefónico.";

    const defaultMenuOptions = options?.menuOptions || [
      {
        digit: "1",
        description: "Para hacer una reserva",
        action: "reservation",
      },
      { digit: "2", description: "Para hacer un pedido", action: "order" },
      { digit: "3", description: "Para consultar horarios", action: "hours" },
      {
        digit: "4",
        description: "Para hablar con un representante",
        action: "transfer",
      },
    ];

    const transferNumber = options?.transferNumber || this.phoneNumber;

    let twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="es-MX">${welcomeMessage}</Say>
  <Pause length="1"/>
  <Say voice="alice" language="es-MX">Por favor, selecciona una de las siguientes opciones:</Say>
  <Gather input="dtmf" timeout="10" numDigits="1" action="${this.webhookUrl}/voice/menu">
`;

    defaultMenuOptions.forEach((option) => {
      twiml += `    <Say voice="alice" language="es-MX">Presiona ${option.digit} ${option.description}</Say>\n`;
    });

    twiml += `  </Gather>
  <Say voice="alice" language="es-MX">No hemos recibido una selección. Te transferiremos con un representante.</Say>
  <Dial>${transferNumber}</Dial>
</Response>`;

    return twiml;
  }

  generateReservationTwiML(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="es-MX">Perfecto, te ayudaré con tu reserva.</Say>
  <Pause length="1"/>
  <Say voice="alice" language="es-MX">Por favor, después del tono, dime tu nombre, fecha y hora preferida, y número de personas.</Say>
  <Record timeout="30" maxLength="120" action="${this.webhookUrl}/voice/reservation" playBeep="true"/>
  <Say voice="alice" language="es-MX">No hemos recibido tu información. Por favor, inténtalo nuevamente.</Say>
  <Redirect>${this.webhookUrl}/voice/reservation</Redirect>
</Response>`;
  }

  generateOrderTwiML(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="es-MX">Excelente, tomaremos tu pedido.</Say>
  <Pause length="1"/>
  <Say voice="alice" language="es-MX">Después del tono, por favor dime tu nombre, dirección de entrega y lo que deseas ordenar.</Say>
  <Record timeout="60" maxLength="180" action="${this.webhookUrl}/voice/order" playBeep="true"/>
  <Say voice="alice" language="es-MX">No hemos recibido tu pedido. Por favor, inténtalo nuevamente.</Say>
  <Redirect>${this.webhookUrl}/voice/order</Redirect>
</Response>`;
  }

  generateHoursTwiML(hours?: string): string {
    const restaurantHours =
      hours ||
      "Lunes a Viernes de 11:00 AM a 10:00 PM, Sábados y Domingos de 12:00 PM a 11:00 PM";

    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="es-MX">Nuestros horarios de atención son: ${restaurantHours}</Say>
  <Pause length="2"/>
  <Say voice="alice" language="es-MX">¿Hay algo más en lo que pueda ayudarte?</Say>
  <Gather input="dtmf" timeout="5" numDigits="1" action="${this.webhookUrl}/voice/menu">
    <Say voice="alice" language="es-MX">Presiona 1 para volver al menú principal, o presiona 0 para hablar con un representante.</Say>
  </Gather>
  <Say voice="alice" language="es-MX">Gracias por llamar. ¡Que tengas un excelente día!</Say>
  <Hangup/>
</Response>`;
  }

  processVoiceWebhook(body: any): {
    type: "menu" | "reservation" | "order" | "hours" | "unknown";
    data: any;
  } {
    const digits = body.Digits;
    const recordingUrl = body.RecordingUrl;
    const callSid = body.CallSid;
    const from = body.From;

    if (digits) {
      switch (digits) {
        case "1":
          return { type: "reservation", data: { callSid, from } };
        case "2":
          return { type: "order", data: { callSid, from } };
        case "3":
          return { type: "hours", data: { callSid, from } };
        case "4":
          return { type: "menu", data: { action: "transfer", callSid, from } };
        default:
          return { type: "unknown", data: { digits, callSid, from } };
      }
    }

    if (recordingUrl) {
      const pathname = new URL(body.request.url).pathname;

      if (pathname.includes("/reservation")) {
        return {
          type: "reservation",
          data: {
            recordingUrl,
            callSid,
            from,
            duration: body.RecordingDuration,
          },
        };
      } else if (pathname.includes("/order")) {
        return {
          type: "order",
          data: {
            recordingUrl,
            callSid,
            from,
            duration: body.RecordingDuration,
          },
        };
      }
    }

    return { type: "unknown", data: body };
  }

  async transcribeRecording(recordingUrl: string): Promise<string | null> {
    try {
      // En una implementación real, aquí usarías un servicio de transcripción
      // como Google Speech-to-Text, AWS Transcribe, o Azure Speech Services
      this.logger.log(`Transcription requested for: ${recordingUrl}`);

      // Placeholder - en producción implementar transcripción real
      return "Transcripción pendiente de implementar";
    } catch (error) {
      this.logger.error("Failed to transcribe recording:", error.message);
      return null;
    }
  }

  async sendRestaurantNotificationSMS(
    to: string,
    type: "reservation" | "order" | "confirmation",
    data: any,
  ): Promise<{ success: boolean; messageSid?: string; error?: string }> {
    let message = "";

    switch (type) {
      case "reservation":
        message = `🍽️ ¡Hola! Tu reserva para ${data.guests} personas el ${data.date} a las ${data.time} ha sido ${data.status}. Restaurante: ${data.restaurantName}`;
        break;
      case "order":
        message = `🛒 Tu pedido #${data.orderId} por $${data.total} está ${data.status}. Tiempo estimado: ${data.estimatedTime} min. ¡Gracias por tu preferencia!`;
        break;
      case "confirmation":
        message = `✅ ${data.message} - ${data.restaurantName}. Si tienes dudas, llámanos o responde este mensaje.`;
        break;
      default:
        message = data.message;
    }

    return this.sendSMS({
      to,
      body: message,
    });
  }

  getHealthStatus() {
    return {
      service: "Twilio Voice & SMS",
      configured: !!(this.accountSid && this.authToken && this.phoneNumber),
      phoneNumber: this.phoneNumber,
      webhookUrl: this.webhookUrl,
    };
  }
}
