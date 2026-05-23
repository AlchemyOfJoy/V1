import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { findModule } from "@/lib/curriculum";
import { listForgivenessSubjects } from "@/lib/forgiveness";
import WorksheetShell from "@/components/curriculum/WorksheetShell";
import ForgivenessContent from "@/content/workbook/module-03-forgiveness";
import ForgivenessList from "@/components/curriculum/ForgivenessList";

export const metadata: Metadata = {
  title: "Module 3 — Forgiveness Framework",
  robots: { index: false },
};

export default async function Module03Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const mod = findModule("03-forgiveness");
  if (!mod) redirect("/curriculum");

  const subjects = await listForgivenessSubjects(user.id);
  const serializable = subjects.map((s) => ({
    id: String(s.id),
    subject_name: s.subject_name,
    victim_rant: s.victim_rant,
    empath_rave: s.empath_rave,
    universal_meaning: s.universal_meaning,
    forgiveness_statement: s.forgiveness_statement,
    completed_at:
      s.completed_at instanceof Date
        ? s.completed_at.toISOString()
        : s.completed_at,
    created_at:
      s.created_at instanceof Date
        ? s.created_at.toISOString()
        : s.created_at,
  }));

  return (
    <main className="px-6 py-12 sm:py-16">
      <WorksheetShell
        module={mod}
        help={{
          whatItIs:
            "The Forgiveness Framework is a four-step private process for releasing the emotional weight of past hurts. Forgiveness is not condoning what happened — it is refusing to carry the weight one more mile.",
          howToDoIt:
            "Begin one subject at a time. A name, a nickname, &lsquo;someone close to me&rsquo;, even &lsquo;myself&rsquo; — your call. Move through Victim Rant → Empath Rave → Universal Meaning → Forgiveness Statement. Your work is visible only to you. You can delete it any time.",
        }}
      >
        <ForgivenessContent />
        <ForgivenessList initialSubjects={serializable} />
      </WorksheetShell>
    </main>
  );
}
