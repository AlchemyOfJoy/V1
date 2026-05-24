import { randomUUID } from "crypto";
import { query } from "@/lib/db";
import type { ContentItem, ContentKind } from "./content-types";

export { CONTENT_KINDS, approxTokens } from "./content-types";
export type { ContentItem, ContentKind } from "./content-types";

interface DbRow {
  id: string;
  kind: ContentKind;
  title: string;
  body: string;
  source: string | null;
  tags: unknown;
  is_active: boolean;
  sort_order: number;
  created_at: string | Date;
  updated_at: string | Date;
}

function normalize(row: DbRow): ContentItem {
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    body: row.body,
    source: row.source,
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    is_active: row.is_active,
    sort_order: row.sort_order,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function listContent(opts: {
  kind?: ContentKind;
  includeInactive?: boolean;
} = {}): Promise<ContentItem[]> {
  const where: string[] = [];
  const params: unknown[] = [];
  if (opts.kind) {
    where.push(`kind = $${params.length + 1}`);
    params.push(opts.kind);
  }
  if (!opts.includeInactive) {
    where.push(`is_active = true`);
  }
  const whereClause = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
  const rows = await query<DbRow>(
    `SELECT id, kind, title, body, source, tags, is_active, sort_order,
            created_at, updated_at
       FROM coach_content
       ${whereClause}
       ORDER BY kind ASC, sort_order ASC, created_at ASC`,
    params,
  );
  return rows.map(normalize);
}

export async function getContent(id: string): Promise<ContentItem | null> {
  const rows = await query<DbRow>(
    `SELECT id, kind, title, body, source, tags, is_active, sort_order,
            created_at, updated_at
       FROM coach_content WHERE id = $1`,
    [id],
  );
  return rows[0] ? normalize(rows[0]) : null;
}

export async function createContent(input: {
  kind: ContentKind;
  title: string;
  body: string;
  source?: string | null;
  tags?: string[];
  sort_order?: number;
}): Promise<ContentItem> {
  const id = randomUUID();
  const rows = await query<DbRow>(
    `INSERT INTO coach_content (id, kind, title, body, source, tags, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7)
     RETURNING id, kind, title, body, source, tags, is_active, sort_order,
               created_at, updated_at`,
    [
      id,
      input.kind,
      input.title,
      input.body,
      input.source ?? null,
      JSON.stringify(input.tags ?? []),
      input.sort_order ?? 100,
    ],
  );
  return normalize(rows[0]);
}

export async function updateContent(
  id: string,
  patch: {
    title?: string;
    body?: string;
    source?: string | null;
    tags?: string[];
    is_active?: boolean;
    sort_order?: number;
  },
): Promise<ContentItem | null> {
  const sets: string[] = [];
  const params: unknown[] = [id];
  if (typeof patch.title === "string") {
    sets.push(`title = $${params.length + 1}`);
    params.push(patch.title);
  }
  if (typeof patch.body === "string") {
    sets.push(`body = $${params.length + 1}`);
    params.push(patch.body);
  }
  if (patch.source !== undefined) {
    sets.push(`source = $${params.length + 1}`);
    params.push(patch.source);
  }
  if (Array.isArray(patch.tags)) {
    sets.push(`tags = $${params.length + 1}::jsonb`);
    params.push(JSON.stringify(patch.tags));
  }
  if (typeof patch.is_active === "boolean") {
    sets.push(`is_active = $${params.length + 1}`);
    params.push(patch.is_active);
  }
  if (typeof patch.sort_order === "number") {
    sets.push(`sort_order = $${params.length + 1}`);
    params.push(patch.sort_order);
  }
  if (sets.length === 0) return getContent(id);
  sets.push(`updated_at = now()`);
  const rows = await query<DbRow>(
    `UPDATE coach_content SET ${sets.join(", ")}
      WHERE id = $1
      RETURNING id, kind, title, body, source, tags, is_active, sort_order,
                created_at, updated_at`,
    params,
  );
  return rows[0] ? normalize(rows[0]) : null;
}

export async function deleteContent(id: string): Promise<boolean> {
  const rows = await query<{ id: string }>(
    `DELETE FROM coach_content WHERE id = $1 RETURNING id`,
    [id],
  );
  return rows.length > 0;
}

/* ----------- Assembly into the cached system prompt block ----------- */

const KIND_INTRO: Record<ContentKind, string> = {
  voice:
    "## Voice samples — passages by Brent\n\nBelow are passages by Brent. Match this voice: the rhythm, the pauses, the moments where he chooses one short sentence after three long ones. The way he can be plain and tender in the same breath. Do not quote these back at the person — absorb them, then write in this voice yourself.",
  principle:
    "## Brent's core principles (in his own words)\n\nThese are bedrock beliefs Brent operates from. Speak from them as your own — not as quotations.",
  qa: "## Real Q&A — how Brent actually responds\n\nBelow are real exchanges. Study the shape: how he reflects before he reframes, how he asks one question instead of giving five answers, how he ends with one small specific next step. These are the strongest possible template for how you should reply.",
  chapter:
    "## Manuscript / book content\n\nFull-text book sections. You may reference content from these accurately, in Brent's voice. Do not invent material that isn't here.",
  transcript:
    "## Retreat / podcast transcripts\n\nLive material — Brent in his element. Use these to deepen your sense of how he moves through a room and how he speaks unscripted.",
  framework_note:
    "## Brent's own framework notes\n\nLayered on top of the built-in therapeutic library — these are Brent's specific adaptations and emphases. When they apply, follow them rather than the generic version.",
};

/**
 * Build the cached system prompt block that contains Brent's curated
 * content. Stable across all users and turns; refreshes only when the
 * content library changes — which is rare.
 *
 * If the library is empty, returns a short note rather than an empty
 * block so the cache key is still stable.
 */
export async function buildContentBlock(): Promise<string> {
  const items = await listContent({ includeInactive: false });
  if (items.length === 0) {
    return "# Brent's content library\n\n(No content uploaded yet — Brent will add his book, transcripts, voice samples, and Q&A as the library grows. For now, lean on the identity and framework blocks above.)";
  }

  const byKind = new Map<ContentKind, ContentItem[]>();
  for (const item of items) {
    const arr = byKind.get(item.kind) ?? [];
    arr.push(item);
    byKind.set(item.kind, arr);
  }

  // Order kinds so voice samples land first (set the tone for what follows)
  const order: ContentKind[] = [
    "voice",
    "principle",
    "qa",
    "framework_note",
    "chapter",
    "transcript",
  ];

  const sections: string[] = [
    "# Brent's content library\n\nThe rest of this block is curated content from Brent — voice samples, principles, real Q&A, manuscript text, transcripts. Treat it as canonical: when his words say one thing and a generic framework says another, his words win.",
  ];

  for (const kind of order) {
    const list = byKind.get(kind);
    if (!list || list.length === 0) continue;
    sections.push(KIND_INTRO[kind]);
    for (const item of list) {
      const header = `### ${item.title}${item.source ? ` _(${item.source})_` : ""}`;
      sections.push(`${header}\n\n${item.body.trim()}`);
    }
  }

  return sections.join("\n\n");
}

