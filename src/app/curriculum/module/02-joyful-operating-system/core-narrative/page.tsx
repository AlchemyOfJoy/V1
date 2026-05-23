import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  findModule,
  findSection,
  WORKSHEET_IDS,
  type CoreNarrativeData,
} from "@/lib/curriculum";
import { getWorksheetResponse } from "@/lib/worksheets";
import WorksheetShell from "@/components/curriculum/WorksheetShell";
import CoreNarrativeForm from "@/components/curriculum/CoreNarrativeForm";
import CoreNarrativeContent from "@/content/workbook/module-02-core-narrative";

export const metadata: Metadata = {
  title: "Core Narrative",
  robots: { index: false },
};

export default async function CoreNarrativePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const mod = findModule("02-joyful-operating-system");
  if (!mod) redirect("/curriculum");
  const section = findSection(mod, "core-narrative");
  if (!section) redirect("/curriculum/module/02-joyful-operating-system");

  const wsId = WORKSHEET_IDS.coreNarrative;
  const existing = await getWorksheetResponse(user.id, wsId);
  const data = ((existing?.data as CoreNarrativeData) ?? {}) as CoreNarrativeData;

  return (
    <main className="px-6 py-12 sm:py-16">
      <WorksheetShell
        module={mod}
        section={section}
        help={{
          whatItIs:
            "Your Core Narrative is the unconscious story you tell yourself about who you are and what's possible. Most of it was written before you could read. Now you're going to read it — and rewrite it.",
          howToDoIt:
            "Read the short section below. Name your top three old narratives, then flip each one into its 180° positive truth. Finish with a long reflection on how life is different when the new story is the one running.",
        }}
      >
        <CoreNarrativeContent />
        <CoreNarrativeForm
          worksheetId={wsId}
          initialData={data}
          continueHref="/curriculum/module/02-joyful-operating-system"
        />
      </WorksheetShell>
    </main>
  );
}
