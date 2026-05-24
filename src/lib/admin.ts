import { query } from "./db";
import { getCurrentUser, type PublicUser } from "./auth";

/**
 * Admin gate: the user is admin if either
 *   (a) their email is listed in the ADMIN_EMAILS env var (comma-separated), or
 *   (b) their `users.is_admin` column is true.
 *
 * The env var is the source of truth on first deploy; the DB flag lets
 * Brent grant admin to additional people from the UI later without a
 * redeploy.
 */

function envAdmins(): Set<string> {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
}

export async function isAdminUser(user: PublicUser): Promise<boolean> {
  if (envAdmins().has(user.email.toLowerCase())) return true;
  const rows = await query<{ is_admin: boolean }>(
    `SELECT is_admin FROM users WHERE id = $1`,
    [user.id],
  );
  return rows[0]?.is_admin === true;
}

/** Used by Server Components — returns null if not signed in or not admin. */
export async function getAdminUser(): Promise<PublicUser | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const admin = await isAdminUser(user);
  return admin ? user : null;
}
