"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { btnPrimary } from "@/lib/ui";
import { LESSON_TYPES, type LessonType } from "@/lib/courses-types";

interface CourseInput {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  cover_image_url: string | null;
  course_type: string;
  pricing_model: string;
  price_cents: number | null;
  drip_mode: string;
  estimated_duration_minutes: number | null;
  tags: string[];
  status: string;
}

interface ModuleInput {
  id: string;
  title: string;
  description: string | null;
  sort_order: number;
  lessons: LessonStub[];
}

interface LessonStub {
  id: string;
  title: string;
  lesson_type: LessonType;
  sort_order: number;
  estimated_duration_minutes: number | null;
}

const inputClass =
  "w-full rounded-xl border border-navy/15 bg-white px-4 py-2.5 font-sans text-[14px] text-navy outline-none transition placeholder:text-navy/35 focus:border-cyan-deep focus:ring-2 focus:ring-cyan-deep/25";
const labelClass =
  "font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-navy/55";

export default function CourseBuilder({
  course,
  modules,
}: {
  course: CourseInput;
  modules: ModuleInput[];
}) {
  const [tab, setTab] = useState<"settings" | "curriculum">("curriculum");
  return (
    <div>
      <nav className="flex gap-2 border-b border-navy/10">
        {[
          { id: "curriculum", label: "Curriculum" },
          { id: "settings", label: "Settings" },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id as typeof tab)}
            className={`-mb-px border-b-2 px-4 py-3 font-sans text-[12px] font-semibold uppercase tracking-[0.18em] transition ${
              tab === t.id
                ? "border-cyan-deep text-cyan-deep"
                : "border-transparent text-navy/55 hover:text-cyan-deep"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="mt-6">
        {tab === "settings" ? (
          <SettingsTab course={course} />
        ) : (
          <CurriculumTab courseId={course.id} initialModules={modules} />
        )}
      </div>
    </div>
  );
}

function SettingsTab({ course }: { course: CourseInput }) {
  const router = useRouter();
  const [state, setState] = useState(course);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof CourseInput>(key: K, value: CourseInput[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  async function save() {
    setBusy(true);
    setError(null);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/courses/${course.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: state.title,
          slug: state.slug,
          subtitle: state.subtitle,
          description: state.description,
          cover_image_url: state.cover_image_url,
          course_type: state.course_type,
          pricing_model: state.pricing_model,
          price_cents: state.price_cents,
          drip_mode: state.drip_mode,
          estimated_duration_minutes: state.estimated_duration_minutes,
          tags: state.tags,
          status: state.status,
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
    if (!confirm("Delete this course and all its content? Cannot be undone."))
      return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/courses/${course.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      router.push("/admin/courses");
    } catch {
      setError("Couldn't delete.");
      setBusy(false);
    }
  }

  return (
    <section className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title">
          <input
            value={state.title}
            onChange={(e) => set("title", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Slug">
          <input
            value={state.slug}
            onChange={(e) => set("slug", e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>
      <Field label="Subtitle">
        <input
          value={state.subtitle ?? ""}
          onChange={(e) => set("subtitle", e.target.value || null)}
          className={inputClass}
        />
      </Field>
      <Field label="Description">
        <textarea
          rows={5}
          value={state.description ?? ""}
          onChange={(e) => set("description", e.target.value || null)}
          className={`${inputClass} resize-y`}
        />
      </Field>
      <Field label="Cover image URL">
        <input
          value={state.cover_image_url ?? ""}
          onChange={(e) => set("cover_image_url", e.target.value || null)}
          placeholder="https://…"
          className={inputClass}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Type">
          <select
            value={state.course_type}
            onChange={(e) => set("course_type", e.target.value)}
            className={inputClass}
          >
            <option value="standard">Standard</option>
            <option value="certification">Certification</option>
          </select>
        </Field>
        <Field label="Pricing">
          <select
            value={state.pricing_model}
            onChange={(e) => set("pricing_model", e.target.value)}
            className={inputClass}
          >
            <option value="free">Free</option>
            <option value="tier_included">Included with tier</option>
            <option value="paid_one_time">Paid (one-time)</option>
            <option value="paid_subscription">Paid (subscription)</option>
          </select>
        </Field>
        <Field label="Price (cents)">
          <input
            type="number"
            value={state.price_cents ?? ""}
            onChange={(e) =>
              set("price_cents", e.target.value ? Number(e.target.value) : null)
            }
            className={inputClass}
          />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Drip">
          <select
            value={state.drip_mode}
            onChange={(e) => set("drip_mode", e.target.value)}
            className={inputClass}
          >
            <option value="open">Open (all at once)</option>
            <option value="completion">Complete to unlock</option>
            <option value="time">Time-based (Phase 5b)</option>
            <option value="hybrid">Hybrid (Phase 5b)</option>
          </select>
        </Field>
        <Field label="Duration (minutes)">
          <input
            type="number"
            value={state.estimated_duration_minutes ?? ""}
            onChange={(e) =>
              set(
                "estimated_duration_minutes",
                e.target.value ? Number(e.target.value) : null,
              )
            }
            className={inputClass}
          />
        </Field>
        <Field label="Status">
          <select
            value={state.status}
            onChange={(e) => set("status", e.target.value)}
            className={inputClass}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </Field>
      </div>
      <Field label="Tags (comma-separated)">
        <input
          value={state.tags.join(", ")}
          onChange={(e) =>
            set(
              "tags",
              e.target.value
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean),
            )
          }
          className={inputClass}
        />
      </Field>

      <div className="flex items-center justify-between gap-3 border-t border-navy/10 pt-5">
        <button
          type="button"
          onClick={remove}
          className="rounded-full border border-[#8a6d00]/30 px-4 py-2 font-sans text-[12px] font-medium text-[#8a6d00] hover:bg-[#fdf6e0]"
        >
          Delete course
        </button>
        <div className="flex items-center gap-3">
          <p className="font-sans text-[12px] text-cyan-deep">{msg}</p>
          <p className="font-sans text-[12px] text-[#8a6d00]">{error}</p>
          <button onClick={save} disabled={busy} className={btnPrimary}>
            {busy ? "…" : "Save"}
          </button>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

function CurriculumTab({
  courseId,
  initialModules,
}: {
  courseId: string;
  initialModules: ModuleInput[];
}) {
  const router = useRouter();
  const [modules, setModules] = useState(initialModules);
  const [busy, setBusy] = useState(false);

  async function addModule() {
    const title = prompt("Module title?");
    if (!title) return;
    setBusy(true);
    try {
      const sort = (modules[modules.length - 1]?.sort_order ?? 100) + 100;
      const res = await fetch(`/api/admin/courses/${courseId}/modules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, sort_order: sort }),
      });
      const data = await res.json();
      if (res.ok) {
        setModules((cur) => [
          ...cur,
          {
            id: data.module.id,
            title: data.module.title,
            description: null,
            sort_order: data.module.sort_order,
            lessons: [],
          },
        ]);
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  async function deleteModuleById(moduleId: string) {
    if (!confirm("Delete this module and all its lessons?")) return;
    const res = await fetch(`/api/admin/courses/${courseId}/modules`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ module_id: moduleId }),
    });
    if (res.ok) {
      setModules((cur) => cur.filter((m) => m.id !== moduleId));
    }
  }

  async function addLesson(moduleId: string) {
    const title = prompt("Lesson title?");
    if (!title) return;
    const typeChoice =
      prompt(
        `Type? One of: ${LESSON_TYPES.map((t) => t.id).join(", ")}`,
        "text",
      ) ?? "text";
    const lessonType = LESSON_TYPES.find((t) => t.id === typeChoice)
      ? (typeChoice as LessonType)
      : "text";
    const mod = modules.find((m) => m.id === moduleId);
    const sort = (mod?.lessons[mod.lessons.length - 1]?.sort_order ?? 100) + 100;
    const res = await fetch(`/api/admin/lessons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        module_id: moduleId,
        title,
        lesson_type: lessonType,
        sort_order: sort,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setModules((cur) =>
        cur.map((m) =>
          m.id === moduleId
            ? {
                ...m,
                lessons: [
                  ...m.lessons,
                  {
                    id: data.lesson.id,
                    title: data.lesson.title,
                    lesson_type: data.lesson.lesson_type,
                    sort_order: data.lesson.sort_order,
                    estimated_duration_minutes:
                      data.lesson.estimated_duration_minutes,
                  },
                ],
              }
            : m,
        ),
      );
    }
  }

  return (
    <section className="space-y-5">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={addModule}
          disabled={busy}
          className="rounded-full border border-navy/20 px-4 py-2 font-sans text-[12px] font-semibold text-navy transition hover:border-cyan-deep hover:text-cyan-deep"
        >
          + Add module
        </button>
      </div>

      {modules.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-navy/15 bg-white p-12 text-center font-sans text-[14px] font-light text-navy/55">
          No modules yet. Add the first one.
        </p>
      ) : (
        <ul className="space-y-4">
          {modules.map((m, mi) => (
            <li key={m.id} className="rounded-2xl border border-navy/12 bg-white p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h3 className="font-serif text-[19px] font-medium text-navy">
                  Module {mi + 1} · {m.title}
                </h3>
                <button
                  type="button"
                  onClick={() => deleteModuleById(m.id)}
                  className="font-sans text-[12px] text-[#8a6d00] hover:underline"
                >
                  Delete module
                </button>
              </div>

              <ul className="mt-3 space-y-2">
                {m.lessons.map((l, li) => (
                  <li
                    key={l.id}
                    className="flex items-center justify-between rounded-xl border border-navy/10 bg-mist/30 px-4 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="font-serif text-[15px] text-navy">
                        {mi + 1}.{li + 1} {l.title}
                      </p>
                      <p className="font-sans text-[10px] uppercase tracking-[0.16em] text-cyan-deep">
                        {l.lesson_type}
                        {l.estimated_duration_minutes
                          ? ` · ${l.estimated_duration_minutes} min`
                          : ""}
                      </p>
                    </div>
                    <Link
                      href={`/admin/courses/${courseId}/lesson/${l.id}`}
                      className="font-sans text-[12px] font-semibold text-cyan-deep hover:underline"
                    >
                      Edit →
                    </Link>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => addLesson(m.id)}
                className="mt-3 font-sans text-[12px] font-semibold text-cyan-deep hover:underline"
              >
                + Add lesson
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
