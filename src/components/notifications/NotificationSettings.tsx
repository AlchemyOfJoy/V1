"use client";

import { useEffect, useState } from "react";
import { btnPrimary } from "@/lib/ui";

interface Initial {
  push_enabled: boolean;
  has_push_subscription: boolean;
  email_enabled: boolean;
  email_address: string;
  sms_enabled: boolean;
  phone_e164: string;
  morning_time: string;
  evening_time: string;
  timezone: string;
  subscript_morning: boolean;
  subscript_evening: boolean;
  weekly_pillar: boolean;
  letter_delivered: boolean;
  gone_dark: boolean;
  milestone: boolean;
}

const label =
  "font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-navy/55";
const input =
  "w-full rounded-xl border border-navy/15 bg-white px-4 py-2.5 font-sans text-[15px] text-navy outline-none transition placeholder:text-navy/35 focus:border-cyan-deep focus:ring-2 focus:ring-cyan-deep/25";

export default function NotificationSettings({ initial }: { initial: Initial }) {
  const [state, setState] = useState(initial);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pushSupported, setPushSupported] = useState(true);
  const [busy, setBusy] = useState(false);
  const [testMsg, setTestMsg] = useState<string | null>(null);

  useEffect(() => {
    const ok =
      typeof window !== "undefined" &&
      "Notification" in window &&
      "serviceWorker" in navigator &&
      "PushManager" in window;
    setPushSupported(ok);
  }, []);

  async function patch(diff: Partial<Initial>) {
    const next = { ...state, ...diff };
    setState(next);
    setError(null);
    try {
      const res = await fetch("/api/notifications/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(diff),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Couldn't save");
      }
      setSavedAt(new Date());
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function enablePush() {
    setBusy(true);
    setError(null);
    try {
      if (!pushSupported) throw new Error("Push isn't supported on this browser.");
      const perm = await Notification.requestPermission();
      if (perm !== "granted") throw new Error("Permission denied.");
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      const keyRes = await fetch("/api/notifications/push/subscribe");
      if (!keyRes.ok) {
        const data = await keyRes.json().catch(() => ({}));
        throw new Error(data.error ?? "Server isn't ready for push yet.");
      }
      const { publicKey } = await keyRes.json();
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey).buffer as ArrayBuffer,
      });
      const saveRes = await fetch("/api/notifications/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription }),
      });
      if (!saveRes.ok) throw new Error("Couldn't save subscription.");
      setState({ ...state, push_enabled: true, has_push_subscription: true });
      setSavedAt(new Date());
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function disablePush() {
    setBusy(true);
    setError(null);
    try {
      if ("serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        const sub = await reg?.pushManager.getSubscription();
        await sub?.unsubscribe();
      }
      await fetch("/api/notifications/push/subscribe", { method: "DELETE" });
      setState({ ...state, push_enabled: false, has_push_subscription: false });
      setSavedAt(new Date());
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function sendTest() {
    setTestMsg(null);
    setError(null);
    try {
      const res = await fetch("/api/notifications/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "morning_subscript" }),
      });
      const data = await res.json();
      const d = data.summary?.delivered ?? {};
      const channels = ["push", "email", "sms"]
        .filter((c) => (d as Record<string, number>)[c] > 0)
        .join(", ");
      setTestMsg(
        channels
          ? `Sent via ${channels}.`
          : "Nothing was sent — make sure a channel is enabled and configured.",
      );
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="space-y-8">
      {/* Channels */}
      <section className="space-y-5 rounded-3xl border border-navy/10 bg-white p-6">
        <header>
          <h2 className="font-serif text-[22px] font-medium text-navy">Channels</h2>
          <p className="mt-1 font-serif text-[15px] italic text-navy/60">
            Choose where you want to be reached.
          </p>
        </header>

        {/* Browser push */}
        <div className="rounded-2xl border border-navy/10 bg-mist/40 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className={label}>Browser push</p>
              <p className="mt-1 font-serif text-[15px] text-navy">
                {state.push_enabled && state.has_push_subscription
                  ? "Enabled on this device."
                  : "Off."}
              </p>
              {!pushSupported && (
                <p className="mt-1 font-sans text-[12px] text-navy/55">
                  Push isn&apos;t supported in this browser.
                </p>
              )}
            </div>
            {pushSupported &&
              (state.push_enabled && state.has_push_subscription ? (
                <button
                  type="button"
                  onClick={disablePush}
                  disabled={busy}
                  className="rounded-full border border-navy/15 bg-white px-4 py-2 font-sans text-[12px] font-semibold text-navy hover:border-cyan-deep/40 disabled:opacity-50"
                >
                  Turn off
                </button>
              ) : (
                <button
                  type="button"
                  onClick={enablePush}
                  disabled={busy}
                  className="rounded-full bg-cyan-deep px-4 py-2 font-sans text-[12px] font-semibold text-white hover:bg-[#006a8c] disabled:opacity-50"
                >
                  {busy ? "…" : "Enable push"}
                </button>
              ))}
          </div>
        </div>

        {/* Email */}
        <div className="rounded-2xl border border-navy/10 bg-mist/40 p-4">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={state.email_enabled}
              onChange={(e) => patch({ email_enabled: e.target.checked })}
              className="mt-1 h-5 w-5 accent-cyan-deep"
            />
            <div className="flex-1">
              <p className={label}>Email</p>
              <p className="mt-1 font-serif text-[15px] text-navy">
                Quiet, well-spaced messages — never daily marketing.
              </p>
              {state.email_enabled && (
                <input
                  type="email"
                  value={state.email_address}
                  onChange={(e) => setState({ ...state, email_address: e.target.value })}
                  onBlur={() => patch({ email_address: state.email_address })}
                  placeholder="you@example.com"
                  className={`mt-3 ${input}`}
                />
              )}
            </div>
          </label>
        </div>

        {/* SMS */}
        <div className="rounded-2xl border border-navy/10 bg-mist/40 p-4">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={state.sms_enabled}
              onChange={(e) => patch({ sms_enabled: e.target.checked })}
              className="mt-1 h-5 w-5 accent-cyan-deep"
            />
            <div className="flex-1">
              <p className={label}>Text message</p>
              <p className="mt-1 font-serif text-[15px] text-navy">
                One short line per notification. Reply STOP any time.
              </p>
              {state.sms_enabled && (
                <input
                  type="tel"
                  value={state.phone_e164}
                  onChange={(e) => setState({ ...state, phone_e164: e.target.value })}
                  onBlur={() => patch({ phone_e164: state.phone_e164 })}
                  placeholder="+1 415 555 0100"
                  className={`mt-3 ${input}`}
                />
              )}
            </div>
          </label>
        </div>
      </section>

      {/* What you'll receive */}
      <section className="space-y-4 rounded-3xl border border-navy/10 bg-white p-6">
        <header>
          <h2 className="font-serif text-[22px] font-medium text-navy">
            What you&apos;ll receive
          </h2>
          <p className="mt-1 font-serif text-[15px] italic text-navy/60">
            Fewer is more. Pick only what helps.
          </p>
        </header>

        <KindRow
          label="Morning SubScript"
          desc="Set the frequency before the world does."
          checked={state.subscript_morning}
          onChange={(v) => patch({ subscript_morning: v })}
        />
        <KindRow
          label="Evening SubScript"
          desc="Close the day with one more read."
          checked={state.subscript_evening}
          onChange={(v) => patch({ subscript_evening: v })}
        />
        <KindRow
          label="Weekly Pillar check-in"
          desc="Sunday morning · two minutes."
          checked={state.weekly_pillar}
          onChange={(v) => patch({ weekly_pillar: v })}
        />
        <KindRow
          label="Letter delivered"
          desc="When a letter to your future self arrives."
          checked={state.letter_delivered}
          onChange={(v) => patch({ letter_delivered: v })}
        />
        <KindRow
          label="Gentle re-entry"
          desc="Two soft check-ins if you go quiet — then silence."
          checked={state.gone_dark}
          onChange={(v) => patch({ gone_dark: v })}
        />
        <KindRow
          label="Milestones"
          desc="The big moments along the 90-day arc."
          checked={state.milestone}
          onChange={(v) => patch({ milestone: v })}
        />
      </section>

      {/* Schedule */}
      <section className="space-y-4 rounded-3xl border border-navy/10 bg-white p-6">
        <header>
          <h2 className="font-serif text-[22px] font-medium text-navy">When</h2>
          <p className="mt-1 font-serif text-[15px] italic text-navy/60">
            The times your morning and evening nudges fire, in your timezone.
          </p>
        </header>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="morning_time" className={label}>
              Morning
            </label>
            <input
              id="morning_time"
              type="time"
              value={state.morning_time}
              onChange={(e) => setState({ ...state, morning_time: e.target.value })}
              onBlur={() => patch({ morning_time: state.morning_time })}
              className={`mt-2 ${input}`}
            />
          </div>
          <div>
            <label htmlFor="evening_time" className={label}>
              Evening
            </label>
            <input
              id="evening_time"
              type="time"
              value={state.evening_time}
              onChange={(e) => setState({ ...state, evening_time: e.target.value })}
              onBlur={() => patch({ evening_time: state.evening_time })}
              className={`mt-2 ${input}`}
            />
          </div>
        </div>
        <div>
          <label htmlFor="timezone" className={label}>
            Timezone
          </label>
          <input
            id="timezone"
            type="text"
            value={state.timezone}
            onChange={(e) => setState({ ...state, timezone: e.target.value })}
            onBlur={() => patch({ timezone: state.timezone })}
            className={`mt-2 ${input}`}
          />
          <p className="mt-1 font-sans text-[12px] text-navy/45">
            IANA name, e.g. America/Los_Angeles, Europe/Rome, Asia/Tokyo.
          </p>
        </div>
      </section>

      {/* Test + status */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-sans text-[12px] text-navy/55" aria-live="polite">
          {error
            ? error
            : testMsg
              ? testMsg
              : savedAt
                ? `Saved · ${savedAt.toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })}`
                : "Changes save automatically."}
        </p>
        <button
          type="button"
          onClick={sendTest}
          className={btnPrimary}
          disabled={
            !state.push_enabled && !state.email_enabled && !state.sms_enabled
          }
        >
          Send me a test →
        </button>
      </div>
    </div>
  );
}

function KindRow({
  label: text,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 rounded-2xl bg-mist/40 p-4">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-5 w-5 accent-cyan-deep"
      />
      <div className="flex-1">
        <p className="font-sans text-[14px] font-semibold text-navy">{text}</p>
        <p className="mt-0.5 font-sans text-[12px] text-navy/55">{desc}</p>
      </div>
    </label>
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const out = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) out[i] = rawData.charCodeAt(i);
  return out;
}
