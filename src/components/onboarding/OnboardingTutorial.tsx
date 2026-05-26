"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { JOS_COMPONENTS } from "@/lib/jos-types";

/**
 * Day 0 onboarding (JOS-First Architecture §3).
 *
 * Six screens. About 10-15 minutes. By the end the user has:
 *   • Met Brent's promise (install the JOS)
 *   • Seen the six components they'll build over the week
 *   • Done their first Reset Breath (introduces ⚡)
 *   • Added their first entry to the List of Joy (seeds the list)
 *   • Been handed off to tomorrow's first component
 *
 * No Three Doors — path choice happens AFTER the JOS install, not
 * during onboarding. The JQ Baseline (Component 01) runs the next
 * morning on Day 0 of the install rather than inside this tutorial,
 * keeping the first session light enough to actually finish.
 */
type Step = "arrival" | "promise" | "components" | "breath" | "joy" | "handoff";

const STEPS: Step[] = [
  "arrival",
  "promise",
  "components",
  "breath",
  "joy",
  "handoff",
];

export default function OnboardingTutorial() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("arrival");

  function next(to: Step) {
    setStep(to);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }

  async function finish() {
    try {
      await fetch("/api/curriculum/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
    } catch {
      // best effort
    }
    router.push("/home");
    router.refresh();
  }

  const idx = STEPS.indexOf(step);
  const showChrome = step !== "arrival";

  return (
    <main className="fixed inset-0 z-50 overflow-y-auto bg-white text-navy">
      {showChrome && (
        <ProgressChrome
          current={idx}
          total={STEPS.length}
          onSkip={() => finish()}
        />
      )}
      {step === "arrival" && <Arrival onNext={() => next("promise")} />}
      {step === "promise" && <Promise onNext={() => next("components")} />}
      {step === "components" && (
        <ComponentsPreview onNext={() => next("breath")} />
      )}
      {step === "breath" && <FirstBreath onNext={() => next("joy")} />}
      {step === "joy" && <FirstJoy onNext={() => next("handoff")} />}
      {step === "handoff" && <Handoff onFinish={finish} />}
    </main>
  );
}

/* ─────────────────────────────────────────────────────────
   Progress chrome
   ───────────────────────────────────────────────────────── */
function ProgressChrome({
  current,
  total,
  onSkip,
}: {
  current: number;
  total: number;
  onSkip: () => void;
}) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between bg-white/85 px-5 pb-3 pt-4 backdrop-blur-sm">
      <ol
        aria-label="Onboarding progress"
        className="flex flex-1 items-center gap-1.5"
      >
        {Array.from({ length: total }, (_, i) => (
          <li
            key={i}
            aria-current={i === current ? "step" : undefined}
            className={`h-1 flex-1 rounded-full transition ${
              i < current
                ? "bg-cyan"
                : i === current
                  ? "bg-cyan/55"
                  : "bg-slate/15"
            }`}
          />
        ))}
      </ol>
      <button
        type="button"
        onClick={onSkip}
        className="ml-4 font-sans text-[11px] uppercase tracking-[0.22em] text-slate hover:text-navy"
      >
        Skip intro
      </button>
    </header>
  );
}

/* ─────────────────────────────────────────────────────────
   Screen 1 — Arrival
   ───────────────────────────────────────────────────────── */
function Arrival({ onNext }: { onNext: () => void }) {
  const [shown, setShown] = useState(false);
  const [subtitleShown, setSubtitleShown] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShown(true), 100);
    const t2 = setTimeout(() => setSubtitleShown(true), 1800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-8 text-center">
      <div
        aria-hidden
        className={`absolute inset-0 bg-navy transition-opacity duration-[1500ms] ${
          shown ? "opacity-0" : "opacity-100"
        }`}
      />
      <div className="relative z-10 max-w-md">
        <h1
          className={`font-serif text-[40px] font-medium leading-tight tracking-tight text-navy transition-all duration-[1200ms] sm:text-[56px] ${
            shown ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
          Welcome to <em className="text-cyan">The Alchemy of Joy</em>.
        </h1>
        <div
          aria-hidden
          className={`mx-auto my-8 h-px w-20 bg-slate/30 transition-opacity duration-[1500ms] ${
            subtitleShown ? "opacity-100" : "opacity-0"
          }`}
        />
        <p
          className={`font-serif text-[20px] italic leading-relaxed text-slate transition-all duration-[1200ms] ${
            subtitleShown ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
          This is the doing layer for the work that changes your life.
        </p>
        <button
          onClick={onNext}
          className={`mt-12 inline-flex items-center justify-center rounded-full bg-cyan px-8 py-3 font-sans text-[10px] font-bold uppercase tracking-[0.22em] text-white transition-all duration-[1500ms] hover:bg-navy ${
            subtitleShown ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
          style={{ transitionDelay: subtitleShown ? "400ms" : "0ms" }}
        >
          I&apos;m Ready
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Screen 2 — Brent's promise (the JOS install)
   ───────────────────────────────────────────────────────── */
function Promise({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-8 text-center animate-fade-in">
      <article className="max-w-lg space-y-6">
        <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.26em] text-cyan">
          A note from Brent
        </p>
        <h2 className="font-serif text-[36px] font-medium leading-tight text-navy">
          Before you do anything else,
          we&apos;re going to install
          the <em className="text-cyan">operating system</em>.
        </h2>
        <p className="font-serif text-[20px] italic leading-relaxed text-navy">
          Your Joyful Operating System.
        </p>
        <p className="font-sans text-[16px] font-light leading-relaxed text-slate">
          Six components. Built over the next week. Then you&apos;ll have
          a system that runs your life from joy instead of fear.
        </p>
      </article>
      <button
        onClick={onNext}
        className="mt-12 inline-flex items-center justify-center rounded-full bg-cyan px-8 py-3 font-sans text-[10px] font-bold uppercase tracking-[0.22em] text-white hover:bg-navy"
      >
        What&apos;s in the JOS?
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Screen 3 — The 6 components preview
   ───────────────────────────────────────────────────────── */
function ComponentsPreview({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-start px-6 py-10 animate-fade-in">
      <div className="w-full max-w-xl">
        <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.26em] text-cyan">
          The Joyful Operating System
        </p>
        <h2 className="mt-4 font-serif text-[36px] font-medium leading-tight text-navy">
          Six components. <em className="text-cyan">One you.</em>
        </h2>
        <div aria-hidden className="my-6 h-px w-16 bg-slate/30" />

        <ol className="space-y-0">
          {JOS_COMPONENTS.map((c) => {
            const padded = String(c.number).padStart(2, "0");
            return (
              <li
                key={c.id}
                className="flex items-start gap-5 border-b border-slate/15 py-4"
              >
                <span
                  aria-hidden
                  className="font-serif text-[24px] italic leading-none text-gold"
                >
                  {padded}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan">
                    {c.eyebrow}
                  </p>
                  <p className="mt-1 font-serif text-[20px] font-medium leading-tight text-navy">
                    {c.name}
                  </p>
                  <p className="mt-0.5 font-sans text-[14px] font-light text-slate">
                    {c.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        <p className="mt-8 font-serif text-[18px] italic leading-relaxed text-slate">
          Built one at a time. Paced for absorption. About a week.
        </p>

        <button
          onClick={onNext}
          className="mt-8 inline-flex items-center justify-center rounded-full bg-cyan px-8 py-3 font-sans text-[10px] font-bold uppercase tracking-[0.22em] text-white hover:bg-navy"
        >
          Let&apos;s Begin
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Screen 4 — First Reset Breath
   ───────────────────────────────────────────────────────── */
function FirstBreath({ onNext }: { onNext: () => void }) {
  const [cycle, setCycle] = useState(0);
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");
  const [done, setDone] = useState(false);
  const [started, setStarted] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function start() {
    setStarted(true);
    runCycle(0, "in");
  }

  function runCycle(c: number, p: "in" | "hold" | "out") {
    setPhase(p);
    setCycle(c);
    const ms = p === "in" ? 4000 : p === "hold" ? 4000 : 6000;
    timer.current = setTimeout(() => {
      if (p === "in") runCycle(c, "hold");
      else if (p === "hold") runCycle(c, "out");
      else {
        const nextCycle = c + 1;
        if (nextCycle >= 3) setDone(true);
        else runCycle(nextCycle, "in");
      }
    }, ms);
  }

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-8 text-center">
      {!started ? (
        <div className="max-w-md space-y-5 animate-fade-in">
          <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.26em] text-cyan">
            Your first tool
          </p>
          <p className="font-serif text-[28px] leading-snug text-navy">
            Breathe with the line.
          </p>
          <p className="font-sans text-[14px] font-light text-slate">
            Three slow cycles. Forty-two seconds. The ⚡ button gets you
            back here from anywhere in the app.
          </p>
          <button
            onClick={start}
            className="mt-2 inline-flex items-center justify-center rounded-full bg-cyan px-8 py-3 font-sans text-[10px] font-bold uppercase tracking-[0.22em] text-white hover:bg-navy"
          >
            Begin
          </button>
        </div>
      ) : !done ? (
        <div className="flex w-full max-w-lg flex-col items-center">
          <p className="mb-12 font-sans text-[12px] font-semibold uppercase tracking-[0.26em] text-cyan">
            Cycle {cycle + 1} of 3 ·{" "}
            {phase === "in" ? "Inhale" : phase === "hold" ? "Hold" : "Exhale"}
          </p>
          <div className="relative h-px w-full overflow-visible bg-cyan/25">
            <div
              className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-cyan transition-all ease-in-out"
              style={{
                left: "50%",
                transform: `translate(-50%, ${
                  phase === "in"
                    ? "calc(-50% - 80px)"
                    : phase === "hold"
                      ? "calc(-50% - 80px)"
                      : "calc(-50% - 0px)"
                })`,
                transitionDuration:
                  phase === "in"
                    ? "4000ms"
                    : phase === "out"
                      ? "6000ms"
                      : "0ms",
              }}
            />
          </div>
          <p className="mt-16 font-serif text-[20px] italic text-slate">
            {phase === "in"
              ? "Up the line, slowly…"
              : phase === "hold"
                ? "Stay…"
                : "Long way down…"}
          </p>
        </div>
      ) : (
        <div className="max-w-md space-y-5 animate-fade-in text-center">
          <p className="font-serif text-[28px] leading-snug text-navy">
            That&apos;s a Reset Breath.
          </p>
          <p className="font-sans text-[14px] font-light text-slate">
            ⚡ from anywhere. Anytime.
          </p>
          <button
            onClick={onNext}
            className="mt-2 inline-flex items-center justify-center rounded-full bg-cyan px-8 py-3 font-sans text-[10px] font-bold uppercase tracking-[0.22em] text-white hover:bg-navy"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Screen 5 — First List of Joy entry
   ───────────────────────────────────────────────────────── */
function FirstJoy({ onNext }: { onNext: () => void }) {
  const [entries, setEntries] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  async function add() {
    const t = text.trim();
    if (!t) return;
    setSaving(true);
    try {
      await fetch("/api/curriculum/list-of-joy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: t }),
      });
      setEntries((cur) => [...cur, t]);
      setText("");
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12 animate-fade-in">
      <div className="w-full max-w-xl">
        <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.26em] text-cyan">
          Seed your List of Joy
        </p>
        <h2 className="mt-4 font-serif text-[28px] font-medium leading-tight text-navy">
          Tell me one thing.
        </h2>
        <p className="mt-3 font-serif text-[20px] italic leading-relaxed text-navy">
          Something that makes you smile from the inside out.
        </p>
        <p className="mt-2 font-sans text-[14px] font-light text-slate">
          Could be sunlight on water. Your dog. The way your kid laughs.
          Whatever&apos;s true.
        </p>

        <div className="mt-8 border-b border-slate/30 pb-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="…"
            autoFocus
            className="w-full resize-none border-0 bg-transparent py-3 font-serif text-[20px] leading-relaxed text-navy outline-none placeholder:text-slate/40"
          />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="font-sans text-[12px] text-slate">
            {entries.length === 0
              ? "Your first entry begins your List of Joy."
              : `${entries.length} ${entries.length === 1 ? "entry" : "entries"} added`}
          </p>
          <button
            onClick={add}
            disabled={!text.trim() || saving}
            className="inline-flex items-center justify-center rounded-full bg-cyan px-6 py-2 font-sans text-[10px] font-bold uppercase tracking-[0.22em] text-white transition hover:bg-navy disabled:opacity-40"
          >
            {saving ? "…" : "Add it"}
          </button>
        </div>

        {entries.length > 0 && (
          <ul className="mt-6 space-y-3">
            {entries.map((e, i) => (
              <li
                key={i}
                className="flex items-start gap-3 border-t border-slate/15 pt-3 font-serif text-[18px] italic text-navy animate-fade-in"
              >
                <span aria-hidden className="text-gold">
                  ✦
                </span>
                {e}
              </li>
            ))}
          </ul>
        )}

        {entries.length > 0 && (
          <div className="mt-8 text-center">
            <p className="font-serif text-[17px] italic text-slate">
              {entries.length === 1
                ? "You just started your List of Joy. We'll come back to it every day. Forever."
                : "The list is alive."}
            </p>
            <button
              onClick={onNext}
              className="mt-6 inline-flex items-center justify-center rounded-full bg-cyan px-8 py-3 font-sans text-[10px] font-bold uppercase tracking-[0.22em] text-white hover:bg-navy"
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Screen 6 — Handoff to Day 0 of JOS install
   ───────────────────────────────────────────────────────── */
function Handoff({ onFinish }: { onFinish: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12 animate-fade-in">
      <div className="w-full max-w-md text-center">
        <p aria-hidden className="text-[44px] leading-none text-gold">
          ✦
        </p>
        <p className="mt-5 font-sans text-[12px] font-semibold uppercase tracking-[0.26em] text-cyan">
          Day 0 begins
        </p>
        <h2 className="mt-4 font-serif text-[32px] font-medium leading-tight text-navy">
          One down. Five to go.
        </h2>
        <p className="mt-4 font-serif text-[18px] italic leading-relaxed text-navy">
          Tomorrow morning, Component 01 is waiting.
        </p>
        <p className="mt-3 font-sans text-[16px] font-light leading-relaxed text-slate">
          Your Joy Quotient baseline. Twenty questions. About ten minutes.
          This becomes the version of you who started.
        </p>
        <p className="mt-6 font-serif text-[16px] italic text-slate">
          See you in the morning.
        </p>
        <button
          onClick={onFinish}
          className="mt-10 inline-flex items-center justify-center rounded-full bg-cyan px-8 py-3 font-sans text-[10px] font-bold uppercase tracking-[0.22em] text-white hover:bg-navy"
        >
          Close the app
        </button>
      </div>
    </div>
  );
}
