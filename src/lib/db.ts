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
