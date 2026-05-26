"use client";

import { useState } from "react";

type Mode =
  | "jos_install"
  | "post_jos"
  | "challenge"
  | "practice"
  | "free";

/**
 * Switch between user modes (Cadence Directive §1 + JOS-First §14).
 *
 * Per JOS-First §16, users in jos_install cannot switch out — the
 * install is the price of admission. Users in post_jos see the path
 * choice. Everyone else can freely flip between Challenge / Practice.
 *
 * Switching is durable — the choice persists.
 */
export default function ModeSwitcher({
  initialMode,
}: {
  initialMode: Mode;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (mode === "jos_install") {
    return (
      <p className="font-serif text-[15px] italic text-slate">
        You&apos;re installing your JOS. The path choice unlocks once all
        six components are in place.
      </p>
    );
  }

  async function pick(next: "challenge" | "practice" | "free") {
    if (next === mode || saving) return;
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/me/challenge-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: next }),
      });
      if (!res.ok) throw new Error("save failed");
      setMode(next);
      setMsg("Saved. Next time you open Today, the path will reflect this.");
    } catch {
      setMsg("Couldn't save — try again?");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      {(
        [
          {
            id: "challenge" as const,
            title: "Challenge Mode",
            desc: "Day-by-day through Brent's 90-day sequence. The app prescribes today's work.",
          },
          {
            id: "practice" as const,
            title: "Practice Mode",
            desc: "Post-90-day. Daily rituals + one quiet suggestion per day.",
          },
          {
            id: "free" as const,
            title: "Free Mode",
            desc: "Explore without a prescribed sequence. You drive.",
          },
        ]
      ).map((opt) => {
        const active = mode === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => pick(opt.id)}
            disabled={saving}
            className={`block w-full rounded-2xl border p-4 text-left transition ${
              active
                ? "border-cyan-deep bg-mist/50"
                : "border-navy/10 bg-white hover:border-cyan-deep/40"
            }`}
          >
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-sans text-[14px] font-semibold text-navy">
                {opt.title}
              </p>
              {active && (
                <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-deep">
                  ✓ current
                </span>
              )}
            </div>
            <p className="mt-1 font-serif text-[15px] italic text-navy/65">
              {opt.desc}
            </p>
          </button>
        );
      })}
      {msg && (
        <p className="font-sans text-[12px] text-cyan-deep" aria-live="polite">
          {msg}
        </p>
      )}
    </div>
  );
}
