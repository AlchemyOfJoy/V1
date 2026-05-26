"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * The morning intention input (Synthesis Spec §2.1).
 *
 * One textarea, single 1px slate bottom rule, auto-focused. Submit
 * via POST /api/me/intention then router.refresh() so the home page
 * re-renders into the two-CTA state with the user's intention shown
 * back to them.
 *
 * "Skip today" routes to /home/skip which sets a no-op intention so
 * the user can proceed to the two CTAs without writing — the friction
 * is intentional but never blocking.
 */
export default function IntentionForm({ prompt }: { prompt: string }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const intention = text.trim();
    if (!intention) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/me/intention", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "intention", text: intention, prompt }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Couldn't save");
      }
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  async function skip() {
    setBusy(true);
    setError(null);
    try {
      await fetch("/api/me/intention", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "intention",
          text: "(no intention set)",
          prompt,
        }),
      });
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-8">
      <textarea
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        maxLength={500}
        placeholder="Today I will…"
        className="w-full resize-none border-0 border-b border-slate/40 bg-transparent py-3 font-serif text-[22px] italic leading-relaxed text-navy outline-none placeholder:not-italic placeholder:text-slate/40 focus:border-cyan"
      />
      {error && (
        <p className="mt-3 font-sans text-[12px] text-red-700">{error}</p>
      )}
      <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={busy || !text.trim()}
          className="inline-flex items-center justify-center rounded-full bg-cyan px-8 py-3 font-sans text-[10px] font-bold uppercase tracking-[0.22em] text-white transition hover:bg-navy disabled:opacity-50"
        >
          {busy ? "Saving…" : "Set my intention"}
        </button>
        <button
          type="button"
          onClick={skip}
          disabled={busy}
          className="font-sans text-[12px] text-slate underline decoration-slate/30 underline-offset-2 hover:text-navy"
        >
          Skip today — show me my practice
        </button>
      </div>
    </form>
  );
}
