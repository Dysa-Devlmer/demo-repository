import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { WebSocketsGateway } from '../../modules/websockets/websockets.gateway';

export interface RealtimeNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  priority: 'low' | 'normal' | 'high' | 'critical';
  timestamp: Date;
  read: boolean;
  sound?: boolean;
}

export enum NotificationType {
  NEW_ORDER = 'new_order',
  ORDER_STATUS_CHANGED = 'order_status_changed',
  NEW_RESERVATION = 'new_reservation',
  RESERVATION_CANCELLED = 'reservation_cancelled',
  NEW_PAYMENT = 'new_payment',
  PAYMENT_FAILED = 'payment_failed',
  NEW_CUSTOMER = 'new_customer',
  WHATSAPP_MESSAGE = 'whatsapp_message',
  LOW_STOCK = 'low_stock',
  SYSTEM_ALERT = 'system_alert',
  DAILY_SUMMARY = 'daily_summary',
}

// ============================================
// Data Interfaces for External Sources
// ============================================
export interface OrderNotificationData {
  id: number;
  order_number?: string;
  customer_name: string;
  total: number;
  items?: unknown[];
  order_type?: string;
  status?: string;
}

export interface ReservationNotificationData {
  id: number;
  customer_name: string;
  date: string;
  time: string;
  party_size: number;
  customer_phone?: string;
}

export interface PaymentNotificationData {
  id: number;
  amount: number;
  currency?: string;
  payer_email: string;
  plan_name?: string;
  status?: string;
}

export interface CustomerNotificationData {
  id: number;
  name?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone?: string;
}

export interface WhatsAppMessageData {
  id: number;
  from: string;
  body: string;
  timestamp?: string;
}

export interface DailySummaryData {
  totalOrders: number;
  totalRevenue?: number;
  [key: string]: unknown;
}

// ============================================
// Type Guards
// ============================================
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}

function isOrderNotificationData(value: unknown): value is OrderNotificationData {
  if (!isRecord(value)) return false;
  return isNumber(value.id) && isString(value.customer_name) && isNumber(value.total);
}

function isReservationNotificationData(value: unknown): value is ReservationNotificationData {
  if (!isRecord(value)) return false;
  return (
    isNumber(value.id) &&
    isString(value.customer_name) &&
    isString(value.date) &&
    isString(value.time) &&
    isNumber(value.party_size)
  );
}

function isPaymentNotificationData(value: unknown): value is PaymentNotificationData {
  if (!isRecord(value)) return false;
  return isNumber(value.id) && isNumber(value.amount) && isString(value.payer_email);
}

function isCustomerNotificationData(value: unknown): value is CustomerNotificationData {
  if (!isRecord(value)) return false;
  return isNumber(value.id) && isString(value.email);
}

function isWhatsAppMessageData(value: unknown): value is WhatsAppMessageData {
  if (!isRecord(value)) return false;
  return isNumber(value.id) && isString(value.from) && isString(value.body);
}

function isDailySummaryData(value: unknown): value is DailySummaryData {
  if (!isRecord(value)) return false;
  return isNumber(value.totalOrders);
}

@Injectable()
export class RealtimeNotificationService {
  private readonly logger = new Logger(RealtimeNotificationService.name);
  private notifications: Map<string, RealtimeNotification[]> = new Map();

  constructor(
    @Inject(forwardRef(() => WebSocketsGateway))
    private readonly wsGateway: WebSocketsGateway
  ) {}

  /**
   * Send notification to admin panel in real-time
   */
  // eslint-disable-next-line @typescript-eslint/require-await -- WebSocket emit is synchronous but method is async for consistency
  async notifyAdmins(
    notification: Omit<RealtimeNotification, 'id' | 'timestamp' | 'read'>
  ): Promise<void> {
    const fullNotification: RealtimeNotification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };

    this.logger.log(`Sending ${notification.type} notification to admins`);

    // Emit via WebSocket
    this.wsGateway.emitToAdmins('notification', fullNotification);

    // Play sound for high priority
    if (notification.priority === 'high' || notification.priority === 'critical') {
      this.wsGateway.emitToAdmins('play-sound', {
        type: notification.type,
        sound: notification.sound !== false ? this.getSoundForType(notification.type) : null,
      });
    }
  }

  /**
   * Notify when a new order is created
   */
  async notifyNewOrder(order: unknown): Promise<void> {
    if (!isOrderNotificationData(order)) {
      this.logger.warn('Invalid order data received for new order notification', { order });
      return;
    }

    await this.notifyAdmins({
      type: NotificationType.NEW_ORDER,
      title: 'Nuevo Pedido',
      message: `Pedido #${order.order_number ?? order.id} - ${order.customer_name} - $${order.total}`,
      data: {
        orderId: order.id,
        orderNumber: order.order_number ?? '',
        customerName: order.customer_name,
        total: order.total,
        items: order.items ?? [],
        type: order.order_type ?? 'regular',
      },
      priority: 'high',
      sound: true,
    });

    // Also emit the specific event
    this.wsGateway.notifyNewOrder(order);
  }

  /**
   * Notify when order status changes
   */
  async notifyOrderStatusChanged(order: unknown, previousStatus: string): Promise<void> {
    if (!isOrderNotificationData(order)) {
      this.logger.warn('Invalid order data received for status change notification', { order });
      return;
    }

    const statusLabels: Record<string, string> = {
      pending: 'Pendiente',
      confirmed: 'Confirmado',
      preparing: 'En Preparación',
      ready: 'Listo',
      delivered: 'Entregado',
      cancelled: 'Cancelado',
    };

    await this.notifyAdmins({
      type: NotificationType.ORDER_STATUS_CHANGED,
      title: 'Estado de Pedido Actualizado',
      message: `Pedido #${order.order_number ?? order.id} cambió de ${statusLabels[previousStatus] ?? previousStatus} a ${statusLabels[order.status ?? ''] ?? order.status ?? 'unknown'}`,
      data: {
        orderId: order.id,
        orderNumber: order.order_number ?? '',
        previousStatus,
        newStatus: order.status ?? 'unknown',
      },
      priority: 'normal',
    });
  }

  /**
   * Notify when a new reservation is created
   */
  async notifyNewReservation(reservation: unknown): Promise<void> {
    if (!isReservationNotificationData(reservation)) {
      this.logger.warn('Invalid reservation data received for new reservation notification', {
        reservation,
      });
      return;
    }

    const date = new Date(reservation.date).toLocaleDateString('es-CL');

    await this.notifyAdmins({
      type: NotificationType.NEW_RESERVATION,
      title: 'Nueva Reserva',
      message: `${reservation.customer_name} - ${date} ${reservation.time} - ${reservation.party_size} personas`,
      data: {
        reservationId: reservation.id,
        customerName: reservation.customer_name,
        date: reservation.date,
        time: reservation.time,
        partySize: reservation.party_size,
        phone: reservation.customer_phone ?? '',
      },
      priority: 'normal',
      sound: true,
    });

    this.wsGateway.notifyNewReservation(reservation);
  }

  /**
   * Notify when a reservation is cancelled
   */
  async notifyReservationCancelled(reservation: unknown, reason?: string): Promise<void> {
    if (!isReservationNotificationData(reservation)) {
      this.logger.warn('Invalid reservation data received for cancellation notification', {
        reservation,
      });
      return;
    }

    await this.notifyAdmins({
      type: NotificationType.RESERVATION_CANCELLED,
      title: 'Reserva Cancelada',
      message: `${reservation.customer_name} canceló su reserva para ${new Date(reservation.date).toLocaleDateString('es-CL')}`,
      data: {
        reservationId: reservation.id,
        customerName: reservation.customer_name,
        reason: reason ?? '',
      },
      priority: 'normal',
    });
  }

  /**
   * Notify when a payment is successful
   */
  async notifyNewPayment(payment: unknown): Promise<void> {
    if (!isPaymentNotificationData(payment)) {
      this.logger.warn('Invalid payment data received for new payment notification', { payment });
      return;
    }

    await this.notifyAdmins({
      type: NotificationType.NEW_PAYMENT,
      title: 'Pago Recibido',
      message: `Nuevo pago de $${payment.amount.toLocaleString('es-CL')} - ${payment.payer_email} - Plan ${payment.plan_name ?? 'N/A'}`,
      data: {
        paymentId: payment.id,
        amount: payment.amount,
        currency: payment.currency ?? 'CLP',
        payerEmail: payment.payer_email,
        planName: payment.plan_name ?? '',
        status: payment.status ?? 'completed',
      },
      priority: 'high',
      sound: true,
    });
  }

  /**
   * Notify when a payment fails
   */
  async notifyPaymentFailed(payment: unknown, reason: string): Promise<void> {
    if (!isPaymentNotificationData(payment)) {
      this.logger.warn('Invalid payment data received for failed payment notification', {
        payment,
      });
      return;
    }

    await this.notifyAdmins({
      type: NotificationType.PAYMENT_FAILED,
      title: 'Pago Fallido',
      message: `Pago rechazado para ${payment.payer_email} - ${reason}`,
      data: {
        paymentId: payment.id,
        payerEmail: payment.payer_email,
        reason,
        amount: payment.amount,
      },
      priority: 'high',
    });
  }

  /**
   * Notify when a new customer registers
   */
  async notifyNewCustomer(customer: unknown): Promise<void> {
    if (!isCustomerNotificationData(customer)) {
      this.logger.warn('Invalid customer data received for new customer notification', {
        customer,
      });
      return;
    }

    await this.notifyAdmins({
      type: NotificationType.NEW_CUSTOMER,
      title: 'Nuevo Cliente',
      message: `${customer.name ?? customer.first_name ?? 'Cliente'} se registró - ${customer.email}`,
      data: {
        customerId: customer.id,
        name: customer.name ?? `${customer.first_name ?? ''} ${customer.last_name ?? ''}`.trim(),
        email: customer.email,
        phone: customer.phone ?? '',
      },
      priority: 'normal',
    });
  }

  /**
   * Notify when a WhatsApp message is received
   */
  async notifyWhatsAppMessage(message: unknown): Promise<void> {
    if (!isWhatsAppMessageData(message)) {
      this.logger.warn('Invalid WhatsApp message data received for notification', { message });
      return;
    }

    await this.notifyAdmins({
      type: NotificationType.WHATSAPP_MESSAGE,
      title: 'Mensaje de WhatsApp',
      message: `De ${message.from}: ${message.body.substring(0, 100)}...`,
      data: {
        messageId: message.id,
        from: message.from,
        body: message.body,
        timestamp: message.timestamp ?? new Date().toISOString(),
      },
      priority: 'normal',
      sound: true,
    });

    this.wsGateway.notifyWhatsAppMessage(message);
  }

  /**
   * Send system alert
   */
  async sendSystemAlert(
    title: string,
    message: string,
    priority: 'normal' | 'high' | 'critical' = 'normal'
  ): Promise<void> {
    await this.notifyAdmins({
      type: NotificationType.SYSTEM_ALERT,
      title,
      message,
      priority,
      sound: priority !== 'normal',
    });
  }

  /**
   * Send daily summary
   */
  async sendDailySummary(summary: unknown): Promise<void> {
    if (!isDailySummaryData(summary)) {
      this.logger.warn('Invalid summary data received for daily summary notification', { summary });
      return;
    }

    await this.notifyAdmins({
      type: NotificationType.DAILY_SUMMARY,
      title: 'Resumen del Día',
      message: `${summary.totalOrders} pedidos - $${(summary.totalRevenue ?? 0).toLocaleString('es-CL')} en ventas`,
      data: summary,
      priority: 'low',
    });
  }

  /**
   * Get sound file for notification type
   */
  private getSoundForType(type: NotificationType): string {
    const sounds: Record<NotificationType, string> = {
      [NotificationType.NEW_ORDER]: 'new-order.mp3',
      [NotificationType.ORDER_STATUS_CHANGED]: 'status-change.mp3',
      [NotificationType.NEW_RESERVATION]: 'new-reservation.mp3',
      [NotificationType.RESERVATION_CANCELLED]: 'cancelled.mp3',
      [NotificationType.NEW_PAYMENT]: 'payment-success.mp3',
      [NotificationType.PAYMENT_FAILED]: 'payment-failed.mp3',
      [NotificationType.NEW_CUSTOMER]: 'new-customer.mp3',
      [NotificationType.WHATSAPP_MESSAGE]: 'message.mp3',
      [NotificationType.LOW_STOCK]: 'alert.mp3',
      [NotificationType.SYSTEM_ALERT]: 'alert.mp3',
      [NotificationType.DAILY_SUMMARY]: 'summary.mp3',
    };
    return sounds[type] || 'notification.mp3';
  }

  /**
   * Broadcast message to all connected clients
   */
  broadcastToAll(event: string, data: any): void {
    this.wsGateway.emitToAll(event, data);
  }

  /**
   * Get gateway statistics
   */
  getStats() {
    return this.wsGateway.getGatewayStats();
  }
}
