import { query } from "@/lib/db";
import { getCurrentUser, type PublicUser } from "@/lib/auth";
import { isAdminUser } from "@/lib/admin";

/**
 * Three roles. The user-app login is identical; the app diverges by
 * role only at /admin/* (admin) and /coach-portal/* (coach).
 *
 *   user  — default. Assigned to BrentBot (the AI default coach) unless
 *           upgraded to a human coach (users.coach_id != null).
 *   coach — operates a coaching practice within the system. Sees only
 *           assigned clients and only what those clients have shared.
 *   admin — full platform access. Brent. Set via ADMIN_EMAILS env var
 *           or users.is_admin column.
 */

export type Role = "user" | "coach" | "admin";

export interface RolePublicUser extends PublicUser {
  role: Role;
}

/** Server Component helper: resolves the user's effective role. */
export async function getRoleUser(): Promise<RolePublicUser | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  // Admin trumps everything.
  if (await isAdminUser(user)) {
    return { ...user, role: "admin" };
  }

  const rows = await query<{ role: string | null }>(
    `SELECT role FROM users WHERE id = $1`,
    [user.id],
  );
  const dbRole = rows[0]?.role;
  const role: Role =
    dbRole === "coach" || dbRole === "admin" ? (dbRole as Role) : "user";

  return { ...user, role };
}

/** Used by /coach-portal/* layout — returns null if not signed in or not a coach (admins pass through). */
export async function getCoachUser(): Promise<RolePublicUser | null> {
  const u = await getRoleUser();
  if (!u) return null;
  if (u.role === "coach" || u.role === "admin") return u;
  return null;
}
