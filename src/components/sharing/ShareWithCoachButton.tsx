"use client";

import { useEffect, useState } from "react";
import type { ResourceKind } from "@/lib/sharing";

/**
 * The "Share with my coach" toggle — drops into any user surface where
 * an individual item could be shared (a journal entry, a worksheet, a
 * forgiveness process, a List of Joy item, etc.).
 *
 *   - If the user is paired with BrentBot (no human coach): the button
 *     is a quiet info pill. BrentBot already has full context.
 *   - If paired with a human coach: tap to grant; tap again to revoke.
 *
 * The button is small, calm, and clearly says what it does. The user
 * is in full control — this is the trust contract surfaced as a control.
 */
export default function ShareWithCoachButton({
  resourceType,
  resourceId,
  className = "",
}: {
  resourceType: ResourceKind;
  resourceId: string;
  className?: string;
}) {
  const [shared, setShared] = useState<boolean | null>(null);
  const [coachKind, setCoachKind] = useState<"brentbot" | "human" | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/sharing?resource_type=${resourceType}&resource_id=${encodeURIComponent(resourceId)}`,
        );
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setShared(data.shared);
        setCoachKind(data.coachKind);
      } catch {
        // silent
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [resourceType, resourceId]);

  if (coachKind === "brentbot") {
    return (
      <p
        className={`inline-flex items-center gap-1.5 font-sans text-[11px] font-medium text-navy/45 ${className}`}
      >
        <span aria-hidden className="text-gold">
          ✦
        </span>
        BrentBot already has context
      </p>
    );
  }

  if (coachKind === null || shared === null) {
    return null;
  }

  async function toggle() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/sharing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resource_type: resourceType,
          resource_id: resourceId,
          action: shared ? "revoke" : "share",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't update.");
      setShared(!shared);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] transition disabled:opacity-50 ${
          shared
            ? "bg-cyan-deep text-white hover:bg-[#006a8c]"
            : "border border-navy/15 bg-white text-navy/65 hover:border-cyan-deep hover:text-cyan-deep"
        }`}
        aria-pressed={shared}
      >
        <span aria-hidden>{shared ? "✓" : "+"}</span>
        {busy
          ? "…"
          : shared
            ? "Shared with coach"
            : "Share with coach"}
      </button>
      {error && (
        <span className="font-sans text-[11px] text-[#8a6d00]">{error}</span>
      )}
    </div>
  );
}
