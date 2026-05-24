import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "3am",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

/**
 * "Read me at 3am" mode (Build Directive §2.2 #14).
 *
 * Gentle, accessible content for hard moments. No CTAs to do work.
 * No streak nudges. Just five short pieces of Brent's voice, paced
 * slowly, with a single optional Reset Breath at the end.
 *
 * Palette is darkened so the screen doesn't burn the user's eyes at
 * 3am. Type is large, line-height generous, motion stilled.
 */
const PIECES: string[] = [
  "If you are awake right now, you are not broken. You are awake.",
  "The hardest hours are not failures. They are weather.",
  "Nothing has to be solved tonight. Most things can't be.",
  "Your nervous system is loud right now. That is information, not truth.",
  "Sleep when it comes. Read this again if it doesn't.",
];

export default async function ReadMeAt3amPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/3am");

  return (
    <main className="min-h-screen bg-[#0E1A2A] text-white">
      <div className="mx-auto max-w-md space-y-10 px-6 pb-16 pt-12">
        <header>
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.32em] text-white/55">
            For hard hours
          </p>
          <h1 className="mt-3 font-serif text-[32px] font-medium leading-tight text-white sm:text-[40px]">
            You&apos;re here.
          </h1>
          <p className="mt-3 font-serif text-[17px] italic leading-relaxed text-white/70">
            That&apos;s enough for now.
          </p>
        </header>

        <ul className="space-y-10">
          {PIECES.map((p, i) => (
            <li
              key={i}
              className="font-serif text-[20px] leading-[1.85] text-white/85 sm:text-[22px]"
            >
              <span aria-hidden className="mr-2 text-[#C89A3F]">
                ✦
              </span>
              {p}
            </li>
          ))}
        </ul>

        <div className="space-y-5 pt-4">
          <Link
            href="/curriculum/module/04-bold-action/60-second-reset"
            className="block rounded-3xl border border-white/15 bg-white/[0.04] p-5 text-center transition hover:bg-white/[0.08]"
          >
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.24em] text-[#C89A3F]">
              If it helps
            </p>
            <p className="mt-2 font-serif text-[17px] italic text-white/85">
              Take a 60-second reset breath
            </p>
          </Link>
          <Link
            href="/home"
            className="block text-center font-sans text-[12px] text-white/45 hover:text-white/75"
          >
            Or just close this and rest.
          </Link>
        </div>
      </div>
    </main>
  );
}
