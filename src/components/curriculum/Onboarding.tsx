"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { btnPrimary } from "@/lib/ui";

interface Step {
  eyebrow: string;
  heading: React.ReactNode;
  body: React.ReactNode;
  cta: string;
}

const STEPS: Step[] = [
  {
    eyebrow: "Welcome",
    heading: (
      <>
        Welcome to your <em className="text-cyan-deep">Alchemy of Joy™</em>{" "}
        Curriculum.
      </>
    ),
    body: (
      <p>You&apos;ve arrived. Slow down — let&apos;s begin.</p>
    ),
    cta: "Continue",
  },
  {
    eyebrow: "What you're stepping into",
    heading: <>This is a transformation — not a checklist.</>,
    body: (
      <>
        <p>
          What you&apos;ll do here is the same work I walk people through at
          the retreats. The reading. The reflection. The writing. The
          recurring measurement.
        </p>
        <p className="mt-4">
          Over time, the small things compound into the kind of joy you
          don&apos;t have to chase. Take it slow. There&apos;s no rush.
        </p>
      </>
    ),
    cta: "Continue",
  },
  {
    eyebrow: "How it works",
    heading: (
      <>
        Read. Reflect. <em className="text-cyan-deep">Write</em>. Return.
      </>
    ),
    body: (
      <>
        <ul className="space-y-3">
          {[
            "Read each section's short reading first.",
            "Reflect — let it land before you respond.",
            "Write — your answers save themselves as you type.",
            "Return — your work waits for you. Always.",
          ].map((s) => (
            <li key={s} className="flex gap-3">
              <span aria-hidden className="text-cyan-deep">
                ✦
              </span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 italic">
          Everything you write here is visible only to you. You can delete it
          any time.
        </p>
      </>
    ),
    cta: "Continue",
  },
  {
    eyebrow: "Begin",
    heading: (
      <>
        Ready when <em className="text-cyan-deep">you</em> are.
      </>
    ),
    body: (
      <p>
        Your first stop is the Science of Joy — five minutes of reading and
        one reflection. From there, your curriculum opens up.
      </p>
    ),
    cta: "Enter the curriculum",
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [i, setI] = useState(0);
  const [busy, setBusy] = useState(false);
  const isLast = i === STEPS.length - 1;
  const step = STEPS[i];

  async function next() {
    if (!isLast) {
      setI((n) => n + 1);
      return;
    }
    setBusy(true);
    try {
      await fetch("/api/curriculum/onboarding/complete", { method: "POST" });
    } catch {
      // Onboarding completion is best-effort; layout will keep redirecting
      // here if it didn't take, but the user can always click Continue again.
    }
    router.push("/curriculum");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl flex-col justify-center px-6 py-16">
      <div key={i} className="animate-fade-in">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
          {step.eyebrow}
        </p>
        <h1 className="mt-4 font-serif text-[34px] font-medium leading-tight tracking-tight text-navy sm:text-[42px]">
          {step.heading}
        </h1>
        <div className="mt-6 space-y-4 font-sans text-[16px] font-light leading-[1.8] text-navy/75">
          {step.body}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={next}
            disabled={busy}
            className={btnPrimary}
          >
            {busy ? "One moment…" : step.cta}
          </button>
          {i > 0 && !isLast && (
            <button
              type="button"
              onClick={() => setI((n) => Math.max(0, n - 1))}
              className="font-sans text-[13px] text-navy/55 transition-colors duration-150 hover:text-cyan-deep"
            >
              ← Back
            </button>
          )}
          {!isLast && (
            <button
              type="button"
              onClick={async () => {
                setBusy(true);
                try {
                  await fetch("/api/curriculum/onboarding/complete", {
                    method: "POST",
                  });
                } catch {
                  // best-effort — layout will keep nudging if it failed
                }
                router.push("/curriculum");
                router.refresh();
              }}
              className="ml-auto font-sans text-[12px] text-navy/45 transition-colors duration-150 hover:text-navy/70"
            >
              Skip intro
            </button>
          )}
        </div>

        <p className="mt-12 font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-navy/35">
          Step {i + 1} of {STEPS.length}
        </p>
      </div>
    </main>
  );
}

