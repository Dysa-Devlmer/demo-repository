'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface WhatsAppMessage {
  from: string;
  message: string;
  response: string;
  timestamp: Date;
  success: boolean;
  conversationId?: number;
  customerId?: number;
}

interface UseWebSocketOptions {
  autoConnect?: boolean;
  onWhatsAppMessage?: (data: WhatsAppMessage) => void;
  onNewOrder?: (data: any) => void;
  onNewReservation?: (data: any) => void;
  onBotStatus?: (data: any) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WhatsAppMessage | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL ||
                  process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ||
                  'http://localhost:8005';

    socketRef.current = io(`${wsUrl}/chat`, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current.on('connect', () => {
      console.log('🔌 WebSocket connected');
      setIsConnected(true);
      // Join admin room for real-time updates
      socketRef.current?.emit('admin-join');
    });

    socketRef.current.on('disconnect', () => {
      console.log('🔌 WebSocket disconnected');
      setIsConnected(false);
    });

    // WhatsApp message events
    socketRef.current.on('whatsapp-message', (data: WhatsAppMessage) => {
      console.log('📱 WhatsApp message received:', data);
      setLastMessage(data);
      options.onWhatsAppMessage?.(data);
    });

    // Order events
    socketRef.current.on('new-order', (data: any) => {
      console.log('🍽️ New order received:', data);
      options.onNewOrder?.(data);
    });

    // Reservation events
    socketRef.current.on('new-reservation', (data: any) => {
      console.log('📅 New reservation received:', data);
      options.onNewReservation?.(data);
    });

    // Bot status events
    socketRef.current.on('bot-status', (data: any) => {
      options.onBotStatus?.(data);
    });

    socketRef.current.on('bot-status-update', (data: any) => {
      options.onBotStatus?.(data);
    });

    // Admin data on connection
    socketRef.current.on('admin-data', (data: any) => {
      console.log('👤 Admin data received:', data);
    });

    socketRef.current.on('connect_error', (error: Error) => {
      console.warn('WebSocket connection error:', error.message);
    });

  }, [options]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const joinRoom = useCallback((roomId: string) => {
    socketRef.current?.emit('join-chat-room', { roomId });
  }, []);

  const leaveRoom = useCallback((roomId: string) => {
    socketRef.current?.emit('leave-chat-room', { roomId });
  }, []);

  const sendMessage = useCallback((roomId: string, message: string) => {
    socketRef.current?.emit('send-message', { roomId, message });
  }, []);

  useEffect(() => {
    if (options.autoConnect !== false) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [connect, disconnect, options.autoConnect]);

  return {
    isConnected,
    lastMessage,
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    sendMessage,
    socket: socketRef.current,
  };
}

export default useWebSocket;
