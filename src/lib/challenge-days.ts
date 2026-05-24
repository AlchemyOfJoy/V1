/**
 * The 90 daily tasks — the spine of how the entire app is used.
 *
 * Every user, from the moment they finish onboarding, is on Day 1.
 * They never wonder what to do today. Each day has one prescribed
 * task; they can do more, but the daily one is the simple path.
 *
 * Days 1-90 walk users through the foundations laid out in the book +
 * retreat curriculum, week by week, building the install one piece at
 * a time. By Day 90 they have it all: Core Narrative rewritten,
 * Self-Eulogy written, List of Joy alive, Pillars baselined, SubScript
 * built and read daily, Forgiveness work done, every Bold Action tool
 * practiced. The 90 days are the integration.
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

export const DAYS: DayTask[] = [
  // ───── WEEK 1: Foundation (1-7) ─────
  {
    day: 1,
    weekNumber: 1,
    title: "Take your baseline JQ",
    description:
      "Ten questions. Your starting point. Every JQ from here is measured against this one.",
    primaryHref: "/assessment",
    primaryLabel: "Take the JQ — 10 min",
    estimatedMin: 10,
    isMilestone: true,
  },
  {
    day: 2,
    weekNumber: 1,
    title: "The four chemicals of joy",
    description:
      "Read the first Foundation card. Dopamine, serotonin, oxytocin, endorphins — and why neurogenesis means you can rewire.",
    primaryHref: "/journey/foundations/joy-chemicals",
    primaryLabel: "Read · 2 min",
    estimatedMin: 5,
  },
  {
    day: 3,
    weekNumber: 1,
    title: "The Reticular Activating System",
    description:
      "What you focus on, you find. Read the second foundation card and then add 3 things to your List of Joy.",
    primaryHref: "/journey/foundations/reticular-activating-system",
    primaryLabel: "Read · 2 min",
    estimatedMin: 8,
  },
  {
    day: 4,
    weekNumber: 1,
    title: "Brain Waves",
    description:
      "Why the SubScript is read in the theta window — first thing in the morning, last thing at night.",
    primaryHref: "/journey/foundations/brain-waves",
    primaryLabel: "Read · 2 min",
    estimatedMin: 5,
  },
  {
    day: 5,
    weekNumber: 1,
    title: "Begin your Core Narrative",
    description:
      "Name the first old story you catch yourself believing — even when it isn't true.",
    primaryHref:
      "/curriculum/module/02-joyful-operating-system/core-narrative",
    primaryLabel: "Begin the wizard",
    estimatedMin: 15,
  },
  {
    day: 6,
    weekNumber: 1,
    title: "Two more old stories",
    description:
      "Continue the Core Narrative work. Name the second and third stories that have run your life.",
    primaryHref:
      "/curriculum/module/02-joyful-operating-system/core-narrative",
    primaryLabel: "Continue",
    estimatedMin: 15,
  },
  {
    day: 7,
    weekNumber: 1,
    title: "Sit with what surfaced",
    description:
      "Quiet day. Re-read what you wrote. Add 3 things to your List of Joy.",
    primaryHref: "/curriculum/module/02-joyful-operating-system/list-of-joy",
    primaryLabel: "Add to your List",
    estimatedMin: 10,
    isReflection: true,
  },

  // ───── WEEK 2: The List of Joy (8-14) ─────
  {
    day: 8,
    weekNumber: 2,
    title: "Flip the first story",
    description:
      "Rewrite the first old story as its 180° truth. Stated as if already so.",
    primaryHref:
      "/curriculum/module/02-joyful-operating-system/core-narrative",
    primaryLabel: "Continue",
    estimatedMin: 15,
  },
  {
    day: 9,
    weekNumber: 2,
    title: "Flip the second story",
    description: "Rewrite the second old story. Don't soften it — let it be true.",
    primaryHref:
      "/curriculum/module/02-joyful-operating-system/core-narrative",
    primaryLabel: "Continue",
    estimatedMin: 15,
  },
  {
    day: 10,
    weekNumber: 2,
    title: "Flip the third — and reflect",
    description:
      "Final flip, then the reflection. If these new stories were the truth, how would your life be different?",
    primaryHref:
      "/curriculum/module/02-joyful-operating-system/core-narrative",
    primaryLabel: "Finish Core Narrative",
    estimatedMin: 20,
  },
  {
    day: 11,
    weekNumber: 2,
    title: "Grow your List of Joy",
    description:
      "Add five things today. Small ones count. The look on your dog's face counts.",
    primaryHref: "/curriculum/module/02-joyful-operating-system/list-of-joy",
    primaryLabel: "Add five",
    estimatedMin: 10,
  },
  {
    day: 12,
    weekNumber: 2,
    title: "Five more",
    description:
      "Today, look for joys you almost overlooked. Add five more.",
    primaryHref: "/curriculum/module/02-joyful-operating-system/list-of-joy",
    primaryLabel: "Add five",
    estimatedMin: 10,
  },
  {
    day: 13,
    weekNumber: 2,
    title: "Tag your joys",
    description:
      "Open your List of Joy and tag what you can by Priority Pillar — Love, Faith, Health, Family, Career, Community.",
    primaryHref: "/curriculum/module/02-joyful-operating-system/list-of-joy",
    primaryLabel: "Open your list",
    estimatedMin: 10,
  },
  {
    day: 14,
    weekNumber: 2,
    title: "Day 14 — take stock",
    description:
      "Two weeks in. Look at your List of Joy growth chart. Notice the shift.",
    primaryHref: "/me/wins",
    primaryLabel: "See your wins",
    estimatedMin: 5,
    isReflection: true,
  },

  // ───── WEEK 3: Priority Pillars (15-21) ─────
  {
    day: 15,
    weekNumber: 3,
    title: "Score Love + Faith",
    description:
      "First pillar pair. Begin the Pillars inventory — Love and Faith.",
    primaryHref:
      "/curriculum/module/02-joyful-operating-system/priority-pillars",
    primaryLabel: "Begin the inventory",
    estimatedMin: 10,
  },
  {
    day: 16,
    weekNumber: 3,
    title: "Score Health + Family",
    description: "Continue the inventory — Health and Family.",
    primaryHref:
      "/curriculum/module/02-joyful-operating-system/priority-pillars",
    primaryLabel: "Continue",
    estimatedMin: 10,
  },
  {
    day: 17,
    weekNumber: 3,
    title: "Score Career + Community",
    description: "Finish the slider work — Career and Community.",
    primaryHref:
      "/curriculum/module/02-joyful-operating-system/priority-pillars",
    primaryLabel: "Continue",
    estimatedMin: 10,
  },
  {
    day: 18,
    weekNumber: 3,
    title: "Take your first snapshot",
    description:
      "Lock in today's scores. You'll come back in 30 days and watch the bars move.",
    primaryHref:
      "/curriculum/module/02-joyful-operating-system/priority-pillars",
    primaryLabel: "Take the snapshot",
    estimatedMin: 5,
  },
  {
    day: 19,
    weekNumber: 3,
    title: "Where the lean is",
    description:
      "Look at the bars. Where are you most depleted? Sit with what that tells you.",
    primaryHref:
      "/curriculum/module/02-joyful-operating-system/priority-pillars",
    primaryLabel: "Review your inventory",
    estimatedMin: 10,
  },
  {
    day: 20,
    weekNumber: 3,
    title: "Fuel the depleted pillar",
    description:
      "Add 5 List of Joy items that target your most depleted pillar. Specific. Today-sized.",
    primaryHref: "/curriculum/module/02-joyful-operating-system/list-of-joy",
    primaryLabel: "Add five — targeted",
    estimatedMin: 10,
  },
  {
    day: 21,
    weekNumber: 3,
    title: "End of week three",
    description:
      "Sunday Pillar pulse. Write one sentence about what you noticed this week.",
    primaryHref: "/curriculum/journal",
    primaryLabel: "Open journal",
    estimatedMin: 5,
    isReflection: true,
  },

  // ───── WEEK 4: SubScript launch (22-28) ─────
  {
    day: 22,
    weekNumber: 4,
    title: "Self-Eulogy — settle",
    description:
      "Read the nine guiding prompts. Don't write yet. Just let them land.",
    primaryHref: "/curriculum/module/02-joyful-operating-system/self-eulogy",
    primaryLabel: "Begin",
    estimatedMin: 10,
  },
  {
    day: 23,
    weekNumber: 4,
    title: "Self-Eulogy — write the first draft",
    description:
      "Write the eulogy you'd want spoken about you. Past tense. As if already earned.",
    primaryHref: "/curriculum/module/02-joyful-operating-system/self-eulogy",
    primaryLabel: "Write",
    estimatedMin: 45,
  },
  {
    day: 24,
    weekNumber: 4,
    title: "Anchor your Joy Spark",
    description:
      "Begin your SubScript. Pull a real memory where joy was loudest — write it so vividly you can step back in.",
    primaryHref: "/curriculum/module/02-joyful-operating-system/subscript",
    primaryLabel: "Begin SubScript",
    estimatedMin: 15,
  },
  {
    day: 25,
    weekNumber: 4,
    title: "Write your manifestations",
    description:
      "The specific outcomes that pull you forward. Present tense. As if already so.",
    primaryHref: "/curriculum/module/02-joyful-operating-system/subscript",
    primaryLabel: "Continue",
    estimatedMin: 15,
  },
  {
    day: 26,
    weekNumber: 4,
    title: "Write your affirmations",
    description: "Who you are, declared. Not aspirations — identity.",
    primaryHref: "/curriculum/module/02-joyful-operating-system/subscript",
    primaryLabel: "Continue",
    estimatedMin: 15,
  },
  {
    day: 27,
    weekNumber: 4,
    title: "Lock in SubScript v1",
    description:
      "Read it through. Tweak anything. Lock it in. First morning + evening read today.",
    primaryHref: "/curriculum/module/02-joyful-operating-system/subscript",
    primaryLabel: "Lock it in",
    estimatedMin: 20,
  },
  {
    day: 28,
    weekNumber: 4,
    title: "End of week four",
    description:
      "What shifted this week? Add anything to your List of Joy that surprised you.",
    primaryHref: "/curriculum/journal",
    primaryLabel: "Reflect",
    estimatedMin: 5,
    isReflection: true,
  },

  // ───── WEEK 5: Forgiveness (29-35) ─────
  {
    day: 29,
    weekNumber: 5,
    title: "Begin your Forgiveness work",
    description:
      "Who comes up when you think about weight you're carrying? Begin a new process — a name, a nickname, even 'myself.'",
    primaryHref: "/curriculum/module/03-forgiveness",
    primaryLabel: "Begin",
    estimatedMin: 10,
  },
  {
    day: 30,
    weekNumber: 5,
    title: "Day 30 — retake your JQ",
    description:
      "First milestone. Take the JQ again. Compare to your baseline. Trust the data.",
    primaryHref: "/assessment",
    primaryLabel: "Retake the JQ",
    estimatedMin: 10,
    isMilestone: true,
  },
  {
    day: 31,
    weekNumber: 5,
    title: "Victim Rant",
    description:
      "Step 1 of the Forgiveness Framework. No editing, no fairness. Get it all out.",
    primaryHref: "/curriculum/module/03-forgiveness",
    primaryLabel: "Continue",
    estimatedMin: 30,
  },
  {
    day: 32,
    weekNumber: 5,
    title: "Empath Rave",
    description:
      "Step 2. Walk a mile in their shoes. You don't have to like it — only to see it.",
    primaryHref: "/curriculum/module/03-forgiveness",
    primaryLabel: "Continue",
    estimatedMin: 30,
  },
  {
    day: 33,
    weekNumber: 5,
    title: "Universal Meaning",
    description:
      "Step 3. What did this make possible? Who did it shape you into?",
    primaryHref: "/curriculum/module/03-forgiveness",
    primaryLabel: "Continue",
    estimatedMin: 30,
  },
  {
    day: 34,
    weekNumber: 5,
    title: "Release",
    description:
      "Step 4. Write the forgiveness statement out loud. Set the weight down.",
    primaryHref: "/curriculum/module/03-forgiveness",
    primaryLabel: "Release",
    estimatedMin: 30,
  },
  {
    day: 35,
    weekNumber: 5,
    title: "Rest and notice",
    description:
      "The body knows when something has shifted. Read your SubScript morning + evening.",
    primaryHref: "/curriculum/module/02-joyful-operating-system/subscript",
    primaryLabel: "Open SubScript",
    estimatedMin: 10,
    isReflection: true,
  },

  // ───── WEEK 6: Daily Joy Spark (36-42) ─────
  ...Array.from({ length: 6 }, (_, i) => ({
    day: 36 + i,
    weekNumber: 6,
    title: i === 0 ? "Daily Joy Spark — begin" : "Joy Spark",
    description:
      i === 0
        ? "This week, the Joy Spark every morning. Three breaths and a flash of joy memory."
        : "Run the Joy Spark. 90 seconds. Notice what the morning feels like after.",
    primaryHref: "/curriculum/module/04-bold-action/joy-spark",
    primaryLabel: "Run it · 90 sec",
    estimatedMin: 5,
  })),
  {
    day: 42,
    weekNumber: 6,
    title: "End of week six",
    description:
      "Six weeks in. Sleep on what felt different about your mornings this week.",
    primaryHref: "/curriculum/journal",
    primaryLabel: "Reflect",
    estimatedMin: 5,
    isReflection: true,
  },

  // ───── WEEK 7: Hourly Audit (43-49) ─────
  {
    day: 43,
    weekNumber: 7,
    title: "Hourly Audit — run it",
    description:
      "168 hours in a week. See where they actually go. Honest math, no theatre.",
    primaryHref: "/curriculum/module/04-bold-action/hourly-audit",
    primaryLabel: "Run the audit",
    estimatedMin: 15,
  },
  ...Array.from({ length: 5 }, (_, i) => ({
    day: 44 + i,
    weekNumber: 7,
    title: "Energy Inventory",
    description:
      "Daily — what gave you energy, what drained it. Patterns appear over the week.",
    primaryHref: "/curriculum/module/04-bold-action/energy-inventory",
    primaryLabel: "Log today",
    estimatedMin: 5,
  })),
  {
    day: 49,
    weekNumber: 7,
    title: "End of week seven",
    description:
      "Look at the week's patterns. One thing you'll keep, one you'll cut.",
    primaryHref: "/curriculum/journal",
    primaryLabel: "Reflect",
    estimatedMin: 5,
    isReflection: true,
  },

  // ───── WEEK 8: Gratitude (50-56) ─────
  ...Array.from({ length: 6 }, (_, i) => ({
    day: 50 + i,
    weekNumber: 8,
    title: i === 0 ? "Gratitude Three — begin" : "Gratitude Three",
    description:
      "Three specific gratitudes every morning. Specific is the whole game.",
    primaryHref: "/curriculum/module/04-bold-action/gratitude-three",
    primaryLabel: "Log three",
    estimatedMin: 5,
  })),
  {
    day: 56,
    weekNumber: 8,
    title: "End of week eight",
    description:
      "Week of gratitude. Notice if anything you logged showed up more in your life.",
    primaryHref: "/curriculum/journal",
    primaryLabel: "Reflect",
    estimatedMin: 5,
    isReflection: true,
  },

  // ───── WEEK 9: Reframe in the wild (57-63) ─────
  ...Array.from({ length: 6 }, (_, i) => ({
    day: 57 + i,
    weekNumber: 9,
    title: i === 0 ? "Reframe — catch & flip" : "Reframe Now",
    description:
      "When the old story shows up today, catch it and flip it. Log the flip.",
    primaryHref: "/curriculum/module/04-bold-action/reframe-now",
    primaryLabel: "Reframe",
    estimatedMin: 5,
  })),
  {
    day: 60,
    weekNumber: 9,
    title: "Day 60 — retake your JQ",
    description:
      "Second milestone JQ. Compare to baseline. The shift is real.",
    primaryHref: "/assessment",
    primaryLabel: "Retake the JQ",
    estimatedMin: 10,
    isMilestone: true,
  },
  {
    day: 63,
    weekNumber: 9,
    title: "End of week nine",
    description: "Look at your reframe log. Notice which story keeps trying to come back.",
    primaryHref: "/curriculum/journal",
    primaryLabel: "Reflect",
    estimatedMin: 5,
    isReflection: true,
  },

  // ───── WEEK 10: The Bold Ask (64-70) ─────
  {
    day: 64,
    weekNumber: 10,
    title: "Identify the Bold Ask",
    description:
      "What ask have you been avoiding? Write it down — who, what, by when.",
    primaryHref: "/curriculum/module/04-bold-action/bold-ask",
    primaryLabel: "Begin",
    estimatedMin: 10,
  },
  {
    day: 65,
    weekNumber: 10,
    title: "Draft the ask",
    description:
      "Write the bigger-than-comfortable version. Don't soften it. Don't send yet.",
    primaryHref: "/curriculum/module/04-bold-action/bold-ask",
    primaryLabel: "Draft",
    estimatedMin: 20,
  },
  {
    day: 66,
    weekNumber: 10,
    title: "Send it",
    description:
      "Bravery compounds. Today is the day. Commit to 48 hours.",
    primaryHref: "/curriculum/module/04-bold-action/bold-ask",
    primaryLabel: "Commit + send",
    estimatedMin: 15,
  },
  ...Array.from({ length: 4 }, (_, i) => ({
    day: 67 + i,
    weekNumber: 10,
    title: "Tiny brave act",
    description:
      "Bravery is not one big leap. One small one a day. Name it. Take it.",
    primaryHref: "/curriculum/module/04-bold-action/tiny-brave-act",
    primaryLabel: "Commit",
    estimatedMin: 5,
  })),

  // ───── WEEK 11: Identity (71-77) ─────
  ...Array.from({ length: 6 }, (_, i) => ({
    day: 71 + i,
    weekNumber: 11,
    title: i === 0 ? "Identity Declaration — begin" : "Identity Declaration",
    description:
      "Three I-am declarations. Present tense. Hand on heart. Spoken into being.",
    primaryHref: "/curriculum/module/04-bold-action/identity-declaration",
    primaryLabel: "Declare",
    estimatedMin: 5,
  })),
  {
    day: 77,
    weekNumber: 11,
    title: "End of week eleven",
    description: "Reflect — what version of you is closer than you thought?",
    primaryHref: "/curriculum/journal",
    primaryLabel: "Reflect",
    estimatedMin: 5,
    isReflection: true,
  },

  // ───── WEEK 12: Energy + SubScript refresh (78-84) ─────
  ...Array.from({ length: 5 }, (_, i) => ({
    day: 78 + i,
    weekNumber: 12,
    title: "Evening Check-In",
    description: "Mood. One thing you're proud of. One intention for tomorrow.",
    primaryHref: "/curriculum/module/04-bold-action/evening-check-in",
    primaryLabel: "Close the day",
    estimatedMin: 5,
  })),
  {
    day: 83,
    weekNumber: 12,
    title: "Refresh your SubScript",
    description:
      "It's been 8 weeks of reading. Update what's grown. Version 2 begins today.",
    primaryHref: "/curriculum/module/02-joyful-operating-system/subscript",
    primaryLabel: "Update",
    estimatedMin: 20,
  },
  {
    day: 84,
    weekNumber: 12,
    title: "End of week twelve",
    description: "One week to go. Re-read your Self-Eulogy.",
    primaryHref: "/curriculum/module/02-joyful-operating-system/self-eulogy",
    primaryLabel: "Read",
    estimatedMin: 10,
    isReflection: true,
  },

  // ───── WEEK 13: Commencement (85-90) ─────
  {
    day: 85,
    weekNumber: 13,
    title: "Final JQ",
    description:
      "The third and final milestone JQ. This is the data point that proves the work.",
    primaryHref: "/assessment",
    primaryLabel: "Retake the JQ",
    estimatedMin: 10,
    isMilestone: true,
  },
  {
    day: 86,
    weekNumber: 13,
    title: "Final Pillar snapshot",
    description:
      "Take the Pillar inventory one more time. Compare to Day 18.",
    primaryHref:
      "/curriculum/module/02-joyful-operating-system/priority-pillars",
    primaryLabel: "Take snapshot",
    estimatedMin: 10,
  },
  {
    day: 87,
    weekNumber: 13,
    title: "Read your Self-Eulogy",
    description:
      "Read it out loud. Notice what you're closer to than you were on Day 23.",
    primaryHref: "/curriculum/module/02-joyful-operating-system/self-eulogy",
    primaryLabel: "Read",
    estimatedMin: 10,
  },
  {
    day: 88,
    weekNumber: 13,
    title: "Write a letter to year-one you",
    description:
      "Seal a letter to yourself, delivered in one year. Tell them what you want them to hear.",
    primaryHref: "/me/letters",
    primaryLabel: "Write the letter",
    estimatedMin: 20,
  },
  {
    day: 89,
    weekNumber: 13,
    title: "See all your wins",
    description:
      "Open Show Me My Wins. Every piece of proof you are not where you were.",
    primaryHref: "/me/wins",
    primaryLabel: "See your wins",
    estimatedMin: 10,
  },
  {
    day: 90,
    weekNumber: 13,
    title: "Day 90 — Commencement",
    description:
      "You did it. The foundation is laid. Today is the start of the rest.",
    primaryHref: "/me/wins",
    primaryLabel: "Commencement",
    estimatedMin: 15,
    isMilestone: true,
  },
];

export const DAYS_BY_NUMBER = new Map(DAYS.map((d) => [d.day, d]));

export function getDayTask(day: number): DayTask | null {
  return DAYS_BY_NUMBER.get(day) ?? null;
}
