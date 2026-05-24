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
import { btnPrimary } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Home",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

interface SubscriptRow {
  is_active: boolean;
  target_date: string | Date | null;
}

interface FirstNameRow {
  name: string | null;
}

export default async function HomePage() {
  const user = (await getCurrentUser())!;
  const [
    drop,
    pulse,
    loop,
    joyItems,
    challenge,
    activeSub,
    firstNameRow,
  ] = await Promise.all([
    todayDrop(),
    getTodayPulse(user.id),
    getTodayLoop(user.id),
    listJoyItems(user.id),
    getChallengeStatus(user.id),
    query<SubscriptRow>(
      `SELECT is_active, target_date FROM subscripts
        WHERE user_id = $1 AND is_active = true LIMIT 1`,
      [user.id],
    ),
    query<FirstNameRow>(`SELECT name FROM users WHERE id = $1`, [user.id]),
  ]);

  const firstName =
    firstNameRow[0]?.name?.split(" ")[0] ?? user.email.split("@")[0];
  const dayNumber = challenge.started_at ? challenge.current_day : null;
  const hasSubscript = activeSub.length > 0;

  // Pick 3 random items from the List of Joy (deterministic per day so
  // it doesn't shuffle on every refresh)
  const threeFromList = (() => {
    if (joyItems.length === 0) return [];
    const seed = new Date().getDate() + new Date().getMonth() * 31;
    const sorted = [...joyItems].sort(
      (a, b) => ((seed + a.content.length) % 17) - ((seed + b.content.length) % 17),
    );
    return sorted.slice(0, 3);
  })();

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 5) return "Still up";
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    if (h < 21) return "Good evening";
    return "Late one";
  })();

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-5 py-8 sm:py-12">
      <header>
        <p className="font-sans text-[13px] font-light text-navy/55">
          {greeting},{" "}
          <span className="font-medium text-navy">{firstName}</span>.
          {dayNumber !== null && (
            <>
              {" "}
              <span className="text-cyan-deep">Day {dayNumber}.</span>
            </>
          )}
        </p>
      </header>

      <CoachCard
        eyebrow="Today's Joy Drop"
        mode="steady"
        body={drop.body}
        source={drop.source ?? undefined}
      />

      {/* Primary action: SubScript morning/evening or build flow */}
      <section className="rounded-3xl border border-navy/12 bg-white p-5">
        {hasSubscript ? (
          <>
            <div className="flex items-baseline justify-between">
              <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-deep">
                {new Date().getHours() < 16
                  ? "Morning SubScript"
                  : "Evening SubScript"}
              </p>
              <span className="font-sans text-[12px] text-navy/45">5 min</span>
            </div>
            <p className="mt-2 font-serif text-[20px] font-medium text-navy">
              Read it out loud. Let it land.
            </p>
            <div className="mt-4">
              <Link
                href="/curriculum/module/02-joyful-operating-system/subscript"
                className={btnPrimary}
              >
                Open SubScript
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-deep">
              The install starts here
            </p>
            <p className="mt-2 font-serif text-[20px] font-medium text-navy">
              Build your <em className="text-cyan-deep">SubScript</em>.
            </p>
            <p className="mt-2 font-sans text-[14px] font-light text-navy/65">
              Twice-daily self-hypnosis. Anchored in a real Joy Spark
              memory. The keystone of the Joyful Operating System®.
            </p>
            <div className="mt-4">
              <Link
                href="/curriculum/module/02-joyful-operating-system/subscript"
                className={btnPrimary}
              >
                Begin
              </Link>
            </div>
          </>
        )}
      </section>

      {/* What's next from the Journey */}
      <WhatsNext />

      {/* Daily ITT loop */}
      <section className="space-y-4 rounded-3xl border border-navy/12 bg-mist/50 p-5">
        <div>
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-deep">
            ITT for today
          </p>
          <p className="mt-1 font-serif text-[18px] font-medium text-navy">
            Intention · Thought · Action
          </p>
        </div>
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
      </section>

      {/* 3 from your List of Joy */}
      <section className="rounded-3xl border border-navy/12 bg-white p-5">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-deep">
          3 from your List of Joy
        </p>
        {threeFromList.length === 0 ? (
          <div className="mt-3">
            <p className="font-sans text-[14px] font-light text-navy/65">
              Empty for now. Tap the{" "}
              <span className="font-semibold">+</span> button anywhere to
              add the first one.
            </p>
            <Link
              href="/curriculum/module/02-joyful-operating-system/list-of-joy"
              className="mt-3 inline-block font-sans text-[13px] font-semibold text-cyan-deep hover:underline"
            >
              Or build your first list →
            </Link>
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {threeFromList.map((j) => (
              <li
                key={String(j.id)}
                className="flex items-start gap-2 font-serif text-[16px] leading-relaxed text-navy"
              >
                <span aria-hidden className="mt-1 text-cyan-deep">
                  ✦
                </span>
                {j.content}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Joy Pulse */}
      <section className="rounded-3xl border border-navy/12 bg-white p-5">
        <JoyPulseControl initialScore={pulse?.score ?? null} />
      </section>

      {/* Gentle preview of the other bookend */}
      {hasSubscript && (
        <p className="text-center font-sans text-[12px] text-navy/45">
          {new Date().getHours() < 16
            ? "Later — Evening SubScript."
            : "Tomorrow morning — start with the SubScript."}
        </p>
      )}
    </div>
  );
}

async function WhatsNext() {
  // Lightweight, async-only — pulls the user's progress + suggests the
  // next clearest step. For now: surface the next incomplete worksheet.
  const user = (await getCurrentUser())!;
  const completed = await query<{ worksheet_id: string }>(
    `SELECT worksheet_id FROM worksheet_responses
       WHERE user_id = $1 AND completed_at IS NOT NULL`,
    [user.id],
  );
  const done = new Set(completed.map((r) => r.worksheet_id));

  // Order matches the JOS install order.
  const path: { id: string; title: string; href: string; min: number }[] = [
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
      title: "List of Joy (deepened)",
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

  if (!next) {
    return (
      <section className="rounded-3xl border border-cyan-deep/30 bg-gradient-to-br from-mist to-white p-5">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-deep">
          You&apos;ve done the install
        </p>
        <p className="mt-2 font-serif text-[18px] font-medium text-navy">
          Now we <em className="text-cyan-deep">run</em> it.
        </p>
        <Link
          href="/journey/take-bold-action"
          className="mt-3 inline-block font-sans text-[13px] font-semibold text-cyan-deep hover:underline"
        >
          Open Take Bold Action →
        </Link>
      </section>
    );
  }
  return (
    <section className="rounded-3xl border border-cyan-deep/30 bg-gradient-to-br from-mist to-white p-5">
      <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-deep">
        What&apos;s next
      </p>
      <p className="mt-2 font-serif text-[20px] font-medium text-navy">
        {next.title}
      </p>
      <p className="mt-1 font-sans text-[13px] text-navy/55">
        {next.min} minutes
      </p>
      <Link href={next.href} className={`${btnPrimary} mt-3 inline-block`}>
        Continue →
      </Link>
    </section>
  );
}
