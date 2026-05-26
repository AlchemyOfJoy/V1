import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { getDailySession } from "@/lib/daily-session";
import DailySession from "@/components/home/DailySession";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

/**
 * Dashboard — the Daily Session card arc.
 *
 * This is where "Jump Back In" from the new homescreen lands. Renders
 * the same mode-aware card flow that used to live at /home (per the
 * Cadence + JOS-First directives).
 */
export default async function DashboardPage() {
  const user = (await getCurrentUser())!;

  // Onboarding gate
  const onboardCheck = await query<{
    curriculum_started_at: string | Date | null;
  }>(`SELECT curriculum_started_at FROM users WHERE id = $1`, [user.id]);
  if (!onboardCheck[0]?.curriculum_started_at) {
    redirect("/curriculum/onboarding");
  }

  const session = await getDailySession({
    userId: user.id,
    email: user.email,
  });

  return <DailySession cards={session.cards} />;
}
