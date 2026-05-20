import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db, AssessmentRow } from "@/lib/db";
import { getBand } from "@/lib/questions";
import SiteHeader from "@/components/SiteHeader";
import ScoreChart from "@/components/ScoreChart";

function fmtDate(iso: string, opts?: Intl.DateTimeFormatOptions) {
  const d = new Date(iso.replace(" ", "T") + "Z");
  return d.toLocaleDateString(
    "en-US",
    opts ?? { month: "short", day: "numeric" },
  );
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
      <main className="mx-auto max-w-3xl px-6 py-14">
        <h1 className="text-[32px] font-semibold tracking-tight text-ink">
          Your joy journey{greeting}
        </h1>

        {rows.length === 0 ? (
          <div className="mt-10 rounded-3xl bg-canvas px-8 py-16 text-center">
            <h2 className="text-[20px] font-semibold tracking-tight text-ink">
              Set your starting line
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-ink-2">
              Take your first JQ assessment to capture where you are today. It
              only takes about five minutes.
            </p>
            <Link
              href="/assessment"
              className="mt-7 inline-block rounded-full bg-accent px-6 py-3 text-[15px] font-medium text-white transition-opacity hover:opacity-90"
            >
              Take your first assessment
            </Link>
          </div>
        ) : (
          <>
            {newId && latest?.id === newId && (
              <div className="mt-5 rounded-xl bg-accent/10 px-4 py-3 text-[13px] font-medium text-[#b35f00]">
                Your assessment was saved — here&apos;s how your joy is
                trending.
              </div>
            )}

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-hairline p-5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-3">
                  Latest JQ
                </p>
                <p className="mt-2 text-[40px] font-semibold leading-none tracking-tight text-ink">
                  {latest.score}
                  <span className="text-[17px] font-normal text-ink-3">
                    {" "}
                    / 50
                  </span>
                </p>
                <p
                  className="mt-2 text-[13px] font-medium"
                  style={{ color: getBand(latest.score).color }}
                >
                  {getBand(latest.score).label}
                </p>
              </div>
              <div className="rounded-2xl border border-hairline p-5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-3">
                  Change
                </p>
                <p
                  className="mt-2 text-[40px] font-semibold leading-none tracking-tight"
                  style={{
                    color:
                      delta === null || delta === 0
                        ? "var(--ink)"
                        : delta > 0
                          ? "#1d9d4f"
                          : "#c0612f",
                  }}
                >
                  {delta === null
                    ? "—"
                    : delta > 0
                      ? `+${delta}`
                      : `${delta}`}
                </p>
                <p className="mt-2 text-[13px] text-ink-2">
                  {delta === null
                    ? "Take another to compare"
                    : delta > 0
                      ? "Joy is rising"
                      : delta < 0
                        ? "A dip — be gentle with yourself"
                        : "Holding steady"}
                </p>
              </div>
              <div className="rounded-2xl border border-hairline p-5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-3">
                  Check-ins
                </p>
                <p className="mt-2 text-[40px] font-semibold leading-none tracking-tight text-ink">
                  {rows.length}
                </p>
                <p className="mt-2 text-[13px] text-ink-2">
                  Since {fmtDate(rows[0].created_at)}
                </p>
              </div>
            </div>

            <div className="mt-3 rounded-2xl border border-hairline p-6">
              <h2 className="text-[15px] font-semibold text-ink">
                Score over time
              </h2>
              <div className="mt-3">
                <ScoreChart
                  data={rows.map((r) => ({
                    score: r.score,
                    date: fmtDate(r.created_at),
                  }))}
                />
              </div>
            </div>

            <div className="mt-10">
              <div className="flex items-center justify-between">
                <h2 className="text-[20px] font-semibold tracking-tight text-ink">
                  History
                </h2>
                <Link
                  href="/assessment"
                  className="rounded-full bg-accent px-4 py-2 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
                >
                  New check-in
                </Link>
              </div>
              <ul className="mt-4 divide-y divide-hairline overflow-hidden rounded-2xl border border-hairline">
                {[...rows].reverse().map((r) => {
                  const band = getBand(r.score);
                  return (
                    <li
                      key={r.id}
                      className="flex items-center gap-4 px-5 py-4"
                    >
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[17px] font-semibold text-white"
                        style={{ backgroundColor: band.color }}
                      >
                        {r.score}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-[15px] font-medium text-ink">
                            {band.label}
                          </span>
                          <span className="text-[12px] text-ink-3">
                            {fmtDate(r.created_at, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        {r.note && (
                          <p className="mt-0.5 truncate text-[13px] text-ink-2">
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
