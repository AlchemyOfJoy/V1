import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { JOS_COMPONENTS, markComponentInstalled, type JosComponentId } from "@/lib/jos";

/**
 * Mark a JOS install component complete (JOS-First Architecture §5).
 *
 * Called from each component's completion path:
 *   • JQ Assessment finish    → { component: "jq_baseline" }
 *   • Core Narrative wizard   → { component: "core_narrative" }
 *   • Self-Eulogy wizard      → { component: "self_eulogy" }
 *   • List of Joy seed (25+)  → { component: "list_of_joy" }
 *   • Priority Pillars score  → { component: "priority_pillars" }
 *   • SubScript built         → { component: "subscript" }
 *
 * When the sixth fires, jos_install_completed_at is stamped and Today
 * surfaces the path-choice card on next open.
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body: { component?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const id = body.component;
  const valid = JOS_COMPONENTS.some((c) => c.id === id);
  if (!valid) {
    return NextResponse.json(
      { error: "Unknown component." },
      { status: 400 },
    );
  }
  const result = await markComponentInstalled(user.id, id as JosComponentId);
  return NextResponse.json({ ok: true, ...result });
}
