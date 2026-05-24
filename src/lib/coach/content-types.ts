/**
 * Pure types + constants for coach content. Safe to import from client
 * components — no Node-only dependencies (the DB code lives in
 * `./content.ts` which pulls in `pg`).
 */

export type ContentKind =
  | "voice"
  | "principle"
  | "chapter"
  | "transcript"
  | "qa"
  | "framework_note";

export const CONTENT_KINDS: {
  id: ContentKind;
  label: string;
  helper: string;
}[] = [
  {
    id: "voice",
    label: "Voice sample",
    helper:
      "A short passage (100–500 words) that exemplifies how you write or speak. Pull from anywhere. The more of these, the better the model matches your cadence.",
  },
  {
    id: "principle",
    label: "Core principle / teaching",
    helper:
      "One of your core teachings in your own words. The Companion will quote these as belief.",
  },
  {
    id: "qa",
    label: "Q&A pair",
    helper:
      "A real question + how you'd actually respond. Format the body as 'Q: …\\nA: …'. These are the strongest possible training signal for matching your voice in coaching.",
  },
  {
    id: "chapter",
    label: "Book chapter / section",
    helper:
      "A full section of your manuscript. Paste the whole thing — caching handles the cost.",
  },
  {
    id: "transcript",
    label: "Retreat / podcast transcript",
    helper:
      "A transcript of a retreat session, podcast, or interview. The model will absorb voice + content.",
  },
  {
    id: "framework_note",
    label: "Framework note",
    helper:
      "Your own additions to a therapeutic lens (e.g., 'How I use IFS differently'). Layered on top of the built-in framework library.",
  },
];

export interface ContentItem {
  id: string;
  kind: ContentKind;
  title: string;
  body: string;
  source: string | null;
  tags: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string | Date;
  updated_at: string | Date;
}

export function approxTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
