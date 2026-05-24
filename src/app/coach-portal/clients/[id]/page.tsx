import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCoachUser } from "@/lib/role";
import { query } from "@/lib/db";
import { listShared } from "@/lib/sharing";

export const metadata: Metadata = {
  title: "Client · Coach Portal",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function CoachClientDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const coach = (await getCoachUser())!;
  const { id } = await params;

  // Authorization — coach can only view their own assigned clients.
  const rows = await query<{
    id: string;
    email: string;
    name: string | null;
    coach_id: string | null;
  }>(`SELECT id, email, name, coach_id FROM users WHERE id = $1`, [id]);
  const client = rows[0];
  if (!client || client.coach_id !== coach.id) notFound();

  // What this client has shared with this coach
  const grants = await listShared(client.id, coach.id);
  const sharedByKind = new Map<string, number>();
  for (const g of grants) {
    sharedByKind.set(
      g.resource_type,
      (sharedByKind.get(g.resource_type) ?? 0) + 1,
    );
  }

  // Methodology progress — always visible to assigned coach (this is
  // structural metadata, not deep private writing)
  const [worksheets, joyCount, forgivenessCount] = await Promise.all([
    query<{ worksheet_id: string; completed_at: string | Date | null }>(
      `SELECT worksheet_id, completed_at FROM worksheet_responses WHERE user_id = $1`,
      [client.id],
    ),
    query<{ c: string }>(
      `SELECT COUNT(*)::text AS c FROM list_of_joy_items WHERE user_id = $1`,
      [client.id],
    ),
    query<{ c: string }>(
      `SELECT COUNT(*)::text AS c FROM forgiveness_subjects
         WHERE user_id = $1 AND completed_at IS NOT NULL`,
      [client.id],
    ),
  ]);

  // Notes
  const notes = await query<{
    id: string;
    body: string;
    created_at: string | Date;
  }>(
    `SELECT id::text AS id, body, created_at FROM coach_notes
       WHERE coach_id = $1 AND client_id = $2
       ORDER BY created_at DESC
       LIMIT 20`,
    [coach.id, client.id],
  );

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-6 py-10">
      <Link
        href="/coach-portal"
        className="inline-block font-sans text-[12px] text-navy/55 hover:text-cyan-deep"
      >
        ← Clients
      </Link>

      <header>
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
          Client
        </p>
        <h1 className="mt-2 font-serif text-[34px] font-medium leading-tight tracking-tight text-navy sm:text-[40px]">
          {client.name ?? client.email}
        </h1>
        {client.name && (
          <p className="mt-1 font-sans text-[13px] text-navy/55">
            {client.email}
          </p>
        )}
      </header>

      {/* Methodology progress — always visible */}
      <section className="grid grid-cols-3 gap-3">
        <Stat
          label="Worksheets done"
          value={worksheets.filter((w) => w.completed_at).length}
        />
        <Stat label="List of Joy" value={Number(joyCount[0]?.c ?? 0)} />
        <Stat
          label="Forgivenesses"
          value={Number(forgivenessCount[0]?.c ?? 0)}
        />
      </section>

      {/* Shared by client — the trust contract */}
      <section>
        <h2 className="font-serif text-[22px] font-medium tracking-tight text-navy">
          Shared with you
        </h2>
        <p className="mt-1 font-sans text-[12px] font-light text-navy/55">
          Private writing is private by default. These are items the
          client has explicitly shared.
        </p>
        {grants.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-navy/15 bg-white p-6 text-center font-sans text-[13px] font-light text-navy/55">
            Nothing shared yet. The client controls what you see.
          </p>
        ) : (
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {Array.from(sharedByKind.entries()).map(([kind, count]) => (
              <li
                key={kind}
                className="flex items-center justify-between rounded-2xl border border-cyan-deep/25 bg-white px-4 py-3"
              >
                <span className="font-sans text-[13px] font-medium text-navy">
                  {kindLabel(kind)}
                </span>
                <span className="font-sans text-[12px] font-semibold text-cyan-deep">
                  {count} shared
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Coach's private notes */}
      <section>
        <h2 className="font-serif text-[22px] font-medium tracking-tight text-navy">
          Your notes
        </h2>
        <p className="mt-1 font-sans text-[12px] font-light text-navy/55">
          Private to you. The client never sees these.
        </p>
        {notes.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-navy/15 bg-white p-6 text-center font-sans text-[13px] font-light text-navy/55">
            Note-writing UI ships in Phase 2. The data model is ready.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {notes.map((n) => (
              <li
                key={n.id}
                className="rounded-2xl border border-navy/10 bg-mist/40 p-4"
              >
                <p className="font-sans text-[11px] uppercase tracking-[0.16em] text-navy/45">
                  {new Date(n.created_at).toLocaleString()}
                </p>
                <p className="mt-1 whitespace-pre-wrap font-serif text-[15px] leading-relaxed text-navy">
                  {n.body}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-navy/10 bg-white p-4 text-center">
      <p className="font-serif text-[24px] font-medium tabular-nums text-navy">
        {value}
      </p>
      <p className="mt-0.5 font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-navy/45">
        {label}
      </p>
    </div>
  );
}

function kindLabel(kind: string): string {
  return (
    {
      worksheet: "Worksheets",
      forgiveness: "Forgiveness work",
      list_of_joy: "List of Joy",
      journal: "Journal entries",
      subscript_active: "SubScript",
      pillar_snapshot: "Priority Pillars",
      jq_history: "JQ history",
      challenge_progress: "Challenge progress",
    }[kind] ?? kind
  );
}
