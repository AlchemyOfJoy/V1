import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db, AssessmentRow } from "@/lib/db";
import { getBand } from "@/lib/questions";
import SiteHeader from "@/components/SiteHeader";
import ScoreChart from "@/components/ScoreChart";

function fmtDate(iso: string, opts?: Intl.DateTimeFormatOptions) {
  const d = new Date(iso.replace(" ", "T") + "Z");
  return d.toLocaleDateString("en-US", opts ?? { month: "short", day: "numeric" });
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { new: newId } = await searchParams;

  const rows = db
    .prepare(
      "SELECT * FROM assessments WHERE user_id = ? ORDER BY created_at ASC",
    )
    .all(user.id) as AssessmentRow[];

  const latest = rows[rows.length - 1];
  const previous = rows[rows.length - 2];
  const delta = latest && previous ? latest.score - previous.score : null;
  const greeting = user.name ? `, ${user.name}` : "";

  return (
    <>
      <SiteHeader user={user} />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-bold text-amber-950">
          Your joy journey{greeting}
        </h1>

        {rows.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-amber-200 bg-white p-10 text-center">
            <div className="text-4xl">🌱</div>
            <h2 className="mt-3 text-lg font-semibold text-amber-900">
              No assessments yet
            </h2>
            <p className="mx-auto mt-1 max-w-sm text-sm text-stone-600">
              Take your first JQ assessment to set your starting line. It only
              takes about 5 minutes.
            </p>
            <Link
              href="/assessment"
              className="mt-5 inline-block rounded-full bg-amber-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600"
            >
              Take your first assessment
            </Link>
          </div>
        ) : (
          <>
            {newId && latest?.id === newId && (
              <div className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
                ✨ Your assessment was saved. Here&apos;s how your joy is
                trending.
              </div>
            )}

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-amber-200 bg-white p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
                  Latest JQ
                </p>
                <p className="mt-1 text-3xl font-bold text-amber-600">
                  {latest.score}
                  <span className="text-base text-stone-400"> / 50</span>
                </p>
                <p
                  className="mt-1 text-sm font-semibold"
                  style={{ color: getBand(latest.score).color }}
                >
                  {getBand(latest.score).label}
                </p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-white p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
                  Change
                </p>
                <p className="mt-1 text-3xl font-bold text-amber-900">
                  {delta === null
                    ? "—"
                    : delta > 0
                      ? `+${delta}`
                      : `${delta}`}
                </p>
                <p className="mt-1 text-sm text-stone-500">
                  {delta === null
                    ? "Take another to compare"
                    : delta > 0
                      ? "Joy is rising 📈"
                      : delta < 0
                        ? "A dip — be gentle with yourself"
                        : "Holding steady"}
                </p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-white p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
                  Check-ins
                </p>
                <p className="mt-1 text-3xl font-bold text-amber-900">
                  {rows.length}
                </p>
                <p className="mt-1 text-sm text-stone-500">
                  Since {fmtDate(rows[0].created_at)}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-amber-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-amber-900">
                Score over time
              </h2>
              <div className="mt-2">
                <ScoreChart
                  data={rows.map((r) => ({
                    score: r.score,
                    date: fmtDate(r.created_at),
                  }))}
                />
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-amber-900">
                  History
                </h2>
                <Link
                  href="/assessment"
                  className="rounded-full bg-amber-500 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-amber-600"
                >
                  New check-in
                </Link>
              </div>
              <ul className="mt-3 space-y-2">
                {[...rows].reverse().map((r) => {
                  const band = getBand(r.score);
                  return (
                    <li
                      key={r.id}
                      className="flex items-start gap-4 rounded-xl border border-amber-100 bg-white px-4 py-3"
                    >
                      <div
                        className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg text-white"
                        style={{ backgroundColor: band.color }}
                      >
                        <span className="text-lg font-bold leading-none">
                          {r.score}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-amber-900">
                            {band.label}
                          </span>
                          <span className="text-xs text-stone-400">
                            {fmtDate(r.created_at, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        {r.note && (
                          <p className="mt-0.5 truncate text-sm text-stone-600">
                            {r.note}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </>
        )}
      </main>
    </>
  );
}
