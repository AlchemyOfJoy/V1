import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  findModule,
  findSection,
  WORKSHEET_IDS,
  type PriorityPillarsData,
} from "@/lib/curriculum";
import { getWorksheetResponse } from "@/lib/worksheets";
import { listSnapshots } from "@/lib/pillars";
import WorksheetShell from "@/components/curriculum/WorksheetShell";
import PriorityPillarsForm from "@/components/curriculum/PriorityPillarsForm";
import PriorityPillarsContent from "@/content/workbook/module-02-priority-pillars";

export const metadata: Metadata = {
  title: "Priority Pillars",
  robots: { index: false },
};

export default async function PriorityPillarsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const mod = findModule("02-joyful-operating-system");
  if (!mod) redirect("/curriculum");
  const section = findSection(mod, "priority-pillars");
  if (!section) redirect("/curriculum/module/02-joyful-operating-system");

  const wsId = WORKSHEET_IDS.priorityPillars;
  const existing = await getWorksheetResponse(user.id, wsId);
  const data = ((existing?.data as PriorityPillarsData) ??
    {}) as PriorityPillarsData;
  const snapshots = await listSnapshots(user.id);
  const serializableSnaps = snapshots.map((s) => {
    const out: Record<string, unknown> = {
      taken_at:
        typeof s.taken_at === "string"
          ? s.taken_at
          : new Date(s.taken_at).toISOString(),
    };
    for (const [k, v] of Object.entries(s)) {
      if (k === "taken_at" || k === "id") continue;
      out[k] = v;
    }
    return out as { taken_at: string; [k: string]: unknown };
  });

  return (
    <main className="px-6 py-12 sm:py-16">
      <WorksheetShell
        module={mod}
        section={section}
        help={{
          whatItIs:
            "Six Priority Pillars — Love, Faith, Health, Family, Career, Community — each with two sub-pillars. Twelve in total. When one collapses, the whole structure leans. This is your structural inventory.",
          howToDoIt:
            "Rate each sub-pillar from 0–10. Be honest, no theatre — your first answer is usually the right one. Take a snapshot when you're done, then come back in 30 days and watch the bars move.",
        }}
      >
        <PriorityPillarsContent />
        <PriorityPillarsForm
          worksheetId={wsId}
          initialData={data}
          initialSnapshots={serializableSnaps}
          continueHref="/curriculum/module/02-joyful-operating-system"
        />
      </WorksheetShell>
    </main>
  );
}
