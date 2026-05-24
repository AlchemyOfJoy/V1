import { NextResponse, type NextRequest } from "next/server";

/**
 * Subdomain routing:
 *   coach.brentfreeman.com/*  →  rewrites to /coach-portal/*
 *
 * The user types `coach.brentfreeman.com` but the app serves the
 * `/coach-portal` tree internally. Auth, login, signup, and shared
 * APIs all still work because we only rewrite when not matching them
 * already.
 *
 * Vercel side: add `coach.brentfreeman.com` as a custom domain to the
 * same project as `brentfreeman.com`. Both point at the same
 * deployment; this middleware does the routing in software.
 *
 * Configure subdomains here as needed — `COACH_HOSTS` is a small env
 * override list for staging / preview domains.
 */

const COACH_HOSTS = new Set(
  (process.env.COACH_HOSTS ?? "coach.brentfreeman.com")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
);

// Paths that should NOT be rewritten even on the coach subdomain — they
// need to live at the URL the user typed (login, API, static, etc.).
const PASSTHROUGH_PREFIXES = [
  "/coach-portal", // already pointed there — don't double-prefix
  "/api",
  "/_next",
  "/icon.png",
  "/robots.txt",
  "/sitemap.xml",
  "/opengraph-image",
  "/login",
  "/signup",
];

export function middleware(req: NextRequest) {
  const host = req.headers.get("host")?.toLowerCase() ?? "";
  const isCoachHost = COACH_HOSTS.has(host);
  if (!isCoachHost) return NextResponse.next();

  const { pathname, search } = req.nextUrl;
  if (PASSTHROUGH_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // Rewrite everything else to /coach-portal/<path>
  const url = req.nextUrl.clone();
  url.pathname = pathname === "/" ? "/coach-portal" : `/coach-portal${pathname}`;
  url.search = search;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
