import { createHash } from "crypto";
import { query } from "./db";
import type { WorksheetData } from "./curriculum";

interface WorksheetRow {
  worksheet_id: string;
  data: WorksheetData;
  completed_at: string | Date | null;
  updated_at: string | Date;
}

/**
 * Practice version coalescing window. Saves within this window of the
 * latest snapshot update the same row instead of creating a new one,
 * so 60 autosaves over the same writing session don't pollute the
 * version timeline.
 */
const COALESCE_MINUTES = 30;

function hashContent(data: WorksheetData): string {
  // Stable JSON — sort keys so equivalent objects produce the same hash.
  return createHash("sha256").update(stableStringify(data)).digest("hex");
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys
    .map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`)
    .join(",")}}`;
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

/** Upsert a partial save. Autosave path — never marks complete.
 *  Does NOT snapshot; autosave fires every ~2s on every keystroke and
 *  the extra version-table writes were the dominant cost. Versioning
 *  is taken on explicit completion via markWorksheetComplete. */
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

/** Mark a worksheet as completed (idempotent — keeps the original time).
 *  Snapshots the current state to the versions table on each completion
 *  so the user has a clean checkpoint they can return to. */
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
  await snapshotCurrentVersion(userId, worksheetId);
}

/** Take an explicit snapshot. Use when the user signals "I want to
 *  remember this state" (e.g. after a guided wizard or before a major
 *  edit). Coalesces per the same 30-minute rule as completion. */
export async function snapshotWorksheet(
  userId: string,
  worksheetId: string,
): Promise<void> {
  await snapshotCurrentVersion(userId, worksheetId);
}

/* ─── version history (Master Prompt §11) ─────────────────────── */

export interface WorksheetVersion {
  id: string;
  worksheet_id: string;
  data: WorksheetData;
  content_hash: string;
  created_at: string | Date;
  updated_at: string | Date;
}

/**
 * Snapshot the current merged state of a worksheet to the versions
 * table, applying coalescing rules:
 *
 *   • No-op if content hash matches the latest version (no real change)
 *   • If latest version is within COALESCE_MINUTES, UPDATE it in place
 *     (so a long writing session produces one version, not 60)
 *   • Otherwise INSERT a new version
 */
async function snapshotCurrentVersion(
  userId: string,
  worksheetId: string,
): Promise<void> {
  const current = await getWorksheetResponse(userId, worksheetId);
  if (!current) return;
  const hash = hashContent(current.data);

  const latest = await query<{
    id: string;
    content_hash: string;
    age_minutes: number;
  }>(
    `SELECT id::text AS id, content_hash,
            EXTRACT(EPOCH FROM (now() - updated_at)) / 60 AS age_minutes
       FROM worksheet_response_versions
       WHERE user_id = $1 AND worksheet_id = $2
       ORDER BY created_at DESC
       LIMIT 1`,
    [userId, worksheetId],
  );

  const latestRow = latest[0];
  if (latestRow && latestRow.content_hash === hash) {
    // No-op — nothing changed since the last snapshot.
    return;
  }
  if (latestRow && latestRow.age_minutes < COALESCE_MINUTES) {
    // Recent edit session — fold this change into the existing snapshot.
    await query(
      `UPDATE worksheet_response_versions
          SET data = $2::jsonb,
              content_hash = $3,
              updated_at = now()
        WHERE id = $1`,
      [latestRow.id, JSON.stringify(current.data), hash],
    );
    return;
  }
  // First snapshot, or it's been a while — record a new version.
  await query(
    `INSERT INTO worksheet_response_versions
       (user_id, worksheet_id, data, content_hash)
       VALUES ($1, $2, $3::jsonb, $4)`,
    [userId, worksheetId, JSON.stringify(current.data), hash],
  );
}

/** List every saved version of a worksheet, newest first. */
export async function listWorksheetVersions(
  userId: string,
  worksheetId: string,
): Promise<WorksheetVersion[]> {
  return query<WorksheetVersion>(
    `SELECT id::text AS id, worksheet_id, data, content_hash,
            created_at, updated_at
       FROM worksheet_response_versions
       WHERE user_id = $1 AND worksheet_id = $2
       ORDER BY created_at DESC`,
    [userId, worksheetId],
  );
}

/** Fetch a single version by id, scoped to the calling user. */
export async function getWorksheetVersion(
  userId: string,
  versionId: string,
): Promise<WorksheetVersion | null> {
  const rows = await query<WorksheetVersion>(
    `SELECT id::text AS id, worksheet_id, data, content_hash,
            created_at, updated_at
       FROM worksheet_response_versions
       WHERE id = $1 AND user_id = $2`,
    [versionId, userId],
  );
  return rows[0] ?? null;
}

/**
 * Restore a prior version as the current response. The act of
 * restoring produces a fresh snapshot — never destructive, the prior
 * states remain in the timeline.
 */
export async function restoreWorksheetVersion(
  userId: string,
  versionId: string,
): Promise<{ worksheetId: string } | null> {
  const version = await getWorksheetVersion(userId, versionId);
  if (!version) return null;
  await query(
    `INSERT INTO worksheet_responses (user_id, worksheet_id, data, updated_at)
     VALUES ($1, $2, $3::jsonb, now())
     ON CONFLICT (user_id, worksheet_id) DO UPDATE
       SET data = EXCLUDED.data,
           updated_at = now()`,
    [userId, version.worksheet_id, JSON.stringify(version.data)],
  );
  // Snapshot the restored state so the timeline shows "restored on X".
  await snapshotCurrentVersion(userId, version.worksheet_id);
  return { worksheetId: version.worksheet_id };
}
