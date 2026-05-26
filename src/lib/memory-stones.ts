import { query } from "./db";

/**
 * Memory Stones (Master Prompt §13) — replayable celebration tiles.
 *
 * Every Bloom (5-7s, Practice complete / Day complete) and Ascension
 * (12-15s, major arc — Foundation Week, JOS install, Day 30/60/90)
 * is saved as a stone. The user can scroll the row in My Alchemy →
 * The Memories and tap any stone to re-experience that moment.
 *
 * Spark (0.8s) and Glow (2-3s) celebrations are NOT saved as stones
 * — they're transient acknowledgments, not artifacts.
 */

export type MemoryStoneTier = "bloom" | "ascension";

export interface MemoryStone {
  id: string;
  tier: MemoryStoneTier;
  eyebrow: string | null;
  headline: string;
  subline: string | null;
  context: Record<string, unknown>;
  created_at: string | Date;
}

export async function saveMemoryStone(opts: {
  userId: string;
  tier: MemoryStoneTier;
  eyebrow?: string | null;
  headline: string;
  subline?: string | null;
  context?: Record<string, unknown>;
}): Promise<MemoryStone | null> {
  const rows = await query<MemoryStone>(
    `INSERT INTO memory_stones (user_id, tier, eyebrow, headline, subline, context)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb)
       RETURNING id::text AS id, tier, eyebrow, headline, subline, context, created_at`,
    [
      opts.userId,
      opts.tier,
      opts.eyebrow ?? null,
      opts.headline,
      opts.subline ?? null,
      JSON.stringify(opts.context ?? {}),
    ],
  );
  return rows[0] ?? null;
}

export async function listMemoryStones(
  userId: string,
  limit = 50,
): Promise<MemoryStone[]> {
  return query<MemoryStone>(
    `SELECT id::text AS id, tier, eyebrow, headline, subline, context, created_at
       FROM memory_stones
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
    [userId, limit],
  );
}

export async function getMemoryStone(
  userId: string,
  id: string,
): Promise<MemoryStone | null> {
  const rows = await query<MemoryStone>(
    `SELECT id::text AS id, tier, eyebrow, headline, subline, context, created_at
       FROM memory_stones
       WHERE id = $1 AND user_id = $2`,
    [id, userId],
  );
  return rows[0] ?? null;
}
