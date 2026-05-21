import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { isGoogleEnabled } from "@/lib/auth";

function appOrigin(req: NextRequest): string {
  return process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
}

export async function GET(req: NextRequest) {
  if (!isGoogleEnabled()) {
    return NextResponse.redirect(
      new URL("/login?error=google_unavailable", appOrigin(req)),
    );
  }

  const state = randomBytes(16).toString("hex");
  const redirectUri = `${appOrigin(req)}/api/auth/google/callback`;

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID!);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("prompt", "select_account");

  const res = NextResponse.redirect(authUrl);
  res.cookies.set("g_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return res;
}
