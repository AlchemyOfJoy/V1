import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ContentForm from "@/components/admin/ContentForm";
import { getContent } from "@/lib/coach/content";

export const metadata: Metadata = {
  title: "Edit content · Admin",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getContent(id);
  if (!item) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <header>
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
          Content Studio · Edit
        </p>
        <h1 className="mt-2 font-serif text-[32px] font-medium leading-tight tracking-tight text-navy">
          {item.title}
        </h1>
      </header>
      <div className="mt-8">
        <ContentForm existing={item} />
      </div>
    </main>
  );
}
