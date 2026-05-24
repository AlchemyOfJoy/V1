import Link from "next/link";
import { Tridot } from "@/components/app/Wave";

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
    <article className="mx-auto max-w-2xl space-y-7 px-5 pb-12 pt-6 sm:pt-10">
      <Link
        href={pillarHref}
        className="inline-block font-sans text-[12px] text-navy/55 transition-colors hover:text-cyan-deep"
      >
        ← {pillarLabel}
      </Link>

      <header>
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
            {pillarLabel}
          </p>
          {estimatedMin && (
            <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-navy/45">
              ~{estimatedMin} min
            </p>
          )}
        </div>
        <h1 className="mt-3 font-serif text-[36px] font-medium leading-tight tracking-tight text-navy sm:text-[44px]">
          {before}
          <em className="text-cyan-deep">{italicWord}</em>
          {after}
        </h1>
        {oneLiner && (
          <p className="mt-3 font-serif text-[17px] italic leading-relaxed text-navy/65">
            {oneLiner}
          </p>
        )}
      </header>

      <Tridot />

      {children}
    </article>
  );
}
