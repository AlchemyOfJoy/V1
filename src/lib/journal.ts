import { query } from "./db";

export interface JournalEntry {
  id: string;
  user_id: string;
  worksheet_id: string | null;
  title: string | null;
  body: string;
  created_at: string | Date;
}

export async function listJournalEntries(
  userId: string,
  worksheetId?: string,
  limit = 50,
): Promise<JournalEntry[]> {
  if (worksheetId) {
    return query<JournalEntry>(
      `SELECT id, user_id, worksheet_id, title, body, created_at
         FROM journal_entries
        WHERE user_id = $1 AND worksheet_id = $2
        ORDER BY created_at DESC
        LIMIT $3`,
      [userId, worksheetId, limit],
    );
  }
  return query<JournalEntry>(
    `SELECT id, user_id, worksheet_id, title, body, created_at
       FROM journal_entries
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2`,
    [userId, limit],
  );
}

export async function addJournalEntry(
  userId: string,
  body: string,
  opts: { worksheetId?: string | null; title?: string | null } = {},
): Promise<JournalEntry> {
  const rows = await query<JournalEntry>(
    `INSERT INTO journal_entries (user_id, worksheet_id, title, body)
     VALUES ($1, $2, $3, $4)
     RETURNING id, user_id, worksheet_id, title, body, created_at`,
    [userId, opts.worksheetId ?? null, opts.title ?? null, body],
  );
  return rows[0];
}

export async function deleteJournalEntry(
  userId: string,
  id: string,
): Promise<boolean> {
  const rows = await query<{ id: string }>(
    `DELETE FROM journal_entries WHERE user_id = $1 AND id = $2 RETURNING id`,
    [userId, id],
  );
  return rows.length > 0;
}
