import Link from "next/link";
import type { PublicUser } from "@/lib/auth";
import JoyMark from "./JoyMark";
import LogoutButton from "./LogoutButton";

export default function SiteHeader({ user }: { user: PublicUser | null }) {
  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-white/75 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-12 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <JoyMark size={19} />
          <span className="text-[15px] font-semibold tracking-tight text-ink">
            Joy Quotient
          </span>
        </Link>
        <nav className="flex items-center gap-6">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-[13px] text-ink-2 transition-colors hover:text-ink"
              >
                Dashboard
              </Link>
              <LogoutButton />
              <Link
                href="/assessment"
                className="rounded-full bg-accent px-4 py-1.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
              >
                New check-in
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-[13px] text-ink-2 transition-colors hover:text-ink"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-accent px-4 py-1.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
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
