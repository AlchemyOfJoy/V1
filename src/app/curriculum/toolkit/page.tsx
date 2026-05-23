import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { TOOLKIT } from "@/content/toolkit";

export const metadata: Metadata = {
  title: "AOJ Toolkit",
  robots: { index: false },
};

export default async function ToolkitIndex() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <main className="px-6 py-12 sm:py-16">
      <article className="mx-auto max-w-5xl space-y-10">
        <header>
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
            The AOJ Toolkit
          </p>
          <h1 className="mt-3 font-serif text-[40px] font-medium leading-tight tracking-tight text-navy sm:text-[48px]">
            Twenty tools to <em className="text-cyan-deep">return to</em>.
          </h1>
          <p className="mt-3 max-w-2xl font-sans text-[16px] font-light leading-relaxed text-navy/65">
            Quick-reference cards for the practices, frameworks, and rituals
            that show up across the curriculum and the retreats. Bookmark
            the ones you&apos;ll use most.
          </p>
        </header>

        <ul className="grid gap-3 sm:grid-cols-2">
          {TOOLKIT.map((t) => (
            <li key={t.slug}>
              <Link
                href={`/curriculum/toolkit/${t.slug}`}
                className="flex h-full flex-col rounded-2xl border border-navy/12 bg-white p-5 transition hover:border-cyan-deep/40"
              >
                <h3 className="font-serif text-[18px] font-medium leading-tight text-navy">
                  {t.title}
                </h3>
                <p className="mt-1 font-sans text-[13px] font-light italic text-navy/60">
                  {t.subtitle}
                </p>
                <p className="mt-3 font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-deep">
                  Read tool →
                </p>
              </Link>
            </li>
          ))}
        </ul>

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
