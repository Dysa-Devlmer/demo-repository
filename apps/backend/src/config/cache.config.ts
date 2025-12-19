import { CacheModuleOptions } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-ioredis-yet';
import { ConfigService } from '@nestjs/config';

export const getCacheConfig = async (configService: ConfigService): Promise<CacheModuleOptions> => {
  const isTest =
    configService.get('NODE_ENV') === 'test' || Boolean(process.env.JEST_WORKER_ID);

  if (isTest) {
    return {
      ttl: 300,
      max: 1000,
      isGlobal: true,
    };
  }

  const redisHost = configService.get('REDIS_HOST', '127.0.0.1');
  const redisPort = configService.get('REDIS_PORT', 16379);
  const redisPassword = configService.get('REDIS_PASSWORD');

  // Configuración de Redis para cache
  const store = await redisStore({
    host: redisHost,
    port: Number(redisPort),
    password: redisPassword,
    // Configuración de conexión
    ttl: 300, // 5 minutos por defecto (en segundos)
    max: 1000, // Máximo 1000 items en cache
    // Configuración de reconexión
    retryStrategy: (times: number) => {
      // Reintentar conexión con backoff exponencial
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    // Logging de errores
    onError: (error: Error) => {
      console.error('Redis Cache Error:', error);
    },
  });

  return {
    store: store as any,
    ttl: 300, // 5 minutos por defecto (en segundos)
    max: 1000, // Máximo 1000 items
    isGlobal: true,
  };
};

// TTL constants (en segundos)
export const CacheTTL = {
  // Datos estáticos o que cambian muy poco
  STATIC: 3600, // 1 hora
  MENU_ITEMS: 1800, // 30 minutos
  SETTINGS: 3600, // 1 hora
  ROLES_PERMISSIONS: 3600, // 1 hora

  // Datos que cambian frecuentemente
  CUSTOMERS: 300, // 5 minutos
  ORDERS: 180, // 3 minutos
  RESERVATIONS: 300, // 5 minutos

  // Datos en tiempo real
  PROMOTIONS: 60, // 1 minuto
  CONVERSATIONS: 30, // 30 segundos

  // Datos de sesión
  USER_SESSION: 1800, // 30 minutos
  AUTH_TOKEN: 900, // 15 minutos

  // Dashboard y analytics
  DASHBOARD_STATS: 300, // 5 minutos
  ANALYTICS: 600, // 10 minutos
} as const;

// Prefijos de keys para organización
export const CacheKey = {
  MENU: 'menu',
  CUSTOMER: 'customer',
  ORDER: 'order',
  RESERVATION: 'reservation',
  PROMOTION: 'promotion',
  USER: 'user',
  ROLE: 'role',
  PERMISSION: 'permission',
  SETTINGS: 'settings',
  CONVERSATION: 'conversation',
  DASHBOARD: 'dashboard',
  ANALYTICS: 'analytics',
} as const;

// Helper para generar keys consistentes
export class CacheKeyBuilder {
  static menu(id?: number): string {
    return id ? `${CacheKey.MENU}:${id}` : `${CacheKey.MENU}:all`;
  }

  static customer(id?: number): string {
    return id ? `${CacheKey.CUSTOMER}:${id}` : `${CacheKey.CUSTOMER}:all`;
  }

  static order(id?: number): string {
    return id ? `${CacheKey.ORDER}:${id}` : `${CacheKey.ORDER}:all`;
  }

  static reservation(id?: number): string {
    return id ? `${CacheKey.RESERVATION}:${id}` : `${CacheKey.RESERVATION}:all`;
  }

  static promotion(id?: number): string {
    return id ? `${CacheKey.PROMOTION}:${id}` : `${CacheKey.PROMOTION}:all`;
  }

  static user(id?: number): string {
    return id ? `${CacheKey.USER}:${id}` : `${CacheKey.USER}:all`;
  }

  static userByEmail(email: string): string {
    return `${CacheKey.USER}:email:${email}`;
  }

  static role(id?: number): string {
    return id ? `${CacheKey.ROLE}:${id}` : `${CacheKey.ROLE}:all`;
  }

  static permission(roleId: number): string {
    return `${CacheKey.PERMISSION}:role:${roleId}`;
  }

  static settings(key: string): string {
    return `${CacheKey.SETTINGS}:${key}`;
  }

  static conversation(id: number): string {
    return `${CacheKey.CONVERSATION}:${id}`;
  }

  static dashboardStats(): string {
    return `${CacheKey.DASHBOARD}:stats`;
  }

  static analytics(type: string, dateRange?: string): string {
    return dateRange
      ? `${CacheKey.ANALYTICS}:${type}:${dateRange}`
      : `${CacheKey.ANALYTICS}:${type}`;
  }

  // Invalidación por patrón
  static menuPattern(): string {
    return `${CacheKey.MENU}:*`;
  }

  static customerPattern(): string {
    return `${CacheKey.CUSTOMER}:*`;
  }

  static orderPattern(): string {
    return `${CacheKey.ORDER}:*`;
  }

  static reservationPattern(): string {
    return `${CacheKey.RESERVATION}:*`;
  }

  static promotionPattern(): string {
    return `${CacheKey.PROMOTION}:*`;
  }

  static userPattern(): string {
    return `${CacheKey.USER}:*`;
  }

  static dashboardPattern(): string {
    return `${CacheKey.DASHBOARD}:*`;
  }

  static analyticsPattern(): string {
    return `${CacheKey.ANALYTICS}:*`;
  }
}
