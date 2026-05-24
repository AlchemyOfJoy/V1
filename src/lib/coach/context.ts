import { query } from "@/lib/db";
import {
  WORKSHEET_IDS,
  PRIORITY_PILLARS,
  type CoreNarrativeData,
  type SelfEulogyData,
  type SubscriptData,
} from "@/lib/curriculum";
import { getChallengeStatus } from "@/lib/challenge";

interface SubscriptRow {
  target_date: string | Date | null;
  manifestations: string[];
  affirmations: string[];
  emotion_anchor: string | null;
  version: number;
}

interface JoyItemRow {
  content: string;
  priority_pillar: string | null;
}

interface PillarSnapshotRow {
  taken_at: string | Date;
  [key: string]: unknown;
}

interface ForgivenessRow {
  subject_name: string;
  completed_at: string | Date | null;
}

interface AssessmentRow {
  score: number;
  created_at: string | Date;
  context: string | null;
}

interface JournalRow {
  worksheet_id: string | null;
  body: string;
  created_at: string | Date;
}

interface WorksheetDataRow {
  worksheet_id: string;
  data: unknown;
  completed_at: string | Date | null;
}

function trimTo(s: string | null | undefined, n: number): string {
  if (!s) return "";
  const trimmed = s.trim();
  if (trimmed.length <= n) return trimmed;
  return trimmed.slice(0, n).trimEnd() + "…";
}

/**
 * Build the per-user context block that's injected as the second cache
 * breakpoint. Kept compact and structured so it caches reliably across
 * many turns of the same conversation (any change to the underlying
 * curriculum data invalidates this block and forces a re-cache — that's
 * intentional and rare).
 */
export async function buildUserContext(userId: string): Promise<string> {
  const [
    activeSubscript,
    worksheetRows,
    latestSnapshot,
    joyItems,
    forgiveness,
    latestAssessments,
    challenge,
    recentJournal,
  ] = await Promise.all([
    query<SubscriptRow>(
      `SELECT target_date, manifestations, affirmations, emotion_anchor, version
         FROM subscripts WHERE user_id = $1 AND is_active = true
         ORDER BY version DESC LIMIT 1`,
      [userId],
    ),
    query<WorksheetDataRow>(
      `SELECT worksheet_id, data, completed_at
         FROM worksheet_responses WHERE user_id = $1`,
      [userId],
    ),
    query<PillarSnapshotRow>(
      `SELECT taken_at, love_self, love_romantic, faith_self, faith_universe,
              health_mind, health_body, family_blood, family_chosen,
              career_money, career_giving_back, community_personal,
              community_professional
         FROM priority_pillar_snapshots WHERE user_id = $1
         ORDER BY taken_at DESC LIMIT 1`,
      [userId],
    ),
    query<JoyItemRow>(
      `SELECT content, priority_pillar
         FROM list_of_joy_items WHERE user_id = $1
         ORDER BY created_at DESC LIMIT 15`,
      [userId],
    ),
    query<ForgivenessRow>(
      `SELECT subject_name, completed_at
         FROM forgiveness_subjects WHERE user_id = $1
         ORDER BY created_at DESC LIMIT 8`,
      [userId],
    ),
    query<AssessmentRow>(
      `SELECT score, created_at, context FROM assessments
         WHERE user_id = $1 ORDER BY created_at DESC LIMIT 3`,
      [userId],
    ),
    getChallengeStatus(userId),
    query<JournalRow>(
      `SELECT worksheet_id, body, created_at FROM journal_entries
         WHERE user_id = $1 ORDER BY created_at DESC LIMIT 6`,
      [userId],
    ),
  ]);

  const ws = new Map<string, unknown>();
  for (const r of worksheetRows) ws.set(r.worksheet_id, r.data);

  const core = (ws.get(WORKSHEET_IDS.coreNarrative) ?? {}) as CoreNarrativeData;
  const eulogy = (ws.get(WORKSHEET_IDS.selfEulogy) ?? {}) as SelfEulogyData;
  const subscriptDraft = (ws.get(WORKSHEET_IDS.subscript) ?? {}) as SubscriptData;
  const activeSub = activeSubscript[0];

  const sections: string[] = [];

  // --- JQ trajectory ---
  if (latestAssessments.length > 0) {
    const lines = latestAssessments.map((a) => {
      const d = new Date(a.created_at).toLocaleDateString();
      const band =
        a.score <= 50
          ? "Building"
          : a.score <= 70
            ? "Steady"
            : a.score <= 90
              ? "Thriving"
              : "Radiant";
      return `  • ${d} — score ${a.score} (${band})${a.context && a.context !== "ad_hoc" ? ` · ${a.context}` : ""}`;
    });
    sections.push(
      `## Joy Quotient — last ${latestAssessments.length} check-in${latestAssessments.length === 1 ? "" : "s"}\n${lines.join("\n")}`,
    );
  } else {
    sections.push(
      "## Joy Quotient\nNot yet taken — invite them to take their baseline at /assessment when the moment fits.",
    );
  }

  // --- 90-Day Challenge ---
  if (challenge.started_at) {
    sections.push(
      `## 90-Day Challenge\nDay ${challenge.current_day} of 90 · ${challenge.total_checkins} check-in${challenge.total_checkins === 1 ? "" : "s"} logged.`,
    );
  }

  // --- Active SubScript (the keystone) ---
  if (activeSub) {
    const lines: string[] = [
      `## Active SubScript (v${activeSub.version})`,
    ];
    if (activeSub.target_date) {
      lines.push(
        `Target date: ${new Date(activeSub.target_date).toLocaleDateString()}`,
      );
    }
    if (activeSub.emotion_anchor) {
      lines.push(`\nJoy Spark anchor: "${trimTo(activeSub.emotion_anchor, 400)}"`);
    }
    if (activeSub.manifestations.length > 0) {
      lines.push(
        "\nManifestations:",
        ...activeSub.manifestations.slice(0, 8).map((m) => `  • ${trimTo(m, 200)}`),
      );
    }
    if (activeSub.affirmations.length > 0) {
      lines.push(
        "\nAffirmations:",
        ...activeSub.affirmations.slice(0, 8).map((m) => `  • ${trimTo(m, 200)}`),
      );
    }
    sections.push(lines.join("\n"));
  } else if (subscriptDraft.manifestations || subscriptDraft.affirmations) {
    sections.push(
      "## SubScript\nIn draft — they've started writing but haven't locked it in yet. When relevant, encourage them to finish at /curriculum/module/02-joyful-operating-system/subscript.",
    );
  }

  // --- Core Narrative ---
  const oldN = (core.old_narratives ?? []).filter(Boolean) as string[];
  const newN = (core.new_narratives ?? []).filter(Boolean) as string[];
  if (oldN.length > 0 || newN.length > 0) {
    const lines = ["## Core Narrative"];
    if (oldN.length > 0) {
      lines.push(
        "Old narratives they've named:",
        ...oldN.slice(0, 3).map((s) => `  • ${trimTo(s, 220)}`),
      );
    }
    if (newN.length > 0) {
      lines.push(
        "New (flipped) narratives:",
        ...newN.slice(0, 3).map((s) => `  • ${trimTo(s, 220)}`),
      );
    }
    sections.push(lines.join("\n"));
  }

  // --- Self Eulogy ---
  if (eulogy.eulogy && eulogy.eulogy.trim().length > 0) {
    sections.push(
      `## Self Eulogy (excerpt)\n${trimTo(eulogy.eulogy, 1200)}`,
    );
  }

  // --- Priority Pillars ---
  if (latestSnapshot[0]) {
    const snap = latestSnapshot[0];
    const date = new Date(snap.taken_at).toLocaleDateString();
    const subVals = PRIORITY_PILLARS.flatMap((p) =>
      p.subs.map((s) => {
        const v = snap[s.id] as number | null | undefined;
        return { id: s.id, label: `${p.label} — ${s.label}`, value: v };
      }),
    ).filter((x) => typeof x.value === "number");

    // Surface the 3 lowest sub-pillars — that's where the coach's attention belongs.
    const sorted = [...subVals].sort(
      (a, b) => (a.value as number) - (b.value as number),
    );
    const lowest = sorted.slice(0, 3);
    const highest = sorted.slice(-2).reverse();
    const lines = [
      `## Priority Pillars — snapshot ${date}`,
      "Most depleted right now:",
      ...lowest.map((p) => `  • ${p.label}: ${p.value}/10`),
      "",
      "Strongest right now (reservoirs to draw from):",
      ...highest.map((p) => `  • ${p.label}: ${p.value}/10`),
    ];
    sections.push(lines.join("\n"));
  }

  // --- List of Joy (sample) ---
  if (joyItems.length > 0) {
    const items = joyItems.slice(0, 10).map((j) => {
      const tag = j.priority_pillar ? ` [${j.priority_pillar}]` : "";
      return `  • ${trimTo(j.content, 180)}${tag}`;
    });
    sections.push(
      `## List of Joy — most recent ${items.length}\n${items.join("\n")}`,
    );
  }

  // --- Forgiveness in flight ---
  if (forgiveness.length > 0) {
    const inProgress = forgiveness.filter((f) => !f.completed_at);
    const released = forgiveness.filter((f) => f.completed_at);
    const lines = ["## Forgiveness work"];
    if (released.length > 0) {
      lines.push(`Released: ${released.map((r) => r.subject_name).join(", ")}`);
    }
    if (inProgress.length > 0) {
      lines.push(
        `In progress: ${inProgress.map((r) => r.subject_name).join(", ")}`,
      );
    }
    sections.push(lines.join("\n"));
  }

  // --- Recent journal / bold action activity ---
  if (recentJournal.length > 0) {
    const lines = ["## Recent Bold Action / journal activity"];
    for (const j of recentJournal) {
      const when = new Date(j.created_at).toLocaleDateString();
      const tool = j.worksheet_id?.replace(/^04_/, "").replace(/_/g, "-") ?? "journal";
      lines.push(`  • ${when} [${tool}] ${trimTo(j.body, 220)}`);
    }
    sections.push(lines.join("\n"));
  }

  if (sections.length === 0) {
    return `# This person's curriculum context\n\nThey're just getting started — no worksheets completed yet. Be warm, ask what brought them here today, and (when natural) point them to /curriculum/onboarding or the Joy Quotient assessment at /assessment.`;
  }

  return `# This person's curriculum context\n\nUse this to ground every reply. Refer back to it specifically — never generically. If they have a SubScript, mirror its language. If a Priority Pillar is depleted, notice it. If a Core Narrative shows up in what they say, name it gently. Never recite this back at them — let it inform your questions and reflections.\n\n${sections.join("\n\n")}`;
}
