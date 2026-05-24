"use client";

import { useMemo, useState } from "react";
import { btnPrimary } from "@/lib/ui";
import ShareWithCoachButton from "@/components/sharing/ShareWithCoachButton";

export interface JournalItem {
  id: string;
  body: string;
  title: string | null;
  source: string; // human label e.g. "Joy Spark" or "Free-form"
  bucket: string; // grouping key e.g. "bold-action:joy-spark"
  created_at: string;
}

export default function JournalClient({
  initialItems,
  sources,
}: {
  initialItems: JournalItem[];
  sources: { key: string; label: string }[];
}) {
  const [items, setItems] = useState<JournalItem[]>(initialItems);
  const [filter, setFilter] = useState<string>("all");
  const [composing, setComposing] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const visible = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((i) => i.bucket === filter);
  }, [items, filter]);

  async function save() {
    const text = body.trim();
    if (!text) {
      setError("Write something first.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/curriculum/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text, title: title.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't save.");
      const entry = data.entry;
      setItems((cur) => [
        {
          id: String(entry.id),
          body: entry.body,
          title: entry.title,
          source: "Free-form",
          bucket: "freeform",
          created_at:
            typeof entry.created_at === "string"
              ? entry.created_at
              : new Date(entry.created_at).toISOString(),
        },
        ...cur,
      ]);
      setTitle("");
      setBody("");
      setComposing(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this entry?")) return;
    const prev = items;
    setItems((cur) => cur.filter((i) => i.id !== id));
    try {
      const res = await fetch(`/api/curriculum/journal/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
    } catch {
      setItems(prev);
      setError("Couldn't remove that — try again?");
    }
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-full px-3 py-1.5 font-sans text-[12px] font-semibold uppercase tracking-[0.14em] transition ${
              filter === "all"
                ? "bg-cyan-deep text-white"
                : "bg-mist text-navy/55 hover:text-cyan-deep"
            }`}
          >
            All ({items.length})
          </button>
          {sources.map((s) => {
            const count = items.filter((i) => i.bucket === s.key).length;
            if (count === 0) return null;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setFilter(s.key)}
                className={`rounded-full px-3 py-1.5 font-sans text-[12px] font-semibold uppercase tracking-[0.14em] transition ${
                  filter === s.key
                    ? "bg-cyan-deep text-white"
                    : "bg-mist text-navy/55 hover:text-cyan-deep"
                }`}
              >
                {s.label} ({count})
              </button>
            );
          })}
        </div>
        {!composing && (
          <button
            type="button"
            onClick={() => setComposing(true)}
            className={btnPrimary}
          >
            + New entry
          </button>
        )}
      </div>

      {composing && (
        <div className="space-y-3 rounded-2xl border border-navy/10 bg-mist p-5">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (optional)"
            className="w-full rounded-xl border border-navy/15 bg-white px-4 py-3 font-serif text-[18px] text-navy outline-none transition placeholder:font-sans placeholder:text-[15px] placeholder:font-light placeholder:text-navy/35 focus:border-cyan-deep focus:ring-2 focus:ring-cyan-deep/25"
          />
          <textarea
            rows={8}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="What's coming up?"
            className="w-full resize-y rounded-2xl border border-navy/15 bg-white px-5 py-4 font-serif text-[17px] leading-[1.85] text-navy outline-none transition placeholder:font-sans placeholder:text-[15px] placeholder:font-light placeholder:text-navy/40 focus:border-cyan-deep focus:ring-2 focus:ring-cyan-deep/25"
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-sans text-[12px] text-[#8a6d00]">{error}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setComposing(false);
                  setError(null);
                }}
                className="font-sans text-[13px] text-navy/55 hover:text-cyan-deep"
              >
                Cancel
              </button>
              <button onClick={save} className={btnPrimary} disabled={busy}>
                {busy ? "…" : "Save entry"}
              </button>
            </div>
          </div>
        </div>
      )}

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-navy/15 bg-white p-12 text-center font-sans text-[14px] font-light text-navy/55">
          Nothing here yet. Write your first entry — or let entries from
          your Bold Action tools accumulate over time.
        </p>
      ) : (
        <ul className="space-y-3">
          {visible.map((e) => {
            const d = new Date(e.created_at);
            return (
              <li
                key={e.id}
                className="group rounded-2xl border border-navy/10 bg-white p-5"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-deep">
                    {e.source} ·{" "}
                    {d.toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                  <button
                    type="button"
                    onClick={() => remove(e.id)}
                    className="font-sans text-[12px] text-navy/35 opacity-0 transition group-hover:opacity-100 hover:text-[#8a6d00]"
                    aria-label="Delete entry"
                  >
                    Delete
                  </button>
                </div>
                {e.title && (
                  <p className="mt-2 font-serif text-[20px] font-medium text-navy">
                    {e.title}
                  </p>
                )}
                <p className="mt-2 whitespace-pre-wrap font-serif text-[16px] leading-[1.8] text-navy">
                  {e.body}
                </p>
                <div className="mt-3 flex justify-end">
                  <ShareWithCoachButton
                    resourceType="journal"
                    resourceId={e.id}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
