import Link from "next/link";
import type { PublicUser } from "@/lib/auth";
import Monogram from "./Monogram";
import LogoutButton from "./LogoutButton";

export default function SiteHeader({ user }: { user: PublicUser | null }) {
  return (
    <header className="sticky top-0 z-50 border-b border-navy/10 bg-bone/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5 text-navy">
          <Monogram size={22} />
          <span className="font-serif text-[19px] font-medium tracking-tight">
            Joy Quotient
          </span>
        </Link>
        <nav className="flex items-center gap-7">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="font-sans text-[13px] text-navy/70 transition-colors hover:text-cyan"
              >
                Dashboard
              </Link>
              <LogoutButton />
              <Link
                href="/assessment"
                className="rounded-full bg-cyan px-5 py-2 font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-bone transition-all duration-300 hover:-translate-y-0.5 hover:bg-navy"
              >
                New check-in
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="font-sans text-[13px] text-navy/70 transition-colors hover:text-cyan"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-cyan px-5 py-2 font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-bone transition-all duration-300 hover:-translate-y-0.5 hover:bg-navy"
              >
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
