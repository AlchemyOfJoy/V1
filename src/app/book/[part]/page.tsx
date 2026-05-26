import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BOOK, findPart } from "@/lib/book";

interface Params {
  part: string;
}

export function generateStaticParams() {
  return BOOK.map((p) => ({ part: String(p.number) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { part } = await params;
  const p = findPart(Number(part));
  return {
    title: p ? `${p.title} · The Book` : "The Book",
    robots: { index: false },
  };
}

/**
 * Part detail — lists every chapter with Learn / Practice / Integrate
 * indicators (Master Prompt §15.2). Tapping a chapter that has a built
 * route deep-links into it; chapters not yet shipped are shown as
 * "Reading available in the book" without breaking the layout.
 */
export default async function PartPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { part } = await params;
  const p = findPart(Number(part));
  if (!p) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 pb-16 pt-10 sm:pt-14">
      <Link
        href="/book"
        className="font-sans text-[12px] text-slate hover:text-cyan"
      >
        ← The Book
      </Link>

      <header className="mt-8">
        <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.26em] text-cyan">
          Part {p.number_label}
        </p>
        <h1 className="mt-4 font-serif text-[44px] font-medium leading-[1.1] tracking-tight text-navy sm:text-[56px]">
          {p.title.split(p.italicWord).map((piece, i, arr) =>
            i < arr.length - 1 ? (
              <span key={i}>
                {piece}
                <em className="text-cyan">{p.italicWord}</em>
              </span>
            ) : (
              <span key={i}>{piece}</span>
            ),
          )}
        </h1>
        <p className="mt-3 font-serif text-[18px] italic leading-relaxed text-slate">
          {p.tagline}.
        </p>
      </header>

      <div aria-hidden className="my-10 h-px w-16 bg-slate/30" />

      <ol className="space-y-0">
        {p.chapters.map((ch) => {
          const numLabel = String(ch.number).padStart(2, "0");
          const Inner = (
            <div className="flex items-start gap-6 border-b border-slate/15 py-7 transition-colors duration-150">
              <span
                aria-hidden
                className="font-serif text-[24px] font-medium leading-none text-slate"
              >
                {numLabel}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-slate">
                  Chapter {numLabel}
                </p>
                <h3 className="mt-1 font-serif text-[22px] font-medium leading-tight text-navy">
                  {ch.title}
                </h3>
                <div className="mt-2 space-y-0.5 font-sans text-[13px] font-light text-slate">
                  <p>
                    <span className="font-semibold text-navy">Learn</span> ·
                    the chapter
                  </p>
                  {ch.practice && (
                    <p>
                      <span className="font-semibold text-navy">Practice</span>{" "}
                      · {ch.practice}
                    </p>
                  )}
                  {ch.meditation && (
                    <p>
                      <span className="font-semibold text-navy">
                        Integrate
                      </span>{" "}
                      · {ch.meditation}
                    </p>
                  )}
                </div>
              </div>
              {ch.href ? (
                <span
                  aria-hidden
                  className="font-sans text-[18px] text-cyan transition-transform duration-150"
                >
                  →
                </span>
              ) : (
                <span className="font-sans text-[10px] uppercase tracking-[0.18em] text-slate/55">
                  In the book
                </span>
              )}
            </div>
          );
          return (
            <li key={ch.number}>
              {ch.href ? (
                <Link href={ch.href} className="block hover:bg-slate/5">
                  {Inner}
                </Link>
              ) : (
                <div className="block">{Inner}</div>
              )}
            </li>
          );
        })}
      </ol>
    </main>
  );
}
