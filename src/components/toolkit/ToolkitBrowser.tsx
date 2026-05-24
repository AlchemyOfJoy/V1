"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { TOOLS, type ToolType } from "@/lib/toolkit-20";

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
                {t.interactive && (
                  <span
                    aria-label="Interactive"
                    className="mt-1 shrink-0 text-[10px] text-cyan-deep"
                  >
                    ●
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
    </div>
  );
}
