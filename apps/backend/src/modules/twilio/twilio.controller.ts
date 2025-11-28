import {
  Controller,
  Get,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Logger,
  Res,
} from "@nestjs/common";
import type { Response } from "express";
import type { VoiceCallOptions } from "./twilio.service";
import { TwilioService } from "./twilio.service";
import { OllamaService } from "../ai/ollama.service";
import { WebSocketsGateway } from "../websockets/websockets.gateway";

export interface TwilioWebhookData {
  recordingUrl?: string;
  from?: string;
  callSid?: string;
  action?: string;
  [key: string]: unknown;
}

export interface ProcessedWebhook {
  type: "reservation" | "order" | "info" | "unknown" | "hours" | "menu";
  data: TwilioWebhookData;
}

export interface NotificationPayload {
  type: string;
  from: string;
  callSid: string;
  transcription: string;
  aiResponse: string;
  recordingUrl: string;
}

@Controller("twilio")
export class TwilioController {
  private readonly logger = new Logger(TwilioController.name);

  constructor(
    private readonly twilioService: TwilioService,
    private readonly ollamaService: OllamaService,
    private readonly websocketGateway: WebSocketsGateway,
  ) {}

  @Post("voice/webhook")
  async handleVoiceWebhook(
    @Body() body: TwilioWebhookData,
    @Res() res: Response,
  ) {
    try {
      this.logger.log("Received Twilio voice webhook:", JSON.stringify(body));

      const processed: ProcessedWebhook =
        this.twilioService.processVoiceWebhook(body);

      let twimlResponse = "";

      switch (processed.type) {
        case "reservation":
          if (processed.data.recordingUrl) {
            // Process reservation recording
            this.logger.log(
              `Processing reservation recording: ${processed.data.recordingUrl}`,
            );
            const transcription = await this.twilioService.transcribeRecording(
              processed.data.recordingUrl,
            );

            // Generate AI response for reservation
            const aiResponse =
              await this.ollamaService.generateRestaurantResponse(
                `Cliente solicita reserva: ${transcription}`,
                {
                  restaurantInfo: {
                    name: "DysaBot Restaurant",
                    specialties: [
                      "Reservas",
                      "Mesa para parejas",
                      "Eventos especiales",
                    ],
                  },
                },
              );

            // Notify admin panel
            if (
              processed.data.from &&
              processed.data.callSid &&
              processed.data.recordingUrl
            ) {
              this.websocketGateway.notifyVoiceCall({
                type: "reservation",
                from: processed.data.from,
                callSid: processed.data.callSid,
                transcription,
                aiResponse,
                recordingUrl: processed.data.recordingUrl,
              });
            }

            twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="es-MX">Perfecto, hemos recibido tu solicitud de reserva. Te confirmaremos por SMS en breve.</Say>
  <Pause length="1"/>
  <Say voice="alice" language="es-MX">¡Gracias por elegir nuestro restaurante!</Say>
  <Hangup/>
</Response>`;
          } else {
            twimlResponse = this.twilioService.generateReservationTwiML();
          }
          break;

        case "order":
          if (processed.data.recordingUrl) {
            // Process order recording
            this.logger.log(
              `Processing order recording: ${processed.data.recordingUrl}`,
            );
            const transcription = await this.twilioService.transcribeRecording(
              processed.data.recordingUrl,
            );

            // Generate AI response for order
            const aiResponse =
              await this.ollamaService.generateRestaurantResponse(
                `Cliente hace pedido: ${transcription}`,
                {
                  restaurantInfo: {
                    name: "DysaBot Restaurant",
                    specialties: [
                      "Delivery",
                      "Comida rápida",
                      "Pedidos telefónicos",
                    ],
                  },
                },
              );

            // Notify admin panel
            if (
              processed.data.from &&
              processed.data.callSid &&
              processed.data.recordingUrl
            ) {
              this.websocketGateway.notifyVoiceCall({
                type: "order",
                from: processed.data.from,
                callSid: processed.data.callSid,
                transcription,
                aiResponse,
                recordingUrl: processed.data.recordingUrl,
              });
            }

            twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="es-MX">Excelente, hemos tomado tu pedido. Te enviaremos la confirmación y tiempo de entrega por SMS.</Say>
  <Pause length="1"/>
  <Say voice="alice" language="es-MX">¡Gracias por tu pedido!</Say>
  <Hangup/>
</Response>`;
          } else {
            twimlResponse = this.twilioService.generateOrderTwiML();
          }
          break;

        case "hours":
          twimlResponse = this.twilioService.generateHoursTwiML();
          break;

        case "menu":
          if (processed.data.action === "transfer") {
            twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="es-MX">Te conectaré con un representante. Por favor, espera un momento.</Say>
  <Dial timeout="30">
    <Number>+1234567890</Number>
  </Dial>
  <Say voice="alice" language="es-MX">Lo sentimos, no hay representantes disponibles en este momento. Por favor, llama más tarde.</Say>
  <Hangup/>
</Response>`;
          } else {
            twimlResponse = this.twilioService.generateRestaurantTwiML();
          }
          break;

        default:
          twimlResponse = this.twilioService.generateRestaurantTwiML();
          break;
      }

      res.set("Content-Type", "text/xml");
      res.send(twimlResponse);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error("Voice webhook processing error:", err.message);

      const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="es-MX">Lo sentimos, hemos tenido un problema técnico. Por favor, inténtalo más tarde.</Say>
  <Hangup/>
</Response>`;

      res.set("Content-Type", "text/xml");
      res.send(errorTwiml);
    }
  }

  @Post("make-call")
  async makeCall(@Body() options: VoiceCallOptions) {
    try {
      const result = await this.twilioService.makeCall(options);

      if (result.success) {
        return {
          success: true,
          callSid: result.callSid,
          message: "Call initiated successfully",
        };
      } else {
        throw new HttpException(
          result.error || "Failed to make call",
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error("Make call error:", err.message);
      throw new HttpException(
        "Failed to make call",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post("send-sms")
  async sendSMS(
    @Body() body: { to: string; message: string; mediaUrl?: string[] },
  ) {
    try {
      const result = await this.twilioService.sendSMS({
        to: body.to,
        body: body.message,
        mediaUrl: body.mediaUrl,
      });

      if (result.success) {
        return {
          success: true,
          messageSid: result.messageSid,
          message: "SMS sent successfully",
        };
      } else {
        throw new HttpException(
          result.error || "Failed to send SMS",
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error("Send SMS error:", err.message);
      throw new HttpException(
        "Failed to send SMS",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("call-status/:callSid")
  async getCallStatus(@Body("callSid") callSid: string) {
    try {
      const status = await this.twilioService.getCallStatus(callSid);

      if (status) {
        return status;
      } else {
        throw new HttpException("Call not found", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error("Get call status error:", err.message);
      throw new HttpException(
        "Failed to get call status",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post("hangup-call/:callSid")
  async hangupCall(@Body("callSid") callSid: string) {
    try {
      const success = await this.twilioService.hangupCall(callSid);

      if (success) {
        return { success: true, message: "Call hung up successfully" };
      } else {
        throw new HttpException(
          "Failed to hangup call",
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error("Hangup call error:", err.message);
      throw new HttpException(
        "Failed to hangup call",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post("send-reservation-sms")
  async sendReservationSMS(
    @Body()
    body: {
      to: string;
      guests: number;
      date: string;
      time: string;
      status: string;
      restaurantName?: string;
    },
  ) {
    try {
      const result = await this.twilioService.sendRestaurantNotificationSMS(
        body.to,
        "reservation",
        {
          guests: body.guests,
          date: body.date,
          time: body.time,
          status: body.status,
          restaurantName: body.restaurantName || "DysaBot Restaurant",
        },
      );

      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error("Send reservation SMS error:", err.message);
      throw new HttpException(
        "Failed to send reservation SMS",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post("send-order-sms")
  async sendOrderSMS(
    @Body()
    body: {
      to: string;
      orderId: string;
      total: number;
      status: string;
      estimatedTime: number;
    },
  ) {
    try {
      const result = await this.twilioService.sendRestaurantNotificationSMS(
        body.to,
        "order",
        {
          orderId: body.orderId,
          total: body.total,
          status: body.status,
          estimatedTime: body.estimatedTime,
        },
      );

      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error("Send order SMS error:", err.message);
      throw new HttpException(
        "Failed to send order SMS",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("health")
  getHealth() {
    return this.twilioService.getHealthStatus();
  }

  @Post("test-call")
  async testCall(@Body() body: { to: string }) {
    try {
      const result = await this.twilioService.makeCall({
        to: body.to,
        twiml: `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="es-MX">Hola, esta es una llamada de prueba de ChefBot Dysa. Tu sistema de llamadas está funcionando correctamente.</Say>
  <Pause length="2"/>
  <Say voice="alice" language="es-MX">Gracias por probar nuestro servicio. ¡Que tengas un excelente día!</Say>
  <Hangup/>
</Response>`,
      });

      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error("Test call error:", err.message);
      throw new HttpException(
        "Failed to make test call",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
