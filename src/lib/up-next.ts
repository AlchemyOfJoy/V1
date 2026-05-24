import { query } from "./db";
import { getDayTask } from "./challenge-days";

/**
 * The "Up Next" surface (Build Directive §8.1).
 *
 * Computes the single highest-priority next step for a user, by walking
 * a deterministic fallback chain so Home is never empty, never ambiguous.
 *
 * Priority order:
 *   1. A letter from past self that arrived today and is still unread
 *   2. The user's prescribed Day-N task on the 90-Day arc (if not done)
 *   3. The morning or evening SubScript ritual (window-aware)
 *   4. Continue an in-progress Journey section (foundations / module 1)
 *   5. Maintenance suggestion (post-arc users)
 *   6. Fallback — Spirit Walk / add to List of Joy
 */

export interface UpNext {
  kind:
    | "letter"
    | "day_task"
    | "subscript"
    | "journey_resume"
    | "maintenance"
    | "fallback";
  eyebrow: string;
  title: string;
  subtitle?: string;
  href: string;
  primaryLabel: string;
  estimatedMin?: number;
  isMilestone?: boolean;
}

export async function getUpNext(opts: {
  userId: string;
  currentDay: number | null;
  todayLogged: boolean;
  hasSubscript: boolean;
  isMorning: boolean;
  challengeCompleted: boolean;
}): Promise<UpNext> {
  const {
    userId,
    currentDay,
    todayLogged,
    hasSubscript,
    isMorning,
    challengeCompleted,
  } = opts;

  // 1. Letter from past self arrived today, unread
  const letterRows = await query<{ id: string; send_at: string | Date }>(
    `SELECT id::text AS id, send_at
       FROM letters_to_self
       WHERE user_id = $1
         AND send_at <= now()
         AND send_at >= now() - interval '24 hours'
         AND opened_at IS NULL
       ORDER BY send_at DESC
       LIMIT 1`,
    [userId],
  );
  if (letterRows[0]) {
    return {
      kind: "letter",
      eyebrow: "A letter arrived",
      title: "A letter from your past self",
      subtitle: "You wrote this. It's been waiting for today.",
      href: `/me/letters?open=${letterRows[0].id}`,
      primaryLabel: "Open it",
      estimatedMin: 3,
      isMilestone: true,
    };
  }

  // 2. Prescribed day task on the 90-Day arc
  if (currentDay !== null && currentDay >= 1 && currentDay <= 90 && !todayLogged) {
    const task = getDayTask(currentDay);
    if (task) {
      return {
        kind: "day_task",
        eyebrow: `Day ${currentDay} of 90`,
        title: task.title,
        subtitle: task.description,
        href: task.primaryHref,
        primaryLabel: task.primaryLabel,
        estimatedMin: task.estimatedMin,
        isMilestone: task.isMilestone,
      };
    }
  }

  // 3. SubScript daily ritual — only if user has built one
  if (hasSubscript) {
    return {
      kind: "subscript",
      eyebrow: isMorning ? "Morning ritual" : "Evening ritual",
      title: isMorning ? "Read your morning SubScript" : "Close the day",
      subtitle: isMorning
        ? "Set the frequency before the world does."
        : "Read it once more. Let the day settle.",
      href: "/curriculum/module/02-joyful-operating-system/subscript",
      primaryLabel: "Open SubScript",
      estimatedMin: 5,
    };
  }

  // 4. Resume Journey — anyone without a SubScript should build one next
  if (!hasSubscript && !challengeCompleted) {
    return {
      kind: "journey_resume",
      eyebrow: "Build your foundation",
      title: "Write your SubScript",
      subtitle: "The twice-daily reading is the spine of the install.",
      href: "/curriculum/module/02-joyful-operating-system/subscript",
      primaryLabel: "Begin",
      estimatedMin: 15,
    };
  }

  // 5. Maintenance — challenge complete
  if (challengeCompleted) {
    return {
      kind: "maintenance",
      eyebrow: "The practice continues",
      title: "Take a Spirit Walk today",
      subtitle: "Twenty minutes outside, no headphones. Notice three things.",
      href: "/curriculum/toolkit",
      primaryLabel: "Open the Tool Kit",
      estimatedMin: 20,
    };
  }

  // 6. Fallback — never empty, never ambiguous
  return {
    kind: "fallback",
    eyebrow: "Right now",
    title: "Add something to your List of Joy",
    subtitle: "One small thing that sparked you today.",
    href: "/me/my-joy",
    primaryLabel: "Add a joy",
    estimatedMin: 1,
  };
}
