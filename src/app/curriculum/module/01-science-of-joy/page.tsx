import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  findModule,
  WORKSHEET_IDS,
  type ScienceOfJoyData,
} from "@/lib/curriculum";
import { getWorksheetResponse } from "@/lib/worksheets";
import WorksheetShell from "@/components/curriculum/WorksheetShell";
import ScienceReflectionForm from "@/components/curriculum/ScienceReflectionForm";
import Module01Content from "@/content/workbook/module-01";

export const metadata: Metadata = {
  title: "Module 1 — The Science of Joy",
  robots: { index: false },
};

export default async function Module01Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const mod = findModule("01-science-of-joy");
  if (!mod) redirect("/curriculum");

  const wsId = WORKSHEET_IDS.scienceOfJoy;
  const existing = await getWorksheetResponse(user.id, wsId);
  const data = ((existing?.data as ScienceOfJoyData) ?? {}) as ScienceOfJoyData;

  return (
    <main className="px-6 py-12 sm:py-16">
      <WorksheetShell
        module={mod}
        help={{
          whatItIs:
            "An honest look at how your brain actually creates joy — the chemistry, the wiring, the wave states — so you stop chasing it and start cultivating it.",
          howToDoIt:
            "Read the short sections below. Take your time. Then write one reflection. Your words save themselves; you can come back to them any time.",
        }}
      >
        <Module01Content />
        <ScienceReflectionForm
          worksheetId={wsId}
          initialData={data}
          continueHref="/curriculum/module/02-joyful-operating-system"
        />
      </WorksheetShell>
    </main>
  );
}
