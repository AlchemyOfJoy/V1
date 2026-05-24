import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SectionShell from "@/components/journey/SectionShell";
import { JOURNEY } from "@/lib/itt";

export const metadata: Metadata = { robots: { index: false } };

interface FoundationCard {
  body: React.ReactNode;
}

const CARDS: Record<string, FoundationCard> = {
  "joy-chemicals": {
    body: (
      <>
        <section>
          <h2 className="font-serif text-[22px] font-medium text-navy">
            The four chemicals of joy
          </h2>
          <p className="mt-3 font-sans text-[16px] font-light leading-[1.85] text-navy/80">
            Your brain runs joy on four primary chemicals. They are not
            mystical. They are biochemical. And every one of them can be
            triggered, on purpose, by inputs you choose.
          </p>
          <ul className="mt-4 space-y-3 font-sans text-[15px] font-light leading-relaxed text-navy/80">
            <li>
              <strong className="text-navy">Dopamine</strong> — the
              reward chemical. Released when you anticipate or experience
              something pleasurable. The List of Joy is a dopamine training
              ground.
            </li>
            <li>
              <strong className="text-navy">Serotonin</strong> — the
              mood stabilizer. Triggered by sunlight, movement, and a
              felt sense of status or contribution.
            </li>
            <li>
              <strong className="text-navy">Oxytocin</strong> — the
              connection chemical. Hugs, eye contact, doing something for
              someone you love.
            </li>
            <li>
              <strong className="text-navy">Endorphins</strong> — the
              natural painkillers. Movement, laughter, breathwork.
            </li>
          </ul>
        </section>
        <section className="mt-8">
          <h2 className="font-serif text-[22px] font-medium text-navy">
            Neurogenesis is the punchline
          </h2>
          <p className="mt-3 font-sans text-[16px] font-light leading-[1.85] text-navy/80">
            For decades science told us the brain you had at twenty was the
            brain you&apos;d die with. That was wrong. Adult brains grow new
            neurons. New pathways. New default patterns. Every practice in
            this app is structured to make that happen on purpose.
          </p>
        </section>
        <p className="mt-8 italic text-navy/55">
          [Brent: replace this text with verbatim passages from Chapter 7
          via the Content Studio. This page renders curated content from
          the manuscript when uploaded.]
        </p>
      </>
    ),
  },
  "reticular-activating-system": {
    body: (
      <>
        <section>
          <h2 className="font-serif text-[22px] font-medium text-navy">
            What you focus on, you find
          </h2>
          <p className="mt-3 font-sans text-[16px] font-light leading-[1.85] text-navy/80">
            The Reticular Activating System is the filter at the base of
            your brain that decides what makes it into your conscious
            attention. You can&apos;t see, hear, or notice everything around
            you — so the RAS picks. And what it picks is whatever
            you&apos;ve told it matters.
          </p>
          <p className="mt-4 font-sans text-[16px] font-light leading-[1.85] text-navy/80">
            Buy a red car and suddenly red cars are everywhere. They were
            always there. Your filter just changed.
          </p>
          <p className="mt-4 font-sans text-[16px] font-light leading-[1.85] text-navy/80">
            The whole methodology is RAS training. List of Joy tells the
            RAS to look for joy. The SubScript tells it who you are. The
            Reframe Ritual rewrites what it makes meaningful. This is why
            the work compounds.
          </p>
        </section>
        <p className="mt-8 italic text-navy/55">
          [Brent: replace with verbatim passages from Chapter 7 / 8 via the
          Content Studio.]
        </p>
      </>
    ),
  },
  "brain-waves": {
    body: (
      <>
        <section>
          <h2 className="font-serif text-[22px] font-medium text-navy">
            Beta · Alpha · Theta
          </h2>
          <p className="mt-3 font-sans text-[16px] font-light leading-[1.85] text-navy/80">
            Your brain runs at different electrical frequencies depending
            on your state. Three matter most for this work:
          </p>
          <ul className="mt-4 space-y-3 font-sans text-[15px] font-light leading-relaxed text-navy/80">
            <li>
              <strong className="text-navy">Beta</strong> (12–30 Hz) — the
              active, thinking, planning state. Most of waking life.
            </li>
            <li>
              <strong className="text-navy">Alpha</strong> (8–12 Hz) — the
              relaxed, present state. Light meditation, slow breath.
            </li>
            <li>
              <strong className="text-navy">Theta</strong> (4–8 Hz) — the
              gateway state. Just before sleep. Just after waking. Deep
              meditation. <em>The subconscious is open.</em>
            </li>
          </ul>
        </section>
        <section className="mt-8">
          <h2 className="font-serif text-[22px] font-medium text-navy">
            Why the SubScript is read morning and night
          </h2>
          <p className="mt-3 font-sans text-[16px] font-light leading-[1.85] text-navy/80">
            The window is theta. When you read your SubScript first thing
            in the morning, before the day&apos;s noise floods in, you are
            installing it directly into the subconscious. Same window at
            night, before sleep.
          </p>
          <p className="mt-4 font-sans text-[16px] font-light leading-[1.85] text-navy/80">
            Twice a day, every day, you bypass the editor and write
            directly to the operating system.
          </p>
        </section>
        <p className="mt-8 italic text-navy/55">
          [Brent: replace with verbatim passages from Chapter 7 via the
          Content Studio.]
        </p>
      </>
    ),
  },
};

export default async function FoundationCardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pillar = JOURNEY[0];
  const section = pillar.sections.find((s) => s.slug === slug);
  const card = CARDS[slug];
  if (!section || !card) notFound();

  return (
    <SectionShell
      pillarLabel="Foundations"
      pillarHref="/journey/foundations"
      title={section.title}
      italicWord={section.italicWord}
      oneLiner={section.oneLiner}
      estimatedMin={section.estimatedMin}
    >
      {card.body}
    </SectionShell>
  );
}
