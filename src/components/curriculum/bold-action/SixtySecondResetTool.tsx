"use client";

import { useEffect, useRef, useState } from "react";
import { btnPrimary } from "@/lib/ui";
import EntryLog from "./EntryLog";
import { useLogger, type LoggedEntry } from "./useLogger";

const SLUG = "60-second-reset";
const TOTAL_SEC = 60;

const PHASES = [
  { label: "Inhale", ms: 4000 },
  { label: "Hold", ms: 4000 },
  { label: "Exhale", ms: 4000 },
  { label: "Hold", ms: 4000 },
] as const;

export default function SixtySecondResetTool({
  initialEntries,
}: {
  initialEntries: LoggedEntry[];
}) {
  const { entries, busy, error, log } = useLogger(SLUG, initialEntries);
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(TOTAL_SEC);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [done, setDone] = useState(false);
  const [note, setNote] = useState("");
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearInterval(timer.current);
      if (phaseTimer.current) clearInterval(phaseTimer.current);
    };
  }, []);

  function start() {
    setRunning(true);
    setDone(false);
    setRemaining(TOTAL_SEC);
    setPhaseIdx(0);
    timer.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (timer.current) clearInterval(timer.current);
          if (phaseTimer.current) clearInterval(phaseTimer.current);
          setRunning(false);
          setDone(true);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    let i = 0;
    phaseTimer.current = setInterval(() => {
      i = (i + 1) % PHASES.length;
      setPhaseIdx(i);
    }, 4000);
  }

  function stop() {
    if (timer.current) clearInterval(timer.current);
    if (phaseTimer.current) clearInterval(phaseTimer.current);
    setRunning(false);
    setRemaining(TOTAL_SEC);
    setPhaseIdx(0);
  }

  async function logReset() {
    const text = note.trim() || "Box-breathed for 60 seconds.";
    const ok = await log(text, "60-Second Reset");
    if (ok) {
      setDone(false);
      setNote("");
    }
  }

  const phase = PHASES[phaseIdx];
  const scale = phase.label === "Inhale" ? 1 : phase.label === "Exhale" ? 0.45 : undefined;

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-navy/10 bg-mist p-10 text-center">
        <div className="relative mx-auto h-44 w-44">
          <div
            className="absolute inset-0 rounded-2xl bg-cyan-deep/80 transition-transform duration-[4000ms] ease-in-out"
            style={{
              transform:
                scale !== undefined
                  ? `scale(${scale})`
                  : `scale(${phaseIdx === 1 ? 1 : 0.45})`,
            }}
            aria-hidden
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
            <span className="font-sans text-[18px] font-semibold uppercase tracking-[0.2em] text-white">
              {phase.label}
            </span>
            {running && (
              <span className="font-sans text-[13px] font-medium text-white/80">
                {remaining}s
              </span>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-3">
          {!running && !done && (
            <button onClick={start} className={btnPrimary}>
              Start 60s
            </button>
          )}
          {running && (
            <button
              onClick={stop}
              className="rounded-full border border-navy/20 px-5 py-2.5 font-sans text-[13px] font-medium text-navy transition hover:border-cyan-deep hover:text-cyan-deep"
            >
              Stop
            </button>
          )}
          {done && (
            <button onClick={start} className={btnPrimary}>
              Again
            </button>
          )}
        </div>

        {done && (
          <div className="mt-8 space-y-3 text-left">
            <label
              htmlFor="reset-note"
              className="font-sans text-[12px] font-semibold uppercase tracking-[0.16em] text-navy/55"
            >
              How do you feel? (optional)
            </label>
            <textarea
              id="reset-note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Two-line check-in is plenty."
              className="w-full resize-y rounded-2xl border border-navy/15 bg-white px-5 py-3 font-sans text-[15px] leading-relaxed text-navy outline-none transition placeholder:text-navy/35 focus:border-cyan-deep focus:ring-2 focus:ring-cyan-deep/25"
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-sans text-[12px] text-[#8a6d00]">{error}</p>
              <button
                onClick={logReset}
                className={btnPrimary}
                disabled={busy}
              >
                {busy ? "…" : "Log it"}
              </button>
            </div>
          </div>
        )}
      </section>

      <EntryLog entries={entries} />
    </div>
  );
}
