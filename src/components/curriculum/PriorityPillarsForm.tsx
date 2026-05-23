"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { btnPrimary } from "@/lib/ui";
import {
  PILLAR_KEYS,
  PRIORITY_PILLARS,
  type PriorityPillarKey,
  type PriorityPillarsData,
} from "@/lib/curriculum";
import { useWorksheetSave, formatSavedAt } from "./useWorksheetSave";

type Scores = Partial<Record<PriorityPillarKey, number>>;

export default function PriorityPillarsForm({
  worksheetId,
  initialData,
  initialSnapshots,
  continueHref,
}: {
  worksheetId: string;
  initialData: PriorityPillarsData;
  initialSnapshots: { taken_at: string | Date; [k: string]: unknown }[];
  continueHref: string;
}) {
  const router = useRouter();
  const [scores, setScores] = useState<Scores>(initialData.scores ?? {});
  const [reflection, setReflection] = useState(initialData.reflection ?? "");
  const [snapshots, setSnapshots] = useState(initialSnapshots);
  const [takingSnapshot, setTakingSnapshot] = useState(false);
  const [snapshotError, setSnapshotError] = useState<string | null>(null);

  const data = useMemo<PriorityPillarsData>(
    () => ({ scores, reflection }),
    [scores, reflection],
  );
  const { savedAt, saving, error, markComplete } = useWorksheetSave(
    worksheetId,
    data,
  );

  function setScore(key: PriorityPillarKey, v: number) {
    setScores((prev) => ({ ...prev, [key]: v }));
  }

  async function takeSnapshot() {
    setTakingSnapshot(true);
    setSnapshotError(null);
    try {
      const res = await fetch("/api/curriculum/pillars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scores }),
      });
      const dataRes = await res.json();
      if (!res.ok) throw new Error(dataRes.error || "Snapshot failed.");
      setSnapshots((cur) => [dataRes.snapshot, ...cur].slice(0, 12));
    } catch (e) {
      setSnapshotError((e as Error).message);
    } finally {
      setTakingSnapshot(false);
    }
  }

  async function handleContinue() {
    const ok = await markComplete();
    if (ok) router.push(continueHref);
  }

  const allRated =
    PILLAR_KEYS.every((k) => typeof scores[k] === "number") &&
    PILLAR_KEYS.length > 0;

  const pillarAverages = PRIORITY_PILLARS.map((p) => {
    const vals = p.subs.map((s) => scores[s.id as PriorityPillarKey]);
    const present = vals.filter((v): v is number => typeof v === "number");
    const avg =
      present.length > 0
        ? present.reduce((a, b) => a + b, 0) / present.length
        : null;
    return { id: p.id, label: p.label, avg };
  });

  return (
    <section className="space-y-10">
      <div className="space-y-6">
        {PRIORITY_PILLARS.map((p) => (
          <div key={p.id} className="rounded-2xl border border-navy/10 bg-white p-5">
            <div className="flex items-baseline justify-between">
              <h3 className="font-serif text-[20px] font-medium text-navy">
                {p.label}
              </h3>
              {(() => {
                const avg = pillarAverages.find((x) => x.id === p.id)?.avg;
                return avg === null || avg === undefined ? null : (
                  <span className="font-sans text-[12px] font-semibold uppercase tracking-[0.16em] text-cyan-deep">
                    avg {avg.toFixed(1)}
                  </span>
                );
              })()}
            </div>
            <div className="mt-4 space-y-4">
              {p.subs.map((s) => {
                const v = scores[s.id as PriorityPillarKey];
                const display = typeof v === "number" ? v : 5;
                return (
                  <div key={s.id}>
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor={`slider-${s.id}`}
                        className="font-sans text-[14px] font-medium text-navy/85"
                      >
                        {s.label}
                      </label>
                      <span className="font-sans text-[13px] font-semibold tabular-nums text-navy">
                        {typeof v === "number" ? v : "—"} / 10
                      </span>
                    </div>
                    <input
                      id={`slider-${s.id}`}
                      type="range"
                      min={0}
                      max={10}
                      step={1}
                      value={display}
                      onChange={(e) =>
                        setScore(
                          s.id as PriorityPillarKey,
                          Number(e.target.value),
                        )
                      }
                      className="mt-2 w-full accent-cyan-deep"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="font-serif text-[22px] font-medium tracking-tight text-navy">
          What do you notice?
        </h3>
        <p className="font-sans text-[14px] font-light text-navy/65">
          Where are you most depleted? Where is your life already strong? What
          surprised you?
        </p>
        <textarea
          rows={6}
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="Take your time…"
          className="w-full resize-y rounded-2xl border border-navy/15 bg-white px-5 py-4 font-sans text-[16px] leading-[1.75] text-navy outline-none transition placeholder:text-navy/35 focus:border-cyan-deep focus:ring-2 focus:ring-cyan-deep/25"
        />
      </div>

      <div className="rounded-2xl border border-navy/10 bg-mist p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h4 className="font-serif text-[18px] font-medium text-navy">
              Take a snapshot
            </h4>
            <p className="mt-1 font-sans text-[13px] font-light text-navy/65">
              Lock in today&apos;s scores so you can watch the bars even out
              over time. Take a fresh one each month.
            </p>
          </div>
          <button
            type="button"
            onClick={takeSnapshot}
            disabled={!allRated || takingSnapshot}
            className={btnPrimary}
          >
            {takingSnapshot ? "Saving…" : "Take snapshot"}
          </button>
        </div>
        {snapshotError && (
          <p className="mt-3 font-sans text-[13px] text-[#8a6d00]">
            {snapshotError}
          </p>
        )}
        {!allRated && (
          <p className="mt-3 font-sans text-[12px] text-navy/55">
            Rate all 12 sub-pillars to enable the snapshot.
          </p>
        )}

        {snapshots.length > 0 && (
          <div className="mt-5 space-y-2">
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-navy/55">
              History — last {snapshots.length}
            </p>
            <ul className="space-y-1.5">
              {snapshots.map((s, i) => {
                const date = new Date(s.taken_at);
                const vals = PILLAR_KEYS.map((k) =>
                  typeof s[k] === "number" ? (s[k] as number) : null,
                );
                const present = vals.filter(
                  (v): v is number => typeof v === "number",
                );
                const avg =
                  present.length > 0
                    ? present.reduce((a, b) => a + b, 0) / present.length
                    : null;
                return (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded-xl bg-white px-4 py-2 font-sans text-[13px]"
                  >
                    <span className="text-navy/75">
                      {date.toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="font-semibold tabular-nums text-cyan-deep">
                      {avg !== null ? `avg ${avg.toFixed(1)}` : "—"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p
          className="font-sans text-[12px] text-navy/45"
          aria-live="polite"
          aria-atomic="true"
        >
          {saving
            ? "Saving…"
            : error
              ? "Couldn't save — we'll keep trying."
              : savedAt
                ? `Saved · ${formatSavedAt(savedAt)}`
                : "Autosaves as you slide."}
        </p>
        <button onClick={handleContinue} className={btnPrimary} disabled={saving}>
          Continue →
        </button>
      </div>
    </section>
  );
}
