# Claude Code Prompt — Build the Alchemy of Joy™ Curriculum Web App

> **Paste everything below into Claude Code as a single prompt.** Drop this file at the root of the existing JQ Quiz repo before you start so Claude Code can read it as `/aoj_curriculum_spec.md`.

---

## 0. Mission

Build a production-ready, modular web app that turns **The Alchemy of Joy™ Curriculum Workbook (2026)** by Brent J. Freeman into an interactive guided experience. It must integrate cleanly into the **existing JQ Quiz site** as a logged-in user's "Curriculum" area, with the JQ score acting as the on-ramp and the recurring measurement tool throughout the 90-Day Challenge.

The app teaches, captures responses, persists everything per-user, and gently guides users through 4 Modules → Toolkit → 90-Day Challenge. Every worksheet in the printed workbook becomes a digital experience with autosave, progress tracking, and the ability to revisit/edit.

This is a **transformation product**, not a quiz. The interaction model is journal-meets-coach-meets-progress-tracker. Pacing matters. Don't overwhelm. One step at a time.

---

## 1. Integration Context — Read This First

Before writing any code, **read the existing JQ Quiz codebase** and answer these questions in `INTEGRATION_PLAN.md` at the repo root:

1. What framework is the JQ Quiz built in? (Next.js, Vite/React, Remix, etc.)
2. What's the existing auth system? (Clerk, Auth0, Supabase Auth, NextAuth, custom?)
3. What database is in use? (Postgres, Supabase, Firebase, MongoDB, none yet?)
4. What's the existing styling system? (Tailwind, CSS Modules, styled-components, shadcn/ui?)
5. Is there an existing `User` model? What fields does it have?
6. Where is the JQ score currently stored? What's its shape (single number, array of historical scores, full answer set)?
7. What routes already exist? Where should `/curriculum` live in the routing hierarchy?

**Match the existing stack.** Do not introduce new frameworks or styling systems unless absolutely necessary. The curriculum app must feel like a native extension of the JQ Quiz site, not a bolt-on.

If the existing site is missing infrastructure the curriculum requires (e.g. no database yet, no auth), propose the **minimum viable additions** in `INTEGRATION_PLAN.md` and wait for confirmation before installing anything heavy.

---

## 2. Brand & Voice Guardrails (non-negotiable)

This is **Brent J. Freeman's Alchemy of Joy™** brand. Every word, color, and animation must honor it.

**Voice (for all on-screen copy, instructional text, microcopy, and AI-generated reflections):**
- Warm, intimate, poetic. Short phrases. Ellipses as breath cues.
- No clinical, corporate, or "wellness-app-generic" language.
- Use presupposition language ("As you notice…", "When you feel the shift…").
- Scripture-style closes on milestone moments ("Because you just did." / "Your soul already knows.").
- Vulnerability without self-pity. Sensory anchors before abstraction.

**Visual identity (match the printed workbook):**
- Background: warm cream / off-white (workbook page color, roughly `#F5EFE4` — pull exact from existing site CSS if defined).
- Primary text: deep charcoal/near-black.
- Accent: muted gold / earthy ochre for highlights, never neon.
- Module numbers in large serif italic display type (the workbook uses an italic serif for `Module 1`, `Module 2`, etc.).
- Body in a humanist serif or warm sans (match existing JQ Quiz site).
- Generous whitespace. Workbook-grade typography. No emoji-heavy UI. No gamification badges, streaks, or leaderboard tropes.

**Trademarks to preserve in copy (always with the ™/® where shown):**
- The Alchemy of Joy™
- Joyful Operating System® (JOS)
- Joy Blueprint®
- ITT Framework (Invest In Joy / Train Your Brain / Take Bold Action)
- Reframe Ritual™
- The List of Joy™
- Releasing it All™
- D.A.D. (Desire → Action → Dopamine)
- JOMO
- Joy Quotient (JQ)

Copyright footer wherever it appears: `© THE JOYRIDE, LLC 2026 — ALL RIGHTS RESERVED`.

---

## 3. Information Architecture

```
/curriculum                                  ← Curriculum dashboard (home)
  /onboarding                                ← First-time intro & JQ baseline
  /module/01-science-of-joy                  ← Module 1
  /module/02-joyful-operating-system         ← Module 2 (sub-sections below)
    /core-narrative
    /self-eulogy
    /list-of-joy
    /priority-pillars
    /subscript                               ← Subconscious Script builder
  /module/03-forgiveness                     ← Module 3
    /victim-rant
    /empath-rave
    /universal-meaning
    /forgiveness-release
  /module/04-bold-action                     ← Module 4 (10 sub-tools below)
    /triggers-emotional-alchemy
    /reset-breath
    /habit-renaissance                       ← D.A.D. Framework exercise
    /dopamine-detox
    /sleep
    /law-of-zero-gravity
    /play
    /giving
    /routine-redesign
    /sixty-second-shift
  /jq-assessment                             ← Reusable JQ Assessment (integrates with existing quiz)
  /toolkit                                   ← AOJ Tool Kit reference library (20 tools)
    /[tool-slug]                             ← Individual tool reference page
  /90-day-challenge                          ← Challenge tracker
    /day/[1-90]                              ← Per-day check-in
  /journal                                   ← Master journal — all entries across modules, sortable
  /export                                    ← Export all responses as PDF / printable workbook
```

### Curriculum Dashboard (`/curriculum`)
The home view. Shows:
- A warm welcome by name ("Welcome back, [first name].").
- Current JQ score with one-line context ("You're at 32 — High JQ.") + button to retake.
- Visual progress map of the 4 Modules + 90-Day Challenge (workbook-style numbered circles, not a generic progress bar).
- "Continue where you left off" CTA pointing to the next incomplete worksheet.
- Recent journal entries (last 3, collapsible).
- Quote of the day rotating from the workbook's pull-quotes (Desmond Tutu, Rumi, Lewis B. Smedes — see §10).

---

## 4. Tech Stack Defaults (override to match existing site)

**If the JQ Quiz site has NO backend yet**, default to this stack:
- **Frontend**: Next.js 14+ (App Router) + TypeScript + Tailwind CSS + shadcn/ui.
- **Database**: Supabase (Postgres + Auth + Storage). Use Row-Level Security.
- **Forms / autosave**: React Hook Form + Zod validation + debounced autosave (every 1.5s of idle).
- **State**: Server components where possible. Zustand only for cross-component client state (e.g. unsaved-changes indicator).
- **Animations**: Framer Motion — slow, intentional fades. No bouncy spring animations.
- **PDF export**: `@react-pdf/renderer` for the workbook export.
- **Email/notifications** (90-day challenge nudges): Resend + React Email. Opt-in only.

**If the JQ Quiz site already has a stack**, USE IT. Don't fork.

---

## 5. Data Model

Design for a single source of truth: every worksheet response is a row keyed by `user_id` + `worksheet_id`. This makes export, edit history, and progress tracking trivial.

```sql
-- Users (extend existing JQ Quiz user table; don't duplicate)
-- Add these columns to existing users table if missing:
--   curriculum_started_at timestamptz
--   curriculum_completed_at timestamptz
--   challenge_started_at timestamptz
--   challenge_current_day int

-- JQ Score history (one row per assessment taken)
jq_assessments (
  id uuid pk,
  user_id uuid fk -> users,
  taken_at timestamptz default now(),
  q1_score int, q2_score int, ... q10_score int,  -- raw answers
  total_score int,
  tier text,  -- 'low' | 'moderate' | 'high' | 'very_high'
  context text  -- 'baseline' | 'month_1' | 'month_2' | 'month_3' | 'final' | 'ad_hoc'
)

-- Worksheet responses (one row per worksheet per user, upserted on save)
worksheet_responses (
  id uuid pk,
  user_id uuid fk,
  worksheet_id text,  -- e.g. 'core_narrative', 'self_eulogy', 'priority_pillars'
  data jsonb,          -- flexible per-worksheet shape (see §6 for shapes)
  completed_at timestamptz,
  updated_at timestamptz default now(),
  unique(user_id, worksheet_id)
)

-- Module / sub-section progress
module_progress (
  id uuid pk,
  user_id uuid fk,
  module_id text,        -- '01_science', '02_jos', '03_forgiveness', '04_bold_action'
  section_id text,       -- nullable for module-level; populated for sub-sections
  status text,           -- 'not_started' | 'in_progress' | 'completed'
  started_at timestamptz,
  completed_at timestamptz,
  unique(user_id, module_id, section_id)
)

-- List of Joy items (one row per item — supports adding to a living list over time)
list_of_joy_items (
  id uuid pk,
  user_id uuid fk,
  content text,
  priority_pillar text,  -- nullable; user can categorize later: 'love'|'faith'|'health'|'family'|'career'|'community'
  sub_pillar text,       -- nullable; e.g. 'self', 'romantic'
  created_at timestamptz default now()
)

-- Priority Pillar inventory snapshots (so users can re-rate over time)
priority_pillar_snapshots (
  id uuid pk,
  user_id uuid fk,
  taken_at timestamptz default now(),
  love_self int, love_romantic int,
  faith_self int, faith_universe int,
  health_mind int, health_body int,
  family_blood int, family_chosen int,
  career_money int, career_giving_back int,
  community_personal int, community_professional int
)

-- SubScripts (versioned — user evolves these over time)
subscripts (
  id uuid pk,
  user_id uuid fk,
  target_date date,            -- "By [month] [day], [year] I am:"
  manifestations jsonb,        -- array of strings, up to 20
  affirmations jsonb,          -- array of strings, up to 10
  emotion_anchor text,         -- the Joy Spark memory they use to feel-the-feeling
  version int,
  created_at timestamptz default now(),
  is_active boolean default true
)

-- Forgiveness Hit List (people the user is processing)
forgiveness_subjects (
  id uuid pk,
  user_id uuid fk,
  subject_name text,           -- can be 'someone close to me', 'self', etc. — full privacy
  victim_rant text,
  empath_rave text,
  universal_meaning text,
  forgiveness_statement text,
  completed_at timestamptz,
  created_at timestamptz default now()
)

-- 90-Day Challenge daily check-ins
challenge_checkins (
  id uuid pk,
  user_id uuid fk,
  day_number int,              -- 1-90
  checked_in_at timestamptz default now(),
  subscript_morning_done boolean,
  subscript_evening_done boolean,
  weekly_focus_action text,    -- the specific Week N action they did today
  reflection text,             -- free text
  mood_rating int,             -- 1-10, optional
  unique(user_id, day_number)
)

-- Generic journal entries (Module 4 reflections, free-form journal page)
journal_entries (
  id uuid pk,
  user_id uuid fk,
  worksheet_id text,           -- nullable — tagged when written from a specific exercise
  title text,
  body text,
  created_at timestamptz default now()
)
```

**Row-Level Security**: every table must enforce `user_id = auth.uid()` for read and write. No exceptions. This is personal trauma work — privacy is sacred.

---

## 6. Worksheet-by-Worksheet Spec

Each worksheet below is a discrete page/component. Common pattern for ALL worksheets:

- **Top of page**: Module + section header (workbook style — large italic serif).
- **Reading section**: The instructional text from the workbook (rendered as warm, readable prose with generous line-height). User can collapse this after first read with a "Hide intro" toggle that remembers the preference.
- **Exercise**: Inputs matched to the worksheet shape below.
- **Autosave indicator**: subtle "Saved · just now" text after each successful save.
- **Bottom**: "Continue →" advances to the next worksheet AND marks this one complete. "Save & exit" persists progress without marking complete.
- **Affirming completion micro-moment**: When user hits Continue on a completed worksheet for the first time, show a brief overlay with a workbook-voice scripture-style line (rotate through, e.g. "Because you just did." / "Your soul already knows." / "This was never a question of if. Only of when.") before transitioning.

### MODULE 1 — Science of Joy & ITT Framework
**Section type: read-only educational content + reflection.**

`01_science_of_joy` worksheet shape:
```jsonc
{
  "reflection": "string — free response to: 'After learning how your brain creates joy, what's one belief about transformation that just shifted for you?'"
}
```
Content to render (verbatim from workbook):
- Brain Waves, Joy Chemicals, Neurogenesis intro paragraph
- Joy Chemicals section (dopamine, serotonin, oxytocin, endorphins, neurogenesis)
- Reticular Activating System section
- Brain Waves & Meditation section (include a simple SVG diagram showing Beta → Alpha → Theta → Delta — slowing waves)
- ITT Framework breakdown: **Invest In Joy**, **Train Your Brain**, **Take Bold Action** — three equal sections.

End with the Desmond Tutu pull quote (see §10).

---

### MODULE 2 — Joyful Operating System® (JOS)

#### 2a. Core Narrative
`core_narrative` worksheet shape:
```jsonc
{
  "old_narratives": ["string", "string", "string"],     // up to 3, the negative core narratives
  "new_narratives": ["string", "string", "string"],     // user rewrites each as positive 180° opposite
  "reflection": "string — long-form: how would life be different if these new stories were the truth?"
}
```

UI flow:
1. Read the Core Narrative explanation.
2. Read the **Reframe Ritual** (Catch the Story → Flip the Script → Anchor the Shift).
3. "What is Your Core Narrative?" — free-text input with examples shown as muted placeholder text (I'm broken / I'm too much / Nobody loves me / etc.).
4. "Top 3 Old Core Narratives" — three numbered text inputs.
5. **Side-by-side reframe table**: two columns (Negative / Positive). For each old narrative the user entered, show it on the left; user types the 180° positive opposite on the right. Show Brent's example as ghost text: *"I'm not worthy of love."* → *"I am worthy of love just by being me."*
6. "Your NEW Empowering & TRUE Core Narratives" — confirmation view showing the 3 new narratives in large type.
7. Reflection prompt (long textarea, autosaved): "How would your life be different, improved, or changed if these new stories were the truth and the old narratives never even existed? How would it affect your relationships? Your career? Your friendships? Your parenting?"

#### 2b. Self Eulogy
`self_eulogy` worksheet shape:
```jsonc
{ "eulogy": "string — long-form" }
```

UI:
1. Read the Self-Eulogy explanation (this exercise is HARD by design — the discomfort is the growth).
2. Show Brent's example eulogy excerpt in a styled blockquote.
3. **Guiding prompts** (displayed as a sidebar or collapsible list, not as separate inputs):
   - How do you want to make people feel when they remember you?
   - What qualities do you want people to celebrate about you?
   - What impact did you have on the lives of others?
   - How did you embody joy, love, and purpose in your actions?
   - How did you show up for your family, friends, children, and community?
   - How did you take care of your mind, body, and soul?
   - How did you demonstrate faith, love, and passion?
   - What values did you instill in your children, friends, family, and community?
   - What did people learn from you in this life that will make their life better?
4. One large autosaved textarea — full-page, paper-like writing surface. No character limit. Show word count subtly.

#### 2c. List of Joy™
This is a **living document**, not a one-time worksheet. Treat it like a notes/list app inside the curriculum.

Data: rows in `list_of_joy_items` (see §5).

UI:
- Hero block: read the List of Joy intro + examples ("warmth of sunshine on your face", "laughing with loved ones", etc.).
- Add-item input at the top — Enter to add. Items appear as a numbered list below.
- Each item is editable in-place; can be deleted with a soft confirm.
- Each item can be tagged later with a Priority Pillar (drag to pillar OR dropdown). This tagging happens in the Priority Pillars worksheet (§2d) or anytime.
- Show running count: "You've added 47 items to your List of Joy."
- "Add to your List of Joy" must also be accessible from a global floating "+" button anywhere in the curriculum (since joy items can occur anytime).

#### 2d. Priority Pillars Inventory
`priority_pillars` worksheet (rendered from `priority_pillar_snapshots`):

UI:
1. Read the Priority Pillars explanation (6 pillars, 2 sub-pillars each, depletion = sadness / situational depression / chronic depression / hopelessness).
2. List the 6 pillars and 12 sub-pillars.
3. Inventory: For each of the 12 sub-pillars, a slider or numeric input 1–10 (Key: 1 = Completely Unfulfilled, 5 = Moderately Fulfilled, 10 = Extremely Fulfilled). Microcopy: "Don't overthink this. Trust your first instinct — it's usually the honest answer."
4. Auto-calculate the average for each parent pillar.
5. **Results visualization**: a horizontal bar chart showing all 6 pillars colored by depletion (deep cream → muted gold; depleted pillars subtly highlighted). Identify the user's wobbliest pillar with a soft callout: "Your Family pillar is asking for attention right now."
6. Take-snapshot button creates a new `priority_pillar_snapshots` row. Show history chart: how each pillar has moved over time.

**Cross-link**: From the depleted pillar callout, link directly to the List of Joy filtered by that pillar (or prompt user to tag items in their List of Joy with this pillar) and into the SubScript builder pre-populated with manifestations targeting that pillar.

#### 2e. Subconscious Script (SubScript)
`subscripts` table (versioned — see §5).

UI flow (do this in a multi-step wizard):

**Step 1: Emotion Anchor.**
"Before we build your SubScript, let's anchor your Joy Spark — the memory you'll use to feel the emotion every time you read this. Describe a moment of pure joy, love, or gratitude you can vividly recall."
→ free text → saved as `emotion_anchor`.

**Step 2: Target Date.**
"By [Month] [Day], [Year] I am:" — date picker (default: 90 days from today).

**Step 3: Manifestations (up to 20).**
"These are not random vision statements. They come directly from your List of Joy, especially from the pillar that's most depleted."
→ Show user's List of Joy items as suggestion chips they can click to insert/adapt.
→ Numbered list, add as many as 20.
→ Show Brent's sample SubScript as a styled inline example (rendered from a constant in the codebase — pull the actual image / verbatim text from the workbook if available, otherwise use representative examples).

**Step 4: Affirmations (5–10).**
"Short, powerful affirmations that reinforce your new Core Narrative and the identity you're stepping into."
→ Numbered list. Show defaults the user can adopt as-is:
- I can do anything I set my mind to.
- I am focused.
- I am disciplined.
- I am resilient.
- I will never, EVER, give up.
- I will persevere.

**Step 5: Lock in & Print View.**
Render the full SubScript in a beautiful, print-friendly format (this is the page users will physically print and laminate). Buttons:
- "Print my SubScript"
- "Download as PDF"
- "Email to myself"
- "Set my morning + evening reminders" → opens the daily practice setup (push notification or email at user-chosen times — opt in).

**Versioning**: Editing a SubScript creates a new version (increment `version`, set previous `is_active = false`). Users can view history.

---

### MODULE 3 — Forgiveness Framework

`forgiveness_subjects` table — supports a "Forgiveness Hit List" (multiple people to process over time).

UI flow:
1. Read the Forgiveness Framework intro + the 4-step overview (Victim Rant → Empath Rave → Universal Meaning → Forgiveness).
2. **Forgiveness Hit List**: list of subjects the user has started or completed. "Begin a new forgiveness process" CTA.
3. When user starts a new process, single-page wizard:

   **Step 1: Name.** "Who are you ready to forgive today? (This stays 100% private. You can use a name, a nickname, or just 'someone close to me' — even 'myself'.)"

   **Step 2: Victim Rant.**
   - Heading: "This is the one and only time you are allowed to lean fully into victim consciousness. Get it all out. Foul language encouraged. If you leave anything in, the process breaks down in Step 2."
   - Show Brent's example (the workbook's expletive example) in an italic muted blockquote so users know it's truly OK to swear.
   - Large textarea. No character limit. **Optionally**: a "voice note" recording option (browser MediaRecorder API → upload to Supabase Storage, store URL alongside text — for users who'd rather speak than write).
   - **Privacy note** prominently displayed: "This is encrypted at rest and visible only to you. You can delete it anytime."

   **Step 3: Empath Rave.**
   - Heading + warning: "This is fucking hard, but worth it. If you find yourself falling back into your victim story, go back to Step 1 and keep ranting. Then come back here."
   - Prompt: "Now put yourself in their shoes — their childhood, their wounds, their life. Not to condone. To free YOU. Start with: 'I now see from your perspective…'"
   - Large textarea.

   **Step 4: Universal Meaning.**
   - Prompt: "Start with: 'I now see that this all had to happen exactly as it did for me to…'"
   - Large textarea.

   **Step 5: Forgiveness Release.**
   - On-screen ritual: a calm full-screen overlay, soft fade, with the user's subject name in soft script. Instructions appear one line at a time, with deliberate pacing:
     > Close your eyes.
     > Imagine them standing in front of you.
     > Walk over to them. Give them a hug.
     > Say: *I forgive you.*
     > As you hug them, watch them fade into black in your arms.
     > Until you are hugging yourself. They are gone.
     > Now say: *I love you* — to yourself.
   - Below the ritual: text input "I forgive [name]." with a "Say it 3 times" interaction — the user clicks/types it 3 times. Each click triggers a soft chime + visual pulse.
   - On completion: mark the subject `completed_at = now()`. Show the scripture-style close: "This was never a question of if. Only of when."

4. After a process, the subject moves to the "Completed" section of the Hit List with the date. User can begin a new process for someone else.

---

### MODULE 4 — Take Bold Action (10 sub-tools)

Each of the 10 has its own page. The pattern: short intro (read), then the exercise with structured inputs. Shapes below.

#### 4a. Triggers & Emotional Alchemy
`triggers_emotional_alchemy` shape:
```jsonc
{
  "feel_it": {
    "emotion": "string",
    "body_location": "string",
    "intensity_before": "int 1-10"
  },
  "ask_it": {
    "what_emotion_taught_me": "string",
    "one_sentence_message": "string"
  },
  "move_it": {
    "what_i_did": "string (radio: shake/breathe/walk/hum/stretch/other free-text)"
  },
  "shift": {
    "intensity_after": "int 1-10",
    "what_changed": "string"
  },
  "alchemy_commitment": {
    "next_trigger_first_move": "string",
    "trusted_practice_partner": "string"
  }
}
```
UI: guided 3-step flow (Feel It → Ask It → Move It) with a 60-second "do this right now" component for Step 3 (a soft on-screen timer + breath visual). Before/After intensity scale rendered as a 1-10 picker. Finish with the Alchemy Commitment box. Mirror exactly the workbook's *Emotional Alchemy Exercise: A Guided Practice* page.

#### 4b. Reset Breath
`reset_breath` shape:
```jsonc
{
  "body_feel_before": "string (one word)",
  "body_feel_after": "string (one word)",
  "what_shifted": "string",
  "anchors": ["string", "string", "string"]   // three daily moments to use it
}
```
UI: a **breath visualizer** at the top — animated expanding/contracting circle with the 6–4–8 cadence (Inhale 6s, Hold 4s, Exhale 8s with soft "ahhhhh"). User taps "Begin 5 rounds" and the visualizer guides them through. Text inputs below capture before/after state and 3 commitment anchors.

#### 4c. Habit Renaissance (D.A.D. Framework)
`habit_renaissance` shape:
```jsonc
{
  "harmful_habits_spotlight": ["string", "string", "string"],
  "first_dad_loop": {
    "area_of_life": "string",
    "specific_habit": "string",
    "desire": "string",
    "action": "string",
    "dopamine": "string"
  },
  "habit_compounding": {
    "second_habit_to_stack": "string"
  },
  "replace_harmful_habit": {
    "harmful_habit": "string",
    "underlying_need": "string (escape/stimulation/comfort/numbing/other)",
    "joyful_replacement": "string"
  },
  "vision_anchor_90_days": "string"
}
```
UI: 4-step exercise mirroring the workbook. Step 1 shines a light. Step 2 builds the first loop with clear D-A-D labels. Step 3 stacks. Step 4 replaces. Vision Anchor as the closing prompt.

#### 4d. Dopamine Detox
`dopamine_detox` shape:
```jsonc
{
  "commitments": {
    "delete_news_apps": { "committed": "bool", "replacement": "string" },
    "turn_off_notifications": { "committed": "bool", "replacement": "string" },
    "no_social_scrolling": { "committed": "bool", "replacement": "string" },
    "no_binge_watching": { "committed": "bool", "replacement": "string" },
    "cut_processed_food_sugar": { "committed": "bool", "replacement": "string" }
  },
  "number_one_priority": "string",
  "start_date": "date",
  "partner": "string"
}
```
UI: 5 commitment checkboxes, each with a replacement-activity text field that's REQUIRED if the checkbox is checked. Highlight: "Start with the ONE that makes the biggest difference."

#### 4e. Sleep
`sleep` shape:
```jsonc
{
  "current_avg_hours": "float",
  "poor_sleep_impact": "string",
  "lever_ratings": {
    "temperature": "int 1-5",
    "light": "int 1-5",
    "meals": "int 1-5",
    "tracking": "int 1-5",
    "bath": "int 1-5",
    "sanctuary": "int 1-5"
  },
  "biggest_gap": "string",
  "the_one_change_tonight": "string",
  "screens_off_time": "time",
  "bedtime": "time",
  "wake_time": "time",
  "sabotaging_habit_letting_go": "string"
}
```
UI: 6-lever rating block (sliders 1–5). Then the "one change tonight" commitment with three time pickers.

#### 4f. Law of Zero Gravity
`law_of_zero_gravity` shape:
```jsonc
{
  "hourly_rate": "float",
  "audit": [
    { "item": "string", "action": "E|D|O" },  // Eliminate / Delegate / Outsource
    // up to 5 items
  ],
  "three_bold_actions": {
    "eliminate": { "item": "string", "yes_to_instead": "string" },
    "delegate":  { "item": "string", "yes_to_instead": "string" },
    "outsource": { "item": "string", "yes_to_instead": "string" }
  },
  "one_no_this_week": "string"
}
```
UI: hourly rate calculator (annual salary ÷ 2000, with an info icon explaining). 5-row audit table. 3 Bold Actions section. The Power of "No" capstone.

#### 4g. Play
`play` shape:
```jsonc
{
  "what_lit_me_up_as_kid": "string",
  "whats_stopping_me": "string",
  "sixty_second_play_result": "string",
  "three_ways_to_play_this_week": ["string", "string", "string"],
  "weekly_play_block": "string"   // day & time
}
```
UI: prompts laid out as a reflection sequence. Include a "60-Second Play Challenge" with on-screen timer (no instructions — Brent's instruction is "60 seconds to make each other laugh without words" — for the solo digital version, prompt: "Stand up. Do something playful for 60 seconds. We'll wait."). Day/time picker for the Weekly Play Block.

#### 4h. Giving
`giving` shape:
```jsonc
{
  "right_now_gift": {
    "who": "string",
    "what_i_said": "string",
    "how_it_felt": "string"
  },
  "daily_giving_ritual": "string",
  "how_ill_weave_in": "string",
  "new_belief": "string"
}
```
UI: "Give Right Now" exercise at the top — prompt user to actually send a text/voice note to someone they care about before continuing. Then the practice section.

#### 4i. Routine Redesign (Morning Orbit + Evening Wind Down)
`routine_redesign` shape:
```jsonc
{
  "morning": {
    "letting_go_of": "string",
    "mental":     { "time": "time", "what": "string" },
    "biological": { "time": "time", "what": "string" },
    "physical":   { "time": "time", "what": "string" },
    "emotional":  { "time": "time", "what": "string" }
  },
  "evening": {
    "letting_go_of": "string",
    "steps": [
      { "time": "time", "what": "string" },
      { "time": "time", "what": "string" },
      { "time": "time", "what": "string" }
    ]
  },
  "biological_prime_time": { "peak_focus": "string", "energy_dip": "string" },
  "non_negotiable_minimums": { "morning": "string", "evening": "string" },
  "commit": { "morning_orbit_tomorrow_at": "time", "wind_down_tonight_at": "time" }
}
```
UI: two-column layout (Morning / Evening). Time pickers next to each line. End with the commitment block.

#### 4j. The 60-Second Shift
`sixty_second_shift` shape:
```jsonc
{
  "bold_action_taking_now": "string",
  "completed_action": "bool",       // did they actually do it?
  "how_it_felt_to_move": "string",
  "life_if_i_did_this_every_time": "string",
  "next_bold_action_on_horizon": "string",
  "accountability_partner": "string"
}
```
UI: this is the most important exercise in the workbook — make it sing. Big bold heading: **"You have 60 seconds. Starting NOW."** On-screen 60-second countdown begins when the user types the bold action. After the countdown, ask: "Did you do it?" → yes/no. If no, gentle nudge: "What's stopping you? You have 60 more seconds." If yes, full-page celebration and the workbook's scripture line.

---

### TOOLKIT (`/toolkit`)
Reference library of 20 tools from the back of the workbook. Each tool gets its own page at `/toolkit/[slug]` with:
- Title & subtitle (e.g. "Reset Breath — Your Nervous System's Reset Button")
- The full description from the workbook (verbatim — these are tight, polished pieces of writing)
- "Practice this now" button → links to the worksheet/exercise version if one exists (e.g. Reset Breath → `/module/04-bold-action/reset-breath`)
- "Add to my daily practice" → creates a habit tracker entry visible in the dashboard

**The 20 tools:**
1. 60-Second Shift
2. Biological Prime Time / Biological Down Time
3. Dopamine Detox
4. Emotional Alchemy Formula
5. Evening Wind-Down
6. Forgiveness Framework
7. Habit Renaissance
8. ITT Framework
9. JOMO
10. Joy Judo
11. Joy Quotient Assessment
12. Joyful Habit Framework (D.A.D.)
13. Law of Expansion
14. Law of Zero Gravity
15. Morning Orbit
16. One Minute Window
17. Overview Effect
18. Reframe Ritual
19. Reset Breath
20. Spirit Walks

Pull verbatim text from §11 of this spec.

---

### JQ ASSESSMENT (`/jq-assessment`)
**Integrate with the existing JQ Quiz, don't rebuild.** Two changes:

1. Add a `context` parameter to the existing quiz flow so we can label assessments as `baseline`, `month_1`, `month_2`, `month_3`, `final`, or `ad_hoc`. The 90-Day Challenge calls into this with the right context at the right time.

2. Add a "JQ Progress" view inside `/curriculum` that pulls the user's `jq_assessments` history and renders a line chart over time, with tier shifts annotated ("You moved from Moderate to High between Month 1 and Month 2").

The existing 10 questions, scoring, and tier descriptions are already in the workbook (and presumably the existing quiz). Don't duplicate logic — re-use.

For reference, the scoring tiers:
- 10–20 = Low JQ
- 21–30 = Moderate JQ
- 31–40 = High JQ
- 41–50 = Very High JQ

---

### 90-DAY CHALLENGE (`/90-day-challenge`)

UI:
- **Roadmap view**: a vertical timeline of all 12 weeks + the Foundation Week (Week 0). Each week shows its title and the daily/weekly focus. Completed days have a soft filled mark. The user's current day is highlighted.
- **Today view**: the default landing. Shows what to do today, with check-off boxes for:
  - [ ] Morning SubScript read
  - [ ] Evening SubScript read
  - [ ] Today's weekly focus action: *[varies by week — see roadmap below]*
  - Free reflection box
  - Optional mood rating (1–10)
- **Settings**: opt-in morning + evening reminders (push or email), partner email for accountability (optional).

**Roadmap content (verbatim from page 62 of the workbook):**

| Week | Title | Focus |
|------|-------|-------|
| Foundation Week | Foundation | Day 1: Core Narrative Rewrite + JQ Assessment. Day 2: Self Eulogy. Day 3: List of Joy. Day 4: Priority Pillars + SubScript. Day 5: Routine Redesign (Morning Orbit + Evening Wind Down). Day 6: Forgiveness. Day 7: Bold Action. |
| Month 1 — Build the Foundation ||
| Week 2 | Make It Stick | Anchor your SubScript into daily rituals. Refine your Morning Orbit and Evening Wind Down until they feel natural. Print SubScript and post it everywhere visible. |
| Week 3 | Dopamine Detox | Identify your biggest dopamine hijacker and reduce or eliminate it for the week. Replace with analog nourishment: nature, connection, creation, stillness. |
| Week 4 | Habit Renaissance | Identify your Biological Prime Time. Choose one joyful habit and lock it in using the D.A.D. Framework. Keep it small, keep it joyful, let it compound. |
| Month 1 Check-In || Retake JQ Assessment. Refresh SubScript. Journal: Where did I feel the most joy? Celebrate your progress. |
| Month 2 — Deepen the Practice ||
| Week 5 | Sleep | Choose one sleep hygiene habit and implement it nightly. Temperature, light, meal timing, tracking, bath/shower, or sanctuary upgrade. |
| Week 6 | Giving | Give something of yourself once a day with no strings attached. Keep a Giving Log: what you gave, who it was for, and how it made you feel. |
| Week 7 | Play | 15–30 minutes of pure, purposeless play daily. No screens, no outcome. Schedule it like a meeting. What lit you up as a kid? Start there. |
| Week 8 | Therapy | Research a therapeutic modality that resonates. Book one session or consultation. Practice Spirit Walks in nature throughout the week. |
| Month 2 Check-In || Retake JQ Assessment. Refresh SubScript + List of Joy. Reflect on synchronicities. Celebrate. |
| Month 3 — Expand & Integrate ||
| Week 9 | Law of Zero Gravity | Audit your commitments. Eliminate one, delegate one, outsource one. Make space for what actually matters. |
| Week 10 | JOMO | The Joy of Missing Out. Practice saying no to one thing you'd normally say yes to out of guilt. Protect your energy like it's gold. |
| Week 11 | Spirit Walk | One long, intentional walk in nature. No phone, no headphones. One soulful question. Let the stillness reveal what your soul needs. |
| Week 12 | Bold Action | Choose one big stretch from your List of Joy. Book it. Plan it. Begin it. This is your 60-Second Shift moment. Go big. |
| Final Check-In + Graduation || Final JQ Assessment. Reflect on 90 days of transformation. Celebrate with something that brings you tremendous joy. The alchemy continues. |

On Day 90 graduation, show a special completion page with all the user's transformation data (JQ progression chart, total worksheets completed, journal word count, etc.) and a graduation video/letter from Brent (placeholder video URL — leave a clear `TODO: Brent to record and upload`).

---

## 7. Onboarding (`/curriculum/onboarding`)

First-time experience when a user clicks into Curriculum. 5 screens:

1. **Welcome** — warm, full-screen, single sentence: "Welcome to your Alchemy of Joy™ Curriculum." Slow fade-in. Continue button at the bottom.
2. **What you're stepping into** — a quiet paragraph adapted from the workbook's "Hello Alchemists" letter. Include Brent's signature image (placeholder).
3. **How it works** — short, 4-line explanation: read → reflect → write → return. Mention autosave: "Everything you write is saved automatically and visible only to you."
4. **Baseline JQ Assessment** — "Before we begin, let's measure where you are. This 5-minute check-in becomes your baseline." → button → existing JQ Quiz with `context='baseline'`.
5. **Set your start date** — "When do you want to begin your 90-Day Challenge?" Default to today; allow up to 7 days in the future. Save to `users.challenge_started_at`. Optional opt-in for daily reminders.

After onboarding, drop them into the Curriculum Dashboard with Module 1 highlighted as their next step.

---

## 8. Cross-Cutting Features

### Autosave + Offline-Resilience
- Every form input debounces saves at 1500ms idle.
- Visible "Saved · just now" indicator, fades to "Saved" after 3s.
- If a save fails (network blip), queue it in `localStorage` and retry. Never lose user-written words — these are sacred.
- Optimistic UI: input updates immediately, save in the background.

### Privacy
- All worksheet content (especially Forgiveness and Core Narrative) is **for the user's eyes only**.
- No analytics on content. Track only structural events (worksheet completed, JQ taken, day checked in) — never content.
- Make this **explicitly clear in copy** anywhere a user is about to write something vulnerable: "This is encrypted at rest and visible only to you. You can delete it anytime."
- Provide a one-click "Delete all my data" option in account settings.

### Export
At `/curriculum/export`, generate a beautifully typeset PDF that mirrors the printed workbook with the user's responses populated. Same fonts, same layout, same warmth. This is a keepsake.

Use `@react-pdf/renderer`. Match cream background, italic serif headers, body serif. Include Brent's signature graphic placeholders.

### Notifications (opt-in only)
- Morning reminder: "Good morning. Your SubScript is waiting."
- Evening reminder: "Read your SubScript before bed. Five minutes. That's all."
- Weekly check-in: "Week 3 begins today. Here's your focus."
- Use Resend + React Email. Keep all copy in the brand voice.

### Accessibility
- WCAG AA compliance minimum. AAA where reasonable.
- Color contrast ratio ≥ 4.5:1 across the cream-background palette.
- Full keyboard navigation.
- Screen reader labels on every interactive element.
- Respect `prefers-reduced-motion` (no breath visualizer animation if reduced motion is set — replace with static text instructions).

### Mobile-first
This will be used on phones. Especially the daily check-in, the breath visualizer, the 60-Second Shift, and the Forgiveness ritual. Design mobile-first; desktop is a wider version of the same layouts.

---

## 9. Build Order (do this in phases)

**Phase 1 — Foundation (deliver before moving on):**
- INTEGRATION_PLAN.md (read existing repo, document the stack)
- Database migrations (all tables in §5)
- Curriculum Dashboard shell + navigation
- Onboarding flow
- Module 1 (read-only + reflection)

**Phase 2 — JOS Core (the heart of the curriculum):**
- Core Narrative worksheet
- Self Eulogy worksheet
- List of Joy (living document)
- Priority Pillars Inventory + history
- SubScript builder (5-step wizard)

**Phase 3 — Forgiveness:**
- Forgiveness Hit List
- 4-step process wizard with ritual overlay
- (Voice note recording is a stretch goal — text-only is fine for v1)

**Phase 4 — Bold Action (10 sub-tools):**
- All 10 Module 4 worksheets
- Breath visualizer component
- 60-second timer component
- Hourly-rate calculator

**Phase 5 — Toolkit & 90-Day Challenge:**
- Toolkit reference pages (20 tools)
- 90-Day Challenge tracker
- Daily check-in flow
- Roadmap view
- JQ progress chart

**Phase 6 — Polish & Export:**
- PDF export
- Email notifications
- Settings & data deletion
- Accessibility audit
- Mobile QA pass

Ship Phase 1 and 2 first. Get those reviewed before continuing.

---

## 10. Pull Quotes (use as rotating dashboard quotes and module dividers)

1. **Brent J. Freeman:** "Joy is the absolute value of the present moment."
2. **Desmond Tutu:** "When we find joy in the small, ordinary moments of life, we discover that happiness isn't something we chase — it's something we create from within, one breath, one smile, one moment of gratitude at a time."
3. **Brent J. Freeman:** "The only thing that's holding you back is the story you tell yourself."
4. **Rumi:** "When you do things from your soul, you feel a river moving in you, a joy. This joy is not fleeting; it's not borrowed from external things. It's the essence of your spirit, your connection to the divine, and it flows unbroken when you live in harmony with your truth."
5. **Lewis B. Smedes:** "To forgive is to set a prisoner free and discover that the prisoner was you."
6. **Brent J. Freeman:** "To forgive is to liberate yourself from the prison of anger, giving yourself the freedom to live fully and love deeply."

---

## 11. Toolkit Verbatim Text

Store these as constants in `src/lib/toolkit-content.ts` keyed by slug. **Render verbatim — these are polished writing.**

### `sixty-second-shift` — 60-Second Shift
The 60-Second Shift is a decision-making tool based on one powerful principle: when you feel a surge of inspiration or an intuitive nudge to act, you have roughly 60 seconds to take bold action before your brain talks you out of it. Make the call, send the message, book the ticket, say yes — move before fear catches up. The goal is not perfection but movement, because movement rewires your identity into someone who acts in alignment with what matters most.

### `biological-prime-time` — Biological Prime Time / Biological Down Time
Your Biological Prime Time (BPT) is the window in your day when your brain and body are naturally at their peak — when focus is sharpest and energy is highest. Your Biological Down Time (BDT) is the natural trough when energy dips and your body is asking you to slow down. By identifying both windows and aligning your most demanding tasks with your BPT and lighter tasks or movement with your BDT, you work with your biology instead of against it, making your days feel exponentially easier.

### `dopamine-detox` — Dopamine Detox
The Dopamine Detox is a 30-day challenge to reclaim your brain's reward system from modern "dopamine hijackers" — social media, news apps, processed foods, binge-watching, and mindless shopping. The practice involves deleting news apps, turning off all push notifications, eliminating doomscrolling, stopping binge-watching, and cutting processed food and sugar. By reducing these artificial stimulants, you retrain your brain to find joy in more natural, sustainable sources and reconnect with calm, clarity, and presence.

### `emotional-alchemy-formula` — Emotional Alchemy Formula
The Emotional Alchemy Formula is a three-step practice for transforming difficult emotions into clarity, wisdom, and forward momentum: (1) Feel It — name the emotion and notice where it lives in your body; (2) Ask It — treat the emotion like a messenger and ask what it is trying to tell you; (3) Move It — give the emotion a healthy physical outlet such as movement, breathwork, journaling, or time in nature so it does not stay stuck. When you stop seeing emotions as problems and start seeing them as portals, they become fuel for growth.

### `evening-wind-down` — Evening Wind-Down
The Evening Wind-Down is an intentional nightly routine designed to help you transition from the activity of your day into a state of rest, reflection, and integration. It involves disconnecting from screens, engaging in calming activities like a hot shower, reading, or calming music, and practicing gratitude. A consistent Evening Wind-Down signals to your body that it is time for repair mode, helping you process the day, prepare for restorative sleep, and set the stage for a stronger morning.

### `forgiveness-framework` — Forgiveness Framework
The Forgiveness Framework is a four-step private process for releasing the emotional weight of past hurts and resentments: (1) Victim Rant — get all your pain out with complete honesty; (2) Empath Rave — try to see the humanity and perspective of the person who hurt you; (3) Universal Meaning — find the lesson, growth, or deeper purpose the experience gave you; (4) Forgiveness — formally release the energetic tie and choose love for yourself. This process is done privately for your own freedom — you do not need to contact the other person — and should be worked through in exact order for each person on your Forgiveness Hit List.

### `habit-renaissance` — Habit Renaissance
The Habit Renaissance is the process of becoming the conscious architect of your daily life by identifying and unwinding the default habits that drain your energy and intentionally replacing them with joyful rituals that serve your growth. It begins with honestly spotlighting your current harmful habits, then layering in new ones — starting with your morning and evening rituals, sleep, and gradually adding movement, meditation, giving, and play. The core principle is that if you do not design your days with intention, they will be designed for you by algorithms, old wounds, and autopilot programming.

### `itt-framework` — ITT Framework
The ITT Framework is the core roadmap of the Alchemy of Joy system, built on three pillars: Invest in Joy (making joy a daily, non-negotiable priority), Train Your Brain (reprogramming your subconscious mind through practices like visualization, meditation, and intentional repetition), and Take Bold Action (turning inner work into outer transformation by acting when you are in an elevated, inspired state). Together, these three pillars create a permanent neurological, emotional, and spiritual path back to who you truly are.

### `jomo` — JOMO (Joy of Missing Out)
JOMO is the practice of intentionally saying "no" to things that do not align with your values, priorities, or energy so you can create space for a full-bodied "yes" to what truly matters. It is a conscious shift away from the fear of missing out (FOMO) and toward becoming wildly intentional with where you place your time, energy, and attention. Every intentional "no" is really a sacred "yes" — a yes to more presence, more meaning, and more of the life your soul has been quietly asking for.

### `joy-judo` — Joy Judo
Joy Judo is the art of using life's hardest moments as fuel for your greatest breakthroughs, rather than being crushed by them. The three steps are: (1) Accept and Assess — pause, get curious instead of furious, and understand what you are dealing with; (2) Leverage and Adapt — find the hidden opportunity or lesson within the challenge; (3) Execute — redirect the energy of the challenge toward growth and wisdom. Joy Judo is not about pretending bad things are good — it is about discovering the good that can exist alongside the bad and using life's force to propel you forward.

### `jq-assessment` — Joy Quotient (JQ) Assessment
The Joy Quotient is a simple self-assessment quiz you can complete in less than five minutes that gives you a clear snapshot of how much real, felt, embodied joy is currently present in your life. It serves as your starting line and tracking tool — recommended monthly for the first year, then quarterly — so you can measure your progress and see the transformation over time. Because what gets measured gets momentum, and the JQ makes the invisible shifts visible.

### `dad-framework` — Joyful Habit Framework (D.A.D.)
The Joyful Habit Framework uses your brain's natural reward system to build new habits through three steps: Desire (start with something you already crave), Action (place the new habit immediately before that craving as the cost of entry), and Dopamine (reward yourself with the craving right after completing the habit). Over time, your brain begins to associate the new habit with the reward itself, making it something you want to do rather than something you force. You can also stack multiple new habits before the same reward through habit compounding.

### `law-of-expansion` — Law of Expansion
The Law of Expansion is the principle that what you focus on expands. Your Reticular Activating System (RAS) acts as a filter for your awareness, meaning where you place your attention and energy is what you will notice and experience more of. If you consciously focus on what is good, positive, and joyful, you will train your brain to see and draw more of that into your life, whereas focusing on the negative will only amplify what you don't want.

### `law-of-zero-gravity` — Law of Zero Gravity
The Law of Zero Gravity is a time and energy management principle: if you can pay someone less than your own hourly rate to do a task that drains your energy, outsource it and reclaim that time for what brings you joy. In this context, "gravity" is the invisible pull of tasks, obligations, and responsibilities that weigh you down and steal your space for what truly matters. By doing a simple audit of your commitments and clearing the clutter that drags you down, you create the lightness and freedom to rise into a more intentional, joyful way of living.

### `morning-orbit` — Morning Orbit
The Morning Orbit is an intentional morning routine that serves as a launch sequence for your day, putting you into the right mental, emotional, and physical orbit. It has four key parts: mental (lingering in theta brainwaves upon waking and priming with your SubScript), biological (hydrating and clearing your system), physical (at least 10–15 minutes of movement), and emotional (meditation to calm and center your nervous system). Whether your Morning Orbit is two hours or twenty minutes, what matters is that it is intentional — you are choosing what you feed your mind and body first, instead of letting your phone or inbox set your energy for the day.

### `one-minute-window` — One Minute Window
The One Minute Window is a simple but powerful 60-second pattern interrupt that snaps you out of unconscious autopilot and back into the present moment — the only place joy truly exists. For just one minute, you pause all activity, take a physiological sigh (inhale 6 seconds, hold 4, exhale 8 with a soft "ahhhhh"), and then zoom in on one thing around you with full sensory attention. This practice slows your heart rate, lowers cortisol, quiets the amygdala, and creates space for joy to rise naturally.

### `overview-effect` — Overview Effect
Inspired by the profound shift in perspective astronauts experience when viewing Earth from space, the Overview Effect exercise is designed to give you that same clarity — not for the planet, but for your life. You do this by writing your own Self Eulogy from the perspective of one person you deeply love and respect, imagining what they would say about who you were, how you lived, and the impact you made. This practice pulls you out of the daily grind to see the full arc of your life, helping you realign your priorities and live with a greater sense of purpose and meaning.

### `reframe-ritual` — Reframe Ritual
The Reframe Ritual is a three-step framework for rewriting limiting beliefs and old stories that no longer serve you, drawing on narrative therapy, cognitive behavioral psychology, and neuroplasticity. The steps are: (1) Catch the Story — notice when you are slipping into a negative narrative, pause, take three slow breaths, and ask "What story am I telling myself right now?"; (2) Flip the Script — take the old belief and consciously rewrite it into an empowering truth; (3) Anchor the Shift — close your eyes, place your hand on your heart, and repeat the new story five times while feeling its truth in your body. With repetition, your brain rewires and the old scripts lose their grip.

### `reset-breath` — Reset Breath
The Reset Breath is your nervous system's reset button — a simple breathing pattern you can use anytime you feel overwhelmed, anxious, or emotionally flooded. Inhale deeply through your nose for 6 seconds, hold gently for 4 seconds, then exhale slowly through your mouth for 8 seconds with a soft "ahhhhh" sound, and repeat for 3 to 5 rounds. This extended exhale stimulates the vagus nerve, signaling safety to your brain and body, helping you shift out of fight-or-flight and into calm, grounded presence in less than a minute.

### `spirit-walks` — Spirit Walks
A Spirit Walk is a long, intentional, solo walk in nature with one soulful question on your heart — done without any distractions: no phone, no headphones, no music. Before you head out, choose one open-hearted question to hold gently as you walk, such as "What am I ready to release?" or "What does my soul need right now?" The combination of movement, nature, and self-inquiry creates a sacred space where your nervous system softens, old stories loosen their grip, and quiet clarity begins to emerge.

---

## 12. Workbook Long-Form Content to Render Verbatim

The following sections from the printed workbook should be rendered word-for-word (with paragraph breaks preserved) in the reading portions of each section. **Do not paraphrase Brent's writing.** Store these as Markdown files under `src/content/workbook/` and render with a sanitized Markdown renderer.

| File | Source workbook section |
|------|-------------------------|
| `welcome-letter.md` | "Hello Alchemists!" letter (workbook page 3) |
| `brent-bio.md` | "Brent J. Freeman Bio" (workbook page 4) |
| `module-01-intro.md` | Science of Joy intro + Joy Chemicals + RAS (pages 6–7) |
| `module-01-brain-waves.md` | Brain Waves & Meditation (page 7) |
| `module-01-itt.md` | ITT Framework — Invest, Train, Take Bold (page 8) |
| `module-02-intro.md` | Joyful Operating System® intro (page 11) |
| `module-02-core-narrative.md` | Core Narrative intro + Reframe Ritual (pages 12–13) |
| `module-02-self-eulogy.md` | Self Eulogy intro + Brent's example excerpt (page 20) |
| `module-02-list-of-joy.md` | List of Joy intro + examples (page 26) |
| `module-02-priority-pillars.md` | Priority Pillars explanation (page 29) |
| `module-02-subscript.md` | Subconscious Priming intro + 3 parts + when/how (pages 31–36) |
| `module-03-forgiveness.md` | Forgiveness Framework intro + all 4 step explanations (pages 39–46) |
| `module-04-intro.md` | Take Bold Action intro (page 48) |
| `module-04-triggers.md` | Triggers & Emotional Alchemy reading (page 49) |
| `module-04-reset-breath.md` | Reset Breath explanation (page 51) |
| `module-04-habit-renaissance.md` | Habit Renaissance + D.A.D. (page 52) |
| `module-04-dopamine-detox.md` | Dopamine Detox reading (page 54) |
| `module-04-sleep.md` | Sleep reading (page 55) |
| `module-04-zero-gravity.md` | Law of Zero Gravity reading (page 56) |
| `module-04-play.md` | Play reading (page 57) |
| `module-04-giving.md` | Giving reading (page 58) |
| `module-04-routine.md` | Routine Redesign reading (page 59) |
| `module-04-60-second.md` | 60-Second Shift reading (page 60) |
| `graduation-letter.md` | "Alchemists... As we come to the close..." closing letter (page 62 of original) |

**I (Brent) will paste the verbatim text for each of these markdown files separately.** For now, in Phase 1, scaffold the markdown files with a clear `<!-- TODO: paste verbatim from workbook page N -->` placeholder so the integration points are wired and ready.

---

## 13. Definition of Done

The build is done when:
- A new user can sign up, complete onboarding, take a baseline JQ, and land on the Curriculum Dashboard.
- They can complete every worksheet in Modules 1–4 with autosave working end-to-end.
- The Forgiveness ritual feels reverent, not gimmicky.
- The SubScript builder produces a print-ready PDF.
- The 90-Day Challenge tracker works day-by-day with the correct weekly content.
- JQ score history charts correctly across multiple takes.
- A full PDF export of all the user's responses generates correctly and looks like a personal version of the printed workbook.
- All copy is in Brent's voice.
- The site is fully accessible (Lighthouse a11y ≥ 95).
- Mobile experience is polished.
- Row-level security is verified — no user can read another user's data.

---

## 14. What NOT to Build (yet)

These are explicitly out of scope for v1 — flag for v2:
- Community / forum features
- Group cohorts or live retreat integration (Brent runs real-world retreats; those are a separate product)
- AI-generated reflections or coach chat (this comes later — a separate, internal-only project Brent is exploring)
- Audio meditation library (Brent will integrate his existing recordings later — leave a "Meditations" placeholder route)
- Payments / subscription gating (assume the JQ Quiz site already handles this or that the curriculum is free-with-account in v1 — confirm with Brent in INTEGRATION_PLAN.md)
- Mobile native apps (web is sufficient)

---

## 15. Final Note to Claude Code

This workbook represents years of Brent's life work — neuroscience, meditation craft, retreats with hundreds of participants, and his own dark night of the soul. Treat the content with the reverence it deserves.

Quality > speed. Voice > convention. Warmth > polish.

When you're unsure about a UX decision, ask: *Would this feel like a sacred space, or like a SaaS product?* Lean sacred.

Begin with `INTEGRATION_PLAN.md`. Confirm before installing dependencies. Ship Phase 1 + 2 first.

— End of spec —
