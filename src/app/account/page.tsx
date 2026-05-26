import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, getUserById } from "@/lib/auth";
import {
  DeleteAccountForm,
  PasswordForm,
  ProfileForm,
} from "@/components/account/AccountForms";
import AccessibilityToggle from "@/components/account/AccessibilityToggle";
import ModeSwitcher from "@/components/account/ModeSwitcher";
import JosStatus from "@/components/account/JosStatus";
import { getChallengeStatus } from "@/lib/challenge";
import { getJosState } from "@/lib/jos";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

/**
 * Settings (JOS-First Architecture §14). Lives inside My Alchemy
 * (no separate Settings tab per UI/UX Overhaul §0). Sections:
 *   • YOUR MODE       — current mode + path-switching controls
 *   • YOUR JOS        — per-component state with deep links
 *   • DAILY RITUALS   — SubScript times + notification preferences
 *   • PROFILE         — name + password
 *   • YOUR DATA       — export, accessibility
 *   • ACCOUNT         — delete account
 */
export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const full = await getUserById(user.id);
  const hasPassword = !!full?.password_hash;
  const [challenge, jos] = await Promise.all([
    getChallengeStatus(user.id),
    getJosState(user.id),
  ]);

  return (
    <main className="mx-auto max-w-2xl px-6 pb-16 pt-10 sm:pt-14">
      <Link
        href="/me"
        className="font-sans text-[12px] text-slate hover:text-cyan"
      >
        ← My Alchemy
      </Link>

      <header className="mt-8">
        <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.26em] text-cyan">
          Settings
        </p>
        <h1 className="mt-4 font-serif text-[44px] font-medium leading-[1.1] tracking-tight text-navy sm:text-[56px]">
          Your <em className="text-cyan">controls</em>.
        </h1>
      </header>

      <div aria-hidden className="my-10 h-px w-16 bg-slate/30" />

      {/* ─── YOUR MODE ─────────────────────────────────────── */}
      <section>
        <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.22em] text-cyan">
          Your mode
        </p>
        <p className="mt-3 font-serif text-[17px] italic leading-relaxed text-slate">
          {modeBlurb(challenge.mode, challenge.current_day)}
        </p>
        <div className="mt-5">
          <ModeSwitcher initialMode={challenge.mode} />
        </div>
      </section>

      <div aria-hidden className="my-10 h-px w-full bg-slate/15" />

      {/* ─── YOUR JOS ──────────────────────────────────────── */}
      <section>
        <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.22em] text-cyan">
          Your JOS
        </p>
        <p className="mt-3 font-serif text-[15px] italic leading-relaxed text-slate">
          {jos.install_completed_at
            ? "Six components installed. Tap any to revisit or edit."
            : `${jos.components_completed.length} of 6 installed.`}
        </p>
        <div className="mt-5">
          <JosStatus userId={user.id} jos={jos} />
        </div>
      </section>

      <div aria-hidden className="my-10 h-px w-full bg-slate/15" />

      {/* ─── DAILY RITUALS ─────────────────────────────────── */}
      <section>
        <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.22em] text-cyan">
          Daily rituals
        </p>
        <p className="mt-3 font-serif text-[15px] italic leading-relaxed text-slate">
          Reminder times, push and email channels.
        </p>
        <Link
          href="/me/notifications"
          className="mt-5 inline-flex items-center gap-2 font-sans text-[12px] font-semibold uppercase tracking-[0.22em] text-cyan hover:text-navy"
        >
          Open notification settings →
        </Link>
      </section>

      <div aria-hidden className="my-10 h-px w-full bg-slate/15" />

      {/* ─── PROFILE + PASSWORD ────────────────────────────── */}
      <section>
        <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.22em] text-cyan">
          Profile
        </p>
        <div className="mt-5">
          <ProfileForm initialName={user.name ?? ""} email={user.email} />
        </div>
      </section>

      <div aria-hidden className="my-10 h-px w-full bg-slate/15" />

      <section>
        <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.22em] text-cyan">
          {hasPassword ? "Change password" : "Set a password"}
        </p>
        <div className="mt-5">
          <PasswordForm hasPassword={hasPassword} />
        </div>
      </section>

      <div aria-hidden className="my-10 h-px w-full bg-slate/15" />

      {/* ─── ACCESSIBILITY ─────────────────────────────────── */}
      <section>
        <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.22em] text-cyan">
          Accessibility
        </p>
        <div className="mt-5">
          <AccessibilityToggle />
        </div>
      </section>

      <div aria-hidden className="my-10 h-px w-full bg-slate/15" />

      {/* ─── YOUR DATA ─────────────────────────────────────── */}
      <section>
        <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.22em] text-cyan">
          Your data
        </p>
        <p className="mt-3 font-serif text-[15px] italic leading-relaxed text-slate">
          Download a full JSON backup any time.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/curriculum/export"
            className="inline-flex items-center justify-center rounded-full border border-slate/30 px-5 py-2.5 font-sans text-[12px] font-semibold uppercase tracking-[0.22em] text-navy transition hover:border-cyan hover:text-cyan"
          >
            Open export →
          </Link>
          <a
            href="/api/curriculum/export"
            className="inline-flex items-center justify-center rounded-full border border-slate/30 px-5 py-2.5 font-sans text-[12px] font-semibold uppercase tracking-[0.22em] text-navy transition hover:border-cyan hover:text-cyan"
          >
            Download JSON
          </a>
        </div>
      </section>

      <div aria-hidden className="my-10 h-px w-full bg-slate/15" />

      {/* ─── DELETE ACCOUNT ────────────────────────────────── */}
      <section>
        <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.22em] text-cyan">
          Delete account
        </p>
        <p className="mt-3 font-serif text-[15px] italic leading-relaxed text-slate">
          Permanently removes your account and every entry you&apos;ve
          written. Download your JSON first if you want a copy.
        </p>
        <div className="mt-5">
          <DeleteAccountForm email={user.email} />
        </div>
      </section>
    </main>
  );
}

function modeBlurb(
  mode:
    | "jos_install"
    | "post_jos"
    | "challenge"
    | "practice"
    | "free",
  currentDay: number,
): string {
  if (mode === "jos_install") return "Currently installing your JOS.";
  if (mode === "post_jos")
    return "Your JOS is installed. Choose Path A (Challenge) or Path B (Practice).";
  if (mode === "challenge") {
    if (currentDay > 90) return "Currently in Practice Mode (post-Challenge).";
    return `Currently on Day ${currentDay} of the 90-Day Challenge.`;
  }
  if (mode === "practice") return "Currently in Practice Mode.";
  return "Currently in Free Mode.";
}
