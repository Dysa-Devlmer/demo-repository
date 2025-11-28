'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Phone, Users, Clock, Plus, Filter, Search, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { apiService } from '@/lib/api';
import { useTranslation } from '@/hooks/useTranslation';
import useDemoMode from '@/hooks/useDemoMode';
import MainLayout from '@/components/layout/main-layout';

interface Conversation {
  id: string;
  customerName: string;
  customerPhone: string;
  channel: 'whatsapp' | 'phone' | 'web';
  status: 'active' | 'waiting' | 'closed';
  lastMessage: string;
  lastActivity: string;
  messageCount: number;
}

interface ConversationStats {
  total: number;
  active: number;
  waiting: number;
  closed: number;
  avgResponseTime: string;
}

export default function ConversationsPage() {
  const router = useRouter();
  const { t, isLoading: translationsLoading } = useTranslation();
  const { isDemoMode, demoData } = useDemoMode();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');

  useEffect(() => {
    const fetchConversations = async () => {
      if (isDemoMode) {
        console.log('🚀 Demo mode detected - using mock conversations data');
        // Validate demoData exists and has conversations
        if (demoData && Array.isArray(demoData.conversations)) {
          setConversations(demoData.conversations);
        } else {
          console.warn('Demo data conversations not available, using empty array');
          setConversations([]);
        }
        setLoading(false);
        return;
      }

      try {
        const response = await apiService.conversations.getAll();
        setConversations(response.data);
      } catch (error) {
        console.error('Error loading conversations:', error);
        // Datos de demostración mejorados
        setConversations([
          {
            id: "1",
            customerName: "María González",
            customerPhone: "+52 55 1234 5678",
            channel: "whatsapp",
            status: "active",
            lastMessage: "Quiero hacer una reserva para esta noche",
            lastActivity: "Hace 2 min",
            messageCount: 8,
          },
          {
            id: "2",
            customerName: "Carlos Ruiz",
            customerPhone: "+52 55 8765 4321",
            channel: "phone",
            status: "waiting",
            lastMessage: "¿Tienen disponibilidad para mañana?",
            lastActivity: "Hace 15 min",
            messageCount: 3,
          },
          {
            id: "3",
            customerName: "Ana López",
            customerPhone: "+52 55 5555 5555",
            channel: "web",
            status: "closed",
            lastMessage: "Gracias por la información",
            lastActivity: "Hace 1 hora",
            messageCount: 12,
          },
          {
            id: "4",
            customerName: "Pedro Sánchez",
            customerPhone: "+52 55 9999 8888",
            channel: "whatsapp",
            status: "active",
            lastMessage: "¿Cuál es el menú del día?",
            lastActivity: "Hace 5 min",
            messageCount: 5,
          },
          {
            id: "5",
            customerName: "Laura Martínez",
            customerPhone: "+52 55 7777 6666",
            channel: "web",
            status: "waiting",
            lastMessage: "Necesito ayuda con mi pedido",
            lastActivity: "Hace 20 min",
            messageCount: 7,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [isDemoMode, demoData?.conversations]);

  // Calcular estadísticas
  const stats: ConversationStats = useMemo(() => {
    // Ensure conversations is an array
    const conversationsArray = Array.isArray(conversations) ? conversations : [];
    return {
      total: conversationsArray.length,
      active: conversationsArray.filter(c => c.status === 'active').length,
      waiting: conversationsArray.filter(c => c.status === 'waiting').length,
      closed: conversationsArray.filter(c => c.status === 'closed').length,
      avgResponseTime: '2.5 min',
    };
  }, [conversations]);

  // Filtrar conversaciones
  const filteredConversations = useMemo(() => {
    // Ensure conversations is an array
    const conversationsArray = Array.isArray(conversations) ? conversations : [];
    return conversationsArray.filter(conversation => {
      // Filtro de búsqueda
      const matchesSearch = searchQuery === '' ||
        conversation.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conversation.customerPhone.includes(searchQuery) ||
        conversation.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

      // Filtro de estado
      const matchesStatus = statusFilter === 'all' || conversation.status === statusFilter;

      // Filtro de canal
      const matchesChannel = channelFilter === 'all' || conversation.channel === channelFilter;

      return matchesSearch && matchesStatus && matchesChannel;
    });
  }, [conversations, searchQuery, statusFilter, channelFilter]);

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
        return 'bg-green-100 text-green-800 border-green-200';
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return t('conversations.active');
      case 'waiting':
        return t('conversations.waiting');
      case 'closed':
        return t('conversations.closed');
      default:
        return status;
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setChannelFilter('all');
  };

  if (loading || translationsLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('conversations.title')}</h1>
            <p className="text-muted-foreground mt-1">
              {t('conversations.activeChats')}
            </p>
          </div>
          <Button onClick={() => router.push('/conversations/new')} size="lg">
            <Plus className="h-4 w-4 mr-2" />
            {t('conversations.newConversation')}
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('conversations.conversations')}
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {t('dashboard.totalCount')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('conversations.active')}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <p className="text-xs text-muted-foreground">
                {t('dashboard.activeCount')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('conversations.waiting')}
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.waiting}</div>
              <p className="text-xs text-muted-foreground">
                {t('orders.requireAttention')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('conversations.closed')}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.closed}</div>
              <p className="text-xs text-muted-foreground">
                {t('orders.completed')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tiempo Promedio
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgResponseTime}</div>
              <p className="text-xs text-muted-foreground">
                Respuesta
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y Búsqueda */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Búsqueda */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('conversations.searchConversations')}
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Filtro de Estado */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder={t('conversations.filterByStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('conversations.all')}</SelectItem>
                  <SelectItem value="active">{t('conversations.active')}</SelectItem>
                  <SelectItem value="waiting">{t('conversations.waiting')}</SelectItem>
                  <SelectItem value="closed">{t('conversations.closed')}</SelectItem>
                </SelectContent>
              </Select>

              {/* Filtro de Canal */}
              <Select value={channelFilter} onValueChange={setChannelFilter}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder={t('conversations.filterByChannel')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('conversations.all')}</SelectItem>
                  <SelectItem value="whatsapp">{t('conversations.whatsapp')}</SelectItem>
                  <SelectItem value="phone">{t('conversations.phone')}</SelectItem>
                  <SelectItem value="web">{t('conversations.web')}</SelectItem>
                </SelectContent>
              </Select>

              {/* Botón Limpiar Filtros */}
              {(searchQuery || statusFilter !== 'all' || channelFilter !== 'all') && (
                <Button variant="outline" onClick={clearFilters}>
                  <Filter className="h-4 w-4 mr-2" />
                  Limpiar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lista de Conversaciones */}
        {filteredConversations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('conversations.noConversations')}</h3>
              <p className="text-muted-foreground text-center mb-6">
                {searchQuery || statusFilter !== 'all' || channelFilter !== 'all'
                  ? 'No se encontraron conversaciones con los filtros aplicados'
                  : t('conversations.startNewConversation')
                }
              </p>
              {(searchQuery || statusFilter !== 'all' || channelFilter !== 'all') ? (
                <Button variant="outline" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              ) : (
                <Button onClick={() => router.push('/conversations/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('conversations.newConversation')}
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredConversations.map((conversation) => (
              <Card
                key={conversation.id}
                className="hover:shadow-lg transition-all cursor-pointer hover:border-primary/50"
                onClick={() => router.push(`/conversations/${conversation.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Icono del Canal */}
                      <div className="mt-1">
                        {getChannelIcon(conversation.channel)}
                      </div>

                      {/* Información del Cliente */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{conversation.customerName}</h3>
                          <Badge className={getStatusColor(conversation.status)} variant="outline">
                            {getStatusLabel(conversation.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{conversation.customerPhone}</p>

                        {/* Último Mensaje */}
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm line-clamp-2">{conversation.lastMessage}</p>
                        </div>
                      </div>
                    </div>

                    {/* Información de la derecha */}
                    <div className="text-right ml-4 flex-shrink-0">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Clock className="h-4 w-4" />
                        <span>{conversation.lastActivity}</span>
                      </div>
                      <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
                        <MessageSquare className="h-4 w-4" />
                        <span className="font-medium">{conversation.messageCount} {t('conversations.messages')}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Información de resultados */}
        {filteredConversations.length > 0 && (
          <div className="text-sm text-muted-foreground text-center">
            Mostrando {filteredConversations.length} de {conversations.length} conversaciones
          </div>
        )}
      </div>
    </MainLayout>
  );
}
