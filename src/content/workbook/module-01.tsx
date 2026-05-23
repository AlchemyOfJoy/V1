/**
 * Module 1 reading content — workbook-voice approximation.
 *
 * NOTE: This is placeholder copy in Brent's voice, capturing the key
 * concepts from the printed workbook (pages 6–8). Replace each section
 * with the verbatim text from the manuscript when it lands.
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

export default function Module01Content() {
  return (
    <div className="space-y-12">
      <section>
        <Heading>The Science of Joy</Heading>
        <P>
          Joy is not a personality trait you were born with or without. It is
          a measurable, repeatable state your brain creates through specific
          chemistry and electrical patterns. Every practice in this
          curriculum has a neurological reason. We are not chasing a feeling
          — we are training a system.
        </P>
      </section>

      <section>
        <Heading>Joy Chemicals</Heading>
        <P>
          Four chemicals do most of the work: <strong>dopamine</strong> (the
          spark of pursuit and reward), <strong>serotonin</strong> (the warm
          steadiness of belonging and meaning), <strong>oxytocin</strong>{" "}
          (the bond you feel when you connect or give), and{" "}
          <strong>endorphins</strong> (the relief that follows effort).
          Together they form a chemistry of joy you can deliberately invoke
          — through movement, presence, generosity, and play. Repeated
          practice builds new neural pathways (neurogenesis) that make joy
          the default response, not the rare exception.
        </P>
      </section>

      <section>
        <Heading>The Reticular Activating System</Heading>
        <P>
          The Reticular Activating System (RAS) is the filter at the base of
          your brain that decides what you notice in the world. It cannot
          process everything — so it shows you more of whatever you've told
          it matters. Focus on what's missing and the RAS amplifies the
          missing. Focus on what's working and the RAS surfaces more of it.
          This is why where you put your attention is one of the most
          consequential decisions you make all day.
        </P>
      </section>

      <section>
        <Heading>Brain Waves &amp; Meditation</Heading>
        <P>
          Your brain shifts between four primary wave states: <strong>beta</strong>{" "}
          (busy waking thought), <strong>alpha</strong> (relaxed alertness),{" "}
          <strong>theta</strong> (the dreamy, imaginative state where
          rewiring happens most easily), and <strong>delta</strong> (deep
          sleep, where the body repairs). Meditation slows you from beta
          into alpha and theta — the same states you wake up in, the same
          states that let new stories take root. Spend time there on
          purpose, and the rest of your day moves differently.
        </P>
        <div
          aria-label="Brain wave states from fast Beta to slow Delta"
          className="mt-6 flex items-end gap-4 sm:gap-6"
        >
          {[
            { label: "Beta", h: 56, freq: "14–30 Hz" },
            { label: "Alpha", h: 38, freq: "8–13 Hz" },
            { label: "Theta", h: 22, freq: "4–7 Hz" },
            { label: "Delta", h: 12, freq: "1–3 Hz" },
          ].map((w) => (
            <div key={w.label} className="flex-1 text-center">
              <svg
                viewBox={`0 0 120 ${w.h * 2}`}
                className="mx-auto w-full max-w-[120px]"
                aria-hidden
              >
                <path
                  d={`M0 ${w.h} ${Array.from({ length: 8 })
                    .map((_, i) =>
                      `Q ${15 * i + 7.5} ${i % 2 === 0 ? w.h - w.h * 0.6 : w.h + w.h * 0.6} ${15 * (i + 1)} ${w.h}`,
                    )
                    .join(" ")}`}
                  stroke="#00a8e8"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
              <div className="mt-3 font-serif text-[16px] font-medium text-navy">
                {w.label}
              </div>
              <div className="font-sans text-[11px] uppercase tracking-[0.16em] text-navy/45">
                {w.freq}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <Heading>The ITT Framework</Heading>
        <P>
          The Alchemy of Joy lives on three legs. When all three move
          together, transformation isn't a hope — it's a result.
        </P>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            {
              n: "I",
              title: "Invest In Joy",
              body: "Make joy a daily, non-negotiable priority. It is not a reward for finishing your to-do list. It is the foundation under it.",
            },
            {
              n: "T",
              title: "Train Your Brain",
              body: "Reprogram the subconscious through visualization, meditation, repetition. Show your mind the life you intend, until it agrees.",
            },
            {
              n: "T",
              title: "Take Bold Action",
              body: "Insight without movement is performance art. Act from the elevated state. Let your outer life catch up to your inner one.",
            },
          ].map((p) => (
            <div
              key={p.title}
              className="rounded-2xl bg-mist p-6"
            >
              <div className="font-serif text-[40px] font-medium leading-none text-cyan-deep">
                {p.n}
              </div>
              <h4 className="mt-3 font-serif text-[20px] font-medium text-navy">
                {p.title}
              </h4>
              <p className="mt-2 font-sans text-[14px] font-light leading-relaxed text-navy/70">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
