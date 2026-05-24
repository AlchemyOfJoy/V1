import { query } from "./db";

export interface ForgivenessSubject {
  id: string;
  user_id: string;
  subject_name: string;
  victim_rant: string | null;
  empath_rave: string | null;
  universal_meaning: string | null;
  forgiveness_statement: string | null;
  completed_at: string | Date | null;
  created_at: string | Date;
}

export const FORGIVENESS_FIELDS = [
  "victim_rant",
  "empath_rave",
  "universal_meaning",
  "forgiveness_statement",
] as const;

export type ForgivenessField = (typeof FORGIVENESS_FIELDS)[number];

export async function listForgivenessSubjects(
  userId: string,
): Promise<ForgivenessSubject[]> {
  return query<ForgivenessSubject>(
    `SELECT id, user_id, subject_name, victim_rant, empath_rave,
            universal_meaning, forgiveness_statement, completed_at, created_at
       FROM forgiveness_subjects
      WHERE user_id = $1
      ORDER BY created_at DESC`,
    [userId],
  );
}

export async function getForgivenessSubject(
  userId: string,
  id: string,
): Promise<ForgivenessSubject | null> {
  const rows = await query<ForgivenessSubject>(
    `SELECT id, user_id, subject_name, victim_rant, empath_rave,
            universal_meaning, forgiveness_statement, completed_at, created_at
       FROM forgiveness_subjects
      WHERE user_id = $1 AND id = $2`,
    [userId, id],
  );
  return rows[0] ?? null;
}

export async function createForgivenessSubject(
  userId: string,
  subjectName: string,
): Promise<ForgivenessSubject> {
  const rows = await query<ForgivenessSubject>(
    `INSERT INTO forgiveness_subjects (user_id, subject_name)
     VALUES ($1, $2)
     RETURNING id, user_id, subject_name, victim_rant, empath_rave,
               universal_meaning, forgiveness_statement, completed_at, created_at`,
    [userId, subjectName],
  );
  return rows[0];
}

export async function updateForgivenessSubject(
  userId: string,
  id: string,
  patch: Partial<Record<ForgivenessField | "subject_name", string>>,
): Promise<ForgivenessSubject | null> {
  const sets: string[] = [];
  const params: unknown[] = [userId, id];
  for (const [k, v] of Object.entries(patch)) {
    if (
      k !== "subject_name" &&
      !FORGIVENESS_FIELDS.includes(k as ForgivenessField)
    ) {
      continue;
    }
    sets.push(`${k} = $${params.length + 1}`);
    params.push(v);
  }
  if (sets.length === 0) return getForgivenessSubject(userId, id);
  const rows = await query<ForgivenessSubject>(
    `UPDATE forgiveness_subjects SET ${sets.join(", ")}
      WHERE user_id = $1 AND id = $2
      RETURNING id, user_id, subject_name, victim_rant, empath_rave,
                universal_meaning, forgiveness_statement, completed_at, created_at`,
    params,
  );
  return rows[0] ?? null;
}

export async function completeForgivenessSubject(
  userId: string,
  id: string,
): Promise<ForgivenessSubject | null> {
  const rows = await query<ForgivenessSubject>(
    `UPDATE forgiveness_subjects
        SET completed_at = COALESCE(completed_at, now())
      WHERE user_id = $1 AND id = $2
      RETURNING id, user_id, subject_name, victim_rant, empath_rave,
                universal_meaning, forgiveness_statement, completed_at, created_at`,
    [userId, id],
  );
  return rows[0] ?? null;
}

export async function deleteForgivenessSubject(
  userId: string,
  id: string,
): Promise<boolean> {
  const rows = await query<{ id: string }>(
    `DELETE FROM forgiveness_subjects WHERE user_id = $1 AND id = $2 RETURNING id`,
    [userId, id],
  );
  return rows.length > 0;
}
