import { randomBytes } from "crypto";
import { query } from "../db";
import type { NotificationKind } from "./copy";

/** Cryptographically-random hex token for one-click unsubscribe links. */
function newUnsubscribeToken(): string {
  return randomBytes(16).toString("hex");
}

export interface NotificationPreferences {
  user_id: string;
  push_enabled: boolean;
  push_subscription: unknown | null;
  email_enabled: boolean;
  email_address: string | null;
  sms_enabled: boolean;
  phone_e164: string | null;
  morning_time: string;
  evening_time: string;
  timezone: string;
  subscript_morning: boolean;
  subscript_evening: boolean;
  weekly_pillar: boolean;
  letter_delivered: boolean;
  gone_dark: boolean;
  milestone: boolean;
  unsubscribe_token: string;
}

const DEFAULTS = {
  push_enabled: false,
  push_subscription: null,
  email_enabled: false,
  email_address: null,
  sms_enabled: false,
  phone_e164: null,
  morning_time: "07:00",
  evening_time: "21:30",
  timezone: "America/Los_Angeles",
  subscript_morning: true,
  subscript_evening: true,
  weekly_pillar: true,
  letter_delivered: true,
  gone_dark: true,
  milestone: true,
};

/**
 * Ensure a preferences row exists for the user and return it. Created on
 * first read with defaults; subsequent reads return the saved values.
 */
export async function getOrCreatePreferences(
  userId: string,
): Promise<NotificationPreferences> {
  const existing = await query<NotificationPreferences>(
    `SELECT * FROM notification_preferences WHERE user_id = $1`,
    [userId],
  );
  if (existing[0]) {
    // Backfill the unsubscribe token if a legacy row was created
    // without one (rare — only matters for rows that pre-date this code).
    if (!existing[0].unsubscribe_token) {
      const token = newUnsubscribeToken();
      await query(
        `UPDATE notification_preferences SET unsubscribe_token = $2
           WHERE user_id = $1 AND unsubscribe_token IS NULL`,
        [userId, token],
      );
      existing[0].unsubscribe_token = token;
    }
    return existing[0];
  }
  const created = await query<NotificationPreferences>(
    `INSERT INTO notification_preferences (user_id, unsubscribe_token)
       VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET updated_at = now()
       RETURNING *`,
    [userId, newUnsubscribeToken()],
  );
  return created[0] ?? { user_id: userId, ...DEFAULTS, unsubscribe_token: "" };
}

export async function getPreferencesByUnsubscribeToken(
  token: string,
): Promise<NotificationPreferences | null> {
  const rows = await query<NotificationPreferences>(
    `SELECT * FROM notification_preferences WHERE unsubscribe_token = $1`,
    [token],
  );
  return rows[0] ?? null;
}

export async function updatePreferences(
  userId: string,
  patch: Partial<NotificationPreferences>,
): Promise<NotificationPreferences> {
  await getOrCreatePreferences(userId);

  const allowed = [
    "push_enabled",
    "push_subscription",
    "email_enabled",
    "email_address",
    "sms_enabled",
    "phone_e164",
    "morning_time",
    "evening_time",
    "timezone",
    "subscript_morning",
    "subscript_evening",
    "weekly_pillar",
    "letter_delivered",
    "gone_dark",
    "milestone",
  ] as const;

  const sets: string[] = [];
  const params: unknown[] = [userId];
  for (const k of allowed) {
    if (k in patch) {
      params.push((patch as Record<string, unknown>)[k]);
      const cast = k === "push_subscription" ? "::jsonb" : "";
      sets.push(`${k} = $${params.length}${cast}`);
    }
  }
  if (sets.length === 0) {
    return getOrCreatePreferences(userId);
  }
  sets.push("updated_at = now()");
  const rows = await query<NotificationPreferences>(
    `UPDATE notification_preferences SET ${sets.join(", ")} WHERE user_id = $1 RETURNING *`,
    params,
  );
  return rows[0]!;
}

/** Disable all notification channels for the user (one-click unsubscribe). */
export async function disableAllChannels(userId: string): Promise<void> {
  await query(
    `UPDATE notification_preferences
       SET push_enabled = false,
           email_enabled = false,
           sms_enabled = false,
           updated_at = now()
       WHERE user_id = $1`,
    [userId],
  );
}

/** Record a delivery — idempotent on (user_id, kind, send_date, channel). */
export async function recordDelivery(opts: {
  userId: string;
  kind: NotificationKind;
  channel: "push" | "email" | "sms";
  sendDate: string; // YYYY-MM-DD in the user's timezone
  status: "sent" | "failed";
  error?: string;
}): Promise<{ inserted: boolean }> {
  const rows = await query<{ id: string }>(
    `INSERT INTO notification_deliveries
       (user_id, kind, send_date, channel, status, error)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id, kind, send_date, channel) DO NOTHING
       RETURNING id::text AS id`,
    [opts.userId, opts.kind, opts.sendDate, opts.channel, opts.status, opts.error ?? null],
  );
  return { inserted: rows.length > 0 };
}
