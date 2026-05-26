/**
 * The Book — Brent's 4 Parts × 20 Chapters (Master Prompt §7).
 *
 * This is the canonical content shape per the master spec. Each chapter
 * has Learn / Practice / Integrate. Where existing curriculum routes
 * already cover the chapter, the `href` deep-links to them; otherwise
 * the entry surfaces as "coming soon" without breaking the layout.
 */

export type Part = {
  number: 1 | 2 | 3 | 4;
  number_label: string; // "01"
  title: string;
  italicWord: string;
  tagline: string;
  chapters: Chapter[];
};

export type Chapter = {
  number: number; // 1-20
  title: string;
  /** When a chapter ships a route, this points at it. */
  href?: string;
  practice?: string;
  meditation?: string;
};

export const BOOK: Part[] = [
  {
    number: 1,
    number_label: "01",
    title: "Invest in Joy",
    italicWord: "Joy",
    tagline: "Joy is your birthright",
    chapters: [
      { number: 1, title: "Joy is Your Birthright" },
      { number: 2, title: "The Biology of Becoming" },
      {
        number: 3,
        title: "The Alchemy of Joy",
        practice: "JQ Assessment",
        meditation: "Ready for Change",
        href: "/assessment",
      },
      {
        number: 4,
        title: "Becoming the Alchemist",
        practice: "Emotional Alchemy",
        meditation: "Emotional Alchemy",
      },
      { number: 5, title: "The Great Awakening" },
      { number: 6, title: "The Framework" },
      {
        number: 7,
        title: "Invest in Joy Philosophy",
        meditation: "Invest in Joy",
      },
      {
        number: 8,
        title: "Joy Judo",
        practice: "One Minute Window + Joy Judo Worksheet",
      },
    ],
  },
  {
    number: 2,
    number_label: "02",
    title: "Train Your Brain",
    italicWord: "Brain",
    tagline: "Install the operating system",
    chapters: [
      {
        number: 9,
        title: "Stories",
        practice: "Rewriting Core Narrative",
        meditation: "Rewriting Your Core Narrative",
        href: "/curriculum/module/02-joyful-operating-system/core-narrative",
      },
      {
        number: 10,
        title: "The Self Eulogy",
        practice: "Self Eulogy",
        meditation: "Remembering Your Future",
        href: "/curriculum/module/02-joyful-operating-system/self-eulogy",
      },
      {
        number: 11,
        title: "List of Joy",
        practice: "Build List of Joy",
        meditation: "Joy Spark",
        href: "/curriculum/module/02-joyful-operating-system/list-of-joy",
      },
      {
        number: 12,
        title: "Priority Pillars",
        practice: "Priority Pillars Inventory",
        href: "/curriculum/module/02-joyful-operating-system/priority-pillars",
      },
      {
        number: 13,
        title: "Subconscious Priming",
        practice: "SubScript + 60-Second Shift",
        meditation: "Manifester",
        href: "/curriculum/module/02-joyful-operating-system/subscript",
      },
    ],
  },
  {
    number: 3,
    number_label: "03",
    title: "Forgiveness",
    italicWord: "Forgiveness",
    tagline: "The bridge work",
    chapters: [
      {
        number: 14,
        title: "Forgiveness",
        practice: "Forgiveness Process",
        meditation: "Freedom",
        href: "/curriculum/module/03-forgiveness",
      },
    ],
  },
  {
    number: 4,
    number_label: "04",
    title: "Bold Action",
    italicWord: "Action",
    tagline: "Build your environment",
    chapters: [
      {
        number: 15,
        title: "Dopamine Detox",
        practice: "Dopamine Detox Challenge",
        href: "/curriculum/module/04-bold-action",
      },
      {
        number: 16,
        title: "Habits",
        practice: "Harmful Habit Spotlight",
        href: "/curriculum/module/04-bold-action",
      },
      {
        number: 17,
        title: "Habit Renaissance",
        practice: "Joyful Habit Framework",
        meditation: "Morning Orbit + Evening Wind Down",
        href: "/curriculum/module/04-bold-action",
      },
      { number: 18, title: "Therapy" },
      {
        number: 19,
        title: "Time Freedom",
        practice: "Zero Gravity Audit",
        href: "/curriculum/module/04-bold-action",
      },
      {
        number: 20,
        title: "Final Chapter",
        meditation: "The Alchemist",
      },
    ],
  },
];

export function findPart(number: number): Part | undefined {
  return BOOK.find((p) => p.number === number);
}
