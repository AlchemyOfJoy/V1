import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getOrCreatePreferences } from "@/lib/notifications/preferences";
import NotificationSettings from "@/components/notifications/NotificationSettings";

export const metadata: Metadata = {
  title: "Notifications",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = (await getCurrentUser())!;
  const prefs = await getOrCreatePreferences(user.id);
  return (
    <main className="mx-auto max-w-2xl space-y-8 px-5 pb-16 pt-8 sm:pt-12">
      <Link
        href="/me"
        className="inline-block font-sans text-[12px] text-navy/55 hover:text-cyan-deep"
      >
        ← Me
      </Link>

      <header>
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
          Quiet by design
        </p>
        <h1 className="mt-2 font-serif text-[36px] font-medium leading-tight tracking-tight text-navy sm:text-[44px]">
          <em className="text-cyan-deep">Notifications</em>
        </h1>
        <p className="mt-3 font-serif text-[17px] italic leading-relaxed text-navy/65">
          Opt in to what you want. Three channels — browser push, email,
          and text. Everything off by default. Never guilt, never urgency.
        </p>
      </header>

      <NotificationSettings
        initial={{
          push_enabled: prefs.push_enabled,
          has_push_subscription: !!prefs.push_subscription,
          email_enabled: prefs.email_enabled,
          email_address: prefs.email_address ?? user.email,
          sms_enabled: prefs.sms_enabled,
          phone_e164: prefs.phone_e164 ?? "",
          morning_time: prefs.morning_time,
          evening_time: prefs.evening_time,
          timezone:
            prefs.timezone ||
            (Intl.DateTimeFormat().resolvedOptions().timeZone ??
              "America/Los_Angeles"),
          subscript_morning: prefs.subscript_morning,
          subscript_evening: prefs.subscript_evening,
          weekly_pillar: prefs.weekly_pillar,
          letter_delivered: prefs.letter_delivered,
          gone_dark: prefs.gone_dark,
          milestone: prefs.milestone,
        }}
      />
    </main>
  );
}
