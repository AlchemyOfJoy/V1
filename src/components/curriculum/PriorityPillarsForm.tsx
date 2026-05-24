"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { btnPrimary } from "@/lib/ui";
import {
  PILLAR_KEYS,
  PRIORITY_PILLARS,
  type PriorityPillarKey,
  type PriorityPillarsData,
} from "@/lib/curriculum";
import { useWorksheetSave, formatSavedAt } from "./useWorksheetSave";
import { useCelebrate } from "@/components/celebrate/CelebrationProvider";

type Scores = Partial<Record<PriorityPillarKey, number>>;

/**
 * The Priority Pillars wizard.
 *
 * One pillar per screen (six total) → review → take snapshot →
 * reflection. Way less cognitive load than the prior 12-sliders-on-one-page
 * layout. Per-screen progress dot row at top tells you exactly where
 * you are. Snapshot fires a milestone celebration on first take.
 */
export default function PriorityPillarsForm({
  worksheetId,
  initialData,
  initialSnapshots,
  continueHref,
}: {
  worksheetId: string;
  initialData: PriorityPillarsData;
  initialSnapshots: { taken_at: string | Date; [k: string]: unknown }[];
  continueHref: string;
}) {
  const router = useRouter();
  const { celebrate } = useCelebrate();
  const [scores, setScores] = useState<Scores>(initialData.scores ?? {});
  const [reflection, setReflection] = useState(initialData.reflection ?? "");
  const [snapshots, setSnapshots] = useState(initialSnapshots);
  const [takingSnapshot, setTakingSnapshot] = useState(false);
  const [snapshotError, setSnapshotError] = useState<string | null>(null);

  // 6 pillar steps (0–5) + review (6) + reflection (7)
  const startStep = (() => {
    // First pillar that isn't fully rated
    const firstUnrated = PRIORITY_PILLARS.findIndex((p) =>
      p.subs.some((s) => typeof scores[s.id as PriorityPillarKey] !== "number"),
    );
    if (firstUnrated >= 0) return firstUnrated;
    if (!reflection.trim()) return 7;
    return 6;
  })();
  const [step, setStep] = useState(startStep);

  const data = useMemo<PriorityPillarsData>(
    () => ({ scores, reflection }),
    [scores, reflection],
  );
  const { savedAt, saving, error, markComplete } = useWorksheetSave(
    worksheetId,
    data,
  );

  function setScore(key: PriorityPillarKey, v: number) {
    setScores((prev) => ({ ...prev, [key]: v }));
  }

  const allRated = PILLAR_KEYS.every((k) => typeof scores[k] === "number");

  async function takeSnapshot() {
    setTakingSnapshot(true);
    setSnapshotError(null);
    try {
      const res = await fetch("/api/curriculum/pillars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scores }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Snapshot failed.");
      setSnapshots((cur) => [result.snapshot, ...cur].slice(0, 12));
      if (snapshots.length === 0) {
        celebrate({
          size: "milestone",
          eyebrow: "First Pillar snapshot",
          primary: "Baseline locked in.",
          secondary: "Come back in 30 days. Watch the bars move.",
        });
      }
    } catch (e) {
      setSnapshotError((e as Error).message);
    } finally {
      setTakingSnapshot(false);
    }
  }

  async function handleFinish() {
    const ok = await markComplete();
    if (!ok) return;
    router.push(continueHref);
  }

  function renderStep() {
    // Pillar steps 0–5
    if (step <= 5) {
      const pillar = PRIORITY_PILLARS[step];
      const avg = (() => {
        const vals = pillar.subs
          .map((s) => scores[s.id as PriorityPillarKey])
          .filter((v): v is number => typeof v === "number");
        if (vals.length === 0) return null;
        return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
      })();
      return (
        <div className="space-y-7">
          <div>
            <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
              Pillar {step + 1} of 6
            </p>
            <h2 className="mt-2 font-serif text-[32px] font-medium leading-tight text-navy">
              {pillar.label}
            </h2>
            {avg !== null && (
              <p className="mt-2 font-sans text-[12px] uppercase tracking-[0.18em] text-cyan-deep">
                Average · {avg}/10
              </p>
            )}
          </div>
          <div className="space-y-6">
            {pillar.subs.map((sub) => {
              const v = scores[sub.id as PriorityPillarKey];
              const display = typeof v === "number" ? v : 5;
              return (
                <div key={sub.id}>
                  <div className="flex items-baseline justify-between">
                    <label
                      htmlFor={`slider-${sub.id}`}
                      className="font-serif text-[18px] text-navy"
                    >
                      {sub.label}
                    </label>
                    <span className="font-serif text-[24px] font-medium tabular-nums text-navy">
                      {typeof v === "number" ? v : "—"}
                      <span className="ml-1 font-sans text-[12px] font-light text-navy/55">
                        / 10
                      </span>
                    </span>
                  </div>
                  <input
                    id={`slider-${sub.id}`}
                    type="range"
                    min={0}
                    max={10}
                    step={1}
                    value={display}
                    onChange={(e) =>
                      setScore(
                        sub.id as PriorityPillarKey,
                        Number(e.target.value),
                      )
                    }
                    className="mt-3 w-full accent-cyan-deep"
                  />
                  <div className="mt-1 flex justify-between font-sans text-[10px] uppercase tracking-[0.14em] text-navy/35">
                    <span>Leaking</span>
                    <span>Flowing</span>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="font-sans text-[13px] font-light text-navy/55">
            First number is usually the honest one. Don&apos;t overthink.
          </p>
        </div>
      );
    }

    // Review (step 6)
    if (step === 6) {
      return (
        <div className="space-y-6">
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
            Your inventory
          </p>
          <h2 className="font-serif text-[26px] font-medium leading-tight text-navy">
            Where is your <em className="text-cyan-deep">life</em> leaking?
          </h2>
          <ul className="space-y-2">
            {PRIORITY_PILLARS.map((p) => {
              const vals = p.subs
                .map((s) => scores[s.id as PriorityPillarKey])
                .filter((v): v is number => typeof v === "number");
              const avg =
                vals.length > 0
                  ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
                  : null;
              const width = avg !== null ? `${(avg / 10) * 100}%` : "0%";
              return (
                <li
                  key={p.id}
                  className="rounded-2xl border border-navy/10 bg-white p-3"
                >
                  <div className="flex items-baseline justify-between">
                    <span className="font-serif text-[16px] font-medium text-navy">
                      {p.label}
                    </span>
                    <span className="font-sans text-[13px] font-semibold tabular-nums text-cyan-deep">
                      {avg !== null ? `${avg}/10` : "—"}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-mist">
                    <div
                      className="h-full bg-cyan-deep transition-all"
                      style={{ width }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Snapshot CTA */}
          <div className="rounded-3xl border border-cyan-deep/30 bg-mist p-5">
            <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-deep">
              Lock in today
            </p>
            <p className="mt-1 font-serif text-[18px] font-medium text-navy">
              Take a snapshot.
            </p>
            <p className="mt-1 font-sans text-[13px] font-light text-navy/65">
              You&apos;ll come back in 30 days. The data is honest. The
              shift is the proof.
            </p>
            <button
              type="button"
              onClick={takeSnapshot}
              disabled={!allRated || takingSnapshot}
              className={`${btnPrimary} mt-4`}
            >
              {takingSnapshot ? "Saving…" : "Take snapshot"}
            </button>
            {!allRated && (
              <p className="mt-2 font-sans text-[12px] text-navy/55">
                Rate all 12 sub-pillars first.
              </p>
            )}
            {snapshotError && (
              <p className="mt-2 font-sans text-[13px] text-[#8a6d00]">
                {snapshotError}
              </p>
            )}
          </div>

          {snapshots.length > 0 && (
            <div className="rounded-2xl border border-navy/10 bg-white p-4">
              <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-navy/55">
                Snapshot history
              </p>
              <ul className="mt-2 space-y-1.5">
                {snapshots.slice(0, 5).map((s, i) => {
                  const date = new Date(s.taken_at);
                  const vals = PILLAR_KEYS.map((k) =>
                    typeof s[k] === "number" ? (s[k] as number) : null,
                  ).filter((v): v is number => typeof v === "number");
                  const avg =
                    vals.length > 0
                      ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
                      : null;
                  return (
                    <li
                      key={i}
                      className="flex justify-between font-sans text-[13px]"
                    >
                      <span className="text-navy/65">
                        {date.toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span className="font-semibold tabular-nums text-cyan-deep">
                        {avg !== null ? `avg ${avg}` : "—"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      );
    }

    // Reflection (step 7)
    return (
      <div className="space-y-5">
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
          Last one — what do you notice?
        </p>
        <h2 className="font-serif text-[24px] font-medium leading-tight text-navy">
          What stood out? What surprised you?
        </h2>
        <textarea
          rows={9}
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="Where you&apos;re most depleted. Where your life is already strong. The thing that lands the hardest."
          className="w-full resize-y rounded-2xl border border-navy/15 bg-white px-5 py-4 font-serif text-[17px] leading-relaxed text-navy outline-none transition placeholder:font-sans placeholder:text-[14px] placeholder:font-light placeholder:text-navy/40 focus:border-cyan-deep focus:ring-2 focus:ring-cyan-deep/25"
          autoFocus
        />
      </div>
    );
  }

  const lastStep = 7;

  return (
    <section className="space-y-7">
      <div className="flex gap-1.5">
        {Array.from({ length: lastStep + 1 }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setStep(i)}
            className={`h-1.5 flex-1 rounded-full transition ${
              i === step ? "bg-cyan-deep" : i < step ? "bg-cyan-deep/55" : "bg-mist"
            }`}
            aria-label={`Step ${i + 1}`}
          />
        ))}
      </div>
      <p className="text-center font-sans text-[10px] uppercase tracking-[0.22em] text-navy/45">
        Step {step + 1} of {lastStep + 1}
      </p>

      <div className="min-h-[320px] animate-fade-in" key={step}>
        {renderStep()}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-navy/10 pt-5">
        <div className="flex items-center gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className="font-sans text-[13px] text-navy/55 hover:text-cyan-deep"
            >
              ← Back
            </button>
          )}
          <p
            className="font-sans text-[11px] text-navy/45"
            aria-live="polite"
          >
            {saving
              ? "Saving…"
              : error
                ? "Couldn't save — we'll keep trying."
                : savedAt
                  ? `Saved · ${formatSavedAt(savedAt)}`
                  : "Autosaves."}
          </p>
        </div>
        {step < lastStep ? (
          <button
            type="button"
            onClick={() => setStep((s) => Math.min(lastStep, s + 1))}
            className={btnPrimary}
          >
            Continue →
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinish}
            disabled={saving}
            className={btnPrimary}
          >
            Done
          </button>
        )}
      </div>
    </section>
  );
}
