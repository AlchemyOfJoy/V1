import { query } from "@/lib/db";

/**
 * The trust contract.
 *
 * Default: nothing the user writes is visible to their coach. Sharing is
 * per-item, explicit, and revocable. Even when assigned to a human
 * coach, the user's Forgiveness Vault, Core Narrative drafts, journal
 * entries, and any other private surface remain private unless the user
 * taps "Share with my coach" on that specific item.
 *
 * Resource types are namespaced to make consent unambiguous:
 *   - "worksheet:<worksheet_id>"  (Core Narrative, Self-Eulogy, Pillars, SubScript, etc.)
 *   - "forgiveness:<subject_id>"
 *   - "list_of_joy:<item_id>"
 *   - "journal:<entry_id>"
 *   - "subscript_active"            (the currently-active SubScript, by ID)
 *   - "pillar_snapshot:<id>"
 *   - "jq_history"                  (all assessment scores — no notes)
 *   - "challenge_progress"          (day number + check-in summary, no reflection text)
 */

export type ResourceKind =
  | "worksheet"
  | "forgiveness"
  | "list_of_joy"
  | "journal"
  | "subscript_active"
  | "pillar_snapshot"
  | "jq_history"
  | "challenge_progress";

export interface ShareGrant {
  id: string;
  user_id: string;
  coach_id: string;
  resource_type: string;
  resource_id: string;
  shared_at: string | Date;
  revoked_at: string | Date | null;
}

/** Grant share access. Idempotent — re-grants un-revoke a prior grant. */
export async function shareWithCoach(
  userId: string,
  coachId: string,
  resourceType: ResourceKind,
  resourceId: string,
): Promise<ShareGrant> {
  const rows = await query<ShareGrant>(
    `INSERT INTO shared_items (user_id, coach_id, resource_type, resource_id)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, coach_id, resource_type, resource_id) DO UPDATE
       SET revoked_at = NULL, shared_at = now()
     RETURNING id::text AS id, user_id, coach_id, resource_type, resource_id,
               shared_at, revoked_at`,
    [userId, coachId, resourceType, resourceId],
  );
  return rows[0];
}

/** Revoke a share. The coach immediately loses access on next request. */
export async function revokeShare(
  userId: string,
  coachId: string,
  resourceType: ResourceKind,
  resourceId: string,
): Promise<boolean> {
  const rows = await query<{ id: string }>(
    `UPDATE shared_items SET revoked_at = now()
       WHERE user_id = $1 AND coach_id = $2
         AND resource_type = $3 AND resource_id = $4
         AND revoked_at IS NULL
       RETURNING id::text AS id`,
    [userId, coachId, resourceType, resourceId],
  );
  return rows.length > 0;
}

/** Is a specific item shared with the coach right now? */
export async function isShared(
  userId: string,
  coachId: string,
  resourceType: ResourceKind,
  resourceId: string,
): Promise<boolean> {
  const rows = await query<{ id: string }>(
    `SELECT id::text AS id FROM shared_items
      WHERE user_id = $1 AND coach_id = $2
        AND resource_type = $3 AND resource_id = $4
        AND revoked_at IS NULL`,
    [userId, coachId, resourceType, resourceId],
  );
  return rows.length > 0;
}

/** Everything a coach has been granted, for one client. */
export async function listShared(
  userId: string,
  coachId: string,
): Promise<ShareGrant[]> {
  return query<ShareGrant>(
    `SELECT id::text AS id, user_id, coach_id, resource_type, resource_id,
            shared_at, revoked_at
       FROM shared_items
      WHERE user_id = $1 AND coach_id = $2 AND revoked_at IS NULL
      ORDER BY shared_at DESC`,
    [userId, coachId],
  );
}

/** A user's entire share log (for the "My Shares" page where they audit/revoke). */
export async function listMyShares(userId: string): Promise<ShareGrant[]> {
  return query<ShareGrant>(
    `SELECT id::text AS id, user_id, coach_id, resource_type, resource_id,
            shared_at, revoked_at
       FROM shared_items
      WHERE user_id = $1
      ORDER BY shared_at DESC`,
    [userId],
  );
}

/**
 * Coach-side: pull only what's actively shared for a client across a
 * resource type. Returns the resource ids.
 */
export async function sharedResourceIds(
  coachId: string,
  userId: string,
  resourceType: ResourceKind,
): Promise<string[]> {
  const rows = await query<{ resource_id: string }>(
    `SELECT resource_id FROM shared_items
       WHERE coach_id = $1 AND user_id = $2
         AND resource_type = $3 AND revoked_at IS NULL`,
    [coachId, userId, resourceType],
  );
  return rows.map((r) => r.resource_id);
}
