"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/**
 * "I'm stuck" mode (§8.3).
 *
 * After 60s of no scroll, no click, no keystroke on the wrapped surface,
 * a soft Coach Card slides up: "Stuck? That's okay."
 *
 * Three options:
 *   • Show me a Tool  → /toolkit
 *   • Read me a quote → /library
 *   • I'm just thinking → dismiss with no pressure
 *
 * Per tone guide: never guilt, never urgency. Slides away gently.
 * Once dismissed in a session, doesn't reappear until the user navigates
 * to a fresh route.
 */
export default function StuckPrompt({
  delayMs = 60000,
}: {
  delayMs?: number;
}) {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [enter, setEnter] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (dismissed) return;

    function reset() {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setShow(true), delayMs);
    }
    function onActivity() {
      if (!show) reset();
    }
    reset();
    window.addEventListener("scroll", onActivity, { passive: true });
    window.addEventListener("click", onActivity);
    window.addEventListener("keydown", onActivity);
    window.addEventListener("touchstart", onActivity, { passive: true });
    return () => {
      if (timer.current) clearTimeout(timer.current);
      window.removeEventListener("scroll", onActivity);
      window.removeEventListener("click", onActivity);
      window.removeEventListener("keydown", onActivity);
      window.removeEventListener("touchstart", onActivity);
    };
  }, [delayMs, dismissed, show]);

  useEffect(() => {
    if (show) {
      const t = setTimeout(() => setEnter(true), 30);
      return () => clearTimeout(t);
    }
  }, [show]);

  function dismiss() {
    setEnter(false);
    setTimeout(() => {
      setShow(false);
      setDismissed(true);
    }, 300);
  }

  if (!show) return null;
  return (
    <div
      role="dialog"
      aria-label="A gentle prompt"
      className={`fixed bottom-[calc(80px+env(safe-area-inset-bottom))] left-1/2 z-40 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-3xl border border-navy/10 bg-white p-5 shadow-xl transition duration-500 lg:bottom-8 ${
        enter ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      }`}
    >
      <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-deep">
        A quiet moment
      </p>
      <p className="mt-2 font-serif text-[17px] italic leading-relaxed text-navy/80">
        Stuck? That&apos;s okay. Want me to suggest something?
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/toolkit"
          onClick={dismiss}
          className="rounded-full bg-cyan-deep px-4 py-2 font-sans text-[12px] font-semibold text-white hover:bg-[#006a8c]"
        >
          Show me a Tool
        </Link>
        <Link
          href="/library"
          onClick={dismiss}
          className="rounded-full border border-navy/15 bg-white px-4 py-2 font-sans text-[12px] font-semibold text-navy hover:border-cyan-deep/40"
        >
          Read me a quote
        </Link>
        <button
          type="button"
          onClick={dismiss}
          className="rounded-full px-4 py-2 font-sans text-[12px] text-navy/55 hover:text-navy"
        >
          I&apos;m just thinking
        </button>
      </div>
    </div>
  );
}
