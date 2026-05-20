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
    <div className="animate-fade-in">
      <div className="mb-6">
        <div className="flex justify-between text-xs font-medium text-stone-500">
          <span>
            {reviewing
              ? "Review your answers"
              : `Question ${step + 1} of ${QUESTIONS.length}`}
          </span>
          <span>{progress}%</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-amber-100">
          <div
            className="h-full rounded-full bg-amber-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {!reviewing && (
        <div key={step} className="animate-fade-in">
          <h2 className="text-xl font-semibold leading-snug text-amber-900">
            {QUESTIONS[step].text}
          </h2>
          <div className="mt-5 space-y-2.5">
            {QUESTIONS[step].options.map((opt, i) => {
              const value = i + 1;
              const selected = answers[step] === value;
              return (
                <button
                  key={value}
                  onClick={() => choose(value)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${
                    selected
                      ? "border-amber-500 bg-amber-50 ring-2 ring-amber-200"
                      : "border-amber-200 bg-white hover:border-amber-400 hover:bg-amber-50"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      selected
                        ? "bg-amber-500 text-white"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {value}
                  </span>
                  <span className="text-stone-700">{opt}</span>
                </button>
              );
            })}
          </div>
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="mt-5 text-sm font-medium text-amber-700 hover:underline"
            >
              ← Back
            </button>
          )}
        </div>
      )}

      {reviewing && (
        <div className="animate-fade-in">
          <div className="rounded-xl border border-amber-200 bg-white p-5 text-center">
            <p className="text-sm text-stone-500">Your projected JQ score</p>
            <p className="mt-1 text-4xl font-bold text-amber-600">
              {liveScore}
              <span className="text-lg text-stone-400"> / 50</span>
            </p>
            <p className="mt-1 text-sm font-medium text-amber-800">
              {getBand(liveScore).label}
            </p>
          </div>

          <ul className="mt-5 space-y-2">
            {QUESTIONS.map((q, i) => (
              <li
                key={q.id}
                className="flex items-start gap-3 rounded-lg border border-amber-100 bg-white px-3 py-2.5 text-sm"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
                  {answers[i]}
                </span>
                <span className="flex-1 text-stone-600">{q.text}</span>
                <button
                  onClick={() => setStep(i)}
                  className="shrink-0 text-xs font-medium text-amber-700 hover:underline"
                >
                  Edit
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-5">
            <label className="text-sm font-medium text-amber-900">
              Add a note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="What's going on in your life right now?"
              className="mt-1.5 w-full resize-none rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
            />
          </div>

          {error && (
            <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            onClick={submit}
            disabled={submitting || !allAnswered}
            className="mt-4 w-full rounded-lg bg-amber-500 py-3 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Save my JQ score"}
          </button>
        </div>
      )}
    </div>
  );
}
