"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { btnPrimary } from "@/lib/ui";

export default function StartChallenge() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/curriculum/challenge", { method: "POST" });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setError("Couldn't start the challenge. Try again?");
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <button onClick={start} className={btnPrimary} disabled={busy}>
        {busy ? "Starting…" : "Begin Day 1"}
      </button>
      {error && (
        <p className="font-sans text-[13px] text-[#8a6d00]">{error}</p>
      )}
    </div>
  );
}
