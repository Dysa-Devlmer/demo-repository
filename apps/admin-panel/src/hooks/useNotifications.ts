import { useState, useEffect } from 'react';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  icon?: string;
  link?: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Cargar notificaciones reales (por ahora vacío, se puede implementar endpoint en backend)
  useEffect(() => {
    // TODO: Implementar endpoint /api/notifications en el backend
    // Por ahora, mantener vacío hasta que se implemente la funcionalidad real
    const loadNotifications = async () => {
      try {
        // Cuando el backend tenga el endpoint, descomentar:
        // const response = await fetch(`${API_URL}/api/notifications`);
        // const result = await response.json();
        // setNotifications(result.data || []);
        // setUnreadCount(result.data?.filter((n: Notification) => !n.read).length || 0);

        // Por ahora: sin notificaciones mock
        setNotifications([]);
        setUnreadCount(0);
      } catch (error) {
        console.error('Error loading notifications:', error);
        setNotifications([]);
        setUnreadCount(0);
      }
    };

    loadNotifications();
  }, []);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    setUnreadCount(0);
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  };
}
