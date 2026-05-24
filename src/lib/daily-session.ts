import { query } from "./db";
import { getCheckin, getChallengeStatus } from "./challenge";
import { getDayTask } from "./challenge-days";
import { getTodayPulse } from "./joy-pulse";
import { listJoyItems } from "./list-of-joy";
import { todayDrop } from "./daily-drop";

/**
 * The Daily Session decision tree + card data (Flow Overhaul Directive §3).
 *
 * Computes the full sequence of cards the user will walk through this
 * session, based on:
 *   • time of day (morning vs evening flow)
 *   • what's already done today (pulse logged, day logged)
 *   • whether they have a SubScript, an active Journey resume point
 *   • whether a letter from past self has arrived today
 *   • their current 90-Day arc day
 *
 * Per the directive: one card on screen at a time. The app makes the
 * choice; the user just advances.
 */

export interface JoyDrop {
  id: string;
  body: string;
  source?: string | null;
  saved: boolean;
}

export type CardKind =
  | "letter"
  | "greeting"
  | "joy_pulse"
  | "morning_ritual"
  | "evening_ritual"
  | "whats_next"
  | "joy_glimpse"
  | "close";

export interface SessionCard {
  kind: CardKind;
  // Card-specific payload
  payload?: Record<string, unknown>;
}

export interface DailySessionData {
  firstName: string;
  currentDay: number | null;
  isEvening: boolean;
  joyDrop: JoyDrop;
  pulseAlreadyLogged: boolean;
  joySamples: { id: string; content: string }[];
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

  const [drop, pulse, joyItems, challenge, activeSub, nameRow, favRows, letterRows] =
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
        `SELECT id FROM quote_favorites WHERE user_id = $1 LIMIT 1`,
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

  const firstName =
    nameRow[0]?.name?.split(" ")[0] ?? opts.email.split("@")[0];
  const dayNumber = challenge.started_at ? challenge.current_day : null;
  const todayCheckin =
    dayNumber !== null ? await getCheckin(opts.userId, dayNumber) : null;
  const todayLogged = todayCheckin !== null;
  const hasSubscript = activeSub.length > 0;

  // Joy Drop favorite check is cheap
  let savedDrop = false;
  if (!drop.id.startsWith("studio:")) {
    const r = await query<{ id: string }>(
      `SELECT id::text AS id FROM quote_favorites
         WHERE user_id = $1 AND quote_id = $2 LIMIT 1`,
      [opts.userId, drop.id],
    );
    savedDrop = r.length > 0;
  }
  void favRows;

  // Deterministic three-from-list sample
  const seed = now.getDate() + now.getMonth() * 31;
  const joySamples = [...joyItems]
    .sort(
      (a, b) =>
        ((seed + a.content.length) % 17) - ((seed + b.content.length) % 17),
    )
    .slice(0, 3)
    .map((j) => ({ id: String(j.id), content: j.content }));

  const cards: SessionCard[] = [];

  // Letter override — if a letter arrived in the last 24h and is unread,
  // it becomes the very first card.
  if (letterRows[0]) {
    cards.push({
      kind: "letter",
      payload: { letterId: letterRows[0].id },
    });
  }

  // Greeting + Joy Drop — always
  cards.push({
    kind: "greeting",
    payload: {
      firstName,
      currentDay: dayNumber,
      drop: { id: drop.id, body: drop.body, source: drop.source, saved: savedDrop },
    },
  });

  // Pulse — only if not logged today
  if (!pulse) {
    cards.push({ kind: "joy_pulse" });
  }

  // Morning vs Evening ritual
  if (isEvening) {
    cards.push({
      kind: "evening_ritual",
      payload: { hasSubscript },
    });
  } else {
    // Only show morning ritual card if there's something useful to do
    if (hasSubscript || !todayLogged) {
      cards.push({
        kind: "morning_ritual",
        payload: { hasSubscript },
      });
    }
  }

  // What's Next — surface day task or maintenance suggestion
  const task =
    dayNumber !== null && dayNumber >= 1 && dayNumber <= 90
      ? getDayTask(dayNumber)
      : null;
  if (task && !todayLogged) {
    cards.push({
      kind: "whats_next",
      payload: {
        eyebrow: `Day ${dayNumber} of 90`,
        title: task.title,
        subtitle: task.description,
        href: task.primaryHref,
        primaryLabel: task.primaryLabel,
        estimatedMin: task.estimatedMin,
        isMilestone: task.isMilestone,
      },
    });
  } else if (dayNumber !== null && dayNumber > 90) {
    cards.push({
      kind: "whats_next",
      payload: {
        eyebrow: "The practice continues",
        title: "Take a Spirit Walk today",
        subtitle: "Twenty minutes outside, no headphones.",
        href: "/curriculum/toolkit",
        primaryLabel: "Open the Tool Kit",
        estimatedMin: 20,
      },
    });
  }

  // Joy glimpse — always (the soft prompt invites an add even if empty)
  cards.push({
    kind: "joy_glimpse",
    payload: { samples: joySamples },
  });

  // Close — permission to stop
  cards.push({
    kind: "close",
    payload: { isEvening },
  });

  return {
    firstName,
    currentDay: dayNumber,
    isEvening,
    joyDrop: {
      id: drop.id,
      body: drop.body,
      source: drop.source,
      saved: savedDrop,
    },
    pulseAlreadyLogged: pulse !== null,
    joySamples,
    cards,
  };
}
