/**
 * Module 2 — Self Eulogy reading content (workbook-voice approximation).
 *
 * Replace with verbatim text from the manuscript (workbook page 20).
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

export default function SelfEulogyContent() {
  return (
    <div className="space-y-12">
      <section>
        <Heading>The Self Eulogy</Heading>
        <P>
          Most of us spend our lives reacting to the next thing in front of us
          and never lift our eyes to the full arc. The Self Eulogy is the
          tool that fixes that. You imagine the person you love most standing
          at your funeral, eulogy in hand — and you write the words you want
          them to say.
        </P>
        <P>
          This isn&apos;t morbid. It&apos;s clarifying. The eulogy you want
          spoken is a map of the life you most want to live. Once you can see
          it on the page, every decision you make from this point forward
          either moves you toward it or away from it. There is no neutral.
        </P>
      </section>

      <section>
        <Heading>How this becomes real</Heading>
        <P>
          Write it in the past tense, as if it has already been earned. Let
          the prompts on the right guide you, but don&apos;t feel bound by
          them — your eulogy is yours. There is no word count. There is no
          right shape. The only rule is to tell the truth about who you most
          want to be.
        </P>
        <P>
          When you&apos;re done, you&apos;ll read it back at the start of
          every quarter for the rest of your life. It becomes the north star
          your Joyful Operating System® aligns to.
        </P>
      </section>
    </div>
  );
}
