"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { btnPrimary } from "@/lib/ui";
import type { SelfEulogyData } from "@/lib/curriculum";
import { useWorksheetSave, formatSavedAt } from "./useWorksheetSave";
import { useCelebrate } from "@/components/celebrate/CelebrationProvider";

const PROMPTS = [
  "How did you make people feel?",
  "What qualities did you embody day to day?",
  "What did you stand for — and what did you refuse to stand for?",
  "What did you give the world that no one else could?",
  "How did you love the people closest to you?",
  "What did your work make possible?",
  "What did you teach without saying a word?",
  "What did people say about being in a room with you?",
  "What was the gift of your life?",
];

/**
 * Self-Eulogy guided 3-step flow.
 *
 *   1. Settle  — short prep + the 9 prompts presented one at a time
 *                in a scrollable, beautiful list (no inputs yet)
 *   2. Write   — the big textarea, prompts now in a quiet sidebar
 *   3. Review  — read it back, edit lightly, lock it in
 */
export default function SelfEulogyForm({
  worksheetId,
  initialData,
  continueHref,
}: {
  worksheetId: string;
  initialData: SelfEulogyData;
  continueHref: string;
}) {
  const router = useRouter();
  const { celebrate } = useCelebrate();
  const [eulogy, setEulogy] = useState(initialData.eulogy ?? "");
  const [step, setStep] = useState(eulogy.trim().length > 0 ? 1 : 0);

  const data = useMemo<SelfEulogyData>(() => ({ eulogy }), [eulogy]);
  const { savedAt, saving, error, markComplete } = useWorksheetSave(
    worksheetId,
    data,
  );

  const wordCount = useMemo(
    () =>
      eulogy.trim().length === 0
        ? 0
        : eulogy.trim().split(/\s+/).filter(Boolean).length,
    [eulogy],
  );

  async function handleFinish() {
    const ok = await markComplete();
    if (!ok) return;
    celebrate({
      size: "milestone",
      eyebrow: "Self-Eulogy written",
      primary: "You named the life you most want to live.",
      secondary: "Read it back every quarter. Let it shape what comes next.",
    });
    setTimeout(() => router.push(continueHref), 3500);
  }

  function renderStep() {
    if (step === 0) {
      return (
        <div className="space-y-6">
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
            Settle in
          </p>
          <h2 className="font-serif text-[28px] font-medium leading-tight text-navy">
            Imagine the person who loves you most, holding your eulogy.
          </h2>
          <p className="font-serif text-[17px] leading-[1.8] text-navy/75">
            Before you write a word — sit with these nine questions.
            Don&apos;t answer them yet. Just let them land.
          </p>
          <ol className="space-y-3">
            {PROMPTS.map((p, i) => (
              <li
                key={p}
                className="rounded-2xl border border-navy/10 bg-[#FAF6EC] p-4 font-serif text-[16px] italic leading-relaxed text-navy/80"
              >
                <span className="mr-2 font-sans not-italic font-semibold text-cyan-deep">
                  {i + 1}.
                </span>
                {p}
              </li>
            ))}
          </ol>
          <p className="font-sans text-[13px] font-light text-navy/55">
            When you&apos;re ready — and only then — continue to write.
          </p>
        </div>
      );
    }
    if (step === 1) {
      return (
        <div className="grid gap-6 lg:grid-cols-[1fr_240px]">
          <div className="space-y-3">
            <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
              Write
            </p>
            <h2 className="font-serif text-[26px] font-medium leading-tight text-navy">
              Past tense. <em className="text-cyan-deep">As if</em> already
              earned.
            </h2>
            <textarea
              rows={20}
              value={eulogy}
              onChange={(e) => setEulogy(e.target.value)}
              placeholder="Begin in the past tense — as if every word is already true."
              className="w-full resize-y rounded-2xl border border-navy/15 bg-white px-5 py-4 font-serif text-[17px] leading-[1.85] text-navy outline-none transition placeholder:font-sans placeholder:text-[14px] placeholder:font-light placeholder:text-navy/40 focus:border-cyan-deep focus:ring-2 focus:ring-cyan-deep/25"
              autoFocus
            />
            <p className="font-sans text-[12px] text-navy/45">
              {wordCount} word{wordCount === 1 ? "" : "s"} · autosaves
            </p>
          </div>
          <aside className="rounded-2xl bg-mist p-4 lg:sticky lg:top-24 lg:self-start">
            <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-deep">
              Reach for any prompt
            </p>
            <ol className="mt-3 space-y-2 font-sans text-[12px] leading-relaxed text-navy/75">
              {PROMPTS.map((q, i) => (
                <li key={q}>
                  <span className="mr-1.5 font-semibold text-cyan-deep">
                    {i + 1}.
                  </span>
                  {q}
                </li>
              ))}
            </ol>
          </aside>
        </div>
      );
    }
    return (
      <div className="space-y-6">
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
          Read it back
        </p>
        <h2 className="font-serif text-[26px] font-medium leading-tight text-navy">
          Out loud. Slowly.
        </h2>
        <p className="font-sans text-[14px] font-light text-navy/65">
          One last read. Tweak anything. When it&apos;s right — lock it in.
        </p>
        <article className="rounded-2xl border border-navy/10 bg-[#FAF6EC] p-6 whitespace-pre-wrap font-serif text-[17px] leading-[1.85] text-navy">
          {eulogy || (
            <span className="italic text-navy/45">
              Empty — go back and write.
            </span>
          )}
        </article>
        <button
          type="button"
          onClick={() => setStep(1)}
          className="font-sans text-[13px] font-semibold text-cyan-deep hover:underline"
        >
          Back to edit
        </button>
      </div>
    );
  }

  return (
    <section className="space-y-7">
      <div className="flex gap-1.5">
        {Array.from({ length: 3 }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              if (i === 0 || eulogy.trim().length > 0) setStep(i);
            }}
            disabled={i > 0 && eulogy.trim().length === 0}
            className={`h-1.5 flex-1 rounded-full transition ${
              i === step ? "bg-cyan-deep" : i < step ? "bg-cyan-deep/55" : "bg-mist"
            }`}
            aria-label={`Step ${i + 1}`}
          />
        ))}
      </div>
      <p className="text-center font-sans text-[10px] uppercase tracking-[0.22em] text-navy/45">
        {step === 0 ? "Settle" : step === 1 ? "Write" : "Review"}
      </p>

      <div className="animate-fade-in" key={step}>
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
        {step < 2 ? (
          <button
            type="button"
            onClick={() => setStep((s) => Math.min(2, s + 1))}
            disabled={step === 1 && eulogy.trim().length === 0}
            className={btnPrimary}
          >
            {step === 0 ? "Ready — write" : "Read it back"} →
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinish}
            disabled={saving || eulogy.trim().length === 0}
            className={btnPrimary}
          >
            Lock it in
          </button>
        )}
      </div>
    </section>
  );
}
