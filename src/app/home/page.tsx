import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { todayDrop } from "@/lib/daily-drop";
import { getTodayPulse } from "@/lib/joy-pulse";
import { getTodayLoop } from "@/lib/itt-loops";
import { listJoyItems } from "@/lib/list-of-joy";
import { getChallengeStatus } from "@/lib/challenge";
import { query } from "@/lib/db";
import CoachCard from "@/components/app/CoachCard";
import JoyPulseControl from "@/components/home/JoyPulseControl";
import IttLoopControl from "@/components/home/IttLoopControl";
import PrimaryAction from "@/components/home/PrimaryAction";
import { Tridot } from "@/components/app/Wave";

export const metadata: Metadata = {
  title: "Home",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

interface NameRow {
  name: string | null;
}

export default async function HomePage() {
  const user = (await getCurrentUser())!;
  const [drop, pulse, loop, joyItems, challenge, activeSub, nameRow] =
    await Promise.all([
      todayDrop(),
      getTodayPulse(user.id),
      getTodayLoop(user.id),
      listJoyItems(user.id),
      getChallengeStatus(user.id),
      query<{ id: string }>(
        `SELECT id FROM subscripts WHERE user_id = $1 AND is_active = true LIMIT 1`,
        [user.id],
      ),
      query<NameRow>(`SELECT name FROM users WHERE id = $1`, [user.id]),
    ]);

  const firstName =
    nameRow[0]?.name?.split(" ")[0] ?? user.email.split("@")[0];
  const dayNumber = challenge.started_at ? challenge.current_day : null;
  const hasSubscript = activeSub.length > 0;
  const hour = new Date().getHours();
  const isMorning = hour < 16;

  // Deterministic 3-from-list pick
  const threeFromList = (() => {
    if (joyItems.length === 0) return [];
    const seed = new Date().getDate() + new Date().getMonth() * 31;
    const shuffled = [...joyItems].sort(
      (a, b) => ((seed + a.content.length) % 17) - ((seed + b.content.length) % 17),
    );
    return shuffled.slice(0, 3);
  })();

  return (
    <div className="mx-auto max-w-2xl space-y-7 px-5 pb-12 pt-6 sm:pt-10">
      {/* Quiet greeting — no big header, no day marker hierarchy noise */}
      <header className="flex items-baseline justify-between">
        <p className="font-sans text-[13px] text-navy/55">
          <span className="font-medium text-navy">{firstName}</span>
        </p>
        {dayNumber !== null && (
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-deep">
            Day {dayNumber}
          </p>
        )}
      </header>

      {/* THE HERO MOMENT — quote, full bleed, big */}
      <CoachCard
        size="hero"
        eyebrow="Today's Joy Drop"
        body={drop.body}
        source={drop.source ?? undefined}
      />

      <Tridot />

      {/* THE SINGLE PRIMARY ACTION */}
      <PrimaryAction hasSubscript={hasSubscript} isMorning={isMorning} />

      {/* WHAT'S NEXT (compact pill) */}
      <WhatsNext />

      {/* Joy Pulse — quiet, no header explainer */}
      <section className="rounded-3xl border border-navy/10 bg-white p-5">
        <JoyPulseControl initialScore={pulse?.score ?? null} />
      </section>

      {/* Three from your list — minimal, beautiful */}
      <ThreeJoys items={threeFromList} />

      {/* ITT loop — collapsed by default behind a details */}
      <details className="group rounded-3xl border border-navy/10 bg-mist/30 px-5 py-4">
        <summary className="flex cursor-pointer list-none items-center justify-between font-sans text-[12px] font-semibold uppercase tracking-[0.2em] text-cyan-deep">
          ITT for today
          <span className="text-navy/40 transition group-open:rotate-180">
            ▾
          </span>
        </summary>
        <div className="mt-4">
          <IttLoopControl
            initial={
              loop
                ? {
                    intention: loop.intention,
                    thought: loop.thought,
                    action: loop.action,
                    action_status: loop.action_status,
                    evening_notes: loop.evening_notes,
                  }
                : null
            }
          />
        </div>
      </details>
    </div>
  );
}

function ThreeJoys({ items }: { items: { id: string; content: string }[] }) {
  if (items.length === 0) {
    return (
      <Link
        href="/curriculum/module/02-joyful-operating-system/list-of-joy"
        className="block rounded-3xl border border-dashed border-navy/15 bg-white px-5 py-6 text-center transition hover:border-cyan-deep/40"
      >
        <p
          aria-hidden
          className="text-[24px] leading-none text-gold"
        >
          ✦
        </p>
        <p className="mt-2 font-serif text-[16px] italic text-navy/65">
          Start your List of Joy
        </p>
        <p className="mt-1 font-sans text-[11px] uppercase tracking-[0.18em] text-cyan-deep">
          Tap to begin →
        </p>
      </Link>
    );
  }
  return (
    <section className="rounded-3xl border border-navy/10 bg-white p-5">
      <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-deep">
        Three from your list
      </p>
      <ul className="mt-3 space-y-2.5">
        {items.map((j) => (
          <li
            key={String(j.id)}
            className="flex items-start gap-3 font-serif text-[16px] leading-snug text-navy"
          >
            <span aria-hidden className="mt-0.5 text-[12px] text-gold">
              ✦
            </span>
            {j.content}
          </li>
        ))}
      </ul>
    </section>
  );
}

async function WhatsNext() {
  const user = (await getCurrentUser())!;
  const completed = await query<{ worksheet_id: string }>(
    `SELECT worksheet_id FROM worksheet_responses
       WHERE user_id = $1 AND completed_at IS NOT NULL`,
    [user.id],
  );
  const done = new Set(completed.map((r) => r.worksheet_id));
  const path = [
    {
      id: "02_core_narrative",
      title: "Core Narrative",
      href: "/curriculum/module/02-joyful-operating-system/core-narrative",
      min: 45,
    },
    {
      id: "02_self_eulogy",
      title: "Self-Eulogy",
      href: "/curriculum/module/02-joyful-operating-system/self-eulogy",
      min: 60,
    },
    {
      id: "02_list_of_joy",
      title: "List of Joy",
      href: "/curriculum/module/02-joyful-operating-system/list-of-joy",
      min: 20,
    },
    {
      id: "02_priority_pillars",
      title: "Priority Pillars",
      href: "/curriculum/module/02-joyful-operating-system/priority-pillars",
      min: 15,
    },
    {
      id: "02_subscript",
      title: "SubScript",
      href: "/curriculum/module/02-joyful-operating-system/subscript",
      min: 30,
    },
  ];
  const next = path.find((p) => !done.has(p.id));
  if (!next) return null;

  return (
    <Link
      href={next.href}
      className="flex items-center justify-between gap-4 rounded-2xl bg-mist px-5 py-3.5 transition hover:bg-mist/70"
    >
      <div className="min-w-0 flex-1">
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-navy/45">
          Next on the journey
        </p>
        <p className="mt-0.5 truncate font-serif text-[17px] font-medium text-navy">
          {next.title}
          <span className="ml-2 font-sans text-[12px] font-light text-navy/45">
            {next.min} min
          </span>
        </p>
      </div>
      <span className="text-[20px] text-cyan-deep">→</span>
    </Link>
  );
}
