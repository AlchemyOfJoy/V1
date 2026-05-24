"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/home", label: "Home", icon: HomeIcon, match: ["/home"] },
  {
    href: "/journey",
    label: "Journey",
    icon: JourneyIcon,
    match: ["/journey", "/curriculum"],
  },
  { href: "/toolkit", label: "Tool Kit", icon: ToolIcon, match: ["/toolkit"] },
  { href: "/library", label: "Library", icon: BookIcon, match: ["/library"] },
  { href: "/me", label: "Me", icon: MeIcon, match: ["/me", "/dashboard"] },
];

export default function TabBar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-navy/10 bg-white/90 backdrop-blur-xl pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {TABS.map((t) => {
          const active = t.match.some(
            (p) => pathname === p || pathname.startsWith(p + "/"),
          );
          const Icon = t.icon;
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                className={`flex flex-col items-center gap-1 py-2.5 font-sans text-[10px] font-semibold uppercase tracking-[0.12em] transition ${
                  active ? "text-cyan-deep" : "text-navy/55 hover:text-navy"
                }`}
              >
                <Icon active={active} />
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* Desktop side rail variant — shown lg+ inside the AppShell */
export function SideRail() {
  const pathname = usePathname();
  return (
    <aside className="hidden border-r border-navy/10 bg-mist/40 lg:flex lg:w-[200px] lg:flex-col lg:shrink-0">
      <ul className="space-y-1 px-4 py-6">
        {TABS.map((t) => {
          const active = t.match.some(
            (p) => pathname === p || pathname.startsWith(p + "/"),
          );
          const Icon = t.icon;
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 font-sans text-[14px] font-medium transition ${
                  active
                    ? "bg-white text-cyan-deep shadow-sm"
                    : "text-navy/70 hover:bg-white hover:text-cyan-deep"
                }`}
              >
                <Icon active={active} />
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

/* ------ inline icons ------ */
function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 11.5L12 4l9 7.5V20a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1v-8.5z"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.6}
        strokeLinejoin="round"
      />
    </svg>
  );
}
function JourneyIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 18c4 0 4-12 8-12s4 12 8 12"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.6}
        strokeLinecap="round"
      />
      <circle cx="4" cy="18" r="1.6" fill="currentColor" />
      <circle cx="20" cy="18" r="1.6" fill="currentColor" />
    </svg>
  );
}
function ToolIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14 6.5l3.5-3.5 3 3-3.5 3.5M11 9l-7 7v4h4l7-7M11 9l4 4"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.6}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
function BookIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 5a2 2 0 012-2h12v18H6a2 2 0 01-2-2V5zM4 19a2 2 0 012-2h12"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.6}
        strokeLinejoin="round"
      />
    </svg>
  );
}
function MeIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle
        cx="12"
        cy="8"
        r="4"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.6}
      />
      <path
        d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.6}
        strokeLinecap="round"
      />
    </svg>
  );
}
