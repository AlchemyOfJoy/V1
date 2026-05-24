import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { findModule } from "@/lib/curriculum";
import { BOLD_ACTION_TOOLS } from "@/lib/bold-action";
import WorksheetShell from "@/components/curriculum/WorksheetShell";
import BoldActionContent from "@/content/workbook/module-04-bold-action";

export const metadata: Metadata = {
  title: "Module 4 — Take Bold Action",
  robots: { index: false },
};

export default async function Module04Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const mod = findModule("04-bold-action");
  if (!mod) redirect("/curriculum");

  return (
    <main className="px-6 py-12 sm:py-16">
      <WorksheetShell
        module={mod}
        help={{
          whatItIs:
            "Ten short, structured practices — most take under three minutes. They turn the inner work of Modules 1–3 into actual moves in your real life.",
          howToDoIt:
            "Open the drawer. Pick whichever tool fits the moment. Do it. Log it. Come back tomorrow. Don't try all ten at once — let them accumulate.",
        }}
      >
        <BoldActionContent />

        <section className="space-y-4">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-deep">
            The drawer
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {BOLD_ACTION_TOOLS.map((t, i) => {
              const before = t.title.replace(t.italicWord, "").trim();
              return (
                <li key={t.slug}>
                  <Link
                    href={`/curriculum/module/04-bold-action/${t.slug}`}
                    className="group block h-full rounded-2xl border border-navy/12 bg-white p-5 transition hover:border-cyan-deep/40"
                  >
                    <div className="flex items-baseline justify-between">
                      <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-navy/40">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-sans text-[10px] uppercase tracking-[0.16em] text-cyan-deep">
                        ~{Math.round(t.durationSec / 60)} min
                      </span>
                    </div>
                    <h3 className="mt-2 font-serif text-[20px] font-medium text-navy">
                      {before}{" "}
                      <em className="text-cyan-deep">{t.italicWord}</em>
                    </h3>
                    <p className="mt-2 font-sans text-[13px] font-light leading-relaxed text-navy/65">
                      {t.oneLiner}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </WorksheetShell>
    </main>
  );
}
