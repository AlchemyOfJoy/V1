import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { addJoyItem, listJoyItems } from "@/lib/list-of-joy";
import { awardBadge } from "@/lib/badges";
import { PILLAR_KEYS } from "@/lib/curriculum";
import { query } from "@/lib/db";
import { dispatchEvent } from "@/lib/notifications/dispatch";

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
  const items = await listJoyItems(user.id, Number.POSITIVE_INFINITY);
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
    // Awards — milestone badges, best-effort. Returns the milestone so
    // the client can fire a celebration if one was crossed.
    let milestone: { count: number; label: string } | null = null;
    try {
      const rows = await query<{ c: string }>(
        `SELECT COUNT(*)::text AS c FROM list_of_joy_items WHERE user_id = $1`,
        [user.id],
      );
      const count = Number(rows[0]?.c ?? 0);
      if (count === 1) {
        await awardBadge(user.id, "first_joy");
        milestone = { count, label: "First Joy" };
      } else if (count === 10) {
        await awardBadge(user.id, "joy_10");
        milestone = { count, label: "Ten Joys" };
      } else if (count === 25) {
        await awardBadge(user.id, "joy_25");
        milestone = { count, label: "Twenty-five Joys" };
        // 25-entry threshold = JOS Component 04 (List of Joy) installed.
        const { markComponentInstalled } = await import("@/lib/jos");
        await markComponentInstalled(user.id, "list_of_joy");
      } else if (count === 100) {
        await awardBadge(user.id, "joy_100");
        milestone = { count, label: "One hundred." };
      } else if (count === 500) {
        await awardBadge(user.id, "joy_500");
        milestone = { count, label: "Five hundred." };
      }
    } catch {
      // ignore — badges are decorative
    }
    // Fire an event-driven notification on real milestones — silent if
    // the user has none of push/email/SMS enabled, or the milestone
    // kind is off.
    if (milestone) {
      dispatchEvent(user.id, "milestone", {
        milestoneLabel: milestone.label,
      }).catch((err) => console.error("[notifications/milestone]", err));
    }
    return NextResponse.json({ item, milestone });
  } catch (err) {
    console.error("[list-of-joy] add failed:", err);
    return NextResponse.json(
      { error: "We couldn't add that. Please try again." },
      { status: 500 },
    );
  }
}
