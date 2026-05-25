"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * The Right Now sheet (Master Prompt §9.3) — opens on long-press of
 * the floating ⚡ button. Six routed interventions for when life is
 * happening and the user needs immediate help.
 *
 * Visual: full-screen Midnight Navy, EB Garamond italic in white,
 * tracked-uppercase Raleway label, cyan glyphs. The brand at its most
 * reverent register.
 *
 * Each option routes to a curated 2-5 minute intervention. Post-
 * intervention check-in surfaces crisis routing if the user reports
 * worse — never platitudes mid-crisis.
 */

const OPTIONS: { glyph: string; label: string; href: string }[] = [
  {
    glyph: "〰",
    label: "to calm down",
    href: "/curriculum/module/04-bold-action/60-second-reset",
  },
  {
    glyph: "◯",
    label: "to feel held",
    href: "/me/my-joy",
  },
  {
    glyph: "✋",
    label: "to release anger",
    href: "/curriculum/module/04-bold-action/60-second-reset",
  },
  {
    glyph: "✦",
    label: "to find some light",
    href: "/me/my-joy",
  },
  {
    glyph: "〇",
    label: "to stop spiraling",
    href: "/curriculum/module/04-bold-action/60-second-reset",
  },
  {
    glyph: "—",
    label: "to think clearly",
    href: "/curriculum/module/02-joyful-operating-system/subscript",
  },
];

export default function RightNowSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Right Now"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-navy px-6 py-12 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="mb-8 font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55 hover:text-white"
        >
          ← Back
        </button>
        <p className="font-serif text-[24px] italic leading-snug text-white">
          Right now, you need&hellip;
        </p>
        <div
          aria-hidden
          className="my-6 h-px w-16 bg-white/20"
        />
        <ul className="space-y-1">
          {OPTIONS.map((o) => (
            <li key={o.label}>
              <Link
                href={o.href}
                onClick={onClose}
                className="group flex items-center gap-5 py-4 transition hover:translate-x-0.5"
              >
                <span
                  aria-hidden
                  className="flex h-8 w-8 shrink-0 items-center justify-center text-[20px] text-cyan"
                >
                  {o.glyph}
                </span>
                <span className="font-serif text-[20px] leading-tight text-white/90 group-hover:text-white">
                  {o.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/curriculum/module/04-bold-action/60-second-reset"
          onClick={onClose}
          className="mt-8 inline-flex items-center justify-center rounded-full border border-cyan px-7 py-3.5 font-sans text-[10px] font-bold uppercase tracking-[0.22em] text-cyan transition duration-150 hover:bg-cyan hover:text-white"
        >
          I just need a breath
        </Link>
      </div>
    </div>
  );
}
