import Link from "next/link";
import type { PublicUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { btnPrimarySm } from "@/lib/ui";
import BrandLogo from "./BrandLogo";
import Monogram from "./Monogram";
import LogoutButton from "./LogoutButton";
import HelpButton from "./app/HelpButton";

const navLink =
  "whitespace-nowrap font-sans text-[13px] text-navy/70 transition-colors duration-150 hover:text-cyan-deep";

function envAdmins(): Set<string> {
  return new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
}

export default async function SiteHeader({ user }: { user: PublicUser | null }) {
  // One query for both signals — saves a round-trip per signed-in page.
  let admin = false;
  let isCoach = false;
  if (user) {
    admin = envAdmins().has(user.email.toLowerCase());
    try {
      const rows = await query<{
        is_admin: boolean | null;
        role: string | null;
      }>(`SELECT is_admin, role FROM users WHERE id = $1`, [user.id]);
      const row = rows[0];
      if (row?.is_admin === true) admin = true;
      isCoach = row?.role === "coach";
    } catch {
      // best effort
    }
  }
  return (
    <header className="sticky top-0 z-50 border-b border-navy/10 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href={user ? "/home" : "/"}
          className="flex items-center gap-2.5 text-navy sm:gap-3"
        >
          {/* Compact monogram on mobile, full wordmark on larger screens */}
          <Monogram variant="navy" className="h-[26px] w-auto sm:hidden" />
          <BrandLogo
            variant="navy"
            priority
            className="hidden h-[21px] w-auto sm:block"
          />
        </Link>
        <nav className="flex items-center gap-4 sm:gap-7">
          {user ? (
            <>
              <Link
                href="/coach"
                className="whitespace-nowrap font-sans text-[13px] font-semibold text-cyan-deep transition-colors duration-150 hover:text-navy"
              >
                ✦ Your Coach
              </Link>
              {/* Logo goes to /curriculum when signed in; this links the JQ history view */}
              <Link href="/dashboard" className={`hidden sm:inline ${navLink}`}>
                JQ History
              </Link>
              <Link href="/account" className={`hidden sm:inline ${navLink}`}>
                Account
              </Link>
              {(isCoach || admin) && (
                <Link
                  href="/coach-portal"
                  className={`hidden sm:inline ${navLink}`}
                >
                  Coach Portal
                </Link>
              )}
              {admin && (
                <Link
                  href="/admin/coach-content"
                  className={`hidden sm:inline ${navLink}`}
                >
                  Admin
                </Link>
              )}
              <HelpButton />
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
