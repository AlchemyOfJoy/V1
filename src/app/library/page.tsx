import type { Metadata } from "next";
import Link from "next/link";
import { todayDrop } from "@/lib/daily-drop";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import CoachCard from "@/components/app/CoachCard";
import QuoteBrowser from "@/components/library/QuoteBrowser";
import { Tridot } from "@/components/app/Wave";

export const metadata: Metadata = {
  title: "Library",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

const MOODS = [
  { label: "Stuck", color: "bg-navy/8 text-navy" },
  { label: "Anxious", color: "bg-cyan-deep/10 text-cyan-deep" },
  { label: "Tired", color: "bg-mist text-navy/70" },
  { label: "Sad", color: "bg-navy/8 text-navy" },
  { label: "Numb", color: "bg-mist text-navy/70" },
  { label: "Lost", color: "bg-navy/8 text-navy" },
  { label: "Grieving", color: "bg-navy/8 text-navy" },
  { label: "Angry", color: "bg-gold/15 text-[#8a6d00]" },
  { label: "Curious", color: "bg-cyan-deep/10 text-cyan-deep" },
  { label: "Inspired", color: "bg-gold/15 text-[#8a6d00]" },
];

export default async function LibraryPage() {
  const user = await getCurrentUser();
  const drop = await todayDrop();
  const favoriteRows = user
    ? await query<{ quote_id: string }>(
        `SELECT quote_id FROM quote_favorites WHERE user_id = $1`,
        [user.id],
      )
    : [];
  const favoriteIds = favoriteRows.map((r) => r.quote_id);

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-5 pb-12 pt-6 sm:pt-10">
      <header>
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
          Library
        </p>
        <h1 className="mt-2 font-serif text-[32px] font-medium leading-tight tracking-tight text-navy sm:text-[40px]">
          Brent&apos;s <em className="text-cyan-deep">words</em>
        </h1>
      </header>

      {/* Courses entry */}
      <Link
        href="/courses"
        className="group flex items-center justify-between gap-4 rounded-2xl border border-cyan-deep/25 bg-gradient-to-br from-mist to-white px-5 py-4 transition hover:border-cyan-deep/60"
      >
        <div>
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-deep">
            Deep dives
          </p>
          <p className="mt-1 font-serif text-[18px] font-medium text-navy">
            Structured courses
          </p>
        </div>
        <span aria-hidden className="text-[20px] text-cyan-deep transition group-hover:translate-x-1">
          →
        </span>
      </Link>

      {/* Hero: today's drop, big */}
      <CoachCard
        size="hero"
        eyebrow="Today"
        body={drop.body}
        source={drop.source ?? undefined}
      />

      <Tridot />

      {/* Browse by mood — visual chip cloud */}
      <section>
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-navy/55">
          Where are you right now?
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {MOODS.map((m) => (
            <Link
              key={m.label}
              href={`/library/mood/${m.label.toLowerCase()}`}
              className={`rounded-full px-4 py-2 font-serif text-[15px] italic transition hover:scale-[1.03] ${m.color}`}
            >
              {m.label}
            </Link>
          ))}
        </div>
      </section>

      <Tridot />

      {/* All quotes — searchable */}
      <section>
        <h2 className="font-serif text-[22px] font-medium tracking-tight text-navy">
          100 lines from the book
        </h2>
        <p className="mt-1 font-sans text-[12px] font-light text-navy/55">
          Search any word. Filter by ITT pillar.
        </p>
        <div className="mt-5">
          <QuoteBrowser initialFavoriteIds={favoriteIds} />
        </div>
      </section>
    </div>
  );
}
