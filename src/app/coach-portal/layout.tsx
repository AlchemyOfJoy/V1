import Link from "next/link";
import { redirect } from "next/navigation";
import { getCoachUser } from "@/lib/role";
import { ensureCoachProfile, getCoachProfile } from "@/lib/coaches";
import SiteHeader from "@/components/SiteHeader";

/**
 * Coach Portal — locked behind users.role = 'coach' (or admin).
 *
 * Lives at /coach-portal in this app today; can be rewritten to
 * coach.alchemyofjoy.com via a Vercel domain rewrite once you pick the
 * domain strategy.
 *
 * Visual register: same brand, but distinctly its own — navy chrome bar
 * up top reading "Coach Portal" so a coach never accidentally thinks
 * they're in the user app.
 */
export default async function CoachPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCoachUser();
  if (!user) redirect("/");

  // Make sure a coach_profiles row exists for this coach.
  await ensureCoachProfile(user.id);
  const profile = await getCoachProfile(user.id);
  const certified = profile?.cert_status === "certified";

  return (
    <>
      <SiteHeader user={user} />
      <div className="border-b border-cyan-deep/30 bg-navy text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-6 px-6 py-3 font-sans text-[12px] font-semibold uppercase tracking-[0.18em]">
          <span className="text-cyan">Coach Portal</span>
          <Link
            href="/coach-portal"
            className="text-white/70 hover:text-white"
          >
            Clients
          </Link>
          <Link
            href="/coach-portal/certification"
            className="text-white/70 hover:text-white"
          >
            Certification
          </Link>
          <Link
            href="/coach-portal/me"
            className="text-white/70 hover:text-white"
          >
            My profile
          </Link>
          <span className="ml-auto rounded-full bg-white/10 px-3 py-1 text-[10px] tracking-[0.16em]">
            {certified ? "Certified" : "In training"}
          </span>
        </div>
      </div>
      {children}
    </>
  );
}
