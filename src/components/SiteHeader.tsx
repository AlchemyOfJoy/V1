import Link from "next/link";
import type { PublicUser } from "@/lib/auth";
import { btnPrimarySm } from "@/lib/ui";
import BrandLogo from "./BrandLogo";
import Monogram from "./Monogram";
import LogoutButton from "./LogoutButton";

const navLink =
  "whitespace-nowrap font-sans text-[13px] text-navy/70 transition-colors duration-150 hover:text-cyan-deep";

export default function SiteHeader({ user }: { user: PublicUser | null }) {
  return (
    <header className="sticky top-0 z-50 border-b border-navy/10 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href={user ? "/curriculum" : "/"}
          className="flex items-center gap-2.5 text-navy sm:gap-3"
        >
          {/* Compact monogram on mobile, full wordmark on larger screens */}
          <Monogram variant="navy" className="h-[26px] w-auto sm:hidden" />
          <BrandLogo
            variant="navy"
            priority
            className="hidden h-[21px] w-auto sm:block"
          />
          <span className="hidden h-5 w-px bg-navy/15 sm:block" />
          <span className="hidden font-serif text-[17px] font-medium tracking-tight sm:block">
            Joy Quotient
          </span>
        </Link>
        <nav className="flex items-center gap-4 sm:gap-7">
          {user ? (
            <>
              <Link
                href="/coach"
                className="whitespace-nowrap font-sans text-[13px] font-semibold text-cyan-deep transition-colors duration-150 hover:text-navy"
              >
                ✦ Companion
              </Link>
              {/* Logo goes to /curriculum when signed in; this links the JQ history view */}
              <Link href="/dashboard" className={`hidden sm:inline ${navLink}`}>
                JQ History
              </Link>
              <Link href="/account" className={`hidden sm:inline ${navLink}`}>
                Account
              </Link>
              <LogoutButton />
              <Link href="/assessment" className={btnPrimarySm}>
                New check-in
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className={navLink}>
                Sign in
              </Link>
              <Link href="/signup" className={btnPrimarySm}>
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
