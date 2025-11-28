"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/main-layout";
import AuthGuard from "@/components/auth/auth-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Plus,
  Download,
  Edit,
  Trash2,
  MoreHorizontal,
  Search,
  Calendar,
  FileSpreadsheet,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { apiService } from "@/lib/api";
import { toast } from "sonner";

interface Report {
  id: number;
  name: string;
  description: string;
  type: "sales" | "customers" | "orders" | "analytics" | "custom";
  format: "pdf" | "excel" | "csv";
  schedule: "manual" | "daily" | "weekly" | "monthly";
  lastGenerated?: string;
  createdBy: string;
  createdAt: string;
}

// Demo data
const demoReports: Report[] = [
  {
    id: 1,
    name: "Reporte de Ventas Mensual",
    description: "Análisis completo de ventas del último mes",
    type: "sales",
    format: "pdf",
    schedule: "monthly",
    lastGenerated: new Date().toISOString(),
    createdBy: "Admin",
    createdAt: "2025-10-01T10:00:00Z",
  },
  {
    id: 2,
    name: "Lista de Clientes Activos",
    description: "Exportación de todos los clientes activos",
    type: "customers",
    format: "excel",
    schedule: "manual",
    lastGenerated: new Date(Date.now() - 86400000 * 2).toISOString(),
    createdBy: "Admin",
    createdAt: "2025-09-15T14:30:00Z",
  },
  {
    id: 3,
    name: "Análisis de Pedidos Semanal",
    description: "Estadísticas de pedidos de la última semana",
    type: "orders",
    format: "pdf",
    schedule: "weekly",
    lastGenerated: new Date(Date.now() - 86400000).toISOString(),
    createdBy: "Staff",
    createdAt: "2025-09-20T09:15:00Z",
  },
  {
    id: 4,
    name: "Dashboard Analytics",
    description: "Reporte ejecutivo con KPIs principales",
    type: "analytics",
    format: "pdf",
    schedule: "daily",
    lastGenerated: new Date().toISOString(),
    createdBy: "Admin",
    createdAt: "2025-10-10T08:00:00Z",
  },
];

const reportTypeLabels = {
  sales: "Ventas",
  customers: "Clientes",
  orders: "Pedidos",
  analytics: "Analytics",
  custom: "Personalizado",
};

const reportFormatLabels = {
  pdf: "PDF",
  excel: "Excel",
  csv: "CSV",
};

const scheduleLabels = {
  manual: "Manual",
  daily: "Diario",
  weekly: "Semanal",
  monthly: "Mensual",
};

export default function ReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await apiService.reports.getAll();
      setReports(response.data);
    } catch (error) {
      console.error("Error loading reports:", error);
      // Fallback to demo data if API fails
      setReports(demoReports);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setReportToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!reportToDelete) return;

    try {
      await apiService.reports.delete(reportToDelete);
      setReports(reports.filter((r) => r.id !== reportToDelete));
      toast.success("Reporte eliminado exitosamente");
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error("Error al eliminar el reporte");
    } finally {
      setDeleteDialogOpen(false);
      setReportToDelete(null);
    }
  };

  const handleGenerate = async (id: number) => {
    const toastId = toast.loading("Generando reporte...");

    try {
      const response = await apiService.reports.generate(id);
      if (response.data?.url) {
        toast.success("Reporte generado exitosamente", { id: toastId });
        // Open generated report in new tab
        window.open(response.data.url, '_blank');
        // Refresh reports list to update lastGenerated
        fetchReports();
      } else {
        toast.success(`Reporte #${id} generado exitosamente`, { id: toastId });
      }
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Error al generar el reporte", { id: toastId });
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || report.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: Report["type"]) => {
    switch (type) {
      case "sales":
        return <TrendingUp className="h-4 w-4" />;
      case "customers":
        return <FileText className="h-4 w-4" />;
      case "orders":
        return <FileSpreadsheet className="h-4 w-4" />;
      case "analytics":
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getFormatBadgeColor = (format: Report["format"]) => {
    switch (format) {
      case "pdf":
        return "destructive";
      case "excel":
        return "default";
      case "csv":
        return "secondary";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <MainLayout>
          <div className="text-center py-8">Cargando reportes...</div>
        </MainLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <MainLayout>
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-lg font-semibold md:text-2xl">Reportes y Exportaciones</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Genera y gestiona reportes personalizados de tu restaurante
              </p>
            </div>
            <Button onClick={() => router.push("/reports/builder")}>
              <Plus className="mr-2 h-4 w-4" />
              Crear Reporte
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reportes</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reports.length}</div>
                <p className="text-xs text-muted-foreground">Reportes configurados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Automáticos</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reports.filter((r) => r.schedule !== "manual").length}
                </div>
                <p className="text-xs text-muted-foreground">Generación programada</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Generados Hoy</CardTitle>
                <Download className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reports.filter((r) => {
                    if (!r.lastGenerated) return false;
                    const today = new Date().toDateString();
                    const generated = new Date(r.lastGenerated).toDateString();
                    return today === generated;
                  }).length}
                </div>
                <p className="text-xs text-muted-foreground">En las últimas 24h</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Formatos</CardTitle>
                <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">PDF, Excel, CSV</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar reportes por nombre..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Filtrar por tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="sales">Ventas</SelectItem>
                    <SelectItem value="customers">Clientes</SelectItem>
                    <SelectItem value="orders">Pedidos</SelectItem>
                    <SelectItem value="analytics">Analytics</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Reports Table */}
          <Card>
            <CardHeader>
              <CardTitle>Reportes ({filteredReports.length})</CardTitle>
              <CardDescription>Lista de reportes configurados</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredReports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No se encontraron reportes
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Formato</TableHead>
                      <TableHead>Programación</TableHead>
                      <TableHead>Última Generación</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <div className="flex items-start gap-2">
                            {getTypeIcon(report.type)}
                            <div>
                              <div className="font-medium">{report.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {report.description}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{reportTypeLabels[report.type]}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getFormatBadgeColor(report.format)}>
                            {reportFormatLabels[report.format]}
                          </Badge>
                        </TableCell>
                        <TableCell>{scheduleLabels[report.schedule]}</TableCell>
                        <TableCell>
                          {report.lastGenerated ? (
                            <div className="text-sm">
                              {format(new Date(report.lastGenerated), "dd/MM/yyyy HH:mm", {
                                locale: es,
                              })}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Nunca</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleGenerate(report.id)}>
                                <Download className="mr-2 h-4 w-4" />
                                Generar Ahora
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => router.push(`/reports/${report.id}`)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(report.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. El reporte será eliminado permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </MainLayout>
    </AuthGuard>
  );
}
