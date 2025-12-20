import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getCacheConfig } from './config/cache.config';
import { DatabaseModule } from './database/database.module';
import { CustomersModule } from './customers/customers.module';
import { MenuModule } from './menu/menu.module';
import { ReservationsModule } from './reservations/reservations.module';
import { OrdersModule } from './orders/orders.module';
import { PromotionsModule } from './promotions/promotions.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { HealthController } from './health/health.controller';

// Conversations Module
import { ConversationsModule } from './conversations/conversations.module';

// New AI and Communication Modules
import { AiModule } from './modules/ai/ai.module';
import { WebSocketsModule } from './modules/websockets/websockets.module';
import { WhatsAppModule } from './modules/whatsapp/whatsapp.module';
import { TwilioModule } from './modules/twilio/twilio.module';
import { SettingsModule } from './modules/settings/settings.module';

// Enterprise Security Middleware
import { SecurityMiddleware } from './common/middleware/security.middleware';
import { AuditMiddleware } from './common/middleware/audit.middleware';
import { SecurityModule } from './security/security.module';

// Enterprise Analytics
import { AnalyticsController } from './common/controllers/analytics.controller';
import { AnalyticsService } from './common/services/analytics.service';

// Demo Reset Module with Time Limit
import { DemoModule } from './demo/demo.module';

// Common Module for Auth Guards
import { CommonModule } from './common/common.module';

// Payments Module
import { PaymentsModule } from './payments/payments.module';

// Dashboard Module with Snapshots
import { DashboardModule } from './dashboard/dashboard.module';

// Uploads Module for Widget
import { UploadsModule } from './uploads/uploads.module';

// Reports Module
import { ReportsModule } from './reports/reports.module';

// Leads Module
import { LeadsModule } from './modules/leads/leads.module';

// Categories Module (Professional Category Management)
import { CategoriesModule } from './categories/categories.module';

// Quick Replies Module
import { QuickRepliesModule } from './modules/quick-replies/quick-replies.module';
import { MetricsModule } from './metrics/metrics.module';
import { HttpMetricsInterceptor } from './metrics/http-metrics.interceptor';
import { AlertsModule } from './alerts/alerts.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`, '.env'],
    }),

    // Enterprise Security: Rate Limiting
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
      {
        name: 'auth',
        ttl: 60000, // 1 minute
        limit: 5, // 5 auth attempts per minute
      },
    ]),

    // Cache with Redis
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: getCacheConfig,
    }),

    // Database
    DatabaseModule,
    TypeOrmModule.forFeature([]),

    // Authentication & Authorization
    AuthModule,
    CommonModule,

    // Core Business Modules
    CustomersModule,
    CategoriesModule,
    MenuModule,
    ReservationsModule,
    OrdersModule,
    PromotionsModule,
    UsersModule,
    ConversationsModule,
    ReportsModule,
    LeadsModule,
    QuickRepliesModule,

    // Dashboard with Historical Snapshots
    DashboardModule,

    // AI & Communication Modules
    AiModule,
    WebSocketsModule,
    WhatsAppModule,
    TwilioModule,
    SettingsModule,

    // Enterprise Security Module
    SecurityModule,

    // Demo Reset Module with Time Limit
    DemoModule,

    // Payments Module
    PaymentsModule,

    // Uploads Module for Widget
    UploadsModule,

    // Observability
    MetricsModule,
    AlertsModule,
  ],
  controllers: [AppController, HealthController, AnalyticsController],
  providers: [
    AppService,
    AnalyticsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpMetricsInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply enterprise security middleware to all routes
    consumer.apply(SecurityMiddleware, AuditMiddleware).forRoutes('*');
  }
}
