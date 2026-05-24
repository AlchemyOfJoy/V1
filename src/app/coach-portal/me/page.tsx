import type { Metadata } from "next";
import { getCoachUser } from "@/lib/role";
import { ensureCoachProfile } from "@/lib/coaches";
import ProfileEditor from "@/components/coach-portal/ProfileEditor";

export const metadata: Metadata = {
  title: "My profile · Coach Portal",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function CoachProfilePage() {
  const coach = (await getCoachUser())!;
  const profile = await ensureCoachProfile(coach.id);

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-6 py-10">
      <header className="space-y-2">
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
          My coach profile
        </p>
        <h1 className="font-serif text-[34px] font-medium leading-tight tracking-tight text-navy sm:text-[40px]">
          What your clients see
        </h1>
        <p className="font-sans text-[14px] font-light text-navy/65">
          Status: {profile.cert_status === "certified" ? "Certified" : "In training"}
        </p>
      </header>

      <ProfileEditor
        initial={{
          display_name: profile.display_name,
          bio: profile.bio,
          specialties: profile.specialties,
          intro_video_url: profile.intro_video_url,
          time_zone: profile.time_zone,
          languages: profile.languages,
        }}
      />
    </main>
  );
}
