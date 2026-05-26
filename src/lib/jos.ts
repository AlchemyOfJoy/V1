import { query } from "./db";

/**
 * The Joyful Operating System — six components installed before the
 * Challenge or Practice Mode can begin (JOS-First Architecture §1).
 *
 * The install is paced over 7-10 days: each component takes one
 * focused session, with explicit integration days in between for
 * nervous-system absorption. Users cannot skip the install — it's
 * the price of admission to the methodology (§16).
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
  /** App-day offset from signup (0 = Day 0 onboarding day). */
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

/** Integration days — no new component, just absorption. */
export const JOS_INTEGRATION_DAY_OFFSETS = new Set<number>([2, 4]);

export const JOS_TOTAL_DAYS = 7;

export interface JosState {
  install_started_at: string | null;
  install_completed_at: string | null;
  components_completed: JosComponentId[];
  /** Calendar-day offset from install start (0 = day signed up). */
  current_install_day: number;
  /** Component scheduled for today, if any. */
  todays_component: JosComponent | null;
  /** True when today is an integration day (read, sit with it). */
  is_integration_day: boolean;
  /** All six components completed — ready for path choice. */
  ready_for_path_choice: boolean;
}

export async function getJosState(userId: string): Promise<JosState> {
  const rows = await query<{
    jos_install_started_at: string | Date | null;
    jos_install_completed_at: string | Date | null;
    jos_components_completed: JosComponentId[] | null;
  }>(
    `SELECT jos_install_started_at, jos_install_completed_at,
            jos_components_completed
       FROM users WHERE id = $1`,
    [userId],
  );
  const row = rows[0];
  const startedAt = toIso(row?.jos_install_started_at ?? null);
  const completedAt = toIso(row?.jos_install_completed_at ?? null);
  const done = (row?.jos_components_completed ?? []) as JosComponentId[];

  let currentDay = 0;
  if (startedAt) {
    const ms = new Date(startedAt).setHours(0, 0, 0, 0);
    const today = new Date().setHours(0, 0, 0, 0);
    currentDay = Math.max(0, Math.floor((today - ms) / 86_400_000));
  }

  // The day's prescribed component is the one whose installDayOffset
  // matches today AND that hasn't yet been completed.
  const scheduled = JOS_COMPONENTS.find(
    (c) => c.installDayOffset === currentDay && !done.includes(c.id),
  );

  // If the schedule for today is already complete but earlier components
  // are still pending, surface the earliest pending one — the work waits.
  const fallback = scheduled
    ? null
    : JOS_COMPONENTS.find(
        (c) => c.installDayOffset <= currentDay && !done.includes(c.id),
      );

  const todaysComponent = scheduled ?? fallback ?? null;
  const isIntegrationDay =
    !todaysComponent && JOS_INTEGRATION_DAY_OFFSETS.has(currentDay);
  const readyForPathChoice =
    completedAt === null && done.length >= JOS_COMPONENTS.length;

  return {
    install_started_at: startedAt,
    install_completed_at: completedAt,
    components_completed: done,
    current_install_day: currentDay,
    todays_component: todaysComponent,
    is_integration_day: isIntegrationDay,
    ready_for_path_choice: readyForPathChoice,
  };
}

/** Stamp a component as installed. Idempotent — duplicates are absorbed. */
export async function markComponentInstalled(
  userId: string,
  id: JosComponentId,
): Promise<{ wasFinalComponent: boolean }> {
  const rows = await query<{
    jos_components_completed: JosComponentId[];
  }>(
    `UPDATE users
        SET jos_components_completed = CASE
              WHEN jos_components_completed @> to_jsonb($2::text)
                THEN jos_components_completed
              ELSE jos_components_completed || to_jsonb($2::text)
            END,
            jos_install_started_at = COALESCE(jos_install_started_at, now())
      WHERE id = $1
      RETURNING jos_components_completed`,
    [userId, id],
  );
  const done = (rows[0]?.jos_components_completed ?? []) as JosComponentId[];
  const isFinal = done.length >= JOS_COMPONENTS.length;
  if (isFinal) {
    // Stamp the completion time AND flip the mode to post_jos so the
    // next Today render surfaces the path-choice card. Don't flip if
    // the user is already past post_jos (e.g. picked a path).
    await query(
      `UPDATE users
          SET jos_install_completed_at = COALESCE(jos_install_completed_at, now()),
              challenge_mode = CASE
                WHEN challenge_mode = 'jos_install' THEN 'post_jos'
                ELSE challenge_mode
              END
        WHERE id = $1`,
      [userId],
    );
  }
  return { wasFinalComponent: isFinal };
}

/** Begin the JOS install — stamps the start time. */
export async function beginJosInstall(userId: string): Promise<void> {
  await query(
    `UPDATE users
        SET jos_install_started_at = COALESCE(jos_install_started_at, now())
      WHERE id = $1`,
    [userId],
  );
}

function toIso(value: string | Date | null): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  return value;
}
