import { Pool } from "pg";

const CONNECTION =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  "";

const globalForDb = globalThis as unknown as {
  __jqPool?: Pool;
  __jqSchema?: Promise<void>;
};

function pool(): Pool {
  if (!globalForDb.__jqPool) {
    globalForDb.__jqPool = new Pool({
      connectionString: CONNECTION,
      max: 5,
    });
  }
  return globalForDb.__jqPool;
}

/** Create tables on first use — idempotent, runs once per process. */
function ensureSchema(): Promise<void> {
  if (!globalForDb.__jqSchema) {
    globalForDb.__jqSchema = pool()
      .query(
        `
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          name TEXT,
          password_hash TEXT,
          google_id TEXT UNIQUE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE TABLE IF NOT EXISTS sessions (
          token TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          expires_at TIMESTAMPTZ NOT NULL
        );
        CREATE TABLE IF NOT EXISTS assessments (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          score INTEGER NOT NULL,
          answers TEXT NOT NULL,
          note TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS idx_assessments_user
          ON assessments(user_id, created_at);
      `,
      )
      .then(() => undefined);
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
      "DATABASE_URL is not set. Add a Postgres connection string to the environment.",
    );
  }
  await ensureSchema();
  const result = await pool().query(text, params);
  return result.rows as T[];
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
