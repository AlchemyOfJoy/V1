"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * The three-tab navigation per the Master Prompt §5.
 *
 *   TODAY    THE BOOK    MY ALCHEMY
 *
 * No drawer. No hamburger. No fourth tab. The floating ⚡ Reset Breath
 * lives separately (ResetBreathButton component).
 *
 * Visual: EB Garamond labels in tracked uppercase Raleway, sharp
 * (non-rounded) container per brand. Active tab gets the Vibrant Cyan
 * accent. Hidden on auth + sacred routes that run full-bleed.
 */
const TABS = [
  { href: "/home", label: "Today", match: ["/home"] },
  { href: "/book", label: "The Book", match: ["/book", "/curriculum", "/library", "/toolkit", "/journey"] },
  { href: "/me", label: "My Alchemy", match: ["/me", "/account"] },
];

export default function BottomNav() {
  const pathname = usePathname() ?? "/";

  const hidden =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/curriculum/onboarding") ||
    pathname === "/3am";

  if (hidden) return null;

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-slate/15 bg-white/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto grid h-16 max-w-2xl grid-cols-3">
        {TABS.map((t) => {
          const active = t.match.some(
            (p) => pathname === p || pathname.startsWith(p + "/"),
          );
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                className={`flex h-full items-center justify-center font-sans text-[11px] font-semibold uppercase tracking-[0.22em] transition-colors duration-150 ${
                  active ? "text-cyan" : "text-slate hover:text-navy"
                }`}
              >
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
