/**
 * Module 4 — Take Bold Action reading content
 * (workbook-voice approximation).
 *
 * Replace with verbatim text from the manuscript (workbook pages 48–60).
 */

const proseClasses =
  "font-sans text-[16px] font-light leading-[1.8] text-navy/80";

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-serif text-[24px] font-medium tracking-tight text-navy">
      {children}
    </h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className={`${proseClasses} mt-3`}>{children}</p>;
}

export default function BoldActionContent() {
  return (
    <div className="space-y-12">
      <section>
        <Heading>From insight to identity</Heading>
        <P>
          Everything up to this point has been inner work — the stories,
          the eulogy, the pillars, the SubScript, the releases. Now we
          step the work out into the world. The ten tools that follow are
          short. Most take under three minutes. None of them require
          courage you don&apos;t already have.
        </P>
        <P>
          Use them like a kitchen drawer. Open the drawer when you need
          one. Reach for whichever fits the moment. Don&apos;t try to do
          all ten today — pick one, do it, log it, come back tomorrow.
        </P>
      </section>

      <section>
        <Heading>How to use the drawer</Heading>
        <P>
          The Joy Spark is your reset for any moment that feels heavy.
          The 60-Second Reset is for spirals. The Hourly Audit and the
          Energy Inventory are for noticing patterns. The Reframe, the
          Bold Ask, the Identity Declaration, the Tiny Brave Act — these
          are the practices that quietly rewire who you take yourself to
          be. The Evening Check-In closes the day with grace.
        </P>
        <P>
          Each tool keeps a running log so you can see what you&apos;ve
          been writing back to yourself. Pattern-spotting is half the
          gift.
        </P>
      </section>
    </div>
  );
}
