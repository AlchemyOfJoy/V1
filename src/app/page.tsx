import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { BANDS } from "@/lib/questions";
import SiteHeader from "@/components/SiteHeader";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <>
      <SiteHeader user={user} />

      <main>
        <section className="relative overflow-hidden">
          <div className="mx-auto max-w-3xl px-6 py-20 text-center">
            <div className="animate-fade-in">
              <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
                The Alchemy of Joy
              </span>
              <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-amber-950 sm:text-5xl">
                What&apos;s your{" "}
                <span className="text-amber-500">Joy Quotient?</span>
              </h1>
              <p className="mt-4 text-lg text-stone-600">
                Your JQ is a snapshot of how much real, felt, embodied joy is
                present in your life right now. Measure it in under 5 minutes,
                then watch the curve rise as you do the work.
              </p>
              <div className="mt-8 flex justify-center gap-3">
                <Link
                  href={user ? "/assessment" : "/signup"}
                  className="rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600"
                >
                  {user ? "Take the assessment" : "Take the assessment"}
                </Link>
                <Link
                  href={user ? "/dashboard" : "/login"}
                  className="rounded-full border border-amber-300 px-6 py-3 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
                >
                  {user ? "View my progress" : "Sign in"}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-amber-100 bg-white/60">
          <div className="mx-auto grid max-w-4xl gap-6 px-6 py-14 sm:grid-cols-3">
            {[
              {
                icon: "📝",
                title: "Take the quiz",
                body: "Answer 10 honest questions about presence, gratitude, and joy in your daily life.",
              },
              {
                icon: "💾",
                title: "Save your score",
                body: "Your JQ is stored securely in your account every time you check in.",
              },
              {
                icon: "📈",
                title: "Track the curve",
                body: "Watch your joy grow over time — recommended monthly for a year, then quarterly.",
              },
            ].map((f) => (
              <div key={f.title}>
                <div className="text-3xl">{f.icon}</div>
                <h3 className="mt-2 font-semibold text-amber-900">
                  {f.title}
                </h3>
                <p className="mt-1 text-sm text-stone-600">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-14">
          <h2 className="text-center text-2xl font-bold text-amber-950">
            What your JQ score means
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {BANDS.map((b) => (
              <div
                key={b.label}
                className="rounded-xl border border-amber-100 bg-white p-5"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: b.color }}
                  />
                  <h3 className="font-semibold text-amber-900">{b.label}</h3>
                  <span className="ml-auto text-sm font-medium text-stone-400">
                    {b.min}–{b.max}
                  </span>
                </div>
                <p className="mt-2 text-sm text-stone-600">{b.summary}</p>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-xl text-center text-sm italic text-stone-500">
            &ldquo;Because what gets measured gets momentum.&rdquo; No matter
            where your JQ lands today, it&apos;s not fixed — it&apos;s just a
            snapshot.
          </p>
        </section>

        <section className="border-t border-amber-100 bg-amber-500/10">
          <div className="mx-auto max-w-2xl px-6 py-14 text-center">
            <h2 className="text-2xl font-bold text-amber-950">
              Ready to witness where you are?
            </h2>
            <p className="mt-2 text-stone-600">
              Not to judge it — but to witness it.
            </p>
            <Link
              href={user ? "/assessment" : "/signup"}
              className="mt-6 inline-block rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-amber-600"
            >
              Calculate my JQ
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-amber-100 py-8 text-center text-xs text-stone-400">
        Joy Quotient Assessment · Based on the work of Brent Freeman
      </footer>
    </>
  );
}
