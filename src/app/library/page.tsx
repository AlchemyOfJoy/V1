import type { Metadata } from "next";
import Link from "next/link";
import { listContent } from "@/lib/coach/content";

export const metadata: Metadata = {
  title: "Library",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

const MOODS = [
  "Stuck",
  "Sad",
  "Anxious",
  "Numb",
  "Curious",
  "Inspired",
  "Grieving",
  "Angry",
  "Lost",
  "Tired",
];

const CONCEPTS = [
  "Abundance",
  "Boundaries",
  "Core Narrative",
  "Dopamine Detox",
  "Expectations",
  "Forgiveness",
  "JOMO",
  "Joy Judo",
  "Law of Expansion",
  "Self-Eulogy",
  "SubScript",
  "Zero Gravity",
];

export default async function LibraryPage() {
  let principles: Awaited<ReturnType<typeof listContent>> = [];
  let chapters: typeof principles = [];
  try {
    [principles, chapters] = await Promise.all([
      listContent({ kind: "principle" }),
      listContent({ kind: "chapter" }),
    ]);
  } catch {
    // DB unavailable — render empty Library
  }

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-5 py-8 sm:py-12">
      <header>
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
          Library
        </p>
        <h1 className="mt-3 font-serif text-[38px] font-medium leading-tight tracking-tight text-navy sm:text-[44px]">
          Brent&apos;s body of <em className="text-cyan-deep">work</em>
        </h1>
        <p className="mt-3 max-w-2xl font-sans text-[16px] font-light leading-relaxed text-navy/65">
          The book, the quotes, the concepts, the bonus material. Plus the
          words you&apos;ve written through the curriculum. One searchable
          home.
        </p>
      </header>

      {/* Browse by Mood */}
      <section>
        <h2 className="font-serif text-[22px] font-medium tracking-tight text-navy">
          Browse by mood
        </h2>
        <p className="mt-1 font-sans text-[13px] font-light text-navy/55">
          Tap how you&apos;re feeling — get the quote, the tool, the move.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {MOODS.map((m) => (
            <Link
              key={m}
              href={`/library/mood/${m.toLowerCase()}`}
              className="rounded-full border border-navy/15 bg-white px-4 py-2 font-sans text-[13px] font-medium text-navy transition hover:border-cyan-deep hover:text-cyan-deep"
            >
              {m}
            </Link>
          ))}
        </div>
      </section>

      {/* Browse by Concept */}
      <section>
        <h2 className="font-serif text-[22px] font-medium tracking-tight text-navy">
          Browse by concept
        </h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {CONCEPTS.map((c) => (
            <li key={c}>
              <Link
                href={`/library/concept/${c.toLowerCase().replace(/\s+/g, "-")}`}
                className="block rounded-xl border border-navy/12 bg-white px-4 py-3 font-serif text-[15px] text-navy transition hover:border-cyan-deep/40 hover:text-cyan-deep"
              >
                {c}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-3 font-sans text-[12px] italic text-navy/45">
          Concept pages render content from the Content Studio. Add a
          piece with the matching tag to populate.
        </p>
      </section>

      {/* Brent's principles (from Content Studio) */}
      <section>
        <h2 className="font-serif text-[22px] font-medium tracking-tight text-navy">
          Brent&apos;s principles
        </h2>
        {principles.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-navy/15 bg-white p-6 font-sans text-[13px] font-light text-navy/55">
            None yet. Brent adds these in the Content Studio (kind:
            principle). Once added, they surface here automatically.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {principles.map((p) => (
              <li
                key={p.id}
                className="rounded-2xl border border-navy/12 bg-white p-5"
              >
                <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-deep">
                  {p.title}
                  {p.source && (
                    <span className="ml-2 text-navy/45">· {p.source}</span>
                  )}
                </p>
                <p className="mt-2 font-serif text-[16px] leading-[1.75] text-navy">
                  {p.body.length > 320 ? p.body.slice(0, 320) + "…" : p.body}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Book chapters (from Content Studio) */}
      <section>
        <h2 className="font-serif text-[22px] font-medium tracking-tight text-navy">
          Browse by chapter
        </h2>
        {chapters.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-navy/15 bg-white p-6 font-sans text-[13px] font-light text-navy/55">
            Empty until chapters are added in the Content Studio (kind:
            chapter). The book index will render here once they&apos;re in.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {chapters.map((c) => (
              <li
                key={c.id}
                className="rounded-2xl border border-navy/12 bg-white p-5"
              >
                <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-deep">
                  {c.title}
                </p>
                <p className="mt-2 font-serif text-[15px] leading-[1.75] text-navy/75">
                  {c.body.length > 240 ? c.body.slice(0, 240) + "…" : c.body}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
