import { Pool as PgPool } from "pg";
import { Pool as NeonPool, neonConfig } from "@neondatabase/serverless";

const CONNECTION =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  "";

const IS_LOCAL = /localhost|127\.0\.0\.1/.test(CONNECTION);

/**
 * Neon Postgres exposes a WebSocket endpoint that lets serverless
 * functions skip the full TCP+TLS handshake on every cold start
 * (~150-200ms savings) and pool connections at the edge. We detect
 * Neon URLs by the hostname pattern and use @neondatabase/serverless
 * when present; otherwise fall back to the standard pg driver (for
 * local Postgres and any non-Neon host).
 */
const IS_NEON = /neon\.(tech|database\.com|build)|\.neon\.|neondb/i.test(
  CONNECTION,
);

// In Node, the Neon driver uses Node's built-in undici fetch — no
// websocket pipelining toggles required beyond defaults.
if (IS_NEON) {
  // Default pipelineConnect is "password"; this minimizes round-trips
  // on first query (saves ~1 RTT per connection setup).
  neonConfig.pipelineConnect = "password";
}

// Pool interface we expose. Both pg.Pool and Neon's Pool implement
// .query() with the same signature, which is all we use.
type SharedPool = {
  query: <T>(text: string, params?: unknown[]) => Promise<{ rows: T[] }>;
};

const globalForDb = globalThis as unknown as {
  __jqPool?: SharedPool;
  __jqSchema?: Promise<void>;
};

function pool(): SharedPool {
  if (!globalForDb.__jqPool) {
    if (IS_NEON) {
      globalForDb.__jqPool = new NeonPool({
        connectionString: CONNECTION,
        max: 10,
        idleTimeoutMillis: 30_000,
        connectionTimeoutMillis: 7_000,
      }) as unknown as SharedPool;
    } else {
      globalForDb.__jqPool = new PgPool({
        connectionString: CONNECTION,
        ssl: IS_LOCAL ? undefined : { rejectUnauthorized: false },
        max: 10,
        idleTimeoutMillis: 30_000,
        connectionTimeoutMillis: 7_000,
      }) as unknown as SharedPool;
    }
  }
  return globalForDb.__jqPool;
}

/**
 * Bump this whenever you add a new statement to SCHEMA below. The fast
 * path checks this against the value stored in the schema_version table;
 * if they match, the 80+ DDL statements are skipped entirely.
 *
 * On a fresh database, the value is missing and migrations run as normal,
 * then the table is seeded with the current version.
 */
const SCHEMA_VERSION = 8;

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

  // --- Favorites: My Joy Library + Letters from Future Self ---
  `CREATE TABLE IF NOT EXISTS quote_favorites (
     id BIGSERIAL PRIMARY KEY,
     user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     quote_id TEXT NOT NULL,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     UNIQUE (user_id, quote_id)
   )`,
  `CREATE INDEX IF NOT EXISTS idx_quote_favorites_user
     ON quote_favorites(user_id, created_at DESC)`,

  // --- Course Platform (Phase 5a foundations) ---
  `CREATE TABLE IF NOT EXISTS courses (
     id TEXT PRIMARY KEY,
     slug TEXT UNIQUE NOT NULL,
     title TEXT NOT NULL,
     subtitle TEXT,
     description TEXT,
     cover_image_url TEXT,
     course_type TEXT NOT NULL DEFAULT 'standard',
     pricing_model TEXT NOT NULL DEFAULT 'free',
     price_cents INT,
     drip_mode TEXT NOT NULL DEFAULT 'open',
     prerequisites JSONB NOT NULL DEFAULT '[]'::jsonb,
     estimated_duration_minutes INT,
     tags JSONB NOT NULL DEFAULT '[]'::jsonb,
     status TEXT NOT NULL DEFAULT 'draft',
     instructor_id TEXT REFERENCES users(id) ON DELETE SET NULL,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     published_at TIMESTAMPTZ,
     updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS idx_courses_status
     ON courses(status, published_at DESC)`,

  `CREATE TABLE IF NOT EXISTS course_modules (
     id TEXT PRIMARY KEY,
     course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
     title TEXT NOT NULL,
     description TEXT,
     sort_order INT NOT NULL DEFAULT 100,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS idx_modules_course
     ON course_modules(course_id, sort_order)`,

  `CREATE TABLE IF NOT EXISTS course_lessons (
     id TEXT PRIMARY KEY,
     module_id TEXT NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
     title TEXT NOT NULL,
     description TEXT,
     sort_order INT NOT NULL DEFAULT 100,
     lesson_type TEXT NOT NULL DEFAULT 'text',
     body TEXT,
     video_embed_url TEXT,
     audio_embed_url TEXT,
     transcript TEXT,
     coach_card_mode TEXT,
     cross_link_href TEXT,
     reflection_prompts JSONB NOT NULL DEFAULT '[]'::jsonb,
     exercise_config JSONB NOT NULL DEFAULT '{}'::jsonb,
     estimated_duration_minutes INT,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS idx_lessons_module
     ON course_lessons(module_id, sort_order)`,

  `CREATE TABLE IF NOT EXISTS course_enrollments (
     id TEXT PRIMARY KEY,
     user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
     enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     started_at TIMESTAMPTZ,
     completed_at TIMESTAMPTZ,
     source TEXT NOT NULL DEFAULT 'self_enroll',
     UNIQUE (user_id, course_id)
   )`,
  `CREATE INDEX IF NOT EXISTS idx_enrollments_user
     ON course_enrollments(user_id, completed_at)`,

  `CREATE TABLE IF NOT EXISTS course_lesson_progress (
     id BIGSERIAL PRIMARY KEY,
     enrollment_id TEXT NOT NULL REFERENCES course_enrollments(id) ON DELETE CASCADE,
     lesson_id TEXT NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
     started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     completed_at TIMESTAMPTZ,
     notes TEXT,
     reflection_responses JSONB NOT NULL DEFAULT '{}'::jsonb,
     UNIQUE (enrollment_id, lesson_id)
   )`,
  `CREATE INDEX IF NOT EXISTS idx_progress_enrollment
     ON course_lesson_progress(enrollment_id, completed_at)`,

  `CREATE TABLE IF NOT EXISTS course_certificates (
     id TEXT PRIMARY KEY,
     enrollment_id TEXT NOT NULL UNIQUE REFERENCES course_enrollments(id) ON DELETE CASCADE,
     verification_code TEXT UNIQUE NOT NULL,
     issued_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,

  // --- Phase 2: coaching commerce (placeholders for Stripe Connect) ---

  // User-facing waitlist for human coaching — since no coaches exist yet
  `CREATE TABLE IF NOT EXISTS coaching_waitlist (
     id BIGSERIAL PRIMARY KEY,
     user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
     email TEXT NOT NULL,
     package_id TEXT,
     notes TEXT,
     status TEXT NOT NULL DEFAULT 'waiting',
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS idx_waitlist_status
     ON coaching_waitlist(status, created_at DESC)`,

  // Aspiring coach applications — paid intake into cert program
  `CREATE TABLE IF NOT EXISTS cert_applications (
     id BIGSERIAL PRIMARY KEY,
     user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     status TEXT NOT NULL DEFAULT 'applied',
     story TEXT,
     experience TEXT,
     why_aoj TEXT,
     paid_at TIMESTAMPTZ,
     approved_at TIMESTAMPTZ,
     approved_by TEXT,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS idx_cert_applications_status
     ON cert_applications(status, created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_cert_applications_user
     ON cert_applications(user_id)`,

  // Coaching subscriptions (user → coach pairing with billing state)
  `CREATE TABLE IF NOT EXISTS coaching_subscriptions (
     id TEXT PRIMARY KEY,
     user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     coach_id TEXT REFERENCES users(id) ON DELETE SET NULL,
     package_id TEXT NOT NULL,
     monthly_cents INT NOT NULL,
     coach_bps INT NOT NULL DEFAULT 3000,
     stripe_subscription_id TEXT,
     stripe_customer_id TEXT,
     status TEXT NOT NULL DEFAULT 'pending',
     started_at TIMESTAMPTZ,
     canceled_at TIMESTAMPTZ,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS idx_coaching_subscriptions_user
     ON coaching_subscriptions(user_id, status)`,
  `CREATE INDEX IF NOT EXISTS idx_coaching_subscriptions_coach
     ON coaching_subscriptions(coach_id, status)`,

  // Per-coach Stripe Connect details (filled in Phase 3 when Stripe is wired)
  `ALTER TABLE coach_profiles ADD COLUMN IF NOT EXISTS revenue_share_coach_bps INT NOT NULL DEFAULT 3000`,
  `ALTER TABLE coach_profiles ADD COLUMN IF NOT EXISTS stripe_account_id TEXT`,
  `ALTER TABLE coach_profiles ADD COLUMN IF NOT EXISTS stripe_onboarded_at TIMESTAMPTZ`,
  // Additive column migrations — safe and idempotent
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS curriculum_started_at TIMESTAMPTZ`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS curriculum_completed_at TIMESTAMPTZ`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS challenge_started_at TIMESTAMPTZ`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS challenge_current_day INT`,
  `ALTER TABLE assessments ADD COLUMN IF NOT EXISTS context TEXT`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS tutorial_flags JSONB NOT NULL DEFAULT '{}'::jsonb`,
  // Challenge Cadence Directive — three user states + completion-based day count
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS challenge_mode TEXT NOT NULL DEFAULT 'challenge'`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS challenge_completed_at TIMESTAMPTZ`,
  // JOS-First Architecture Directive — JOS install lifecycle
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS jos_install_started_at TIMESTAMPTZ`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS jos_install_completed_at TIMESTAMPTZ`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS jos_components_completed JSONB NOT NULL DEFAULT '[]'::jsonb`,
  // Accelerated pacing tracking — Challenge Content Directive §5
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS accelerated_warning_shown BOOLEAN NOT NULL DEFAULT false`,
  // Daily intentions + evening reflections — Synthesis Spec §3
  `CREATE TABLE IF NOT EXISTS daily_intentions (
     id BIGSERIAL PRIMARY KEY,
     user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     for_date DATE NOT NULL,
     prompt TEXT NOT NULL,
     intention TEXT NOT NULL,
     evening_reflection TEXT,
     evening_pulse INT,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     evening_at TIMESTAMPTZ,
     UNIQUE (user_id, for_date)
   )`,
  `CREATE INDEX IF NOT EXISTS idx_daily_intentions_user
     ON daily_intentions(user_id, for_date DESC)`,
  // Forgot-password reset tokens — hashed, single-use, time-bound
  `CREATE TABLE IF NOT EXISTS password_resets (
     id BIGSERIAL PRIMARY KEY,
     user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     token_hash TEXT NOT NULL UNIQUE,
     expires_at TIMESTAMPTZ NOT NULL,
     used_at TIMESTAMPTZ,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS idx_password_resets_user
     ON password_resets(user_id, created_at DESC)`,
  // Practice version history — the Master Prompt §11 commitment that
  // every Practice is "editable forever" with version tracking. One
  // row per snapshot; coalesced server-side so autosave doesn't spam.
  `CREATE TABLE IF NOT EXISTS worksheet_response_versions (
     id BIGSERIAL PRIMARY KEY,
     user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     worksheet_id TEXT NOT NULL,
     data JSONB NOT NULL,
     content_hash TEXT NOT NULL,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS idx_worksheet_versions_lookup
     ON worksheet_response_versions(user_id, worksheet_id, created_at DESC)`,
  // Memory Stones — replayable celebration tiles (Master Prompt §13).
  // Saved every time a Bloom or Ascension celebration fires; displayed
  // as the horizontal scrolling row in My Alchemy → The Memories.
  `CREATE TABLE IF NOT EXISTS memory_stones (
     id BIGSERIAL PRIMARY KEY,
     user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     tier TEXT NOT NULL,
     eyebrow TEXT,
     headline TEXT NOT NULL,
     subline TEXT,
     context JSONB NOT NULL DEFAULT '{}'::jsonb,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS idx_memory_stones_user
     ON memory_stones(user_id, created_at DESC)`,
  // Indexes added for the JOS / Me / Wins hot paths — these tables
  // are queried by (user_id, recency) on every render of those pages.
  `CREATE INDEX IF NOT EXISTS idx_forgiveness_subjects_user
     ON forgiveness_subjects(user_id, completed_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_priority_pillar_snapshots_user
     ON priority_pillar_snapshots(user_id, taken_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_subscripts_user
     ON subscripts(user_id, version DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_sessions_expires
     ON sessions(expires_at)`,
  // --- Notifications: per-user channel prefs + idempotent delivery log ---
  `CREATE TABLE IF NOT EXISTS notification_preferences (
     user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
     push_enabled BOOLEAN NOT NULL DEFAULT false,
     push_subscription JSONB,
     email_enabled BOOLEAN NOT NULL DEFAULT false,
     email_address TEXT,
     sms_enabled BOOLEAN NOT NULL DEFAULT false,
     phone_e164 TEXT,
     morning_time TEXT NOT NULL DEFAULT '07:00',
     evening_time TEXT NOT NULL DEFAULT '21:30',
     timezone TEXT NOT NULL DEFAULT 'America/Los_Angeles',
     subscript_morning BOOLEAN NOT NULL DEFAULT true,
     subscript_evening BOOLEAN NOT NULL DEFAULT true,
     weekly_pillar BOOLEAN NOT NULL DEFAULT true,
     letter_delivered BOOLEAN NOT NULL DEFAULT true,
     gone_dark BOOLEAN NOT NULL DEFAULT true,
     milestone BOOLEAN NOT NULL DEFAULT true,
     unsubscribe_token TEXT,
     updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE TABLE IF NOT EXISTS notification_deliveries (
     id BIGSERIAL PRIMARY KEY,
     user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     kind TEXT NOT NULL,
     send_date DATE NOT NULL,
     channel TEXT NOT NULL,
     sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     status TEXT NOT NULL,
     error TEXT,
     UNIQUE (user_id, kind, send_date, channel)
   )`,
  `CREATE INDEX IF NOT EXISTS idx_notif_deliveries_user
     ON notification_deliveries(user_id, sent_at DESC)`,
];

/** Create tables on first use — idempotent, runs once per process.
 *
 *  Fast path: a single SELECT from schema_version tells us if migrations
 *  are already up to date for this DB. If yes, the 80+ DDL statements
 *  are skipped — turning a cold start from ~80 round-trips to 1.
 *
 *  Slow path: on a fresh DB (or after a schema bump), the loop runs,
 *  then schema_version is upserted with SCHEMA_VERSION so future cold
 *  starts skip.
 *
 *  A failed run is not cached, so the next request retries. */
function ensureSchema(): Promise<void> {
  if (!globalForDb.__jqSchema) {
    globalForDb.__jqSchema = (async () => {
      const p = pool();
      // Fast path — has the schema_version table been created and
      // populated with our target version? If so, skip the loop.
      try {
        const r = await p.query<{ version: number }>(
          `SELECT version FROM schema_version WHERE id = true LIMIT 1`,
        );
        if (r.rows[0]?.version >= SCHEMA_VERSION) return;
        // If the table exists in the legacy multi-row shape, fall
        // through to recreate the sentinel row.
      } catch {
        // Table doesn't exist yet — fall through to migrations.
      }
      // Slow path — run every statement, then stamp the version. The
      // schema_version table is a single-row sentinel so upserts can
      // actually update the recorded version. Drop any prior table
      // (which used PK-on-version and silently failed to update on
      // bumps, forcing migrations to re-run on every cold start) and
      // recreate fresh.
      for (const stmt of SCHEMA) {
        await p.query(stmt);
      }
      await p.query(`DROP TABLE IF EXISTS schema_version`);
      await p.query(
        `CREATE TABLE schema_version (
           id BOOLEAN PRIMARY KEY DEFAULT true CHECK (id = true),
           version INT NOT NULL
         )`,
      );
      await p.query(
        `INSERT INTO schema_version (id, version) VALUES (true, $1)
           ON CONFLICT (id) DO UPDATE SET version = EXCLUDED.version`,
        [SCHEMA_VERSION],
      );
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
