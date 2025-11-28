/**
 * ID Formatter Utilities
 * Formatea IDs numéricos en formatos profesionales Enterprise
 */

export interface IdFormat {
  full: string;        // CBDYSA-USR-000001
  short: string;       // USR-000001
  numeric: number;     // 1
  display: string;     // CBDYSA-USR-000001
}

/**
 * Formatea un ID de usuario en formato profesional
 * @param id - ID numérico del usuario
 * @returns Formato profesional: CBDYSA-USR-XXXXXX
 * @example formatUserId(1) => "CBDYSA-USR-000001"
 */
export function formatUserId(id: number): string {
  const paddedId = id.toString().padStart(6, '0');
  return `CBDYSA-USR-${paddedId}`;
}

/**
 * Formatea un ID de orden en formato profesional
 * @param id - ID numérico de la orden
 * @returns Formato profesional: CBDYSA-ORD-XXXXXX
 * @example formatOrderId(42) => "CBDYSA-ORD-000042"
 */
export function formatOrderId(id: number): string {
  const paddedId = id.toString().padStart(6, '0');
  return `CBDYSA-ORD-${paddedId}`;
}

/**
 * Formatea un ID de reserva en formato profesional
 * @param id - ID numérico de la reserva
 * @returns Formato profesional: CBDYSA-RSV-XXXXXX
 * @example formatReservationId(7) => "CBDYSA-RSV-000007"
 */
export function formatReservationId(id: number): string {
  const paddedId = id.toString().padStart(6, '0');
  return `CBDYSA-RSV-${paddedId}`;
}

/**
 * Formatea un ID de cliente en formato profesional
 * @param id - ID numérico del cliente
 * @returns Formato profesional: CBDYSA-CLI-XXXXXX
 * @example formatCustomerId(123) => "CBDYSA-CLI-000123"
 */
export function formatCustomerId(id: number): string {
  const paddedId = id.toString().padStart(6, '0');
  return `CBDYSA-CLI-${paddedId}`;
}

/**
 * Formatea un ID de rol en formato profesional
 * @param id - ID numérico del rol
 * @returns Formato profesional: CBDYSA-ROL-XXXXXX
 * @example formatRoleId(3) => "CBDYSA-ROL-000003"
 */
export function formatRoleId(id: number): string {
  const paddedId = id.toString().padStart(6, '0');
  return `CBDYSA-ROL-${paddedId}`;
}

/**
 * Formatea un ID de conversación en formato profesional
 * @param id - ID numérico de la conversación
 * @returns Formato profesional: CBDYSA-CNV-XXXXXX
 * @example formatConversationId(89) => "CBDYSA-CNV-000089"
 */
export function formatConversationId(id: number): string {
  const paddedId = id.toString().padStart(6, '0');
  return `CBDYSA-CNV-${paddedId}`;
}

/**
 * Formatea un ID genérico en formato profesional
 * @param id - ID numérico
 * @param type - Tipo de entidad (USR, ORD, RSV, etc.)
 * @param padding - Cantidad de dígitos (default: 6)
 * @returns Formato profesional: CBDYSA-TYPE-XXXXXX
 * @example formatGenericId(5, "MNU") => "CBDYSA-MNU-000005"
 */
export function formatGenericId(id: number, type: string, padding: number = 6): string {
  const paddedId = id.toString().padStart(padding, '0');
  return `CBDYSA-${type.toUpperCase()}-${paddedId}`;
}

/**
 * Extrae el ID numérico de un ID formateado
 * @param formattedId - ID en formato profesional
 * @returns ID numérico extraído
 * @example extractNumericId("CBDYSA-USR-000001") => 1
 */
export function extractNumericId(formattedId: string): number | null {
  const match = formattedId.match(/CBDYSA-[A-Z]+-(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Valida si un string es un ID formateado válido
 * @param id - String a validar
 * @returns true si es un ID válido
 * @example isValidFormattedId("CBDYSA-USR-000001") => true
 */
export function isValidFormattedId(id: string): boolean {
  return /^CBDYSA-[A-Z]+-\d{6}$/.test(id);
}

/**
 * Obtiene información completa de un ID formateado
 * @param id - ID numérico
 * @param type - Tipo de entidad
 * @returns Objeto con información del ID
 */
export function getIdInfo(id: number, type: string): IdFormat {
  const full = formatGenericId(id, type);
  const paddedId = id.toString().padStart(6, '0');
  const short = `${type.toUpperCase()}-${paddedId}`;

  return {
    full,
    short,
    numeric: id,
    display: full
  };
}

/**
 * Mapa de tipos de entidades
 */
export const ID_TYPES = {
  USER: 'USR',
  ORDER: 'ORD',
  RESERVATION: 'RSV',
  CUSTOMER: 'CLI',
  ROLE: 'ROL',
  CONVERSATION: 'CNV',
  MENU: 'MNU',
  PROMOTION: 'PRM',
  REPORT: 'RPT',
} as const;

export type IdType = typeof ID_TYPES[keyof typeof ID_TYPES];
