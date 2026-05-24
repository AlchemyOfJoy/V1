"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { btnPrimary } from "@/lib/ui";

const inputClass =
  "w-full rounded-xl border border-navy/15 bg-white px-4 py-3 font-sans text-[15px] text-navy outline-none transition placeholder:text-navy/35 focus:border-cyan-deep focus:ring-2 focus:ring-cyan-deep/25";
const labelClass =
  "font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-navy/55";

export default function NewCourseForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [type, setType] = useState<"standard" | "certification">("standard");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), slug: slug.trim(), course_type: type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't create.");
      router.push(`/admin/courses/${data.course.id}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label htmlFor="title" className={labelClass}>
          Title
        </label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={200}
          placeholder="e.g. Forgiveness Deep Dive"
          className={`${inputClass} mt-2`}
        />
      </div>
      <div>
        <label htmlFor="slug" className={labelClass}>
          Slug (optional — auto-generated from title)
        </label>
        <input
          id="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          maxLength={80}
          placeholder="forgiveness-deep-dive"
          className={`${inputClass} mt-2`}
        />
      </div>
      <div>
        <label htmlFor="type" className={labelClass}>
          Type
        </label>
        <select
          id="type"
          value={type}
          onChange={(e) =>
            setType(e.target.value === "certification" ? "certification" : "standard")
          }
          className={`${inputClass} mt-2`}
        >
          <option value="standard">Standard course</option>
          <option value="certification">Certification track</option>
        </select>
        <p className="mt-1 font-sans text-[11px] font-light text-navy/55">
          Certification courses use the same builder but enforce phase
          gates and reviewer approvals.
        </p>
      </div>
      {error && (
        <p className="font-sans text-[13px] text-[#8a6d00]">{error}</p>
      )}
      <button type="submit" disabled={busy} className={btnPrimary}>
        {busy ? "…" : "Create draft"}
      </button>
    </form>
  );
}
