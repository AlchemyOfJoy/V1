"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { btnPrimary } from "@/lib/ui";
import type { ScienceOfJoyData } from "@/lib/curriculum";
import { useWorksheetSave, formatSavedAt } from "./useWorksheetSave";

export default function ScienceReflectionForm({
  worksheetId,
  initialData,
  continueHref,
}: {
  worksheetId: string;
  initialData: ScienceOfJoyData;
  continueHref: string;
}) {
  const router = useRouter();
  const [reflection, setReflection] = useState(initialData.reflection ?? "");
  const data = useMemo<ScienceOfJoyData>(
    () => ({ reflection }),
    [reflection],
  );
  const { savedAt, saving, error, markComplete } = useWorksheetSave(
    worksheetId,
    data,
  );

  async function handleContinue() {
    const ok = await markComplete();
    if (ok) router.push(continueHref);
  }

  return (
    <section className="space-y-6">
      <div>
        <label
          htmlFor="reflection"
          className="block font-serif text-[22px] font-medium tracking-tight text-navy"
        >
          One belief that just shifted.
        </label>
        <p className="mt-1 font-sans text-[14px] font-light text-navy/65">
          After learning how your brain creates joy, what&apos;s one belief
          about transformation that just shifted for you?
        </p>
      </div>
      <textarea
        id="reflection"
        rows={8}
        value={reflection}
        onChange={(e) => setReflection(e.target.value)}
        placeholder="Take your time… type as much or as little as you need."
        className="w-full resize-y rounded-2xl border border-navy/15 bg-white px-5 py-4 font-sans text-[16px] leading-[1.75] text-navy outline-none transition placeholder:text-navy/35 focus:border-cyan-deep focus:ring-2 focus:ring-cyan-deep/25"
      />

      <SaveRow
        saving={saving}
        savedAt={savedAt}
        error={error}
        onContinue={handleContinue}
      />
    </section>
  );
}

function SaveRow({
  saving,
  savedAt,
  error,
  onContinue,
}: {
  saving: boolean;
  savedAt: Date | null;
  error: string | null;
  onContinue: () => void;
}) {
  return (
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
      <button onClick={onContinue} className={btnPrimary} disabled={saving}>
        Continue →
      </button>
    </div>
  );
}
