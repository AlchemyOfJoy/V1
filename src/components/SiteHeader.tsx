import Link from "next/link";
import type { PublicUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { btnPrimarySm } from "@/lib/ui";
import BrandLogo from "./BrandLogo";
import Monogram from "./Monogram";
import LogoutButton from "./LogoutButton";

const navLink =
  "whitespace-nowrap font-sans text-[13px] text-slate transition-colors duration-150 hover:text-cyan";

function envAdmins(): Set<string> {
  return new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
}

/**
 * Site header — minimal chrome per the UI/UX Overhaul §0 and §12.
 *
 * For signed-in users: just logo + sign out. No /coach link, no
 * /dashboard "JQ History", no Help button — directive forbids all
 * three. Coach Portal + Admin links survive but only for those roles
 * (back-office surfaces, not user-app nav). Account is reachable via
 * My Alchemy → Settings.
 */
export default async function SiteHeader({ user }: { user: PublicUser | null }) {
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
    <header className="sticky top-0 z-50 border-b border-slate/15 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href={user ? "/home" : "/"}
          className="flex items-center gap-2.5 text-navy sm:gap-3"
        >
          <Monogram variant="navy" className="h-[26px] w-auto sm:hidden" />
          <BrandLogo
            variant="navy"
            priority
            className="hidden h-[21px] w-auto sm:block"
          />
        </Link>
        <nav className="flex items-center gap-3 sm:gap-5">
          {user ? (
            <>
              {/* 💬 BrentBot — top-right of every signed-in screen
                  (Synthesis Spec §4.1). Cyan-tinted circle so it reads
                  as "support" not "decoration". */}
              <Link
                href="/coach"
                aria-label="Talk to BrentBot"
                className="group inline-flex h-9 w-9 items-center justify-center rounded-full border border-cyan/40 text-cyan transition hover:bg-cyan hover:text-white"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M4 5h16a1 1 0 011 1v10a1 1 0 01-1 1H8l-4 4V6a1 1 0 011-1z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                </svg>
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
              <LogoutButton />
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
