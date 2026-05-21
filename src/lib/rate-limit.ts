import { query } from "./db";

/**
 * Postgres-backed rate limiter. Counts recent attempts per bucket within a
 * rolling window. Reuses the existing database — no extra service to operate.
 *
 * Fails open: if the database is unreachable, requests are allowed through
 * rather than blocking legitimate users.
 *
 * @returns `true` if the request is within the limit, `false` if throttled.
 */
export async function rateLimit(
  bucket: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  try {
    // Opportunistic cleanup keeps the table small without a cron job.
    if (Math.random() < 0.1) {
      await query(
        "DELETE FROM rate_limits WHERE created_at < now() - interval '1 hour'",
      );
    }

    const rows = await query<{ count: number }>(
      `SELECT count(*)::int AS count FROM rate_limits
       WHERE bucket = $1 AND created_at > now() - ($2 || ' seconds')::interval`,
      [bucket, String(windowSeconds)],
    );
    if ((rows[0]?.count ?? 0) >= limit) return false;

    await query("INSERT INTO rate_limits (bucket) VALUES ($1)", [bucket]);
    return true;
  } catch (err) {
    console.error("[rate-limit] check failed:", (err as Error).message);
    return true;
  }
}

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for). */
export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
