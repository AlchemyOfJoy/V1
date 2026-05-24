/**
 * Module 2 — Subconscious Script (SubScript) reading content
 * (workbook-voice approximation).
 *
 * Replace with verbatim text from the manuscript (workbook pages 31–36).
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

export default function SubscriptContent() {
  return (
    <div className="space-y-12">
      <section>
        <Heading>The SubScript</Heading>
        <P>
          Your SubScript is the manifesto your mind reads back to you every
          morning and every night. It&apos;s a short document — usually a
          page — written in the present tense, as if every word were already
          true. The brain doesn&apos;t distinguish well between a vividly
          imagined reality and an actual one; the SubScript uses that
          generously.
        </P>
        <P>
          Anchored in a real memory of joy. Pointed at the identity
          you&apos;re becoming. Spoken into existence twice a day. It&apos;s
          the keystone tool of the Joyful Operating System®.
        </P>
      </section>

      <section>
        <Heading>The five steps</Heading>
        <ol className="mt-5 space-y-3 font-sans text-[15px] font-light leading-[1.8] text-navy/80">
          <li>
            <span className="font-semibold text-cyan-deep">1.</span> Anchor
            the emotion. Pull a real memory where joy was loudest — let your
            body remember it.
          </li>
          <li>
            <span className="font-semibold text-cyan-deep">2.</span> Set the
            target date. A horizon close enough to feel — usually 90 days,
            sometimes a year.
          </li>
          <li>
            <span className="font-semibold text-cyan-deep">3.</span> Write
            your manifestations. The specific outcomes that pull you forward,
            in the present tense.
          </li>
          <li>
            <span className="font-semibold text-cyan-deep">4.</span> Write
            your affirmations. Who you are, said as if already so.
          </li>
          <li>
            <span className="font-semibold text-cyan-deep">5.</span> Lock it
            in. Print it. Read it morning and night until it&apos;s no
            longer a script — it&apos;s just you.
          </li>
        </ol>
      </section>
    </div>
  );
}
