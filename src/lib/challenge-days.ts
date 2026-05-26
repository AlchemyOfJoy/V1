/**
 * The 90-Day Challenge — Path A on top of an already-installed JOS
 * (JOS-First Architecture §8).
 *
 * Foundation Week is gone — Days 1-7 of the old cadence were the JOS
 * install, which now happens before the Challenge starts. Challenge
 * Day 1 is the first day after the user picks Path A. Forgiveness
 * moves to Week 9 where the user has the nervous-system capacity for
 * it (book Chapter 14 ordering, post-habits, post-rituals).
 *
 * Each day prescribes ONE focused piece of work. Daily rituals
 * (SubScript reads, Joy Pulse, List of Joy adds) run alongside but
 * aren't surfaced as the "anchor task" — those happen in the rhythm
 * section of Today.
 */

export interface DayTask {
  day: number;
  weekNumber: number;
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  estimatedMin: number;
  /** Used for milestone days (1, 30, 60, 90). */
  isMilestone?: boolean;
  /** Days that are pure reflection / no required action. */
  isReflection?: boolean;
}

/**
 * Phases of the 90-Day Challenge (Cadence Directive §2 + JOS-First §8).
 *   1. Month 1 — Daily Rhythm Establishment (Weeks 1-4)
 *   2. Month 2 — Deepening (Weeks 5-8)
 *   3. Month 3 — Integration (Weeks 9-12)
 */
export interface Phase {
  number: 1 | 2 | 3;
  title: string;
  range: [number, number];
}

export const PHASES: Phase[] = [
  { number: 1, title: "Daily Rhythm", range: [1, 28] },
  { number: 2, title: "Deepening", range: [29, 56] },
  { number: 3, title: "Integration", range: [57, 90] },
];

export function phaseForDay(day: number): Phase | null {
  return PHASES.find((p) => day >= p.range[0] && day <= p.range[1]) ?? null;
}

/** End-of-month reflection days (JQ reassessment + Pillar re-score). */
export const REST_DAYS = new Set<number>([7, 14, 21, 28, 35, 42, 49, 56, 63, 70, 77, 84]);

export function isRestDay(day: number): boolean {
  return REST_DAYS.has(day);
}

const ROUTES = {
  subscript: "/curriculum/module/02-joyful-operating-system/subscript",
  pillars: "/curriculum/module/02-joyful-operating-system/priority-pillars",
  listOfJoy: "/me/my-joy",
  forgiveness: "/curriculum/module/03-forgiveness",
  selfEulogy: "/curriculum/module/02-joyful-operating-system/self-eulogy",
  coreNarrative: "/curriculum/module/02-joyful-operating-system/core-narrative",
  assessment: "/assessment",
  book: "/book",
  wins: "/me/wins",
  boldAction: "/book/4",
  joyPulse: "/home",
} as const;

interface WeekTheme {
  week: number;
  title: string;
  intro: string;
  anchorHref: string;
  anchorLabel: string;
  estimatedMin: number;
}

const WEEK_THEMES: WeekTheme[] = [
  {
    week: 1,
    title: "Daily Rhythm",
    intro:
      "Twice-daily SubScript reads, morning intention, evening reflection. Lock in the rhythm before anything else.",
    anchorHref: ROUTES.subscript,
    anchorLabel: "Read your SubScript",
    estimatedMin: 5,
  },
  {
    week: 2,
    title: "AM / PM Ritual Redesign",
    intro:
      "Morning Orbit and Evening Wind Down. Build the bookends that hold the day.",
    anchorHref: ROUTES.book,
    anchorLabel: "Open Bold Action",
    estimatedMin: 12,
  },
  {
    week: 3,
    title: "Dopamine Detox",
    intro:
      "Thirty days off cheap dopamine. Reclaim what your attention is for.",
    anchorHref: ROUTES.book,
    anchorLabel: "Read the chapter",
    estimatedMin: 15,
  },
  {
    week: 4,
    title: "Habit Renaissance",
    intro:
      "D.A.D. — Decide, Anchor, Defend. Build the habits that compound joy.",
    anchorHref: ROUTES.book,
    anchorLabel: "Apply the framework",
    estimatedMin: 15,
  },
  {
    week: 5,
    title: "Sleep",
    intro:
      "Non-negotiable. Audit your sleep environment and rebuild it for rest.",
    anchorHref: ROUTES.book,
    anchorLabel: "Run the audit",
    estimatedMin: 20,
  },
  {
    week: 6,
    title: "Giving",
    intro:
      "Joy multiplies through giving. Choose a person, a cause, a small act.",
    anchorHref: ROUTES.listOfJoy,
    anchorLabel: "Add a joy of giving",
    estimatedMin: 10,
  },
  {
    week: 7,
    title: "Play",
    intro:
      "Reclaim play. The thing you do because the doing of it is the point.",
    anchorHref: ROUTES.listOfJoy,
    anchorLabel: "Capture a moment of play",
    estimatedMin: 10,
  },
  {
    week: 8,
    title: "Therapy / Inner Work",
    intro:
      "Look inward this week. What still wants to be felt, named, released?",
    anchorHref: ROUTES.coreNarrative,
    anchorLabel: "Re-read your Core Narrative",
    estimatedMin: 15,
  },
  {
    week: 9,
    title: "Forgiveness Deep Work",
    intro:
      "The hardest week. One person from your Hit List, the full four-step process.",
    anchorHref: ROUTES.forgiveness,
    anchorLabel: "Open the Forgiveness Vault",
    estimatedMin: 30,
  },
  {
    week: 10,
    title: "Law of Zero Gravity",
    intro:
      "Calculate your hourly rate. Build the delegation list. Reclaim time.",
    anchorHref: ROUTES.book,
    anchorLabel: "Run the audit",
    estimatedMin: 20,
  },
  {
    week: 11,
    title: "JOMO — saying no",
    intro:
      "Every NO is a sacred YES. Refine the weekly NO list. Practice the boundary.",
    anchorHref: ROUTES.book,
    anchorLabel: "Build your NO list",
    estimatedMin: 15,
  },
  {
    week: 12,
    title: "Integration & Future Vision",
    intro:
      "Revisit Self-Eulogy. Look at where you started. Set the next horizon.",
    anchorHref: ROUTES.selfEulogy,
    anchorLabel: "Re-read your Self-Eulogy",
    estimatedMin: 20,
  },
];

interface DayOverride {
  title?: string;
  description?: string;
  primaryHref?: string;
  primaryLabel?: string;
  estimatedMin?: number;
  isMilestone?: boolean;
  isReflection?: boolean;
}

/** Specific days that override the week-anchor pattern. */
const DAY_OVERRIDES: Record<number, DayOverride> = {
  1: {
    title: "Day 1 — the install is yours.",
    description:
      "Your JOS is built. Today, just read your SubScript twice and log one Joy Pulse. The rhythm starts simply.",
    isMilestone: true,
  },
  7: {
    title: "Week 1 reflection",
    description:
      "Re-read your SubScript. Notice what's shifted in one week. Add to your List of Joy.",
    primaryHref: ROUTES.listOfJoy,
    primaryLabel: "Open your List",
    isReflection: true,
  },
  14: {
    title: "Two weeks in — pulse on the rituals",
    description:
      "What's stuck? What's still hard? Quiet day; tune the rhythm rather than push.",
    isReflection: true,
  },
  21: {
    title: "Three weeks · Detox check",
    description:
      "Halfway through the Dopamine Detox. Notice what's already easier than it was.",
    isReflection: true,
  },
  28: {
    title: "Month 1 reassessment",
    description:
      "Re-take the JQ. Re-score your Pillars. The first 28 days against baseline.",
    primaryHref: ROUTES.assessment,
    primaryLabel: "Re-take your JQ",
    estimatedMin: 12,
    isMilestone: true,
  },
  30: {
    title: "Day 30 milestone",
    description:
      "First third complete. Re-read your Core Narrative — notice if it's already starting to feel true.",
    primaryHref: ROUTES.coreNarrative,
    primaryLabel: "Re-read",
    isMilestone: true,
  },
  35: {
    title: "Sleep audit · check-in",
    description:
      "Three days into the sleep work. What stuck? What didn't? Adjust without judgment.",
    isReflection: true,
  },
  42: {
    title: "Halfway · Giving week",
    description:
      "Six weeks in. Today, do one small act of giving that costs you something — time, attention, money.",
    estimatedMin: 15,
  },
  49: {
    title: "Play check-in",
    description:
      "When did you last play just for the doing of it? Capture three play moments today.",
    isReflection: true,
  },
  56: {
    title: "Month 2 reassessment",
    description:
      "Re-take the JQ. Re-score your Pillars. The first 56 days against baseline.",
    primaryHref: ROUTES.assessment,
    primaryLabel: "Re-take your JQ",
    estimatedMin: 12,
    isMilestone: true,
  },
  60: {
    title: "Day 60 · the long haul",
    description:
      "Two-thirds through. Read your Self-Eulogy. Notice if it's any closer to true.",
    primaryHref: ROUTES.selfEulogy,
    primaryLabel: "Re-read",
    isMilestone: true,
  },
  63: {
    title: "First Forgiveness · open the Vault",
    description:
      "Add a person to your Hit List. You don't need to start the process today — just naming is enough.",
    primaryHref: ROUTES.forgiveness,
    primaryLabel: "Open the Vault",
    estimatedMin: 15,
  },
  70: {
    title: "Zero Gravity audit",
    description:
      "What's eating your hours that someone else could do? Build the delegation list.",
    estimatedMin: 25,
  },
  77: {
    title: "JOMO · practice the NO",
    description:
      "One thing this week you would have said yes to. Today, say no instead. Notice the freedom.",
    estimatedMin: 10,
  },
  84: {
    title: "Final stretch · re-read everything",
    description:
      "Re-read your Core Narrative, Self-Eulogy, and SubScript. The artifacts of who you've become.",
    primaryHref: ROUTES.wins,
    primaryLabel: "Open your wins",
    isReflection: true,
  },
  89: {
    title: "Day 89 · the last sit",
    description:
      "Tomorrow is Day 90. Tonight, sit with how far. No new work. Just notice.",
    isReflection: true,
  },
  90: {
    title: "Day 90 — the install is run.",
    description:
      "Final JQ. Re-score Pillars. Read the Day 90 Report. Listen to The Alchemist meditation. You ran the system for ninety days.",
    primaryHref: ROUTES.assessment,
    primaryLabel: "Take the final JQ",
    estimatedMin: 30,
    isMilestone: true,
  },
};

/** Derive a day's task from its week theme + any per-day overrides. */
function buildDay(day: number): DayTask {
  const weekNumber = Math.min(12, Math.ceil(day / 7));
  const theme = WEEK_THEMES[weekNumber - 1];
  const o = DAY_OVERRIDES[day] ?? {};
  return {
    day,
    weekNumber,
    title: o.title ?? `${theme.title} · Day ${day}`,
    description: o.description ?? theme.intro,
    primaryHref: o.primaryHref ?? theme.anchorHref,
    primaryLabel: o.primaryLabel ?? theme.anchorLabel,
    estimatedMin: o.estimatedMin ?? theme.estimatedMin,
    isMilestone: o.isMilestone,
    isReflection: o.isReflection,
  };
}

export const DAYS: DayTask[] = Array.from({ length: 90 }, (_, i) =>
  buildDay(i + 1),
);

export function getDayTask(day: number): DayTask | null {
  if (day < 1 || day > 90) return null;
  return DAYS[day - 1];
}

/** Weekly themes export — kept for legacy callers. */
export const WEEKS = WEEK_THEMES.map((w) => ({
  week: w.week,
  title: w.title,
  focus: w.title,
  action: w.intro,
  link: w.anchorHref,
}));
