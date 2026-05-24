/**
 * SMS delivery via Twilio's HTTP API. No SDK dep — plain fetch with
 * basic auth.
 *
 * Env vars:
 *   TWILIO_ACCOUNT_SID
 *   TWILIO_AUTH_TOKEN
 *   TWILIO_FROM_NUMBER    (E.164, e.g. +14155550100)
 *
 * If any is missing the send is a no-op so dev / preview environments
 * don't fail. Tone: never urgency, never multiple messages — one short
 * line per kind. Recipient can text STOP to opt out at the carrier
 * level (Twilio handles this automatically).
 */

export async function sendSms(opts: {
  to: string;
  body: string;
}): Promise<{ sent: boolean; sid?: string }> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;

  if (!sid || !token || !from) {
    console.info(
      `[notifications/sms] Twilio not configured — skipping send to ${opts.to}`,
    );
    return { sent: false };
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
  const auth = Buffer.from(`${sid}:${token}`).toString("base64");
  const form = new URLSearchParams({
    To: opts.to,
    From: from,
    Body: opts.body.slice(0, 320),
  });
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Twilio ${res.status}: ${detail.slice(0, 200)}`);
  }
  const data = (await res.json().catch(() => ({}))) as { sid?: string };
  return { sent: true, sid: data.sid };
}
