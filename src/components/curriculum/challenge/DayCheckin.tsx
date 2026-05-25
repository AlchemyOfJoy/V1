"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { btnPrimary } from "@/lib/ui";
import { formatSavedAt } from "../useWorksheetSave";
import { useCelebrate } from "@/components/celebrate/CelebrationProvider";
import { queuedFetch } from "@/lib/offline-queue";

const MILESTONE_DAYS = new Set([1, 7, 14, 21, 28, 30, 42, 56, 60, 84, 90]);

interface Checkin {
  day_number: number;
  subscript_morning_done: boolean;
  subscript_evening_done: boolean;
  weekly_focus_action: string | null;
  reflection: string | null;
  mood_rating: number | null;
}

export default function DayCheckin({
  day,
  initial,
}: {
  day: number;
  initial: Checkin | null;
}) {
  const router = useRouter();
  const { celebrate } = useCelebrate();
  const [am, setAm] = useState(initial?.subscript_morning_done ?? false);
  const [pm, setPm] = useState(initial?.subscript_evening_done ?? false);
  const [focus, setFocus] = useState(initial?.weekly_focus_action ?? "");
  const [reflection, setReflection] = useState(initial?.reflection ?? "");
  const [mood, setMood] = useState(initial?.mood_rating ?? 5);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const payload = useMemo(
    () => ({
      subscript_morning_done: am,
      subscript_evening_done: pm,
      weekly_focus_action: focus,
      reflection,
      mood_rating: mood,
    }),
    [am, pm, focus, reflection, mood],
  );
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      setSaving(true);
      setError(null);
      try {
        const res = await queuedFetch(
          `/api/curriculum/challenge/checkin/${day}`,
          {
            method: "POST",
            kind: "challenge",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );
        if (!res.ok && res.status !== 202) throw new Error();
        const data = await res.json().catch(() => ({}));
        setSavedAt(new Date());
        if (data?.queued) {
          window.dispatchEvent(new Event("aoj:queued"));
          setError("Saved locally — we’ll sync when you’re back online.");
        }
      } catch {
        setError("Couldn't save — will retry on next change.");
      } finally {
        setSaving(false);
      }
    }, 1200);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [payload, day]);

  function close() {
    const isMilestone = MILESTONE_DAYS.has(day);
    const isMajor = day === 90;
    if (isMajor) {
      celebrate({
        size: "major",
        eyebrow: "Day 90",
        primary: "You ran the system for ninety days.",
        secondary: "Tell me you’re not changed.",
      });
    } else if (isMilestone) {
      celebrate({
        size: "milestone",
        eyebrow: `Day ${day} · milestone`,
        primary: "Logged.",
        secondary:
          day === 30
            ? "First month done. The shift is starting to compound."
            : day === 60
              ? "Sixty days. The install is taking."
              : "Another marker on the path.",
      });
    } else {
      celebrate({
        size: "micro",
        primary: `Day ${day} logged. ✦`,
      });
    }
    setTimeout(
      () => {
        router.push("/home");
        router.refresh();
      },
      isMajor ? 5000 : isMilestone ? 3000 : 900,
    );
  }

  const checkboxClass =
    "h-5 w-5 rounded accent-cyan-deep cursor-pointer";

  return (
    <section className="space-y-8">
      <div className="grid gap-3 rounded-2xl border border-navy/10 bg-mist p-5 sm:grid-cols-2">
        <label className="flex items-start gap-3 rounded-xl bg-white p-4 cursor-pointer">
          <input
            type="checkbox"
            checked={am}
            onChange={(e) => setAm(e.target.checked)}
            className={checkboxClass}
          />
          <span>
            <span className="block font-sans text-[14px] font-semibold text-navy">
              SubScript — morning
            </span>
            <span className="mt-0.5 block font-sans text-[12px] font-light text-navy/55">
              Read it out loud before phone.
            </span>
          </span>
        </label>
        <label className="flex items-start gap-3 rounded-xl bg-white p-4 cursor-pointer">
          <input
            type="checkbox"
            checked={pm}
            onChange={(e) => setPm(e.target.checked)}
            className={checkboxClass}
          />
          <span>
            <span className="block font-sans text-[14px] font-semibold text-navy">
              SubScript — evening
            </span>
            <span className="mt-0.5 block font-sans text-[12px] font-light text-navy/55">
              Last read before sleep.
            </span>
          </span>
        </label>
      </div>

      <div>
        <label
          htmlFor="focus-action"
          className="font-sans text-[12px] font-semibold uppercase tracking-[0.16em] text-navy/55"
        >
          This week&apos;s action — what you did today
        </label>
        <input
          id="focus-action"
          type="text"
          value={focus}
          onChange={(e) => setFocus(e.target.value)}
          placeholder="One sentence is plenty."
          className="mt-2 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 font-sans text-[15px] text-navy outline-none transition placeholder:text-navy/35 focus:border-cyan-deep focus:ring-2 focus:ring-cyan-deep/25"
        />
      </div>

      <div>
        <div className="flex items-baseline justify-between">
          <label
            htmlFor="mood"
            className="font-sans text-[12px] font-semibold uppercase tracking-[0.16em] text-navy/55"
          >
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
        <label
          htmlFor="reflection"
          className="font-sans text-[12px] font-semibold uppercase tracking-[0.16em] text-navy/55"
        >
          One line about today (optional)
        </label>
        <textarea
          id="reflection"
          rows={4}
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="What stayed with you?"
          className="mt-2 w-full resize-y rounded-2xl border border-navy/15 bg-white px-5 py-3 font-sans text-[15px] leading-relaxed text-navy outline-none transition placeholder:text-navy/35 focus:border-cyan-deep focus:ring-2 focus:ring-cyan-deep/25"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-navy/10 pt-6">
        <p
          className="font-sans text-[12px] text-navy/45"
          aria-live="polite"
          aria-atomic="true"
        >
          {saving
            ? "Saving…"
            : error
              ? error
              : savedAt
                ? `Saved · ${formatSavedAt(savedAt)}`
                : "Autosaves as you go."}
        </p>
        <button onClick={close} className={btnPrimary}>
          Done for today →
        </button>
      </div>
    </section>
  );
}
