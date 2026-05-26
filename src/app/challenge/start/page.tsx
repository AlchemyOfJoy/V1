import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getChallengeStatus, setChallengeMode } from "@/lib/challenge";

export const metadata: Metadata = {
  title: "Start the 90-Day Challenge",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

/**
 * /challenge/start — the Path A entry from the new homescreen.
 *
 * If the user is already in Challenge Mode, route them straight to
 * the dashboard. Otherwise flip their mode to 'challenge' (which
 * stamps challenge_started_at) and then route them in. The dashboard
 * resolves the rest via the Daily Session.
 */
export default async function ChallengeStartPage() {
  const user = (await getCurrentUser())!;
  const status = await getChallengeStatus(user.id);
  if (status.mode !== "challenge") {
    await setChallengeMode(user.id, "challenge");
  }
  redirect("/dashboard");
}
