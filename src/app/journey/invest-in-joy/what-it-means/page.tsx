import type { Metadata } from "next";
import Link from "next/link";
import SectionShell from "@/components/journey/SectionShell";
import CoachCard from "@/components/app/CoachCard";
import { btnPrimary } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Invest in Joy — what it means",
  robots: { index: false },
};

export default function WhatItMeansPage() {
  return (
    <SectionShell
      pillarLabel="Invest in Joy"
      pillarHref="/journey"
      title="What it means to Invest in Joy"
      italicWord="Invest"
      oneLiner="The foundational philosophy. The thing under every other tool."
      estimatedMin={3}
    >
      <CoachCard
        mode="steady"
        eyebrow="The whole methodology in one line"
        body="Joy is not the reward at the end of the work. Joy is the daily input that produces the life."
      />

      <section className="mt-8 font-serif text-[17px] leading-[1.85] text-navy/85">
        <p>
          Most of us were taught the opposite. Work hard. Sacrifice. Earn
          it. <em>Then</em> you get to be happy. Then you get to rest.
          Then you get to live.
        </p>
        <p className="mt-4">
          The data — and the lived experience of every person who&apos;s
          ever made it to the &ldquo;then&rdquo; — says it doesn&apos;t
          work that way. The joy never arrives, because the muscle was
          never built. You can&apos;t harvest a crop you never planted.
        </p>
        <p className="mt-4">
          Investing in Joy means flipping the order. Joy is the deposit.
          Every day. Small ones, large ones, ordinary ones. The List of
          Joy starts the practice. Everything else in this app — the JOS®
          install, the Bold Action sub-sections, the ninety-day
          integration — is built on top of one foundational habit:
          choosing joy daily, on purpose, before you&apos;ve earned it.
        </p>
      </section>

      <section className="mt-10 rounded-3xl border border-navy/12 bg-mist/40 p-6">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-deep">
          Two things to do, in order
        </p>
        <ol className="mt-4 space-y-4 font-sans text-[15px] font-light leading-relaxed text-navy/80">
          <li>
            <strong className="text-navy">1. Take your baseline JQ.</strong>{" "}
            Ten quick questions. Your starting point. You&apos;ll retake at
            30, 60, and 90 days to see the rise.
          </li>
          <li>
            <strong className="text-navy">
              2. Start your List of Joy.
            </strong>{" "}
            The living document. Add anything that makes you smile, no
            matter how small. The longer it gets, the more raw material
            you have for everything that follows.
          </li>
        </ol>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/assessment" className={btnPrimary}>
            Take the JQ →
          </Link>
          <Link
            href="/curriculum/module/02-joyful-operating-system/list-of-joy"
            className="rounded-full border border-navy/20 px-5 py-2.5 font-sans text-[13px] font-medium text-navy transition hover:border-cyan-deep hover:text-cyan-deep"
          >
            Start the List
          </Link>
        </div>
      </section>

      <p className="mt-8 italic text-navy/55">
        [Brent: replace the body prose above with verbatim manuscript text
        via the Content Studio when ready.]
      </p>
    </SectionShell>
  );
}
