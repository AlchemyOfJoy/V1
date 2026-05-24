import type { Metadata } from "next";
import Link from "next/link";
import { getCoachUser } from "@/lib/role";
import { clientCount, getCoachProfile, listClients } from "@/lib/coaches";

export const metadata: Metadata = {
  title: "Clients · Coach Portal",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function CoachClientsPage() {
  const coach = (await getCoachUser())!;
  const profile = await getCoachProfile(coach.id);
  const certified = profile?.cert_status === "certified";
  const clients = await listClients(coach.id);
  const count = await clientCount(coach.id);

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <header className="space-y-3">
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
          Coach Portal
        </p>
        <h1 className="font-serif text-[34px] font-medium leading-tight tracking-tight text-navy sm:text-[40px]">
          Your <em className="text-cyan-deep">clients</em>
        </h1>
        <p className="font-sans text-[13px] text-navy/55">
          {count} of {profile?.capacity ?? 12} capacity
        </p>
      </header>

      {!certified && (
        <section className="mt-8 rounded-3xl border border-gold/40 bg-[#fdf6e0] p-6">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a6d00]">
            In training
          </p>
          <h2 className="mt-1 font-serif text-[22px] font-medium text-navy">
            You can&apos;t take live clients yet.
          </h2>
          <p className="mt-2 font-sans text-[14px] font-light text-navy/70">
            Live clients become available after Phase 5 — the final
            certification interview with Brent. Until then, finish the
            cert program.
          </p>
          <Link
            href="/coach-portal/certification"
            className="mt-4 inline-block font-sans text-[13px] font-semibold text-cyan-deep hover:underline"
          >
            Open the certification path →
          </Link>
        </section>
      )}

      <section className="mt-8">
        {clients.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-navy/15 bg-white p-12 text-center font-sans text-[14px] font-light text-navy/55">
            {certified
              ? "No assigned clients yet. The matching system will route new clients to you when they upgrade."
              : "Clients will appear here once you're certified."}
          </p>
        ) : (
          <ul className="space-y-2">
            {clients.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/coach-portal/clients/${c.id}`}
                  className="flex items-center justify-between rounded-2xl border border-navy/10 bg-white px-5 py-4 transition hover:border-cyan-deep/40"
                >
                  <div>
                    <p className="font-serif text-[17px] font-medium text-navy">
                      {c.name ?? c.email}
                    </p>
                    {c.name && (
                      <p className="font-sans text-[12px] text-navy/55">
                        {c.email}
                      </p>
                    )}
                  </div>
                  <span className="text-[18px] text-cyan-deep">→</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
