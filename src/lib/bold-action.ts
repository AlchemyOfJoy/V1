/**
 * The ten Bold Action tools — Module 4 of the Alchemy of Joy™ curriculum.
 * Each tool is a short, interactive practice that lives at its own URL
 * (`/curriculum/module/04-bold-action/[slug]`). Sessions are logged to
 * `journal_entries` with `worksheet_id = JOURNAL_PREFIX + slug` so the
 * user can see a history per tool.
 */

export const JOURNAL_PREFIX = "04_";

export type BoldActionKind =
  | "breath"
  | "timer"
  | "calculator"
  | "gratitude"
  | "reframe"
  | "ask"
  | "identity"
  | "energy"
  | "tiny_brave"
  | "evening";

export interface BoldActionTool {
  slug: string;
  kind: BoldActionKind;
  title: string;
  italicWord: string;
  oneLiner: string;
  /** Roughly how long the practice takes, in seconds. */
  durationSec: number;
  /** Workbook page reference (placeholder until manuscript arrives). */
  workbookPage?: string;
}

export const BOLD_ACTION_TOOLS: BoldActionTool[] = [
  {
    slug: "joy-spark",
    kind: "breath",
    title: "Joy Spark",
    italicWord: "Spark",
    oneLiner:
      "Three deep breaths and a flash of joy memory — your fastest reset.",
    durationSec: 90,
    workbookPage: "p. 48",
  },
  {
    slug: "60-second-reset",
    kind: "timer",
    title: "60-Second Reset",
    italicWord: "Reset",
    oneLiner: "Box-breath your way out of a spiral. One minute, that's it.",
    durationSec: 60,
    workbookPage: "p. 49",
  },
  {
    slug: "hourly-audit",
    kind: "calculator",
    title: "Hourly Audit",
    italicWord: "Audit",
    oneLiner:
      "See how many of your waking hours this week actually moved you toward joy.",
    durationSec: 180,
    workbookPage: "p. 50",
  },
  {
    slug: "gratitude-three",
    kind: "gratitude",
    title: "Gratitude Three",
    italicWord: "Three",
    oneLiner: "Three specific gratitudes. Specific is the whole game.",
    durationSec: 120,
    workbookPage: "p. 51",
  },
  {
    slug: "reframe-now",
    kind: "reframe",
    title: "Reframe Now",
    italicWord: "Now",
    oneLiner:
      "Catch the story you're telling yourself and flip it on the spot.",
    durationSec: 180,
    workbookPage: "p. 52",
  },
  {
    slug: "bold-ask",
    kind: "ask",
    title: "Bold Ask",
    italicWord: "Ask",
    oneLiner:
      "Write the ask you've been avoiding. Then send it. (We won't send it for you — but you will.)",
    durationSec: 300,
    workbookPage: "p. 54",
  },
  {
    slug: "identity-declaration",
    kind: "identity",
    title: "Identity Declaration",
    italicWord: "Declaration",
    oneLiner: "Speak who you're becoming as if it's already so.",
    durationSec: 120,
    workbookPage: "p. 55",
  },
  {
    slug: "energy-inventory",
    kind: "energy",
    title: "Energy Inventory",
    italicWord: "Inventory",
    oneLiner: "What gave you energy today? What drained it? Patterns emerge.",
    durationSec: 240,
    workbookPage: "p. 57",
  },
  {
    slug: "tiny-brave-act",
    kind: "tiny_brave",
    title: "Tiny Brave Act",
    italicWord: "Brave",
    oneLiner:
      "Name one tiny brave thing you'll do today. Bravery compounds.",
    durationSec: 90,
    workbookPage: "p. 58",
  },
  {
    slug: "evening-check-in",
    kind: "evening",
    title: "Evening Check-In",
    italicWord: "Evening",
    oneLiner:
      "Three questions to close the day with honesty and a little grace.",
    durationSec: 180,
    workbookPage: "p. 60",
  },
];

export const BOLD_ACTION_SLUGS = new Set(BOLD_ACTION_TOOLS.map((t) => t.slug));

export function findBoldActionTool(slug: string): BoldActionTool | undefined {
  return BOLD_ACTION_TOOLS.find((t) => t.slug === slug);
}

export function journalIdForTool(slug: string): string {
  return `${JOURNAL_PREFIX}${slug.replace(/-/g, "_")}`;
}
