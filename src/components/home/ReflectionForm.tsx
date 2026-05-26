"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Evening reflection input + Joy Pulse fallback (Synthesis Spec §3.2).
 *
 * Two paths:
 *   • Write a reflection → POST kind=reflection → routes home
 *   • Just a check-in → reveals a 1-10 Joy Pulse slider → POST
 *     kind=pulse → routes home
 */
export default function ReflectionForm() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [pulseMode, setPulseMode] = useState(false);
  const [score, setScore] = useState(7);
  const [error, setError] = useState<string | null>(null);

  async function submitReflection(e: React.FormEvent) {
    e.preventDefault();
    const reflection = text.trim();
    if (!reflection) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/me/intention", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "reflection", text: reflection }),
      });
      if (!res.ok) throw new Error("Couldn't save");
      router.push("/home");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  async function submitPulse() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/me/intention", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "pulse", score }),
      });
      if (!res.ok) throw new Error("Couldn't save");
      router.push("/home");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  if (pulseMode) {
    return (
      <div className="mt-8">
        <p className="font-serif text-[22px] italic leading-relaxed text-navy">
          How are you, right now?
        </p>
        <p className="mt-8 text-center font-serif text-[80px] font-medium tabular-nums leading-none text-cyan">
          {score}
        </p>
        <p className="mt-1 text-center font-sans text-[11px] uppercase tracking-[0.22em] text-slate">
          out of 10
        </p>
        <input
          type="range"
          min={1}
          max={10}
          value={score}
          onChange={(e) => setScore(Number(e.target.value))}
          className="mt-8 w-full accent-cyan"
          aria-label="Joy Pulse"
        />
        <div className="mt-1 flex justify-between font-sans text-[11px] uppercase tracking-[0.22em] text-slate/55">
          <span>Heavy</span>
          <span>Soaring</span>
        </div>
        {error && (
          <p className="mt-3 font-sans text-[12px] text-red-700">{error}</p>
        )}
        <button
          type="button"
          onClick={submitPulse}
          disabled={busy}
          className="mt-10 inline-flex items-center justify-center rounded-full bg-cyan px-8 py-3 font-sans text-[10px] font-bold uppercase tracking-[0.22em] text-white hover:bg-navy disabled:opacity-50"
        >
          {busy ? "…" : "Log it"}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submitReflection} className="mt-6">
      <textarea
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        maxLength={2000}
        placeholder="What stayed with you?"
        className="w-full resize-y border-0 border-b border-slate/40 bg-transparent py-3 font-serif text-[20px] italic leading-relaxed text-navy outline-none placeholder:not-italic placeholder:text-slate/40 focus:border-cyan"
      />
      {error && (
        <p className="mt-3 font-sans text-[12px] text-red-700">{error}</p>
      )}
      <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={busy || !text.trim()}
          className="inline-flex items-center justify-center rounded-full bg-cyan px-8 py-3 font-sans text-[10px] font-bold uppercase tracking-[0.22em] text-white hover:bg-navy disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save reflection"}
        </button>
        <button
          type="button"
          onClick={() => setPulseMode(true)}
          className="font-sans text-[12px] text-slate underline decoration-slate/30 underline-offset-2 hover:text-navy"
        >
          Just a check-in (no writing)
        </button>
      </div>
    </form>
  );
}
