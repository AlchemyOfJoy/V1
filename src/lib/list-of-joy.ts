import { query } from "./db";

export interface ListOfJoyItem {
  id: string; // bigint serialized
  user_id: string;
  content: string;
  priority_pillar: string | null;
  sub_pillar: string | null;
  created_at: string | Date;
}

export async function listJoyItems(userId: string): Promise<ListOfJoyItem[]> {
  return query<ListOfJoyItem>(
    `SELECT id, user_id, content, priority_pillar, sub_pillar, created_at
       FROM list_of_joy_items
      WHERE user_id = $1
      ORDER BY created_at DESC`,
    [userId],
  );
}

export async function addJoyItem(
  userId: string,
  content: string,
  pillar?: string | null,
  sub?: string | null,
): Promise<ListOfJoyItem> {
  const rows = await query<ListOfJoyItem>(
    `INSERT INTO list_of_joy_items (user_id, content, priority_pillar, sub_pillar)
     VALUES ($1, $2, $3, $4)
     RETURNING id, user_id, content, priority_pillar, sub_pillar, created_at`,
    [userId, content, pillar ?? null, sub ?? null],
  );
  return rows[0];
}

export async function updateJoyItem(
  userId: string,
  id: string,
  patch: { content?: string; pillar?: string | null; sub?: string | null },
): Promise<ListOfJoyItem | null> {
  const sets: string[] = [];
  const params: unknown[] = [userId, id];
  if (typeof patch.content === "string") {
    sets.push(`content = $${params.length + 1}`);
    params.push(patch.content);
  }
  if (patch.pillar !== undefined) {
    sets.push(`priority_pillar = $${params.length + 1}`);
    params.push(patch.pillar);
  }
  if (patch.sub !== undefined) {
    sets.push(`sub_pillar = $${params.length + 1}`);
    params.push(patch.sub);
  }
  if (sets.length === 0) return null;
  const rows = await query<ListOfJoyItem>(
    `UPDATE list_of_joy_items SET ${sets.join(", ")}
      WHERE user_id = $1 AND id = $2
      RETURNING id, user_id, content, priority_pillar, sub_pillar, created_at`,
    params,
  );
  return rows[0] ?? null;
}

export async function deleteJoyItem(
  userId: string,
  id: string,
): Promise<boolean> {
  const rows = await query<{ id: string }>(
    `DELETE FROM list_of_joy_items WHERE user_id = $1 AND id = $2 RETURNING id`,
    [userId, id],
  );
  return rows.length > 0;
}
