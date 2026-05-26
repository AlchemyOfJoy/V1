import { cookies } from "next/headers";
import { randomBytes, randomUUID } from "crypto";
import { cache } from "react";
import bcrypt from "bcryptjs";
import { query, UserRow } from "./db";

export const SESSION_COOKIE = "jq_session";
const SESSION_DAYS = 30;

export interface PublicUser {
  id: string;
  email: string;
  name: string | null;
}

/**
 * Async bcrypt so the ~100ms hash work doesn't block the event loop
 * during login. The hash itself doesn't get faster — but the function
 * yields, so co-tenant requests on the same serverless instance can
 * proceed in parallel.
 */
export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createUser(opts: {
  email: string;
  name?: string | null;
  passwordHash?: string | null;
  googleId?: string | null;
}): Promise<UserRow> {
  const id = randomUUID();
  await query(
    `INSERT INTO users (id, email, name, password_hash, google_id)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      id,
      opts.email.toLowerCase(),
      opts.name ?? null,
      opts.passwordHash ?? null,
      opts.googleId ?? null,
    ],
  );
  return (await getUserById(id))!;
}

export async function getUserByEmail(
  email: string,
): Promise<UserRow | undefined> {
  const rows = await query<UserRow>("SELECT * FROM users WHERE email = $1", [
    email.toLowerCase(),
  ]);
  return rows[0];
}

export async function getUserById(id: string): Promise<UserRow | undefined> {
  const rows = await query<UserRow>("SELECT * FROM users WHERE id = $1", [id]);
  return rows[0];
}

export async function getUserByGoogleId(
  googleId: string,
): Promise<UserRow | undefined> {
  const rows = await query<UserRow>(
    "SELECT * FROM users WHERE google_id = $1",
    [googleId],
  );
  return rows[0];
}

export async function linkGoogleId(
  userId: string,
  googleId: string,
): Promise<void> {
  await query("UPDATE users SET google_id = $1 WHERE id = $2", [
    googleId,
    userId,
  ]);
}

export async function createSessionToken(userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  await query(
    `INSERT INTO sessions (token, user_id, expires_at)
     VALUES ($1, $2, now() + ($3 || ' days')::interval)`,
    [token, userId, String(SESSION_DAYS)],
  );
  return token;
}

/** Cookie options — SameSite=None in production so the app also works
 *  embedded in an iframe on another domain. */
function cookieOptions() {
  const prod = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: prod,
    sameSite: (prod ? "none" : "lax") as "none" | "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  };
}

export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, cookieOptions());
}

export { cookieOptions };

export async function clearSession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await query("DELETE FROM sessions WHERE token = $1", [token]);
  }
  store.delete(SESSION_COOKIE);
}

/**
 * Resolve the signed-in user in ONE database round-trip via a JOIN on
 * sessions × users. Wrapped in React `cache` so multiple calls within
 * the same render share a single query.
 */
export const getCurrentUser = cache(
  async (): Promise<PublicUser | null> => {
    const store = await cookies();
    const token = store.get(SESSION_COOKIE)?.value;
    if (!token) return null;

    try {
      const rows = await query<{
        id: string;
        email: string;
        name: string | null;
      }>(
        `SELECT u.id, u.email, u.name
           FROM sessions s
           JOIN users u ON u.id = s.user_id
          WHERE s.token = $1 AND s.expires_at > now()
          LIMIT 1`,
        [token],
      );
      const row = rows[0];
      if (!row) return null;
      return { id: row.id, email: row.email, name: row.name };
    } catch (err) {
      console.error("[auth] getCurrentUser failed:", (err as Error).message);
      return null;
    }
  },
);

export function isGoogleEnabled(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  );
}
