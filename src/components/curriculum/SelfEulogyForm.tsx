"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { btnPrimary } from "@/lib/ui";
import type { SelfEulogyData } from "@/lib/curriculum";
import { useWorksheetSave, formatSavedAt } from "./useWorksheetSave";

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
  const [eulogy, setEulogy] = useState(initialData.eulogy ?? "");

  const data = useMemo<SelfEulogyData>(() => ({ eulogy }), [eulogy]);
  const { savedAt, saving, error, markComplete } = useWorksheetSave(
    worksheetId,
    data,
  );

  async function handleContinue() {
    const ok = await markComplete();
    if (ok) router.push(continueHref);
  }

  const wordCount = useMemo(
    () =>
      eulogy.trim().length === 0
        ? 0
        : eulogy.trim().split(/\s+/).filter(Boolean).length,
    [eulogy],
  );

  return (
    <section className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <label
            htmlFor="eulogy"
            className="font-sans text-[12px] font-semibold uppercase tracking-[0.16em] text-navy/55"
          >
            Your eulogy
          </label>
          <textarea
            id="eulogy"
            rows={20}
            value={eulogy}
            onChange={(e) => setEulogy(e.target.value)}
            placeholder="Begin in the past tense — as if every word is already true."
            className="w-full resize-y rounded-2xl border border-navy/15 bg-white px-5 py-4 font-serif text-[17px] leading-[1.85] text-navy outline-none transition placeholder:font-sans placeholder:text-[15px] placeholder:font-light placeholder:text-navy/40 focus:border-cyan-deep focus:ring-2 focus:ring-cyan-deep/25"
          />
          <p className="font-sans text-[12px] text-navy/45">
            {wordCount} word{wordCount === 1 ? "" : "s"}
          </p>
        </div>

        <aside className="rounded-2xl bg-mist p-5 lg:sticky lg:top-24 lg:self-start">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-deep">
            Guiding prompts
          </p>
          <p className="mt-2 font-sans text-[13px] font-light text-navy/60">
            Use these as scaffolding. Skip any that don&apos;t land.
          </p>
          <ol className="mt-4 space-y-3">
            {PROMPTS.map((q, i) => (
              <li
                key={q}
                className="font-sans text-[13px] leading-relaxed text-navy/75"
              >
                <span className="mr-2 font-semibold text-cyan-deep">
                  {i + 1}.
                </span>
                {q}
              </li>
            ))}
          </ol>
        </aside>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
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
        <button onClick={handleContinue} className={btnPrimary} disabled={saving}>
          Continue →
        </button>
      </div>
    </section>
  );
}
