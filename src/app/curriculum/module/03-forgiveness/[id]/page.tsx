import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { findModule } from "@/lib/curriculum";
import { getForgivenessSubject } from "@/lib/forgiveness";
import ForgivenessWizard from "@/components/curriculum/ForgivenessWizard";

export const metadata: Metadata = {
  title: "Forgiveness Process",
  robots: { index: false },
};

export default async function ForgivenessSubjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const mod = findModule("03-forgiveness");
  if (!mod) redirect("/curriculum");

  const { id } = await params;
  const subject = await getForgivenessSubject(user.id, id);
  if (!subject) redirect("/curriculum/module/03-forgiveness");

  const serializable = {
    id: String(subject.id),
    subject_name: subject.subject_name,
    victim_rant: subject.victim_rant,
    empath_rave: subject.empath_rave,
    universal_meaning: subject.universal_meaning,
    forgiveness_statement: subject.forgiveness_statement,
    completed_at:
      subject.completed_at instanceof Date
        ? subject.completed_at.toISOString()
        : subject.completed_at,
  };

  return (
    <main className="px-6 py-12 sm:py-16">
      <article className="mx-auto max-w-3xl space-y-10">
        <header>
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
            Module {mod.number} · Forgiveness Process
          </p>
          <h1 className="mt-3 font-serif text-[36px] font-medium leading-tight tracking-tight text-navy sm:text-[44px]">
            For{" "}
            <em className="text-cyan-deep">{serializable.subject_name}</em>
          </h1>
          <p className="mt-3 max-w-2xl font-sans text-[15px] font-light leading-relaxed text-navy/65">
            Private. No one but you sees a word of this. Move through the
            four steps in your own time — you can leave and return whenever
            you need to.
          </p>
        </header>

        <ForgivenessWizard initialSubject={serializable} />

        <footer className="border-t border-navy/10 pt-6">
          <Link
            href="/curriculum/module/03-forgiveness"
            className="font-sans text-[13px] text-navy/55 transition-colors duration-150 hover:text-cyan-deep"
          >
            ← Back to all processes
          </Link>
        </footer>
      </article>
    </main>
  );
}
