import { query } from "./db";
import { getCheckin, getChallengeStatus, type ChallengeMode } from "./challenge";
import { getDayTask, isRestDay, phaseForDay } from "./challenge-days";
import { getTodayPulse } from "./joy-pulse";
import { listJoyItems } from "./list-of-joy";
import { todayDrop } from "./daily-drop";

/**
 * Daily Session card resolution per the Cadence Directive §3 / §4 / §5.
 *
 * The card arc adapts to the user's mode:
 *   • Challenge Mode  — Card 3 prescribes THIS day's work from the cadence.
 *                       Missed-day prompt overrides if behind_by_days > 0.
 *                       Rest days show a calm "today is rest" card.
 *   • Practice Mode   — Card 3 surfaces ONE suggested deepening / ritual.
 *   • Free Mode       — Card 3 invites Challenge commitment + one practice.
 *
 * Cards are returned as a flat sequence the client walks one-at-a-time.
 */

export interface JoyDrop {
  id: string;
  body: string;
  source?: string | null;
  saved: boolean;
}

export type CardKind =
  | "letter"
  | "missed_days"
  | "greeting"
  | "joy_pulse"
  | "morning_ritual"
  | "evening_ritual"
  | "whats_next"
  | "rest_day"
  | "free_invite"
  | "practice_suggestion"
  | "graduation"
  | "joy_glimpse"
  | "close";

export interface SessionCard {
  kind: CardKind;
  payload?: Record<string, unknown>;
}

export interface DailySessionData {
  mode: ChallengeMode;
  firstName: string;
  currentDay: number | null;
  isEvening: boolean;
  cards: SessionCard[];
}

export async function getDailySession(opts: {
  userId: string;
  email: string;
  now?: Date;
}): Promise<DailySessionData> {
  const now = opts.now ?? new Date();
  const hour = now.getHours();
  const isEvening = hour >= 18;

  const [drop, pulse, joyItems, challenge, activeSub, nameRow, letterRows] =
    await Promise.all([
      todayDrop(),
      getTodayPulse(opts.userId),
      listJoyItems(opts.userId),
      getChallengeStatus(opts.userId),
      query<{ id: string }>(
        `SELECT id FROM subscripts WHERE user_id = $1 AND is_active = true LIMIT 1`,
        [opts.userId],
      ),
      query<{ name: string | null }>(
        `SELECT name FROM users WHERE id = $1`,
        [opts.userId],
      ),
      query<{ id: string }>(
        `SELECT id::text AS id FROM letters_to_self
           WHERE user_id = $1
             AND send_at <= now()
             AND send_at >= now() - interval '24 hours'
             AND opened_at IS NULL
           ORDER BY send_at DESC LIMIT 1`,
        [opts.userId],
      ),
    ]);

  const mode = challenge.mode;
  const firstName =
    nameRow[0]?.name?.split(" ")[0] ?? opts.email.split("@")[0];
  const currentDay = challenge.current_day > 0 ? challenge.current_day : null;
  const isGraduated = challenge.current_day > 90 || !!challenge.completed_at;
  const hasSubscript = activeSub.length > 0;

  let savedDrop = false;
  if (!drop.id.startsWith("studio:")) {
    const r = await query<{ id: string }>(
      `SELECT id::text AS id FROM quote_favorites
         WHERE user_id = $1 AND quote_id = $2 LIMIT 1`,
      [opts.userId, drop.id],
    );
    savedDrop = r.length > 0;
  }

  const seed = now.getDate() + now.getMonth() * 31;
  const joySamples = [...joyItems]
    .sort(
      (a, b) =>
        ((seed + a.content.length) % 17) - ((seed + b.content.length) % 17),
    )
    .slice(0, 3)
    .map((j) => ({ id: String(j.id), content: j.content }));

  // Has user already done today's day-work? (For Challenge Mode)
  const todayCheckin =
    currentDay !== null && currentDay <= 90
      ? await getCheckin(opts.userId, currentDay)
      : null;
  const todayLogged = todayCheckin !== null;

  const cards: SessionCard[] = [];

  // Letter override — takes the very first slot per Directive §12
  if (letterRows[0]) {
    cards.push({
      kind: "letter",
      payload: { letterId: letterRows[0].id },
    });
  }

  // Missed-days override (Challenge Mode only). The Challenge is patient
  // (§3.2). Prompt to pick up the missed day or skip ahead.
  if (
    mode === "challenge" &&
    !isGraduated &&
    challenge.behind_by_days > 0 &&
    currentDay !== null
  ) {
    const skipTo = Math.min(90, currentDay + challenge.behind_by_days);
    cards.push({
      kind: "missed_days",
      payload: {
        currentDay,
        gap: challenge.behind_by_days,
        skipTo,
      },
    });
  }

  // Greeting + Joy Drop — always, but the day marker varies by mode
  cards.push({
    kind: "greeting",
    payload: {
      firstName,
      currentDay,
      mode,
      isGraduated,
      drop: { id: drop.id, body: drop.body, source: drop.source, saved: savedDrop },
    },
  });

  // Pulse — only if not yet logged
  if (!pulse) cards.push({ kind: "joy_pulse" });

  // Card 3 — mode-aware "what to do today"
  if (mode === "challenge" && !isGraduated && currentDay !== null) {
    if (isRestDay(currentDay)) {
      cards.push({
        kind: "rest_day",
        payload: {
          day: currentDay,
          phase: phaseForDay(currentDay)?.title ?? null,
        },
      });
    } else if (!todayLogged) {
      const task = getDayTask(currentDay);
      if (task) {
        cards.push({
          kind: "whats_next",
          payload: {
            eyebrow: `Day ${currentDay} · ${phaseForDay(currentDay)?.title ?? ""}`,
            title: task.title,
            subtitle: task.description,
            href: task.primaryHref,
            primaryLabel: task.primaryLabel,
            estimatedMin: task.estimatedMin,
            isMilestone: task.isMilestone,
          },
        });
      }
    }
  } else if (mode === "challenge" && isGraduated) {
    // Day-90 first open after completion
    cards.push({ kind: "graduation", payload: {} });
  } else if (mode === "practice") {
    cards.push({
      kind: "practice_suggestion",
      payload: await practiceSuggestion(opts.userId, hasSubscript),
    });
  } else if (mode === "free") {
    cards.push({
      kind: "free_invite",
      payload: {},
    });
  }

  // Card 4 — Daily Rituals (SubScript / ITT). Bundled into one card.
  if (isEvening) {
    cards.push({ kind: "evening_ritual", payload: { hasSubscript } });
  } else if (hasSubscript || mode === "challenge") {
    cards.push({ kind: "morning_ritual", payload: { hasSubscript } });
  }

  // Card 5 — Joy glimpse
  cards.push({
    kind: "joy_glimpse",
    payload: { samples: joySamples },
  });

  // Card 6 — Close. Copy varies by mode.
  cards.push({
    kind: "close",
    payload: {
      isEvening,
      mode,
      currentDay,
      nextDay:
        mode === "challenge" && currentDay !== null && currentDay < 90
          ? currentDay + 1
          : null,
    },
  });

  return {
    mode,
    firstName,
    currentDay,
    isEvening,
    cards,
  };
}

/**
 * Practice Mode card 3 surfaces ONE suggestion based on stale data —
 * Pillars not re-scored, no recent Joy add, last Self-Eulogy read >90d.
 */
async function practiceSuggestion(
  userId: string,
  hasSubscript: boolean,
): Promise<Record<string, unknown>> {
  // Most recent Pillar snapshot
  const rows = await query<{ days: number | null }>(
    `SELECT EXTRACT(DAY FROM (now() -
        COALESCE((SELECT MAX(taken_at) FROM priority_pillar_snapshots WHERE user_id = $1), 'epoch'::timestamptz)
      ))::int AS days`,
    [userId],
  );
  const pillarStaleness = rows[0]?.days ?? 9999;
  if (pillarStaleness > 30) {
    return {
      eyebrow: "Time to re-score",
      title: "Take a pulse on your Pillars",
      subtitle: `Last scored ${pillarStaleness} days ago. Two minutes.`,
      href: "/curriculum/module/02-joyful-operating-system/priority-pillars",
      primaryLabel: "Score now",
      estimatedMin: 2,
    };
  }
  if (hasSubscript) {
    return {
      eyebrow: "The practice",
      title: "Read your SubScript",
      subtitle: "The install needs reading, daily. Five minutes.",
      href: "/curriculum/module/02-joyful-operating-system/subscript",
      primaryLabel: "Read it",
      estimatedMin: 5,
    };
  }
  return {
    eyebrow: "Today",
    title: "Take a Spirit Walk",
    subtitle: "Twenty minutes outside, no headphones. Notice three things.",
    href: "/curriculum/toolkit",
    primaryLabel: "Browse the Tools",
    estimatedMin: 20,
  };
}
