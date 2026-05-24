"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { btnPrimary } from "@/lib/ui";
import type { CoreNarrativeData } from "@/lib/curriculum";
import { useWorksheetSave, formatSavedAt } from "./useWorksheetSave";
import { useCelebrate } from "@/components/celebrate/CelebrationProvider";

const OLD_PLACEHOLDERS = [
  "e.g. I'm not worthy of love just by being me.",
  "e.g. I'm only valued when I produce.",
  "e.g. People always leave.",
];

const NEW_PLACEHOLDERS = [
  "e.g. I am worthy of love just by being me.",
  "e.g. I am valued for who I am, not what I do.",
  "e.g. The people meant for me are staying.",
];

/**
 * The 8-step Core Narrative wizard.
 *
 * Replaces the long single-page form. Each step is one focused thing.
 * Autosave runs across every step (so the user can leave and return
 * without losing anything), and a milestone celebration fires when
 * they lock the whole thing in.
 *
 * Steps:
 *   0. Intro          — what we're about to do
 *   1. Old story 1    — name it
 *   2. Old story 2
 *   3. Old story 3
 *   4. Flip story 1   — 180° truth, side by side
 *   5. Flip story 2
 *   6. Flip story 3
 *   7. Reflection     — what changes when the new is the one running
 */
export default function CoreNarrativeForm({
  worksheetId,
  initialData,
  continueHref,
}: {
  worksheetId: string;
  initialData: CoreNarrativeData;
  continueHref: string;
}) {
  const router = useRouter();
  const { celebrate } = useCelebrate();
  const [olds, setOlds] = useState<[string, string, string]>([
    initialData.old_narratives?.[0] ?? "",
    initialData.old_narratives?.[1] ?? "",
    initialData.old_narratives?.[2] ?? "",
  ]);
  const [news, setNews] = useState<[string, string, string]>([
    initialData.new_narratives?.[0] ?? "",
    initialData.new_narratives?.[1] ?? "",
    initialData.new_narratives?.[2] ?? "",
  ]);
  const [reflection, setReflection] = useState(initialData.reflection ?? "");

  // Start at the first incomplete step.
  const startStep = (() => {
    const hasReflection = reflection.trim().length > 0;
    const hasAllFlips = news.every((n) => n.trim().length > 0);
    const hasAllOlds = olds.every((o) => o.trim().length > 0);
    if (hasReflection) return 7;
    if (hasAllFlips) return 7;
    if (hasAllOlds) {
      const i = news.findIndex((n) => !n.trim());
      return 4 + (i === -1 ? 0 : i);
    }
    const i = olds.findIndex((o) => !o.trim());
    if (i >= 0) return 1 + i;
    return 0;
  })();
  const [step, setStep] = useState(startStep);

  const data = useMemo<CoreNarrativeData>(
    () => ({
      old_narratives: olds,
      new_narratives: news,
      reflection,
    }),
    [olds, news, reflection],
  );
  const { savedAt, saving, error, markComplete } = useWorksheetSave(
    worksheetId,
    data,
  );

  function setOld(i: 0 | 1 | 2, v: string) {
    setOlds((prev) => {
      const next = [...prev] as [string, string, string];
      next[i] = v;
      return next;
    });
  }
  function setNew(i: 0 | 1 | 2, v: string) {
    setNews((prev) => {
      const next = [...prev] as [string, string, string];
      next[i] = v;
      return next;
    });
  }

  async function handleFinish() {
    const ok = await markComplete();
    if (!ok) return;
    celebrate({
      size: "milestone",
      eyebrow: "Core Narrative rewritten",
      primary: "You just rewrote a story you've been carrying for years.",
      secondary: "Don't move past that too fast.",
    });
    setTimeout(() => router.push(continueHref), 3500);
  }

  const inputClass =
    "w-full rounded-2xl border border-navy/15 bg-white px-5 py-4 font-serif text-[18px] leading-relaxed text-navy outline-none transition placeholder:font-sans placeholder:text-[14px] placeholder:font-light placeholder:text-navy/40 focus:border-cyan-deep focus:ring-2 focus:ring-cyan-deep/25";

  // What renders at each step
  function renderStep() {
    if (step === 0) {
      return (
        <div className="space-y-6">
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
            About to begin
          </p>
          <h2 className="font-serif text-[28px] font-medium leading-tight text-navy">
            Three stories. <em className="text-cyan-deep">Caught</em>, then
            flipped.
          </h2>
          <p className="font-serif text-[17px] leading-[1.8] text-navy/75">
            Most of us live inside stories we never chose. We&apos;re going
            to name the three loudest ones in your life — and rewrite each
            one into its 180° truth. Slowly. One at a time.
          </p>
          <p className="font-sans text-[14px] font-light text-navy/55">
            ~45 minutes. Autosaves the whole way. Leave and come back if
            you need to.
          </p>
        </div>
      );
    }
    if (step >= 1 && step <= 3) {
      const i = (step - 1) as 0 | 1 | 2;
      return (
        <div className="space-y-5">
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
            Old story {i + 1} of 3
          </p>
          <h2 className="font-serif text-[24px] font-medium leading-tight text-navy">
            {i === 0
              ? "What's a story you catch yourself believing — even when it isn't true?"
              : i === 1
                ? "Name the next one."
                : "And one more — the third one that's run you the longest."}
          </h2>
          <p className="font-sans text-[13px] font-light text-navy/55">
            Whatever first comes up is usually the right one. Don&apos;t edit
            it for grace.
          </p>
          <input
            type="text"
            value={olds[i]}
            onChange={(e) => setOld(i, e.target.value)}
            placeholder={OLD_PLACEHOLDERS[i]}
            className={inputClass}
            autoFocus
          />
        </div>
      );
    }
    if (step >= 4 && step <= 6) {
      const i = (step - 4) as 0 | 1 | 2;
      return (
        <div className="space-y-5">
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
            Flip {i + 1} of 3
          </p>
          <h2 className="font-serif text-[24px] font-medium leading-tight text-navy">
            Rewrite this story as its <em className="text-cyan-deep">180°</em> truth.
          </h2>
          <div className="rounded-2xl bg-mist p-5">
            <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-navy/45">
              The old story
            </p>
            <p className="mt-1 font-serif text-[17px] italic text-navy/65 line-through decoration-navy/25">
              {olds[i] || OLD_PLACEHOLDERS[i]}
            </p>
          </div>
          <p className="font-sans text-[13px] font-light text-navy/55">
            Not a wish. A truth, stated as if already so.
          </p>
          <input
            type="text"
            value={news[i]}
            onChange={(e) => setNew(i, e.target.value)}
            placeholder={NEW_PLACEHOLDERS[i]}
            className={inputClass}
            autoFocus
          />
        </div>
      );
    }
    if (step === 7) {
      return (
        <div className="space-y-5">
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
            Last one — reflect
          </p>
          <h2 className="font-serif text-[24px] font-medium leading-tight text-navy">
            If the new stories were the truth — and the old ones never
            existed — how would your life be different?
          </h2>
          <textarea
            rows={9}
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="Take your time. Where you'd be free. Who'd be in your life. How you'd show up. What you'd risk."
            className={`${inputClass} resize-y`}
            autoFocus
          />
        </div>
      );
    }
    return null;
  }

  // Validation gate per step
  const canContinue = (() => {
    if (step === 0) return true;
    if (step >= 1 && step <= 3) return olds[(step - 1) as 0 | 1 | 2].trim().length > 0;
    if (step >= 4 && step <= 6) return news[(step - 4) as 0 | 1 | 2].trim().length > 0;
    if (step === 7) return reflection.trim().length > 0;
    return false;
  })();

  return (
    <section className="space-y-7">
      {/* Step pill row */}
      <div className="flex flex-wrap gap-1.5 font-sans text-[10px] font-semibold uppercase tracking-[0.14em]">
        {Array.from({ length: 8 }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setStep(i)}
            className={`h-1.5 flex-1 rounded-full transition ${
              i === step
                ? "bg-cyan-deep"
                : i < step
                  ? "bg-cyan-deep/55"
                  : "bg-mist"
            }`}
            aria-label={`Step ${i + 1}`}
          />
        ))}
      </div>
      <p className="text-center font-sans text-[10px] uppercase tracking-[0.22em] text-navy/45">
        Step {step + 1} of 8
      </p>

      <div className="min-h-[300px] animate-fade-in" key={step}>
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
        {step < 7 ? (
          <button
            type="button"
            onClick={() => setStep((s) => Math.min(7, s + 1))}
            disabled={!canContinue}
            className={btnPrimary}
          >
            Continue →
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinish}
            disabled={!canContinue || saving}
            className={btnPrimary}
          >
            Lock it in
          </button>
        )}
      </div>
    </section>
  );
}
