import type { Metadata } from "next";
import { getCoachUser } from "@/lib/role";
import { getCoachProfile } from "@/lib/coaches";

export const metadata: Metadata = {
  title: "My profile · Coach Portal",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function CoachProfilePage() {
  const coach = (await getCoachUser())!;
  const profile = await getCoachProfile(coach.id);

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-6 py-10">
      <header className="space-y-2">
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
          My coach profile
        </p>
        <h1 className="font-serif text-[34px] font-medium leading-tight tracking-tight text-navy sm:text-[40px]">
          What your clients see
        </h1>
      </header>

      <section className="rounded-3xl border border-navy/10 bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-navy/55">
              Display name
            </dt>
            <dd className="mt-1 font-serif text-[17px] text-navy">
              {profile?.display_name ?? coach.name ?? coach.email}
            </dd>
          </div>
          <div>
            <dt className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-navy/55">
              Status
            </dt>
            <dd className="mt-1 font-serif text-[17px] text-navy">
              {profile?.cert_status === "certified" ? "Certified" : "In training"}
            </dd>
          </div>
          <div>
            <dt className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-navy/55">
              Capacity
            </dt>
            <dd className="mt-1 font-serif text-[17px] text-navy">
              {profile?.capacity ?? 12} clients
            </dd>
          </div>
          <div>
            <dt className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-navy/55">
              Time zone
            </dt>
            <dd className="mt-1 font-serif text-[17px] text-navy">
              {profile?.time_zone ?? "—"}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-navy/55">
              Bio
            </dt>
            <dd className="mt-1 font-serif text-[15px] leading-relaxed text-navy/85">
              {profile?.bio ?? (
                <span className="italic text-navy/45">
                  Empty for now. Admin can edit your profile.
                </span>
              )}
            </dd>
          </div>
        </dl>
        <p className="mt-5 font-sans text-[11px] italic text-navy/45">
          Profile edit UI ships in Phase 2 once the pricing model + revenue
          share are decided.
        </p>
      </section>
    </main>
  );
}
