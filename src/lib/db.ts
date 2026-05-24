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
