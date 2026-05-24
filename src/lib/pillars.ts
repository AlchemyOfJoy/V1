import { query } from "./db";
import { PILLAR_KEYS, type PriorityPillarKey } from "./curriculum";

export type PillarScores = Partial<Record<PriorityPillarKey, number>>;

export interface PillarSnapshotRow extends PillarScores {
  id: string;
  taken_at: string | Date;
}

export async function saveSnapshot(
  userId: string,
  scores: PillarScores,
): Promise<PillarSnapshotRow> {
  const cols = PILLAR_KEYS.join(", ");
  const placeholders = PILLAR_KEYS.map((_, i) => `$${i + 2}`).join(", ");
  const values = PILLAR_KEYS.map((k) => {
    const v = scores[k];
    return typeof v === "number" && Number.isFinite(v) ? Math.round(v) : null;
  });
  const rows = await query<PillarSnapshotRow>(
    `INSERT INTO priority_pillar_snapshots (user_id, ${cols})
     VALUES ($1, ${placeholders})
     RETURNING id, taken_at, ${cols}`,
    [userId, ...values],
  );
  return rows[0];
}

export async function listSnapshots(
  userId: string,
  limit = 12,
): Promise<PillarSnapshotRow[]> {
  const cols = PILLAR_KEYS.join(", ");
  return query<PillarSnapshotRow>(
    `SELECT id, taken_at, ${cols}
       FROM priority_pillar_snapshots
      WHERE user_id = $1
      ORDER BY taken_at DESC
      LIMIT $2`,
    [userId, limit],
  );
}
