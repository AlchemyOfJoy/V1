import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { BANDS } from "@/lib/questions";
import { btnPrimary, btnGhostLight, eyebrow } from "@/lib/ui";
import SiteHeader from "@/components/SiteHeader";
import Monogram from "@/components/Monogram";
import {
  AssessmentIcon,
  SaveIcon,
  GrowthIcon,
  Spark,
  TripleSparkle,
} from "@/components/icons";

const FEATURES = [
  {
    title: "Take the assessment",
    body: "Ten honest questions about presence, gratitude, and joy — five minutes, start to finish.",
    Icon: AssessmentIcon,
  },
  {
    title: "Save every score",
    body: "Each check-in is stored securely to your account, building an honest record over time.",
    Icon: SaveIcon,
  },
  {
    title: "Watch the curve rise",
    body: "See your joy trend month over month. What gets measured gets momentum.",
    Icon: GrowthIcon,
  },
];

export default async function HomePage() {
  const user = await getCurrentUser();
  const primaryHref = user ? "/assessment" : "/signup";

  return (
    <>
      <SiteHeader user={user} />

      <main>
        {/* Hero */}
        <section className="px-6 pt-32 pb-32">
          <div className="mx-auto max-w-2xl animate-fade-in text-center">
            <div className="flex items-center justify-center gap-3 sm:gap-5">
              <Spark size={16} className="shrink-0 sm:hidden" />
              <Spark size={22} className="hidden shrink-0 sm:block" />
              <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.2em] text-cyan-deep sm:text-[18px] sm:tracking-[0.3em]">
                Joy Quotient (JQ) Assessment
              </p>
              <Spark size={16} className="shrink-0 sm:hidden" />
              <Spark size={22} className="hidden shrink-0 sm:block" />
            </div>
            <h1 className="mt-5 font-serif text-[52px] font-medium leading-[1.05] tracking-tight text-navy sm:text-[68px]">
              Measure what <em className="text-cyan-deep">matters</em>.
            </h1>
            <p className="mx-auto mt-6 max-w-xl font-sans text-[18px] font-light leading-relaxed text-navy/65 sm:text-[20px]">
              Your Joy Quotient is a snapshot of how much real, felt joy is
              present in your life — measured in minutes, tracked over time.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link href={primaryHref} className={btnPrimary}>
                Take the assessment
              </Link>
              <Link
                href={user ? "/dashboard" : "/login"}
                className={btnGhostLight}
              >
                {user ? "View my progress" : "Sign in"}
              </Link>
            </div>
          </div>
        </section>

        {/* The practice — dark section */}
        <section className="bg-navy px-6 py-32">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.26em] text-cyan">
                The Practice
              </p>
              <h2 className="mt-4 font-serif text-[38px] font-medium tracking-tight text-white sm:text-[46px]">
                A simple <em className="text-cyan">practice</em>
              </h2>
            </div>
            <div className="mt-20 grid gap-12 sm:grid-cols-3">
              {FEATURES.map((f, i) => (
                <div key={f.title}>
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan/25 bg-cyan/10 text-cyan">
                    <f.Icon size={26} />
                    <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-cyan font-sans text-[11px] font-bold text-white">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="mt-6 font-serif text-[22px] font-medium text-white">
                    {f.title}
                  </h3>
                  <p className="mt-2 font-sans text-[14px] font-light leading-relaxed text-white/55">
                    {f.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Score bands */}
        <section className="bg-mist px-6 py-32">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <p className={eyebrow}>Your Results</p>
              <h2 className="mt-4 font-serif text-[38px] font-medium tracking-tight text-navy sm:text-[46px]">
                What your score <em className="text-cyan-deep">means</em>
              </h2>
              <p className="mx-auto mt-4 max-w-md font-sans text-[15px] font-light text-navy/60">
                No score is a finish line — and none is a judgment. It&apos;s
                simply where you begin.
              </p>
            </div>
            <div className="mt-16 grid gap-4 sm:grid-cols-2">
              {BANDS.map((b) => (
                <div key={b.label} className="rounded-2xl bg-white p-7">
                  <div className="flex items-center gap-2.5">
                    <Spark size={15} />
                    <h3 className="font-sans text-[13px] font-bold uppercase tracking-[0.14em] text-navy">
                      {b.label}
                    </h3>
                    <span className="ml-auto font-sans text-[13px] font-medium text-navy/40">
                      {b.min}–{b.max}
                    </span>
                  </div>
                  <p className="mt-3 font-sans text-[13px] font-light leading-relaxed text-navy/65">
                    {b.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Closing CTA — dark */}
        <section className="bg-navy px-6 py-32 text-center">
          <div className="mx-auto max-w-xl">
            <TripleSparkle className="mb-6" />
            <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.26em] text-cyan">
              Begin
            </p>
            <h2 className="mt-4 font-serif text-[38px] font-medium leading-tight tracking-tight text-white sm:text-[46px]">
              Joy is not a feeling.
              <br />
              It&apos;s a <em className="text-gold">skill</em>.
            </h2>
            <p className="mx-auto mt-5 font-sans text-[16px] font-light text-white/60">
              See where you are today — not to judge it, but to witness it.
            </p>
            <div className="mt-9 flex justify-center">
              <Link href={primaryHref} className={btnPrimary}>
                Calculate my JQ
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-navy/10 px-6 py-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <p className="font-sans text-[12px] font-light text-navy/45">
            Joy Quotient Assessment · The Alchemy of Joy by Brent Freeman
          </p>
          <Monogram variant="navy" className="h-7 w-auto opacity-40" />
        </div>
      </footer>
    </>
  );
}
