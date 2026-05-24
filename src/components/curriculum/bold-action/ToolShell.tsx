import Link from "next/link";
import type { BoldActionTool } from "@/lib/bold-action";

export default function ToolShell({
  tool,
  intro,
  children,
  log,
}: {
  tool: BoldActionTool;
  intro: React.ReactNode;
  children: React.ReactNode;
  log?: React.ReactNode;
}) {
  const before = tool.title.replace(tool.italicWord, "").trim();
  return (
    <article className="mx-auto max-w-3xl space-y-10">
      <header>
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
          Module 4 · Take Bold Action · ~
          {Math.round(tool.durationSec / 60)} min
        </p>
        <h1 className="mt-3 font-serif text-[40px] font-medium leading-tight tracking-tight text-navy sm:text-[48px]">
          {before} <em className="text-cyan-deep">{tool.italicWord}</em>
        </h1>
        <p className="mt-3 max-w-2xl font-sans text-[16px] font-light leading-relaxed text-navy/65">
          {tool.oneLiner}
        </p>
      </header>

      <section className="font-sans text-[15px] font-light leading-[1.85] text-navy/75">
        {intro}
      </section>

      {children}

      {log}

      <footer className="border-t border-navy/10 pt-6">
        <Link
          href="/curriculum/module/04-bold-action"
          className="font-sans text-[13px] text-navy/55 transition-colors duration-150 hover:text-cyan-deep"
        >
          ← Back to the drawer
        </Link>
      </footer>
    </article>
  );
}
