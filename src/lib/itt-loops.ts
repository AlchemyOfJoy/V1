import { query } from "./db";

export interface IttLoopRow {
  id: string;
  user_id: string;
  for_date: string;
  intention: string | null;
  thought: string | null;
  action: string | null;
  action_status: "pending" | "yes" | "partial" | "not_yet" | null;
  evening_notes: string | null;
  created_at: string | Date;
  updated_at: string | Date;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getTodayLoop(userId: string): Promise<IttLoopRow | null> {
  const rows = await query<IttLoopRow>(
    `SELECT id::text AS id, user_id, for_date::text AS for_date, intention,
            thought, action, action_status, evening_notes, created_at, updated_at
       FROM itt_loops
      WHERE user_id = $1 AND for_date = $2::date`,
    [userId, todayIso()],
  );
  return rows[0] ?? null;
}

export async function upsertMorning(
  userId: string,
  patch: { intention?: string; thought?: string; action?: string },
): Promise<IttLoopRow> {
  const rows = await query<IttLoopRow>(
    `INSERT INTO itt_loops (user_id, for_date, intention, thought, action)
     VALUES ($1, $2::date, $3, $4, $5)
     ON CONFLICT (user_id, for_date) DO UPDATE
       SET intention = COALESCE(EXCLUDED.intention, itt_loops.intention),
           thought   = COALESCE(EXCLUDED.thought,   itt_loops.thought),
           action    = COALESCE(EXCLUDED.action,    itt_loops.action),
           updated_at = now()
     RETURNING id::text AS id, user_id, for_date::text AS for_date, intention,
               thought, action, action_status, evening_notes, created_at, updated_at`,
    [
      userId,
      todayIso(),
      patch.intention ?? null,
      patch.thought ?? null,
      patch.action ?? null,
    ],
  );
  return rows[0];
}

export async function upsertEvening(
  userId: string,
  patch: {
    action_status?: "yes" | "partial" | "not_yet";
    evening_notes?: string;
  },
): Promise<IttLoopRow> {
  const rows = await query<IttLoopRow>(
    `INSERT INTO itt_loops (user_id, for_date, action_status, evening_notes)
     VALUES ($1, $2::date, $3, $4)
     ON CONFLICT (user_id, for_date) DO UPDATE
       SET action_status = COALESCE(EXCLUDED.action_status, itt_loops.action_status),
           evening_notes = COALESCE(EXCLUDED.evening_notes, itt_loops.evening_notes),
           updated_at = now()
     RETURNING id::text AS id, user_id, for_date::text AS for_date, intention,
               thought, action, action_status, evening_notes, created_at, updated_at`,
    [
      userId,
      todayIso(),
      patch.action_status ?? null,
      patch.evening_notes ?? null,
    ],
  );
  return rows[0];
}

export async function loopCount(userId: string): Promise<number> {
  const rows = await query<{ c: string }>(
    `SELECT COUNT(*)::text AS c FROM itt_loops
        WHERE user_id = $1 AND action_status IS NOT NULL`,
    [userId],
  );
  return Number(rows[0]?.c ?? 0);
}
