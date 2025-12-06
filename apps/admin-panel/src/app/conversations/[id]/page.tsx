'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send, Phone, MessageSquare, MoreVertical, User, CheckCircle, Check, CheckCheck, Clock, AlertCircle, Bot, UserCheck, Zap, Image, Mic, Video, FileText, MapPin, Sticker, Contact } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTranslation } from '@/hooks/useTranslation';
import useDemoMode from '@/hooks/useDemoMode';
import MainLayout from '@/components/layout/main-layout';
import { apiService } from '@/lib/api';

interface Message {
  id: string;
  content: string;
  sender: 'customer' | 'agent' | 'bot';
  timestamp: string;
  delivered: boolean;
  delivery_status?: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  type?: 'text' | 'image' | 'audio' | 'video' | 'document' | 'location' | 'sticker' | 'contacts';
  media?: {
    media_id?: string;
    mime_type?: string;
    caption?: string;
    filename?: string;
    is_voice?: boolean;
  };
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
  };
}

interface ConversationDetails {
  id: string;
  customerName: string;
  customerPhone: string;
  channel: 'whatsapp' | 'phone' | 'web';
  status: 'active' | 'waiting' | 'closed';
  assignedAgent?: string;
  startedAt: string;
  messages: Message[];
  mode?: 'auto' | 'manual' | 'hybrid';
}

export default function ConversationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const { isDemoMode } = useDemoMode();
  const [conversation, setConversation] = useState<ConversationDetails | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const conversationId = params?.id as string;

  useEffect(() => {
    const fetchConversation = async () => {
      setLoading(true);

      // Only use mock data in demo mode
      if (isDemoMode) {
        const mockConversation: ConversationDetails = {
          id: conversationId,
          customerName: "María González",
          customerPhone: "+56 9 8765 4321",
          channel: "whatsapp",
          status: "active",
          assignedAgent: "Juan Pérez",
          startedAt: "2025-01-20T19:30:00Z",
          mode: "auto",
          messages: [
            {
              id: "1",
              content: "Hola, me gustaría hacer una reserva para esta noche",
              sender: "customer",
              timestamp: "2025-01-20T19:30:00Z",
              delivered: true,
            },
            {
              id: "2",
              content: "¡Hola María! Por supuesto, estaré encantado de ayudarte con tu reserva. ¿Para cuántas personas sería?",
              sender: "bot",
              timestamp: "2025-01-20T19:30:30Z",
              delivered: true,
            },
            {
              id: "3",
              content: "Para 4 personas, por favor",
              sender: "customer",
              timestamp: "2025-01-20T19:31:00Z",
              delivered: true,
            },
            {
              id: "4",
              content: "Perfecto, ¿tienes alguna preferencia de horario? Tenemos disponibilidad a las 20:00, 20:30 y 21:00",
              sender: "agent",
              timestamp: "2025-01-20T19:31:30Z",
              delivered: true,
            },
            {
              id: "5",
              content: "Me gustaría a las 20:30, ¿es posible?",
              sender: "customer",
              timestamp: "2025-01-20T19:32:00Z",
              delivered: true,
            },
          ],
        };

        setConversation(mockConversation);
        setLoading(false);
        return;
      }

      // In production mode, load real conversation from API
      try {
        const response = await apiService.conversations.getById(parseInt(conversationId));
        const backendData = response.data;

        // Map backend data to frontend format
        const mappedConversation: ConversationDetails = {
          id: backendData.id.toString(),
          customerName: backendData.customer?.name || 'Cliente desconocido',
          customerPhone: backendData.customer?.phone || '',
          channel: backendData.channel === 'whatsapp' ? 'whatsapp' :
                   backendData.channel === 'phone' ? 'phone' : 'web',
          status: backendData.status as 'active' | 'waiting' | 'closed',
          assignedAgent: backendData.agent_id || undefined,
          startedAt: backendData.created_at,
          mode: backendData.mode || 'auto',
          messages: (backendData.messages || []).map((msg: any) => ({
            id: msg.id.toString(),
            content: msg.content,
            sender: msg.role === 'user' ? 'customer' :
                    msg.role === 'bot' ? 'bot' : 'agent',
            timestamp: msg.created_at,
            delivered: msg.is_delivered ?? true,
            delivery_status: msg.delivery_status || (msg.role === 'user' ? 'delivered' : 'sent'),
            type: msg.metadata?.message_type || msg.type || 'text',
            media: msg.metadata?.media,
            location: msg.metadata?.location,
          })),
        };

        setConversation(mappedConversation);
      } catch (error) {
        console.error('Error loading conversation:', error);
        setConversation(null);
      } finally {
        setLoading(false);
      }
    };

    fetchConversation();
  }, [conversationId, isDemoMode]);

  const [sendingMessage, setSendingMessage] = useState(false);
  const [lastWhatsAppStatus, setLastWhatsAppStatus] = useState<boolean | null>(null);

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversation || sendingMessage) return;

    setSendingMessage(true);
    setLastWhatsAppStatus(null);

    try {
      // In demo mode, add locally
      if (isDemoMode) {
        const message: Message = {
          id: Date.now().toString(),
          content: newMessage,
          sender: 'agent',
          timestamp: new Date().toISOString(),
          delivered: true,
        };

        setConversation({
          ...conversation,
          messages: [...conversation.messages, message],
        });

        setNewMessage('');
        setSendingMessage(false);
        return;
      }

      // In production mode, send to API
      const response = await apiService.conversations.sendMessage(
        parseInt(conversationId),
        newMessage
      );

      // Check if WhatsApp was sent
      const whatsappSent = response.data?.whatsapp_sent || response.data?.data?.whatsapp_sent;
      setLastWhatsAppStatus(whatsappSent);

      // Show WhatsApp status for 3 seconds
      setTimeout(() => setLastWhatsAppStatus(null), 3000);

      // Add the message sent by agent and AI response to the conversation
      const agentMessage: Message = {
        id: Date.now().toString(),
        content: newMessage,
        sender: 'agent',
        timestamp: new Date().toISOString(),
        delivered: whatsappSent ?? true,
      };

      const messages = [agentMessage];

      // If there's an AI response, add it too
      if (response.data.ai_response) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: response.data.ai_response,
          sender: 'bot',
          timestamp: new Date().toISOString(),
          delivered: true,
        };
        messages.push(aiMessage);
      }

      setConversation({
        ...conversation,
        messages: [...conversation.messages, ...messages],
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error al enviar el mensaje. Por favor intenta de nuevo.');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleCloseConversation = async () => {
    if (!conversation) return;

    const confirmed = confirm('¿Estás seguro de que quieres cerrar esta conversación?');
    if (!confirmed) return;

    try {
      if (isDemoMode) {
        setConversation({
          ...conversation,
          status: 'closed',
        });
        alert('Conversación cerrada exitosamente (modo demo)');
        return;
      }

      await apiService.conversations.update(parseInt(conversationId), {
        status: 'closed',
      });

      setConversation({
        ...conversation,
        status: 'closed',
      });

      alert('Conversación cerrada exitosamente');
    } catch (error) {
      console.error('Error closing conversation:', error);
      alert('Error al cerrar la conversación. Por favor intenta de nuevo.');
    }
  };

  const [assigningAgent, setAssigningAgent] = useState(false);
  const [changingMode, setChangingMode] = useState(false);

  const handleModeChange = async (newMode: 'auto' | 'manual' | 'hybrid') => {
    if (!conversation || changingMode) return;

    setChangingMode(true);

    try {
      if (isDemoMode) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setConversation({
          ...conversation,
          mode: newMode,
        });
        setChangingMode(false);
        return;
      }

      await apiService.conversations.update(parseInt(conversationId), {
        mode: newMode,
      });

      setConversation({
        ...conversation,
        mode: newMode,
      });
    } catch (error) {
      console.error('Error changing mode:', error);
      alert('Error al cambiar el modo. Por favor intenta de nuevo.');
    } finally {
      setChangingMode(false);
    }
  };

  const handleAssignAgent = async () => {
    if (!conversation) return;

    const agentName = prompt('Ingresa el nombre del agente a asignar:');
    if (!agentName || !agentName.trim()) return;

    setAssigningAgent(true);

    try {
      if (isDemoMode) {
        // Simular delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setConversation({
          ...conversation,
          assignedAgent: agentName.trim(),
        });
        setAssigningAgent(false);
        return;
      }

      await apiService.conversations.update(parseInt(conversationId), {
        agent_id: agentName.trim(),
      });

      setConversation({
        ...conversation,
        assignedAgent: agentName.trim(),
      });
    } catch (error) {
      console.error('Error assigning agent:', error);
      alert('Error al asignar agente. Por favor intenta de nuevo.');
    } finally {
      setAssigningAgent(false);
    }
  };

  const handleViewHistory = () => {
    if (!conversation) return;

    const history = conversation.messages
      .map((msg, i) => `${i + 1}. [${msg.sender}] ${new Date(msg.timestamp).toLocaleString()}: ${msg.content}`)
      .join('\n\n');

    alert(`Historial completo de la conversación:\n\n${history}`);
  };

  const handleExportConversation = () => {
    if (!conversation) return;

    const exportData = {
      conversation_id: conversation.id,
      customer: {
        name: conversation.customerName,
        phone: conversation.customerPhone,
      },
      channel: conversation.channel,
      status: conversation.status,
      started_at: conversation.startedAt,
      messages: conversation.messages.map(msg => ({
        sender: msg.sender,
        content: msg.content,
        timestamp: msg.timestamp,
      })),
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `conversation_${conversation.id}_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    alert('Conversación exportada exitosamente');
  };

  const handleDeleteConversation = async () => {
    if (!conversation) return;

    const confirmed = confirm('⚠️ ¿ESTÁS SEGURO de que quieres ELIMINAR esta conversación? Esta acción NO se puede deshacer.');
    if (!confirmed) return;

    const doubleConfirm = confirm('⚠️ ÚLTIMA CONFIRMACIÓN: ¿Realmente quieres eliminar esta conversación permanentemente?');
    if (!doubleConfirm) return;

    try {
      if (isDemoMode) {
        alert('Conversación eliminada (modo demo)');
        router.push('/conversations');
        return;
      }

      await apiService.conversations.delete(parseInt(conversationId));
      alert('Conversación eliminada exitosamente');
      router.push('/conversations');
    } catch (error) {
      console.error('Error deleting conversation:', error);
      alert('Error al eliminar la conversación. Por favor intenta de nuevo.');
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp':
        return <MessageSquare className="h-4 w-4" />;
      case 'phone':
        return <Phone className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get mode icon and label
  const getModeInfo = (mode?: string) => {
    switch (mode) {
      case 'auto':
        return { icon: <Bot className="h-3 w-3" />, label: 'Auto', color: 'text-green-600', description: 'Bot responde automáticamente' };
      case 'manual':
        return { icon: <UserCheck className="h-3 w-3" />, label: 'Manual', color: 'text-orange-600', description: 'Solo agente humano responde' };
      case 'hybrid':
        return { icon: <Zap className="h-3 w-3" />, label: 'Híbrido', color: 'text-blue-600', description: 'Bot + agente pueden responder' };
      default:
        return { icon: <Bot className="h-3 w-3" />, label: 'Auto', color: 'text-green-600', description: 'Bot responde automáticamente' };
    }
  };

  // Render message type icon
  const renderMessageTypeIcon = (type?: string) => {
    switch (type) {
      case 'image':
        return <Image className="h-4 w-4 mr-1 inline" />;
      case 'audio':
        return <Mic className="h-4 w-4 mr-1 inline" />;
      case 'video':
        return <Video className="h-4 w-4 mr-1 inline" />;
      case 'document':
        return <FileText className="h-4 w-4 mr-1 inline" />;
      case 'location':
        return <MapPin className="h-4 w-4 mr-1 inline" />;
      case 'sticker':
        return <Sticker className="h-4 w-4 mr-1 inline" />;
      case 'contacts':
        return <Contact className="h-4 w-4 mr-1 inline" />;
      default:
        return null;
    }
  };

  // Render message content with media support
  const renderMessageContent = (message: Message) => {
    const typeIcon = renderMessageTypeIcon(message.type);

    // Special rendering for location
    if (message.type === 'location' && message.location) {
      return (
        <div className="space-y-1">
          <p className="text-sm">
            {typeIcon}
            {message.location.name || message.location.address || 'Ubicación compartida'}
          </p>
          <a
            href={`https://maps.google.com/?q=${message.location.latitude},${message.location.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs underline opacity-80 hover:opacity-100"
          >
            Ver en Google Maps
          </a>
        </div>
      );
    }

    // Special rendering for media types
    if (message.type && ['image', 'audio', 'video', 'document', 'sticker'].includes(message.type)) {
      return (
        <div className="space-y-1">
          <p className="text-sm">
            {typeIcon}
            {message.content}
          </p>
          {message.media?.filename && (
            <p className="text-xs opacity-70">
              Archivo: {message.media.filename}
            </p>
          )}
          {message.media?.is_voice && (
            <p className="text-xs opacity-70">Nota de voz</p>
          )}
        </div>
      );
    }

    // Default text rendering
    return <p className="text-sm">{message.content}</p>;
  };

  // Render delivery status icon (WhatsApp-style check marks)
  const renderDeliveryStatus = (status?: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-3 w-3 opacity-60" title="Enviando..." />;
      case 'sent':
        return <Check className="h-3 w-3 opacity-70" title="Enviado" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 opacity-70" title="Entregado" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-400" title="Leído" />;
      case 'failed':
        return <AlertCircle className="h-3 w-3 text-red-400" title="Error al enviar" />;
      default:
        return <Check className="h-3 w-3 opacity-50" />;
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t('conversations.loadingConversation') || 'Cargando conversación...'}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!conversation) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center">{t('conversations.conversationNotFound') || 'Conversación no encontrada'}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                La conversación solicitada no existe o ha sido eliminada.
              </p>
              <Button onClick={() => router.push('/conversations')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a conversaciones
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 border-b bg-muted/40 p-3 sm:p-4">
        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            {getChannelIcon(conversation.channel)}
            <div>
              <h2 className="text-sm sm:text-base font-semibold">{conversation.customerName}</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">{conversation.customerPhone}</p>
            </div>
          </div>
          <Badge className={getStatusColor(conversation.status)}>
            {conversation.status === 'active' ? t('conversations.active') :
             conversation.status === 'waiting' ? t('conversations.waiting') : t('conversations.closed')}
          </Badge>
          {conversation.assignedAgent && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <User className="h-3 w-3 mr-1" />
              {conversation.assignedAgent}
            </Badge>
          )}
          {/* Mode Selector */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="ml-2">
                  <Select
                    value={conversation.mode || 'auto'}
                    onValueChange={(value) => handleModeChange(value as 'auto' | 'manual' | 'hybrid')}
                    disabled={changingMode}
                  >
                    <SelectTrigger className="w-[120px] h-8 text-xs">
                      <SelectValue>
                        <span className={`flex items-center gap-1 ${getModeInfo(conversation.mode).color}`}>
                          {getModeInfo(conversation.mode).icon}
                          {getModeInfo(conversation.mode).label}
                        </span>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">
                        <span className="flex items-center gap-2 text-green-600">
                          <Bot className="h-3 w-3" /> Auto
                        </span>
                      </SelectItem>
                      <SelectItem value="manual">
                        <span className="flex items-center gap-2 text-orange-600">
                          <UserCheck className="h-3 w-3" /> Manual
                        </span>
                      </SelectItem>
                      <SelectItem value="hybrid">
                        <span className="flex items-center gap-2 text-blue-600">
                          <Zap className="h-3 w-3" /> Híbrido
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{getModeInfo(conversation.mode).description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleCloseConversation}>
              {t('conversations.closeConversation') || 'Cerrar conversación'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleAssignAgent} disabled={assigningAgent}>
              {assigningAgent ? 'Asignando...' : (conversation.assignedAgent ? `Reasignar agente (actual: ${conversation.assignedAgent})` : (t('conversations.assignAgent') || 'Asignar agente'))}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleViewHistory}>
              {t('conversations.viewHistory') || 'Ver historial'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportConversation}>
              Exportar conversación
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDeleteConversation}
              className="text-red-600 focus:text-red-600"
            >
              Eliminar conversación
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {conversation.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'customer' ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-xs rounded-lg p-2 sm:p-3 ${
                  message.sender === 'customer'
                    ? 'bg-muted text-foreground'
                    : message.sender === 'bot'
                    ? 'bg-blue-500 text-white'
                    : 'bg-primary text-primary-foreground'
                }`}
              >
                {renderMessageContent(message)}
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="text-xs opacity-70">
                    {formatTime(message.timestamp)}
                  </span>
                  <div className="flex items-center gap-1">
                    {message.sender !== 'customer' && (
                      <span className="text-xs opacity-70">
                        {message.sender === 'bot' ? t('conversations.bot') : t('conversations.agent')}
                      </span>
                    )}
                    {/* Delivery status icon for outgoing messages */}
                    {message.sender !== 'customer' && renderDeliveryStatus(message.delivery_status)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="border-t p-3 sm:p-4">
        {/* WhatsApp status indicator */}
        {lastWhatsAppStatus !== null && (
          <div className={`mb-2 text-xs flex items-center gap-1 ${lastWhatsAppStatus ? 'text-green-600' : 'text-yellow-600'}`}>
            {lastWhatsAppStatus ? (
              <>
                <CheckCircle className="h-3 w-3" />
                Mensaje enviado por WhatsApp
              </>
            ) : (
              <>
                <MessageSquare className="h-3 w-3" />
                Mensaje guardado (WhatsApp no configurado)
              </>
            )}
          </div>
        )}
        <div className="flex gap-2">
          <Input
            placeholder={t('conversations.typeResponse')}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !sendingMessage && sendMessage()}
            disabled={sendingMessage}
          />
          <Button
            onClick={sendMessage}
            title={t('conversations.sendMessage')}
            disabled={sendingMessage || !newMessage.trim()}
          >
            {sendingMessage ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
    </MainLayout>
  );
}