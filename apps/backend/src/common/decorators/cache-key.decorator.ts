import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY_METADATA = 'cache:key';
export const CACHE_TTL_METADATA = 'cache:ttl';

/**
 * Decorator para definir la key de cache para un endpoint
 * @param key - Función que genera la key basada en los parámetros de la request
 * @param ttl - Time to live en segundos (opcional)
 */
export const CacheKey = (key: string | ((req: any) => string), ttl?: number) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata(CACHE_KEY_METADATA, key)(target, propertyKey, descriptor);
    if (ttl) {
      SetMetadata(CACHE_TTL_METADATA, ttl)(target, propertyKey, descriptor);
    }
  };
};

/**
 * Decorator para invalidar cache cuando se ejecuta el método
 * @param patterns - Patrones de keys a invalidar
 */
export const InvalidateCache = (...patterns: string[]) => {
  return SetMetadata('cache:invalidate', patterns);
};

/**
 * Decorator para deshabilitar cache en un endpoint específico
 */
export const NoCache = () => {
  return SetMetadata('cache:disabled', true);
};
