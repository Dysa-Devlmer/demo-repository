"use client";

import { useEffect, useMemo, useState } from "react";
import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { apiService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { formatRelativeTime } from "@/lib/formatters";

interface AlertItem {
  id: string;
  createdAt: string;
  source: string;
  status: string;
  alertname: string;
  severity?: string | null;
  instance?: string | null;
  job?: string | null;
}

interface AlertsResponse {
  page: number;
  limit: number;
  total: number;
  pages: number;
  items: AlertItem[];
}

export default function AlertsPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [items, setItems] = useState<AlertItem[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [alertnameFilter, setAlertnameFilter] = useState("");

  const canPrev = page > 1;
  const canNext = page < pages;

  const statusOptions = useMemo(
    () => [
      { value: "all", label: t("alerts.all") },
      { value: "firing", label: t("alerts.firing") },
      { value: "resolved", label: t("alerts.resolved") },
      { value: "unknown", label: t("alerts.unknown") },
    ],
    [t]
  );

  const severityOptions = useMemo(
    () => [
      { value: "all", label: t("alerts.all") },
      { value: "critical", label: t("alerts.critical") },
      { value: "warning", label: t("alerts.warning") },
      { value: "info", label: t("alerts.info") },
    ],
    [t]
  );

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit,
        sort: "createdAt:desc",
      };

      if (statusFilter !== "all") params.status = statusFilter;
      if (severityFilter !== "all") params.severity = severityFilter;
      if (alertnameFilter.trim().length > 0) params.alertname = alertnameFilter.trim();

      const response = await apiService.alerts.list(params);
      const data = (response?.data || {}) as AlertsResponse;

      setItems(Array.isArray(data.items) ? data.items : []);
      setTotal(Number(data.total || 0));
      setPages(Number(data.pages || 1));
    } catch (error) {
      console.error("Error loading alerts:", error);
      setItems([]);
      setTotal(0);
      setPages(1);
      toast({
        title: t("common.error"),
        description: t("alerts.empty"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, severityFilter]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1);
      loadAlerts();
    }, 300);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alertnameFilter]);

  const statusBadge = (status: string) => {
    if (status === "firing") return "destructive";
    if (status === "resolved") return "secondary";
    return "outline";
  };

  const severityBadge = (severity?: string | null) => {
    if (severity === "critical") return "destructive";
    if (severity === "warning") return "secondary";
    return "outline";
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle>{t("alerts.title")}</CardTitle>
            <CardDescription>{t("alerts.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <div className="w-full md:w-56">
                <div className="text-sm text-muted-foreground">{t("alerts.filterStatus")}</div>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value);
                    setPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-56">
                <div className="text-sm text-muted-foreground">{t("alerts.filterSeverity")}</div>
                <Select
                  value={severityFilter}
                  onValueChange={(value) => {
                    setSeverityFilter(value);
                    setPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {severityOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:flex-1">
                <div className="text-sm text-muted-foreground">{t("alerts.filterAlertname")}</div>
                <Input
                  value={alertnameFilter}
                  onChange={(e) => setAlertnameFilter(e.target.value)}
                  placeholder={t("alerts.filterAlertname")}
                />
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("alerts.createdAt")}</TableHead>
                    <TableHead>{t("alerts.alertname")}</TableHead>
                    <TableHead>{t("alerts.severity")}</TableHead>
                    <TableHead>{t("alerts.status")}</TableHead>
                    <TableHead>{t("alerts.instanceJob")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!loading && items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        {t("alerts.empty")}
                      </TableCell>
                    </TableRow>
                  )}
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        {t("dashboard.loading")}
                      </TableCell>
                    </TableRow>
                  )}
                  {!loading &&
                    items.map((alert) => (
                      <TableRow key={alert.id}>
                        <TableCell className="whitespace-nowrap">
                          {formatRelativeTime(alert.createdAt)}
                        </TableCell>
                        <TableCell className="font-medium">{alert.alertname}</TableCell>
                        <TableCell>
                          <Badge variant={severityBadge(alert.severity)}>
                            {alert.severity || t("alerts.unknown")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusBadge(alert.status)}>
                            {alert.status || t("alerts.unknown")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          <div>{alert.instance || "-"}</div>
                          <div>{alert.job || "-"}</div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {t("alerts.total", { count: total })}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={!canPrev}>
                  {"<"} {t("alerts.prev")}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={!canNext}>
                  {t("alerts.next")} {">"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
