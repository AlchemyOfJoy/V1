import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { TOOLKIT, findTool } from "@/content/toolkit";
import { btnPrimary } from "@/lib/ui";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = findTool(slug);
  return {
    title: tool?.title ?? "Tool",
    robots: { index: false },
  };
}

export function generateStaticParams() {
  return TOOLKIT.map((t) => ({ slug: t.slug }));
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { slug } = await params;
  const tool = findTool(slug);
  if (!tool) notFound();

  return (
    <main className="px-6 py-12 sm:py-16">
      <article className="mx-auto max-w-3xl space-y-8">
        <Link
          href="/curriculum/toolkit"
          className="font-sans text-[12px] font-semibold uppercase tracking-[0.18em] text-cyan-deep transition-opacity duration-150 hover:opacity-75"
        >
          ← The Toolkit
        </Link>

        <header>
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
            AOJ Toolkit
          </p>
          <h1 className="mt-3 font-serif text-[40px] font-medium leading-tight tracking-tight text-navy sm:text-[44px]">
            {tool.title}
          </h1>
          <p className="mt-3 font-serif text-[18px] italic text-navy/65">
            {tool.subtitle}
          </p>
        </header>

        <p className="font-sans text-[17px] font-light leading-[1.8] text-navy/80">
          {tool.body}
        </p>

        {tool.practiceHref && (
          <div>
            <Link href={tool.practiceHref} className={btnPrimary}>
              Practice this now
            </Link>
          </div>
        )}

        <footer className="border-t border-navy/10 pt-6">
          <Link
            href="/curriculum"
            className="font-sans text-[13px] text-navy/55 transition-colors duration-150 hover:text-cyan-deep"
          >
            ← Back to curriculum
          </Link>
        </footer>
      </article>
    </main>
  );
}
