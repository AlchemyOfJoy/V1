"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { btnPrimary } from "@/lib/ui";
import { useCelebrate } from "@/components/celebrate/CelebrationProvider";
import CoachCard from "@/components/app/CoachCard";
import type { CoachMode } from "@/components/app/CoachCard";
import { Tridot } from "@/components/app/Wave";

interface Lesson {
  id: string;
  title: string;
  lesson_type: string;
  body: string | null;
  video_embed_url: string | null;
  audio_embed_url: string | null;
  transcript: string | null;
  coach_card_mode: string | null;
  cross_link_href: string | null;
  reflection_prompts: string[];
}

interface Props {
  courseSlug: string;
  lesson: Lesson;
  progress: {
    completed_at: string | Date | null;
    notes: string;
    reflection_responses: Record<string, string>;
  };
  nextLessonId: string | null;
}

export default function LessonPlayer({
  courseSlug,
  lesson,
  progress,
  nextLessonId,
}: Props) {
  const router = useRouter();
  const { celebrate } = useCelebrate();
  const [notes, setNotes] = useState(progress.notes ?? "");
  const [reflections, setReflections] = useState<Record<string, string>>(
    progress.reflection_responses ?? {},
  );
  const [completed, setCompleted] = useState(progress.completed_at !== null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [busy, setBusy] = useState(false);
  const noteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reflTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Mark started on mount
    fetch(`/api/courses/lessons/${lesson.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "start" }),
    }).catch(() => {});
  }, [lesson.id]);

  // Debounced autosave for notes
  function setNotesAndSave(v: string) {
    setNotes(v);
    if (noteTimer.current) clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(() => {
      fetch(`/api/courses/lessons/${lesson.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "notes", notes: v }),
      }).catch(() => {});
    }, 1200);
  }

  function setReflectionAndSave(key: string, v: string) {
    const next = { ...reflections, [key]: v };
    setReflections(next);
    if (reflTimer.current) clearTimeout(reflTimer.current);
    reflTimer.current = setTimeout(() => {
      fetch(`/api/courses/lessons/${lesson.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reflect",
          reflection_responses: next,
        }),
      }).catch(() => {});
    }, 1200);
  }

  async function completeAndContinue() {
    setBusy(true);
    try {
      const res = await fetch(`/api/courses/lessons/${lesson.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "complete" }),
      });
      const data = await res.json();
      setCompleted(true);

      // Course-complete? Major celebration.
      if (data?.completed_course) {
        celebrate({
          size: "major",
          eyebrow: "Course complete",
          primary: "You finished.",
          secondary: "That's the work. Now go live it.",
        });
        setTimeout(() => router.push(`/courses/${courseSlug}`), 4500);
        return;
      }

      if (nextLessonId) {
        router.push(`/courses/${courseSlug}/lesson/${nextLessonId}`);
      } else {
        router.push(`/courses/${courseSlug}`);
      }
    } catch {
      // silent
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-6">
      {/* Lesson body — varies by type */}
      <LessonContent
        lesson={lesson}
        showTranscript={showTranscript}
        onToggleTranscript={() => setShowTranscript((s) => !s)}
      />

      {/* Reflection prompts (always shown when present) */}
      {lesson.reflection_prompts.length > 0 && (
        <>
          <Tridot />
          <section className="space-y-4">
            <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-deep">
              Reflect
            </p>
            {lesson.reflection_prompts.map((prompt, i) => (
              <div key={i}>
                <p className="font-serif text-[17px] italic leading-relaxed text-navy/85">
                  {prompt}
                </p>
                <textarea
                  rows={4}
                  value={reflections[String(i)] ?? ""}
                  onChange={(e) => setReflectionAndSave(String(i), e.target.value)}
                  placeholder="Take your time…"
                  className="mt-2 w-full resize-y rounded-2xl border border-navy/15 bg-white px-4 py-3 font-sans text-[15px] leading-relaxed text-navy outline-none focus:border-cyan-deep focus:ring-2 focus:ring-cyan-deep/25"
                />
              </div>
            ))}
          </section>
        </>
      )}

      {/* Notes (always available, not just for video) */}
      {lesson.lesson_type !== "coach_card" &&
        lesson.lesson_type !== "cross_link" && (
          <>
            <Tridot />
            <section>
              <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-navy/55">
                Your notes
              </p>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotesAndSave(e.target.value)}
                placeholder="Anything that landed for you…"
                className="mt-2 w-full resize-y rounded-2xl border border-navy/15 bg-white px-4 py-3 font-sans text-[14px] leading-relaxed text-navy outline-none focus:border-cyan-deep focus:ring-2 focus:ring-cyan-deep/25"
              />
              <p className="mt-1 font-sans text-[11px] font-light text-navy/45">
                Autosaves. Visible only to you.
              </p>
            </section>
          </>
        )}

      <div className="flex items-center justify-between gap-3 border-t border-navy/10 pt-6">
        <Link
          href={`/courses/${courseSlug}`}
          className="font-sans text-[12px] text-navy/55 hover:text-cyan-deep"
        >
          ← Back to course
        </Link>
        <button
          onClick={completeAndContinue}
          disabled={busy}
          className={btnPrimary}
        >
          {busy
            ? "…"
            : completed
              ? nextLessonId
                ? "Continue →"
                : "Back to course"
              : nextLessonId
                ? "Mark complete & continue →"
                : "Mark complete"}
        </button>
      </div>
    </section>
  );
}

function LessonContent({
  lesson,
  showTranscript,
  onToggleTranscript,
}: {
  lesson: Lesson;
  showTranscript: boolean;
  onToggleTranscript: () => void;
}) {
  if (lesson.lesson_type === "coach_card") {
    const mode: CoachMode =
      lesson.coach_card_mode === "reverent"
        ? "reverent"
        : lesson.coach_card_mode === "playful"
          ? "playful"
          : "steady";
    return (
      <CoachCard size="hero" mode={mode} body={lesson.body ?? ""} />
    );
  }

  if (lesson.lesson_type === "cross_link") {
    return (
      <div className="space-y-4">
        {lesson.body && (
          <p className="font-serif text-[18px] italic leading-relaxed text-navy/75">
            {lesson.body}
          </p>
        )}
        {lesson.cross_link_href && (
          <Link
            href={lesson.cross_link_href}
            className="inline-flex items-center gap-2 rounded-full bg-cyan-deep px-5 py-2.5 font-sans text-[13px] font-semibold text-white hover:bg-[#006a8c]"
          >
            Open →
          </Link>
        )}
      </div>
    );
  }

  if (lesson.lesson_type === "video") {
    return (
      <div className="space-y-3">
        {lesson.video_embed_url ? (
          <div className="overflow-hidden rounded-3xl bg-black">
            <div className="aspect-video">
              <iframe
                src={lesson.video_embed_url}
                title={lesson.title}
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          </div>
        ) : (
          <p className="rounded-3xl border border-dashed border-navy/15 bg-mist/40 p-8 text-center font-sans text-[13px] italic text-navy/55">
            Video embed URL not set on this lesson.
          </p>
        )}
        {lesson.transcript && (
          <>
            <button
              type="button"
              onClick={onToggleTranscript}
              className="font-sans text-[12px] font-semibold text-cyan-deep hover:underline"
            >
              {showTranscript ? "Hide transcript" : "Show transcript"}
            </button>
            {showTranscript && (
              <div className="rounded-2xl border border-navy/10 bg-mist/30 p-4 font-serif text-[15px] leading-[1.85] text-navy/85 whitespace-pre-wrap">
                {lesson.transcript}
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  if (lesson.lesson_type === "audio") {
    return (
      <div className="space-y-3 rounded-3xl border border-navy/10 bg-white p-6">
        {lesson.audio_embed_url ? (
          <audio controls src={lesson.audio_embed_url} className="w-full">
            Your browser doesn&apos;t support audio.
          </audio>
        ) : (
          <p className="font-sans text-[13px] italic text-navy/55">
            Audio URL not set on this lesson.
          </p>
        )}
        {lesson.body && (
          <p className="whitespace-pre-wrap font-serif text-[16px] leading-[1.85] text-navy/85">
            {lesson.body}
          </p>
        )}
      </div>
    );
  }

  if (lesson.lesson_type === "workshop") {
    return (
      <p className="rounded-3xl border border-dashed border-navy/15 bg-mist/40 p-8 text-center font-serif text-[16px] italic text-navy/65">
        Live workshop. Integration ships in Phase 5b.
      </p>
    );
  }

  // text + reflection + exercise — render body if present
  if (lesson.body) {
    return (
      <article className="whitespace-pre-wrap font-serif text-[17px] leading-[1.85] text-navy/85">
        {lesson.body}
      </article>
    );
  }

  return null;
}
