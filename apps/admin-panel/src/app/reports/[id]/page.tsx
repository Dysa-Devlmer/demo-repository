"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import MainLayout from "@/components/layout/main-layout";
import AuthGuard from "@/components/auth/auth-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Download, History } from "lucide-react";
import { apiService } from "@/lib/api";
import { toast } from "sonner";

interface Report {
  id: number;
  name: string;
  description: string;
  type: string;
  format: string;
  schedule: string;
  dateRange: string;
  metrics: string[];
  filters: Record<string, any>;
  createdAt: string;
  lastGenerated?: string;
}

const availableMetrics = [
  { id: "revenue", label: "Ingresos Totales", category: "sales" },
  { id: "orders_count", label: "Número de Pedidos", category: "sales" },
  { id: "avg_order_value", label: "Valor Promedio de Pedido", category: "sales" },
  { id: "customers_new", label: "Nuevos Clientes", category: "customers" },
  { id: "customers_returning", label: "Clientes Recurrentes", category: "customers" },
  { id: "customer_satisfaction", label: "Satisfacción del Cliente", category: "customers" },
  { id: "popular_dishes", label: "Platillos Más Populares", category: "menu" },
  { id: "inventory_status", label: "Estado de Inventario", category: "menu" },
  { id: "reservations_count", label: "Número de Reservas", category: "reservations" },
  { id: "table_occupancy", label: "Ocupación de Mesas", category: "reservations" },
  { id: "delivery_time", label: "Tiempo de Entrega Promedio", category: "operations" },
  { id: "staff_performance", label: "Rendimiento del Personal", category: "operations" },
];

const categoryLabels: Record<string, string> = {
  sales: "Ventas",
  customers: "Clientes",
  menu: "Menú",
  reservations: "Reservas",
  operations: "Operaciones",
};

export default function EditReportPage() {
  const router = useRouter();
  const params = useParams();
  const reportId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "sales",
    format: "pdf",
    schedule: "manual",
    dateRange: "last_30_days",
    metrics: [] as string[],
    filters: {},
  });

  useEffect(() => {
    if (reportId) {
      fetchReport();
    }
  }, [reportId]);

  const fetchReport = async () => {
    try {
      const response = await apiService.reports.getById(parseInt(reportId));
      const reportData = response.data;

      setReport(reportData);
      setFormData({
        name: reportData.name,
        description: reportData.description,
        type: reportData.type,
        format: reportData.format,
        schedule: reportData.schedule,
        dateRange: reportData.dateRange,
        metrics: reportData.metrics,
        filters: reportData.filters,
      });
    } catch (error) {
      console.error("Error loading report:", error);
      toast.error("Error al cargar el reporte");
      router.push("/reports");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || formData.metrics.length === 0) {
      toast.error("Por favor completa el nombre y selecciona al menos una métrica");
      return;
    }

    setSaving(true);
    const toastId = toast.loading("Actualizando reporte...");

    try {
      await apiService.reports.update(parseInt(reportId), formData);
      toast.success("Reporte actualizado exitosamente", { id: toastId });
      router.push("/reports");
    } catch (error: any) {
      console.error("Error updating report:", error);
      toast.error(error.response?.data?.message || "Error al actualizar el reporte", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async () => {
    const toastId = toast.loading("Generando reporte...");

    try {
      const response = await apiService.reports.generate(parseInt(reportId));
      if (response.data?.url) {
        toast.success("Reporte generado exitosamente", { id: toastId });
        // Open generated report in new tab
        window.open(response.data.url, '_blank');
        // Refresh report to update lastGenerated
        fetchReport();
      } else {
        toast.success("Reporte generado exitosamente", { id: toastId });
      }
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Error al generar el reporte", { id: toastId });
    }
  };

  const toggleMetric = (metricId: string) => {
    setFormData((prev) => ({
      ...prev,
      metrics: prev.metrics.includes(metricId)
        ? prev.metrics.filter((m) => m !== metricId)
        : [...prev.metrics, metricId],
    }));
  };

  const filteredMetrics = availableMetrics.filter((metric) => {
    if (formData.type === "custom") return true;
    return metric.category === formData.type;
  });

  const groupedMetrics = filteredMetrics.reduce((acc, metric) => {
    if (!acc[metric.category]) {
      acc[metric.category] = [];
    }
    acc[metric.category].push(metric);
    return acc;
  }, {} as Record<string, typeof availableMetrics>);

  if (loading) {
    return (
      <AuthGuard>
        <MainLayout>
          <div className="text-center py-8">Cargando reporte...</div>
        </MainLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <MainLayout>
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.push("/reports")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold md:text-2xl">Editar Reporte</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Reporte #{reportId} - {report?.name}
            </p>
          </div>
          <Button variant="outline" onClick={handleGenerate}>
            <Download className="mr-2 h-4 w-4" />
            Generar Ahora
          </Button>
        </div>

        <Tabs defaultValue="config" className="space-y-6">
          <TabsList>
            <TabsTrigger value="config">Configuración</TabsTrigger>
            <TabsTrigger value="history">
              <History className="mr-2 h-4 w-4" />
              Historial
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            <TabsContent value="config" className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Información Básica</CardTitle>
                  <CardDescription>Configura los detalles del reporte</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre del Reporte *</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ej: Reporte de Ventas Mensual"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe el propósito de este reporte..."
                      rows={3}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="type">Tipo de Reporte</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) =>
                          setFormData({ ...formData, type: value, metrics: [] })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sales">Ventas</SelectItem>
                          <SelectItem value="customers">Clientes</SelectItem>
                          <SelectItem value="menu">Menú</SelectItem>
                          <SelectItem value="reservations">Reservas</SelectItem>
                          <SelectItem value="operations">Operaciones</SelectItem>
                          <SelectItem value="custom">Personalizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateRange">Rango de Fechas</Label>
                      <Select
                        value={formData.dateRange}
                        onValueChange={(value) => setFormData({ ...formData, dateRange: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="today">Hoy</SelectItem>
                          <SelectItem value="yesterday">Ayer</SelectItem>
                          <SelectItem value="last_7_days">Últimos 7 días</SelectItem>
                          <SelectItem value="last_30_days">Últimos 30 días</SelectItem>
                          <SelectItem value="this_month">Este mes</SelectItem>
                          <SelectItem value="last_month">Mes pasado</SelectItem>
                          <SelectItem value="this_year">Este año</SelectItem>
                          <SelectItem value="custom">Personalizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Metrics Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Métricas e Indicadores</CardTitle>
                  <CardDescription>
                    Selecciona las métricas que deseas incluir en el reporte
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {Object.entries(groupedMetrics).map(([category, metrics]) => (
                      <div key={category}>
                        <h3 className="font-medium mb-3">{categoryLabels[category]}</h3>
                        <div className="space-y-3 pl-4">
                          {metrics.map((metric) => (
                            <div key={metric.id} className="flex items-center space-x-3">
                              <Checkbox
                                id={`metric-${metric.id}`}
                                checked={formData.metrics.includes(metric.id)}
                                onCheckedChange={() => toggleMetric(metric.id)}
                              />
                              <label
                                htmlFor={`metric-${metric.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                {metric.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {formData.metrics.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        {formData.metrics.length} métrica{formData.metrics.length !== 1 ? "s" : ""}{" "}
                        seleccionada{formData.metrics.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Export Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle>Configuración de Exportación</CardTitle>
                  <CardDescription>Define el formato y programación del reporte</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="format">Formato de Salida</Label>
                      <Select
                        value={formData.format}
                        onValueChange={(value) => setFormData({ ...formData, format: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                          <SelectItem value="csv">CSV</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="schedule">Programación</Label>
                      <Select
                        value={formData.schedule}
                        onValueChange={(value) => setFormData({ ...formData, schedule: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Manual (bajo demanda)</SelectItem>
                          <SelectItem value="daily">Diario</SelectItem>
                          <SelectItem value="weekly">Semanal</SelectItem>
                          <SelectItem value="monthly">Mensual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/reports")}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Historial de Generaciones</CardTitle>
                  <CardDescription>
                    Revisa el historial de reportes generados anteriormente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>El historial de reportes estará disponible próximamente</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </form>
        </Tabs>
      </MainLayout>
    </AuthGuard>
  );
}
