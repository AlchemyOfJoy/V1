import { query } from "./db";
import type { WorksheetData } from "./curriculum";

interface WorksheetRow {
  worksheet_id: string;
  data: WorksheetData;
  completed_at: string | Date | null;
  updated_at: string | Date;
}

/** Fetch the current saved response for a worksheet (if any). */
export async function getWorksheetResponse(
  userId: string,
  worksheetId: string,
): Promise<WorksheetRow | null> {
  const rows = await query<WorksheetRow>(
    `SELECT worksheet_id, data, completed_at, updated_at
     FROM worksheet_responses
     WHERE user_id = $1 AND worksheet_id = $2`,
    [userId, worksheetId],
  );
  return rows[0] ?? null;
}

/** Upsert a partial save. Autosave path — never marks complete. */
export async function saveWorksheetResponse(
  userId: string,
  worksheetId: string,
  data: WorksheetData,
): Promise<void> {
  // jsonb `||` merges shallowly — partial-field saves don't clobber siblings.
  await query(
    `INSERT INTO worksheet_responses (user_id, worksheet_id, data, updated_at)
     VALUES ($1, $2, $3::jsonb, now())
     ON CONFLICT (user_id, worksheet_id) DO UPDATE
       SET data = worksheet_responses.data || EXCLUDED.data,
           updated_at = now()`,
    [userId, worksheetId, JSON.stringify(data)],
  );
}

/** Mark a worksheet as completed (idempotent — keeps the original time). */
export async function markWorksheetComplete(
  userId: string,
  worksheetId: string,
): Promise<void> {
  await query(
    `UPDATE worksheet_responses
       SET completed_at = COALESCE(completed_at, now())
     WHERE user_id = $1 AND worksheet_id = $2`,
    [userId, worksheetId],
  );
}
