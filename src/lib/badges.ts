import { query } from "./db";

export type BadgePillar =
  | "invest"
  | "train"
  | "action"
  | "foundational";

export interface BadgeDef {
  id: string;
  pillar: BadgePillar;
  title: string;
  description: string;
  icon: string; // unicode glyph fallback for now
}

/**
 * All badges the app can award. Brent will replace `icon` with
 * hand-drawn SVGs later; for now we use unicode glyphs that match the
 * brand's quiet feel.
 */
export const BADGES: BadgeDef[] = [
  // Invest in Joy
  { id: "first_joy", pillar: "invest", title: "First Joy", description: "Added your first item to the List of Joy.", icon: "✦" },
  { id: "joy_10", pillar: "invest", title: "Ten Joys", description: "Your list crossed ten.", icon: "✦" },
  { id: "joy_25", pillar: "invest", title: "Twenty-five Joys", description: "Your list crossed twenty-five.", icon: "✦" },
  { id: "joy_100", pillar: "invest", title: "One Hundred Joys", description: "Your list crossed one hundred.", icon: "✶" },
  { id: "joy_500", pillar: "invest", title: "Five Hundred Joys", description: "Five hundred. Notice the life you've built.", icon: "❋" },
  { id: "jq_baseline", pillar: "invest", title: "JQ Baseline", description: "You took your first Joy Quotient.", icon: "◆" },
  { id: "jq_rise", pillar: "invest", title: "JQ Rise", description: "Your JQ went up from a previous check-in.", icon: "▲" },
  // Train Your Brain
  { id: "core_narrative_first", pillar: "train", title: "Story Rewritten", description: "First Core Narrative rewrite.", icon: "○" },
  { id: "self_eulogy_written", pillar: "train", title: "Eulogy Written", description: "You wrote your Self-Eulogy.", icon: "◯" },
  { id: "pillars_first_snap", pillar: "train", title: "First Snapshot", description: "Your first Priority Pillars snapshot.", icon: "◐" },
  { id: "subscript_v1", pillar: "train", title: "SubScript Installed", description: "Your SubScript is locked in.", icon: "◉" },
  { id: "subscript_7", pillar: "train", title: "Seven Days", description: "Seven days of SubScript reads.", icon: "❖" },
  { id: "subscript_30", pillar: "train", title: "Thirty Days", description: "Thirty days of SubScript reads.", icon: "❖" },
  { id: "subscript_90", pillar: "train", title: "Ninety Days", description: "Ninety days. The install is real.", icon: "❖" },
  { id: "forgiveness_first", pillar: "train", title: "First Forgiveness", description: "One name released.", icon: "✺" },
  { id: "forgiveness_5", pillar: "train", title: "Five Forgivenesses", description: "Five weights set down.", icon: "✺" },
  // Take Bold Action
  { id: "reset_first", pillar: "action", title: "First Reset", description: "First Reset Breath logged.", icon: "⌇" },
  { id: "reset_100", pillar: "action", title: "One Hundred Resets", description: "A hundred breath resets.", icon: "⌇" },
  { id: "habit_renaissance", pillar: "action", title: "Habit Renaissance", description: "Morning + Evening rituals set.", icon: "▦" },
  { id: "dopamine_30", pillar: "action", title: "Dopamine 30", description: "Thirty-day dopamine detox complete.", icon: "◬" },
  { id: "zero_gravity", pillar: "action", title: "Zero Gravity", description: "Your Zero Gravity audit is done.", icon: "△" },
  { id: "jomo_week", pillar: "action", title: "JOMO Week", description: "Held the week's NO list.", icon: "▽" },
  // Foundational milestones
  { id: "foundations_complete", pillar: "foundational", title: "Foundations", description: "You understand the why.", icon: "✧" },
  { id: "invest_complete", pillar: "foundational", title: "Invested", description: "Invest in Joy section complete.", icon: "✧" },
  { id: "train_complete", pillar: "foundational", title: "Brain Trained", description: "JOS® install complete.", icon: "✧" },
  { id: "action_complete", pillar: "foundational", title: "Bold Action", description: "Take Bold Action section complete.", icon: "✧" },
  { id: "day_90", pillar: "foundational", title: "Day Ninety", description: "You ran the system for ninety days.", icon: "✦" },
  { id: "year_one", pillar: "foundational", title: "One Year", description: "One year of this work.", icon: "✦" },
];

export const BADGE_BY_ID = new Map(BADGES.map((b) => [b.id, b]));

export interface EarnedBadge {
  badge_id: string;
  pillar: BadgePillar;
  earned_at: string | Date;
  context: string | null;
}

export async function listEarned(userId: string): Promise<EarnedBadge[]> {
  return query<EarnedBadge>(
    `SELECT badge_id, pillar, earned_at, context
       FROM badges_earned
      WHERE user_id = $1
      ORDER BY earned_at DESC`,
    [userId],
  );
}

/**
 * Award a badge if the user doesn't already have it. Returns the
 * earned row when newly awarded, or null when it was already there.
 */
export async function awardBadge(
  userId: string,
  badgeId: string,
  context?: string,
): Promise<EarnedBadge | null> {
  const def = BADGE_BY_ID.get(badgeId);
  if (!def) return null;
  const rows = await query<EarnedBadge>(
    `INSERT INTO badges_earned (user_id, badge_id, pillar, context)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, badge_id) DO NOTHING
     RETURNING badge_id, pillar, earned_at, context`,
    [userId, badgeId, def.pillar, context ?? null],
  );
  return rows[0] ?? null;
}
