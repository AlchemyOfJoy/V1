/**
 * The 20 tools from the workbook Tool Kit (v7 spec §8.1). Each one has:
 *   - a name
 *   - a type (Action / Behavior / Body / Emotion / Environment / Mind / Reflection)
 *   - estimated time
 *   - "when to use it"
 *   - a slug
 *   - href — if a fully-built interactive version exists in this app
 *           (Module 4 Bold Action tools), it links there; otherwise it
 *           routes to the tool's reference card
 *
 * The 10 Bold Action tools I built earlier are the interactive
 * implementations of a subset of these; the remaining ten are reference
 * cards until interactive versions ship.
 */

export type ToolType =
  | "Action"
  | "Behavior"
  | "Body"
  | "Emotion"
  | "Environment"
  | "Mind"
  | "Reflection";

export interface ToolDef {
  id: number;
  slug: string;
  name: string;
  type: ToolType;
  time: string;
  when: string;
  href: string;
  /** True when the in-app interactive flow is shipped. */
  interactive: boolean;
}

export const TOOLS: ToolDef[] = [
  {
    id: 1,
    slug: "60-second-shift",
    name: "60-Second Shift",
    type: "Action",
    time: "1 min",
    when: "When inspiration strikes — act before fear catches up.",
    href: "/curriculum/module/04-bold-action/tiny-brave-act",
    interactive: true,
  },
  {
    id: 2,
    slug: "biological-prime-time",
    name: "Biological Prime Time / Down Time",
    type: "Behavior",
    time: "Setup once",
    when: "Align tasks with your natural energy windows.",
    href: "/toolkit/biological-prime-time",
    interactive: false,
  },
  {
    id: 3,
    slug: "dopamine-detox",
    name: "Dopamine Detox",
    type: "Environment",
    time: "30 days",
    when: "Reclaim your reward system.",
    href: "/journey/take-bold-action/dopamine-detox",
    interactive: false,
  },
  {
    id: 4,
    slug: "emotional-alchemy",
    name: "Emotional Alchemy Formula",
    type: "Emotion",
    time: "10 min",
    when: "Transform difficult emotions into clarity.",
    href: "/toolkit/emotional-alchemy",
    interactive: false,
  },
  {
    id: 5,
    slug: "evening-wind-down",
    name: "Evening Wind-Down",
    type: "Behavior",
    time: "30–60 min",
    when: "Nightly transition into rest.",
    href: "/curriculum/module/04-bold-action/evening-check-in",
    interactive: true,
  },
  {
    id: 6,
    slug: "forgiveness-framework",
    name: "Forgiveness Framework",
    type: "Emotion",
    time: "30–90 min / person",
    when: "Release past hurts.",
    href: "/curriculum/module/03-forgiveness",
    interactive: true,
  },
  {
    id: 7,
    slug: "habit-renaissance",
    name: "Habit Renaissance",
    type: "Behavior",
    time: "Ongoing",
    when: "Unwind draining habits, build joyful ones.",
    href: "/journey/take-bold-action/habit-renaissance",
    interactive: false,
  },
  {
    id: 8,
    slug: "itt-framework",
    name: "ITT Framework",
    type: "Mind",
    time: "Always-on",
    when: "The macro philosophy. Practiced daily.",
    href: "/journey",
    interactive: true,
  },
  {
    id: 9,
    slug: "jomo",
    name: "JOMO",
    type: "Mind",
    time: "Weekly",
    when: "Create space by saying NO with purpose.",
    href: "/journey/take-bold-action/jomo",
    interactive: false,
  },
  {
    id: 10,
    slug: "joy-judo",
    name: "Joy Judo",
    type: "Mind",
    time: "Situational",
    when: "Reframe challenges using their own energy.",
    href: "/toolkit/joy-judo",
    interactive: false,
  },
  {
    id: 11,
    slug: "joy-quotient",
    name: "Joy Quotient Assessment (JQ)",
    type: "Reflection",
    time: "10 min",
    when: "Monthly first year, quarterly after.",
    href: "/assessment",
    interactive: true,
  },
  {
    id: 12,
    slug: "joyful-habit-dad",
    name: "Joyful Habit Framework (D.A.D.)",
    type: "Behavior",
    time: "Setup once",
    when: "Anchor new habits.",
    href: "/toolkit/joyful-habit-dad",
    interactive: false,
  },
  {
    id: 13,
    slug: "law-of-expansion",
    name: "Law of Expansion",
    type: "Mind",
    time: "Informational + practice",
    when: "What you focus on expands.",
    href: "/toolkit/law-of-expansion",
    interactive: false,
  },
  {
    id: 14,
    slug: "zero-gravity",
    name: "Law of Zero Gravity",
    type: "Behavior",
    time: "One-time audit",
    when: "Delegate everything below your hourly rate.",
    href: "/journey/take-bold-action/zero-gravity",
    interactive: false,
  },
  {
    id: 15,
    slug: "morning-orbit",
    name: "Morning Orbit",
    type: "Behavior",
    time: "30–90 min",
    when: "Morning routine to set the day.",
    href: "/journey/take-bold-action/habit-renaissance",
    interactive: false,
  },
  {
    id: 16,
    slug: "one-minute-window",
    name: "One Minute Window",
    type: "Action",
    time: "1 min",
    when: "The window of opportunity to act.",
    href: "/curriculum/module/04-bold-action/tiny-brave-act",
    interactive: true,
  },
  {
    id: 17,
    slug: "overview-effect",
    name: "Overview Effect",
    type: "Mind",
    time: "One-time + revisit",
    when: "The Self-Eulogy perspective tool.",
    href: "/curriculum/module/02-joyful-operating-system/self-eulogy",
    interactive: true,
  },
  {
    id: 18,
    slug: "reframe-ritual",
    name: "Reframe Ritual™",
    type: "Emotion",
    time: "2 min",
    when: "Moment-of-stress reframing.",
    href: "/curriculum/module/04-bold-action/reframe-now",
    interactive: true,
  },
  {
    id: 19,
    slug: "reset-breath",
    name: "Reset Breath",
    type: "Body",
    time: "1–5 min",
    when: "Anytime. Persistent floating button.",
    href: "/curriculum/module/04-bold-action/60-second-reset",
    interactive: true,
  },
  {
    id: 20,
    slug: "spirit-walks",
    name: "Spirit Walks",
    type: "Body",
    time: "30+ min",
    when: "Walking meditation for clarity.",
    href: "/toolkit/spirit-walks",
    interactive: false,
  },
];

export function findTool(slug: string): ToolDef | undefined {
  return TOOLS.find((t) => t.slug === slug);
}
