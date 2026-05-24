"use client";

import { useMemo, useState } from "react";
import { btnPrimary } from "@/lib/ui";
import EntryLog from "./EntryLog";
import { useLogger, type LoggedEntry } from "./useLogger";

const textareaClass =
  "w-full resize-y rounded-2xl border border-navy/15 bg-white px-5 py-3 font-sans text-[15px] leading-relaxed text-navy outline-none transition placeholder:text-navy/35 focus:border-cyan-deep focus:ring-2 focus:ring-cyan-deep/25";
const inputClass =
  "w-full rounded-xl border border-navy/15 bg-white px-4 py-3 font-sans text-[15px] text-navy outline-none transition placeholder:text-navy/35 focus:border-cyan-deep focus:ring-2 focus:ring-cyan-deep/25";
const labelClass =
  "font-sans text-[12px] font-semibold uppercase tracking-[0.16em] text-navy/55";

function Wrapper({
  children,
  log,
}: {
  children: React.ReactNode;
  log: React.ReactNode;
}) {
  return (
    <div className="space-y-10">
      <section className="space-y-5 rounded-3xl border border-navy/10 bg-mist p-6 sm:p-8">
        {children}
      </section>
      {log}
    </div>
  );
}

function SaveRow({
  onSave,
  busy,
  error,
  label = "Log it",
}: {
  onSave: () => void;
  busy: boolean;
  error: string | null;
  label?: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="font-sans text-[12px] text-[#8a6d00]">{error}</p>
      <button onClick={onSave} className={btnPrimary} disabled={busy}>
        {busy ? "…" : label}
      </button>
    </div>
  );
}

/* -- 4. Gratitude Three ------------------------------------------------ */
export function GratitudeThreeTool({
  initialEntries,
}: {
  initialEntries: LoggedEntry[];
}) {
  const { entries, busy, error, log } = useLogger(
    "gratitude-three",
    initialEntries,
  );
  const [g1, setG1] = useState("");
  const [g2, setG2] = useState("");
  const [g3, setG3] = useState("");
  async function save() {
    const ok = await log(
      [g1, g2, g3]
        .map((s, i) => (s.trim() ? `${i + 1}. ${s.trim()}` : ""))
        .filter(Boolean)
        .join("\n"),
      "Gratitude Three",
    );
    if (ok) {
      setG1("");
      setG2("");
      setG3("");
    }
  }
  return (
    <Wrapper log={<EntryLog entries={entries} />}>
      <p className="font-sans text-[14px] font-light text-navy/65">
        Be specific. Not &ldquo;my family&rdquo; — &ldquo;the way my kid said
        my name at breakfast.&rdquo;
      </p>
      {[
        { v: g1, set: setG1, ph: "1. The specific moment that stayed with you." },
        { v: g2, set: setG2, ph: "2. The thing you almost overlooked." },
        { v: g3, set: setG3, ph: "3. The person, the smell, the sound, the gift." },
      ].map((row, i) => (
        <textarea
          key={i}
          rows={2}
          value={row.v}
          onChange={(e) => row.set(e.target.value)}
          placeholder={row.ph}
          className={textareaClass}
        />
      ))}
      <SaveRow onSave={save} busy={busy} error={error} />
    </Wrapper>
  );
}

/* -- 5. Reframe Now ---------------------------------------------------- */
export function ReframeNowTool({
  initialEntries,
}: {
  initialEntries: LoggedEntry[];
}) {
  const { entries, busy, error, log } = useLogger("reframe-now", initialEntries);
  const [oldStory, setOldStory] = useState("");
  const [newStory, setNewStory] = useState("");
  async function save() {
    const ok = await log(
      `Old: ${oldStory.trim()}\nNew: ${newStory.trim()}`,
      "Reframe Now",
    );
    if (ok) {
      setOldStory("");
      setNewStory("");
    }
  }
  return (
    <Wrapper log={<EntryLog entries={entries} />}>
      <div>
        <label htmlFor="reframe-old" className={labelClass}>
          The old story (the one you keep hearing)
        </label>
        <textarea
          id="reframe-old"
          rows={3}
          value={oldStory}
          onChange={(e) => setOldStory(e.target.value)}
          placeholder="e.g. I'm always the one who has to hold it together."
          className={`${textareaClass} mt-2`}
        />
      </div>
      <div>
        <label htmlFor="reframe-new" className={labelClass}>
          The flip — a 180° truth, said as if already so
        </label>
        <textarea
          id="reframe-new"
          rows={3}
          value={newStory}
          onChange={(e) => setNewStory(e.target.value)}
          placeholder="e.g. I'm allowed to need what I need. People love supporting me."
          className={`${textareaClass} mt-2`}
        />
      </div>
      <SaveRow onSave={save} busy={busy} error={error} label="Anchor it" />
    </Wrapper>
  );
}

/* -- 6. Bold Ask ------------------------------------------------------- */
export function BoldAskTool({
  initialEntries,
}: {
  initialEntries: LoggedEntry[];
}) {
  const { entries, busy, error, log } = useLogger("bold-ask", initialEntries);
  const [who, setWho] = useState("");
  const [ask, setAsk] = useState("");
  const [committed, setCommitted] = useState(false);
  async function save() {
    const ok = await log(
      `To: ${who.trim()}\nAsk: ${ask.trim()}${committed ? "\n\nCommitted to send within 48 hours." : ""}`,
      "Bold Ask",
    );
    if (ok) {
      setWho("");
      setAsk("");
      setCommitted(false);
    }
  }
  return (
    <Wrapper log={<EntryLog entries={entries} />}>
      <div>
        <label htmlFor="ask-who" className={labelClass}>
          Who you&apos;re asking
        </label>
        <input
          id="ask-who"
          type="text"
          value={who}
          onChange={(e) => setWho(e.target.value)}
          placeholder="A name, a role, a relationship."
          className={`${inputClass} mt-2`}
        />
      </div>
      <div>
        <label htmlFor="ask-text" className={labelClass}>
          The ask — as specific as you can make it
        </label>
        <textarea
          id="ask-text"
          rows={5}
          value={ask}
          onChange={(e) => setAsk(e.target.value)}
          placeholder="Draft it. Bigger than feels comfortable. Don't soften."
          className={`${textareaClass} mt-2`}
        />
      </div>
      <label className="flex items-start gap-3 font-sans text-[14px] text-navy/75">
        <input
          type="checkbox"
          checked={committed}
          onChange={(e) => setCommitted(e.target.checked)}
          className="mt-1 h-4 w-4 accent-cyan-deep"
        />
        I&apos;m committing to send this within 48 hours.
      </label>
      <SaveRow onSave={save} busy={busy} error={error} label="Lock the ask" />
    </Wrapper>
  );
}

/* -- 7. Identity Declaration ------------------------------------------ */
export function IdentityDeclarationTool({
  initialEntries,
}: {
  initialEntries: LoggedEntry[];
}) {
  const { entries, busy, error, log } = useLogger(
    "identity-declaration",
    initialEntries,
  );
  const [lines, setLines] = useState<string[]>(["", "", ""]);
  function setLine(i: number, v: string) {
    setLines((cur) => {
      const next = [...cur];
      next[i] = v;
      return next;
    });
  }
  async function save() {
    const body = lines
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => (s.toLowerCase().startsWith("i am") ? s : `I am ${s}`))
      .join("\n");
    const ok = await log(body, "Identity Declaration");
    if (ok) setLines(["", "", ""]);
  }
  return (
    <Wrapper log={<EntryLog entries={entries} />}>
      <p className="font-sans text-[14px] font-light text-navy/65">
        Three declarations. Present tense. Spoken into being. We&apos;ll add
        &ldquo;I am&rdquo; for you if you forget.
      </p>
      {lines.map((v, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="font-sans text-[15px] font-serif italic text-cyan-deep">
            I am
          </span>
          <input
            type="text"
            value={v}
            onChange={(e) => setLine(i, e.target.value)}
            placeholder={
              i === 0
                ? "a person who keeps their word to themselves."
                : i === 1
                  ? "the kind of friend my friends are lucky to have."
                  : "becoming who I was always going to be."
            }
            className={inputClass}
          />
        </div>
      ))}
      <SaveRow onSave={save} busy={busy} error={error} label="Declare it" />
    </Wrapper>
  );
}

/* -- 8. Energy Inventory ---------------------------------------------- */
export function EnergyInventoryTool({
  initialEntries,
}: {
  initialEntries: LoggedEntry[];
}) {
  const { entries, busy, error, log } = useLogger(
    "energy-inventory",
    initialEntries,
  );
  const [gave, setGave] = useState("");
  const [drained, setDrained] = useState("");
  async function save() {
    const ok = await log(
      `Gave energy:\n${gave.trim()}\n\nDrained energy:\n${drained.trim()}`,
      "Energy Inventory",
    );
    if (ok) {
      setGave("");
      setDrained("");
    }
  }
  return (
    <Wrapper log={<EntryLog entries={entries} />}>
      <div>
        <label htmlFor="gave" className={labelClass}>
          What gave you energy today?
        </label>
        <textarea
          id="gave"
          rows={4}
          value={gave}
          onChange={(e) => setGave(e.target.value)}
          placeholder="People, places, work, food, conversations, choices."
          className={`${textareaClass} mt-2`}
        />
      </div>
      <div>
        <label htmlFor="drained" className={labelClass}>
          What drained it?
        </label>
        <textarea
          id="drained"
          rows={4}
          value={drained}
          onChange={(e) => setDrained(e.target.value)}
          placeholder="Be honest. Patterns appear over weeks of this."
          className={`${textareaClass} mt-2`}
        />
      </div>
      <SaveRow onSave={save} busy={busy} error={error} />
    </Wrapper>
  );
}

/* -- 9. Tiny Brave Act ------------------------------------------------ */
export function TinyBraveActTool({
  initialEntries,
}: {
  initialEntries: LoggedEntry[];
}) {
  const { entries, busy, error, log } = useLogger(
    "tiny-brave-act",
    initialEntries,
  );
  const [act, setAct] = useState("");
  const [when, setWhen] = useState("today");
  async function save() {
    const ok = await log(
      `Brave act: ${act.trim()}\nWhen: ${when}`,
      "Tiny Brave Act",
    );
    if (ok) {
      setAct("");
      setWhen("today");
    }
  }
  return (
    <Wrapper log={<EntryLog entries={entries} />}>
      <p className="font-sans text-[14px] font-light text-navy/65">
        Small enough to actually do. Brave enough to count. Bravery compounds.
      </p>
      <div>
        <label htmlFor="brave-act" className={labelClass}>
          The one tiny brave thing
        </label>
        <input
          id="brave-act"
          type="text"
          value={act}
          onChange={(e) => setAct(e.target.value)}
          placeholder="Send the text. Ask the question. Say the &ldquo;no.&rdquo;"
          className={`${inputClass} mt-2`}
        />
      </div>
      <div>
        <label htmlFor="brave-when" className={labelClass}>
          When
        </label>
        <select
          id="brave-when"
          value={when}
          onChange={(e) => setWhen(e.target.value)}
          className={`${inputClass} mt-2`}
        >
          <option value="today">Today</option>
          <option value="tonight">Tonight</option>
          <option value="tomorrow">Tomorrow</option>
          <option value="this week">This week</option>
        </select>
      </div>
      <SaveRow onSave={save} busy={busy} error={error} label="Commit" />
    </Wrapper>
  );
}

/* -- 10. Evening Check-In --------------------------------------------- */
export function EveningCheckInTool({
  initialEntries,
}: {
  initialEntries: LoggedEntry[];
}) {
  const { entries, busy, error, log } = useLogger(
    "evening-check-in",
    initialEntries,
  );
  const [mood, setMood] = useState(5);
  const [proud, setProud] = useState("");
  const [tomorrow, setTomorrow] = useState("");
  const summary = useMemo(
    () =>
      `Mood: ${mood}/10\nWhat I'm proud of: ${proud.trim()}\nOne thing for tomorrow: ${tomorrow.trim()}`,
    [mood, proud, tomorrow],
  );
  async function save() {
    const ok = await log(summary, "Evening Check-In");
    if (ok) {
      setProud("");
      setTomorrow("");
    }
  }
  return (
    <Wrapper log={<EntryLog entries={entries} />}>
      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor="mood" className={labelClass}>
            How are you, really?
          </label>
          <span className="font-sans text-[13px] font-semibold tabular-nums text-cyan-deep">
            {mood} / 10
          </span>
        </div>
        <input
          id="mood"
          type="range"
          min={0}
          max={10}
          value={mood}
          onChange={(e) => setMood(Number(e.target.value))}
          className="mt-3 w-full accent-cyan-deep"
        />
      </div>
      <div>
        <label htmlFor="proud" className={labelClass}>
          One thing you&apos;re proud of from today
        </label>
        <textarea
          id="proud"
          rows={3}
          value={proud}
          onChange={(e) => setProud(e.target.value)}
          placeholder="Doesn't have to be big. Just true."
          className={`${textareaClass} mt-2`}
        />
      </div>
      <div>
        <label htmlFor="tomorrow" className={labelClass}>
          One thing you&apos;re bringing into tomorrow
        </label>
        <textarea
          id="tomorrow"
          rows={2}
          value={tomorrow}
          onChange={(e) => setTomorrow(e.target.value)}
          placeholder="An intention. A boundary. A delight."
          className={`${textareaClass} mt-2`}
        />
      </div>
      <SaveRow onSave={save} busy={busy} error={error} label="Close the day" />
    </Wrapper>
  );
}
