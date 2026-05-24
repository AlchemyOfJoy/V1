import type { Metadata } from "next";
import { getCoachUser } from "@/lib/role";
import {
  CERT_PHASES,
  getCoachProfile,
  getCertProgress,
} from "@/lib/coaches";

export const metadata: Metadata = {
  title: "Certification · Coach Portal",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function CertificationPage() {
  const coach = (await getCoachUser())!;
  const [profile, progress] = await Promise.all([
    getCoachProfile(coach.id),
    getCertProgress(coach.id),
  ]);
  const currentPhase = profile?.cert_status ?? "phase_1_client";
  const isCertified = currentPhase === "certified";

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <header className="space-y-3">
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
          Certification
        </p>
        <h1 className="font-serif text-[34px] font-medium leading-tight tracking-tight text-navy sm:text-[40px]">
          The five <em className="text-cyan-deep">phases</em>
        </h1>
        <p className="font-sans text-[14px] font-light leading-relaxed text-navy/65">
          You can&apos;t coach what you haven&apos;t lived. The cert
          program is the methodology applied to coaches. Walk through it
          in order.
        </p>
      </header>

      <ol className="mt-10 space-y-4">
        {CERT_PHASES.map((phase, i) => {
          const state = progress[phase.id];
          const isCurrent = phase.id === currentPhase;
          const isComplete = !!state?.completed_at || isCertified;
          return (
            <li
              key={phase.id}
              className={`rounded-3xl border p-5 transition ${
                isCurrent
                  ? "border-cyan-deep/40 bg-mist shadow-sm"
                  : isComplete
                    ? "border-cyan-deep/20 bg-white"
                    : "border-navy/10 bg-white"
              }`}
            >
              <div className="flex items-start gap-4">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-serif text-[16px] font-medium ${
                    isComplete
                      ? "bg-cyan-deep text-white"
                      : isCurrent
                        ? "bg-cyan-deep/15 text-cyan-deep"
                        : "bg-mist text-navy/45"
                  }`}
                  aria-hidden
                >
                  {isComplete ? "✓" : i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-serif text-[19px] font-medium text-navy">
                    {phase.label}
                  </h2>
                  <p className="mt-1 font-sans text-[13px] font-light leading-relaxed text-navy/65">
                    {phase.blurb}
                  </p>
                  {isCurrent && !isCertified && (
                    <p className="mt-2 font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-deep">
                      You are here
                    </p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {isCertified && (
        <section className="mt-8 rounded-3xl border border-cyan-deep/40 bg-gradient-to-br from-mist to-white p-6 text-center">
          <p aria-hidden className="text-[28px] leading-none text-gold">
            ✦
          </p>
          <h2 className="mt-2 font-serif text-[24px] font-medium text-navy">
            Certified
          </h2>
          <p className="mt-1 font-sans text-[13px] font-light text-navy/65">
            You can take live clients. The matching system will route new
            users your way as they upgrade.
          </p>
        </section>
      )}
    </main>
  );
}
