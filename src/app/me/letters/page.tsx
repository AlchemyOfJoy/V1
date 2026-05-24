import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { Tridot } from "@/components/app/Wave";
import LetterComposer from "@/components/letters/LetterComposer";
import OpenLetterEffect from "@/components/letters/OpenLetterEffect";
import TeachingMoment from "@/components/app/TeachingMoment";
import { getTutorialFlags } from "@/lib/tutorial-flags";

export const metadata: Metadata = {
  title: "Letters",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

interface Letter {
  id: string;
  body: string;
  send_at: string | Date;
  sent_at: string | Date | null;
  opened_at: string | Date | null;
  created_at: string | Date;
}

export default async function LettersPage() {
  const user = (await getCurrentUser())!;

  // Mark due letters as sent
  await query(
    `UPDATE letters_to_self SET sent_at = now()
       WHERE user_id = $1 AND sent_at IS NULL AND send_at <= now()`,
    [user.id],
  );

  const [letters, flags] = await Promise.all([
    query<Letter>(
      `SELECT id::text AS id, body, send_at, sent_at, opened_at, created_at
         FROM letters_to_self
         WHERE user_id = $1
         ORDER BY send_at DESC`,
      [user.id],
    ),
    getTutorialFlags(user.id),
  ]);

  const arrived = letters.filter((l) => l.sent_at !== null);
  const pending = letters.filter((l) => l.sent_at === null);

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
          Letters from your past self
        </p>
        <h1 className="mt-2 font-serif text-[36px] font-medium leading-tight tracking-tight text-navy sm:text-[44px]">
          Write to <em className="text-cyan-deep">future you</em>
        </h1>
      </header>

      <Suspense fallback={null}>
        <OpenLetterEffect />
      </Suspense>

      <TeachingMoment
        flag="first_letter"
        copy="You’ll send this to yourself, later."
        alreadySeen={flags.first_letter}
      />

      <LetterComposer />

      {arrived.length > 0 && (
        <>
          <Tridot />
          <section>
            <h2 className="font-serif text-[22px] font-medium tracking-tight text-navy">
              Arrived
            </h2>
            <ul className="mt-3 space-y-3">
              {arrived.map((l) => (
                <li
                  key={l.id}
                  id={`letter-${l.id}`}
                  className="rounded-3xl border border-cyan-deep/30 bg-[#FAF6EC] p-5 transition"
                >
                  <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-deep">
                    Arrived{" "}
                    {new Date(l.sent_at!).toLocaleDateString(undefined, {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {" · written "}
                    {new Date(l.created_at).toLocaleDateString(undefined, {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="mt-3 whitespace-pre-wrap font-serif text-[17px] leading-[1.85] text-navy">
                    {l.body}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      {pending.length > 0 && (
        <>
          <Tridot />
          <section>
            <h2 className="font-serif text-[22px] font-medium tracking-tight text-navy">
              Sealed
            </h2>
            <p className="mt-1 font-sans text-[13px] font-light text-navy/55">
              They&apos;ll arrive when it&apos;s time. We won&apos;t spoil
              them.
            </p>
            <ul className="mt-3 space-y-2">
              {pending.map((l) => {
                const days = Math.ceil(
                  (new Date(l.send_at).getTime() - Date.now()) / 86_400_000,
                );
                return (
                  <li
                    key={l.id}
                    className="rounded-2xl border border-navy/10 bg-white px-5 py-4"
                  >
                    <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-navy/55">
                      Sealed{" "}
                      {new Date(l.created_at).toLocaleDateString()}
                    </p>
                    <p className="mt-1 font-serif text-[15px] italic text-navy/65">
                      Arrives in {days} {days === 1 ? "day" : "days"}.
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>
        </>
      )}
    </main>
  );
}
