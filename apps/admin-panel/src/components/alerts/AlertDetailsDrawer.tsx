"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { apiService } from "@/lib/api";
import { formatRelativeTime } from "@/lib/formatters";
import type { AlertInboxItem, AlertDetailResponse } from "@/types/alerts";

interface AlertDetailsDrawerProps {
  open: boolean;
  alertId: string | null;
  onOpenChange: (open: boolean) => void;
  onAckUpdated: (item: AlertInboxItem) => void;
}

export function AlertDetailsDrawer({
  open,
  alertId,
  onOpenChange,
  onAckUpdated,
}: AlertDetailsDrawerProps) {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<AlertInboxItem | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [showJson, setShowJson] = useState(false);
  const [ackOpen, setAckOpen] = useState(false);
  const [ackNote, setAckNote] = useState("");
  const [ackSubmitting, setAckSubmitting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const labels = useMemo(() => detail?.payload?.labels || {}, [detail]);
  const annotations = useMemo(() => detail?.payload?.annotations || {}, [detail]);
  const startsAt = detail?.payload?.startsAt;
  const endsAt = detail?.payload?.endsAt;

  useEffect(() => {
    if (!open || !alertId) return;

    const controller = new AbortController();
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = (await apiService.alerts.get(alertId, controller.signal)) as
          | AlertDetailResponse
          | { ok: boolean; item: AlertInboxItem; requestId?: string | null };
        setDetail(response.item);
        setRequestId(response.requestId || null);
      } catch (err: any) {
        if (err?.name === "CanceledError") return;
        setError(t("alerts.errorLoading"));
        setDetail(null);
      } finally {
        setLoading(false);
      }
    };

    void load();

    return () => controller.abort();
  }, [alertId, open, refreshKey, t]);

  useEffect(() => {
    if (!open) {
      setDetail(null);
      setError(null);
      setRequestId(null);
      setShowJson(false);
      setAckOpen(false);
      setAckNote("");
      setAckSubmitting(false);
    }
  }, [open]);

  const handleCopyJson = async () => {
    if (!detail) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(detail.payload, null, 2));
      toast({ title: t("alerts.copySuccess") });
    } catch {
      toast({ title: t("common.error"), description: t("alerts.errorLoading"), variant: "destructive" });
    }
  };

  const handleAcknowledge = async () => {
    if (!detail) return;
    try {
      setAckSubmitting(true);
      const response = (await apiService.alerts.ack(detail.id, ackNote)) as
        | AlertDetailResponse
        | { ok: boolean; item: AlertInboxItem; requestId?: string | null };
      setDetail(response.item);
      setRequestId(response.requestId || null);
      onAckUpdated(response.item);
      setAckOpen(false);
      setAckNote("");
      toast({ title: t("alerts.acknowledged") });
    } catch (err) {
      toast({ title: t("common.error"), description: t("alerts.errorLoading"), variant: "destructive" });
    } finally {
      setAckSubmitting(false);
    }
  };

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="fixed right-0 top-0 left-auto bottom-0 h-screen w-full max-w-2xl translate-x-0 translate-y-0 rounded-none border-l p-0"
      >
        <div className="flex h-full flex-col">
          <DialogHeader className="px-6 pt-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <DialogTitle className="flex items-center gap-2">
                  {detail?.alertname || t("alerts.details")}
                  {detail?.acknowledgedAt && (
                    <Badge variant="secondary">ACK</Badge>
                  )}
                </DialogTitle>
                <DialogDescription>{t("alerts.details")}</DialogDescription>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant={severityBadge(detail?.severity)}>
                  {detail?.severity || t("alerts.unknown")}
                </Badge>
                <Badge variant={statusBadge(detail?.status)}>
                  {detail?.status || t("alerts.unknown")}
                </Badge>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 pb-6">
            {loading && (
              <div className="space-y-4 pt-4">
                <div className="h-6 w-1/2 animate-pulse rounded bg-muted" />
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                <div className="h-32 w-full animate-pulse rounded bg-muted" />
              </div>
            )}

            {!loading && error && (
              <Card className="mt-4">
                <CardContent className="py-6 text-center">
                  <div className="text-sm text-muted-foreground">{error}</div>
                  <Button
                    className="mt-4"
                    variant="outline"
                    onClick={() => setRefreshKey((prev) => prev + 1)}
                  >
                    {t("alerts.retry")}
                  </Button>
                </CardContent>
              </Card>
            )}

            {!loading && !error && detail && (
              <div className="space-y-6 pt-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <div className="text-xs text-muted-foreground">{t("alerts.createdAt")}</div>
                        <div className="font-medium">{formatRelativeTime(detail.createdAt)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">{t("alerts.instanceJob")}</div>
                        <div className="text-sm">{detail.instance || "-"}</div>
                        <div className="text-sm text-muted-foreground">{detail.job || "-"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">{t("alerts.fingerprint")}</div>
                        <div className="text-sm break-all">{detail.fingerprint}</div>
                      </div>
                      {requestId && (
                        <div>
                          <div className="text-xs text-muted-foreground">{t("alerts.requestId")}</div>
                          <div className="text-sm break-all">{requestId}</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">{t("alerts.timeline")}</div>
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <div>
                        <div className="text-xs text-muted-foreground">{t("alerts.startsAt")}</div>
                        <div className="text-sm">{startsAt ? formatRelativeTime(startsAt) : "-"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">{t("alerts.endsAt")}</div>
                        <div className="text-sm">{endsAt ? formatRelativeTime(endsAt) : "-"}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm font-medium">{t("alerts.labels")}</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {Object.keys(labels).length === 0 && (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                      {Object.entries(labels).map(([key, value]) => (
                        <Badge key={key} variant="outline">
                          {key}: {String(value)}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm font-medium">{t("alerts.annotations")}</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {Object.keys(annotations).length === 0 && (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                      {Object.entries(annotations).map(([key, value]) => (
                        <Badge key={key} variant="outline">
                          {key}: {String(value)}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">{t("alerts.payload")}</div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setShowJson(!showJson)}>
                          {showJson ? t("alerts.hideJson") : t("alerts.showJson")}
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCopyJson}>
                          {t("alerts.copyJson")}
                        </Button>
                      </div>
                    </div>
                    {showJson && (
                      <pre className="max-h-64 overflow-auto rounded-md bg-muted p-3 text-xs">
                        {JSON.stringify(detail.payload, null, 2)}
                      </pre>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6 space-y-3">
                    <div className="text-sm font-medium">{t("alerts.acknowledged")}</div>
                    {detail.acknowledgedAt ? (
                      <>
                        <div className="text-sm">
                          {t("alerts.ackTime")}: {formatRelativeTime(detail.acknowledgedAt)}
                        </div>
                        <div className="text-sm">
                          {t("alerts.ackBy")}: {detail.acknowledgedBy || "-"}
                        </div>
                        <div className="text-sm">
                          {t("alerts.ackNote")}: {detail.ackNote || "-"}
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{t("alerts.notAcknowledged")}</span>
                        <Button onClick={() => setAckOpen(true)}>{t("alerts.acknowledge")}</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </DialogContent>

      <Dialog open={ackOpen} onOpenChange={setAckOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("alerts.acknowledge")}</DialogTitle>
            <DialogDescription>{t("alerts.ackNoteHelp")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea
              value={ackNote}
              onChange={(e) => setAckNote(e.target.value.slice(0, 500))}
              placeholder={t("alerts.ackNote")}
            />
            <Separator />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAckOpen(false)} disabled={ackSubmitting}>
                {t("common.cancel")}
              </Button>
              <Button onClick={handleAcknowledge} disabled={ackSubmitting}>
                {ackSubmitting ? t("alerts.loading") : t("alerts.acknowledge")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
