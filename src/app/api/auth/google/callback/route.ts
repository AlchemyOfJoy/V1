import { NextRequest, NextResponse } from "next/server";
import {
  createSessionToken,
  createUser,
  getUserByEmail,
  getUserByGoogleId,
  isGoogleEnabled,
  linkGoogleId,
  SESSION_COOKIE,
} from "@/lib/auth";

function appOrigin(req: NextRequest): string {
  return process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
}

export async function GET(req: NextRequest) {
  const origin = appOrigin(req);
  const fail = (reason: string) =>
    NextResponse.redirect(new URL(`/login?error=${reason}`, origin));

  if (!isGoogleEnabled()) return fail("google_unavailable");

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const savedState = req.cookies.get("g_oauth_state")?.value;

  if (!code || !state || !savedState || state !== savedState) {
    return fail("google_state");
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${origin}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });
    if (!tokenRes.ok) return fail("google_token");
    const tokens = (await tokenRes.json()) as { access_token?: string };
    if (!tokens.access_token) return fail("google_token");

    const profileRes = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      { headers: { Authorization: `Bearer ${tokens.access_token}` } },
    );
    if (!profileRes.ok) return fail("google_profile");
    const profile = (await profileRes.json()) as {
      id?: string;
      email?: string;
      name?: string;
      verified_email?: boolean;
    };
    if (!profile.id || !profile.email) return fail("google_profile");

    let user = getUserByGoogleId(profile.id);
    if (!user) {
      const existing = getUserByEmail(profile.email);
      if (existing) {
        linkGoogleId(existing.id, profile.id);
        user = existing;
      } else {
        user = createUser({
          email: profile.email,
          name: profile.name ?? null,
          googleId: profile.id,
        });
      }
    }

    const token = createSessionToken(user.id);
    const res = NextResponse.redirect(new URL("/dashboard", origin));
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });
    res.cookies.delete("g_oauth_state");
    return res;
  } catch {
    return fail("google_error");
  }
}
