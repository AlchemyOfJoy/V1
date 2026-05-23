/**
 * Module 2 — Core Narrative reading content (workbook-voice approximation).
 *
 * Replace with verbatim text from the manuscript (workbook pages 12–13).
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

export default function CoreNarrativeContent() {
  return (
    <div className="space-y-12">
      <section>
        <Heading>Your Core Narrative</Heading>
        <P>
          A Core Narrative is the unconscious story you tell yourself about
          who you are, what you deserve, and what's possible for your life.
          Most of these were written before you could read — by a parent's
          glance, a teacher's offhand comment, a moment that landed harder
          than anyone realized. You didn't choose them. You inherited them.
        </P>
        <P>
          The trouble is, they didn't stop running. They became the script
          your brain reads back to you every morning. <em>I'm not enough. I'm
          too much. People always leave. I'm only loved when I perform.</em>{" "}
          Until you see the story, you can't rewrite it. Once you do, the
          rewriting is surprisingly fast — and the life that follows is
          unrecognizable from the one the old story was building.
        </P>
      </section>

      <section>
        <Heading>The Reframe Ritual</Heading>
        <P>
          The Reframe Ritual is three deliberate moves. Practiced repeatedly,
          they rewire how your mind narrates your day.
        </P>
        <ol className="mt-5 space-y-4">
          {[
            {
              n: "1",
              t: "Catch the Story",
              b: "The moment you notice the old narrative whispering — pause. Three slow breaths. Ask yourself: what story am I telling myself right now?",
            },
            {
              n: "2",
              t: "Flip the Script",
              b: "Take the old belief and rewrite it as its 180° positive opposite. Not a wish. A truth, stated as if already so.",
            },
            {
              n: "3",
              t: "Anchor the Shift",
              b: "Close your eyes. Hand on your heart. Say the new story out loud, five times, while letting the truth of it settle in your body.",
            },
          ].map((s) => (
            <li
              key={s.n}
              className="flex gap-5 rounded-2xl bg-mist p-5"
            >
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
          You're about to do this in writing. Take the top three Core
          Narratives that have been running your life — and rewrite each
          one. This is the foundation of the Joyful Operating System®.
          Everything else is built on top.
        </P>
      </section>
    </div>
  );
}
