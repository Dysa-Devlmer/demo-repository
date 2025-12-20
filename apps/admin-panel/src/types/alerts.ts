export type AlertInboxItem = {
  id: string;
  createdAt: string;
  source: string;
  status: string;
  alertname: string;
  severity?: string | null;
  instance?: string | null;
  job?: string | null;
  payload: any;
  fingerprint: string;
  acknowledgedAt?: string | null;
  acknowledgedBy?: string | null;
  ackNote?: string | null;
};

export type AlertsListResponse = {
  ok: boolean;
  page: number;
  limit: number;
  total: number;
  pages: number;
  items: AlertInboxItem[];
};

export type AlertDetailResponse = {
  ok: boolean;
  item: AlertInboxItem;
  requestId?: string | null;
};
