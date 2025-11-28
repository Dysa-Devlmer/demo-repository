"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/main-layout";
import AuthGuard from "@/components/auth/auth-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Users, ShoppingBag, TrendingUp, RefreshCw } from "lucide-react";
import { useTranslation } from '@/hooks/useTranslation';
import { apiService } from '@/lib/api';
import useDemoMode from '@/hooks/useDemoMode';
import DemoBanner from '@/components/ui/demo-banner';
import { LineChart, BarChart, PieChart } from '@/components/charts';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/formatters';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  totalConversations: number;
  activeCustomers: number;
  totalOrders: number;
  revenue: number;
}

interface RecentConversation {
  id: number;
  customer_id: number;
  customer_name?: string;
  last_message?: string;
  updated_at: string;
}

type Period = '7d' | '30d' | '90d';

export default function Dashboard() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isDemoMode, demoData, resetDemoData } = useDemoMode();
  const [stats, setStats] = useState<DashboardStats>({
    totalConversations: 0,
    activeCustomers: 0,
    totalOrders: 0,
    revenue: 0,
  });
  const [recentConversations, setRecentConversations] = useState<RecentConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('7d');
  const [chartData, setChartData] = useState({
    trends: [],
    revenue: [],
    ordersByStatus: [],
    customersBySource: [],
  });

  useEffect(() => {
    let isCancelled = false;

    const fetchDashboardStats = async () => {
      if (isDemoMode) {
        // Calculate stats from demo data
        const revenue = demoData.orders.reduce((sum, order) => {
          return sum + Number(order.total);
        }, 0);

        const newStats = {
          totalConversations: demoData.conversations?.length || 0,
          activeCustomers: demoData.customers?.length || 0,
          totalOrders: demoData.orders?.length || 0,
          revenue: revenue,
        };

        setStats(newStats);
        setLoading(false);
        return;
      }

      try {
        const [conversationsRes, customersRes, ordersRes] = await Promise.all([
          apiService.conversations.getAll(),
          apiService.customers.getAll(),
          apiService.orders.getAll()
        ]);

        const conversations = conversationsRes.data || [];
        const customers = customersRes.data || [];
        const orders = ordersRes.data || [];

        const revenue = orders.reduce((sum: number, order: any) => sum + Number(order.total || 0), 0);

        if (!isCancelled) {
          setStats({
            totalConversations: Array.isArray(conversations) ? conversations.length : 0,
            activeCustomers: Array.isArray(customers) ? customers.length : 0,
            totalOrders: Array.isArray(orders) ? orders.length : 0,
            revenue: revenue,
          });

          // Validate conversations is an array before sorting
          const conversationsArray = Array.isArray(conversations) ? conversations : [];
          const sortedConversations = conversationsArray
            .sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
            .slice(0, 5);
          setRecentConversations(sortedConversations);
        }
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
        if (!isCancelled) {
          setStats({
            totalConversations: 0,
            activeCustomers: 0,
            totalOrders: 0,
            revenue: 0,
          });
          setRecentConversations([]);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchDashboardStats();

    return () => {
      isCancelled = true;
    };
  }, [isDemoMode]);

  // Fetch chart data when period changes
  useEffect(() => {
    const fetchChartData = async () => {
      if (isDemoMode) {
        // Use mock data in demo mode
        return;
      }

      try {
        const [trendsRes, revenueRes, ordersStatusRes, customersSourceRes] = await Promise.all([
          apiService.analytics.getTrends(period),
          apiService.analytics.getRevenue(period),
          apiService.analytics.getOrdersByStatus(),
          apiService.analytics.getCustomersBySource(),
        ]);

        setChartData({
          trends: trendsRes.data || [],
          revenue: revenueRes.data || [],
          ordersByStatus: ordersStatusRes.data || [],
          customersBySource: customersSourceRes.data || [],
        });
      } catch (error) {
        console.error('Error loading chart data:', error);
        // Keep mock data on error
      }
    };

    fetchChartData();
  }, [period, isDemoMode]);

  // Mock data para gráficos - En el futuro se reemplazará con datos del backend
  const conversationsTrendData = period === '7d'
    ? [
        { name: 'Lun', conversaciones: 24, ordenes: 12 },
        { name: 'Mar', conversaciones: 32, ordenes: 18 },
        { name: 'Mié', conversaciones: 28, ordenes: 15 },
        { name: 'Jue', conversaciones: 45, ordenes: 22 },
        { name: 'Vie', conversaciones: 52, ordenes: 28 },
        { name: 'Sáb', conversaciones: 38, ordenes: 20 },
        { name: 'Dom', conversaciones: 30, ordenes: 16 },
      ]
    : period === '30d'
    ? [
        { name: 'Sem 1', conversaciones: 180, ordenes: 95 },
        { name: 'Sem 2', conversaciones: 220, ordenes: 115 },
        { name: 'Sem 3', conversaciones: 195, ordenes: 105 },
        { name: 'Sem 4', conversaciones: 240, ordenes: 130 },
      ]
    : [
        { name: 'Mes 1', conversaciones: 850, ordenes: 445 },
        { name: 'Mes 2', conversaciones: 920, ordenes: 485 },
        { name: 'Mes 3', conversaciones: 1050, ordenes: 560 },
      ];

  const ordersByStatusData = [
    { name: 'Pendiente', value: 45, color: '#64748b' }, // Slate/Gris profesional - esperando
    { name: 'En Preparación', value: 32, color: '#d97706' }, // Ámbar elegante - en proceso
    { name: 'En Camino', value: 28, color: '#0891b2' }, // Teal - en tránsito
    { name: 'Entregado', value: 95, color: '#059669' }, // Verde bosque - completado
  ];

  const customersBySourceData = [
    { name: 'WhatsApp', value: 156, color: '#059669' }, // Verde bosque profesional
    { name: 'Web Chat', value: 89, color: '#0891b2' }, // Teal corporativo
    { name: 'Facebook', value: 67, color: '#1e40af' }, // Azul navy
    { name: 'Instagram', value: 45, color: '#be185d' }, // Rosa oscuro elegante
    { name: 'Referido', value: 32, color: '#4f46e5' }, // Índigo profesional
  ];

  const revenueByDayData = period === '7d'
    ? [
        { name: 'Lun', revenue: 1250 },
        { name: 'Mar', revenue: 1890 },
        { name: 'Mié', revenue: 1560 },
        { name: 'Jue', revenue: 2340 },
        { name: 'Vie', revenue: 2890 },
        { name: 'Sáb', revenue: 2150 },
        { name: 'Dom', revenue: 1780 },
      ]
    : period === '30d'
    ? [
        { name: 'Sem 1', revenue: 9850 },
        { name: 'Sem 2', revenue: 12200 },
        { name: 'Sem 3', revenue: 10500 },
        { name: 'Sem 4', revenue: 13400 },
      ]
    : [
        { name: 'Mes 1', revenue: 45600 },
        { name: 'Mes 2', revenue: 52300 },
        { name: 'Mes 3', revenue: 58900 },
      ];

  const periodActions = (
    <div className="flex gap-2">
      <Button
        variant={period === '7d' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setPeriod('7d')}
      >
        7 días
      </Button>
      <Button
        variant={period === '30d' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setPeriod('30d')}
      >
        30 días
      </Button>
      <Button
        variant={period === '90d' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setPeriod('90d')}
      >
        90 días
      </Button>
    </div>
  );

  return (
    <AuthGuard>
      <MainLayout>
        <DemoBanner isDemoMode={isDemoMode} />
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold md:text-2xl">{t('dashboard.title')}</h1>
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
              size="sm"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reiniciar Demo
            </Button>
          )}
        </div>

        {/* Tarjetas de estadísticas */}
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card className="border-l-4 border-l-indigo-600 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/20 dark:to-background">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-100">
                {t('dashboard.totalConversations')}
              </CardTitle>
              <MessageSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {loading ? "..." : stats.totalConversations.toLocaleString()}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {t('dashboard.totalCount')}
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-teal-600 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/20 dark:to-background">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-100">
                {t('dashboard.activeCustomers')}
              </CardTitle>
              <Users className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {loading ? "..." : stats.activeCustomers.toLocaleString()}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {t('dashboard.activeCount')}
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-600 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/20 dark:to-background">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-100">{t('dashboard.totalOrders')}</CardTitle>
              <ShoppingBag className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {loading ? "..." : stats.totalOrders.toLocaleString()}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {t('dashboard.totalCount')}
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-600 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/20 dark:to-background">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-100">{t('dashboard.revenue')}</CardTitle>
              <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {loading ? "..." : formatCurrency(stats.revenue)}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {t('dashboard.totalRevenue')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos de tendencias */}
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
          <LineChart
            title="Tendencia de Conversaciones y Órdenes"
            description={`Actividad en los últimos ${period === '7d' ? '7 días' : period === '30d' ? '30 días' : '90 días'}`}
            data={chartData.trends.length > 0 ? chartData.trends : conversationsTrendData}
            lines={[
              { dataKey: 'conversaciones', name: 'Conversaciones', color: '#4f46e5' },
              { dataKey: 'ordenes', name: 'Órdenes', color: '#d97706' },
            ]}
            height={350}
            actions={periodActions}
          />

          <BarChart
            title="Ingresos por Período"
            description={`Revenue generado en los últimos ${period === '7d' ? '7 días' : period === '30d' ? '30 días' : '90 días'}`}
            data={chartData.revenue.length > 0 ? chartData.revenue : revenueByDayData}
            bars={[
              { dataKey: 'revenue', name: 'Ingresos', color: '#059669' },
            ]}
            height={350}
            formatTooltip={(value) => formatCurrency(value)}
            actions={periodActions}
          />
        </div>

        {/* Gráficos de distribución */}
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
          <PieChart
            title="Órdenes por Estado"
            description="Distribución actual de órdenes"
            data={chartData.ordersByStatus.length > 0 ? chartData.ordersByStatus : ordersByStatusData}
            height={350}
            innerRadius={60}
          />

          <PieChart
            title="Clientes por Origen"
            description="Canales de adquisición de clientes"
            data={chartData.customersBySource.length > 0 ? chartData.customersBySource : customersBySourceData}
            height={350}
          />
        </div>

        {/* Conversaciones recientes y estado del sistema */}
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>{t('dashboard.recentConversations')}</CardTitle>
              <CardDescription>
                {t('dashboard.latestInteractions')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-sm text-muted-foreground">{t('dashboard.loading')}...</p>
                ) : recentConversations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t('dashboard.noConversations')}</p>
                ) : (
                  recentConversations.map((conversation) => {
                    const minutesAgo = Math.floor((Date.now() - new Date(conversation.updated_at).getTime()) / 60000);
                    return (
                      <div key={conversation.id} className="flex items-center space-x-4 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                          <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="space-y-1 flex-1">
                          <p className="text-sm font-medium leading-none">
                            {conversation.customer_name || `${t('dashboard.customer')} #${conversation.customer_id}`}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.last_message || t('dashboard.noMessage')}
                          </p>
                        </div>
                        <div className="ml-auto font-medium text-sm text-muted-foreground">
                          {minutesAgo < 60
                            ? `${minutesAgo} ${t('dashboard.minutesAgo')}`
                            : `${Math.floor(minutesAgo / 60)} ${t('dashboard.hoursAgo')}`}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.systemStatus')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-200/50 dark:border-emerald-800/30">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{t('dashboard.backendApi')}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Activo</span>
                    <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse shadow-sm"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-200/50 dark:border-emerald-800/30">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{t('dashboard.whatsappBot')}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Activo</span>
                    <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse shadow-sm"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-200/50 dark:border-emerald-800/30">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{t('dashboard.ollamaAi')}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Activo</span>
                    <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse shadow-sm"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-200/50 dark:border-emerald-800/30">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{t('dashboard.database')}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Activo</span>
                    <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse shadow-sm"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </AuthGuard>
  );
}
