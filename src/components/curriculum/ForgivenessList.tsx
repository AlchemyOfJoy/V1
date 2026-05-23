"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { btnPrimary } from "@/lib/ui";

interface Subject {
  id: string;
  subject_name: string;
  completed_at: string | Date | null;
  created_at: string | Date;
  victim_rant: string | null;
  empath_rave: string | null;
  universal_meaning: string | null;
  forgiveness_statement: string | null;
}

function progressFor(s: Subject): number {
  return [
    s.victim_rant,
    s.empath_rave,
    s.universal_meaning,
    s.forgiveness_statement,
  ].filter((v) => typeof v === "string" && v.trim().length > 0).length;
}

export default function ForgivenessList({
  initialSubjects,
}: {
  initialSubjects: Subject[];
}) {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/curriculum/forgiveness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject_name: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't start that.");
      router.push(`/curriculum/module/03-forgiveness/${data.subject.id}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (
      !confirm(
        "Delete this forgiveness process? Your writing will be removed permanently.",
      )
    )
      return;
    const prev = subjects;
    setSubjects((cur) => cur.filter((s) => s.id !== id));
    try {
      const res = await fetch(`/api/curriculum/forgiveness/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
    } catch {
      setSubjects(prev);
      setError("Couldn't remove that — try again?");
    }
  }

  const inputClass =
    "w-full rounded-xl border border-navy/15 bg-white px-4 py-3 font-sans text-[15px] text-navy outline-none transition placeholder:text-navy/35 focus:border-cyan-deep focus:ring-2 focus:ring-cyan-deep/25";

  return (
    <section className="space-y-8">
      <form
        onSubmit={start}
        className="grid gap-3 rounded-2xl border border-navy/12 bg-mist p-5 sm:grid-cols-[1fr_auto]"
      >
        <div>
          <label
            htmlFor="subject-name"
            className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-deep"
          >
            Begin a new forgiveness process
          </label>
          <input
            id="subject-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="A name, a nickname, &lsquo;myself&rsquo; — your call."
            maxLength={120}
            className={`${inputClass} mt-2`}
          />
        </div>
        <button
          type="submit"
          disabled={busy || !name.trim()}
          className={`${btnPrimary} sm:self-end`}
        >
          {busy ? "…" : "Begin"}
        </button>
      </form>

      {error && (
        <p className="font-sans text-[13px] text-[#8a6d00]">{error}</p>
      )}

      <div className="space-y-3">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-navy/55">
          Your processes — {subjects.length}
        </p>

        {subjects.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-navy/15 bg-white p-8 text-center font-sans text-[14px] font-light text-navy/55">
            Nothing here yet. Begin with one name when you&apos;re ready —
            even a placeholder. You can always rename it later.
          </p>
        ) : (
          <ul className="space-y-2">
            {subjects.map((s) => {
              const step = progressFor(s);
              const done = s.completed_at !== null;
              return (
                <li
                  key={s.id}
                  className="group flex items-start gap-4 rounded-2xl border border-navy/10 bg-white p-5"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-serif text-[16px] font-medium ${
                      done
                        ? "bg-cyan-deep text-white"
                        : "bg-mist text-navy/55"
                    }`}
                    aria-hidden
                  >
                    {done ? "✓" : `${step}/4`}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/curriculum/module/03-forgiveness/${s.id}`}
                      className="font-serif text-[19px] font-medium text-navy transition hover:text-cyan-deep"
                    >
                      {s.subject_name}
                    </Link>
                    <p className="mt-1 font-sans text-[12px] text-navy/55">
                      {done
                        ? `Released ${new Date(s.completed_at as string).toLocaleDateString()}`
                        : step === 0
                          ? "Not started"
                          : `Step ${step} of 4`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(s.id)}
                    className="font-sans text-[12px] text-navy/35 opacity-0 transition group-hover:opacity-100 hover:text-[#8a6d00]"
                    aria-label="Delete process"
                  >
                    Delete
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
