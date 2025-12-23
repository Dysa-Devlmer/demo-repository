import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger, OnModuleDestroy, UsePipes, ValidationPipe } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

interface ConnectedClient {
  id: string;
  userId?: number;
  role?: string;
  joinedAt: Date;
  lastActivity: Date;
  rooms: Set<string>;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file' | 'system';
  metadata?: any;
}

export interface BotStatus {
  isOnline: boolean;
  activeConversations: number;
  totalMessagesToday: number;
  averageResponseTime: number;
  lastActivity: Date;
}

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: [
      'http://localhost:3001', // Admin Panel
      'http://localhost:3002', // Widget Web
      'http://localhost:8080', // Electron App
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class WebSocketsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleDestroy
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebSocketsGateway.name);
  private connectedClients = new Map<string, ConnectedClient>();
  private activeChatRooms = new Map<string, Set<string>>();
  private statusInterval?: NodeJS.Timeout;
  private botStatus: BotStatus = {
    isOnline: true,
    activeConversations: 0,
    totalMessagesToday: 0,
    averageResponseTime: 1200, // ms
    lastActivity: new Date(),
  };

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');

    // Emit bot status every 30 seconds
    this.statusInterval = setInterval(() => {
      this.broadcastBotStatus();
    }, 30000);
    this.statusInterval.unref?.();
  }

  onModuleDestroy() {
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
      this.statusInterval = undefined;
    }
  }

  async handleConnection(client: Socket, ...args: any[]) {
    try {
      const clientInfo: ConnectedClient = {
        id: client.id,
        joinedAt: new Date(),
        lastActivity: new Date(),
        rooms: new Set(),
      };

      // Extract user info from handshake if authenticated
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization;
      if (token) {
        // Here you would verify JWT token and extract user info
        // clientInfo.userId = decodedToken.userId
        // clientInfo.role = decodedToken.role
      }

      this.connectedClients.set(client.id, clientInfo);

      this.logger.log(`Client connected: ${client.id}`);

      // Send initial data
      client.emit('bot-status', this.botStatus);
      client.emit('connection-confirmed', {
        clientId: client.id,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error('Connection error:', error.message);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const clientInfo = this.connectedClients.get(client.id);

    if (clientInfo) {
      // Remove from all rooms
      clientInfo.rooms.forEach((room) => {
        const roomClients = this.activeChatRooms.get(room);
        if (roomClients) {
          roomClients.delete(client.id);
          if (roomClients.size === 0) {
            this.activeChatRooms.delete(room);
          }
        }
      });

      this.connectedClients.delete(client.id);
    }

    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-chat-room')
  async handleJoinChatRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; userInfo?: any }
  ) {
    try {
      const clientInfo = this.connectedClients.get(client.id);
      if (!clientInfo) return;

      const { roomId, userInfo } = data;

      // Join socket room
      await client.join(roomId);

      // Track in our maps
      clientInfo.rooms.add(roomId);

      if (!this.activeChatRooms.has(roomId)) {
        this.activeChatRooms.set(roomId, new Set());
      }
      this.activeChatRooms.get(roomId)!.add(client.id);

      this.logger.log(`Client ${client.id} joined room: ${roomId}`);

      // Notify room about new participant
      client.to(roomId).emit('user-joined', {
        clientId: client.id,
        userInfo,
        timestamp: new Date(),
      });

      // Send room info to client
      client.emit('room-joined', {
        roomId,
        participantCount: this.activeChatRooms.get(roomId)?.size || 0,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error('Join room error:', error.message);
      client.emit('error', { message: 'Failed to join chat room' });
    }
  }

  @SubscribeMessage('leave-chat-room')
  async handleLeaveChatRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string }
  ) {
    try {
      const clientInfo = this.connectedClients.get(client.id);
      if (!clientInfo) return;

      const { roomId } = data;

      // Leave socket room
      await client.leave(roomId);

      // Remove from our tracking
      clientInfo.rooms.delete(roomId);

      const roomClients = this.activeChatRooms.get(roomId);
      if (roomClients) {
        roomClients.delete(client.id);
        if (roomClients.size === 0) {
          this.activeChatRooms.delete(roomId);
        }
      }

      this.logger.log(`Client ${client.id} left room: ${roomId}`);

      // Notify room about participant leaving
      client.to(roomId).emit('user-left', {
        clientId: client.id,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error('Leave room error:', error.message);
    }
  }

  @SubscribeMessage('send-message')
  @UsePipes(new ValidationPipe())
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      roomId: string;
      message: string;
      type?: 'text' | 'image' | 'file';
      metadata?: any;
    }
  ) {
    try {
      const clientInfo = this.connectedClients.get(client.id);
      if (!clientInfo) return;

      const { roomId, message, type = 'text', metadata } = data;

      if (!clientInfo.rooms.has(roomId)) {
        client.emit('error', { message: 'You are not in this room' });
        return;
      }

      const chatMessage: ChatMessage = {
        id: `msg_${Date.now()}_${client.id}`,
        senderId: client.id,
        senderName: clientInfo.userId ? `User_${clientInfo.userId}` : 'Guest',
        message,
        timestamp: new Date(),
        type,
        metadata,
      };

      // Update client activity
      clientInfo.lastActivity = new Date();

      // Broadcast message to room
      this.server.to(roomId).emit('new-message', chatMessage);

      // Update bot status
      this.botStatus.totalMessagesToday++;
      this.botStatus.lastActivity = new Date();

      this.logger.debug(`Message sent to room ${roomId}: ${message}`);
    } catch (error) {
      this.logger.error('Send message error:', error.message);
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  @SubscribeMessage('typing-start')
  async handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string }
  ) {
    const clientInfo = this.connectedClients.get(client.id);
    if (!clientInfo || !clientInfo.rooms.has(data.roomId)) return;

    client.to(data.roomId).emit('user-typing', {
      clientId: client.id,
      isTyping: true,
    });
  }

  @SubscribeMessage('typing-stop')
  async handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string }
  ) {
    const clientInfo = this.connectedClients.get(client.id);
    if (!clientInfo || !clientInfo.rooms.has(data.roomId)) return;

    client.to(data.roomId).emit('user-typing', {
      clientId: client.id,
      isTyping: false,
    });
  }

  @SubscribeMessage('request-bot-status')
  async handleRequestBotStatus(@ConnectedSocket() client: Socket) {
    client.emit('bot-status', this.botStatus);
  }

  // Admin-specific events
  @SubscribeMessage('admin-join')
  async handleAdminJoin(@ConnectedSocket() client: Socket) {
    await client.join('admin-room');

    client.emit('admin-data', {
      connectedClients: this.connectedClients.size,
      activeRooms: this.activeChatRooms.size,
      botStatus: this.botStatus,
    });

    this.logger.log(`Admin client joined: ${client.id}`);
  }

  // Public methods for emitting events from other services
  emitToRoom(roomId: string, event: string, data: any) {
    this.server.to(roomId).emit(event, data);
  }

  emitToAll(event: string, data: any) {
    this.server.emit(event, data);
  }

  emitToAdmins(event: string, data: any) {
    this.server.to('admin-room').emit(event, data);
  }

  emitBotMessage(roomId: string, message: string, metadata?: any) {
    const botMessage: ChatMessage = {
      id: `bot_${Date.now()}`,
      senderId: 'dysabot',
      senderName: '🤖 ChefBot Dysa',
      message,
      timestamp: new Date(),
      type: 'text',
      metadata,
    };

    this.server.to(roomId).emit('new-message', botMessage);

    // Update bot status
    this.botStatus.lastActivity = new Date();
    this.broadcastBotStatus();
  }

  updateBotStatus(updates: Partial<BotStatus>) {
    this.botStatus = { ...this.botStatus, ...updates };
    this.broadcastBotStatus();
  }

  private broadcastBotStatus() {
    // Update active conversations count
    this.botStatus.activeConversations = this.activeChatRooms.size;

    this.server.emit('bot-status-update', this.botStatus);
    this.emitToAdmins('bot-status', this.botStatus);
  }

  // Notification methods
  notifyNewOrder(orderData: any) {
    this.emitToAdmins('new-order', {
      ...orderData,
      timestamp: new Date(),
    });
  }

  notifyNewReservation(reservationData: any) {
    this.emitToAdmins('new-reservation', {
      ...reservationData,
      timestamp: new Date(),
    });
  }

  notifyWhatsAppMessage(messageData: any) {
    this.emitToAdmins('whatsapp-message', {
      ...messageData,
      timestamp: new Date(),
    });
  }

  /**
   * Notify about message delivery status updates (sent, delivered, read, failed)
   */
  notifyMessageStatusUpdate(statusData: {
    messageId: number;
    whatsappMessageId: string;
    status: 'sent' | 'delivered' | 'read' | 'failed';
    timestamp: string;
    conversationId: number;
  }) {
    this.emitToAdmins('message-status-update', {
      ...statusData,
      receivedAt: new Date(),
    });

    // Also emit to the specific conversation room if someone is watching
    this.emitToRoom(
      `conversation-${statusData.conversationId}`,
      'message-status-update',
      statusData
    );

    this.logger.debug(
      `Message status update: ${statusData.whatsappMessageId} -> ${statusData.status}`
    );
  }

  notifyVoiceCall(callData: any) {
    this.emitToAdmins('voice-call', {
      ...callData,
      timestamp: new Date(),
    });
  }

  getGatewayStats() {
    return {
      connectedClients: this.connectedClients.size,
      activeRooms: this.activeChatRooms.size,
      botStatus: this.botStatus,
      uptime: process.uptime(),
    };
  }
}
