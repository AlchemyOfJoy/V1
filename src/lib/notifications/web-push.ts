import webpush from "web-push";
import type { NotificationCopy } from "./copy";

/**
 * VAPID-signed web push delivery. Configured lazily so the app boots
 * without push credentials — they're required only when actually
 * sending a notification (i.e. inside the cron worker).
 *
 * Env vars:
 *   VAPID_PUBLIC_KEY
 *   VAPID_PRIVATE_KEY
 *   VAPID_SUBJECT       (mailto: or https:)
 *
 * Generate a keypair locally with:
 *   npx web-push generate-vapid-keys
 */

let configured = false;
function configure(): void {
  if (configured) return;
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subj = process.env.VAPID_SUBJECT ?? "mailto:hello@alchemyofjoy.com";
  if (!pub || !priv) {
    throw new Error("Web push not configured (missing VAPID keys).");
  }
  webpush.setVapidDetails(subj, pub, priv);
  configured = true;
}

export function publicVapidKey(): string | null {
  return process.env.VAPID_PUBLIC_KEY ?? null;
}

export interface PushSubscriptionShape {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export async function sendWebPush(
  subscription: PushSubscriptionShape,
  copy: NotificationCopy,
): Promise<void> {
  configure();
  const payload = JSON.stringify({
    title: copy.push.title,
    body: copy.push.body,
    url: copy.url,
  });
  await webpush.sendNotification(subscription, payload, { TTL: 60 * 60 * 24 });
}
