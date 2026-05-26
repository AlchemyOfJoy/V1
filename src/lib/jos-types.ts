/**
 * JOS constants and types — safe to import in client components
 * (no DB / pg dependency).
 */

export type JosComponentId =
  | "jq_baseline"
  | "core_narrative"
  | "self_eulogy"
  | "list_of_joy"
  | "priority_pillars"
  | "subscript";

export interface JosComponent {
  id: JosComponentId;
  number: 1 | 2 | 3 | 4 | 5 | 6;
  eyebrow: string;
  name: string;
  description: string;
  estimatedMin: number;
  primaryHref: string;
  installDayOffset: number;
}

export const JOS_COMPONENTS: JosComponent[] = [
  {
    id: "jq_baseline",
    number: 1,
    eyebrow: "Your baseline",
    name: "Joy Quotient",
    description: "Where you are today, measurably.",
    estimatedMin: 12,
    primaryHref: "/assessment",
    installDayOffset: 0,
  },
  {
    id: "core_narrative",
    number: 2,
    eyebrow: "Your story",
    name: "Core Narrative",
    description: "The script you've been running on autopilot.",
    estimatedMin: 35,
    primaryHref: "/curriculum/module/02-joyful-operating-system/core-narrative",
    installDayOffset: 1,
  },
  {
    id: "self_eulogy",
    number: 3,
    eyebrow: "Your destination",
    name: "Self-Eulogy",
    description: "How you want to be remembered.",
    estimatedMin: 70,
    primaryHref: "/curriculum/module/02-joyful-operating-system/self-eulogy",
    installDayOffset: 3,
  },
  {
    id: "list_of_joy",
    number: 4,
    eyebrow: "Your compass",
    name: "List of Joy",
    description: "What actually lights you up.",
    estimatedMin: 45,
    primaryHref: "/curriculum/module/02-joyful-operating-system/list-of-joy",
    installDayOffset: 5,
  },
  {
    id: "priority_pillars",
    number: 5,
    eyebrow: "Your audit",
    name: "Priority Pillars",
    description: "Where your energy is flowing and draining.",
    estimatedMin: 20,
    primaryHref:
      "/curriculum/module/02-joyful-operating-system/priority-pillars",
    installDayOffset: 6,
  },
  {
    id: "subscript",
    number: 6,
    eyebrow: "Your daily program",
    name: "SubScript",
    description: "The document that primes you daily.",
    estimatedMin: 40,
    primaryHref: "/curriculum/module/02-joyful-operating-system/subscript",
    installDayOffset: 7,
  },
];

export const JOS_INTEGRATION_DAY_OFFSETS = new Set<number>([2, 4]);

export const JOS_TOTAL_DAYS = 7;
