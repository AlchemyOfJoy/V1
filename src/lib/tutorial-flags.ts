import { query } from "./db";

/**
 * First-encounter teaching system — server side.
 *
 * Each one-liner contextual coach card has a unique flag. Once dismissed
 * (or once the user has done the action it teaches), the flag is set and
 * the card never reappears. Stored in users.tutorial_flags JSONB.
 */
export type TutorialFlag =
  | "first_tool_tap"
  | "first_sacred_entry"
  | "first_celebration"
  | "first_letter"
  | "first_subscript_read"
  | "first_list_of_joy_entry"
  | "first_journey_section";

export async function getTutorialFlags(
  userId: string,
): Promise<Record<string, boolean>> {
  const rows = await query<{ tutorial_flags: Record<string, boolean> | null }>(
    `SELECT tutorial_flags FROM users WHERE id = $1`,
    [userId],
  );
  return rows[0]?.tutorial_flags ?? {};
}

export async function setTutorialFlag(
  userId: string,
  flag: TutorialFlag,
): Promise<void> {
  await query(
    `UPDATE users
       SET tutorial_flags = tutorial_flags || jsonb_build_object($2::text, true)
       WHERE id = $1`,
    [userId, flag],
  );
}
