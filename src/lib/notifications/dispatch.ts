import { query } from "../db";
import { siteUrl } from "../site";
import { copyFor, type NotificationKind } from "./copy";
import {
  getOrCreatePreferences,
  recordDelivery,
  type NotificationPreferences,
} from "./preferences";
import { sendWebPush, type PushSubscriptionShape } from "./web-push";
import { sendEmail } from "./email";
import { sendSms } from "./sms";
import { dueForUser } from "./schedule";
import { getChallengeStatus } from "../challenge";

/**
 * Dispatcher entry point — called by the cron route. Walks users with
 * notification preferences, computes what's due for each, sends across
 * enabled channels, and records every delivery for idempotency + audit.
 *
 * Returns a summary the cron route surfaces in its response so we can
 * watch it in logs.
 */

export interface DispatchSummary {
  scanned: number;
  delivered: { push: number; email: number; sms: number };
  failed: { push: number; email: number; sms: number };
  skippedNoChannels: number;
}

export async function dispatchNotifications(opts: {
  /** Only dispatch for this user (used by "send test" buttons). */
  onlyUserId?: string;
  /** Force a specific kind, ignoring schedule logic (test sends). */
  forceKind?: NotificationKind;
  now?: Date;
} = {}): Promise<DispatchSummary> {
  const summary: DispatchSummary = {
    scanned: 0,
    delivered: { push: 0, email: 0, sms: 0 },
    failed: { push: 0, email: 0, sms: 0 },
    skippedNoChannels: 0,
  };

  const where = opts.onlyUserId
    ? `WHERE user_id = $1`
    : `WHERE push_enabled = true OR email_enabled = true OR sms_enabled = true`;
  const params = opts.onlyUserId ? [opts.onlyUserId] : [];

  const users = await query<NotificationPreferences>(
    `SELECT * FROM notification_preferences ${where}`,
    params,
  );

  for (const prefs of users) {
    summary.scanned++;
    if (!prefs.push_enabled && !prefs.email_enabled && !prefs.sms_enabled) {
      summary.skippedNoChannels++;
      continue;
    }
    const dues = opts.forceKind
      ? [{ kind: opts.forceKind, sendDate: localDate(prefs.timezone, opts.now ?? new Date()) }]
      : await dueForUser(prefs, opts.now);
    for (const due of dues) {
      if (!kindEnabled(prefs, due.kind)) continue;
      const ctx = await contextFor(prefs.user_id, due.kind);
      const copy = copyFor(due.kind, ctx);

      // Push
      if (prefs.push_enabled && prefs.push_subscription) {
        const seen = await alreadySent(prefs.user_id, due.kind, due.sendDate, "push");
        if (!seen) {
          try {
            await sendWebPush(
              prefs.push_subscription as unknown as PushSubscriptionShape,
              copy,
            );
            await recordDelivery({
              userId: prefs.user_id,
              kind: due.kind,
              channel: "push",
              sendDate: due.sendDate,
              status: "sent",
            });
            summary.delivered.push++;
          } catch (err) {
            await recordDelivery({
              userId: prefs.user_id,
              kind: due.kind,
              channel: "push",
              sendDate: due.sendDate,
              status: "failed",
              error: String((err as Error).message ?? err).slice(0, 200),
            });
            summary.failed.push++;
          }
        }
      }

      // Email
      if (prefs.email_enabled && prefs.email_address) {
        const seen = await alreadySent(prefs.user_id, due.kind, due.sendDate, "email");
        if (!seen) {
          try {
            const unsub = `${siteUrl()}/api/notifications/unsubscribe?t=${encodeURIComponent(prefs.unsubscribe_token)}`;
            await sendEmail({
              to: prefs.email_address,
              copy,
              unsubscribeUrl: unsub,
            });
            await recordDelivery({
              userId: prefs.user_id,
              kind: due.kind,
              channel: "email",
              sendDate: due.sendDate,
              status: "sent",
            });
            summary.delivered.email++;
          } catch (err) {
            await recordDelivery({
              userId: prefs.user_id,
              kind: due.kind,
              channel: "email",
              sendDate: due.sendDate,
              status: "failed",
              error: String((err as Error).message ?? err).slice(0, 200),
            });
            summary.failed.email++;
          }
        }
      }

      // SMS
      if (prefs.sms_enabled && prefs.phone_e164) {
        const seen = await alreadySent(prefs.user_id, due.kind, due.sendDate, "sms");
        if (!seen) {
          try {
            await sendSms({
              to: prefs.phone_e164,
              body: copy.sms,
            });
            await recordDelivery({
              userId: prefs.user_id,
              kind: due.kind,
              channel: "sms",
              sendDate: due.sendDate,
              status: "sent",
            });
            summary.delivered.sms++;
          } catch (err) {
            await recordDelivery({
              userId: prefs.user_id,
              kind: due.kind,
              channel: "sms",
              sendDate: due.sendDate,
              status: "failed",
              error: String((err as Error).message ?? err).slice(0, 200),
            });
            summary.failed.sms++;
          }
        }
      }
    }
  }

  return summary;
}

/** Event-driven send used at write boundaries (milestones, letters). */
export async function dispatchEvent(
  userId: string,
  kind: NotificationKind,
  ctxOverrides: { milestoneLabel?: string } = {},
): Promise<void> {
  const prefs = await getOrCreatePreferences(userId);
  if (!kindEnabled(prefs, kind)) return;
  if (!prefs.push_enabled && !prefs.email_enabled && !prefs.sms_enabled) return;
  const ctx = await contextFor(userId, kind);
  const copy = copyFor(kind, { ...ctx, ...ctxOverrides });
  const sendDate = localDate(prefs.timezone, new Date());

  if (prefs.push_enabled && prefs.push_subscription) {
    try {
      await sendWebPush(
        prefs.push_subscription as unknown as PushSubscriptionShape,
        copy,
      );
      await recordDelivery({
        userId,
        kind,
        channel: "push",
        sendDate,
        status: "sent",
      });
    } catch {
      // best effort
    }
  }
  if (prefs.email_enabled && prefs.email_address) {
    try {
      const unsub = `${siteUrl()}/api/notifications/unsubscribe?t=${encodeURIComponent(prefs.unsubscribe_token)}`;
      await sendEmail({ to: prefs.email_address, copy, unsubscribeUrl: unsub });
      await recordDelivery({
        userId,
        kind,
        channel: "email",
        sendDate,
        status: "sent",
      });
    } catch {
      // best effort
    }
  }
  if (prefs.sms_enabled && prefs.phone_e164) {
    try {
      await sendSms({ to: prefs.phone_e164, body: copy.sms });
      await recordDelivery({
        userId,
        kind,
        channel: "sms",
        sendDate,
        status: "sent",
      });
    } catch {
      // best effort
    }
  }
}

function kindEnabled(p: NotificationPreferences, kind: NotificationKind): boolean {
  switch (kind) {
    case "morning_subscript":
      return p.subscript_morning;
    case "evening_subscript":
      return p.subscript_evening;
    case "weekly_pillar":
      return p.weekly_pillar;
    case "letter_delivered":
      return p.letter_delivered;
    case "gone_dark_7":
    case "gone_dark_21":
      return p.gone_dark;
    case "milestone":
      return p.milestone;
  }
}

async function contextFor(
  userId: string,
  kind: NotificationKind,
): Promise<{ name?: string; currentDay?: number }> {
  const rows = await query<{ name: string | null }>(
    `SELECT name FROM users WHERE id = $1`,
    [userId],
  );
  const name = rows[0]?.name ?? undefined;
  if (kind === "milestone" || kind === "morning_subscript" || kind === "evening_subscript") {
    const ch = await getChallengeStatus(userId);
    return { name: name ?? undefined, currentDay: ch.started_at ? ch.current_day : undefined };
  }
  return { name: name ?? undefined };
}

async function alreadySent(
  userId: string,
  kind: NotificationKind,
  sendDate: string,
  channel: "push" | "email" | "sms",
): Promise<boolean> {
  const rows = await query<{ id: string }>(
    `SELECT id::text AS id FROM notification_deliveries
       WHERE user_id = $1 AND kind = $2 AND send_date = $3 AND channel = $4
       LIMIT 1`,
    [userId, kind, sendDate, channel],
  );
  return rows.length > 0;
}

function localDate(tz: string, when: Date): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = fmt.formatToParts(when);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}
