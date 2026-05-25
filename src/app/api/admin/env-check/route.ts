import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { isAdminUser } from "@/lib/admin";

/**
 * Diagnostic — reports whether key environment variables landed at
 * runtime on this Vercel deployment. Admin-only. Never returns the
 * actual values, just metadata (presence, length, prefix) so we can
 * tell "the env var didn't land" vs "the env var landed with a typo".
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  if (!(await isAdminUser(user))) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  function describe(name: string) {
    const v = process.env[name];
    if (v === undefined) return { present: false };
    return {
      present: true,
      length: v.length,
      prefix: v.slice(0, 7),
      trimmed_length: v.trim().length,
      has_whitespace: v !== v.trim(),
    };
  }

  return NextResponse.json({
    runtime: {
      vercel_env: process.env.VERCEL_ENV ?? null,
      vercel_url: process.env.VERCEL_URL ?? null,
      vercel_git_commit_sha:
        process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) ?? null,
      vercel_region: process.env.VERCEL_REGION ?? null,
      node_env: process.env.NODE_ENV ?? null,
    },
    keys: {
      ANTHROPIC_API_KEY: describe("ANTHROPIC_API_KEY"),
      DATABASE_URL: describe("DATABASE_URL"),
      VAPID_PUBLIC_KEY: describe("VAPID_PUBLIC_KEY"),
      RESEND_API_KEY: describe("RESEND_API_KEY"),
      TWILIO_ACCOUNT_SID: describe("TWILIO_ACCOUNT_SID"),
    },
  });
}
