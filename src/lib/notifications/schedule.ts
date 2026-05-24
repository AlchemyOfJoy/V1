import { query } from "../db";
import type { NotificationKind } from "./copy";
import type { NotificationPreferences } from "./preferences";

/**
 * Decide what's due for a single user at a given moment, given their
 * preferences and a few cheap DB lookups. Returns a list of due kinds.
 *
 * The dispatcher then resolves each kind into copy and channel sends.
 *
 * Quiet hours: nothing fires between the user's evening_time and the
 * next morning_time. Milestones and letter_delivered are exempt because
 * they're event-driven, not scheduled — but the dispatcher gates them
 * to one send per (user, kind, send_date) anyway.
 */

export interface DueNotification {
  kind: NotificationKind;
  /** Local-tz date for idempotency, YYYY-MM-DD. */
  sendDate: string;
}

function partsInTz(tz: string, when: Date): { date: string; minutes: number; weekday: number } {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    weekday: "short",
  });
  const parts = fmt.formatToParts(when);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const date = `${get("year")}-${get("month")}-${get("day")}`;
  const hh = Number(get("hour"));
  const mm = Number(get("minute"));
  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return {
    date,
    minutes: hh * 60 + mm,
    weekday: weekdayMap[get("weekday")] ?? 0,
  };
}

function hhmmToMinutes(s: string): number {
  const [h, m] = s.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

export async function dueForUser(
  prefs: NotificationPreferences,
  now: Date = new Date(),
): Promise<DueNotification[]> {
  const out: DueNotification[] = [];
  const { date, minutes, weekday } = partsInTz(prefs.timezone, now);
  const morningMin = hhmmToMinutes(prefs.morning_time);
  const eveningMin = hhmmToMinutes(prefs.evening_time);

  // Window: the cron runs every 15 minutes; fire if "now" is within the
  // 15 minutes after the user's chosen time. The (kind, send_date)
  // uniqueness guarantees one send per day even if the cron is late.
  const within = (target: number) => minutes >= target && minutes < target + 15;

  // Morning + evening SubScript reminders
  if (prefs.subscript_morning && within(morningMin)) {
    out.push({ kind: "morning_subscript", sendDate: date });
  }
  if (prefs.subscript_evening && within(eveningMin)) {
    out.push({ kind: "evening_subscript", sendDate: date });
  }

  // Weekly pillar pulse — Sundays at the morning_time
  if (prefs.weekly_pillar && weekday === 0 && within(morningMin)) {
    out.push({ kind: "weekly_pillar", sendDate: date });
  }

  // Letter delivered — any letter sent_at in the last 24h, unread
  if (prefs.letter_delivered) {
    const rows = await query<{ id: string }>(
      `SELECT id::text AS id FROM letters_to_self
         WHERE user_id = $1
           AND send_at <= now()
           AND send_at >= now() - interval '24 hours'
           AND opened_at IS NULL
         LIMIT 1`,
      [prefs.user_id],
    );
    if (rows.length > 0) {
      out.push({ kind: "letter_delivered", sendDate: date });
    }
  }

  // Gone-dark gentle re-entry — fire on day 7 and 21 of inactivity
  // only, then go silent.
  if (prefs.gone_dark && within(morningMin)) {
    const rows = await query<{ days: number | null }>(
      `SELECT EXTRACT(DAY FROM (now() - GREATEST(
           COALESCE((SELECT MAX(created_at) FROM joy_pulse WHERE user_id = $1), 'epoch'::timestamptz),
           COALESCE((SELECT MAX(created_at) FROM list_of_joy_items WHERE user_id = $1), 'epoch'::timestamptz),
           COALESCE((SELECT MAX(checked_in_at) FROM challenge_checkins WHERE user_id = $1), 'epoch'::timestamptz),
           COALESCE((SELECT created_at FROM users WHERE id = $1), 'epoch'::timestamptz)
         )))::int AS days`,
      [prefs.user_id],
    );
    const days = rows[0]?.days ?? 0;
    if (days === 7) out.push({ kind: "gone_dark_7", sendDate: date });
    if (days === 21) out.push({ kind: "gone_dark_21", sendDate: date });
  }

  return out;
}
