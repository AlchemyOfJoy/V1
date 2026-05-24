import { listContent } from "@/lib/coach/content";

/**
 * Daily Joy Drop — one inspiring beat surfaced on Home each morning.
 *
 * Strategy: pull from the Content Studio first (so anything Brent adds
 * as a "principle" or "voice" piece becomes a Joy Drop candidate
 * automatically — no separate quote management). Fall back to a small
 * curated seed set so Day 1 isn't empty.
 *
 * Rotation: deterministic by date so everyone sees the same drop on the
 * same day, but the index rotates daily through the full pool.
 */

export interface JoyDrop {
  body: string;
  attribution: string;
  source: string | null;
}

const SEED_DROPS: JoyDrop[] = [
  {
    body: "It starts with one simple choice — to train your brain toward your dreams and take action.",
    attribution: "BJF",
    source: "The Alchemy of Joy",
  },
  {
    body: "Joy is not something you need to create. It's something already inside of you — waiting to be remembered.",
    attribution: "BJF",
    source: null,
  },
  {
    body: "Action is the bridge between inner work and outer transformation.",
    attribution: "BJF",
    source: null,
  },
  {
    body: "What happened, happened FOR you — not to you. Even when it doesn't feel that way yet.",
    attribution: "BJF",
    source: null,
  },
  {
    body: "Your soul already knows. The work is to clear enough noise to hear it.",
    attribution: "BJF",
    source: null,
  },
  {
    body: "Make one day, today. That's the whole methodology in five words.",
    attribution: "BJF",
    source: null,
  },
  {
    body: "Every. Single. Day. The compounding is not in the dramatic — it's in the daily.",
    attribution: "BJF",
    source: null,
  },
  {
    body: "Forgiveness is not about them. It's about refusing to carry the weight one more mile.",
    attribution: "BJF",
    source: null,
  },
  {
    body: "The eulogy you want spoken is the map. Reverse-engineer the life that earns it.",
    attribution: "BJF",
    source: null,
  },
  {
    body: "Joy is a skill, not a temperament. Anyone can build it. The proof is in the practice.",
    attribution: "BJF",
    source: null,
  },
];

function dayIndex(): number {
  const d = new Date();
  return d.getFullYear() * 1000 + d.getMonth() * 50 + d.getDate();
}

export async function todayDrop(): Promise<JoyDrop> {
  // Pool from Content Studio: prefer "principle" pieces, then "voice".
  const pool: JoyDrop[] = [];
  try {
    const [principles, voices] = await Promise.all([
      listContent({ kind: "principle" }),
      listContent({ kind: "voice" }),
    ]);
    for (const p of [...principles, ...voices]) {
      const body = p.body.trim();
      if (body.length === 0 || body.length > 600) continue;
      pool.push({
        body,
        attribution: "BJF",
        source: p.source ?? p.title,
      });
    }
  } catch {
    // DB unavailable in build step — fall through to seed.
  }
  const all = pool.length > 0 ? pool : SEED_DROPS;
  return all[dayIndex() % all.length];
}
