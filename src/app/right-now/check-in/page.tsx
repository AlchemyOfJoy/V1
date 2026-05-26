import type { Metadata } from "next";
import CheckInClient from "./CheckInClient";

export const metadata: Metadata = {
  title: "How are you now?",
  robots: { index: false },
};

/**
 * Post-intervention check-in (UI/UX Overhaul §5.2).
 *
 * The user just completed a Right Now tool (Reset Breath, Reframe
 * Ritual, etc.). Three buttons: Better / Same / Worse. Worse routes
 * directly to crisis resources — never methodology platitudes during
 * a hard moment.
 */
export default function CheckInPage() {
  return <CheckInClient />;
}
