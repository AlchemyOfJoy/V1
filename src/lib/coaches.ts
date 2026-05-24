import { query } from "@/lib/db";

export type CertStatus =
  | "phase_1_client" // be a client first — completing 90-Day Integration
  | "phase_2_study" // studying the methodology
  | "phase_3_practice" // mock + recorded review
  | "phase_4_supervised" // 3-5 supervised clients
  | "phase_5_interview" // final certification interview with Brent
  | "certified"
  | "inactive";

export const CERT_PHASES: { id: CertStatus; label: string; blurb: string }[] = [
  {
    id: "phase_1_client",
    label: "Be a client first",
    blurb:
      "Complete the 90-Day Integration yourself. You can't coach a system you haven't lived.",
  },
  {
    id: "phase_2_study",
    label: "Study the methodology",
    blurb:
      "Deep work through the book, the workbook, every Tool Kit entry, and the framework library.",
  },
  {
    id: "phase_3_practice",
    label: "Practice coaching",
    blurb:
      "Mock sessions with peers + recorded reviews. The voice gets calibrated here.",
  },
  {
    id: "phase_4_supervised",
    label: "Supervised practice",
    blurb:
      "Three to five live clients under supervision. Feedback after every session.",
  },
  {
    id: "phase_5_interview",
    label: "Final interview",
    blurb:
      "One last sit-down with Brent. Certification — or another lap.",
  },
];

export interface CoachProfileRow {
  user_id: string;
  display_name: string | null;
  bio: string | null;
  specialties: string[];
  intro_video_url: string | null;
  time_zone: string | null;
  languages: string[];
  capacity: number;
  cert_status: CertStatus;
  certified_at: string | Date | null;
  accepting_clients: boolean;
  email?: string;
  name?: string | null;
}

interface DbCoachRow {
  user_id: string;
  display_name: string | null;
  bio: string | null;
  specialties: unknown;
  intro_video_url: string | null;
  time_zone: string | null;
  languages: unknown;
  capacity: number;
  cert_status: string;
  certified_at: string | Date | null;
  accepting_clients: boolean;
  email?: string;
  name?: string | null;
}

function normalize(row: DbCoachRow): CoachProfileRow {
  return {
    user_id: row.user_id,
    display_name: row.display_name,
    bio: row.bio,
    specialties: Array.isArray(row.specialties)
      ? (row.specialties as string[])
      : [],
    intro_video_url: row.intro_video_url,
    time_zone: row.time_zone,
    languages: Array.isArray(row.languages) ? (row.languages as string[]) : ["en"],
    capacity: row.capacity,
    cert_status: row.cert_status as CertStatus,
    certified_at: row.certified_at,
    accepting_clients: row.accepting_clients,
    email: row.email,
    name: row.name,
  };
}

export async function getCoachProfile(
  userId: string,
): Promise<CoachProfileRow | null> {
  const rows = await query<DbCoachRow>(
    `SELECT cp.user_id, cp.display_name, cp.bio, cp.specialties,
            cp.intro_video_url, cp.time_zone, cp.languages, cp.capacity,
            cp.cert_status, cp.certified_at, cp.accepting_clients,
            u.email, u.name
       FROM coach_profiles cp
       JOIN users u ON u.id = cp.user_id
      WHERE cp.user_id = $1`,
    [userId],
  );
  return rows[0] ? normalize(rows[0]) : null;
}

export async function ensureCoachProfile(
  userId: string,
): Promise<CoachProfileRow> {
  await query(
    `INSERT INTO coach_profiles (user_id) VALUES ($1)
     ON CONFLICT (user_id) DO NOTHING`,
    [userId],
  );
  const profile = await getCoachProfile(userId);
  return profile!;
}

export async function listClients(
  coachId: string,
): Promise<{ id: string; email: string; name: string | null }[]> {
  return query(
    `SELECT id, email, name FROM users
       WHERE coach_id = $1
       ORDER BY name ASC NULLS LAST, email ASC`,
    [coachId],
  );
}

export async function clientCount(coachId: string): Promise<number> {
  const rows = await query<{ c: string }>(
    `SELECT COUNT(*)::text AS c FROM users WHERE coach_id = $1`,
    [coachId],
  );
  return Number(rows[0]?.c ?? 0);
}

/** Public coach directory — only certified + accepting clients. */
export async function listAvailableCoaches(): Promise<CoachProfileRow[]> {
  const rows = await query<DbCoachRow>(
    `SELECT cp.user_id, cp.display_name, cp.bio, cp.specialties,
            cp.intro_video_url, cp.time_zone, cp.languages, cp.capacity,
            cp.cert_status, cp.certified_at, cp.accepting_clients,
            u.email, u.name
       FROM coach_profiles cp
       JOIN users u ON u.id = cp.user_id
      WHERE cp.cert_status = 'certified' AND cp.accepting_clients = true
      ORDER BY cp.certified_at ASC`,
  );
  return rows.map(normalize);
}

export async function getCertProgress(
  userId: string,
): Promise<Record<string, { status: string; completed_at: string | Date | null }>> {
  const rows = await query<{
    phase: string;
    status: string;
    completed_at: string | Date | null;
  }>(
    `SELECT phase, status, completed_at FROM certification_progress
       WHERE user_id = $1`,
    [userId],
  );
  const out: Record<string, { status: string; completed_at: string | Date | null }> = {};
  for (const r of rows) out[r.phase] = { status: r.status, completed_at: r.completed_at };
  return out;
}
