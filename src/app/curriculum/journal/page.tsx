import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { listJournalEntries } from "@/lib/journal";
import { BOLD_ACTION_TOOLS } from "@/lib/bold-action";
import JournalClient, {
  type JournalItem,
} from "@/components/curriculum/JournalClient";

export const metadata: Metadata = {
  title: "Journal",
  robots: { index: false },
};

function sourceFor(worksheetId: string | null): {
  label: string;
  bucket: string;
} {
  if (!worksheetId) return { label: "Free-form", bucket: "freeform" };
  if (worksheetId === "freeform")
    return { label: "Free-form", bucket: "freeform" };
  if (worksheetId.startsWith("04_")) {
    const slug = worksheetId.slice(3).replace(/_/g, "-");
    const tool = BOLD_ACTION_TOOLS.find((t) => t.slug === slug);
    return {
      label: tool ? tool.title : "Bold Action",
      bucket: `bold-action:${slug}`,
    };
  }
  return { label: worksheetId, bucket: worksheetId };
}

export default async function JournalPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const rows = await listJournalEntries(user.id, undefined, 200);
  const items: JournalItem[] = rows.map((r) => {
    const src = sourceFor(r.worksheet_id);
    return {
      id: String(r.id),
      body: r.body,
      title: r.title,
      source: src.label,
      bucket: src.bucket,
      created_at:
        r.created_at instanceof Date
          ? r.created_at.toISOString()
          : r.created_at,
    };
  });

  const sourceCatalog = [
    { key: "freeform", label: "Free-form" },
    ...BOLD_ACTION_TOOLS.map((t) => ({
      key: `bold-action:${t.slug}`,
      label: t.title,
    })),
  ];

  return (
    <main className="px-6 py-12 sm:py-16">
      <article className="mx-auto max-w-3xl space-y-10">
        <header>
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
            Your words, in one place
          </p>
          <h1 className="mt-3 font-serif text-[40px] font-medium leading-tight tracking-tight text-navy sm:text-[48px]">
            The <em className="text-cyan-deep">Journal</em>
          </h1>
          <p className="mt-3 max-w-2xl font-sans text-[16px] font-light leading-relaxed text-navy/65">
            Every line you&apos;ve written through your Bold Action tools,
            plus space for free-form entries any time something needs to
            come out of you.
          </p>
        </header>

        <JournalClient initialItems={items} sources={sourceCatalog} />

        <footer className="border-t border-navy/10 pt-6">
          <Link
            href="/curriculum"
            className="font-sans text-[13px] text-navy/55 transition-colors hover:text-cyan-deep"
          >
            ← Back to curriculum
          </Link>
        </footer>
      </article>
    </main>
  );
}
