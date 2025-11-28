import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHello() {
    return {
      success: true,
      data: {
        service: "ChatBotDysa Backend API",
        version: "1.0.0",
        environment: process.env.NODE_ENV || "production",
        status: "operational",
        message: "Bienvenido a ChatBotDysa Enterprise - API REST",
        endpoints: {
          health: "/health",
          docs: "/docs",
          api: "/api"
        },
        features: [
          "Autenticación JWT",
          "Gestión de Usuarios y Roles",
          "Integración con IA (Ollama)",
          "API RESTful completa",
          "Soporte multiidioma (es, en, fr)"
        ]
      },
      timestamp: new Date().toISOString(),
      path: "/"
    };
  }
}
