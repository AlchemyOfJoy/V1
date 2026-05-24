/**
 * Pure types + constants for the course platform. Safe to import from
 * client components — no Node-only deps (DB code lives in courses.ts).
 */

export type LessonType =
  | "text"
  | "video"
  | "audio"
  | "exercise"
  | "reflection"
  | "workshop"
  | "coach_card"
  | "cross_link";

export const LESSON_TYPES: { id: LessonType; label: string; helper: string }[] = [
  {
    id: "text",
    label: "Text",
    helper: "Long-form written content (manuscript chapter, article).",
  },
  {
    id: "video",
    label: "Video",
    helper:
      "Paste an embed URL (Cloudflare Stream / YouTube / Vimeo). Upload pipeline ships separately.",
  },
  {
    id: "audio",
    label: "Audio",
    helper: "Paste an audio embed or hosted MP3 URL.",
  },
  {
    id: "reflection",
    label: "Reflection",
    helper: "One or more text prompts the student writes to.",
  },
  {
    id: "coach_card",
    label: "Coach Card",
    helper: "Short Brent-voice card. Mode: steady / reverent / playful.",
  },
  {
    id: "cross_link",
    label: "Cross-link",
    helper: "Deep link to a Tool Kit tool or Journey section.",
  },
  {
    id: "exercise",
    label: "Exercise",
    helper: "Step-by-step structured flow. Uses exercise_config JSON.",
  },
  {
    id: "workshop",
    label: "Workshop",
    helper: "Scheduled live session (Daily.co integration ships in Phase 5b).",
  },
];

export type CourseStatus = "draft" | "published" | "archived";
export type CourseType = "standard" | "certification";
export type PricingModel =
  | "free"
  | "tier_included"
  | "paid_one_time"
  | "paid_subscription";
export type DripMode = "open" | "time" | "completion" | "hybrid";
