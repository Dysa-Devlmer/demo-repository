import { Controller, Get, UseGuards } from "@nestjs/common";
import { AppService } from "./app.service";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { PermissionsGuard } from "./auth/guards/permissions.guard";
import { RequirePermissions, PERMISSIONS } from "./auth/decorators/permissions.decorator";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return this.appService.getHello();
  }

  @Get('dashboard/stats')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(PERMISSIONS.DASHBOARD_READ)
  getDashboardStats() {
    return {
      success: true,
      data: {
        totalConversations: 1247,
        activeCustomers: 342,
        totalOrders: 89,
        revenue: 12450,
        todayMessages: 156,
        pendingOrders: 12,
        satisfactionRate: 4.8,
        responseTime: '2.3 min'
      },
      timestamp: new Date().toISOString(),
      path: '/api/dashboard/stats'
    };
  }

  @Get('analytics/dashboard')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(PERMISSIONS.DASHBOARD_READ)
  getAnalyticsDashboard() {
    return {
      success: true,
      data: {
        analytics: {
          visitorsToday: 2847,
          visitorsTrend: '+12.5%',
          conversions: 1.3,
          conversionsTrend: '+8.2%',
          avgSessionDuration: '4m 23s',
          sessionTrend: '+5.1%',
          customerSatisfaction: 4.8,
          satisfactionTrend: '+2.3%'
        },
        charts: {
          conversationsOverTime: [
            { date: '2025-09-20', conversations: 234 },
            { date: '2025-09-21', conversations: 289 },
            { date: '2025-09-22', conversations: 312 },
            { date: '2025-09-23', conversations: 298 },
            { date: '2025-09-24', conversations: 356 },
            { date: '2025-09-25', conversations: 401 },
            { date: '2025-09-26', conversations: 423 }
          ],
          topChannels: [
            { channel: 'WhatsApp', conversations: 1247, percentage: 58 },
            { channel: 'Web Widget', conversations: 623, percentage: 29 },
            { channel: 'Telegram', conversations: 278, percentage: 13 }
          ],
          responseMetrics: {
            avgResponseTime: 2.3,
            firstResponseTime: 1.8,
            resolutionTime: 8.5,
            customerSatisfactionScore: 4.8
          }
        }
      },
      timestamp: new Date().toISOString(),
      path: '/api/analytics/dashboard'
    };
  }

  @Get('settings')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(PERMISSIONS.SETTINGS_READ)
  getSettings() {
    return {
      success: true,
      data: {
        restaurant: {
          name: 'Restaurante Elite',
          address: 'Calle Principal 123, Centro',
          phone: '+1234567890',
          email: 'info@restauranteelite.com',
          website: 'https://restauranteelite.com',
          timezone: 'America/Mexico_City',
          currency: 'USD',
          language: 'es'
        },
        business: {
          openingHours: {
            monday: { open: '09:00', close: '22:00', closed: false },
            tuesday: { open: '09:00', close: '22:00', closed: false },
            wednesday: { open: '09:00', close: '22:00', closed: false },
            thursday: { open: '09:00', close: '22:00', closed: false },
            friday: { open: '09:00', close: '23:00', closed: false },
            saturday: { open: '10:00', close: '23:00', closed: false },
            sunday: { open: '10:00', close: '21:00', closed: false }
          },
          tableCapacity: 120,
          averageServiceTime: 45,
          deliveryRadius: 15
        },
        communications: {
          whatsapp: {
            enabled: true,
            phoneNumber: '+1234567890',
            apiKey: '***hidden***',
            webhookUrl: 'https://api.chatbotdysa.com/webhook/whatsapp',
            businessVerified: true
          },
          twilio: {
            enabled: true,
            accountSid: '***hidden***',
            authToken: '***hidden***',
            phoneNumber: '+1234567891'
          },
          email: {
            enabled: true,
            smtpHost: 'smtp.gmail.com',
            smtpPort: 587,
            smtpUser: 'noreply@restauranteelite.com',
            smtpPassword: '***hidden***'
          }
        },
        ai: {
          provider: 'openai',
          model: 'gpt-4',
          apiKey: '***hidden***',
          maxTokens: 150,
          temperature: 0.7,
          personalityPrompt: 'Eres un asistente virtual amigable y profesional de un restaurante de alta calidad. Ayudas a los clientes con reservas, pedidos y consultas generales.',
          autoResponses: true,
          learningMode: true
        },
        notifications: {
          newOrders: true,
          newReservations: true,
          customerMessages: true,
          systemAlerts: true,
          email: true,
          sms: false,
          push: true
        }
      },
      timestamp: new Date().toISOString(),
      path: '/api/settings'
    };
  }
}
