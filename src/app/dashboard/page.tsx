import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db, AssessmentRow } from "@/lib/db";
import { getBand } from "@/lib/questions";
import { btnPrimary, btnPrimarySm, eyebrow } from "@/lib/ui";
import SiteHeader from "@/components/SiteHeader";
import ScoreChart from "@/components/ScoreChart";
import ScoreRubric from "@/components/ScoreRubric";
import {
  LatestIcon,
  ChangeIcon,
  CheckinsIcon,
  SparkCluster,
} from "@/components/icons";

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
      <main className="mx-auto max-w-3xl px-6 py-20">
        <p className={eyebrow}>Your Progress</p>
        <h1 className="mt-3 font-serif text-[38px] font-medium tracking-tight text-navy">
          Your joy <em className="text-cyan">journey</em>
          {greeting}
        </h1>

        {rows.length === 0 ? (
          <div className="mt-12 rounded-2xl bg-navy px-8 py-20 text-center">
            <SparkCluster className="mx-auto" />
            <h2 className="mt-5 font-serif text-[28px] font-medium tracking-tight text-white">
              Set your <em className="text-cyan">starting line</em>
            </h2>
            <p className="mx-auto mt-3 max-w-sm font-sans text-[15px] font-light leading-relaxed text-white/60">
              Take your first JQ assessment to capture where you are today. It
              only takes about five minutes.
            </p>
            <div className="mt-8 flex justify-center">
              <Link href="/assessment" className={btnPrimary}>
                Take your first assessment
              </Link>
            </div>
          </div>
        ) : (
          <>
            {newId && latest?.id === newId && (
              <div className="mt-6 flex items-center gap-2.5 rounded-xl border border-cyan/30 bg-cyan/10 px-4 py-3">
                <span className="text-gold" aria-hidden>
                  ✦
                </span>
                <p className="font-sans text-[13px] text-navy/80">
                  Your assessment was saved — here&apos;s how your joy is
                  trending.
                </p>
              </div>
            )}

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-mist p-6">
                <div className="flex items-center justify-between">
                  <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-navy/45">
                    Latest JQ
                  </p>
                  <LatestIcon size={20} className="text-cyan" />
                </div>
                <p className="mt-3 font-serif text-[44px] font-medium leading-none tracking-tight text-navy">
                  {latest.score}
                  <span className="font-sans text-[16px] font-light text-navy/40">
                    {" "}
                    / 50
                  </span>
                </p>
                <p
                  className="mt-3 font-sans text-[12px] font-bold uppercase tracking-[0.14em]"
                  style={{ color: getBand(latest.score).color }}
                >
                  {getBand(latest.score).label}
                </p>
              </div>
              <div className="rounded-2xl bg-mist p-6">
                <div className="flex items-center justify-between">
                  <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-navy/45">
                    Change
                  </p>
                  <ChangeIcon size={20} className="text-cyan" />
                </div>
                <p
                  className="mt-3 font-serif text-[44px] font-medium leading-none tracking-tight"
                  style={{
                    color:
                      delta === null || delta === 0
                        ? "var(--navy)"
                        : delta > 0
                          ? "var(--cyan)"
                          : "var(--slate)",
                  }}
                >
                  {delta === null
                    ? "—"
                    : delta > 0
                      ? `+${delta}`
                      : `${delta}`}
                </p>
                <p className="mt-3 font-sans text-[13px] font-light text-navy/60">
                  {delta === null
                    ? "Take another to compare"
                    : delta > 0
                      ? "Joy is rising"
                      : delta < 0
                        ? "A dip — be gentle with yourself"
                        : "Holding steady"}
                </p>
              </div>
              <div className="rounded-2xl bg-mist p-6">
                <div className="flex items-center justify-between">
                  <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-navy/45">
                    Check-ins
                  </p>
                  <CheckinsIcon size={20} className="text-cyan" />
                </div>
                <p className="mt-3 font-serif text-[44px] font-medium leading-none tracking-tight text-navy">
                  {rows.length}
                </p>
                <p className="mt-3 font-sans text-[13px] font-light text-navy/60">
                  Since {fmtDate(rows[0].created_at)}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-mist p-6">
              <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-navy/45">
                Score over time
              </p>
              <div className="mt-4">
                <ScoreChart
                  data={rows.map((r) => ({
                    score: r.score,
                    date: fmtDate(r.created_at),
                  }))}
                />
              </div>
            </div>

            <div className="mt-12">
              <ScoreRubric score={latest.score} />
            </div>

            <div className="mt-14">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-[26px] font-medium tracking-tight text-navy">
                  History
                </h2>
                <Link href="/assessment" className={btnPrimarySm}>
                  New check-in
                </Link>
              </div>
              <ul className="mt-5 divide-y divide-navy/8 overflow-hidden rounded-2xl bg-mist">
                {[...rows].reverse().map((r) => {
                  const band = getBand(r.score);
                  return (
                    <li
                      key={r.id}
                      className="flex items-center gap-4 px-5 py-4"
                    >
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-serif text-[20px] font-medium"
                        style={{
                          backgroundColor: band.color,
                          color:
                            band.color === "#d4af37"
                              ? "#00171f"
                              : "#ffffff",
                        }}
                      >
                        {r.score}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2.5">
                          <span className="font-sans text-[12px] font-bold uppercase tracking-[0.12em] text-navy">
                            {band.label}
                          </span>
                          <span className="font-sans text-[12px] text-navy/45">
                            {fmtDate(r.created_at, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        {r.note && (
                          <p className="mt-1 truncate font-sans text-[13px] font-light text-navy/60">
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
