import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { WORKSHEET_IDS, PRIORITY_PILLARS } from "@/lib/curriculum";
import { listForgivenessSubjects } from "@/lib/forgiveness";
import { listJoyItems } from "@/lib/list-of-joy";
import { listSnapshots } from "@/lib/pillars";
import type {
  CoreNarrativeData,
  ScienceOfJoyData,
  SelfEulogyData,
  SubscriptData,
  PriorityPillarsData,
  PriorityPillarKey,
} from "@/lib/curriculum";
import ExportActions from "@/components/curriculum/ExportActions";

export const metadata: Metadata = {
  title: "Export your work",
  robots: { index: false },
};

interface WorksheetRow {
  worksheet_id: string;
  data: unknown;
  completed_at: string | Date | null;
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10 first:mt-0 print:break-inside-avoid">
      <h2 className="font-serif text-[26px] font-medium tracking-tight text-navy">
        {title}
      </h2>
      <div className="mt-3 space-y-3 font-serif text-[16px] leading-[1.85] text-navy/90">
        {children}
      </div>
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  if (!children || (typeof children === "string" && !children.trim()))
    return (
      <p className="font-sans text-[13px] italic text-navy/45">— Not yet written —</p>
    );
  return <p className="whitespace-pre-wrap">{children}</p>;
}

export default async function ExportPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [worksheetRows, joys, snapshots, forgiveness, subscriptRows, lastAssess] =
    await Promise.all([
      query<WorksheetRow>(
        `SELECT worksheet_id, data, completed_at
           FROM worksheet_responses WHERE user_id = $1`,
        [user.id],
      ),
      listJoyItems(user.id, Number.POSITIVE_INFINITY),
      listSnapshots(user.id, 1),
      listForgivenessSubjects(user.id),
      query<{
        version: number;
        target_date: string | Date | null;
        manifestations: string[];
        affirmations: string[];
        emotion_anchor: string | null;
      }>(
        `SELECT version, target_date, manifestations, affirmations, emotion_anchor
           FROM subscripts WHERE user_id = $1 AND is_active = true
           ORDER BY version DESC LIMIT 1`,
        [user.id],
      ),
      query<{ score: number; created_at: string | Date }>(
        `SELECT score, created_at FROM assessments
          WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
        [user.id],
      ),
    ]);

  const ws = new Map<string, unknown>();
  for (const r of worksheetRows) ws.set(r.worksheet_id, r.data);

  const science = (ws.get(WORKSHEET_IDS.scienceOfJoy) ?? {}) as ScienceOfJoyData;
  const core = (ws.get(WORKSHEET_IDS.coreNarrative) ?? {}) as CoreNarrativeData;
  const eulogy = (ws.get(WORKSHEET_IDS.selfEulogy) ?? {}) as SelfEulogyData;
  const pillars = (ws.get(WORKSHEET_IDS.priorityPillars) ??
    {}) as PriorityPillarsData;
  const subscript = (ws.get(WORKSHEET_IDS.subscript) ?? {}) as SubscriptData;
  const activeSubscript = subscriptRows[0];

  const latestSnap = snapshots[0];
  const latestJq = lastAssess[0];

  return (
    <main className="px-6 py-12 sm:py-16 print:px-0 print:py-0">
      <article className="mx-auto max-w-3xl print:max-w-full">
        <header className="space-y-4 print:space-y-2">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
            Your workbook · {new Date().toLocaleDateString()}
          </p>
          <h1 className="font-serif text-[40px] font-medium leading-tight tracking-tight text-navy sm:text-[48px]">
            <em className="text-cyan-deep">Export</em> your work
          </h1>
          <p className="font-sans text-[16px] font-light leading-relaxed text-navy/65 print:hidden">
            Use Print / Save as PDF for a printable version, or download
            JSON for a full backup of every entry.
          </p>
          <ExportActions />
        </header>

        <div className="mt-12 space-y-12">
          {latestJq && (
            <Section title="Your latest Joy Quotient">
              <p>
                Score{" "}
                <strong className="text-cyan-deep">{latestJq.score}</strong>{" "}
                · {new Date(latestJq.created_at).toLocaleDateString()}
              </p>
            </Section>
          )}

          <Section title="Module 1 — Science of Joy">
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-navy/55">
              Reflection
            </p>
            <P>{science.reflection ?? ""}</P>
          </Section>

          <Section title="Module 2 — Core Narrative">
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-navy/55">
              Old narratives
            </p>
            <ul className="list-disc pl-5">
              {(core.old_narratives ?? []).map((s, i) =>
                s ? <li key={`o-${i}`}>{s}</li> : null,
              )}
            </ul>
            <p className="mt-4 font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-navy/55">
              New narratives
            </p>
            <ul className="list-disc pl-5">
              {(core.new_narratives ?? []).map((s, i) =>
                s ? <li key={`n-${i}`}>{s}</li> : null,
              )}
            </ul>
            <p className="mt-4 font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-navy/55">
              Reflection
            </p>
            <P>{core.reflection ?? ""}</P>
          </Section>

          <Section title="Module 2 — Self Eulogy">
            <P>{eulogy.eulogy ?? ""}</P>
          </Section>

          <Section title="Module 2 — The List of Joy™">
            {joys.length === 0 ? (
              <P>{""}</P>
            ) : (
              <ul className="list-disc pl-5">
                {joys.map((j) => (
                  <li key={String(j.id)}>{j.content}</li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Module 2 — Priority Pillars">
            {latestSnap ? (
              <div>
                <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-navy/55">
                  Latest snapshot ·{" "}
                  {new Date(latestSnap.taken_at).toLocaleDateString()}
                </p>
                <ul className="mt-2 space-y-1">
                  {PRIORITY_PILLARS.map((p) => (
                    <li key={p.id}>
                      <strong>{p.label}.</strong>{" "}
                      {p.subs
                        .map((s) => {
                          const v =
                            (latestSnap as unknown as Record<
                              PriorityPillarKey,
                              number | null
                            >)[s.id as PriorityPillarKey];
                          return `${s.label} ${v ?? "—"}`;
                        })
                        .join(" · ")}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <P>{""}</P>
            )}
            {pillars.reflection && (
              <>
                <p className="mt-4 font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-navy/55">
                  Reflection
                </p>
                <P>{pillars.reflection}</P>
              </>
            )}
          </Section>

          <Section title="Module 2 — Subconscious Script">
            {activeSubscript ? (
              <>
                {activeSubscript.target_date && (
                  <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-deep">
                    By{" "}
                    {new Date(
                      activeSubscript.target_date,
                    ).toLocaleDateString()}{" "}
                    · v{activeSubscript.version}
                  </p>
                )}
                {activeSubscript.emotion_anchor && (
                  <>
                    <p className="mt-3 font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-navy/55">
                      Joy Spark anchor
                    </p>
                    <p className="italic">{activeSubscript.emotion_anchor}</p>
                  </>
                )}
                <p className="mt-3 font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-navy/55">
                  Manifestations
                </p>
                <ul className="list-disc pl-5">
                  {(activeSubscript.manifestations ?? []).map((m, i) => (
                    <li key={`m-${i}`}>{m}</li>
                  ))}
                </ul>
                <p className="mt-3 font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-navy/55">
                  Affirmations
                </p>
                <ul className="list-disc pl-5">
                  {(activeSubscript.affirmations ?? []).map((m, i) => (
                    <li key={`a-${i}`}>{m}</li>
                  ))}
                </ul>
              </>
            ) : subscript.manifestations || subscript.affirmations ? (
              <>
                {subscript.target_date && (
                  <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-deep">
                    By {new Date(subscript.target_date).toLocaleDateString()}
                  </p>
                )}
                <ul className="list-disc pl-5">
                  {(subscript.manifestations ?? []).map((m, i) => (
                    <li key={`dm-${i}`}>{m}</li>
                  ))}
                </ul>
              </>
            ) : (
              <P>{""}</P>
            )}
          </Section>

          <Section title="Module 3 — Forgiveness Framework">
            {forgiveness.length === 0 ? (
              <P>{""}</P>
            ) : (
              forgiveness.map((s) => (
                <article
                  key={String(s.id)}
                  className="mt-6 border-t border-navy/10 pt-4 first:mt-0 first:border-0 first:pt-0"
                >
                  <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-deep">
                    For {s.subject_name}
                    {s.completed_at ? " · Released" : ""}
                  </p>
                  <p className="mt-2 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-navy/55">
                    Victim Rant
                  </p>
                  <P>{s.victim_rant ?? ""}</P>
                  <p className="mt-3 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-navy/55">
                    Empath Rave
                  </p>
                  <P>{s.empath_rave ?? ""}</P>
                  <p className="mt-3 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-navy/55">
                    Universal Meaning
                  </p>
                  <P>{s.universal_meaning ?? ""}</P>
                  <p className="mt-3 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-navy/55">
                    Forgiveness Statement
                  </p>
                  <P>{s.forgiveness_statement ?? ""}</P>
                </article>
              ))
            )}
          </Section>
        </div>

        <footer className="mt-16 border-t border-navy/10 pt-6 text-center font-sans text-[12px] text-navy/45 print:mt-12">
          Alchemy of Joy™ · {user.name ?? user.email}
        </footer>
      </article>
    </main>
  );
}
