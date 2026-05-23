/**
 * Module 2 — Priority Pillars reading content (workbook-voice approximation).
 *
 * Replace with verbatim text from the manuscript (workbook page 29).
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

export default function PriorityPillarsContent() {
  return (
    <div className="space-y-12">
      <section>
        <Heading>The Six Priority Pillars</Heading>
        <P>
          A life of joy is not built on one thing. It&apos;s held up by six —
          Love, Faith, Health, Family, Career, and Community. Each pillar
          splits into two sub-pillars. Twelve in total. When one of them
          collapses, the whole structure leans. We don&apos;t notice it
          collapsing — we just notice the lean.
        </P>
        <P>
          The Priority Pillars assessment is your structural inventory.
          You&apos;ll rate each sub-pillar from 0 to 10 today, honestly, with
          no theatre. Don&apos;t overthink it. Your first answer is usually
          the right one.
        </P>
      </section>

      <section>
        <Heading>How to take it</Heading>
        <P>
          Rate each sub-pillar on the slider. Then look at the chart. The bars
          that are short are where joy is leaking. The bars that are tall are
          where your life is already strong — those become reservoirs you can
          draw from while you tend to what&apos;s low.
        </P>
        <P>
          Take a fresh snapshot every month. Watching the bars even out is one
          of the most validating things in this entire curriculum.
        </P>
      </section>
    </div>
  );
}
