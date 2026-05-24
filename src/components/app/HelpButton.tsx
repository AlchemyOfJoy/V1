"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

/**
 * The "?" Help layer (Build Directive §8.4).
 *
 * Small icon, top-right of every signed-in screen via SiteHeader.
 * Opens a calm bottom sheet with contextual help for the current route.
 * Routes to Library for deeper reading.
 *
 * Per tone guide: short, calm, never patronizing.
 */

interface HelpEntry {
  title: string;
  body: string;
  more?: { label: string; href: string };
}

const HELP: Array<{ match: RegExp; entry: HelpEntry }> = [
  {
    match: /^\/home/,
    entry: {
      title: "Your daily anchor",
      body: "Home opens to today's task on the 90-Day arc, your Joy Drop, your Joy Pulse, and three from your List of Joy. There's always one clear next step.",
      more: {
        label: "Read about the methodology",
        href: "/journey",
      },
    },
  },
  {
    match: /^\/journey/,
    entry: {
      title: "The methodology, end to end",
      body: "The ITT Framework: Invest in Joy → Train Your Brain (the JOS install) → Take Bold Action → 90-Day Integration. Each section unlocks the next.",
    },
  },
  {
    match: /^\/toolkit/,
    entry: {
      title: "Twenty tools, always ready",
      body: "The Tool Kit is here for the moment, not the curriculum. Use a Reset Breath when activated, a Reframe Ritual when stuck, a Spirit Walk when scattered.",
    },
  },
  {
    match: /^\/library/,
    entry: {
      title: "Everything Brent has said",
      body: "Search the manuscript, the workbook, the quotes library. Save what speaks to you — it shows up on Home and in your own Library tab.",
    },
  },
  {
    match: /^\/me/,
    entry: {
      title: "Your proof of progress",
      body: "Cumulative counters that never reset. Badges, hand-drawn, organized by ITT pillar. Letters from your past self. The 'wins' dashboard — see where you started.",
    },
  },
  {
    match: /^\/curriculum\/90-day-challenge/,
    entry: {
      title: "The spine of the install",
      body: "Each day has one prescribed task — a small piece of the methodology, ~10 minutes. Logged days move you forward; missed days never punish.",
    },
  },
  {
    match: /^\/curriculum\/module\/03-forgiveness/,
    entry: {
      title: "Sacred work",
      body: "Forgiveness is the deepest work in the methodology. The palette shifts, the motion slows. Take your time. This is private to you.",
    },
  },
  {
    match: /^\/coach/,
    entry: {
      title: "BrentBot — and human coaches",
      body: "BrentBot is the AI coach trained on Brent's body of work. If you've been paired with a human coach, you'll see them here too. Conversations are private.",
    },
  },
];

function helpFor(pathname: string): HelpEntry {
  for (const h of HELP) if (h.match.test(pathname)) return h.entry;
  return {
    title: "How this works",
    body: "Every screen has one clear next step. The methodology unfolds at your pace. Your private work stays yours.",
  };
}

export default function HelpButton() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() ?? "/";
  const entry = helpFor(pathname);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Help on this screen"
        className="flex h-7 w-7 items-center justify-center rounded-full border border-navy/15 font-sans text-[12px] font-semibold text-navy/55 transition hover:border-cyan-deep/40 hover:text-cyan-deep"
      >
        ?
      </button>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={entry.title}
          className="fixed inset-0 z-[60] flex items-end justify-center bg-navy/40 backdrop-blur-sm sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-deep">
                  Help
                </p>
                <h2 className="mt-1 font-serif text-[22px] font-medium text-navy">
                  {entry.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="font-sans text-[20px] text-navy/40 hover:text-navy"
              >
                ×
              </button>
            </div>
            <p className="mt-4 font-serif text-[16px] leading-relaxed text-navy/75">
              {entry.body}
            </p>
            {entry.more && (
              <a
                href={entry.more.href}
                onClick={() => setOpen(false)}
                className="mt-5 inline-block rounded-full bg-cyan-deep px-4 py-2 font-sans text-[12px] font-semibold text-white hover:bg-[#006a8c]"
              >
                {entry.more.label} →
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
}
