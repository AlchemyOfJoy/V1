import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  findModule,
  findSection,
  WORKSHEET_IDS,
  type SubscriptData,
} from "@/lib/curriculum";
import { getWorksheetResponse } from "@/lib/worksheets";
import WorksheetShell from "@/components/curriculum/WorksheetShell";
import SubscriptForm from "@/components/curriculum/SubscriptForm";
import SubscriptContent from "@/content/workbook/module-02-subscript";

export const metadata: Metadata = {
  title: "Subconscious Script",
  robots: { index: false },
};

export default async function SubscriptPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const mod = findModule("02-joyful-operating-system");
  if (!mod) redirect("/curriculum");
  const section = findSection(mod, "subscript");
  if (!section) redirect("/curriculum/module/02-joyful-operating-system");

  const wsId = WORKSHEET_IDS.subscript;
  const existing = await getWorksheetResponse(user.id, wsId);
  const data = ((existing?.data as SubscriptData) ?? {}) as SubscriptData;

  return (
    <main className="px-6 py-12 sm:py-16">
      <WorksheetShell
        module={mod}
        section={section}
        help={{
          whatItIs:
            "Your SubScript is the short manifesto your mind reads back to you every morning and every night — present tense, as if already true. The keystone tool of the Joyful Operating System®.",
          howToDoIt:
            "Five steps: anchor a real Joy Spark memory, set a target date, write your manifestations, write your affirmations, then lock it in. Print it. Read it twice a day. Update the version whenever it needs to evolve.",
        }}
      >
        <SubscriptContent />
        <SubscriptForm
          worksheetId={wsId}
          initialData={data}
          continueHref="/curriculum/module/02-joyful-operating-system"
        />
      </WorksheetShell>
    </main>
  );
}
