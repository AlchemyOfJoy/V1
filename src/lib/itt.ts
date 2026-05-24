/**
 * The ITT Framework — the macro spine of the entire app.
 *
 *   INVEST IN JOY → TRAIN YOUR BRAIN (JOS®) → TAKE BOLD ACTION → INTEGRATE
 *
 * Every Journey screen, badge, and progress surface draws from this
 * structure. Existing curriculum URLs are mapped here unchanged so
 * worksheets continue to live at their working paths.
 */

export type IttPillar =
  | "foundations"
  | "invest"
  | "train"
  | "action"
  | "integration";

export type SectionStatus = "available" | "coming-soon";

export interface JourneySection {
  id: string;
  slug: string;
  title: string;
  italicWord: string;
  oneLiner: string;
  estimatedMin: number;
  href: string;
  status: SectionStatus;
}

export interface JourneyPillar {
  id: IttPillar;
  number: 0 | 1 | 2 | 3 | 4;
  slug: string;
  title: string;
  italicWord: string;
  tagline: string;
  description: string;
  sections: JourneySection[];
}

export const JOURNEY: JourneyPillar[] = [
  {
    id: "foundations",
    number: 0,
    slug: "foundations",
    title: "Foundations",
    italicWord: "Foundations",
    tagline: "Why this works.",
    description:
      "The science of joy in three short cards. Skip if you'd rather just do the work — come back when you want the why.",
    sections: [
      {
        id: "joy-chemicals",
        slug: "joy-chemicals",
        title: "Joy Chemicals",
        italicWord: "Joy",
        oneLiner:
          "Dopamine, serotonin, oxytocin, endorphins — and why neurogenesis means you can rewire.",
        estimatedMin: 2,
        href: "/journey/foundations/joy-chemicals",
        status: "available",
      },
      {
        id: "ras",
        slug: "reticular-activating-system",
        title: "The Reticular Activating System",
        italicWord: "Activating",
        oneLiner:
          "Why training your brain to look for joy literally changes what you see.",
        estimatedMin: 2,
        href: "/journey/foundations/reticular-activating-system",
        status: "available",
      },
      {
        id: "brain-waves",
        slug: "brain-waves",
        title: "Brain Waves",
        italicWord: "Waves",
        oneLiner:
          "Beta, Alpha, Theta — and why the SubScript is read in the theta window.",
        estimatedMin: 2,
        href: "/journey/foundations/brain-waves",
        status: "available",
      },
    ],
  },
  {
    id: "invest",
    number: 1,
    slug: "invest-in-joy",
    title: "Invest in Joy",
    italicWord: "Joy",
    tagline: "Make joy the daily non-negotiable.",
    description:
      "The fundamental philosophy of the whole methodology. Joy isn't a reward you earn at the end — it's the daily input that produces the life. Start here.",
    sections: [
      {
        id: "what-it-means",
        slug: "what-it-means",
        title: "What it means to Invest in Joy",
        italicWord: "Means",
        oneLiner:
          "A short read on why this isn't optimism — it's the operating principle underneath everything else.",
        estimatedMin: 3,
        href: "/journey/invest-in-joy/what-it-means",
        status: "available",
      },
      {
        id: "jq-baseline",
        slug: "joy-quotient",
        title: "Joy Quotient Assessment",
        italicWord: "Quotient",
        oneLiner:
          "Take your baseline JQ. Retake at 30, 60, and 90 days to see the rise.",
        estimatedMin: 10,
        href: "/assessment",
        status: "available",
      },
      {
        id: "list-of-joy-first",
        slug: "list-of-joy",
        title: "Your first List of Joy",
        italicWord: "First",
        oneLiner:
          "The living, breathing document. Start it once; add to it forever.",
        estimatedMin: 30,
        href: "/curriculum/module/02-joyful-operating-system/list-of-joy",
        status: "available",
      },
    ],
  },
  {
    id: "train",
    number: 2,
    slug: "train-your-brain",
    title: "Train Your Brain",
    italicWord: "Brain",
    tagline: "Install the Joyful Operating System®.",
    description:
      "The deepest section. Five JOS® components plus the Forgiveness Framework — installed in order, designed to take root together.",
    sections: [
      {
        id: "core-narrative",
        slug: "core-narrative",
        title: "Core Narrative",
        italicWord: "Narrative",
        oneLiner:
          "The story you've been telling yourself — surfaced and rewritten.",
        estimatedMin: 45,
        href: "/curriculum/module/02-joyful-operating-system/core-narrative",
        status: "available",
      },
      {
        id: "self-eulogy",
        slug: "self-eulogy",
        title: "Self-Eulogy",
        italicWord: "Eulogy",
        oneLiner:
          "Write the eulogy you want spoken. Reverse-engineer the life that earns it.",
        estimatedMin: 60,
        href: "/curriculum/module/02-joyful-operating-system/self-eulogy",
        status: "available",
      },
      {
        id: "list-of-joy-deep",
        slug: "list-of-joy",
        title: "List of Joy (deepened)",
        italicWord: "Joy",
        oneLiner:
          "Auto-tagging by Priority Pillar. Growth chart. The fuel for everything that follows.",
        estimatedMin: 20,
        href: "/curriculum/module/02-joyful-operating-system/list-of-joy",
        status: "available",
      },
      {
        id: "priority-pillars",
        slug: "priority-pillars",
        title: "Priority Pillars",
        italicWord: "Pillars",
        oneLiner:
          "Score the twelve sub-pillars. See where the energy is leaking.",
        estimatedMin: 15,
        href: "/curriculum/module/02-joyful-operating-system/priority-pillars",
        status: "available",
      },
      {
        id: "subscript",
        slug: "subscript",
        title: "SubScript",
        italicWord: "SubScript",
        oneLiner:
          "Your twice-daily self-hypnosis. Where the install completes.",
        estimatedMin: 30,
        href: "/curriculum/module/02-joyful-operating-system/subscript",
        status: "available",
      },
      {
        id: "forgiveness",
        slug: "forgiveness",
        title: "Forgiveness Framework",
        italicWord: "Forgiveness",
        oneLiner:
          "The deepest, most freeing work. Per-person 4-step process behind a private vault.",
        estimatedMin: 60,
        href: "/curriculum/module/03-forgiveness",
        status: "available",
      },
    ],
  },
  {
    id: "action",
    number: 3,
    slug: "take-bold-action",
    title: "Take Bold Action",
    italicWord: "Action",
    tagline: "Make the install stick — outside the head.",
    description:
      "Environmental and behavioral changes that protect the work. Seven sub-sections, each completable on its own.",
    sections: [
      {
        id: "habit-renaissance",
        slug: "habit-renaissance",
        title: "Habit Renaissance",
        italicWord: "Renaissance",
        oneLiner:
          "Morning Orbit + Evening Wind-Down — the bookends that anchor every other tool.",
        estimatedMin: 30,
        href: "/journey/take-bold-action/habit-renaissance",
        status: "available",
      },
      {
        id: "sleep-foundation",
        slug: "sleep-foundation",
        title: "Sleep Foundation",
        italicWord: "Foundation",
        oneLiner:
          "The 14-tool checklist. Joy without sleep is a leaky bucket.",
        estimatedMin: 25,
        href: "/journey/take-bold-action/sleep-foundation",
        status: "available",
      },
      {
        id: "dopamine-detox",
        slug: "dopamine-detox",
        title: "Dopamine Detox",
        italicWord: "Detox",
        oneLiner:
          "Opt-in 30 or 90-day commitment. Reclaim your reward system.",
        estimatedMin: 20,
        href: "/journey/take-bold-action/dopamine-detox",
        status: "available",
      },
      {
        id: "zero-gravity",
        slug: "zero-gravity",
        title: "Zero Gravity Audit",
        italicWord: "Gravity",
        oneLiner:
          "Income → hourly rate → the delegation list. Stop doing what's beneath you.",
        estimatedMin: 30,
        href: "/journey/take-bold-action/zero-gravity",
        status: "available",
      },
      {
        id: "expectations-standards",
        slug: "expectations-standards",
        title: "Expectations → Standards",
        italicWord: "Standards",
        oneLiner:
          "Side-by-side conversion. Stop hoping; start deciding.",
        estimatedMin: 25,
        href: "/journey/take-bold-action/expectations-standards",
        status: "available",
      },
      {
        id: "jomo-boundaries",
        slug: "jomo",
        title: "JOMO Boundaries",
        italicWord: "JOMO",
        oneLiner:
          "Weekly NO list paired with List of Joy YESes. The joy of missing out.",
        estimatedMin: 15,
        href: "/journey/take-bold-action/jomo",
        status: "available",
      },
      {
        id: "joyful-conflict",
        slug: "joyful-conflict",
        title: "Joyful Conflict Prep",
        italicWord: "Conflict",
        oneLiner:
          "The pre-conversation tool. Walk in calm, walk out closer.",
        estimatedMin: 20,
        href: "/journey/take-bold-action/joyful-conflict",
        status: "available",
      },
    ],
  },
  {
    id: "integration",
    number: 4,
    slug: "90-day-integration",
    title: "90-Day Integration",
    italicWord: "Integration",
    tagline: "Run the full system for ninety days.",
    description:
      "The structured challenge. Daily SubScript reads, weekly focus, mood check-ins, Friday reflections, Sunday Pillar pulse. By Day 90, you've installed the operating system.",
    sections: [
      {
        id: "challenge",
        slug: "challenge",
        title: "90-Day Challenge",
        italicWord: "Challenge",
        oneLiner:
          "Begin the structured 13-week arc. Pre-fills from any work you've already done.",
        estimatedMin: 5,
        href: "/curriculum/90-day-challenge",
        status: "available",
      },
    ],
  },
];

export function findPillar(slug: string): JourneyPillar | undefined {
  return JOURNEY.find((p) => p.slug === slug);
}

export function findSectionInPillar(
  pillar: JourneyPillar,
  slug: string,
): JourneySection | undefined {
  return pillar.sections.find((s) => s.slug === slug);
}

/**
 * Total estimated commitment, for the "What you're stepping into" copy.
 */
export const TOTAL_ESTIMATED_MIN = JOURNEY.reduce(
  (sum, p) => sum + p.sections.reduce((s, sec) => s + sec.estimatedMin, 0),
  0,
);
