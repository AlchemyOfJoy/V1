/**
 * The universal "Read this first" card for every worksheet — explains
 * what it is, how to do it, and where to read more in the workbook.
 * Uses native <details> for keyboard-accessible, JS-free collapsing.
 */

export default function ContextualHelp({
  whatItIs,
  howToDoIt,
  whereInBook,
}: {
  whatItIs: React.ReactNode;
  howToDoIt: React.ReactNode;
  whereInBook?: string;
}) {
  return (
    <details
      open
      className="group rounded-2xl bg-mist p-6 sm:p-7 [&_summary::-webkit-details-marker]:hidden"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between">
        <span className="font-sans text-[12px] font-semibold uppercase tracking-[0.22em] text-cyan-deep">
          Read this first
        </span>
        <span className="font-sans text-[12px] font-medium text-navy/45 group-open:hidden">
          Show
        </span>
        <span className="hidden font-sans text-[12px] font-medium text-navy/45 group-open:inline">
          Hide
        </span>
      </summary>
      <div className="mt-6 space-y-5">
        <HelpBlock heading="What this is">{whatItIs}</HelpBlock>
        <HelpBlock heading="How to do it">{howToDoIt}</HelpBlock>
        {whereInBook && (
          <HelpBlock heading="Where to read more">
            In <em>The Alchemy of Joy</em> workbook,{" "}
            <strong>{whereInBook}</strong>.
          </HelpBlock>
        )}
      </div>
    </details>
  );
}

function HelpBlock({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="font-serif text-[16px] font-medium text-navy">
        {heading}
      </h4>
      <div className="mt-1.5 font-sans text-[14px] font-light leading-[1.7] text-navy/75">
        {children}
      </div>
    </div>
  );
}
