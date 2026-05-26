import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { QUOTES_BY_ID } from "@/lib/quotes";

export const metadata: Metadata = {
  title: "My Joy Library",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function MyJoyLibraryPage() {
  const user = (await getCurrentUser())!;
  const rows = await query<{ quote_id: string; created_at: string | Date }>(
    `SELECT quote_id, created_at FROM quote_favorites
       WHERE user_id = $1 ORDER BY created_at DESC`,
    [user.id],
  );

  const favorites = rows
    .map((r) => {
      const q = QUOTES_BY_ID.get(r.quote_id);
      if (!q) return null;
      return { ...q, saved_at: r.created_at };
    })
    .filter(<T,>(v: T | null): v is T => v !== null);

  return (
    <main className="mx-auto max-w-2xl space-y-8 px-5 pb-16 pt-8 sm:pt-12">
      <Link
        href="/me"
        className="inline-block font-sans text-[12px] text-navy/55 hover:text-cyan-deep"
      >
        ← Me
      </Link>

      <header>
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
          My Joy Library
        </p>
        <h1 className="mt-2 font-serif text-[36px] font-medium leading-tight tracking-tight text-navy sm:text-[44px]">
          The lines that <em className="text-cyan-deep">hit you</em>
        </h1>
        <p className="mt-3 font-sans text-[14px] font-light text-navy/55">
          {favorites.length} {favorites.length === 1 ? "saved" : "saved"}
        </p>
      </header>

      {favorites.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-navy/15 bg-white p-12 text-center">
          <p aria-hidden className="text-[32px] text-gold">
            ♡
          </p>
          <p className="mt-3 font-serif text-[18px] italic text-navy/65">
            Nothing saved yet.
          </p>
          <p className="mt-2 font-sans text-[13px] font-light text-navy/55">
            Tap the heart on any quote to keep it here.
          </p>
          <Link
            href="/book"
            className="mt-5 inline-block rounded-full bg-cyan px-5 py-2 font-sans text-[13px] font-semibold text-white hover:bg-navy"
          >
            Open The Book →
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {favorites.map((q) => (
            <li
              key={q.id}
              className="rounded-2xl border border-navy/10 bg-[#FAF6EC] px-5 py-4"
            >
              <p className="font-serif text-[17px] italic leading-[1.65] text-navy">
                <span className="text-gold">&ldquo;</span>
                {q.body}
                <span className="text-gold">&rdquo;</span>
              </p>
              <p className="mt-2 font-sans text-[10px] uppercase tracking-[0.22em] text-navy/45">
                — BJF
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
