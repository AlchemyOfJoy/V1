"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { btnPrimary } from "@/lib/ui";
import { formatSavedAt } from "./useWorksheetSave";

type Field = "victim_rant" | "empath_rave" | "universal_meaning" | "forgiveness_statement";

const STEPS: {
  field: Field;
  title: string;
  eyebrow: string;
  prompt: string;
  placeholder: string;
}[] = [
  {
    field: "victim_rant",
    title: "Victim Rant",
    eyebrow: "Step 1 of 4",
    prompt:
      "Get it all out. No editing, no fairness, no balance. Say every ugly thing the wound has been saying for years. This is the page where you stop carrying it silently.",
    placeholder: "Let it out. Nobody else will read this.",
  },
  {
    field: "empath_rave",
    title: "Empath Rave",
    eyebrow: "Step 2 of 4",
    prompt:
      "Walk a mile in their shoes. What were they carrying? What pain made them do what they did? You don't have to like it — only to see it.",
    placeholder: "Their story, as honestly as you can tell it.",
  },
  {
    field: "universal_meaning",
    title: "Universal Meaning",
    eyebrow: "Step 3 of 4",
    prompt:
      "Step back. What did this experience make possible? Who did it shape you into? What did it teach you that nothing else could have?",
    placeholder: "The gift hidden inside the wound.",
  },
  {
    field: "forgiveness_statement",
    title: "Forgiveness Statement",
    eyebrow: "Step 4 of 4",
    prompt:
      "Write the release out loud, in your own words. Speak as if you are setting the weight down on the ground in front of you.",
    placeholder: "I forgive…",
  },
];

interface Subject {
  id: string;
  subject_name: string;
  victim_rant: string | null;
  empath_rave: string | null;
  universal_meaning: string | null;
  forgiveness_statement: string | null;
  completed_at: string | Date | null;
}

export default function ForgivenessWizard({
  initialSubject,
}: {
  initialSubject: Subject;
}) {
  const router = useRouter();
  const [subject, setSubject] = useState<Subject>(initialSubject);
  const [name, setName] = useState(initialSubject.subject_name);
  const [values, setValues] = useState<Record<Field, string>>({
    victim_rant: initialSubject.victim_rant ?? "",
    empath_rave: initialSubject.empath_rave ?? "",
    universal_meaning: initialSubject.universal_meaning ?? "",
    forgiveness_statement: initialSubject.forgiveness_statement ?? "",
  });
  const initialStep = STEPS.findIndex(
    (s) => !((initialSubject[s.field] ?? "") as string).trim(),
  );
  const [step, setStep] = useState(initialStep === -1 ? 3 : initialStep);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showRitual, setShowRitual] = useState(false);

  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      setSaving(true);
      setSaveError(null);
      try {
        const res = await fetch(
          `/api/curriculum/forgiveness/${subject.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subject_name: name, ...values }),
          },
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Save failed.");
        setSubject(data.subject);
        setSavedAt(new Date());
      } catch (e) {
        setSaveError((e as Error).message);
      } finally {
        setSaving(false);
      }
    }, 1500);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [name, values, subject.id]);

  function updateField(field: Field, v: string) {
    setValues((cur) => ({ ...cur, [field]: v }));
  }

  async function releaseAndComplete() {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/curriculum/forgiveness/${subject.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject_name: name,
          ...values,
          complete: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed.");
      setSubject(data.subject);
      setSavedAt(new Date());
      setShowRitual(true);
    } catch (e) {
      setSaveError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const current = STEPS[step];
  const stepComplete = (values[current.field] ?? "").trim().length > 0;
  const isLast = step === STEPS.length - 1;

  return (
    <section className="space-y-8">
      <div className="space-y-3 rounded-2xl border border-navy/10 bg-mist p-5">
        <label
          htmlFor="subject-rename"
          className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-deep"
        >
          Subject
        </label>
        <input
          id="subject-rename"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={120}
          className="w-full rounded-xl border border-navy/15 bg-white px-4 py-3 font-serif text-[18px] text-navy outline-none transition focus:border-cyan-deep focus:ring-2 focus:ring-cyan-deep/25"
        />
      </div>

      <ol className="flex flex-wrap gap-2 font-sans text-[12px] font-semibold uppercase tracking-[0.14em]">
        {STEPS.map((s, i) => {
          const active = i === step;
          const filled = (values[s.field] ?? "").trim().length > 0;
          return (
            <li key={s.field}>
              <button
                type="button"
                onClick={() => setStep(i)}
                className={`rounded-full px-3 py-1.5 transition ${
                  active
                    ? "bg-cyan-deep text-white"
                    : filled
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

      <div className="space-y-4">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
          {current.eyebrow}
        </p>
        <h3 className="font-serif text-[26px] font-medium tracking-tight text-navy">
          {current.title}
        </h3>
        <p className="font-sans text-[15px] font-light leading-[1.75] text-navy/70">
          {current.prompt}
        </p>
        <textarea
          rows={14}
          value={values[current.field]}
          onChange={(e) => updateField(current.field, e.target.value)}
          placeholder={current.placeholder}
          className="w-full resize-y rounded-2xl border border-navy/15 bg-white px-5 py-4 font-serif text-[17px] leading-[1.85] text-navy outline-none transition placeholder:font-sans placeholder:text-[15px] placeholder:font-light placeholder:text-navy/40 focus:border-cyan-deep focus:ring-2 focus:ring-cyan-deep/25"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-navy/10 pt-6">
        <p
          className="font-sans text-[12px] text-navy/45"
          aria-live="polite"
          aria-atomic="true"
        >
          {saving
            ? "Saving…"
            : saveError
              ? "Couldn't save — we'll keep trying."
              : savedAt
                ? `Saved · ${formatSavedAt(savedAt)}`
                : "Private. Visible only to you."}
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
          {!isLast ? (
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
              className={btnPrimary}
              disabled={!stepComplete}
            >
              Continue →
            </button>
          ) : (
            <button
              type="button"
              onClick={releaseAndComplete}
              className={btnPrimary}
              disabled={!stepComplete || saving}
            >
              Release →
            </button>
          )}
        </div>
      </div>

      {showRitual && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ritual-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy/85 px-6 py-12 backdrop-blur-sm animate-fade-in"
        >
          <div className="max-w-xl space-y-6 rounded-3xl bg-white p-10 text-center shadow-2xl">
            <div
              aria-hidden
              className="mx-auto h-12 w-12 text-[40px] leading-none text-gold"
            >
              ✦
            </div>
            <h2
              id="ritual-title"
              className="font-serif text-[30px] font-medium text-navy"
            >
              Released.
            </h2>
            <p className="font-sans text-[15px] font-light leading-[1.8] text-navy/75">
              You set the weight down. Read your release out loud if you can.
              Some people print it and burn it. Some keep it folded in a
              drawer. There&apos;s no right ritual — only the one that lets
              you walk away lighter.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowRitual(false);
                  router.push("/curriculum/module/03-forgiveness");
                  router.refresh();
                }}
                className={btnPrimary}
              >
                Return to the framework
              </button>
              <button
                type="button"
                onClick={() => setShowRitual(false)}
                className="rounded-full border border-navy/20 px-5 py-2.5 font-sans text-[13px] font-medium text-navy transition hover:border-cyan-deep hover:text-cyan-deep"
              >
                Stay on this page
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
