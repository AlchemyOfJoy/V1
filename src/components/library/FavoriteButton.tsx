"use client";

import { useEffect, useState } from "react";

/**
 * Heart button on a Daily Joy Drop / Library quote. Optimistic toggle,
 * silent failure — never a blocker. The user's full favorites list
 * surfaces in /me → My Joy Library.
 */
export default function FavoriteButton({
  quoteId,
  initialSaved = false,
}: {
  quoteId: string;
  initialSaved?: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [busy, setBusy] = useState(false);

  useEffect(() => setSaved(initialSaved), [initialSaved]);

  async function toggle() {
    setBusy(true);
    const next = !saved;
    setSaved(next);
    try {
      await fetch("/api/quotes/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quote_id: quoteId,
          action: next ? "add" : "remove",
        }),
      });
    } catch {
      setSaved(!next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={saved}
      aria-label={saved ? "Remove from favorites" : "Save to favorites"}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-sans text-[11px] font-semibold uppercase tracking-[0.16em] transition disabled:opacity-50 ${
        saved
          ? "bg-[#C89A3F]/15 text-[#A87F2F] hover:bg-[#C89A3F]/25"
          : "text-navy/55 hover:bg-navy/5 hover:text-navy"
      }`}
    >
      <span aria-hidden className="text-[14px] leading-none">
        {saved ? "♥" : "♡"}
      </span>
      {saved ? "Saved" : "Save"}
    </button>
  );
}
