import type { Metadata } from "next";
import Link from "next/link";
import { BOOK } from "@/lib/book";

export const metadata: Metadata = {
  title: "The Book",
  robots: { index: false },
};

/**
 * THE BOOK — the curriculum library (Master Prompt §15).
 *
 * Editorial home for Brent's 4 Parts × 20 Chapters. Most Challenge-Mode
 * users rarely visit; the Daily Session surfaces what they need. The
 * Book is for reference, deeper exploration, and revisiting.
 *
 * Layout: pure white, large numerals + Garamond titles, sharp corners,
 * 1px slate dividers, no shadows. Per §4.6.
 */
export default function BookPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 pb-16 pt-10 sm:pt-14">
      <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.26em] text-cyan">
        The Methodology
      </p>
      <h1 className="mt-4 font-serif text-[44px] font-medium leading-[1.1] tracking-tight text-navy sm:text-[56px]">
        The Book
      </h1>
      <p className="mt-3 font-serif text-[18px] italic leading-relaxed text-slate">
        Four Parts. Twenty chapters. Learn, practice, integrate.
      </p>

      <div aria-hidden className="my-10 h-px w-16 bg-slate/30" />

      <ol className="space-y-0">
        {BOOK.map((part) => (
          <li key={part.number}>
            <Link
              href={`/book/${part.number}`}
              className="group block border-b border-slate/15 py-8 transition-colors duration-150 hover:bg-slate/5"
            >
              <div className="flex items-start gap-6">
                <span
                  aria-hidden
                  className="font-serif text-[36px] font-medium leading-none text-slate group-hover:text-cyan"
                >
                  {part.number_label}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-slate">
                    Part {part.number_label}
                  </p>
                  <h2 className="mt-1 font-serif text-[28px] font-medium leading-tight text-navy">
                    {part.title}
                  </h2>
                  <p className="mt-1 font-sans text-[14px] font-light text-slate">
                    {part.chapters.length} chapter
                    {part.chapters.length === 1 ? "" : "s"} · {part.tagline}
                  </p>
                </div>
                <span
                  aria-hidden
                  className="font-sans text-[20px] text-slate transition-transform duration-150 group-hover:translate-x-1 group-hover:text-cyan"
                >
                  →
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ol>

      <p
        aria-hidden
        className="mt-12 text-center font-serif text-[24px] text-gold"
      >
        ✦
      </p>
    </main>
  );
}
