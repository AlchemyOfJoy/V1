import Link from "next/link";
import type { PublicUser } from "@/lib/auth";
import { btnPrimarySm } from "@/lib/ui";
import BrandLogo from "./BrandLogo";
import LogoutButton from "./LogoutButton";

export default function SiteHeader({ user }: { user: PublicUser | null }) {
  return (
    <header className="sticky top-0 z-50 border-b border-navy/10 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3 text-navy">
          <BrandLogo variant="navy" priority className="h-[21px] w-auto" />
          <span className="hidden h-5 w-px bg-navy/15 sm:block" />
          <span className="hidden font-serif text-[17px] font-medium tracking-tight sm:block">
            Joy Quotient
          </span>
        </Link>
        <nav className="flex items-center gap-7">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="font-sans text-[13px] text-navy/70 transition-colors duration-150 hover:text-cyan"
              >
                Dashboard
              </Link>
              <LogoutButton />
              <Link href="/assessment" className={btnPrimarySm}>
                New check-in
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="font-sans text-[13px] text-navy/70 transition-colors duration-150 hover:text-cyan"
              >
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
