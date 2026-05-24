import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getMyApplication } from "@/lib/cert-applications";
import { getRoleUser } from "@/lib/role";
import { CERT_PHASES } from "@/lib/coaches";
import { CERT_PROGRAM_PRICE_CENTS, formatPrice } from "@/lib/pricing";
import { Tridot } from "@/components/app/Wave";
import CertApplyForm from "@/components/certify/CertApplyForm";

export const metadata: Metadata = {
  title: "Become an AOJ Coach",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function CertifyPage() {
  const user = (await getCurrentUser())!;
  const [roleUser, application] = await Promise.all([
    getRoleUser(),
    getMyApplication(user.id),
  ]);

  const isAlreadyCoach = roleUser?.role === "coach" || roleUser?.role === "admin";

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-5 pb-16 pt-8 sm:pt-12">
      <header className="text-center">
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
          Coach Certification
        </p>
        <h1 className="mt-3 font-serif text-[40px] font-medium leading-tight tracking-tight text-navy sm:text-[52px]">
          Become a certified <em className="text-cyan-deep">AOJ coach</em>
        </h1>
        <p className="mx-auto mt-4 max-w-xl font-serif text-[18px] italic leading-relaxed text-navy/65">
          You can&apos;t coach what you haven&apos;t lived. The program
          is the methodology applied to coaches.
        </p>
      </header>

      <Tridot />

      {/* The five phases — visual */}
      <section>
        <h2 className="text-center font-serif text-[26px] font-medium tracking-tight text-navy">
          Five phases
        </h2>
        <ol className="mt-6 grid gap-3 sm:grid-cols-5">
          {CERT_PHASES.map((p, i) => (
            <li
              key={p.id}
              className="flex flex-col items-center rounded-2xl border border-navy/10 bg-white p-4 text-center"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-deep/10 font-serif text-[16px] font-medium text-cyan-deep">
                {i + 1}
              </span>
              <p className="mt-3 font-serif text-[14px] font-medium leading-tight text-navy">
                {p.label}
              </p>
              <p className="mt-2 font-sans text-[11px] font-light leading-snug text-navy/55">
                {p.blurb}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Investment */}
      <section className="rounded-3xl border border-gold/30 bg-[#fdf6e0] p-6 text-center">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a6d00]">
          Program fee
        </p>
        <p className="mt-2 font-serif text-[40px] font-medium text-navy">
          {formatPrice(CERT_PROGRAM_PRICE_CENTS)}
        </p>
        <p className="mt-1 font-sans text-[13px] font-light leading-relaxed text-navy/70">
          One-time. Includes all five phases through the final interview
          with Brent.
        </p>
        <p className="mt-3 font-sans text-[11px] italic text-navy/55">
          Coaches earn 30% of session revenue once certified. Brand,
          platform, and methodology rest with AOJ.
        </p>
      </section>

      <Tridot />

      {/* Application state */}
      {isAlreadyCoach ? (
        <section className="rounded-3xl border border-cyan-deep/30 bg-white p-6 text-center">
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-deep">
            You&apos;re already in
          </p>
          <p className="mt-2 font-serif text-[22px] font-medium text-navy">
            Open the Coach Portal.
          </p>
          <Link
            href="/coach-portal"
            className="mt-4 inline-block rounded-full bg-cyan-deep px-5 py-2.5 font-sans text-[13px] font-semibold text-white hover:bg-[#006a8c]"
          >
            Coach Portal →
          </Link>
        </section>
      ) : application ? (
        <ApplicationStatus
          status={application.status}
          paidAt={application.paid_at}
          appliedAt={application.created_at}
        />
      ) : (
        <section>
          <h2 className="text-center font-serif text-[26px] font-medium tracking-tight text-navy">
            Apply
          </h2>
          <p className="mt-2 text-center font-sans text-[13px] font-light text-navy/55">
            Brent reads every application personally.
          </p>
          <div className="mt-6">
            <CertApplyForm />
          </div>
        </section>
      )}
    </div>
  );
}

function ApplicationStatus({
  status,
  paidAt,
  appliedAt,
}: {
  status: string;
  paidAt: string | Date | null;
  appliedAt: string | Date;
}) {
  const map: Record<
    string,
    { label: string; body: string; tone: "wait" | "ok" | "no" }
  > = {
    applied: {
      label: "Submitted — payment pending",
      body: "Complete payment to enter the review queue.",
      tone: "wait",
    },
    paid: {
      label: "In Brent's review queue",
      body: "You'll hear back within five business days.",
      tone: "ok",
    },
    approved: {
      label: "Approved — welcome",
      body: "You've been promoted to coach. Open the Coach Portal to begin Phase 1.",
      tone: "ok",
    },
    rejected: {
      label: "Not this round",
      body: "Brent will be in touch with notes. You can re-apply in the future.",
      tone: "no",
    },
  };
  const info = map[status] ?? map.applied;
  return (
    <section
      className={`rounded-3xl border p-6 ${
        info.tone === "ok"
          ? "border-cyan-deep/30 bg-mist"
          : info.tone === "no"
            ? "border-[#8a6d00]/30 bg-[#fdf6e0]"
            : "border-gold/30 bg-white"
      }`}
    >
      <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-deep">
        Application status
      </p>
      <p className="mt-2 font-serif text-[22px] font-medium text-navy">
        {info.label}
      </p>
      <p className="mt-2 font-sans text-[14px] font-light leading-relaxed text-navy/70">
        {info.body}
      </p>
      <p className="mt-4 font-sans text-[11px] uppercase tracking-[0.16em] text-navy/45">
        Submitted {new Date(appliedAt).toLocaleDateString()}
        {paidAt && (
          <>
            {" · "}Paid {new Date(paidAt).toLocaleDateString()}
          </>
        )}
      </p>
      {status === "approved" && (
        <Link
          href="/coach-portal"
          className="mt-4 inline-block rounded-full bg-cyan-deep px-5 py-2.5 font-sans text-[13px] font-semibold text-white hover:bg-[#006a8c]"
        >
          Open Coach Portal →
        </Link>
      )}
    </section>
  );
}
