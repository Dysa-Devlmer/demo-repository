"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { formatRelativeTime } from "@/lib/formatters";
import { AlertDetailsDrawer } from "@/components/alerts/AlertDetailsDrawer";
import { AlertnameAutocomplete } from "@/components/alerts/AlertnameAutocomplete";
import { useSavedAlertViews } from "@/hooks/useSavedAlertViews";
import type { AlertInboxItem, AlertsListResponse } from "@/types/alerts";

const parseIntSafe = (value: string | null, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const buildQuery = (next: Record<string, string | undefined>, current: URLSearchParams) => {
  const sp = new URLSearchParams(current.toString());
  for (const [key, value] of Object.entries(next)) {
    if (!value) sp.delete(key);
    else sp.set(key, value);
  }
  return sp;
};

const shallowEqual = (left: Record<string, string>, right: Record<string, string>) => {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  if (leftKeys.length !== rightKeys.length) return false;
  return leftKeys.every((key) => left[key] === right[key]);
};

export default function AlertsPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams() ?? new URLSearchParams();
  const { views, saveView, deleteView } = useSavedAlertViews();

  const page = parseIntSafe(searchParams.get("page"), 1);
  const limit = parseIntSafe(searchParams.get("limit"), 25);
  const sort = searchParams.get("sort") ?? "createdAt:desc";
  const statusFilter = searchParams.get("status") ?? "all";
  const severityFilter = searchParams.get("severity") ?? "all";
  const alertnameFilter = searchParams.get("alertname") ?? "";

  const [items, setItems] = useState<AlertInboxItem[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [alertnameDraft, setAlertnameDraft] = useState(alertnameFilter);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState("");

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

  const currentParams = useMemo(() => {
    const params: Record<string, string> = {};
    if (statusFilter !== "all") params.status = statusFilter;
    if (severityFilter !== "all") params.severity = severityFilter;
    if (alertnameFilter.trim()) params.alertname = alertnameFilter.trim();
    if (sort !== "createdAt:desc") params.sort = sort;
    if (limit !== 25) params.limit = String(limit);
    return params;
  }, [alertnameFilter, limit, severityFilter, sort, statusFilter]);

  const activeView = useMemo(
    () => views.find((view) => shallowEqual(view.params, currentParams)) || null,
    [views, currentParams]
  );

  const updateParams = useCallback(
    (next: Record<string, string | undefined>) => {
      const sp = buildQuery(next, searchParams);
      const qs = sp.toString();
      router.replace(qs ? `/alerts?${qs}` : "/alerts", { scroll: false });
    },
    [router, searchParams]
  );

  const replaceParams = useCallback(
    (next: Record<string, string | undefined>) => {
      const sp = new URLSearchParams();
      for (const [key, value] of Object.entries(next)) {
        if (value) sp.set(key, value);
      }
      const qs = sp.toString();
      router.replace(qs ? `/alerts?${qs}` : "/alerts", { scroll: false });
    },
    [router]
  );

  useEffect(() => {
    setAlertnameDraft(alertnameFilter);
  }, [alertnameFilter]);

  useEffect(() => {
    const trimmed = alertnameDraft.trim();
    const nextValue = trimmed.length > 0 ? trimmed : undefined;

    if ((alertnameFilter || "") === (nextValue || "")) return;

    const handler = setTimeout(() => {
      updateParams({ alertname: nextValue, page: "1" });
    }, 300);

    return () => clearTimeout(handler);
  }, [alertnameDraft, alertnameFilter, updateParams]);

  useEffect(() => {
    let active = true;

    const loadAlerts = async () => {
      try {
        setLoading(true);
        const params: any = {
          page,
          limit,
          sort,
        };

        if (statusFilter !== "all") params.status = statusFilter;
        if (severityFilter !== "all") params.severity = severityFilter;
        if (alertnameFilter.trim().length > 0) params.alertname = alertnameFilter.trim();

        const data = (await apiService.alerts.list(params)) as AlertsListResponse;
        if (!active) return;

        setItems(Array.isArray(data.items) ? data.items : []);
        setTotal(Number(data.total || 0));
        setPages(Number(data.pages || 1));
      } catch (error) {
        if (!active) return;

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
        if (active) setLoading(false);
      }
    };

    void loadAlerts();

    return () => {
      active = false;
    };
  }, [alertnameFilter, limit, page, severityFilter, sort, statusFilter, t, toast]);

  const statusBadge = (status?: string | null) => {
    if (status === "firing") return "destructive";
    if (status === "resolved") return "secondary";
    return "outline";
  };

  const severityBadge = (severity?: string | null) => {
    if (severity === "critical") return "destructive";
    if (severity === "warning") return "secondary";
    return "outline";
  };

  const handleSaveView = () => {
    const name = saveName.trim();
    if (!name) return;
    saveView(name, currentParams);
    setSaveName("");
    setSaveDialogOpen(false);
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
                <div className="text-sm text-muted-foreground">{t("alerts.filters.status")}</div>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => updateParams({
                    status: value === "all" ? undefined : value,
                    page: "1",
                  })}
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
                <div className="text-sm text-muted-foreground">{t("alerts.filters.severity")}</div>
                <Select
                  value={severityFilter}
                  onValueChange={(value) => updateParams({
                    severity: value === "all" ? undefined : value,
                    page: "1",
                  })}
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
                <div className="text-sm text-muted-foreground">{t("alerts.filters.alertname")}</div>
                <AlertnameAutocomplete
                  value={alertnameDraft}
                  onChange={setAlertnameDraft}
                  onSelect={(value) => {
                    setAlertnameDraft(value);
                    updateParams({ alertname: value, page: "1" });
                  }}
                  placeholder={t("alerts.filters.alertname")}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-end gap-3 rounded-md border border-dashed p-3">
              <div className="w-full md:w-72">
                <div className="text-sm text-muted-foreground">{t("alerts.filters.savedViews")}</div>
                <Select
                  value={activeView?.id ?? ""}
                  onValueChange={(value) => {
                    const view = views.find((entry) => entry.id === value);
                    if (!view) return;
                    replaceParams({ ...view.params, page: "1" });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("alerts.filters.apply")} />
                  </SelectTrigger>
                  <SelectContent>
                    {views.length === 0 && (
                      <SelectItem value="__empty" disabled>
                        {t("alerts.noResults")}
                      </SelectItem>
                    )}
                    {views.map((view) => (
                      <SelectItem key={view.id} value={view.id}>
                        {view.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    {t("alerts.filters.saveView")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("alerts.filters.saveView")}</DialogTitle>
                    <DialogDescription>{t("alerts.filters.viewName")}</DialogDescription>
                  </DialogHeader>
                  <Input
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    maxLength={60}
                    placeholder={t("alerts.filters.viewName")}
                  />
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                      {t("common.cancel")}
                    </Button>
                    <Button onClick={handleSaveView} disabled={!saveName.trim()}>
                      {t("alerts.filters.saveView")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              {activeView && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteView(activeView.id)}
                >
                  {t("alerts.filters.delete")}
                </Button>
              )}
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
                      <TableRow
                        key={alert.id}
                        className="cursor-pointer hover:bg-muted/40"
                        onClick={() => {
                          setSelectedAlertId(alert.id);
                          setDrawerOpen(true);
                        }}
                      >
                        <TableCell className="whitespace-nowrap">
                          {formatRelativeTime(alert.createdAt)}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {alert.alertname}
                            {alert.acknowledgedAt && (
                              <Badge variant="secondary">ACK</Badge>
                            )}
                          </div>
                        </TableCell>
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateParams({ page: String(page - 1) })}
                  disabled={!canPrev}
                >
                  {"<"} {t("alerts.prev")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateParams({ page: String(page + 1) })}
                  disabled={!canNext}
                >
                  {t("alerts.next")} {">"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        <AlertDetailsDrawer
          open={drawerOpen}
          alertId={selectedAlertId}
          onOpenChange={(open) => {
            setDrawerOpen(open);
            if (!open) setSelectedAlertId(null);
          }}
          onAckUpdated={(updated) => {
            setItems((prev) =>
              prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item))
            );
          }}
        />
      </div>
    </MainLayout>
  );
}
