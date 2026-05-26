"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { btnPrimary } from "@/lib/ui";
import { useCelebrate } from "@/components/celebrate/CelebrationProvider";
import { queuedFetch } from "@/lib/offline-queue";
import FavoriteButton from "@/components/library/FavoriteButton";
import type { SessionCard } from "@/lib/daily-session";

/**
 * The Daily Session — one full-screen card at a time, sequenced as a
 * guided arc (Flow Overhaul Directive §3).
 *
 * The user advances with the primary CTA. They can step back with the
 * arrow at top-left. A progress row of dots at top shows where in the
 * arc they are — never a number, just visual rhythm.
 */
export default function DailySession({
  cards,
}: {
  cards: SessionCard[];
}) {
  const [idx, setIdx] = useState(0);
  const card = cards[idx];
  const next = () => setIdx((i) => Math.min(i + 1, cards.length - 1));
  const back = () => setIdx((i) => Math.max(i - 1, 0));
  if (!card) return null;

  return (
    <main className="relative mx-auto flex min-h-[calc(100vh-4rem-4rem)] max-w-md flex-col px-6 pb-20 pt-6 sm:pt-8">
      {/* Progress dots + back */}
      <header className="mb-8 flex items-center gap-4">
        <button
          type="button"
          onClick={back}
          disabled={idx === 0}
          aria-label="Back"
          className="flex h-9 w-9 items-center justify-center rounded-full text-navy/55 transition hover:bg-mist hover:text-navy disabled:opacity-30"
        >
          ←
        </button>
        <ol className="flex flex-1 items-center gap-1.5" aria-label="Progress">
          {cards.map((_, i) => (
            <li
              key={i}
              aria-current={i === idx ? "step" : undefined}
              className={`h-1 flex-1 rounded-full transition ${
                i < idx
                  ? "bg-cyan-deep"
                  : i === idx
                    ? "bg-cyan-deep/60"
                    : "bg-navy/10"
              }`}
            />
          ))}
        </ol>
      </header>

      <section className="flex flex-1 flex-col">
        {renderCard(card, next)}
      </section>
    </main>
  );
}

function renderCard(card: SessionCard, advance: () => void): React.ReactNode {
  const p = (card.payload ?? {}) as Record<string, unknown>;
  switch (card.kind) {
    case "letter":
      return <LetterCard letterId={String(p.letterId ?? "")} />;
    case "missed_days":
      return (
        <MissedDaysCard
          currentDay={Number(p.currentDay ?? 1)}
          gap={Number(p.gap ?? 0)}
          onAdvance={advance}
        />
      );
    case "greeting":
      return (
        <GreetingCard
          firstName={String(p.firstName ?? "")}
          currentDay={(p.currentDay as number | null) ?? null}
          mode={String(p.mode ?? "challenge") as "challenge" | "practice" | "free" | "jos_install" | "post_jos"}
          isGraduated={Boolean(p.isGraduated)}
          drop={p.drop as { id: string; body: string; source?: string | null; saved: boolean }}
          onAdvance={advance}
        />
      );
    case "joy_pulse":
      return <JoyPulseCard onAdvance={advance} />;
    case "morning_ritual":
      return (
        <MorningRitualCard
          hasSubscript={Boolean(p.hasSubscript)}
          onAdvance={advance}
        />
      );
    case "evening_ritual":
      return (
        <EveningRitualCard
          hasSubscript={Boolean(p.hasSubscript)}
          onAdvance={advance}
        />
      );
    case "whats_next":
      return (
        <WhatsNextCard
          eyebrow={String(p.eyebrow ?? "")}
          title={String(p.title ?? "")}
          subtitle={String(p.subtitle ?? "")}
          href={String(p.href ?? "/journey")}
          primaryLabel={String(p.primaryLabel ?? "Begin")}
          estimatedMin={p.estimatedMin as number | undefined}
          isMilestone={Boolean(p.isMilestone)}
          coachCard={
            (p.coachCard as { trigger: string; copy: string } | null) ?? null
          }
          onSkip={advance}
        />
      );
    case "jos_install_day":
      return (
        <JosInstallDayCard
          dayOffset={Number(p.dayOffset ?? 0)}
          componentNumber={Number(p.componentNumber ?? 1)}
          eyebrow={String(p.eyebrow ?? "")}
          title={String(p.title ?? "")}
          description={String(p.description ?? "")}
          estimatedMin={Number(p.estimatedMin ?? 0)}
          href={String(p.href ?? "/me")}
          completedCount={Number(p.completedCount ?? 0)}
          onSkip={advance}
        />
      );
    case "jos_integration_day":
      return (
        <JosIntegrationDayCard
          dayOffset={Number(p.dayOffset ?? 0)}
          completedCount={Number(p.completedCount ?? 0)}
          onAdvance={advance}
        />
      );
    case "jos_complete":
      return <JosCompleteCard onAdvance={advance} />;
    case "path_choice":
      return <PathChoiceCard />;
    case "rest_day":
      return (
        <RestDayCard
          day={Number(p.day ?? 1)}
          phase={(p.phase as string | null) ?? null}
          onAdvance={advance}
        />
      );
    case "practice_suggestion":
      return (
        <WhatsNextCard
          eyebrow={String(p.eyebrow ?? "")}
          title={String(p.title ?? "")}
          subtitle={String(p.subtitle ?? "")}
          href={String(p.href ?? "/toolkit")}
          primaryLabel={String(p.primaryLabel ?? "Begin")}
          estimatedMin={p.estimatedMin as number | undefined}
          onSkip={advance}
        />
      );
    case "free_invite":
      return <FreeInviteCard onAdvance={advance} />;
    case "graduation":
      return <GraduationCard onAdvance={advance} />;
    case "joy_glimpse":
      return (
        <JoyGlimpseCard
          samples={(p.samples as { id: string; content: string }[]) ?? []}
          onAdvance={advance}
        />
      );
    case "close":
      return (
        <CloseCard
          isEvening={Boolean(p.isEvening)}
          mode={String(p.mode ?? "challenge") as "challenge" | "practice" | "free" | "jos_install" | "post_jos"}
          currentDay={(p.currentDay as number | null) ?? null}
          nextDay={(p.nextDay as number | null) ?? null}
          closingLine={(p.closingLine as string | null) ?? null}
          todayLogged={Boolean(p.todayLogged)}
          milestoneTier={
            (p.milestoneTier as
              | "glow"
              | "bloom"
              | "ascension"
              | null) ?? null
          }
        />
      );
  }
}

/* ---------------- card components ---------------- */

function LetterCard({ letterId }: { letterId: string }) {
  return (
    <div className="flex flex-1 flex-col">
      <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-[#8a6d00]">
        A letter arrived
      </p>
      <h1 className="mt-4 font-serif text-[36px] font-medium leading-tight text-navy">
        From your past self.
      </h1>
      <p className="mt-4 font-serif text-[18px] italic leading-relaxed text-navy/70">
        You wrote this. It&apos;s been waiting for today.
      </p>
      <div className="mt-auto pt-12">
        <Link
          href={`/me/letters?open=${encodeURIComponent(letterId)}`}
          className={btnPrimary}
        >
          Open it →
        </Link>
      </div>
    </div>
  );
}

function GreetingCard({
  firstName,
  currentDay,
  mode,
  isGraduated,
  drop,
  onAdvance,
}: {
  firstName: string;
  currentDay: number | null;
  mode:
    | "challenge"
    | "practice"
    | "free"
    | "jos_install"
    | "post_jos";
  isGraduated: boolean;
  drop: { id: string; body: string; source?: string | null; saved: boolean };
  onAdvance: () => void;
}) {
  const hour = new Date().getHours();
  const greeting = hour < 5 ? "Late night," : hour < 12 ? "Good morning," : hour < 18 ? "Hello," : "Good evening,";
  // Mode-aware day marker (Cadence Directive §3.1 / §4.1 + JOS-First §12)
  let dayMarker: string | null = null;
  if (mode === "jos_install") {
    dayMarker = "Installing your JOS";
  } else if (mode === "post_jos") {
    dayMarker = "JOS installed";
  } else if (mode === "challenge" && currentDay !== null && !isGraduated) {
    dayMarker = `Day ${currentDay} of your Challenge`;
  } else if (mode === "practice" || isGraduated) {
    dayMarker = currentDay && currentDay > 90 ? `Day ${currentDay - 90} post-install` : "The practice";
  } else if (mode === "free") {
    dayMarker = "Exploring";
  }
  return (
    <div className="flex flex-1 flex-col">
      <p className="font-serif text-[32px] font-medium leading-tight text-navy">
        {greeting} {firstName}.
      </p>
      {dayMarker && (
        <p className="mt-1 font-sans text-[12px] font-semibold uppercase tracking-[0.22em] text-cyan-deep">
          {dayMarker}
        </p>
      )}
      <hr className="my-6 w-12 border-navy/15" />

      <div className="space-y-4">
        <p aria-hidden className="text-[28px] text-gold">
          ✦
        </p>
        <p className="font-serif text-[22px] italic leading-[1.45] text-navy">
          “{drop.body}”
        </p>
        {drop.source && (
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-navy/45">
            — {drop.source}
          </p>
        )}
      </div>

      <div className="mt-auto pt-10 space-y-4">
        {!drop.id.startsWith("studio:") && (
          <FavoriteButton quoteId={drop.id} initialSaved={drop.saved} />
        )}
        <button type="button" onClick={onAdvance} className={btnPrimary}>
          Begin →
        </button>
      </div>
    </div>
  );
}

function JoyPulseCard({ onAdvance }: { onAdvance: () => void }) {
  const [score, setScore] = useState<number>(7);
  const [saving, setSaving] = useState(false);
  const { celebrate } = useCelebrate();
  const router = useRouter();

  async function log() {
    setSaving(true);
    try {
      const res = await queuedFetch("/api/joy-pulse", {
        method: "POST",
        kind: "joy-pulse",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score }),
      });
      const data = await res.json().catch(() => ({}));
      if (!data?.queued) {
        celebrate({
          size: "micro",
          primary: "Pulse logged. We’ll ask again tomorrow.",
        });
      } else {
        window.dispatchEvent(new Event("aoj:queued"));
      }
      router.refresh();
      setTimeout(onAdvance, 700);
    } catch {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <p className="font-serif text-[28px] font-medium leading-tight text-navy">
        Before we begin.
      </p>
      <hr className="my-5 w-12 border-navy/15" />
      <p className="font-serif text-[18px] leading-relaxed text-navy/75">
        How are you feeling right now?
      </p>

      <div className="mt-10 text-center">
        <p className="font-serif text-[88px] font-medium tabular-nums leading-none text-cyan-deep">
          {score}
        </p>
        <p className="mt-1 font-sans text-[11px] uppercase tracking-[0.22em] text-navy/45">
          out of 10
        </p>
      </div>

      <input
        type="range"
        min={1}
        max={10}
        value={score}
        onChange={(e) => setScore(Number(e.target.value))}
        className="mt-10 w-full accent-cyan-deep"
        aria-label="Joy Pulse score"
      />
      <div className="mt-1 flex justify-between font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-navy/45">
        <span>1</span>
        <span>10</span>
      </div>

      <div className="mt-auto pt-10">
        <button
          type="button"
          onClick={log}
          disabled={saving}
          className={btnPrimary}
        >
          {saving ? "…" : "Log it →"}
        </button>
      </div>
    </div>
  );
}

function MorningRitualCard({
  hasSubscript,
  onAdvance,
}: {
  hasSubscript: boolean;
  onAdvance: () => void;
}) {
  if (hasSubscript) {
    return (
      <div className="flex flex-1 flex-col">
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
          The morning ritual
        </p>
        <h1 className="mt-4 font-serif text-[28px] font-medium leading-tight text-navy">
          Read your SubScript.
        </h1>
        <p className="mt-4 font-serif text-[17px] italic leading-relaxed text-navy/70">
          Five minutes. Set the frequency before the world does.
        </p>
        <div className="mt-auto pt-12 space-y-3">
          <Link
            href="/curriculum/module/02-joyful-operating-system/subscript"
            className={btnPrimary}
          >
            Read it →
          </Link>
          <button
            type="button"
            onClick={onAdvance}
            className="block w-full font-sans text-[12px] font-semibold text-navy/55 hover:text-navy"
          >
            Skip for now
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-1 flex-col">
      <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
        Today&apos;s intention
      </p>
      <h1 className="mt-4 font-serif text-[28px] font-medium leading-tight text-navy">
        One intention. One thought. One action.
      </h1>
      <p className="mt-4 font-serif text-[17px] italic leading-relaxed text-navy/70">
        Sixty seconds to set the day.
      </p>
      <div className="mt-auto pt-12 space-y-3">
        <Link href="/home#itt" className={btnPrimary}>
          Set today →
        </Link>
        <button
          type="button"
          onClick={onAdvance}
          className="block w-full font-sans text-[12px] font-semibold text-navy/55 hover:text-navy"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

function EveningRitualCard({
  hasSubscript,
  onAdvance,
}: {
  hasSubscript: boolean;
  onAdvance: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
        Close the day
      </p>
      <h1 className="mt-4 font-serif text-[28px] font-medium leading-tight text-navy">
        {hasSubscript ? "Evening SubScript." : "How did today land?"}
      </h1>
      <p className="mt-4 font-serif text-[17px] italic leading-relaxed text-navy/70">
        {hasSubscript
          ? "Read it once more. Let the day settle."
          : "A short reflection before sleep."}
      </p>
      <div className="mt-auto pt-12 space-y-3">
        <Link
          href={
            hasSubscript
              ? "/curriculum/module/02-joyful-operating-system/subscript"
              : "/home#itt"
          }
          className={btnPrimary}
        >
          {hasSubscript ? "Read it →" : "Reflect →"}
        </Link>
        <button
          type="button"
          onClick={onAdvance}
          className="block w-full font-sans text-[12px] font-semibold text-navy/55 hover:text-navy"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

function WhatsNextCard({
  eyebrow,
  title,
  subtitle,
  href,
  primaryLabel,
  estimatedMin,
  isMilestone,
  coachCard,
  onSkip,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  href: string;
  primaryLabel: string;
  estimatedMin?: number;
  isMilestone?: boolean;
  coachCard?: { trigger: string; copy: string } | null;
  onSkip: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <p
        className={`font-sans text-[10px] font-semibold uppercase tracking-[0.26em] ${
          isMilestone ? "text-[#8a6d00]" : "text-cyan-deep"
        }`}
      >
        {eyebrow}
        {isMilestone ? " · milestone" : ""}
      </p>
      <h1 className="mt-4 font-serif text-[28px] font-medium leading-tight text-navy">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-4 font-serif text-[17px] italic leading-relaxed text-navy/70">
          {subtitle}
        </p>
      )}
      {typeof estimatedMin === "number" && (
        <p className="mt-3 font-sans text-[11px] uppercase tracking-[0.22em] text-navy/45">
          ~{estimatedMin} min
        </p>
      )}
      {/* Mid-flow coach card from Brent — surfaces today's contextual
          nudge inline so the user sees it without leaving the arc. */}
      {coachCard && (
        <aside className="mt-6 border-l-2 border-cyan/60 pl-4">
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan">
            From Brent
          </p>
          <p className="mt-1.5 font-serif text-[15px] italic leading-relaxed text-navy/80">
            “{coachCard.copy}”
          </p>
        </aside>
      )}
      <div className="mt-auto pt-12 space-y-3">
        <Link href={href} className={btnPrimary}>
          {primaryLabel} →
        </Link>
        <button
          type="button"
          onClick={onSkip}
          className="block w-full font-sans text-[12px] font-semibold text-navy/55 hover:text-navy"
        >
          Skip for today
        </button>
      </div>
    </div>
  );
}

function JoyGlimpseCard({
  samples,
  onAdvance,
}: {
  samples: { id: string; content: string }[];
  onAdvance: () => void;
}) {
  const [adding, setAdding] = useState(false);
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  // Save-sequence stages — the exact 2-second sequence from UI/UX
  // Overhaul §6.3. null = no save in progress.
  const [saved, setSaved] = useState<{
    text: string;
    count: number | null;
    stage: 0 | 1 | 2 | 3;
  } | null>(null);
  const router = useRouter();
  const { celebrate } = useCelebrate();

  async function add() {
    const text = content.trim();
    if (!text) return;
    setBusy(true);
    try {
      const res = await queuedFetch("/api/curriculum/list-of-joy", {
        method: "POST",
        kind: "list-of-joy",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      const data = await res.json().catch(() => ({}));
      const milestoneCount =
        data?.milestone && typeof data.milestone.count === "number"
          ? (data.milestone.count as number)
          : null;

      // Milestone crossings get the Bloom celebration overlay (saved
      // as Memory Stone). Normal adds use the 2-second §6.3 sequence
      // inline. Either way, the queued path falls straight through.
      if (data?.queued) {
        setContent("");
        setAdding(false);
        setBusy(false);
        setTimeout(onAdvance, 700);
        return;
      }
      if (data?.milestone) {
        celebrate({
          size: "milestone",
          eyebrow: "List of Joy",
          primary: data.milestone.label,
          secondary: "Keep going.",
        });
        router.refresh();
        setContent("");
        setAdding(false);
        setBusy(false);
        setTimeout(onAdvance, 800);
        return;
      }

      // The 2-second save sequence (UI/UX Overhaul §6.3):
      //   t=0     entry text fades in centered, cyan glow expands
      //   t=600   "Now you have N things that bring you joy."
      //   t=900   Triple Sparkle ✦ above
      //   t=1100  haptic
      //   t=1800  everything fades out
      //   t=2000  return to card
      setContent("");
      setAdding(false);
      setSaved({ text, count: milestoneCount, stage: 0 });
      setTimeout(() => setSaved((s) => (s ? { ...s, stage: 1 } : s)), 300);
      setTimeout(() => setSaved((s) => (s ? { ...s, stage: 2 } : s)), 600);
      setTimeout(() => setSaved((s) => (s ? { ...s, stage: 3 } : s)), 900);
      setTimeout(() => {
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          try {
            navigator.vibrate(20);
          } catch {
            // best effort
          }
        }
      }, 1100);
      setTimeout(() => {
        router.refresh();
        setSaved(null);
        onAdvance();
      }, 2000);
    } finally {
      setBusy(false);
    }
  }

  // Render the 2-second sequence overlay (replaces card content while
  // the save sequence plays).
  if (saved) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <p
          className={`font-serif text-[28px] italic leading-snug text-navy transition-opacity duration-[300ms] ${
            saved.stage >= 0 ? "opacity-100" : "opacity-0"
          }`}
        >
          {saved.text}
        </p>
        <p
          className={`mt-6 font-sans text-[14px] font-light text-slate transition-opacity duration-[300ms] ${
            saved.stage >= 2 ? "opacity-100" : "opacity-0"
          }`}
        >
          {saved.count !== null
            ? `Now you have ${saved.count} things that bring you joy.`
            : "On the list."}
        </p>
        <p
          aria-hidden
          className={`mt-6 font-serif text-[36px] text-gold transition-opacity duration-[300ms] ${
            saved.stage >= 3 ? "opacity-100" : "opacity-0"
          }`}
        >
          ✦
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
        From your List of Joy
      </p>
      <h1 className="mt-4 font-serif text-[26px] font-medium leading-tight text-navy">
        {samples.length > 0
          ? "Three things, on the record."
          : "Start your list today."}
      </h1>

      {samples.length > 0 && (
        <ul className="mt-6 space-y-3 font-serif text-[18px] leading-snug text-navy">
          {samples.map((j) => (
            <li key={j.id} className="flex items-start gap-3">
              <span aria-hidden className="mt-1 text-[14px] text-gold">
                ✦
              </span>
              {j.content}
            </li>
          ))}
        </ul>
      )}

      <p className="mt-8 font-serif text-[16px] italic text-navy/65">
        What&apos;s making you smile today?
      </p>

      {adding && (
        <textarea
          autoFocus
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          maxLength={280}
          placeholder="The morning light…"
          className="mt-3 w-full resize-y rounded-2xl border border-navy/15 bg-white px-4 py-3 font-serif text-[16px] leading-relaxed text-navy outline-none focus:border-cyan-deep focus:ring-2 focus:ring-cyan-deep/25"
        />
      )}

      <div className="mt-auto pt-10 space-y-3">
        {adding ? (
          <button
            type="button"
            onClick={add}
            disabled={busy || !content.trim()}
            className={btnPrimary}
          >
            {busy ? "…" : "Add ✦"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className={btnPrimary}
          >
            + Add one
          </button>
        )}
        <button
          type="button"
          onClick={onAdvance}
          className="block w-full font-sans text-[12px] font-semibold text-navy/55 hover:text-navy"
        >
          Skip
        </button>
      </div>
    </div>
  );
}

type CompletionResult = {
  ok: boolean;
  dayCompleted: number;
  nextDay: number | null;
  isMonthEnd: boolean;
  isFinalDay: boolean;
  showAccelerationWarning: boolean;
};

function CloseCard({
  isEvening,
  mode,
  currentDay,
  nextDay,
  closingLine,
  todayLogged,
  milestoneTier,
}: {
  isEvening: boolean;
  mode:
    | "challenge"
    | "practice"
    | "free"
    | "jos_install"
    | "post_jos";
  currentDay: number | null;
  nextDay: number | null;
  closingLine: string | null;
  todayLogged: boolean;
  milestoneTier: "glow" | "bloom" | "ascension" | null;
}) {
  const router = useRouter();
  const { celebrate } = useCelebrate();
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<"idle" | "acceleration" | "fast_warning">(
    "idle",
  );
  const [completion, setCompletion] = useState<CompletionResult | null>(null);

  const headline =
    mode === "challenge" && currentDay !== null
      ? todayLogged
        ? `That's Day ${currentDay}.`
        : `Day ${currentDay} is ready.`
      : "That's it.";
  const subline =
    mode === "challenge" && nextDay
      ? `See you tomorrow for Day ${nextDay}.`
      : isEvening
        ? "Sleep well. Tomorrow’s already waiting."
        : "Come back anytime you need a Reset Breath. ⚡";

  async function markComplete() {
    if (busy || currentDay === null) return;
    setBusy(true);
    try {
      const res = await fetch("/api/me/complete-day", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day: currentDay }),
      });
      const data = (await res.json().catch(() => null)) as CompletionResult | null;
      if (!data?.ok) {
        setBusy(false);
        return;
      }
      setCompletion(data);

      // Day 90 → route to the Ascension ceremony route.
      if (data.isFinalDay) {
        router.push("/day-90");
        router.refresh();
        return;
      }

      // Fire a Bloom celebration for monthly checkpoints + week-ends.
      const tier = milestoneTier ?? (data.isMonthEnd ? "bloom" : null);
      if (tier === "bloom" || tier === "ascension") {
        celebrate({
          size: "milestone",
          eyebrow: data.isMonthEnd ? "Month complete" : "Week complete",
          primary: data.isMonthEnd
            ? `${data.dayCompleted} days in. Re-take JQ. Re-score Pillars.`
            : `Day ${data.dayCompleted}.`,
          secondary: data.isMonthEnd
            ? "The system is compounding."
            : "See you tomorrow.",
        });
      } else if (tier === "glow") {
        celebrate({
          size: "micro",
          primary: `Day ${data.dayCompleted} done. ✦`,
        });
      } else {
        celebrate({
          size: "micro",
          primary: `Day ${data.dayCompleted} done. ✦`,
        });
      }

      // Month-end auto-route to JQ reassessment, otherwise show
      // acceleration offer or the fast-pace warning.
      if (data.isMonthEnd) {
        setTimeout(() => {
          router.push("/assessment");
          router.refresh();
        }, 1500);
        return;
      }
      if (data.showAccelerationWarning) {
        setPhase("fast_warning");
      } else {
        setPhase("acceleration");
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  // ─── ACCELERATION OFFER STATE ──────────────────────────────
  if (phase === "acceleration" && completion?.nextDay) {
    return (
      <div className="flex flex-1 flex-col">
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-slate">
          Want to keep going?
        </p>
        <h1 className="mt-4 font-serif text-[28px] font-medium leading-tight text-navy">
          You can move to Day {completion.nextDay} if you have the time and
          energy.
        </h1>
        <p className="mt-4 font-serif text-[16px] italic leading-relaxed text-slate">
          Brent&apos;s strong suggestion: let today&apos;s work absorb. The
          methodology works because of the spacing, not despite it.
        </p>
        <div className="mt-auto pt-12 space-y-3">
          <button
            type="button"
            onClick={() => {
              router.push("/dashboard");
              router.refresh();
            }}
            className={`${btnPrimary} w-full`}
          >
            Advance to Day {completion.nextDay} →
          </button>
          <Link
            href="/home"
            className="block text-center font-sans text-[12px] font-semibold text-slate hover:text-navy"
          >
            I&apos;ll come back tomorrow
          </Link>
        </div>
      </div>
    );
  }

  // ─── FAST-PACE WARNING (shown exactly once) ────────────────
  if (phase === "fast_warning" && completion?.nextDay) {
    return (
      <div className="flex flex-1 flex-col">
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan">
          A note
        </p>
        <h1 className="mt-4 font-serif text-[28px] font-medium leading-tight text-navy">
          You&apos;ve been moving fast.
        </h1>
        <p className="mt-4 font-serif text-[16px] italic leading-relaxed text-slate">
          That&apos;s fine — the work is yours.
        </p>
        <p className="mt-3 font-serif text-[15px] leading-relaxed text-navy/75">
          But the gap between days is where the nervous system absorbs the
          change. Skip the gap and you skip the transformation.
        </p>
        <p className="mt-3 font-serif text-[15px] leading-relaxed text-navy/75">
          Brent&apos;s suggestion: slow down a touch.
        </p>
        <div className="mt-auto pt-12 space-y-3">
          <Link
            href="/home"
            className={`${btnPrimary} w-full`}
          >
            Noted — going to pace myself
          </Link>
          <button
            type="button"
            onClick={() => {
              router.push("/dashboard");
              router.refresh();
            }}
            className="block w-full font-sans text-[12px] font-semibold text-slate hover:text-navy"
          >
            I&apos;ll keep my pace
          </button>
        </div>
      </div>
    );
  }

  // ─── DEFAULT CLOSE CARD ────────────────────────────────────
  return (
    <div className="flex flex-1 flex-col">
      <p className="font-serif text-[36px] font-medium leading-tight text-navy">
        {headline}
      </p>
      <hr className="my-6 w-12 border-slate/30" />
      <p className="font-serif text-[18px] leading-relaxed text-navy/80">
        You did your {isEvening ? "evening" : "morning"} work.
      </p>
      {/* Brent-voice closing line from the day-task data */}
      {closingLine ? (
        <p className="mt-4 font-serif text-[16px] italic leading-relaxed text-navy/70">
          {closingLine}
        </p>
      ) : (
        <p className="mt-4 font-serif text-[16px] italic leading-relaxed text-navy/65">
          {subline}
        </p>
      )}
      <div className="mt-auto pt-12 space-y-3">
        {mode === "challenge" && currentDay !== null && !todayLogged && (
          <button
            type="button"
            onClick={markComplete}
            disabled={busy}
            className={`${btnPrimary} w-full`}
          >
            {busy ? "Saving…" : `Mark Day ${currentDay} complete →`}
          </button>
        )}
        <p className="text-center font-sans text-[11px] uppercase tracking-[0.22em] text-slate/55">
          You can put it down now.
        </p>
      </div>
    </div>
  );
}

/* ---------------- new cards from the Cadence Directive ---------------- */

function MissedDaysCard({
  currentDay,
  gap,
  onAdvance,
}: {
  currentDay: number;
  gap: number;
  onAdvance: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
        Welcome back
      </p>
      <h1 className="mt-4 font-serif text-[32px] font-medium leading-tight text-navy">
        {gap === 1
          ? "You missed yesterday."
          : `It’s been ${gap} days.`}
      </h1>
      <p className="mt-4 font-serif text-[17px] italic leading-relaxed text-navy/70">
        That&apos;s okay. The work is patient. Day {currentDay} is ready for
        you whenever you are. No streak to recover. No clock running.
      </p>
      <div className="mt-auto pt-12 space-y-3">
        <button
          type="button"
          onClick={onAdvance}
          className={btnPrimary}
        >
          Pick up Day {currentDay} →
        </button>
        {/* Per UI/UX Overhaul §2.1.8: only "pick up" + "just a breath".
            No calendar view exists, so no "skip to today" link. */}
        <p className="text-center font-sans text-[11px] text-slate/70">
          The work is patient. No streak to recover.
        </p>
      </div>
    </div>
  );
}

function RestDayCard({
  day,
  phase,
  onAdvance,
}: {
  day: number;
  phase: string | null;
  onAdvance: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
        Day {day} {phase ? `· ${phase}` : ""}
      </p>
      <h1 className="mt-4 font-serif text-[32px] font-medium leading-tight text-navy">
        Today is a rest day.
      </h1>
      <p className="mt-4 font-serif text-[17px] italic leading-relaxed text-navy/70">
        You did hard work. Today we let it integrate. The methodology works
        because of the spacing, not despite it.
      </p>
      <ul className="mt-6 space-y-2 font-serif text-[16px] leading-relaxed text-navy/75">
        <li>· Morning SubScript (5 min)</li>
        <li>· Evening SubScript (5 min)</li>
        <li>· One Joy Pulse logged</li>
      </ul>
      <p className="mt-6 font-serif text-[16px] italic text-navy/65">
        Take a walk. Notice what&apos;s shifting.
      </p>
      <div className="mt-auto pt-12">
        <button type="button" onClick={onAdvance} className={btnPrimary}>
          Acknowledge →
        </button>
      </div>
    </div>
  );
}

function FreeInviteCard({ onAdvance }: { onAdvance: () => void }) {
  const router = useRouter();
  return (
    <div className="flex flex-1 flex-col">
      <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
        When you’re ready
      </p>
      <h1 className="mt-4 font-serif text-[28px] font-medium leading-tight text-navy">
        Start the 90-Day Challenge.
      </h1>
      <p className="mt-4 font-serif text-[17px] italic leading-relaxed text-navy/70">
        The methodology was built to be run in 90 days. Each day is a
        small piece of the install — about ten minutes.
      </p>
      <div className="mt-auto pt-12 space-y-3">
        <form
          action="/api/me/challenge-mode"
          method="post"
          onSubmit={async (e) => {
            e.preventDefault();
            await fetch("/api/me/challenge-mode", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ mode: "challenge" }),
            });
            router.refresh();
          }}
        >
          <button type="submit" className={btnPrimary}>
            Begin Day 1 →
          </button>
        </form>
        <button
          type="button"
          onClick={onAdvance}
          className="block w-full font-sans text-[12px] font-semibold text-navy/55 hover:text-navy"
        >
          Not yet — just looking around
        </button>
      </div>
    </div>
  );
}

function GraduationCard({ onAdvance }: { onAdvance: () => void }) {
  return (
    <div className="flex flex-1 flex-col">
      <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-[#8a6d00]">
        Day 91 — and after
      </p>
      <h1 className="mt-4 font-serif text-[32px] font-medium leading-tight text-navy">
        First day of the rest of your life running this.
      </h1>
      <p className="mt-4 font-serif text-[17px] italic leading-relaxed text-navy/70">
        You finished the Challenge. From here, you&apos;re in Practice
        Mode — same daily rhythm, deeper agency. The app suggests; you
        choose.
      </p>
      <div className="mt-auto pt-12 space-y-3">
        <Link href="/me/wins" className={btnPrimary}>
          See your wins →
        </Link>
        <button
          type="button"
          onClick={onAdvance}
          className="block w-full font-sans text-[12px] font-semibold text-navy/55 hover:text-navy"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

/* ──────── JOS-First Architecture cards ──────── */

function JosInstallDayCard({
  dayOffset,
  componentNumber,
  eyebrow,
  title,
  description,
  estimatedMin,
  href,
  completedCount,
  onSkip,
}: {
  dayOffset: number;
  componentNumber: number;
  eyebrow: string;
  title: string;
  description: string;
  estimatedMin: number;
  href: string;
  completedCount: number;
  onSkip: () => void;
}) {
  const padded = String(componentNumber).padStart(2, "0");
  return (
    <div className="flex flex-1 flex-col">
      <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-cyan">
        Day {dayOffset} · Installing your JOS
      </p>
      <h1 className="mt-4 font-serif text-[32px] font-medium leading-tight text-navy">
        {title}.
      </h1>
      <p className="mt-2 font-sans text-[12px] font-semibold uppercase tracking-[0.22em] text-slate">
        Component {padded} of 06 · {eyebrow}
      </p>
      <p className="mt-4 font-serif text-[17px] italic leading-relaxed text-slate">
        {description}
      </p>
      <p className="mt-3 font-sans text-[12px] uppercase tracking-[0.22em] text-slate/70">
        About {estimatedMin} minutes.
      </p>

      {/* 6-dot progress row */}
      <ol className="mt-6 flex gap-2" aria-label="JOS install progress">
        {Array.from({ length: 6 }, (_, i) => {
          const done = i < completedCount;
          const current = i === completedCount;
          return (
            <li
              key={i}
              className={`h-2 w-2 rounded-full ${
                done
                  ? "bg-cyan"
                  : current
                    ? "ring-2 ring-cyan ring-offset-1"
                    : "bg-slate/20"
              }`}
            />
          );
        })}
      </ol>

      <div className="mt-auto pt-12 space-y-3">
        <Link href={href} className={btnPrimary}>
          Begin Component {padded} →
        </Link>
        <button
          type="button"
          onClick={onSkip}
          className="block w-full font-sans text-[12px] font-semibold text-slate hover:text-navy"
        >
          Not today
        </button>
      </div>
    </div>
  );
}

function JosIntegrationDayCard({
  dayOffset,
  completedCount,
  onAdvance,
}: {
  dayOffset: number;
  completedCount: number;
  onAdvance: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-cyan">
        Day {dayOffset} · Integration
      </p>
      <h1 className="mt-4 font-serif text-[32px] font-medium leading-tight text-navy">
        Today, we let yesterday&apos;s work absorb.
      </h1>
      <p className="mt-4 font-serif text-[17px] italic leading-relaxed text-slate">
        Read what you wrote. Sit with it. Notice what comes up.
      </p>
      <p className="mt-6 font-sans text-[12px] uppercase tracking-[0.22em] text-slate">
        {completedCount} of 6 installed
      </p>
      <div className="mt-auto pt-12 space-y-3">
        <Link href="/me" className={btnPrimary}>
          Read what you&apos;ve written →
        </Link>
        <button
          type="button"
          onClick={onAdvance}
          className="block w-full font-sans text-[12px] font-semibold text-slate hover:text-navy"
        >
          Just close the app
        </button>
      </div>
    </div>
  );
}

/**
 * The Day 8 Ascension ceremony (JOS-First §6). 12-15s emotional
 * animation: white → midnight navy, a single gold point of light
 * grows from center, resolves into the Triple Sparkle, headline +
 * subline fade in, then a CTA. Plays once per user (suppressed on
 * repeat visits via a tutorial flag set after first view).
 */
function JosCompleteCard({ onAdvance }: { onAdvance: () => void }) {
  // Choreography stages — each toggled on a timer
  const [stage, setStage] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 300), //   navy fade begins
      setTimeout(() => setStage(2), 2000), //  gold point appears
      setTimeout(() => setStage(3), 5500), //  sparkle resolves
      setTimeout(() => setStage(4), 7000), //  headline fades in
      setTimeout(() => setStage(5), 9000), //  cta appears
    ];
    // Stamp the tutorial_flag so this only plays the first time
    fetch("/api/me/tutorial-flag", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flag: "jos_ceremony_seen" }),
    }).catch(() => {});
    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[55] flex flex-col items-center justify-center px-8 text-center transition-colors duration-[1500ms] ${
        stage >= 1 ? "bg-navy" : "bg-white"
      }`}
    >
      {/* The point of light */}
      <div
        aria-hidden
        className={`relative mb-10 flex items-center justify-center transition-all duration-[3000ms] ease-out ${
          stage >= 2 ? "h-32 w-32 opacity-100" : "h-1 w-1 opacity-0"
        }`}
      >
        <div
          className="absolute inset-0 rounded-full bg-gold blur-3xl"
          style={{ opacity: stage >= 3 ? 0.4 : 0.7 }}
        />
        <div
          className={`relative font-serif transition-all duration-[1000ms] ${
            stage >= 3
              ? "text-[64px] text-gold opacity-100"
              : "text-[24px] text-gold/0"
          }`}
        >
          ✦
        </div>
      </div>

      <h1
        className={`font-serif text-[40px] font-medium leading-tight text-white transition-opacity duration-[1500ms] sm:text-[48px] ${
          stage >= 4 ? "opacity-100" : "opacity-0"
        }`}
      >
        Your Joyful Operating System
        <br />
        is <em className="text-cyan">installed</em>.
      </h1>

      <p
        className={`mt-6 font-serif text-[20px] italic leading-relaxed text-white/80 transition-opacity duration-[1500ms] ${
          stage >= 4 ? "opacity-100" : "opacity-0"
        }`}
      >
        Six components. Yours forever.
      </p>

      <button
        type="button"
        onClick={onAdvance}
        className={`mt-12 inline-flex items-center justify-center rounded-full bg-cyan px-8 py-3 font-sans text-[10px] font-bold uppercase tracking-[0.22em] text-white transition-opacity duration-[1500ms] hover:bg-white hover:text-navy ${
          stage >= 5
            ? "opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        What&apos;s next →
      </button>
    </div>
  );
}

function PathChoiceCard() {
  const router = useRouter();
  async function pick(mode: "challenge" | "practice") {
    await fetch("/api/me/challenge-mode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode }),
    });
    // router.refresh() rebuilds the server tree without dropping JS
    // state — much faster than a full page reload.
    router.refresh();
  }
  return (
    <div className="flex flex-1 flex-col">
      <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-cyan">
        What&apos;s next?
      </p>
      <h1 className="mt-4 font-serif text-[32px] font-medium leading-tight text-navy">
        You have a working operating system.
      </h1>
      <p className="mt-4 font-serif text-[17px] italic leading-relaxed text-slate">
        Now what do you want to do with it?
      </p>

      <div className="mt-8 space-y-4">
        <button
          type="button"
          onClick={() => pick("challenge")}
          className="block w-full border-t border-slate/25 pt-5 text-left transition hover:border-cyan"
        >
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan">
            Path A · Structured program
          </p>
          <p className="mt-2 font-serif text-[22px] font-medium text-navy">
            Start the AOJ 90-Day Challenge
          </p>
          <p className="mt-1 font-serif text-[15px] italic text-slate">
            Ninety days. Brent&apos;s structured program. 20-60 min/day.
          </p>
          <span
            aria-hidden
            className="mt-3 inline-block font-sans text-[10px] font-bold uppercase tracking-[0.22em] text-cyan"
          >
            Start the 90-day challenge →
          </span>
        </button>

        <button
          type="button"
          onClick={() => pick("practice")}
          className="block w-full border-t border-slate/25 pt-5 text-left transition hover:border-cyan"
        >
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan">
            Path B · Daily practice
          </p>
          <p className="mt-2 font-serif text-[22px] font-medium text-navy">
            Live with your JOS
          </p>
          <p className="mt-1 font-serif text-[15px] italic text-slate">
            Run the daily practice without a structured curriculum.
            5-15 min/day.
          </p>
          <span
            aria-hidden
            className="mt-3 inline-block font-sans text-[10px] font-bold uppercase tracking-[0.22em] text-slate"
          >
            Enter practice mode →
          </span>
        </button>
      </div>

      <p className="mt-6 text-center font-serif text-[14px] italic text-slate">
        You can switch paths anytime.
      </p>
    </div>
  );
}
