import { cache } from "react";
import { query } from "./db";
import {
  JOS_COMPONENTS,
  JOS_INTEGRATION_DAY_OFFSETS,
  type JosComponent,
  type JosComponentId,
} from "./jos-types";

// Re-export the client-safe constants so existing server callers
// importing from "./jos" keep working.
export {
  JOS_COMPONENTS,
  JOS_INTEGRATION_DAY_OFFSETS,
  JOS_TOTAL_DAYS,
} from "./jos-types";
export type { JosComponent, JosComponentId } from "./jos-types";

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

export const getJosState = cache(async function getJosState(
  userId: string,
): Promise<JosState> {
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
});

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
