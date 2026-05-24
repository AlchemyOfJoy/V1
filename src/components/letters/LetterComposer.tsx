"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const DELIVERY_OPTIONS = [
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
  { label: "6 months", days: 180 },
  { label: "1 year", days: 365 },
];

export default function LetterComposer() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [days, setDays] = useState(180);
  const [sealed, setSealed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function seal() {
    if (!text.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/letters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text.trim(), deliver_in_days: days }),
      });
      if (!res.ok) throw new Error();
      setSealed(true);
      setText("");
      setTimeout(() => {
        router.refresh();
        setSealed(false);
      }, 2500);
    } catch {
      setError("Couldn't seal — try again?");
    } finally {
      setBusy(false);
    }
  }

  if (sealed) {
    return (
      <div className="rounded-3xl border border-[#C89A3F]/40 bg-[#FAF6EC] p-8 text-center animate-fade-in">
        <p aria-hidden className="text-[28px] text-[#C89A3F]">
          ✉
        </p>
        <p className="mt-3 font-serif text-[20px] italic text-navy">
          Sealed. It will arrive when it&apos;s time.
        </p>
      </div>
    );
  }

  return (
    <section className="rounded-3xl border border-navy/10 bg-white p-6">
      <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-deep">
        Write yourself a letter
      </p>
      <p className="mt-2 font-serif text-[18px] italic leading-relaxed text-navy/70">
        Tell yourself something they&apos;ll need to hear when this arrives.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={10}
        maxLength={20000}
        placeholder="Dear future me,"
        className="mt-5 w-full resize-y rounded-2xl border border-navy/15 bg-white px-5 py-4 font-serif text-[17px] leading-[1.85] text-navy outline-none transition placeholder:font-sans placeholder:text-[15px] placeholder:font-light placeholder:text-navy/40 focus:border-cyan-deep focus:ring-2 focus:ring-cyan-deep/25"
      />

      <div className="mt-5">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-navy/55">
          Deliver in
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {DELIVERY_OPTIONS.map((opt) => (
            <button
              key={opt.days}
              type="button"
              onClick={() => setDays(opt.days)}
              className={`rounded-full px-4 py-1.5 font-sans text-[12px] font-semibold transition ${
                days === opt.days
                  ? "bg-cyan-deep text-white"
                  : "bg-mist text-navy/65 hover:text-cyan-deep"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <p className="font-sans text-[12px] text-[#8a6d00]">{error}</p>
        <button
          type="button"
          onClick={seal}
          disabled={busy || !text.trim()}
          className="rounded-full bg-cyan-deep px-6 py-2.5 font-sans text-[13px] font-semibold text-white transition hover:bg-[#006a8c] disabled:opacity-50"
        >
          {busy ? "…" : "Seal the letter"}
        </button>
      </div>
    </section>
  );
}
