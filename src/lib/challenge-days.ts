/**
 * The 90-Day Challenge content — day-by-day per the Challenge Content
 * Directive. Each day surfaces ONE anchor task on Today: a Practice, a
 * Meditation, a chapter read, or a reflection prompt. Brent-voice
 * sublines, closing lines, and optional mid-flow coach cards all live
 * here.
 *
 * Structure:
 *   • Week 1 (Days 1-7)   — fully explicit per directive §3
 *   • Weeks 2-12 (Days 8-84) — week themes with a daily pattern
 *     (LEARN / PRACTICE / INTEGRATE / APPLY / REVISIT / DEEPEN /
 *     REFLECT) per directive §4
 *   • Days 85-89         — five reflection prompts per directive §4
 *   • Day 90             — the look-back ritual per directive §4
 */

export type MilestoneTier = "glow" | "bloom" | "ascension";

export interface DayTask {
  day: number;
  weekNumber: number;
  /** "DAY 1 · WEEK 1 · DAILY RHYTHM" — eyebrow at top of Today. */
  eyebrowLabel: string;
  /** The day's anchor title — Garamond display. */
  title: string;
  /** Multi-line Brent-voice framing. */
  description: string;
  primaryHref: string;
  primaryLabel: string;
  estimatedMin: number;
  /** Quiet "see you tomorrow" line surfaced in Done-for-today state. */
  closingLine?: string;
  /** Optional mid-flow coach card with Brent-voice copy. */
  coachCard?: { trigger: string; copy: string };
  /** Milestone day flag — drives celebration tier and eyebrow tint. */
  isMilestone?: boolean;
  milestoneTier?: MilestoneTier;
  /** Days that are pure reflection / no required action. */
  isReflection?: boolean;
}

/* ─── Phases (months) ─────────────────────────────────────── */

export interface Phase {
  number: 1 | 2 | 3;
  title: string;
  range: [number, number];
}

export const PHASES: Phase[] = [
  { number: 1, title: "Daily Rhythm + Habit", range: [1, 28] },
  { number: 2, title: "Deepening", range: [29, 56] },
  { number: 3, title: "Integration", range: [57, 90] },
];

export function phaseForDay(day: number): Phase | null {
  return PHASES.find((p) => day >= p.range[0] && day <= p.range[1]) ?? null;
}

/* ─── Rest / lighter days ─────────────────────────────────── */

/** Each week's Day 7 is a reflection day; plus Days 85-89. */
export const REST_DAYS = new Set<number>([
  7, 14, 21, 28, 35, 42, 49, 56, 63, 70, 77, 84, 85, 86, 87, 88, 89,
]);

export function isRestDay(day: number): boolean {
  return REST_DAYS.has(day);
}

/* ─── Shared route map ────────────────────────────────────── */

const ROUTES = {
  subscript: "/curriculum/module/02-joyful-operating-system/subscript",
  pillars: "/curriculum/module/02-joyful-operating-system/priority-pillars",
  listOfJoy: "/me/my-joy",
  forgiveness: "/curriculum/module/03-forgiveness",
  selfEulogy: "/curriculum/module/02-joyful-operating-system/self-eulogy",
  coreNarrative: "/curriculum/module/02-joyful-operating-system/core-narrative",
  assessment: "/assessment",
  resetBreath: "/curriculum/module/04-bold-action/60-second-reset",
  book: "/book",
  bookPart1: "/book/1",
  bookPart2: "/book/2",
  bookPart3: "/book/3",
  bookPart4: "/book/4",
  wins: "/me/wins",
  letters: "/me/letters",
  dashboard: "/dashboard",
  tools: "/tools",
  jos: "/jos",
} as const;

/* ─── Week 1: explicit per directive §3 ───────────────────── */

const WEEK_1: DayTask[] = [
  {
    day: 1,
    weekNumber: 1,
    eyebrowLabel: "Day 1 · Week 1 · Daily Rhythm",
    title: "First full day with your JOS running.",
    description:
      "Today, we run the system you built. Twice-daily SubScript reads. One ITT loop. One Joy Pulse. That's it — the whole methodology in one day.",
    primaryHref: ROUTES.subscript,
    primaryLabel: "Read your morning SubScript",
    estimatedMin: 25,
    closingLine:
      "Day 1 done. Tomorrow we keep the rhythm. Same simple thing.",
    coachCard: {
      trigger: "midday",
      copy: "How's it going? Have you read your SubScript this morning? That's the work today. Nothing fancier than that.",
    },
    isMilestone: true,
  },
  {
    day: 2,
    weekNumber: 1,
    eyebrowLabel: "Day 2 · Week 1 · Daily Rhythm",
    title: "Today: same as yesterday.",
    description:
      "Repetition is the point. Same SubScript reads. Same ITT loop. Same Joy Pulse. Notice what's different in you, not in the work.",
    primaryHref: ROUTES.subscript,
    primaryLabel: "Read your SubScript",
    estimatedMin: 20,
    closingLine:
      "Two days in a row. That's not nothing. Tomorrow you'll meet Joy Judo.",
    coachCard: {
      trigger: "morning_subscript",
      copy: "Read it like you mean it. Your subconscious is listening.",
    },
  },
  {
    day: 3,
    weekNumber: 1,
    eyebrowLabel: "Day 3 · Week 1 · Daily Rhythm",
    title: "Today you learn to redirect, not resist.",
    description:
      "There's a tool called Joy Judo. It's how you handle people and moments that try to pull you out of joy. Five minutes. Watch what it does to your day.",
    primaryHref: ROUTES.bookPart1,
    primaryLabel: "Read Chapter 8 · Joy Judo",
    estimatedMin: 30,
    closingLine:
      "Joy Judo is now a tool in your kit. Use it as life happens. Tomorrow: Emotional Alchemy.",
    coachCard: {
      trigger: "after_practice",
      copy: "Notice the gap. That's the entire methodology in five seconds.",
    },
  },
  {
    day: 4,
    weekNumber: 1,
    eyebrowLabel: "Day 4 · Week 1 · Daily Rhythm",
    title: "Turn heavy emotions into something useful.",
    description:
      "Emotional Alchemy is the formula for turning what you don't want into the fuel for what you do want. Today you practice the formula on something real.",
    primaryHref: ROUTES.bookPart1,
    primaryLabel: "Open Chapter 4 · Becoming the Alchemist",
    estimatedMin: 35,
    closingLine:
      "You just turned something heavy into fuel. That's alchemy. Tomorrow: the Reframe Ritual.",
    coachCard: {
      trigger: "before_meditation",
      copy: "Find a place where you won't be interrupted for thirty minutes. This one needs your full body.",
    },
  },
  {
    day: 5,
    weekNumber: 1,
    eyebrowLabel: "Day 5 · Week 1 · Daily Rhythm",
    title: "Rewrite a story while it's still happening.",
    description:
      "The Reframe Ritual is what you do when life punches you in the face. Sixty seconds. New meaning. Different day. Today you'll practice on something that already happened.",
    primaryHref: ROUTES.coreNarrative,
    primaryLabel: "Open your Core Narrative",
    estimatedMin: 25,
    closingLine:
      "You just rewrote a story. Do that for a few weeks and watch what happens. Tomorrow: the 60-Second Shift.",
    coachCard: {
      trigger: "during_reframe",
      copy: "You're not lying to yourself. You're choosing which truth to live in. Pick the one that serves you.",
    },
  },
  {
    day: 6,
    weekNumber: 1,
    eyebrowLabel: "Day 6 · Week 1 · Daily Rhythm",
    title: "Change your state in one minute.",
    description:
      "The 60-Second Shift is the most underrated tool in this whole methodology. Sixty seconds. Different nervous system. Different person. Today you practice it three times.",
    primaryHref: ROUTES.resetBreath,
    primaryLabel: "Try the 60-Second Shift",
    estimatedMin: 20,
    closingLine:
      "Six days in. Your nervous system is learning new defaults. Tomorrow: the first full systems check.",
    coachCard: {
      trigger: "after_first_shift",
      copy: "Two more today. The point is that you can do this anywhere. Driving. In a meeting. In the bathroom at a wedding.",
    },
  },
  {
    day: 7,
    weekNumber: 1,
    eyebrowLabel: "Day 7 · Week 1 · Integration",
    title: "Look back at your first week.",
    description:
      "One week running the system. Today: a check-in. JQ re-measure. Pillars re-score. See what's shifted.",
    primaryHref: ROUTES.assessment,
    primaryLabel: "Re-take the JQ",
    estimatedMin: 45,
    closingLine:
      "Tomorrow we go deeper. Week 2: AM and PM rituals. Now you have the foundation. Time to design the day around it.",
    coachCard: {
      trigger: "after_jq_remeasure",
      copy: "Whatever the number, don't judge it. The work isn't the number — the work is whether you showed up every day. You did. Seven for seven.",
    },
    isMilestone: true,
    milestoneTier: "bloom",
    isReflection: true,
  },
];

/* ─── Weeks 2-12: theme metadata + daily patterns ─────────── */

interface DailyPattern {
  /** Pattern slug — LEARN / PRACTICE / INTEGRATE / APPLY / REVISIT / DEEPEN / REFLECT */
  kind: string;
  /** Anchor title shown on Today. */
  title: string;
  /** Brent-voice subline. */
  description: string;
  /** Where the primary CTA routes. */
  primaryHref: string;
  primaryLabel: string;
  estimatedMin: number;
}

interface WeekTheme {
  week: number; // 2-12
  title: string;
  themeLabel: string; // eyebrow uppercase
  goal: string;
  sourceChapters: string;
  /** Seven daily patterns, day-of-week 1..7. */
  pattern: DailyPattern[];
  /** Optional end-of-week celebration copy (Glow / Bloom). */
  endOfWeekCopy?: string;
  endOfWeekTier?: MilestoneTier;
}

const WEEK_2: WeekTheme = {
  week: 2,
  title: "AM/PM Ritual Redesign",
  themeLabel: "AM/PM Ritual Redesign",
  goal: "Build a Morning Orbit and Evening Wind Down — the bookends that hold every day in place.",
  sourceChapters: "Chapter 17 · Habit Renaissance + Chapter 16 · Habits",
  pattern: [
    {
      kind: "LEARN",
      title: "Make your unconscious rituals conscious.",
      description:
        "Your day already has rituals. They're just unconscious. Today you make them conscious.",
      primaryHref: ROUTES.bookPart4,
      primaryLabel: "Read Chapter 17",
      estimatedMin: 20,
    },
    {
      kind: "PRACTICE",
      title: "Build your Morning Orbit.",
      description:
        "Design the first 60 minutes. Get them right and the rest follows.",
      primaryHref: ROUTES.bookPart4,
      primaryLabel: "Design your morning",
      estimatedMin: 25,
    },
    {
      kind: "INTEGRATE",
      title: "Meditation: Morning Orbit.",
      description:
        "Listen to the meditation tomorrow morning when you wake up. That's the assignment.",
      primaryHref: ROUTES.bookPart4,
      primaryLabel: "Open the meditation",
      estimatedMin: 28,
    },
    {
      kind: "PRACTICE",
      title: "Build your Evening Wind Down.",
      description:
        "Your evening determines your tomorrow. Most people get this wrong.",
      primaryHref: ROUTES.bookPart4,
      primaryLabel: "Design your evening",
      estimatedMin: 25,
    },
    {
      kind: "INTEGRATE",
      title: "Meditation: Evening Wind Down.",
      description: "This one's for tonight. Set a reminder.",
      primaryHref: ROUTES.bookPart4,
      primaryLabel: "Open the meditation",
      estimatedMin: 28,
    },
    {
      kind: "APPLY",
      title: "Run a perfect AM + PM day.",
      description:
        "Today you live the design. Notice what works and what doesn't.",
      primaryHref: ROUTES.dashboard,
      primaryLabel: "Run your day",
      estimatedMin: 15,
    },
    {
      kind: "REFLECT",
      title: "Edit your routines.",
      description: "What stays, what goes. Tune based on the week.",
      primaryHref: ROUTES.bookPart4,
      primaryLabel: "Refine",
      estimatedMin: 15,
    },
  ],
  endOfWeekCopy: "AM/PM rhythm locked. You designed your day.",
  endOfWeekTier: "glow",
};

const WEEK_3: WeekTheme = {
  week: 3,
  title: "Dopamine Detox",
  themeLabel: "Dopamine Detox",
  goal: "Identify the cheap dopamine sources draining you and commit to a 30-day reduction.",
  sourceChapters: "Chapter 15 · Dopamine Detox",
  pattern: [
    {
      kind: "LEARN",
      title: "Cheap dopamine is the most expensive thing in your life.",
      description:
        "Today we name what's stealing from you.",
      primaryHref: ROUTES.bookPart4,
      primaryLabel: "Read Chapter 15",
      estimatedMin: 20,
    },
    {
      kind: "PRACTICE",
      title: "Identify your top 3 dopamine drains.",
      description:
        "Be honest. The phone. The drink. The scroll. The thing you reach for when you're avoiding.",
      primaryHref: ROUTES.bookPart4,
      primaryLabel: "Name the drains",
      estimatedMin: 15,
    },
    {
      kind: "INTEGRATE",
      title: "Commit to one 30-day detox.",
      description:
        "Pick one drain. Just one. Commit to thirty days off or down.",
      primaryHref: ROUTES.bookPart4,
      primaryLabel: "Commit",
      estimatedMin: 10,
    },
    {
      kind: "APPLY",
      title: "Day 1 of your detox.",
      description:
        "Notice the urge. Notice that you don't have to act on it. That's the muscle.",
      primaryHref: ROUTES.dashboard,
      primaryLabel: "Begin the detox",
      estimatedMin: 10,
    },
    {
      kind: "REVISIT",
      title: "Read your Core Narrative again.",
      description:
        "Notice if the story you cling to creates the cravings.",
      primaryHref: ROUTES.coreNarrative,
      primaryLabel: "Re-read",
      estimatedMin: 15,
    },
    {
      kind: "DEEPEN",
      title: "Replace the cheap dopamine with something true.",
      description:
        "What earned dopamine source could replace the cheap one? Build it in.",
      primaryHref: ROUTES.listOfJoy,
      primaryLabel: "Add an earned source",
      estimatedMin: 15,
    },
    {
      kind: "REFLECT",
      title: "One week of detox.",
      description:
        "How's it going? Honest. The work isn't the abstinence — it's the awareness.",
      primaryHref: ROUTES.wins,
      primaryLabel: "Reflect",
      estimatedMin: 10,
    },
  ],
  endOfWeekCopy: "You're choosing. That's the difference.",
  endOfWeekTier: "glow",
};

const WEEK_4: WeekTheme = {
  week: 4,
  title: "Habit Renaissance",
  themeLabel: "Habit Renaissance",
  goal: "Spotlight one harmful habit. Build one joyful habit using the D.A.D. framework.",
  sourceChapters: "Chapter 16 · Habits + Chapter 17 · Habit Renaissance",
  pattern: [
    {
      kind: "LEARN",
      title: "D.A.D. — Decide, Anchor, Design.",
      description:
        "Habits are the operating system's daily commands. Today we add a new one.",
      primaryHref: ROUTES.bookPart4,
      primaryLabel: "Read Chapter 17",
      estimatedMin: 20,
    },
    {
      kind: "PRACTICE",
      title: "Harmful Habit Spotlight.",
      description:
        "Pick one habit that's eating you alive. Just one. Today we look at it.",
      primaryHref: ROUTES.bookPart4,
      primaryLabel: "Spotlight one",
      estimatedMin: 20,
    },
    {
      kind: "PRACTICE",
      title: "Build one new joyful habit.",
      description:
        "What's the joyful habit that replaces it? Design it using D.A.D.",
      primaryHref: ROUTES.bookPart4,
      primaryLabel: "Design the new habit",
      estimatedMin: 25,
    },
    {
      kind: "APPLY",
      title: "Day 1 of the new habit.",
      description:
        "Anchor it to something already happening. After [trigger], I do [new habit].",
      primaryHref: ROUTES.dashboard,
      primaryLabel: "Practice the anchor",
      estimatedMin: 10,
    },
    {
      kind: "REVISIT",
      title: "Re-score your Pillars.",
      description:
        "Notice which pillar this habit serves.",
      primaryHref: ROUTES.pillars,
      primaryLabel: "Re-score",
      estimatedMin: 15,
    },
    {
      kind: "DEEPEN",
      title: "Habit stacking.",
      description:
        "Can you add a second tiny habit to the first? Don't overdo it.",
      primaryHref: ROUTES.bookPart4,
      primaryLabel: "Stack one more",
      estimatedMin: 15,
    },
    {
      kind: "REFLECT",
      title: "End of Month 1.",
      description:
        "One month. JQ check-in. Pillar re-score. What's shifted.",
      primaryHref: ROUTES.assessment,
      primaryLabel: "Re-take the JQ",
      estimatedMin: 30,
    },
  ],
  endOfWeekCopy: "One month done. Re-take JQ. Re-score Pillars. See the shift.",
  endOfWeekTier: "bloom",
};

const WEEK_5: WeekTheme = {
  week: 5,
  title: "Sleep",
  themeLabel: "Sleep",
  goal: "Audit and upgrade sleep environment. Lock in a real Evening Wind Down.",
  sourceChapters: "Chapter 17 · Habit Renaissance (sleep)",
  pattern: [
    {
      kind: "LEARN",
      title: "You can't out-discipline bad sleep.",
      description: "Today we look at why.",
      primaryHref: ROUTES.bookPart4,
      primaryLabel: "Read the sleep section",
      estimatedMin: 20,
    },
    {
      kind: "PRACTICE",
      title: "Sleep environment audit.",
      description:
        "Walk through your bedroom. What's working against you? What's missing?",
      primaryHref: ROUTES.bookPart4,
      primaryLabel: "Audit",
      estimatedMin: 25,
    },
    {
      kind: "APPLY",
      title: "Make one sleep change tonight.",
      description:
        "One change. Tonight. Notice the difference tomorrow.",
      primaryHref: ROUTES.dashboard,
      primaryLabel: "Pick the change",
      estimatedMin: 10,
    },
    {
      kind: "INTEGRATE",
      title: "Evening Wind Down meditation.",
      description:
        "Tonight, do the full Evening Wind Down. Phone in another room.",
      primaryHref: ROUTES.bookPart4,
      primaryLabel: "Open the meditation",
      estimatedMin: 28,
    },
    {
      kind: "DEEPEN",
      title: "The 14 sleep upgrades.",
      description:
        "Pick three more from the list. Implement this week.",
      primaryHref: ROUTES.bookPart4,
      primaryLabel: "See the list",
      estimatedMin: 20,
    },
    {
      kind: "REVISIT",
      title: "How's the new sleep going?",
      description: "Honest assessment. What worked? What didn't?",
      primaryHref: ROUTES.wins,
      primaryLabel: "Reflect",
      estimatedMin: 10,
    },
    {
      kind: "REFLECT",
      title: "Sleep as a JOS upgrade.",
      description:
        "Sleep is where the JOS does its deepest work. Notice your mornings now.",
      primaryHref: ROUTES.wins,
      primaryLabel: "Notice the shift",
      estimatedMin: 10,
    },
  ],
  endOfWeekCopy: "Sleep is now a pillar of your practice.",
  endOfWeekTier: "glow",
};

const WEEK_6: WeekTheme = {
  week: 6,
  title: "Giving",
  themeLabel: "Giving",
  goal: "Practice giving (time, attention, money, love) and observe the joy compound.",
  sourceChapters: "Research on giving as a joy multiplier",
  pattern: [
    {
      kind: "LEARN",
      title: "The neuroscience of giving.",
      description:
        "The research is unambiguous: giving fires the same joy circuits as receiving. Today we test it.",
      primaryHref: ROUTES.book,
      primaryLabel: "Read",
      estimatedMin: 15,
    },
    {
      kind: "PRACTICE",
      title: "One act of giving today.",
      description:
        "Anonymous, ideally. Something that costs you something. Notice your nervous system afterward.",
      primaryHref: ROUTES.dashboard,
      primaryLabel: "Give",
      estimatedMin: 15,
    },
    {
      kind: "APPLY",
      title: "A giving you can repeat daily.",
      description:
        "What's the small giving you could build into your routine? A compliment. A text. A favor.",
      primaryHref: ROUTES.dashboard,
      primaryLabel: "Build it in",
      estimatedMin: 10,
    },
    {
      kind: "REVISIT",
      title: "Add five new entries to your List of Joy.",
      description: "Especially ones about giving.",
      primaryHref: ROUTES.listOfJoy,
      primaryLabel: "Add five",
      estimatedMin: 10,
    },
    {
      kind: "DEEPEN",
      title: "Give to the version of you who needs it.",
      description:
        "Sometimes the person who most needs your gift is past-you. Or future-you. Write a letter.",
      primaryHref: ROUTES.letters,
      primaryLabel: "Write the letter",
      estimatedMin: 20,
    },
    {
      kind: "INTEGRATE",
      title: "Re-read your Self-Eulogy.",
      description:
        "How is the person you want to be remembered as a giver? Notice.",
      primaryHref: ROUTES.selfEulogy,
      primaryLabel: "Re-read",
      estimatedMin: 15,
    },
    {
      kind: "REFLECT",
      title: "One week of giving.",
      description:
        "What did giving do to your week? Be specific. The patterns matter.",
      primaryHref: ROUTES.wins,
      primaryLabel: "Reflect",
      estimatedMin: 10,
    },
  ],
  endOfWeekCopy: "Joy gives itself away. You're learning this.",
  endOfWeekTier: "glow",
};

const WEEK_7: WeekTheme = {
  week: 7,
  title: "Play",
  themeLabel: "Play",
  goal: "Reclaim play. Add novelty. Make something. Move your body for fun.",
  sourceChapters: "Manuscript chapters on play, creativity, and novelty",
  pattern: [
    {
      kind: "LEARN",
      title: "Why adults forget how to play.",
      description:
        "Play is not a luxury. It's a JOS function you've muted. Today we unmute it.",
      primaryHref: ROUTES.book,
      primaryLabel: "Read",
      estimatedMin: 15,
    },
    {
      kind: "PRACTICE",
      title: "List 10 things you used to play at as a kid.",
      description:
        "What did you love before anyone told you to be serious? Make the list.",
      primaryHref: ROUTES.listOfJoy,
      primaryLabel: "Make the list",
      estimatedMin: 15,
    },
    {
      kind: "APPLY",
      title: "Do one of them today.",
      description:
        "Pick one thing from your list. Do it today. Yes, today. Yes, for thirty minutes.",
      primaryHref: ROUTES.dashboard,
      primaryLabel: "Play",
      estimatedMin: 30,
    },
    {
      kind: "DEEPEN",
      title: "Add novelty to one routine.",
      description:
        "Take a different route. Cook something new. Listen to a genre you've never tried.",
      primaryHref: ROUTES.dashboard,
      primaryLabel: "Add novelty",
      estimatedMin: 15,
    },
    {
      kind: "INTEGRATE",
      title: "Move your body for fun, not fitness.",
      description: "Dance. Walk a new route. Swim. Not for calories. For the body's joy.",
      primaryHref: ROUTES.dashboard,
      primaryLabel: "Move",
      estimatedMin: 20,
    },
    {
      kind: "REVISIT",
      title: "Add to your List of Joy from this week.",
      description: "What did play surface? Add the things you forgot you loved.",
      primaryHref: ROUTES.listOfJoy,
      primaryLabel: "Add five",
      estimatedMin: 10,
    },
    {
      kind: "REFLECT",
      title: "The cost of seriousness.",
      description: "How much joy have you lost to being serious? Today we name it.",
      primaryHref: ROUTES.wins,
      primaryLabel: "Reflect",
      estimatedMin: 10,
    },
  ],
  endOfWeekCopy: "You're remembering how to play. That's a return to self.",
  endOfWeekTier: "glow",
};

const WEEK_8: WeekTheme = {
  week: 8,
  title: "Inner Work",
  themeLabel: "Inner Work",
  goal: "Decide on a modality of inner work. Make a real commitment.",
  sourceChapters: "Chapter 18 · Therapy",
  pattern: [
    {
      kind: "LEARN",
      title: "Inner work is not optional.",
      description:
        "The question is which modality. Today we look at the options.",
      primaryHref: ROUTES.bookPart4,
      primaryLabel: "Read Chapter 18",
      estimatedMin: 25,
    },
    {
      kind: "PRACTICE",
      title: "Identify what's still in your shadow.",
      description:
        "What pattern keeps repeating? What story still has hooks in you? Be honest.",
      primaryHref: ROUTES.coreNarrative,
      primaryLabel: "Write",
      estimatedMin: 20,
    },
    {
      kind: "APPLY",
      title: "Research one modality.",
      description:
        "Spend 30 minutes researching one modality that calls to you. Talk therapy, somatic, EMDR, breathwork, plant medicine.",
      primaryHref: ROUTES.tools,
      primaryLabel: "Research",
      estimatedMin: 30,
    },
    {
      kind: "DEEPEN",
      title: "Book the first session or buy the program.",
      description:
        "Today. Not tomorrow. Today. The action is the work.",
      primaryHref: ROUTES.dashboard,
      primaryLabel: "Take action",
      estimatedMin: 15,
    },
    {
      kind: "INTEGRATE",
      title: "Re-read your Core Narrative.",
      description:
        "Notice how the narrative has shifted in seven weeks. What's the next layer?",
      primaryHref: ROUTES.coreNarrative,
      primaryLabel: "Re-read",
      estimatedMin: 15,
    },
    {
      kind: "REVISIT",
      title: "Re-score your Pillars.",
      description:
        "Notice the gaps you couldn't see two months ago.",
      primaryHref: ROUTES.pillars,
      primaryLabel: "Re-score",
      estimatedMin: 15,
    },
    {
      kind: "REFLECT",
      title: "End of Month 2.",
      description:
        "Two months. JQ check-in. Pillar re-score. Notice what's compounding.",
      primaryHref: ROUTES.assessment,
      primaryLabel: "Re-take the JQ",
      estimatedMin: 30,
    },
  ],
  endOfWeekCopy: "Two months in. The system is yours.",
  endOfWeekTier: "bloom",
};

const WEEK_9: WeekTheme = {
  week: 9,
  title: "Forgiveness Deep Work",
  themeLabel: "Forgiveness",
  goal: "Process one person from your Forgiveness Hit List through the four-step framework.",
  sourceChapters: "Chapter 14 · Forgiveness",
  pattern: [
    {
      kind: "LEARN",
      title: "This is the deepest work.",
      description: "Take it seriously. Take it slowly.",
      primaryHref: ROUTES.forgiveness,
      primaryLabel: "Read Chapter 14",
      estimatedMin: 25,
    },
    {
      kind: "PRACTICE",
      title: "Build your Forgiveness Hit List.",
      description:
        "In private. In your Forgiveness Vault. Everyone you're still carrying.",
      primaryHref: ROUTES.forgiveness,
      primaryLabel: "Enter the Vault",
      estimatedMin: 25,
    },
    {
      kind: "PRACTICE",
      title: "Step 1 · Victim Rant.",
      description:
        "Get the rant out. All of it. No editing. No fairness. This stays private.",
      primaryHref: ROUTES.forgiveness,
      primaryLabel: "Step 1",
      estimatedMin: 30,
    },
    {
      kind: "PRACTICE",
      title: "Step 2 · Empath Rave.",
      description:
        "Now consider their humanity. Not to excuse — to expand.",
      primaryHref: ROUTES.forgiveness,
      primaryLabel: "Step 2",
      estimatedMin: 30,
    },
    {
      kind: "PRACTICE",
      title: "Step 3 · Universal Meaning.",
      description:
        "What did this experience give you that you couldn't have gotten elsewhere?",
      primaryHref: ROUTES.forgiveness,
      primaryLabel: "Step 3",
      estimatedMin: 30,
    },
    {
      kind: "PRACTICE",
      title: "Step 4 · Forgiveness.",
      description:
        "Today you release one person. Forever. Listen to Freedom afterward.",
      primaryHref: ROUTES.forgiveness,
      primaryLabel: "Step 4",
      estimatedMin: 45,
    },
    {
      kind: "REFLECT",
      title: "What it feels like to release.",
      description:
        "Notice the lightness. That's what was costing you, every day, for years.",
      primaryHref: ROUTES.wins,
      primaryLabel: "Sit with it",
      estimatedMin: 15,
    },
  ],
  endOfWeekCopy: "You released someone. The lightness is real.",
  endOfWeekTier: "bloom",
};

const WEEK_10: WeekTheme = {
  week: 10,
  title: "Law of Zero Gravity",
  themeLabel: "Zero Gravity",
  goal: "Calculate your hourly rate. Audit time. Build a delegation list.",
  sourceChapters: "Chapter 19 · Time Freedom",
  pattern: [
    {
      kind: "LEARN",
      title: "Time is the only resource that doesn't refill.",
      description: "Today we look at how you spend it.",
      primaryHref: ROUTES.bookPart4,
      primaryLabel: "Read Chapter 19",
      estimatedMin: 25,
    },
    {
      kind: "PRACTICE",
      title: "Calculate your real hourly rate.",
      description:
        "Income divided by hours worked. The number will surprise you.",
      primaryHref: ROUTES.bookPart4,
      primaryLabel: "Calculate",
      estimatedMin: 20,
    },
    {
      kind: "PRACTICE",
      title: "Zero Gravity Audit.",
      description:
        "List everything you did this week below your hourly rate. Be ruthless.",
      primaryHref: ROUTES.bookPart4,
      primaryLabel: "Audit",
      estimatedMin: 25,
    },
    {
      kind: "PRACTICE",
      title: "Build your delegation list.",
      description:
        "What goes to a person? A tool? An automation? Decide for each item.",
      primaryHref: ROUTES.bookPart4,
      primaryLabel: "Build the list",
      estimatedMin: 25,
    },
    {
      kind: "APPLY",
      title: "Delegate one thing today.",
      description:
        "Make one move toward Zero Gravity. Hire it out. Automate it. Say no.",
      primaryHref: ROUTES.dashboard,
      primaryLabel: "Delegate",
      estimatedMin: 15,
    },
    {
      kind: "DEEPEN",
      title: "Re-read your Self-Eulogy.",
      description:
        "Does how you spend time match how you want to be remembered? Be honest.",
      primaryHref: ROUTES.selfEulogy,
      primaryLabel: "Re-read",
      estimatedMin: 15,
    },
    {
      kind: "REFLECT",
      title: "The cost of low-leverage time.",
      description:
        "Time freedom isn't laziness — it's choosing where you spend yourself.",
      primaryHref: ROUTES.wins,
      primaryLabel: "Reflect",
      estimatedMin: 10,
    },
  ],
  endOfWeekCopy: "Your time is now leverage.",
  endOfWeekTier: "glow",
};

const WEEK_11: WeekTheme = {
  week: 11,
  title: "JOMO · saying no",
  themeLabel: "JOMO · Saying No",
  goal: "Build a weekly NO list. Practice saying no without explaining.",
  sourceChapters: "JOMO manuscript material",
  pattern: [
    {
      kind: "LEARN",
      title: "Every YES is a NO to something else.",
      description:
        "You don't have a time problem. You have a saying-yes problem. Today we look at it.",
      primaryHref: ROUTES.book,
      primaryLabel: "Read",
      estimatedMin: 20,
    },
    {
      kind: "PRACTICE",
      title: "This week's NO list.",
      description:
        "Five things you're saying no to this week. Write them down.",
      primaryHref: ROUTES.book,
      primaryLabel: "Make the list",
      estimatedMin: 15,
    },
    {
      kind: "APPLY",
      title: "Say one no today, without explaining.",
      description:
        "No is a complete sentence. Try it once. Notice if the world ends.",
      primaryHref: ROUTES.dashboard,
      primaryLabel: "Say no",
      estimatedMin: 10,
    },
    {
      kind: "DEEPEN",
      title: "The 'fuck yes or no' filter.",
      description:
        "If it's not a fuck yes, it's a no. That's the rule going forward.",
      primaryHref: ROUTES.book,
      primaryLabel: "Apply the filter",
      estimatedMin: 15,
    },
    {
      kind: "REVISIT",
      title: "Re-score your Pillars.",
      description:
        "What's draining each pillar? Often it's the yeses that should have been nos.",
      primaryHref: ROUTES.pillars,
      primaryLabel: "Re-score",
      estimatedMin: 15,
    },
    {
      kind: "INTEGRATE",
      title: "Update your SubScript with boundary language.",
      description:
        "Add a line. 'I say no with love and without apology.' Read it twice today.",
      primaryHref: ROUTES.subscript,
      primaryLabel: "Update",
      estimatedMin: 15,
    },
    {
      kind: "REFLECT",
      title: "A week of NO.",
      description:
        "Notice how saying no felt. Notice the energy that came back.",
      primaryHref: ROUTES.wins,
      primaryLabel: "Reflect",
      estimatedMin: 10,
    },
  ],
  endOfWeekCopy: "Your time is yours. Your energy is yours. That's the work.",
  endOfWeekTier: "glow",
};

const WEEK_12: WeekTheme = {
  week: 12,
  title: "Integration",
  themeLabel: "Integration",
  goal: "Re-read your foundational work. Update what's grown. Look forward.",
  sourceChapters: "Chapter 20 · Final Chapter",
  pattern: [
    {
      kind: "REVISIT",
      title: "Re-read your Self-Eulogy.",
      description:
        "Read who you wanted to be remembered as. Edit if needed. You've changed.",
      primaryHref: ROUTES.selfEulogy,
      primaryLabel: "Re-read",
      estimatedMin: 20,
    },
    {
      kind: "REVISIT",
      title: "Re-read your Core Narrative.",
      description:
        "The story you rewrote. Is it still the right rewrite? Or does it need to evolve?",
      primaryHref: ROUTES.coreNarrative,
      primaryLabel: "Re-read",
      estimatedMin: 20,
    },
    {
      kind: "PRACTICE",
      title: "Write a letter to past you.",
      description:
        "Tell the version of you who signed up what you know now. The letter saves to My Alchemy.",
      primaryHref: ROUTES.letters,
      primaryLabel: "Write",
      estimatedMin: 25,
    },
    {
      kind: "PRACTICE",
      title: "Write a letter to future you.",
      description:
        "Schedule it to deliver in one year. The future version of you needs to hear from this version.",
      primaryHref: ROUTES.letters,
      primaryLabel: "Schedule",
      estimatedMin: 25,
    },
    {
      kind: "REVISIT",
      title: "Your List of Joy growth.",
      description:
        "Look at how it's grown. Read your favorites. Add five more today.",
      primaryHref: ROUTES.listOfJoy,
      primaryLabel: "Browse",
      estimatedMin: 15,
    },
    {
      kind: "INTEGRATE",
      title: "Meditation: The Alchemist.",
      description:
        "This is the closing meditation. Make space for it. Forty-five minutes.",
      primaryHref: ROUTES.book,
      primaryLabel: "Open the meditation",
      estimatedMin: 45,
    },
    {
      kind: "PRACTICE",
      title: "Update your SubScript for the next chapter.",
      description:
        "Your SubScript should reflect who you are now. Edit it. Re-record if you recorded it.",
      primaryHref: ROUTES.subscript,
      primaryLabel: "Update",
      estimatedMin: 25,
    },
  ],
  endOfWeekCopy: "You're ready for the look-back.",
  endOfWeekTier: "glow",
};

const WEEK_THEMES: WeekTheme[] = [
  WEEK_2,
  WEEK_3,
  WEEK_4,
  WEEK_5,
  WEEK_6,
  WEEK_7,
  WEEK_8,
  WEEK_9,
  WEEK_10,
  WEEK_11,
  WEEK_12,
];

/* ─── Day 85-89 reflection prompts ────────────────────────── */

const FINAL_STRETCH: DayTask[] = [
  {
    day: 85,
    weekNumber: 13,
    eyebrowLabel: "Day 85 · Final Stretch",
    title: "What is Day-0 me missing about life?",
    description: "Be specific. The contrast is the proof.",
    primaryHref: ROUTES.wins,
    primaryLabel: "Write the answer",
    estimatedMin: 15,
    isReflection: true,
  },
  {
    day: 86,
    weekNumber: 13,
    eyebrowLabel: "Day 86 · Final Stretch",
    title: "What habit have I built that I won't lose?",
    description: "Name it. Claim it. It's now part of you.",
    primaryHref: ROUTES.wins,
    primaryLabel: "Name it",
    estimatedMin: 10,
    isReflection: true,
  },
  {
    day: 87,
    weekNumber: 13,
    eyebrowLabel: "Day 87 · Final Stretch",
    title: "What story have I rewritten that won't go back?",
    description:
      "The narrative that's no longer running you. Notice how quiet it is.",
    primaryHref: ROUTES.coreNarrative,
    primaryLabel: "Notice",
    estimatedMin: 15,
    isReflection: true,
  },
  {
    day: 88,
    weekNumber: 13,
    eyebrowLabel: "Day 88 · Final Stretch",
    title: "Who have I become that I couldn't have imagined 89 days ago?",
    description: "Write the answer. Read it aloud.",
    primaryHref: ROUTES.wins,
    primaryLabel: "Write",
    estimatedMin: 20,
    isReflection: true,
  },
  {
    day: 89,
    weekNumber: 13,
    eyebrowLabel: "Day 89 · Final Stretch",
    title: "What's the work for the next 90 days?",
    description:
      "You don't stop here. This was the install. The rest of your life is the practice.",
    primaryHref: ROUTES.wins,
    primaryLabel: "Set the next horizon",
    estimatedMin: 20,
    isReflection: true,
  },
];

/* ─── Day 90: the look-back ritual ────────────────────────── */

const DAY_90: DayTask = {
  day: 90,
  weekNumber: 13,
  eyebrowLabel: "Day 90 · The Look-Back",
  title: "Ninety days. The Alchemist's path.",
  description:
    "Today is the look-back. Re-take the JQ. Re-score the Pillars. Re-read your Self-Eulogy and Core Narrative against where you started. Then the Alchemist meditation, then the Ascension. You did it.",
  primaryHref: ROUTES.assessment,
  primaryLabel: "Begin the Look-Back",
  estimatedMin: 90,
  closingLine:
    "Welcome home. Tomorrow Practice Mode begins. The same daily rhythm, the same JOS — but now it's part of you.",
  isMilestone: true,
  milestoneTier: "ascension",
};

/* ─── Build the DAYS array ────────────────────────────────── */

function buildWeek2to12Day(day: number): DayTask {
  const weekNumber = Math.ceil(day / 7); // 2..12 for days 8-84
  const theme = WEEK_THEMES.find((w) => w.week === weekNumber)!;
  const dayInWeek = ((day - 1) % 7); // 0..6
  const p = theme.pattern[dayInWeek];
  const isWeekEnd = dayInWeek === 6;
  return {
    day,
    weekNumber,
    eyebrowLabel: `Day ${day} · Week ${weekNumber} · ${theme.themeLabel}`,
    title: p.title,
    description: p.description,
    primaryHref: p.primaryHref,
    primaryLabel: p.primaryLabel,
    estimatedMin: p.estimatedMin,
    closingLine: isWeekEnd ? theme.endOfWeekCopy : undefined,
    isMilestone: isWeekEnd,
    milestoneTier: isWeekEnd ? theme.endOfWeekTier : undefined,
    isReflection: p.kind === "REFLECT" || p.kind === "REVISIT",
  };
}

export const DAYS: DayTask[] = [
  ...WEEK_1,
  ...Array.from({ length: 77 }, (_, i) => buildWeek2to12Day(i + 8)), // 8..84
  ...FINAL_STRETCH,
  DAY_90,
];

export function getDayTask(day: number): DayTask | null {
  if (day < 1 || day > 90) return null;
  return DAYS[day - 1];
}

/* ─── Legacy WEEKS export — kept for the walk-through page ─ */

export const WEEKS = [
  {
    week: 1,
    title: "Daily Rhythm",
    focus: "Daily Rhythm",
    action:
      "Lock in twice-daily SubScript reads, ITT loop, Joy Pulse. Meet Joy Judo, Emotional Alchemy, Reframe Ritual, 60-Second Shift.",
    link: ROUTES.subscript,
  },
  ...WEEK_THEMES.map((w) => ({
    week: w.week,
    title: w.title,
    focus: w.title,
    action: w.goal,
    link: w.pattern[0].primaryHref,
  })),
];
