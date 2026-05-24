"use client";

import { useEffect, useState } from "react";

/**
 * First-encounter teaching card (§8.2).
 *
 * Renders ONE LINE of coach copy the first time a user reaches a feature.
 * Dismisses with tap. Persists dismissal to users.tutorial_flags so it
 * never reappears for this user — across sessions, across devices.
 *
 * Per tone guide: short, calm, never patronizing. Brent's voice.
 *
 * Usage (in a server component that has already fetched the flag map):
 *   <TeachingMoment flag="first_tool_tap" copy="Tools live here. Use them anytime." alreadySeen={flags.first_tool_tap} />
 *
 * If `alreadySeen` is true, the card never mounts.
 */
export default function TeachingMoment({
  flag,
  copy,
  alreadySeen,
}: {
  flag: string;
  copy: string;
  alreadySeen?: boolean;
}) {
  const [visible, setVisible] = useState(!alreadySeen);
  const [enter, setEnter] = useState(false);

  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => setEnter(true), 30);
      return () => clearTimeout(t);
    }
  }, [visible]);

  function dismiss() {
    setEnter(false);
    setTimeout(() => setVisible(false), 300);
    fetch("/api/me/tutorial-flag", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flag }),
    }).catch(() => {});
  }

  if (!visible) return null;
  return (
    <button
      type="button"
      onClick={dismiss}
      aria-label="Dismiss tip"
      className={`group block w-full rounded-2xl border border-cyan-deep/20 bg-cyan-deep/[0.04] px-4 py-3 text-left transition duration-300 ${
        enter ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
      }`}
    >
      <p className="flex items-start gap-3 font-serif text-[15px] italic leading-relaxed text-navy/75">
        <span aria-hidden className="mt-0.5 text-[12px] text-cyan-deep">
          ✦
        </span>
        <span className="flex-1">{copy}</span>
        <span
          aria-hidden
          className="font-sans text-[11px] uppercase tracking-[0.18em] text-cyan-deep/60 transition group-hover:text-cyan-deep"
        >
          Got it
        </span>
      </p>
    </button>
  );
}
