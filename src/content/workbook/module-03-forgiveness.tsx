/**
 * Module 3 — Forgiveness Framework reading content
 * (workbook-voice approximation).
 *
 * Replace with verbatim text from the manuscript (workbook pages 39–46).
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

export default function ForgivenessContent() {
  return (
    <div className="space-y-12">
      <section>
        <Heading>Why forgiveness</Heading>
        <P>
          Forgiveness is not condoning what happened. It is not pretending it
          didn&apos;t hurt. It is not saying you would let them back in. It
          is the act of refusing to carry the weight of it for one more
          mile.
        </P>
        <P>
          The person you most need to forgive may already be gone. They may
          never know you did it. That is the point. Forgiveness is for you —
          the structural release of what&apos;s been quietly running in the
          background and stealing your joy.
        </P>
      </section>

      <section>
        <Heading>The Four-Step Framework</Heading>
        <ol className="mt-5 space-y-4">
          {[
            {
              n: "1",
              t: "Victim Rant",
              b: "Get it all out. No editing, no fairness, no balance. Say every ugly thing the wound has been saying for years. This is the page where you stop carrying it silently.",
            },
            {
              n: "2",
              t: "Empath Rave",
              b: "Walk a mile in their shoes. What were they carrying? What pain made them do what they did? You don't have to like it — only to see it. Their humanity is the door.",
            },
            {
              n: "3",
              t: "Universal Meaning",
              b: "Step back. What did this experience make possible? Who did it shape you into? What did it teach you that nothing else could have?",
            },
            {
              n: "4",
              t: "Forgiveness Statement",
              b: "Write the release out loud, in your own words. Set it down. Then — if it feels right — read it aloud, burn the page, or leave it where you can find it again next time you need to remember.",
            },
          ].map((s) => (
            <li key={s.n} className="flex gap-5 rounded-2xl bg-mist p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-deep font-serif text-[18px] font-medium text-white">
                {s.n}
              </div>
              <div>
                <div className="font-serif text-[19px] font-medium text-navy">
                  {s.t}
                </div>
                <p className="mt-1 font-sans text-[14px] font-light leading-relaxed text-navy/70">
                  {s.b}
                </p>
              </div>
            </li>
          ))}
        </ol>
        <P>
          Begin one subject at a time. Some processes take an hour. Some take
          a month. Your work here is visible only to you. You can delete it
          at any moment.
        </P>
      </section>
    </div>
  );
}
