import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import {
  CONTENT_KINDS,
  createContent,
  listContent,
  type ContentKind,
} from "@/lib/coach/content";

const VALID_KINDS = new Set<string>(CONTENT_KINDS.map((k) => k.id));

export async function GET() {
  const admin = await getAdminUser();
  if (!admin)
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  const items = await listContent({ includeInactive: true });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin)
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  let body: {
    kind?: unknown;
    title?: unknown;
    body?: unknown;
    source?: unknown;
    tags?: unknown;
    sort_order?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (typeof body.kind !== "string" || !VALID_KINDS.has(body.kind)) {
    return NextResponse.json(
      { error: "Pick a content kind." },
      { status: 400 },
    );
  }
  const title =
    typeof body.title === "string" ? body.title.trim().slice(0, 200) : "";
  const text = typeof body.body === "string" ? body.body.trim() : "";
  if (!title)
    return NextResponse.json({ error: "Title required." }, { status: 400 });
  if (!text)
    return NextResponse.json({ error: "Body required." }, { status: 400 });
  if (text.length > 250_000) {
    return NextResponse.json(
      { error: "Body is over 250K characters — split it into multiple pieces." },
      { status: 400 },
    );
  }

  const tags = Array.isArray(body.tags)
    ? (body.tags as unknown[])
        .filter((t): t is string => typeof t === "string")
        .map((t) => t.trim().slice(0, 60))
        .filter(Boolean)
        .slice(0, 20)
    : [];
  const source =
    typeof body.source === "string"
      ? body.source.trim().slice(0, 200) || null
      : null;
  const sortOrder =
    typeof body.sort_order === "number" ? Math.round(body.sort_order) : 100;

  try {
    const item = await createContent({
      kind: body.kind as ContentKind,
      title,
      body: text,
      source,
      tags,
      sort_order: sortOrder,
    });
    return NextResponse.json({ item });
  } catch (err) {
    console.error("[admin/coach-content] create failed:", err);
    return NextResponse.json(
      { error: "We couldn't save that piece." },
      { status: 500 },
    );
  }
}
