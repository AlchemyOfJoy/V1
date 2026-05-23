# INTEGRATION_PLAN.md

The Alchemy of Joy™ Curriculum app, integrated into the existing JQ Quiz site
([repo: AlchemyOfJoy/V1](https://github.com/AlchemyOfJoy/V1)). This document
answers the integration questions in `aoj_curriculum_spec.md` §1 and proposes
the Phase 1 scope.

---

## 1. Existing JQ Quiz Stack — Audit

| Question | Answer |
|---|---|
| Framework | **Next.js 16 (App Router)** + TypeScript + React 19. |
| Auth | **Custom**, in-house. `bcryptjs` password hashing + httpOnly cookie sessions, plus optional Google OAuth (`src/lib/auth.ts`). |
| Database | **PostgreSQL** via `pg`. Production: Vercel + Neon. Local dev: any Postgres. Async data layer with lazy pool + idempotent `ensureSchema()` (`src/lib/db.ts`). |
| Styling | **Tailwind CSS v4** (no shadcn/ui). Brand tokens in `styles/global.css`, shared class strings in `src/lib/ui.ts`. Fonts: **EB Garamond** (headings) + **Raleway** (body) via `next/font/google`. |
| `User` model | `users (id text PK, email text unique NOT NULL, name text, password_hash text, google_id text unique, created_at timestamptz)`. Sessions in `sessions(token, user_id, expires_at)`. |
| JQ score location | `assessments` table. Fields: `id, user_id, score int (10-50), answers text (JSON array of 10 ints), note text, created_at timestamptz`. Multiple rows per user — full history already supported. |
| Existing routes | `/`, `/login`, `/signup`, `/assessment`, `/dashboard`, `/api/auth/*`, `/api/assessments`. **Curriculum mounts under `/curriculum/*`** — sibling to `/dashboard`. |

---

## 2. Brand alignment

The spec describes a cream / ochre / charcoal workbook palette as a *fallback for sites without a brand*. This site already implements the **Brent Freeman Brand Identity & Style Guide (May 2026)**: Pure White, Midnight Navy, Vibrant Cyan, Alchemy Gold, EB Garamond + Raleway, the BF monogram. **The curriculum will follow the existing brand exactly — not cream / ochre.** The workbook **voice** still applies; only the *visual palette* differs from the spec's fallback.

---

## 3. JQ integration — no rebuild

The existing `/assessment` page, scoring, rubric, and history are re-used as-is. The curriculum will:

- Pull the most recent `assessments` row for the "current JQ" tile on `/curriculum`.
- Add a `context` column to `assessments` so future assessments can be tagged (`baseline`, `month_1`, `month_2`, `month_3`, `final`, `ad_hoc`). Default for legacy rows: `ad_hoc`.
- Onboarding's baseline step deep-links to `/assessment?context=baseline`.
- A `/curriculum/jq-history` view (line chart over time, tier-shift annotations) — Phase 2 polish.

---

## 4. Database additions — additive, no destructive changes

All new tables added under the existing `ensureSchema()`, all using `IF NOT EXISTS`. Columns added via `ADD COLUMN IF NOT EXISTS`. Safe and idempotent.

- `worksheet_responses (user_id, worksheet_id text, data jsonb, completed_at, updated_at, UNIQUE(user_id, worksheet_id))` — single source of truth for every worksheet.
- `module_progress (user_id, module_id, section_id?, status, started_at, completed_at, UNIQUE(user_id, module_id, section_id))`
- `list_of_joy_items (user_id, content, priority_pillar?, sub_pillar?, created_at)`
- `journal_entries (user_id, worksheet_id?, title, body, created_at)`
- `forgiveness_subjects (user_id, subject_name, victim_rant, empath_rave, universal_meaning, forgiveness_statement, completed_at, created_at)`
- `priority_pillar_snapshots (user_id, taken_at, 12 int sub-pillar scores)`
- `subscripts (user_id, target_date, manifestations jsonb, affirmations jsonb, emotion_anchor, version, is_active, created_at)`
- `challenge_checkins (user_id, day_number int, checked_in_at, subscript_morning_done, subscript_evening_done, weekly_focus_action, reflection, mood_rating, UNIQUE(user_id, day_number))`
- Add to `users`: `curriculum_started_at`, `curriculum_completed_at`, `challenge_started_at`, `challenge_current_day`.
- Add to `assessments`: `context text`.

---

## 5. Row-Level Security

Postgres RLS is *recommended* by the spec. The existing app enforces `user_id` ownership at the **query layer** — every query is scoped by the session's `user_id`. Phase 1 keeps this pattern (consistent with existing code). Adding Postgres-level RLS policies is a recommended Phase 6 hardening; it would be defence-in-depth on top of the existing application enforcement, not a replacement.

---

## 6. Dependencies — Phase 1

**Zero new dependencies** for Phase 1.

- Workbook content lives in `src/content/workbook/*.tsx` as typed JSX modules — no markdown library needed.
- Animations re-use existing CSS keyframes (`animate-fade-in`, `animate-breathe`).
- PDF export, email notifications, voice notes, framer-motion, shadcn/ui — all later-phase, not Phase 1.

---

## 7. Proposed Phase 1 scope

A *navigable, real* prototype that you can click through end-to-end. Concretely:

**Database**
- All new tables + the `assessments.context` column. Additive, safe.

**Pages**
- **`/curriculum`** — dashboard: welcome by name, current JQ tile (links to retake), workbook-style numbered map of the 4 Modules + 90-Day Challenge, "Continue where you left off" CTA, rotating pull-quote, recent journal entries.
- **`/curriculum/onboarding`** — 5-screen first-visit tutorial. Final step deep-links to `/assessment?context=baseline`.
- **`/curriculum/module/01-science-of-joy`** — full Module 1 worksheet: read sections (Brain Waves, Joy Chemicals, RAS, ITT framework) + reflection field with autosave.
- **`/curriculum/module/02-joyful-operating-system/core-narrative`** — one fully-built representative Module 2 worksheet, demonstrating the autosave + side-by-side reframe pattern.
- **`/curriculum/toolkit`** + **`/curriculum/toolkit/[slug]`** — the 20-tool reference library, verbatim text from spec §11.
- **Stub pages** for everything else (Module 3, Module 4 sub-tools, 90-Day Challenge, Journal, Export, Settings) — render the IA, mark "In development — coming next."

**Cross-cutting**
- A reusable **`<WorksheetShell>`** primitive — handles the contextual help (collapsible "What this is / How to do it / Where to read more in the book"), autosave wiring, and the affirming completion micro-moment. Every worksheet now and later uses it — single place to evolve the pattern.
- A reusable **`<ContextualHelp>`** card — the spec's three-section explainer, available on every section.
- Server-side `/api/curriculum/worksheets/[worksheet_id]` (GET + PUT) and `/api/curriculum/list-of-joy` endpoints for autosave.

**Explicitly NOT in Phase 1** (later phases per the spec):
- Forgiveness ritual (Phase 3)
- Module 4's 10 sub-tools (Phase 4)
- 90-Day Challenge daily tracker (Phase 5)
- PDF export, email notifications, voice notes, opt-in reminders (Phase 6)

---

## 8. Open questions

Quick decisions that change implementation. I'll proceed once I have your answers (or your "use your judgement" on each):

1. **Phase 1 scope OK?** Anything you want bumped in or out?
2. **Workbook content** — I'll scaffold each content file with a clear placeholder and a "paste verbatim from page N" marker. Will you paste in the verbatim workbook text later, or want me to write workbook-voice approximations now for the Phase 1 demo?
3. **`/dashboard`** (existing JQ history) — keep independent and link to it from `/curriculum`, or move it inside `/curriculum/jq-history`? **My recommendation: keep `/dashboard` as-is** and link from `/curriculum` — less destructive, both routes keep working.
4. **Gating** — should `/curriculum/*` require a baseline JQ before unlocking, or stay browsable for someone who wants to peek? **My recommendation: browsable**, with a gentle "Take your baseline JQ first" banner on the dashboard until they have one. Forces no friction; nudges, not blocks.
5. **Onboarding visibility** — does someone who never finished onboarding get pushed back into it on every visit, or only once? **My recommendation: only once** (track via `users.curriculum_started_at`); they can replay it from Settings.

---

*Confirm the Phase 1 scope and answer (or "your call" on) the 5 questions above and I'll start building.*
