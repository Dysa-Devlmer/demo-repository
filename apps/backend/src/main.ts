import { NestFactory } from "@nestjs/core";
import { Logger, ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";
import { CorsMiddleware } from "./common/middleware/cors.middleware";
import { SecurityMiddleware } from "./common/middleware/security.middleware";
import { CsrfGuard } from "./auth/guards/csrf.guard";
import session from 'express-session';
import cookieParser from 'cookie-parser';
import * as crypto from 'crypto';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const logger = new Logger("Bootstrap");

  // 🚀 Enterprise: Validate required environment variables
  if (!process.env.JWT_SECRET) {
    // Generate a secure JWT secret for development
    const generatedSecret = crypto.randomBytes(64).toString('hex');
    process.env.JWT_SECRET = generatedSecret;
    logger.warn('⚠️  Generated JWT_SECRET for development. Set JWT_SECRET in production!');
  }

  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: ["error", "warn", "log", "debug", "verbose"],
    });

    // 🚀 Servir archivos estáticos desde carpeta uploads
    app.useStaticAssets(join(process.cwd(), 'public', 'uploads'), {
      prefix: '/uploads',
    });

    // 🚀 Enterprise: Configure secure sessions
    const sessionSecret = process.env.SESSION_SECRET || crypto.randomBytes(64).toString('hex');
    app.use(cookieParser());
    app.use(session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'strict'
      },
      name: 'chatbotdysa.sid'
    }));

    // 🚀 Enterprise: CSRF protection disabled for JWT-based API
    // JWT in Authorization header is immune to CSRF attacks
    // CSRF is only needed for cookie-based session authentication
    // app.useGlobalGuards(new CsrfGuard(app.get('Reflector')));

    // Enable CORS
    app.enableCors({
      origin: ["http://localhost:7001", "http://localhost:7002", "http://localhost:8005"],
      credentials: true,
    });

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    // Global exception filter
    app.useGlobalFilters(new AllExceptionsFilter());

    // Global interceptors
    app.useGlobalInterceptors(
      new LoggingInterceptor(),
      new TransformInterceptor(),
    );

    // Set global prefix
    app.setGlobalPrefix("api", {
      exclude: ["/health", "/", "/docs", "/docs-json", "/uploads"],
    });

    // Swagger API Documentation
    const config = new DocumentBuilder()
      .setTitle("ChatBotDysa Enterprise API")
      .setDescription(
        "API para sistema de gestión de restaurantes con IA conversacional. " +
        "Incluye gestión de clientes, menú, órdenes, reservaciones, pagos y más."
      )
      .setVersion("1.0.0")
      .addTag("health", "Health checks y status del sistema")
      .addTag("auth", "Autenticación y autorización")
      .addTag("users", "Gestión de usuarios")
      .addTag("customers", "Gestión de clientes")
      .addTag("menu", "Gestión de menú")
      .addTag("orders", "Gestión de órdenes")
      .addTag("reservations", "Gestión de reservaciones")
      .addTag("promotions", "Gestión de promociones")
      .addTag("conversations", "Conversaciones con IA")
      .addTag("payments", "Procesamiento de pagos")
      .addTag("settings", "Configuración del sistema")
      .addTag("analytics", "Analytics y reportes")
      .addTag("uploads", "Subida de archivos e imágenes")
      .addBearerAuth(
        {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Ingresa tu JWT token",
        },
        "JWT"
      )
      .addServer("http://localhost:8005", "Desarrollo local")
      .addServer("https://api.chatbotdysa.com", "Producción")
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("docs", app, document, {
      customSiteTitle: "ChatBotDysa API Docs",
      customfavIcon: "https://chatbotdysa.com/favicon.ico",
      customCss: ".swagger-ui .topbar { display: none }",
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: "none",
        filter: true,
        showRequestDuration: true,
        syntaxHighlight: {
          theme: "monokai",
        },
      },
    });

    // Enable graceful shutdown
    app.enableShutdownHooks();

    const port = process.env.PORT ?? 8005;
    await app.listen(port);

    logger.log(`🚀 ChatBotDysa Backend running on port ${port}`);
    logger.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
    logger.log(`🔒 Rate Limiting: Enabled (100 req/min default, 5 req/min auth)`);
    logger.log(`💾 Cache: Redis enabled (5 min TTL default)`);
    logger.log(`📊 Health check: http://localhost:${port}/health`);
    logger.log(`🔗 API Base URL: http://localhost:${port}/api`);
    logger.log(`📚 API Docs: http://localhost:${port}/docs`);
  } catch (error) {
    logger.error("❌ Error starting application:", error);
    process.exit(1);
  }
}

void bootstrap();
