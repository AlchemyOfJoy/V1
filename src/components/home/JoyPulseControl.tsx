"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoyPulseControl({
  initialScore,
}: {
  initialScore: number | null;
}) {
  const [score, setScore] = useState<number | null>(initialScore);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function set(value: number) {
    setScore(value);
    setSaving(true);
    try {
      await fetch("/api/joy-pulse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: value }),
      });
      router.refresh();
    } catch {
      // best effort
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <p className="font-sans text-[14px] font-medium text-navy">
          How are you, really?
        </p>
        <p
          className="font-sans text-[12px] text-navy/45"
          aria-live="polite"
        >
          {score !== null
            ? saving
              ? "Saving…"
              : `You logged ${score}/10`
            : "Tap a number"}
        </p>
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
          const active = score === n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => set(n)}
              aria-label={`${n} of 10`}
              className={`flex h-9 flex-1 items-center justify-center rounded-lg font-sans text-[12px] font-semibold tabular-nums transition ${
                active
                  ? "bg-cyan-deep text-white"
                  : "bg-mist text-navy/65 hover:bg-cyan-deep/15"
              }`}
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
}
