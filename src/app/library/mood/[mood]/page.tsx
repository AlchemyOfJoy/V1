import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { quotesByMood, type QuoteMood } from "@/lib/quotes";

export const metadata: Metadata = { robots: { index: false } };

/**
 * User moods map to (a) underlying QuoteMoods from the library and
 * (b) a tool suggestion to do something with the feeling. The mapping
 * is intentional: a "stuck" person needs a Reframe; a "tired" person
 * needs Sleep, not a Bold Ask.
 */
const MOOD_MAP: Record<
  string,
  {
    label: string;
    coachLine: string;
    quoteMoods: QuoteMood[];
    tool: { label: string; href: string };
  }
> = {
  stuck: {
    label: "Stuck",
    coachLine: "When the loop's running, change the input.",
    quoteMoods: ["challenging", "practical"],
    tool: {
      label: "Reframe Now",
      href: "/curriculum/module/04-bold-action/reframe-now",
    },
  },
  anxious: {
    label: "Anxious",
    coachLine: "Your nervous system runs the show. Slow the breath first.",
    quoteMoods: ["comforting", "reverent"],
    tool: {
      label: "60-Second Reset",
      href: "/curriculum/module/04-bold-action/60-second-reset",
    },
  },
  tired: {
    label: "Tired",
    coachLine: "Joy without sleep is a leaky bucket. Tend to the bucket.",
    quoteMoods: ["comforting", "practical"],
    tool: {
      label: "Sleep Foundation",
      href: "/journey/take-bold-action/sleep-foundation",
    },
  },
  sad: {
    label: "Sad",
    coachLine: "Sit with it. Three from your List of Joy when you're ready.",
    quoteMoods: ["comforting", "reverent"],
    tool: {
      label: "Add to List of Joy",
      href: "/curriculum/module/02-joyful-operating-system/list-of-joy",
    },
  },
  numb: {
    label: "Numb",
    coachLine: "Numbness is the firefighter. Let's get curious about what it's protecting.",
    quoteMoods: ["reverent", "challenging"],
    tool: { label: "Joy Spark", href: "/curriculum/module/04-bold-action/joy-spark" },
  },
  lost: {
    label: "Lost",
    coachLine: "When the map fades, re-read your eulogy. That's the map.",
    quoteMoods: ["reverent", "inspiring"],
    tool: {
      label: "Self-Eulogy",
      href: "/curriculum/module/02-joyful-operating-system/self-eulogy",
    },
  },
  grieving: {
    label: "Grieving",
    coachLine: "Grief is love with nowhere to put itself. Let it be where it is.",
    quoteMoods: ["comforting", "reverent"],
    tool: {
      label: "Forgiveness Framework",
      href: "/curriculum/module/03-forgiveness",
    },
  },
  angry: {
    label: "Angry",
    coachLine: "Anger has energy. Joy Judo says use it — don't fight it.",
    quoteMoods: ["challenging", "practical"],
    tool: {
      label: "Forgiveness Framework",
      href: "/curriculum/module/03-forgiveness",
    },
  },
  curious: {
    label: "Curious",
    coachLine: "Stay there. Curiosity is Self showing up.",
    quoteMoods: ["inspiring", "joyful"],
    tool: { label: "Take the JQ", href: "/assessment" },
  },
  inspired: {
    label: "Inspired",
    coachLine: "60 seconds. Act before fear catches up.",
    quoteMoods: ["inspiring", "joyful", "challenging"],
    tool: {
      label: "Tiny Brave Act",
      href: "/curriculum/module/04-bold-action/tiny-brave-act",
    },
  },
};

export default async function MoodPage({
  params,
}: {
  params: Promise<{ mood: string }>;
}) {
  const { mood } = await params;
  const config = MOOD_MAP[mood.toLowerCase()];
  if (!config) notFound();

  const quotes = config.quoteMoods.flatMap((m) => quotesByMood(m));
  const unique = Array.from(new Map(quotes.map((q) => [q.id, q])).values()).slice(
    0,
    12,
  );

  return (
    <div className="mx-auto max-w-2xl space-y-7 px-5 pb-12 pt-6 sm:pt-10">
      <Link
        href="/library"
        className="inline-block font-sans text-[12px] text-navy/55 hover:text-cyan-deep"
      >
        ← Library
      </Link>

      <header>
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
          You said
        </p>
        <h1 className="mt-2 font-serif text-[40px] font-medium leading-tight tracking-tight text-navy sm:text-[48px]">
          <em className="text-cyan-deep">{config.label}</em>.
        </h1>
        <p className="mt-3 font-serif text-[18px] italic leading-relaxed text-navy/75">
          {config.coachLine}
        </p>
      </header>

      {/* Immediate action */}
      <Link
        href={config.tool.href}
        className="flex items-center justify-between gap-4 rounded-2xl border border-cyan-deep/30 bg-gradient-to-br from-mist to-white px-5 py-4 transition hover:border-cyan-deep/60"
      >
        <div className="min-w-0 flex-1">
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-deep">
            Right now
          </p>
          <p className="mt-1 font-serif text-[19px] font-medium text-navy">
            {config.tool.label}
          </p>
        </div>
        <span className="text-[22px] text-cyan-deep">→</span>
      </Link>

      {/* Quote stack */}
      <section className="space-y-3">
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-navy/55">
          Brent on this
        </p>
        <ul className="space-y-3">
          {unique.map((q) => (
            <li
              key={q.id}
              className="rounded-2xl border border-navy/10 bg-[#FAF6EC] px-5 py-4"
            >
              <p className="font-serif text-[16px] italic leading-[1.65] text-navy">
                <span className="text-gold">&ldquo;</span>
                {q.body}
                <span className="text-gold">&rdquo;</span>
              </p>
              <p className="mt-2 font-sans text-[10px] uppercase tracking-[0.22em] text-navy/45">
                — BJF
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
