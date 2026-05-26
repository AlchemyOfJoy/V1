import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  listMemoryStones,
  saveMemoryStone,
  type MemoryStoneTier,
} from "@/lib/memory-stones";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const stones = await listMemoryStones(user.id);
  return NextResponse.json({ stones });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body: {
    tier?: unknown;
    eyebrow?: unknown;
    headline?: unknown;
    subline?: unknown;
    context?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const tier = body.tier === "ascension" ? "ascension" : "bloom";
  const headline = typeof body.headline === "string" ? body.headline.slice(0, 200) : "";
  if (!headline)
    return NextResponse.json({ error: "Missing headline." }, { status: 400 });

  const stone = await saveMemoryStone({
    userId: user.id,
    tier: tier as MemoryStoneTier,
    eyebrow:
      typeof body.eyebrow === "string" ? body.eyebrow.slice(0, 100) : null,
    headline,
    subline:
      typeof body.subline === "string" ? body.subline.slice(0, 400) : null,
    context:
      body.context && typeof body.context === "object"
        ? (body.context as Record<string, unknown>)
        : {},
  });
  return NextResponse.json({ stone });
}
