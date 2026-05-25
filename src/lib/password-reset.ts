import { createHash, randomBytes } from "crypto";
import { query } from "./db";
import { siteUrl } from "./site";

/**
 * Forgot-password flow.
 *
 *   • Tokens are 32 bytes of random data, hex-encoded. The plaintext
 *     goes in the email; only the SHA-256 hash is stored. A leak of
 *     the DB alone can't unlock anyone.
 *   • One-hour expiry, single-use (used_at stamped on first use).
 *   • We never reveal whether an email exists — same response either way.
 *   • Resetting a password invalidates every active session so the
 *     attacker, if any, is logged out everywhere.
 */

const RESET_TTL_MINUTES = 60;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export interface ResetRequest {
  /** The plaintext token to put in the email link. */
  token: string;
  /** The full URL to put in the email. */
  url: string;
}

/**
 * Create a reset token for the user (if one exists). Returns the
 * plaintext token + URL — these MUST only ever leave the server inside
 * the email payload.
 */
export async function createPasswordReset(
  userId: string,
): Promise<ResetRequest> {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  await query(
    `INSERT INTO password_resets (user_id, token_hash, expires_at)
       VALUES ($1, $2, now() + ($3 || ' minutes')::interval)`,
    [userId, tokenHash, String(RESET_TTL_MINUTES)],
  );
  const url = `${siteUrl()}/reset-password?token=${encodeURIComponent(token)}`;
  return { token, url };
}

/** Resolve a plaintext token to its user, validating expiry + single-use. */
export async function consumePasswordReset(
  token: string,
): Promise<{ userId: string } | null> {
  if (!token || token.length < 16) return null;
  const tokenHash = hashToken(token);
  const rows = await query<{ id: string; user_id: string }>(
    `SELECT id::text AS id, user_id FROM password_resets
       WHERE token_hash = $1
         AND used_at IS NULL
         AND expires_at > now()
       LIMIT 1`,
    [tokenHash],
  );
  const row = rows[0];
  if (!row) return null;
  await query(
    `UPDATE password_resets SET used_at = now() WHERE id = $1`,
    [row.id],
  );
  return { userId: row.user_id };
}

/** Look up by token without consuming — used by the reset page to
 *  validate the link is still good before rendering the form. */
export async function lookupResetToken(
  token: string,
): Promise<{ userId: string } | null> {
  if (!token || token.length < 16) return null;
  const tokenHash = hashToken(token);
  const rows = await query<{ user_id: string }>(
    `SELECT user_id FROM password_resets
       WHERE token_hash = $1
         AND used_at IS NULL
         AND expires_at > now()
       LIMIT 1`,
    [tokenHash],
  );
  return rows[0] ? { userId: rows[0].user_id } : null;
}
