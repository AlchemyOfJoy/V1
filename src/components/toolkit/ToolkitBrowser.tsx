"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { TOOLS, type ToolType } from "@/lib/toolkit-20";

const TYPES: (ToolType | "All")[] = [
  "All",
  "Action",
  "Behavior",
  "Body",
  "Emotion",
  "Environment",
  "Mind",
  "Reflection",
];

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
        t.when.toLowerCase().includes(needle) ||
        t.type.toLowerCase().includes(needle)
      );
    });
  }, [q, type]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label htmlFor="toolkit-search" className="sr-only">
          Search the Tool Kit
        </label>
        <input
          id="toolkit-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by tool, mood, or moment…"
          className="w-full rounded-2xl border border-navy/15 bg-white px-5 py-3 font-sans text-[15px] text-navy outline-none transition placeholder:text-navy/40 focus:border-cyan-deep focus:ring-2 focus:ring-cyan-deep/25"
        />
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`rounded-full px-3 py-1.5 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] transition ${
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

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-navy/15 bg-white p-8 text-center font-sans text-[14px] font-light text-navy/55">
          Nothing matched. Try a different word or clear the filter.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {filtered.map((t) => (
            <li key={t.id}>
              <Link
                href={t.href}
                className="group block h-full rounded-2xl border border-navy/12 bg-white p-5 transition hover:border-cyan-deep/40"
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-navy/40">
                    {String(t.id).padStart(2, "0")} · {t.type}
                  </span>
                  <span className="font-sans text-[10px] uppercase tracking-[0.16em] text-cyan-deep">
                    {t.time}
                  </span>
                </div>
                <h3 className="mt-2 font-serif text-[18px] font-medium text-navy">
                  {t.name}
                </h3>
                <p className="mt-1 font-sans text-[13px] font-light leading-relaxed text-navy/60">
                  {t.when}
                </p>
                {!t.interactive && (
                  <p className="mt-2 font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-navy/35">
                    Reference card
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
