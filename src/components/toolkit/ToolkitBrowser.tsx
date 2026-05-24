"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { TOOLS, type ToolType } from "@/lib/toolkit-20";

type ViewMode = "rituals" | "all";

/**
 * Rituals are curated bundles of tools — the "what do I reach for"
 * pattern, organized by the moment in the day.
 */
const RITUALS: { id: string; label: string; helper: string; toolIds: number[] }[] = [
  {
    id: "morning",
    label: "Morning",
    helper: "Set the day before the day sets you.",
    toolIds: [15, 8, 11], // Morning Orbit, ITT Framework, JQ Assessment
  },
  {
    id: "moment",
    label: "Right now",
    helper: "In a spiral. In a trigger. In the middle of it.",
    toolIds: [19, 18, 1, 10, 4], // Reset Breath, Reframe Ritual, 60-Sec Shift, Joy Judo, Emotional Alchemy
  },
  {
    id: "evening",
    label: "Evening",
    helper: "Close the day with grace.",
    toolIds: [5, 16, 20], // Evening Wind-Down, One Minute Window, Spirit Walks
  },
  {
    id: "deep",
    label: "Deep work",
    helper: "When you're ready to go in.",
    toolIds: [6, 17, 13, 7], // Forgiveness, Overview Effect, Law of Expansion, Habit Renaissance
  },
  {
    id: "environment",
    label: "Environment",
    helper: "Change what you live inside.",
    toolIds: [2, 3, 9, 12, 14], // BPT/BDT, Dopamine Detox, JOMO, D.A.D., Zero Gravity
  },
];

const TYPES: (ToolType | "All")[] = [
  "All",
  "Action",
  "Body",
  "Behavior",
  "Emotion",
  "Mind",
  "Environment",
  "Reflection",
];

const TYPE_GLYPH: Record<ToolType, string> = {
  Action: "→",
  Body: "○",
  Behavior: "◇",
  Emotion: "❋",
  Environment: "□",
  Mind: "△",
  Reflection: "◐",
};

export default function ToolkitBrowser() {
  const [view, setView] = useState<ViewMode>("rituals");
  const [q, setQ] = useState("");
  const [type, setType] = useState<ToolType | "All">("All");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return TOOLS.filter((t) => {
      if (type !== "All" && t.type !== type) return false;
      if (!needle) return true;
      return (
        t.name.toLowerCase().includes(needle) ||
        t.when.toLowerCase().includes(needle)
      );
    });
  }, [q, type]);

  return (
    <div className="space-y-5">
      {/* View toggle */}
      <div className="flex gap-2">
        {[
          { id: "rituals", label: "By ritual" },
          { id: "all", label: "All 20" },
        ].map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setView(v.id as ViewMode)}
            className={`rounded-full px-4 py-1.5 font-sans text-[12px] font-semibold uppercase tracking-[0.14em] transition ${
              view === v.id
                ? "bg-cyan-deep text-white"
                : "bg-mist text-navy/60 hover:text-cyan-deep"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {view === "rituals" ? (
        <ul className="space-y-4">
          {RITUALS.map((r) => {
            const tools = r.toolIds
              .map((id) => TOOLS.find((t) => t.id === id))
              .filter((t): t is (typeof TOOLS)[number] => Boolean(t));
            return (
              <li
                key={r.id}
                className="rounded-3xl border border-navy/10 bg-white p-5"
              >
                <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-deep">
                  {r.label}
                </p>
                <p className="mt-1 font-serif text-[18px] italic leading-relaxed text-navy/75">
                  {r.helper}
                </p>
                <ul className="mt-4 space-y-1.5">
                  {tools.map((t) => (
                    <li key={t.id}>
                      <Link
                        href={t.href}
                        className="group flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-mist/40"
                      >
                        <span
                          aria-hidden
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mist text-[13px] text-cyan-deep"
                        >
                          {TYPE_GLYPH[t.type]}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-serif text-[15px] text-navy">
                            {t.name}
                          </p>
                          <p className="font-sans text-[11px] font-light text-navy/55">
                            {t.time}
                          </p>
                        </div>
                        {t.interactive ? (
                          <span
                            aria-label="Interactive"
                            className="font-sans text-[10px] text-cyan-deep"
                          >
                            ●
                          </span>
                        ) : (
                          <span
                            aria-label="Reference card"
                            className="font-sans text-[10px] text-navy/30"
                          >
                            ○
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      ) : (
        <>
          <div className="space-y-3">
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by mood or moment…"
              className="w-full rounded-2xl border border-navy/15 bg-white px-5 py-3 font-sans text-[15px] text-navy outline-none transition placeholder:text-navy/40 focus:border-cyan-deep focus:ring-2 focus:ring-cyan-deep/25"
            />
            <div className="-mx-2 flex gap-2 overflow-x-auto px-2 pb-1">
              {TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`whitespace-nowrap rounded-full px-3 py-1.5 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] transition ${
                    type === t
                      ? "bg-cyan-deep text-white"
                      : "bg-mist text-navy/60 hover:text-cyan-deep"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <ul className="grid gap-2.5 sm:grid-cols-2">
            {filtered.map((t) => (
              <li key={t.id}>
                <Link
                  href={t.href}
                  className="group block h-full rounded-2xl border border-navy/10 bg-white p-4 transition hover:border-cyan-deep/40"
                >
                  <div className="flex items-start gap-3">
                    <span
                      aria-hidden
                      className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mist text-[14px] text-cyan-deep"
                    >
                      {TYPE_GLYPH[t.type]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-navy/40">
                        {String(t.id).padStart(2, "0")} · {t.time}
                      </p>
                      <h3 className="mt-0.5 font-serif text-[17px] font-medium text-navy">
                        {t.name}
                      </h3>
                      <p className="mt-1 line-clamp-2 font-sans text-[12px] font-light leading-relaxed text-navy/55">
                        {t.when}
                      </p>
                    </div>
                    {t.interactive ? (
                      <span
                        aria-label="Interactive"
                        className="mt-1 shrink-0 text-[10px] text-cyan-deep"
                      >
                        ●
                      </span>
                    ) : (
                      <span
                        aria-label="Reference card"
                        className="mt-1 shrink-0 text-[10px] text-navy/30"
                      >
                        ○
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {filtered.length === 0 && (
            <p className="rounded-2xl border border-dashed border-navy/15 bg-white p-8 text-center font-sans text-[13px] font-light text-navy/50">
              Nothing matched.
            </p>
          )}
        </>
      )}
    </div>
  );
}
