import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { getChallengeStatus, listCheckins } from "@/lib/challenge";
import { listForgivenessSubjects } from "@/lib/forgiveness";
import { listJoyItems } from "@/lib/list-of-joy";
import { listJournalEntries } from "@/lib/journal";
import { listSnapshots } from "@/lib/pillars";
import type { AssessmentRow } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const [
    assessments,
    worksheets,
    joys,
    pillars,
    forgiveness,
    challenge,
    checkins,
    journal,
    subscripts,
  ] = await Promise.all([
    query<AssessmentRow>(
      `SELECT id, score, answers, note, context, created_at
         FROM assessments WHERE user_id = $1 ORDER BY created_at ASC`,
      [user.id],
    ),
    query(
      `SELECT worksheet_id, data, completed_at, updated_at
         FROM worksheet_responses WHERE user_id = $1`,
      [user.id],
    ),
    listJoyItems(user.id),
    listSnapshots(user.id, 60),
    listForgivenessSubjects(user.id),
    getChallengeStatus(user.id),
    listCheckins(user.id),
    listJournalEntries(user.id, undefined, 1000),
    query(
      `SELECT version, target_date, manifestations, affirmations,
              emotion_anchor, is_active, created_at
         FROM subscripts WHERE user_id = $1 ORDER BY version DESC`,
      [user.id],
    ),
  ]);

  const payload = {
    exported_at: new Date().toISOString(),
    user: { id: user.id, email: user.email, name: user.name },
    assessments,
    worksheets,
    list_of_joy: joys,
    priority_pillar_snapshots: pillars,
    forgiveness_subjects: forgiveness,
    challenge,
    challenge_checkins: checkins,
    subscripts,
    journal_entries: journal,
  };

  const json = JSON.stringify(payload, null, 2);
  return new NextResponse(json, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="alchemy-of-joy-export-${new Date()
        .toISOString()
        .slice(0, 10)}.json"`,
    },
  });
}
