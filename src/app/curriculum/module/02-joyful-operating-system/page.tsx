import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { findModule } from "@/lib/curriculum";
import ContextualHelp from "@/components/curriculum/ContextualHelp";

export const metadata: Metadata = {
  title: "Module 2 — Joyful Operating System®",
  robots: { index: false },
};

export default async function Module02Overview() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const mod = findModule("02-joyful-operating-system");
  if (!mod) redirect("/curriculum");

  return (
    <main className="px-6 py-12 sm:py-16">
      <article className="mx-auto max-w-3xl space-y-10">
        <header>
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
            Module 2
          </p>
          <h1 className="mt-3 font-serif text-[40px] font-medium leading-tight tracking-tight text-navy sm:text-[48px]">
            Joyful Operating <em className="text-cyan-deep">System</em>®
          </h1>
          <p className="mt-3 max-w-2xl font-sans text-[16px] font-light leading-relaxed text-navy/65">
            {mod.subtitle}
          </p>
        </header>

        <ContextualHelp
          whatItIs="Your Joyful Operating System® (JOS) is the inner architecture you live from — the stories you believe, the eulogy you want spoken, the things that bring you joy, the priorities holding up your life, and the script you read to your subconscious every day."
          howToDoIt="Work through the five sections in order if you can. Each builds on the last: name your stories, write your eulogy, gather your joys, see where you're depleted, then anchor your SubScript. Save and exit any time — your work is waiting."
          whereInBook={mod.workbookPage}
        />

        <ol className="space-y-3">
          {mod.sections.map((s, i) => {
            const available = s.status === "available";
            return (
              <li key={s.id}>
                <Link
                  href={`/curriculum/module/02-joyful-operating-system/${s.slug}`}
                  className="flex items-start gap-5 rounded-2xl border border-navy/12 bg-white p-5 transition hover:border-cyan-deep/40"
                >
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-serif text-[20px] font-medium ${
                      available
                        ? "bg-cyan-deep text-white"
                        : "bg-mist text-navy/55"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="font-serif text-[19px] font-medium text-navy">
                        {s.title}
                      </h3>
                      {!available && (
                        <span className="shrink-0 font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-navy/45">
                          In development
                        </span>
                      )}
                    </div>
                    {s.subtitle && (
                      <p className="mt-1 font-sans text-[13px] font-light leading-relaxed text-navy/65">
                        {s.subtitle}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>

        <footer className="border-t border-navy/10 pt-6">
          <Link
            href="/curriculum"
            className="font-sans text-[13px] text-navy/55 transition-colors duration-150 hover:text-cyan-deep"
          >
            ← Back to curriculum
          </Link>
        </footer>
      </article>
    </main>
  );
}
