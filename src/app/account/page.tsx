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

export const metadata: Metadata = {
  title: "Account",
  robots: { index: false },
};

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const full = await getUserById(user.id);
  const hasPassword = !!full?.password_hash;

  return (
    <main className="px-6 py-12 sm:py-16">
      <article className="mx-auto max-w-2xl space-y-12">
        <header>
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
            Account
          </p>
          <h1 className="mt-3 font-serif text-[40px] font-medium leading-tight tracking-tight text-navy sm:text-[48px]">
            Your <em className="text-cyan-deep">settings</em>
          </h1>
        </header>

        <section className="space-y-4 rounded-3xl border border-navy/10 bg-white p-6 sm:p-8">
          <h2 className="font-serif text-[22px] font-medium text-navy">
            Profile
          </h2>
          <ProfileForm initialName={user.name ?? ""} email={user.email} />
        </section>

        <section className="space-y-4 rounded-3xl border border-navy/10 bg-white p-6 sm:p-8">
          <h2 className="font-serif text-[22px] font-medium text-navy">
            {hasPassword ? "Change password" : "Set a password"}
          </h2>
          <PasswordForm hasPassword={hasPassword} />
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-[22px] font-medium text-navy">
            Accessibility
          </h2>
          <AccessibilityToggle />
        </section>

        <section className="space-y-4 rounded-3xl border border-navy/10 bg-white p-6 sm:p-8">
          <h2 className="font-serif text-[22px] font-medium text-navy">
            Your data
          </h2>
          <p className="font-sans text-[14px] font-light text-navy/65">
            Download a full JSON backup or print a workbook PDF of your
            responses any time.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/curriculum/export"
              className="rounded-full border border-navy/20 px-5 py-2.5 font-sans text-[13px] font-medium text-navy transition hover:border-cyan-deep hover:text-cyan-deep"
            >
              Open export page →
            </Link>
            <a
              href="/api/curriculum/export"
              className="rounded-full border border-navy/20 px-5 py-2.5 font-sans text-[13px] font-medium text-navy transition hover:border-cyan-deep hover:text-cyan-deep"
            >
              Download JSON
            </a>
          </div>
        </section>

        <section className="space-y-4 rounded-3xl border border-[#8a6d00]/30 bg-[#fdf6e0] p-6 sm:p-8">
          <h2 className="font-serif text-[22px] font-medium text-[#8a6d00]">
            Delete account
          </h2>
          <p className="font-sans text-[14px] font-light text-navy/70">
            Permanently removes your account and every entry you&apos;ve
            written — worksheets, journal, forgiveness, snapshots, all of
            it. There&apos;s no undo. Download your JSON first if you want
            a copy.
          </p>
          <DeleteAccountForm email={user.email} />
        </section>

        <footer className="border-t border-navy/10 pt-6">
          <Link
            href="/curriculum"
            className="font-sans text-[13px] text-navy/55 transition-colors hover:text-cyan-deep"
          >
            ← Back to curriculum
          </Link>
        </footer>
      </article>
    </main>
  );
}
