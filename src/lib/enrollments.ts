import { randomUUID } from "crypto";
import { query } from "@/lib/db";

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string | Date;
  started_at: string | Date | null;
  completed_at: string | Date | null;
  source: string;
}

export interface LessonProgress {
  enrollment_id: string;
  lesson_id: string;
  started_at: string | Date;
  completed_at: string | Date | null;
  notes: string | null;
  reflection_responses: Record<string, string>;
}

const ENROLLMENT_COLS = `id, user_id, course_id, enrolled_at, started_at, completed_at, source`;

export async function getEnrollment(
  userId: string,
  courseId: string,
): Promise<Enrollment | null> {
  const rows = await query<Enrollment>(
    `SELECT ${ENROLLMENT_COLS} FROM course_enrollments
       WHERE user_id = $1 AND course_id = $2`,
    [userId, courseId],
  );
  return rows[0] ?? null;
}

export async function listMyEnrollments(
  userId: string,
): Promise<Enrollment[]> {
  return query<Enrollment>(
    `SELECT ${ENROLLMENT_COLS} FROM course_enrollments
       WHERE user_id = $1 ORDER BY enrolled_at DESC`,
    [userId],
  );
}

export async function enroll(
  userId: string,
  courseId: string,
  source = "self_enroll",
): Promise<Enrollment> {
  const id = `enr_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
  const rows = await query<Enrollment>(
    `INSERT INTO course_enrollments (id, user_id, course_id, source)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, course_id) DO UPDATE SET enrolled_at = course_enrollments.enrolled_at
     RETURNING ${ENROLLMENT_COLS}`,
    [id, userId, courseId, source],
  );
  return rows[0];
}

interface DbProgressRow extends Omit<LessonProgress, "reflection_responses"> {
  reflection_responses: unknown;
}

function normalizeProgress(r: DbProgressRow): LessonProgress {
  return {
    ...r,
    reflection_responses:
      r.reflection_responses && typeof r.reflection_responses === "object"
        ? (r.reflection_responses as Record<string, string>)
        : {},
  };
}

const PROGRESS_COLS = `enrollment_id, lesson_id, started_at, completed_at, notes, reflection_responses`;

export async function listProgress(
  enrollmentId: string,
): Promise<LessonProgress[]> {
  const rows = await query<DbProgressRow>(
    `SELECT ${PROGRESS_COLS} FROM course_lesson_progress
       WHERE enrollment_id = $1`,
    [enrollmentId],
  );
  return rows.map(normalizeProgress);
}

export async function getLessonProgress(
  enrollmentId: string,
  lessonId: string,
): Promise<LessonProgress | null> {
  const rows = await query<DbProgressRow>(
    `SELECT ${PROGRESS_COLS} FROM course_lesson_progress
       WHERE enrollment_id = $1 AND lesson_id = $2`,
    [enrollmentId, lessonId],
  );
  return rows[0] ? normalizeProgress(rows[0]) : null;
}

export async function startLesson(
  enrollmentId: string,
  lessonId: string,
): Promise<void> {
  await query(
    `INSERT INTO course_lesson_progress (enrollment_id, lesson_id)
     VALUES ($1, $2)
     ON CONFLICT (enrollment_id, lesson_id) DO NOTHING`,
    [enrollmentId, lessonId],
  );
  await query(
    `UPDATE course_enrollments
        SET started_at = COALESCE(started_at, now())
      WHERE id = $1`,
    [enrollmentId],
  );
}

export async function saveLessonNotes(
  enrollmentId: string,
  lessonId: string,
  notes: string,
): Promise<void> {
  await query(
    `INSERT INTO course_lesson_progress (enrollment_id, lesson_id, notes)
     VALUES ($1, $2, $3)
     ON CONFLICT (enrollment_id, lesson_id)
       DO UPDATE SET notes = EXCLUDED.notes`,
    [enrollmentId, lessonId, notes],
  );
}

export async function saveLessonReflections(
  enrollmentId: string,
  lessonId: string,
  responses: Record<string, string>,
): Promise<void> {
  await query(
    `INSERT INTO course_lesson_progress (enrollment_id, lesson_id, reflection_responses)
     VALUES ($1, $2, $3::jsonb)
     ON CONFLICT (enrollment_id, lesson_id)
       DO UPDATE SET reflection_responses = EXCLUDED.reflection_responses`,
    [enrollmentId, lessonId, JSON.stringify(responses)],
  );
}

export async function markLessonComplete(
  enrollmentId: string,
  lessonId: string,
): Promise<void> {
  await query(
    `INSERT INTO course_lesson_progress (enrollment_id, lesson_id, completed_at)
     VALUES ($1, $2, now())
     ON CONFLICT (enrollment_id, lesson_id)
       DO UPDATE SET completed_at = COALESCE(course_lesson_progress.completed_at, now())`,
    [enrollmentId, lessonId],
  );
}

/**
 * Compute the simple completion ratio for an enrollment given the
 * course's total lesson count.
 */
export async function completionPercentage(
  enrollmentId: string,
  totalLessons: number,
): Promise<number> {
  if (totalLessons === 0) return 0;
  const rows = await query<{ c: string }>(
    `SELECT COUNT(*)::text AS c FROM course_lesson_progress
       WHERE enrollment_id = $1 AND completed_at IS NOT NULL`,
    [enrollmentId],
  );
  const done = Number(rows[0]?.c ?? 0);
  return Math.min(100, Math.round((done / totalLessons) * 100));
}

/** Issue a certificate + stamp the enrollment as complete. Idempotent. */
export async function maybeIssueCertificate(
  enrollmentId: string,
  totalLessons: number,
): Promise<{ certificate_id: string; verification_code: string } | null> {
  const pct = await completionPercentage(enrollmentId, totalLessons);
  if (pct < 100) return null;
  await query(
    `UPDATE course_enrollments SET completed_at = COALESCE(completed_at, now())
       WHERE id = $1`,
    [enrollmentId],
  );
  const existing = await query<{ id: string; verification_code: string }>(
    `SELECT id, verification_code FROM course_certificates WHERE enrollment_id = $1`,
    [enrollmentId],
  );
  if (existing.length > 0) {
    return {
      certificate_id: existing[0].id,
      verification_code: existing[0].verification_code,
    };
  }
  const certId = `cert_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
  const code = randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase();
  await query(
    `INSERT INTO course_certificates (id, enrollment_id, verification_code)
     VALUES ($1, $2, $3)`,
    [certId, enrollmentId, code],
  );
  return { certificate_id: certId, verification_code: code };
}
