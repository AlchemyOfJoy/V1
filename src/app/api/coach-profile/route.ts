import { NextRequest, NextResponse } from "next/server";
import { getCoachUser } from "@/lib/role";
import { query } from "@/lib/db";
import { getCoachProfile } from "@/lib/coaches";

export async function GET() {
  const coach = await getCoachUser();
  if (!coach)
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  const profile = await getCoachProfile(coach.id);
  return NextResponse.json({ profile });
}

export async function PATCH(req: NextRequest) {
  const coach = await getCoachUser();
  if (!coach)
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  let body: {
    display_name?: unknown;
    bio?: unknown;
    specialties?: unknown;
    intro_video_url?: unknown;
    time_zone?: unknown;
    languages?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const sets: string[] = [];
  const params: unknown[] = [coach.id];
  function add(col: string, val: unknown) {
    sets.push(`${col} = $${params.length + 1}`);
    params.push(val);
  }
  if (typeof body.display_name === "string")
    add("display_name", body.display_name.trim().slice(0, 120));
  if (typeof body.bio === "string") add("bio", body.bio.trim().slice(0, 4000));
  if (Array.isArray(body.specialties)) {
    add(
      "specialties",
      JSON.stringify(
        (body.specialties as unknown[])
          .filter((s): s is string => typeof s === "string")
          .map((s) => s.trim().slice(0, 60))
          .filter(Boolean)
          .slice(0, 12),
      ),
    );
    sets[sets.length - 1] = sets[sets.length - 1] + "::jsonb";
  }
  if (typeof body.intro_video_url === "string") {
    const url = body.intro_video_url.trim();
    if (url && !/^https?:\/\//.test(url)) {
      return NextResponse.json(
        { error: "Intro video URL must start with http(s)." },
        { status: 400 },
      );
    }
    add("intro_video_url", url || null);
  }
  if (typeof body.time_zone === "string")
    add("time_zone", body.time_zone.trim().slice(0, 60));
  if (Array.isArray(body.languages)) {
    add(
      "languages",
      JSON.stringify(
        (body.languages as unknown[])
          .filter((s): s is string => typeof s === "string")
          .map((s) => s.trim().slice(0, 12))
          .filter(Boolean)
          .slice(0, 12),
      ),
    );
    sets[sets.length - 1] = sets[sets.length - 1] + "::jsonb";
  }
  if (sets.length === 0)
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  sets.push(`updated_at = now()`);

  try {
    await query(
      `UPDATE coach_profiles SET ${sets.join(", ")} WHERE user_id = $1`,
      params,
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[coach-profile] update failed:", err);
    return NextResponse.json(
      { error: "Couldn't save your profile." },
      { status: 500 },
    );
  }
}
