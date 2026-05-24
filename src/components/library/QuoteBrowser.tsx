"use client";

import { useMemo, useState } from "react";
import { QUOTES, type Quote, type QuoteSection } from "@/lib/quotes";

const SECTIONS: { id: QuoteSection | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "foundations", label: "Foundations" },
  { id: "invest", label: "Invest" },
  { id: "train", label: "Train" },
  { id: "action", label: "Action" },
];

export default function QuoteBrowser({
  initial = QUOTES,
}: {
  initial?: Quote[];
}) {
  const [q, setQ] = useState("");
  const [section, setSection] = useState<QuoteSection | "all">("all");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return initial.filter((quote) => {
      if (section !== "all" && quote.section !== section) return false;
      if (!needle) return true;
      return (
        quote.body.toLowerCase().includes(needle) ||
        quote.topics.some((t) => t.includes(needle))
      );
    });
  }, [q, section, initial]);

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search Brent's words…"
          className="w-full rounded-2xl border border-navy/15 bg-white px-5 py-3 font-sans text-[15px] text-navy outline-none transition placeholder:text-navy/40 focus:border-cyan-deep focus:ring-2 focus:ring-cyan-deep/25"
        />
        <div className="flex flex-wrap gap-2">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSection(s.id)}
              className={`rounded-full px-3 py-1.5 font-sans text-[11px] font-semibold uppercase tracking-[0.16em] transition ${
                section === s.id
                  ? "bg-cyan-deep text-white"
                  : "bg-mist text-navy/60 hover:text-cyan-deep"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-navy/45">
        {filtered.length} {filtered.length === 1 ? "quote" : "quotes"}
      </p>

      <ul className="space-y-3">
        {filtered.map((quote) => (
          <li
            key={quote.id}
            className="rounded-2xl border border-navy/10 bg-[#FAF6EC] px-5 py-4"
          >
            <p className="font-serif text-[16px] italic leading-[1.65] text-navy">
              <span className="text-gold">&ldquo;</span>
              {quote.body}
              <span className="text-gold">&rdquo;</span>
            </p>
            <p className="mt-2 font-sans text-[10px] uppercase tracking-[0.22em] text-navy/45">
              — BJF · {sectionLabel(quote.section)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function sectionLabel(s: QuoteSection): string {
  return s === "foundations"
    ? "Foundations"
    : s === "invest"
      ? "Invest in Joy"
      : s === "train"
        ? "Train Your Brain"
        : "Take Bold Action";
}
