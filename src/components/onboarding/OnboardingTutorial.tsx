"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Door = "book" | "retreat" | "challenge" | "explore";

type Step =
  | "arrival"
  | "promise"
  | "breath"
  | "doors"
  | "joy"
  | "pulse"
  | "how_to_use"
  | "reveal";

const STEPS: Step[] = [
  "arrival",
  "promise",
  "breath",
  "doors",
  "joy",
  "pulse",
  "how_to_use",
  "reveal",
];

export default function OnboardingTutorial() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("arrival");
  const [door, setDoor] = useState<Door | null>(null);

  function next(to: Step) {
    setStep(to);
    // scroll to top of the new screen
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }

  async function finish() {
    try {
      await fetch("/api/curriculum/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ door: door ?? "challenge" }),
      });
    } catch {
      // best effort
    }
    router.push("/home");
    router.refresh();
  }

  const idx = STEPS.indexOf(step);
  // Hide the progress chrome on the arrival screen — that one is a moment.
  const showChrome = step !== "arrival";

  return (
    <main className="fixed inset-0 z-50 overflow-y-auto bg-[#F7F2E9] text-[#2A2724]">
      {showChrome && (
        <ProgressChrome
          current={idx}
          total={STEPS.length}
          onSkip={() => finish()}
        />
      )}
      {step === "arrival" && <Arrival onNext={() => next("promise")} />}
      {step === "promise" && <Promise onNext={() => next("breath")} />}
      {step === "breath" && <FirstBreath onNext={() => next("doors")} />}
      {step === "doors" && (
        <ThreeDoors
          selected={door}
          onSelect={(d) => {
            setDoor(d);
            next("joy");
          }}
        />
      )}
      {step === "joy" && <FirstJoy onNext={() => next("pulse")} />}
      {step === "pulse" && <FirstPulse onNext={() => next("how_to_use")} />}
      {step === "how_to_use" && (
        <HowToUse onNext={() => next("reveal")} door={door} />
      )}
      {step === "reveal" && <Reveal door={door} onFinish={finish} />}
    </main>
  );
}

/* ─────────────────────────────────────────────────────────
   Progress chrome — small step indicator + skip
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
    <header className="sticky top-0 z-10 flex items-center justify-between bg-[#F7F2E9]/85 px-5 pb-3 pt-4 backdrop-blur-sm">
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
                ? "bg-[#C89A3F]"
                : i === current
                  ? "bg-[#C89A3F]/55"
                  : "bg-[#2A2724]/10"
            }`}
          />
        ))}
      </ol>
      <button
        type="button"
        onClick={onSkip}
        className="ml-4 font-sans text-[11px] uppercase tracking-[0.18em] text-[#2A2724]/45 hover:text-[#2A2724]"
      >
        Skip intro
      </button>
    </header>
  );
}

/* ─────────────────────────────────────────────────────────
   Screen 1 — The arrival
   Black → cream fade. Large serif welcome.
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
        className={`absolute inset-0 bg-black transition-opacity duration-[1500ms] ${
          shown ? "opacity-0" : "opacity-100"
        }`}
      />
      <div className="relative z-10 max-w-md">
        <h1
          className={`font-serif text-[40px] font-medium leading-tight tracking-tight transition-all duration-[1200ms] sm:text-[48px] ${
            shown ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
          style={{ fontFamily: 'ui-serif, "Fraunces", Georgia, serif' }}
        >
          Welcome to{" "}
          <em className="text-[#C89A3F]">The Alchemy of Joy</em>.
        </h1>
        <p
          className={`mt-8 font-sans text-[16px] font-light leading-relaxed text-[#2A2724]/65 transition-all duration-[1200ms] ${
            subtitleShown ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
          This is the doing layer. Where the methodology becomes
          your life.
        </p>
        <button
          onClick={onNext}
          className={`mt-12 rounded-full bg-[#C89A3F] px-7 py-3 font-sans text-[14px] font-semibold text-white transition-all duration-[1500ms] hover:bg-[#A87F2F] ${
            subtitleShown ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
          style={{ transitionDelay: subtitleShown ? "400ms" : "0ms" }}
        >
          I&apos;m here
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Screen 2 — The promise
   ───────────────────────────────────────────────────────── */
function Promise({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-8 text-center animate-fade-in">
      <article className="max-w-lg space-y-6 font-serif text-[20px] leading-[1.7] text-[#2A2724] sm:text-[22px]">
        <p>
          <span className="text-[#C89A3F]">&ldquo;</span>I&apos;m not
          going to give you a tour. I&apos;m going to give you your
          first taste of the work.<span className="text-[#C89A3F]">&rdquo;</span>
        </p>
        <p>
          <span className="text-[#C89A3F]">&ldquo;</span>About four
          minutes. Then you&apos;ll know what this is.
          <span className="text-[#C89A3F]">&rdquo;</span>
        </p>
        <p className="font-sans text-[11px] uppercase tracking-[0.24em] text-[#2A2724]/45">
          — BJF
        </p>
      </article>
      <button
        onClick={onNext}
        className="mt-12 rounded-full bg-[#C89A3F] px-7 py-3 font-sans text-[14px] font-semibold text-white hover:bg-[#A87F2F]"
      >
        Let&apos;s go
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Screen 3 — The first Reset Breath
   Horizon rises 4s, holds 4s, falls 6s. Three cycles. 42 sec.
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
        <div className="max-w-md space-y-6 animate-fade-in">
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-[#C89A3F]">
            Step 1 · The reset
          </p>
          <p className="font-serif text-[24px] leading-snug text-[#2A2724]">
            Breathe with the line.
          </p>
          <p className="font-sans text-[14px] font-light text-[#2A2724]/55">
            Three slow cycles. Forty-two seconds. This is the tool
            you&apos;ll come back to from anywhere in the app — tap the
            ⚡ when you need it.
          </p>
          <button
            onClick={start}
            className="rounded-full bg-[#C89A3F] px-7 py-3 font-sans text-[14px] font-semibold text-white hover:bg-[#A87F2F]"
          >
            Begin
          </button>
        </div>
      ) : !done ? (
        <div className="flex w-full max-w-lg flex-col items-center">
          <p className="mb-12 font-sans text-[11px] uppercase tracking-[0.24em] text-[#C89A3F]">
            Cycle {cycle + 1} of 3 · {phase === "in" ? "Inhale" : phase === "hold" ? "Hold" : "Exhale"}
          </p>
          <div className="relative h-px w-full overflow-visible bg-[#C89A3F]/25">
            <div
              className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-[#C89A3F] transition-all ease-in-out"
              style={{
                left: phase === "in" ? "50%" : phase === "hold" ? "50%" : "50%",
                transform: `translate(-50%, ${
                  phase === "in" ? "calc(-50% - 80px)" : phase === "hold" ? "calc(-50% - 80px)" : "calc(-50% - 0px)"
                })`,
                transitionDuration:
                  phase === "in" ? "4000ms" : phase === "out" ? "6000ms" : "0ms",
              }}
            />
          </div>
          <p className="mt-16 font-serif text-[20px] italic text-[#2A2724]/65">
            {phase === "in"
              ? "Up the line, slowly…"
              : phase === "hold"
                ? "Stay…"
                : "Long way down…"}
          </p>
        </div>
      ) : (
        <div className="max-w-md space-y-6 animate-fade-in text-center">
          <p className="font-serif text-[22px] leading-snug text-[#2A2724]">
            That was a Reset Breath.
          </p>
          <p className="font-sans text-[15px] font-light leading-relaxed text-[#2A2724]/65">
            You can use this anytime, from anywhere in the app —
            the ⚡ is your shortcut, always there.
          </p>
          <button
            onClick={onNext}
            className="rounded-full bg-[#C89A3F] px-7 py-3 font-sans text-[14px] font-semibold text-white hover:bg-[#A87F2F]"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Screen 4 — Four Doors (Cadence Directive §1 — the implicit fourth)
   ───────────────────────────────────────────────────────── */
function ThreeDoors({
  selected,
  onSelect,
}: {
  selected: Door | null;
  onSelect: (door: Door) => void;
}) {
  const doors: {
    id: Door;
    title: string;
    line: string;
    glyph: string;
  }[] = [
    {
      id: "challenge",
      title: "I want the 90-Day Challenge",
      line: "Brent's prescribed sequence — one piece a day, ninety days.",
      glyph: "◯",
    },
    {
      id: "book",
      title: "I'm reading the book",
      line: "You'll read alongside the work.",
      glyph: "❋",
    },
    {
      id: "retreat",
      title: "I came from a retreat",
      line: "Let's keep what you started alive.",
      glyph: "✦",
    },
    {
      id: "explore",
      title: "I'm just exploring",
      line: "Look around. Commit later if you want.",
      glyph: "○",
    },
  ];
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12 animate-fade-in">
      <div className="w-full max-w-xl">
        <p className="text-center font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-[#C89A3F]">
          Step 2 · The path
        </p>
        <p className="mt-3 text-center font-serif text-[26px] leading-snug text-[#2A2724]">
          How are you arriving today?
        </p>
        <p className="mt-3 text-center font-sans text-[13px] font-light text-[#2A2724]/55">
          You can change this any time in Settings.
        </p>
        <ul className="mt-8 space-y-3">
          {doors.map((d) => {
            const active = selected === d.id;
            return (
              <li key={d.id}>
                <button
                  onClick={() => onSelect(d.id)}
                  className={`group flex w-full items-center gap-5 rounded-3xl border bg-white p-5 text-left transition hover:border-[#C89A3F]/50 hover:shadow-sm ${
                    active ? "border-[#C89A3F]" : "border-[#2A2724]/12"
                  }`}
                >
                  <span
                    aria-hidden
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F7F2E9] text-[20px] text-[#C89A3F]"
                  >
                    {d.glyph}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-serif text-[18px] font-medium text-[#2A2724]">
                      {d.title}
                    </span>
                    <span className="mt-0.5 block font-sans text-[13px] font-light text-[#2A2724]/60">
                      {d.line}
                    </span>
                  </span>
                  <span aria-hidden className="text-[#C89A3F] transition group-hover:translate-x-1">
                    →
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
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
      // silent — the entry stays in local state at minimum
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12 animate-fade-in">
      <div className="w-full max-w-xl">
        <p className="text-center font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-[#C89A3F]">
          Step 3 · The List of Joy
        </p>
        <p className="mt-3 text-center font-serif text-[24px] leading-snug text-[#2A2724]">
          Tell me one thing that makes you smile from the inside out.
        </p>
        <p className="mt-3 text-center font-sans text-[14px] font-light text-[#2A2724]/55">
          Could be sunlight on water. Could be your dog.
          Whatever&apos;s true.
        </p>

        <div className="mt-8 rounded-3xl border border-[#2A2724]/12 bg-white p-2 transition focus-within:border-[#C89A3F]/60">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="…"
            autoFocus
            className="w-full resize-none border-0 bg-transparent px-4 py-3 font-serif text-[20px] leading-relaxed text-[#2A2724] outline-none placeholder:text-[#2A2724]/30"
          />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="font-sans text-[12px] text-[#2A2724]/45">
            {entries.length === 0
              ? "Your first entry begins your List of Joy."
              : `${entries.length} ${entries.length === 1 ? "entry" : "entries"} added`}
          </p>
          <button
            onClick={add}
            disabled={!text.trim() || saving}
            className="rounded-full bg-[#C89A3F] px-5 py-2 font-sans text-[13px] font-semibold text-white transition hover:bg-[#A87F2F] disabled:opacity-40"
          >
            {saving ? "…" : "Add"}
          </button>
        </div>

        {entries.length > 0 && (
          <ul className="mt-6 space-y-2">
            {entries.map((e, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-2xl bg-[#F7F2E9] px-4 py-3 font-serif text-[16px] text-[#2A2724] animate-fade-in"
              >
                <span aria-hidden className="text-[#C89A3F]">
                  ✦
                </span>
                {e}
              </li>
            ))}
          </ul>
        )}

        {entries.length > 0 && (
          <div className="mt-8 text-center">
            <p className="font-serif text-[17px] italic text-[#2A2724]/65">
              {entries.length === 1
                ? "You just started your List of Joy. We'll come back to this every day. Forever."
                : "Beautiful. The list is alive."}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={onNext}
                className="rounded-full bg-[#C89A3F] px-6 py-2 font-sans text-[13px] font-semibold text-white hover:bg-[#A87F2F]"
              >
                Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Screen 6 — First Joy Pulse
   ───────────────────────────────────────────────────────── */
function FirstPulse({ onNext }: { onNext: () => void }) {
  const [score, setScore] = useState(5);
  const [logged, setLogged] = useState(false);

  async function log() {
    try {
      await fetch("/api/joy-pulse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score }),
      });
    } catch {
      // silent
    }
    setLogged(true);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12 animate-fade-in">
      <div className="w-full max-w-md text-center">
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-[#C89A3F]">
          Step 4 · The pulse
        </p>
        <p className="mt-3 font-serif text-[24px] leading-snug text-[#2A2724]">
          One more thing. Then we explain how this works.
        </p>
        <p className="mt-3 font-sans text-[14px] font-light text-[#2A2724]/65">
          On a scale of 1–10, how are you feeling right now?
        </p>

        <div className="mt-10 select-none">
          <p className="font-serif text-[88px] font-medium leading-none tabular-nums text-[#2A2724]">
            {score}
          </p>
          <input
            type="range"
            min={1}
            max={10}
            value={score}
            onChange={(e) => setScore(Number(e.target.value))}
            className="mt-6 w-full accent-[#C89A3F]"
            aria-label="Joy Pulse"
          />
          <div className="mt-1 flex justify-between font-sans text-[11px] uppercase tracking-[0.16em] text-[#2A2724]/40">
            <span>Heavy</span>
            <span>Soaring</span>
          </div>
        </div>

        {!logged ? (
          <button
            onClick={log}
            className="mt-10 rounded-full bg-[#C89A3F] px-7 py-3 font-sans text-[14px] font-semibold text-white hover:bg-[#A87F2F]"
          >
            Log it
          </button>
        ) : (
          <div className="mt-10 space-y-5 animate-fade-in">
            <p className="font-serif text-[17px] italic text-[#2A2724]/70">
              Got it. We&apos;ll ask again tomorrow. And the next day.
              So you can see what shifts.
            </p>
            <button
              onClick={onNext}
              className="rounded-full bg-[#C89A3F] px-7 py-3 font-sans text-[14px] font-semibold text-white hover:bg-[#A87F2F]"
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
   Screen 7 — How to use this app
   The "step by step" map the user asked for. Three touchpoints,
   what each does, and what tomorrow looks like.
   ───────────────────────────────────────────────────────── */
function HowToUse({
  onNext,
  door,
}: {
  onNext: () => void;
  door: Door | null;
}) {
  const modeLabel =
    door === "explore"
      ? "Free Mode"
      : door === "retreat"
        ? "Practice Mode"
        : "Challenge Mode";

  return (
    <div className="flex min-h-screen flex-col items-center justify-start px-6 py-10 animate-fade-in">
      <div className="w-full max-w-xl">
        <p className="text-center font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-[#C89A3F]">
          Step 5 · How to use this
        </p>
        <h2 className="mt-3 text-center font-serif text-[28px] leading-tight text-[#2A2724]">
          One screen. One thing at a time.
        </h2>
        <p className="mt-3 text-center font-sans text-[14px] font-light leading-relaxed text-[#2A2724]/65">
          Every day, you open the app and walk a short card arc. The app
          knows what to show you. You don&apos;t have to figure it out.
        </p>

        {/* The three touchpoints */}
        <section className="mt-8 rounded-3xl border border-[#2A2724]/12 bg-white p-5">
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-[#C89A3F]">
            Three buttons. That&apos;s all the navigation.
          </p>
          <ul className="mt-4 space-y-4">
            <li className="flex items-start gap-4">
              <span
                aria-hidden
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#2A2724]/20 bg-white text-[#2A2724]"
              >
                ◐
              </span>
              <div>
                <p className="font-sans text-[14px] font-semibold text-[#2A2724]">
                  Today
                </p>
                <p className="mt-0.5 font-sans text-[13px] font-light text-[#2A2724]/65">
                  Your daily anchor. Tap from anywhere to come back here.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span
                aria-hidden
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#008CB8] text-white shadow-md"
              >
                ⚡
              </span>
              <div>
                <p className="font-sans text-[14px] font-semibold text-[#2A2724]">
                  Reset Breath
                </p>
                <p className="mt-0.5 font-sans text-[13px] font-light text-[#2A2724]/65">
                  60 seconds, any moment. The panic button. The pause.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span
                aria-hidden
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#2A2724]/20 bg-white text-[#2A2724]"
              >
                ≡
              </span>
              <div>
                <p className="font-sans text-[14px] font-semibold text-[#2A2724]">
                  Switchboard
                </p>
                <p className="mt-0.5 font-sans text-[13px] font-light text-[#2A2724]/65">
                  Library, Tools, your Coach, your wins, settings —
                  everything else lives one tap in.
                </p>
              </div>
            </li>
          </ul>
        </section>

        {/* The daily session arc */}
        <section className="mt-6 rounded-3xl border border-[#2A2724]/12 bg-white p-5">
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-[#C89A3F]">
            Your day, in six cards
          </p>
          <p className="mt-2 font-sans text-[13px] font-light text-[#2A2724]/65">
            Each morning the app walks you through:
          </p>
          <ol className="mt-3 space-y-1.5 font-serif text-[15px] leading-relaxed text-[#2A2724]/80">
            <li>1 · A Joy Drop from Brent</li>
            <li>2 · Your daily Joy Pulse</li>
            <li>3 · Today&apos;s prescribed work</li>
            <li>4 · Your morning ritual</li>
            <li>5 · Three from your List of Joy</li>
            <li>6 · A clear close — &ldquo;you can put it down now&rdquo;</li>
          </ol>
          <p className="mt-3 font-sans text-[12px] text-[#2A2724]/55">
            Most days take 10–15 minutes. Rest days take less.
          </p>
        </section>

        {/* The path label */}
        <section className="mt-6 rounded-2xl bg-[#FAF6EC] p-5 text-center">
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a6d00]">
            You&apos;re starting in {modeLabel}
          </p>
          <p className="mt-2 font-serif text-[15px] italic text-[#2A2724]/70">
            {door === "retreat"
              ? "Day-to-day rhythm. Daily rituals plus a quiet suggestion."
              : door === "explore"
                ? "No prescribed sequence. Look around. Start the Challenge whenever."
                : "Day 1 of 90. One small piece a day. The Challenge is patient."}
          </p>
        </section>

        <div className="mt-8 text-center">
          <button
            onClick={onNext}
            className="rounded-full bg-[#C89A3F] px-7 py-3 font-sans text-[14px] font-semibold text-white hover:bg-[#A87F2F]"
          >
            I&apos;m ready
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Screen 8 — Reveal (mode-aware close)
   ───────────────────────────────────────────────────────── */
function Reveal({
  door,
  onFinish,
}: {
  door: Door | null;
  onFinish: () => void;
}) {
  const isChallenge = door === null || door === "challenge" || door === "book";
  const isPractice = door === "retreat";
  const isFree = door === "explore";

  const eyebrow = isChallenge
    ? "Day 1 of 90 begins"
    : isPractice
      ? "Welcome back"
      : "Look around";

  const headline = isChallenge
    ? "You’ve already done four things for yourself in less than five minutes."
    : isPractice
      ? "You already did the install at the retreat. The practice continues."
      : "Take your time. The work is here when you’re ready.";

  const subline = isChallenge
    ? "What you’re about to walk is a 90-day arc. Day by day, week by week. By the end you’ll have laid the foundation for the rest of it."
    : isPractice
      ? "Today’s rhythm: morning SubScript, evening close, a Pulse, a Joy added when it strikes."
      : "Pull anything from the Switchboard. Start the Challenge whenever you want — Settings has the switch.";

  const cta = isChallenge
    ? "Begin Day 1 →"
    : isPractice
      ? "Open Today →"
      : "Take me in →";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12 animate-fade-in">
      <div className="w-full max-w-md text-center">
        <p aria-hidden className="text-[40px] leading-none text-[#C89A3F]">
          ✦
        </p>
        <p className="mt-5 font-sans text-[11px] font-semibold uppercase tracking-[0.26em] text-[#C89A3F]">
          {eyebrow}
        </p>
        <h2 className="mt-3 font-serif text-[28px] font-medium leading-tight text-[#2A2724]">
          {headline}
        </h2>
        <p className="mt-4 font-serif text-[18px] italic text-[#2A2724]/65">
          {subline}
        </p>
        {isChallenge && (
          <p className="mt-2 font-sans text-[13px] uppercase tracking-[0.22em] text-[#C89A3F]">
            Today&apos;s task: take your baseline JQ.
          </p>
        )}
        <button
          onClick={onFinish}
          className="mt-10 rounded-full bg-[#C89A3F] px-8 py-3 font-sans text-[14px] font-semibold text-white hover:bg-[#A87F2F]"
        >
          {cta}
        </button>
        {/* small acknowledgment of free-mode commitment opt-out */}
        {isFree && (
          <p className="mt-4 font-sans text-[11px] text-[#2A2724]/45">
            You can start the Challenge any time from Settings.
          </p>
        )}
      </div>
    </div>
  );
}
