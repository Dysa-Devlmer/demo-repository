"use client";

import { useEffect, useState, useMemo } from "react";
import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  MoreHorizontal,
  Plus,
  Search,
  Filter,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Package,
  RefreshCw,
  Calendar
} from "lucide-react";
import { CreateOrderDialog } from "@/components/orders/CreateOrderDialog";
import { OrderDetailsDialog } from "@/components/orders/OrderDetailsDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from '@/hooks/useTranslation';
import { apiService } from '@/lib/api';
import useDemoMode from '@/hooks/useDemoMode';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/formatters';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  orderType: 'delivery' | 'pickup' | 'dine-in';
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryAddress?: string;
  notes?: string;
  estimatedTime?: number;
  createdAt: string;
}

interface OrderStats {
  total: number;
  pending: number;
  preparing: number;
  delivered: number;
  cancelled: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export default function OrdersPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isDemoMode, demoData, updateOrders, resetDemoData } = useDemoMode();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("today"); // "today", "yesterday", "week", "all", "specific"
  const [specificDate, setSpecificDate] = useState<string>(""); // Fecha específica en formato YYYY-MM-DD
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Función para mapear datos del backend (snake_case) al frontend (camelCase)
  const mapOrderFromBackend = (backendOrder: any): Order => {
    return {
      id: backendOrder.id,
      orderNumber: backendOrder.order_number || `ORDER-${backendOrder.id}`,
      customerName: backendOrder.customer_name || '',
      customerPhone: backendOrder.customer_phone || '',
      orderType: backendOrder.order_type || 'dine-in',
      status: backendOrder.status || 'pending',
      items: backendOrder.items || [],
      subtotal: Number(backendOrder.subtotal) || 0,
      deliveryFee: Number(backendOrder.delivery_fee) || 0,
      total: Number(backendOrder.total) || 0,
      deliveryAddress: backendOrder.delivery_address,
      notes: backendOrder.notes,
      estimatedTime: backendOrder.estimated_time,
      createdAt: backendOrder.created_at || backendOrder.createdAt || new Date().toISOString(),
    };
  };

  // Function to reload orders (used by callbacks)
  const reloadOrders = async () => {
    if (isDemoMode) {
      setOrders(demoData.orders);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiService.orders.getAll();
      const ordersData = response.data.data || response.data || [];
      const mappedOrders = ordersData.map(mapOrderFromBackend);
      setOrders(mappedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      setError(t('orders.errorMessage'));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Sincronizar con demoData cuando cambie
  useEffect(() => {
    if (isDemoMode) {
      setOrders(demoData.orders);
    }
  }, [isDemoMode, demoData.orders]);

  useEffect(() => {
    let isCancelled = false;

    const loadOrders = async () => {
      if (isDemoMode) {
        console.log('🚀 Demo mode detected - using demo orders data');
        setOrders(demoData.orders);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await apiService.orders.getAll();
        const ordersData = response.data.data || response.data || [];
        const mappedOrders = ordersData.map(mapOrderFromBackend);

        if (!isCancelled) {
          setOrders(mappedOrders);
        }
      } catch (error) {
        console.error('Error loading orders:', error);
        if (!isCancelled) {
          setError(t('orders.errorMessage'));
          setOrders([]);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      isCancelled = true;
    };
  }, [isDemoMode]);

  // Calcular estadísticas de TODAS las órdenes (para referencia)
  const allStats: OrderStats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      preparing: orders.filter(o => ['confirmed', 'preparing', 'ready'].includes(o.status)).length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
      totalRevenue: orders.reduce((sum, order) => sum + Number(order.total), 0),
      averageOrderValue: orders.length > 0
        ? orders.reduce((sum, order) => sum + Number(order.total), 0) / orders.length
        : 0
    };
  }, [orders]);

  // Filtrar y ordenar órdenes
  const filteredOrders = useMemo(() => {
    const filtered = orders.filter(order => {
      // Filtro de búsqueda
      const matchesSearch = searchQuery === '' ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerPhone.includes(searchQuery) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase());

      // Filtro de estado
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

      // Filtro de tipo
      const matchesType = typeFilter === 'all' || order.orderType === typeFilter;

      // Filtro de fecha
      let matchesDate = true;
      if (dateFilter !== 'all') {
        const orderDate = new Date(order.createdAt);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (dateFilter === 'today') {
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          matchesDate = orderDate >= today && orderDate < tomorrow;
        } else if (dateFilter === 'yesterday') {
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          matchesDate = orderDate >= yesterday && orderDate < today;
        } else if (dateFilter === 'week') {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          matchesDate = orderDate >= weekAgo;
        } else if (dateFilter === 'specific' && specificDate) {
          // Filtro de fecha específica
          // Obtener la fecha local de la orden (no UTC)
          const year = orderDate.getFullYear();
          const month = String(orderDate.getMonth() + 1).padStart(2, '0');
          const day = String(orderDate.getDate()).padStart(2, '0');
          const orderDateOnly = `${year}-${month}-${day}`;
          // Comparar directamente las cadenas de fecha YYYY-MM-DD
          matchesDate = orderDateOnly === specificDate;
        }
      }

      return matchesSearch && matchesStatus && matchesType && matchesDate;
    });

    // Ordenar por fecha de creación: más reciente primero
    return filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // Orden descendente (más reciente primero)
    });
  }, [orders, searchQuery, statusFilter, typeFilter, dateFilter, specificDate]);

  // Calcular estadísticas de las órdenes FILTRADAS
  const stats: OrderStats = useMemo(() => {
    return {
      total: filteredOrders.length,
      pending: filteredOrders.filter(o => o.status === 'pending').length,
      preparing: filteredOrders.filter(o => ['confirmed', 'preparing', 'ready'].includes(o.status)).length,
      delivered: filteredOrders.filter(o => o.status === 'delivered').length,
      cancelled: filteredOrders.filter(o => o.status === 'cancelled').length,
      totalRevenue: filteredOrders.reduce((sum, order) => sum + Number(order.total), 0),
      averageOrderValue: filteredOrders.length > 0
        ? filteredOrders.reduce((sum, order) => sum + Number(order.total), 0) / filteredOrders.length
        : 0
    };
  }, [filteredOrders]);

  // Obtener el texto descriptivo para el período filtrado
  const getFilterPeriodText = () => {
    if (dateFilter === 'today') return 'Hoy';
    if (dateFilter === 'yesterday') return 'Ayer';
    if (dateFilter === 'week') return 'Última semana';
    if (dateFilter === 'specific' && specificDate) {
      // Formatear la fecha específica a formato legible
      const date = new Date(specificDate + 'T00:00:00');
      return date.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    return 'Total';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        label: t('orders.pending'),
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      },
      confirmed: {
        label: t('orders.confirmed'),
        className: 'bg-blue-100 text-blue-800 border-blue-200'
      },
      preparing: {
        label: t('orders.preparing'),
        className: 'bg-orange-100 text-orange-800 border-orange-200'
      },
      ready: {
        label: t('orders.ready'),
        className: 'bg-purple-100 text-purple-800 border-purple-200'
      },
      delivered: {
        label: t('orders.delivered'),
        className: 'bg-green-100 text-green-800 border-green-200'
      },
      cancelled: {
        label: t('orders.cancelled'),
        className: 'bg-red-100 text-red-800 border-red-200'
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig];

    if (!config) {
      return <Badge variant="outline">{status}</Badge>;
    }

    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getOrderTypeLabel = (type: string) => {
    const typeLabels: Record<string, string> = {
      delivery: t('orders.delivery'),
      Delivery: t('orders.delivery'),
      pickup: t('orders.pickup'),
      'dine-in': t('orders.dineIn'),
      dine_in: t('orders.dineIn'),
      takeout: t('orders.takeout'),
      takeaway: t('orders.takeaway')
    };
    return typeLabels[type] || type;
  };

  const getStatusLabel = (status: string): string => {
    const statusLabels: Record<string, string> = {
      pending: t('orders.pending'),
      confirmed: t('orders.confirmed'),
      preparing: t('orders.preparing'),
      ready: t('orders.ready'),
      delivered: t('orders.delivered'),
      cancelled: t('orders.cancelled')
    };
    return statusLabels[status] || status;
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsDialogOpen(true);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (isDemoMode) {
      console.log('🚀 Demo mode - updating order status locally');
      const updatedOrders = orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus as any } : order
      );
      setOrders(updatedOrders);
      updateOrders(updatedOrders as any);
      toast({
        title: t('orders.orderUpdated'),
        description: `${t('orders.statusChangedTo')}: ${getStatusLabel(newStatus)}`,
      });
      return;
    }

    try {
      // Handle both string IDs like "ORD-123" and numeric IDs like 123
      const numericId = typeof orderId === 'string'
        ? parseInt(orderId.replace(/[^\d]/g, ''))
        : orderId;

      await apiService.orders.updateStatus(numericId, newStatus);

      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus as any } : order
      ));

      toast({
        title: t('orders.orderUpdated'),
        description: `${t('orders.statusChangedTo')}: ${getStatusLabel(newStatus)}`,
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: t('orders.errorUpdating'),
        description: t('orders.errorUpdatingMessage'),
        variant: "destructive",
      });
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setTypeFilter('all');
    setDateFilter('today');
    setSpecificDate('');
  };

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'all' || typeFilter !== 'all' || dateFilter !== 'today' || specificDate !== '';

  return (
    <MainLayout>
      <CreateOrderDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onOrderCreated={reloadOrders}
      />

      <OrderDetailsDialog
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        order={selectedOrder}
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('orders.title')}</h1>
            <p className="text-muted-foreground mt-1">
              {t('orders.manageAllOrders')}
            </p>
          </div>
          <div className="flex gap-2">
            {isDemoMode && (
              <Button
                onClick={() => {
                  resetDemoData();
                  toast({
                    title: "Datos reiniciados",
                    description: "Los datos demo han sido restablecidos a sus valores por defecto",
                  });
                  setTimeout(() => window.location.reload(), 500);
                }}
                variant="outline"
                size="lg"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset Demo
              </Button>
            )}
            <Button onClick={() => setIsCreateDialogOpen(true)} size="lg">
              <Plus className="mr-2 h-4 w-4" />
              {t('orders.newOrder')}
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('orders.totalOrders')}</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {getFilterPeriodText()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('orders.pendingOrders')}</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pending === 1 ? 'Requiere atención' : 'Requieren atención'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('orders.inPreparation')}</CardTitle>
              <Package className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.preparing}</div>
              <p className="text-xs text-muted-foreground">
                {getFilterPeriodText()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('orders.completed')}</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
              <p className="text-xs text-muted-foreground">
                {getFilterPeriodText()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('orders.revenue')}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total {getFilterPeriodText().toLowerCase()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y Búsqueda */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Primera fila de filtros */}
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Búsqueda */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('orders.searchOrders')}
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Filtro de Estado */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full lg:w-48">
                    <SelectValue placeholder={t('orders.filterByStatus')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('orders.allStatuses')}</SelectItem>
                    <SelectItem value="pending">{t('orders.pending')}</SelectItem>
                    <SelectItem value="confirmed">{t('orders.confirmed')}</SelectItem>
                    <SelectItem value="preparing">{t('orders.preparing')}</SelectItem>
                    <SelectItem value="ready">{t('orders.ready')}</SelectItem>
                    <SelectItem value="delivered">{t('orders.delivered')}</SelectItem>
                    <SelectItem value="cancelled">{t('orders.cancelled')}</SelectItem>
                  </SelectContent>
                </Select>

                {/* Filtro de Tipo */}
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full lg:w-48">
                    <SelectValue placeholder={t('orders.filterByType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('orders.allTypes')}</SelectItem>
                    <SelectItem value="delivery">{t('orders.delivery')}</SelectItem>
                    <SelectItem value="pickup">{t('orders.pickup')}</SelectItem>
                    <SelectItem value="dine-in">{t('orders.dineIn')}</SelectItem>
                  </SelectContent>
                </Select>

                {/* Filtro de Fecha */}
                <Select value={dateFilter} onValueChange={(value) => {
                  setDateFilter(value);
                  if (value !== 'specific') {
                    setSpecificDate('');
                  }
                }}>
                  <SelectTrigger className="w-full lg:w-48">
                    <SelectValue placeholder="Filtrar por fecha" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Hoy</SelectItem>
                    <SelectItem value="yesterday">Ayer</SelectItem>
                    <SelectItem value="week">Última semana</SelectItem>
                    <SelectItem value="all">Todas las fechas</SelectItem>
                    <SelectItem value="specific">Fecha específica...</SelectItem>
                  </SelectContent>
                </Select>

                {/* Botón Limpiar Filtros */}
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters}>
                    <Filter className="h-4 w-4 mr-2" />
                    {t('orders.clearFilters')}
                  </Button>
                )}
              </div>

              {/* Segunda fila: Selector de Fecha Específica */}
              {dateFilter === 'specific' && (
                <div className="flex gap-4">
                  <div className="relative w-full lg:w-64">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none z-10" />
                    <Input
                      type="date"
                      value={specificDate}
                      onChange={(e) => setSpecificDate(e.target.value)}
                      className="pl-10"
                      placeholder="Seleccionar fecha"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabla de Órdenes */}
        <Card>
          <CardHeader>
            <CardTitle>{t('orders.ordersList')}</CardTitle>
            <CardDescription>
              {filteredOrders.length > 0 && (
                t('orders.showingResults', { count: filteredOrders.length, total: orders.length })
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">{t('orders.loadingOrders')}</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t('orders.errorLoading')}</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={reloadOrders}>
                  {t('orders.retry')}
                </Button>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t('orders.noOrders')}</h3>
                <p className="text-muted-foreground mb-4">
                  {hasActiveFilters
                    ? t('orders.noOrdersWithFilters')
                    : t('orders.noOrdersMessage')}
                </p>
                {hasActiveFilters ? (
                  <Button variant="outline" onClick={clearFilters}>
                    {t('orders.clearFilters')}
                  </Button>
                ) : (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('orders.newOrder')}
                  </Button>
                )}
              </div>
            ) : (
              <div className="w-full overflow-x-auto rounded-md border">
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[140px]">N° Pedido</TableHead>
                      <TableHead className="min-w-[150px]">{t('orders.customer')}</TableHead>
                      <TableHead className="min-w-[100px]">{t('orders.type')}</TableHead>
                      <TableHead className="min-w-[120px]">{t('orders.status')}</TableHead>
                      <TableHead className="min-w-[150px]">{t('orders.items')}</TableHead>
                      <TableHead className="min-w-[100px]">{t('orders.total')}</TableHead>
                      <TableHead className="min-w-[140px]">{t('orders.date')}</TableHead>
                      <TableHead className="text-right min-w-[80px]">{t('orders.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-muted/50">
                        <TableCell className="font-mono text-xs font-semibold text-primary">
                          {(() => {
                            // Extraer solo números del order_number
                            const numberPart = order.orderNumber.replace('ORDER-', '');
                            // Si es largo (más de 5 dígitos), tomar los últimos 5
                            const shortNumber = numberPart.length > 5
                              ? numberPart.slice(-5)
                              : numberPart;
                            return `#${shortNumber}`;
                          })()}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{order.customerName}</div>
                            <div className="text-sm text-muted-foreground">
                              {order.customerPhone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getOrderTypeLabel(order.orderType)}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {order.items?.slice(0, 2).map((item, itemIndex) => (
                              <div key={`${order.id}-item-${item.id || itemIndex}-${item.name}`} className="text-sm">
                                {item.quantity}x {item.name}
                              </div>
                            )) || <div className="text-sm text-muted-foreground">{t('orders.noItems')}</div>}
                            {(order.items?.length || 0) > 2 && (
                              <div className="text-sm text-muted-foreground">
                                +{(order.items?.length || 0) - 2} {t('common.more')}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{formatCurrency(order.total)}</TableCell>
                        <TableCell>
                          {(() => {
                            try {
                              const timestamp = order.createdAt;
                              if (!timestamp) return '-';

                              // SOLUCIÓN DEFINITIVA:
                              // Backend devuelve UTC correctamente (con Z)
                              // Necesitamos convertir de UTC a Chile (UTC-3)

                              const date = new Date(timestamp);
                              if (isNaN(date.getTime())) return '-';

                              // Chile está en UTC-3 (horario de verano)
                              // Restamos 3 horas del UTC para obtener hora Chile
                              const chileDate = new Date(date.getTime() - (3 * 60 * 60 * 1000));

                              const day = String(chileDate.getDate()).padStart(2, '0');
                              const month = String(chileDate.getMonth() + 1).padStart(2, '0');
                              const year = chileDate.getFullYear();
                              const hours = String(chileDate.getHours()).padStart(2, '0');
                              const minutes = String(chileDate.getMinutes()).padStart(2, '0');

                              return `${day}-${month}-${year}, ${hours}:${minutes}`;
                            } catch {
                              return '-';
                            }
                          })()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>{t('orders.actions')}</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleViewDetails(order)}>
                                <Eye className="mr-2 h-4 w-4" />
                                {t('orders.viewDetails')}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(order.id, 'confirmed')}
                                disabled={order.status !== 'pending'}
                              >
                                {t('orders.confirm')}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(order.id, 'preparing')}
                                disabled={!['pending', 'confirmed'].includes(order.status)}
                              >
                                {t('orders.prepare')}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(order.id, 'ready')}
                                disabled={order.status !== 'preparing'}
                              >
                                {t('orders.markReady')}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(order.id, 'delivered')}
                                disabled={order.status !== 'ready'}
                              >
                                {t('orders.markDelivered')}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(order.id, 'cancelled')}
                                className="text-red-600"
                                disabled={['delivered', 'cancelled'].includes(order.status)}
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                {t('orders.cancel')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
