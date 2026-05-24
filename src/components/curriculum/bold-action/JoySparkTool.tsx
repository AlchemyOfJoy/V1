"use client";

import { useEffect, useRef, useState } from "react";
import { btnPrimary } from "@/lib/ui";
import EntryLog from "./EntryLog";
import { useLogger, type LoggedEntry } from "./useLogger";

const SLUG = "joy-spark";

type Phase = "ready" | "breathing" | "memory" | "logged";

const BREATH_CYCLES = 3;
const INHALE_MS = 4000;
const EXHALE_MS = 6000;

export default function JoySparkTool({
  initialEntries,
}: {
  initialEntries: LoggedEntry[];
}) {
  const { entries, busy, error, log } = useLogger(SLUG, initialEntries);
  const [phase, setPhase] = useState<Phase>("ready");
  const [cycle, setCycle] = useState(0);
  const [breath, setBreath] = useState<"in" | "hold" | "out">("in");
  const [memory, setMemory] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function start() {
    setPhase("breathing");
    setCycle(0);
    runBreath(0, "in");
  }

  function runBreath(c: number, b: "in" | "hold" | "out") {
    setBreath(b);
    if (b === "in") {
      timer.current = setTimeout(() => runBreath(c, "out"), INHALE_MS);
    } else {
      timer.current = setTimeout(() => {
        const next = c + 1;
        if (next >= BREATH_CYCLES) {
          setPhase("memory");
        } else {
          setCycle(next);
          runBreath(next, "in");
        }
      }, EXHALE_MS);
    }
  }

  async function done() {
    const ok = await log(memory, "Joy Spark");
    if (ok) {
      setPhase("logged");
      setMemory("");
    }
  }

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-navy/10 bg-mist p-10 text-center">
        {phase === "ready" && (
          <>
            <p className="font-sans text-[13px] font-light text-navy/65">
              Three slow cycles of breath. Then one quick memory of joy.
            </p>
            <button onClick={start} className={`${btnPrimary} mt-6`}>
              Begin
            </button>
          </>
        )}

        {phase === "breathing" && (
          <div className="flex flex-col items-center gap-6">
            <div className="relative h-44 w-44">
              <div
                className="absolute inset-0 rounded-full bg-cyan-deep/80 transition-transform ease-in-out"
                style={{
                  transform: breath === "in" ? "scale(1)" : "scale(0.4)",
                  transitionDuration:
                    breath === "in" ? `${INHALE_MS}ms` : `${EXHALE_MS}ms`,
                }}
                aria-hidden
              />
              <div className="absolute inset-0 flex items-center justify-center font-sans text-[18px] font-semibold uppercase tracking-[0.2em] text-white">
                {breath === "in" ? "Inhale" : "Exhale"}
              </div>
            </div>
            <p className="font-sans text-[12px] uppercase tracking-[0.2em] text-cyan-deep">
              Cycle {cycle + 1} of {BREATH_CYCLES}
            </p>
          </div>
        )}

        {phase === "memory" && (
          <div className="space-y-4 text-left">
            <p className="font-serif text-[24px] font-medium text-navy">
              One quick memory of joy.
            </p>
            <p className="font-sans text-[14px] font-light text-navy/65">
              Don&apos;t overthink. Whatever floated up first.
            </p>
            <textarea
              rows={4}
              value={memory}
              onChange={(e) => setMemory(e.target.value)}
              placeholder="The morning light through the kitchen window…"
              className="w-full resize-y rounded-2xl border border-navy/15 bg-white px-5 py-4 font-serif text-[17px] leading-[1.75] text-navy outline-none transition placeholder:font-sans placeholder:text-[15px] placeholder:font-light placeholder:text-navy/40 focus:border-cyan-deep focus:ring-2 focus:ring-cyan-deep/25"
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-sans text-[12px] text-[#8a6d00]">{error}</p>
              <button onClick={done} className={btnPrimary} disabled={busy}>
                {busy ? "…" : "Log it ✦"}
              </button>
            </div>
          </div>
        )}

        {phase === "logged" && (
          <div className="space-y-4">
            <p
              aria-hidden
              className="text-[40px] leading-none text-gold"
            >
              ✦
            </p>
            <p className="font-serif text-[22px] font-medium text-navy">
              Sparked.
            </p>
            <button
              type="button"
              onClick={() => setPhase("ready")}
              className={btnPrimary}
            >
              Spark again
            </button>
          </div>
        )}
      </section>

      <EntryLog entries={entries} />
    </div>
  );
}
