import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { findModule, findSection } from "@/lib/curriculum";
import { listJoyItems } from "@/lib/list-of-joy";
import WorksheetShell from "@/components/curriculum/WorksheetShell";
import ListOfJoyClient from "@/components/curriculum/ListOfJoyClient";
import ListOfJoyContent from "@/content/workbook/module-02-list-of-joy";

export const metadata: Metadata = {
  title: "The List of Joy",
  robots: { index: false },
};

export default async function ListOfJoyPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const mod = findModule("02-joyful-operating-system");
  if (!mod) redirect("/curriculum");
  const section = findSection(mod, "list-of-joy");
  if (!section) redirect("/curriculum/module/02-joyful-operating-system");

  const items = await listJoyItems(user.id, Number.POSITIVE_INFINITY);

  return (
    <main className="px-6 py-12 sm:py-16">
      <WorksheetShell
        module={mod}
        section={section}
        help={{
          whatItIs:
            "Your List of Joy™ is a living catalogue of what actually brings you joy — small things, big things, ordinary things. Stress shrinks the menu; the list rebuilds it.",
          howToDoIt:
            "Add anything that makes you smile, even slightly. Tag each one to a Priority Pillar if you can — it'll matter when we look at where you're depleted. Aim for volume; you can return any time to add more.",
        }}
      >
        <ListOfJoyContent />
        <ListOfJoyClient
          initialItems={items.map((i) => ({
            id: String(i.id),
            content: i.content,
            priority_pillar: i.priority_pillar,
            sub_pillar: i.sub_pillar,
            created_at: i.created_at,
          }))}
        />
      </WorksheetShell>
    </main>
  );
}
