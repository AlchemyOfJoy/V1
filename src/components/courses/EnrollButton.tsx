"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { btnPrimary } from "@/lib/ui";

export default function EnrollButton({
  slug,
  disabled,
}: {
  slug: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enroll() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/courses/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't enroll.");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={enroll}
        disabled={busy || disabled}
        className={btnPrimary}
      >
        {busy ? "…" : disabled ? "Coming soon" : "Enroll →"}
      </button>
      {error && (
        <p className="mt-2 font-sans text-[12px] text-[#8a6d00]">{error}</p>
      )}
    </div>
  );
}
