/** Rotating pull-quotes from the workbook (spec §10).
 *  Used on the curriculum dashboard and as module dividers. */

export interface PullQuote {
  quote: string;
  attribution: string;
}

export const PULL_QUOTES: PullQuote[] = [
  {
    quote: "Joy is the absolute value of the present moment.",
    attribution: "Brent J. Freeman",
  },
  {
    quote:
      "When we find joy in the small, ordinary moments of life, we discover that happiness isn't something we chase — it's something we create from within, one breath, one smile, one moment of gratitude at a time.",
    attribution: "Desmond Tutu",
  },
  {
    quote:
      "The only thing that's holding you back is the story you tell yourself.",
    attribution: "Brent J. Freeman",
  },
  {
    quote:
      "When you do things from your soul, you feel a river moving in you, a joy. This joy is not fleeting; it's not borrowed from external things. It's the essence of your spirit, your connection to the divine, and it flows unbroken when you live in harmony with your truth.",
    attribution: "Rumi",
  },
  {
    quote:
      "To forgive is to set a prisoner free and discover that the prisoner was you.",
    attribution: "Lewis B. Smedes",
  },
  {
    quote:
      "To forgive is to liberate yourself from the prison of anger, giving yourself the freedom to live fully and love deeply.",
    attribution: "Brent J. Freeman",
  },
];

/** Pick a quote based on the day of the year — stable per-day rotation. */
export function quoteOfTheDay(date = new Date()): PullQuote {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const day = Math.floor((date.getTime() - start) / 86400000);
  return PULL_QUOTES[day % PULL_QUOTES.length];
}

/** Scripture-style closes for the affirming completion micro-moment. */
export const COMPLETION_LINES: string[] = [
  "Because you just did.",
  "Your soul already knows.",
  "This was never a question of if. Only of when.",
  "And so the rewiring begins.",
];
