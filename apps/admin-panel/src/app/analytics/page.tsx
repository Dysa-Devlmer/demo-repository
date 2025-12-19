"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare,
  ShoppingBag,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  Download,
  Activity,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { apiService } from '@/lib/api';
import { useTranslation } from '@/hooks/useTranslation';
import { formatCurrency } from '@/lib/formatters';
import useDemoMode from '@/hooks/useDemoMode';

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalConversations: number;
  averageOrderValue: number;
  conversionRate: number;
  popularItems: Array<{
    name: string;
    orders: number;
    revenue: number;
  }>;
  monthlyData: Array<{
    month: string;
    orders: number;
    revenue: number;
    customers: number;
  }>;
  ordersByStatus: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  customerGrowth: Array<{
    period: string;
    newCustomers: number;
    totalCustomers: number;
  }>;
}

export default function AnalyticsPage() {
  const { t } = useTranslation();
  const { isDemoMode, demoData } = useDemoMode();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");

  useEffect(() => {
    let isCancelled = false;

    const fetchAnalytics = async () => {
      if (isDemoMode) {
        console.log('🚀 Analytics - Demo mode detected');
        // Calculate from demo data
        const totalRevenue = demoData.orders.reduce((sum, order) => sum + Number(order.total), 0);
        const totalOrders = demoData.orders.length;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        setAnalytics({
          totalRevenue,
          totalOrders,
          totalCustomers: demoData.customers.length,
          totalConversations: demoData.conversations.length,
          averageOrderValue,
          conversionRate: 15.2,
          popularItems: [
            { name: "Pizza Margherita", orders: 45, revenue: 12900 * 45 },
            { name: "Hamburguesa Completa", orders: 38, revenue: 9500 * 38 },
            { name: "Ensalada César", orders: 32, revenue: 7900 * 32 },
          ],
          monthlyData: [
            { month: "Ene", orders: 45, revenue: 12500, customers: 23 },
            { month: "Feb", orders: 52, revenue: 15800, customers: 28 },
            { month: "Mar", orders: 48, revenue: 14200, customers: 25 },
            { month: "Abr", orders: 61, revenue: 18900, customers: 31 },
            { month: "May", orders: 55, revenue: 16700, customers: 29 },
            { month: "Jun", orders: 67, revenue: 21300, customers: 35 },
          ],
          ordersByStatus: [
            { status: "completed", count: 2, percentage: 40 },
            { status: "pending", count: 1, percentage: 20 },
            { status: "cancelled", count: 1, percentage: 20 },
            { status: "preparing", count: 1, percentage: 20 },
          ],
          customerGrowth: [
            { period: "Semana 1", newCustomers: 1, totalCustomers: 1 },
            { period: "Semana 2", newCustomers: 1, totalCustomers: 2 },
            { period: "Semana 3", newCustomers: 1, totalCustomers: 3 },
            { period: "Semana 4", newCustomers: 0, totalCustomers: 3 },
          ]
        });
        setLoading(false);
        return;
      }

      try {
        // Fetch data from multiple endpoints
        const [orders, customers, conversations, menu] = await Promise.all([
          apiService.orders.getAll(),
          apiService.customers.getAll(),
          apiService.conversations.getAll(),
          apiService.menu.getAll()
        ]);

        // Process the data for analytics
        const ordersData = orders.data || [];
        const customersData = customers.data || [];
        const conversationsData = conversations.data || [];
        const menuData = menu.data || [];

        const totalRevenue = ordersData.reduce((sum: number, order: any) => sum + (Number(order.total) || 0), 0);
        const totalOrders = ordersData.length;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        if (!isCancelled) {
          console.log('✅ Analytics loaded from API');
          // Mock analytics data (in a real app, this would come from analytics service)
          setAnalytics({
            totalRevenue,
            totalOrders,
            totalCustomers: customersData.length,
            totalConversations: conversationsData.length,
            averageOrderValue,
            conversionRate: 15.2,
          popularItems: [
            { name: "Pizza Margherita", orders: 45, revenue: 540 },
            { name: "Tacos al Pastor", orders: 38, revenue: 1710 },
            { name: "Hamburguesa Clásica", orders: 32, revenue: 272 },
          ],
          monthlyData: [
            { month: "Ene", orders: 45, revenue: 12500, customers: 23 },
            { month: "Feb", orders: 52, revenue: 15800, customers: 28 },
            { month: "Mar", orders: 48, revenue: 14200, customers: 25 },
            { month: "Abr", orders: 61, revenue: 18900, customers: 31 },
            { month: "May", orders: 55, revenue: 16700, customers: 29 },
            { month: "Jun", orders: 67, revenue: 21300, customers: 35 },
          ],
          ordersByStatus: [
            { status: "completed", count: 156, percentage: 78 },
            { status: "pending", count: 28, percentage: 14 },
            { status: "cancelled", count: 16, percentage: 8 },
          ],
          customerGrowth: [
            { period: "Semana 1", newCustomers: 12, totalCustomers: 145 },
            { period: "Semana 2", newCustomers: 18, totalCustomers: 163 },
            { period: "Semana 3", newCustomers: 15, totalCustomers: 178 },
            { period: "Semana 4", newCustomers: 22, totalCustomers: 200 },
          ]
        });
        } else {
          console.log('🚫 CANCELADO - No actualizar analytics (ya en demo mode)');
        }
      } catch (error) {
        console.error('Error loading analytics:', error);
        if (!isCancelled) {
          // Set default mock data
          setAnalytics({
          totalRevenue: 45600,
          totalOrders: 234,
          totalCustomers: 156,
          totalConversations: 1247,
          averageOrderValue: 194.87,
          conversionRate: 15.2,
          popularItems: [
            { name: "Pizza Margherita", orders: 45, revenue: 540 },
            { name: "Tacos al Pastor", orders: 38, revenue: 1710 },
            { name: "Hamburguesa Clásica", orders: 32, revenue: 272 },
          ],
          monthlyData: [
            { month: "Ene", orders: 45, revenue: 12500, customers: 23 },
            { month: "Feb", orders: 52, revenue: 15800, customers: 28 },
            { month: "Mar", orders: 48, revenue: 14200, customers: 25 },
            { month: "Abr", orders: 61, revenue: 18900, customers: 31 },
            { month: "May", orders: 55, revenue: 16700, customers: 29 },
            { month: "Jun", orders: 67, revenue: 21300, customers: 35 },
          ],
          ordersByStatus: [
            { status: "completed", count: 156, percentage: 78 },
            { status: "pending", count: 28, percentage: 14 },
            { status: "cancelled", count: 16, percentage: 8 },
          ],
          customerGrowth: [
            { period: "Semana 1", newCustomers: 12, totalCustomers: 145 },
            { period: "Semana 2", newCustomers: 18, totalCustomers: 163 },
            { period: "Semana 3", newCustomers: 15, totalCustomers: 178 },
            { period: "Semana 4", newCustomers: 22, totalCustomers: 200 },
          ]
        });
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchAnalytics();

    return () => {
      isCancelled = true;
    };
  }, [timeRange, isDemoMode]);

  const exportReport = () => {
    // Mock export functionality
    const dataStr = JSON.stringify(analytics, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Colores para gráficos
  const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6'];

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 animate-pulse mx-auto mb-4" />
            <p>{t('analytics.loadingAnalytics')}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!analytics) return null;

  return (
    <MainLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">{t('analytics.title')}</h1>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('analytics.timePeriod')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">{t('analytics.last7Days')}</SelectItem>
              <SelectItem value="30d">{t('analytics.last30Days')}</SelectItem>
              <SelectItem value="90d">{t('analytics.last90Days')}</SelectItem>
              <SelectItem value="1y">{t('analytics.lastYear')}</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport}>
            <Download className="mr-2 h-4 w-4" />
            {t('analytics.exportReport')}
          </Button>
        </div>
      </div>

      {/* KPIs Overview */}
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('analytics.totalRevenue')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.totalRevenue)}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span>+12.3% {t('analytics.vsLastMonth')}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('analytics.totalOrders')}</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalOrders.toLocaleString()}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span>+8.1% {t('analytics.vsLastMonth')}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('analytics.averageOrderValue')}</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.averageOrderValue)}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span>+5.2% {t('analytics.vsLastMonth')}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('analytics.conversionRate')}</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.conversionRate}%</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <span>-2.1% {t('analytics.vsLastMonth')}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs con diferentes vistas */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="revenue">Ingresos</TabsTrigger>
          <TabsTrigger value="orders">Pedidos</TabsTrigger>
          <TabsTrigger value="customers">Clientes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
            {/* Revenue Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Tendencia de Ingresos</CardTitle>
                <CardDescription>Evolución mensual de ingresos</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      name="Ingresos"
                      stroke="#8B5CF6"
                      fill="#8B5CF6"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Orders by Status Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Pedidos</CardTitle>
                <CardDescription>Por estado</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={analytics.ordersByStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ payload }) => {
                        const data = payload as { status?: string; percentage?: number };
                        const status = data?.status ?? 'unknown';
                        const percentage =
                          typeof data?.percentage === 'number' ? data.percentage : 0;
                        return `${status}: ${percentage}%`;
                      }}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analytics.ordersByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
            {/* Popular Items */}
            <Card>
              <CardHeader>
                <CardTitle>{t('analytics.popularDishes')}</CardTitle>
                <CardDescription>{t('analytics.mostSoldProducts')}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.popularItems} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={120} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenue" fill="#10B981" name="Ingresos ($)" />
                    <Bar dataKey="orders" fill="#8B5CF6" name="Pedidos" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Customer Growth */}
            <Card>
              <CardHeader>
                <CardTitle>Crecimiento de Clientes</CardTitle>
                <CardDescription>Nuevos clientes por semana</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.customerGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="newCustomers"
                      stroke="#10B981"
                      strokeWidth={2}
                      name="Nuevos Clientes"
                    />
                    <Line
                      type="monotone"
                      dataKey="totalCustomers"
                      stroke="#8B5CF6"
                      strokeWidth={2}
                      name="Total Acumulado"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análisis Detallado de Ingresos</CardTitle>
              <CardDescription>Desglose mensual completo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analytics.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#8B5CF6" name="Ingresos ($)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Pedidos</CardTitle>
              <CardDescription>Tendencia de pedidos por mes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analytics.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#10B981"
                    strokeWidth={3}
                    name="Pedidos"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Clientes</CardTitle>
              <CardDescription>Evolución de base de clientes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={analytics.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="customers"
                    name="Clientes"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

    </MainLayout>
  );
}
