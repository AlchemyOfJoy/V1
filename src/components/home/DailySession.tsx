"use client";

import { useState } from "react";
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
    case "greeting":
      return (
        <GreetingCard
          firstName={String(p.firstName ?? "")}
          currentDay={(p.currentDay as number | null) ?? null}
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
          onSkip={advance}
        />
      );
    case "joy_glimpse":
      return (
        <JoyGlimpseCard
          samples={(p.samples as { id: string; content: string }[]) ?? []}
          onAdvance={advance}
        />
      );
    case "close":
      return <CloseCard isEvening={Boolean(p.isEvening)} />;
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
  drop,
  onAdvance,
}: {
  firstName: string;
  currentDay: number | null;
  drop: { id: string; body: string; source?: string | null; saved: boolean };
  onAdvance: () => void;
}) {
  const hour = new Date().getHours();
  const greeting = hour < 5 ? "Late night," : hour < 12 ? "Good morning," : hour < 18 ? "Hello," : "Good evening,";
  return (
    <div className="flex flex-1 flex-col">
      <p className="font-serif text-[32px] font-medium leading-tight text-navy">
        {greeting} {firstName}.
      </p>
      {currentDay !== null && (
        <p className="mt-1 font-sans text-[12px] font-semibold uppercase tracking-[0.22em] text-cyan-deep">
          Day {currentDay} <span className="tabular-nums">·</span> of 90
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
  onSkip,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  href: string;
  primaryLabel: string;
  estimatedMin?: number;
  isMilestone?: boolean;
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
      if (!data?.queued) {
        if (data?.milestone) {
          celebrate({
            size: "milestone",
            eyebrow: "List of Joy",
            primary: data.milestone.label,
            secondary: "Keep going.",
          });
        } else {
          celebrate({ size: "micro", primary: "Added ✦" });
        }
      }
      router.refresh();
      setContent("");
      setAdding(false);
      setTimeout(onAdvance, 700);
    } finally {
      setBusy(false);
    }
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

function CloseCard({ isEvening }: { isEvening: boolean }) {
  return (
    <div className="flex flex-1 flex-col">
      <p className="font-serif text-[36px] font-medium leading-tight text-navy">
        That&apos;s it.
      </p>
      <hr className="my-6 w-12 border-navy/15" />
      <p className="font-serif text-[18px] leading-relaxed text-navy/80">
        You did your {isEvening ? "evening" : "morning"} work.
      </p>
      <p className="mt-4 font-serif text-[16px] italic leading-relaxed text-navy/65">
        {isEvening
          ? "Sleep well. Tomorrow’s already waiting."
          : "Come back anytime you need a Reset Breath. ⚡"}
      </p>
      <div className="mt-auto pt-12">
        <p className="text-center font-sans text-[11px] uppercase tracking-[0.22em] text-navy/45">
          You can put it down now.
        </p>
      </div>
    </div>
  );
}
