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
        setError(data.error ?? "Could not save your assessment.");
        setSubmitting(false);
        return;
      }
      router.push(`/dashboard?new=${data.id}`);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  const progress = reviewing
    ? 100
    : Math.round((step / QUESTIONS.length) * 100);

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between text-[12px] font-medium text-ink-3">
          <span>
            {reviewing
              ? "Review"
              : `Question ${step + 1} of ${QUESTIONS.length}`}
          </span>
          <span>{progress}%</span>
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-canvas">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {!reviewing && (
        <div key={step} className="animate-rise">
          <h2 className="text-[22px] font-semibold leading-snug tracking-tight text-ink sm:text-[26px]">
            {QUESTIONS[step].text}
          </h2>
          <div className="mt-7 space-y-2">
            {QUESTIONS[step].options.map((opt, i) => {
              const value = i + 1;
              const selected = answers[step] === value;
              return (
                <button
                  key={value}
                  onClick={() => choose(value)}
                  className={`flex w-full items-center gap-3.5 rounded-2xl border px-4 py-3.5 text-left transition ${
                    selected
                      ? "border-accent bg-accent/[0.05]"
                      : "border-hairline bg-white hover:bg-canvas"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold transition ${
                      selected
                        ? "bg-accent text-white"
                        : "bg-canvas text-ink-2"
                    }`}
                  >
                    {value}
                  </span>
                  <span className="text-[15px] text-ink">{opt}</span>
                </button>
              );
            })}
          </div>
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="mt-6 text-[13px] font-medium text-accent hover:underline"
            >
              ← Previous
            </button>
          )}
        </div>
      )}

      {reviewing && (
        <div className="animate-rise">
          <div className="rounded-3xl bg-canvas p-8 text-center">
            <p className="text-[13px] font-medium text-ink-3">
              Your projected JQ score
            </p>
            <p className="mt-2 text-6xl font-semibold tracking-tight text-ink">
              {liveScore}
              <span className="text-2xl font-normal text-ink-3"> / 50</span>
            </p>
            <p
              className="mt-2 text-[15px] font-medium"
              style={{ color: getBand(liveScore).color }}
            >
              {getBand(liveScore).label}
            </p>
          </div>

          <ul className="mt-6 divide-y divide-hairline overflow-hidden rounded-2xl border border-hairline">
            {QUESTIONS.map((q, i) => (
              <li
                key={q.id}
                className="flex items-center gap-3.5 bg-white px-4 py-3"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-canvas text-[13px] font-semibold text-ink-2">
                  {answers[i]}
                </span>
                <span className="flex-1 text-[13px] leading-snug text-ink-2">
                  {q.text}
                </span>
                <button
                  onClick={() => setStep(i)}
                  className="shrink-0 text-[13px] font-medium text-accent hover:underline"
                >
                  Edit
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <label className="text-[13px] font-medium text-ink">
              Add a note <span className="text-ink-3">(optional)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="What's going on in your life right now?"
              className="mt-2 w-full resize-none rounded-xl bg-canvas px-4 py-3 text-[15px] text-ink placeholder:text-ink-3 outline-none transition focus:bg-white focus:ring-2 focus:ring-accent/45"
            />
          </div>

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-[13px] text-red-600">
              {error}
            </div>
          )}

          <button
            onClick={submit}
            disabled={submitting || !allAnswered}
            className="mt-5 w-full rounded-xl bg-accent py-3.5 text-[15px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-55"
          >
            {submitting ? "Saving…" : "Save my JQ score"}
          </button>
        </div>
      )}
    </div>
  );
}
