"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCelebrate } from "@/components/celebrate/CelebrationProvider";

const inputClass =
  "w-full rounded-xl border border-navy/15 bg-white px-4 py-2.5 font-sans text-[14px] text-navy outline-none transition placeholder:text-navy/35 focus:border-cyan-deep focus:ring-2 focus:ring-cyan-deep/25";
const labelClass =
  "font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-navy/55";

interface Loop {
  intention: string | null;
  thought: string | null;
  action: string | null;
  action_status: "pending" | "yes" | "partial" | "not_yet" | null;
  evening_notes: string | null;
}

export default function IttLoopControl({
  initial,
}: {
  initial: Loop | null;
}) {
  const router = useRouter();
  const { celebrate } = useCelebrate();
  const [intention, setIntention] = useState(initial?.intention ?? "");
  const [thought, setThought] = useState(initial?.thought ?? "");
  const [action, setAction] = useState(initial?.action ?? "");
  const [status, setStatus] = useState<
    "yes" | "partial" | "not_yet" | null
  >(
    initial?.action_status && initial.action_status !== "pending"
      ? initial.action_status
      : null,
  );
  const [notes, setNotes] = useState(initial?.evening_notes ?? "");
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const hasMorning =
    (initial?.intention ?? "").trim().length > 0 ||
    (initial?.action ?? "").trim().length > 0;
  const [phase, setPhase] = useState<"morning" | "evening">(
    hasMorning ? "evening" : "morning",
  );

  async function saveMorning(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setSavedMsg(null);
    try {
      const res = await fetch("/api/itt-loop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phase: "morning",
          intention,
          thought,
          action,
        }),
      });
      if (!res.ok) throw new Error();
      setSavedMsg("Set for today ✦");
      router.refresh();
    } catch {
      setSavedMsg("Couldn't save — try again?");
    } finally {
      setBusy(false);
    }
  }

  async function saveEvening(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setSavedMsg(null);
    try {
      const res = await fetch("/api/itt-loop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phase: "evening",
          action_status: status,
          evening_notes: notes,
        }),
      });
      if (!res.ok) throw new Error();
      setSavedMsg("Closed the loop ✦");
      // Micro-celebration — daily small win
      celebrate({
        size: "micro",
        primary:
          status === "yes"
            ? "Loop closed. The day landed."
            : status === "partial"
              ? "Progress counts. Tomorrow."
              : "Noted. The work continues.",
      });
      router.refresh();
    } catch {
      setSavedMsg("Couldn't save — try again?");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 font-sans text-[11px] font-semibold uppercase tracking-[0.14em]">
        <button
          type="button"
          onClick={() => setPhase("morning")}
          className={`rounded-full px-3 py-1 transition ${
            phase === "morning"
              ? "bg-cyan-deep text-white"
              : "bg-mist text-navy/55 hover:text-cyan-deep"
          }`}
        >
          Morning
        </button>
        <button
          type="button"
          onClick={() => setPhase("evening")}
          className={`rounded-full px-3 py-1 transition ${
            phase === "evening"
              ? "bg-cyan-deep text-white"
              : "bg-mist text-navy/55 hover:text-cyan-deep"
          }`}
        >
          Evening
        </button>
        <span className="ml-auto self-center font-sans text-[11px] text-cyan-deep">
          {savedMsg}
        </span>
      </div>

      {phase === "morning" ? (
        <form onSubmit={saveMorning} className="space-y-3">
          <div>
            <label htmlFor="intention" className={labelClass}>
              Intention — one for today
            </label>
            <input
              id="intention"
              type="text"
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              placeholder="e.g. Be present in every conversation."
              className={`${inputClass} mt-1.5`}
            />
          </div>
          <div>
            <label htmlFor="thought" className={labelClass}>
              Thought — the affirmation you're carrying
            </label>
            <input
              id="thought"
              type="text"
              value={thought}
              onChange={(e) => setThought(e.target.value)}
              placeholder="e.g. I am exactly where I'm meant to be."
              className={`${inputClass} mt-1.5`}
            />
          </div>
          <div>
            <label htmlFor="action" className={labelClass}>
              Action — one move that aligns
            </label>
            <input
              id="action"
              type="text"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="e.g. Send the text I've been avoiding."
              className={`${inputClass} mt-1.5`}
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-cyan-deep px-5 py-2 font-sans text-[13px] font-semibold text-white transition hover:bg-[#006a8c] disabled:opacity-50"
            >
              {busy ? "…" : "Lock it in"}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={saveEvening} className="space-y-3">
          {action && (
            <div className="rounded-xl bg-mist p-3">
              <p className="font-sans text-[11px] uppercase tracking-[0.16em] text-cyan-deep">
                Today&apos;s action
              </p>
              <p className="mt-1 font-serif text-[16px] italic text-navy">
                {action}
              </p>
            </div>
          )}
          <div>
            <p className={labelClass}>Did it happen?</p>
            <div className="mt-2 flex gap-2">
              {(
                [
                  ["yes", "Yes"],
                  ["partial", "Partially"],
                  ["not_yet", "Not yet"],
                ] as const
              ).map(([v, label]) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setStatus(v)}
                  className={`flex-1 rounded-xl py-2 font-sans text-[13px] font-medium transition ${
                    status === v
                      ? "bg-cyan-deep text-white"
                      : "bg-mist text-navy/65 hover:text-cyan-deep"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="evening-notes" className={labelClass}>
              What did you notice? (optional)
            </label>
            <textarea
              id="evening-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className={`${inputClass} mt-1.5 resize-y`}
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={busy || !status}
              className="rounded-full bg-cyan-deep px-5 py-2 font-sans text-[13px] font-semibold text-white transition hover:bg-[#006a8c] disabled:opacity-50"
            >
              {busy ? "…" : "Close the day"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
