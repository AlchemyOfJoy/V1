import { cookies } from "next/headers";
import { randomBytes, randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { query, UserRow } from "./db";

export const SESSION_COOKIE = "jq_session";
const SESSION_DAYS = 30;

export interface PublicUser {
  id: string;
  email: string;
  name: string | null;
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
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

export async function getCurrentUser(): Promise<PublicUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const sessions = await query<{ user_id: string }>(
      "SELECT user_id FROM sessions WHERE token = $1 AND expires_at > now()",
      [token],
    );
    if (!sessions[0]) return null;

    const user = await getUserById(sessions[0].user_id);
    if (!user) return null;
    return { id: user.id, email: user.email, name: user.name };
  } catch (err) {
    // A database hiccup should degrade to "logged out", not crash the page.
    console.error("[auth] getCurrentUser failed:", (err as Error).message);
    return null;
  }
}

export function isGoogleEnabled(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  );
}
