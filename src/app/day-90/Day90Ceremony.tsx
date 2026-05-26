"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * Day 90 Look-Back ceremony — Ascension tier (per Challenge Content
 * Directive §4 and UI/UX Overhaul §9.4).
 *
 * Stages (timings in milliseconds from mount):
 *   0     start — white background
 *   300   fade to Midnight Navy (1.5s)
 *   2000  gold point of light appears
 *   2500  light grows (3s expansion)
 *   5500  resolves to Triple Sparkle ✦
 *   6000  "Ninety days." headline fades in
 *   7500  Brent-voice subline fades in
 *   9500  CTAs appear
 *
 * After the user dismisses, they're routed to /me/wins (the deep
 * Before/After view per UI/UX Overhaul §8.2).
 */
export default function Day90Ceremony() {
  const [stage, setStage] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 300),
      setTimeout(() => setStage(2), 2000),
      setTimeout(() => setStage(3), 5500),
      setTimeout(() => setStage(4), 6500),
      setTimeout(() => setStage(5), 9500),
    ];
    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <main
      className={`fixed inset-0 z-[60] flex flex-col items-center justify-center overflow-y-auto px-6 py-12 text-center transition-colors duration-[1500ms] ${
        stage >= 1 ? "bg-navy" : "bg-white"
      }`}
    >
      <div className="w-full max-w-md">
        {/* The point of light */}
        <div
          aria-hidden
          className={`relative mx-auto mb-10 flex items-center justify-center transition-all duration-[3000ms] ease-out ${
            stage >= 2 ? "h-40 w-40 opacity-100" : "h-1 w-1 opacity-0"
          }`}
        >
          <div
            className="absolute inset-0 rounded-full bg-gold blur-3xl"
            style={{ opacity: stage >= 3 ? 0.45 : 0.7 }}
          />
          <div
            className={`relative font-serif transition-all duration-[1000ms] ${
              stage >= 3
                ? "text-[80px] text-gold opacity-100"
                : "text-[24px] text-gold/0"
            }`}
          >
            ✦
          </div>
        </div>

        <p
          className={`font-sans text-[12px] font-semibold uppercase tracking-[0.32em] text-cyan transition-opacity duration-[1500ms] ${
            stage >= 4 ? "opacity-100" : "opacity-0"
          }`}
        >
          Day 90 · The Look-Back
        </p>

        <h1
          className={`mt-4 font-serif text-[48px] font-medium italic leading-tight text-white transition-opacity duration-[1500ms] sm:text-[64px] ${
            stage >= 4 ? "opacity-100" : "opacity-0"
          }`}
        >
          Ninety <em className="text-cyan">days</em>.
        </h1>

        <article
          className={`mt-8 space-y-5 font-serif text-[17px] italic leading-relaxed text-white/80 transition-opacity duration-[1500ms] ${
            stage >= 5 ? "opacity-100" : "opacity-0"
          }`}
        >
          <p>You did it.</p>
          <p>
            Ninety days of showing up. Ninety days of running the system.
          </p>
          <p>
            Look at who you were ninety days ago. Look at who you are now.
            Don&apos;t move past this too fast.
          </p>
          <p>
            Tomorrow you wake up in Practice Mode. The same daily rhythm.
            The same JOS running.
          </p>
          <p>
            But now the system is part of you. You&apos;re not doing it.
            You&apos;re being it.
          </p>
          <p className="text-white">
            That&apos;s the alchemy. <em className="text-gold">Welcome home.</em>
          </p>
          <p className="font-sans text-[12px] uppercase tracking-[0.22em] not-italic text-white/55">
            — BJF
          </p>
        </article>

        <div
          className={`mt-12 flex flex-col items-stretch gap-3 transition-opacity duration-[1500ms] ${
            stage >= 5 ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <Link
            href="/me/wins"
            className="inline-flex items-center justify-center rounded-full bg-cyan px-8 py-3.5 font-sans text-[10px] font-bold uppercase tracking-[0.22em] text-white hover:bg-white hover:text-navy"
          >
            See the before / after →
          </Link>
          <Link
            href="/home"
            className="inline-flex items-center justify-center rounded-full border border-white/40 px-8 py-3.5 font-sans text-[10px] font-bold uppercase tracking-[0.22em] text-white/80 hover:border-white hover:text-white"
          >
            Take me home
          </Link>
        </div>
      </div>
    </main>
  );
}
