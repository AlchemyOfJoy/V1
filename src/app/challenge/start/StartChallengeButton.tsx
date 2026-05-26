"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { btnPrimary } from "@/lib/ui";

/**
 * The commit button for the 90-Day Challenge walk-through.
 *
 * Flips challenge_mode to 'challenge' (which stamps challenge_started_at
 * the first time around) via /api/me/challenge-mode, then routes the
 * user into /dashboard where Daily Session resolves Day 1's content.
 */
export default function StartChallengeButton({
  restart = false,
}: {
  restart?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function commit() {
    if (busy) return;
    setBusy(true);
    try {
      await fetch("/api/me/challenge-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "challenge" }),
      });
      router.push("/dashboard");
      router.refresh();
    } catch {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={commit}
      disabled={busy}
      className={`${btnPrimary} w-full`}
    >
      {busy
        ? "Starting…"
        : restart
          ? "Start a fresh 90 days →"
          : "I’m in — Begin Day 1 →"}
    </button>
  );
}
