"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Switchboard from "./Switchboard";

/**
 * New three-touchpoint navigation per the Flow Overhaul Directive §2.2.
 *
 *   [Today]   [⚡ Reset Breath]   [≡ Switchboard]
 *
 * The five-tab nav is gone. Browse / Tools / Library / Coach / Me are
 * one tap into the Switchboard. The user's primary anchor is the Daily
 * Session at /home (Today). The ⚡ is the panic-button Reset Breath,
 * accessible from anywhere — opens the 60-second reset tool. The ≡
 * opens the Switchboard bottom sheet.
 *
 * Hidden during Sacred Session and Journey Session by the parent
 * component (those modes show their own focused nav).
 */
export default function BottomNav() {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Hide the bar on sacred/focused routes — Forgiveness Vault, Self-Eulogy
  // deep flows, and the 3am surface, which run full-bleed.
  const hidden =
    pathname.startsWith("/curriculum/module/03-forgiveness") ||
    pathname.startsWith("/3am") ||
    pathname === "/login" ||
    pathname === "/signup";

  // ESC closes the sheet
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (hidden) return null;

  const todayActive = pathname === "/home" || pathname === "/";

  return (
    <>
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-navy/10 bg-white/90 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]"
      >
        <div className="mx-auto grid h-16 max-w-md grid-cols-3 items-center px-6">
          {/* Today — left */}
          <Link
            href="/home"
            aria-label="Today"
            className={`flex flex-col items-center gap-1 font-sans text-[10px] font-semibold uppercase tracking-[0.16em] transition ${
              todayActive ? "text-cyan-deep" : "text-navy/55 hover:text-navy"
            }`}
          >
            <TodayIcon active={todayActive} />
            Today
          </Link>

          {/* ⚡ Reset Breath — center, larger, gold */}
          <button
            type="button"
            onClick={() => router.push("/curriculum/module/04-bold-action/60-second-reset")}
            aria-label="Reset Breath"
            className="mx-auto flex h-12 w-12 -translate-y-3 items-center justify-center rounded-full bg-cyan-deep text-white shadow-lg ring-4 ring-white transition hover:scale-105 hover:bg-[#006a8c]"
          >
            <BoltIcon />
          </button>

          {/* ≡ Switchboard — right */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open switchboard"
            aria-expanded={open}
            className="flex flex-col items-center gap-1 font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-navy/55 transition hover:text-navy"
          >
            <MenuIcon />
            More
          </button>
        </div>
      </nav>

      <Switchboard open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function TodayIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.6}
      />
      <circle cx="12" cy="12" r={active ? 3 : 0} fill="currentColor" />
    </svg>
  );
}
function BoltIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <path d="M13 2L5 14h6l-2 8 8-12h-6l2-8z" fill="white" />
    </svg>
  );
}
function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
      />
    </svg>
  );
}
