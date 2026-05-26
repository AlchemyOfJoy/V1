import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getChallengeStatus } from "@/lib/challenge";
import Day90Ceremony from "./Day90Ceremony";

export const metadata: Metadata = {
  title: "Day 90 — The Look-Back",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

/**
 * The Day 90 ceremony (Challenge Content Directive §4 — DAY 90).
 *
 * Multi-stage choreography: navy fade, gold point of light, Triple
 * Sparkle resolves, Garamond white "Ninety days.", Brent-voice line,
 * scrollable artifact pointing at JQ + Wins. Plays once per user.
 *
 * Reachable from:
 *   • Auto-route after marking Day 90 complete
 *   • /me/wins or /me deep-link if user wants to replay
 */
export default async function Day90Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const status = await getChallengeStatus(user.id);
  // Allow viewing only if the user has actually crossed Day 90
  // (challenge_completed_at set) — otherwise route them home.
  if (!status.completed_at) {
    redirect("/home");
  }
  return <Day90Ceremony />;
}
