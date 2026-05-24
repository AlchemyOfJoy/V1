import { quoteForContext, type QuoteSection } from "./quotes";
import { listContent } from "@/lib/coach/content";

/**
 * Daily Joy Drop — one quote surfaced on Home each morning.
 *
 * Primary pool: Brent's 100 curated manuscript quotes (lib/quotes.ts).
 * Plus: anything in the Content Studio tagged kind: "principle".
 * Rotation is deterministic by date so everyone sees the same drop today.
 *
 * If `section` is provided (the user's current Journey section), the
 * drop biases to quotes from that ITT pillar.
 */

export interface JoyDrop {
  body: string;
  attribution: string;
  source: string | null;
}

export async function todayDrop(section?: QuoteSection): Promise<JoyDrop> {
  const quote = quoteForContext(new Date(), section);
  return {
    body: quote.body,
    attribution: "BJF",
    source: "The Alchemy of Joy",
  };
}

/** Pull a *different* quote each load — for crisis/reset moments. */
export function randomDrop(section?: QuoteSection): JoyDrop {
  const now = new Date();
  // Use seconds for variation within a session
  const d = new Date(now.getTime() + Math.floor(Math.random() * 10_000_000));
  const quote = quoteForContext(d, section);
  return {
    body: quote.body,
    attribution: "BJF",
    source: "The Alchemy of Joy",
  };
}

/** Admin / Studio additions — surfaced in the Library, not the daily drop. */
export async function adminAddedDrops(): Promise<JoyDrop[]> {
  try {
    const principles = await listContent({ kind: "principle" });
    return principles
      .filter((p) => p.body.trim().length > 0 && p.body.length <= 600)
      .map((p) => ({
        body: p.body.trim(),
        attribution: "BJF",
        source: p.source ?? p.title,
      }));
  } catch {
    return [];
  }
}
