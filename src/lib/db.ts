import { Pool } from "pg";

const CONNECTION =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  "";

const IS_LOCAL = /localhost|127\.0\.0\.1/.test(CONNECTION);

const globalForDb = globalThis as unknown as {
  __jqPool?: Pool;
  __jqSchema?: Promise<void>;
};

function pool(): Pool {
  if (!globalForDb.__jqPool) {
    globalForDb.__jqPool = new Pool({
      connectionString: CONNECTION,
      // Hosted Postgres (Neon, etc.) requires SSL; local Postgres does not.
      ssl: IS_LOCAL ? undefined : { rejectUnauthorized: false },
      max: 3,
    });
  }
  return globalForDb.__jqPool;
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (
     id TEXT PRIMARY KEY,
     email TEXT UNIQUE NOT NULL,
     name TEXT,
     password_hash TEXT,
     google_id TEXT UNIQUE,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE TABLE IF NOT EXISTS sessions (
     token TEXT PRIMARY KEY,
     user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     expires_at TIMESTAMPTZ NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS assessments (
     id TEXT PRIMARY KEY,
     user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     score INTEGER NOT NULL,
     answers TEXT NOT NULL,
     note TEXT,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS idx_assessments_user
     ON assessments(user_id, created_at)`,
  `CREATE TABLE IF NOT EXISTS rate_limits (
     id BIGSERIAL PRIMARY KEY,
     bucket TEXT NOT NULL,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS idx_rate_limits_bucket
     ON rate_limits(bucket, created_at)`,

  // --- Curriculum tables (Alchemy of Joy) ---
  `CREATE TABLE IF NOT EXISTS worksheet_responses (
     id BIGSERIAL PRIMARY KEY,
     user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     worksheet_id TEXT NOT NULL,
     data JSONB NOT NULL DEFAULT '{}'::jsonb,
     completed_at TIMESTAMPTZ,
     updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     UNIQUE (user_id, worksheet_id)
   )`,
  `CREATE INDEX IF NOT EXISTS idx_worksheet_responses_user
     ON worksheet_responses(user_id, worksheet_id)`,
  `CREATE TABLE IF NOT EXISTS module_progress (
     id BIGSERIAL PRIMARY KEY,
     user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     module_id TEXT NOT NULL,
     section_id TEXT,
     status TEXT NOT NULL DEFAULT 'not_started',
     started_at TIMESTAMPTZ,
     completed_at TIMESTAMPTZ,
     UNIQUE (user_id, module_id, section_id)
   )`,
  `CREATE TABLE IF NOT EXISTS list_of_joy_items (
     id BIGSERIAL PRIMARY KEY,
     user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     content TEXT NOT NULL,
     priority_pillar TEXT,
     sub_pillar TEXT,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS idx_list_of_joy_user
     ON list_of_joy_items(user_id, created_at)`,
  `CREATE TABLE IF NOT EXISTS journal_entries (
     id BIGSERIAL PRIMARY KEY,
     user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     worksheet_id TEXT,
     title TEXT,
     body TEXT NOT NULL,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE TABLE IF NOT EXISTS forgiveness_subjects (
     id BIGSERIAL PRIMARY KEY,
     user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     subject_name TEXT NOT NULL,
     victim_rant TEXT,
     empath_rave TEXT,
     universal_meaning TEXT,
     forgiveness_statement TEXT,
     completed_at TIMESTAMPTZ,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE TABLE IF NOT EXISTS priority_pillar_snapshots (
     id BIGSERIAL PRIMARY KEY,
     user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     taken_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     love_self INT, love_romantic INT,
     faith_self INT, faith_universe INT,
     health_mind INT, health_body INT,
     family_blood INT, family_chosen INT,
     career_money INT, career_giving_back INT,
     community_personal INT, community_professional INT
   )`,
  `CREATE TABLE IF NOT EXISTS subscripts (
     id BIGSERIAL PRIMARY KEY,
     user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     target_date DATE,
     manifestations JSONB NOT NULL DEFAULT '[]'::jsonb,
     affirmations JSONB NOT NULL DEFAULT '[]'::jsonb,
     emotion_anchor TEXT,
     version INT NOT NULL DEFAULT 1,
     is_active BOOLEAN NOT NULL DEFAULT true,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE TABLE IF NOT EXISTS challenge_checkins (
     id BIGSERIAL PRIMARY KEY,
     user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     day_number INT NOT NULL,
     checked_in_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     subscript_morning_done BOOLEAN NOT NULL DEFAULT false,
     subscript_evening_done BOOLEAN NOT NULL DEFAULT false,
     weekly_focus_action TEXT,
     reflection TEXT,
     mood_rating INT,
     UNIQUE (user_id, day_number)
   )`,
  // --- Coach / AI companion ---
  `CREATE TABLE IF NOT EXISTS chat_conversations (
     id TEXT PRIMARY KEY,
     user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     title TEXT,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     last_message_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS idx_chat_conversations_user
     ON chat_conversations(user_id, last_message_at DESC)`,
  `CREATE TABLE IF NOT EXISTS chat_messages (
     id BIGSERIAL PRIMARY KEY,
     conversation_id TEXT NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
     role TEXT NOT NULL,
     content TEXT NOT NULL,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS idx_chat_messages_conv
     ON chat_messages(conversation_id, id)`,
  `CREATE TABLE IF NOT EXISTS coach_content (
     id TEXT PRIMARY KEY,
     kind TEXT NOT NULL,
     title TEXT NOT NULL,
     body TEXT NOT NULL,
     source TEXT,
     tags JSONB NOT NULL DEFAULT '[]'::jsonb,
     is_active BOOLEAN NOT NULL DEFAULT true,
     sort_order INT NOT NULL DEFAULT 100,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS idx_coach_content_kind
     ON coach_content(kind, is_active, sort_order)`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false`,
  // --- ITT Framework additions (v7 spec) ---
  `CREATE TABLE IF NOT EXISTS joy_pulse (
     id BIGSERIAL PRIMARY KEY,
     user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     score INT NOT NULL,
     note TEXT,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS idx_joy_pulse_user
     ON joy_pulse(user_id, created_at DESC)`,
  `CREATE TABLE IF NOT EXISTS itt_loops (
     id BIGSERIAL PRIMARY KEY,
     user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     for_date DATE NOT NULL,
     intention TEXT,
     thought TEXT,
     action TEXT,
     action_status TEXT,
     evening_notes TEXT,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     UNIQUE (user_id, for_date)
   )`,
  `CREATE TABLE IF NOT EXISTS badges_earned (
     id BIGSERIAL PRIMARY KEY,
     user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     badge_id TEXT NOT NULL,
     pillar TEXT NOT NULL,
     context TEXT,
     earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     UNIQUE (user_id, badge_id)
   )`,
  `CREATE INDEX IF NOT EXISTS idx_badges_user
     ON badges_earned(user_id, earned_at DESC)`,
  `CREATE TABLE IF NOT EXISTS letters_to_self (
     id BIGSERIAL PRIMARY KEY,
     user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     body TEXT NOT NULL,
     send_at TIMESTAMPTZ NOT NULL,
     sent_at TIMESTAMPTZ,
     opened_at TIMESTAMPTZ,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS idx_letters_user
     ON letters_to_self(user_id, send_at)`,
  `CREATE TABLE IF NOT EXISTS journey_progress (
     id BIGSERIAL PRIMARY KEY,
     user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     section_id TEXT NOT NULL,
     status TEXT NOT NULL,
     completed_at TIMESTAMPTZ,
     UNIQUE (user_id, section_id)
   )`,
  // --- Coach Management System (Phase 1: foundations) ---
  // role: 'user' (default) | 'coach' | 'admin'
  // coach_id NULL = BrentBot (the AI default coach); otherwise points to
  //   a users.id where role = 'coach' and certification is complete.
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS coach_id TEXT REFERENCES users(id) ON DELETE SET NULL`,
  `CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`,
  `CREATE INDEX IF NOT EXISTS idx_users_coach_id ON users(coach_id)`,

  // Coach profile — only present when users.role = 'coach'
  `CREATE TABLE IF NOT EXISTS coach_profiles (
     user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
     display_name TEXT,
     bio TEXT,
     specialties JSONB NOT NULL DEFAULT '[]'::jsonb,
     intro_video_url TEXT,
     time_zone TEXT,
     languages JSONB NOT NULL DEFAULT '["en"]'::jsonb,
     capacity INT NOT NULL DEFAULT 12,
     cert_status TEXT NOT NULL DEFAULT 'phase_1_client',
     certified_at TIMESTAMPTZ,
     accepting_clients BOOLEAN NOT NULL DEFAULT false,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,

  // Per-item privacy grants — explicit consent to share with the
  // assigned coach. Default: nothing is shared. Revocable per item.
  `CREATE TABLE IF NOT EXISTS shared_items (
     id BIGSERIAL PRIMARY KEY,
     user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     coach_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     resource_type TEXT NOT NULL,
     resource_id TEXT NOT NULL,
     shared_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     revoked_at TIMESTAMPTZ,
     UNIQUE (user_id, coach_id, resource_type, resource_id)
   )`,
  `CREATE INDEX IF NOT EXISTS idx_shared_items_coach
     ON shared_items(coach_id, revoked_at)`,
  `CREATE INDEX IF NOT EXISTS idx_shared_items_user
     ON shared_items(user_id, revoked_at)`,

  // Coach-private notes about a client (never visible to the client)
  `CREATE TABLE IF NOT EXISTS coach_notes (
     id BIGSERIAL PRIMARY KEY,
     coach_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     client_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     body TEXT NOT NULL,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS idx_coach_notes_pair
     ON coach_notes(coach_id, client_id, created_at DESC)`,

  // Coaching session ratings — client-facing trust, coach-facing dev
  `CREATE TABLE IF NOT EXISTS coach_session_ratings (
     id BIGSERIAL PRIMARY KEY,
     user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     coach_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     session_kind TEXT NOT NULL,
     stars INT,
     chips JSONB NOT NULL DEFAULT '[]'::jsonb,
     comment TEXT,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS idx_ratings_coach
     ON coach_session_ratings(coach_id, created_at DESC)`,

  // Certification progress per coach — 5 phases per the spec
  `CREATE TABLE IF NOT EXISTS certification_progress (
     user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     phase TEXT NOT NULL,
     status TEXT NOT NULL DEFAULT 'pending',
     started_at TIMESTAMPTZ,
     completed_at TIMESTAMPTZ,
     notes TEXT,
     PRIMARY KEY (user_id, phase)
   )`,

  // Coach-pushed assignments to clients (custom + bounded by methodology)
  `CREATE TABLE IF NOT EXISTS coach_assignments (
     id BIGSERIAL PRIMARY KEY,
     coach_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     client_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     kind TEXT NOT NULL,
     title TEXT NOT NULL,
     body TEXT,
     resource_ref TEXT,
     due_at TIMESTAMPTZ,
     completed_at TIMESTAMPTZ,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS idx_assignments_client
     ON coach_assignments(client_id, completed_at, due_at)`,
  // Additive column migrations — safe and idempotent
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS curriculum_started_at TIMESTAMPTZ`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS curriculum_completed_at TIMESTAMPTZ`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS challenge_started_at TIMESTAMPTZ`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS challenge_current_day INT`,
  `ALTER TABLE assessments ADD COLUMN IF NOT EXISTS context TEXT`,
];

/** Create tables on first use — idempotent, runs once per process.
 *  Each statement runs separately so it works through any connection pooler.
 *  A failed run is not cached, so the next request retries. */
function ensureSchema(): Promise<void> {
  if (!globalForDb.__jqSchema) {
    globalForDb.__jqSchema = (async () => {
      for (const stmt of SCHEMA) {
        await pool().query(stmt);
      }
    })().catch((err) => {
      globalForDb.__jqSchema = undefined;
      throw err;
    });
  }
  return globalForDb.__jqSchema;
}

/** Run a parameterised query, returning the result rows. */
export async function query<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  if (!CONNECTION) {
    throw new Error(
      "No database connection string found. Set DATABASE_URL (or POSTGRES_URL) in the environment.",
    );
  }
  await ensureSchema();
  try {
    const result = await pool().query(text, params);
    return result.rows as T[];
  } catch (err) {
    console.error(
      "[db] query failed:",
      (err as Error).message,
      "::",
      text.replace(/\s+/g, " ").trim().slice(0, 80),
    );
    throw err;
  }
}

export interface UserRow {
  id: string;
  email: string;
  name: string | null;
  password_hash: string | null;
  google_id: string | null;
  created_at: string | Date;
}

export interface AssessmentRow {
  id: string;
  user_id: string;
  score: number;
  answers: string;
  note: string | null;
  created_at: string | Date;
}
