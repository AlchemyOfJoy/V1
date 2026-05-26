import type { Metadata } from "next";
import CoachChatClient from "./CoachChatClient";

export const metadata: Metadata = {
  title: "BrentBot",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

/**
 * BrentBot — the persistent coach (Synthesis Spec §4).
 *
 * One tap from anywhere — the home pill, the 💬 icon on every
 * secondary screen, or this URL directly. Trained on Brent's full
 * body of work; replies in his voice; routes to crisis resources
 * when needed.
 */
export default function CoachPage() {
  return <CoachChatClient />;
}
