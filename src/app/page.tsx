import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { BANDS } from "@/lib/questions";
import { btnPrimary, btnGhostLight, eyebrow } from "@/lib/ui";
import SiteHeader from "@/components/SiteHeader";
import Monogram from "@/components/Monogram";
import {
  AssessmentIcon,
  SaveIcon,
  LatestIcon,
  CheckinsIcon,
  Spark,
  TripleSparkle,
} from "@/components/icons";

/* ----------------------------------------------------------------------- */
/* The full Alchemy of Joy™ ecosystem landing.                              */
/*  Hero → Method (ITT) → Ecosystem doorways → JQ measurement → Closing.   */
/* ----------------------------------------------------------------------- */

interface Doorway {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  status: "available" | "coming-soon";
  href?: string; // when status === "available"
  ctaLabel?: string;
  ctaAuthedHref?: string; // overrides href for logged-in users
}

function doorways(loggedIn: boolean): Doorway[] {
  const signupOr = (authedHref: string) =>
    loggedIn ? authedHref : "/signup";
  return [
    {
      title: "The Curriculum",
      subtitle:
        "Four modules — Science of Joy, Joyful Operating System®, Forgiveness, Bold Action — paced for real life.",
      icon: <LatestIcon size={24} />,
      status: "available",
      href: signupOr("/curriculum"),
      ctaAuthedHref: "/curriculum",
      ctaLabel: loggedIn ? "Continue your journey" : "Begin the curriculum",
    },
    {
      title: "The JQ Assessment",
      subtitle:
        "Five minutes. A score from 10–50. Your starting line, and the way you'll measure the work as you do it.",
      icon: <AssessmentIcon size={24} />,
      status: "available",
      href: signupOr("/assessment"),
      ctaLabel: loggedIn ? "Take the JQ" : "Take your baseline JQ",
    },
    {
      title: "The AOJ Toolkit",
      subtitle:
        "Twenty practices — Reset Breath, Reframe Ritual, Joy Judo, JOMO — to return to when life asks something of you.",
      icon: <SaveIcon size={24} />,
      status: "available",
      href: signupOr("/curriculum/toolkit"),
      ctaLabel: "Browse the toolkit",
    },
    {
      title: "The 90-Day Challenge",
      subtitle:
        "A twelve-week structure: Foundation Week, then four-week arcs to build, deepen, and expand. Day by day.",
      icon: <CheckinsIcon size={24} />,
      status: "coming-soon",
    },
    {
      title: "The Book",
      subtitle:
        "The printed Alchemy of Joy™ Workbook by Brent Freeman — your at-the-desk companion to the work.",
      icon: <BookIcon />,
      status: "coming-soon",
    },
    {
      title: "Retreats",
      subtitle:
        "Real-world immersions led by Brent — small, intentional, in landscapes that hold you while you do the work.",
      icon: <MountainIcon />,
      status: "coming-soon",
    },
  ];
}

const ITT_PILLARS = [
  {
    letter: "I",
    title: "Invest in Joy",
    body: "Make joy a daily, non-negotiable. Not the reward at the end of the to-do list — the foundation under it.",
  },
  {
    letter: "T",
    title: "Train Your Brain",
    body: "Reprogram the subconscious through visualization, meditation, repetition. Show your mind the life you intend, until it agrees.",
  },
  {
    letter: "T",
    title: "Take Bold Action",
    body: "Insight without movement is performance art. Act from the elevated state. Let your outer life catch up to your inner one.",
  },
];

export default async function HomePage() {
  const user = await getCurrentUser();
  const loggedIn = !!user;
  const primaryHref = loggedIn ? "/curriculum" : "/signup";
  const jqHref = loggedIn ? "/assessment" : "/signup";

  return (
    <>
      <SiteHeader user={user} />

      <main>
        {/* ---------- Hero ---------- */}
        <section className="px-6 pt-32 pb-28">
          <div className="mx-auto max-w-3xl animate-fade-in text-center">
            <p className={eyebrow}>The Alchemy of Joy™ · by Brent Freeman</p>
            <h1 className="mt-6 font-serif text-[52px] font-medium leading-[1.05] tracking-tight text-navy sm:text-[72px]">
              Joy is a <em className="text-cyan-deep">skill</em>.
            </h1>
            <p className="mx-auto mt-6 max-w-xl font-sans text-[18px] font-light leading-relaxed text-navy/65 sm:text-[20px]">
              The Alchemy of Joy is the system that builds it — neuroscience-
              backed, practice-driven, measurable. Drawn from 20 years of
              research, retreats, and personal reconstruction.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link href={primaryHref} className={btnPrimary}>
                {loggedIn ? "Open your curriculum" : "Begin the curriculum"}
              </Link>
              <Link href={jqHref} className={btnGhostLight}>
                Take the JQ
              </Link>
            </div>
          </div>
        </section>

        {/* ---------- The Method — navy ---------- */}
        <section className="bg-navy px-6 py-32">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.26em] text-cyan">
                The Method
              </p>
              <h2 className="mt-4 font-serif text-[40px] font-medium tracking-tight text-white sm:text-[48px]">
                Not a mood. A <em className="text-cyan">system</em>.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl font-sans text-[16px] font-light leading-relaxed text-white/65 sm:text-[17px]">
                Joy isn&apos;t a personality trait or a lucky day — it&apos;s
                chemistry, attention, and trained habit. The work is built on
                three pillars. When they move together, transformation
                isn&apos;t a hope. It&apos;s a result.
              </p>
            </div>
            <div className="mt-16 grid gap-10 sm:grid-cols-3">
              {ITT_PILLARS.map((p, i) => (
                <div key={i}>
                  <div className="font-serif text-[64px] font-medium leading-none text-cyan">
                    {p.letter}
                  </div>
                  <h3 className="mt-4 font-serif text-[22px] font-medium text-white">
                    {p.title}
                  </h3>
                  <p className="mt-2 font-sans text-[14px] font-light leading-relaxed text-white/60">
                    {p.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- The Ecosystem — mist ---------- */}
        <section className="bg-mist px-6 py-32">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <p className={eyebrow}>Where to Begin</p>
              <h2 className="mt-4 font-serif text-[40px] font-medium tracking-tight text-navy sm:text-[48px]">
                Six doorways. One <em className="text-cyan-deep">practice</em>.
              </h2>
              <p className="mx-auto mt-4 max-w-xl font-sans text-[16px] font-light text-navy/65">
                Begin where it pulls you. The work is the same; the entry
                points just meet you where you are.
              </p>
            </div>
            <ul className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {doorways(loggedIn).map((d) => (
                <li key={d.title}>
                  <Doorway {...d} />
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- JQ measurement — white ---------- */}
        <section className="px-6 py-32">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <p className={eyebrow}>The Measurement</p>
              <h2 className="mt-4 font-serif text-[40px] font-medium tracking-tight text-navy sm:text-[48px]">
                The JQ — your starting{" "}
                <em className="text-cyan-deep">line</em>.
              </h2>
              <p className="mx-auto mt-4 max-w-xl font-sans text-[15px] font-light leading-relaxed text-navy/65">
                A five-minute assessment that gives you a Joy Quotient score
                and a band to read it by. Take it monthly the first year,
                then quarterly — and watch the curve rise.
              </p>
            </div>
            <div className="mt-12 grid gap-3 sm:grid-cols-2">
              {BANDS.map((b) => (
                <div
                  key={b.label}
                  className="rounded-2xl bg-mist p-6"
                >
                  <div className="flex items-center gap-2.5">
                    <Spark size={14} />
                    <h3 className="font-sans text-[12px] font-bold uppercase tracking-[0.14em] text-navy">
                      {b.label}
                    </h3>
                    <span className="ml-auto font-sans text-[12px] font-medium text-navy/40">
                      {b.min}–{b.max}
                    </span>
                  </div>
                  <p className="mt-3 font-sans text-[13px] font-light leading-relaxed text-navy/65">
                    {b.summary}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-10 flex justify-center">
              <Link href={jqHref} className={btnGhostLight}>
                Take your baseline JQ
              </Link>
            </div>
          </div>
        </section>

        {/* ---------- Closing — navy ---------- */}
        <section className="bg-navy px-6 py-32 text-center">
          <div className="mx-auto max-w-xl">
            <TripleSparkle className="mb-6" />
            <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.26em] text-cyan">
              Begin
            </p>
            <h2 className="mt-4 font-serif text-[40px] font-medium leading-tight tracking-tight text-white sm:text-[48px]">
              Joy is not a feeling.
              <br />
              It&apos;s a <em className="text-gold">skill</em>.
            </h2>
            <p className="mx-auto mt-5 font-sans text-[16px] font-light text-white/60">
              Start where it feels right. Your curriculum opens up from there.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <Link href={primaryHref} className={btnPrimary}>
                {loggedIn ? "Open your curriculum" : "Begin the curriculum"}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-navy/10 px-6 py-10">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <p className="font-sans text-[12px] font-light text-navy/45">
            © THE JOYRIDE, LLC 2026 · The Alchemy of Joy™ by Brent Freeman
          </p>
          <Monogram variant="navy" className="h-7 w-auto opacity-40" />
        </div>
      </footer>
    </>
  );
}

/* ----------------------------------------------------------------------- */
/* Ecosystem doorway tile                                                  */
/* ----------------------------------------------------------------------- */

function Doorway({
  title,
  subtitle,
  icon,
  status,
  href,
  ctaLabel,
}: Doorway) {
  if (status === "available" && href) {
    return (
      <Link
        href={href}
        className="flex h-full flex-col rounded-2xl border border-navy/12 bg-white p-6 transition hover:border-cyan-deep/40"
      >
        <div className="text-cyan-deep">{icon}</div>
        <h3 className="mt-5 font-serif text-[22px] font-medium leading-tight text-navy">
          {title}
        </h3>
        <p className="mt-2 flex-1 font-sans text-[13px] font-light leading-relaxed text-navy/65">
          {subtitle}
        </p>
        {ctaLabel && (
          <p className="mt-5 font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-deep">
            {ctaLabel} →
          </p>
        )}
      </Link>
    );
  }
  return (
    <div className="flex h-full flex-col rounded-2xl border border-dashed border-navy/15 bg-white/60 p-6">
      <div className="flex items-start justify-between">
        <div className="text-navy/55">{icon}</div>
        <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-navy/45">
          Coming soon
        </span>
      </div>
      <h3 className="mt-5 font-serif text-[22px] font-medium leading-tight text-navy">
        {title}
      </h3>
      <p className="mt-2 font-sans text-[13px] font-light leading-relaxed text-navy/65">
        {subtitle}
      </p>
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/* Inline SVGs for tiles without dedicated icons                           */
/* ----------------------------------------------------------------------- */

function BookIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 4.5h6a3 3 0 0 1 3 3v13a2.5 2.5 0 0 0-2.5-2.5H4z" />
      <path d="M20 4.5h-6a3 3 0 0 0-3 3v13a2.5 2.5 0 0 1 2.5-2.5H20z" />
    </svg>
  );
}

function MountainIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 19l5-8 3 4 4-7 6 11z" />
      <circle cx="17" cy="5.5" r="1.4" fill="#d4af37" stroke="none" />
    </svg>
  );
}
