import Link from "next/link";
import ContextualHelp from "./ContextualHelp";

/**
 * Used for every curriculum page that isn't fully built yet. Renders the
 * IA correctly — header, contextual help, and a clear "in development"
 * panel — so navigation feels intentional, not broken.
 */
export default function ComingSoonStub({
  eyebrow,
  title,
  subtitle,
  whatItIs,
  howToDoIt,
  whereInBook,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle: string;
  whatItIs: React.ReactNode;
  howToDoIt: React.ReactNode;
  whereInBook?: string;
}) {
  return (
    <main className="px-6 py-12 sm:py-16">
      <article className="mx-auto max-w-3xl space-y-10">
        <header>
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
            {eyebrow}
          </p>
          <h1 className="mt-3 font-serif text-[40px] font-medium leading-tight tracking-tight text-navy sm:text-[48px]">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl font-sans text-[16px] font-light leading-relaxed text-navy/65">
            {subtitle}
          </p>
        </header>

        <ContextualHelp
          whatItIs={whatItIs}
          howToDoIt={howToDoIt}
          whereInBook={whereInBook}
        />

        <div className="rounded-2xl border border-dashed border-navy/20 bg-mist/60 p-8 text-center">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-deep">
            In development
          </p>
          <h3 className="mt-3 font-serif text-[22px] font-medium text-navy">
            This section is being built.
          </h3>
          <p className="mx-auto mt-2 max-w-md font-sans text-[14px] font-light leading-relaxed text-navy/65">
            The reading and exercise are nearly ready — you&apos;ll see them
            here soon. Until then, the &ldquo;Read this first&rdquo; card
            above tells you what&apos;s coming.
          </p>
        </div>

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
