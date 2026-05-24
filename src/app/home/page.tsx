import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
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
import QuickStartChips from "@/components/home/QuickStartChips";
import TodayCard from "@/components/home/TodayCard";
import TodaysWins from "@/components/home/TodaysWins";
import WelcomeBack from "@/components/home/WelcomeBack";
import { Tridot } from "@/components/app/Wave";
import FavoriteButton from "@/components/library/FavoriteButton";
import { getCheckin } from "@/lib/challenge";
import TeachingMoment from "@/components/app/TeachingMoment";
import { getTutorialFlags } from "@/lib/tutorial-flags";
import UpNextCard from "@/components/home/UpNextCard";
import { getUpNext } from "@/lib/up-next";

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
  // Onboarding gate — anyone who hasn't completed the 7-screen tutorial
  // gets routed there first. Sets the narrative ("you're on Day 1 of
  // a 90-day arc") before they land on Home.
  const onboardCheck = await query<{ curriculum_started_at: string | Date | null }>(
    `SELECT curriculum_started_at FROM users WHERE id = $1`,
    [user.id],
  );
  if (!onboardCheck[0]?.curriculum_started_at) {
    redirect("/curriculum/onboarding");
  }

  const [drop, pulse, loop, joyItems, challenge, activeSub, nameRow, tutorialFlags] =
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
      getTutorialFlags(user.id),
    ]);
  const favRows = await query<{ id: string }>(
    `SELECT id::text AS id FROM quote_favorites
       WHERE user_id = $1 AND quote_id = $2 LIMIT 1`,
    [user.id, drop.id],
  );
  const isFavorited = favRows.length > 0;

  const firstName =
    nameRow[0]?.name?.split(" ")[0] ?? user.email.split("@")[0];
  const dayNumber = challenge.started_at ? challenge.current_day : null;
  const hasSubscript = activeSub.length > 0;

  // Adaptive Home modes (Build Directive §5.1):
  //   • Onboarding Mode — first 7 days. Journey "what's next" dominant,
  //     fewer side-surfaces so the eye doesn't scatter.
  //   • Active Practice Mode — day 8 through completion. Full Home.
  //   • Maintenance Mode — post-Integration. Lighter, SubScript-forward,
  //     no urgent CTAs.
  const homeMode: "onboarding" | "active" | "maintenance" =
    dayNumber === null
      ? "active"
      : dayNumber <= 7
        ? "onboarding"
        : dayNumber > 90
          ? "maintenance"
          : "active";
  const challengeCompleted = homeMode === "maintenance";
  const hour = new Date().getHours();
  const isMorning = hour < 16;
  const todayCheckin = dayNumber !== null ? await getCheckin(user.id, dayNumber) : null;
  const todayLogged = todayCheckin !== null;
  const ittLoopClosed =
    loop !== null && loop.action_status !== null && loop.action_status !== "pending";
  const joyItemsToday = joyItems.filter((j) => {
    const created =
      j.created_at instanceof Date ? j.created_at : new Date(j.created_at);
    return (
      created.toDateString() === new Date().toDateString()
    );
  }).length;

  // Welcome-back signal — gap in days between current_day and last check-in
  const gapRows = await query<{ last_day: number | null }>(
    `SELECT MAX(day_number) AS last_day FROM challenge_checkins WHERE user_id = $1`,
    [user.id],
  );
  const lastCheckinDay = gapRows[0]?.last_day ?? 0;
  const gapDays =
    dayNumber !== null && !todayLogged
      ? Math.max(0, dayNumber - lastCheckinDay - 1)
      : 0;

  // Up Next — the deterministic single-best-next-thing for this user,
  // computed server-side so Home is never empty, never ambiguous.
  const upNext = await getUpNext({
    userId: user.id,
    currentDay: dayNumber,
    todayLogged,
    hasSubscript,
    isMorning,
    challengeCompleted,
  });

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

      {/* Gentle re-entry if user has been gone */}
      {dayNumber !== null && gapDays >= 3 && (
        <WelcomeBack gapDays={gapDays} currentDay={dayNumber} />
      )}

      {/* First-day teaching card — appears once, dismisses for good */}
      {homeMode === "onboarding" && (
        <TeachingMoment
          flag="first_home_visit"
          copy="This is Home. Open it any time you want to feel a little better."
          alreadySeen={tutorialFlags.first_home_visit}
        />
      )}

      {/* THE HERO MOMENT — quote, full bleed, big */}
      <div className="space-y-3">
        <CoachCard
          size="hero"
          eyebrow="Today's Joy Drop"
          body={drop.body}
          source={drop.source ?? undefined}
        />
        {!drop.id.startsWith("studio:") && (
          <div className="flex justify-end">
            <FavoriteButton
              quoteId={drop.id}
              initialSaved={isFavorited}
            />
          </div>
        )}
      </div>

      <Tridot />

      {/* A letter from past self arrived today — top priority. */}
      {upNext.kind === "letter" && <UpNextCard next={upNext} />}

      {/* THE PRIMARY ANCHOR — today's task on the 90-Day arc */}
      {dayNumber !== null && homeMode !== "maintenance" && (
        <TodayCard
          currentDay={dayNumber}
          totalCheckins={challenge.total_checkins}
          todayLogged={todayLogged}
        />
      )}

      {/* Maintenance Mode — challenge complete; show a lighter recap +
       *  a quiet next-step from the fallback chain. */}
      {homeMode === "maintenance" && (
        <>
          <section className="rounded-3xl border border-[#C89A3F]/30 bg-[#FAF6EC] p-6 text-center">
            <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a6d00]">
              The work continues
            </p>
            <p className="mt-2 font-serif text-[18px] italic leading-relaxed text-navy/80">
              You finished the 90-Day arc. The practice is yours now — light,
              daily, on your terms.
            </p>
          </section>
          {upNext.kind !== "letter" && <UpNextCard next={upNext} />}
        </>
      )}

      {/* If Up Next is something other than a day_task / letter — surface it.
       *  TodayCard already covers the day_task case for arc users. */}
      {homeMode !== "maintenance" &&
        upNext.kind !== "letter" &&
        upNext.kind !== "day_task" && <UpNextCard next={upNext} />}

      {/* SubScript daily ritual reminder */}
      <PrimaryAction hasSubscript={hasSubscript} isMorning={isMorning} />

      {/* Quick-start chips — three time-boxed entry points for in-the-moment.
       *  Hidden in Onboarding Mode so the eye stays on the day's task. */}
      {homeMode !== "onboarding" && <QuickStartChips />}

      {/* Joy Pulse — quiet, no header explainer */}
      <section className="rounded-3xl border border-navy/10 bg-white p-5">
        <JoyPulseControl initialScore={pulse?.score ?? null} />
      </section>

      {/* Three from your list — minimal, beautiful. Suppressed in
       *  Onboarding Mode if the user hasn't yet built a list of three. */}
      {!(homeMode === "onboarding" && joyItems.length < 3) && (
        <ThreeJoys items={threeFromList} />
      )}

      {/* What you've done today — the momentum recap */}
      <TodaysWins
        pulseLogged={pulse !== null}
        challengeDayLogged={todayLogged}
        ittLoopClosed={ittLoopClosed}
        joyItemsAddedToday={joyItemsToday}
      />

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

/* The WhatsNext component was replaced by TodayCard — Day N of 90 is
 * now the primary anchor on Home, since the 90-Day Challenge is the
 * spine of how the app is used. */
