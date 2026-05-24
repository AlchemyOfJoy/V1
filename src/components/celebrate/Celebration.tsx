"use client";

import { useEffect, useState } from "react";

/**
 * Celebration choreography per §17 of the build spec.
 *
 *   micro     — 1.2s exhale, used for daily small wins (SubScript read, JQ logged)
 *   milestone — 4s bloom + Coach Card, used for crossings (100 joys, first forgiveness)
 *   major     — 8-9s ceremony with constellation, used for JOS install / Day 90
 *
 * Never confetti. Never explosions. Bloom, not snap. Exhale, not gasp.
 */

export type CelebrationSize = "micro" | "milestone" | "major";

interface Props {
  size?: CelebrationSize;
  /** The earned-moment line. One sentence usually best. */
  primary: string;
  /** Optional second beat (after a pause). */
  secondary?: string;
  /** Optional caption at top (e.g. "Day 67"). */
  eyebrow?: string;
  /** Called when the user dismisses or it auto-closes. */
  onComplete: () => void;
  /** Force-show controls. */
  open: boolean;
}

export default function Celebration({
  size = "milestone",
  primary,
  secondary,
  eyebrow,
  onComplete,
  open,
}: Props) {
  const [stage, setStage] = useState<0 | 1 | 2 | 3>(0);

  useEffect(() => {
    if (!open) return;
    setStage(0);
    // Stage timing tuned per size.
    const timings =
      size === "micro"
        ? [200, 600, 1200]
        : size === "milestone"
          ? [400, 1400, 2800]
          : [1200, 3500, 5500];
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setStage(1), timings[0]));
    timers.push(setTimeout(() => setStage(2), timings[1]));
    timers.push(setTimeout(() => setStage(3), timings[2]));
    if (size === "micro") {
      timers.push(setTimeout(() => onComplete(), 1400));
    }
    return () => timers.forEach((t) => clearTimeout(t));
  }, [open, size, onComplete]);

  if (!open) return null;

  const bg =
    size === "major"
      ? "bg-[#1B2545]"
      : size === "milestone"
        ? "bg-gradient-to-b from-[#F7F2E9] via-[#FAF3DC] to-[#F7F2E9]"
        : "bg-[#F7F2E9]/95";

  const text = size === "major" ? "text-[#F7F2E9]" : "text-[#2A2724]";
  const accent = size === "major" ? "text-[#E5C265]" : "text-[#C89A3F]";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed inset-0 z-[60] flex flex-col items-center justify-center px-8 text-center transition-opacity duration-700 ${bg} ${text} ${
        stage > 0 ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* The bloom — gold radial that opens from center */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-all"
        style={{
          background:
            "radial-gradient(circle at center, rgba(200,154,63,0.30) 0%, rgba(200,154,63,0.10) 25%, transparent 60%)",
          transform: stage >= 1 ? "scale(1)" : "scale(0.5)",
          opacity: stage >= 1 ? 1 : 0,
          transitionDuration: size === "major" ? "2000ms" : "1400ms",
        }}
      />

      {/* Sparkle bloom for major */}
      {size === "major" && (
        <Constellation visible={stage >= 2} />
      )}

      <div className="relative z-10 max-w-xl">
        {eyebrow && (
          <p
            className={`font-sans text-[10px] font-semibold uppercase tracking-[0.28em] ${accent} transition-opacity duration-[800ms] ${
              stage >= 1 ? "opacity-100" : "opacity-0"
            }`}
          >
            {eyebrow}
          </p>
        )}
        <div
          aria-hidden
          className={`mx-auto mb-6 mt-2 text-[36px] leading-none transition-all duration-[1200ms] ${accent} ${
            stage >= 1
              ? "scale-100 opacity-100"
              : "scale-75 opacity-0"
          }`}
        >
          ✦
        </div>
        <p
          className={`font-serif font-medium leading-tight transition-all duration-[1000ms] ${
            size === "major"
              ? "text-[34px] sm:text-[42px]"
              : size === "milestone"
                ? "text-[26px] sm:text-[32px]"
                : "text-[20px]"
          } ${
            stage >= 1 ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
          }`}
        >
          {primary}
        </p>
        {secondary && (
          <p
            className={`mx-auto mt-5 max-w-md font-serif italic leading-relaxed transition-all duration-[1000ms] ${
              size === "major" ? "text-[18px] text-[#F7F2E9]/80" : "text-[17px] text-[#2A2724]/70"
            } ${
              stage >= 2 ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
            }`}
          >
            {secondary}
          </p>
        )}

        {size !== "micro" && (
          <button
            onClick={onComplete}
            className={`mt-10 rounded-full px-7 py-3 font-sans text-[14px] font-semibold transition-all duration-[1000ms] ${
              size === "major"
                ? "bg-[#F7F2E9] text-[#1B2545] hover:bg-white"
                : "bg-[#C89A3F] text-white hover:bg-[#A87F2F]"
            } ${
              stage >= 3 ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0 pointer-events-none"
            }`}
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}

function Constellation({ visible }: { visible: boolean }) {
  const positions = [
    { top: "20%", left: "30%", delay: 0 },
    { top: "25%", left: "70%", delay: 200 },
    { top: "60%", left: "20%", delay: 400 },
    { top: "70%", left: "78%", delay: 600 },
    { top: "55%", left: "50%", delay: 800 },
  ];
  return (
    <>
      {positions.map((p, i) => (
        <span
          key={i}
          aria-hidden
          className="pointer-events-none absolute text-[14px] text-[#E5C265] transition-all duration-[1500ms]"
          style={{
            top: p.top,
            left: p.left,
            opacity: visible ? 0.85 : 0,
            transform: visible ? "scale(1)" : "scale(0.3)",
            transitionDelay: `${p.delay}ms`,
          }}
        >
          ✦
        </span>
      ))}
    </>
  );
}
