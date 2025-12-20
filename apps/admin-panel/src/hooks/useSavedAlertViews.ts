"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type SavedAlertView = {
  id: string;
  name: string;
  params: Record<string, string>;
  createdAt: string;
};

const STORAGE_KEY = "alerts_saved_views";

export function useSavedAlertViews() {
  const [views, setViews] = useState<SavedAlertView[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as SavedAlertView[];
      if (Array.isArray(parsed)) setViews(parsed);
    } catch {
      setViews([]);
    }
  }, []);

  const persist = useCallback((next: SavedAlertView[]) => {
    setViews(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const saveView = useCallback(
    (name: string, params: Record<string, string>) => {
      const view: SavedAlertView = {
        id: crypto.randomUUID(),
        name,
        params,
        createdAt: new Date().toISOString(),
      };
      persist([view, ...views]);
      return view;
    },
    [persist, views]
  );

  const deleteView = useCallback(
    (id: string) => {
      const next = views.filter((v) => v.id !== id);
      persist(next);
    },
    [persist, views]
  );

  const getView = useCallback(
    (id: string) => views.find((v) => v.id === id) || null,
    [views]
  );

  return useMemo(
    () => ({
      views,
      saveView,
      deleteView,
      getView,
    }),
    [views, saveView, deleteView, getView]
  );
}
