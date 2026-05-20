import { cookies } from "next/headers";
import { randomBytes, randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { db, UserRow } from "./db";

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

export function createUser(opts: {
  email: string;
  name?: string | null;
  passwordHash?: string | null;
  googleId?: string | null;
}): UserRow {
  const id = randomUUID();
  db.prepare(
    `INSERT INTO users (id, email, name, password_hash, google_id)
     VALUES (?, ?, ?, ?, ?)`,
  ).run(
    id,
    opts.email.toLowerCase(),
    opts.name ?? null,
    opts.passwordHash ?? null,
    opts.googleId ?? null,
  );
  return getUserById(id)!;
}

export function getUserByEmail(email: string): UserRow | undefined {
  return db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(email.toLowerCase()) as UserRow | undefined;
}

export function getUserById(id: string): UserRow | undefined {
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id) as
    | UserRow
    | undefined;
}

export function getUserByGoogleId(googleId: string): UserRow | undefined {
  return db.prepare("SELECT * FROM users WHERE google_id = ?").get(googleId) as
    | UserRow
    | undefined;
}

export function linkGoogleId(userId: string, googleId: string): void {
  db.prepare("UPDATE users SET google_id = ? WHERE id = ?").run(
    googleId,
    userId,
  );
}

export function createSessionToken(userId: string): string {
  const token = randomBytes(32).toString("hex");
  const expiresAt = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  db.prepare(
    "INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)",
  ).run(token, userId, expiresAt);
  return token;
}

export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
  }
  store.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<PublicUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = db
    .prepare("SELECT * FROM sessions WHERE token = ?")
    .get(token) as { user_id: string; expires_at: number } | undefined;

  if (!session) return null;
  if (session.expires_at < Date.now()) {
    db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
    return null;
  }

  const user = getUserById(session.user_id);
  if (!user) return null;
  return { id: user.id, email: user.email, name: user.name };
}

export function isGoogleEnabled(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  );
}
