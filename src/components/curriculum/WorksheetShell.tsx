import Link from "next/link";
import type { Module, Section } from "@/lib/curriculum";
import ContextualHelp from "./ContextualHelp";

/**
 * Common wrapper for every curriculum worksheet — provides the module
 * header, contextual help card, and the "back to curriculum" footer.
 * Individual worksheet forms render as `children` and own their own
 * Continue button + autosave logic.
 */
export default function WorksheetShell({
  module,
  section,
  help,
  children,
}: {
  module: Module;
  section?: Section;
  help: {
    whatItIs: React.ReactNode;
    howToDoIt: React.ReactNode;
    whereInBook?: string;
  };
  children: React.ReactNode;
}) {
  const heading = section?.title ?? module.title;
  const subheading = section?.subtitle ?? module.subtitle;
  const page =
    help.whereInBook ?? section?.workbookPage ?? module.workbookPage;

  return (
    <article className="mx-auto max-w-3xl space-y-10">
      <header>
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
          Module {module.number}
          {section ? ` · ${section.title}` : ""}
        </p>
        <h1 className="mt-3 font-serif text-[40px] font-medium leading-tight tracking-tight text-navy sm:text-[48px]">
          {heading}
        </h1>
        {subheading && (
          <p className="mt-3 max-w-2xl font-sans text-[16px] font-light leading-relaxed text-navy/65">
            {subheading}
          </p>
        )}
      </header>

      <ContextualHelp
        whatItIs={help.whatItIs}
        howToDoIt={help.howToDoIt}
        whereInBook={page}
      />

      {children}

      <footer className="border-t border-navy/10 pt-6">
        <Link
          href="/curriculum"
          className="font-sans text-[13px] text-navy/55 transition-colors duration-150 hover:text-cyan-deep"
        >
          ← Save &amp; exit to curriculum
        </Link>
      </footer>
    </article>
  );
}
