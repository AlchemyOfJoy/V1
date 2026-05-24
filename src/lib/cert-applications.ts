import { query } from "@/lib/db";

export type CertAppStatus =
  | "applied" // submitted, awaiting payment
  | "paid" // paid, awaiting admin approval
  | "approved" // admin approved, user promoted to coach role + phase_1
  | "rejected";

export interface CertApplication {
  id: string;
  user_id: string;
  status: CertAppStatus;
  story: string | null;
  experience: string | null;
  why_aoj: string | null;
  paid_at: string | Date | null;
  approved_at: string | Date | null;
  approved_by: string | null;
  created_at: string | Date;
  updated_at: string | Date;
}

export async function getMyApplication(
  userId: string,
): Promise<CertApplication | null> {
  const rows = await query<CertApplication>(
    `SELECT id::text AS id, user_id, status, story, experience, why_aoj,
            paid_at, approved_at, approved_by, created_at, updated_at
       FROM cert_applications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
    [userId],
  );
  return rows[0] ?? null;
}

export async function createApplication(
  userId: string,
  payload: { story: string; experience: string; why_aoj: string },
): Promise<CertApplication> {
  const rows = await query<CertApplication>(
    `INSERT INTO cert_applications (user_id, status, story, experience, why_aoj)
     VALUES ($1, 'applied', $2, $3, $4)
     RETURNING id::text AS id, user_id, status, story, experience, why_aoj,
               paid_at, approved_at, approved_by, created_at, updated_at`,
    [userId, payload.story, payload.experience, payload.why_aoj],
  );
  return rows[0];
}

export async function markPaid(applicationId: string): Promise<void> {
  await query(
    `UPDATE cert_applications
        SET status = 'paid', paid_at = now(), updated_at = now()
      WHERE id = $1::bigint AND status = 'applied'`,
    [applicationId],
  );
}

export async function approveApplication(
  applicationId: string,
  adminId: string,
): Promise<{ user_id: string } | null> {
  const rows = await query<{ user_id: string }>(
    `UPDATE cert_applications
        SET status = 'approved', approved_at = now(),
            approved_by = $2, updated_at = now()
      WHERE id = $1::bigint AND status IN ('paid', 'applied')
      RETURNING user_id`,
    [applicationId, adminId],
  );
  return rows[0] ?? null;
}

export async function listPending(): Promise<CertApplication[]> {
  return query<CertApplication>(
    `SELECT id::text AS id, user_id, status, story, experience, why_aoj,
            paid_at, approved_at, approved_by, created_at, updated_at
       FROM cert_applications
       WHERE status IN ('applied', 'paid')
       ORDER BY created_at DESC`,
  );
}
