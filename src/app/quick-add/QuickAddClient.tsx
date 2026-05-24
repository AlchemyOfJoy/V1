"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { btnPrimary } from "@/lib/ui";
import { useCelebrate } from "@/components/celebrate/CelebrationProvider";

export default function QuickAddClient() {
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { celebrate } = useCelebrate();

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const text = content.trim();
    if (!text) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/curriculum/list-of-joy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json().catch(() => ({}));
      setContent("");
      if (data?.milestone) {
        celebrate({
          size: "milestone",
          eyebrow: "List of Joy",
          primary: data.milestone.label,
          secondary: "Keep going.",
        });
      } else {
        celebrate({
          size: "micro",
          eyebrow: "Added",
          primary: "On the list.",
          secondary: "One small thing.",
        });
      }
      setTimeout(() => router.push("/home"), 1200);
    } catch {
      setError("Couldn't save — try again?");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-5 pb-12">
      <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-deep">
        Add to your List of Joy
      </p>
      <h1 className="mt-2 font-serif text-[28px] font-medium leading-tight text-navy">
        What sparked you?
      </h1>
      <form onSubmit={save} className="mt-6 space-y-4">
        <textarea
          autoFocus
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          maxLength={280}
          placeholder="The morning light on the kitchen table…"
          className="w-full resize-y rounded-2xl border border-navy/15 bg-white px-4 py-3 font-serif text-[17px] leading-relaxed text-navy outline-none transition placeholder:font-sans placeholder:text-[14px] placeholder:font-light placeholder:text-navy/40 focus:border-cyan-deep focus:ring-2 focus:ring-cyan-deep/25"
        />
        <div className="flex items-center justify-between gap-3">
          {error && (
            <p className="font-sans text-[12px] text-red-600">{error}</p>
          )}
          <button
            type="submit"
            disabled={busy || !content.trim()}
            className={`${btnPrimary} ml-auto`}
          >
            {busy ? "…" : "Add ✦"}
          </button>
        </div>
      </form>
      <p className="mt-6 font-sans text-[11px] text-navy/45">
        Tip: long-press the app icon on your home screen for instant access.
      </p>
    </div>
  );
}
