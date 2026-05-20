import Link from "next/link";
import type { PublicUser } from "@/lib/auth";
import LogoutButton from "./LogoutButton";

export default function SiteHeader({ user }: { user: PublicUser | null }) {
  return (
    <header className="border-b border-amber-100 bg-[#fff8ef]/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden>
            ☀️
          </span>
          <span className="text-lg font-bold tracking-tight text-amber-900">
            Joy Quotient
          </span>
        </Link>
        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-amber-900 hover:underline"
              >
                Dashboard
              </Link>
              <Link
                href="/assessment"
                className="rounded-full bg-amber-500 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-amber-600"
              >
                Take assessment
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-amber-900 hover:underline"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-amber-500 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-amber-600"
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
