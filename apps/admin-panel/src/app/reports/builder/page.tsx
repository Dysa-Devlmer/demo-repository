"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { apiService } from "@/lib/api";
import { toast } from "sonner";

interface ReportConfig {
  name: string;
  description: string;
  type: string;
  format: string;
  schedule: string;
  dateRange: string;
  metrics: string[];
  filters: {
    status?: string;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
  };
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

export default function ReportBuilderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<ReportConfig>({
    name: "",
    description: "",
    type: "sales",
    format: "pdf",
    schedule: "manual",
    dateRange: "last_30_days",
    metrics: [],
    filters: {},
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!config.name || config.metrics.length === 0) {
      toast.error("Por favor completa el nombre y selecciona al menos una métrica");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Creando reporte...");

    try {
      await apiService.reports.create(config);
      toast.success("Reporte creado exitosamente", { id: toastId });
      router.push("/reports");
    } catch (error: any) {
      console.error("Error creating report:", error);
      toast.error(error.response?.data?.message || "Error al crear el reporte", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    toast.info("Vista previa del reporte próximamente", {
      description: "Esta funcionalidad estará disponible en una próxima actualización"
    });
  };

  const toggleMetric = (metricId: string) => {
    setConfig((prev) => ({
      ...prev,
      metrics: prev.metrics.includes(metricId)
        ? prev.metrics.filter((m) => m !== metricId)
        : [...prev.metrics, metricId],
    }));
  };

  const filteredMetrics = availableMetrics.filter((metric) => {
    if (config.type === "all") return true;
    return metric.category === config.type || config.type === "custom";
  });

  const groupedMetrics = filteredMetrics.reduce((acc, metric) => {
    if (!acc[metric.category]) {
      acc[metric.category] = [];
    }
    acc[metric.category].push(metric);
    return acc;
  }, {} as Record<string, typeof availableMetrics>);

  const categoryLabels: Record<string, string> = {
    sales: "Ventas",
    customers: "Clientes",
    menu: "Menú",
    reservations: "Reservas",
    operations: "Operaciones",
  };

  return (
    <AuthGuard>
      <MainLayout>
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.push("/reports")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-lg font-semibold md:text-2xl">Constructor de Reportes</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Crea un reporte personalizado para tu restaurante
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                  value={config.name}
                  onChange={(e) => setConfig({ ...config, name: e.target.value })}
                  placeholder="Ej: Reporte de Ventas Mensual"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={config.description}
                  onChange={(e) => setConfig({ ...config, description: e.target.value })}
                  placeholder="Describe el propósito de este reporte..."
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Reporte</Label>
                  <Select
                    value={config.type}
                    onValueChange={(value) => setConfig({ ...config, type: value, metrics: [] })}
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
                    value={config.dateRange}
                    onValueChange={(value) => setConfig({ ...config, dateRange: value })}
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
                Selecciona las métricas que deseas incluir en el reporte *
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(groupedMetrics).length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Selecciona un tipo de reporte para ver las métricas disponibles
                </p>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedMetrics).map(([category, metrics]) => (
                    <div key={category}>
                      <h3 className="font-medium mb-3">{categoryLabels[category]}</h3>
                      <div className="space-y-3 pl-4">
                        {metrics.map((metric) => (
                          <div key={metric.id} className="flex items-center space-x-3">
                            <Checkbox
                              id={`metric-${metric.id}`}
                              checked={config.metrics.includes(metric.id)}
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
              )}

              {config.metrics.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    {config.metrics.length} métrica{config.metrics.length !== 1 ? "s" : ""}{" "}
                    seleccionada{config.metrics.length !== 1 ? "s" : ""}
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
                    value={config.format}
                    onValueChange={(value) => setConfig({ ...config, format: value })}
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
                    value={config.schedule}
                    onValueChange={(value) => setConfig({ ...config, schedule: value })}
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

              {config.schedule !== "manual" && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    💡 Los reportes programados se generarán automáticamente y se enviarán por
                    email a los usuarios configurados.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/reports")}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="button" variant="secondary" onClick={handlePreview} disabled={loading}>
              <Eye className="mr-2 h-4 w-4" />
              Vista Previa
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Guardando..." : "Crear Reporte"}
            </Button>
          </div>
        </form>
      </MainLayout>
    </AuthGuard>
  );
}
