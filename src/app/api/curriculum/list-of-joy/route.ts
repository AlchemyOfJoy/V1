import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { addJoyItem, listJoyItems } from "@/lib/list-of-joy";
import { PILLAR_KEYS } from "@/lib/curriculum";

const PILLAR_IDS = new Set([
  "love",
  "faith",
  "health",
  "family",
  "career",
  "community",
]);
const SUB_IDS = new Set<string>(PILLAR_KEYS);

export async function GET() {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const items = await listJoyItems(user.id);
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body: { content?: unknown; pillar?: unknown; sub?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const content =
    typeof body.content === "string" ? body.content.trim().slice(0, 280) : "";
  if (!content) {
    return NextResponse.json(
      { error: "Add a few words about what brings you joy." },
      { status: 400 },
    );
  }

  const pillar =
    typeof body.pillar === "string" && PILLAR_IDS.has(body.pillar)
      ? body.pillar
      : null;
  const sub =
    typeof body.sub === "string" && SUB_IDS.has(body.sub) ? body.sub : null;

  try {
    const item = await addJoyItem(user.id, content, pillar, sub);
    return NextResponse.json({ item });
  } catch (err) {
    console.error("[list-of-joy] add failed:", err);
    return NextResponse.json(
      { error: "We couldn't add that. Please try again." },
      { status: 500 },
    );
  }
}
