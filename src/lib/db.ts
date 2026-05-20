import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const DB_PATH =
  process.env.DATABASE_PATH || path.join(process.cwd(), "data", "jq.db");

function initDb(): Database.Database {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      password_hash TEXT,
      google_id TEXT UNIQUE,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS assessments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      score INTEGER NOT NULL,
      answers TEXT NOT NULL,
      note TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_assessments_user ON assessments(user_id, created_at);
  `);
  return db;
}

const globalForDb = globalThis as unknown as {
  __jqDb?: Database.Database;
};

export const db: Database.Database =
  globalForDb.__jqDb ?? (globalForDb.__jqDb = initDb());

export interface UserRow {
  id: string;
  email: string;
  name: string | null;
  password_hash: string | null;
  google_id: string | null;
  created_at: string;
}

export interface AssessmentRow {
  id: string;
  user_id: string;
  score: number;
  answers: string;
  note: string | null;
  created_at: string;
}
