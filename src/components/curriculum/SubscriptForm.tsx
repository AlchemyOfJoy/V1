"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { btnPrimary } from "@/lib/ui";
import type { SubscriptData } from "@/lib/curriculum";
import { useWorksheetSave, formatSavedAt } from "./useWorksheetSave";
import { useCelebrate } from "@/components/celebrate/CelebrationProvider";

const STEPS = [
  { title: "Anchor your Joy Spark", id: "anchor" },
  { title: "Set the target date", id: "date" },
  { title: "Write your manifestations", id: "manifest" },
  { title: "Write your affirmations", id: "affirm" },
  { title: "Lock it in", id: "review" },
] as const;

function defaultLines(arr?: string[]): string[] {
  if (!arr || arr.length === 0) return ["", "", ""];
  return arr;
}

export default function SubscriptForm({
  worksheetId,
  initialData,
  continueHref,
}: {
  worksheetId: string;
  initialData: SubscriptData;
  continueHref: string;
}) {
  const router = useRouter();
  const { celebrate } = useCelebrate();
  const [step, setStep] = useState(0);

  const [emotionAnchor, setEmotionAnchor] = useState(
    initialData.emotion_anchor ?? "",
  );
  const [targetDate, setTargetDate] = useState(
    initialData.target_date ??
      (() => {
        const d = new Date();
        d.setDate(d.getDate() + 90);
        return d.toISOString().slice(0, 10);
      })(),
  );
  const [manifestations, setManifestations] = useState<string[]>(
    defaultLines(initialData.manifestations),
  );
  const [affirmations, setAffirmations] = useState<string[]>(
    defaultLines(initialData.affirmations),
  );
  const [reflection, setReflection] = useState(initialData.reflection ?? "");

  const data = useMemo<SubscriptData>(
    () => ({
      emotion_anchor: emotionAnchor,
      target_date: targetDate,
      manifestations: manifestations.filter((s) => s.trim().length > 0),
      affirmations: affirmations.filter((s) => s.trim().length > 0),
      reflection,
    }),
    [emotionAnchor, targetDate, manifestations, affirmations, reflection],
  );
  const { savedAt, saving, error, markComplete } = useWorksheetSave(
    worksheetId,
    data,
  );

  function updateLine(
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    i: number,
    v: string,
  ) {
    setter((prev) => {
      const next = [...prev];
      next[i] = v;
      return next;
    });
  }
  function addLine(setter: React.Dispatch<React.SetStateAction<string[]>>) {
    setter((prev) => (prev.length >= 12 ? prev : [...prev, ""]));
  }
  function removeLine(
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    i: number,
  ) {
    setter((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function lockIn() {
    const ok = await markComplete();
    if (!ok) return;
    // Also persist the structured SubScript row (versioned).
    try {
      await fetch("/api/curriculum/subscript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_date: targetDate,
          manifestations: manifestations.filter((s) => s.trim().length > 0),
          affirmations: affirmations.filter((s) => s.trim().length > 0),
          emotion_anchor: emotionAnchor,
        }),
      });
    } catch {
      // Worksheet response is the source of truth; the versioned row is bonus.
    }
    // Major celebration — the JOS install moment (§17.3).
    celebrate({
      size: "major",
      eyebrow: "JOS® install",
      primary: "You just built your operating system.",
      secondary: "From here on out, we run it.",
    });
    // Route after the celebration auto-dismisses (user can also tap through).
    setTimeout(() => router.push(continueHref), 4000);
  }

  const inputClass =
    "w-full rounded-xl border border-navy/15 bg-white px-4 py-3 font-sans text-[15px] text-navy outline-none transition placeholder:text-navy/35 focus:border-cyan-deep focus:ring-2 focus:ring-cyan-deep/25";

  return (
    <section className="space-y-8">
      {/* Stepper */}
      <ol className="flex flex-wrap gap-2 font-sans text-[12px] font-semibold uppercase tracking-[0.14em]">
        {STEPS.map((s, i) => {
          const active = i === step;
          const done = i < step;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => setStep(i)}
                className={`rounded-full px-3 py-1.5 transition ${
                  active
                    ? "bg-cyan-deep text-white"
                    : done
                      ? "bg-mist text-cyan-deep"
                      : "bg-mist text-navy/55 hover:text-cyan-deep"
                }`}
              >
                {i + 1}. {s.title}
              </button>
            </li>
          );
        })}
      </ol>

      {step === 0 && (
        <div className="space-y-4">
          <h3 className="font-serif text-[22px] font-medium tracking-tight text-navy">
            Anchor your Joy Spark
          </h3>
          <p className="font-sans text-[14px] font-light text-navy/65">
            Recall a real moment when joy was loudest in your body. Describe
            it. The smell, the light, who was there, what you felt. This
            anchor is the emotional fuel for everything that follows.
          </p>
          <textarea
            rows={6}
            value={emotionAnchor}
            onChange={(e) => setEmotionAnchor(e.target.value)}
            placeholder="A moment, a memory, a feeling — written so vividly you can step back into it."
            className="w-full resize-y rounded-2xl border border-navy/15 bg-white px-5 py-4 font-sans text-[16px] leading-[1.75] text-navy outline-none transition placeholder:text-navy/35 focus:border-cyan-deep focus:ring-2 focus:ring-cyan-deep/25"
          />
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <h3 className="font-serif text-[22px] font-medium tracking-tight text-navy">
            Set the target date
          </h3>
          <p className="font-sans text-[14px] font-light text-navy/65">
            A horizon close enough to feel — usually 90 days, sometimes a
            year. Pick a date.
          </p>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className={`${inputClass} max-w-xs`}
          />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h3 className="font-serif text-[22px] font-medium tracking-tight text-navy">
            Your manifestations
          </h3>
          <p className="font-sans text-[14px] font-light text-navy/65">
            The specific outcomes that pull you forward, written in present
            tense — as if already true.
          </p>
          <div className="space-y-2">
            {manifestations.map((line, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="mt-3 font-sans text-[13px] font-semibold text-cyan-deep">
                  {i + 1}.
                </span>
                <input
                  type="text"
                  value={line}
                  onChange={(e) =>
                    updateLine(setManifestations, i, e.target.value)
                  }
                  placeholder="I am…"
                  className={inputClass}
                />
                {manifestations.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLine(setManifestations, i)}
                    className="mt-3 font-sans text-[12px] text-navy/40 hover:text-[#8a6d00]"
                    aria-label="Remove line"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            {manifestations.length < 12 && (
              <button
                type="button"
                onClick={() => addLine(setManifestations)}
                className="font-sans text-[13px] font-semibold text-cyan-deep hover:underline"
              >
                + Add another
              </button>
            )}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h3 className="font-serif text-[22px] font-medium tracking-tight text-navy">
            Your affirmations
          </h3>
          <p className="font-sans text-[14px] font-light text-navy/65">
            Who you are, stated as if already so. Not aspirations — declared
            identity.
          </p>
          <div className="space-y-2">
            {affirmations.map((line, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="mt-3 font-sans text-[13px] font-semibold text-cyan-deep">
                  {i + 1}.
                </span>
                <input
                  type="text"
                  value={line}
                  onChange={(e) =>
                    updateLine(setAffirmations, i, e.target.value)
                  }
                  placeholder="I am…"
                  className={inputClass}
                />
                {affirmations.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLine(setAffirmations, i)}
                    className="mt-3 font-sans text-[12px] text-navy/40 hover:text-[#8a6d00]"
                    aria-label="Remove line"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            {affirmations.length < 12 && (
              <button
                type="button"
                onClick={() => addLine(setAffirmations)}
                className="font-sans text-[13px] font-semibold text-cyan-deep hover:underline"
              >
                + Add another
              </button>
            )}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6">
          <h3 className="font-serif text-[22px] font-medium tracking-tight text-navy">
            Lock it in
          </h3>
          <p className="font-sans text-[14px] font-light text-navy/65">
            Here&apos;s your SubScript. Read it morning and night until it
            stops being a script — and just becomes you. Print or save the
            page for ritual.
          </p>

          <article className="space-y-6 rounded-2xl border border-navy/15 bg-white p-8 print:border-0 print:p-0">
            {emotionAnchor && (
              <section>
                <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-deep">
                  My Joy Spark
                </p>
                <p className="mt-2 font-serif text-[17px] italic leading-[1.85] text-navy">
                  {emotionAnchor}
                </p>
              </section>
            )}
            <section>
              <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-deep">
                By {new Date(targetDate).toLocaleDateString(undefined, {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </section>
            {manifestations.some((s) => s.trim()) && (
              <section>
                <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-navy/55">
                  Manifestations
                </p>
                <ul className="mt-2 space-y-2">
                  {manifestations
                    .filter((s) => s.trim())
                    .map((s, i) => (
                      <li
                        key={i}
                        className="font-serif text-[18px] leading-[1.7] text-navy"
                      >
                        {s}
                      </li>
                    ))}
                </ul>
              </section>
            )}
            {affirmations.some((s) => s.trim()) && (
              <section>
                <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-navy/55">
                  Affirmations
                </p>
                <ul className="mt-2 space-y-2">
                  {affirmations
                    .filter((s) => s.trim())
                    .map((s, i) => (
                      <li
                        key={i}
                        className="font-serif text-[18px] leading-[1.7] text-navy"
                      >
                        {s}
                      </li>
                    ))}
                </ul>
              </section>
            )}
          </article>

          <div>
            <label
              htmlFor="reflection"
              className="font-sans text-[12px] font-semibold uppercase tracking-[0.16em] text-navy/55"
            >
              Reflection (optional)
            </label>
            <textarea
              id="reflection"
              rows={4}
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="How does it feel to read this back?"
              className="mt-2 w-full resize-y rounded-2xl border border-navy/15 bg-white px-5 py-4 font-sans text-[16px] leading-[1.75] text-navy outline-none transition placeholder:text-navy/35 focus:border-cyan-deep focus:ring-2 focus:ring-cyan-deep/25"
            />
          </div>

          <div className="flex flex-wrap gap-3 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-full border border-navy/20 px-5 py-2.5 font-sans text-[13px] font-medium text-navy transition hover:border-cyan-deep hover:text-cyan-deep"
            >
              Print
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-navy/10 pt-6 print:hidden">
        <p
          className="font-sans text-[12px] text-navy/45"
          aria-live="polite"
          aria-atomic="true"
        >
          {saving
            ? "Saving…"
            : error
              ? "Couldn't save — we'll keep trying."
              : savedAt
                ? `Saved · ${formatSavedAt(savedAt)}`
                : "Autosaves as you write."}
        </p>
        <div className="flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className="font-sans text-[13px] text-navy/55 transition-colors hover:text-cyan-deep"
            >
              ← Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
              className={btnPrimary}
            >
              Continue →
            </button>
          ) : (
            <button onClick={lockIn} className={btnPrimary} disabled={saving}>
              Lock it in →
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
