import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { BANDS } from "@/lib/questions";
import { btnPrimary, btnGhostLight, eyebrow } from "@/lib/ui";
import SiteHeader from "@/components/SiteHeader";
import Monogram from "@/components/Monogram";

const FEATURES = [
  {
    title: "Take the assessment",
    body: "Ten honest questions about presence, gratitude, and joy — five minutes, start to finish.",
    icon: (
      <path
        d="M9 11l3 3 7-7M5 12v7a1 1 0 001 1h12a1 1 0 001-1v-7M5 8V5a1 1 0 011-1h8"
        strokeWidth="1.5"
      />
    ),
  },
  {
    title: "Save every score",
    body: "Each check-in is stored securely to your account, building an honest record over time.",
    icon: (
      <path
        d="M6 4h12a1 1 0 011 1v15l-7-4-7 4V5a1 1 0 011-1z"
        strokeWidth="1.5"
      />
    ),
  },
  {
    title: "Watch the curve rise",
    body: "See your joy trend month over month. What gets measured gets momentum.",
    icon: <path d="M4 18l5-6 4 3 7-9M15 6h5v5" strokeWidth="1.5" />,
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
        <section className="px-6 pt-28 pb-28">
          <div className="mx-auto max-w-2xl animate-fade-in text-center">
            <p className={eyebrow}>The Alchemy of Joy</p>
            <h1 className="mt-5 font-serif text-[52px] font-medium leading-[1.06] tracking-tight text-navy sm:text-[68px]">
              Measure what <em className="text-cyan">matters</em> most.
            </h1>
            <p className="mx-auto mt-6 max-w-xl font-sans text-[18px] leading-relaxed text-navy/65 sm:text-[20px]">
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
        <section className="bg-navy px-6 py-28">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <p className={eyebrow}>The Practice</p>
              <h2 className="mt-4 font-serif text-[38px] font-medium tracking-tight text-bone sm:text-[46px]">
                A simple <em className="text-cyan">practice</em>
              </h2>
            </div>
            <div className="mt-16 grid gap-12 sm:grid-cols-3">
              {FEATURES.map((f) => (
                <div key={f.title}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan/30 text-cyan">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {f.icon}
                    </svg>
                  </div>
                  <h3 className="mt-5 font-serif text-[22px] font-medium text-bone">
                    {f.title}
                  </h3>
                  <p className="mt-2 font-sans text-[14px] leading-relaxed text-bone/55">
                    {f.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Score bands */}
        <section className="px-6 py-28">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <p className={eyebrow}>Your Results</p>
              <h2 className="mt-4 font-serif text-[38px] font-medium tracking-tight text-navy sm:text-[46px]">
                What your score <em className="text-cyan">means</em>
              </h2>
              <p className="mx-auto mt-4 max-w-md font-sans text-[15px] text-navy/60">
                No score is a finish line — and none is a judgment. It&apos;s
                simply where you begin.
              </p>
            </div>
            <div className="mt-14 grid gap-4 sm:grid-cols-2">
              {BANDS.map((b) => (
                <div
                  key={b.label}
                  className="rounded-2xl border border-navy/12 bg-bone-raised p-6"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: b.color }}
                    />
                    <h3 className="font-sans text-[13px] font-bold uppercase tracking-[0.14em] text-navy">
                      {b.label}
                    </h3>
                    <span className="ml-auto font-sans text-[13px] font-medium text-navy/45">
                      {b.min}–{b.max}
                    </span>
                  </div>
                  <p className="mt-3 font-sans text-[13px] leading-relaxed text-navy/65">
                    {b.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Closing CTA — dark */}
        <section className="bg-navy px-6 py-28 text-center">
          <div className="mx-auto max-w-xl">
            <p className={eyebrow}>Begin</p>
            <h2 className="mt-4 font-serif text-[38px] font-medium leading-tight tracking-tight text-bone sm:text-[46px]">
              Joy is not a feeling.
              <br />
              It&apos;s a <em className="text-gold">skill</em>.
            </h2>
            <p className="mx-auto mt-5 font-sans text-[16px] text-bone/60">
              See where you are today — not to judge it, but to witness it.
            </p>
            <Link href={primaryHref} className={`${btnPrimary} mt-9`}>
              Calculate my JQ
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-navy/10 px-6 py-10">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <p className="font-sans text-[12px] text-navy/45">
            Joy Quotient Assessment · The Alchemy of Joy by Brent Freeman
          </p>
          <Monogram size={26} className="text-navy/40" />
        </div>
      </footer>
    </>
  );
}
