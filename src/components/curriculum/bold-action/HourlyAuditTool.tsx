"use client";

import { useMemo, useState } from "react";
import { btnPrimary } from "@/lib/ui";
import EntryLog from "./EntryLog";
import { useLogger, type LoggedEntry } from "./useLogger";

const SLUG = "hourly-audit";

const CATEGORIES = [
  { id: "joy", label: "Toward joy", color: "bg-cyan-deep" },
  { id: "neutral", label: "Neutral / maintenance", color: "bg-navy/35" },
  { id: "away", label: "Away from joy", color: "bg-gold" },
] as const;

type CatId = (typeof CATEGORIES)[number]["id"];

export default function HourlyAuditTool({
  initialEntries,
}: {
  initialEntries: LoggedEntry[];
}) {
  const { entries, busy, error, log } = useLogger(SLUG, initialEntries);
  const [sleepHours, setSleepHours] = useState(56);
  const [joy, setJoy] = useState(20);
  const [neutral, setNeutral] = useState(60);
  const [reflection, setReflection] = useState("");

  const wakingHours = Math.max(0, 168 - sleepHours);
  const remaining = wakingHours - joy - neutral;
  const away = Math.max(0, remaining);

  const totals: Record<CatId, number> = { joy, neutral, away };
  const pct = (n: number) =>
    wakingHours > 0 ? Math.round((n / wakingHours) * 100) : 0;

  const summary = useMemo(
    () =>
      [
        `Out of ${wakingHours} waking hours this week:`,
        `• ${joy}h (${pct(joy)}%) toward joy`,
        `• ${neutral}h (${pct(neutral)}%) neutral`,
        `• ${away}h (${pct(away)}%) away from joy`,
        reflection ? `\nNotes: ${reflection}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    [wakingHours, joy, neutral, away, reflection],
  );

  async function save() {
    const ok = await log(summary, "Hourly Audit");
    if (ok) setReflection("");
  }

  return (
    <div className="space-y-10">
      <section className="space-y-6 rounded-3xl border border-navy/10 bg-mist p-6 sm:p-8">
        <div>
          <div className="flex items-baseline justify-between">
            <label
              htmlFor="sleep"
              className="font-sans text-[13px] font-medium text-navy"
            >
              Hours of sleep this week
            </label>
            <span className="font-sans text-[13px] font-semibold tabular-nums text-navy">
              {sleepHours}h
            </span>
          </div>
          <input
            id="sleep"
            type="range"
            min={0}
            max={84}
            value={sleepHours}
            onChange={(e) => setSleepHours(Number(e.target.value))}
            className="mt-2 w-full accent-cyan-deep"
          />
          <p className="mt-1 font-sans text-[12px] text-navy/55">
            Leaves {wakingHours} waking hours to allocate.
          </p>
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <label
              htmlFor="joy-hours"
              className="font-sans text-[13px] font-medium text-navy"
            >
              Hours toward joy
            </label>
            <span className="font-sans text-[13px] font-semibold tabular-nums text-cyan-deep">
              {joy}h · {pct(joy)}%
            </span>
          </div>
          <input
            id="joy-hours"
            type="range"
            min={0}
            max={wakingHours}
            value={joy}
            onChange={(e) =>
              setJoy(Math.min(Number(e.target.value), wakingHours - neutral))
            }
            className="mt-2 w-full accent-cyan-deep"
          />
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <label
              htmlFor="neutral-hours"
              className="font-sans text-[13px] font-medium text-navy"
            >
              Hours neutral / maintenance
            </label>
            <span className="font-sans text-[13px] font-semibold tabular-nums text-navy/65">
              {neutral}h · {pct(neutral)}%
            </span>
          </div>
          <input
            id="neutral-hours"
            type="range"
            min={0}
            max={wakingHours}
            value={neutral}
            onChange={(e) =>
              setNeutral(Math.min(Number(e.target.value), wakingHours - joy))
            }
            className="mt-2 w-full accent-cyan-deep"
          />
        </div>

        <div className="rounded-2xl bg-white p-4">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-navy/55">
            Your week
          </p>
          <div
            className="mt-3 flex h-3 overflow-hidden rounded-full"
            role="img"
            aria-label="Week-at-a-glance bar chart"
          >
            {CATEGORIES.map((c) => {
              const v = totals[c.id];
              const p = pct(v);
              return p > 0 ? (
                <div
                  key={c.id}
                  className={c.color}
                  style={{ width: `${p}%` }}
                  title={`${c.label}: ${v}h (${p}%)`}
                />
              ) : null;
            })}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3 text-center font-sans text-[12px]">
            {CATEGORIES.map((c) => (
              <div key={c.id}>
                <p
                  className={`mx-auto mb-1 h-2.5 w-2.5 rounded-full ${c.color}`}
                  aria-hidden
                />
                <p className="text-navy/60">{c.label}</p>
                <p className="font-semibold tabular-nums text-navy">
                  {totals[c.id]}h
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="audit-note"
            className="font-sans text-[12px] font-semibold uppercase tracking-[0.16em] text-navy/55"
          >
            What stands out?
          </label>
          <textarea
            id="audit-note"
            rows={3}
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="One pattern. One small swap you could make next week."
            className="mt-2 w-full resize-y rounded-2xl border border-navy/15 bg-white px-5 py-3 font-sans text-[15px] leading-relaxed text-navy outline-none transition placeholder:text-navy/35 focus:border-cyan-deep focus:ring-2 focus:ring-cyan-deep/25"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-sans text-[12px] text-[#8a6d00]">{error}</p>
          <button onClick={save} className={btnPrimary} disabled={busy}>
            {busy ? "…" : "Log this week"}
          </button>
        </div>
      </section>

      <EntryLog entries={entries} />
    </div>
  );
}
