/**
 * Source of truth for the Alchemy of Joy™ Curriculum information
 * architecture. The dashboard map, module pages, and stubs all read
 * from these constants — change once, everywhere updates.
 */

export type SectionStatus = "available" | "coming-soon";

export interface Section {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  status: SectionStatus;
  /** Workbook page reference for the "where to read more" help card. */
  workbookPage?: string;
}

export interface Module {
  id: string;
  slug: string;
  number: 1 | 2 | 3 | 4;
  title: string;
  italicWord: string; // the cyan-italic accent word for the heading
  subtitle: string;
  status: SectionStatus;
  sections: Section[];
  workbookPage?: string;
}

export const MODULES: Module[] = [
  {
    id: "01_science",
    slug: "01-science-of-joy",
    number: 1,
    title: "The Science of Joy",
    italicWord: "Joy",
    subtitle:
      "How your brain creates joy — and why measurable, repeatable practice rewires it for life.",
    status: "available",
    workbookPage: "p. 6–8",
    sections: [],
  },
  {
    id: "02_jos",
    slug: "02-joyful-operating-system",
    number: 2,
    title: "Joyful Operating System®",
    italicWord: "System",
    subtitle:
      "Rewrite the stories running you. Anchor a new identity. Make joy the default.",
    status: "available",
    workbookPage: "p. 11–36",
    sections: [
      {
        id: "core_narrative",
        slug: "core-narrative",
        title: "Core Narrative",
        subtitle:
          "Catch the old story. Flip the script. Anchor the new truth.",
        status: "available",
        workbookPage: "p. 12–13",
      },
      {
        id: "self_eulogy",
        slug: "self-eulogy",
        title: "Self Eulogy",
        subtitle:
          "Write the eulogy you want spoken about you. Reverse-engineer the life that earns it.",
        status: "available",
        workbookPage: "p. 20",
      },
      {
        id: "list_of_joy",
        slug: "list-of-joy",
        title: "The List of Joy™",
        subtitle:
          "A living list of what brings you joy — the raw material for everything that follows.",
        status: "available",
        workbookPage: "p. 26",
      },
      {
        id: "priority_pillars",
        slug: "priority-pillars",
        title: "Priority Pillars",
        subtitle:
          "Take inventory of the 12 sub-pillars holding up your life. Notice what's depleted.",
        status: "available",
        workbookPage: "p. 29",
      },
      {
        id: "subscript",
        slug: "subscript",
        title: "Subconscious Script",
        subtitle:
          "Build the SubScript that primes your mind for who you're becoming.",
        status: "available",
        workbookPage: "p. 31–36",
      },
    ],
  },
  {
    id: "03_forgiveness",
    slug: "03-forgiveness",
    number: 3,
    title: "Forgiveness Framework",
    italicWord: "Forgiveness",
    subtitle:
      "Release the weight you've been carrying — privately, fully, and on your own terms.",
    status: "available",
    workbookPage: "p. 39–46",
    sections: [],
  },
  {
    id: "04_bold_action",
    slug: "04-bold-action",
    number: 4,
    title: "Take Bold Action",
    italicWord: "Action",
    subtitle:
      "Ten tools to move from insight to identity. Inner work becomes outer life.",
    status: "available",
    workbookPage: "p. 48–60",
    sections: [],
  },
];

/** Top-level destinations beyond the four modules. */
export interface SecondaryDest {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  status: SectionStatus;
}

export const SECONDARY_DESTS: SecondaryDest[] = [
  {
    id: "toolkit",
    slug: "toolkit",
    title: "AOJ Toolkit",
    subtitle: "All 20 tools in one reference library.",
    status: "available",
  },
  {
    id: "challenge",
    slug: "90-day-challenge",
    title: "90-Day Challenge",
    subtitle: "Day-by-day practice with weekly focus areas.",
    status: "coming-soon",
  },
  {
    id: "journal",
    slug: "journal",
    title: "Journal",
    subtitle: "Every reflection, in one place.",
    status: "coming-soon",
  },
  {
    id: "export",
    slug: "export",
    title: "Export",
    subtitle: "Download your responses as a printable workbook PDF.",
    status: "coming-soon",
  },
];

/** Worksheet identifiers — used as the `worksheet_id` value in the DB. */
export const WORKSHEET_IDS = {
  scienceOfJoy: "01_science_of_joy",
  coreNarrative: "02_core_narrative",
  selfEulogy: "02_self_eulogy",
  listOfJoy: "02_list_of_joy",
  priorityPillars: "02_priority_pillars",
  subscript: "02_subscript",
} as const;

/** Per-worksheet response data shapes (Phase 1 — extend as worksheets ship). */
export interface ScienceOfJoyData {
  reflection?: string;
}

export interface CoreNarrativeData {
  old_narratives?: [string?, string?, string?];
  new_narratives?: [string?, string?, string?];
  reflection?: string;
}

export interface SelfEulogyData {
  eulogy?: string;
  prompts?: Record<string, string>;
}

export interface PriorityPillarsData {
  /** Stored as 0–10 per sub-pillar (12 keys total). */
  scores?: Partial<Record<PriorityPillarKey, number>>;
  reflection?: string;
  /** Set when the user takes a "snapshot" — frozen for the history view. */
  last_snapshot_at?: string;
}

export interface SubscriptData {
  target_date?: string; // YYYY-MM-DD
  manifestations?: string[]; // up to ~12 lines
  affirmations?: string[]; // up to ~12 lines
  emotion_anchor?: string;
  reflection?: string;
}

export type WorksheetData =
  | ScienceOfJoyData
  | CoreNarrativeData
  | SelfEulogyData
  | PriorityPillarsData
  | SubscriptData;

/** The 12 sub-pillars across 6 priority pillars (workbook p. 29). */
export const PRIORITY_PILLARS = [
  {
    id: "love",
    label: "Love",
    subs: [
      { id: "love_self", label: "Self" },
      { id: "love_romantic", label: "Romantic" },
    ],
  },
  {
    id: "faith",
    label: "Faith",
    subs: [
      { id: "faith_self", label: "In Self" },
      { id: "faith_universe", label: "In Universe / Higher Power" },
    ],
  },
  {
    id: "health",
    label: "Health",
    subs: [
      { id: "health_mind", label: "Mind" },
      { id: "health_body", label: "Body" },
    ],
  },
  {
    id: "family",
    label: "Family",
    subs: [
      { id: "family_blood", label: "Blood" },
      { id: "family_chosen", label: "Chosen" },
    ],
  },
  {
    id: "career",
    label: "Career",
    subs: [
      { id: "career_money", label: "Money" },
      { id: "career_giving_back", label: "Giving Back" },
    ],
  },
  {
    id: "community",
    label: "Community",
    subs: [
      { id: "community_personal", label: "Personal" },
      { id: "community_professional", label: "Professional" },
    ],
  },
] as const;

export type PriorityPillarKey =
  | "love_self"
  | "love_romantic"
  | "faith_self"
  | "faith_universe"
  | "health_mind"
  | "health_body"
  | "family_blood"
  | "family_chosen"
  | "career_money"
  | "career_giving_back"
  | "community_personal"
  | "community_professional";

export const PILLAR_KEYS: PriorityPillarKey[] = [
  "love_self",
  "love_romantic",
  "faith_self",
  "faith_universe",
  "health_mind",
  "health_body",
  "family_blood",
  "family_chosen",
  "career_money",
  "career_giving_back",
  "community_personal",
  "community_professional",
];

/** Look up a module by its URL slug. */
export function findModule(slug: string): Module | undefined {
  return MODULES.find((m) => m.slug === slug);
}

/** Look up a section under a module by section slug. */
export function findSection(
  module: Module,
  sectionSlug: string,
): Section | undefined {
  return module.sections.find((s) => s.slug === sectionSlug);
}
