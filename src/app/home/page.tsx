import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { getDailySession } from "@/lib/daily-session";
import DailySession from "@/components/home/DailySession";

export const metadata: Metadata = {
  title: "Today",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

/**
 * Today — the Daily Session anchor.
 *
 * Per the Flow Overhaul Directive §12, this is the master decision tree
 * for app-open. The app already knows what the user should see; this
 * page resolves to one of:
 *
 *   • Onboarding (if curriculum_started_at is unset)
 *   • The card-based Daily Session (default)
 *
 * The Daily Session itself runs further server-side logic to choose
 * which cards to render (letter override, morning vs evening, pulse
 * status, day task, etc).
 */
export default async function HomePage() {
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
