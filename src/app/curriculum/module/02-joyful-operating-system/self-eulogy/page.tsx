import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  findModule,
  findSection,
  WORKSHEET_IDS,
  type SelfEulogyData,
} from "@/lib/curriculum";
import { getWorksheetResponse } from "@/lib/worksheets";
import WorksheetShell from "@/components/curriculum/WorksheetShell";
import SelfEulogyForm from "@/components/curriculum/SelfEulogyForm";
import SelfEulogyContent from "@/content/workbook/module-02-self-eulogy";

export const metadata: Metadata = {
  title: "Self Eulogy",
  robots: { index: false },
};

export default async function SelfEulogyPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const mod = findModule("02-joyful-operating-system");
  if (!mod) redirect("/curriculum");
  const section = findSection(mod, "self-eulogy");
  if (!section) redirect("/curriculum/module/02-joyful-operating-system");

  const wsId = WORKSHEET_IDS.selfEulogy;
  const existing = await getWorksheetResponse(user.id, wsId);
  const data = ((existing?.data as SelfEulogyData) ?? {}) as SelfEulogyData;

  return (
    <main className="px-6 py-12 sm:py-16">
      <WorksheetShell
        module={mod}
        section={section}
        help={{
          whatItIs:
            "The Self Eulogy is a clarifying exercise: write the eulogy you'd want spoken about you, then reverse-engineer the life that earns it. It pulls you out of the next-thing-next-thing of the daily grind and shows you the full arc.",
          howToDoIt:
            "Write in the past tense, as if it's already been lived. Use the guiding prompts as scaffolding — skip the ones that don't land. There's no length, no shape, no rules. Save and return any time.",
        }}
      >
        <SelfEulogyContent />
        <SelfEulogyForm
          worksheetId={wsId}
          initialData={data}
          continueHref="/curriculum/module/02-joyful-operating-system"
        />
      </WorksheetShell>
    </main>
  );
}
