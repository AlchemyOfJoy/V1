"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { btnPrimary } from "@/lib/ui";
import type { CoreNarrativeData } from "@/lib/curriculum";
import { useWorksheetSave, formatSavedAt } from "./useWorksheetSave";

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

  async function handleContinue() {
    const ok = await markComplete();
    if (ok) router.push(continueHref);
  }

  const inputClass =
    "w-full rounded-xl border border-navy/15 bg-white px-4 py-3 font-sans text-[15px] text-navy outline-none transition placeholder:text-navy/35 focus:border-cyan-deep focus:ring-2 focus:ring-cyan-deep/25";
  const labelClass =
    "font-sans text-[12px] font-semibold uppercase tracking-[0.16em] text-navy/55";

  return (
    <section className="space-y-10">
      <div className="space-y-4">
        <h3 className="font-serif text-[22px] font-medium tracking-tight text-navy">
          Step 1 — Name your Top 3 Old Core Narratives
        </h3>
        <p className="font-sans text-[14px] font-light text-navy/65">
          The recurring stories you catch yourself believing — even when
          they aren&apos;t true. List the three that have run your life the
          loudest.
        </p>
        <div className="space-y-3">
          {([0, 1, 2] as const).map((i) => (
            <div key={i}>
              <label htmlFor={`old-${i}`} className={labelClass}>
                Old narrative {i + 1}
              </label>
              <input
                id={`old-${i}`}
                type="text"
                value={olds[i]}
                onChange={(e) => setOld(i, e.target.value)}
                placeholder={OLD_PLACEHOLDERS[i]}
                className={`${inputClass} mt-1.5`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-serif text-[22px] font-medium tracking-tight text-navy">
          Step 2 — Flip each one into a new, true story
        </h3>
        <p className="font-sans text-[14px] font-light text-navy/65">
          Not a wish — a 180° positive opposite, stated as if already so.
        </p>
        <div className="space-y-3">
          {([0, 1, 2] as const).map((i) => (
            <div
              key={i}
              className="grid gap-3 rounded-2xl bg-mist p-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center"
            >
              <div className="font-serif text-[15px] italic text-navy/65">
                {olds[i] || (
                  <span className="opacity-50">{OLD_PLACEHOLDERS[i]}</span>
                )}
              </div>
              <div
                aria-hidden
                className="hidden text-center font-sans text-[13px] font-semibold uppercase tracking-[0.2em] text-cyan-deep sm:block"
              >
                →
              </div>
              <input
                aria-label={`New narrative ${i + 1}`}
                type="text"
                value={news[i]}
                onChange={(e) => setNew(i, e.target.value)}
                placeholder={NEW_PLACEHOLDERS[i]}
                className={inputClass}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-serif text-[22px] font-medium tracking-tight text-navy">
          Step 3 — How would life be different?
        </h3>
        <p className="font-sans text-[14px] font-light text-navy/65">
          If these new stories were the truth — and the old ones never even
          existed — how would your relationships, your work, your friendships,
          your parenting be different? Write freely.
        </p>
        <textarea
          aria-label="Reflection"
          rows={8}
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="Take your time…"
          className="w-full resize-y rounded-2xl border border-navy/15 bg-white px-5 py-4 font-sans text-[16px] leading-[1.75] text-navy outline-none transition placeholder:text-navy/35 focus:border-cyan-deep focus:ring-2 focus:ring-cyan-deep/25"
        />
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
