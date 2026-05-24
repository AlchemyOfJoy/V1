"use client";

import { useState } from "react";
import { btnPrimary } from "@/lib/ui";
import { COACHING_PACKAGES, formatPrice } from "@/lib/pricing";

export default function WaitlistForm({
  defaultPackageId,
}: {
  defaultPackageId?: string;
}) {
  const [packageId, setPackageId] = useState(defaultPackageId ?? "compass");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/coaching/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ package_id: packageId, notes }),
      });
      if (!res.ok) throw new Error();
      setDone(true);
    } catch {
      setError("Couldn't add you — try again?");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-3xl border border-cyan-deep/30 bg-gradient-to-br from-mist to-white p-8 text-center">
        <p aria-hidden className="text-[28px] text-gold">
          ✦
        </p>
        <h3 className="mt-2 font-serif text-[22px] font-medium text-navy">
          You&apos;re on the list.
        </h3>
        <p className="mt-2 font-sans text-[14px] font-light leading-relaxed text-navy/65">
          We&apos;re bringing the first cohort of certified coaches online
          right now. You&apos;ll hear from us the moment we have a match.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-5 rounded-3xl border border-navy/12 bg-white p-6"
    >
      <div>
        <label
          htmlFor="package"
          className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-navy/55"
        >
          Which package fits?
        </label>
        <select
          id="package"
          value={packageId}
          onChange={(e) => setPackageId(e.target.value)}
          className="mt-2 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 font-sans text-[15px] text-navy outline-none focus:border-cyan-deep focus:ring-2 focus:ring-cyan-deep/25"
        >
          {COACHING_PACKAGES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} · {formatPrice(p.monthlyCents)}/mo
            </option>
          ))}
          <option value="">Not sure yet</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="notes"
          className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-navy/55"
        >
          Anything we should know? (optional)
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="What's calling you to a human coach right now?"
          className="mt-2 w-full resize-y rounded-2xl border border-navy/15 bg-white px-5 py-3 font-sans text-[15px] leading-relaxed text-navy outline-none transition placeholder:text-navy/35 focus:border-cyan-deep focus:ring-2 focus:ring-cyan-deep/25"
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="font-sans text-[12px] text-[#8a6d00]">{error}</p>
        <button type="submit" disabled={busy} className={btnPrimary}>
          {busy ? "…" : "Join the waitlist"}
        </button>
      </div>
    </form>
  );
}
