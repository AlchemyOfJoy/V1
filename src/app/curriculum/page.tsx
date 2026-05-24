import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import ModuleMap from "@/components/curriculum/ModuleMap";
import PullQuote from "@/components/curriculum/PullQuote";
import JqTile from "@/components/curriculum/JqTile";

export const metadata: Metadata = {
  title: "Your Curriculum",
  robots: { index: false },
};

interface UserBits {
  name: string | null;
  curriculum_started_at: string | Date | null;
}

export default async function CurriculumDashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const rows = await query<UserBits>(
    "SELECT name, curriculum_started_at FROM users WHERE id = $1",
    [user.id],
  );
  const u = rows[0];

  // First-visit gate: send new users through onboarding once.
  if (!u?.curriculum_started_at) {
    redirect("/curriculum/onboarding");
  }

  const firstName =
    (u?.name ?? "").trim().split(/\s+/)[0] ||
    user.email.split("@")[0];

  return (
    <main className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
      <header>
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
          The Alchemy of Joy™ Curriculum
        </p>
        <h1 className="mt-3 font-serif text-[38px] font-medium leading-tight tracking-tight text-navy sm:text-[44px]">
          Welcome back, <em className="text-cyan-deep">{firstName}</em>.
        </h1>
        <p className="mt-3 max-w-xl font-sans text-[16px] font-light leading-relaxed text-navy/65">
          Read. Reflect. Write. Return. Your work waits for you here.
        </p>
      </header>

      <div className="mt-10 grid gap-4 sm:grid-cols-[1fr_1.2fr]">
        <JqTile userId={user.id} />
        <PullQuote />
      </div>

      <Link
        href="/coach"
        className="group mt-6 flex items-start gap-5 rounded-2xl border border-cyan-deep/30 bg-gradient-to-br from-white via-mist/60 to-mist p-6 transition hover:border-cyan-deep/60 hover:shadow-sm"
      >
        <div
          aria-hidden
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cyan-deep text-[20px] text-white"
        >
          ✦
        </div>
        <div className="flex-1">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-deep">
            Always with you
          </p>
          <h3 className="mt-1 font-serif text-[22px] font-medium text-navy">
            Talk to your <em className="text-cyan-deep">Companion</em>
          </h3>
          <p className="mt-1 font-sans text-[14px] font-light leading-relaxed text-navy/65">
            An AI coach trained on Brent&apos;s book, retreats, and
            methodology — here at three in the morning when you need someone
            who actually knows the work.
          </p>
        </div>
        <span
          aria-hidden
          className="hidden self-center font-sans text-[20px] text-cyan-deep transition group-hover:translate-x-1 sm:inline"
        >
          →
        </span>
      </Link>

      <section className="mt-12">
        <h2 className="font-serif text-[24px] font-medium tracking-tight text-navy">
          Your path
        </h2>
        <p className="mt-2 font-sans text-[14px] font-light text-navy/60">
          Four modules, then the toolkit and the 90-day challenge. Take them
          in order — or follow what&apos;s calling you.
        </p>
        <div className="mt-6">
          <ModuleMap />
        </div>
      </section>
    </main>
  );
}
