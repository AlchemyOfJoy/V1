"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { QUESTIONS, getBand } from "@/lib/questions";

export default function QuizClient() {
  const router = useRouter();
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(QUESTIONS.length).fill(null),
  );
  const [step, setStep] = useState(0);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const reviewing = step >= QUESTIONS.length;
  const answeredCount = answers.filter((a) => a !== null).length;
  const allAnswered = answeredCount === QUESTIONS.length;
  const liveScore = useMemo(
    () => answers.reduce<number>((sum, a) => sum + (a ?? 0), 0),
    [answers],
  );

  function choose(value: number) {
    setAnswers((prev) => {
      const next = [...prev];
      next[step] = value;
      return next;
    });
    setStep((s) => Math.min(s + 1, QUESTIONS.length));
  }

  async function submit() {
    if (!allAnswered) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, note }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something didn't work — try again?");
        setSubmitting(false);
        return;
      }
      router.push(`/dashboard?new=${data.id}`);
      router.refresh();
    } catch {
      setError("Something didn't work — check your connection and try again?");
      setSubmitting(false);
    }
  }

  const progress = reviewing
    ? 100
    : Math.round((step / QUESTIONS.length) * 100);
  const band = getBand(liveScore);

  return (
    <div>
      <div className="mb-9">
        <div className="flex justify-between font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-navy/45">
          <span>
            {reviewing
              ? "Review"
              : `Question ${step + 1} of ${QUESTIONS.length}`}
          </span>
          <span>{progress}%</span>
        </div>
        <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-navy/10">
          <div
            className="h-full rounded-full bg-cyan transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {!reviewing && (
        <div key={step} className="animate-fade-in">
          <h2 className="font-serif text-[26px] font-medium leading-snug tracking-tight text-navy sm:text-[30px]">
            {QUESTIONS[step].text}
          </h2>
          <div className="mt-8 space-y-2.5">
            {QUESTIONS[step].options.map((opt, i) => {
              const value = i + 1;
              const selected = answers[step] === value;
              return (
                <button
                  key={value}
                  onClick={() => choose(value)}
                  className={`flex w-full items-center gap-4 rounded-2xl border px-4 py-4 text-left transition ${
                    selected
                      ? "border-cyan bg-cyan/[0.07]"
                      : "border-navy/12 bg-bone-raised hover:border-cyan/45"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-sans text-[13px] font-bold transition ${
                      selected
                        ? "bg-cyan text-bone"
                        : "bg-navy/8 text-navy/55"
                    }`}
                  >
                    {value}
                  </span>
                  <span className="font-sans text-[15px] text-navy">
                    {opt}
                  </span>
                </button>
              );
            })}
          </div>
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="mt-7 font-sans text-[13px] font-medium text-cyan hover:underline"
            >
              ← Previous question
            </button>
          )}
        </div>
      )}

      {reviewing && (
        <div className="animate-fade-in">
          <div className="rounded-3xl bg-navy px-8 py-10 text-center">
            <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.26em] text-cyan">
              Your projected score
            </p>
            <p className="mt-3 font-serif text-7xl font-medium leading-none tracking-tight text-bone">
              {liveScore}
              <span className="font-sans text-2xl font-normal text-bone/45">
                {" "}
                / 50
              </span>
            </p>
            <p
              className="mt-3 font-sans text-[14px] font-semibold uppercase tracking-[0.16em]"
              style={{ color: band.color }}
            >
              {band.label}
            </p>
          </div>

          <ul className="mt-6 divide-y divide-navy/10 overflow-hidden rounded-2xl border border-navy/12 bg-bone-raised">
            {QUESTIONS.map((q, i) => (
              <li key={q.id} className="flex items-center gap-4 px-4 py-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan/12 font-sans text-[13px] font-bold text-cyan">
                  {answers[i]}
                </span>
                <span className="flex-1 font-sans text-[13px] leading-snug text-navy/70">
                  {q.text}
                </span>
                <button
                  onClick={() => setStep(i)}
                  className="shrink-0 font-sans text-[12px] font-semibold uppercase tracking-[0.12em] text-cyan hover:underline"
                >
                  Edit
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <label
              htmlFor="note"
              className="mb-1.5 block font-sans text-[12px] font-semibold uppercase tracking-[0.16em] text-navy/55"
            >
              Add a note{" "}
              <span className="font-normal lowercase">(optional)</span>
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="What's going on in your life right now?"
              className="w-full resize-none rounded-xl border border-navy/12 bg-bone-raised px-4 py-3 font-sans text-[15px] text-navy outline-none transition placeholder:text-navy/35 focus:border-cyan focus:ring-2 focus:ring-cyan/25"
            />
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-gold/40 bg-gold/15 px-4 py-3 font-sans text-[13px] text-[#8a6d00]">
              {error}
            </div>
          )}

          <button
            onClick={submit}
            disabled={submitting || !allAnswered}
            className="mt-6 w-full rounded-full bg-cyan py-3.5 font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-bone transition-all duration-300 hover:-translate-y-0.5 hover:bg-navy disabled:pointer-events-none disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Save my JQ score"}
          </button>
        </div>
      )}
    </div>
  );
}
