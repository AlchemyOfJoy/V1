import { query } from "./db";

export interface WeekFocus {
  week: number; // 1–13
  title: string;
  focus: string;
  action: string;
  /** Optional curriculum URL to link to as "the work this week." */
  link?: string;
}

/**
 * Thirteen weeks across 90 days. Each week names the structural focus,
 * the daily inputs, and the one weekly action that makes the week count.
 */
export const WEEKS: WeekFocus[] = [
  {
    week: 1,
    title: "Foundation",
    focus: "Science of Joy + Core Narrative",
    action:
      "Catch your top 3 old narratives in the wild this week. Note when each fired.",
    link: "/curriculum/module/02-joyful-operating-system/core-narrative",
  },
  {
    week: 2,
    title: "The List",
    focus: "The List of Joy™ — gather the raw material",
    action:
      "Add five new joys to your List every day. Quantity, not theatre.",
    link: "/curriculum/module/02-joyful-operating-system/list-of-joy",
  },
  {
    week: 3,
    title: "Pillars",
    focus: "Priority Pillars — see where the lean is",
    action:
      "Take the pillar snapshot. Pick the lowest sub-pillar and add one act of repair to your week.",
    link: "/curriculum/module/02-joyful-operating-system/priority-pillars",
  },
  {
    week: 4,
    title: "SubScript launch",
    focus: "Write it. Print it. Read it morning and night.",
    action:
      "Read your SubScript out loud, both AM and PM, every day this week.",
    link: "/curriculum/module/02-joyful-operating-system/subscript",
  },
  {
    week: 5,
    title: "Forgiveness",
    focus: "Release one weight",
    action:
      "Complete one full Forgiveness Framework process — even a small one.",
    link: "/curriculum/module/03-forgiveness",
  },
  {
    week: 6,
    title: "Breath",
    focus: "Daily Joy Spark",
    action: "Run the Joy Spark tool once a day, every day.",
    link: "/curriculum/module/04-bold-action/joy-spark",
  },
  {
    week: 7,
    title: "Audit",
    focus: "See your hours honestly",
    action: "Run the Hourly Audit on Friday. Adjust next week from data.",
    link: "/curriculum/module/04-bold-action/hourly-audit",
  },
  {
    week: 8,
    title: "Gratitude",
    focus: "Specific, daily",
    action: "Three specific gratitudes every morning before phone.",
    link: "/curriculum/module/04-bold-action/gratitude-three",
  },
  {
    week: 9,
    title: "Reframe in the wild",
    focus: "Catch and flip",
    action: "Use Reframe Now twice this week when the old story shows up.",
    link: "/curriculum/module/04-bold-action/reframe-now",
  },
  {
    week: 10,
    title: "The Bold Ask",
    focus: "Stop waiting",
    action: "Write one Bold Ask. Send it within 48 hours.",
    link: "/curriculum/module/04-bold-action/bold-ask",
  },
  {
    week: 11,
    title: "Identity",
    focus: "Declare it daily",
    action:
      "Three Identity Declarations every morning, out loud, hand on heart.",
    link: "/curriculum/module/04-bold-action/identity-declaration",
  },
  {
    week: 12,
    title: "Energy",
    focus: "Notice the pattern",
    action:
      "Log the Energy Inventory every evening. By Sunday, name one give and one take you'll adjust.",
    link: "/curriculum/module/04-bold-action/energy-inventory",
  },
  {
    week: 13,
    title: "Commencement",
    focus: "Integration",
    action:
      "Retake the JQ. Compare to your baseline. Write your commencement note to yourself.",
    link: "/assessment",
  },
];

export const TOTAL_DAYS = 90;

export interface ChallengeStatus {
  started_at: string | null;
  current_day: number; // 0 if not started, else 1..90, or 91 if completed
  completed_at: string | null;
  total_checkins: number;
}

export async function getChallengeStatus(
  userId: string,
): Promise<ChallengeStatus> {
  const rows = await query<{
    challenge_started_at: string | Date | null;
    challenge_completed_at: string | Date | null;
    total: string;
  }>(
    `SELECT u.challenge_started_at,
            NULL::timestamptz AS challenge_completed_at,
            (SELECT COUNT(*)::text FROM challenge_checkins
              WHERE user_id = u.id) AS total
       FROM users u
      WHERE u.id = $1`,
    [userId],
  );
  const row = rows[0];
  const startedAt = row?.challenge_started_at ?? null;
  const startedAtIso = startedAt
    ? startedAt instanceof Date
      ? startedAt.toISOString()
      : startedAt
    : null;
  let currentDay = 0;
  if (startedAtIso) {
    const startMs = new Date(startedAtIso).setHours(0, 0, 0, 0);
    const today = new Date().setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today - startMs) / 86_400_000);
    currentDay = Math.max(1, Math.min(TOTAL_DAYS, diffDays + 1));
  }
  return {
    started_at: startedAtIso,
    current_day: currentDay,
    completed_at: null,
    total_checkins: Number(row?.total ?? 0),
  };
}

export async function startChallenge(userId: string): Promise<void> {
  await query(
    `UPDATE users
        SET challenge_started_at = COALESCE(challenge_started_at, now()),
            challenge_current_day = COALESCE(challenge_current_day, 1)
      WHERE id = $1`,
    [userId],
  );
}

export async function resetChallenge(userId: string): Promise<void> {
  await query(
    `UPDATE users
        SET challenge_started_at = now(),
            challenge_current_day = 1
      WHERE id = $1`,
    [userId],
  );
  await query(`DELETE FROM challenge_checkins WHERE user_id = $1`, [userId]);
}

export interface CheckinRow {
  day_number: number;
  checked_in_at: string | Date;
  subscript_morning_done: boolean;
  subscript_evening_done: boolean;
  weekly_focus_action: string | null;
  reflection: string | null;
  mood_rating: number | null;
}

export async function listCheckins(userId: string): Promise<CheckinRow[]> {
  return query<CheckinRow>(
    `SELECT day_number, checked_in_at, subscript_morning_done,
            subscript_evening_done, weekly_focus_action, reflection, mood_rating
       FROM challenge_checkins
      WHERE user_id = $1
      ORDER BY day_number ASC`,
    [userId],
  );
}

export async function getCheckin(
  userId: string,
  day: number,
): Promise<CheckinRow | null> {
  const rows = await query<CheckinRow>(
    `SELECT day_number, checked_in_at, subscript_morning_done,
            subscript_evening_done, weekly_focus_action, reflection, mood_rating
       FROM challenge_checkins
      WHERE user_id = $1 AND day_number = $2`,
    [userId, day],
  );
  return rows[0] ?? null;
}

export async function upsertCheckin(
  userId: string,
  day: number,
  patch: Partial<{
    subscript_morning_done: boolean;
    subscript_evening_done: boolean;
    weekly_focus_action: string;
    reflection: string;
    mood_rating: number;
  }>,
): Promise<CheckinRow> {
  const rows = await query<CheckinRow>(
    `INSERT INTO challenge_checkins (
        user_id, day_number, subscript_morning_done, subscript_evening_done,
        weekly_focus_action, reflection, mood_rating, checked_in_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, now())
     ON CONFLICT (user_id, day_number) DO UPDATE
        SET subscript_morning_done = EXCLUDED.subscript_morning_done,
            subscript_evening_done = EXCLUDED.subscript_evening_done,
            weekly_focus_action = COALESCE(EXCLUDED.weekly_focus_action,
                                           challenge_checkins.weekly_focus_action),
            reflection = COALESCE(EXCLUDED.reflection,
                                  challenge_checkins.reflection),
            mood_rating = COALESCE(EXCLUDED.mood_rating,
                                   challenge_checkins.mood_rating),
            checked_in_at = now()
     RETURNING day_number, checked_in_at, subscript_morning_done,
               subscript_evening_done, weekly_focus_action, reflection,
               mood_rating`,
    [
      userId,
      day,
      patch.subscript_morning_done ?? false,
      patch.subscript_evening_done ?? false,
      patch.weekly_focus_action ?? null,
      patch.reflection ?? null,
      patch.mood_rating ?? null,
    ],
  );
  return rows[0];
}

export function weekForDay(day: number): WeekFocus {
  const i = Math.min(WEEKS.length - 1, Math.max(0, Math.ceil(day / 7) - 1));
  return WEEKS[i];
}
