import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Alchemy Tools",
  robots: { index: false },
};

/**
 * Alchemy Tools — the comprehensive resource directory.
 *
 * Everything-in-one-place page: The Book, the daily anchors, the
 * sacred work surfaces, the personal record, the practice tools.
 * Surfaced from the homescreen's "Alchemy Tools" link.
 */

interface Resource {
  href: string;
  title: string;
  blurb: string;
  external?: boolean;
}

interface Group {
  eyebrow: string;
  heading: string;
  blurb: string;
  resources: Resource[];
}

const GROUPS: Group[] = [
  {
    eyebrow: "The methodology",
    heading: "Read · Learn",
    blurb:
      "Brent's full curriculum — twenty chapters across four parts.",
    resources: [
      {
        href: "/book",
        title: "The Book",
        blurb: "Four parts. Twenty chapters. Learn, practice, integrate.",
      },
      {
        href: "/book/1",
        title: "Part One · Invest in Joy",
        blurb: "Eight chapters · Joy is your birthright.",
      },
      {
        href: "/book/2",
        title: "Part Two · Train Your Brain",
        blurb: "Five chapters · Install the operating system.",
      },
      {
        href: "/book/3",
        title: "Part Three · Forgiveness",
        blurb: "One chapter · The bridge work.",
      },
      {
        href: "/book/4",
        title: "Part Four · Bold Action",
        blurb: "Six chapters · Build your environment.",
      },
    ],
  },
  {
    eyebrow: "The operating system",
    heading: "Build · Edit",
    blurb:
      "Your six living JOS components — editable forever, evolving with you.",
    resources: [
      {
        href: "/jos",
        title: "Your JOS dashboard",
        blurb: "See every component at a glance.",
      },
      {
        href: "/curriculum/module/02-joyful-operating-system/core-narrative",
        title: "Core Narrative",
        blurb: "Rewrite the story running your life.",
      },
      {
        href: "/curriculum/module/02-joyful-operating-system/self-eulogy",
        title: "Self-Eulogy",
        blurb: "Begin with the end in mind.",
      },
      {
        href: "/me/my-joy",
        title: "List of Joy",
        blurb: "The compass that always points home.",
      },
      {
        href: "/curriculum/module/02-joyful-operating-system/priority-pillars",
        title: "Priority Pillars",
        blurb: "Score where your energy flows and drains.",
      },
      {
        href: "/curriculum/module/02-joyful-operating-system/subscript",
        title: "SubScript",
        blurb: "The document your subconscious reads twice a day.",
      },
    ],
  },
  {
    eyebrow: "Daily anchors",
    heading: "Practice · Anchor",
    blurb:
      "Your daily ritual surfaces and in-the-moment interventions.",
    resources: [
      {
        href: "/dashboard",
        title: "Today's Daily Session",
        blurb: "Joy Drop · Joy Pulse · today's anchor · close the day.",
      },
      {
        href: "/curriculum/module/04-bold-action/60-second-reset",
        title: "Reset Breath",
        blurb: "Forty-two seconds. ⚡ from anywhere.",
      },
      {
        href: "/right-now/check-in",
        title: "Right Now check-in",
        blurb: "Better · Same · Worse. With crisis routing if needed.",
      },
      {
        href: "/quick-add",
        title: "Add to List of Joy",
        blurb: "One tap, voice-ready. The most-used action in the app.",
      },
    ],
  },
  {
    eyebrow: "Sacred work",
    heading: "Release · Integrate",
    blurb:
      "The deeper interior work the methodology asks for.",
    resources: [
      {
        href: "/curriculum/module/03-forgiveness",
        title: "Forgiveness Vault",
        blurb: "Private. Sacred. The weight you set down.",
      },
      {
        href: "/me/letters",
        title: "Letters from past you",
        blurb: "Write to your future self. Receive what you sent.",
      },
    ],
  },
  {
    eyebrow: "The record",
    heading: "Look · Remember",
    blurb:
      "Your personal artifacts and proof of the work.",
    resources: [
      {
        href: "/me",
        title: "My Alchemy",
        blurb: "Your trophy room. The proof, the documents, the memories.",
      },
      {
        href: "/me/wins",
        title: "Show me my wins",
        blurb: "Before / after. JQ, Pillars, narratives, forgivenesses.",
      },
      {
        href: "/assessment",
        title: "JQ Assessment",
        blurb: "Take or re-take your Joy Quotient measurement.",
      },
    ],
  },
];

export default function ToolsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 pb-16 pt-10 sm:pt-14">
      <Link
        href="/home"
        className="font-sans text-[12px] text-slate hover:text-cyan"
      >
        ← Home
      </Link>

      <header className="mt-8">
        <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.26em] text-cyan">
          All resources
        </p>
        <h1 className="mt-4 font-serif text-[44px] font-medium leading-[1.1] tracking-tight text-navy sm:text-[56px]">
          Alchemy <em className="text-cyan">Tools</em>.
        </h1>
        <p className="mt-3 font-serif text-[17px] italic leading-relaxed text-slate">
          Everything in one place. Pull what you need.
        </p>
      </header>

      <div aria-hidden className="my-10 h-px w-16 bg-slate/30" />

      <div className="space-y-12">
        {GROUPS.map((g) => (
          <section key={g.heading}>
            <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.22em] text-cyan">
              {g.eyebrow}
            </p>
            <h2 className="mt-3 font-serif text-[28px] font-medium leading-tight text-navy">
              {g.heading}
            </h2>
            <p className="mt-1 font-serif text-[15px] italic leading-relaxed text-slate">
              {g.blurb}
            </p>
            <ol className="mt-5 divide-y divide-slate/15">
              {g.resources.map((r) => (
                <li key={r.href}>
                  <Link
                    href={r.href}
                    className="flex items-start gap-5 py-4 transition hover:text-cyan"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-serif text-[18px] font-medium text-navy">
                        {r.title}
                      </p>
                      <p className="mt-0.5 font-sans text-[13px] font-light text-slate">
                        {r.blurb}
                      </p>
                    </div>
                    <span
                      aria-hidden
                      className="shrink-0 self-center font-sans text-[16px] text-slate"
                    >
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>

      <p aria-hidden className="mt-12 text-center text-[24px] text-gold">
        ✦
      </p>
    </main>
  );
}
