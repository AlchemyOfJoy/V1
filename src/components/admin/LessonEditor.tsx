"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { btnPrimary } from "@/lib/ui";
import { LESSON_TYPES, type LessonType } from "@/lib/courses-types";

interface LessonState {
  id: string;
  title: string;
  description: string | null;
  lesson_type: LessonType;
  sort_order: number;
  body: string | null;
  video_embed_url: string | null;
  audio_embed_url: string | null;
  transcript: string | null;
  coach_card_mode: string | null;
  cross_link_href: string | null;
  reflection_prompts: string[];
  estimated_duration_minutes: number | null;
}

const inputClass =
  "w-full rounded-xl border border-navy/15 bg-white px-4 py-2.5 font-sans text-[14px] text-navy outline-none transition placeholder:text-navy/35 focus:border-cyan-deep focus:ring-2 focus:ring-cyan-deep/25";
const labelClass =
  "font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-navy/55";

export default function LessonEditor({
  courseId,
  initial,
}: {
  courseId: string;
  initial: LessonState;
}) {
  const router = useRouter();
  const [state, setState] = useState(initial);
  const [reflectionsText, setReflectionsText] = useState(
    initial.reflection_prompts.join("\n"),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  function set<K extends keyof LessonState>(key: K, value: LessonState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  const helper = LESSON_TYPES.find((t) => t.id === state.lesson_type)?.helper;

  async function save() {
    setBusy(true);
    setError(null);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/lessons/${state.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: state.title,
          description: state.description,
          lesson_type: state.lesson_type,
          sort_order: state.sort_order,
          body: state.body,
          video_embed_url: state.video_embed_url,
          audio_embed_url: state.audio_embed_url,
          transcript: state.transcript,
          coach_card_mode: state.coach_card_mode,
          cross_link_href: state.cross_link_href,
          reflection_prompts: reflectionsText
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
          estimated_duration_minutes: state.estimated_duration_minutes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't save.");
      setMsg("Saved.");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm("Delete this lesson?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/lessons/${state.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      router.push(`/admin/courses/${courseId}`);
    } catch {
      setError("Couldn't delete.");
      setBusy(false);
    }
  }

  return (
    <section className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
        <label className="block">
          <span className={labelClass}>Title</span>
          <input
            value={state.title}
            onChange={(e) => set("title", e.target.value)}
            className={`${inputClass} mt-2`}
          />
        </label>
        <label className="block">
          <span className={labelClass}>Type</span>
          <select
            value={state.lesson_type}
            onChange={(e) => set("lesson_type", e.target.value as LessonType)}
            className={`${inputClass} mt-2`}
          >
            {LESSON_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {helper && (
        <p className="rounded-2xl border border-cyan-deep/20 bg-mist/60 px-4 py-3 font-sans text-[13px] font-light text-navy/70">
          {helper}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={labelClass}>Sort order</span>
          <input
            type="number"
            value={state.sort_order}
            onChange={(e) => set("sort_order", Number(e.target.value))}
            className={`${inputClass} mt-2`}
          />
        </label>
        <label className="block">
          <span className={labelClass}>Estimated duration (min)</span>
          <input
            type="number"
            value={state.estimated_duration_minutes ?? ""}
            onChange={(e) =>
              set(
                "estimated_duration_minutes",
                e.target.value ? Number(e.target.value) : null,
              )
            }
            className={`${inputClass} mt-2`}
          />
        </label>
      </div>

      <label className="block">
        <span className={labelClass}>Description (optional)</span>
        <input
          value={state.description ?? ""}
          onChange={(e) => set("description", e.target.value || null)}
          className={`${inputClass} mt-2`}
        />
      </label>

      {/* Type-specific fields */}
      {state.lesson_type === "text" && (
        <label className="block">
          <span className={labelClass}>Body (markdown or plain text)</span>
          <textarea
            rows={14}
            value={state.body ?? ""}
            onChange={(e) => set("body", e.target.value || null)}
            className={`${inputClass} mt-2 resize-y font-serif text-[15px] leading-[1.85]`}
          />
        </label>
      )}

      {state.lesson_type === "video" && (
        <>
          <label className="block">
            <span className={labelClass}>Video embed URL</span>
            <input
              value={state.video_embed_url ?? ""}
              onChange={(e) =>
                set("video_embed_url", e.target.value || null)
              }
              placeholder="https://customer-xxx.cloudflarestream.com/xxx/iframe — or YouTube / Vimeo embed URL"
              className={`${inputClass} mt-2`}
            />
            <span className="mt-1 block font-sans text-[11px] font-light text-navy/55">
              Cloudflare Stream upload pipeline ships in Phase 5b. Until
              then, paste any embed URL.
            </span>
          </label>
          <label className="block">
            <span className={labelClass}>Transcript (for accessibility)</span>
            <textarea
              rows={8}
              value={state.transcript ?? ""}
              onChange={(e) => set("transcript", e.target.value || null)}
              className={`${inputClass} mt-2 resize-y`}
            />
          </label>
        </>
      )}

      {state.lesson_type === "audio" && (
        <label className="block">
          <span className={labelClass}>Audio embed URL or MP3</span>
          <input
            value={state.audio_embed_url ?? ""}
            onChange={(e) =>
              set("audio_embed_url", e.target.value || null)
            }
            placeholder="https://…"
            className={`${inputClass} mt-2`}
          />
        </label>
      )}

      {state.lesson_type === "reflection" && (
        <label className="block">
          <span className={labelClass}>Reflection prompts (one per line)</span>
          <textarea
            rows={6}
            value={reflectionsText}
            onChange={(e) => setReflectionsText(e.target.value)}
            placeholder={"Where do you notice resistance?\nWhat would be different if it landed?"}
            className={`${inputClass} mt-2 resize-y`}
          />
        </label>
      )}

      {state.lesson_type === "coach_card" && (
        <>
          <label className="block">
            <span className={labelClass}>Card body (Brent's voice)</span>
            <textarea
              rows={5}
              value={state.body ?? ""}
              onChange={(e) => set("body", e.target.value || null)}
              className={`${inputClass} mt-2 resize-y font-serif italic`}
            />
          </label>
          <label className="block">
            <span className={labelClass}>Voice mode</span>
            <select
              value={state.coach_card_mode ?? "steady"}
              onChange={(e) =>
                set("coach_card_mode", e.target.value || null)
              }
              className={`${inputClass} mt-2`}
            >
              <option value="steady">Steady</option>
              <option value="reverent">Reverent</option>
              <option value="playful">Playful</option>
            </select>
          </label>
        </>
      )}

      {state.lesson_type === "cross_link" && (
        <>
          <label className="block">
            <span className={labelClass}>Cross-link destination</span>
            <input
              value={state.cross_link_href ?? ""}
              onChange={(e) =>
                set("cross_link_href", e.target.value || null)
              }
              placeholder="/curriculum/module/03-forgiveness or /toolkit/reframe-ritual"
              className={`${inputClass} mt-2`}
            />
          </label>
          <label className="block">
            <span className={labelClass}>Coach-line above the link</span>
            <input
              value={state.body ?? ""}
              onChange={(e) => set("body", e.target.value || null)}
              placeholder="Now go do this in the Tool Kit. We'll be here when you're back."
              className={`${inputClass} mt-2`}
            />
          </label>
        </>
      )}

      {state.lesson_type === "workshop" && (
        <p className="rounded-2xl border border-dashed border-navy/15 bg-mist/40 p-4 font-sans text-[13px] italic text-navy/55">
          Live workshop editor (Daily.co room + scheduled time + replay)
          ships in Phase 5b.
        </p>
      )}

      {state.lesson_type === "exercise" && (
        <p className="rounded-2xl border border-dashed border-navy/15 bg-mist/40 p-4 font-sans text-[13px] italic text-navy/55">
          Structured exercise step builder ships in Phase 5b. For now,
          use a cross-link lesson pointing to an existing Tool Kit tool.
        </p>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-navy/10 pt-5">
        <button
          type="button"
          onClick={remove}
          className="rounded-full border border-[#8a6d00]/30 px-4 py-2 font-sans text-[12px] font-medium text-[#8a6d00] hover:bg-[#fdf6e0]"
        >
          Delete lesson
        </button>
        <div className="flex items-center gap-3">
          <p className="font-sans text-[12px] text-cyan-deep">{msg}</p>
          <p className="font-sans text-[12px] text-[#8a6d00]">{error}</p>
          <button onClick={save} disabled={busy} className={btnPrimary}>
            {busy ? "…" : "Save lesson"}
          </button>
        </div>
      </div>
    </section>
  );
}
