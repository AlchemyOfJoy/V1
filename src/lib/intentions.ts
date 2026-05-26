import { cache } from "react";
import { query } from "./db";

/**
 * Daily intentions + evening reflections (Synthesis Spec §3).
 *
 * The intention ritual is the entry point every morning. The prompt
 * rotates daily so the user never sees the same one twice in a week.
 * The evening reflection closes the loop on the morning's intention.
 *
 * Both surface in My Work as a scrollable journal over time.
 */

/** The seven rotating intention prompts (§3.1). */
export const INTENTION_PROMPTS: string[] = [
  "What will you create today?",
  "What will you bring to today?",
  "What does today need from you?",
  "Who are you being today?",
  "What's one thing you want to feel by tonight?",
  "Where will you place your attention today?",
  "What's worth your energy today?",
];

/** Stable per-user, per-day prompt picker — no repeats within a week. */
export function promptForToday(userId: string, today = new Date()): string {
  // Deterministic offset per user keeps two users from always seeing the
  // same prompt on the same day. Day-of-year cycles weekly with offset.
  let offset = 0;
  for (const c of userId) offset = (offset + c.charCodeAt(0)) % INTENTION_PROMPTS.length;
  const start = new Date(today.getFullYear(), 0, 0);
  const diffDays = Math.floor(
    (today.getTime() - start.getTime()) / 86_400_000,
  );
  const idx = (diffDays + offset) % INTENTION_PROMPTS.length;
  return INTENTION_PROMPTS[idx];
}

export interface DailyIntention {
  id: string;
  for_date: string | Date;
  prompt: string;
  intention: string;
  evening_reflection: string | null;
  evening_pulse: number | null;
  created_at: string | Date;
  evening_at: string | Date | null;
}

function todayDateString(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Get today's intention row if it exists. Cached per render. */
export const getTodaysIntention = cache(
  async (userId: string): Promise<DailyIntention | null> => {
    const today = todayDateString();
    const rows = await query<DailyIntention>(
      `SELECT id::text AS id, for_date, prompt, intention,
              evening_reflection, evening_pulse, created_at, evening_at
         FROM daily_intentions
         WHERE user_id = $1 AND for_date = $2`,
      [userId, today],
    );
    return rows[0] ?? null;
  },
);

/** Get yesterday's intention (used to surface "how did it go?" prompt). */
export const getYesterdaysIntention = cache(
  async (userId: string): Promise<DailyIntention | null> => {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    const rows = await query<DailyIntention>(
      `SELECT id::text AS id, for_date, prompt, intention,
              evening_reflection, evening_pulse, created_at, evening_at
         FROM daily_intentions
         WHERE user_id = $1 AND for_date = $2`,
      [userId, todayDateString(y)],
    );
    return rows[0] ?? null;
  },
);

/** Save today's intention. Idempotent on (user, date). */
export async function saveIntention(
  userId: string,
  intention: string,
  prompt?: string,
): Promise<void> {
  const today = todayDateString();
  const usedPrompt = prompt ?? promptForToday(userId);
  await query(
    `INSERT INTO daily_intentions (user_id, for_date, prompt, intention)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, for_date)
       DO UPDATE SET intention = EXCLUDED.intention, prompt = EXCLUDED.prompt`,
    [userId, today, usedPrompt, intention.slice(0, 500)],
  );
}

/** Save an evening reflection for a specific date's intention. */
export async function saveEveningReflection(
  userId: string,
  reflection: string,
  forDate?: string,
): Promise<void> {
  const date = forDate ?? todayDateString();
  await query(
    `UPDATE daily_intentions
        SET evening_reflection = $3,
            evening_at = COALESCE(evening_at, now())
      WHERE user_id = $1 AND for_date = $2`,
    [userId, date, reflection.slice(0, 2000)],
  );
}

/** Save an evening Joy Pulse for a specific date's intention. */
export async function saveEveningPulse(
  userId: string,
  pulse: number,
  forDate?: string,
): Promise<void> {
  const date = forDate ?? todayDateString();
  const bounded = Math.max(1, Math.min(10, Math.round(pulse)));
  await query(
    `UPDATE daily_intentions
        SET evening_pulse = $3,
            evening_at = COALESCE(evening_at, now())
      WHERE user_id = $1 AND for_date = $2`,
    [userId, date, bounded],
  );
}

/** Pagination-friendly list of past intentions for the journal view. */
export async function listIntentions(
  userId: string,
  limit = 30,
): Promise<DailyIntention[]> {
  return query<DailyIntention>(
    `SELECT id::text AS id, for_date, prompt, intention,
            evening_reflection, evening_pulse, created_at, evening_at
       FROM daily_intentions
       WHERE user_id = $1
       ORDER BY for_date DESC
       LIMIT $2`,
    [userId, limit],
  );
}
