import type { Metadata } from "next";
import { COACHING_PACKAGES, formatPrice } from "@/lib/pricing";
import { Tridot } from "@/components/app/Wave";
import WaitlistForm from "@/components/upgrade/WaitlistForm";

export const metadata: Metadata = {
  title: "Human coaching",
  robots: { index: false },
};

export default function UpgradePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-10 px-5 pb-16 pt-8 sm:pt-12">
      <header className="text-center">
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
          The Next Layer
        </p>
        <h1 className="mt-3 font-serif text-[40px] font-medium leading-tight tracking-tight text-navy sm:text-[52px]">
          A human <em className="text-cyan-deep">coach</em>
        </h1>
        <p className="mx-auto mt-4 max-w-xl font-serif text-[18px] italic leading-relaxed text-navy/65">
          BrentBot walks with you between sessions. A certified AOJ coach
          walks with you through the seasons.
        </p>
      </header>

      <Tridot />

      <section className="grid gap-4 lg:grid-cols-3">
        {COACHING_PACKAGES.map((pkg) => (
          <article
            key={pkg.id}
            className={`relative flex flex-col rounded-3xl border p-6 transition ${
              pkg.featured
                ? "border-cyan-deep/40 bg-gradient-to-br from-mist to-white shadow-[0_2px_16px_rgba(0,126,167,0.08)]"
                : "border-navy/12 bg-white"
            }`}
          >
            {pkg.featured && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-cyan-deep px-3 py-1 font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                Most chosen
              </span>
            )}
            <h3 className="font-serif text-[28px] font-medium text-navy">
              {pkg.name}
            </h3>
            <p className="mt-1 min-h-[44px] font-sans text-[13px] font-light leading-relaxed text-navy/65">
              {pkg.tagline}
            </p>
            <p className="mt-4 font-serif text-[34px] font-medium tabular-nums text-navy">
              {formatPrice(pkg.monthlyCents)}
              <span className="ml-1 font-sans text-[14px] font-light text-navy/55">
                / month
              </span>
            </p>
            <ul className="mt-5 space-y-2 font-sans text-[13px] leading-relaxed text-navy/75">
              {pkg.includes.map((line) => (
                <li key={line} className="flex items-start gap-2">
                  <span aria-hidden className="mt-1 text-gold">
                    ✦
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-gold/30 bg-[#fdf6e0] p-6">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a6d00]">
          Coaches coming online
        </p>
        <h2 className="mt-1 font-serif text-[22px] font-medium text-navy">
          We&apos;re onboarding the first certified cohort right now.
        </h2>
        <p className="mt-2 font-sans text-[14px] font-light leading-relaxed text-navy/70">
          Until then, BrentBot is your coach. Drop your name on the list
          and we&apos;ll match you the moment a coach is ready.
        </p>
        <div className="mt-6">
          <WaitlistForm />
        </div>
      </section>

      <p className="text-center font-sans text-[12px] text-navy/45">
        Pricing is in placeholder. Final pricing locks before checkout
        opens.
      </p>
    </div>
  );
}
