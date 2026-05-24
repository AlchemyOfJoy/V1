import { query } from "./db";

export interface JoyPulseRow {
  id: string;
  user_id: string;
  score: number;
  note: string | null;
  created_at: string | Date;
}

export async function logJoyPulse(
  userId: string,
  score: number,
  note?: string | null,
): Promise<JoyPulseRow> {
  const rows = await query<JoyPulseRow>(
    `INSERT INTO joy_pulse (user_id, score, note)
     VALUES ($1, $2, $3)
     RETURNING id::text AS id, user_id, score, note, created_at`,
    [userId, Math.max(1, Math.min(10, Math.round(score))), note ?? null],
  );
  return rows[0];
}

export async function getTodayPulse(
  userId: string,
): Promise<JoyPulseRow | null> {
  const rows = await query<JoyPulseRow>(
    `SELECT id::text AS id, user_id, score, note, created_at
       FROM joy_pulse
      WHERE user_id = $1
        AND created_at::date = CURRENT_DATE
      ORDER BY created_at DESC
      LIMIT 1`,
    [userId],
  );
  return rows[0] ?? null;
}

export async function recentPulses(
  userId: string,
  limit = 30,
): Promise<JoyPulseRow[]> {
  return query<JoyPulseRow>(
    `SELECT id::text AS id, user_id, score, note, created_at
       FROM joy_pulse
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2`,
    [userId, limit],
  );
}
