"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Debounced autosave for a worksheet's full `data` object. Fires a
 * POST 1.5s after the user stops editing. Also exposes `markComplete()`
 * to flip the worksheet to completed on Continue.
 */
export function useWorksheetSave<T extends object>(
  worksheetId: string,
  data: T,
) {
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isFirst = useRef(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setSaving(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/curriculum/worksheets/${worksheetId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data }),
          },
        );
        if (!res.ok) throw new Error(`save failed (${res.status})`);
        setSavedAt(new Date());
      } catch (e) {
        setError((e as Error).message || "Save failed");
      } finally {
        setSaving(false);
      }
    }, 1500);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [data, worksheetId]);

  async function markComplete(): Promise<boolean> {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/curriculum/worksheets/${worksheetId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, complete: true }),
      });
      if (!res.ok) {
        setError(`save failed (${res.status})`);
        return false;
      }
      setSavedAt(new Date());
      return true;
    } finally {
      setSaving(false);
    }
  }

  return { savedAt, saving, error, markComplete };
}

export function formatSavedAt(date: Date | null): string {
  if (!date) return "";
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  return date.toLocaleTimeString();
}
