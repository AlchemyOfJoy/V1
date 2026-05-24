"use client";

import { useState } from "react";

export interface LoggedEntry {
  id: string;
  body: string;
  title: string | null;
  created_at: string | Date;
}

export function useLogger(slug: string, initial: LoggedEntry[]) {
  const [entries, setEntries] = useState<LoggedEntry[]>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function log(body: string, title?: string | null): Promise<boolean> {
    const trimmed = body.trim();
    if (!trimmed) {
      setError("Write something first.");
      return false;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/curriculum/bold-action/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: trimmed, title: title ?? null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't log that.");
      setEntries((cur) => [data.entry, ...cur].slice(0, 20));
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  }

  return { entries, busy, error, log };
}
