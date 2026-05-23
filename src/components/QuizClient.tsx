"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { QUESTIONS, getBand } from "@/lib/questions";
import { btnPrimary, eyebrow } from "@/lib/ui";
import { track } from "@/lib/analytics";
import { Spark } from "@/components/icons";
import ScoreRubric from "@/components/ScoreRubric";

const HOW_IT_WORKS = [
  "Ten short questions — it takes less than five minutes.",
  "For each one, choose the number that best reflects your current experience in life.",
  "Your points are added up to reveal your JQ score, from 10 to 50.",
  "Recommended monthly for a year, then quarterly thereafter.",
];

export default function QuizClient({
  context = "ad_hoc",
}: {
  context?: string;
}) {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(QUESTIONS.length).fill(null),
  );
  const [step, setStep] = useState(0);
  const [editing, setEditing] = useState(false);
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
    if (editing) {
      setEditing(false);
      setStep(QUESTIONS.length);
    } else {
      setStep((s) => Math.min(s + 1, QUESTIONS.length));
    }
  }

  async function submit() {
    if (!allAnswered) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, note, context }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something didn't work — try again?");
        setSubmitting(false);
        return;
      }
      track("assessment_completed", { score: liveScore });
      router.push(`/dashboard?new=${data.id}`);
      router.refresh();
    } catch {
      setError("Something didn't work — check your connection and try again?");
      setSubmitting(false);
    }
  }

  // ---- Intro ----
  if (!started) {
    return (
      <div className="animate-fade-in">
        <p className={eyebrow}>Before You Begin</p>
        <h1 className="mt-3 font-serif text-[38px] font-medium leading-tight tracking-tight text-navy">
          What is your <em className="text-cyan-deep">Joy Quotient</em>?
        </h1>

        <div className="mt-7 space-y-4 font-sans text-[16px] font-light leading-[1.75] text-navy/75">
          <p>
            Your Joy Quotient — or JQ — is your starting line. It&apos;s a
            snapshot of how much real, felt, embodied joy is present in your
            life right now. Not how happy you pretend to be. Not how many
            accomplishments you&apos;ve stacked — but how much joy is truly
            being lived and experienced, day to day.
          </p>
          <p>
            This idea was born in one of the hardest chapters of my life.
            Navigating burnout and depression, I began tracking my mental
            health with a clinical tool called the PHQ-9. Over time, the
            numbers shifted — and that visible, measurable progress made all
            the difference. It taught me something crucial: we need a way to
            measure the things that matter most. Not just our bank accounts or
            our body weight — but our joy.
          </p>
          <p>
            The JQ isn&apos;t a clinical diagnostic. It&apos;s a practical way
            to bring awareness to how much joy is currently present in your
            life — and to track how it expands as you do this work. Because joy
            rarely arrives all at once. It&apos;s more like an exponential
            curve: slow at first, then very, very quick. Without a measurement,
            it&apos;s easy to miss how far you&apos;ve come.
          </p>
        </div>

        <blockquote className="my-10 text-center font-serif text-[24px] italic leading-snug text-navy">
          &ldquo;Because what gets measured gets momentum.&rdquo;
        </blockquote>

        <div className="rounded-2xl bg-mist p-8">
          <h2 className="font-serif text-[22px] font-medium text-navy">
            How it works
          </h2>
          <ul className="mt-5 space-y-3">
            {HOW_IT_WORKS.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-0.5 shrink-0">
                  <Spark size={13} />
                </span>
                <span className="font-sans text-[15px] font-light leading-relaxed text-navy/75">
                  {item}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-6 font-serif text-[18px] italic leading-relaxed text-navy/65">
            So let&apos;s get honest about where you are right now — not to
            judge it, but to witness it.
          </p>
        </div>

        <button
          onClick={() => {
            setStarted(true);
            track("assessment_started");
          }}
          className={`${btnPrimary} mt-8 w-full`}
        >
          Begin the assessment
        </button>
      </div>
    );
  }

  // ---- Quiz / Review ----
  const progress = reviewing
    ? 100
    : Math.round((step / QUESTIONS.length) * 100);
  const band = getBand(liveScore);

  return (
    <div>
      <div className="mb-9">
        <p className={eyebrow}>The Assessment</p>
        <h1 className="mt-3 font-serif text-[34px] font-medium tracking-tight text-navy">
          Measure your <em className="text-cyan-deep">joy</em>
        </h1>
      </div>

      <div className="mb-9">
        <div className="flex justify-between font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-navy/45">
          <span>
            {reviewing
              ? "Review"
              : `Question ${step + 1} of ${QUESTIONS.length}`}
          </span>
          <span>{progress}%</span>
        </div>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-navy/10">
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
                  className={`flex w-full items-center gap-4 rounded-xl border px-4 py-4 text-left transition duration-150 ${
                    selected
                      ? "border-cyan bg-cyan/[0.06]"
                      : "border-navy/12 bg-white hover:border-cyan/50"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-sans text-[13px] font-bold transition duration-150 ${
                      selected
                        ? "bg-cyan text-white"
                        : "bg-mist text-navy/55"
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
              className="mt-7 font-sans text-[13px] font-medium text-cyan-deep transition-colors duration-150 hover:text-navy"
            >
              ← Previous question
            </button>
          )}
        </div>
      )}

      {reviewing && (
        <div className="animate-fade-in">
          <div className="rounded-2xl bg-navy px-8 py-12 text-center">
            <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.26em] text-cyan">
              Your projected score
            </p>
            <p className="mt-4 font-serif text-7xl font-medium leading-none tracking-tight text-white">
              {liveScore}
              <span className="font-sans text-2xl font-light text-white/45">
                {" "}
                / 50
              </span>
            </p>
            <p
              className="mt-4 flex items-center justify-center gap-2.5 font-sans text-[13px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: band.color }}
            >
              <Spark size={13} />
              {band.label}
              <Spark size={13} />
            </p>
          </div>

          <div className="mt-7">
            <ScoreRubric score={liveScore} />
          </div>

          <ul className="mt-7 divide-y divide-navy/8 overflow-hidden rounded-xl bg-mist">
            {QUESTIONS.map((q, i) => (
              <li key={q.id} className="flex items-center gap-4 px-4 py-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan/12 font-sans text-[13px] font-bold text-cyan-deep">
                  {answers[i]}
                </span>
                <span className="flex-1 font-sans text-[13px] leading-snug text-navy/70">
                  {q.text}
                </span>
                <button
                  onClick={() => {
                    setEditing(true);
                    setStep(i);
                  }}
                  className="shrink-0 font-sans text-[12px] font-semibold uppercase tracking-[0.12em] text-cyan-deep transition-colors duration-150 hover:text-navy"
                >
                  Edit
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <label
              htmlFor="note"
              className="mb-2 block font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-navy/55"
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
              className="w-full resize-none rounded-xl border border-navy/15 bg-white px-4 py-3 font-sans text-[15px] text-navy outline-none transition duration-150 placeholder:text-navy/35 focus:border-cyan focus:ring-2 focus:ring-cyan/25"
            />
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-gold/45 bg-gold/12 px-4 py-3 font-sans text-[13px] text-[#8a6d00]">
              <span aria-hidden>✦</span>
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={submit}
            disabled={submitting || !allAnswered}
            className={`${btnPrimary} mt-6 w-full`}
          >
            {submitting ? "Saving…" : "Save my JQ score"}
          </button>
        </div>
      )}
    </div>
  );
}
