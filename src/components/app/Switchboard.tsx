"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Switchboard bottom sheet (Flow Overhaul Directive §2.3).
 *
 * One sheet, all secondary navigation. Tap any row → enters that
 * Session. Primary action stays on Today; this is for "everything else."
 *
 * Visual: drag handle, calm header, two rule-separated groups
 *   1. Active sessions (Journey, Tools, Coach, Library, Courses)
 *   2. Reflection + settings
 */
export default function Switchboard({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const PRIMARY = [
    {
      href: "/journey",
      label: "Continue your Journey",
      icon: "✿",
      tone: "default" as const,
    },
    {
      href: "/toolkit",
      label: "Open the Tool Kit",
      icon: "⚡",
      tone: "default" as const,
    },
    {
      href: "/library",
      label: "Browse the Library",
      icon: "✦",
      tone: "default" as const,
    },
    {
      href: "/coach",
      label: "Talk to BrentBot",
      icon: "◐",
      tone: "default" as const,
    },
    {
      href: "/courses",
      label: "Your courses",
      icon: "◍",
      tone: "default" as const,
    },
  ];
  const SECONDARY = [
    { href: "/me", label: "Your wins", icon: "✦" },
    { href: "/me/letters", label: "Letters", icon: "✉" },
    { href: "/me/notifications", label: "Notifications", icon: "◈" },
    { href: "/3am", label: "For hard hours", icon: "☾" },
    { href: "/account", label: "Settings", icon: "○" },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Switchboard"
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-end justify-center bg-navy/40 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl animate-fade-in sm:rounded-3xl"
      >
        {/* Drag handle */}
        <div
          aria-hidden
          className="mx-auto h-1 w-10 rounded-full bg-navy/15"
        />

        <header className="mt-5">
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-deep">
            Where to?
          </p>
          <h2 className="mt-1 font-serif text-[22px] font-medium leading-tight text-navy">
            Everything else lives here.
          </h2>
        </header>

        <ul className="mt-5 space-y-1.5">
          {PRIMARY.map((s) => (
            <li key={s.href}>
              <Link
                href={s.href}
                onClick={onClose}
                className="flex items-center gap-4 rounded-2xl border border-navy/10 bg-white px-4 py-3.5 font-serif text-[17px] text-navy transition hover:border-cyan-deep/30 hover:bg-mist/50"
              >
                <span
                  aria-hidden
                  className="text-[18px] text-cyan-deep"
                >
                  {s.icon}
                </span>
                <span className="flex-1">{s.label}</span>
                <span
                  aria-hidden
                  className="text-navy/35 transition group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-5 border-t border-navy/10 pt-5">
          <ul className="space-y-1.5">
            {SECONDARY.map((s) => (
              <li key={s.href}>
                <Link
                  href={s.href}
                  onClick={onClose}
                  className="flex items-center gap-4 rounded-2xl px-4 py-3 font-sans text-[14px] text-navy/75 transition hover:bg-mist/60 hover:text-navy"
                >
                  <span aria-hidden className="text-[16px] text-navy/45">
                    {s.icon}
                  </span>
                  <span>{s.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 block w-full rounded-full py-3 font-sans text-[12px] font-semibold uppercase tracking-[0.18em] text-navy/55 hover:text-navy"
        >
          Close
        </button>
      </div>
    </div>
  );
}
