"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { apiService } from "@/lib/api";
import { useTranslation } from "@/hooks/useTranslation";

type AlertnameItem = { alertname: string; count: number };

interface AlertnameAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (value: string) => void;
  placeholder?: string;
}

export function AlertnameAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder,
}: AlertnameAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AlertnameItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const cacheRef = useRef<Map<string, AlertnameItem[]>>(new Map());
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const q = value.trim();
    if (q.length < 2) {
      setItems([]);
      setOpen(false);
      return;
    }

    if (cacheRef.current.has(q)) {
      setItems(cacheRef.current.get(q) || []);
      setOpen(true);
      return;
    }

    const handler = setTimeout(async () => {
      try {
        setLoading(true);
        const res = (await apiService.alerts.metaAlertnames(q, 20)) as {
          items?: AlertnameItem[];
        };
        const next = Array.isArray(res.items) ? res.items : [];
        cacheRef.current.set(q, next);
        setItems(next);
        setOpen(true);
        setHighlight(0);
      } catch {
        setItems([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(handler);
  }, [value]);

  const commitSelect = (item: AlertnameItem) => {
    onSelect(item.alertname);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || items.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((prev) => Math.min(prev + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = items[highlight];
      if (item) commitSelect(item);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          if (items.length > 0) setOpen(true);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-expanded={open}
        aria-autocomplete="list"
      />
      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-md border bg-background shadow">
          {loading && (
            <div className="px-3 py-2 text-sm text-muted-foreground">{t("alerts.loading")}</div>
          )}
          {!loading && items.length === 0 && (
            <div className="px-3 py-2 text-sm text-muted-foreground">{t("alerts.noResults")}</div>
          )}
          {!loading &&
            items.map((item, idx) => (
              <button
                key={item.alertname}
                type="button"
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted ${
                  idx === highlight ? "bg-muted" : ""
                }`}
                onMouseEnter={() => setHighlight(idx)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => commitSelect(item)}
              >
                <span>{item.alertname}</span>
                <span className="text-xs text-muted-foreground">{item.count}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
