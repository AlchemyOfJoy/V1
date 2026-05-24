import Link from "next/link";

/**
 * Shared shell for Journey sub-section pages. Header + content slot +
 * "back to the pillar" footer. Used by Foundations cards, Invest-in-Joy
 * essays, Take Bold Action sub-sections, etc.
 */
export default function SectionShell({
  pillarLabel,
  pillarHref,
  title,
  italicWord,
  oneLiner,
  estimatedMin,
  children,
}: {
  pillarLabel: string;
  pillarHref: string;
  title: string;
  italicWord: string;
  oneLiner?: string;
  estimatedMin?: number;
  children: React.ReactNode;
}) {
  const before = title.split(italicWord)[0];
  const after = title.split(italicWord)[1] ?? "";
  return (
    <article className="mx-auto max-w-3xl space-y-10 px-5 py-10">
      <header>
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
          {pillarLabel}
          {estimatedMin && (
            <span className="ml-2 text-navy/45">~{estimatedMin} min</span>
          )}
        </p>
        <h1 className="mt-3 font-serif text-[36px] font-medium leading-tight tracking-tight text-navy sm:text-[44px]">
          {before}
          <em className="text-cyan-deep">{italicWord}</em>
          {after}
        </h1>
        {oneLiner && (
          <p className="mt-3 font-sans text-[16px] font-light leading-relaxed text-navy/65">
            {oneLiner}
          </p>
        )}
      </header>

      {children}

      <footer className="border-t border-navy/10 pt-6">
        <Link
          href={pillarHref}
          className="font-sans text-[13px] text-navy/55 transition-colors hover:text-cyan-deep"
        >
          ← Back
        </Link>
      </footer>
    </article>
  );
}
