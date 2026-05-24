import { randomUUID } from "crypto";
import { query } from "@/lib/db";
import type {
  CourseStatus,
  CourseType,
  DripMode,
  LessonType,
  PricingModel,
} from "./courses-types";

export { LESSON_TYPES } from "./courses-types";
export type {
  LessonType,
  CourseStatus,
  CourseType,
  DripMode,
  PricingModel,
} from "./courses-types";

export interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  cover_image_url: string | null;
  course_type: CourseType;
  pricing_model: PricingModel;
  price_cents: number | null;
  drip_mode: DripMode;
  prerequisites: string[];
  estimated_duration_minutes: number | null;
  tags: string[];
  status: CourseStatus;
  instructor_id: string | null;
  created_at: string | Date;
  published_at: string | Date | null;
  updated_at: string | Date;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  sort_order: number;
  created_at: string | Date;
}

export interface CourseLesson {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  sort_order: number;
  lesson_type: LessonType;
  body: string | null;
  video_embed_url: string | null;
  audio_embed_url: string | null;
  transcript: string | null;
  coach_card_mode: string | null;
  cross_link_href: string | null;
  reflection_prompts: string[];
  exercise_config: Record<string, unknown>;
  estimated_duration_minutes: number | null;
  created_at: string | Date;
}

interface DbCourseRow extends Omit<Course, "prerequisites" | "tags"> {
  prerequisites: unknown;
  tags: unknown;
}

function normalizeCourse(row: DbCourseRow): Course {
  return {
    ...row,
    prerequisites: Array.isArray(row.prerequisites)
      ? (row.prerequisites as string[])
      : [],
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
  };
}

const COURSE_COLS = `id, slug, title, subtitle, description, cover_image_url,
  course_type, pricing_model, price_cents, drip_mode, prerequisites,
  estimated_duration_minutes, tags, status, instructor_id, created_at,
  published_at, updated_at`;

const LESSON_COLS = `id, module_id, title, description, sort_order, lesson_type,
  body, video_embed_url, audio_embed_url, transcript, coach_card_mode,
  cross_link_href, reflection_prompts, exercise_config,
  estimated_duration_minutes, created_at`;

interface DbLessonRow extends Omit<CourseLesson, "reflection_prompts" | "exercise_config"> {
  reflection_prompts: unknown;
  exercise_config: unknown;
}

function normalizeLesson(row: DbLessonRow): CourseLesson {
  return {
    ...row,
    reflection_prompts: Array.isArray(row.reflection_prompts)
      ? (row.reflection_prompts as string[])
      : [],
    exercise_config:
      row.exercise_config && typeof row.exercise_config === "object"
        ? (row.exercise_config as Record<string, unknown>)
        : {},
  };
}

/* ---------- courses ---------- */

export async function listCourses(opts: {
  status?: CourseStatus;
  includeDrafts?: boolean;
} = {}): Promise<Course[]> {
  const where: string[] = [];
  const params: unknown[] = [];
  if (opts.status) {
    where.push(`status = $${params.length + 1}`);
    params.push(opts.status);
  } else if (!opts.includeDrafts) {
    where.push(`status = 'published'`);
  }
  const whereClause = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
  const rows = await query<DbCourseRow>(
    `SELECT ${COURSE_COLS} FROM courses ${whereClause}
       ORDER BY published_at DESC NULLS LAST, created_at DESC`,
    params,
  );
  return rows.map(normalizeCourse);
}

export async function getCourseById(id: string): Promise<Course | null> {
  const rows = await query<DbCourseRow>(
    `SELECT ${COURSE_COLS} FROM courses WHERE id = $1`,
    [id],
  );
  return rows[0] ? normalizeCourse(rows[0]) : null;
}

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  const rows = await query<DbCourseRow>(
    `SELECT ${COURSE_COLS} FROM courses WHERE slug = $1`,
    [slug],
  );
  return rows[0] ? normalizeCourse(rows[0]) : null;
}

export async function createCourse(input: {
  slug: string;
  title: string;
  course_type?: CourseType;
  instructor_id?: string | null;
}): Promise<Course> {
  const id = `crs_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
  const rows = await query<DbCourseRow>(
    `INSERT INTO courses (id, slug, title, course_type, instructor_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${COURSE_COLS}`,
    [
      id,
      input.slug,
      input.title,
      input.course_type ?? "standard",
      input.instructor_id ?? null,
    ],
  );
  return normalizeCourse(rows[0]);
}

export async function updateCourse(
  id: string,
  patch: Partial<Course>,
): Promise<Course | null> {
  const sets: string[] = [];
  const params: unknown[] = [id];
  function add(col: string, val: unknown, jsonb = false) {
    sets.push(`${col} = $${params.length + 1}${jsonb ? "::jsonb" : ""}`);
    params.push(val);
  }
  if (typeof patch.slug === "string") add("slug", patch.slug);
  if (typeof patch.title === "string") add("title", patch.title);
  if (patch.subtitle !== undefined) add("subtitle", patch.subtitle);
  if (patch.description !== undefined) add("description", patch.description);
  if (patch.cover_image_url !== undefined)
    add("cover_image_url", patch.cover_image_url);
  if (typeof patch.course_type === "string")
    add("course_type", patch.course_type);
  if (typeof patch.pricing_model === "string")
    add("pricing_model", patch.pricing_model);
  if (patch.price_cents !== undefined) add("price_cents", patch.price_cents);
  if (typeof patch.drip_mode === "string") add("drip_mode", patch.drip_mode);
  if (Array.isArray(patch.prerequisites))
    add("prerequisites", JSON.stringify(patch.prerequisites), true);
  if (patch.estimated_duration_minutes !== undefined)
    add("estimated_duration_minutes", patch.estimated_duration_minutes);
  if (Array.isArray(patch.tags)) add("tags", JSON.stringify(patch.tags), true);
  if (typeof patch.status === "string") {
    add("status", patch.status);
    if (patch.status === "published")
      sets.push(`published_at = COALESCE(published_at, now())`);
  }
  if (sets.length === 0) return getCourseById(id);
  sets.push(`updated_at = now()`);
  const rows = await query<DbCourseRow>(
    `UPDATE courses SET ${sets.join(", ")} WHERE id = $1 RETURNING ${COURSE_COLS}`,
    params,
  );
  return rows[0] ? normalizeCourse(rows[0]) : null;
}

export async function deleteCourse(id: string): Promise<boolean> {
  const rows = await query<{ id: string }>(
    `DELETE FROM courses WHERE id = $1 RETURNING id`,
    [id],
  );
  return rows.length > 0;
}

/* ---------- modules ---------- */

export async function listModules(courseId: string): Promise<CourseModule[]> {
  return query<CourseModule>(
    `SELECT id, course_id, title, description, sort_order, created_at
       FROM course_modules WHERE course_id = $1
       ORDER BY sort_order ASC, created_at ASC`,
    [courseId],
  );
}

export async function createModule(input: {
  course_id: string;
  title: string;
  sort_order?: number;
}): Promise<CourseModule> {
  const id = `mod_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
  const rows = await query<CourseModule>(
    `INSERT INTO course_modules (id, course_id, title, sort_order)
     VALUES ($1, $2, $3, $4)
     RETURNING id, course_id, title, description, sort_order, created_at`,
    [id, input.course_id, input.title, input.sort_order ?? 100],
  );
  return rows[0];
}

export async function updateModule(
  id: string,
  patch: { title?: string; description?: string | null; sort_order?: number },
): Promise<CourseModule | null> {
  const sets: string[] = [];
  const params: unknown[] = [id];
  if (typeof patch.title === "string") {
    sets.push(`title = $${params.length + 1}`);
    params.push(patch.title);
  }
  if (patch.description !== undefined) {
    sets.push(`description = $${params.length + 1}`);
    params.push(patch.description);
  }
  if (typeof patch.sort_order === "number") {
    sets.push(`sort_order = $${params.length + 1}`);
    params.push(patch.sort_order);
  }
  if (sets.length === 0) return null;
  const rows = await query<CourseModule>(
    `UPDATE course_modules SET ${sets.join(", ")} WHERE id = $1
       RETURNING id, course_id, title, description, sort_order, created_at`,
    params,
  );
  return rows[0] ?? null;
}

export async function deleteModule(id: string): Promise<boolean> {
  const rows = await query<{ id: string }>(
    `DELETE FROM course_modules WHERE id = $1 RETURNING id`,
    [id],
  );
  return rows.length > 0;
}

/* ---------- lessons ---------- */

export async function listLessons(moduleId: string): Promise<CourseLesson[]> {
  const rows = await query<DbLessonRow>(
    `SELECT ${LESSON_COLS} FROM course_lessons WHERE module_id = $1
       ORDER BY sort_order ASC, created_at ASC`,
    [moduleId],
  );
  return rows.map(normalizeLesson);
}

export async function getLesson(id: string): Promise<CourseLesson | null> {
  const rows = await query<DbLessonRow>(
    `SELECT ${LESSON_COLS} FROM course_lessons WHERE id = $1`,
    [id],
  );
  return rows[0] ? normalizeLesson(rows[0]) : null;
}

export async function createLesson(input: {
  module_id: string;
  title: string;
  lesson_type: LessonType;
  sort_order?: number;
}): Promise<CourseLesson> {
  const id = `lsn_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
  const rows = await query<DbLessonRow>(
    `INSERT INTO course_lessons (id, module_id, title, lesson_type, sort_order)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${LESSON_COLS}`,
    [id, input.module_id, input.title, input.lesson_type, input.sort_order ?? 100],
  );
  return normalizeLesson(rows[0]);
}

export async function updateLesson(
  id: string,
  patch: Partial<CourseLesson>,
): Promise<CourseLesson | null> {
  const sets: string[] = [];
  const params: unknown[] = [id];
  function add(col: string, val: unknown, jsonb = false) {
    sets.push(`${col} = $${params.length + 1}${jsonb ? "::jsonb" : ""}`);
    params.push(val);
  }
  if (typeof patch.title === "string") add("title", patch.title);
  if (patch.description !== undefined) add("description", patch.description);
  if (typeof patch.sort_order === "number") add("sort_order", patch.sort_order);
  if (typeof patch.lesson_type === "string") add("lesson_type", patch.lesson_type);
  if (patch.body !== undefined) add("body", patch.body);
  if (patch.video_embed_url !== undefined)
    add("video_embed_url", patch.video_embed_url);
  if (patch.audio_embed_url !== undefined)
    add("audio_embed_url", patch.audio_embed_url);
  if (patch.transcript !== undefined) add("transcript", patch.transcript);
  if (patch.coach_card_mode !== undefined)
    add("coach_card_mode", patch.coach_card_mode);
  if (patch.cross_link_href !== undefined)
    add("cross_link_href", patch.cross_link_href);
  if (Array.isArray(patch.reflection_prompts))
    add("reflection_prompts", JSON.stringify(patch.reflection_prompts), true);
  if (patch.exercise_config !== undefined)
    add("exercise_config", JSON.stringify(patch.exercise_config), true);
  if (patch.estimated_duration_minutes !== undefined)
    add("estimated_duration_minutes", patch.estimated_duration_minutes);
  if (sets.length === 0) return getLesson(id);
  const rows = await query<DbLessonRow>(
    `UPDATE course_lessons SET ${sets.join(", ")} WHERE id = $1
       RETURNING ${LESSON_COLS}`,
    params,
  );
  return rows[0] ? normalizeLesson(rows[0]) : null;
}

export async function deleteLesson(id: string): Promise<boolean> {
  const rows = await query<{ id: string }>(
    `DELETE FROM course_lessons WHERE id = $1 RETURNING id`,
    [id],
  );
  return rows.length > 0;
}

/* ---------- composite reads ---------- */

export interface CourseWithCurriculum extends Course {
  modules: (CourseModule & { lessons: CourseLesson[] })[];
}

export async function getCourseWithCurriculum(
  slugOrId: string,
): Promise<CourseWithCurriculum | null> {
  const course =
    (await getCourseBySlug(slugOrId)) ?? (await getCourseById(slugOrId));
  if (!course) return null;
  const modules = await listModules(course.id);
  const lessonRows = await query<DbLessonRow>(
    `SELECT ${LESSON_COLS} FROM course_lessons
       WHERE module_id IN (
         SELECT id FROM course_modules WHERE course_id = $1
       )
       ORDER BY sort_order ASC, created_at ASC`,
    [course.id],
  );
  const lessonsByModule = new Map<string, CourseLesson[]>();
  for (const l of lessonRows.map(normalizeLesson)) {
    const arr = lessonsByModule.get(l.module_id) ?? [];
    arr.push(l);
    lessonsByModule.set(l.module_id, arr);
  }
  return {
    ...course,
    modules: modules.map((m) => ({
      ...m,
      lessons: lessonsByModule.get(m.id) ?? [],
    })),
  };
}

export function totalLessons(course: CourseWithCurriculum): number {
  return course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
}

/** Flatten a course into the ordered list of lesson IDs. */
export function lessonSequence(course: CourseWithCurriculum): string[] {
  const ids: string[] = [];
  for (const m of course.modules) {
    for (const l of m.lessons) ids.push(l.id);
  }
  return ids;
}
