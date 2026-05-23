"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { btnPrimary } from "@/lib/ui";
import { PRIORITY_PILLARS, WORKSHEET_IDS } from "@/lib/curriculum";

interface Item {
  id: string;
  content: string;
  priority_pillar: string | null;
  sub_pillar: string | null;
  created_at: string | Date;
}

const PILLAR_LABEL: Record<string, string> = Object.fromEntries(
  PRIORITY_PILLARS.map((p) => [p.id, p.label]),
);

export default function ListOfJoyClient({
  initialItems,
}: {
  initialItems: Item[];
}) {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>(initialItems);
  const [draft, setDraft] = useState("");
  const [pillar, setPillar] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    const content = draft.trim();
    if (!content) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/curriculum/list-of-joy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, pillar: pillar || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't add that.");
      setItems((cur) => [data.item, ...cur]);
      setDraft("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function removeItem(id: string) {
    const prev = items;
    setItems((cur) => cur.filter((x) => x.id !== id));
    try {
      const res = await fetch(`/api/curriculum/list-of-joy/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
    } catch {
      setItems(prev);
      setError("Couldn't remove that — try again?");
    }
  }

  async function done() {
    // Mark the worksheet complete (so the dashboard shows it as done).
    await fetch(`/api/curriculum/worksheets/${WORKSHEET_IDS.listOfJoy}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: { count: items.length },
        complete: items.length >= 5,
      }),
    }).catch(() => {});
    router.push("/curriculum/module/02-joyful-operating-system");
  }

  const inputClass =
    "w-full rounded-xl border border-navy/15 bg-white px-4 py-3 font-sans text-[15px] text-navy outline-none transition placeholder:text-navy/35 focus:border-cyan-deep focus:ring-2 focus:ring-cyan-deep/25";
  const selectClass =
    "rounded-xl border border-navy/15 bg-white px-3 py-3 font-sans text-[14px] text-navy outline-none transition focus:border-cyan-deep focus:ring-2 focus:ring-cyan-deep/25";

  return (
    <section className="space-y-8">
      <form
        onSubmit={addItem}
        className="grid gap-3 rounded-2xl border border-navy/12 bg-mist p-5 sm:grid-cols-[1fr_180px_auto]"
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="What brought you joy today?"
          maxLength={280}
          className={inputClass}
          aria-label="New joy item"
        />
        <select
          value={pillar}
          onChange={(e) => setPillar(e.target.value)}
          className={selectClass}
          aria-label="Priority pillar (optional)"
        >
          <option value="">No pillar</option>
          {PRIORITY_PILLARS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={busy || !draft.trim()}
          className={btnPrimary}
        >
          {busy ? "…" : "Add"}
        </button>
      </form>

      {error && (
        <p className="font-sans text-[13px] text-[#8a6d00]">{error}</p>
      )}

      <div className="space-y-3">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-navy/55">
          Your list — {items.length} {items.length === 1 ? "joy" : "joys"}
        </p>

        {items.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-navy/15 bg-white p-8 text-center font-sans text-[14px] font-light text-navy/55">
            Nothing here yet. Start with the smallest thing that made you
            smile this week.
          </p>
        ) : (
          <ul className="space-y-2">
            {items.map((it) => (
              <li
                key={it.id}
                className="group flex items-start gap-3 rounded-xl border border-navy/10 bg-white px-4 py-3"
              >
                <span aria-hidden className="mt-1 text-cyan-deep">
                  ✦
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-[16px] leading-relaxed text-navy">
                    {it.content}
                  </p>
                  {it.priority_pillar && (
                    <p className="mt-1 font-sans text-[11px] uppercase tracking-[0.16em] text-cyan-deep">
                      {PILLAR_LABEL[it.priority_pillar] ?? it.priority_pillar}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(it.id)}
                  className="font-sans text-[12px] text-navy/35 opacity-0 transition group-hover:opacity-100 hover:text-[#8a6d00]"
                  aria-label="Remove"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-navy/10 pt-6">
        <p className="font-sans text-[12px] text-navy/45">
          {items.length >= 5
            ? "Beautiful start. You can keep returning to add more."
            : `Aim for at least 5 to start — you've got ${items.length}.`}
        </p>
        <button onClick={done} className={btnPrimary}>
          Continue →
        </button>
      </div>
    </section>
  );
}
