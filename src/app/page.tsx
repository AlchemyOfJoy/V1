import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { BANDS } from "@/lib/questions";
import SiteHeader from "@/components/SiteHeader";

const FEATURES = [
  {
    title: "Take the assessment",
    body: "Ten honest questions about presence, gratitude, and joy — five minutes, start to finish.",
    icon: (
      <path
        d="M9 11l3 3 7-7M5 12v7a1 1 0 001 1h12a1 1 0 001-1v-7M5 8V5a1 1 0 011-1h8"
        strokeWidth="1.6"
      />
    ),
  },
  {
    title: "Save every score",
    body: "Each check-in is stored securely to your account, building a record over time.",
    icon: (
      <path
        d="M6 4h12a1 1 0 011 1v15l-7-4-7 4V5a1 1 0 011-1z"
        strokeWidth="1.6"
      />
    ),
  },
  {
    title: "Watch the curve rise",
    body: "See your joy trend month over month. What gets measured gets momentum.",
    icon: (
      <path
        d="M4 18l5-6 4 3 7-9M15 6h5v5"
        strokeWidth="1.6"
      />
    ),
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
        <section className="px-6 pt-24 pb-20 text-center">
          <div className="mx-auto max-w-2xl animate-rise">
            <p className="text-[15px] font-medium text-accent">
              The Alchemy of Joy
            </p>
            <h1 className="mt-3 text-[44px] font-semibold leading-[1.05] tracking-tight text-ink sm:text-[64px]">
              Measure what
              <br />
              matters most.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-[18px] leading-relaxed text-ink-2 sm:text-[21px]">
              Your Joy Quotient is a snapshot of how much real, felt joy is
              present in your life — measured in minutes, tracked over time.
            </p>
            <div className="mt-9 flex items-center justify-center gap-5">
              <Link
                href={primaryHref}
                className="rounded-full bg-accent px-6 py-3 text-[15px] font-medium text-white transition-opacity hover:opacity-90"
              >
                Take the assessment
              </Link>
              <Link
                href={user ? "/dashboard" : "/login"}
                className="text-[15px] font-medium text-accent transition-opacity hover:opacity-80"
              >
                {user ? "View my progress" : "Sign in"}
                <span aria-hidden> ›</span>
              </Link>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-canvas px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-[28px] font-semibold tracking-tight text-ink sm:text-[36px]">
              A simple practice
            </h2>
            <div className="mt-12 grid gap-10 sm:grid-cols-3">
              {FEATURES.map((f) => (
                <div key={f.title} className="text-center sm:text-left">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-accent shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:mx-0">
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
                  <h3 className="mt-4 text-[17px] font-semibold text-ink">
                    {f.title}
                  </h3>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-ink-2">
                    {f.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Score bands */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-[28px] font-semibold tracking-tight text-ink sm:text-[36px]">
              What your score means
            </h2>
            <p className="mx-auto mt-3 max-w-md text-center text-[15px] text-ink-2">
              No score is a finish line — and none is a judgment. It&apos;s
              simply where you begin.
            </p>
            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              {BANDS.map((b) => (
                <div
                  key={b.label}
                  className="rounded-2xl border border-hairline p-5"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: b.color }}
                    />
                    <h3 className="text-[15px] font-semibold text-ink">
                      {b.label}
                    </h3>
                    <span className="ml-auto text-[13px] font-medium text-ink-3">
                      {b.min}–{b.max}
                    </span>
                  </div>
                  <p className="mt-2.5 text-[13px] leading-relaxed text-ink-2">
                    {b.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="bg-canvas px-6 py-20 text-center">
          <div className="mx-auto max-w-xl">
            <h2 className="text-[28px] font-semibold tracking-tight text-ink sm:text-[36px]">
              See where you are today.
            </h2>
            <p className="mt-3 text-[17px] text-ink-2">
              Not to judge it — but to witness it.
            </p>
            <Link
              href={primaryHref}
              className="mt-7 inline-block rounded-full bg-accent px-6 py-3 text-[15px] font-medium text-white transition-opacity hover:opacity-90"
            >
              Calculate my JQ
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-hairline px-6 py-8 text-center">
        <p className="text-[12px] text-ink-3">
          Joy Quotient Assessment · Based on the work of Brent Freeman
        </p>
      </footer>
    </>
  );
}
