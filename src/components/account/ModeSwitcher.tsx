"use client";

import { useState } from "react";

/**
 * Switch between Challenge / Practice / Free modes (Cadence Directive §1).
 *
 * Switching is durable — the choice persists, and Daily Session resolves
 * differently next time the user opens the app.
 *
 * Tone: never coercive. Each option is described in Brent's voice.
 */
export default function ModeSwitcher({
  initialMode,
}: {
  initialMode: "challenge" | "practice" | "free";
}) {
  const [mode, setMode] = useState(initialMode);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

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
