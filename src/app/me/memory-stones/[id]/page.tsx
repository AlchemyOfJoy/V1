import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getMemoryStone } from "@/lib/memory-stones";

export const metadata: Metadata = {
  title: "Memory Stone",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

/**
 * Replay a Memory Stone (Master Prompt §13). Renders the saved
 * celebration in its original shape — eyebrow, headline, subline,
 * Triple Sparkle. The user comes here on hard days to remember.
 *
 * Ascension stones get the gold treatment; Bloom stones get cyan.
 */
export default async function MemoryStoneReplay({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = (await getCurrentUser())!;
  const { id } = await params;
  const stone = await getMemoryStone(user.id, id);
  if (!stone) notFound();

  const isAscension = stone.tier === "ascension";
  const date = new Date(stone.created_at as unknown as string);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem-4rem)] max-w-md flex-col px-6 pb-16 pt-10 sm:pt-14">
      <Link
        href="/me"
        className="font-sans text-[12px] text-slate hover:text-cyan"
      >
        ← The Memories
      </Link>

      <section
        className={`mt-12 flex flex-1 flex-col items-center justify-center text-center ${
          isAscension ? "" : ""
        }`}
      >
        <p
          aria-hidden
          className={`font-serif text-[56px] leading-none ${
            isAscension ? "text-gold" : "text-cyan"
          }`}
        >
          ✦
        </p>

        {stone.eyebrow && (
          <p className="mt-8 font-sans text-[12px] font-semibold uppercase tracking-[0.26em] text-cyan">
            {stone.eyebrow}
          </p>
        )}

        <h1 className="mt-4 font-serif text-[36px] font-medium leading-tight text-navy">
          {stone.headline}
        </h1>

        {stone.subline && (
          <p className="mt-4 font-serif text-[18px] italic leading-relaxed text-slate">
            {stone.subline}
          </p>
        )}

        <div
          aria-hidden
          className="my-10 h-px w-16 bg-slate/30"
        />

        <p className="font-sans text-[11px] uppercase tracking-[0.26em] text-slate/65">
          {date.toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </section>
    </main>
  );
}
