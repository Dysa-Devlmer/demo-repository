/**
 * Validación de números telefónicos chilenos
 * Chile: +56 9 XXXX XXXX (celulares)
 * Chile: +56 2 XXXX XXXX (fijos Santiago)
 * Chile: +56 XX XXXX XXXX (fijos otras regiones)
 */

export const CHILE_COUNTRY_CODE = '56';
export const CHILE_MOBILE_PREFIX = '9';

/**
 * Valida si un número es un celular chileno válido
 * Formato aceptado: +56912345678, 56912345678, 912345678, 9 1234 5678
 */
export function isValidChileanMobile(phone: string): boolean {
  if (!phone) return false;

  // Remover espacios, guiones y paréntesis
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');

  // Patrón para celular chileno:
  // - Opcional: +56 o 56 al inicio
  // - Obligatorio: 9 (prefijo de celular)
  // - Obligatorio: 8 dígitos más
  const mobilePattern = /^(\+?56)?9\d{8}$/;

  return mobilePattern.test(cleaned);
}

/**
 * Valida si un número es un teléfono fijo chileno válido
 * Formatos: +56 2 XXXX XXXX (Santiago), +56 XX XXXX XXXX (otras regiones)
 */
export function isValidChileanLandline(phone: string): boolean {
  if (!phone) return false;

  // Remover espacios, guiones y paréntesis
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');

  // Patrón para teléfono fijo chileno:
  // - Opcional: +56 o 56 al inicio
  // - Para Santiago: 2 + 8 dígitos
  // - Para regiones: 1-2 dígitos de código de área + 7 dígitos
  const landlinePattern = /^(\+?56)?(2\d{8}|[3-9]\d{7,8})$/;

  return landlinePattern.test(cleaned);
}

/**
 * Valida si un número telefónico chileno es válido (móvil o fijo)
 */
export function isValidChileanPhone(phone: string): boolean {
  return isValidChileanMobile(phone) || isValidChileanLandline(phone);
}

/**
 * Formatea un número telefónico chileno al formato internacional estándar
 * Ejemplo: 912345678 -> +56 9 1234 5678
 */
export function formatChileanPhone(phone: string, withSpaces: boolean = true): string {
  if (!phone) return '';

  // Remover todo excepto dígitos y el símbolo +
  let cleaned = phone.replace(/[^\d+]/g, '');

  // Remover el + temporal si existe
  const hasPlus = cleaned.startsWith('+');
  cleaned = cleaned.replace(/^\+/, '');

  // Si no tiene código de país, agregarlo
  if (!cleaned.startsWith('56')) {
    cleaned = '56' + cleaned;
  }

  // Si tiene código de país repetido (ej: 5656), remover uno
  if (cleaned.startsWith('5656')) {
    cleaned = cleaned.substring(2);
  }

  // Formatear según sea móvil o fijo
  if (cleaned.length === 11 && cleaned[2] === '9') {
    // Celular: +56 9 XXXX XXXX
    if (withSpaces) {
      return `+${cleaned.substring(0, 2)} ${cleaned.substring(2, 3)} ${cleaned.substring(3, 7)} ${cleaned.substring(7)}`;
    }
    return `+${cleaned}`;
  } else if (cleaned.length >= 10) {
    // Fijo: +56 2 XXXX XXXX (Santiago) o +56 XX XXXX XXXX (regiones)
    if (cleaned[2] === '2' && cleaned.length === 11) {
      // Santiago
      if (withSpaces) {
        return `+${cleaned.substring(0, 2)} ${cleaned.substring(2, 3)} ${cleaned.substring(3, 7)} ${cleaned.substring(7)}`;
      }
      return `+${cleaned}`;
    } else {
      // Regiones
      const areaCode = cleaned.substring(2, cleaned.length - 7);
      const localNumber = cleaned.substring(cleaned.length - 7);
      if (withSpaces) {
        return `+${cleaned.substring(0, 2)} ${areaCode} ${localNumber.substring(0, 3)} ${localNumber.substring(3)}`;
      }
      return `+${cleaned}`;
    }
  }

  // Si no coincide con ningún formato, devolver con + al inicio si lo tenía
  return hasPlus ? `+${cleaned}` : cleaned;
}

/**
 * Normaliza un número telefónico chileno al formato E.164 (sin espacios)
 * Ejemplo: 9 1234 5678 -> +56912345678
 */
export function normalizeChileanPhone(phone: string): string {
  return formatChileanPhone(phone, false);
}

/**
 * Extrae solo los dígitos del número (sin código de país)
 * Ejemplo: +56 9 1234 5678 -> 912345678
 */
export function getPhoneDigits(phone: string): string {
  if (!phone) return '';

  let cleaned = phone.replace(/[^\d]/g, '');

  // Remover código de país si existe
  if (cleaned.startsWith('56')) {
    cleaned = cleaned.substring(2);
  }

  return cleaned;
}

/**
 * Obtiene el tipo de teléfono chileno
 */
export function getChileanPhoneType(phone: string): 'mobile' | 'landline' | 'unknown' {
  if (isValidChileanMobile(phone)) return 'mobile';
  if (isValidChileanLandline(phone)) return 'landline';
  return 'unknown';
}

/**
 * Valida y retorna mensajes de error descriptivos
 */
export function validateChileanPhoneWithMessage(phone: string): { valid: boolean; message?: string } {
  if (!phone || phone.trim() === '') {
    return { valid: false, message: 'El número de teléfono es requerido' };
  }

  const cleaned = phone.replace(/[\s\-\(\)]/g, '');

  // Verificar que contenga solo números, espacios, guiones, paréntesis y opcionalmente +
  if (!/^[\d\s\-\(\)+]+$/.test(phone)) {
    return { valid: false, message: 'El número contiene caracteres inválidos' };
  }

  // Verificar longitud mínima
  if (cleaned.replace(/^\+/, '').length < 9) {
    return { valid: false, message: 'El número es demasiado corto' };
  }

  // Verificar longitud máxima
  if (cleaned.replace(/^\+/, '').length > 13) {
    return { valid: false, message: 'El número es demasiado largo' };
  }

  // Validar formato chileno
  if (!isValidChileanPhone(phone)) {
    return {
      valid: false,
      message: 'Formato inválido. Use: +56 9 XXXX XXXX (celular) o +56 2 XXXX XXXX (fijo)',
    };
  }

  return { valid: true };
}

/**
 * Hook-friendly validator para formularios
 */
export const chileanPhoneValidator = (phone: string) => {
  const result = validateChileanPhoneWithMessage(phone);
  return result.valid ? true : result.message;
};
