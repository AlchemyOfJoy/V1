/**
 * Module 2 — The List of Joy™ reading content (workbook-voice approximation).
 *
 * Replace with verbatim text from the manuscript (workbook page 26).
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

export default function ListOfJoyContent() {
  return (
    <div className="space-y-12">
      <section>
        <Heading>The List of Joy™</Heading>
        <P>
          The List of Joy™ is the simplest, most underrated tool in this entire
          curriculum. It&apos;s a living catalogue of what actually brings you
          joy — not what you think should, not what looks good from the
          outside. The small things. The big things. The things that make you
          you.
        </P>
        <P>
          We forget what brings us joy faster than almost anything else. Stress
          shrinks the menu. Pressure narrows the lens. So we rebuild the list,
          on the page, where it can&apos;t disappear on us.
        </P>
      </section>

      <section>
        <Heading>How to build it</Heading>
        <P>
          Don&apos;t overthink. Add anything that makes you smile — even
          slightly. A song. A walk. A person. A pastry. A weather. Add as many
          as you can today; come back tomorrow and add more. Tag each one to
          the Priority Pillar it lives under if you can — it&apos;ll matter
          later when we look at where you&apos;re depleted.
        </P>
        <P>
          The goal is volume, not perfection. The longer the list, the more
          raw material you have for the rest of your Joyful Operating System®.
        </P>
      </section>
    </div>
  );
}
