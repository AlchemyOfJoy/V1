"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCelebrate } from "@/components/celebrate/CelebrationProvider";
import { btnPrimary } from "@/lib/ui";

/**
 * Persistent floating actions on every signed-in screen:
 *   [+]  — quick-add to List of Joy (modal in place)
 *   [⚡] — Reset Breath shortcut (links to the 60-Second Reset tool)
 *
 * Per spec: sacred shortcuts. Always there. Never animate aggressively.
 */
export default function FloatingActions() {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();
  const { celebrate } = useCelebrate();

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const text = content.trim();
    if (!text) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/curriculum/list-of-joy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json().catch(() => ({}));
      setContent("");
      setMsg("Added ✦");
      router.refresh();
      // If they just crossed a milestone, fire a milestone celebration.
      if (data?.milestone) {
        const count: number = data.milestone.count;
        const secondaries: Record<number, string> = {
          1: "We'll come back to this every day. Forever.",
          10: "Brent started here.",
          25: "Look at the life you're building.",
          100: "Brent started with ten.",
          500: "Five hundred. Notice the life you've built.",
        };
        setTimeout(() => {
          setOpen(false);
          setMsg(null);
          celebrate({
            size: "milestone",
            eyebrow: "List of Joy",
            primary: data.milestone.label,
            secondary: secondaries[count] ?? "Keep going.",
          });
        }, 400);
      } else {
        setTimeout(() => {
          setOpen(false);
          setMsg(null);
        }, 700);
      }
    } catch {
      setMsg("Couldn't save — try again?");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* Left: [+] add to List of Joy */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Add to List of Joy"
        className="fixed bottom-[calc(64px+env(safe-area-inset-bottom))] left-5 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-navy/15 transition hover:scale-105 hover:ring-cyan-deep/40 lg:bottom-6"
      >
        <PlusIcon />
      </button>

      {/* Right: [⚡] Reset Breath */}
      <Link
        href="/curriculum/module/04-bold-action/60-second-reset"
        aria-label="Reset Breath"
        className="fixed bottom-[calc(64px+env(safe-area-inset-bottom))] right-5 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-cyan-deep text-white shadow-lg ring-1 ring-cyan-deep transition hover:scale-105 hover:bg-[#006a8c] lg:bottom-6"
      >
        <BoltIcon />
      </Link>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="quick-add-title"
          className="fixed inset-0 z-50 flex items-end justify-center bg-navy/40 backdrop-blur-sm animate-fade-in sm:items-center"
        >
          <div className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-deep">
                  Add to your List of Joy
                </p>
                <h2
                  id="quick-add-title"
                  className="mt-1 font-serif text-[22px] font-medium text-navy"
                >
                  What sparked you?
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="font-sans text-[20px] text-navy/40 hover:text-navy"
              >
                ×
              </button>
            </div>
            <form onSubmit={save} className="mt-4 space-y-3">
              <textarea
                autoFocus
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                maxLength={280}
                placeholder="The morning light on the kitchen table…"
                className="w-full resize-y rounded-2xl border border-navy/15 bg-white px-4 py-3 font-serif text-[16px] leading-relaxed text-navy outline-none transition placeholder:font-sans placeholder:text-[14px] placeholder:font-light placeholder:text-navy/40 focus:border-cyan-deep focus:ring-2 focus:ring-cyan-deep/25"
              />
              <div className="flex items-center justify-between gap-3">
                <p className="font-sans text-[12px] text-cyan-deep">{msg}</p>
                <button
                  type="submit"
                  disabled={busy || !content.trim()}
                  className={btnPrimary}
                >
                  {busy ? "…" : "Add ✦"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function PlusIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 5v14M5 12h14"
        stroke="#00171F"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
function BoltIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M13 2L5 14h6l-2 8 8-12h-6l2-8z"
        fill="white"
      />
    </svg>
  );
}
