import { Controller, Get, Post, Body, Query, Param } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
} from "@nestjs/swagger";
import { NotificationService } from "../services/notification.service";
import type { NotificationPayload } from "../services/notification.service";

@ApiTags("Notifications")
@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post("send")
  @ApiOperation({
    summary: "Send notification",
    description: "Send a notification via email, SMS, WhatsApp or push",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        to: { type: "string", example: "customer@example.com" },
        channel: {
          type: "string",
          enum: ["email", "sms", "whatsapp", "push", "all"],
          example: "email",
        },
        priority: {
          type: "string",
          enum: ["low", "normal", "high", "critical"],
          example: "normal",
        },
        templateId: { type: "string", example: "order_confirmation" },
        subject: { type: "string", example: "Your order is confirmed!" },
        message: {
          type: "string",
          example: "Hello! Your order has been processed.",
        },
        variables: {
          type: "object",
          example: {
            customerName: "Juan",
            orderNumber: "ORD-123",
            total: "25.99",
          },
        },
      },
      required: ["to", "channel", "priority"],
    },
  })
  @ApiResponse({ status: 200, description: "Notification sent successfully" })
  @ApiResponse({ status: 400, description: "Invalid notification data" })
  async sendNotification(@Body() payload: NotificationPayload) {
    const success = await this.notificationService.sendNotification(payload);
    return {
      success,
      message: success
        ? "Notification sent successfully"
        : "Failed to send notification",
      timestamp: new Date().toISOString(),
    };
  }

  @Post("send-bulk")
  @ApiOperation({
    summary: "Send bulk notifications",
    description: "Send notifications to multiple recipients",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        recipients: {
          type: "array",
          items: { type: "string" },
          example: ["customer1@example.com", "customer2@example.com"],
        },
        channel: {
          type: "string",
          enum: ["email", "sms", "whatsapp", "push"],
          example: "email",
        },
        priority: {
          type: "string",
          enum: ["low", "normal", "high", "critical"],
          example: "normal",
        },
        templateId: { type: "string", example: "weekly_summary" },
        variables: {
          type: "object",
          example: { restaurantName: "ChatBotDysa", totalOrders: "150" },
        },
      },
      required: ["recipients", "channel", "priority"],
    },
  })
  @ApiResponse({ status: 200, description: "Bulk notifications sent" })
  async sendBulkNotification(
    @Body()
    data: {
      recipients: string[];
      channel: "email" | "sms" | "whatsapp" | "push";
      priority: "low" | "normal" | "high" | "critical";
      templateId?: string;
      subject?: string;
      message?: string;
      variables?: Record<string, any>;
    },
  ) {
    const { recipients, ...payload } = data;
    const result = await this.notificationService.sendBulkNotification(
      recipients,
      payload,
    );

    return {
      ...result,
      totalRecipients: recipients.length,
      successRate: ((result.sent / recipients.length) * 100).toFixed(2) + "%",
      timestamp: new Date().toISOString(),
    };
  }

  @Post("order/confirmation")
  @ApiOperation({
    summary: "Send order confirmation",
    description: "Send order confirmation notification",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        customerEmail: { type: "string", example: "customer@example.com" },
        customerName: { type: "string", example: "Juan Pérez" },
        orderNumber: { type: "string", example: "ORD-123456" },
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              quantity: { type: "number" },
              price: { type: "number" },
            },
          },
          example: [{ name: "Pizza Margherita", quantity: 2, price: 12.99 }],
        },
        total: { type: "number", example: 25.98 },
        estimatedTime: { type: "number", example: 30 },
      },
      required: [
        "customerEmail",
        "customerName",
        "orderNumber",
        "items",
        "total",
      ],
    },
  })
  @ApiResponse({ status: 200, description: "Order confirmation sent" })
  async sendOrderConfirmation(@Body() orderData: any) {
    const success =
      await this.notificationService.sendOrderConfirmation(orderData);
    return {
      success,
      message: success
        ? "Order confirmation sent"
        : "Failed to send order confirmation",
      timestamp: new Date().toISOString(),
    };
  }

  @Post("reservation/confirmation")
  @ApiOperation({
    summary: "Send reservation confirmation",
    description: "Send reservation confirmation via WhatsApp",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        customerPhone: { type: "string", example: "+1234567890" },
        customerName: { type: "string", example: "María García" },
        date: { type: "string", example: "2024-01-20" },
        time: { type: "string", example: "19:30" },
        partySize: { type: "number", example: 4 },
      },
      required: ["customerPhone", "customerName", "date", "time", "partySize"],
    },
  })
  @ApiResponse({ status: 200, description: "Reservation confirmation sent" })
  async sendReservationConfirmation(@Body() reservationData: any) {
    const success =
      await this.notificationService.sendReservationConfirmation(
        reservationData,
      );
    return {
      success,
      message: success
        ? "Reservation confirmation sent"
        : "Failed to send reservation confirmation",
      timestamp: new Date().toISOString(),
    };
  }

  @Post("order/ready")
  @ApiOperation({
    summary: "Send order ready notification",
    description: "Notify customer that order is ready",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        customerPhone: { type: "string", example: "+1234567890" },
        orderNumber: { type: "string", example: "ORD-123456" },
        total: { type: "number", example: 25.98 },
      },
      required: ["customerPhone", "orderNumber", "total"],
    },
  })
  @ApiResponse({ status: 200, description: "Order ready notification sent" })
  async sendOrderReady(@Body() orderData: any) {
    const success = await this.notificationService.sendOrderReady(orderData);
    return {
      success,
      message: success
        ? "Order ready notification sent"
        : "Failed to send order ready notification",
      timestamp: new Date().toISOString(),
    };
  }

  @Post("weekly-summary")
  @ApiOperation({
    summary: "Send weekly business summary",
    description: "Send weekly summary to business owners",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        recipients: {
          type: "array",
          items: { type: "string" },
          example: ["owner@restaurant.com", "manager@restaurant.com"],
        },
        businessData: {
          type: "object",
          properties: {
            restaurantName: {
              type: "string",
              example: "ChatBotDysa Restaurant",
            },
            startDate: { type: "string", example: "2024-01-15" },
            endDate: { type: "string", example: "2024-01-21" },
            totalOrders: { type: "string", example: "127" },
            totalRevenue: { type: "string", example: "2,847.50" },
            newCustomers: { type: "string", example: "23" },
            totalReservations: { type: "string", example: "45" },
            avgRating: { type: "string", example: "4.8" },
            topProducts: {
              type: "string",
              example:
                "<li>Pizza Margherita (45 vendidas)</li><li>Pasta Carbonara (32 vendidas)</li>",
            },
          },
        },
      },
      required: ["recipients", "businessData"],
    },
  })
  @ApiResponse({ status: 200, description: "Weekly summary sent" })
  async sendWeeklySummary(
    @Body() data: { recipients: string[]; businessData: any },
  ) {
    const success = await this.notificationService.sendWeeklySummary(
      data.businessData,
      data.recipients,
    );
    return {
      success,
      message: success
        ? "Weekly summary sent"
        : "Failed to send weekly summary",
      timestamp: new Date().toISOString(),
    };
  }

  @Get("templates")
  @ApiOperation({
    summary: "Get notification templates",
    description: "Retrieve all available notification templates",
  })
  @ApiQuery({
    name: "type",
    required: false,
    enum: ["email", "sms", "whatsapp", "push"],
    description: "Filter by template type",
  })
  @ApiResponse({ status: 200, description: "Templates retrieved successfully" })
  async getTemplates(@Query("type") type?: string) {
    const templates = this.notificationService.getTemplates();
    const filtered = type
      ? templates.filter((t) => t.type === type)
      : templates;

    return {
      templates: filtered,
      total: filtered.length,
      availableTypes: ["email", "sms", "whatsapp", "push"],
      timestamp: new Date().toISOString(),
    };
  }

  @Get("stats")
  @ApiOperation({
    summary: "Get notification statistics",
    description: "Get notification delivery statistics",
  })
  @ApiResponse({
    status: 200,
    description: "Statistics retrieved successfully",
  })
  async getNotificationStats() {
    // In a real implementation, you'd query your database for actual stats
    const mockStats = {
      today: {
        sent: 156,
        delivered: 152,
        failed: 4,
        deliveryRate: "97.4%",
      },
      thisWeek: {
        sent: 1247,
        delivered: 1198,
        failed: 49,
        deliveryRate: "96.1%",
      },
      thisMonth: {
        sent: 5632,
        delivered: 5401,
        failed: 231,
        deliveryRate: "95.9%",
      },
      byChannel: {
        email: { sent: 3245, deliveryRate: "98.2%" },
        sms: { sent: 1456, deliveryRate: "94.1%" },
        whatsapp: { sent: 789, deliveryRate: "97.8%" },
        push: { sent: 142, deliveryRate: "89.4%" },
      },
      popularTemplates: [
        { id: "order_confirmation", name: "Order Confirmation", usage: 2156 },
        {
          id: "reservation_confirmed",
          name: "Reservation Confirmed",
          usage: 987,
        },
        { id: "order_ready", name: "Order Ready", usage: 1876 },
        {
          id: "reservation_reminder",
          name: "Reservation Reminder",
          usage: 654,
        },
      ],
      timestamp: new Date().toISOString(),
    };

    return mockStats;
  }

  @Get("test/:channel")
  @ApiOperation({
    summary: "Test notification channel",
    description: "Send a test notification to verify channel configuration",
  })
  @ApiResponse({ status: 200, description: "Test notification sent" })
  async testNotificationChannel(
    @Param("channel") channel: "email" | "sms" | "whatsapp" | "push",
    @Query("to") to: string = "test@example.com",
  ) {
    const testPayload: NotificationPayload = {
      to,
      channel,
      priority: "low",
      subject: "Test Notification - ChatBotDysa",
      message: `🧪 Test notification via ${channel.toUpperCase()}. System is working correctly! Sent at ${new Date().toLocaleString()}`,
      metadata: { test: true },
    };

    const success =
      await this.notificationService.sendNotification(testPayload);

    return {
      success,
      channel,
      recipient: to,
      message: success
        ? `Test ${channel} notification sent successfully`
        : `Failed to send test ${channel} notification`,
      timestamp: new Date().toISOString(),
    };
  }
}
